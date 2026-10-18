/**
 * @module KpiModel
 * @description Modelo de datos para los Indicadores Clave de Rendimiento (KPIs).
 * Utilizado por el Dashboard del Administrador para mostrar métricas
 * en tiempo real a través de widgets estadísticos y gráficos.
 *
 * @remarks
 * Los KPIs se calculan combinando datos de las dos fuentes
 * (REST API + Firestore mock) mediante orquestación con `forkJoin`.
 */

/**
 * Dirección de la tendencia de un KPI.
 *
 * @enum {string}
 * @property {string} UP - Tendencia al alza (positiva).
 * @property {string} DOWN - Tendencia a la baja (negativa o preocupante).
 * @property {string} STABLE - Sin cambios significativos.
 */
export enum KpiTrend {
  UP = 'UP',
  DOWN = 'DOWN',
  STABLE = 'STABLE'
}

/**
 * Interfaz para un indicador KPI individual.
 *
 * @interface Kpi
 * @property {string} id - Identificador único del KPI.
 * @property {string} label - Nombre legible del indicador (ej. 'Ingresos Totales').
 * @property {number} value - Valor numérico actual.
 * @property {number} previousValue - Valor del período anterior (para comparación).
 * @property {string} unit - Unidad de medida ('EUR', '%', 'units', etc.).
 * @property {KpiTrend} trend - Dirección de la tendencia.
 * @property {number} changePercent - Porcentaje de cambio respecto al período anterior.
 * @property {string} icon - Nombre del icono de Ionicons a mostrar.
 * @property {string} color - Color temático del widget (CSS variable o hex).
 */
export interface Kpi {
  id: string;
  label: string;
  value: number;
  previousValue: number;
  unit: string;
  trend: KpiTrend;
  changePercent: number;
  icon: string;
  color: string;
}

/**
 * Datos de un punto en una serie temporal (para gráficos).
 *
 * @interface ChartDataPoint
 * @property {string} label - Etiqueta del eje X (ej. 'Enero 2026').
 * @property {number} value - Valor del eje Y.
 */
export interface ChartDataPoint {
  label: string;
  value: number;
}

/**
 * Serie completa de datos para un gráfico Chart.js.
 *
 * @interface ChartSeries
 * @property {string} name - Nombre de la serie (ej. 'Ventas Q1').
 * @property {ChartDataPoint[]} data - Puntos de datos de la serie.
 * @property {string} color - Color de la línea o barra.
 */
export interface ChartSeries {
  name: string;
  data: ChartDataPoint[];
  color: string;
}

/**
 * Resumen del dashboard con todas las métricas.
 *
 * @interface DashboardSummary
 * @property {Kpi[]} kpis - Lista de KPIs principales.
 * @property {ChartSeries[]} salesChart - Datos del gráfico de ventas.
 * @property {ChartSeries[]} revenueChart - Datos del gráfico de ingresos.
 * @property {string} lastUpdated - Timestamp de la última actualización.
 */
export interface DashboardSummary {
  kpis: Kpi[];
  salesChart: ChartSeries[];
  revenueChart: ChartSeries[];
  lastUpdated: string;
}
