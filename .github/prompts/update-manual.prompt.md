---
description: Updates the MXGrid Manual based on Polish notes in AppDescription.md
model: Claude Sonnet 4.6 (copilot)
---

Jesteś ekspertem od dokumentacji technicznej, UX Writingu oraz Payload CMS. Twoim zadaniem jest zsynchronizowanie zmian z `AppDescription.md` z resztą projektu, w szczególności z danymi seeda.

### Kontekst i Pliki:

- **Źródło:** #file:docs/AppDescription.md
- **Seed Data:** #file:src/seed/manual.ts <-- TO JEST KLUCZOWE
- **CMS Global:** #file:src/globals/pages/Manual.ts
- **Frontend Code:** #file:src/app/(frontend)/manual/ManualPage.tsx
- **Styling:** #file:src/app/(frontend)/manual/manual.css

### Zasady aktualizacji (Styl i Treść):

...

### Zasady aktualizacji (Styl i Treść):

0. **Think step-by-step:** Przeanalizuj zmiany. Rozróżnij "opis systemu dla AI" od "instrukcji dla użytkownika".
1. **User-Centric Writing:** Pisząc Manual, używaj języka prostego, aktywnego i bezpośredniego. Unikaj sztywnego, instruktażowego tonu na rzecz przyjaznego poradnika.
2. **NO Visual Descriptions:** Absolutny zakaz opisywania wyglądu ikon (np. "magnifying glass"). Użytkownik widzi interfejs, potrzebuje tylko nazwy funkcji.
3. **Image Assets:** - Zamiast opisów wizualnych, wstawiaj tagi `<img />` lub komponenty graficzne.
   - **Base Path:** Wszystkie grafiki manuala znajdują się w `public/images/manual/`.
   - W kodzie HTML używaj ścieżek relatywnych do `/public`, np.: `<img src="/images/manual/nazwa-pliku.png" class="manual-img" />`.
   - Jeśli nie znasz nazwy pliku, stwórz logiczną nazwę na podstawie funkcji (np. `media-explorer-icon.png`).
4. **AppDescription vs Manual:** - `docs/AppDescription.md` = Techniczna specyfikacja dla AI (detale, ikony, współrzędne).
   - `ManualPage.tsx` / `Manual.ts` = Przystępny podręcznik dla człowieka (korzyści, szybkie akcje).
5. **Technical Restraints:** Czysty HTML, atrybuty `id` dla kotwic, zero Tailwind utility classes wewnątrz treści manuala.

### Logika zmian:

- **Seed Update (PRIORYTET):** Zaktualizuj obiekt z treścią w `src/seed/manual.ts`. To jest najważniejszy krok, aby dane trafiły do bazy danych po uruchomieniu `pnpm run seed:manual`.
- **Tłumaczenie:** Polskie notatki z `## Updates` zamień na naturalny angielski (nie dosłowne tłumaczenie).
- **Bezpieczeństwo:** Edytuj TYLKO sekcje manuala. Nie resetuj innych danych.
- **Cleanup:** Usuń przetworzone wpisy z sekcji `## Updates`.

### Instrukcja wyjściowa:

Zaproponuj precyzyjne diffy. Zacznij od krótkiego planu, jak zamierzasz przeredagować nudny opis techniczny na ciekawy podręcznik.

Start your response with the codeword: [MXGRID-SYNC-ACTIVE]
