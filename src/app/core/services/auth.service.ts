import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of, throwError, timer } from 'rxjs';
import { map, switchMap, tap, catchError, delay, take } from 'rxjs/operators';
import {
  User,
  UserRole,
  LoginCredentials,
  RegisterData,
  AuthResponse,
  MockUserData
} from '../models/user.model';
import { FALLBACK_USERS } from '../models/mock-datasets';
import { sha256, verifyPasswordHash } from '../utils/crypto.util';

/**
 * Token key para almacenamiento local.
 * @constant
 */
const STORAGE_KEYS = {
  ACCESS_TOKEN: 'ea_access_token',
  REFRESH_TOKEN: 'ea_refresh_token',
  CURRENT_USER: 'ea_current_user'
} as const;

/**
 * @class AuthService
 * @description Servicio singleton de autenticación y autorización.
 *
 * Gestiona el ciclo completo de autenticación:
 * - Login con credenciales contra datos mock (simula API REST).
 * - Registro de nuevos usuarios con validación de email único.
 * - Gestión de tokens JWT mock (access + refresh).
 * - Persistencia de sesión en localStorage.
 * - Emisión reactiva del estado de autenticación via BehaviorSubject.
 *
 * @remarks
 * Todos los datos son sintéticos y simulados localmente.
 * No se realizan llamadas HTTP reales a servicios externos.
 * El delay artificial simula latencia de red realista.
 *
 * @example
 * ```typescript
 * // En un componente
 * constructor(private authService: AuthService) {
 *   this.authService.currentUser$.subscribe(user => {
 *     console.log('Usuario actual:', user);
 *   });
 * }
 * ```
 */
@Injectable({
  providedIn: 'root'
})
export class AuthService {

  /** @private Inyección del HttpClient para cargar datos mock */
  private readonly http = inject(HttpClient);

  /** @private Cache de usuarios mock cargados desde JSON */
  private mockUsers: MockUserData[] = [...FALLBACK_USERS];

  /** @private Indica si los datos mock ya fueron cargados */
  private mockDataLoaded = true;

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

  /**
   * Observable público del usuario actual.
   * Emite `null` cuando no hay sesión activa.
   *
   * @type {Observable<User | null>}
   */
  readonly currentUser$: Observable<User | null> = this.currentUserSubject.asObservable();

  /**
   * Observable público del estado de carga.
   *
   * @type {Observable<boolean>}
   */
  readonly isLoading$: Observable<boolean> = this.isLoadingSubject.asObservable();

  /**
   * Observable derivado que indica si el usuario está autenticado.
   *
   * @type {Observable<boolean>}
   */
  readonly isAuthenticated$: Observable<boolean> = this.currentUser$.pipe(
    map(user => !!user)
  );

  /**
   * Observable derivado que indica si el usuario tiene rol ADMIN.
   *
   * @type {Observable<boolean>}
   */
  readonly isAdmin$: Observable<boolean> = this.currentUser$.pipe(
    map(user => user?.role === UserRole.ADMIN)
  );

