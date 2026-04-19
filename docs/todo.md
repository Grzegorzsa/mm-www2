# To Do

# ToDos and problems

## Kolekcje

### Dodać kolekcję 'Product'. Będzie na razie zawierać pola (App w starym API na Strapi)

- name (text)
- description (text)
- version (text np 1.2.0)
- versionNo (int np 1) - numer wersji liczbowy. Np mamy licencję 1 i możemy używać w aplikacjach npm '1.9.99'
- uid (jakiś identyfikator tekstowy np 'mx-grid' - - tu nie musi być uid, ale tak było w strapi)
- thumb - obrazek png lub jpg...
- dodać relację one to many productExtensions - produkt będzie mógł zawierać wiele (lub żadnych) rozszerzeń

### License

Licencja użytkownika do posiadania produktu

- relacja do produktu
- validTill (w przypadku null - bezterminowo)
- active (bool)
- deactivatedReason(text - np. rezygnacja i refund)
- versionFrom (int minimum version this license covers e.g. 1)
- versionTo (int maximum version this license covers e.g. 999 for all versions)
- info - description
- maxInstallations (int, by default 2 for two allowed concurrent installations)
- relacja do User
- productExtensions - dodać relację

### Dodać kolekcję 'ProductExtensions' - będzie zawierać możliwe rozszerzenia produktu np. essentials, pro, max...

Tu propozycja od Gemini:

```ts
import { CollectionConfig } from 'payload/types'

export const Extensions: CollectionConfig = {
  slug: 'extensions',
  admin: {
    useAsTitle: 'name',
    group: 'Produkty', // Ta sama grupa co kolekcja Products
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true, // np. "Essentials", "Pro", "Trial"
    },
    {
      name: 'key',
      type: 'text',
      required: true,
      unique: true, // np. "essentials", "pro" - do sprawdzania w kodzie Next.js
    },
    {
      name: 'description',
      type: 'textarea',
    },
  ],
}
```

Dodać kolekcję Installations

- user - relacja do użytkownika
- machineID - text - zazwyczaj 10 znaków np: ME36144B9B i oznacza automatycznie wygenerowany przez aplilkację
  identyfikator maszyny
- disabled bool
- disabledReason - text do dodania jeśli chcemy dezaktywować - dla czego
- disabledAt - czas/data deaktywacji
- token - text, np:9ab6c77d555df282a3d59a856eb8843e76a551f4 - służy do logowania aplikacji przy pomocy tokena
- computerName - nazwa komputera użytkownika
- os - system operacyjny użytkownika
- relacja do product - w celach informacyjnych
- certificate - wygenerowany certyfikat

np:

