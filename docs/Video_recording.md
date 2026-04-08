# Video recording

1. Use ShareX - hi recording settings during recording - for max quality
2. Convert using 50% quality H.264 / x264 for maximum compatibility

Dodatkowe opcje:

```bash
# Zmniejszenie skali do 50%
-vf "scale=trunc(iw/4)*2:trunc(ih/4)*2"

# Optymalizacja pod statyczny obraz
-tune stillimage

# Wyłączyć dźwięk, dodać:
-an
# usunąć
-c:a aac -b:a 128k

# skrypt
-i "C:\Users\grzegorz\Documents\ShareX\Screenshots\2026-04\source.mp4" -c:v libx264 -preset slower -crf 26 -tune stillimage  -pix_fmt yuv420p -movflags +faststart -an -y "C:\Users\grzegorz\Documents\ShareX\Screenshots\output.mp4"
```
