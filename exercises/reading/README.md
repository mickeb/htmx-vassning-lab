# Vidare läsning

Tre saker i htmx 4 som övningarna inte rör vid, men som är värda att känna till.
Det här är läsning, inte uppgifter — det finns inget att bygga och inget att
bocka av.

Allt nedan gäller **htmx 4**. Söker du på egen hand: kontrollera att det du
hittar inte handlar om htmx 2.

## Morph — ändrar i stället för att ersätta

Där `outerHTML` kastar bort det gamla elementet och sätter dit ett nytt,
*jämför* en morph det nya innehållet med det som redan står i DOM:en och
ändrar bara det som skiljer. Element som inte ändrats behåller sin identitet,
och därmed fokus, textmarkering och rullningsläge.

- [Morphing Guide](https://four.htmx.org/docs/morphing-swaps-guide) — vad en
  morph gör, när det är värt det, och hur man styr det

## `hx-live` — när något ändå måste vara på klienten

Hela labbet bygger på att servern äger tillståndet. Det är inte alltid hela
sanningen: en knapp som ska bli avstängd medan fältet bredvid är tomt behöver
ingen request till servern, och att skicka en för att få det vore fel väg.

`hx-live` är ett tillägg till htmx 4 för precis det — att binda ihop läget i
DOM:en med små uttryck, utan ett ramverk och utan en modell i JavaScript.

- [`hx-live`](https://four.htmx.org/extensions/hx-live) — tillägget, med
  beslutsträdet, `q()`, delad `data`-state och de asynkrona hjälpmedlen

## Alpine.js

[Alpine.js](https://alpinejs.dev/) är det ramverk som oftast dyker upp bredvid
htmx när något ska hållas på klienten. De två krockar på ett par ställen, och
htmx-teamet har skrivit ett officiellt tillägg som löser det.

- [`hx-alpine-compat`](https://four.htmx.org/extensions/hx-alpine-compat) —
  tillägget och vad det gör
- [Alpine.js](https://alpinejs.dev/) — ramverket självt

!!! note "Tillägg laddas för sig"

    `hx-live` och `hx-alpine-compat` följer med i htmx-paketet men ligger som
    egna filer under `dist/ext/`. De laddas separat från htmx, och `hx-live`
    stänger av sin korta `:`-form automatiskt om Alpine finns på sidan, eftersom
    Alpine använder samma syntax.