PE1FU1NBR0UgbWVzc2FnZT0iVGhhbmtzIGZvciByZWdpc3RlcmluZyBvdXIgcHJvZHVjdCEiPjxLRVk+IzE5YjE0ZGQ0YzQyOTAzNjcwOWI0ZWE3MTExNmJkMjk0OGIzODZmZTdkNDRjM2RmMDlhNzJjMTFlNzJmYzUyOWJjY2I0NGE3MjZmNWM3YTBlYzA2NDlmNGFhZmFiZGRiMjRiYWE0YjQzNDQzM2I1NmJiMTAyZGZjOTAwOGYzNTc1MmNjODEwMDlmMjY0NDdiZDg1N2ZjMDg2MDQyYjhhNGEzNzJkZDViZDkyNzBkZTA5MzRlYzI1MWFlYTlkMmExZDExOWQ4MjVkMDc3MTA4Yzg5MjIzZjQ0ZjE0MWE0Mzc0ZGE1NTY1ZmViNjc4YjE4ODNlOTI0Njc2YTZhZGIxNWEzYjYyMTRkYWRhZmU1NmRlZTIxODIxOTVkZGQ1MGI3OGQ1YjkxZmFkMzVjNDAyMDRmMDA2MDc0NmM5Nzc4OTNmYjJjNmY1YThhOGIyOGIxNjY4OGEyZTI5ZjdlNDc0OTI4ZDdiNjA3YjRkZmQ3NTRhZWQyZWE3MWY1ZGMzZmNhM2EwODVkZGEyZjFlMTYxNzRhNWU5MTMwNWJjYjYxNzVmYWI0ZWYyYmM1YmM2YmM0M2VlOWE3NTc4NTliYjY4ZTEyYTEwMmJlMTU0MzIyMjJiMzJiNjczNGY5OTY0MDEwOWEyMzI3YzkzM2JlODNkZGI1YjIxODEyZjdjYzg3MmRlZGZhNGIyMDA0MzYxZDI4NTE4ODBlNmJlYjU2YjhhNWQ2YjJlZDg2NDRkMzJiNDk0NWE0YjUwY2I4ZDQ4MmEyMzIwZTU2NGQ1Y2FkNGFjM2VhOGYwMWJkMWE5NTgyMGFkMGMyMjFmYWM1NTNlOGFlNTFhMjZjZmEyN2UwYjVjY2U1NGJiZWRmZjRhYjdmMGQzY2M5ZGZjYzA4NDNkZDcxMDg4ZmRkZDZmYTk0ODhmZWM3YWU2MTM0ODJkNWVmY2EwOTRkZmM2NzlkNDk0ZjY4ODFjMWYwZDNhNjM1MzQ4ZWRkY2UzNzU3YTQyOTQ0Mjk0MzQxZGM1ZjA2ZjhhMjRiZTk0ZGIyZTBlYjYxYTA0ZjAyMDk1OTg0YWY1Y2JhMGQ2OWZiNTE2YmQ4Y2Q2YWU2ZDY5ZjI0MmZjYTIwZDRmZGZjZTZjNGRhZjI0MDkwZTAyNzg5ZDg3MTQzNWJkZWI1Y2EzMWZlOTU3M2FiZmU2NDNiOTJkNGRjYWE5YTFlNjY1OWExOWNmMjJhZDdkZGIxYTk5OGQ5NGNjMTg1YTJlOTM5NjhmNGNkOGQ1MWU5NTQ3ZjEzMTczYjljMDZlNWU5NDNlOGZjYjNhMDg4MTkxYWU0ZTk5YTYxN2U1YjJhMGMwMDcyZTVjMjY2MmY5MzA4ZDBhNGY1Y2Q5N2ZmOTIzNDVkYjU1YzI1NmQ1NDkyNzFlMTZhNzg5Y2U2NTgzZDkzMzkxNjc3ZmQyZTc4NmNkY2IzZGViMjYxMTA4YzdkYTZiZDlmMGE4ODNiMWE2ZjlmNTlkOWM3YmRhYWUzYjA4NGUxNGVjYzRhMmE0OTVmODE3ZDI5ZDk1ZDY2YWIyNWZhMmRkYTE2MzRiNTA0ZGU4OTZiZWI2NzEwMDI5OGM0NDMxYzI2YzgzNjIxYTU5NzI2YjViYmY5Nzc3OTE0ZTcxYzc3YmY1NWViZGFkNjZiNTRkY2I2ZDNmOWIxNTczYzMyYjcyMTg1MjVhNDkwZmFiYjJlZjAwNGE5YTIxZmI1MTEzMmIwNTJlZTE4ZGIxYWJjZTA0OGUwZTA3MzhiZTY2NzE3ZTk4MWQzODhiNDE5YWQ3YWIxZWNmYzRjZWJjZDVhMjE1NWVmZGViYWNkOGE2M2RkNzc5MjliMThmMzg0MmI0OTIwYTY5OWM5ZjlkMzAyNTFhYzhiYmZhNjNiYmE3MDczYmQwZjY4ODdlZWQ3YzIyZDYzOThiNmFhNzE1ZWVkZTQ5NWQxYWM0ZDU1ZTgyYzU2ZTNmNTcxMDljNDNiMjZlZjM1MGJjZGZiNTA3Mjk2YjlhNjFjZDQ3YzVjNWRmZjY4NWViNjAwZGVjNWU3MzliMzBiMTQ0NGVmNjUwNzA0NTg1NjE1MmY4ZDM0MDUyNWM4ZTkxYjliYWYzN2RkMGZjMDM4YzdhM2VlZDQxNDUxYmQ5YWM4YzEwMWQ0YjkwZmRmOWE4MWE1ODQwMWJkZTYwMGY5MmVjM2I2NmM2NTIzZWI0MTYxZjJmZjQ4ODFiNGNhZmM5ZmNlOWRlMmZhNDc0NTQwN2Y2ZWY3NTVlYjJkNzlkN2JlZTY4OTI0MWMxNzcwNWZiMDI3M2U0OTdiMTg1OGFiMWE0MDNiOGE5ZTBiYWUxZDFkOWYyYWNlY2Q0Nzk2MTdlMTQ3NDgwNDAwZjg2YTUyOTU3NTMzNDVmMTcyNzhhMjAxNDYwZWMyNzRiOTkzZTMyMmE0Zjg1ZDJiM2U2MjVmMjFlMGIzZDJmZWEyNmFkMmJlY2NiOGM3NmUzZjRlN2I0OWI3ZmNlOGNhODdkNGMxYzc3YjQzNWRhYzk4MGI1YjE1NzBmYTFjYjk1NDk5NzI0ODhlNGNmMWM2ZTUxZmM4MzkwYjU3NjkyNWI5PC9LRVk+PC9NRVNTQUdFPgA=

