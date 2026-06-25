---
description: Opisuje proces sprzedaży, licencjonowania oraz hybrydowe strategie afiliacyjne w projekcie MXGRID
---

## Files

- `src\collections\Licenses.ts` - Definicja kolekcji Licenses w Payload CMS (klucze aktywacyjne, powiązane z wariantami, zamówieniami i pre-afiliacją)
- `src\collections\Orders.ts` - Definicja kolekcji Orders w Payload CMS (transakcje finansowe: Lemon Squeezy, Plugin Boutique)
- `src\collections\Users.ts` - Definicja kolekcji Users (konta klientów/muzyków, powiązane z opiekunem afiliacyjnym przez referredBy)
- `src\collections\Affiliates.ts` - Dedykowana kolekcja partnerów biznesowych (ręcznie zarządzana, unikalne kody, włączniki active oraz strategie link/key)
- `src\collections\ProductVariants.ts` - Definicja wariantów produktów (zawiera wewnętrzne tekstowe uid oraz dedykowane lemonSqueezyVariantId)
- `src\app\api\user\licenses\route.ts` - API sprawdzające status licencji dla aplikacji desktopowej
- `src\app\api\user\installations\route.ts` - Śledzenie urządzeń (Hardware ID / HWID) - MAX 2 INSTALACJE na licencję
- `src\app\api\webhooks\lemon\route.ts` - Webhook Lemon Squeezy - automatyczne tworzenie kont, zamówień, wyliczanie prowizji i generowanie licencji
- `src\app\api\checkout\purchase\route.ts` - Tworzenie checkoutu dla zakupu bezpośredniego (single variant, redirect_url, receipt link)
- `src\app\api\checkout\upgrade\route.ts` - Tworzenie checkoutu dla upgrade/crossgrade (custom_price, redirect_url, receipt link)
- `src\app\(frontend)\checkout-success\page.tsx` - Strona powrotu po opłaceniu checkoutu Lemon Squeezy
- `src\lib\variantOwnership.ts` - Dziedziczenie ownership między tierami (Composer/Beats/Loops)
- `src\lib\bannedDomains.ts` - Normalizacja i walidacja blokad domen/emaili (w tym aliasy z kropkami)

## Słownik pojęć

- "Loops" - Krótkie fragmenty dźwiękowe (audio) powtarzane w pętli, wykorzystywane do budowania podkładu.
- "Beats" - Sekwencje rytmiczne, które można dowolnie modyfikować i programować w siatce (grid).

## Wprowadzenie i Cel

Dokument definiuje architekturę dystrybucji oprogramowania "MX GRID" (dostępnego pod domeną `mxbeats.com`). Każda modyfikacja kodu obsługującego płatności, licencje, afiliację lub urządzenia musi być zgodna z poniższymi wariantami i scenariuszami.

### Warianty oprogramowania MX GRID (Kolekcja `product-variants`)

1. **MX GRID Elements** - Darmowa wersja na start. Wymaga jedynie rejestracji konta na stronie. Aktywowana bez udziału Lemon Squeezy.
2. **MX GRID Player** - Darmowa wersja desktopowa dystrybuowana przez zewnętrznych partnerów (odtwarza Loops/Beats, brak VST/AU, render MP3 128kbps). Klucze generowane są w backendzie i powiązane z partnerem przez `preassignedPartner`.
3. **MX GRID Loops Pro** - Wersja komercyjna. Pełne VST/AU, brak możliwości edycji struktury Beats. Sprzedawana przez Lemon Squeezy.
4. **MX GRID Beats** - Wersja komercyjna. Wszystko to co Loops Pro + pełna edycja i tworzenie własnych sekwencji Beats. Sprzedawana przez Lemon Squeezy.
5. **MX GRID Composer** - Wersja flagowa (w przygotowaniu). Pełna aranżacja, sekwencery, tworzenie utworów od podstaw.

### Dziedziczenie Uprawnień Wariantów (Krytyczne dla UI i logiki licencji)

- Posiadanie wyższego tieru implikuje posiadanie niższych:
  - `Composer` => `Beats` i `Loops Pro`
  - `Beats` => `Loops Pro`
- W cenniku (homepage) przyciski muszą respektować dziedziczenie:
  - Jeśli użytkownik efektywnie posiada wariant (bezpośrednio lub przez wyższy tier), pokazujemy `Owned` zamiast `Buy`.
  - Jeśli użytkownik nie posiada wariantu, ale ma aktywną ofertę (`upgrade_replace`/`crossgrade`), pokazujemy `Upgrade`/`Crossgrade` zamiast `Buy`.
- Źródło prawdy dla tej logiki w kodzie: helper rozszerzający ownership po tierach (`variantOwnership`).

---

## Architektura Bazy Danych (Wymagania dla Payload CMS 3.x)

