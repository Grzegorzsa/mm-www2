# mxbeats.com

`pnpm run dev` - start dev mode

`pnpm run seed:manual` - run manual seed
`pnpm run seed:homepage` - run home seed
`pnpm run seed:downloads` - run downloads seed

## Update Manual

`/update-manual` - run in Copilot chat

## Deplay - Standalone

1. Przed wysłaniem zmian na serwer zaktualizować wersję w package.json
2. Na serwerze wykonać `git pull`
3. W razie potrzeby podinstalować nowe biblioteki `pnpm install`
4. Wykonanie builda `pnpm build` - powinny zostać wysłane mapy na Sentry
5. Restart PM2 `pm2 restart mxbeats`

## PM2

```bash
pm2 start server.js --name "mxbeats"
pm2 logs mxbeats
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

```bash
server {
    server_name mxbeats.com; # You can adjust server names as needed

    root /home/grzegorz/www/mxbeats.com/build/;
    index index.html index.htm;

    error_log /home/grzegorz/www/mxbeats.com/nginx-error.log;
    access_log off; # You can enable access logs if needed

    # Blokowanie plików .php, .asp, .exe itp.
    location ~* \.(php|aspx?|jsp|cgi|exe|pl|py)$ {
        return 444; # "Connection Closed Without Response" - oszczędza transfer
    }

    # Blokowanie podwójnych slashy (częsty trik botów)
    merge_slashes on;

    # Access control
    # allow 89.45.5.237;
    # allow 109.173.0.0/16; # This represents the range 109.173.*.*
    # deny all;
    # allow all;

    location /.well-known/acme-challenge/ {
        # This is where Certbot will place the challenge files.
        # This path must be the webroot of your site.
        root /home/grzegorz/www/mxbeats.com/build;
    }

    location / {
        try_files $uri $uri/ /index.html;
    }

   location ~* \.(?:jpg|jpeg|png|gif|webp|ico)$ {
        expires 30d;
        add_header Cache-Control "public, max-age=2592000";
        add_header Pragma public; # For older browsers
    }



    listen 443 ssl; # managed by Certbot
    ssl_certificate /etc/letsencrypt/live/mxbeats.com/fullchain.pem; # managed by Certbot
    ssl_certificate_key /etc/letsencrypt/live/mxbeats.com/privkey.pem; # managed by Certbot
    include /etc/letsencrypt/options-ssl-nginx.conf; # managed by Certbot
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem; # managed by Certbot

}


server {
    listen 80;
    listen [::]:80;
    server_name mxbeats.com;

    # This location block is crucial for Certbot renewals with the webroot authenticator.
    location /.well-known/acme-challenge/ {
        # This path must be the webroot of your site.
        root /home/grzegorz/www/mxbeats.com/build;
    }

    # All other HTTP traffic is permanently redirected to HTTPS.
    location / {
        return 301 https://mxbeats.com$request_uri;
    }
}
```

```bash
server {
    server_name mxbeats.com;

    # Logi (zmienione na nową ścieżkę)
    error_log /var/www/mxbeats.com/nginx-error.log;
    access_log off;

    # Zwiększenie limitu uploadu (ważne dla wgrywania mediów do Payload)
    client_max_body_size 50M;

    # 1. Blokowanie podejrzanych plików
    location ~* \.(php|aspx?|jsp|cgi|exe|pl|py)$ {
        return 444;
    }

    # 2. Obsługa wyzwań Certbota (SSL)
    location /.well-known/acme-challenge/ {
        # W Next.js standalone wyzwania najlepiej kierować do folderu public
        root /var/www/mxbeats.com/public;
    }

    # 3. Blokada panelu ADMIN (tylko dla Twojego IP)
    location /admin {
        allow 98.45.5.237; # <--- WPISZ SWOJE IP
        deny all;

        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # 4. Główne Proxy dla Next.js
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # 5. Optymalizacja cache dla obrazków (serwowanych przez Next/Payload)
    location ~* \.(?:jpg|jpeg|png|gif|webp|ico)$ {
        proxy_pass http://localhost:3000;
        expires 30d;
        add_header Cache-Control "public, max-age=2592000";
    }

    # --- Sekcja SSL (ZACHOWANA) ---
    listen 443 ssl; # managed by Certbot
    ssl_certificate /etc/letsencrypt/live/mxbeats.com/fullchain.pem; # managed by Certbot
    ssl_certificate_key /etc/letsencrypt/live/mxbeats.com/privkey.pem; # managed by Certbot
    include /etc/letsencrypt/options-ssl-nginx.conf; # managed by Certbot
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem; # managed by Certbot
}

# --- Przekierowanie HTTP -> HTTPS ---
server {
    listen 80;
    listen [::]:80;
    server_name mxbeats.com;

    location /.well-known/acme-challenge/ {
        root /var/www/mxbeats.com/public;
    }

    location / {
        return 301 https://mxbeats.com$request_uri;
    }
}
```
