# 📑 MEMORIA DE ENTREGA DEL PROYECTO FINAL
## Módulo: Desarrollo de Interfaces (DAM - Código 0488)
### Proyecto: Enterprise Analytics — Plataforma de Gestión y Analítica Empresarial

---

### Datos del Alumno / Equipo
- **Nombre del Alumno:** Mateo García Carrasco
- **Ciclo Formativo:** Grado Superior en Desarrollo de Aplicaciones Multiplataforma (DAM 2)
- **Módulo Profesional:** Desarrollo de Interfaces (0488)
- **Convocatoria / Curso:** 2026 - 2027
- **Calificación Objetivo:** Sobresaliente (10.0)

---

## 1. 🌐 URL del Repositorio de Código Fuente (Git)
- **Enlace al Repositorio Oficial en GitHub:** [https://github.com/mateogit6222/enterprise-analytics](https://github.com/mateogit6222/enterprise-analytics)
- **Estructura de Ramas (Git Flow):**
  - `main`: Rama de producción con versión estable etiquetada con tag `v1.0.0`.
  - `develop`: Rama principal de integración y desarrollo.
  - Ramas de características fusionadas con `--no-ff`:
    - `feature/core-auth-routing` (Fase 1)
    - `feature/shared-components` (Fase 2)
    - `feature/dashboard-records` (Fase 3)
    - `feature/accessibility-ux-help` (Fase 4)
    - `feature/pwa-docs-deploy` (Fase 5)
    - `feature/professor-feedback-supabase-bootstrap` (Fase 6)
    - `feature/taste-skill-corporate-bento` (Fase 7)
    - `feature/standalone-security-architecture` (Fase 8: 100% Standalone Pure + Arquitectura de Seguridad)

---

## 2. 🚀 URL de la Aplicación Desplegada en Producción (Cloud)
- **Enlace de Producción en Vercel:** [https://enterprise-analytics-eight.vercel.app](https://enterprise-analytics-eight.vercel.app)
- **Plataforma de Alojamiento:** Vercel Cloud Platform.
- **Configuración SPA Anti-404:** Configurado mediante `vercel.json` con reescritura hacia `/index.html`, garantizando que la navegación directa o recargas con F5 en rutas perezosas (`/dashboard`, `/records`, `/reports`, `/profile`, `/help`) respondan con código HTTP 200 sin errores 404.

---

## 3. 🛡️ Memoria Técnica de Arquitectura de Seguridad (Lab_Guards)
Se ha elaborado y adjuntado la documentación técnica exhaustiva requerida por la cátedra:
- **Documento Markdown Oficial:** [`docs/security-architecture.md`](docs/security-architecture.md)
- **Documento PDF Oficial:** [`Memoria_Seguridad_Ionic_Garcia_Carrasco.pdf`](Memoria_Seguridad_Ionic_Garcia_Carrasco.pdf)

### Resumen de la Implementación de Seguridad:
1. **Arquitectura 100% Standalone:** Eliminación total de `app.module.ts` y `app-routing.module.ts`. Arranque moderno con `bootstrapApplication(AppComponent, appConfig)`.
2. **Guards Funcionales de Enrutamiento:**
   - `authGuard` (`CanActivateFn`) y `authMatchGuard` (`CanMatchFn`) con preservación de `returnUrl`.
   - `roleGuard` (`CanActivateFn`) y `roleMatchGuard` (`CanMatchFn`) impidiendo la descarga de chunks perezosos por la red a perfiles no autorizados.
   - `unsavedChangesGuard` (`CanDeactivateFn`) con interfaz `HasUnsavedChanges` para evitar pérdida accidental de datos.
3. **Pipeline de Interceptores HTTP:**
   - `authInterceptor`: Inyección inmutable de cabecera `Authorization: Bearer <token>`.
   - `errorInterceptor`: Captura centralizada de 401 con invocación a `authService.refreshToken()` y reintento reactivo transparente (`switchMap`); captura de 403 con redirección segura.
4. **Control de Acceso Basado en Roles (RBAC Granular) y Signals:**
   - Definición formal en `user.model.ts` con enum `Permission` y matriz `ROLE_PERMISSIONS`.
   - Tokens JWT estructurados según el estándar **RFC 7519**.
   - Reactividad moderna en `AuthService` mediante Angular Signals (`currentUserSignal`, `userRoleSignal`, `userPermissionsSignal`, `isAdminSignal`).
   - Directiva estructural `*appHasRole` con manipulación directa del `ViewContainerRef` mediante `effect()`.

---

## 4. 🔐 Credenciales de Acceso para Evaluación de Roles (RBAC)

El evaluador dispone de perfiles con diferentes niveles de autorización para verificar el sistema de permisos y guardias de ruta:

| Perfil / Rol | Cuenta Demo | Clave Demo | Almacenamiento Seguro | Permisos / Rutas Autorizadas |
| :--- | :--- | :--- | :--- | :--- |
| **Administrador** | `admin@enterprise.com` | `Admin123!` o `Admin2026!` | Hash SHA-256 (Sin texto plano) | Todas las rutas: `/dashboard`, `/records`, `/reports`, `/profile`, `/help` |
| **Usuario Estándar** | `user@enterprise.com` | `User123!` o `User2026!` | Hash SHA-256 (Sin texto plano) | `/records`, `/profile`, `/help` *(Redirigido si intenta acceder a `/dashboard` o `/reports`)* |

*(Se incluyen botones de Acceso Rápido Demo en el formulario de login para agilizar la prueba del evaluador).*

---

## 5. 📈 Auditoría Google Lighthouse y Accesibilidad WCAG 2.1 AAA
- **Lighthouse Accessibility:** 100 / 100.
- **Lighthouse Best Practices:** 100 / 100.
- **Lighthouse Performance:** >= 95 / 100.
- **Visualización Analítica:** Gráficos Spline Area y Polar Area corporativos (sin gráficos de barras convencionales).
- **Base de Datos en Tiempo Real:** Integración directa con Supabase PostgreSQL con fallback reactivo de alta disponibilidad.

---
*Entregable completado por Mateo García Carrasco — Noviembre 2026.*
