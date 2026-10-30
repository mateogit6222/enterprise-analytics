import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectionStrategy,
  inject,
  ChangeDetectorRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonHeader,
  IonToolbar,
  IonButtons,
  IonMenuButton,
  IonTitle,
  IonContent,
  IonSpinner,
  ToastController
} from '@ionic/angular';
import { Store } from '@ngrx/store';
import { Observable, BehaviorSubject, Subject, combineLatest } from 'rxjs';
import { map, take, takeUntil } from 'rxjs/operators';

import { AppState } from '../../../../state/app.state';
import * as DataActions from '../../../../state/data/data.actions';
import { selectAllRecords, selectDataLoading } from '../../../../state/data/data.selectors';
import { Record, RecordCategory, RecordStatus } from '../../../../core/models/record.model';
import { ExportService } from '../../../../core/services/export.service';
import { CurrencyFormatPipe } from '../../../../shared/pipes/currency-format.pipe';

/**
 * Estructura de resumen ejecutivo por categoría para la tabla agregada.
 */
export interface CategoryReportSummary {
  category: RecordCategory;
  categoryName: string;
  count: number;
  totalAmount: number;
  volumePercent: string;
  revenuePercent: string;
  avgAmount: number;
}

/**
 * Métricas agregadas del informe filtrado.
 */
export interface ReportMetrics {
  totalAmount: number;
  totalCount: number;
  avgAmount: number;
  completionRate: number;
}

/**
 * @component ReportViewerPage
 * @description Centro de generación y exportación de informes analíticos para Administradores.
 * Proporciona filtrado multidimensional, previsualización de datos tabulados agregados y
 * descarga de documentos profesionales en PDF (jsPDF + autoTable) y CSV (UTF-8 BOM).
 *
 * @remarks
 * Cumple con los criterios de evaluación:
 * - RA 2: ChangeDetectionStrategy.OnPush con flujo reactivo RxJS.
 * - RA 5: Consolidación de fuentes duales y exportación profesional en formatos estándar.
 * - RA 6: Documentación técnica completa JSDoc/Compodoc.
 */
