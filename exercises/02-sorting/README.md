# 2. Sortera utan sidladdning

## Mål

Ett klick på kolumnrubriken **Created at** växlar sorteringsordning utan att
sidan laddas om.

!!! note "Du behöver några todos att sortera"

    Har du inte lagt in några än, gå till
    [http://localhost:4000/todo-app](http://localhost:4000/todo-app) och lägg in
    en handfull — fyra eller fem räcker. En tom lista går utmärkt att sortera,
    men det syns inget.

## Bakgrund

Kolumnrubriken är redan en länk, och den fungerar redan. Den pekar på
`/todo-app` med omvänd sortering, och webbläsaren hämtar hela sidan på nytt.

Övningen tar inte bort länken. Den tar bort **sidladdningen**.

Tre attribut räcker:

| Attribut | Svarar på | Dokumentation |
| --- | --- | --- |
| `hx-get` | Vilken adress ska hämtas? | [Referens](https://four.htmx.org/reference/attributes/hx-get) |
| `hx-target` | Var i sidan ska svaret in? | [Referens](https://four.htmx.org/reference/attributes/hx-target) |
| `hx-swap` | Hur ska det sättas in? | [Referens](https://four.htmx.org/reference/attributes/hx-swap) |

Adressen är `/todo-app/fragments/table`. Den rutten fanns redan innan du
började — den renderar exakt samma tabell, men utan sidan runt omkring. Den är
en av [fragmentrutterna labbet levereras med](../index.md#det-labbet-redan-ger-dig);
du ska inte skriva någon serverkod i den här övningen.

!!! tip "Öppna den i en flik innan du fortsätter"

    [http://localhost:4000/todo-app/fragments/table?sort=desc](http://localhost:4000/todo-app/fragments/table?sort=desc)

    Det som kommer tillbaka är **HTML**, inte JSON. Ingen ostilad sida att bygga
    ihop på klienten — det är en bit färdig tabell. Det är halva poängen med
    hela angreppssättet, och det är lättare att se än att läsa sig till.

## Steg

### 1. Öppna `views/todo-app/todo-table.liquid`

Leta upp länken i kolumnrubriken. Den börjar med `<a class="sort sort--{{ sort }}"`.

### 2. Lägg till de tre attributen

Målet är `#todo-table` och bytet är `outerHTML`.

Att det är just `outerHTML` är inte en detalj: fragmentet som kommer tillbaka
**är** `<div id="todo-table">`. Det ersätter alltså elementet det kom ifrån, inte
innehållet i det. Hade du använt `innerHTML` hade du fått en `#todo-table` inuti
en `#todo-table`.

Adressen i `hx-get` måste bära med sig sorteringen, precis som `href` gör.

??? warning "Varför räcker det inte med `/todo-app/fragments/table`?"

    För att en `<a>` inte har något värde att skicka. htmx lägger inte till
    något åt dig, och `href` är en helt annan sak som htmx inte läser.

    Servern får alltså inget `sort` alls, och faller tillbaka på stigande
    ordning. Det ser ut att fungera vid första klicket — du stod på fallande och
    bad om stigande, och fick stigande — och sedan händer ingenting mer, hur
    många gånger du än klickar.

    Regeln är värd att ta med sig: **en htmx-förfrågan innehåller exakt det du
    lägger i den.** Ingenting minns något mellan förfrågningar.

??? example "Facit — hela länken"

    ```html
    <a class="sort sort--{{ sort }}"
       href="/todo-app?sort={{ next_sort }}{% if q != "" %}&amp;q={{ q | url_encode }}{% endif %}"
       hx-get="/todo-app/fragments/table?sort={{ next_sort }}{% if q != "" %}&amp;q={{ q | url_encode }}{% endif %}"
       hx-target="#todo-table"
       hx-swap="outerHTML">
    ```

    Och ja — adressen står nu två gånger, nästan likadant. Det är inte snyggt,
    och det är inte tänkt att förbli så. En senare övning tar bort den ena.

## Klart när

- [ ] Sorteringen beter sig **precis som förut** — ett klick vänder ordningen och chevronen pekar åt andra hållet.
- [ ] **Sidan laddas inte om.** Ingen blinkning, ingen laddningssnurra i fliken, och rullningsläget står kvar där du lämnade det.
- [ ] Nätverkspanelen visar **en** förfrågan till `/todo-app/fragments/table?sort=…` — och ingen ny dokumentladdning.
- [ ] Du kan klicka **flera gånger i rad** och ordningen växlar varje gång.

!!! tip "Jämför med en riktig sidladdning"

    Ha nätverkspanelen öppen och tryck `F5`. Då kommer dokumentet, stilmallen,
    skripten och allt det andra in igen — en hel sida.

    Klicka sedan på **Created at**. En rad i panelen. Det är skillnaden övningen
    handlar om, och den går inte att se på sidan.

??? question "Det växlar bara en gång — sedan står det still"

    Då saknar `hx-get` sin query-sträng. Se den fällbara rutan *"Varför räcker
    det inte med `/todo-app/fragments/table`?"* ovan.

## Det som faktiskt hände

**Ingenting ser annorlunda ut.** Sorteringen fungerade innan du rörde filen och
fungerar likadant nu: samma ordning, samma chevron, samma sida. Det är inget
tecken på att något gått fel — det är hela poängen.

Det som ändrades är *hur* svaret hämtas. I stället för att webbläsaren navigerar
till en ny sida gör htmx anropet i bakgrunden med `fetch` och byter ut tabellen
på plats. Det syns inte i gränssnittet. Det syns i nätverkspanelen.

Och det finns mer att titta på. Klicka runt lite och titta på tabellen som kom
tillbaka. Den bär **sin egen**
chevron åt rätt håll, **sin egen** länk som pekar på motsatt ordning, och sin
egen sökterm om du har sökt.

Ingenting på klienten håller reda på hur listan är sorterad. Det finns ingen
variabel någonstans som säger `sortOrder = 'desc'`, ingen kod som vänder en
pil, inget tillstånd att hålla synkroniserat med något annat.

Servern renderade en korrekt tabell, och sidan blev den.

## Gå vidare

Öppna nätverkspanelen och sortera igen. Jämför det som kommer tillbaka nu med
vad en full sidladdning skickade — ladda om sidan med `F5` och titta på den
första raden i panelen.

Samma innehåll, en bråkdel av antalet byte, och det är fortfarande HTML.

Inget att köra, inget att skriva. Bara att titta.
