import { Record } from './record.model';
import { MockUserData } from './user.model';

/**
 * Dataset en memoria de registros SQL para fallback garantizado.
 */
export const FALLBACK_SQL_RECORDS: Record[] = [
  {
    "id": "sql-001",
    "title": "Auditoría Financiera Corporativa Q3",
    "description": "Revisión exhaustiva de estados financieros y cumplimiento normativo del tercer trimestre fiscal.",
    "category": "FINANCE",
    "status": "COMPLETED",
    "amount": 45000,
    "assignedTo": "usr-admin-001",
    "clientName": "Banco Santander",
    "clientEmail": "finanzas@santander.es",
    "sku": "FIN-AUD-001",
    "region": "Madrid",
    "tags": [
      "auditoría",
      "finanzas",
      "Q3"
    ],
    "createdAt": "2026-07-15T09:00:00.000Z",
    "updatedAt": "2026-09-28T14:30:00.000Z",
    "source": "REST"
  },
  {
    "id": "sql-002",
    "title": "Campaña Lanzamiento Cloud Enterprise",
    "description": "Estrategia integral de marketing digital para el lanzamiento de la plataforma cloud corporativa.",
    "category": "MARKETING",
    "status": "ACTIVE",
    "amount": 82500,
    "assignedTo": "usr-admin-001",
    "clientName": "Telefónica Tech",
    "clientEmail": "cloud@telefonica.com",
    "sku": "MKT-CLD-002",
    "region": "Barcelona",
    "tags": [
      "cloud",
      "marketing",
      "lanzamiento"
    ],
    "createdAt": "2026-08-01T10:00:00.000Z",
    "updatedAt": "2026-10-10T11:45:00.000Z",
    "source": "REST"
  },
  {
    "id": "sql-003",
    "title": "Optimización de Rutas Logísticas",
    "description": "Rediseño algorítmico de rutas de distribución para reducir costes operativos un 18%.",
    "category": "OPERATIONS",
    "status": "PENDING",
    "amount": 29000,
    "assignedTo": "usr-user-001",
    "clientName": "SEUR Internacional",
    "clientEmail": "ops@seur.com",
    "sku": "OPS-LOG-003",
    "region": "Valencia",
    "tags": [
      "logística",
      "optimización",
      "rutas"
    ],
    "createdAt": "2026-09-05T08:30:00.000Z",
    "updatedAt": "2026-10-12T16:00:00.000Z",
    "source": "REST"
  },
  {
    "id": "sql-004",
    "title": "Renovación Licencias Enterprise SAP",
    "description": "Negociación y renovación de contratos de licencias SAP S/4HANA para el grupo corporativo.",
    "category": "SALES",
    "status": "ACTIVE",
    "amount": 142000,
    "assignedTo": "usr-admin-001",
    "clientName": "Inditex Global",
    "clientEmail": "tech@inditex.com",
    "sku": "SAL-LIC-004",
    "region": "Galicia",
    "tags": [
      "SAP",
      "licencias",
      "enterprise"
    ],
    "createdAt": "2026-06-20T11:00:00.000Z",
    "updatedAt": "2026-10-05T09:15:00.000Z",
    "source": "REST"
  },
  {
    "id": "sql-005",
    "title": "Consultoría Big Data e Inteligencia Artificial",
    "description": "Diseño e implementación de pipeline de datos con modelos predictivos ML para detección de fraude.",
    "category": "FINANCE",
    "status": "ACTIVE",
    "amount": 67000,
    "assignedTo": "usr-user-001",
    "clientName": "BBVA Seguros",
    "clientEmail": "ia@bbva.com",
    "sku": "FIN-BDA-005",
    "region": "Madrid",
    "tags": [
      "big data",
      "IA",
      "fraude"
    ],
    "createdAt": "2026-08-10T14:00:00.000Z",
    "updatedAt": "2026-10-14T10:30:00.000Z",
    "source": "REST"
  },
  {
    "id": "sql-006",
    "title": "Migración Infraestructura On-Premise a Azure",
    "description": "Migración completa de infraestructura legacy a Microsoft Azure con alta disponibilidad.",
    "category": "OPERATIONS",
    "status": "COMPLETED",
    "amount": 115000,
    "assignedTo": "usr-admin-001",
    "clientName": "Repsol Energía",
    "clientEmail": "infra@repsol.com",
    "sku": "OPS-MIG-006",
    "region": "Bilbao",
    "tags": [
      "Azure",
      "migración",
      "cloud"
    ],
    "createdAt": "2026-04-01T09:00:00.000Z",
    "updatedAt": "2026-09-15T17:00:00.000Z",
    "source": "REST"
  },
  {
    "id": "sql-007",
    "title": "Estrategia SEO & SEM Internacional",
    "description": "Campaña de posicionamiento orgánico y pagado en mercados europeos clave.",
    "category": "MARKETING",
    "status": "ARCHIVED",
    "amount": 34000,
    "assignedTo": "usr-user-001",
    "clientName": "Meliá Hotels",
    "clientEmail": "digital@melia.com",
    "sku": "MKT-SEO-007",
    "region": "Palma de Mallorca",
    "tags": [
      "SEO",
      "SEM",
      "internacional"
    ],
    "createdAt": "2026-03-10T10:00:00.000Z",
    "updatedAt": "2026-07-20T12:00:00.000Z",
    "source": "REST"
  },
  {
    "id": "sql-008",
    "title": "Programa de Onboarding Digital",
    "description": "Plataforma gamificada de integración y formación para nuevos empleados corporativos.",
    "category": "HR",
    "status": "ACTIVE",
    "amount": 23000,
    "assignedTo": "usr-admin-001",
    "clientName": "Mercadona Tech",
    "clientEmail": "rrhh@mercadona.es",
    "sku": "HR-ONB-008",
    "region": "Valencia",
    "tags": [
      "onboarding",
      "RRHH",
      "gamificación"
    ],
    "createdAt": "2026-09-01T08:00:00.000Z",
    "updatedAt": "2026-10-16T13:00:00.000Z",
    "source": "REST"
  },
  {
    "id": "sql-009",
    "title": "Implementación ERP Odoo",
    "description": "Despliegue y personalización de ERP Odoo Enterprise para cadena de suministro.",
    "category": "OPERATIONS",
    "status": "PENDING",
    "amount": 58000,
    "assignedTo": "usr-user-001",
    "clientName": "El Corte Inglés",
    "clientEmail": "erp@elcorteingles.es",
    "sku": "OPS-ERP-009",
    "region": "Madrid",
    "tags": [
      "ERP",
      "Odoo",
      "cadena de suministro"
    ],
    "createdAt": "2026-09-20T09:30:00.000Z",
    "updatedAt": "2026-10-15T11:00:00.000Z",
    "source": "REST"
  },
  {
    "id": "sql-010",
    "title": "Análisis de Satisfacción del Cliente NPS",
    "description": "Estudio cuantitativo y cualitativo de Net Promoter Score con encuestas a 5.000 clientes.",
    "category": "SALES",
    "status": "COMPLETED",
    "amount": 18500,
    "assignedTo": "usr-admin-001",
    "clientName": "CaixaBank",
    "clientEmail": "cx@caixabank.com",
    "sku": "SAL-NPS-010",
    "region": "Barcelona",
    "tags": [
      "NPS",
      "satisfacción",
      "clientes"
    ],
    "createdAt": "2026-07-01T10:00:00.000Z",
    "updatedAt": "2026-09-30T16:45:00.000Z",
    "source": "REST"
  },
  {
    "id": "sql-011",
    "title": "Plan de Continuidad de Negocio",
    "description": "Diseño del BCP con análisis de impacto y estrategias de recuperación ante desastres.",
    "category": "OPERATIONS",
    "status": "ACTIVE",
    "amount": 41000,
    "assignedTo": "usr-user-001",
    "clientName": "Iberdrola",
    "clientEmail": "seguridad@iberdrola.es",
    "sku": "OPS-BCP-011",
    "region": "Bilbao",
    "tags": [
      "BCP",
      "continuidad",
      "resiliencia"
    ],
    "createdAt": "2026-08-15T08:00:00.000Z",
    "updatedAt": "2026-10-13T14:20:00.000Z",
    "source": "REST"
  },
  {
    "id": "sql-012",
    "title": "Programa de Retención de Talento Tech",
    "description": "Plan de carrera, beneficios y cultura para reducir rotación en departamento tecnológico.",
    "category": "HR",
    "status": "PENDING",
    "amount": 15000,
    "assignedTo": "usr-admin-001",
    "clientName": "Cabify",
    "clientEmail": "people@cabify.com",
    "sku": "HR-RET-012",
    "region": "Madrid",
    "tags": [
      "retención",
      "talento",
      "tech"
    ],
    "createdAt": "2026-09-10T09:00:00.000Z",
    "updatedAt": "2026-10-11T10:00:00.000Z",
    "source": "REST"
  },
  {
    "id": "sql-013",
    "title": "Desarrollo App Móvil Banca Digital",
    "description": "Aplicación nativa iOS/Android con biometría, pagos P2P y gestión de inversiones.",
    "category": "SALES",
    "status": "ACTIVE",
    "amount": 195000,
    "assignedTo": "usr-user-001",
    "clientName": "Bankinter",
    "clientEmail": "digital@bankinter.com",
    "sku": "SAL-APP-013",
    "region": "Madrid",
    "tags": [
      "app móvil",
      "banca",
      "fintech"
    ],
    "createdAt": "2026-05-15T10:00:00.000Z",
    "updatedAt": "2026-10-17T09:00:00.000Z",
    "source": "REST"
  },
  {
    "id": "sql-014",
    "title": "Rebranding Corporativo 360°",
    "description": "Rediseño integral de identidad visual, guía de marca y materiales corporativos.",
    "category": "MARKETING",
    "status": "COMPLETED",
    "amount": 52000,
    "assignedTo": "usr-admin-001",
    "clientName": "Acciona Energía",
    "clientEmail": "marca@acciona.com",
    "sku": "MKT-BRD-014",
    "region": "Madrid",
    "tags": [
      "branding",
      "identidad",
      "diseño"
    ],
    "createdAt": "2026-04-20T08:30:00.000Z",
    "updatedAt": "2026-08-30T15:00:00.000Z",
    "source": "REST"
  },
  {
    "id": "sql-015",
    "title": "Automatización de Procesos RPA",
    "description": "Implementación de 15 bots RPA con UiPath para automatizar procesos de facturación.",
    "category": "OPERATIONS",
    "status": "ACTIVE",
    "amount": 78000,
    "assignedTo": "usr-user-001",
    "clientName": "ACS Infraestructuras",
    "clientEmail": "rpa@acs.es",
    "sku": "OPS-RPA-015",
    "region": "Madrid",
    "tags": [
      "RPA",
      "automatización",
      "UiPath"
    ],
    "createdAt": "2026-07-10T11:00:00.000Z",
    "updatedAt": "2026-10-16T08:30:00.000Z",
    "source": "REST"
  }
] as unknown as Record[];

