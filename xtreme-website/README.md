# Xtreme L4D2

Sitio web de comunidad para servidores privados de Left 4 Dead 2.
Frontend en Angular 21 con Angular Material M3, tema oscuro personalizado y servicios mock listos para conectar con un backend real.

---

## Inicio rápido

```bash
# Instalar dependencias
npm install

# Servidor de desarrollo (http://localhost:4200)
npm start

# Build de producción
npm run build:prod
# o usando el script con reporte de bundles:
.\build-prod.ps1          # Windows
./build-prod.sh           # Linux / Debian
```

### Credenciales de demo

| Email | Contraseña | Rol |
|---|---|---|
| `admin@xtreme.gg` | cualquiera (6+ chars) | admin |
| `vip@xtreme.gg` | cualquiera | vip |
| `mod@xtreme.gg` | cualquiera | moderator |
| `player@xtreme.gg` | cualquiera | player |

---

## Scripts disponibles

| Script | Descripción |
|---|---|
| `npm start` | Servidor de desarrollo |
| `npm run build` | Build de desarrollo |
| `npm run build:prod` | Build de producción optimizado |
| `npm run build:analyze` | Build con source maps para análisis de bundles |
| `npm test` | Tests unitarios (Vitest) |

---

## Stack

- **Angular 21** — standalone components, signals, lazy routing
- **Angular Material v21** — M3 dark theme con overrides de tokens CSS
- **SCSS** — variables, reset, tipografía y tema en `src/styles/`
- **Fuentes** — Bebas Neue (display), Rajdhani (body), Material Symbols Outlined
- **Build** — `@angular/build:application` (esbuild + Vite)

---

## Documentación

| Documento | Descripción |
|---|---|
| [CHANGELOG.md](./CHANGELOG.md) | Historial de versiones y cambios |
| [docs/architecture.md](./docs/architecture.md) | Estructura del proyecto, routing, state, CSS |
| [docs/features.md](./docs/features.md) | Catálogo de features y comportamiento |
| [docs/deployment.md](./docs/deployment.md) | Guía de despliegue en Debian + Nginx |

---

## Features

- **Home** — hero, stats, servidores en vivo, threads recientes
- **Foros** — categorías, threads, posts con sidebar de autor
- **Chat** — canales múltiples con mensajes en tiempo real (mock)
- **Admin** — gestión de usuarios, roles, bans y estado de servidores
- **Auth** — login / registro con jerarquía de roles (`guest → player → vip → moderator → admin`)
- **Sidebar** — colapsable a modo rail de 64 px en desktop, overlay en mobile
- **Responsive** — adaptado para mobile (767 px), tablet (1023 px) y desktop

---

## Próximos pasos

- [ ] Backend real: Node.js + Express + Socket.io
- [ ] Autenticación JWT
- [ ] Chat WebSocket en tiempo real
- [ ] Query de servidores L4D2 (Valve Query Protocol)
- [ ] Integración Steam API
