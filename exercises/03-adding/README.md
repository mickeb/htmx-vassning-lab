# 3. Lägg till en todo utan sidladdning

## Mål

En ny todo dyker upp i listan utan att sidan laddas om, och ett tomt formulär
ger ett synligt fel på rätt ställe.

## Attribut använda under övningen

| Attribut    | Svarar på                      | Dokumentation                                                    |
| ----------- | ------------------------------ | ---------------------------------------------------------------- |
| `hx-post`   | Vilken adress ska postas till? | [Referens](https://four.htmx.org/reference/attributes/hx-post)   |
| `hx-target` | Var i sidan ska svaret in?     | [Referens](https://four.htmx.org/reference/attributes/hx-target) |
| `hx-swap`   | Hur ska det sättas in?         | [Referens](https://four.htmx.org/reference/attributes/hx-swap)   |

## Template fragment använda under övningen

| Template | Route | Innehåller |
| --- | --- | --- |
| `views/todo-app/add-response.liquid` | `POST /todo-app/fragments/todos` | Tabellen, efter att todon lagts till |
| `views/todo-app/new-todo-form.liquid` | `POST /todo-app/fragments/todos` | Lägg till-formuläret med fältet rödmarkerat |

## Steg

### 1. Lägg till attributen på formuläret

1. Öppna `views/todo-app/new-todo-form.liquid` och leta upp `<form>`-taggen.
2. Lägg till `hx-post="/todo-app/fragments/todos"`. Det är samma sak som
   sorteringen i övning 2, med en `POST` i stället för en `GET`.
3. Lägg till `hx-target="#todo-table"`.
4. Lägg till `hx-swap="outerHTML"`. Det som kommer tillbaka är hela tabellen,
   återigen som i övning 2.

!!! note "Formulär postas som vanligt"

    Att posta ett formulär med htmx fungerar som med vanlig HTML: fälten skickas
    med automatiskt.

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

### 3. Låt servern styra **var** svaret ska visas

HTTP-headern `HX-Retarget` i svaret låter dig köra över det som markupen
specificerar i `hx-target`-attributet.

Öppna `src/app.ts` och leta upp route handlern för `POST /fragments/todos`. Den har
redan en `if`-sats för tomt fält, den som renderar formuläret med `error: true`.

Så här sätter du en header på svaret:

```ts
res.set('<header>', '<target>')
```

Lägg till raden i `if`-satsen och låt den peka ut formuläret för nya todos.

??? tip "Ledtråd — vilket id?"

    Formuläret har `id="new-todo-form"`. Värdet skrivs som i `hx-target`, med
    `#` framför.

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
    äldst först. Det är en bugg. Vi kommer dock låta den vara så länge.

??? question "Ingenting händer alls när jag lägger till"

    Kontrollera först om du har något i sökrutan. Se varningen i steg 1.

## Extra: töm och fokusera textfältet

Texten ligger kvar i fältet efter att todon lagts till. Formuläret renderas aldrig
om när allt gick bra. Servern skickar listan, inte formuläret, så fältet behåller
det du skrev. Fältet ska tömmas och få fokus igen, så att nästa todo kan skrivas
direkt.

Ett attribut på formuläret räcker.

| Attribut | Svarar på                                | Dokumentation                                                |
| -------- | ---------------------------------------- | ------------------------------------------------------------ |
| `hx-on`  | Vad ska köras när ett event inträffar? | [Referens](https://four.htmx.org/reference/attributes/hx-on) |

`hx-on` kopplar JavaScript till ett event direkt på elementet. Attributet anges
på formen `hx-on:<event>`. Då eventet vi vill lyssna på är htmx eget
`htmx:after:swap`, blir attributet `hx-on:htmx:after:swap`.

(Det finns också ett kortare skrivsätt, `hx-on::after:swap`, som beskrivs i
[referensen](https://four.htmx.org/reference/attributes/hx-on).)

JavaScriptet vi vill köra är:

```js
this.reset(); this.elements.description.focus()
```

`this` är formuläret. `reset()` och `focus()` är vanlig DOM, ingenting
htmx-specifikt.

!!! warning "Till dig som tidigare använt v2"

    Eventet heter `htmx:after:swap`, inte `htmx:afterSwap`. `htmx:afterSwap` är
    htmx 2, och det är vad nästan varje handledning och AI-assistent föreslår.
    Fel stavning ger inget felmeddelande. Koden körs bara aldrig.

??? example "Facit"

    ```html
    <form class="new-todo" id="new-todo-form" method="post" action="/todo-app/todos"
          hx-post="/todo-app/fragments/todos"
          hx-target="#todo-table"
          hx-swap="outerHTML"
          hx-on:htmx:after:swap="this.reset(); this.elements.description.focus()">
    ```

!!! note "Den röda ramen då?"

    Den ligger kvar efter ett lyckat tillägg, av samma skäl: formuläret renderas
    aldrig om. `reset()` återställer fältets värde men tar inte bort en
    CSS-klass. Det är inget övningen bygger bort.
