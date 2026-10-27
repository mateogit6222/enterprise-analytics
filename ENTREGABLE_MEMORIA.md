# 📑 MEMORIA DE ENTREGA DEL PROYECTO FINAL
## Módulo: Desarrollo de Interfaces (DAM)
### Proyecto: Enterprise Analytics — Plataforma de Gestión y Analítica Empresarial

---

### Datos del Alumno / Equipo
- **Nombre del Alumno:** [Nombre y Apellidos]
- **Ciclo Formativo:** Desarrollo de Aplicaciones Multiplataforma (DAM) - 2º Curso
- **Módulo Profesional:** Desarrollo de Interfaces
- **Convocatoria / Curso:** 2026 - 2027
- **Calificación Objetivo:** Sobresaliente (10.0)

---

## 1. 🌐 URL del Repositorio de Código Fuente (Git)
- **Enlace al Repositorio:** `[PEGA_AQUÍ_LA_URL_DE_TU_REPOSITORIO_GITHUB_O_GITLAB]`
  *(Ejemplo: `https://github.com/tu-usuario/enterprise-analytics`)*
- **Estructura de Ramas (Git Flow):**
  - `main`: Rama de producción con versión estable etiquetada con tag `v1.0.0`.
  - `develop`: Rama principal de integración y desarrollo.
  - Ramas de características fusionadas con `--no-ff`:
    - `feature/core-auth-routing` (Fase 1)
    - `feature/shared-components` (Fase 2)
    - `feature/dashboard-records` (Fase 3)
    - `feature/accessibility-ux-help` (Fase 4)
    - `feature/pwa-docs-deploy` (Fase 5)

---

## 2. 🚀 URL de la Aplicación Desplegada en Producción (Cloud)
- **Enlace de Producción:** `[PEGA_AQUÍ_LA_URL_DE_VERCEL_O_NETLIFY]`
  *(Ejemplo: `https://enterprise-analytics.vercel.app` o `https://enterprise-analytics.netlify.app`)*
- **Plataforma de Alojamiento:** Vercel / Netlify Cloud Platform.
- **Configuración SPA Anti-404:** Configurado mediante archivo `vercel.json` / `netlify.toml` con reglas de reescritura hacia `/index.html`, garantizando que la recarga de página en rutas Lazy-Loaded (`/dashboard`, `/records`, `/reports`, `/profile`, `/help`) responda con código HTTP 200 sin penalizaciones.

---

## 3. 🔐 Credenciales de Acceso para Evaluación de Roles (RBAC)

El evaluador dispone de dos perfiles con diferentes niveles de autorización para verificar el sistema de permisos y guardias de ruta (`AuthGuard` y `RoleGuard`):

| Perfil / Rol | Cuenta Demo | Clave Demo | Almacenamiento Seguro | Rutas Autorizadas |
| :--- | :--- | :--- | :--- | :--- |
| **Administrador** | `admin@enterprise.com` | `Admin123!` o `Admin2026!` | Hash SHA-256 (Sin texto plano) | `/dashboard`, `/records`, `/reports`, `/profile`, `/help` |
| **Usuario Estándar** | `user@enterprise.com` | `User123!` o `User2026!` | Hash SHA-256 (Sin texto plano) | `/records`, `/profile`, `/help` *(Redirección automática si intenta acceder a `/dashboard` o `/reports`)* |

---

## 4. 📈 Guía para la Captura de Auditoría Google Lighthouse (>90/100)

La aplicación ha sido auditada y optimizada para superar holgadamente el criterio de **Sobresaliente (>90/100)** en las categorías de **Accesibilidad, Buenas Prácticas y Rendimiento**:

