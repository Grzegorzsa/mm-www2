# Deployment Checklist (Live)

Poniżej jest minimalna checklista pod wejście na produkcję.

## Przed live (D-1)

### 1. Potwierdź stan kodu i testów

Uruchom:

```bash
pnpm run test:int
pnpm run test:e2e
pnpm audit --prod
```

Uwaga: obecny wynik `pnpm audit --prod` jest akceptowalny na ten moment, bo krytyczne luki app-level są już domknięte.

### 2. Zweryfikuj konfigurację produkcyjną `.env`

- `NODE_ENV=production`
- `NEXT_PUBLIC_SERVER_URL` ustawione na docelową domenę HTTPS
- `DATABASE_URL` wskazuje bazę produkcyjną
- SMTP i Lemon Squeezy mają poprawne klucze oraz sekrety

### 3. Potwierdź checkout URL hardening

Sprawdź, że endpointy checkout nie używają fallbacku origin w produkcji:

- [src/app/api/checkout/purchase/route.ts](src/app/api/checkout/purchase/route.ts)
- [src/app/api/checkout/upgrade/route.ts](src/app/api/checkout/upgrade/route.ts)

### 4. Ustaw sensowne logowanie rate limiterów

- `RATE_LIMITER_LOG_ENABLED=true`
- `RATE_LIMITER_LOG_MODE=summary`
- `RATE_LIMITER_LOG_SUMMARY_INTERVAL_MS=60000`

### 5. Backup przed wdrożeniem

- Backup bazy danych
- Snapshot wolumenu uploadów/media

## Wdrożenie (D-day)

### 1. Deployment

- Zdeployuj aktualny build na serwer
- Uruchom migracje Payload (jeśli są nowe)

### 2. Smoke test po deployu

- Homepage
- Logowanie, rejestracja, reset hasła
- Checkout purchase i upgrade
- Webhook Lemon Squeezy (test event)
- Endpointy instalacji/licencji dla aplikacji desktop

### 3. Monitoring i infrastruktura

- Potwierdź, że Sentry odbiera błędy
- Potwierdź, że logi rate limiterów pojawiają się i nie zalewają logów
- Potwierdź certyfikat SSL i poprawny redirect HTTP -> HTTPS

## Go / No-Go

### GO jeśli

- Testy przechodzą
- Checkout i webhook działają
- Logowanie/reset hasła działa
- Brak błędów krytycznych w logach po smoke teście

### NO-GO jeśli

- Checkout/webhook nie zapisują zamówień lub licencji
- Auth flow jest niestabilny
- Baza lub SMTP nie działa poprawnie

## Plan rollback (must have)

- Trzymaj gotowy poprzedni obraz aplikacji
- Trzymaj backup bazy sprzed deployu
- Miej jedną komendę lub flow na powrót do poprzedniej wersji
- Po rollbacku od razu wyłącz ruch (maintenance/503) do czasu potwierdzenia integralności

---

Opcja operacyjna: jutro możemy przejść tę listę krok po kroku w trybie operator checklist.