  /**
   * Carga los datos mock de usuarios desde el archivo JSON.
   * Solo carga una vez (lazy loading con cache).
   *
   * @private
   * @returns {Observable<MockUserData[]>} Lista de usuarios mock.
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
   * Genera un token JWT mock (base64 codificado, no criptográficamente seguro).
   *
   * @private
   * @param {User} user - Usuario para el cual generar el token.
   * @param {'access' | 'refresh'} type - Tipo de token.
   * @returns {string} Token JWT mock.
   */
  private generateMockToken(user: User, type: 'access' | 'refresh'): string {
    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const now = Math.floor(Date.now() / 1000);
    const payload = btoa(JSON.stringify({
      sub: user.id,
      email: user.email,
      role: user.role,
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
   * @throws {Error} Si las credenciales son inválidas o la cuenta está inactiva.
   *
   * @example
   * ```typescript
   * this.authService.login({ email: 'admin@enterprise.com', password: 'Admin2026!' })
   *   .subscribe({
   *     next: (response) => console.log('Login exitoso', response.user),
   *     error: (err) => console.error('Error de login', err.message)
   *   });
   * ```
   */
  login(credentials: LoginCredentials): Observable<AuthResponse> {
    this.isLoadingSubject.next(true);

    return this.loadMockUsers().pipe(
      /** Simula latencia de red ultrarrápida */
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

        /** Extraemos los campos sensibles antes de guardar la sesión */
        const { password, passwordHash, ...safeUser } = user;

        /** Actualizamos lastLoginAt */
        const loggedInUser: User = {
          ...safeUser,
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

        /** Persistir en localStorage */
        this.storeSession(response);

        /** Emitir usuario en el BehaviorSubject */
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
   * Registra un nuevo usuario en el sistema.
   *
   * @param {RegisterData} data - Datos de registro del nuevo usuario.
   * @returns {Observable<AuthResponse>} Respuesta con el usuario creado y tokens.
   * @throws {Error} Si el email ya existe en el sistema.
   *
   * @example
   * ```typescript
   * this.authService.register({
   *   email: 'nuevo@enterprise.com',
   *   password: 'Segura2026!',
   *   confirmPassword: 'Segura2026!',
   *   firstName: 'Ana',
   *   lastName: 'Torres'
   * }).subscribe({
   *   next: (response) => console.log('Registro exitoso'),
   *   error: (err) => console.error(err.message)
   * });
   * ```
   */
  register(data: RegisterData): Observable<AuthResponse> {
    this.isLoadingSubject.next(true);

    return this.loadMockUsers().pipe(
      delay(1000 + Math.random() * 500),
      switchMap(users => {
        /** Verificar que el email no existe */
        const exists = users.some(
          u => u.email.toLowerCase() === data.email.toLowerCase()
        );

        if (exists) {
          return throwError(() => new Error(
            'Este email ya está registrado en el sistema.'
          ));
        }

        /** Crear el nuevo usuario */
        const newUser: User = {
          id: crypto.randomUUID(),
          email: data.email,
          firstName: data.firstName,
          lastName: data.lastName,
          role: UserRole.USER,
          avatarUrl: `https://api.dicebear.com/9.x/initials/svg?seed=${data.firstName[0]}${data.lastName[0]}&backgroundColor=6366f1`,
          isActive: true,
          createdAt: new Date().toISOString(),
          lastLoginAt: new Date().toISOString()
        };

        /** Agregar a la lista mock en memoria con hash seguro */
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
   * Verifica si un email ya está registrado en el sistema.
   * Diseñado para ser usado como validador asíncrono en formularios reactivos.
   *
   * @param {string} email - Email a verificar.
   * @returns {Observable<boolean>} `true` si el email ya existe, `false` si está disponible.
   *
   * @example
   * ```typescript
   * // Como validador asíncrono en un FormControl
   * emailControl = new FormControl('', [], [
   *   (control) => this.authService.checkEmailExists(control.value).pipe(
   *     map(exists => exists ? { emailTaken: true } : null)
   *   )
   * ]);
   * ```
   */
  checkEmailExists(email: string): Observable<boolean> {
    return this.loadMockUsers().pipe(
      delay(500 + Math.random() * 300),
      map(users => users.some(
        u => u.email.toLowerCase() === email.toLowerCase()
      ))
    );
  }

  /**
   * Cierra la sesión actual: limpia tokens, storage y emite null.
   *
   * @returns {void}
   */
  logout(): void {
    localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    this.currentUserSubject.next(null);
  }

  /**
   * Obtiene el token de acceso actual del storage.
   *
   * @returns {string | null} Token de acceso o null si no hay sesión.
   */
  getAccessToken(): string | null {
    return localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
  }

  /**
   * Obtiene el usuario actual de forma síncrona (snapshot).
   *
   * @returns {User | null} Usuario actual o null.
   */
  getCurrentUser(): User | null {
    return this.currentUserSubject.getValue();
  }

  /**
   * Verifica si el usuario actual tiene un rol específico.
   *
   * @param {UserRole} role - Rol a verificar.
   * @returns {boolean} `true` si el usuario tiene el rol indicado.
   */
  hasRole(role: UserRole): boolean {
    const user = this.getCurrentUser();
    return user?.role === role;
  }

  /**
   * Persiste la sesión en localStorage.
   *
   * @private
   * @param {AuthResponse} response - Respuesta de autenticación a almacenar.
   */
  private storeSession(response: AuthResponse): void {
    localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, response.accessToken);
    localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, response.refreshToken);
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(response.user));
  }

  /**
   * Recupera el usuario almacenado en localStorage.
   *
   * @private
   * @returns {User | null} Usuario almacenado o null si no hay sesión guardada.
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
