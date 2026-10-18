/**
 * @module UserModel
 * @description Modelo de datos para usuarios del sistema.
 * Define las interfaces para la autenticación y autorización
 * basada en roles (Administrador / Usuario Estándar).
 *
 * @remarks
 * Este modelo es utilizado por el AuthService, el NgRx AuthState
 * y los Guards de ruta para gestionar el acceso al sistema.
 */

/**
 * Roles disponibles en el sistema.
 *
 * @enum {string}
 * @property {string} ADMIN - Acceso completo: Dashboard, informes, CRUD y exportación.
 * @property {string} USER - Acceso limitado: visualización de registros y perfil propio.
 */
export enum UserRole {
  ADMIN = 'ADMIN',
  USER = 'USER'
}

/**
 * Interfaz que representa un usuario del sistema.
 *
 * @interface User
 * @property {string} id - Identificador único del usuario (UUID v4).
 * @property {string} email - Correo electrónico (único, usado como login).
 * @property {string} firstName - Nombre del usuario.
 * @property {string} lastName - Apellido del usuario.
 * @property {UserRole} role - Rol asignado al usuario.
 * @property {string} avatarUrl - URL del avatar del usuario.
 * @property {boolean} isActive - Indica si la cuenta está activa.
 * @property {string} createdAt - Fecha de creación de la cuenta (ISO 8601).
 * @property {string} lastLoginAt - Fecha del último inicio de sesión (ISO 8601).
 */
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  avatarUrl: string;
  isActive: boolean;
  createdAt: string;
  lastLoginAt: string;
}

/**
 * Credenciales de inicio de sesión.
 *
 * @interface LoginCredentials
 * @property {string} email - Correo electrónico del usuario.
 * @property {string} password - Contraseña del usuario.
 */
export interface LoginCredentials {
  email: string;
  password: string;
}

/**
 * Datos para el registro de un nuevo usuario.
 *
 * @interface RegisterData
 * @property {string} email - Correo electrónico (debe ser único en el sistema).
 * @property {string} password - Contraseña (mínimo 8 caracteres, 1 mayúscula, 1 número).
 * @property {string} confirmPassword - Confirmación de la contraseña.
 * @property {string} firstName - Nombre del usuario.
 * @property {string} lastName - Apellido del usuario.
 */
export interface RegisterData {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
}

/**
 * Respuesta del servidor tras una autenticación exitosa.
 *
 * @interface AuthResponse
 * @property {User} user - Datos del usuario autenticado.
 * @property {string} accessToken - Token JWT de acceso (mock).
 * @property {string} refreshToken - Token JWT de refresco (mock).
 * @property {number} expiresIn - Tiempo de expiración en segundos.
 */
export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

/**
 * Usuario extendido para persistencia de datos mock en desarrollo.
 */
export interface MockUserData extends User {
  password: string;
}
