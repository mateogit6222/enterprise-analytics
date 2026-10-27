-- ============================================================================
-- ENTERPRISE ANALYTICS PLATFORM — SUPABASE POSTGRESQL SCHEMA & INITIAL DATA
-- ============================================================================
-- Copia y pega este script en el 'SQL Editor' de tu panel de Supabase y pulsa 'Run'.
-- Crea las tablas 'records' y 'users' con Row Level Security (RLS) habilitado
-- e inserta los registros corporativos iniciales para visualización y analítica.
-- ============================================================================

-- 1. EXTENSIÓN PARA UUIDs (Si no está habilitada)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. TABLA DE REGISTROS EMPRESARIALES (records)
DROP TABLE IF EXISTS records CASCADE;
CREATE TABLE records (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL CHECK (category IN ('SALES', 'MARKETING', 'FINANCE', 'OPERATIONS', 'HR')),
  status TEXT NOT NULL CHECK (status IN ('ACTIVE', 'PENDING', 'COMPLETED', 'ARCHIVED')),
  amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
  assigned_to TEXT NOT NULL,
  client_name TEXT NOT NULL,
  client_email TEXT,
  region TEXT NOT NULL,
  sku TEXT NOT NULL UNIQUE,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  source TEXT NOT NULL DEFAULT 'SUPABASE'
);

-- 3. TABLA DE USUARIOS (users)
DROP TABLE IF EXISTS users CASCADE;
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('ADMIN', 'USER')),
  avatar_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_login_at TIMESTAMPTZ
);

-- 4. POLÍTICAS DE ACCESO PÚBLICO (ANON) PARA DESARROLLO / PRUEBAS
ALTER TABLE records ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Permitir lectura publica de registros" ON records
  FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Permitir insercion publica de registros" ON records
  FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE POLICY "Permitir actualizacion publica de registros" ON records
  FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Permitir eliminacion publica de registros" ON records
  FOR DELETE TO anon, authenticated USING (true);

CREATE POLICY "Permitir lectura publica de usuarios" ON users
  FOR SELECT TO anon, authenticated USING (true);

-- 5. INSERCIÓN DE USUARIOS DE PRUEBA (HASHES SHA-256 SIN CONTRASEÑAS EN TEXTO PLANO)
INSERT INTO users (id, email, password_hash, first_name, last_name, role, avatar_url, is_active, created_at, last_login_at)
VALUES
  ('usr-admin-001', 'admin@enterprise.com', '04445e6487736590d1ef50186b414e737e0164683cbbec64e00e73c000fd3bef', 'Elena', 'Martínez', 'ADMIN', 'https://api.dicebear.com/9.x/initials/svg?seed=EM&backgroundColor=6366f1', true, '2025-01-15T08:30:00Z', NOW()),
  ('usr-user-001', 'user@enterprise.com', 'cb1bc5abcdca0bdfc656344aa5011268b00aba457ac33034f3946e29ef79a603', 'Carlos', 'López', 'USER', 'https://api.dicebear.com/9.x/initials/svg?seed=CL&backgroundColor=06b6d4', true, '2025-03-22T14:00:00Z', NOW()),
  ('usr-user-002', 'javier.ruiz@enterprise.com', 'b505981b4b1c56908b27d6de3687fad6d6ff9d9ba9a016f010e99dc32ecd47d8', 'Javier', 'Ruiz', 'USER', 'https://api.dicebear.com/9.x/initials/svg?seed=JR&backgroundColor=10b981', true, '2025-06-10T11:20:00Z', NOW()),
  ('usr-admin-002', 'maria.garcia@enterprise.com', '80f0ba29e909a928784db26475341a13c968335e56f9f942bd38159e1a988c85', 'María', 'García', 'ADMIN', 'https://api.dicebear.com/9.x/initials/svg?seed=MG&backgroundColor=f43f5e', true, '2025-02-28T09:45:00Z', NOW());

