import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { User, LoginCredentials, RegisterData, AuthResponse } from '../../core/models/user.model';

/**
 * @description Grupo de acciones NgRx para la gestión de autenticación.
 *
 * Sigue el patrón de acciones agrupadas de NgRx 15+ con `createActionGroup`,
 * que genera automáticamente los tipos de acción siguiendo la convención
 * `[Source] Event Name`.
 *
 * @remarks
 * Se definen tres flujos principales:
 * - **Login**: Login → Login Success / Login Failure
 * - **Register**: Register → Register Success / Register Failure
 * - **Logout**: Logout (sin efectos secundarios asíncronos)
 */
export const AuthActions = createActionGroup({
  source: 'Auth',
  events: {
    /**
     * Inicia el proceso de login con credenciales.
     * @param {LoginCredentials} credentials - Email y contraseña.
     */
    'Login': props<{ credentials: LoginCredentials }>(),

    /**
     * Login completado con éxito.
     * @param {AuthResponse} response - Respuesta con usuario y tokens.
     */
    'Login Success': props<{ response: AuthResponse }>(),

    /**
     * Login fallido.
     * @param {string} error - Mensaje de error descriptivo.
     */
    'Login Failure': props<{ error: string }>(),

    /**
     * Inicia el proceso de registro de un nuevo usuario.
     * @param {RegisterData} data - Datos del formulario de registro.
     */
    'Register': props<{ data: RegisterData }>(),

    /**
     * Registro completado con éxito.
     * @param {AuthResponse} response - Respuesta con usuario creado y tokens.
     */
    'Register Success': props<{ response: AuthResponse }>(),

    /**
     * Registro fallido.
     * @param {string} error - Mensaje de error descriptivo.
     */
    'Register Failure': props<{ error: string }>(),

    /**
     * Cierra la sesión del usuario actual.
     */
    'Logout': emptyProps(),

    /**
     * Limpia cualquier mensaje de error del estado.
     */
    'Clear Error': emptyProps(),

    /**
     * Restaura la sesión desde localStorage al iniciar la aplicación.
     * @param {User} user - Usuario recuperado del storage.
     */
    'Restore Session': props<{ user: User }>()
  }
});
