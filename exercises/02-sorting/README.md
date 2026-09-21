# 2. Sortera utan sidladdning

## Mål

Ett klick på kolumnrubriken **Created at** vänder sorteringsordningen, och
listan byter ordning utan att sidan laddas om.

!!! note "Du behöver några todos att sortera"

    Har du inte lagt in några än, gå till
    [http://localhost:4000/todo-app](http://localhost:4000/todo-app) och lägg in
    en handfull — fyra eller fem räcker.

## Användbara attribut

| Attribut | Svarar på | Dokumentation |
| --- | --- | --- |
| `hx-get` | Vilken adress ska hämtas? | [Referens](https://four.htmx.org/reference/attributes/hx-get) |
| `hx-target` | Var i sidan ska svaret in? | [Referens](https://four.htmx.org/reference/attributes/hx-target) |
| `hx-swap` | Hur ska det sättas in? | [Referens](https://four.htmx.org/reference/attributes/hx-swap) |

Adressen är `/todo-app/fragments/table`. Den rutten fanns redan innan du
började — den renderar exakt samma tabell, men utan sidan runt omkring. Du ska
inte skriva någon serverkod i den här övningen.

!!! tip "Öppna den i en flik innan du fortsätter"

    [http://localhost:4000/todo-app/fragments/table?sort=desc](http://localhost:4000/todo-app/fragments/table?sort=desc)

    Det som kommer tillbaka är **HTML**, inte JSON — en färdig tabell som kan
    sättas in rakt av.

## Steg

### 1. Öppna `views/todo-app/todo-table.liquid`

Leta upp länken i kolumnrubriken. Den börjar med `<a class="sort sort--{{ sort }}"`.

### 2. Lägg till de tre attributen

Målet är `#todo-table` och bytet är `outerHTML`. Fragmentet som kommer tillbaka
**är** `<div id="todo-table">`, så det ska ersätta elementet det kom ifrån, inte
innehållet i det — `innerHTML` hade gett dig en `#todo-table` inuti en
`#todo-table`.

Adressen i `hx-get` måste bära med sig sorteringen, precis som `href` gör.

??? warning "Varför räcker det inte med `/todo-app/fragments/table`?"

    För att en `<a>` inte har något värde att skicka. htmx lägger inte till
    något åt dig, och `href` är en helt annan sak som htmx inte läser.

    Servern får alltså inget `sort` alls, och faller tillbaka på stigande
    ordning. Det ser ut att fungera vid första klicket — du stod på fallande och
    bad om stigande, och fick stigande — och sedan händer ingenting mer, hur
    många gånger du än klickar.

    **En htmx-förfrågan innehåller exakt det du lägger i den.** Ingenting minns
    något mellan förfrågningar.

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
- [ ] **Sidan laddas inte om.** Ingen blinkning, ingen laddningssnurra i fliken, och rullningsläget står kvar där du lämnade det.
- [ ] Nätverkspanelen visar **en** förfrågan till `/todo-app/fragments/table?sort=…` — och ingen ny dokumentladdning.
- [ ] Du kan klicka **flera gånger i rad** och ordningen växlar varje gång.

??? question "Det växlar bara en gång — sedan står det still"

    Då saknar `hx-get` sin query-sträng. Se den fällbara rutan i steg 2.

## Det här har ett namn

Klicka runt lite och läs tabellen som kommer tillbaka. Den bär **sin egen**
chevron åt rätt håll, **sin egen** länk som pekar på motsatt ordning, och sin
egen sökterm om du har sökt. Ingen variabel i webbläsaren säger
`sortOrder = 'desc'`, ingen kod vänder en pil.

Att svaret bär med sig kontrollerna för vad som kan göras härnäst är kärnan i
**HATEOAS**: *Hypermedia As The Engine Of Application State*. Tillståndet drivs
av det hypermedia servern skickar, inte av kod som håller reda på saker i
webbläsaren.

Värt att notera: **htmx lade inte till det här.** Länken du började med gjorde
redan samma sak. Den bar sin egen nästa ordning, och en full sidladdning hämtade
nästa representation.

Det vanliga när en sida ska bli dynamisk är att byta ut det mot JSON och
tillstånd i klienten — och då försvinner det. Den här övningen tog bort
sidladdningen utan att släppa hypermedia.
