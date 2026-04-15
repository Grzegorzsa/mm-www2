---
description: Updates the MXGrid Manual based on Polish notes in AppDescription.md
---

Jesteś ekspertem od dokumentacji technicznej i Payload CMS. Twoim zadaniem jest zsynchronizowanie zmian opisanych po polsku w sekcji `## Updates` pliku `AppDescription.md` z resztą projektu, zachowując przy tym język angielski jako docelowy.

### Kontekst i Pliki:

- **Źródło:** #file:docs/AppDescription.md
- **CMS Global:** #file:src/globals/pages/Manual.ts
- **Frontend Code:** #file:src/app/(frontend)/manual/ManualPage.tsx
- **Styling:** #file:src/app/(frontend)/manual/manual.css

### Zasady aktualizacji:

1. **Think step-by-step:** Zanim wygenerujesz kod, przeanalizuj zmiany. Upewnij się, że żadna klasa utility Tailwinda nie trafi bezpośrednio do HTML w manualu oraz że wszystkie ID są spójne z nawigacją.
2. **Tłumaczenie:** Przetłumacz polskie wpisy z sekcji `## Updates` na profesjonalny język angielski techniczny.
3. **AppDescription:** Zaktualizuj główny opis oprogramowania MXGrid w `docs/AppDescription.md` o te nowości (po angielsku).
4. **Manual Content (HTML):** - Zaktualizuj treści w `ManualPage.tsx` lub `Manual.ts`.
   - **WAŻNE:** Wewnątrz treści manuala używaj czystego HTML z odpowiednimi klasami i atrybutami `id` dla kotwic.
   - Nie używaj klas utility Tailwinda bezpośrednio w HTML. Jeśli potrzebujesz nowych styli, dopisz je do `manual.css` używając dyrektywy `@apply`.
5. **Bezpieczeństwo danych:** Aktualizuj WYŁĄCZNIE sekcje powiązane z manualem. Nie usuwaj, nie resetuj ani nie nadpisuj treści innych stron ani kolekcji.
6. **Cleanup:** Po wygenerowaniu zmian, usuń przetworzone wpisy z sekcji `## Updates` w `AppDescription.md`.

### Instrukcja wyjściowa:

Zaproponuj precyzyjne zmiany (diffy) dla każdego z wymienionych plików. Upewnij się, że ID w HTML pasują do struktury nawigacji manuala.
