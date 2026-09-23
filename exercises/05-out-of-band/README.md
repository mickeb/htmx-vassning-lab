# 5. Uppdatera två ställen med ett svar

## Mål

Räknaren i rubriken uppdateras i samband med att en todo läggs till.

## Attribut använda under övningen

| Attribut | Svarar på | Dokumentation |
| --- | --- | --- |
| `<hx-partial>` | Vilken del av svaret ska någon annanstans? | [Referens](https://four.htmx.org/reference/tags/hx-partial) |
| `hx-target` | Var i sidan ska svaret in? | [Referens](https://four.htmx.org/reference/attributes/hx-target) |
| `hx-swap` | Hur ska det sättas in? | [Referens](https://four.htmx.org/reference/attributes/hx-swap) |

Räknaren går inte att laga med formulärets `hx-target`. Det pekar ut **ett**
ställe, och svaret behöver uppdatera två.

Lösningen för att uppdatera flera områden på sidan är `<hx-partial>`-elementet.

[Mer om `<hx-partial>`](https://four.htmx.org/docs#partials-hx-partial)

## Template-fragment använda under övningen

| Template | Route | Innehåller |
| --- | --- | --- |
| `views/todo-app/add-response.liquid` | `POST /todo-app/fragments/todos` | Tabellen, och efter den här övningen även rubriken i ett `<hx-partial>` |

## Skicka med rubriken i svaret

1. Öppna `views/todo-app/add-response.liquid`. Just nu renderar den bara
   `todo-app/todo-table`.
2. Rendera `todo-app/todo-header` också. Fragmentvariabeln `stats`, som
   `todo-app/todo-header` behöver, finns redan tillgänglig.
3. Wrappa `todo-app/todo-header` i ett `<hx-partial>` med `hx-target="#todo-header"` och
   `hx-swap="outerHTML"`.

!!! warning "Glöm inte `hx-swap`"

    Utan `hx-swap` använder `<hx-partial>` `innerHTML`. Då hamnar den nya
    rubriken **inuti** den gamla, och sidan får två `#todo-header`. Räknaren
    visar rätt siffra, så det ser nästan rätt ut.

??? example "Facit"

    ```liquid
    {% render 'todo-app/todo-table', todos: todos, q: q, sort: sort %}
    <hx-partial hx-target="#todo-header" hx-swap="outerHTML">
      {% render 'todo-app/todo-header', stats: stats %}
    </hx-partial>
    ```

## Klart när

- [ ] Räknaren i rubriken ändras direkt när du lägger till en todo.
- [ ] Nätverkspanelen visar **en** request, inte två.
- [ ] Sidan laddas inte om.
- [ ] Det finns fortfarande bara en rubrik på sidan.

## Fungerar det inte?

??? question "Räknaren ändras inte"

    Titta först på svaret i nätverkspanelen. Finns inte rubriken med där
    saknas den i `add-response.liquid`.

    Finns den med, kontrollera att `hx-target` är exakt `#todo-header`. Hittar
    htmx inget element att sätta in i händer ingenting, och inget felmeddelande
    säger till.

??? question "Rubriken ligger i en ram inuti en ram"

    `hx-swap="outerHTML"` saknas på `<hx-partial>`. Se varningen i steget.

## Värt att känna till

!!! note "Det äldre sättet: `hx-swap-oob`"

    Samma sak görs också med attributet `hx-swap-oob` på elementet i svaret.
    htmx letar då upp elementet på sidan som har samma `id` och ersätter det.
    Det finns i alla versioner av htmx, och det är det du kommer stöta på i
    handledningar, forumsvar och andra kodbaser.

    [Mer om out-of-band swaps](https://four.htmx.org/docs#out-of-band-swaps)
