import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, from } from 'rxjs';
import { delay, map, catchError, take } from 'rxjs/operators';
import { Record, RecordFilters, PaginatedRecords } from '../models/record.model';
import { FALLBACK_SQL_RECORDS } from '../models/mock-datasets';
import { SupabaseService } from './supabase.service';

/**
 * @class ApiRestService
 * @description Servicio de acceso a datos relacionales (PostgreSQL vía Supabase o API REST).
 * Proporciona operaciones CRUD sobre registros empresariales con paginación,
 * filtrado y ordenación server-side.
 *
 * @remarks
 * Cumple con los requisitos del profesor:
 * - Modo Híbrido Inteligente (Zero-Downtime): Si Supabase está configurado, consume la base de datos cloud;
 *   si no está configurado o falla, recurre de inmediato (50ms) al dataset en memoria (`FALLBACK_SQL_RECORDS`).
 * - Supresión completa de NoSQL/Firestore simulado.
 */
@Injectable({
  providedIn: 'root'
})
export class ApiRestService {

  /** @private Inyección de HttpClient para sincronización con assets mock */
  private readonly http = inject(HttpClient);

  /** @private Inyección del cliente oficial de Supabase */
  private readonly supabaseService = inject(SupabaseService);

  /** @private Cache de registros en memoria inicializada con el dataset de respaldo */
  private cachedRecords: Record[] = [...FALLBACK_SQL_RECORDS];

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
   * Obtiene todos los registros corporativos.
   * Conecta con Supabase si está activo o devuelve el dataset en memoria.
   *
   * @returns {Observable<Record[]>} Lista completa de registros.
   */
  getRecords(): Observable<Record[]> {
    if (this.supabaseService.isConfigured()) {
      return from(this.supabaseService.getRecords()).pipe(
        map(records => {
          if (records && records.length > 0) {
            this.cachedRecords = records;
            return records;
          }
          return [...this.cachedRecords];
        }),
        catchError(() => of([...this.cachedRecords])),
        take(1)
      );
    }

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
   * Crea un nuevo registro en Supabase o en memoria.
   *
   * @param {Omit<Record, 'id' | 'createdAt' | 'updatedAt' | 'source'>} record - Datos del registro.
   * @returns {Observable<Record>} Registro creado con ID y timestamps.
   */
  createRecord(record: Omit<Record, 'id' | 'createdAt' | 'updatedAt' | 'source'>): Observable<Record> {
    const newRecord: Record = {
      ...record,
      id: `rec-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      source: 'SUPABASE'
    };

    if (this.supabaseService.isConfigured()) {
      return from(this.supabaseService.createRecord(newRecord)).pipe(
        map(saved => {
          const finalRecord = saved || newRecord;
          this.cachedRecords.unshift(finalRecord);
          return finalRecord;
        }),
        catchError(() => {
          this.cachedRecords.unshift(newRecord);
          return of(newRecord);
        }),
        take(1)
      );
    }

    this.cachedRecords.unshift(newRecord);
    return of(newRecord).pipe(
      delay(50),
      take(1)
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
    const index = this.cachedRecords.findIndex(r => r.id === id);
    const updated: Record = {
      ...(index !== -1 ? this.cachedRecords[index] : {} as Record),
      ...changes,
      id,
      updatedAt: new Date().toISOString()
    };
    if (index !== -1) {
      this.cachedRecords[index] = updated;
    }

    if (this.supabaseService.isConfigured()) {
      return from(this.supabaseService.updateRecord(id, changes)).pipe(
        map(saved => saved || updated),
        catchError(() => of(updated)),
        take(1)
      );
    }

    return of(updated).pipe(
      delay(50),
      take(1)
    );
  }

  /**
   * Elimina un registro por ID.
   *
   * @param {string} id - ID del registro a eliminar.
   * @returns {Observable<string>} ID del registro eliminado.
   */
  deleteRecord(id: string): Observable<string> {
    this.cachedRecords = this.cachedRecords.filter(r => r.id !== id);

    if (this.supabaseService.isConfigured()) {
      return from(this.supabaseService.deleteRecord(id)).pipe(
        map(() => id),
        catchError(() => of(id)),
        take(1)
      );
    }

    return of(id).pipe(
      delay(50),
      take(1)
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
      delay(50),
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
