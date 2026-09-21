# 7. Fyrverkerier när allt är klart 🎆

## Mål

När den sista todon bockas av smäller fyrverkerier över sidan.

## Användbara headers

| HTTP-header | Svarar på | Dokumentation |
| --- | --- | --- |
| `HX-Trigger` | Vilken händelse ska utlösas när svaret är insatt? | [Referens](https://four.htmx.org/reference/headers/hx-trigger) |

## Steg

### 1. Lägg till fireworks-js i import map:en

Fyrverkerierna ritas av ett färdigt bibliotek,
[`fireworks-js`](https://fireworks.js.org/) — du skriver ingen
animationskod själv. Det blir en rad till i import map:en du skrev i övning 1,
och importeras sedan med sitt namn.

Lägg till filen i `views/layout.liquid`, under namnet `fireworks-js`:

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

Servern bestämmer när det ska firas. Hittills har varje svar varit HTML som
satts in någonstans på sidan. Nu ska ett svar också kunna säga *att något har
inträffat* — att det inte finns några todos kvar att bocka av — utan att säga
vad sidan ska göra åt det.

Det görs med en HTTP-header i svaret:

```http
HX-Trigger: fireworks
```

htmx läser headern när svaret är insatt och utlöser en händelse med det namnet.
Vad `fireworks` betyder är upp till webbläsaren att avgöra.

!!! warning "I htmx 2 fanns tre headers"

    `HX-Trigger`, `HX-Trigger-After-Swap` och `HX-Trigger-After-Settle`. htmx 4
    har slagit ihop dem till en enda, som alltid utlöses efter insättningen. Ser
    du de två längre namnen i ett exempel läser du htmx 2-material.

I samma fil, i modulskriptet som redan importerar htmx. Importera `Fireworks`,
ge biblioteket en yta att rita på, och starta när händelsen `fireworks` kommer.

!!! note "Lyssna på `document`"

    Knappen som skickade requesten finns inte kvar när händelsen kommer — hela
    raden byttes ju ut. htmx utlöser händelsen på det element som gjorde
    requesten om det finns kvar, annars på dokumentet. Händelsen bubblar, så
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

Ladda om och bocka av den sista todon. Ingenting händer — inget svar har
skickat headern ännu. 😢

### 3. Låt servern skicka headern

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
- [ ] Det är fortfarande **en** request, och raden och räknaren uppdateras som
      förut.

## Fungerar det inte?

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

## Nästa övning

Öppna `views/todo-app/todo-table.liquid` och titta på sorteringslänken igen.
Adressen står där två gånger: en gång i `href`, en gång i `hx-get`. Samma
frågesträng, olika sökväg.

Nästa övning tar bort den ena. Servern får svara på samma adress på två sätt.
