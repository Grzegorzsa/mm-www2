# mxbeats.com

`pnpm run dev` - start dev mode

`pnpm run seed:manual` - run manual seed
`pnpm run seed:homepage` - run home seed
`pnpm run seed:downloads` - run downloads seed

## Update Manual

`/update-manual` - run in Copilot chat

## Czyszczena Cache

`rm -rf .next`

## Sprawdzanie błędów TypeScript

`pnpm tsc --noEmit`

## Activation Redeem Notifications (Admin)

- `ACTIVATION_ADMIN_NOTIFICATIONS` controls email notifications sent to admins after successful activation-code redeem.
  - default (not set): enabled
  - disable with: `false`, `0`, `off`, `no`
- Optional explicit recipients:
  - `ADMIN_NOTIFICATION_EMAILS` (comma-separated list)
  - if not set, emails from `admin-users` are used

## NGROK

Tunnel local ports to public URLs and inspect traffic

```bash
ngrok http 3000
```

## Deploy - Standalone

- W drugim oknie uruchomić `htop` - pokaże na żywo jak pracuje procesor/memory/swap...

1. Przed wysłaniem zmian na serwer zaktualizować wersję w package.json
2. Na serwerze wykonać `git pull`
3. W razie potrzeby podinstalować nowe biblioteki `pnpm install`
4. W razie potrzeby zaktualizować `.env`
5. Wykonanie builda `pnpm build` - powinny zostać wysłane mapy na Sentry
6. Restart PM2 `pm2 restart mxbeats`

## PM2

```bash
pm2 start server.js --name "mxbeats"
pm2 logs mxbeats
pm2 save
```

## PM2 Logs - rotation

Logi znajdziemy w `~/.pm2/logs/`

```bash
# Setup rotation
# Ustawienie maksymalnego rozmiaru jednego pliku na 10 MB:
pm2 set pm2-logrotate:max_size 10M

# Ustawienie maksymalnej liczby archiwalnych plików na 10
pm2 set pm2-logrotate:retain 10

# Włączenie kompresji archiwalnych logów
pm2 set pm2-logrotate:compress true

# Ustawienie rotacji czasowej
pm2 set pm2-logrotate:rotateInterval '0 0 * * *'

# Podsumowanie wielkości plików
du -sh ~/.pm2/logs/*

# Czyszczenie logów
pm2 flush
```

- `mxbeats-out.log` - standardowe komunikaty Next.js
- `mxbeats-error.log` - błędy np 500, DB...
- `mxbeats-app-out.log` i `mxbeats-app-error` - historycznie, nieaktywne logi

## Nginx Logi

```bash
# Logi Nginx'a
/var/log/nginx/access.log
/var/log/nginx/error.log

# Sprawdzenie wielkości logów
sudo du -sh /var/log/nginx/*

# Czyszczenie logów
sudo truncate -s 0 /var/log/nginx/access.log
sudo truncate -s 0 /var/log/nginx/error.log

# Podgląd ostatnich logów
sudo tail -f /var/log/nginx/access.log
sudo tail -n 100 -f /var/log/nginx/access.log # 100 ostatnich logów

# Generowanie raportu HTML z GoAccess
sudo goaccess /var/log/nginx/access.log -o /home/grzegorz/raport.html --log-format=COMBINED
sudo chown grzegorz:grzegorz /home/grzegorz/raport.html

```

## Dodanie SWAP przy rozwalającym się buildzie

```bash
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
```

## Deploys keys na VPS

```bash
# Zaakceptować domyślne wartości
ssh-keygen -t ed25519 -C "vps@mxbeats.com"

# Pobranie klucza do GitHub
cat ~/.ssh/id_ed25519.pub

# Sprawdzenie połączenia
ssh -T git@github.com
```

Skopiuj cały wyświetlony tekst (zaczynający się od ssh-ed25519...) i dodaj go na GitHubie:

Wejdź w swoje repozytorium.

Settings -> Deploy keys -> Add deploy key.

Buid na serwerze:

```bash
NODE_OPTIONS="--max-old-space-size=1536" pnpm run build
```

Backup mxbeats.com

```conf
# --- POCZĄTEK KONFIGURACJI CLOUDFLARE REAL IP ---
# Informujemy Nginxa, które IP należą do Cloudflare
set_real_ip_from 103.21.244.0/22;
set_real_ip_from 103.22.200.0/22;
set_real_ip_from 103.31.4.0/22;
set_real_ip_from 104.16.0.0/13;
set_real_ip_from 104.24.0.0/14;
set_real_ip_from 108.162.192.0/18;
set_real_ip_from 131.0.72.0/22;
set_real_ip_from 141.101.64.0/18;
set_real_ip_from 162.158.0.0/15;
set_real_ip_from 172.64.0.0/13;
set_real_ip_from 173.245.48.0/20;
set_real_ip_from 188.114.96.0/20;
set_real_ip_from 190.93.240.0/20;
set_real_ip_from 197.234.240.0/22;
set_real_ip_from 198.41.128.0/17;

# IPv6 Cloudflare
set_real_ip_from 2400:cb00::/32;
set_real_ip_from 2606:4700::/32;
set_real_ip_from 2803:f800::/32;
set_real_ip_from 2405:b500::/32;
set_real_ip_from 2405:8100::/32;
set_real_ip_from 2a06:98c0::/29;
set_real_ip_from 2c0f:f248::/32;

# Nadpisujemy remote_addr wartością z nagłówka Cloudflare
real_ip_header CF-Connecting-IP;
# --- KONIEC KONFIGURACJI CLOUDFLARE REAL IP ---

# Przekierowanie HTTP (80) na HTTPS (443)
server {
    listen 80;
    server_name mxbeats.com www.mxbeats.com;
    return 301 https://$host$request_uri;
}

# Główna konfiguracja HTTPS
server {
    listen 443 ssl;
    server_name mxbeats.com www.mxbeats.com;
    ssl_certificate /etc/nginx/ssl/mxbeats.pem;
    ssl_certificate_key /etc/nginx/ssl/mxbeats.key;

    # Rekomendowane zabezpieczenia SSL
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers on;

    client_max_body_size 100M;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;

        proxy_set_header X-Real-IP $http_cf_connecting_ip;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    # 1. Blokada wizualnego panelu Admina
    location /admin {
        allow 89.45.5.237;  # Twój adres IP
        deny all;           # Blokada dla reszty świata

        # Standardowe przekazanie ruchu do Next.js (port 3000) jeśli IP pasuje
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # 2. Blokada endpointów API dla administratorów
    location /api/admin-users {
        allow 89.45.5.237;  # Twój adres IP
        deny all;           # Blokada dla reszty świata

        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

```

## Testy integracji

```bash
# Jak uruchomić:

# Tylko nowe testy:
pnpm exec vitest run activation-codes-upgrade.int.spec.ts --config vitest.config.mts

# Całe testy integracyjne z konfiguracji projektu:
pnpm run test:int
```

## Webhooks

`scarecrow-tidal-cleaver.ngrok-free.dev/api/webhooks/lemon` - webhook for ngrok

`mxbeats.com/api/webhooks/lemon`

## ToDo

1. Wyłączenie logowania niektórych zapytań i obrazki

```conf
location = /favicon.ico {
    log_not_found off;
    access_log off;
}

location = /robots.txt {
    log_not_found off;
    access_log off;
}

location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
    expires max;
    access_log off;
}
```
