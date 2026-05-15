# Catálogo de Features — Xtreme L4D2

Descripción funcional de cada feature de la aplicación.

---

## Home (`/`)

### Hero
- Gradiente de fondo con radiales rojos y línea-scan CRT
- Ilustración SVG de superviviente L4D2 (desktop y tablet)
- Título "XTREME" en Bebas Neue con shadow rojo
- Eyebrow y descripción
- Botones CTA: "Unirse al servidor" y "Ver foros"
- Scroll indicator con animación bounce (oculto en mobile)

### Stats bar
Cuatro métricas en un grid horizontal:
| Métrica | Valor |
|---|---|
| Jugadores online | 247 |
| Partidas jugadas | 15,842 |
| Servidores activos | 2 |
| Posts en foros | 1,203 |

### Grid de contenido
Dos columnas en desktop (una en tablet/mobile):
- **Servidores** — tarjetas con estado online, mapa activo, jugadores, barra de ocupación, IP copiable
- **Threads recientes** — últimos posts con autor, título, stats de respuestas y vistas

---

## Autenticación

### Login (`/auth/login`)
- Formulario con email y contraseña (validación Angular Reactive Forms)
- Spinner de carga durante autenticación (mock: 600 ms)
- Mensaje de error si credenciales incorrectas
- Hint con credenciales de demo al pie
- Link a registro

### Registro (`/auth/register`)
- Formulario con username, email y contraseña
- Validación de mínimo 6 caracteres en contraseña
- Spinner de carga
- Redirige a `/` tras registro exitoso

### Credenciales de demo
| Email | Rol |
|---|---|
| `admin@xtreme.gg` | admin |
| `vip@xtreme.gg` | vip |
| `mod@xtreme.gg` | moderator |
| `player@xtreme.gg` | player |
| `banned@xtreme.gg` | player (baneado) |

> Contraseña: cualquier string de 6+ caracteres.

---

## Foros

### Lista de categorías (`/forums`)
- Header con título, subtítulo y botón "Nuevo thread" (visible si autenticado)
- Tarjetas de categoría en grid:
  - Ícono con acento rojo, nombre y descripción
  - Stats de threads y posts (ocultos en mobile)
  - Último post con título y autor (oculto en mobile)
- En mobile: solo ícono + nombre (layout simplificado)

### Categorías disponibles
| ID | Nombre | Ícono |
|---|---|---|
| `general` | General | `forum` |
| `reglas` | Reglas del servidor | `gavel` |
| `bugs` | Reportar bugs | `bug_report` |
| `sugerencias` | Sugerencias | `lightbulb` |
| `offtopic` | Off-Topic | `chat_bubble` |

### Thread (`/forums/:categoryId/:threadId`)
- Breadcrumb: Foros → Categoría → Thread
- Tags: pinned (amarillo) y locked (rojo)
- Título del thread
- Posts en cards:
  - **Desktop**: grid `140px (sidebar autor) + 1fr (contenido)`
  - **Mobile**: columna única; sidebar autor pasa a ser fila horizontal
  - Sidebar: avatar, nombre, rol badge, post count
  - Cuerpo: fecha, badge OP, contenido, marca de editado
- Formulario de respuesta (autenticado) con textarea y botón submit
- Prompt de login si no autenticado

---

## Chat (`/chat`)

### Canales disponibles
| ID | Nombre | Descripción |
|---|---|---|
| `general` | #general | Canal principal |
| `equipos` | #equipos | Busca equipo |
| `tecnico` | #técnico | Problemas técnicos |
| `offtopic` | #off-topic | Temas varios |

### Layout
- **Desktop**: sidebar de 220 px con lista de canales + área principal de mensajes
- **Mobile**: canales como tabs horizontales scrolleables en la parte superior + mensajes abajo

### Mensajes
- Badge por canal (número de mensajes no leídos mock)
- Estado vacío con ícono si no hay mensajes en el canal
- Mensajes: autor en negrita, timestamp, contenido
- Mensajes de sistema: borde izquierdo rojo, fondo sutil, cursiva
- Scroll automático al último mensaje al enviar

### Interacción
- Input con envío por Enter (sin Shift) o botón con ícono `send`
- Si no autenticado: input reemplazado por prompt de login

---

## Sidebar

### Servidores
Muestra estado en tiempo real (mock) de los servidores L4D2:
- Dot de estado: verde con glow si online, gris si offline
- Nombre del servidor
- Mapa activo
- Conteo de jugadores

### Foros
- Lista de categorías como nav links con ícono y nombre
- Link activo resaltado en rojo con `routerLinkActive`

### Chat
- Link directo a `/chat` con badge de mensajes sin leer (3 mock)

### Modo colapsado (desktop)
- Ancho: 260 px → 64 px con transición suave
- Solo íconos visibles, tooltips `matTooltipPosition="right"` al hacer hover
- Botón sticky en la parte inferior con `chevron_left` / `chevron_right`
- En mobile: botón de colapso oculto; el sidebar usa el comportamiento overlay estándar

---

## Admin (`/admin`)

Protegido por `authGuard + roleGuard('admin')`. Redirige a `/auth/login` si no autenticado, o a `/` si no tiene rol admin.

### Tab — Usuarios
- Búsqueda en tiempo real (filtra por username o email)
- Selector de filtro por rol (Todos, Guest, Player, VIP, Moderator, Admin)
- Tabla con scroll horizontal en mobile (`min-width: 600px`):
  | Columna | Descripción |
  |---|---|
  | Usuario | Avatar + username + email |
  | Rol | RoleBadge component |
  | Posts | Conteo de posts |
  | Registro | Fecha formateada |
  | Estado | Online / Offline / Baneado |
  | Acciones | Menú con "Cambiar rol" y "Banear/Desbanear" |
- Filas de usuarios baneados con `opacity: 0.55`
- Contador de resultados al pie

### Tab — Servidores
- Grid de tarjetas de servidor (2 columnas desktop, 1 mobile):
  - Estado online con dot verde animado
  - Nombre, mapa, modo de juego
  - Stats: jugadores, ping, tiempo activo, versión
  - Barra de ocupación (gradient verde)
  - IP y puerto copiables
- Nota de actualización en tiempo real (mock)

---

## Navbar

### Desktop
- Logo "XTREME L4D2" con glow rojo
- Blood drip decorativo debajo del navbar (SVG)
- Links: Inicio, Foros, Chat (ocultos en mobile)
- Si autenticado: botón de notificaciones + dropdown de usuario
- Si no autenticado: "Iniciar sesión" + "Registrarse"

### Dropdown de usuario
- Header con avatar, username y role badge
- Enlace a Panel Admin (solo visible para admins)
- "Mi perfil" (pendiente de implementar)
- "Salir"

### Mobile
- Solo logo + hamburger + acción de usuario (avatar o registro)
- Links de navegación accesibles via sidebar overlay

---

## Responsive

| Breakpoint | Comportamiento |
|---|---|
| `> 1023px` (desktop) | Layout completo con sidebar de 260 px |
| `768px – 1023px` (tablet) | Sidebar presente, nav icons sin texto, hero reducido |
| `≤ 767px` (mobile) | Sidebar overlay, nav oculta, layouts apilados |

Todos los componentes fueron diseñados mobile-first y verificados en los tres breakpoints.
