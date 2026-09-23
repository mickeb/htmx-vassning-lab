# 6. Bocka av en todo

## Mål

Ett klick på **Complete** markerar raden som klar och uppdaterar räknaren i
rubriken, utan att sidan laddas om.

## Attribut använda under övningen

| Attribut | Svarar på | Dokumentation |
| --- | --- | --- |
| `hx-post` | Vilken adress ska postas till? | [Referens](https://four.htmx.org/reference/attributes/hx-post) |
| `hx-target` | Var i sidan ska svaret in? | [Referens](https://four.htmx.org/reference/attributes/hx-target) |
| `hx-swap` | Hur ska det sättas in? | [Referens](https://four.htmx.org/reference/attributes/hx-swap) |
| `<hx-partial>` | Vilken del av svaret ska någon annanstans? | [Referens](https://four.htmx.org/reference/tags/hx-partial) |

## Template-fragment använda under övningen

| Template | Route | Innehåller |
| --- | --- | --- |
| `views/todo-app/complete-response.liquid` | `POST /todo-app/fragments/todos/:id/complete` | Raden, och efter den här övningen även rubriken i ett `<hx-partial>` |

## Steg

### 1. Lägg till attributen på Complete-knappen

1. Öppna `views/todo-app/todo-row.liquid` och leta upp knappen **Complete**.
2. Lägg till `hx-post="/todo-app/fragments/todos/{{ todo.id }}/complete"`.
3. Lägg till `hx-target="closest tr"`. Det är en CSS-selektor och betyder
   "närmaste `tr` uppåt från knappen"
   ([MDN](https://developer.mozilla.org/en-US/docs/Web/API/Element/closest)).
   Eftersom värdet är relativt kan alla rader ha exakt samma `hx-target`, och
   du slipper ge varje rad ett unikt `id`.
4. Lägg till `hx-swap="outerHTML"`.

??? example "Facit"

    ```html
    <button class="button button--small" type="submit"
            hx-post="/todo-app/fragments/todos/{{ todo.id }}/complete"
            hx-target="closest tr"
            hx-swap="outerHTML">Complete</button>
    ```

Klicka på **Complete** på någon rad. Den stryks över och knappen byts mot en
bock, men felet med summeringen slår till igen.

### 2. Rendera om rubriken

Det här kan du redan.

1. Öppna `views/todo-app/complete-response.liquid`. Just nu renderar den bara
   `todo-app/todo-row`.
2. Rendera `todo-app/todo-header` också, wrappad i ett `<hx-partial>` med
   `hx-target="#todo-header"` och `hx-swap="outerHTML"`, precis som i övning 5.
   Fragmentvariabeln `stats`, som `todo-app/todo-header` behöver, finns redan
   tillgänglig.

??? example "Facit"

    ```liquid
    {% render 'todo-app/todo-row', todo: todo, q: q, sort: sort %}
    <hx-partial hx-target="#todo-header" hx-swap="outerHTML">
      {% render 'todo-app/todo-header', stats: stats %}
    </hx-partial>
    ```

## Klart när

- [ ] **Complete** stryker över raden och ersätter knappen med en bock.
- [ ] Räknaren räknar ner med ett.
- [ ] Nätverkspanelen visar **en** request, och inget dokument.
- [ ] Antalet rader i listan är oförändrat. Raden ersattes, den lades inte till.

## Fungerar det inte?

??? question "Ingenting händer när jag klickar"

    Kontrollera att attributen sitter på `<button>` och inte på `<form>`, och
    att adressen innehåller `/fragments/`.

??? question "Rubriken ligger i en ram inuti en ram"

    `hx-swap="outerHTML"` saknas på `<hx-partial>`. Utan det används
    `innerHTML`, och den nya rubriken hamnar inuti den gamla.
