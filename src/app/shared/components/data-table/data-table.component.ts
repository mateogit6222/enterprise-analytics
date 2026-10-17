import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnDestroy,
  OnChanges,
  SimpleChanges,
  ChangeDetectionStrategy
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular/lazy';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { CurrencyFormatPipe } from '../../pipes/currency-format.pipe';
import { RelativeTimePipe } from '../../pipes/relative-time.pipe';
import { HighlightDirective } from '../../directives/highlight.directive';
import { LoadingSkeletonComponent } from '../loading-skeleton/loading-skeleton.component';

/**
 * Definición de columnas de la tabla.
 */
export interface TableColumn<T = any> {
  key: string;
  label: string;
  sortable?: boolean;
  type?: 'text' | 'currency' | 'date' | 'relative-time' | 'badge' | 'custom';
  align?: 'left' | 'center' | 'right';
  badgeColorMap?: Record<string, string>;
  width?: string;
}

/**
 * Acción disponible en cada fila.
 */
export interface TableAction<T = any> {
  id: string;
  label: string;
  icon: string;
  color?: string;
  show?: (row: T) => boolean;
}

/**
 * Evento emitido al accionar un botón de fila.
 */
export interface TableActionEvent<T = any> {
  action: string;
  row: T;
}

/**
 * Dirección de ordenamiento.
 */
export type SortDirection = 'asc' | 'desc' | 'none';

/**
 * @component DataTableComponent
 * @description Componente de tabla de datos empresarial de alto rendimiento con búsqueda reactiva debounced,
 * ordenación multicampo, paginación dinámica, selección múltiple, acciones por fila y OnPush.
 *
 * @example
 * ```html
 * <app-data-table
 *   [data]="records"
 *   [columns]="columns"
 *   [actions]="actions"
 *   [pageSize]="10"
 *   (rowSelected)="onSelect($event)"
 *   (actionTriggered)="onAction($event)">
 * </app-data-table>
 * ```
 */
