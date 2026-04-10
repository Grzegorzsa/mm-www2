# To Do

# ToDos and problems

1. W manualu w Box Editor -> DSP Effect ->Pitch — pitch shift (−12 to +12 semitones), without changing duration (duration zamienić na tempo)

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