/**
 * Dataset en memoria de registros NoSQL para inicialización inmediata del BehaviorSubject.
 */
export const FALLBACK_NOSQL_RECORDS: Record[] = [
  {
    "id": "nosql-001",
    "title": "Monitorización IoT Planta Industrial",
    "description": "Sistema de monitorización en tiempo real de sensores IoT en planta de fabricación.",
    "category": "OPERATIONS",
    "status": "ACTIVE",
    "amount": 93000,
    "assignedTo": "usr-admin-001",
    "clientName": "Seat / Cupra",
    "clientEmail": "iot@seat.es",
    "sku": "OPS-IOT-101",
    "region": "Barcelona",
    "tags": [
      "IoT",
      "industria 4.0",
      "sensores"
    ],
    "createdAt": "2026-06-01T07:00:00.000Z",
    "updatedAt": "2026-10-17T18:00:00.000Z",
    "source": "FIRESTORE"
  },
  {
    "id": "nosql-002",
    "title": "Plataforma E-Learning Corporativa",
    "description": "LMS personalizado con IA adaptativa para formación continua de empleados.",
    "category": "HR",
    "status": "ACTIVE",
    "amount": 47000,
    "assignedTo": "usr-user-001",
    "clientName": "Mapfre",
    "clientEmail": "formacion@mapfre.es",
    "sku": "HR-LMS-102",
    "region": "Madrid",
    "tags": [
      "e-learning",
      "IA",
      "formación"
    ],
    "createdAt": "2026-08-20T09:00:00.000Z",
    "updatedAt": "2026-10-18T08:30:00.000Z",
    "source": "FIRESTORE"
  },
  {
    "id": "nosql-003",
    "title": "Dashboard BI Ejecutivo",
    "description": "Cuadro de mando integral con KPIs en tiempo real para el consejo de dirección.",
    "category": "FINANCE",
    "status": "COMPLETED",
    "amount": 61000,
    "assignedTo": "usr-admin-001",
    "clientName": "Naturgy",
    "clientEmail": "bi@naturgy.com",
    "sku": "FIN-DBI-103",
    "region": "Barcelona",
    "tags": [
      "BI",
      "dashboard",
      "ejecutivo"
    ],
    "createdAt": "2026-05-10T10:00:00.000Z",
    "updatedAt": "2026-09-20T14:00:00.000Z",
    "source": "FIRESTORE"
  },
  {
    "id": "nosql-004",
    "title": "Campaña Influencer Marketing RRSS",
    "description": "Gestión de campaña con 50+ micro-influencers en Instagram y TikTok para mercado español.",
    "category": "MARKETING",
    "status": "PENDING",
    "amount": 28000,
    "assignedTo": "usr-user-001",
    "clientName": "Desigual",
    "clientEmail": "social@desigual.com",
    "sku": "MKT-INF-104",
    "region": "Barcelona",
    "tags": [
      "influencers",
      "RRSS",
      "TikTok"
    ],
    "createdAt": "2026-09-15T11:00:00.000Z",
    "updatedAt": "2026-10-18T10:00:00.000Z",
    "source": "FIRESTORE"
  },
  {
    "id": "nosql-005",
    "title": "Sistema de Gestión de Inventario 4.0",
    "description": "Plataforma con RFID, visión artificial y predicción de demanda mediante deep learning.",
    "category": "OPERATIONS",
    "status": "ACTIVE",
    "amount": 134000,
    "assignedTo": "usr-admin-001",
    "clientName": "Mango Fashion",
    "clientEmail": "supply@mango.com",
    "sku": "OPS-INV-105",
    "region": "Barcelona",
    "tags": [
      "inventario",
      "RFID",
      "deep learning"
    ],
    "createdAt": "2026-07-01T08:00:00.000Z",
    "updatedAt": "2026-10-17T16:30:00.000Z",
    "source": "FIRESTORE"
  },
  {
    "id": "nosql-006",
    "title": "Plataforma Compliance GDPR",
    "description": "Sistema automatizado de gestión de consentimientos y derechos ARCO bajo RGPD.",
    "category": "FINANCE",
    "status": "ACTIVE",
    "amount": 39000,
    "assignedTo": "usr-user-001",
    "clientName": "Endesa",
    "clientEmail": "legal@endesa.es",
    "sku": "FIN-GDP-106",
    "region": "Sevilla",
    "tags": [
      "GDPR",
      "compliance",
      "privacidad"
    ],
    "createdAt": "2026-08-05T10:00:00.000Z",
    "updatedAt": "2026-10-16T12:00:00.000Z",
    "source": "FIRESTORE"
  },
  {
    "id": "nosql-007",
    "title": "Transformación Digital Retail",
    "description": "Proyecto omnicanal integrando POS, e-commerce y app móvil con experiencia unificada.",
    "category": "SALES",
    "status": "PENDING",
    "amount": 156000,
    "assignedTo": "usr-admin-001",
    "clientName": "Cortefiel",
    "clientEmail": "digital@cortefiel.com",
    "sku": "SAL-DIG-107",
    "region": "Madrid",
    "tags": [
      "retail",
      "omnicanal",
      "digital"
    ],
    "createdAt": "2026-09-01T09:00:00.000Z",
    "updatedAt": "2026-10-15T15:00:00.000Z",
    "source": "FIRESTORE"
  },
  {
    "id": "nosql-008",
    "title": "Chatbot IA Atención al Cliente",
    "description": "Asistente virtual con NLP y GPT-4 para soporte multicanal 24/7.",
    "category": "SALES",
    "status": "ACTIVE",
    "amount": 43000,
    "assignedTo": "usr-user-001",
    "clientName": "Vueling Airlines",
    "clientEmail": "soporte@vueling.com",
    "sku": "SAL-BOT-108",
    "region": "Barcelona",
    "tags": [
      "chatbot",
      "NLP",
      "atención al cliente"
    ],
    "createdAt": "2026-08-25T08:30:00.000Z",
    "updatedAt": "2026-10-18T07:00:00.000Z",
    "source": "FIRESTORE"
  },
  {
    "id": "nosql-009",
    "title": "Portal de Gestión de Nóminas",
    "description": "Plataforma SaaS de procesamiento automatizado de nóminas y IRPF para 2.000 empleados.",
    "category": "HR",
    "status": "COMPLETED",
    "amount": 31000,
    "assignedTo": "usr-admin-001",
    "clientName": "Ferrovial",
    "clientEmail": "nominas@ferrovial.com",
    "sku": "HR-NOM-109",
    "region": "Madrid",
    "tags": [
      "nóminas",
      "SaaS",
      "RRHH"
    ],
    "createdAt": "2026-06-15T09:00:00.000Z",
    "updatedAt": "2026-09-25T17:00:00.000Z",
    "source": "FIRESTORE"
  },
  {
    "id": "nosql-010",
    "title": "Ciberseguridad SOC Gestionado",
    "description": "Centro de operaciones de seguridad 24/7 con SIEM, EDR y respuesta a incidentes.",
    "category": "OPERATIONS",
    "status": "ACTIVE",
    "amount": 88000,
    "assignedTo": "usr-user-001",
    "clientName": "Cellnex Telecom",
    "clientEmail": "sec@cellnex.com",
    "sku": "OPS-SOC-110",
    "region": "Barcelona",
    "tags": [
      "ciberseguridad",
      "SOC",
      "SIEM"
    ],
    "createdAt": "2026-07-20T07:30:00.000Z",
    "updatedAt": "2026-10-18T06:00:00.000Z",
    "source": "FIRESTORE"
  }
] as unknown as Record[];

