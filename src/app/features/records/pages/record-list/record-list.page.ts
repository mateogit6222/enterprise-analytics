import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular/lazy';
import { DataTableComponent, TableColumn, TableAction, TableActionEvent } from '../../../../shared/components/data-table/data-table.component';
import { RecordCategory, RecordStatus } from '../../../../core/models/record.model';

interface SampleRecord {
  id: string;
  title: string;
  clientName: string;
  category: RecordCategory;
  status: RecordStatus;
  amount: number;
  region: string;
  updatedAt: string;
}

/**
 * @component RecordListPage
 * @description Vista principal de gestión de registros empresariales con DataTable avanzada.
 */
@Component({
  selector: 'app-record-list',
  standalone: true,
  imports: [CommonModule, IonicModule, DataTableComponent],
  template: `
    <ion-header [translucent]="true">
      <ion-toolbar color="primary">
        <ion-buttons slot="start">
          <ion-menu-button></ion-menu-button>
        </ion-buttons>
        <ion-title>Gestión de Registros</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding page-content">
      <div class="content-container">
        <!-- Encabezado de sección -->
        <div class="section-header">
          <div>
            <h1 class="page-title">Registros Empresariales</h1>
            <p class="page-subtitle">Explora, filtra, ordena y gestiona los registros corporativos.</p>
          </div>
        </div>

        <!-- DataTable Component Reutilizable (Fase 2) -->
        <app-data-table
          [data]="sampleRecords"
          [columns]="columns"
          [actions]="actions"
          [pageSize]="5"
          [pageSizeOptions]="[5, 10, 20]"
          (rowSelected)="onRowSelected($event)"
          (actionTriggered)="onActionTriggered($event)"
          (exportCsv)="onExportCsv($event)"
        ></app-data-table>
      </div>
    </ion-content>
  `,
  styles: [`
    .page-content {
      --background: #0f172a;
    }
    .content-container {
      max-width: 1200px;
      margin: 0 auto;
    }
    .section-header {
      margin-bottom: 1.5rem;
      .page-title {
        font-size: 1.6rem;
        font-weight: 700;
        color: #f8fafc;
        margin: 0 0 0.35rem 0;
      }
      .page-subtitle {
        font-size: 0.9rem;
        color: #94a3b8;
        margin: 0;
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RecordListPage {
  readonly columns: TableColumn<SampleRecord>[] = [
    { key: 'title', label: 'Título del Registro', sortable: true },
    { key: 'clientName', label: 'Cliente', sortable: true },
    {
      key: 'category',
      label: 'Categoría',
      sortable: true,
      type: 'badge',
      badgeColorMap: {
        SALES: 'badge-primary',
        MARKETING: 'badge-warning',
        FINANCE: 'badge-success',
        OPERATIONS: 'badge-default'
      }
    },
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
    { key: 'amount', label: 'Importe', sortable: true, type: 'currency', align: 'right' },
    { key: 'region', label: 'Región', sortable: true },
    { key: 'updatedAt', label: 'Actualizado', sortable: true, type: 'relative-time' }
  ];

  readonly actions: TableAction<SampleRecord>[] = [
    { id: 'view', label: 'Ver detalles', icon: 'eye-outline', color: 'primary' },
    { id: 'edit', label: 'Editar registro', icon: 'create-outline', color: 'secondary' },
    { id: 'delete', label: 'Eliminar registro', icon: 'trash-outline', color: 'danger' }
  ];

  readonly sampleRecords: SampleRecord[] = [
    {
      id: 'rec-001',
      title: 'Auditoría Financiera Q3',
      clientName: 'Banco Santander',
      category: RecordCategory.FINANCE,
      status: RecordStatus.ACTIVE,
      amount: 45000,
      region: 'Madrid',
      updatedAt: new Date(Date.now() - 1000 * 60 * 15).toISOString()
    },
    {
      id: 'rec-002',
      title: 'Campaña Lanzamiento Cloud',
      clientName: 'Telefónica Tech',
      category: RecordCategory.MARKETING,
      status: RecordStatus.COMPLETED,
      amount: 82500,
      region: 'Barcelona',
      updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString()
    },
    {
      id: 'rec-003',
      title: 'Optimización de Rutas Logísticas',
      clientName: 'SEUR Internacional',
      category: RecordCategory.OPERATIONS,
      status: RecordStatus.PENDING,
      amount: 29000,
      region: 'Valencia',
      updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString()
    },
    {
      id: 'rec-004',
      title: 'Renovación Licencias Enterprise',
      clientName: 'Inditex Global',
      category: RecordCategory.SALES,
      status: RecordStatus.ACTIVE,
      amount: 142000,
      region: 'Galicia',
      updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString()
    },
    {
      id: 'rec-005',
      title: 'Consultoría Big Data e IA',
      clientName: 'BBVA Seguros',
      category: RecordCategory.FINANCE,
      status: RecordStatus.ACTIVE,
      amount: 67000,
      region: 'Madrid',
      updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString()
    },
    {
      id: 'rec-006',
      title: 'Migración Infraestructura On-Premise',
      clientName: 'Repsol Energía',
      category: RecordCategory.OPERATIONS,
      status: RecordStatus.COMPLETED,
      amount: 115000,
      region: 'Bilbao',
      updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 120).toISOString()
    },
    {
      id: 'rec-007',
      title: 'Estrategia SEO & SEM Internacional',
      clientName: 'Meliá Hotels',
      category: RecordCategory.MARKETING,
      status: RecordStatus.ARCHIVED,
      amount: 34000,
      region: 'Palma de Mallorca',
      updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 200).toISOString()
    }
  ];

  onRowSelected(record: SampleRecord): void {
    console.log('[RecordList] Fila seleccionada:', record);
  }

  onActionTriggered(event: TableActionEvent<SampleRecord>): void {
    console.log(`[RecordList] Acción disparada: ${event.action} en`, event.row);
  }

  onExportCsv(records: SampleRecord[]): void {
    console.log('[RecordList] Exportando CSV con registros:', records.length);
  }
}
