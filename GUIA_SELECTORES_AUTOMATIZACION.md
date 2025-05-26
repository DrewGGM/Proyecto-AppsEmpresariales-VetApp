# Guía de Selectores para Automatización de Pruebas - VetApp

## Índice
1. [Home Page](#home-page)
2. [Login Page](#login-page)
3. [Dashboard](#dashboard)
4. [Gestión de Usuarios](#gestión-de-usuarios)
5. [Formularios de Usuario](#formularios-de-usuario)
6. [Detalle de Usuario](#detalle-de-usuario)
7. [Mi Perfil](#mi-perfil)
8. [Elementos Comunes](#elementos-comunes)
9. [Estados y Validaciones](#estados-y-validaciones)

---

## Home Page
**URL:** `/home`
**Componente:** `HomePageComponent`

### Elementos Principales

| Elemento | Selector CSS | Selector XPath | Descripción |
|----------|-------------|----------------|-------------|
| **Hero Section** |
| Botón "Iniciar Sesión" | `app-button[routerLink="/auth/login"]` | `//app-button[@routerLink="/auth/login"]` | Botón principal de login en hero |
| Logo VetApp | `.hero-text .brand` | `//span[@class="brand"]` | Texto del logo principal |
| Título principal | `.hero-text h1` | `//h1[contains(text(), "VetApp")]` | Título con tagline |
| Descripción | `.hero-description` | `//p[@class="hero-description"]` | Texto descriptivo |
| Botón "Conocer Más" | `app-button[variant="secondary"]` | `//app-button[@variant="secondary"]` | Botón secundario |
| **Footer** |
| Copyright | `.footer-bottom p` | `//p[contains(text(), "© 2025")]` | Texto de copyright |
| Enlaces footer | `.footer-links a` | `//div[@class="footer-links"]//a` | Enlaces del footer |

### Datos de Prueba
```javascript
// No requiere datos específicos para navegación
```

---

## Login Page
**URL:** `/auth/login`
**Componente:** `LoginComponent` + `LoginFormComponent`

### Elementos del Formulario

| Elemento | Selector CSS | Selector XPath | Atributos Importantes |
|----------|-------------|----------------|----------------------|
| **Header** |
| Logo con ícono | `.logo app-icon[name="pets"]` | `//app-icon[@name="pets"]` | Ícono de mascotas |
| Título VetApp | `.logo h1` | `//h1[text()="VetApp"]` | Título principal |
| Subtítulo | `.login-header h2` | `//h2[text()="Iniciar Sesión"]` | Subtítulo del form |
| **Campos de Entrada** |
| Campo Email | `app-form-field[formControlName="email"] input` | `//input[@formControlName="email"]` | type="email" |
| Label Email | `app-form-field[formControlName="email"] label` | `//label[contains(text(), "Correo")]` | Con ícono email |
| Campo Contraseña | `app-form-field[formControlName="password"] input` | `//input[@formControlName="password"]` | type="password" |
| Label Contraseña | `app-form-field[formControlName="password"] label` | `//label[contains(text(), "Contraseña")]` | Con ícono lock |
| **Toggle Contraseña** |
| Botón mostrar/ocultar | `.password-toggle` | `//button[@class="password-toggle"]` | Botón del ojo |
| Ícono visibility | `app-icon[name="visibility"]` | `//app-icon[@name="visibility"]` | Cuando está oculta |
| Ícono visibility_off | `app-icon[name="visibility_off"]` | `//app-icon[@name="visibility_off"]` | Cuando está visible |
| **Opciones** |
| Checkbox "Recordarme" | `#remember` | `//input[@id="remember"]` | type="checkbox" |
| Label "Recordarme" | `label[for="remember"]` | `//label[@for="remember"]` | Texto del checkbox |
| Mensaje "Olvidaste contraseña" | `.forgot-password-message` | `//div[@class="forgot-password-message"]` | Mensaje informativo |
| **Botón Submit** |
| Botón "Iniciar Sesión" | `app-button[submit="true"]` | `//app-button[@submit="true"]` | Botón principal |
| Texto normal | `span:not(*[ngIf])` | `//span[text()="Iniciar Sesión"]` | Estado normal |
| Texto cargando | `span[*ngIf="isLoading"]` | `//span[text()="Iniciando sesión..."]` | Estado loading |
| Spinner | `app-spinner` | `//app-spinner` | Indicador de carga |

### Estados de Validación

| Estado | Selector CSS | Descripción |
|--------|-------------|-------------|
| Campo email vacío | `app-form-field[formControlName="email"].form-field-error` | Borde rojo + mensaje |
| Email inválido | `.error-message` | Mensaje "El correo no es válido" |
| Campo válido | `.success-message` | Borde verde + check |
| Formulario inválido | `app-button[disabled]` | Botón deshabilitado |

### Datos de Prueba
```javascript
const credencialesValidas = {
  email: "admin@vetapp.com",
  password: "Admin123!",
  remember: true
};

const credencialesInvalidas = {
  email: "admin@vetapp.com", 
  password: "WrongPass123"
};

const emailInvalido = "adminvetapp"; // Sin @
```

---

## Dashboard
**URL:** `/dashboard`
**Componente:** `DashboardMainComponent`

### Elementos Principales

| Elemento | Selector CSS | Selector XPath | Descripción |
|----------|-------------|----------------|-------------|
| **Welcome Section** |
| Saludo dinámico | `.welcome-text h1` | `//h1[contains(text(), "Buenos días") or contains(text(), "Buenas tardes")]` | Saludo personalizado |
| Nombre usuario | `.welcome-text h1` | `//h1[contains(text(), "Andrea")]` | Nombre del usuario |
| Fecha actual | `.current-date span` | `//span[contains(@class, "current-date")]` | Fecha formateada |
| Botón actualizar | `app-button[variant="secondary"]` | `//app-button[.//span[text()="Actualizar"]]` | Refresh data |
| **Quick Stats** |
| Stats cards | `.stats-grid .stat-card` | `//div[@class="stat-card"]` | Tarjetas estadísticas |
| Total usuarios | `.stat-card:has(.stat-label:contains("Total"))` | `//div[@class="stat-card"][.//div[contains(text(), "Total")]]` | Card usuarios |
| Usuarios activos | `.stat-card:has(.stat-label:contains("Activos"))` | `//div[@class="stat-card"][.//div[contains(text(), "Activos")]]` | Card activos |
| Veterinarios | `.stat-card:has(.stat-label:contains("Veterinarios"))` | `//div[@class="stat-card"][.//div[contains(text(), "Veterinarios")]]` | Card veterinarios |
| **Quick Actions** |
| Sección acciones | `.quick-actions-section` | `//div[@class="quick-actions-section"]` | Contenedor acciones |
| Card "Usuarios" | `.action-card:has(h3:contains("Nuevo Usuario"))` | `//div[@class="action-card"][.//h3[contains(text(), "Nuevo Usuario")]]` | Solo para ADMIN |
| Card "Mi Perfil" | `.action-card:has(h3:contains("Mi Perfil"))` | `//div[@class="action-card"][.//h3[text()="Mi Perfil"]]` | Para todos |
| Badge "En desarrollo" | `.development-badge` | `//span[@class="development-badge"]` | Funciones no implementadas |
| **Recent Activity** |
| Lista actividad | `.activity-list` | `//div[@class="activity-list"]` | Contenedor actividades |
| Item actividad | `.activity-item` | `//div[@class="activity-item"]` | Item individual |
| Sin actividad | `.no-activity` | `//div[@class="no-activity"]` | Estado vacío |

### Permisos por Rol

| Rol | Elementos Visibles | Selectores Específicos |
|-----|-------------------|----------------------|
| **ADMIN** | Botón "Usuarios", todas las stats | `.action-card[routerLink="/usuarios/nuevo"]` |
| **VETERINARIAN** | Sin botón usuarios, stats limitadas | `:not(.action-card[routerLink="/usuarios/nuevo"])` |
| **RECEPTIONIST** | Sin botón usuarios, stats limitadas | `:not(.action-card[routerLink="/usuarios/nuevo"])` |

---

## Gestión de Usuarios
**URL:** `/usuarios`
**Componente:** `UserListComponent`

### Header y Navegación

| Elemento | Selector CSS | Selector XPath | Descripción |
|----------|-------------|----------------|-------------|
| **Page Header** |
| Título página | `.page-header h1` | `//h1[text()="Gestión de Usuarios"]` | Título principal |
| Subtítulo | `.page-header p` | `//p[text()="Administra todos los usuarios del sistema"]` | Descripción |
| Botón "Actualizar" | `app-button[variant="secondary"]` | `//app-button[.//span[text()="Actualizar"]]` | Refresh lista |
| Botón "Nuevo Usuario" | `app-button[variant="primary"]` | `//app-button[.//span[text()="Nuevo Usuario"]]` | Crear usuario |
| **Breadcrumb** |
| Enlace "Inicio" | `.breadcrumb a[routerLink="/dashboard"]` | `//a[@routerLink="/dashboard"]` | Link al dashboard |
| Texto "Usuarios" | `.breadcrumb span` | `//span[text()="Usuarios"]` | Página actual |

### Filtros de Búsqueda

| Elemento | Selector CSS | Selector XPath | Descripción |
|----------|-------------|----------------|-------------|
| **Selector Tipo Búsqueda** |
| Dropdown tipo | `#searchType` | `//select[@id="searchType"]` | Select principal |
| Opción "General" | `option[value="general"]` | `//option[@value="general"]` | Búsqueda general |
| Opción "ID" | `option[value="id"]` | `//option[@value="id"]` | Por ID específico |
| Opción "Email" | `option[value="email"]` | `//option[@value="email"]` | Por email |
| Descripción tipo | `.search-description` | `//small[@class="search-description"]` | Texto explicativo |
| **Filtros Dinámicos** |
| Campo búsqueda texto | `input[placeholder*="Buscar"]` | `//input[contains(@placeholder, "Buscar")]` | Input texto |
| Combo Rol | `select[formControlName="selectedRole"]` | `//select[@formControlName="selectedRole"]` | Filtro por rol |
| Combo Estado | `select[formControlName="selectedStatus"]` | `//select[@formControlName="selectedStatus"]` | Activo/Inactivo |
| Botón "Buscar" | `.search-btn` | `//button[contains(@class, "search-btn")]` | Ejecutar búsqueda |
| Botón "Mostrar todos" | `.show-all-btn` | `//button[@class="show-all-btn"]` | Limpiar filtros |

### Stats Cards

| Elemento | Selector CSS | Selector XPath | Descripción |
|----------|-------------|----------------|-------------|
| Card Total | `.stat-card:has(.stat-label:contains("Total"))` | `//div[@class="stat-card"][.//div[text()="Total Usuarios"]]` | Total usuarios |
| Card Activos | `.stat-card:has(.stat-icon.active)` | `//div[@class="stat-card"][.//div[@class="stat-icon active"]]` | Usuarios activos |
| Card Veterinarios | `.stat-card:has(.stat-icon.veterinarian)` | `//div[@class="stat-card"][.//div[@class="stat-icon veterinarian"]]` | Veterinarios |
| Valor numérico | `.stat-value` | `//div[@class="stat-value"]` | Número en la card |

### Grid de Usuarios

| Elemento | Selector CSS | Selector XPath | Descripción |
|----------|-------------|----------------|-------------|
| **User Cards** |
| Grid contenedor | `.users-grid` | `//div[@class="users-grid"]` | Contenedor grid |
| Card usuario | `.user-card` | `//div[@class="user-card"]` | Card individual |
| Avatar usuario | `.user-avatar app-avatar` | `//app-avatar` | Avatar con estado |
| Nombre completo | `.user-details h3` | `//div[@class="user-details"]//h3` | Nombre + apellido |
| Rol usuario | `.user-role` | `//p[@class="user-role"]` | Rol formateado |
| Email usuario | `.user-email` | `//p[@class="user-email"]` | Email del usuario |
| **Estados** |
| Badge "Activo" | `.user-status.active` | `//div[@class="user-status active"]` | Badge verde |
| Badge "Inactivo" | `.user-status:not(.active)` | `//div[@class="user-status"][not(contains(@class, "active"))]` | Badge gris |
| Último acceso | `.user-meta small` | `//small[contains(text(), "Último acceso")]` | Fecha último acceso |
| **Acciones en Hover** |
| Botón editar | `.action-btn:has(app-icon[name="edit"])` | `//button[@class="action-btn"][.//app-icon[@name="edit"]]` | Ícono lápiz |
| Botón activar | `.action-btn.success` | `//button[@class="action-btn success"]` | Para usuarios inactivos |
| Botón desactivar | `.action-btn.warning` | `//button[@class="action-btn warning"]` | Para usuarios activos |
| Botón eliminar | `.action-btn.danger` | `//button[@class="action-btn danger"]` | Ícono papelera |

### Paginación

| Elemento | Selector CSS | Selector XPath | Descripción |
|----------|-------------|----------------|-------------|
| **Info Paginación** |
| Texto información | `.pagination-info p` | `//p[contains(text(), "Mostrando")]` | "Mostrando X de Y" |
| **Controles** |
| Botón "Primera" | `.pagination-btn:has(app-icon[name="first_page"])` | `//button[.//app-icon[@name="first_page"]]` | Primera página |
| Botón "Anterior" | `.pagination-btn:has(app-icon[name="chevron_left"])` | `//button[.//app-icon[@name="chevron_left"]]` | Página anterior |
| Números página | `.page-number-btn` | `//button[@class="page-number-btn"]` | Botones numerados |
| Página activa | `.page-number-btn.active` | `//button[@class="page-number-btn active"]` | Página actual |
| Botón "Siguiente" | `.pagination-btn:has(app-icon[name="chevron_right"])` | `//button[.//app-icon[@name="chevron_right"]]` | Página siguiente |
| Botón "Última" | `.pagination-btn:has(app-icon[name="last_page"])` | `//button[.//app-icon[@name="last_page"]]` | Última página |

### Estados Especiales

| Estado | Selector CSS | Descripción |
|--------|-------------|-------------|
| **Loading** |
| Spinner carga | `.loading-section app-spinner` | Spinner grande |
| Texto carga | `.loading-section p` | "Cargando usuarios..." |
| **Estado Vacío** |
| Ícono vacío | `.empty-state .empty-icon` | Ícono people_outline |
| Título vacío | `.empty-state h3` | "No se encontraron usuarios" |
| Botón crear | `.empty-state app-button` | "Crear primer usuario" |

### Datos de Prueba
```javascript
const filtrosBusqueda = {
  general: {
    texto: "Juan",
    rol: "VETERINARIAN",
    estado: true
  },
  porId: {
    id: "5"
  },
  porEmail: {
    email: "admin@vetapp.com"
  }
};
```

---

## Formularios de Usuario
**URL:** `/usuarios/nuevo` | `/usuarios/{id}/editar`
**Componente:** `UserCreateEditComponent`

### Header del Formulario

| Elemento | Selector CSS | Selector XPath | Descripción |
|----------|-------------|----------------|-------------|
| Título crear | `h1:contains("Crear Nuevo Usuario")` | `//h1[text()="Crear Nuevo Usuario"]` | Modo creación |
| Título editar | `h1:contains("Editar Usuario")` | `//h1[text()="Editar Usuario"]` | Modo edición |
| Breadcrumb | `.breadcrumb` | `//div[@class="breadcrumb"]` | Navegación |

### Secciones del Formulario

| Sección | Selector CSS | Selector XPath | Descripción |
|---------|-------------|----------------|-------------|
| **Información Personal** |
| Header sección | `.form-section-header:has(app-icon[name="person"])` | `//div[@class="form-section-header"][.//app-icon[@name="person"]]` | Sección 1 |
| Campo Nombre | `input[formControlName="name"]` | `//input[@formControlName="name"]` | Nombre requerido |
| Campo Apellido | `input[formControlName="lastName"]` | `//input[@formControlName="lastName"]` | Apellido requerido |
| **Email** |
| Header email | `.form-section-header:has(app-icon[name="email"])` | `//div[@class="form-section-header"][.//app-icon[@name="email"]]` | Sección 2 |
| Campo Email | `input[formControlName="email"]` | `//input[@formControlName="email"]` | Email único |
| **Seguridad** |
| Header seguridad | `.form-section-header:has(app-icon[name="security"])` | `//div[@class="form-section-header"][.//app-icon[@name="security"]]` | Sección 3 |
| Campo Contraseña | `input[formControlName="password"]` | `//input[@formControlName="password"]` | Password |
| Campo Confirmar | `input[formControlName="confirmPassword"]` | `//input[@formControlName="confirmPassword"]` | Confirmación |
| **Rol y Permisos** |
| Header rol | `.form-section-header:has(app-icon[name="admin_panel_settings"])` | `//div[@class="form-section-header"][.//app-icon[@name="admin_panel_settings"]]` | Sección 4 |
| Select Rol | `select[formControlName="role"]` | `//select[@formControlName="role"]` | Dropdown roles |

### Validaciones de Campos

| Campo | Estado Error | Selector CSS | Mensaje |
|-------|-------------|-------------|---------|
| **Nombre** |
| Vacío | `.form-field:has(input[formControlName="name"]) .error-message` | "El nombre es requerido" |
| Muy corto | `.form-field:has(input[formControlName="name"]) .error-message` | "Mínimo 3 caracteres" |
| **Email** |
| Duplicado | `.form-field:has(input[formControlName="email"]) .error-message.server-error` | "Este email ya está registrado por otro usuario" |
| Formato | `.form-field:has(input[formControlName="email"]) .error-message` | "El correo no es válido" |
| Error servidor | `.form-field:has(input[formControlName="email"]) .error-message.server-error` | Mensaje específico del backend |
| **Contraseña** |
| Débil | `.form-field:has(input[formControlName="password"]) .error-message` | Lista de requisitos |
| No coincide | `.form-field:has(input[formControlName="confirmPassword"]) .error-message` | "Las contraseñas no coinciden" |

### Estados Visuales

| Estado | Selector CSS | Descripción |
|--------|-------------|-------------|
| Campo válido | `.form-input.success` | Borde verde |
| Campo error | `.form-input.error` | Borde rojo |
| Mensaje éxito | `.success-message` | Check verde + texto |
| Mensaje error | `.error-message` | X rojo + texto |
| Error servidor | `.error-message.server-error` | Ícono warning + fondo amarillo |

### Tipos de Errores del Servidor

| Tipo Error | Selector CSS | Ícono | Color | Descripción |
|------------|-------------|-------|-------|-------------|
| Validación frontend | `.error-message:not(.server-error)` | `error` | Rojo | Errores de validación del formulario |
| Error servidor | `.error-message.server-error` | `warning` | Amarillo | Errores específicos del backend |
| Email duplicado | `.error-message.server-error` | `warning` | Amarillo | Conflicto 409 - Email ya existe |
| Datos inválidos | `.error-message.server-error` | `warning` | Amarillo | Error 400/422 con detalles |

### Botones de Acción

| Elemento | Selector CSS | Selector XPath | Descripción |
|----------|-------------|----------------|-------------|
| Botón Crear | `app-button:has(span:contains("Crear Usuario"))` | `//app-button[.//span[text()="Crear Usuario"]]` | Modo creación |
| Botón Actualizar | `app-button:has(span:contains("Actualizar"))` | `//app-button[.//span[text()="Actualizar"]]` | Modo edición |
| Botón Cancelar | `app-button:has(span:contains("Cancelar"))` | `//app-button[.//span[text()="Cancelar"]]` | Cancelar cambios |
| Estado loading | `app-button[loading="true"]` | `//app-button[@loading="true"]` | Con spinner |

### Datos de Prueba
```javascript
const usuarioNuevo = {
  name: "Carlos",
  lastName: "Pérez", 
  email: "carlos@vet.com",
  password: "Carlos123!",
  confirmPassword: "Carlos123!",
  role: "RECEPTIONIST"
};

const validacionesError = {
  nombreCorto: "Jo",
  emailDuplicado: "admin@vetapp.com",
  passwordDebil: "123",
  passwordNoCoincide: "Test456!"
};
```

---

## Detalle de Usuario
**URL:** `/usuarios/{id}`
**Componente:** `UserDetailComponent`

### Header y Navegación

| Elemento | Selector CSS | Selector XPath | Descripción |
|----------|-------------|----------------|-------------|
| Botón volver | `.back-button` | `//button[@class="back-button"]` | Flecha atrás |
| Título página | `.page-header h1` | `//h1[text()="Detalle de Usuario"]` | Título |
| Breadcrumb usuario | `.breadcrumb span:last-child` | `//span[contains(text(), "Andrea")]` | Nombre en breadcrumb |

### Profile Card

| Elemento | Selector CSS | Selector XPath | Descripción |
|----------|-------------|----------------|-------------|
| **Status y Acciones** |
| Indicador estado | `app-status-indicator` | `//app-status-indicator` | Verde/Gris |
| Botón "Editar" | `app-button:has(span:contains("Editar"))` | `//app-button[.//span[text()="Editar"]]` | Solo con permisos |
| Botón "Eliminar" | `app-button:has(span:contains("Eliminar"))` | `//app-button[.//span[text()="Eliminar"]]` | Solo con permisos |
| **Información Principal** |
| Avatar grande | `app-user-avatar[size="large"]` | `//app-user-avatar[@size="large"]` | Avatar principal |
| Nombre completo | `.user-name` | `//div[@class="user-name"]` | Nombre + apellido |
| Badge rol | `.user-role` | `//div[@class="user-role"]` | Badge del rol |
| Email | `.contact-item:has(app-icon[name="email"])` | `//div[@class="contact-item"][.//app-icon[@name="email"]]` | Email contacto |
| Miembro desde | `.contact-item:has(app-icon[name="calendar_today"])` | `//div[@class="contact-item"][.//app-icon[@name="calendar_today"]]` | Fecha registro |
| Último acceso | `.contact-item:has(app-icon[name="access_time"])` | `//div[@class="contact-item"][.//app-icon[@name="access_time"]]` | Última conexión |

### Estadísticas (Solo Veterinarios)

| Elemento | Selector CSS | Selector XPath | Descripción |
|----------|-------------|----------------|-------------|
| Card estadísticas | `.stats-card` | `//div[@class="stats-card"]` | Solo veterinarios |
| Barra consultas | `.stat-bar:has(.stat-label:contains("Consultas"))` | `//div[@class="stat-bar"][.//span[contains(text(), "Consultas")]]` | Progreso consultas |
| Barra vacunaciones | `.stat-bar:has(.stat-label:contains("Vacunaciones"))` | `//div[@class="stat-bar"][.//span[contains(text(), "Vacunaciones")]]` | Progreso vacunas |
| Barra citas | `.stat-bar:has(.stat-label:contains("Citas"))` | `//div[@class="stat-bar"][.//span[contains(text(), "Citas")]]` | Progreso citas |

### Capacidades y Permisos

| Elemento | Selector CSS | Selector XPath | Descripción |
|----------|-------------|----------------|-------------|
| Grid capacidades | `.capabilities-grid` | `//div[@class="capabilities-grid"]` | Grid permisos |
| Categoría permisos | `.capability-category` | `//div[@class="capability-category"]` | Grupo permisos |
| Permiso individual | `.capability-item` | `//div[@class="capability-item"]` | Permiso específico |
| Check verde | `.capability-icon` | `//div[@class="capability-icon"]` | Ícono check |

### Actividad Reciente

| Elemento | Selector CSS | Selector XPath | Descripción |
|----------|-------------|----------------|-------------|
| Lista actividad | `.activity-list` | `//div[@class="activity-list"]` | Contenedor |
| Item actividad | `.activity-item` | `//div[@class="activity-item"]` | Item individual |
| Ícono actividad | `.activity-icon` | `//div[@class="activity-icon"]` | Ícono coloreado |
| Título actividad | `.activity-title` | `//div[@class="activity-title"]` | Título acción |
| Descripción | `.activity-description` | `//div[@class="activity-description"]` | Descripción |
| Timestamp | `.activity-time` | `//div[@class="activity-time"]` | Tiempo relativo |

### Estados de Error

| Estado | Selector CSS | Descripción |
|--------|-------------|-------------|
| Usuario no encontrado | `.error-message:contains("no encontrado")` | Error 404 |
| Botón volver | `app-button:has(span:contains("volver"))` | Regreso al listado |

---

## Mi Perfil
**URL:** `/usuarios/mi-perfil`
**Componente:** `MyProfileComponent`

### Información Personal

| Elemento | Selector CSS | Selector XPath | Descripción |
|----------|-------------|----------------|-------------|
| **Avatar y Foto** |
| Avatar principal | `.profile-avatar app-user-avatar` | `//app-user-avatar` | Avatar grande |
| Botón cámara | `.photo-upload-btn` | `//button[@class="photo-upload-btn"]` | Cambiar foto |
| Input file | `input[type="file"]` | `//input[@type="file"]` | Selector archivo |
| **Información** |
| Botón "Editar Perfil" | `app-button:has(span:contains("Editar Perfil"))` | `//app-button[.//span[text()="Editar Perfil"]]` | Activar edición |
| Botón "Cambiar Contraseña" | `app-button:has(span:contains("Cambiar Contraseña"))` | `//app-button[.//span[text()="Cambiar Contraseña"]]` | Mostrar form password |

### Formulario Edición Inline

| Elemento | Selector CSS | Selector XPath | Descripción |
|----------|-------------|----------------|-------------|
| Campo nombre | `input[formControlName="name"]` | `//input[@formControlName="name"]` | Edición nombre |
| Campo apellido | `input[formControlName="lastName"]` | `//input[@formControlName="lastName"]` | Edición apellido |
| Campo email | `input[formControlName="email"]` | `//input[@formControlName="email"]` | Edición email |
| Botón "Guardar" | `.submit-btn:contains("Guardar")` | `//button[contains(text(), "Guardar")]` | Guardar cambios |
| Botón "Cancelar" | `.cancel-btn:contains("Cancelar")` | `//button[contains(text(), "Cancelar")]` | Cancelar edición |

### Formulario Cambio Contraseña

| Elemento | Selector CSS | Selector XPath | Descripción |
|----------|-------------|----------------|-------------|
| **Card Contraseña** |
| Card container | `.password-change-card` | `//div[@class="password-change-card"]` | Contenedor form |
| Campo actual | `input[formControlName="currentPassword"]` | `//input[@formControlName="currentPassword"]` | Password actual |
| Campo nueva | `input[formControlName="newPassword"]` | `//input[@formControlName="newPassword"]` | Nueva password |
| Campo confirmar | `input[formControlName="confirmPassword"]` | `//input[@formControlName="confirmPassword"]` | Confirmar nueva |
| Botón cambiar | `.submit-btn:contains("Cambiar")` | `//button[contains(text(), "Cambiar")]` | Ejecutar cambio |

### Estadísticas Personales (Veterinarios)

| Elemento | Selector CSS | Selector XPath | Descripción |
|----------|-------------|----------------|-------------|
| Card "Mis Estadísticas" | `.my-stats-card` | `//div[@class="my-stats-card"]` | Solo veterinarios |
| Barras progreso | `.progress-bar` | `//div[@class="progress-bar"]` | Barras estadísticas |

### Logout

| Elemento | Selector CSS | Selector XPath | Descripción |
|----------|-------------|----------------|-------------|
| Botón "Cerrar Sesión" | `app-button:has(span:contains("Cerrar Sesión"))` | `//app-button[.//span[text()="Cerrar Sesión"]]` | Logout |
| Modal confirmación | `.confirmation-modal` | `//div[@class="confirmation-modal"]` | Modal logout |

### Validaciones

| Campo | Error | Selector CSS | Mensaje |
|-------|-------|-------------|---------|
| Foto | Tamaño | `.error-message:contains("2MB")` | "No debe exceder 2MB" |
| Password | Actual incorrecta | `.field-feedback .error-message` | Error password actual |

---

## Elementos Comunes

### Componentes Reutilizables

| Componente | Selector CSS | Selector XPath | Descripción |
|------------|-------------|----------------|-------------|
| **Botones** |
| Botón primario | `app-button[variant="primary"]` | `//app-button[@variant="primary"]` | Azul principal |
| Botón secundario | `app-button[variant="secondary"]` | `//app-button[@variant="secondary"]` | Gris secundario |
| Botón peligro | `app-button[variant="danger"]` | `//app-button[@variant="danger"]` | Rojo eliminar |
| Botón loading | `app-button[loading="true"]` | `//app-button[@loading="true"]` | Con spinner |
| Botón deshabilitado | `app-button[disabled]` | `//app-button[@disabled]` | Deshabilitado |
| **Iconos** |
| Ícono material | `app-icon[name="nombre"]` | `//app-icon[@name="nombre"]` | Íconos Material |
| **Spinners** |
| Spinner pequeño | `app-spinner[size="small"]` | `//app-spinner[@size="small"]` | Loading pequeño |
| Spinner grande | `app-spinner[size="large"]` | `//app-spinner[@size="large"]` | Loading página |
| **Avatares** |
| Avatar pequeño | `app-avatar[size="small"]` | `//app-avatar[@size="small"]` | 32px |
| Avatar mediano | `app-avatar[size="medium"]` | `//app-avatar[@size="medium"]` | 48px |
| Avatar grande | `app-avatar[size="large"]` | `//app-avatar[@size="large"]` | 64px |

### Navegación y Layout

| Elemento | Selector CSS | Selector XPath | Descripción |
|----------|-------------|----------------|-------------|
| **Dashboard Layout** |
| Sidebar | `.sidebar` | `//div[@class="sidebar"]` | Menú lateral |
| Navbar | `.navbar` | `//nav[@class="navbar"]` | Barra superior |
| Avatar navbar | `.navbar app-avatar` | `//nav[@class="navbar"]//app-avatar` | Avatar usuario |
| Menú dropdown | `.user-menu` | `//div[@class="user-menu"]` | Menú usuario |
| **Breadcrumbs** |
| Contenedor | `.breadcrumb` | `//div[@class="breadcrumb"]` | Navegación |
| Enlace | `.breadcrumb a` | `//div[@class="breadcrumb"]//a` | Link navegable |
| Separador | `.breadcrumb app-icon[name="chevron_right"]` | `//app-icon[@name="chevron_right"]` | Separador > |

### Modales y Confirmaciones

| Elemento | Selector CSS | Selector XPath | Descripción |
|----------|-------------|----------------|-------------|
| **Modal Base** |
| Overlay | `.modal-overlay` | `//div[@class="modal-overlay"]` | Fondo modal |
| Contenido | `.modal-content` | `//div[@class="modal-content"]` | Contenido modal |
| Título | `.modal-title` | `//h3[@class="modal-title"]` | Título modal |
| **Confirmación** |
| Botón confirmar | `.confirm-btn` | `//button[@class="confirm-btn"]` | Confirmar acción |
| Botón cancelar | `.cancel-btn` | `//button[@class="cancel-btn"]` | Cancelar acción |
| Checkbox permanente | `input[type="checkbox"]:has(+ label:contains("permanente"))` | `//input[@type="checkbox"][following-sibling::label[contains(text(), "permanente")]]` | Eliminar permanente |

### Toasts y Notificaciones

| Tipo | Selector CSS | Selector XPath | Descripción |
|------|-------------|----------------|-------------|
| Toast éxito | `.toast.success` | `//div[@class="toast success"]` | Verde éxito |
| Toast error | `.toast.error` | `//div[@class="toast error"]` | Rojo error |
| Toast warning | `.toast.warning` | `//div[@class="toast warning"]` | Amarillo advertencia |
| Toast info | `.toast.info` | `//div[@class="toast info"]` | Azul información |

---

## Estados y Validaciones

### Estados de Carga

| Estado | Selector CSS | Descripción |
|--------|-------------|-------------|
| Página cargando | `.loading-section` | Spinner + texto |
| Botón cargando | `app-button[loading="true"]` | Botón con spinner |
| Lista cargando | `.loading-section:has(p:contains("Cargando usuarios"))` | Carga específica |

### Estados de Error

| Error | Selector CSS | Mensaje Esperado |
|-------|-------------|------------------|
| Campo requerido | `.error-message:contains("requerido")` | "El campo es requerido" |
| Email inválido | `.error-message:contains("válido")` | "El correo no es válido" |
| Password débil | `.error-message:contains("caracteres")` | "Mínimo 8 caracteres" |
| No coincide | `.error-message:contains("coinciden")` | "Las contraseñas no coinciden" |
| Email duplicado | `.error-message:contains("registrado")` | "Este email ya está registrado" |

### Estados de Éxito

| Éxito | Selector CSS | Mensaje Esperado |
|-------|-------------|------------------|
| Campo válido | `.success-message` | Check verde |
| Login exitoso | `.toast.success:contains("exitoso")` | "Login exitoso" |
| Usuario creado | `.toast.success:contains("creado")` | "Usuario creado exitosamente" |
| Datos guardados | `.toast.success:contains("guardado")` | "Datos guardados correctamente" |

### Estados Vacíos

| Estado | Selector CSS | Descripción |
|--------|-------------|-------------|
| Sin usuarios | `.empty-state:has(.empty-icon)` | Lista vacía |
| Sin actividad | `.no-activity` | Sin actividad reciente |
| Sin resultados | `.empty-state:has(h3:contains("encontraron"))` | Búsqueda sin resultados |

---

## Responsive y Accesibilidad

### Breakpoints

| Tamaño | CSS Media Query | Descripción |
|--------|----------------|-------------|
| Móvil | `@media (max-width: 768px)` | Diseño móvil |
| Tablet | `@media (max-width: 1024px)` | Diseño tablet |
| Desktop | `@media (min-width: 1025px)` | Diseño escritorio |

### Navegación por Teclado

| Elemento | Atributo | Descripción |
|----------|----------|-------------|
| Botones | `tabindex="0"` | Navegable con Tab |
| Links | `tabindex="0"` | Navegable con Tab |
| Inputs | `tabindex="0"` | Navegable con Tab |
| Focus visible | `:focus` | Outline visible |

### ARIA Labels

| Elemento | Atributo ARIA | Valor |
|----------|---------------|-------|
| Toggle password | `aria-label` | "Mostrar/Ocultar contraseña" |
| Botón eliminar | `aria-label` | "Eliminar usuario" |
| Campo requerido | `aria-required` | "true" |
| Estado error | `aria-invalid` | "true" |

---

## Configuración de Automatización

### Waits Recomendados

```javascript
// Esperas explícitas recomendadas
const waits = {
  pageLoad: 10000,        // Carga de página
  apiResponse: 5000,      // Respuesta API
  elementVisible: 3000,   // Elemento visible
  animation: 1000,        // Animaciones CSS
  toast: 5000            // Notificaciones
};
```

### Datos de Prueba Centralizados

```javascript
const testData = {
  users: {
    admin: {
      email: "admin@vetapp.com",
      password: "Admin123!",
      role: "ADMIN"
    },
    veterinarian: {
      email: "vet@vetapp.com", 
      password: "Vet123!",
      role: "VETERINARIAN"
    },
    receptionist: {
      email: "recep@vetapp.com",
      password: "Recep123!",
      role: "RECEPTIONIST"
    }
  },
  newUser: {
    name: "Carlos",
    lastName: "Pérez",
    email: "carlos@test.com",
    password: "Carlos123!",
    role: "RECEPTIONIST"
  }
};
```

### URLs de Prueba

```javascript
const urls = {
  home: "/home",
  login: "/auth/login", 
  dashboard: "/dashboard",
  users: "/usuarios",
  userCreate: "/usuarios/nuevo",
  userEdit: "/usuarios/{id}/editar",
  userDetail: "/usuarios/{id}",
  myProfile: "/usuarios/mi-perfil"
};
```

---

## Notas Importantes

1. **Selectores Dinámicos**: Algunos selectores contienen IDs dinámicos que cambian en cada ejecución
2. **Estados Asíncronos**: Muchas acciones requieren esperar respuestas de API
3. **Permisos por Rol**: Los elementos visibles cambian según el rol del usuario autenticado
4. **Validaciones en Tiempo Real**: Los mensajes de error aparecen mientras el usuario escribe
5. **Animaciones CSS**: Algunos elementos tienen transiciones que pueden afectar la automatización

Esta guía debe actualizarse cuando se modifiquen los componentes o se agreguen nuevas funcionalidades. 