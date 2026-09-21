# 3. Lägg till en todo utan sidladdning

## Mål

En ny todo dyker upp i listan utan att sidan laddas om, och ett tomt formulär
ger ett synligt fel på rätt ställe.

## Bakgrund

Formuläret postar redan. Det har `method="post"` och `action="/todo-app/todos"`,
och det fungerar. Precis som i förra övningen tar du inte bort det — du lägger
htmx bredvid det.

**Det här är samma form som sorteringen**, med en `POST` i stället för en `GET`.
Du pekar ut en adress, ett mål och ett byte, och svaret är hela listan i sitt nya
skick. Ingen ny idé, med andra ord — men två saker skiljer, och båda är värda att
lägga på minnet.

!!! note "En `POST` bär med sig hela formuläret"

    I förra övningen satt `hx-get` på en `<a>`, och länken hade inget värde att
    skicka — adressen fick bära sorteringen själv.

    Här är det tvärtom. En förfrågan med kropp — allt utom `GET` och `DELETE` —
    tar med sig alla fält i formuläret automatiskt. Beskrivningen, och de dolda
    `q`- och `sort`-fälten, följer med utan att du gör något.

    Reglerna för vad som skickas med står i
    [htmx-dokumentationen om formulär](https://four.htmx.org/docs#forms).

Den andra skillnaden kommer i steg 2: servern kan behöva säga emot attributen du
sätter nu.

| Attribut | Svarar på | Dokumentation |
| --- | --- | --- |
| `hx-post` | Vilken adress ska postas till? | [Referens](https://four.htmx.org/reference/attributes/hx-post) |
| `hx-target` | Var i sidan ska svaret in? | [Referens](https://four.htmx.org/reference/attributes/hx-target) |
| `hx-swap` | Hur ska det sättas in? | [Referens](https://four.htmx.org/reference/attributes/hx-swap) |

Målet är `#todo-table` och bytet är `outerHTML` — samma två värden som på
sorteringslänken, och av samma skäl: det som kommer tillbaka **är**
`<div id="todo-table">`, så det ska ersätta elementet, inte hamna inuti det.

## Steg

### 1. Öppna `views/todo-app/new-todo-form.liquid`

Lägg de tre attributen på `<form>`-taggen. Adressen är
`/todo-app/fragments/todos`.

??? example "Facit"

    ```html
    <form class="new-todo" id="new-todo-form" method="post" action="/todo-app/todos"
          hx-post="/todo-app/fragments/todos"
          hx-target="#todo-table"
          hx-swap="outerHTML">
    ```

Lägg till en todo. Den dyker upp i listan, utan att sidan laddas om.

!!! warning "Har du en sökning igång händer ingenting synligt"

    Svaret är **listan**, inte raden. Servern renderar den lista du tittar på —
    och söker du efter något som den nya todon inte matchar, så ingår den inte i
    listan. Den skapas, men den syns inte.

    Och räknaren högst upp rör sig inte heller, eftersom ingenting uppdaterar den
    ännu. Resultatet är att du trycker **Add** och absolut ingenting på sidan
    ändras, trots att allt gick rätt till.

    Töm sökrutan om du vill se vad du lägger till. Det är inget att bygga bort —
    det är vad det innebär att svaret är en lista och inte en rad.

### 2. Skicka in ett tomt fält

Töm textfältet och tryck **Add**.

Servern svarar redan som den ska: den renderar formuläret med fältet markerat.
Problemet är var svaret hamnar. Titta noga — formuläret ersätter **hela listan**.

Det är väntat. Attributen du nyss satte säger "byt ut `#todo-table` mot svaret",
och servern har inget sätt att säga emot dem från HTML:en.

### 3. Låt servern styra svaret

En HTTP-header i svaret, satt i `src/app.ts`, i felgrenen för
`POST /fragments/todos`.

`HX-Retarget` byter ut `hx-target` för det här ena svaret.

??? example "Facit"

    ```ts
    if (!text) {
      res.set('HX-Retarget', '#new-todo-form')
      res.status(422).render('todo-app/new-todo-form', { q, sort, error: true })
      return
    }
    ```

Textfältet kommer tillbaka med röd ram. Inget felmeddelande — ramen är hela
felrapporten.

## Klart när

- [ ] En ny todo dyker upp i listan utan att sidan laddas om.
- [ ] Nätverkspanelen visar en `POST` till `/todo-app/fragments/todos`, och inget dokument.
- [ ] Ett tomt fält ger röd ram **på formuläret**, och listan står kvar.
- [ ] Efter felet går det att skriva något och lägga till som vanligt.

??? question "Formuläret ersatte hela listan"

    Då saknas `HX-Retarget`. Se steg 3.

??? question "Ingenting händer alls vid tomt fält"

    Titta på statuskoden i nätverkspanelen. Servern svarar `422`, och htmx 4
    byter innehåll även på felsvar. Om du har läst att htmx hoppar över svar
    som inte är `2xx` så stämmer det för htmx 2, inte för htmx 4.

??? question "Sorteringen försvinner när jag lägger till något"

    Den gör det, och det är inget du har gjort fel. Sortera nyast först, lägg
    till en todo, och listan hoppar tillbaka till äldst först.

    Det är en riktig bugg, den är äldre än den här övningen, och nästa övning
    handlar om den. Låt den vara så länge.

??? question "Ingenting händer alls när jag lägger till"

    Kontrollera först om du har något i sökrutan. Se varningen i steg 1.

## Det som faktiskt hände

### Svaret var listan, inte raden

Du bad inte om att få en rad tillagd. Du postade en todo och fick tillbaka **hur
listan ser ut nu**.

Ingen kod på sidan räknade ut var den nya todon skulle ligga. Ingenting behövde
veta hur listan var sorterad eller vad som söktes — servern renderade en korrekt
lista, och sidan blev den.

Hade svaret varit en rad som lades sist hade den hamnat på fel ställe så fort
listan gick i någon annan ordning, och webbläsaren hade inte haft något sätt att
märka det.

Det förutsätter förstås att servern får veta hur du sorterat. Det är värt att
hålla i minnet.

### Servern bestämde var svaret skulle hamna

`hx-target` står i HTML:en och gäller normalt varje gång. Men elementet kan inte
veta i förväg att just den här förfrågan skulle misslyckas.

Det vet servern. Och i stället för att skicka tillbaka ett felobjekt som klienten
får tolka, skickade den tillbaka **det som skulle visas** plus en header som
säger var det hör hemma. Klienten behövde ingen felhantering, ingen `if`-sats och
ingen kunskap om vad som kunde gå fel.

### Räknaren stämmer inte längre

Titta på rubriken högst upp. Den säger fortfarande samma antal som innan du lade
till något.

Det är inte ett misstag i övningen. Du bytte ut en del av sidan, och räknaren är
en annan del som ingen bad om. Den ligger utanför `#todo-table`, och den är inte
det förfrågan siktade på.

Den lagas snart, men inte härnäst. **Det är nämligen två saker som är trasiga nu**,
och den andra är svårare att få syn på: sortera nyast först och lägg till en todo.

Låt båda vara så länge.

## Extra: töm textfältet

Texten ligger kvar i fältet efter att todon lagts till. Formuläret renderas aldrig
om när allt gick bra — servern skickar listan, inte formuläret — så fältet behåller
det du skrev.

Ett attribut på formuläret räcker.

| Attribut | Svarar på | Dokumentation |
| --- | --- | --- |
| `hx-on` | Vad ska köras när en händelse inträffar? | [Referens](https://four.htmx.org/reference/attributes/hx-on) |

`hx-on` kopplar JavaScript till en händelse direkt på elementet. Attributet heter
`hx-on:` plus händelsens namn — `hx-on:click` för ett vanligt klick.

htmx egna händelser heter i sin tur `htmx:after:swap`, `htmx:before:request` och
så vidare. Fullt utskrivet blir attributet alltså `hx-on:htmx:after:swap`. Och
eftersom varje htmx-händelse börjar med `htmx:` går det att utelämna ordet men
behålla kolonet:

    hx-on:htmx:after:swap    är samma sak som    hx-on::after:swap

Det är därifrån det dubbla kolonet kommer. Båda formerna fungerar; den korta är
den vanliga.

!!! warning "Händelsenamn i htmx 4 har kolon"

    Händelsen heter `after:swap`. Inte `afterSwap` — det är htmx 2, och det är
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

!!! note "htmx 4 har också en längre form"

    `hx-on:<händelse>="kod"` är den enkla formen, och den du kommer se mest.
    htmx 4 lade till en längre som bygger på `hx-trigger`:s grammatik och skiljer
    händelsen från koden med `->`:

    ```html
    hx-on="<händelse>[<filter>] <modifierare> -> <kod>"
    ```

    Den kan filtrera på händelsen, lyssna på ett annat element med `from:`, köra
    samma kod för flera händelser och para ihop flera händelser med olika kod.
    Inget av det behövs här. Formerna står bredvid varandra i
    [referensen](https://four.htmx.org/reference/attributes/hx-on).

Notera var attributet sitter. Det gäller formulärets egna byten, och bara dem.
Sorteringen från förra övningen byter också innehåll på sidan, men den rör inte
det här fältet. Hade du i stället lagt en lyssnare på `document` hade halvskriven
text försvunnit varje gång någon sorterade.

Beteendet står på elementet det gäller. För att se vad formuläret gör läser du
formuläret.

!!! note "Den röda ramen då?"

    Den ligger kvar efter ett lyckat tillägg, av samma skäl: formuläret renderas
    aldrig om. `reset()` återställer fältets värde men tar inte bort en
    CSS-klass. Det är inget övningen bygger bort.