- **Kolekcja `Affiliates`**: Zawiera pola: `name`, `affiliateCode` (unikalny string tekstowy), `active` (checkbox umożliwiający blokadę), `user` (relacja 1:1 do kolekcji `users` – konto wypłat partnera), `info` (textarea na notatki) oraz dwie niezależne strategie:
  - `linkStrategy`: grupa zawierająca `enabled` (checkbox), `isLifetime` (checkbox) oraz stawki: `firstPurchaseRate` (domyślnie 20%) i `subsequentPurchaseRate` (domyślnie 10%, aktywne gdy isLifetime=true).
  - `keyStrategy`: grupa zawierająca `enabled` (checkbox), `isLifetime` (checkbox) oraz `commissionRate` (procent prowizji).
- **Kolekcja `Orders`**: Przechowuje `source` (`lemon_squeezy`, `plugin_boutique`), `externalOrderId` (Lemon `order_number` – czytelny numer zamówienia), `lemonOrderId` (techniczne API id zasobu Order w Lemon Squeezy), integer `amount` (w centach), `transactionType` (`new_purchase`, `upgrade`, `crossgrade`, `renewal`), oraz zamrożone pola prowizji: `affiliatePartner` (relacja do `affiliates`) i `affiliateRate` (liczba, procent naliczony w locie). Kolekcja `Orders` jest jedynym źródłem prawdy dla identyfikatorów zamówień.
- **Kolekcja `Users`**: Reprezentuje standardowych klientów. Posiada wyłącznie pole relacji `referredBy` (celujące w kolekcję `affiliates`), wskazujące na stałego opiekuna konta.
- **Kolekcja `ProductVariants`**: Zawiera logiczne pole `uid` (np. "beats", "loops_pro") oraz niezależne pole tekstowe `lemonSqueezyVariantId` mapujące wariant z zewnętrznym ID platformy płatniczej. Każdy produkt musi mieć co najmniej jeden wariant – nawet produkty bez opcji powinny posiadać jeden wariant domyślny (np. "Standard").
- **Kolekcja `CommerceOffers`**: Silnik reguł sprzedażowych. Obsługuje typy akcji: `new_purchase`, `upgrade_replace`, `crossgrade`, `renewal`. Dla crossgrade'ów wymagane jest pole `allowedFromProducts` (lista produktów, z których klient może przejść) oraz `targetVariant` (wariant docelowy). Pole `lemonSqueezyVariantId` jest wymagane dla wszystkich typów poza `upgrade_replace`.
- **Kolekcja `LicenseTransactions`**: Niezmienny log operacji licencyjnych. Nie przechowuje identyfikatorów zamówień – pełne dane zamówienia dostępne przez relację `order` → `Orders`.

### Polityka Wersjonowania Licencji (Krytyczne)

- Pola `versionFrom` i `versionTo` w kolekcji `Licenses` oznaczają **zakres numerów głównych wersji aplikacji** zapisanych jako integer.
- Numer integer wersji pobieramy z `Products.versionNo` (kolekcja `products`).
- Przykład mapowania: wersja aplikacji `1.2.3` oznacza `versionNo = 1`.
- W typowym przypadku licencja ma ten sam zakres start/koniec, np. `versionFrom = 1` i `versionTo = 1`.
- Zakres wielowersyjny stosujemy wyłącznie świadomie (np. klient kupił pod koniec cyklu v1, więc otrzymuje `versionFrom = 1`, `versionTo = 2`).
- **Nigdy przenigdy nie przyznajemy domyślnie nielimitowanego zakresu wersji** (np. automatyczne `1..999` dla zwykłego zakupu).
- Jeśli kod nie ma pewności co do wersji, bezpieczny fallback to `versionFrom = product.versionNo` oraz `versionTo = product.versionNo`.

---

## Scenariusze Sprzedażowe i Logika Biznesowa

### 0. Powrót z Lemon Squeezy po opłaceniu zamówienia

- Checkout musi być tworzony z `product_options.redirect_url`, aby klient automatycznie wracał na stronę aplikacji po udanej płatności.
- Dodatkowo należy ustawiać:
  - `product_options.receipt_button_text`
  - `product_options.receipt_link_url`
- Docelowy landing page po zakupie to strona sukcesu (np. `/checkout-success`) z parametrami kontekstowymi (`flow`, `source`).
- Dla analityki i supportu wymagany jest query param `source=lemon` w redirect URL.
- Zarówno homepage checkout, jak i checkout z panelu ofert powinny działać w tej samej karcie (brak nowego taba).

### 1. Zakup przez sklep i logowanie zaawansowanej afiliacji (Lemon Squeezy)

Podczas uderzenia webhooka `order_created` w `/api/webhooks/lemon`:

