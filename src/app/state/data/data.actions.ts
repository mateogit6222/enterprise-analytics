import { createAction, props } from '@ngrx/store';
import { Record, RecordFilters } from '../../core/models/record.model';
import { Kpi } from '../../core/models/kpi.model';

/**
 * @module DataActions
 * @description Acciones NgRx para la gestión de registros empresariales,
 * KPIs del dashboard y filtros. Cubre el flujo completo CRUD + carga dual
 * SQL/NoSQL con forkJoin.
 */

/** ─────────── Carga Dual de Datos (forkJoin SQL + NoSQL) ─────────── */

/** Dispara la carga concurrente de ambas fuentes de datos */
export const loadAllData = createAction(
  '[Data] Load All Data'
);

/** Carga exitosa: combina registros de ambas fuentes */
export const loadAllDataSuccess = createAction(
  '[Data] Load All Data Success',
  props<{ records: Record[]; kpis: Kpi[] }>()
);

/** Error en la carga de datos */
export const loadAllDataFailure = createAction(
  '[Data] Load All Data Failure',
  props<{ error: string }>()
);

/** ─────────── CRUD de Registros ─────────── */

/** Crear registro */
export const createRecord = createAction(
  '[Data] Create Record',
  props<{ record: Omit<Record, 'id' | 'createdAt' | 'updatedAt' | 'source'> }>()
);

export const createRecordSuccess = createAction(
  '[Data] Create Record Success',
  props<{ record: Record }>()
);

export const createRecordFailure = createAction(
  '[Data] Create Record Failure',
  props<{ error: string }>()
);

/** Actualizar registro */
export const updateRecord = createAction(
  '[Data] Update Record',
  props<{ id: string; changes: Partial<Record> }>()
);

export const updateRecordSuccess = createAction(
  '[Data] Update Record Success',
  props<{ record: Record }>()
);

export const updateRecordFailure = createAction(
  '[Data] Update Record Failure',
  props<{ error: string }>()
);

/** Eliminar registro */
export const deleteRecord = createAction(
  '[Data] Delete Record',
  props<{ id: string }>()
);

export const deleteRecordSuccess = createAction(
  '[Data] Delete Record Success',
  props<{ id: string }>()
);

export const deleteRecordFailure = createAction(
  '[Data] Delete Record Failure',
  props<{ error: string }>()
);

/** ─────────── Filtros del Dashboard ─────────── */

/** Actualizar filtros activos */
export const setFilters = createAction(
  '[Data] Set Filters',
  props<{ filters: RecordFilters }>()
);

/** Actualizar rango temporal del dashboard */
export const setTimeRange = createAction(
  '[Data] Set Time Range',
  props<{ timeRange: string }>()
);

/** Limpiar todos los filtros */
export const clearFilters = createAction(
  '[Data] Clear Filters'
);

/** ─────────── Exportación de Registros ─────────── */

export const exportRecords = createAction(
  '[Data] Export Records',
  props<{ format: 'pdf' | 'csv'; filename?: string }>()
);

export const exportRecordsSuccess = createAction(
  '[Data] Export Records Success',
  props<{ format: 'pdf' | 'csv' }>()
);

export const exportRecordsFailure = createAction(
  '[Data] Export Records Failure',
  props<{ error: string }>()
);
