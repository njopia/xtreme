# Despliegue — Xtreme L4D2

Guía para desplegar la aplicación en el VDS Debian 13 con Nginx.

---

## Prerrequisitos

```bash
# Node.js ≥ 20 LTS
node --version

# npm ≥ 10
npm --version

# Angular CLI (global, opcional — el script usa npx)
npm install -g @angular/cli
```

---

## Comandos de build

### Desde Windows (desarrollo)

```powershell
# Build de producción + reporte de bundles
.\build-prod.ps1

# Sin reinstalar dependencias (más rápido en rebuilds)
.\build-prod.ps1 -SkipInstall

# Con source maps para inspeccionar bundles
.\build-prod.ps1 -Analyze
```

### Desde Linux / Debian

```bash
chmod +x build-prod.sh

# Build completo
./build-prod.sh

# Sin reinstalar dependencias
./build-prod.sh --skip-install

# Con source maps
./build-prod.sh --analyze
```

### Directo con npm

```bash
npm run build:prod     # producción
npm run build          # desarrollo
npm run build:analyze  # con source maps para inspección
```

El output se genera en `dist/xtreme-website/browser/`.

---

## Estructura del output

```
dist/xtreme-website/browser/
├── index.html                  ← entry point (CSS crítico inlineado)
├── main-[hash].js              ← bootstrap de Angular
├── chunk-[hash].js             ← chunks lazy por feature
├── styles-[hash].css           ← estilos globales
├── assets/
│   ├── blood-drip.svg
│   └── survivor.svg
├── favicon.svg
└── 3rdpartylicenses.txt        ← licencias de dependencias
```

Los archivos JS/CSS llevan hash de contenido en el nombre → cache infinito seguro.

---

## Nginx — Configuración para SPA

Guardar en `/etc/nginx/sites-available/xtreme`:

```nginx
server {
    listen 80;
    server_name xtreme.gg www.xtreme.gg;

    # Redirigir HTTP → HTTPS (requiere SSL configurado)
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name xtreme.gg www.xtreme.gg;

    # SSL (certificado Let's Encrypt, ver sección SSL)
    ssl_certificate     /etc/letsencrypt/live/xtreme.gg/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/xtreme.gg/privkey.pem;
    ssl_protocols       TLSv1.2 TLSv1.3;
    ssl_ciphers         HIGH:!aNULL:!MD5;

    # Raíz de archivos del frontend
    root /var/www/xtreme/browser;
    index index.html;

    # ─── SPA routing ────────────────────────────────────────────────
    # Cualquier ruta que no sea un archivo estático sirve index.html
    location / {
        try_files $uri $uri/ /index.html;
    }

    # ─── Assets con cache infinito (tienen hash en el nombre) ───────
    location ~* \.(js|css|woff2?|ico|svg|png|jpg|webp)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        access_log off;
    }

    # index.html sin cache (siempre fresco para que el usuario
    # descargue los nuevos hashes de JS/CSS al deployar)
    location = /index.html {
        expires -1;
        add_header Cache-Control "no-store, no-cache, must-revalidate";
    }

    # ─── Gzip ───────────────────────────────────────────────────────
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types
        text/plain
        text/css
        application/javascript
        application/json
        image/svg+xml
        font/woff2;

    # ─── Security headers ───────────────────────────────────────────
    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-Content-Type-Options "nosniff";
    add_header Referrer-Policy "strict-origin-when-cross-origin";
    add_header Permissions-Policy "camera=(), microphone=(), geolocation=()";
}
```

Activar y verificar:

```bash
ln -s /etc/nginx/sites-available/xtreme /etc/nginx/sites-enabled/
nginx -t
systemctl reload nginx
```

---

## Despliegue del frontend

```bash
# 1. Copiar el output al web root
rsync -av --delete \
  dist/xtreme-website/browser/ \
  user@vds:/var/www/xtreme/browser/

# O con scp
scp -r dist/xtreme-website/browser/* user@vds:/var/www/xtreme/browser/

# 2. Corregir permisos
ssh user@vds "chown -R www-data:www-data /var/www/xtreme && chmod -R 755 /var/www/xtreme"
```

No es necesario reiniciar Nginx después de un deploy de frontend (solo archivos estáticos).

---

## SSL con Let's Encrypt

```bash
apt install certbot python3-certbot-nginx

certbot --nginx -d xtreme.gg -d www.xtreme.gg

# Renovación automática (cron ya configurado por certbot)
certbot renew --dry-run
```

---

## Backend futuro (Node.js + Express + Socket.io)

Cuando el backend esté listo, agregarlo como servicio systemd y hacer proxy con Nginx:

```nginx
# Añadir dentro del server block SSL
location /api {
    proxy_pass         http://localhost:3000;
    proxy_http_version 1.1;
    proxy_set_header   Host              $host;
    proxy_set_header   X-Real-IP         $remote_addr;
    proxy_set_header   X-Forwarded-For   $proxy_add_x_forwarded_for;
    proxy_set_header   X-Forwarded-Proto $scheme;
}

location /socket.io {
    proxy_pass         http://localhost:3000;
    proxy_http_version 1.1;
    proxy_set_header   Upgrade    $http_upgrade;
    proxy_set_header   Connection "Upgrade";
    proxy_set_header   Host       $host;
}
```

Servicio systemd para el backend (`/etc/systemd/system/xtreme-api.service`):

```ini
[Unit]
Description=Xtreme L4D2 API
After=network.target mysql.service

[Service]
Type=simple
User=www-data
WorkingDirectory=/srv/xtreme-api
ExecStart=/usr/bin/node server.js
Restart=on-failure
RestartSec=5
Environment=NODE_ENV=production
EnvironmentFile=/srv/xtreme-api/.env

[Install]
WantedBy=multi-user.target
```

```bash
systemctl enable xtreme-api
systemctl start xtreme-api
systemctl status xtreme-api
```

---

## Variables de entorno

El frontend actual no usa variables de entorno (todo es mock).
Cuando se conecte el backend, crear `src/environments/environment.prod.ts`:

```typescript
export const environment = {
  production: true,
  apiUrl: 'https://xtreme.gg/api',
  socketUrl: 'https://xtreme.gg',
};
```

Referenciar en `angular.json` bajo `fileReplacements` en la configuración `production`.

---

## Checklist de producción

- [ ] Build completado sin errores (`npm run build:prod`)
- [ ] Archivos copiados al web root del VDS
- [ ] Nginx configurado con `try_files ... /index.html`
- [ ] SSL activo y redireccionando HTTP → HTTPS
- [ ] Headers de cache configurados
- [ ] Gzip habilitado en Nginx
- [ ] Security headers presentes (`X-Frame-Options`, `X-Content-Type-Options`, etc.)
- [ ] `index.html` cargando correctamente desde el dominio
- [ ] Rutas SPA funcionando (navegar directo a `/forums` devuelve `index.html`, no 404)
- [ ] Assets cargando (fonts, SVGs, favicon)
