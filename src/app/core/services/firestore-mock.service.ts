import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of, interval } from 'rxjs';
import { delay, map, tap, catchError, take, switchMap } from 'rxjs/operators';
import { Record } from '../models/record.model';

/**
 * @class FirestoreMockService
 * @description Servicio que simula una conexión en tiempo real con Firestore (NoSQL).
 * Utiliza un `BehaviorSubject` para emitir un flujo reactivo de datos, imitando
 * las suscripciones en tiempo real de Firebase/Firestore donde los datos se
 * actualizan automáticamente al cambiar.
 *
 * @remarks
 * - Carga datos iniciales desde `assets/mock-data/records-nosql.mock.json`.
 * - Emite actualizaciones periódicas simuladas (cada 30s) con variaciones de importes.
 * - El `BehaviorSubject` garantiza que nuevos suscriptores reciban el último valor.
 * - Fuente de datos: `source: 'FIRESTORE'` en cada registro.
 * - Este patrón demuestra la diferencia clave SQL vs NoSQL para la rúbrica (RA 5).
 *
 * @example
 * ```typescript
 * this.firestoreService.records$.subscribe(records => {
 *   console.log('Registros NoSQL en tiempo real:', records);
 * });
 * ```
 */
@Injectable({
  providedIn: 'root'
})
export class FirestoreMockService {

  /** @private Inyección de HttpClient para carga inicial */
  private readonly http = inject(HttpClient);

  /**
   * BehaviorSubject que actúa como "colección en tiempo real" de Firestore.
   * Emite el array completo de registros NoSQL cada vez que cambia.
   * @private
   */
  private readonly recordsSubject = new BehaviorSubject<Record[]>([]);

  /**
   * Observable público del flujo de registros NoSQL en tiempo real.
   * Los consumidores se suscriben aquí para recibir actualizaciones automáticas.
   *
   * @type {Observable<Record[]>}
   */
  readonly records$: Observable<Record[]> = this.recordsSubject.asObservable();

  /** @private Flag de carga inicial completada */
  private initialized = false;

  /**
   * Inicializa la conexión simulada con Firestore.
   * Carga datos del JSON mock y arranca el stream de actualizaciones periódicas.
   *
   * @returns {Observable<Record[]>} Observable que emite al completar la carga inicial.
   */
  initialize(): Observable<Record[]> {
    if (this.initialized) {
      return of(this.recordsSubject.getValue());
    }

    return this.http.get<Record[]>('assets/mock-data/records-nosql.mock.json').pipe(
      delay(800 + Math.random() * 700),
      tap(records => {
        this.recordsSubject.next(records);
        this.initialized = true;
        this.startRealtimeSimulation();
      }),
      catchError(err => {
        console.error('[FirestoreMockService] Error al inicializar datos NoSQL:', err);
        this.initialized = true;
        return of([]);
      })
    );
  }

  /**
   * Obtiene una instantánea de los registros NoSQL actuales.
   * Si no se ha inicializado, dispara la carga automáticamente.
   *
   * @returns {Observable<Record[]>} Snapshot de registros NoSQL.
   */
  getRecordsSnapshot(): Observable<Record[]> {
    if (!this.initialized) {
      return this.initialize();
    }
    return of(this.recordsSubject.getValue()).pipe(
      delay(150 + Math.random() * 200)
    );
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
      delay(300 + Math.random() * 300),
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
      delay(250 + Math.random() * 250),
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
      delay(200 + Math.random() * 200),
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
