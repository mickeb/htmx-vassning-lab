# 8. En adress, två svar

## Mål

En och samma adress används både när webbläsaren hämtar hela sidan och när htmx
hämtar bara tabellen.

## Varför två adresser?

Sedan övning 2 har sorteringslänken haft samma frågesträng två gånger:

```html
href="/todo-app?sort=desc"
hx-get="/todo-app/fragments/table?sort=desc"
```

En för ett vanligt klick, en för htmx.

Det var för att förenkla de tidigare övningarna: routen under `/fragments/` fanns
färdig, så du kunde peka `hx-get` på den utan att skriva någon serverkod.

Men båda adresserna returnerar samma innehåll: tabellen. Det enda som skiljer
är om sidan ligger runt omkring eller inte.

I en "riktig app" är det vanligt att man strävar efter att kunna använda samma
adress — av skäl vi tittar på i nästa övning.

## Användbara headers

| HTTP-header | Svarar på | Dokumentation |
| --- | --- | --- |
| `HX-Request` | Kommer den här requesten från htmx? | [Referens](https://four.htmx.org/reference/headers/hx-request) |

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

Öppna `src/app.ts` och leta upp hanteraren för `GET /`. Den renderar alltid hela
sidan. Lägg till en `if`-sats före den: kommer requesten från htmx, rendera
bara tabellen.

`todos.listModel(...)` ger det som behövs i båda fallen, så hämta det en gång
och låt båda fallen dela på det.

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

## Värt att känna till

`/todo-app/fragments/table` finns kvar i labbet, men ingenting använder den
längre. I en riktig kodbas hade den tagits bort i den här commiten.

Kvar finns idén den fanns till för: **servern bestämmer vad ett svar
innehåller.** Först utifrån vad som hände — en rad, en rubrik, ett event — och
nu också utifrån vem som frågar.

## Nästa övning

Sortera så att nyast ligger först. Titta sedan på adressfältet.

Det står `/todo-app`. Kopiera adressen, öppna den i en ny flik, och listan
kommer tillbaka i fel ordning — sidan visar en sortering som adressen inte
känner till.
