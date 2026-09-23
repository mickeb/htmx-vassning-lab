# 8. En adress, två svar

## Mål

En och samma adress används både när webbläsaren hämtar hela sidan och när htmx
hämtar bara tabellen.

## Varför två adresser?

Sedan övning 2 har sorteringslänken haft samma query string två gånger:

```html
href="/todo-app?sort=desc"
hx-get="/todo-app/fragments/table?sort=desc"
```

En för vanlig navigering, en för htmx.

Det var för att förenkla de tidigare övningarna: routen under `/fragments/` fanns
färdig, så du kunde peka `hx-get` på den utan att skriva någon serverkod.

Men båda adresserna returnerar samma innehåll: tabellen. Det enda som skiljer
är om sidan ligger runt omkring eller inte.

I en "riktig app" är det vanligt att man strävar efter att kunna använda samma
adress.

## Headers använda under övningen

| HTTP-header | Svarar på | Dokumentation |
| --- | --- | --- |
| `HX-Request` | Kommer den här requesten från htmx? | [Referens](https://four.htmx.org/reference/headers/hx-request) |

## Template-fragment använda under övningen

| Template | Route | Innehåller |
| --- | --- | --- |
| `views/todo-app/todo-table.liquid` | `GET /todo-app`, med `HX-Request` | Tabellen, utan sidan runt omkring |

## Steg

### 1. Låt `/todo-app` svara på två sätt

En adress kan svara olika beroende på vem som frågar. htmx skickar headern
`HX-Request` i varje request den gör: den är alltid `true` när den finns, och
saknas när webbläsaren hämtar sidan själv. Det räcker för att servern ska
kunna svara på samma adress på två sätt.

!!! note "Den här gången *läser* servern en header"

    I övning 3 satte servern `HX-Retarget` i svaret, och i övning 7
    `HX-Trigger`. Båda gångerna satt headern i svaret.

    Nu går det åt andra hållet: headern sitter i requesten, och servern läser
    den för att välja vad den skickar tillbaka. Samma mekanism, motsatt
    riktning.

1. Öppna `src/app.ts` och leta upp route handlern för `GET /`. Den renderar
   alltid hela sidan, med `model`.
2. Lägg till en `if`-sats före `res.render` som kollar om requesten har
   headern `HX-Request`. Har den det kommer requesten från htmx, och då ska
   bara `todo-app/todo-table` renderas, med samma `model`.

??? tip "Ledtråd — läsa en header i Express"

    `req.get('<header>')` ger värdet på en header i requesten, eller `undefined`
    om den saknas. Det räcker alltså att kolla om det finns något:

    ```ts
    if (req.get('<header>')) {
      // ...
    }
    ```

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

    `res.render('todo-app/todo-table', model)` är exakt vad routen under
    `/fragments/` redan gjorde. Den är alltså död kod från och med nu.

### 2. Peka om sorteringslänken

1. Öppna `views/todo-app/todo-table.liquid` och leta upp sorteringslänken.
2. Ändra `hx-get` så att den hämtar samma adress som `href` redan pekar på.

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

## Klart när

- [ ] Sortering fungerar som förut: **en** request, ingen sidladdning, och
      pilen växlar åt rätt håll varje gång.
- [ ] `hx-get` och `href` innehåller samma sträng.
- [ ] Öppnar du `href`-adressen i en ny flik kommer **hela sidan** tillbaka,
      sorterad enligt `?sort=` i adressen.

## Fungerar det inte?

??? question "Hela sidan hamnar inne i tabellen"

    Då slog `if`-satsen i `app.ts` inte till, så htmx fick tillbaka ett helt
    dokument och satte in det i `#todo-table`. Kontrollera stavningen: `HX-Request`.
