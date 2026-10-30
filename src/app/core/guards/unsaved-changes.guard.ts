import { CanDeactivateFn } from '@angular/router';
import { Observable } from 'rxjs';

/**
 * Interfaz que deben implementar los componentes que contengan formularios
 * o estados mutables sujetos a confirmación antes de navegar fuera de la vista.
 */
export interface HasUnsavedChanges {
  /**
   * Determina si el componente contiene cambios no persistidos.
   * @returns `true` si hay cambios pendientes, `false` si es seguro navegar.
   */
  hasUnsavedChanges(): boolean | Observable<boolean>;
}

/**
 * Guard funcional `CanDeactivateFn` para prevenir la pérdida involuntaria de datos.
 *
 * Se ejecuta al intentar navegar fuera de una ruta activa si el componente
 * implementa la interfaz `HasUnsavedChanges`.
 */
export const unsavedChangesGuard: CanDeactivateFn<HasUnsavedChanges> = (
  component: HasUnsavedChanges
): boolean | Observable<boolean> => {
  if (!component || typeof component.hasUnsavedChanges !== 'function') {
    return true;
  }

  const hasChanges = component.hasUnsavedChanges();
  if (typeof hasChanges === 'boolean') {
    if (hasChanges) {
      return window.confirm(
        '⚠️ Tienes cambios pendientes sin guardar. ¿Estás seguro de que deseas salir y descartarlos?'
      );
    }
    return true;
  }

  // Si devuelve un Observable, mapeamos la confirmación
  return hasChanges;
};