### Wygenerować collection WelcomeLicense

Licencje, które mają być przydzielone użytkownikowi, który utworzył konto.

- product - relacja do produktu
- productExtension - relacja do rozszerzenia produktu
- maxInstallations (default 2)
- versionFrom
- versionTo
- info
- daysValid (int 0 - bezterminowo, 30 - na 30 dni)

## Inne

Identyfikator strumienia danych z sieci: 11302064802

Identyfikator pomiaru: G-VBM2MZMXZM

```html
<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-VBM2MZMXZM"></script>
<script>
  window.dataLayer = window.dataLayer || []
  function gtag() {
    dataLayer.push(arguments)
  }
  gtag('js', new Date())

  gtag('config', 'G-VBM2MZMXZM')
</script>
```

## Checkout to be added:

```html
<div class="checkout-consent">
  <input type="checkbox" id="terms-consent" name="terms-consent" required />
  <label for="terms-consent">
    I have read and agree to the
    <a href="/terms" target="_blank">Terms and Conditions</a>,
    <a href="/eula" target="_blank">EULA</a>, and
    <a href="/refund-policy" target="_blank">Refund Policy</a>. I acknowledge that I have tested the
    trial version and confirm my system meets the requirements.
  </label>
</div>
```

Dodać favicon.ico do public!!!

89.45.5.237
109.173.196.129

## Płatności

Wykorzystaj LemonSqueezy lub Paddle.

## Caching

Zastosuj Caching w Nginx: Nawet 1-minutowy cache dla zapytań API ze Strapi sprawi, że strona będzie śmigać błyskawicznie, a procesor serwera niemal nie drgnie.

## Przechowywanie plików

Instalatory VST (często ważące po kilkaset MB) wrzuć na
Cloudflare R2 lub AWS S3 zamiast trzymać je bezpośrednio na serwerze ze Strapi.
Dzięki temu unikniesz problemów z transferem i miejscem na dysku.

## Firewall

fail2ban

## Deploy

Kiedy będziesz gotowy do pierwszego deployu na serwer:

Uruchom `pnpm payload migrate:create --name initial` w dev mode
Nawiguj przez interaktywne pytania (wybierając "create table" dla wszystkich tabel)
Zastąp stare pliki migracji tym jednym pełnym
To będzie właściwy moment — teraz nie ma sensu tego robić
Do tego czasu kontynuuj development normalnie — `pnpm dev` auto-pushuje zmiany schematu, a pnpm payload migrate:create wywołujesz tylko gdy przygotujesz się do deploymentu.

## Sugestia ulepszeń (jeśli security będzie priorytetem)

Cloudflare Turnstile / hCaptcha — jedyna metoda, której bot nie obejdzie analizując bundle JS
Redis-backed rate limiter — potrzebny przy wieloinstancyjnym deploymencie
Sliding window z Redis — np. @upstash/ratelimit (1 linijka konfiguracji)
Nonce endpoint — serwer generuje jednorazowy token podpisany PAYLOAD_SECRET, formularz go dołącza → nie do odtworzenia z bundle'a
