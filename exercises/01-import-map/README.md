# 1. Installera htmx med en import map

## Mål

htmx 4 laddas i todo-appen, och du kan bekräfta i webbläsarens konsol att
versionen är `4.0.0`.

!!! warning "Det mesta du hittar gäller htmx 2"

    Nästan allt htmx-material som finns ute gäller htmx 2: handledningar,
    forumsvar och det en AI-assistent föreslår. Det kan fungera, men det kan
    också ha ändrats i och med version 4. Dubbelkolla alltid på
    <https://four.htmx.org/reference/>.

## Steg

### 1. Lägg till htmx i `views/layout.liquid`

Klistra in det här före `</head>`:

```html
<script type="importmap">
{ "imports": { "htmx.org": "https://cdn.jsdelivr.net/npm/htmx.org@4.0.0/dist/htmx.esm.js" } }
</script>
<script type="module">
  import htmx from 'htmx.org'
</script>
```

htmx startar sig själv när modulen har laddats. Det behövs inget mer.

### 2. Spara och ladda om

Hot reload laddar om sidan åt dig när du sparar. Gå till todo-appen på
<http://localhost:4000/todo-app>, öppna konsolen i webbläsarens
utvecklarverktyg och skriv:

```js
htmx.version
```

## Klart när

- [ ] Nätverkspanelen visar att `htmx.esm.js` hämtats från jsDelivr.
- [ ] `htmx.version` svarar `'4.0.0'` i konsolen.

## Fungerar det inte?

??? question "Ingenting alls händer när du sparar"

    Ladda om sidan manuellt. Händer det fortfarande ingenting har sidan tappat
    kontakten med servern. Starta om servern med `docker compose restart lab`.
