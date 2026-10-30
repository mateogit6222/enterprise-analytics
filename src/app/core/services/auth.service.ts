import { Injectable, inject, computed } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of, throwError, timer } from 'rxjs';
import { map, switchMap, tap, catchError, delay, take } from 'rxjs/operators';
import {
  User,
  UserRole,
  LoginCredentials,
  RegisterData,
  AuthResponse,
  MockUserData,
  Permission,
  ROLE_PERMISSIONS,
  JwtPayload
} from '../models/user.model';
import { FALLBACK_USERS } from '../models/mock-datasets';
import { sha256, verifyPasswordHash } from '../utils/crypto.util';

/**
 * Claves de almacenamiento para tokens y sesión en localStorage.
 * @constant
 */
export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'ea_access_token',
  REFRESH_TOKEN: 'ea_refresh_token',
  CURRENT_USER: 'ea_current_user'
} as const;

/**
 * @class AuthService
 * @description Servicio singleton de autenticación y autorización RBAC (Role-Based Access Control).
 *
 * Implementa:
 * - Login con credenciales contra base de datos / mock seguro (hash SHA-256).
 * - Generación e inspección de tokens JWT simulados (RFC 7519) con claims `sub`, `email`, `role`, `permissions`.
 * - Renovación reactiva de tokens (`refreshToken()`) para tolerancia a fallos 401.
 * - Gestión reactiva híbrida mediante RxJS (`currentUser$`, `isAuthenticated$`) y Angular Signals
 *   (`currentUserSignal`, `userRoleSignal`, `userPermissionsSignal`, `isAuthenticatedSignal`, `isAdminSignal`).
 * - Métodos de autorización granular: `hasRole()` y `hasPermission()`.
 */
@Injectable({
  providedIn: 'root'
})
export class AuthService {

  /** @private Inyección del HttpClient para cargar datos mock o sincronizaciones */
  private readonly http = inject(HttpClient);

  /** @private Cache de usuarios mock cargados desde JSON */
  private mockUsers: MockUserData[] = [...FALLBACK_USERS];

  /** @private Indica si los datos mock ya fueron cargados */
  private mockDataLoaded = true;

  /**
   * BehaviorSubject que emite el usuario actual o null si no hay sesión.
   * @private
   */
  private readonly currentUserSubject = new BehaviorSubject<User | null>(
    this.getStoredUser()
  );

  /**
   * BehaviorSubject que emite el estado de carga de la autenticación.
   * @private
   */
  private readonly isLoadingSubject = new BehaviorSubject<boolean>(false);

  // -------------------------------------------------------------------------
  // OBSERVABLES REACTIVOS (RxJS)
  // -------------------------------------------------------------------------

  /**
   * Observable público del usuario actual.
   * Emite `null` cuando no hay sesión activa.
   */
  readonly currentUser$: Observable<User | null> = this.currentUserSubject.asObservable();

  /**
   * Observable público del estado de carga.
   */
  readonly isLoading$: Observable<boolean> = this.isLoadingSubject.asObservable();

  /**
   * Observable derivado que indica si el usuario está autenticado.
   */
  readonly isAuthenticated$: Observable<boolean> = this.currentUser$.pipe(
    map(user => !!user)
  );

  /**
   * Observable derivado que indica si el usuario tiene rol ADMIN.
   */
  readonly isAdmin$: Observable<boolean> = this.currentUser$.pipe(
    map(user => user?.role === UserRole.ADMIN)
  );

  // -------------------------------------------------------------------------
  // ANGULAR SIGNALS (Reactivity Model Moderno Angular 22)
  // -------------------------------------------------------------------------

  /**
   * Señal reactiva del usuario actual con sincronización automática desde RxJS.
   */
  readonly currentUserSignal = toSignal(this.currentUser$, {
    initialValue: this.getStoredUser()
  });

  /**
   * Señal computada del rol del usuario autenticado.
   */
  readonly userRoleSignal = computed<UserRole | null>(() => {
    return this.currentUserSignal()?.role ?? null;
  });

  /**
   * Señal computada del conjunto de permisos del usuario autenticado.
   */
  readonly userPermissionsSignal = computed<readonly Permission[]>(() => {
    const role = this.userRoleSignal();
    return role ? ROLE_PERMISSIONS[role] : [];
  });

  /**
   * Señal computada que indica si hay una sesión activa válida.
   */
  readonly isAuthenticatedSignal = computed<boolean>(() => {
    return !!this.currentUserSignal();
  });

  /**
   * Señal computada que indica si el usuario activo tiene privilegios de ADMIN.
   */
  readonly isAdminSignal = computed<boolean>(() => {
    return this.userRoleSignal() === UserRole.ADMIN;
  });

  constructor() {
    // Sincronización en segundo plano con el archivo JSON si está disponible
    this.http.get<MockUserData[]>('assets/mock-data/users.mock.json').pipe(
      catchError(() => this.http.get<MockUserData[]>('/assets/mock-data/users.mock.json')),
      catchError(() => of([] as MockUserData[])),
      take(1)
    ).subscribe((users: MockUserData[]) => {
      if (users && users.length > 0) {
        this.mockUsers = users;
      }
    });
  }

