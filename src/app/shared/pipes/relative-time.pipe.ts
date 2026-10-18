import { Pipe, PipeTransform } from '@angular/core';

/**
 * @pipe RelativeTimePipe
 * @description Pipe puro para convertir marcas de tiempo o fechas a cadenas de tiempo relativo en español.
 *
 * @example
 * ```html
 * <!-- Resultado: "Hace 5 minutos", "Ayer", "Hace 3 días" -->
 * <span>{{ record.updatedAt | relativeTime }}</span>
 * ```
 */
@Pipe({
  name: 'relativeTime',
  standalone: true,
  pure: true
})
export class RelativeTimePipe implements PipeTransform {

  /**
   * Transforma una fecha a formato relativo respecto al momento actual.
   *
   * @param {string | Date | number | null | undefined} value - Fecha en formato ISO string, Date o timestamp.
   * @returns {string} Texto legible del tiempo transcurrido o '-' si la fecha no es válida.
   */
  transform(value: string | Date | number | null | undefined): string {
    if (!value) {
      return '—';
    }

    const date = typeof value === 'string' || typeof value === 'number' ? new Date(value) : value;

    if (isNaN(date.getTime())) {
      return '—';
    }

    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 0) {
      return 'En el futuro';
    }

    if (diffInSeconds < 30) {
      return 'Hace un momento';
    }

    if (diffInSeconds < 60) {
      return `Hace ${diffInSeconds} segundos`;
    }

    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes === 1) {
      return 'Hace 1 minuto';
    }
    if (diffInMinutes < 60) {
      return `Hace ${diffInMinutes} minutos`;
    }

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours === 1) {
      return 'Hace 1 hora';
    }
    if (diffInHours < 24) {
      return `Hace ${diffInHours} horas`;
    }

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) {
      return 'Ayer';
    }
    if (diffInDays < 7) {
      return `Hace ${diffInDays} días`;
    }

    const diffInWeeks = Math.floor(diffInDays / 7);
    if (diffInWeeks === 1) {
      return 'Hace 1 semana';
    }
    if (diffInWeeks < 4) {
      return `Hace ${diffInWeeks} semanas`;
    }

    const diffInMonths = Math.floor(diffInDays / 30);
    if (diffInMonths === 1) {
      return 'Hace 1 mes';
    }
    if (diffInMonths < 12) {
      return `Hace ${diffInMonths} meses`;
    }

    const diffInYears = Math.floor(diffInDays / 365);
    if (diffInYears === 1) {
      return 'Hace 1 año';
    }
    return `Hace ${diffInYears} años`;
  }
}
