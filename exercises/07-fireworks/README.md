# 7. Fyrverkerier när allt är klart! 🎆

## Mål

När den sista todon bockas av smäller fyrverkerier över sidan.

## Headers använda under övningen

| HTTP-header | Svarar på | Dokumentation |
| --- | --- | --- |
| `HX-Trigger` | Vilket event ska triggas när svaret är insatt? | [Referens](https://four.htmx.org/reference/headers/hx-trigger) |

## Template-fragment använda under övningen

| Template | Route | Innehåller |
| --- | --- | --- |
| `views/todo-app/complete-response.liquid` | `POST /todo-app/fragments/todos/:id/complete` | Raden och rubriken, som i övning 6 |

## Steg

### 1. Lägg till fireworks-js i import map:en

För att generera fyrverkerier kommer vi använda ett färdigt bibliotek,
[`fireworks-js`](https://fireworks.js.org/).

Ersätt import map:en i `views/layout.liquid` med den här:

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

### 2. Trigga eventet

Servern bestämmer när det ska firas. Hittills har varje svar varit HTML som
satts in någonstans på sidan. Nu ska ett svar också kunna säga *att något har
inträffat* (att det inte finns några todos kvar att bocka av).

Det görs med HTTP-headern `HX-Trigger` i svaret:

```http
HX-Trigger: fireworks
```

När headern finns i svaret triggar htmx ett event med samma namn som headerns
värde.

!!! warning "Till dig som tidigare använt v2"

    `HX-Trigger`, `HX-Trigger-After-Swap` och `HX-Trigger-After-Settle`. htmx 4
    har slagit ihop dem till en enda, som alltid triggas efter insättningen. Ser
    du de två längre namnen i ett exempel läser du htmx 2-material.

Öppna `src/app.ts` och leta upp route handlern för
`POST /fragments/todos/:id/complete`. Den hämtar redan `stats` innan den
renderar svaret. `stats.allComplete` är sant när det finns todos och alla är
klara. En tom lista ger alltså inga fyrverkerier.

Du sätter en header på svaret på samma sätt som i övning 3:

```ts
res.set('<header>', '<value>')
```

Lägg till en rad som sätter headern när allt är avbockat.

??? example "Facit"

    ```ts
    const stats = await todos.stats()
    if (stats.allComplete) res.set('HX-Trigger', 'fireworks')

    res.render('todo-app/complete-response', { todo, q, sort, stats })
    ```

Bocka av den sista todon och titta på svarets headers i nätverkspanelen.
`HX-Trigger: fireworks` ska nu skickas tillbaka. På sidan blir det dock inga
fyrverkerier 😢. Det är nämligen inget som lyssnar på eventet ännu.

### 3. Hantera eventet

Själva fyrverkerierna är vanlig JavaScript och inte poängen med övningen. Ersätt
modulskriptet i `views/layout.liquid` med det här:

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

Den enda raden som har med htmx att göra är
[`addEventListener`](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener).
`'fireworks'` där är samma sträng som servern satte som värde för
`HX-Trigger`-headern.

!!! note "Varför lyssna på `document`?"

    Knappen som skickade requesten finns inte kvar när eventet kommer. Hela
    raden byttes ju ut. htmx triggar eventet på det element som gjorde requesten
    om det finns kvar, annars på dokumentet. Eventet bubblar, så `document` hör
    det i båda fallen.

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

    Import map:en saknar `fireworks-js`. Kontrollera att du ersatte hela
    import map:en i steg 1.

    I Chrome lyder felet `Failed to resolve module specifier`, i Firefox
    `was a bare specifier, but was not remapped to anything`. Felet stoppar
    hela modulskriptet, så htmx har slutat fungera samtidigt: sortering och
    avbockning laddar om hela sidan igen.
