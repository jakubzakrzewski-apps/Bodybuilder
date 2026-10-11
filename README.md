# Bodybuilder

Prosta aplikacja (PWA) do zapisywania treningów siłowych. Czysty HTML/CSS/JS, bez budowania.

## Uruchomienie lokalnie

```bash
python -m http.server 5173
```

Otwórz http://localhost:5173.

## Na telefon

Service worker i instalacja „Dodaj do ekranu głównego” wymagają HTTPS. Najprościej wrzucić folder
na darmowy hosting statyczny (GitHub Pages, Netlify, Cloudflare Pages), otworzyć adres na telefonie
i dodać do ekranu głównego. Potem aplikacja działa offline.

## Dane

Wszystko zapisuje się w `localStorage` przeglądarki na danym urządzeniu (klucz `trening.v1`).
Kopia zapasowa: Historia → Dane → Eksportuj / Importuj.

## Pliki

- `app.js` — cała logika: stan, widoki, akcje
- `styles.css` — wygląd (bez zaokrągleń, biel + czerń, czerwony akcent z logo)
- `sw.js` — cache offline
- `icons/` — logo w różnych rozmiarach
- `img/` — zdjęcia ćwiczeń (`<nazwa>.jpg` przycięte na osobę, `<nazwa>-t.jpg` miniatura)
  z [free-exercise-db](https://github.com/yuhonas/free-exercise-db), licencja Unlicense (public domain)