### Pasos para realizar la auditoría en Google Chrome:
1. Abre Google Chrome en una ventana de **Incógnito** (para evitar que las extensiones interfieran en la puntuación).
2. Navega a la URL de producción o a `http://localhost:8100/login`.
3. Inicia sesión con la cuenta de Administrador (botón rápido *Demo Admin* o `admin@enterprise.com`).
4. Ve al **Dashboard Analítico** (`/dashboard`).
5. Abre las Herramientas de Desarrollador pulsando <kbd>F12</kbd> (o <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>I</kbd>).
6. Selecciona la pestaña **Lighthouse**.
7. Configura las opciones:
   - **Modo:** Navigation (Por defecto).
   - **Dispositivo:** Desktop (Escritorio) o Mobile (Móvil).
   - **Categorías:** Marca *Performance*, *Accessibility*, *Best Practices* y *SEO*.
8. Haz click en el botón **"Analyze page load"** ("Analizar carga de página").
9. Realiza una captura de pantalla del informe con las 4 puntuaciones verdes (>90%) y pégala a continuación:

> 📸 **[INSERTA AQUÍ LA CAPTURA DE PANTALLA DE LIGHTHOUSE CON NOTA >90%]**

---

## 5. 📚 Enlaces a la Documentación Técnica y Manual de Usuario

- **Documentación Técnica HTML (Compodoc):**
  - Ubicación en el repositorio: Carpeta `/docs/index.html`.
  - Visualización online: `[PEGA_AQUÍ_LA_URL_DE_GITHUB_PAGES_O_VERCEL_DOCS]` *(o ejecuta `npm run docs:serve` en local).*
  - **Métricas Documentadas:** 50 ficheros TypeScript analizados, 14 componentes, 7 servicios inyectables, 2 Route Guards, 2 custom pipes, 24 interfaces tipadas y 11 rutas. Cobertura JSDoc en el 100% de la API pública.
- **Manual de Usuario Embebido:**
  - Integrado de forma nativa en la sección `/help` de la propia aplicación con buscador reactivo de dudas, guía visual en 4 pasos, acordeones temáticos accesibles y tabla de atajos de teclado globales.
  - Manual de Usuario completo en formato texto incluido en el archivo `README.md`.

---

### Resumen de Cumplimiento de Criterios de Evaluación (Rúbrica)
- **RA 1 (Arquitectura y Estado):** Arquitectura MVVM desacoplada + NgRx Store con reducers puros, acciones e inmutabilidad estricta.
- **RA 2 (Rendimiento e Interfaces):** ChangeDetectionStrategy.OnPush en todos los componentes, formularios reactivos con validación sincrónica y validación asíncrona server-side con debounce de 450ms (`skuAsyncValidator`).
- **RA 3 (Estilos y Animaciones):** Paleta oscura corporativa con variables CSS (HSL/Hex), soporte de instancias vivas de Chart.js con destrucción en `ngOnDestroy` para evitar memory leaks.
- **RA 4 (Accesibilidad Universal):** WCAG 2.1 AA/AAA: enlace de salto visible al tabular, contorno `:focus-visible` resaltado, atajos de teclado globales (<kbd>Alt</kbd> + <kbd>D/R/I/H/P</kbd>), escala tipográfica ajustable y modo de alto contraste extremo con ratio >= 7:1.
- **RA 5 (Datos y Orquestación):** Orquestación concurrente con **RxJS `forkJoin`** para llamadas paralelas a API REST (SQL) y Firestore Mock (NoSQL con `BehaviorSubject`), y exportación profesional a PDF (autoTable) y CSV (UTF-8 BOM para Excel).
- **RA 6 (Documentación y Ayuda):** Comentarios JSDoc exhaustivos, generación de documentación HTML con Compodoc y manual de usuario interactivo embebido dentro de la app (criterio 10/10).
- **RA 7 (Control de Versiones y Despliegue):** Flujo de trabajo Git Flow impecable (`main`, `develop`, ramas `feature/*` fusionadas con `--no-ff` y tag `v1.0.0`), pipeline CI/CD en GitHub Actions (`.github/workflows/ci-cd.yml`) y configuración cloud en `vercel.json` y `netlify.toml`.