/**
 * Dataset en memoria de usuarios para autenticación instantánea.
 */
export const FALLBACK_USERS: MockUserData[] = [
  {
    "id": "a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d",
    "email": "admin@enterprise.com",
    "password": "Admin2026!",
    "firstName": "Elena",
    "lastName": "Martínez",
    "role": "ADMIN",
    "avatarUrl": "https://api.dicebear.com/9.x/initials/svg?seed=EM&backgroundColor=6366f1",
    "isActive": true,
    "createdAt": "2025-01-15T08:30:00.000Z",
    "lastLoginAt": "2026-10-17T09:15:00.000Z"
  },
  {
    "id": "b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e",
    "email": "user@enterprise.com",
    "password": "User2026!",
    "firstName": "Carlos",
    "lastName": "López",
    "role": "USER",
    "avatarUrl": "https://api.dicebear.com/9.x/initials/svg?seed=CL&backgroundColor=06b6d4",
    "isActive": true,
    "createdAt": "2025-03-22T14:00:00.000Z",
    "lastLoginAt": "2026-10-16T17:45:00.000Z"
  },
  {
    "id": "c3d4e5f6-a7b8-4c9d-0e1f-2a3b4c5d6e7f",
    "email": "javier.ruiz@enterprise.com",
    "password": "Javier2026!",
    "firstName": "Javier",
    "lastName": "Ruiz",
    "role": "USER",
    "avatarUrl": "https://api.dicebear.com/9.x/initials/svg?seed=JR&backgroundColor=10b981",
    "isActive": true,
    "createdAt": "2025-06-10T11:20:00.000Z",
    "lastLoginAt": "2026-10-15T08:30:00.000Z"
  },
  {
    "id": "d4e5f6a7-b8c9-4d0e-1f2a-3b4c5d6e7f8a",
    "email": "maria.garcia@enterprise.com",
    "password": "Maria2026!",
    "firstName": "María",
    "lastName": "García",
    "role": "ADMIN",
    "avatarUrl": "https://api.dicebear.com/9.x/initials/svg?seed=MG&backgroundColor=f43f5e",
    "isActive": true,
    "createdAt": "2025-02-28T09:45:00.000Z",
    "lastLoginAt": "2026-10-17T07:00:00.000Z"
  },
  {
    "id": "e5f6a7b8-c9d0-4e1f-2a3b-4c5d6e7f8a9b",
    "email": "inactive@enterprise.com",
    "password": "Inactive2026!",
    "firstName": "Pedro",
    "lastName": "Sánchez",
    "role": "USER",
    "avatarUrl": "https://api.dicebear.com/9.x/initials/svg?seed=PS&backgroundColor=94a3b8",
    "isActive": false,
    "createdAt": "2025-04-05T16:30:00.000Z",
    "lastLoginAt": "2026-05-20T12:00:00.000Z"
  }
] as unknown as MockUserData[];
