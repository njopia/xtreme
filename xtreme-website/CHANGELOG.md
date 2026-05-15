# Changelog — Xtreme L4D2

Historial de cambios del proyecto. El formato sigue [Keep a Changelog](https://keepachangelog.com/es/).

---

## [0.4.0] — 2026-05-15 — Build de producción optimizado

### Añadido
- `angular.json` — configuración `production` explícita y completa:
  - `optimization.scripts: true` — minificación JS via esbuild
  - `optimization.styles.minify: true` — minificación CSS
  - `optimization.styles.inlineCritical: true` — inyección de CSS crítico en el HTML (Critters) para mejorar FCP
  - `optimization.fonts.inline: true` — descarga e inlining de CSS de Google Fonts en build time, elimina la petición bloqueante de renderizado
  - `sourceMap: false` — sin source maps en producción
  - `namedChunks: false` — nombres de chunks como hashes (más pequeños)
  - `extractLicenses: true` — licencias de terceros extraídas a archivo separado
  - `subresourceIntegrity: true` — atributo `integrity` en todos los `<script>` y `<link>` del HTML generado
  - `outputHashing: 'all'` — hash de contenido en todos los archivos para cache infinito seguro
- `angular.json` — configuración `analysis` para inspección de bundles:
  - Source maps habilitados (`scripts: true`, `vendor: true`)
  - `namedChunks: true` para identificar cada chunk por nombre
  - Sin extracción de licencias (innecesaria en análisis)
  - `outputHashing: 'none'` para archivos legibles
- `package.json` — scripts nuevos:
  - `build:prod` → `ng build --configuration production`
  - `build:analyze` → `ng build --configuration analysis` (incluye source maps para `source-map-explorer`)
  - `build` → ahora apunta explícitamente a `development` (evita builds de producción accidentales)
  - `start:prod` → `ng serve --configuration production`
- `build-prod.ps1` — script PowerShell para Windows:
  - Muestra versiones de Node / npm / Angular CLI al inicio
  - `npm ci --prefer-offline` para instalación reproducible (saltable con `-SkipInstall`)
  - Limpia `dist/` antes de compilar
  - Ejecuta `ng build --configuration production`
  - Tabla de archivos de salida con tamaños individuales (JS en amarillo, CSS en cian)
  - Totales de JS, CSS y todos los assets
  - Estimación de tamaño gzip (~28% JS, ~25% CSS)
  - Indicaciones de pasos de despliegue al finalizar
  - Flag `-Analyze` para ejecutar el config de análisis
- `build-prod.sh` — script Bash equivalente para Debian/Linux:
  - Mismas funcionalidades que el PS1
  - Flags `--skip-install` y `--analyze`
  - Colores ANSI, cálculo de bytes con `awk`/`stat`
  - Manejo de la estructura `dist/<name>/browser/` de Angular 17+

### Resultados de producción (referencia)
| Métrica | Valor |
|---|---|
| Initial bundle (raw) | 308 kB |
| Initial bundle (gzip estimado) | ~85 kB |
| Chunk más pesado (lazy) | admin: 134 kB raw / 27 kB gzip |
| CSS global | 10 kB raw |

---

## [0.3.0] — 2026-05-15 — Sidebar colapsable

### Añadido
- `sidebar.component.ts` — nuevo input `isCollapsed` y output `collapseToggle`
  - Importa `MatTooltipModule` para tooltips en modo rail
- `sidebar.component.html` — template dual por sección:
  - Modo expandido: estructura original con texto e íconos
  - Modo colapsado (rail 64 px): ítems sin texto, solo ícono, con tooltip `matTooltipPosition="right"`
  - Servidores colapsados: muestra solo el dot de estado; tooltip con nombre y conteo de jugadores
  - Foros colapsados: `<a>` planos con ícono, fuera de `mat-nav-list` para evitar conflictos con estilos de Material
  - Chat colapsado: ícono `chat` con tooltip "Chat en vivo"
  - Botón de colapso sticky (`position: sticky; bottom: 0`) con ícono `chevron_left` / `chevron_right`
- `sidebar.component.scss` — selector `&--collapsed`:
  - `width: $sidebar-width-collapsed` (64 px) solo en `min-width: 768px`
  - Centra section titles, server dots y botón de colapso
  - `transition: transform, width` para animación suave
  - Clases nuevas: `&__nav-icons`, `&__nav-icon`, `&__collapse-btn`
  - Botón sticky con `background: $color-surface` (evita que el contenido se vea al scrollear)
  - Oculto en mobile con `@media (max-width: $bp-mobile)`
- `shell.component.ts` — señal `sidebarCollapsed = signal(false)` + método `toggleCollapse()`
- `shell.component.html` — pasa `[isCollapsed]` y `(collapseToggle)` al sidebar; aplica `shell__content--collapsed` al main
- `shell.component.scss` — clase `&--collapsed`: `margin-left: $sidebar-width-collapsed` solo en `min-width: 768px`
- `_variables.scss` ya contenía `$sidebar-width-collapsed: 64px` (no requirió cambio)

### Comportamiento
- **Desktop**: hamburger → cierra/abre completamente; botón chevron → colapsa a rail de 64 px
- **Mobile**: el botón de colapso no existe; el sidebar mantiene el comportamiento overlay existente
- La animación de ancho y `margin-left` es sincronizada via `transition: 250ms ease`

---

## [0.2.0] — 2026-05-15 — Responsividad mobile completa

### Añadido
- `src/styles/_variables.scss` — breakpoints: `$bp-mobile: 767px` y `$bp-tablet: 1023px`
- `shell.component.ts` — `sidebarOpen = signal(window.innerWidth > 767)` (sidebar cerrado por defecto en mobile)
- `shell.component.html` — backdrop div con click-to-close para el sidebar overlay
- `shell.component.scss`:
  - `.shell__backdrop`: `display: none` en desktop, `position: fixed; inset: 64px 0 0 0; background: rgba(0,0,0,0.65)` en mobile
  - `.shell__content`: `margin-left: 0 !important` en mobile (override del sidebar push)
- `navbar.component.scss`:
  - `.navbar__nav` oculto en mobile (acceso vía sidebar)
  - `.navbar__subtitle`, `.navbar__username`, `.navbar__login-btn` ocultos en mobile
  - `.navbar__user-chevron` oculto en mobile
  - Blood drip `::after` oculto en mobile
  - `&__register-btn` con padding reducido en mobile
- `sidebar.component.scss`:
  - `width: min($sidebar-width, 85vw)` en mobile
  - `box-shadow: $shadow-lg` en mobile (separación visual del overlay)
- `home.component.scss`:
  - Hero: título 6rem → 4.5rem (tablet) → 3.5rem (mobile); ilustración oculta en mobile
  - Stats: 4 columnas → 2 columnas en tablet/mobile
  - Grid: 2 columnas → 1 columna en tablet
  - Padding reducido en todas las secciones
- `chat.component.scss`:
  - Grid `220px 1fr` → `1fr` con `grid-template-rows: auto 1fr` en mobile
  - Channels: columna vertical → fila horizontal con scroll, sin scrollbar visible
  - Items de canal: indicador de bottom border en lugar de background en mobile
- `forum-list.component.scss`:
  - Container padding reducido en mobile
  - Header apilado verticalmente, título 2.5rem → 1.8rem
  - Category cards: columnas `stats` y `last` ocultas en mobile (solo ícono + nombre)
  - Breakpoint corregido de `768px` literal a `#{v.$bp-mobile}`
- `forum-thread.component.scss`:
  - Container padding reducido en mobile
  - Título 2rem → 1.5rem
  - `.post` grid `140px 1fr` → columna única en mobile
  - Sidebar del post: de columna vertical a fila horizontal (avatar + nombre + stats en línea)
- `user-management.component.html` — wrapper `<div class="user-mgmt__table-wrapper">` alrededor de la tabla
- `user-management.component.scss`:
  - `&__table-wrapper`: `overflow-x: auto; -webkit-overflow-scrolling: touch`
  - `&__table`: `min-width: 600px` para que la tabla sea scrolleable en mobile
- `server-stats.component.scss`:
  - Grid `repeat(auto-fit, minmax(380px, 1fr))` → `1fr` en mobile
- `admin.component.scss`:
  - Padding reducido, título 2.5rem → 1.8rem en mobile
- `auth-layout.component.scss`:
  - Header padding reducido, logo 3rem → 2.2rem en mobile
- `login.component.scss` / `register.component.scss`:
  - Card padding `$spacing-2xl $spacing-xl` → `$spacing-xl $spacing-md` en mobile
  - `border-radius` ligeramente reducido

### Patrón de sidebar en mobile
El sidebar funciona como overlay (no empuja el contenido):
- Abierto: sidebar visible a pantalla completa, backdrop oscuro detrás con click-to-close
- Cerrado: sidebar fuera de pantalla via `transform: translateX(-100%)`
- El contenido siempre tiene `margin-left: 0` en mobile

---

## [0.1.0] — 2026-05-14 — Frontend inicial

### Añadido — Stack y configuración

- **Angular 21** con `@angular/build:application` (builder esbuild)
- **Angular Material** v21 con tema M3 customizado
- **Standalone components** en toda la aplicación (sin NgModules)
- **TypeScript 5.9** con strict mode completo
- Routing lazy con `loadComponent` en `app.routes.ts`
- `provideRouter(routes, withComponentInputBinding())` en `app.config.ts`
- `provideAnimationsAsync()` para animaciones de Material bajo demanda
- SCSS modular con `@use` y partials en `src/styles/`
- Presupuesto de bundle ajustado en `angular.json`

### Añadido — Tema L4D2

- `_variables.scss` — paleta completa:
  - Colores primarios: `$color-primary: #c0392b`, `$color-primary-dark: #8b0000`, `$color-primary-light: #e74c3c`
  - Colores de superficie: `$color-bg`, `$color-surface`, `$color-surface-2`, `$color-surface-3`
  - Colores de texto: `$color-text`, `$color-text-muted`, `$color-text-dim`
  - Accent verde: `$color-accent: #4a7c4e`, `$color-accent-light: #5aad5f`
  - Estados: `$color-online`, `$color-success`, `$color-warning`, `$color-danger`
  - Colores de rol: `$role-guest` hasta `$role-admin`
  - Dimensiones: `$navbar-height: 64px`, `$sidebar-width: 260px`, `$sidebar-width-collapsed: 64px`
  - Espaciado: `$spacing-xs` a `$spacing-2xl`
  - Sombras, radios, transiciones
- `_theme.scss` — Angular Material M3 theme override:
  - `mat.theme()` con paleta roja, tipografía Rajdhani, modo dark
  - Override de tokens CSS (`--mat-sys-*`, `--mat-app-*`) para colores de superficie y borde
- `_typography.scss` — fuentes Bebas Neue (display) y Rajdhani (body)
- `_reset.scss` — reset CSS global, scrollbar custom, fix de links
- `src/index.html` — preconnect a Google Fonts, Material Symbols Outlined variable font

### Añadido — SVG assets (sin copyright)

- `public/assets/blood-drip.svg` — 10 drips de sangre dibujados a mano, posiciones irregulares, dos tonos de rojo; usado como decoración debajo del navbar
- `public/assets/survivor.svg` — silueta de superviviente estilo L4D2 con linterna, gorra y mochila; usado en el hero de la home
- `public/favicon.svg` — "X" en Impact rojo sobre fondo negro con barra roja inferior

### Añadido — Modelos y servicios (mock)

- `user.model.ts` — `UserRole: 'guest' | 'player' | 'vip' | 'moderator' | 'admin'` e interfaz `User`
- `forum.model.ts` — interfaces `ForumCategory`, `ForumThread`, `ForumPost`
- `chat-message.model.ts` — interfaz `ChatMessage` con `channelId`, `authorId`, `content`, `timestamp`
- `auth.service.ts`:
  - 5 usuarios mock (admin, vip, player, moderator, player baneado)
  - `_currentUser = signal<User | null>(null)`
  - `isAuthenticated`, `isAdmin` como `computed()`
  - `login()`, `register()`, `logout()`, `getUsers()`, `updateUserRole()`, `banUser()`
- `forum.service.ts`:
  - 5 categorías (general, reglas, bugs, sugerencias, off-topic)
  - Threads y posts mock con autores, fechas, contenido
  - `getCategories()`, `getThreadsByCategory()`, `getThread()`, `getPostsByThread()`, `getRecentThreads()`
  - Todos los métodos retornan `Observable` con `of(data).pipe(delay(ms))`
- `chat.service.ts`:
  - Canales: general, equipos, técnico, off-topic
  - `_messages = signal<ChatMessage[]>([...BASE_MESSAGES])`
  - `sendMessage()` actualiza la señal directamente
  - `activeMessages = computed(...)` filtra por canal activo

### Añadido — Guards

- `auth.guard.ts` — `CanActivateFn` que verifica `auth.isAuthenticated()`; redirige a `/auth/login`
- `role.guard.ts` — factory `roleGuard(requiredRole)` con `ROLE_HIERARCHY` array para comparación de niveles

### Añadido — Layouts

- `shell/` — layout principal:
  - `ShellComponent`: `sidebarOpen = signal(window.innerWidth > 767)`, método `toggleSidebar()`
  - `NavbarComponent`: brand, nav links, menú de usuario con dropdown, botones login/registro
  - `SidebarComponent`: servidores live, categorías de foro, link de chat; datos cargados via `ForumService`
- `auth-layout/` — layout centrado para login/registro con logo y branding

### Añadido — Features

- **Home** (`/`):
  - Hero con gradiente, ilustración del superviviente, título animado, CTAs
  - Scroll indicator animado
  - Stats bar (4 métricas: jugadores, partidas, servidores, foros)
  - Grid 2 columnas: servidores con barra de ocupación vs threads recientes
- **Forums** (`/forums`):
  - Lista de categorías con ícono, nombre, descripción, stats (posts/threads) y último post
  - Thread list por categoría (via `forum-list` con `categoryId` como input de ruta)
  - Thread completo (`/forums/:categoryId/:threadId`): breadcrumb, tags (pinned/locked), título, posts con sidebar de autor
  - Formulario de respuesta (autenticado) o prompt de login (invitado)
- **Chat** (`/chat`):
  - Grid sidebar-main: lista de canales a la izquierda, mensajes a la derecha
  - Mensajes con autor, timestamp, badge de sistema para mensajes automáticos
  - Input con envío por Enter o botón
  - Prompt de autenticación para usuarios no logueados
- **Admin** (`/admin`, protegido por `authGuard + roleGuard('admin')`):
  - Tabs: "Usuarios" y "Servidores"
  - User Management: búsqueda en tiempo real, filtro por rol, tabla con avatar, rol, posts, estado, acciones (cambiar rol, banear/desbanear)
  - Server Stats: tarjetas de servidor con estado, mapa, jugadores, barra de ocupación, IP/puerto
- **Auth**: login y registro con validación de formulario, spinner de carga, mensajes de error

### Añadido — Shared components

- `UserAvatarComponent` — muestra imagen de avatar o iniciales como fallback; indicador de estado online via `::after`; tamaños sm/md/lg
- `RoleBadgeComponent` — chip con ícono y label por rol:
  - guest → `person_outline`, player → `sports_esports`, vip → `workspace_premium`
  - moderator → `shield`, admin → `security`

### Corregido — Errores de compilación resueltos

| Error | Causa | Solución |
|---|---|---|
| `TS2345` en `setRole(user, role.value)` | `role.value` tipado como `UserRole \| ''` | Array `roleOptions` tipado estrictamente como `UserRole` |
| `NG8004` TitleCasePipe no encontrado | Pipe no importado en standalone component | Añadido `TitleCasePipe` de `@angular/common` al array `imports` |
| `@angular/animations/browser` not found | Paquete no instalado | `npm install @angular/animations` |
| Sass `lighten()` deprecated | API Sass legacy | Reemplazado con `@use 'sass:color'` + `color.adjust($c, $lightness: 10%)` |
| `-v.$spacing-sm` namespace inválido | SCSS no permite `-namespace.$var` | Reemplazado con literal `-8px` |
| `NG8011` content projection (×2) | Template `@else` sin wrapper | Contenido envuelto en `<span class="btn-inner">` |
| CSS budget exceeded | `home.component.scss` (5.33 kB > 4 kB) | Budget aumentado a 10 kB warning / 20 kB error en `angular.json` |

---

## Credenciales de demo

| Usuario | Email | Rol |
|---|---|---|
| admin | `admin@xtreme.gg` | admin |
| vip_player | `vip@xtreme.gg` | vip |
| player1 | `player@xtreme.gg` | player |
| mod1 | `mod@xtreme.gg` | moderator |
| banned | `banned@xtreme.gg` | player (baneado) |

> Cualquier contraseña de 6+ caracteres es válida en el mock.

---

## Pendiente / Próximos pasos

- [ ] Conectar backend real (Node.js + Express + Socket.io)
- [ ] Autenticación con JWT real
- [ ] WebSockets para chat en vivo
- [ ] Integración Steam API para perfiles
- [ ] Query de estado real de servidores L4D2 (Valve Query Protocol)
- [ ] Página de perfil de usuario
- [ ] Editor de texto enriquecido en foros
- [ ] Sistema de notificaciones
- [ ] PWA / Service Worker para uso offline parcial