@Component({
  selector: 'app-data-table',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CurrencyFormatPipe,
    RelativeTimePipe,
    HighlightDirective,
    LoadingSkeletonComponent
  ],
  templateUrl: './data-table.component.html',
  styleUrls: ['./data-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DataTableComponent<T extends Record<string, any> = any>
  implements OnInit, OnDestroy, OnChanges {

  /** Colección completa de datos a renderizar */
  @Input() data: T[] = [];

  /** Configuración de columnas */
  @Input({ required: true }) columns: TableColumn<T>[] = [];

  /** Acciones por fila (editar, eliminar, ver) */
  @Input() actions: TableAction<T>[] = [];

  /** Tamaño de página inicial */
  @Input() pageSize: number = 10;

  /** Opciones de tamaño de página disponibles */
  @Input() pageSizeOptions: number[] = [5, 10, 20, 50];

  /** Estado de carga que activa el skeleton loader */
  @Input() loading: boolean = false;

  /** Si es true, habilita selección múltiple por casillas de verificación */
  @Input() selectable: boolean = true;

  /** Texto del placeholder en la barra de búsqueda */
  @Input() searchPlaceholder: string = 'Buscar registros...';

  /** Emite al seleccionar o deseleccionar una fila individual */
  @Output() rowSelected = new EventEmitter<T>();

  /** Emite el conjunto completo de filas seleccionadas */
  @Output() selectionChange = new EventEmitter<T[]>();

  /** Emite al accionar un botón de fila */
  @Output() actionTriggered = new EventEmitter<TableActionEvent<T>>();

  /** Emite al pulsar el botón de exportar CSV */
  @Output() exportCsv = new EventEmitter<T[]>();

  /** Término de búsqueda actual */
  searchTerm: string = '';

  /** Columna actualmente ordenada */
  sortColumn: string = '';

  /** Dirección actual de ordenación */
  sortDirection: SortDirection = 'none';

  /** Página actual (1-indexed) */
  currentPage: number = 1;

  /** Conjunto de IDs o claves de filas seleccionadas */
  selectedRows = new Set<T>();

  /** Subject para debounce reactivo de la búsqueda */
  private readonly searchSubject$ = new Subject<string>();

  /** Subject para desuscribirse y evitar memory leaks */
  private readonly destroy$ = new Subject<void>();

  /** Datos tras aplicar filtro y ordenación */
  filteredData: T[] = [];

  /** Datos paginados visibles en la vista actual */
  pagedData: T[] = [];

  ngOnInit(): void {
    /** Configurar búsqueda reactiva con 300ms de debounce para evitar lag */
    this.searchSubject$
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe(query => {
        this.searchTerm = query;
        this.currentPage = 1;
        this.applyFilterAndSort();
      });

    this.applyFilterAndSort();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data'] || changes['pageSize']) {
      this.applyFilterAndSort();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Manejador del input de búsqueda.
   */
  onSearchInput(event: any): void {
    const value = event.detail?.value ?? event.target?.value ?? '';
    this.searchSubject$.next(value);
  }

  /**
   * Limpia el campo de búsqueda.
   */
  clearSearch(): void {
    this.searchTerm = '';
    this.searchSubject$.next('');
  }

  /**
   * Aplica ordenación al hacer click en el encabezado de columna.
   */
  onSort(col: TableColumn<T>): void {
    if (!col.sortable) return;

    if (this.sortColumn === col.key) {
      if (this.sortDirection === 'asc') {
        this.sortDirection = 'desc';
      } else if (this.sortDirection === 'desc') {
        this.sortDirection = 'none';
        this.sortColumn = '';
      }
    } else {
      this.sortColumn = col.key;
      this.sortDirection = 'asc';
    }

    this.applyFilterAndSort();
  }

  /**
   * Filtra y ordena los datos en memoria.
   */
  private applyFilterAndSort(): void {
    let result = [...(this.data || [])];

    /** 1. Filtro de búsqueda */
    if (this.searchTerm.trim()) {
      const q = this.searchTerm.toLowerCase().trim();
      result = result.filter(item =>
        this.columns.some(col => {
          const val = this.getNestedValue(item, col.key);
          return val !== null && val !== undefined && String(val).toLowerCase().includes(q);
        })
      );
    }

    /** 2. Ordenación */
    if (this.sortColumn && this.sortDirection !== 'none') {
      const col = this.sortColumn;
      const factor = this.sortDirection === 'asc' ? 1 : -1;

      result.sort((a, b) => {
        const valA = this.getNestedValue(a, col);
        const valB = this.getNestedValue(b, col);

        if (valA === valB) return 0;
        if (valA === null || valA === undefined) return 1;
        if (valB === null || valB === undefined) return -1;

        if (typeof valA === 'number' && typeof valB === 'number') {
          return (valA - valB) * factor;
        }

        return String(valA).localeCompare(String(valB), 'es', { numeric: true }) * factor;
      });
    }

    this.filteredData = result;

    /** 3. Paginación */
    const totalPages = this.totalPages;
    if (this.currentPage > totalPages && totalPages > 0) {
      this.currentPage = totalPages;
    }

    const startIndex = (this.currentPage - 1) * this.pageSize;
    this.pagedData = this.filteredData.slice(startIndex, startIndex + this.pageSize);
  }

  /**
   * Accede a propiedades anidadas seguras (ej. 'client.name').
   */
  getNestedValue(obj: any, path: string): any {
    if (!obj || !path) return null;
    return path.split('.').reduce((acc, part) => (acc && acc[part] !== undefined ? acc[part] : null), obj);
  }

  /**
   * Cambia a una página específica.
   */
  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.applyFilterAndSort();
    }
  }

  /**
   * Cambia el tamaño de página.
   */
  onPageSizeChange(newSize: number): void {
    this.pageSize = newSize;
    this.currentPage = 1;
    this.applyFilterAndSort();
  }

  /**
   * Total de páginas disponibles.
   */
  get totalPages(): number {
    return Math.ceil(this.filteredData.length / this.pageSize) || 1;
  }

  /**
   * Índice inicial visible (1-indexed).
   */
  get startRecordIndex(): number {
    if (this.filteredData.length === 0) return 0;
    return (this.currentPage - 1) * this.pageSize + 1;
  }

  /**
   * Índice final visible.
   */
  get endRecordIndex(): number {
    const end = this.currentPage * this.pageSize;
    return end > this.filteredData.length ? this.filteredData.length : end;
  }

  /**
   * Selecciona / deselecciona una fila.
   */
  toggleRowSelection(row: T, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }

    if (this.selectedRows.has(row)) {
      this.selectedRows.delete(row);
    } else {
      this.selectedRows.add(row);
    }

    this.rowSelected.emit(row);
    this.selectionChange.emit(Array.from(this.selectedRows));
  }

  /**
   * Selecciona o deselecciona todas las filas de la página actual.
   */
  toggleSelectAll(): void {
    const allSelected = this.areAllPagedRowsSelected();
    if (allSelected) {
      this.pagedData.forEach(row => this.selectedRows.delete(row));
    } else {
      this.pagedData.forEach(row => this.selectedRows.add(row));
    }

    this.selectionChange.emit(Array.from(this.selectedRows));
  }

  /**
   * Comprueba si todas las filas de la página están seleccionadas.
   */
  areAllPagedRowsSelected(): boolean {
    if (this.pagedData.length === 0) return false;
    return this.pagedData.every(row => this.selectedRows.has(row));
  }

  /**
   * Comprueba si alguna fila de la página está seleccionada (indeterminada).
   */
  isIndeterminate(): boolean {
    const some = this.pagedData.some(row => this.selectedRows.has(row));
    return some && !this.areAllPagedRowsSelected();
  }

  /**
   * Dispara una acción en una fila.
   */
  triggerAction(actionId: string, row: T, event: Event): void {
    event.stopPropagation();
    this.actionTriggered.emit({ action: actionId, row });
  }

  /**
   * Emite evento de exportar CSV con los registros filtrados.
   */
  onExportCsv(): void {
    this.exportCsv.emit(this.filteredData);
  }

  /**
   * Retorna clase CSS según el mapa de badges.
   */
  getBadgeClass(col: TableColumn<T>, value: string): string {
    if (!col.badgeColorMap || !value) return 'badge-default';
    return col.badgeColorMap[value] || 'badge-default';
  }

  /**
   * Obtiene el identificador de fila para el tracking del bucle for.
   */
  getRowId(row: T, index: number): string | number {
    return row['id'] ?? index;
  }

  /**
   * Genera el aria-label accesible para el checkbox de la fila.
   */
  getRowAriaLabel(row: T, index: number): string {
    const name = row['title'] || row['name'] || row['id'] || (index + 1);
    return `Seleccionar fila ${name}`;
  }
}
