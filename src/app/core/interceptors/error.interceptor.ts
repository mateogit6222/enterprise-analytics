import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError, switchMap } from 'rxjs';
import { AuthService } from '../services/auth.service';

/**
 * Interceptor funcional de gestión global de errores HTTP y recuperación de sesión.
 *
 * Captura códigos de estado HTTP y aplica la política de seguridad correspondiente:
 * - **401 Unauthorized**: Intenta renovar el token mediante `authService.refreshToken()`.
 *   Si la renovación tiene éxito, clona la petición original con el nuevo `Bearer token`
 *   y la reintenta sin interrumpir la experiencia de usuario. Si falla la renovación,
 *   cierra la sesión y redirige a `/auth/login` con `returnUrl` y `sessionExpired=true`.
 * - **403 Forbidden**: Bloqueo de privilegios insuficientes; redirige al espacio seguro `/records`.
 * - **500+ Server Error**: Registro unificado para diagnóstico y telemetría.
 */
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // 1. Manejo reactivo de token expirado (401)
      if (error.status === 401) {
        // Evitar bucles infinitos si la petición fallida ya era de autenticación o refresh
        const isAuthRequest = req.url.includes('/auth/') || req.url.includes('users.mock.json');
        const hasRefreshToken = !!authService.getRefreshToken();

        if (!isAuthRequest && hasRefreshToken) {
          console.warn('[ErrorInterceptor] 401 detectado. Intentando renovación transparente via Refresh Token...');
          return authService.refreshToken().pipe(
            switchMap(response => {
              console.info('[ErrorInterceptor] Token renovado exitosamente. Reintentando petición original:', req.url);
              const retryReq = req.clone({
                setHeaders: {
                  Authorization: `Bearer ${response.accessToken}`
                }
              });
              return next(retryReq);
            }),
            catchError(refreshError => {
              console.error('[ErrorInterceptor] Falló la renovación del token. Sesión finalizada.', refreshError);
              authService.logout();
              router.navigate(['/auth/login'], {
                queryParams: { sessionExpired: 'true', returnUrl: router.url }
              });
              return throwError(() => refreshError);
            })
          );
        }

        // Si no se puede renovar o ya es una petición de autenticación
        authService.logout();
        router.navigate(['/auth/login'], {
          queryParams: { sessionExpired: 'true', returnUrl: router.url }
        });
      }

      // 2. Manejo de acceso no autorizado por rol/permisos (403 Forbidden)
      if (error.status === 403) {
        console.warn('[ErrorInterceptor] 403 Forbidden para recurso:', req.url);
        router.navigate(['/records'], {
          queryParams: { forbidden: 'insufficient_privileges' }
        });
      }

      let userMessage = 'Ha ocurrido un error inesperado. Inténtalo de nuevo.';
      switch (error.status) {
        case 0:
          userMessage = 'No se puede conectar con el servidor. Verifica tu conexión de red.';
          break;
        case 401:
          userMessage = 'Tu sesión ha expirado o no es válida. Por favor, identifícate de nuevo.';
          break;
        case 403:
          userMessage = 'Acceso denegado: tu rol actual no cuenta con los permisos necesarios.';
          break;
        case 404:
          userMessage = 'El recurso solicitado no fue encontrado en el servidor.';
          break;
        case 422:
          userMessage = 'Los datos enviados no superaron las validaciones requeridas.';
          break;
        case 429:
          userMessage = 'Demasiadas solicitudes simultáneas. Por favor, espera unos instantes.';
          break;
        default:
          if (error.status >= 500) {
            userMessage = 'Error interno en el servidor. El incidente ha quedado registrado.';
          }
          break;
      }

      return throwError(() => ({
        ...error,
        userMessage,
        originalUrl: req.url
      }));
    })
  );
};
