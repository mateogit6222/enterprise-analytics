/**
 * @module RecordModel
 * @description Modelo de datos para los registros empresariales.
 * Representa entidades de negocio como ventas, clientes o productos
 * que se gestionan y visualizan en el sistema.
 *
 * @remarks
 * Los registros provienen de dos fuentes de datos simuladas:
 * - API REST (SQL/PostgreSQL): datos tabulados históricos.
 * - Firestore (NoSQL): datos en tiempo real y métricas actualizadas.
 */

/**
 * Categoría del registro empresarial.
 *
 * @enum {string}
 */
export enum RecordCategory {
  SALES = 'SALES',
  MARKETING = 'MARKETING',
  FINANCE = 'FINANCE',
  OPERATIONS = 'OPERATIONS',
  HR = 'HR'
}

/**
 * Estado del registro en el flujo de trabajo.
 *
 * @enum {string}
 */
export enum RecordStatus {
  ACTIVE = 'ACTIVE',
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  ARCHIVED = 'ARCHIVED'
}

/**
 * Interfaz que representa un registro empresarial.
 *
 * @interface Record
 * @property {string} id - Identificador único (UUID v4).
 * @property {string} title - Título descriptivo del registro.
 * @property {string} description - Descripción detallada.
 * @property {RecordCategory} category - Categoría de negocio.
 * @property {RecordStatus} status - Estado actual en el flujo.
 * @property {number} amount - Valor monetario asociado (en EUR).
 * @property {string} assignedTo - ID del usuario responsable.
 * @property {string} clientName - Nombre del cliente asociado.
 * @property {string} clientEmail - Email del cliente.
 * @property {string} region - Región geográfica (ej. 'Europa Sur').
 * @property {string[]} tags - Etiquetas para clasificación.
 * @property {string} createdAt - Fecha de creación (ISO 8601).
 * @property {string} updatedAt - Última fecha de actualización (ISO 8601).
 * @property {string} source - Fuente de datos: 'REST' o 'FIRESTORE'.
 */
export interface Record {
  id: string;
  title: string;
  description: string;
  category: RecordCategory;
  status: RecordStatus;
  amount: number;
  assignedTo: string;
  clientName: string;
  clientEmail: string;
  region: string;
  sku: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  source: 'SUPABASE' | 'REST';
}

/**
 * Filtros aplicables a la búsqueda de registros.
 *
 * @interface RecordFilters
 * @property {string} [searchTerm] - Texto libre para buscar en título y descripción.
 * @property {RecordCategory} [category] - Filtrar por categoría.
 * @property {RecordStatus} [status] - Filtrar por estado.
 * @property {string} [region] - Filtrar por región.
 * @property {string} [dateFrom] - Fecha inicio del rango (ISO 8601).
 * @property {string} [dateTo] - Fecha fin del rango (ISO 8601).
 */
export interface RecordFilters {
  searchTerm?: string;
  category?: RecordCategory;
  status?: RecordStatus;
  region?: string;
  dateFrom?: string;
  dateTo?: string;
}

/**
 * Respuesta paginada del servicio de registros.
 *
 * @interface PaginatedRecords
 * @property {Record[]} data - Lista de registros de la página actual.
 * @property {number} total - Total de registros que cumplen el filtro.
 * @property {number} page - Página actual (base 1).
 * @property {number} pageSize - Tamaño de cada página.
 * @property {number} totalPages - Total de páginas disponibles.
 */
export interface PaginatedRecords {
  data: Record[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