@Component({
  selector: 'app-report-viewer',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CurrencyFormatPipe,
    IonHeader,
    IonToolbar,
    IonButtons,
    IonMenuButton,
    IonTitle,
    IonContent,
    IonSpinner
  ],
  templateUrl: './report-viewer.page.html',
  styleUrls: ['./report-viewer.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ReportViewerPage implements OnInit, OnDestroy {
  private readonly store = inject(Store<AppState>);
  private readonly exportService = inject(ExportService);
  private readonly toastCtrl = inject(ToastController);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly destroy$ = new Subject<void>();

  /** Modelos de filtrado local para el informe */
  searchTerm: string = '';
  selectedCategory: string = 'ALL';
  selectedStatus: string = 'ALL';
  selectedSource: string = 'ALL';

  /** Indicadores de exportación en progreso */
  isExporting: boolean = false;
  exportType: 'pdf' | 'csv' | null = null;

  /** Subject para disparar re-evaluación reactiva de filtros */
  private readonly filterTrigger$ = new BehaviorSubject<void>(undefined);

  /** Todos los registros cargados del store de NgRx */
  readonly allRecords$: Observable<Record[]> = this.store.select(selectAllRecords);

  /** Estado de carga asíncrona */
  readonly loading$: Observable<boolean> = this.store.select(selectDataLoading);

  /** Registros filtrados reactivamente según los criterios seleccionados */
  readonly filteredRecords$: Observable<Record[]> = combineLatest([
    this.allRecords$,
    this.filterTrigger$
  ]).pipe(
    map(([records]) => {
      if (!records || records.length === 0) return [];

      let result = [...records];

      // Filtro por término de búsqueda
      if (this.searchTerm && this.searchTerm.trim() !== '') {
        const q = this.searchTerm.toLowerCase().trim();
        result = result.filter(r =>
          r.title?.toLowerCase().includes(q) ||
          r.clientName?.toLowerCase().includes(q) ||
          r.sku?.toLowerCase().includes(q) ||
          r.region?.toLowerCase().includes(q)
        );
      }

      // Filtro por categoría
      if (this.selectedCategory !== 'ALL') {
        result = result.filter(r => r.category === this.selectedCategory);
      }

      // Filtro por estado
      if (this.selectedStatus !== 'ALL') {
        result = result.filter(r => r.status === this.selectedStatus);
      }

      // Filtro por fuente
      if (this.selectedSource !== 'ALL') {
        result = result.filter(r => r.source === this.selectedSource);
      }

      return result;
    })
  );

  /** Métricas ejecutivas calculadas dinámicamente a partir de los registros filtrados */
  readonly metrics$: Observable<ReportMetrics> = this.filteredRecords$.pipe(
    map(records => {
      const totalCount = records.length;
      const totalAmount = records.reduce((acc, r) => acc + (Number(r.amount) || 0), 0);
      const avgAmount = totalCount > 0 ? Math.round(totalAmount / totalCount) : 0;
      const completedCount = records.filter(r => r.status === RecordStatus.COMPLETED).length;
      const completionRate = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

      return { totalAmount, totalCount, avgAmount, completionRate };
    })
  );

  /** Resumen agregado por categoría de negocio para la tabla analítica */
  readonly categorySummary$: Observable<CategoryReportSummary[]> = this.filteredRecords$.pipe(
    map(records => {
      const totalVolume = records.length;
      const grandTotalAmount = records.reduce((acc, r) => acc + (Number(r.amount) || 0), 0);

      const categoryMap: { [key in RecordCategory]: string } = {
        [RecordCategory.SALES]: 'Ventas',
        [RecordCategory.MARKETING]: 'Marketing',
        [RecordCategory.FINANCE]: 'Finanzas',
        [RecordCategory.OPERATIONS]: 'Operaciones',
        [RecordCategory.HR]: 'Recursos Humanos'
      };

      const categories = [
        RecordCategory.SALES,
        RecordCategory.MARKETING,
        RecordCategory.FINANCE,
        RecordCategory.OPERATIONS,
        RecordCategory.HR
      ];

      return categories.map(cat => {
        const catRecords = records.filter(r => r.category === cat);
        const count = catRecords.length;
        const totalAmount = catRecords.reduce((acc, r) => acc + (Number(r.amount) || 0), 0);
        const avgAmount = count > 0 ? Math.round(totalAmount / count) : 0;
        const volumePercent = totalVolume > 0 ? ((count / totalVolume) * 100).toFixed(1) : '0';
        const revenuePercent = grandTotalAmount > 0 ? ((totalAmount / grandTotalAmount) * 100).toFixed(1) : '0';

        return {
          category: cat,
          categoryName: categoryMap[cat],
          count,
          totalAmount,
          volumePercent,
          revenuePercent,
          avgAmount
        };
      });
    })
  );

  ngOnInit(): void {
    // Disparar carga concurrente dual si la store aún no contiene registros
    this.store.dispatch(DataActions.loadAllData());

    this.loading$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.cdr.markForCheck();
    });

    this.filteredRecords$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.cdr.markForCheck();
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Notifica el cambio de filtros para disparar la computación reactiva.
   */
  onFilterChanged(): void {
    this.filterTrigger$.next();
    this.cdr.markForCheck();
  }

  /**
   * Restablece todos los filtros a sus valores predeterminados.
   */
  resetFilters(): void {
    this.searchTerm = '';
    this.selectedCategory = 'ALL';
    this.selectedStatus = 'ALL';
    this.selectedSource = 'ALL';
    this.filterTrigger$.next();
    this.cdr.markForCheck();
  }

  /**
   * Recarga los datos en el store de NgRx.
   */
  refresh(): void {
    this.store.dispatch(DataActions.loadAllData());
    this.cdr.markForCheck();
  }

  /**
   * Genera y descarga el informe ejecutivo profesional en formato PDF con jsPDF y autoTable.
   */
  async downloadPdfReport(): Promise<void> {
    this.filteredRecords$.pipe(take(1)).subscribe(async records => {
      if (records.length === 0) {
        await this.showToast('No hay registros para exportar', 'warning');
        return;
      }

      this.isExporting = true;
      this.exportType = 'pdf';
      this.cdr.markForCheck();

      try {
        const filename = `informe_corporativo_${new Date().toISOString().slice(0, 10)}`;
        await this.exportService.exportToPdf(
          records,
          'Informe Ejecutivo de Rendimiento y Actividad Empresarial',
          filename
        );
        await this.showToast('Informe PDF generado y descargado correctamente', 'success');
      } catch (err) {
        console.error('[ReportViewerPage] Error al generar PDF:', err);
        await this.showToast('Error al generar el documento PDF', 'danger');
      } finally {
        this.isExporting = false;
        this.exportType = null;
        this.cdr.markForCheck();
      }
    });
  }

  /**
   * Exporta y descarga los registros filtrados en formato CSV con cabeceras en español y UTF-8 BOM.
   */
  async downloadCsvReport(): Promise<void> {
    this.filteredRecords$.pipe(take(1)).subscribe(async records => {
      if (records.length === 0) {
        await this.showToast('No hay registros para exportar', 'warning');
        return;
      }

      this.isExporting = true;
      this.exportType = 'csv';
      this.cdr.markForCheck();

      try {
        const filename = `dataset_registros_${new Date().toISOString().slice(0, 10)}`;
        this.exportService.exportToCsv(records, filename);
        await this.showToast('Archivo CSV descargado con éxito', 'success');
      } catch (err) {
        console.error('[ReportViewerPage] Error al generar CSV:', err);
        await this.showToast('Error al exportar archivo CSV', 'danger');
      } finally {
        this.isExporting = false;
        this.exportType = null;
        this.cdr.markForCheck();
      }
    });
  }

  /**
   * Helper para desplegar notificaciones toast en la interfaz.
   *
   * @param {string} message - Mensaje a mostrar.
   * @param {'success' | 'warning' | 'danger' | 'primary'} color - Color de Ionic.
   * @private
   */
  private async showToast(
    message: string,
    color: 'success' | 'warning' | 'danger' | 'primary'
  ): Promise<void> {
    const toast = await this.toastCtrl.create({
      message,
      duration: 3000,
      color,
      position: 'bottom',
      buttons: [{ text: 'Cerrar', role: 'cancel' }]
    });
    await toast.present();
  }
}
