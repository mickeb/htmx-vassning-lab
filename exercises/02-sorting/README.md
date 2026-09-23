# 2. Sortera utan sidladdning

## Mål

Ett klick på kolumnheadern **Created at** vänder sorteringsordningen, och
listan byter ordning utan att sidan laddas om.

!!! note "Du behöver några todos att sortera"

    Har du inga än, lägg in ett par stycken på
    [http://localhost:4000/todo-app](http://localhost:4000/todo-app).

## Attribut använda under övningen

| Attribut | Svarar på | Dokumentation |
| --- | --- | --- |
| `hx-get` | Vilken adress ska hämtas? | [Referens](https://four.htmx.org/reference/attributes/hx-get) |
| `hx-target` | Var i sidan ska svaret in? | [Referens](https://four.htmx.org/reference/attributes/hx-target) |
| `hx-swap` | Hur ska det sättas in? | [Referens](https://four.htmx.org/reference/attributes/hx-swap) |

## Template-fragment använda under övningen

| Template | Route | Innehåller |
| --- | --- | --- |
| `views/todo-app/todo-table.liquid` | [`GET /todo-app/fragments/table`](http://localhost:4000/todo-app/fragments/table) | Tabellen, utan sidan runt omkring |

## Lägg till attributen på sorteringslänken

1. Öppna `views/todo-app/todo-table.liquid` och leta upp länken i
   kolumnheadern. Den börjar med `<a class="sort sort--{{ sort }}"`.
2. Lägg till `hx-get`. Adressen är `/todo-app/fragments/table` följd av
   query stringen från `href`, kopierad rakt av. Det är query stringen som
   skickar med sorteringen.
3. Lägg till `hx-target="#todo-table"`.
4. Lägg till `hx-swap="outerHTML"`. Fragmentet som kommer tillbaka är hela
   `<div id="todo-table">`, samma element som redan står på sidan, så det ska
   ersätta elementet och inte läggas inuti det. Med `innerHTML` hade du fått en
   `#todo-table` inuti en `#todo-table`.

??? example "Facit — hela länken"

    ```html
    <a class="sort sort--{{ sort }}"
       href="/todo-app?sort={{ next_sort }}{% if q != "" %}&amp;q={{ q | url_encode }}{% endif %}"
       hx-get="/todo-app/fragments/table?sort={{ next_sort }}{% if q != "" %}&amp;q={{ q | url_encode }}{% endif %}"
       hx-target="#todo-table"
       hx-swap="outerHTML">
    ```

## Klart när

- [ ] Sorteringen beter sig **precis som förut**: ett klick vänder ordningen och chevronen pekar åt andra hållet.
- [ ] **Sidan laddas inte om.** Ingen blinkning, och rullningsläget står kvar där du lämnade det.
- [ ] Nätverkspanelen visar **en** request till `/todo-app/fragments/table?sort=…`, och ingen ny dokumentladdning.
- [ ] Du kan klicka **flera gånger i rad** och ordningen växlar varje gång.

## Fungerar det inte?

??? question "Det växlar bara en gång — sedan står det still"

    Då saknar `hx-get` sin `?sort=…`. Servern får inget `sort`, faller
    tillbaka på stigande ordning och svarar likadant varje gång.
