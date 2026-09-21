# 6. Bocka av en todo

## Mål

Ett klick på **Complete** markerar raden som klar och uppdaterar räknaren i
rubriken — utan att sidan laddas om.

## Användbara attribut

| Attribut | Svarar på | Dokumentation |
| --- | --- | --- |
| `hx-post` | Vilken adress ska postas till? | [Referens](https://four.htmx.org/reference/attributes/hx-post) |
| `hx-target` | Var i sidan ska svaret in? | [Referens](https://four.htmx.org/reference/attributes/hx-target) |
| `hx-swap` | Hur ska det sättas in? | [Referens](https://four.htmx.org/reference/attributes/hx-swap) |
| `hx-swap-oob` | Ska elementet hamna någon annanstans än där `hx-target` pekar? | [Referens](https://four.htmx.org/reference/attributes/hx-swap-oob) |

## Steg

### 1. Lägg attributen på Complete-knappen

Öppna `views/todo-app/todo-row.liquid`. Knappen ska posta till
`/todo-app/fragments/todos/{{ todo.id }}/complete`.

Inga av attributen vi använder är nya. Däremot använder vi en ny typ av värde
på `hx-target`:

```
hx-target="closest tr"
```

`closest tr` är en CSS-selektor
([MDN](https://developer.mozilla.org/en-US/docs/Web/API/Element/closest)) och
betyder "närmaste `tr` uppåt från elementet som gjorde requesten".
Eftersom värdet är relativt kan alla rader ha exakt samma `hx-target` — du
slipper ge varje rad ett unikt `id`.

Som vanligt använder vi `hx-swap="outerHTML"`.

??? example "Facit"

    ```html
    <button class="button button--small" type="submit"
            hx-post="/todo-app/fragments/todos/{{ todo.id }}/complete"
            hx-target="closest tr"
            hx-swap="outerHTML">Complete</button>
    ```

Klicka på **Complete** på någon rad. Den stryks över och knappen byts mot en
bock — men räknaren står still igen!

### 2. Rendera om rubriken

Det här kan du redan.

`views/todo-app/complete-response.liquid` renderar bara `todo-app/todo-row`.
Rendera `todo-app/todo-header` också, och skicka med `oob: true` — precis som du
gjorde med svaret för en ny todo.

`stats` finns redan i templaten, och `todo-header.liquid` renderar redan
`hx-swap-oob` när den får `oob: true` sedan övning 5 — så du behöver inte röra
den filen.

!!! warning "Ordningen är inte valfri här: raden måste komma först"

    Förra övningens svar var en tabell, och då kvittade ordningen. Det här svaret
    innehåller ett `<tr>` och en `<header>`, och lägger du rubriken först
    försvinner raden — **tyst**.

    Det är inte htmx som är kinkig, utan webbläsarens HTML-tolk. Ett `<tr>` som
    inte står i ett tabellsammanhang är ogiltigt, så tolken kastar taggarna och
    behåller texten. Det som hamnar i listan blir en lös textsnutt:
    `2026-09-21 14:38:52 Köp mjölk`. Inget felmeddelande, ingenting i konsolen.

    Lömskast är att räknaren ändå uppdateras korrekt, så det ser ut som att
    hälften fungerade.

    htmx plockar ut out-of-band-elementen ur svaret innan det sätts in — men då
    är raden redan förstörd, ett steg tidigare.

??? example "Facit"

    ```liquid
    {% render 'todo-app/todo-row', todo: todo, q: q, sort: sort %}
    {% render 'todo-app/todo-header', stats: stats, oob: true %}
    ```

## Klart när

- [ ] **Complete** stryker över raden och ersätter knappen med en bock.
- [ ] Räknaren räknar ner med ett.
- [ ] Nätverkspanelen visar **en** request, och inget dokument.
- [ ] Antalet rader i listan är oförändrat — raden ersattes, den lades inte till.

## Fungerar det inte?

??? question "Ingenting händer när jag klickar"

    Kontrollera att attributen sitter på `<button>` och inte på `<form>`, och
    att adressen innehåller `/fragments/`.

??? question "Raden försvann och det står lös text i listan"

    Rubriken ligger före raden i `complete-response.liquid`. Byt plats på dem,
    och se varningen i steg 2.

## Nästa övning

Räknaren räknar ner. Lägg märke till vad som står där när den sista todon
bockas av.

Nästa övning gör något av det ögonblicket. Något att fira.