-- 6. INSERCIÓN DE REGISTROS EMPRESARIALES CORPORATIVOS
INSERT INTO records (id, title, description, category, status, amount, assigned_to, client_name, client_email, region, sku, tags, created_at, updated_at, source)
VALUES
  ('rec-001', 'Auditoría Financiera Corporativa Q3', 'Revisión exhaustiva de estados financieros y cumplimiento normativo del tercer trimestre fiscal.', 'FINANCE', 'COMPLETED', 45000.00, 'usr-admin-001', 'Banco Santander', 'finanzas@santander.es', 'Madrid', 'FIN-AUD-001', ARRAY['auditoría', 'finanzas', 'Q3'], '2026-07-15T09:00:00Z', '2026-09-28T14:30:00Z', 'SUPABASE'),
  ('rec-002', 'Campaña Lanzamiento Cloud Enterprise', 'Estrategia integral de marketing digital para el lanzamiento de la plataforma cloud corporativa.', 'MARKETING', 'ACTIVE', 82500.00, 'usr-admin-001', 'Telefónica Tech', 'cloud@telefonica.com', 'Barcelona', 'MKT-CLD-002', ARRAY['cloud', 'marketing', 'lanzamiento'], '2026-08-01T10:00:00Z', '2026-10-10T11:45:00Z', 'SUPABASE'),
  ('rec-003', 'Optimización de Rutas Logísticas', 'Rediseño algorítmico de rutas de distribución para reducir costes operativos un 18%.', 'OPERATIONS', 'PENDING', 29000.00, 'usr-user-001', 'SEUR Internacional', 'ops@seur.com', 'Valencia', 'OPS-LOG-003', ARRAY['logística', 'optimización', 'rutas'], '2026-09-05T08:30:00Z', '2026-10-12T16:00:00Z', 'SUPABASE'),
  ('rec-004', 'Renovación Licencias Enterprise SAP', 'Negociación y renovación de contratos de licencias SAP S/4HANA para el grupo corporativo.', 'SALES', 'ACTIVE', 142000.00, 'usr-admin-001', 'Inditex Global', 'tech@inditex.com', 'Galicia', 'SAL-LIC-004', ARRAY['SAP', 'licencias', 'enterprise'], '2026-06-20T11:00:00Z', '2026-10-05T09:15:00Z', 'SUPABASE'),
  ('rec-005', 'Consultoría Big Data e IA Antifraude', 'Diseño e implementación de pipeline de datos con modelos predictivos ML para detección de fraude.', 'FINANCE', 'ACTIVE', 67000.00, 'usr-user-001', 'BBVA Seguros', 'innovacion@bbva.es', 'Madrid', 'FIN-DAT-005', ARRAY['big-data', 'IA', 'fraude'], '2026-07-28T15:00:00Z', '2026-10-14T10:20:00Z', 'SUPABASE'),
  ('rec-006', 'Reestructuración y Onboarding Talento Tech', 'Plan estratégico de atracción y acogida de perfiles sénior en ingeniería de software.', 'HR', 'COMPLETED', 18500.00, 'usr-admin-001', 'Cabify España', 'talent@cabify.com', 'Madrid', 'HR-ONB-006', ARRAY['talento', 'RRHH', 'onboarding'], '2026-05-10T09:30:00Z', '2026-08-15T12:00:00Z', 'SUPABASE'),
  ('rec-007', 'Migración Arquitectura Microservicios AWS', 'Modernización de monolito a arquitectura basada en contenedores ECS y Kubernetes.', 'OPERATIONS', 'ACTIVE', 115000.00, 'usr-user-001', 'Repsol Digital', 'cloud@repsol.com', 'Madrid', 'OPS-MIG-007', ARRAY['AWS', 'microservicios', 'kubernetes'], '2026-08-12T08:00:00Z', '2026-10-16T17:30:00Z', 'SUPABASE'),
  ('rec-008', 'Auditoría Ciberseguridad Pentesting ISO 27001', 'Análisis de vulnerabilidades y pruebas de intrusión en infraestructura crítica.', 'FINANCE', 'COMPLETED', 54000.00, 'usr-admin-001', 'Iberdrola España', 'security@iberdrola.es', 'Bilbao', 'FIN-SEC-008', ARRAY['ciberseguridad', 'pentesting', 'ISO27001'], '2026-06-01T10:30:00Z', '2026-09-10T14:00:00Z', 'SUPABASE'),
  ('rec-009', 'Estrategia SEO y Performance Internacional', 'Posicionamiento orgánico y aceleración Core Web Vitals en 12 mercados europeos.', 'MARKETING', 'PENDING', 38000.00, 'usr-user-001', 'Mango Fashion', 'growth@mango.com', 'Barcelona', 'MKT-SEO-009', ARRAY['SEO', 'performance', 'internacional'], '2026-09-18T13:00:00Z', '2026-10-15T11:00:00Z', 'SUPABASE'),
  ('rec-010', 'Plataforma B2B E-commerce Mayorista', 'Desarrollo de portal de compras transaccional de alta concurrencia para distribuidores.', 'SALES', 'ACTIVE', 96000.00, 'usr-admin-001', 'Mercadona Proveedores', 'b2b@mercadona.es', 'Valencia', 'SAL-B2B-010', ARRAY['ecommerce', 'B2B', 'ventas'], '2026-07-05T12:00:00Z', '2026-10-11T16:45:00Z', 'SUPABASE'),
  ('rec-011', 'Programa de Upskilling en Inteligencia Artificial', 'Capacitación ejecutiva y técnica en herramientas de IA Generativa para 200 empleados.', 'HR', 'ACTIVE', 27500.00, 'usr-user-001', 'Ferrovial Tech', 'learning@ferrovial.com', 'Madrid', 'HR-TRA-011', ARRAY['formación', 'IA', 'upskilling'], '2026-08-20T09:00:00Z', '2026-10-13T10:15:00Z', 'SUPABASE'),
  ('rec-012', 'Automatización de Facturación con RPA UiPath', 'Implementación de bots software para conciliación bancaria y facturas de proveedores.', 'OPERATIONS', 'COMPLETED', 62000.00, 'usr-admin-001', 'Naturgy Energía', 'rpa@naturgy.com', 'Barcelona', 'OPS-RPA-012', ARRAY['RPA', 'UiPath', 'automatización'], '2026-05-25T11:30:00Z', '2026-09-30T15:20:00Z', 'SUPABASE'),
  ('rec-013', 'Acuerdo de Distribución Sector Hospitalario', 'Contrato marco de distribución de suministros tecnológicos en 14 complejos sanitarios.', 'SALES', 'ACTIVE', 178000.00, 'usr-admin-001', 'Quirónsalud', 'compras@quironsalud.es', 'Madrid', 'SAL-DIS-013', ARRAY['salud', 'distribución', 'contrato'], '2026-06-15T08:00:00Z', '2026-10-08T18:00:00Z', 'SUPABASE'),
  ('rec-014', 'Rediseño de Identidad y Branding Global', 'Renovación de sistema visual, tipografía y manual de marca multicanal.', 'MARKETING', 'ARCHIVED', 32000.00, 'usr-user-001', 'Acciona Energía', 'marca@acciona.com', 'Madrid', 'MKT-BRD-014', ARRAY['branding', 'identidad', 'diseño'], '2026-04-20T08:30:00Z', '2026-08-30T15:00:00Z', 'SUPABASE'),
  ('rec-015', 'Plataforma Compliance GDPR y Privacidad', 'Sistema automatizado de gestión de consentimientos y derechos ARCO bajo RGPD.', 'FINANCE', 'ACTIVE', 39000.00, 'usr-user-001', 'Endesa Energía', 'legal@endesa.es', 'Sevilla', 'FIN-GDP-015', ARRAY['GDPR', 'compliance', 'privacidad'], '2026-08-05T10:00:00Z', '2026-10-16T12:00:00Z', 'SUPABASE'),
  ('rec-016', 'Transformación Digital Retail Omnicanal', 'Proyecto omnicanal integrando POS, e-commerce y app móvil con experiencia unificada.', 'SALES', 'PENDING', 125000.00, 'usr-admin-001', 'El Corte Inglés', 'digital@elcorteingles.es', 'Madrid', 'SAL-RET-016', ARRAY['retail', 'omnicanal', 'UX'], '2026-08-15T11:00:00Z', '2026-10-17T09:00:00Z', 'SUPABASE'),
  ('rec-017', 'Sistema de Retención y Beneficios Flexibles', 'Plataforma de compensación total con seguro médico, guardería y retribución flexible.', 'HR', 'COMPLETED', 24000.00, 'usr-user-001', 'Glovo España', 'people@glovo.com', 'Barcelona', 'HR-BEN-017', ARRAY['beneficios', 'retención', 'compensación'], '2026-06-10T09:00:00Z', '2026-09-20T17:00:00Z', 'SUPABASE'),
  ('rec-018', 'Centro de Operaciones de Ciberseguridad (SOC)', 'Despliegue de SOC 24/7 con plataforma SIEM y monitorización de alertas en tiempo real.', 'OPERATIONS', 'ACTIVE', 88000.00, 'usr-admin-001', 'Aena Aeropuertos', 'soc@aena.es', 'Madrid', 'OPS-SOC-018', ARRAY['ciberseguridad', 'SOC', 'SIEM'], '2026-07-20T07:30:00Z', '2026-10-18T06:00:00Z', 'SUPABASE');

-- 7. ÍNDICES DE RENDIMIENTO (Performance Indexes)
CREATE INDEX IF NOT EXISTS idx_records_category ON records(category);
CREATE INDEX IF NOT EXISTS idx_records_status ON records(status);
CREATE INDEX IF NOT EXISTS idx_records_sku ON records(sku);
CREATE INDEX IF NOT EXISTS idx_records_created_at ON records(created_at DESC);
