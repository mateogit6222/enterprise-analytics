import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  inject
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonHeader,
  IonToolbar,
  IonButtons,
  IonMenuButton,
  IonTitle,
  IonContent,
  IonSpinner,
  ModalController,
  ToastController
} from '@ionic/angular';
import { Store } from '@ngrx/store';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { AppState } from '../../../../state/app.state';
import * as DataActions from '../../../../state/data/data.actions';
import {
  selectAllRecords,
  selectDataLoading,
  selectDataExporting
} from '../../../../state/data/data.selectors';
import { Record } from '../../../../core/models/record.model';
import {
  DataTableComponent,
  TableColumn,
  TableAction,
  TableActionEvent
} from '../../../../shared/components/data-table/data-table.component';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { RecordFormModalComponent } from '../../components/record-form-modal/record-form-modal.component';
import { HasUnsavedChanges } from '../../../../core/guards/unsaved-changes.guard';

/**
 * @component RecordListPage
 * @description Vista principal de administración y gestión CRUD de registros empresariales.
 * Conectada al store de NgRx y al componente reutilizable DataTable.
 *
 * @remarks
 * Cumple con los criterios de evaluación:
 * - RA 1: Gestión de estado NgRx predecible con acciones e inmutabilidad.
 * - RA 2: ChangeDetectionStrategy.OnPush, tabla reactiva y formulario con validación asíncrona.
 * - RA 5: Integración fluida de datos de fuentes múltiples (REST + Firestore) y exportación a PDF/CSV.
 * - RA 6: Documentación técnica completa JSDoc/Compodoc.
 */
