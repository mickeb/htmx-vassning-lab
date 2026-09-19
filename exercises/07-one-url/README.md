# 7. En adress, två svar

## Mål

Sorteringslänken har bara en adress kvar. `href` och `hx-get` innehåller samma
sträng, och fragmentrutten för tabellen är borttagen.

## Bakgrund

Sedan övning 2 har sorteringslänken burit samma frågesträng två gånger:

```html
href="/todo-app?sort=desc"
hx-get="/todo-app/fragments/table?sort=desc"
```

En för ett vanligt klick, en för htmx. Övningen sa att det inte var tänkt att
förbli så.

Anledningen till att det blev två var att sidan och tabellen har haft var sin
adress. Men de är inte två olika saker — de är **samma sak i två utföranden**.
Hela listan, med eller utan sidan runt omkring.

Och en adress kan svara olika beroende på vem som frågar. htmx skickar en header
i varje förfrågan den gör:

| HTTP-header | Svarar på | Dokumentation |
| --- | --- | --- |
| `HX-Request` | Kommer den här förfrågan från htmx? | [Referens](https://four.htmx.org/reference/headers/hx-request) |

Den är alltid `true` när den finns, och den saknas när webbläsaren hämtar sidan
själv. Det räcker för att servern ska kunna svara på samma adress på två sätt.

!!! note "Den här gången *läser* servern en header"

    I övning 3 satte servern `HX-Retarget` och `HX-Reswap` i svaret, och i
    övning 6 `HX-Trigger`. Det var servern som talade om något för htmx.

    Nu går det åt andra hållet: htmx talar om något för servern, och servern
    väljer vad den skickar tillbaka. Samma sorts mekanism, motsatt riktning.

## Steg

### 1. Låt `/todo-app` svara på två sätt

Öppna `src/app.ts` och leta upp hanteraren för `GET /`. Den renderar alltid hela
sidan. Lägg till en gren före den: kommer förfrågan från htmx, rendera bara
tabellen.

`todos.listModel(...)` ger det som behövs i båda fallen, så hämta det en gång
och låt grenarna dela på det.

??? example "Facit"

    ```ts
    todoApp.get('/', async (req, res) => {
      const { q, sort } = listParams(req.query)
      const model = await todos.listModel(q, sort)

      if (req.get('HX-Request')) {
        res.render('todo-app/todo-table', model)
        return
      }

      res.render('todo-app/page', model)
    })
    ```

    `res.render('todo-app/todo-table', model)` är exakt vad fragmentrutten redan
    gjorde. Det är därför den strax kan tas bort.

### 2. Peka om sorteringslänken

Öppna `views/todo-app/todo-table.liquid`. `hx-get` ska nu hämta samma adress som
`href` redan pekar på.

??? tip "Ledtråd"

    Du behöver inte skriva en ny sträng. Den står redan i `href`.

??? example "Facit"

    ```html
    <a class="sort sort--{{ sort }}"
       href="/todo-app?sort={{ next_sort }}{% if q != "" %}&amp;q={{ q | url_encode }}{% endif %}"
       hx-get="/todo-app?sort={{ next_sort }}{% if q != "" %}&amp;q={{ q | url_encode }}{% endif %}"
       hx-target="#todo-table"
       hx-swap="outerHTML">
    ```

Sortera ett par gånger. Det ska bete sig precis som förut.

### 3. Ta bort fragmentrutten

Ingen använder `GET /todo-app/fragments/table` längre. Ta bort den ur
`src/app.ts`.

!!! note "Länken från startsidan försvinner med den"

    Övningssidans startsida ber dig öppna `/todo-app/fragments/table` i en flik,
    för att se att det som kommer tillbaka är HTML och inte JSON. Den adressen
    svarar `404` efter det här steget.

    Det är inte en olycka utan poängen: rutten fanns för att göra de tidiga
    övningarna små. `/todo-app/fragments/header` finns kvar om du vill titta på
    ett fragment igen.

??? example "Facit"

    ```ts
    // Hela den här hanteraren ska bort:
    todoApp.get('/fragments/table', async (req, res) => {
      const { q, sort } = listParams(req.query)
      res.render('todo-app/todo-table', await todos.listModel(q, sort))
    })
    ```

## Klart när

- [ ] Sortering fungerar som förut: **en** förfrågan, ingen sidladdning, och
      pilen växlar åt rätt håll varje gång.
- [ ] `hx-get` och `href` innehåller samma sträng.
- [ ] `/todo-app/fragments/table` svarar `404`.
- [ ] Öppnar du `href`-adressen i en ny flik kommer **hela sidan** tillbaka,
      sorterad som adressen säger.

??? question "Hela sidan hamnar inne i tabellen"

    Då träffade grenen i `app.ts` inte, så htmx fick tillbaka ett helt dokument
    och bytte in det i `#todo-table`. Kontrollera stavningen: `HX-Request`.

??? question "Sorteringen ger 404"

    Rutten är borttagen men länken pekar fortfarande på `/fragments/table`.
    Steg 2 och steg 3 hör ihop.

## Det som faktiskt hände

### Samma länk fungerar med och utan htmx

Det här är argumentet för hela angreppssättet, och nu står det i märkningen i
stället för i en beskrivning av det.

Sorteringslänken är **en** länk till **en** adress. Klickar du med htmx laddat
hämtas adressen med `fetch` och tabellen byts ut. Vore htmx inte laddat — ett
skript som inte hann fram, en webbläsare som inte kör det — följer webbläsaren
länken och hämtar samma adress som ett vanligt sidbyte. Servern svarar med hela
sidan, eftersom `HX-Request` saknas, och resultatet blir detsamma. Bara dyrare.

Ingenting behövde skrivas två gånger för att få det. Det som togs bort var en
rutt, inte något som lades till.

### Fragmentrutten var en byggnadsställning

Den fanns för att de tidiga övningarna skulle handla om htmx och inte om
routing. Nu när du vet vad ett fragmentsvar är slutade den betala för sig.

Kvar finns idén den fanns till för: **servern bestämmer vad ett svar
innehåller.** Först utifrån vad som hände — en rad, en rubrik, en händelse — och
nu också utifrån vem som frågar.

## Och sen?

Sortera så att nyast ligger först. Titta sedan på adressfältet.

Det står `/todo-app`. Kopiera adressen, öppna den i en ny flik, och listan
kommer tillbaka i fel ordning — sidan visar en sortering som adressen inte
känner till.
