---
description: Opisuje proces sprzedaży, licencjonowania oraz strategie afiliacyjne w projekcie MXGRID
---

## Files

- `src\collections\Licenses.ts` - Definicja kolekcji Licenses w Payload CMS (klucze aktywacyjne)
- `src\collections\Orders.ts` - Definicja kolekcji Orders w Payload CMS (transakcje, źródła, afiliacja)
- `src\collections\Users.ts` - Definicja kolekcji Users (konta użytkowników, powiązania afiliacyjne)
- `src\app\api\user\licenses\route.ts` - API sprawdzające status licencji dla aplikacji desktopowej
- `src\app\api\user\installations\route.ts` - Śledzenie urządzeń (Hardware ID), na których aktywowano licencję - MAX 2 INSTALACJE na licencję
- `src\app\api\webhooks\lemon\route.ts` - Webhook Lemon Squeezy - obsługa zamówień, aktywacja licencji i rejestracja prowizji

## Słownik pojęć

- "Loops" - Krótkie fragmenty dźwiękowe (audio) powtarzane w pętli, wykorzystywane do budowania podkładu.
- "Beats" - Sekwencje rytmiczne, które można dowolnie modyfikować i programować w siatce (grid).

## Wprowadzenie i Cel

Dokument definiuje architekturę dystrybucji oprogramowania "MX GRID" (dostępnego pod domeną `mxbeats.com`). Każda modyfikacja kodu obsługującego płatności, licencje lub urządzenia musi być zgodna z poniższymi wariantami i scenariuszami.

### Warianty oprogramowania MX GRID

1. **MX GRID Elements** - Darmowa, ograniczona wersja. Wymaga jedynie rejestracji konta użytkownika.
2. **MX GRID Player** - Darmowa wersja desktopowa dystrybuowana przez zewnętrznych partnerów. Odtwarza Loops/Beats, brak obsługi VST/AU, render tylko do MP3 128kbps. **Kluczowa cecha:** Instalator/program zawiera zakodowane ID partnera (affiliate ID). Podczas rejestracji konta przez użytkownika, to ID jest na stałe przypisywane do jego profilu w bazie danych jako stały polecający.
3. **MX GRID Loops Pro** - Wersja komercyjna. Pełne VST/AU, odtwarzanie pętli i beatów w wysokiej jakości, brak możliwości edycji struktury Beats.
4. **MX GRID Beats** - Wersja komercyjna. Zawiera wszystko to co Loops Pro + pełna edycja i tworzenie własnych sekwencji Beats.
5. **MX GRID Composer** - Wersja flagowa (w przygotowaniu). Pełna aranżacja, sekwencery, tworzenie utworów od podstaw.

---

## Architektura Bazy Danych (Wymagania dla Payload CMS)

Proces sprzedaży opiera się na ścisłym rozdzieleniu faktów zakupowych od technicznych kluczy licencyjnych:

- **Kolekcja `Orders`**: Przechowuje `source` (`lemon_squeezy`, `plugin_boutique`), `external_order_id`, kwotę transakcji oraz pola afiliacyjne: `affiliate_partner` (relacja do Users) i `affiliate_rate` (procent prowizji zamrożony w dniu zakupu).
- **Kolekcja `Licenses`**: Zawiera unikalny `license_key`, relację do `user`, relację do `order` (opcjonalna, pusta dla kluczy zewnętrznych przed aktywacją), typ licencji (wyznaczany przez wariant oprogramowania) oraz status (`pending`, `active`, `revoked`).

---

## Scenariusze Sprzedażowe i Logika Biznesowa

### 1. Zakup przez Lemon Squeezy (Własna strona)

- Webhook (`order_created`) uderza w `/api/webhooks/lemon`.
- Skrypt szuka użytkownika po e-mailu (lub tworzy nowe konto).
- Tworzone jest zamówienie w kolekcji `Orders`.
- **Logika Afiliacji:** Skrypt sprawdza `custom_data` z webhooka (afiliacja bieżąca z linku). Jeśli jest pusta, skrypt sprawdza pole polecającego bezpośrednio w profilu zarejestrowanego użytkownika (obsługa użytkowników z wariantu _MX GRID Player_). Jeśli wykryto partnera, do zamówienia dopisywana jest struktura prowizji (np. 10%).
- Generowany jest unikalny klucz licencyjny w kolekcji `Licenses` ze stanem `active` przypisany do konta użytkownika.

### 2. Rejestracja klucza z zewnątrz (np. Plugin Boutique)

- Administrator generuje paczkę kluczy w panelu Payload CMS ze statusem `pending` (puste pole `user` i `order`). Klucze te są przekazywane dystrybutorowi.
- Muzyk po zakupie na zewnętrznej platformie wpisuje klucz w aplikacji desktopowej.
- Aplikacja uderza do endpointu API. System weryfikuje czy klucz jest `pending`.
- Jeśli tak: przypisuje klucz do zalogowanego konta użytkownika, zmienia status na `active` i opcjonalnie tworzy obiekt w `Orders` z flagą `source: 'plugin_boutique'`.

### 3. Kontrola instalacji (Hardware Lock)

- Każda licencja ze statusem `active` może być powiązana z maksymalnie dwoma unikalnymi identyfikatorami sprzętowymi (Hardware ID / HWID) w kolekcji śledzącej instalacje.
- Podczas uruchomienia programu, aplikacja wysyła do `/api/user/installations` klucz licencyjny oraz HWID komputera. Jeśli limit 2 urządzeń zostanie przekroczony, API musi zwrócić błąd odmowy aktywacji, dopóki użytkownik nie zresetuje instalacji w swoim panelu WWW.

### 4. Specjalna Logika dla MX GRID Player & Afiliacji

Klucze dla wersji **MX GRID Player** są generowane w backendzie (status `pending`) i powiązane na stałe z konkretnym partnerem (w polu `affiliate_partner` w encji licencji).

Podczas aktywacji klucza Player przez API (`/api/user/licenses`) muszą zostać spełnione następujące warunki biznesowe:

1. **Reguła nowego konta:** Jeśli użytkownik nie posiada konta, zostaje ono utworzone, a klucz Player jest aktywowany i przypisywany do tego konta. W tym scenariuszu, jeśli klucz Player jest powiązany z partnerem afiliacyjnym, to partner ten otrzymuje prowizję za tę aktywację.
2. **Reguła istniejącego konta:** Jeśli użytkownik posiada już konto, i nie posiada aktywnej licendji Player, Loops, Beats lub Composer, klucz Player może zostać aktywowany, ale nie jest
   dokonywany zapis partnera afiliacyjnego.
3. **Reguła konfliktu:** Jeśli użytkownik posiada już aktywną licencję Player, Loops, Beats lub Composer, próba aktywacji klucza Player powinna zostać odrzucona z komunikatem o konflikcie licencji.
   Użytkownik powinien zostać poinformowany iż posiada już aktywną licencję zawierającą te same funkcje. W tym przypadku, jeśli klucz Player jest powiązany z partnerem afiliacyjnym, to partner ten nie otrzymuje prowizji za tę próbę aktywacji.