  /**
   * Carga los datos mock de usuarios desde el archivo JSON si aún no se han cargado.
   * @private
   */
  private loadMockUsers(): Observable<MockUserData[]> {
    if (this.mockDataLoaded) {
      return of(this.mockUsers);
    }

    return this.http.get<MockUserData[]>('assets/mock-data/users.mock.json').pipe(
      catchError(() => this.http.get<MockUserData[]>('/assets/mock-data/users.mock.json')),
      tap(users => {
        this.mockUsers = users || [];
        this.mockDataLoaded = true;
      }),
      catchError(() => {
        console.error('[AuthService] Error al cargar datos mock de usuarios');
        return of([]);
      })
    );
  }

  /**
   * Decodifica un token JWT estructurado según el estándar RFC 7519.
   *
   * @param {string} token - Token JWT en formato header.payload.signature
   * @returns {JwtPayload | null} Payload deserializado o null si el token es inválido o corrupto.
   */
  decodeToken(token: string): JwtPayload | null {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        return null;
      }
      const base64Url = parts[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload) as JwtPayload;
    } catch {
      try {
        const parts = token.split('.');
        if (parts.length === 3) {
          return JSON.parse(atob(parts[1])) as JwtPayload;
        }
      } catch {
        // Ignorar fallos de decodificación
      }
      return null;
    }
  }

  /**
   * Genera un token JWT mock estructurado con cabecera HS256 y payload RFC 7519.
   *
   * @private
   * @param {User} user - Usuario para el cual generar el token.
   * @param {'access' | 'refresh'} type - Tipo de token ('access' de 1h o 'refresh' de 24h).
   * @returns {string} Token JWT mock.
   */
  private generateMockToken(user: User, type: 'access' | 'refresh'): string {
    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const now = Math.floor(Date.now() / 1000);
    const permissions = ROLE_PERMISSIONS[user.role] || [];
    const payload = btoa(JSON.stringify({
      sub: user.id,
      email: user.email,
      role: user.role,
      permissions,
      type,
      iat: now,
      exp: now + (type === 'access' ? 3600 : 86400)
    }));
    const signature = btoa(`mock_signature_${user.id}_${type}`);
    return `${header}.${payload}.${signature}`;
  }

  /**
   * Inicia sesión con las credenciales proporcionadas.
   *
   * @param {LoginCredentials} credentials - Email y contraseña del usuario.
   * @returns {Observable<AuthResponse>} Respuesta con usuario y tokens.
   */
  login(credentials: LoginCredentials): Observable<AuthResponse> {
    this.isLoadingSubject.next(true);

    return this.loadMockUsers().pipe(
      delay(100),
      switchMap(users => {
        const user = users.find(
          u => u.email.toLowerCase() === credentials.email.toLowerCase()
            && (
              verifyPasswordHash(credentials.password, u.passwordHash) ||
              (u.password && u.password === credentials.password)
            )
        );

        if (!user) {
          return throwError(() => new Error(
            'Credenciales incorrectas. Verifica tu email y contraseña.'
          ));
        }

        if (!user.isActive) {
          return throwError(() => new Error(
            'Esta cuenta está desactivada. Contacta con el administrador.'
          ));
        }

        const { password, passwordHash, ...safeUser } = user;

        const loggedInUser: User = {
          ...safeUser,
          permissions: ROLE_PERMISSIONS[safeUser.role],
          lastLoginAt: new Date().toISOString()
        };

        const accessToken = this.generateMockToken(loggedInUser, 'access');
        const refreshToken = this.generateMockToken(loggedInUser, 'refresh');

        const response: AuthResponse = {
          user: loggedInUser,
          accessToken,
          refreshToken,
          expiresIn: 3600
        };

        this.storeSession(response);
        this.currentUserSubject.next(loggedInUser);

        return of(response);
      }),
      tap(() => this.isLoadingSubject.next(false)),
      catchError(error => {
        this.isLoadingSubject.next(false);
        return throwError(() => error);
      })
    );
  }

  /**
   * Registra un nuevo usuario en el sistema con rol USER por defecto.
   *
   * @param {RegisterData} data - Datos de registro del nuevo usuario.
   * @returns {Observable<AuthResponse>} Respuesta con el usuario creado y tokens.
   */
  register(data: RegisterData): Observable<AuthResponse> {
    this.isLoadingSubject.next(true);

    return this.loadMockUsers().pipe(
      delay(300),
      switchMap(users => {
        const exists = users.some(
          u => u.email.toLowerCase() === data.email.toLowerCase()
        );

        if (exists) {
          return throwError(() => new Error(
            'Este email ya está registrado en el sistema.'
          ));
        }

        const newUser: User = {
          id: crypto.randomUUID(),
          email: data.email,
          firstName: data.firstName,
          lastName: data.lastName,
          role: UserRole.USER,
          permissions: ROLE_PERMISSIONS[UserRole.USER],
          avatarUrl: `https://api.dicebear.com/9.x/initials/svg?seed=${data.firstName[0]}${data.lastName[0]}&backgroundColor=6366f1`,
          isActive: true,
          createdAt: new Date().toISOString(),
          lastLoginAt: new Date().toISOString()
        };

        this.mockUsers.push({ ...newUser, passwordHash: sha256(data.password) } as MockUserData);

        const accessToken = this.generateMockToken(newUser, 'access');
        const refreshToken = this.generateMockToken(newUser, 'refresh');

        const response: AuthResponse = {
          user: newUser,
          accessToken,
          refreshToken,
          expiresIn: 3600
        };

        this.storeSession(response);
        this.currentUserSubject.next(newUser);

        return of(response);
      }),
      tap(() => this.isLoadingSubject.next(false)),
      catchError(error => {
        this.isLoadingSubject.next(false);
        return throwError(() => error);
      })
    );
  }

  /**
   * Renueva el Access Token utilizando el Refresh Token almacenado.
   * Permite reintentar de forma transparente las peticiones que retornen HTTP 401.
   *
   * @returns {Observable<AuthResponse>} Nueva sesión con tokens actualizados.
   */
  refreshToken(): Observable<AuthResponse> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      this.logout();
      return throwError(() => new Error('No refresh token available'));
    }

    const payload = this.decodeToken(refreshToken);
    const now = Math.floor(Date.now() / 1000);

    if (!payload || payload.exp < now || payload.type !== 'refresh') {
      this.logout();
      return throwError(() => new Error('Refresh token invalid or expired'));
    }

    const currentUser = this.getCurrentUser();
    const user: User = currentUser ?? {
      id: payload.sub,
      email: payload.email,
      firstName: 'Usuario',
      lastName: 'Sesión',
      role: (payload.role as UserRole) || UserRole.USER,
      permissions: ROLE_PERMISSIONS[(payload.role as UserRole) || UserRole.USER],
      avatarUrl: `https://api.dicebear.com/9.x/initials/svg?seed=${payload.email}&backgroundColor=6366f1`,
      isActive: true,
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString()
    };

    const newAccessToken = this.generateMockToken(user, 'access');
    const newRefreshToken = this.generateMockToken(user, 'refresh');

    const response: AuthResponse = {
      user,
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      expiresIn: 3600
    };

    this.storeSession(response);
    this.currentUserSubject.next(user);

    return of(response).pipe(delay(50));
  }

  /**
   * Verifica si un email ya está registrado en el sistema (asynchronous validator).
   */
  checkEmailExists(email: string): Observable<boolean> {
    return this.loadMockUsers().pipe(
      delay(200),
      map(users => users.some(
        u => u.email.toLowerCase() === email.toLowerCase()
      ))
    );
  }

  /**
   * Cierra la sesión actual: elimina tokens y emite null.
   */
  logout(): void {
    localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    this.currentUserSubject.next(null);
  }

  /**
   * Obtiene el token de acceso actual del storage.
   */
  getAccessToken(): string | null {
    return localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
  }

  /**
   * Obtiene el token de refresco del storage.
   */
  getRefreshToken(): string | null {
    return localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
  }

  /**
   * Obtiene el usuario actual de forma síncrona (snapshot).
   */
  getCurrentUser(): User | null {
    return this.currentUserSubject.getValue();
  }

  /**
   * Comprueba si el usuario autenticado posee uno o varios roles requeridos.
   *
   * @param {UserRole | UserRole[]} roles - Rol o array de roles autorizados.
   * @returns {boolean} `true` si el usuario posee al menos uno de los roles.
   */
  hasRole(roles: UserRole | readonly UserRole[] | UserRole[]): boolean {
    const user = this.getCurrentUser();
    if (!user) {
      return false;
    }
    const roleList = Array.isArray(roles) ? roles : [roles];
    return roleList.includes(user.role);
  }

  /**
   * Comprueba si el usuario autenticado cuenta con todos los permisos requeridos (RBAC granular).
   *
   * @param {Permission | Permission[]} permissions - Permiso o array de permisos necesarios.
   * @returns {boolean} `true` si el usuario tiene todos los permisos especificados.
   */
  hasPermission(permissions: Permission | readonly Permission[] | Permission[]): boolean {
    const user = this.getCurrentUser();
    if (!user) {
      return false;
    }
    const userPerms: readonly Permission[] = ROLE_PERMISSIONS[user.role] || [];
    const permList: readonly Permission[] = Array.isArray(permissions) ? permissions : [permissions as Permission];
    return permList.every(p => userPerms.includes(p));
  }

  /**
   * Persiste la sesión en localStorage.
   * @private
   */
  private storeSession(response: AuthResponse): void {
    localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, response.accessToken);
    localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, response.refreshToken);
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(response.user));
  }

  /**
   * Recupera el usuario almacenado en localStorage.
   * @private
   */
  private getStoredUser(): User | null {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
      return stored ? JSON.parse(stored) as User : null;
    } catch {
      return null;
    }
  }
}
