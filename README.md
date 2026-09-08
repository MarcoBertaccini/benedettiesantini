# Benedetti & Santini — Sito demo

Sito vetrina (demo) per lo **Studio Tecnico Associato Ing. Giovanni Benedetti e Ing.
Elena Santini** — Cesena (FC). Studio di ingegneria impiantistica: impianti meccanici,
elettrici e speciali, prevenzione incendi e sicurezza, acustica, energie rinnovabili,
diagnosi energetiche.

## Struttura

```
index.html        Pagina unica (single-page) con tutte le sezioni
css/styles.css    Design system (token) + layout + componenti
js/main.js        Interazioni: nav, scrollytelling, galleria/lightbox
assets/img/       Fotografie (fornite dallo Studio)
```

## Avvio in locale

Nessun build. Server statico:

```bash
python3 -m http.server 8000
# apri http://localhost:8000
```

## Note

- I contenuti testuali riprendono fedelmente il significato dei materiali dello Studio
  (copy rifinito, nessun dato inventato).
- Le fotografie sono di proprietà dello Studio Benedetti & Santini.
- Il form contatti è dimostrativo (validazione lato client, nessun invio).
