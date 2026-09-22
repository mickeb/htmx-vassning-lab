# 3. Lägg till en todo utan sidladdning

## Mål

En ny todo dyker upp i listan utan att sidan laddas om, och ett tomt formulär
ger ett synligt fel på rätt ställe.

## Användbara attribut

| Attribut    | Svarar på                      | Dokumentation                                                    |
| ----------- | ------------------------------ | ---------------------------------------------------------------- |
| `hx-post`   | Vilken adress ska postas till? | [Referens](https://four.htmx.org/reference/attributes/hx-post)   |
| `hx-target` | Var i sidan ska svaret in?     | [Referens](https://four.htmx.org/reference/attributes/hx-target) |
| `hx-swap`   | Hur ska det sättas in?         | [Referens](https://four.htmx.org/reference/attributes/hx-swap)   |

## Steg

### 1. Öppna `views/todo-app/new-todo-form.liquid`

Lägg de tre attributen på `<form>`-taggen.

`hx-post` postar till `/todo-app/fragments/todos`. Det är **samma koncept som
sorteringen vi precis gjorde**, med en `POST` i stället för en `GET`:
`hx-target` är `#todo-table` och `hx-swap` är återigen `outerHTML`, eftersom det
som kommer tillbaka är tabellen i sin helhet.

!!! note "Formulär postas som vanligt"

    Att posta ett formulär med htmx fungerar som med vanlig HTML: fälten skickas
    med automatiskt. Undantaget är `GET` och `DELETE`.

    [Mer om vad som skickas med](https://four.htmx.org/docs#forms)

??? example "Facit"

    ```html
    <form class="new-todo" id="new-todo-form" method="post" action="/todo-app/todos"
          hx-post="/todo-app/fragments/todos"
          hx-target="#todo-table"
          hx-swap="outerHTML">
    ```

Lägg till en todo. Den dyker upp i listan, utan att sidan laddas om.

!!! warning "Har du en sökning igång händer ingenting synligt"

    Servern renderar den lista du tittar på, alltså den filtrerade. Matchar
    den nya todon inte sökordet är den inte med i svaret. Den skapas, men
    syns inte. Räknaren rör sig inte heller, eftersom ingenting uppdaterar
    den ännu.

    Gör en sökning utan sökterm så ser du den.

### 2. Skicka in ett tomt fält

Töm textfältet och tryck **Add**.

Servern svarar redan som den ska: den renderar formuläret med fältet markerat.
Men titta noga. Formuläret ersätter **listan**, i stället för att hamna där man
förväntar sig.

Det är väntat. `hx-target="#todo-table"` sitter på formuläret och gäller alla
svar formuläret får, även felsvar.

### 3. Låt server-side styra **var** svaret ska visas

HTTP-headern `HX-Retarget` i svaret låter oss köra över det som markupen
specificerar i `hx-target` attributet.

Uppdatera så att headern specificerar "nya todo" formuläret när ingen beskrivning skickas med.

??? example "Facit"

    ```ts
    if (!text) {
      res.set('HX-Retarget', '#new-todo-form')
      res.status(422).render('todo-app/new-todo-form', { q, sort, error: true })
      return
    }
    ```

## Klart när

- [ ] En ny todo dyker upp i listan utan att sidan laddas om.
- [ ] Nätverkspanelen visar en `POST` till `/todo-app/fragments/todos`, och inget dokument.
- [ ] Ett tomt fält ger röd ram **på formuläret**, och listan står kvar.
- [ ] Efter felet går det att skriva något och lägga till som vanligt.

## Fungerar det inte?

??? question "Formuläret ersatte hela listan"

    Då saknas `HX-Retarget`. Se steg 3.

??? question "Ingenting händer alls vid tomt fält"

    Titta på statuskoden i nätverkspanelen. Servern svarar `422`, och htmx 4
    sätter in svaret även när statuskoden är ett fel. Om du har läst att htmx
    hoppar över svar som inte är `2xx` så stämmer det för htmx 2, inte för
    htmx 4.

??? question "Sorteringen försvinner när jag lägger till något"

    Sortera nyast först, lägg till en todo, och listan hoppar tillbaka till
    äldst först. Det är en riktig bugg, den är äldre än den här övningen, och
    nästa övning handlar om den. Låt den vara så länge.

??? question "Ingenting händer alls när jag lägger till"

    Kontrollera först om du har något i sökrutan. Se varningen i steg 1.

## Extra: töm textfältet

Texten ligger kvar i fältet efter att todon lagts till. Formuläret renderas aldrig
om när allt gick bra — servern skickar listan, inte formuläret — så fältet behåller
det du skrev.

Ett attribut på formuläret räcker.

| Attribut | Svarar på                                | Dokumentation                                                |
| -------- | ---------------------------------------- | ------------------------------------------------------------ |
| `hx-on`  | Vad ska köras när ett event inträffar? | [Referens](https://four.htmx.org/reference/attributes/hx-on) |

`hx-on` kopplar JavaScript till ett event direkt på elementet. Attributet heter
`hx-on:` plus eventets namn — `hx-on:click` för ett vanligt klick.

htmx egna event heter i sin tur `htmx:after:swap`, `htmx:before:request` och
så vidare. Fullt utskrivet blir attributet alltså `hx-on:htmx:after:swap`. Och
eftersom varje htmx-event börjar med `htmx:` går det att utelämna ordet men
behålla kolonet:

    hx-on:htmx:after:swap    är samma sak som    hx-on::after:swap

Det är därifrån det dubbla kolonet kommer. Båda skrivsätten fungerar; det korta
är det vanliga.

!!! warning "Till dig som tidigare använt v2"

    Eventet heter `after:swap`. Inte `afterSwap` — det är htmx 2, och det är
    vad nästan varje handledning och AI-assistent föreslår. Fel stavning ger
    inget felmeddelande. Koden körs bara aldrig.

??? example "Facit"

    ```html
    <form class="new-todo" id="new-todo-form" method="post" action="/todo-app/todos"
          hx-post="/todo-app/fragments/todos"
          hx-target="#todo-table"
          hx-swap="outerHTML"
          hx-on::after:swap="this.reset()">
    ```

    `this` är formuläret och `reset()` är vanlig DOM — ingenting htmx-specifikt.

Notera var attributet sitter. Det gäller bara svaren på formulärets egna
requests. Sorteringen från förra övningen ändrar också innehåll på sidan, men
den rör inte det här fältet. Hade du i stället lagt en lyssnare på `document`
hade halvskriven text försvunnit varje gång någon sorterade.

Beteendet står på elementet det gäller. För att se vad formuläret gör läser du
formuläret.

!!! note "Den röda ramen då?"

    Den ligger kvar efter ett lyckat tillägg, av samma skäl: formuläret renderas
    aldrig om. `reset()` återställer fältets värde men tar inte bort en
    CSS-klass. Det är inget övningen bygger bort.

## Nästa övning

Två saker är trasiga nu.

Räknaren i rubriken säger fortfarande samma antal som innan du la till något. Den
ligger utanför `#todo-table` och rördes därför aldrig. Den lagas — men inte
härnäst.

Den andra är svårare att få syn på: sortera nyast först och lägg till en todo.

Nästa övning handlar om den.
