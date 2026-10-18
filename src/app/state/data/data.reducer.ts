import { createReducer, on } from '@ngrx/store';
import { Record, RecordFilters } from '../../core/models/record.model';
import { Kpi } from '../../core/models/kpi.model';
import * as DataActions from './data.actions';

/**
 * @interface DataState
 * @description Sub-estado NgRx para registros empresariales, KPIs y filtros del dashboard.
 *
 * @property {Record[]} records - Lista completa de registros (SQL + NoSQL combinados).
 * @property {Kpi[]} kpis - Indicadores KPI calculados a partir de los registros.
 * @property {RecordFilters} filters - Filtros activos en el dashboard/lista.
 * @property {string} timeRange - Rango temporal seleccionado en el dashboard.
 * @property {boolean} loading - Indica si hay una operación asíncrona en curso.
 * @property {string | null} error - Último mensaje de error o null.
 * @property {boolean} exporting - Indica si se está generando un archivo de exportación.
 */
export interface DataState {
  records: Record[];
  kpis: Kpi[];
  filters: RecordFilters;
  timeRange: string;
  loading: boolean;
  error: string | null;
  exporting: boolean;
}

/**
 * Estado inicial de datos.
 */
export const initialDataState: DataState = {
  records: [],
  kpis: [],
  filters: {},
  timeRange: '30D',
  loading: false,
  error: null,
  exporting: false
};

/**
 * Reducer de datos empresariales.
 * Gestiona el estado inmutable de registros, KPIs, filtros y operaciones CRUD.
 */
export const dataReducer = createReducer(
  initialDataState,

  /** ─── Carga Dual ─── */
  on(DataActions.loadAllData, (state) => ({
    ...state,
    loading: true,
    error: null
  })),

  on(DataActions.loadAllDataSuccess, (state, { records, kpis }) => ({
    ...state,
    records,
    kpis,
    loading: false,
    error: null
  })),

  on(DataActions.loadAllDataFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),

  /** ─── Crear Registro ─── */
  on(DataActions.createRecord, (state) => ({
    ...state,
    loading: true,
    error: null
  })),

  on(DataActions.createRecordSuccess, (state, { record }) => ({
    ...state,
    records: [...state.records, record],
    loading: false
  })),

  on(DataActions.createRecordFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),

  /** ─── Actualizar Registro ─── */
  on(DataActions.updateRecord, (state) => ({
    ...state,
    loading: true,
    error: null
  })),

  on(DataActions.updateRecordSuccess, (state, { record }) => ({
    ...state,
    records: state.records.map(r => r.id === record.id ? record : r),
    loading: false
  })),

  on(DataActions.updateRecordFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),

  /** ─── Eliminar Registro ─── */
  on(DataActions.deleteRecord, (state) => ({
    ...state,
    loading: true,
    error: null
  })),

  on(DataActions.deleteRecordSuccess, (state, { id }) => ({
    ...state,
    records: state.records.filter(r => r.id !== id),
    loading: false
  })),

  on(DataActions.deleteRecordFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),

  /** ─── Filtros ─── */
  on(DataActions.setFilters, (state, { filters }) => ({
    ...state,
    filters: { ...state.filters, ...filters }
  })),

  on(DataActions.setTimeRange, (state, { timeRange }) => ({
    ...state,
    timeRange
  })),

  on(DataActions.clearFilters, (state) => ({
    ...state,
    filters: {},
    timeRange: '30D'
  })),

  /** ─── Exportación ─── */
  on(DataActions.exportRecords, (state) => ({
    ...state,
    exporting: true,
    error: null
  })),

  on(DataActions.exportRecordsSuccess, (state) => ({
    ...state,
    exporting: false
  })),

  on(DataActions.exportRecordsFailure, (state, { error }) => ({
    ...state,
    exporting: false,
    error
  }))
);
