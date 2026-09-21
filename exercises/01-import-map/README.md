# 1. Installera htmx med en import map

## Mål

htmx 4 laddas på varje sida i labbet, och du kan bekräfta i webbläsarens konsol
att versionen är `4.0.0`.

!!! warning "Versionen måste stå utskriven"

    En CDN-länk utan versionsnummer ger **htmx 2**, inte htmx 4, och kommer att
    göra det fram till början av 2027.

    Nästan allt htmx-material som finns ute — handledningar, forumsvar och det
    en AI-assistent föreslår — gäller htmx 2. Det kan fungera, men det kan
    också ha ändrats i och med version 4. Dubbelkolla alltid på
    <https://four.htmx.org/reference/>.

## Steg

### 1. Öppna `views/layout.liquid`

Det är skalet som varje sida i labbet renderas in i. Lägger du något i dess
`<head>` finns det på alla sidor.

### 2. Lägg till import map och modulskript

htmx laddas som en **ES-modul via en import map**. En import map är en liten
JSON-tabell i sidans `<head>` som kopplar ett namn till en URL. När ett
modulskript sedan skriver `import htmx from 'htmx.org'` slår webbläsaren upp
`htmx.org` i tabellen och hämtar filen därifrån — koden behöver alltså aldrig
veta var filen ligger, och versionen kan bytas utan att en enda `import`-rad
rörs.

Båda ska in före `</head>`.

Ordningen spelar roll: **import map:en måste stå före det modulskript som
använder namnet.** Webbläsaren läser tabellen en gång, och har den inte
kommit än när importen körs går uppslaget inte att göra.

??? tip "Ledtråd — formen på en import map"

    ```html
    <script type="importmap">
    { "imports": { "paketnamn": "https://exempel.se/fil.js" } }
    </script>
    ```

    Innehållet är ren JSON. Inga kommentarer, och en trailing comma räcker för
    att hela tabellen ska ignoreras tyst.

??? tip "Ledtråd — vilken URL?"

    Filen som ska laddas är `dist/htmx.esm.js` ur paketet `htmx.org`, version
    `4.0.0`, från jsDelivr:

    ```
    https://cdn.jsdelivr.net/npm/htmx.org@4.0.0/dist/htmx.esm.js
    ```

??? example "Facit — hela tillägget"

    ```html
    <script type="importmap">
    { "imports": { "htmx.org": "https://cdn.jsdelivr.net/npm/htmx.org@4.0.0/dist/htmx.esm.js" } }
    </script>
    <script type="module">
      import htmx from 'htmx.org'
    </script>
    ```

    Det behövs inget mer. htmx startar sig själv när modulen laddats — du
    behöver inte anropa något för att komma igång.

### 3. Spara och ladda om

Hot reload laddar om sidan åt dig när du sparar. Öppna sedan konsolen i
webbläsarens utvecklarverktyg och skriv:

```js
htmx.version
```

## Klart när

- [ ] `htmx.version` svarar `'4.0.0'` i konsolen.
- [ ] Nätverkspanelen visar att `htmx.esm.js` hämtats från jsDelivr.

## Fungerar det inte?

??? question "`htmx is not defined` i konsolen"

    Import map:en står antagligen efter modulskriptet, eller så har JSON:en ett
    syntaxfel. Ett fel i tabellen rapporteras inte alltid tydligt — den slutar
    bara gälla.

??? question "`Failed to resolve module specifier \"htmx.org\"`"

    Webbläsaren hittade ingen import map alls när importen kördes. Kontrollera
    att `type="importmap"` är rätt stavat och att skriptet ligger i `<head>`.

??? question "`htmx.version` svarar `2.x.x`"

    Då pekar URL:en på en oversionerad adress någonstans. Jämför med URL:en i
    ledtråden ovan — versionen ska stå i den.

??? question "Ingenting alls händer när du sparar"

    Kontrollera hot reload-indikatorn på [startsidan](http://localhost:4000).
    Står det `connected` är sidan i kontakt med servern. Står det
    `reconnecting…` startar servern om just nu — vänta någon sekund. Står det
    `not connected` och blir kvar där, ladda om sidan manuellt.
