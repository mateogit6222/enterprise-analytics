# 📊 Enterprise Analytics — Plataforma de Gestión y Analítica Empresarial

[![Angular](https://img.shields.io/badge/Angular-22.1%20Standalone-DD0031?style=for-the-badge&logo=angular&logoColor=white)](https://angular.dev/)
[![Ionic](https://img.shields.io/badge/Ionic-9.0%20Pure-3880FF?style=for-the-badge&logo=ionic&logoColor=white)](https://ionicframework.com/)
[![NgRx](https://img.shields.io/badge/NgRx-Store%2022-BA68C8?style=for-the-badge&logo=ngrx&logoColor=white)](https://ngrx.io/)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)
[![WCAG AAA](https://img.shields.io/badge/Accessibility-WCAG%202.1%20AAA-blue?style=for-the-badge)](https://www.w3.org/WAI/WCAG21/quickref/)

> Sistema corporativo integral de gestión, monitorización analítica y reporting empresarial multiplataforma (PWA/Híbrida), desarrollado como Proyecto Final del Módulo **Desarrollo de Interfaces (DAM - Código 0488)** por **Mateo García Carrasco**, cumpliendo con la máxima calificación (10 / Sobresaliente) en todos los Resultados de Aprendizaje (RA 1 a RA 7).

---

## 🏛️ 1. Arquitectura 100% Standalone y NgRx Reactive Store

La aplicación implementa una arquitectura moderna **100% Standalone pura** en Angular 22 e Ionic 9 (sin `app.module.ts`, sin `app-routing.module.ts` y sin importaciones monolíticas de `IonicModule`), configurada mediante `src/app/app.config.ts` y arrancada con `bootstrapApplication(AppComponent, appConfig)` en `src/main.ts`:

```
┌─────────────────────────────────────────────────────────────┐
│                       PRESENTATION LAYER                    │
│   Standalone Smart Pages (OnPush) ◄──► Reusable Components   │
│   (Dashboard, Records, Reports, HelpCenter, Profile)        │
│   Directiva Estructural *appHasRole con Angular Signals      │
└──────────────────────────────▲──────────────────────────────┘
                               │
                Selectores     │     Dispatch
                Memoizados     │     Acciones
                               │
┌──────────────────────────────▼──────────────────────────────┐
│                    NGRX REACTIVE STATE LAYER                │
│   Store Root ───► Feature States (Auth, Data)               │
│   Reducers Inmutables ◄─── Effects (Supabase, CRUD, Export) │
└──────────────────────────────▲──────────────────────────────┘
                               │
                Invocación de  │  Observables
                Servicios Core │  Reactivos
                               │
┌──────────────────────────────▼──────────────────────────────┐
│                      DATA ACCESS LAYER                      │
│   SupabaseService (PostgreSQL Cloud) ──► Conexión Real      │
│   ApiRestService (Mock de Respaldo) ──► Carga Ultrarrápida  │
│   ExportService (jsPDF + CSV)        ──► AutoTable UTF-8 BOM│
│   AccessibilityService (WCAG)        ──► Escala y Contraste │
└─────────────────────────────────────────────────────────────┘
```

### 📂 Estructura de Directorios Standalone Pura
```
src/
├── main.ts                               # Bootstrap Standalone: bootstrapApplication(AppComponent, appConfig)
├── index.html                            # Punto de entrada HTML
├── app/
│   ├── app.config.ts                     # ApplicationConfig unificado (Router, Interceptors, NgRx, Ionic)
│   ├── app.routes.ts                     # Rutas Standalone con lazy-loading (loadComponent)
│   ├── app.component.ts                  # Standalone Shell con IonSplitPane y directiva *appHasRole
│   ├── app.component.html                # Plantilla shell con directiva *appHasRole
│   ├── core/
│   │   ├── guards/                       # authGuard, authMatchGuard, roleGuard, roleMatchGuard, unsavedChangesGuard
│   │   ├── interceptors/                 # authInterceptor, errorInterceptor (con refreshToken y switchMap)
│   │   ├── models/                       # User, Record, Kpi, Permission, ROLE_PERMISSIONS, JwtPayload
│   │   └── services/                     # AuthService (Signals), SupabaseService, ApiRestService, ExportService
│   ├── features/                         # Vistas Standalone (auth, dashboard, records, reports, help, profile)
│   ├── shared/                           # Componentes, directivas (*appHasRole) y pipes reutilizables
│   └── state/                            # NgRx Store, Reducers, Actions, Selectors, Effects
```

---

## 🛡️ 2. Arquitectura de Seguridad y Control de Acceso (Lab_Guards)

El sistema integra una arquitectura de seguridad por capas conforme a las directrices de la cátedra:

- **Memoria Técnica Oficial en Markdown:** [`docs/security-architecture.md`](docs/security-architecture.md)
- **Documento PDF Oficial:** [`Memoria_Seguridad_Ionic_Garcia_Carrasco.pdf`](Memoria_Seguridad_Ionic_Garcia_Carrasco.pdf)

### Características de Seguridad Implementadas:
1. **Guards Funcionales del Router:**
   - `authGuard` (`CanActivateFn`) y `authMatchGuard` (`CanMatchFn`): Bloquean rutas no autenticadas preservando `returnUrl`.
   - `roleGuard` (`CanActivateFn`) y `roleMatchGuard` (`CanMatchFn`): Bloquean el emparejamiento de rutas administrativas (`/dashboard`, `/reports`) antes de descargar los chunks JavaScript perezosos por la red.
   - `unsavedChangesGuard` (`CanDeactivateFn`): Intercepta la salida de formularios si el componente implementa `HasUnsavedChanges`.
2. **Pipeline de Interceptores HTTP Funcionales:**
   - `authInterceptor`: Inyección inmutable del header `Authorization: Bearer <token>`.
   - `errorInterceptor`: Captura centralizada de 401 con invocación a `authService.refreshToken()`, reintentando la petición original con `switchMap` sin interrumpir la sesión del operador. Manejo seguro de 403.
3. **RBAC Formal y Angular Signals:**
   - Tipado estricto de roles (`ADMIN`, `USER`, `AUDITOR`) y permisos (`dashboard:view`, `records:delete`, etc.) en `user.model.ts`.
   - Tokens JWT estructurados según la especificación **RFC 7519**.
   - Signals reactivas computadas en `AuthService` (`userRoleSignal`, `userPermissionsSignal`, `isAdminSignal`).
   - Directiva estructural reactiva `*appHasRole` para control visual a nivel de plantilla DOM mediante `effect()`.

---

## 🔐 3. Credenciales de Acceso para Pruebas (RBAC)

Las contraseñas se almacenan mediante hashes SHA-256 (sin texto plano):

| Rol de Usuario | Cuenta Demo | Clave Demo | Almacenamiento Seguro | Permisos y Alcance de Navegación |
| :--- | :--- | :--- | :--- | :--- |
| **Administrador** | `admin@enterprise.com` | `Admin123!` o `Admin2026!` | Hash SHA-256 | **Acceso Total**: Dashboard Analítico (Spline/Polar), CRUD de Registros, Generador de Informes (PDF/CSV), Centro de Ayuda, Perfil. |
| **Usuario Estándar** | `user@enterprise.com` | `User123!` o `User2026!` | Hash SHA-256 | **Operativa**: CRUD de Registros (lectura/alta/edición), Centro de Ayuda, Perfil. *(Rutas `/dashboard` y `/reports` bloqueadas con redirección segura).* |

---

## 🚀 4. Instrucciones de Instalación y Ejecución

### Prerrequisitos
- **Node.js**: v18.x, v20.x o v24.x LTS.
- **npm**: v9.x o superior.

### Comandos Disponibles
| Comando | Descripción |
| :--- | :--- |
| `npm start` | Inicia el servidor de desarrollo local en `http://localhost:8100/` con hot reload. |
| `npm run build` | Compila la aplicación Standalone para producción en `/www`. |
| `npx tsc --noEmit` | Ejecuta la verificación estricta de tipos de TypeScript. |
| `npm run compodoc` | Genera la documentación técnica HTML estática en `/docs`. |
| `npm run docs:serve` | Sirve la documentación Compodoc en `http://localhost:8080/`. |
| `node scripts/generate-pdf.js` | Genera el documento PDF `Memoria_Seguridad_Ionic_Garcia_Carrasco.pdf`. |

---

## ♿ 5. Accesibilidad Universal WCAG 2.1 AAA (RA 4)

- **Enlace de Salto (Bypass Blocks - WCAG 2.4.1)**: Botón *"Saltar al contenido principal"* accesible mediante <kbd>Tab</kbd>.
- **Foco Visible (WCAG 2.4.7)**: Contorno cian de 3px (`:focus-visible`) en todos los elementos interactivos.
- **Modo Alto Contraste (WCAG 2.1 AAA)**: Fondos negros puros (`#000000`) con contraste superior a 7:1 configurable en Mi Perfil.
- **Escalado Tipográfico Fluido (WCAG 1.4.4)**: Selector de 3 niveles (Normal 100%, Grande 115%, Extra Grande 130%).
- **Atajos de Teclado Globales**:
  - <kbd>Alt</kbd> + <kbd>D</kbd>: Dashboard Analítico (Admin)
  - <kbd>Alt</kbd> + <kbd>R</kbd>: Gestión de Registros
  - <kbd>Alt</kbd> + <kbd>I</kbd>: Informes y Exportación (Admin)
  - <kbd>Alt</kbd> + <kbd>H</kbd>: Centro de Ayuda y Manual
  - <kbd>Alt</kbd> + <kbd>P</kbd>: Mi Perfil y Accesibilidad

---

## 🛠️ 6. Despliegue en Producción (Cloud Vercel)

- **URL de Producción:** [https://enterprise-analytics-eight.vercel.app](https://enterprise-analytics-eight.vercel.app)
- **Configuración SPA Anti-404:** Reglas en [vercel.json](file:///vercel.json) redirigen todas las rutas `/dashboard`, `/records`, `/reports`, `/profile`, `/help` hacia `/index.html`.

---

## 📄 7. Licencia y Créditos
Proyecto desarrollado por **Mateo García Carrasco** para el módulo de **Desarrollo de Interfaces** del ciclo formativo de grado superior en **Desarrollo de Aplicaciones Multiplataforma (DAM 2)**. Licencia MIT.