1. System szuka użytkownika najpierw po `user_id` z `custom_data`, a dopiero w fallbacku po e-mailu. Jeśli nie istnieje – tworzy go automatycznie i generuje tymczasowe hasło.
2. Webhook pobiera ID wariantu z parametru `variant_id` i szuka rekordu w `product-variants` po polu `lemonSqueezyVariantId`.
3. Idempotentność: sprawdzanie po `externalOrderId` (order_number) lub `lemonOrderId` (API id) – zamówienie nie zostanie przetworzone dwa razy.
4. **Kalkulacja Prowizji Hybrydowej**:
   - Skrypt sprawdza, czy to jest pierwsze zamówienie tego użytkownika (tabela `orders` dla tego `user` jest pusta).
   - **Przypadek A (Płatność z linku)**: W `custom_data` przekazano `affiliate_code`. Jeśli afiliant jest `active`, system sprawdza `linkStrategy`. Za pierwszy zakup nalicza `firstPurchaseRate` (np. 20%), a za kolejne (jeśli włączone jest `isLifetime`) nalicza `subsequentPurchaseRate` (np. 10%). Przy pierwszym zakupie kod afilianta zostaje wpisany na stałe do profilu klienta (`Users.referredBy`).
   - **Przypadek B (Klient powracający z przypisanym opiekunem)**: W płatności brak kodu, ale klient ma w `Users.referredBy` przypisanego partnera. Jeśli partner jest `active`, system sprawdza strategię `keyStrategy` lub `linkStrategy` (zależnie od tego, skąd pierwotnie pochodzi przypisanie) i aplikuje odpowiednią stawkę dla kolejnych zakupów.
5. Tworzony jest obiekt w `Orders` (z `externalOrderId` i `lemonOrderId`), a w kolekcji `Licenses` generowana jest aktywna licencja powiązana z tym zamówieniem.
6. Tworzony jest rekord `LicenseTransactions` jako immutable log operacji – powiązany z `Orders` przez relację `order`.

### 4. Crossgrade (przejście między produktami)

Crossgrade umożliwia użytkownikowi z licencją produktu A zakup produktu B po obniżonej cenie.

1. Checkout crossgrade uruchamiany jest z `flow: crossgrade`, `user_id`, `commerce_offer_id`.
2. Webhook weryfikuje, że użytkownik posiada aktywną licencję na produkt wymieniony w `allowedFromProducts` oferty.
3. Stara licencja zostaje dezaktywowana (`deactivatedReason: 'Crossed over to ...'`).
4. Nowa licencja dla docelowego produktu/wariantu jest tworzona.
5. Wymaga: `user_id` w `custom_data` (hard reject jeśli brak), aktywnej oferty `crossgrade` z uzupełnionym `allowedFromProducts`.

### 2. Specjalna Logika dla MX GRID Player (Aktywacja przez klucz zewnętrzny)

Klucze dla wersji **MX GRID Player** posiadają w bazie Payload status `pending` oraz przypisanego partnera w polu `preassignedPartner` (relacja do `affiliates`).

Podczas wywołania aktywacji klucza Player przez aplikację desktopową:

1. **Nowe konto**: Jeśli użytkownik nie ma konta, system je tworzy, aktywuje licencję Player i na stałe zapisuje tego partnera w profilu użytkownika (`Users.referredBy`). Partner otrzymuje status polecającego na przyszłość.
2. **Istniejące czyste konto**: Jeśli użytkownik ma konto, ale nie posiada żadnych aktywnych licencji (Player, Loops Pro, Beats, Composer), licencja zostaje przypisana i aktywowana, ale partner **nie** zostaje dopisany do jego konta jako stały polecający.
3. **Konflikt**: Jeśli użytkownik ma już jakąkolwiek aktywną licencję wyższą lub równą Player, system odrzuca aktywację i zwraca komunikat o posiadaniu aktywnych funkcji.

### 3. Blokada Urządzeń (Hardware Lock)

Każda aktywna licencja w `Licenses` pozwala na jednoczesne powiązanie z maksymalnie 2 unikalnymi identyfikatorami sprzętowymi komputera (HWID) w celu zabezpieczenia przed piractwem.

### 5. Blokada Emaili i Aliasów z Kropkami

- Przy zapisie i walidacji zablokowanych emaili stosujemy kanoniczną normalizację:
  - lowercase + trim
  - usuwanie kropek z local-part (część przed `@`)
  - przykład: `first.last@gmail.com` => `firstlast@gmail.com`
- Weryfikacja blokady musi porównywać adresy po tej normalizacji, aby uniemożliwić obchodzenie blokady aliasami (`fi.rstlast@gmail.com`, itp.).
- Kompatybilność wsteczna: porównanie powinno uwzględniać także starsze rekordy zapisane przed normalizacją.
