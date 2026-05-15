# Arquitectura — Xtreme L4D2

## Stack tecnológico

| Capa | Tecnología |
|---|---|
| Framework | Angular 21 (standalone components) |
| UI | Angular Material v21 (M3 dark theme) |
| Estilos | SCSS modular con `@use` |
| State | Angular Signals (`signal`, `computed`) |
| Build | `@angular/build:application` (esbuild + Vite) |
| Tipado | TypeScript 5.9 strict mode |
| Fuentes | Bebas Neue, Rajdhani (Google Fonts), Material Symbols Outlined |

---

## Estructura de carpetas

```
src/
├── app/
│   ├── core/               # Lógica compartida de negocio
│   │   ├── guards/         # auth.guard.ts, role.guard.ts
│   │   ├── models/         # Interfaces TypeScript
│   │   └── services/       # auth, forum, chat (mock → real)
│   │
│   ├── features/           # Módulos de funcionalidad (lazy loaded)
│   │   ├── home/
│   │   ├── forums/
│   │   │   ├── forum-list/
│   │   │   └── forum-thread/
│   │   ├── chat/
│   │   ├── admin/
│   │   │   ├── user-management/
│   │   │   └── server-stats/
│   │   └── auth/
│   │       ├── login/
│   │       └── register/
│   │
│   ├── layouts/            # Wrappers de página
│   │   ├── shell/          # Navbar + Sidebar + Router outlet
│   │   │   ├── navbar/
│   │   │   └── sidebar/
│   │   └── auth-layout/    # Layout centrado para login/register
│   │
│   ├── shared/             # Componentes reutilizables
│   │   └── components/
│   │       ├── role-badge/
│   │       └── user-avatar/
│   │
│   ├── app.routes.ts       # Definición de rutas
│   └── app.config.ts       # Providers de la app
│
├── styles/                 # SCSS partials globales
│   ├── _variables.scss     # Paleta, espaciado, breakpoints, dimensiones
│   ├── _theme.scss         # Angular Material M3 overrides
│   ├── _typography.scss    # Clases de texto globales
│   └── _reset.scss         # Reset CSS, scrollbar, links
│
└── index.html              # Shell HTML con preconnect y font links
```

---

## Árbol de rutas

```
/                           → HomeComponent         [shell layout]
/forums                     → ForumListComponent    [shell layout]
/forums/:categoryId         → ForumListComponent    [shell layout, filtrado por categoría]
/forums/:categoryId/:threadId → ForumThreadComponent [shell layout]
/chat                       → ChatComponent         [shell layout]
/admin                      → AdminComponent        [shell layout, authGuard + roleGuard('admin')]

/auth/login                 → LoginComponent        [auth-layout]
/auth/register              → RegisterComponent     [auth-layout]
```

Todos los componentes se cargan con `loadComponent` (lazy). El router usa `withComponentInputBinding()` para exponer los params de ruta como inputs del componente.

---

## Layouts

### ShellComponent
Layout principal con tres señales:
- `sidebarOpen = signal(window.innerWidth > 767)` — controla visibilidad del sidebar
- `sidebarCollapsed = signal(false)` — controla modo rail (64 px) del sidebar en desktop

El contenido tiene `margin-left` que transiciona entre `260px` (expandido), `64px` (colapsado) y `0` (cerrado / mobile).

### AuthLayoutComponent
Layout simple centrado para las vistas de login y registro. Sin sidebar ni navbar.

---

## Gestión de estado con Signals

```
AuthService
  _currentUser = signal<User | null>(null)   ← fuente de verdad
  isAuthenticated = computed(...)            ← derivado, lectura en template
  isAdmin = computed(...)                    ← derivado, para roleGuard y template
  currentUser = _currentUser.asReadonly()    ← expuesto como readonly

ChatService
  _messages = signal<ChatMessage[]>([])      ← lista completa de mensajes
  _activeChannelId = signal<string>('general')
  activeMessages = computed(...)             ← filtra mensajes por canal activo
  sendMessage() → _messages.update(...)      ← mutación directa de señal (sin HTTP por ahora)
```

Los templates leen señales con `()` — Angular detecta cambios automáticamente sin `async` pipe.

---

## Guards

```typescript
// auth.guard.ts — funcional
export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  return auth.isAuthenticated() ? true : inject(Router).createUrlTree(['/auth/login']);
};

// role.guard.ts — factory
export const roleGuard = (required: UserRole): CanActivateFn => () => {
  const level = ROLE_HIERARCHY.indexOf(auth.currentUser()?.role);
  return level >= ROLE_HIERARCHY.indexOf(required);
};

// Jerarquía de roles
const ROLE_HIERARCHY = ['guest', 'player', 'vip', 'moderator', 'admin'];
```

---

## Servicios mock → migración a backend real

Los servicios actuales simulan latencia con `of(data).pipe(delay(ms))`. La firma de los métodos es idéntica a lo que retornaría un `HttpClient`, por lo que la migración es un cambio interno en el servicio sin tocar los componentes.

```typescript
// Actual (mock)
getCategories(): Observable<ForumCategory[]> {
  return of(MOCK_CATEGORIES).pipe(delay(300));
}

// Futuro (real)
getCategories(): Observable<ForumCategory[]> {
  return this.http.get<ForumCategory[]>('/api/forum/categories');
}
```

Los componentes no necesitan modificarse porque consumen el mismo `Observable<T>`.

---

## Arquitectura CSS

### Convención BEM
Cada componente usa una clase raíz y modificadores BEM:

```scss
.chat { }                        // Bloque
.chat__channels { }              // Elemento
.chat__channel-item--active { }  // Modificador
```

### Variables SCSS globales
Todas las variables del diseño están en `src/styles/_variables.scss` e importadas en cada componente con:
```scss
@use '../../../styles/variables' as v;
// Uso: v.$color-primary, v.$spacing-md, etc.
```

### Breakpoints
```scss
$bp-mobile:  767px;   // ≤767px = mobile
$bp-tablet: 1023px;   // ≤1023px = tablet
```

La regla general es `@media (max-width: #{v.$bp-mobile})` para ajustes mobile.

### Tema Angular Material
Angular Material expone tokens CSS que se sobreescriben en `_theme.scss`:
```scss
--mat-sys-primary: #{v.$color-primary};
--mat-sys-surface: #{v.$color-surface};
// etc.
```
Esto evita usar `::ng-deep` en los componentes.

---

## Shared components

### UserAvatarComponent
```
[user]="user"   → objeto User
[size]="'sm'"   → 'sm' | 'md' | 'lg'
```
Muestra imagen de avatar si existe, o las iniciales del username como fallback.
El punto de estado online se renderiza con `::after` CSS condicional.

### RoleBadgeComponent
```
[role]="user.role"   → UserRole
```
Muestra chip con ícono de Material Symbols y label según el rol.
