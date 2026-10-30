/**
 * @module UserModel
 * @description Modelo de datos para usuarios del sistema.
 * Define las interfaces para la autenticación y autorización
 * basada en roles (RBAC - Role-Based Access Control).
 *
 * @remarks
 * Este modelo es utilizado por el AuthService, el NgRx AuthState,
 * los Guards funcionales de ruta y las directivas de control de acceso.
 */

/**
 * Roles disponibles en el sistema con jerarquía de privilegios.
 *
 * @enum {string}
 * @property {string} ADMIN - Control Total: Dashboard analítico, CRUD de registros, generador de informes PDF/CSV, administración de roles.
 * @property {string} USER - Operativa Estándar: Consulta y edición de registros, centro de ayuda contextual y perfil propio.
 */
export enum UserRole {
  ADMIN = 'ADMIN',
  USER = 'USER'
}

/**
 * Catálogo granular de permisos del sistema para el modelo formal RBAC.
 *
 * @enum {string}
 */
export enum Permission {
  VIEW_DASHBOARD = 'VIEW_DASHBOARD',
  VIEW_RECORDS = 'VIEW_RECORDS',
  CREATE_RECORDS = 'CREATE_RECORDS',
  EDIT_RECORDS = 'EDIT_RECORDS',
  DELETE_RECORDS = 'DELETE_RECORDS',
  VIEW_REPORTS = 'VIEW_REPORTS',
  EXPORT_REPORTS = 'EXPORT_REPORTS',
  MANAGE_USERS = 'MANAGE_USERS',
  ACCESS_HELP = 'ACCESS_HELP',
  ACCESS_PROFILE = 'ACCESS_PROFILE'
}

/**
 * Matriz canónica de asignación de permisos por rol (Role-to-Permissions Mapping).
 */
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  [UserRole.ADMIN]: [
    Permission.VIEW_DASHBOARD,
    Permission.VIEW_RECORDS,
    Permission.CREATE_RECORDS,
    Permission.EDIT_RECORDS,
    Permission.DELETE_RECORDS,
    Permission.VIEW_REPORTS,
    Permission.EXPORT_REPORTS,
    Permission.MANAGE_USERS,
    Permission.ACCESS_HELP,
    Permission.ACCESS_PROFILE
  ],
  [UserRole.USER]: [
    Permission.VIEW_RECORDS,
    Permission.CREATE_RECORDS,
    Permission.EDIT_RECORDS,
    Permission.ACCESS_HELP,
    Permission.ACCESS_PROFILE
  ]
};

/**
 * Payload formal simulado del token JWT con claims estándar RFC 7519 y claims de autorización.
 *
 * @interface JwtPayload
 * @property {string} sub - Subject identifier (ID único del usuario).
 * @property {string} email - Dirección de correo electrónico del usuario.
 * @property {UserRole} role - Rol principal asignado (claim de rol).
 * @property {Permission[]} permissions - Permisos granulares asignados en el momento de emisión.
 * @property {'access' | 'refresh'} type - Propósito del token (acceso vs refresco).
 * @property {number} iat - Timestamp de emisión (Issued At).
 * @property {number} exp - Timestamp de expiración (Expiration Time).
 */
export interface JwtPayload {
  sub: string;
  email: string;
  role: UserRole;
  permissions: Permission[];
  type: 'access' | 'refresh';
  iat: number;
  exp: number;
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
 * @property {Permission[]} permissions - Conjunto granular de permisos del usuario.
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
  permissions?: Permission[];
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
 * @property {string} password - Contraseña del usuario en texto plano ingresada en formulario.
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
 * @property {User} user - Datos del usuario autenticado con permisos adjuntos.
 * @property {string} accessToken - Token JWT de acceso con claims de autorización.
 * @property {string} refreshToken - Token JWT de refresco con mayor vida útil.
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
 * Utiliza passwordHash (SHA-256) en lugar de contraseñas en texto plano
 * para cumplir estándares de seguridad y evitar alertas de GitGuardian.
 */
export interface MockUserData extends User {
  passwordHash?: string;
  password?: string;
}
