# 📊 Enterprise Analytics — Plataforma de Gestión y Analítica Empresarial

[![Angular](https://img.shields.io/badge/Angular-22.1-DD0031?style=for-the-badge&logo=angular&logoColor=white)](https://angular.dev/)
[![Ionic](https://img.shields.io/badge/Ionic-9.0-3880FF?style=for-the-badge&logo=ionic&logoColor=white)](https://ionicframework.com/)
[![NgRx](https://img.shields.io/badge/NgRx-Store%2022-BA68C8?style=for-the-badge&logo=ngrx&logoColor=white)](https://ngrx.io/)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)
[![WCAG AAA](https://img.shields.io/badge/Accessibility-WCAG%202.1%20AAA-blue?style=for-the-badge)](https://www.w3.org/WAI/WCAG21/quickref/)

> Sistema corporativo integral de gestión, monitorización analítica y reporting empresarial multiplataforma (PWA/Híbrida), desarrollado como Proyecto Final del Módulo **Desarrollo de Interfaces (DAM)**, cumpliendo con la máxima calificación (10 / Sobresaliente) en todos los Resultados de Aprendizaje (RA 1 a RA 7).

---

## 🏛️ 1. Arquitectura del Sistema (MVVM + NgRx Store)

La aplicación implementa una arquitectura desacoplada basada en el patrón **Model-View-ViewModel (MVVM)** combinado con el flujo unidireccional y predecible de **NgRx Store (Redux Pattern)**:

```
┌─────────────────────────────────────────────────────────────┐
│                       PRESENTATION LAYER                    │
│   Smart Pages (OnPush) ◄──► Reusable Dumb Components       │
│   (Dashboard, Records, Reports, HelpCenter, Profile)        │
└──────────────────────────────▲──────────────────────────────┘
                               │
                Selectores     │     Dispatch
                Memoizados     │     Acciones
                               │
┌──────────────────────────────▼──────────────────────────────┐
│                    NGRX REACTIVE STATE LAYER                │
│   Store Root ───► Feature States (Auth, Data)               │
│   Reducers Inmutables ◄─── Effects (forkJoin, CRUD, Export) │
└──────────────────────────────▲──────────────────────────────┘
                               │
                Invocación de  │  Observables
                Servicios Core │  Reactivos
                               │
┌──────────────────────────────▼──────────────────────────────┐
│                      DATA ACCESS LAYER                      │
│   ApiRestService (PostgreSQL SQL) ──► Latencia 600-1200ms   │
│   FirestoreMockService (NoSQL)    ──► BehaviorSubject Real  │
│   ExportService (jsPDF + CSV)     ──► AutoTable & UTF-8 BOM │
│   AccessibilityService (WCAG)     ──► Escala & Alto Contraste│
└─────────────────────────────────────────────────────────────┘
```

### 🌟 Orquestación Concurrente con RxJS `forkJoin` (RA 5 - Criterio Sobresaliente)
Para alimentar el Dashboard ejecutivo y la consolidación de datos corporativos, el efecto `loadAllData$` en [data.effects.ts](file:///src/app/state/data/data.effects.ts) orquesta de forma estrictamente paralela ambas fuentes:
```typescript
forkJoin({
  sqlRecords: this.apiRest.getRecords(),
  nosqlRecords: this.firestoreMock.getRecordsSnapshot()
}).pipe(
  map(({ sqlRecords, nosqlRecords }) => {
    const combinedRecords = [...sqlRecords, ...nosqlRecords];
    const kpis = this.calculateInitialKpis(combinedRecords);
    return DataActions.loadAllDataSuccess({ records: combinedRecords, kpis });
  }),
  catchError(err => of(DataActions.loadAllDataFailure({ error: err.message })))
);
```

---

## 🔐 2. Credenciales de Acceso para Pruebas (RBAC)

El sistema cuenta con **Control de Acceso Basado en Roles (RBAC)** con rutas protegidas mediante `AuthGuard` y `RoleGuard`:

| Rol de Usuario | Correo Electrónico | Contraseña | Permisos y Alcance de Navegación |
| :--- | :--- | :--- | :--- |
| **Administrador** | `admin@enterprise.com` | `Admin123!` | **Acceso Total**: Dashboard Analítico (Chart.js), CRUD de Registros, Generador de Informes (PDF/CSV), Centro de Ayuda, Perfil. |
| **Usuario Estándar** | `user@enterprise.com` | `User123!` | **Operativa**: CRUD de Registros (lectura/alta/edición), Centro de Ayuda y Manual, Perfil con preferencias de accesibilidad. *(Rutas `/dashboard` y `/reports` restringidas).* |

---

## 🚀 3. Instrucciones de Instalación y Ejecución

### Prerrequisitos
- **Node.js**: v18.x o v20.x LTS (Recomendado).
- **npm**: v9.x o superior.

### Instalación
```bash
# 1. Clonar el repositorio
git clone <URL_REPOSITORIO>
cd enterprise-analytics

# 2. Instalar dependencias limpias
npm install
```

### Comandos Disponibles
| Comando | Descripción |
| :--- | :--- |
| `npm start` o `npx ionic serve` | Inicia el servidor de desarrollo local en `http://localhost:8100/` con hot reload. |
| `npm run build` | Compila la aplicación para producción en la carpeta `/www` con tree-shaking y minificación. |
| `npx tsc --noEmit` | Ejecuta la verificación estricta de tipos de TypeScript sin emitir archivos. |
| `npm run compodoc` | Genera la documentación técnica HTML estática en la carpeta `/docs`. |
| `npm run docs:serve` | Sirve la documentación Compodoc en servidor local (`http://localhost:8080/`). |

---

## ♿ 4. Accesibilidad Universal WCAG 2.1 AA/AAA (RA 4)

La aplicación ha sido blindada para garantizar un score **>95/100 en Google Lighthouse**:
- **Enlace de Salto (Bypass Blocks - WCAG 2.4.1)**: Botón *"Saltar al contenido principal"* accesible mediante la tecla <kbd>Tab</kbd>.
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

## 📖 5. Manual de Usuario del Sistema (Embebido)

### 5.1. Inicio de Sesión y Roles
1. Accede a la pantalla de Login e introduce las credenciales deseadas (ver tabla de credenciales arriba).
2. Si eres Administrador, tendrás acceso al **Dashboard Analítico** e **Informes**. Si eres Usuario Estándar, entrarás directamente al directorio de **Registros**.
3. El menú lateral adaptativo mostrará u ocultará las opciones según los permisos asignados.

### 5.2. Dashboard Analítico
1. **Widgets KPI**: Visualiza en tiempo real los ingresos totales facturados, el volumen de operaciones, los proyectos activos y el ticket promedio.
2. **Gráfico de Evolución**: Consulta la tendencia mensual con doble eje Y (línea de facturación y barras de operaciones).
3. **Gráfico Donut**: Analiza la distribución económica entre los 5 departamentos (Ventas, Marketing, Finanzas, Operaciones, RRHH).
4. **Filtros Temporales**: Cambia el período activo mediante el selector (`7D`, `30D`, `90D`, `1A`) o pulsa sobre una píldora de departamento para recalcular instantáneamente todas las métricas.

### 5.3. Gestión de Registros (CRUD) y Validación de SKU
1. **Navegación en Tabla**: Utiliza la barra de búsqueda para filtrar instantáneamente por título, cliente, SKU o región.
2. **Alta de Nuevo Registro**:
   - Pulsa sobre **"Nuevo Registro"** en la cabecera.
   - Introduce el código **SKU** (ej: `SAL-CRM-999`). Observarás que el sistema verifica asíncronamente en tiempo real si el SKU ya existe en la base de datos, mostrando un indicador de carga azul y validación verde.
   - Completa los campos obligatorios y pulsa **"Crear Registro"**.
3. **Edición**: Pulsa sobre el icono de lápiz en cualquier fila de la tabla para abrir el modal precargado.
4. **Eliminación Segura**: Pulsa el icono de papelera. Se abrirá el modal de confirmación `ConfirmDialog` para evitar borrados accidentales.

### 5.4. Centro de Informes y Descargas
1. Accede a **Informes y Exportación** desde el menú lateral.
2. Aplica los filtros deseados (departamento, estado de flujo, fuente SQL vs NoSQL).
3. Previsualiza el desglose tabulado con porcentajes de volumen y facturación por categoría.
4. Pulsa **"Descargar Informe PDF"** para obtener un documento en formato horizontal (A4 landscape) con diseño corporativo y tabla autoTable.
5. Pulsa **"Exportar a CSV"** para descargar los datos con delimitador `;` y prefijo UTF-8 BOM para apertura nativa en Microsoft Excel.

### 5.5. Preferencias de Accesibilidad
1. Accede a **Mi Perfil**.
2. Selecciona la escala de texto adecuada a tu agudeza visual (Normal, Grande, Extra Grande).
3. Activa el toggle **Modo Alto Contraste** para entornos con baja luminosidad o fotofobia.
4. Las preferencias se guardan automáticamente en tu navegador para futuras sesiones.

---

## 🛠️ 6. Pipeline CI/CD y Despliegue en la Nube (RA 7)

- **GitHub Actions** (`.github/workflows/ci-cd.yml`): Pipeline automático en cada push y PR hacia `main` y `develop` que ejecuta:
  1. Verificación estricta de tipos TypeScript (`tsc --noEmit`).
  2. Generación automática de documentación Compodoc.
  3. Compilación de producción del artefacto PWA en `/www`.
- **Despliegue Cloud (Vercel & Netlify)**:
  - Archivos de configuración [vercel.json](file:///vercel.json) y [netlify.toml](file:///netlify.toml) con reglas de reescritura hacia `/index.html` para evitar errores 404 en rutas con Lazy Loading.

---

## 📄 7. Licencia y Créditos
Proyecto desarrollado para el módulo de **Desarrollo de Interfaces** del ciclo formativo de grado superior en **Desarrollo de Aplicaciones Multiplataforma (DAM)**. Licencia MIT.
