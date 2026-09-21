# 2. Sortera utan sidladdning

## Mål

Ett klick på kolumnheadern **Created at** vänder sorteringsordningen, och
listan byter ordning utan att sidan laddas om.

!!! note "Du behöver några todos att sortera"

    Har du inga än, lägg in en handfull på
    [http://localhost:4000/todo-app](http://localhost:4000/todo-app).

## Användbara attribut

| Attribut | Svarar på | Dokumentation |
| --- | --- | --- |
| `hx-get` | Vilken adress ska hämtas? | [Referens](https://four.htmx.org/reference/attributes/hx-get) |
| `hx-target` | Var i sidan ska svaret in? | [Referens](https://four.htmx.org/reference/attributes/hx-target) |
| `hx-swap` | Hur ska det sättas in? | [Referens](https://four.htmx.org/reference/attributes/hx-swap) |

## Steg

### 1. Öppna `views/todo-app/todo-table.liquid`

Leta upp länken i kolumnheadern. Den börjar med `<a class="sort sort--{{ sort }}"`.

### 2. Lägg till de tre attributen

`hx-get` hämtar `/todo-app/fragments/table`. Den routen finns redan och renderar
ett färdigt fragment — samma tabell som sidan visar, utan sidan runt omkring.

`hx-target` är `#todo-table` och `hx-swap` är `outerHTML`. Fragmentet som kommer
tillbaka är tabellen i sin helhet — samma `<div id="todo-table">` som redan står
på sidan. Det ska alltså ersätta elementet, inte läggas inuti det; `innerHTML`
hade gett dig en `#todo-table` inuti en `#todo-table`.

Adressen i `hx-get` måste skicka med sorteringen, precis som `href` gör — i det
här fallet som en query-parameter.

??? warning "Varför räcker det inte med `/todo-app/fragments/table`?"

    För att en `<a>` inte har något värde att skicka. htmx lägger inte till
    något åt dig, och `href` är en helt annan sak som htmx inte läser.

    Servern får alltså inget `sort` alls, och faller tillbaka på stigande
    ordning. Det ser ut att fungera vid första klicket — du stod på fallande och
    bad om stigande, och fick stigande — och sedan händer ingenting mer, hur
    många gånger du än klickar.

    **En htmx-request innehåller exakt det du lägger i den.** Ingenting minns
    något mellan requests.

??? example "Facit — hela länken"

    ```html
    <a class="sort sort--{{ sort }}"
       href="/todo-app?sort={{ next_sort }}{% if q != "" %}&amp;q={{ q | url_encode }}{% endif %}"
       hx-get="/todo-app/fragments/table?sort={{ next_sort }}{% if q != "" %}&amp;q={{ q | url_encode }}{% endif %}"
       hx-target="#todo-table"
       hx-swap="outerHTML">
    ```

    Adressen står nu två gånger, nästan likadant. Det är inte tänkt att förbli
    så — en senare övning tar bort den ena.

## Klart när

- [ ] Sorteringen beter sig **precis som förut** — ett klick vänder ordningen och chevronen pekar åt andra hållet.
- [ ] **Sidan laddas inte om.** Ingen blinkning, och rullningsläget står kvar där du lämnade det.
- [ ] Nätverkspanelen visar **en** request till `/todo-app/fragments/table?sort=…`, och ingen ny dokumentladdning.
- [ ] Du kan klicka **flera gånger i rad** och ordningen växlar varje gång.

!!! note "Det här har ett namn"

    Att svaret innehåller kontrollerna för vad som kan göras härnäst — länken,
    vilken ordning den leder till, vilken sökning som gäller — är kärnan i
    **HATEOAS**: *Hypermedia As The Engine Of Application State*. Tillståndet
    drivs av det hypermedia servern skickar, inte av kod som håller reda på
    saker i webbläsaren.

    **htmx lade inte till det här.** Länken du började med gjorde redan samma
    sak: den innehöll sin egen nästa ordning, och en full sidladdning hämtade nästa
    representation.

    Det vanliga när en sida ska bli dynamisk är att ersätta det med JSON och
    tillstånd i klienten — och då försvinner det. Den här övningen tog bort
    sidladdningen utan att släppa hypermedia.

## Fungerar det inte?

??? question "Det växlar bara en gång — sedan står det still"

    Då saknar `hx-get` sin `?sort=…`. Se den fällbara rutan i steg 2.
