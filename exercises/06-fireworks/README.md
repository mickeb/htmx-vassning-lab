# 6. Fyrverkerier när allt är klart 🎆

## Mål

När den sista todon bockas av smäller fyrverkerier över sidan. Är det inte den
sista händer ingenting.

## Bakgrund

Övningen har två halvor, och den första är en repris.

**Ett bibliotek till, genom import map:en.** `fireworks-js` blir en rad till i
tabellen du skrev i övning 1, och importeras sedan med sitt namn.

**Servern bestämmer när det ska firas.** Hittills har varje svar varit HTML som
bytts in någonstans på sidan. Nu ska ett svar också kunna säga *att något har
inträffat* — att det inte finns några todos kvar att bocka av — utan att säga
vad sidan ska göra åt det.

Det görs med en HTTP-header i svaret:

```http
HX-Trigger: fireworks
```

htmx läser headern när bytet är klart och utlöser en händelse med det namnet.
Vad `fireworks` betyder är upp till webbläsaren att avgöra.

| HTTP-header | Svarar på | Dokumentation |
| --- | --- | --- |
| `HX-Trigger` | Vilken händelse ska utlösas när svaret är inbytt? | [Referens](https://four.htmx.org/reference/headers/hx-trigger) |

!!! warning "I htmx 2 fanns tre headers"

    `HX-Trigger`, `HX-Trigger-After-Swap` och `HX-Trigger-After-Settle`. htmx 4
    har slagit ihop dem till en enda, som alltid utlöses efter bytet. Ser du de
    två längre namnen i ett exempel läser du htmx 2-material.

## Steg

### 1. Lägg till fireworks-js i import map:en

Lägg till filen i import map:en i `views/layout.liquid`, under namnet
`fireworks-js`:

```
https://cdn.jsdelivr.net/npm/fireworks-js@2.10.8/dist/index.es.js
```

??? example "Facit"

    ```html
    <script type="importmap">
    {
      "imports": {
        "htmx.org": "https://cdn.jsdelivr.net/npm/htmx.org@4.0.0/dist/htmx.esm.js",
        "fireworks-js": "https://cdn.jsdelivr.net/npm/fireworks-js@2.10.8/dist/index.es.js"
      }
    }
    </script>
    ```

    JSON igen, med samma fälla som i övning 1: ett kommatecken för mycket efter
    sista raden och hela tabellen slutar gälla — även raden för htmx.

### 2. Lyssna på händelsen

I samma fil, i modulskriptet som redan importerar htmx. Importera `Fireworks`,
ge biblioteket en yta att rita på, och starta när händelsen `fireworks` kommer.

!!! note "Lyssna på `document`"

    Knappen som skickade förfrågan finns inte kvar när händelsen kommer — hela
    raden byttes ju ut. htmx utlöser händelsen på det element som gjorde
    förfrågan om det finns kvar, annars på dokumentet. Händelsen bubblar, så
    `document` hör den i båda fallen.

??? example "Facit"

    ```html
    <script type="module">
      import htmx from 'htmx.org'
      import { Fireworks } from 'fireworks-js'

      const stage = document.createElement('div')
      stage.style.cssText = 'position: fixed; inset: 0; pointer-events: none'
      document.body.append(stage)
      const fireworks = new Fireworks(stage)

      document.addEventListener('fireworks', () => {
        fireworks.start()
        setTimeout(() => fireworks.stop(), 5000)
      })
    </script>
    ```

    `stage` är ytan fyrverkerierna ritas på: den täcker rutan, ligger still när
    sidan rullas och tar inte emot klick. Resten är `fireworks-js` eget API och
    har ingenting med htmx att göra.

Ladda om och bocka av den sista todon. Ingenting händer — ingen har sagt till
webbläsaren att något är värt att fira. 😢

### 3. Låt servern säga till

Öppna `src/app.ts` och leta upp hanteraren för
`POST /fragments/todos/:id/complete`. Den hämtar redan `stats` innan den
renderar svaret. En rad till: sätt headern när allt är avbockat.

`stats.allComplete` är sant när det finns todos och alla är klara. En tom lista
är inte klar — ingenting är inte allt.

??? example "Facit"

    ```ts
    const stats = await todos.stats()
    if (stats.allComplete) res.set('HX-Trigger', 'fireworks')

    res.render('todo-app/complete-response', { todo, q, sort, stats })
    ```

## Klart när

- [ ] Att bocka av den sista todon ger fyrverkerier.
- [ ] Att bocka av en todo när det finns fler kvar ger inga fyrverkerier.
- [ ] Svaret på den sista avbockningen har headern `HX-Trigger: fireworks`.
      Nätverkspanelen visar den under svarets headers.
- [ ] Det är fortfarande **en** förfrågan, och raden och räknaren uppdateras som
      förut.

??? question "Fyrverkerierna kommer aldrig"

    Titta på svarets headers i nätverkspanelen. Står `HX-Trigger: fireworks`
    där är det lyssnaren som inte hör: kontrollera att den sitter på `document`
    och att namnet är stavat likadant på båda ställena. Står headern inte där
    är det `if`-satsen i `app.ts` som inte slog till.

??? question "Konsolen säger att `fireworks-js` inte kan slås upp"

    Felet lyder `Failed to resolve module specifier`. Import map:en har ett
    JSON-fel, antagligen ett kommatecken för mycket eller för lite. Då har htmx
    slutat fungera samtidigt — sortering och avbockning laddar om hela sidan
    igen.

## Det som faktiskt hände

`HX-Trigger` innehöll ordet `fireworks`. Inte JavaScript, inte en instruktion
att köra något, inte ens en klass att sätta på ett element. Servern rapporterade
att något hade inträffat — det finns inga todos kvar att bocka av — och frontend
avgjorde själv vad det skulle betyda.

Byt ut lyssnaren mot en `console.log` och servern märker ingen skillnad. Ta bort
fyrverkerierna helt och den fortsätter skicka headern. Det som firas är ett
beslut på servern; hur det firas är ett beslut i frontend, och de två känner
bara till ett ord gemensamt.

Det är samma uppdelning som i övning 4, en nivå upp. Där bar svaret med sig var
varje del hörde hemma. Här bär det med sig att något hänt, och ingenting om vad
som ska ske.

## Och sen?

Varje förfrågan hittills har startat med ett klick — på en länk, på en knapp,
på **Add**.

Nästa övning lämnar över till tangentbordet: listan ska uppdatera sig medan du
skriver i sökfältet. Då blir frågan inte bara vad en förfrågan innehåller, utan
*när* den ska skickas.
