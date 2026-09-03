# Procedura Znakowania Czasem Dokumentów (RFC 3161 Timestamping)

Niniejsza procedura służy do uzyskania niezaprzeczalnego, kryptograficznego dowodu istnienia pliku (np. regulaminu Terms & Conditions w formacie PDF) w określonym punkcie w czasie, bez ujawniania jakichkolwiek prywatnych danych osobowych (takich jak PESEL, adres czy imię).

---

## 1. Dlaczego to rozwiązanie chroni prywatność i jest pewne prawnie

* **Brak danych osobowych:** W przeciwieństwie do Profilu Zaufanego (gov.pl), token `.tsr` nie zawiera Twojego numeru PESEL ani imienia i nazwiska.
* **Tylko skrót matematyczny:** Do zewnętrznego urzędu czasu przesyłany jest wyłącznie skrót SHA-256 pliku, a nie treść dokumentu. Nikt nie widzi zapisów Twojego regulaminu.
* **Matematyczny dowód istnienia:** Zgodnie ze standardem RFC 3161 urząd czasu (TSA) poświadcza kryptograficznie, że plik o identycznym skrócie co do bita istniał przed wskazanym momentem.

---

## 2. Dostępne serwery Urzędów Czasu (TSA)

Do generowania znacznika służą publiczne, bezpłatne serwery TSA:

* **FreeTSA (Rekomendowany, łatwa weryfikacja z OpenSSL):**
  * Punkt końcowy (URL do zapytania): `https://freetsa.org/tsr`
  * Certyfikaty do weryfikacji: `https://freetsa.org/files/tsa.crt` oraz `https://freetsa.org/files/cacert.pem`
* **DigiCert:**
  * Punkt końcowy: `http://timestamp.digicert.com`
* **Sectigo:**
  * Punkt końcowy: `http://timestamp.sectigo.com`

---

## 3. Instrukcja krok po kroku (OpenSSL + curl)

Wymagane narzędzia: `openssl` oraz `curl` (domyślnie dostępne w Git Bash na Windows, w macOS Terminal oraz w systemach Linux).

### Krok 1: Przygotuj ostateczną wersję dokumentu

Umieść gotowy plik PDF w docelowym folderze, np.:

```text
Terms_and_Conditions_v1.2.1.pdf
Ważne: Po wygenerowaniu znacznika pliku PDF nie wolno edytować ani zapisywać ponownie (nawet spacja lub zmiana metadanych programu PDF zmieni hash SHA-256 i unieważni weryfikację).
```

### Krok 2: Utwórz zapytanie o znacznik czasu (.tsq)

Otwórz terminal w katalogu z plikiem PDF i wykonaj:

```Bash
openssl ts -query -data Terms_and_Conditions_v1.2.1.pdf -no_nonce -sha256 -out Terms_and_Conditions_v1.2.1.tsq
```

### Krok 3: Wyślij zapytanie do serwera TSA i pobierz token (.tsr)

Wyślij zapytanie do serwera FreeTSA za pomocą curl:

```Bash
curl -H "Content-Type: application/timestamp-query" --data-binary "@Terms_and_Conditions_v1.2.1.tsq" [https://freetsa.org/tsr](https://freetsa.org/tsr) > Terms_and_Conditions_v1.2.1.tsr
```

Plik tymczasowy `Terms_and_Conditions_v1.2.1.tsq` możesz teraz usunąć. Kluczowym dowodem jest plik wynikowy: `Terms_and_Conditions_v1.2.1.tsr`.

## 4. Co publikować, a co trzymać w archiwum
- Na stronie internetowej (publicznie): Publikujesz czysty plik `Terms_and_Conditions_v1.2.1.pdf` (bez PESEL-u, z podaną w treści datą wejścia w życie, np. Effective Date: September 2026).

Na Twoim dysku (archiwum prywatne):

```text
/Archiwum_Prawne/v1.2.1/
  ├── Terms_and_Conditions_v1.2.1.pdf
  └── Terms_and_Conditions_v1.2.1.tsr
```

## 5. Jak odczytać datę i zweryfikować dowód w przyszłości

Gdy po roku, dwóch latach lub podczas sporu prawnego trzeba udowodnić datę:

Szybki podgląd zapisanej daty (bez certyfikatów CA)
Aby wyświetlić dokładny czas UTC zapisany w tokenie:

```Bash
openssl ts -reply -in Terms_and_Conditions_v1.2.1.tsr -text
```

W polu `Time stamp` pojawi się dokładna urzędowa data i godzina.

Pełna weryfikacja kryptograficzna spójności pliku

### 1. Pobierz certyfikaty urzędu FreeTSA (jeśli nie masz ich lokalnie):

```Bash
curl -O [https://freetsa.org/files/cacert.pem](https://freetsa.org/files/cacert.pem)
curl -O [https://freetsa.org/files/tsa.crt](https://freetsa.org/files/tsa.crt)
```

### 2. Zweryfikuj plik PDF względem tokenu .tsr:

```bash
openssl ts -verify -data Terms_and_Conditions_v1.2.1.pdf -in Terms_and_Conditions_v1.2.1.tsr -CAfile cacert.pem -untrusted tsa.crt
```

Komunikat:

```text
Verification: OK
```

oznacza matematyczny, bezdyskusyjny dowód, że plik PDF w tej dokładnej wersji istniał w zarejestrowanej dacie.