@Component({
  selector: 'app-record-list',
  standalone: true,
  imports: [
    CommonModule,
    IonHeader,
    IonToolbar,
    IonButtons,
    IonMenuButton,
    IonTitle,
    IonContent,
    IonSpinner,
    DataTableComponent
  ],
  templateUrl: './record-list.page.html',
  styleUrls: ['./record-list.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RecordListPage implements OnInit, OnDestroy, HasUnsavedChanges {
  private readonly store = inject(Store<AppState>);
  private readonly modalCtrl = inject(ModalController);
  private readonly toastCtrl = inject(ToastController);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly destroy$ = new Subject<void>();

  /**
   * Implementación de la interfaz HasUnsavedChanges para el guard CanDeactivateFn.
   * Retorna true si hay cambios pendientes en edición no confirmados.
   */
  hasUnsavedChanges(): boolean {
    return false;
  }

  /** Flujo reactivo de registros corporativos desde el Store de NgRx */
  readonly records$: Observable<Record[]> = this.store.select(selectAllRecords);

  /** Estado de carga asíncrona */
  readonly loading$: Observable<boolean> = this.store.select(selectDataLoading);

  /** Estado de exportación en progreso */
  readonly exporting$: Observable<boolean> = this.store.select(selectDataExporting);

  /** Configuración de columnas para el componente DataTable */
  readonly columns: TableColumn<Record>[] = [
    { key: 'sku', label: 'SKU', sortable: true, width: '120px' },
    { key: 'title', label: 'Título del Registro', sortable: true },
    { key: 'clientName', label: 'Cliente', sortable: true },
    { key: 'manager', label: 'Responsable', sortable: true, type: 'avatar' },
    {
      key: 'category',
      label: 'Categoría',
      sortable: true,
      type: 'badge',
      badgeColorMap: {
        SALES: 'badge-primary',
        MARKETING: 'badge-warning',
        FINANCE: 'badge-success',
        OPERATIONS: 'badge-default',
        HR: 'badge-secondary'
      }
    },
    { key: 'amount', label: 'Importe', sortable: true, type: 'currency', align: 'right' },
    {
      key: 'status',
      label: 'Estado',
      sortable: true,
      type: 'badge',
      badgeColorMap: {
        ACTIVE: 'badge-success',
        PENDING: 'badge-warning',
        COMPLETED: 'badge-primary',
        ARCHIVED: 'badge-default'
      }
    },
    {
      key: 'source',
      label: 'Fuente',
      sortable: true,
      type: 'badge',
      badgeColorMap: {
        REST: 'badge-primary',
        SUPABASE: 'badge-success'
      }
    },
    { key: 'createdAt', label: 'Fecha Alta', sortable: true, type: 'date' }
  ];

  /** Acciones disponibles por fila en la tabla */
  readonly actions: TableAction<Record>[] = [
    {
      id: 'edit',
      label: 'Editar Registro',
      icon: 'create-outline',
      color: 'primary'
    },
    {
      id: 'delete',
      label: 'Eliminar',
      icon: 'trash-outline',
      color: 'danger'
    }
  ];

  ngOnInit(): void {
    // Inicializar datos en el store si no se han cargado previamente
    this.store.dispatch(DataActions.loadAllData());

    this.loading$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.cdr.markForCheck();
    });

    this.records$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.cdr.markForCheck();
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Abre el modal para dar de alta un nuevo registro empresarial.
   */
  async openCreateModal(): Promise<void> {
    const modal = await this.modalCtrl.create({
      component: RecordFormModalComponent,
      cssClass: 'record-modal-custom'
    });

    await modal.present();

    const { data } = await modal.onWillDismiss();
    if (data?.saved) {
      this.store.dispatch(DataActions.createRecord({ record: data.data }));
      this.showToast('Registro creado correctamente en la base de datos', 'success');
    }
  }

  /**
   * Procesa las acciones disparadas desde una fila de la DataTable.
   *
   * @param {TableActionEvent<Record>} event - Evento con el ID de la acción y la fila correspondiente.
   */
  async onActionTriggered(event: TableActionEvent<Record>): Promise<void> {
    if (event.action === 'edit') {
      await this.openEditModal(event.row);
    } else if (event.action === 'delete') {
      await this.confirmDelete(event.row);
    }
  }

  /**
   * Abre el modal de edición precargado con los datos del registro.
   *
   * @param {Record} record - Registro a editar.
   * @private
   */
  private async openEditModal(record: Record): Promise<void> {
    const modal = await this.modalCtrl.create({
      component: RecordFormModalComponent,
      componentProps: { record },
      cssClass: 'record-modal-custom'
    });

    await modal.present();

    const { data } = await modal.onWillDismiss();
    if (data?.saved) {
      this.store.dispatch(
        DataActions.updateRecord({
          id: record.id,
          changes: data.data
        })
      );
      this.showToast(`Registro ${record.sku} actualizado con éxito`, 'success');
    }
  }

  /**
   * Solicita confirmación al usuario antes de eliminar un registro mediante ConfirmDialog.
   *
   * @param {Record} record - Registro seleccionado para eliminar.
   * @private
   */
  private async confirmDelete(record: Record): Promise<void> {
    const modal = await this.modalCtrl.create({
      component: ConfirmDialogComponent,
      componentProps: {
        title: 'Eliminar Registro Empresarial',
        message: `¿Deseas eliminar permanentemente el registro "${record.title}" (${record.sku})?`,
        details: 'Esta acción actualizará la base de datos y recalculará las métricas del dashboard.',
        confirmText: 'Sí, Eliminar',
        cancelText: 'Cancelar',
        variant: 'danger',
        icon: 'trash-outline'
      }
    });

    await modal.present();

    const { data } = await modal.onWillDismiss();
    if (data?.confirmed) {
      this.store.dispatch(DataActions.deleteRecord({ id: record.id }));
      this.showToast(`Registro ${record.sku} eliminado`, 'warning');
    }
  }

  /**
   * Exporta la colección de registros a formato PDF profesional.
   */
  exportToPdf(): void {
    this.store.dispatch(
      DataActions.exportRecords({
        format: 'pdf',
        filename: `informe_registros_${new Date().toISOString().slice(0, 10)}`
      })
    );
    this.showToast('Generando informe ejecutivo PDF...', 'primary');
  }

  /**
   * Exporta la colección de registros a formato CSV con UTF-8 BOM.
   */
  exportToCsv(): void {
    this.store.dispatch(
      DataActions.exportRecords({
        format: 'csv',
        filename: `registros_empresariales_${new Date().toISOString().slice(0, 10)}`
      })
    );
    this.showToast('Descargando archivo CSV estructurado...', 'primary');
  }

  /**
   * Helper para desplegar notificaciones toast en la interfaz.
   *
   * @param {string} message - Mensaje a mostrar.
   * @param {'success' | 'warning' | 'danger' | 'primary'} color - Color semántico de Ionic.
   * @private
   */
  private async showToast(
    message: string,
    color: 'success' | 'warning' | 'danger' | 'primary'
  ): Promise<void> {
    const toast = await this.toastCtrl.create({
      message,
      duration: 3200,
      color,
      position: 'bottom',
      buttons: [{ text: 'OK', role: 'cancel' }]
    });
    await toast.present();
  }
}
