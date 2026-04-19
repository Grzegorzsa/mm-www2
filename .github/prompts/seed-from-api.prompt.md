---
description: Aktualizuje skrypt seedujący na podstawie danych z API Payload (Globals vs Collections)
model: Claude Sonnet 4.6 (copilot)
---

Jesteś ekspertem od struktury danych Payload CMS. Musisz zaktualizować istniejący plik seeda, używając surowych danych JSON pobranych z zakładki API.

### Kontekst i Mapowanie Plików:

**1. Globals (Pojedyncze instancje):**

- **HomePage:** Source #file:src/seed/homepage.json -> Target #file:src/seed/homepage.ts
- **ManualPage:** Source #file:src/seed/manual.json -> Target #file:src/seed/manual.ts
- **DownloadsPage:** Source #file:src/seed/downloads.json -> Target #file:src/seed/downloads.ts

**2. Collections (Wiele stron w jednym pliku):**

- **PrivacyPage:** Source #file:src/seed/privacy-policy.json -> Target #file:src/seed/pages.ts
- **TermsPage:** Source #file:src/seed/terms-and-conditions.json -> Target #file:src/seed/pages.ts
- **RefundPage:** Source #file:src/seed/refund-policy.json -> Target #file:src/seed/pages.ts
- **Products:** Source #file:src/seed/products.json -> Target #file:src/seed/products.ts

### Zasady transformacji:

- **Rozróżnienie typów:** - Dla **Globals** (HomePage, ManualPage) aktualizuj obiekt przesyłany do `payload.updateGlobal`.
  - Dla **Collections** (Privacy, Terms, Refund) aktualizuj odpowiedni obiekt wewnątrz tablicy lub funkcji `payload.create`.
- **Ochrona danych:** W pliku `src/seed/pages.ts` zaktualizuj TYLKO dane strony odpowiadającej przysłanemu JSON-owi (rozpoznaj po polu `slug`). **Nie usuwaj ani nie zmieniaj definicji innych stron znajdujących się w tym samym pliku.**
- **Mapowanie pól:** Przepisz pola `title`, `slug`, `meta` oraz cały obiekt `content` (Lexical Rich Text).
- **Ignoruj metadane systemowe:** NIE przenoś pól `id`, `updatedAt` oraz `createdAt`.
- **Obsługa Media:** Jeśli w sekcji `meta.image` lub wewnątrz `content` pojawią się twarde ID, zamień je na zmienne grafiki zdefiniowane w pliku (np. `logoImage.id`).
- **Formatowanie:** Zachowaj strukturę TypeScript i typowanie.

### Instrukcja wyjściowa:

Zaproponuj precyzyjny kod dla pliku seeda (lub fragment kodu typu "diff"). Upewnij się, że struktura Lexical `root` jest nienaruszona.

Zacznij odpowiedź od: [MXGRID-API-SYNC-ACTIVE]
