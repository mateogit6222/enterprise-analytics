import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { delay, map, tap, catchError, take } from 'rxjs/operators';
import { Record, RecordFilters, PaginatedRecords } from '../models/record.model';
import { FALLBACK_SQL_RECORDS } from '../models/mock-datasets';

/**
 * @class ApiRestService
 * @description Servicio que simula una API REST conectada a una base de datos
 * relacional SQL (PostgreSQL). Proporciona operaciones CRUD sobre registros
 * empresariales con paginación, filtrado y ordenación server-side simulada.
 *
 * @remarks
 * - Cuenta con dataset de respaldo en memoria (`FALLBACK_SQL_RECORDS`) para emisión inmediata sin bloqueo.
 * - Latencia simulada ultrarrápida (50ms).
 * - Cache en memoria pre-poblada para garantizar que nunca emita un array vacío.
 * - Fuente de datos: `source: 'REST'` en cada registro.
 */
@Injectable({
  providedIn: 'root'
})
export class ApiRestService {

  /** @private Inyección de HttpClient para cargar datos mock */
  private readonly http = inject(HttpClient);

  /** @private Cache de registros en memoria inicializada con el dataset de respaldo */
  private cachedRecords: Record[] = [...FALLBACK_SQL_RECORDS];

  /** @private Flag de carga completada */
  private dataLoaded = true;

  constructor() {
    // Sincronización en segundo plano con el archivo JSON si está disponible
    this.http.get<Record[]>('assets/mock-data/records-sql.mock.json').pipe(
      catchError(() => this.http.get<Record[]>('/assets/mock-data/records-sql.mock.json')),
      catchError(() => of([])),
      take(1)
    ).subscribe(records => {
      if (records && records.length > 0) {
        this.cachedRecords = records;
      }
    });
  }

  /**
   * Obtiene todos los registros de la fuente REST (SQL).
   * Emite de forma garantizada e inmediata el array completo con of(records).pipe(delay(50), take(1)).
   *
   * @returns {Observable<Record[]>} Lista completa de registros SQL.
   */
  getRecords(): Observable<Record[]> {
    return of([...this.cachedRecords]).pipe(
      delay(50),
      take(1)
    );
  }

  /**
   * Obtiene registros filtrados y paginados.
   *
   * @param {RecordFilters} filters - Filtros a aplicar.
   * @param {number} page - Página a obtener (1-indexed).
   * @param {number} pageSize - Tamaño de página.
   * @returns {Observable<PaginatedRecords>} Registros paginados.
   */
  getFilteredRecords(
    filters: RecordFilters,
    page: number = 1,
    pageSize: number = 10
  ): Observable<PaginatedRecords> {
    return this.getRecords().pipe(
      map(records => {
        let filtered = [...records];

        /** Aplicar filtro de búsqueda textual */
        if (filters.searchTerm?.trim()) {
          const q = filters.searchTerm.toLowerCase().trim();
          filtered = filtered.filter(r =>
            r.title.toLowerCase().includes(q) ||
            r.description.toLowerCase().includes(q) ||
            r.clientName.toLowerCase().includes(q) ||
            r.sku.toLowerCase().includes(q)
          );
        }

        /** Aplicar filtro de categoría */
        if (filters.category) {
          filtered = filtered.filter(r => r.category === filters.category);
        }

        /** Aplicar filtro de estado */
        if (filters.status) {
          filtered = filtered.filter(r => r.status === filters.status);
        }

        /** Aplicar filtro de región */
        if (filters.region) {
          filtered = filtered.filter(r => r.region === filters.region);
        }

        /** Aplicar filtro de fechas */
        if (filters.dateFrom) {
          const from = new Date(filters.dateFrom).getTime();
          filtered = filtered.filter(r => new Date(r.createdAt).getTime() >= from);
        }
        if (filters.dateTo) {
          const to = new Date(filters.dateTo).getTime();
          filtered = filtered.filter(r => new Date(r.createdAt).getTime() <= to);
        }

        /** Paginar */
        const total = filtered.length;
        const totalPages = Math.ceil(total / pageSize) || 1;
        const start = (page - 1) * pageSize;
        const data = filtered.slice(start, start + pageSize);

        return { data, total, page, pageSize, totalPages };
      })
    );
  }

  /**
   * Crea un nuevo registro en la fuente REST.
   *
   * @param {Omit<Record, 'id' | 'createdAt' | 'updatedAt' | 'source'>} record - Datos del registro.
   * @returns {Observable<Record>} Registro creado con ID y timestamps.
   */
  createRecord(record: Omit<Record, 'id' | 'createdAt' | 'updatedAt' | 'source'>): Observable<Record> {
    const newRecord: Record = {
      ...record,
      id: `sql-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      source: 'REST'
    };

    return of(newRecord).pipe(
      delay(100),
      take(1),
      tap(r => this.cachedRecords.push(r))
    );
  }

  /**
   * Actualiza un registro existente.
   *
   * @param {string} id - ID del registro a actualizar.
   * @param {Partial<Record>} changes - Campos a modificar.
   * @returns {Observable<Record>} Registro actualizado.
   */
  updateRecord(id: string, changes: Partial<Record>): Observable<Record> {
    return of(null).pipe(
      delay(100),
      take(1),
      map(() => {
        const index = this.cachedRecords.findIndex(r => r.id === id);
        if (index === -1) {
          throw new Error(`Registro con ID ${id} no encontrado`);
        }
        const updated: Record = {
          ...this.cachedRecords[index],
          ...changes,
          updatedAt: new Date().toISOString()
        };
        this.cachedRecords[index] = updated;
        return updated;
      })
    );
  }

  /**
   * Elimina un registro por ID.
   *
   * @param {string} id - ID del registro a eliminar.
   * @returns {Observable<string>} ID del registro eliminado.
   */
  deleteRecord(id: string): Observable<string> {
    return of(id).pipe(
      delay(100),
      take(1),
      tap(() => {
        this.cachedRecords = this.cachedRecords.filter(r => r.id !== id);
      })
    );
  }

  /**
   * Verifica si un SKU ya existe en los registros (para validación asíncrona).
   *
   * @param {string} sku - Código SKU a verificar.
   * @param {string} [excludeId] - ID a excluir de la búsqueda (edición).
   * @returns {Observable<boolean>} `true` si el SKU ya existe.
   */
  checkSkuExists(sku: string, excludeId?: string): Observable<boolean> {
    return this.getRecords().pipe(
      delay(100),
      take(1),
      map(records =>
        records.some(r =>
          r.sku.toLowerCase() === sku.toLowerCase() &&
          r.id !== excludeId
        )
      )
    );
  }
}
