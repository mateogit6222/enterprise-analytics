import { Pipe, PipeTransform } from '@angular/core';

/**
 * @pipe CurrencyFormatPipe
 * @description Pipe puro para formatear valores numéricos a formato de moneda con locale español/internacional.
 *
 * @example
 * ```html
 * <!-- Resultado: 1.250,50 € -->
 * {{ 1250.5 | currencyFormat }}
 *
 * <!-- Resultado: $ 1,250.50 -->
 * {{ 1250.5 | currencyFormat:'USD':'en-US' }}
 * ```
 */
@Pipe({
  name: 'currencyFormat',
  standalone: true,
  pure: true
})
export class CurrencyFormatPipe implements PipeTransform {

  /**
   * Transforma un valor numérico a una representación con formato de moneda.
   *
   * @param {number | string | null | undefined} value - Valor a formatear.
   * @param {string} [currency='EUR'] - Código de moneda ISO 4217 (EUR, USD, GBP, etc.).
   * @param {string} [locale='es-ES'] - Locale para el formateo numérico.
   * @param {number} [decimalDigits=2] - Número de decimales a mostrar.
   * @returns {string} Cadena formateada de moneda o '-' si el valor es nulo o inválido.
   */
  transform(
    value: number | string | null | undefined,
    currency: string = 'EUR',
    locale: string = 'es-ES',
    decimalDigits: number = 2
  ): string {
    if (value === null || value === undefined || value === '') {
      return '—';
    }

    const numericValue = typeof value === 'string' ? parseFloat(value) : value;

    if (isNaN(numericValue)) {
      return '—';
    }

    try {
      return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency,
        minimumFractionDigits: decimalDigits,
        maximumFractionDigits: decimalDigits
      }).format(numericValue);
    } catch (error) {
      console.warn(`[CurrencyFormatPipe] Error al formatear con currency "${currency}":`, error);
      return `${numericValue.toFixed(decimalDigits)} ${currency}`;
    }
  }
}
