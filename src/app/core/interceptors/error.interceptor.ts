import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

/**
 * Interceptor funcional de gestión global de errores HTTP.
 *
 * Captura errores HTTP de las respuestas y aplica lógica
 * de manejo según el código de estado:
 *
 * - **401 Unauthorized**: Cierra sesión y redirige a login.
 * - **403 Forbidden**: Redirige a la página principal del usuario.
 * - **500+ Server Error**: Logea el error para debugging.
 *
 * @description
 * Este interceptor actúa como última línea de defensa en la cadena
 * de interceptores. Los errores se re-lanzan para que los componentes
 * puedan manejarlos también a nivel local si lo desean.
 *
 * @param {HttpRequest<unknown>} req - Petición HTTP original.
 * @param {HttpHandlerFn} next - Siguiente handler en la cadena.
 * @returns {Observable<HttpEvent<unknown>>} Observable que puede emitir un error tratado.
 *
 * @example
 * ```typescript
 * // En main.ts o app.config.ts
 * provideHttpClient(
 *   withInterceptors([authInterceptor, errorInterceptor])
 * )
 * ```
 */
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {

      /** Mensajes de error legibles para el usuario */
      let userMessage = 'Ha ocurrido un error inesperado. Inténtalo de nuevo.';

      switch (error.status) {
        case 0:
          userMessage = 'No se puede conectar con el servidor. Verifica tu conexión a internet.';
          console.error('[ErrorInterceptor] Error de conexión:', req.url);
          break;

        case 401:
          userMessage = 'Tu sesión ha expirado. Por favor, inicia sesión de nuevo.';
          console.warn('[ErrorInterceptor] 401 Unauthorized:', req.url);
          authService.logout();
          router.navigate(['/auth/login'], {
            queryParams: { sessionExpired: 'true' }
          });
          break;

        case 403:
          userMessage = 'No tienes permisos para acceder a este recurso.';
          console.warn('[ErrorInterceptor] 403 Forbidden:', req.url);
          router.navigate(['/records']);
          break;

        case 404:
          userMessage = 'El recurso solicitado no fue encontrado.';
          console.warn('[ErrorInterceptor] 404 Not Found:', req.url);
          break;

        case 422:
          userMessage = 'Los datos enviados no son válidos. Revisa el formulario.';
          console.warn('[ErrorInterceptor] 422 Unprocessable:', req.url);
          break;

        case 429:
          userMessage = 'Demasiadas solicitudes. Espera un momento e inténtalo de nuevo.';
          console.warn('[ErrorInterceptor] 429 Too Many Requests:', req.url);
          break;

        default:
          if (error.status >= 500) {
            userMessage = 'Error del servidor. Nuestro equipo ha sido notificado.';
            console.error('[ErrorInterceptor] Server Error:', error.status, req.url);
          }
          break;
      }

      /** Re-lanzar el error con mensaje user-friendly adjunto */
      return throwError(() => ({
        ...error,
        userMessage,
        originalUrl: req.url
      }));
    })
  );
};
