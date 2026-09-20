# Vidare läsning

Tre saker i htmx 4 som övningarna inte rör vid, men som är värda att känna till.
Det här är läsning, inte uppgifter — det finns inget att bygga och inget att
bocka av.

Allt nedan gäller **htmx 4**. Söker du på egen hand: kontrollera att det du
hittar inte handlar om htmx 2.

## Morph — ett byte som ändrar i stället för att ersätta

Hittills har varje byte i labbet kastat bort det gamla innehållet och satt dit
nytt. `outerHTML` betyder just det: elementet byts ut.

htmx 4 har två bytesstrategier till, `innerMorph` och `outerMorph`. De *jämför*
det nya innehållet med det som redan står i DOM:en och ändrar bara det som
skiljer. Element som inte ändrats behåller sin identitet — och därmed fokus,
textmarkering, rullningsläge, pågående videouppspelning och allt annat som
hänger på just det elementet.

Algoritmen heter **idiomorph** och är skriven av samma personer som htmx. I htmx
2 var den ett tillägg man fick installera; i htmx 4 ligger den i kärnan.

Det går att prova direkt i labbet: byt `hx-swap="outerHTML"` mot
`hx-swap="outerMorph"` på sökfältet. Listan beter sig likadant — skillnaden är
att raderna som blir kvar efter en filtrering är *samma* element som förut,
inte nya med samma innehåll.

- [Morphing Guide](https://four.htmx.org/docs/morphing-swaps-guide) — vad ett
  morph-byte gör, när det är värt det, och hur man styr det
- [`hx-swap`](https://four.htmx.org/reference/attributes/hx-swap) — alla
  bytesstrategier bredvid varandra
- [idiomorph](https://github.com/bigskysoftware/idiomorph) — algoritmen, om du
  vill veta hur den matchar ihop gammalt och nytt

## `hx-live` — när något ändå måste vara på klienten

Hela labbet bygger på att servern äger tillståndet. Det är inte alltid hela
sanningen: en knapp som ska bli avstängd medan fältet bredvid är tomt behöver
inget serveranrop, och att skicka ett för att få det vore fel väg.

`hx-live` är ett tillägg till htmx 4 för precis det — att binda ihop läget i
DOM:en med små uttryck, utan ett ramverk och utan en modell i JavaScript:

```html
<input id="name">
<button :disabled="!q('#name').value">Submit</button>
```

Dokumentationen inleder med en beslutstrappa som är värd att läsa även om du
aldrig använder tillägget:

```text
Kan HTML lösa det?
├─ ja  → använd HTML
└─ nej
   Kan CSS härleda det?
   ├─ ja  → använd HTML + CSS
   └─ nej → använd hx-live
```

Det är samma hållning som resten av dagen, ett steg längre ut: ta till det
minsta som räcker, och ta till klienten sist.

- [`hx-live`](https://four.htmx.org/extensions/hx-live) — tillägget, med
  beslutstrappan, `q()`, delad `data`-state och de asynkrona hjälpmedlen

## Alpine.js, och htmx-teamets integration

[Alpine.js](https://alpinejs.dev/) är det ramverk som oftast dyker upp bredvid
htmx när något ska hållas på klienten. De två krockar på ett par ställen, och
htmx-teamet har skrivit ett officiellt tillägg som löser det.

Tre saker som annars går sönder, enligt tilläggets dokumentation:

- **Alpine initierar för tidigt.** htmx pausar kort efter ett byte för att låta
  CSS-övergångar hinna. Alpines observatör hinner se DOM:en mitt i det.
  Tillägget håller tillbaka den tills bytet lagt sig.
- **Morph tappar Alpines tillstånd.** Vid `innerMorph` och `outerMorph` flyttar
  tillägget Alpines reaktiva data från det gamla elementet till det nya innan
  morphen körs.
- **Alpine kan binda `id` reaktivt**, vilket får morph-algoritmen att tro att
  två element är olika. Tillägget får den att bortse från det.

Värt att veta även om du inte tänker blanda in Alpine: det säger något om vad
som händer när två bibliotek båda vill äga DOM:en.

- [`hx-alpine-compat`](https://four.htmx.org/extensions/hx-alpine-compat) —
  tillägget och vad det gör
- [Alpine.js](https://alpinejs.dev/) — ramverket självt

!!! note "Tillägg laddas för sig"

    `hx-live` och `hx-alpine-compat` följer med i htmx-paketet men ligger som
    egna filer under `dist/ext/`. De laddas separat från htmx, och `hx-live`
    stänger av sin korta `:`-form automatiskt om Alpine finns på sidan, eftersom
    Alpine använder samma syntax.
