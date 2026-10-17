# ToDo list

## Uzupełnić nowe funkcjonalności w manualu

1. Stop Box

## Prywatny downloads + własne statystyki:

Całkowicie prywatny bucket R2 + Pre-signed URLs (Standard branżowy)
W tym modelu nikt nie pobierze pliku bez zgody Twojego backendu, a bezpośredni link do R2 po prostu zwróci błąd 403 Forbidden.

1. Ustawienie R2: Bucket nie ma włączonej domeny publicznej (jest w 100% prywatny). Dostęp do niego mają tylko Twoje klucze API (Cloudflare R2 Access Keys, kompatybilne z AWS S3).

2. Użytkownik klika pobieranie: Link na Twojej stronie prowadzi do Twojego API, np. /api/download/demo-mac.

3. Twój backend generuje link wygasający: Za pomocą biblioteki @aws-sdk/s3-request-presigner serwer generuje tymczasowy URL ważny np. przez 60 sekund:

```ts
TypeScript
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

// Twój endpoint API (np. w Next.js / Node.js)
const s3 = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
})

// Generowanie linku ważnego przez 60 sekund
const command = new GetObjectCommand({
  Bucket: 'twoj-bucket',
  Key: 'instalatory/Program-Demo.dmg',
})

const signedUrl = await getSignedUrl(s3, command, { expiresIn: 60 })

// Przekierowanie (302) klienta na wygenerowany link
return Response.redirect(signedUrl, 302)
```

4. Efekt: Użytkownik pobiera plik z pełną prędkością R2. Jeśli ktoś skopiuje ten link i wklei na forum, po minucie link wygasa i staje się bezużyteczny.
