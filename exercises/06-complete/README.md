# 6. Bocka av en todo

## Mål

Ett klick på **Complete** markerar raden som klar och uppdaterar räknaren — utan
att sidan laddas om.

## Bakgrund

Knappen sitter redan i ett formulär som postar. Samma utgångsläge som när du
lade till en todo, och samma grepp: htmx bredvid det som redan fungerar.

Två saker skiljer.

**Hela raden byts ut, inte en del av den.** Att bocka av är enkelriktat — när
todon är klar ska knappen vara borta och en bock stå i stället. Servern skickar
tillbaka raden i sitt nya skick, och den ska ersätta den gamla.

**Målet är inte ett `id` den här gången.** Varje rad har visserligen ett eget
`id`, men du behöver det inte. `hx-target` förstår också *relativa* uttryck:

```
hx-target="closest tr"
```

`closest tr` betyder "närmaste `tr` uppåt från elementet som gjorde förfrågan".
Ett attribut, samma i varje rad, oavsett vilken rad det är.

| Attribut | Svarar på | Dokumentation |
| --- | --- | --- |
| `hx-post` | Vilken adress ska postas till? | [Referens](https://four.htmx.org/reference/attributes/hx-post) |
| `hx-target` | Var i sidan ska svaret in? | [Referens](https://four.htmx.org/reference/attributes/hx-target) |
| `hx-swap` | Hur ska det sättas in? | [Referens](https://four.htmx.org/reference/attributes/hx-swap) |
| `hx-swap-oob` | Ska elementet hamna någon annanstans än i målet? | [Referens](https://four.htmx.org/reference/attributes/hx-swap-oob) |

Inget av attributen är nytt. Det nya är värdet `closest tr`. Rubriken kan redan
märkas out of band sedan övning 5 — du använder det utan att röra
`todo-header.liquid`.

## Steg

### 1. Lägg attributen på Complete-knappen

Öppna `views/todo-app/todo-row.liquid`. Knappen ska posta till
`/todo-app/fragments/todos/{{ todo.id }}/complete`.

??? tip "Ledtråd — vilket byte?"

    Raden som kommer tillbaka ska *ersätta* den gamla raden, inte hamna inuti
    den. Samma bytesläge som du satte på tabellen i övning 2.

??? example "Facit"

    ```html
    <button class="button button--small" type="submit"
            hx-post="/todo-app/fragments/todos/{{ todo.id }}/complete"
            hx-target="closest tr"
            hx-swap="outerHTML">Complete</button>
    ```

Klicka på **Complete** på någon rad. Den stryks över och knappen byts mot en
bock — men räknaren står still igen.

### 2. Räkna om rubriken

Det här kan du redan. `views/todo-app/complete-response.liquid` skickar bara
raden. Lägg till rubriken, precis som du gjorde med svaret för en ny todo — och
be om märkningen på samma sätt.

`stats` finns redan i mallen, och `todo-header.liquid` förbereddes i övning 5,
så du behöver inte röra den filen.

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

    htmx plockar ut out-of-band-elementen ur svaret innan det byts in — men då är
    raden redan förstörd, ett steg tidigare.

??? example "Facit"

    ```liquid
    {% render 'todo-app/todo-row', todo: todo, q: q, sort: sort %}
    {% render 'todo-app/todo-header', stats: stats, oob: true %}
    ```

## Klart när

- [ ] **Complete** stryker över raden och ersätter knappen med en bock.
- [ ] Räknaren räknar ner med ett.
- [ ] Nätverkspanelen visar **en** förfrågan, och inget dokument.
- [ ] Antalet rader i listan är oförändrat — raden byttes ut, inte tillagd.

??? question "Ingenting händer när jag klickar"

    Kontrollera att attributen sitter på `<button>` och inte på `<form>`, och
    att adressen innehåller `/fragments/`.

??? question "Raden försvann och det står lös text i listan"

    Rubriken ligger före raden i `complete-response.liquid`. Byt plats på dem,
    och se varningen i steg 2.

## Det som faktiskt hände

### Målet beskrev ett släktskap, inte en adress

`closest tr` pekar inte ut en specifik rad. Det beskriver var raden finns i
förhållande till knappen, och det stämmer i varje rad utan att någon behöver
hålla reda på vilken.

Det är samma tanke som resten av övningarna, en nivå ner: ingenting på klienten
behöver veta *vilken* todo som bockades av. Knappen vet var den sitter.

### Rubriken var inte en ny idé

Du löste den med ett verktyg du redan hade. Svaret på "den här todon är klar"
bär med sig allt som ändrades av det, och räknaren hittar sin plats själv.

Lägg märke till att `oob: true` står i svaret, inte i rubriken. Två olika svar
ber om samma märkning var för sig, och rubriken själv vet ingenting om vare sig
det ena eller det andra.

## Och sen?

Räknaren räknar ner. Lägg märke till vad som står där när den sista todon
bockas av.

Nästa övning gör något av det ögonblicket. Något att fira.
