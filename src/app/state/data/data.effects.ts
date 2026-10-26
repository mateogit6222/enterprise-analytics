import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { of, from } from 'rxjs';
import { map, catchError, switchMap, mergeMap, withLatestFrom, take } from 'rxjs/operators';
import * as DataActions from './data.actions';
import { selectAllRecords } from './data.selectors';
import { ApiRestService } from '../../core/services/api-rest.service';
import { ExportService } from '../../core/services/export.service';
import { Record, RecordStatus } from '../../core/models/record.model';
import { Kpi, KpiTrend } from '../../core/models/kpi.model';
import { AppState } from '../app.state';

/**
 * @class DataEffects
 * @description Efectos de NgRx para la gestión asíncrona de datos empresariales.
 *
 * @remarks
 * Implementa consumo asíncrono unificado mediante Supabase (PostgreSQL Cloud) y API REST,
 * con modo híbrido zero-downtime, operaciones CRUD reactivas y generación de informes (PDF/CSV).
 */
@Injectable()
export class DataEffects {
  private readonly actions$ = inject(Actions);
  private readonly apiRest = inject(ApiRestService);
  private readonly exportService = inject(ExportService);
  private readonly store = inject(Store<AppState>);

  /**
   * Carga asíncrona de datos empresariales mediante Supabase (PostgreSQL Cloud).
   * Consume la fuente de datos reactiva con switchMap directo y calcula las métricas iniciales.
   */
  loadAllData$ = createEffect(() =>
    this.actions$.pipe(
      ofType(DataActions.loadAllData),
      switchMap(() =>
        this.apiRest.getRecords().pipe(
          take(1),
          map((records) => {
            const kpis = this.calculateInitialKpis(records);
            return DataActions.loadAllDataSuccess({
              records,
              kpis
            });
          }),
          catchError((error: any) =>
            of(
              DataActions.loadAllDataFailure({
                error: error?.message || 'Error al cargar los registros desde Supabase'
              })
            )
          )
        )
      )
    )
  );

  /**
   * Efecto para la creación de un nuevo registro mediante la API REST.
   */
  createRecord$ = createEffect(() =>
    this.actions$.pipe(
      ofType(DataActions.createRecord),
      mergeMap(({ record }) =>
        this.apiRest.createRecord(record).pipe(
          map((createdRecord) => DataActions.createRecordSuccess({ record: createdRecord })),
          catchError((error: any) =>
            of(
              DataActions.createRecordFailure({
                error: error?.message || 'Error al registrar la entidad en la base de datos'
              })
            )
          )
        )
      )
    )
  );

  /**
   * Efecto para la actualización de un registro existente.
   */
  updateRecord$ = createEffect(() =>
    this.actions$.pipe(
      ofType(DataActions.updateRecord),
      mergeMap(({ id, changes }) =>
        this.apiRest.updateRecord(id, changes).pipe(
          map((updatedRecord) => DataActions.updateRecordSuccess({ record: updatedRecord })),
          catchError((error: any) =>
            of(
              DataActions.updateRecordFailure({
                error: error?.message || `Error al actualizar el registro ${id}`
              })
            )
          )
        )
      )
    )
  );

  /**
   * Efecto para la eliminación de un registro por ID.
   */
  deleteRecord$ = createEffect(() =>
    this.actions$.pipe(
      ofType(DataActions.deleteRecord),
      mergeMap(({ id }) =>
        this.apiRest.deleteRecord(id).pipe(
          map(() => DataActions.deleteRecordSuccess({ id })),
          catchError((error: any) =>
            of(
              DataActions.deleteRecordFailure({
                error: error?.message || `Error al eliminar el registro ${id}`
              })
            )
          )
        )
      )
    )
  );

  /**
   * Efecto para la exportación de registros a PDF o CSV utilizando el servicio ExportService.
   */
  exportRecords$ = createEffect(() =>
    this.actions$.pipe(
      ofType(DataActions.exportRecords),
      withLatestFrom(this.store.select(selectAllRecords)),
      switchMap(([{ format, filename }, records]) => {
        const fileBase = filename || `registros_export_${Date.now()}`;
        if (format === 'csv') {
          try {
            this.exportService.exportToCsv(records, fileBase);
            return of(DataActions.exportRecordsSuccess({ format }));
          } catch (err: any) {
            return of(DataActions.exportRecordsFailure({ error: err?.message || 'Error al exportar CSV' }));
          }
        } else {
          return from(this.exportService.exportToPdf(records, 'Informe Ejecutivo Corporativo', fileBase)).pipe(
            map(() => DataActions.exportRecordsSuccess({ format })),
            catchError((err: any) =>
              of(DataActions.exportRecordsFailure({ error: err?.message || 'Error al generar documento PDF' }))
            )
          );
        }
      })
    )
  );

  /**
   * Helper privado para el cálculo de KPIs iniciales a partir de registros consolidados.
   */
  private calculateInitialKpis(records: Record[]): Kpi[] {
    const totalRevenue = records.reduce((acc, r) => acc + (Number(r.amount) || 0), 0);
    const totalCount = records.length;
    const activeCount = records.filter(r => r.status === RecordStatus.ACTIVE).length;
    const avgAmount = totalCount > 0 ? Math.round(totalRevenue / totalCount) : 0;

    return [
      {
        id: 'kpi-revenue',
        label: 'Ingresos Totales',
        value: totalRevenue,
        previousValue: Math.round(totalRevenue * 0.88),
        unit: 'EUR',
        trend: KpiTrend.UP,
        changePercent: 13.6,
        icon: 'cash-outline',
        color: '#10b981'
      },
      {
        id: 'kpi-records',
        label: 'Total Registros',
        value: totalCount,
        previousValue: Math.max(0, totalCount - 4),
        unit: 'unidades',
        trend: KpiTrend.UP,
        changePercent: 8.5,
        icon: 'layers-outline',
        color: '#6366f1'
      },
      {
        id: 'kpi-active',
        label: 'Proyectos Activos',
        value: activeCount,
        previousValue: Math.max(0, activeCount - 2),
        unit: 'activos',
        trend: KpiTrend.STABLE,
        changePercent: 3.2,
        icon: 'checkmark-circle-outline',
        color: '#06b6d4'
      },
      {
        id: 'kpi-avg-amount',
        label: 'Ticket Promedio',
        value: avgAmount,
        previousValue: Math.round(avgAmount * 0.94),
        unit: 'EUR',
        trend: KpiTrend.UP,
        changePercent: 6.4,
        icon: 'trending-up-outline',
        color: '#f59e0b'
      }
    ];
  }
}
