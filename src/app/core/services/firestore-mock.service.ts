import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of, interval } from 'rxjs';
import { delay, map, tap, catchError, take, switchMap } from 'rxjs/operators';
import { Record } from '../models/record.model';
import { FALLBACK_NOSQL_RECORDS } from '../models/mock-datasets';

/**
 * @class FirestoreMockService
 * @description Servicio que simula una conexión en tiempo real con Firestore (NoSQL).
 * Utiliza un `BehaviorSubject` para emitir un flujo reactivo de datos, imitando
 * las suscripciones en tiempo real de Firebase/Firestore donde los datos se
 * actualizan automáticamente al cambiar.
 *
 * @remarks
 * - Cuenta con dataset de respaldo en memoria (`FALLBACK_NOSQL_RECORDS`) para inicialización inmediata del BehaviorSubject.
 * - Emite actualizaciones periódicas simuladas (cada 30s) con variaciones de importes.
 * - El `BehaviorSubject` está pre-poblado desde el inicio para que `take(1)` nunca emita un array vacío.
 * - Fuente de datos: `source: 'FIRESTORE'` en cada registro.
 */
@Injectable({
  providedIn: 'root'
})
export class FirestoreMockService {

  /** @private Inyección de HttpClient para carga inicial */
  private readonly http = inject(HttpClient);

  /**
   * BehaviorSubject que actúa como "colección en tiempo real" de Firestore.
   * Inicializado directamente con el dataset en memoria de respaldo.
   * @private
   */
  private readonly recordsSubject = new BehaviorSubject<Record[]>([...FALLBACK_NOSQL_RECORDS]);

  /**
   * Observable público del flujo de registros NoSQL en tiempo real.
   *
   * @type {Observable<Record[]>}
   */
  readonly records$: Observable<Record[]> = this.recordsSubject.asObservable();

  /** @private Flag de carga inicial completada */
  private initialized = true;

  constructor() {
    // Sincronización en segundo plano con el archivo JSON si está disponible
    this.http.get<Record[]>('assets/mock-data/records-nosql.mock.json').pipe(
      catchError(() => this.http.get<Record[]>('/assets/mock-data/records-nosql.mock.json')),
      catchError(() => of([])),
      take(1)
    ).subscribe(records => {
      if (records && records.length > 0) {
        this.recordsSubject.next(records);
      }
    });
    this.startRealtimeSimulation();
  }

  /**
   * Inicializa la conexión simulada con Firestore.
   *
   * @returns {Observable<Record[]>} Observable que emite y se completa (take(1)).
   */
  initialize(): Observable<Record[]> {
    return of([...this.recordsSubject.getValue()]).pipe(take(1));
  }

  /**
   * Obtiene una instantánea de los registros NoSQL actuales.
   * Emite de forma garantizada e inmediata el array completo con of(records).pipe(delay(50), take(1)).
   *
   * @returns {Observable<Record[]>} Snapshot de registros NoSQL garantizado a completar.
   */
  getRecordsSnapshot(): Observable<Record[]> {
    return of([...this.recordsSubject.getValue()]).pipe(
      delay(50),
      take(1)
    );
  }

  /**
   * Alias de getRecordsSnapshot para alineación con ApiRestService.
   * Emite y completa garantizadamente (take(1)).
   *
   * @returns {Observable<Record[]>} Registros NoSQL con complete().
   */
  getRecords(): Observable<Record[]> {
    return this.getRecordsSnapshot();
  }

  /**
   * Añade un registro a la colección NoSQL en tiempo real.
   *
   * @param {Omit<Record, 'id' | 'createdAt' | 'updatedAt' | 'source'>} record - Datos del registro.
   * @returns {Observable<Record>} Registro creado.
   */
  addRecord(record: Omit<Record, 'id' | 'createdAt' | 'updatedAt' | 'source'>): Observable<Record> {
    const newRecord: Record = {
      ...record,
      id: `nosql-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      source: 'FIRESTORE'
    };

    return of(newRecord).pipe(
      delay(100),
      take(1),
      tap(r => {
        const current = this.recordsSubject.getValue();
        this.recordsSubject.next([...current, r]);
      })
    );
  }

  /**
   * Actualiza un registro existente en la colección NoSQL.
   *
   * @param {string} id - ID del documento a actualizar.
   * @param {Partial<Record>} changes - Campos a modificar.
   * @returns {Observable<Record>} Registro actualizado.
   */
  updateRecord(id: string, changes: Partial<Record>): Observable<Record> {
    return of(null).pipe(
      delay(100),
      take(1),
      map(() => {
        const current = this.recordsSubject.getValue();
        const index = current.findIndex(r => r.id === id);
        if (index === -1) {
          throw new Error(`Documento NoSQL con ID ${id} no encontrado`);
        }
        const updated: Record = {
          ...current[index],
          ...changes,
          updatedAt: new Date().toISOString()
        };
        const newList = [...current];
        newList[index] = updated;
        this.recordsSubject.next(newList);
        return updated;
      })
    );
  }

  /**
   * Elimina un documento de la colección NoSQL.
   *
   * @param {string} id - ID del documento a eliminar.
   * @returns {Observable<string>} ID del documento eliminado.
   */
  deleteRecord(id: string): Observable<string> {
    return of(id).pipe(
      delay(100),
      take(1),
      tap(() => {
        const current = this.recordsSubject.getValue();
        this.recordsSubject.next(current.filter(r => r.id !== id));
      })
    );
  }

  /**
   * Simula actualizaciones periódicas en tiempo real (cada 30 segundos).
   * Varía ligeramente los importes de un registro aleatorio para simular
   * un flujo de datos en vivo, como haría una suscripción real a Firestore.
   *
   * @private
   */
  private startRealtimeSimulation(): void {
    interval(30000).pipe(
      take(100)
    ).subscribe(() => {
      const current = this.recordsSubject.getValue();
      if (current.length === 0) return;

      /** Seleccionar registro aleatorio y variar su importe ±5% */
      const randomIndex = Math.floor(Math.random() * current.length);
      const variation = 1 + (Math.random() * 0.1 - 0.05);
      const updated = [...current];
      updated[randomIndex] = {
        ...updated[randomIndex],
        amount: Math.round(updated[randomIndex].amount * variation),
        updatedAt: new Date().toISOString()
      };
      this.recordsSubject.next(updated);
    });
  }
}
