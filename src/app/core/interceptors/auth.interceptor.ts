import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

/**
 * Interceptor funcional de autenticación HTTP.
 *
 * Inyecta automáticamente el token JWT de acceso en el header
 * `Authorization` de todas las peticiones HTTP salientes.
 *
 * @description
 * Implementado como `HttpInterceptorFn` (patrón funcional de Angular 15+).
 * Solo inyecta el token si hay una sesión activa (token disponible).
 * Las peticiones a recursos estáticos (assets) no se interceptan.
 *
 * @param {HttpRequest<unknown>} req - Petición HTTP original.
 * @param {HttpHandlerFn} next - Siguiente handler en la cadena.
 * @returns {Observable<HttpEvent<unknown>>} Petición modificada con el header Authorization.
 *
 * @example
 * ```typescript
 * // En main.ts o app.config.ts
 * provideHttpClient(
 *   withInterceptors([authInterceptor])
 * )
 * ```
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getAccessToken();

  /** No interceptar peticiones a recursos estáticos */
  if (req.url.includes('assets/')) {
    return next(req);
  }

  /** Si hay token, clonar la petición con el header Authorization */
  if (token) {
    const clonedReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    return next(clonedReq);
  }

  return next(req);
};
