# 3. Lägg till en todo utan sidladdning

## Mål

En ny todo hamnar längst ned i listan utan att sidan laddas om, och ett tomt
formulär ger ett synligt fel på rätt ställe.

## Bakgrund

Formuläret postar redan. Det har `method="post"` och `action="/todo-app/todos"`,
och det fungerar. Precis som i förra övningen tar du inte bort det — du lägger
htmx bredvid det.

En sak skiljer sig från sorteringen, och den är värd att lägga på minnet:

!!! note "En `POST` bär med sig hela formuläret"

    I förra övningen satt `hx-get` på en `<a>`, och länken hade inget värde att
    skicka — adressen fick bära sorteringen själv.

    Här är det tvärtom. En förfrågan med kropp — allt utom `GET` och `DELETE` —
    tar med sig alla fält i formuläret automatiskt. Beskrivningen, och de dolda
    `q`- och `sort`-fälten, följer med utan att du gör något.

Två attribut känner du igen. Ett är nytt, och ett värde är nytt:

| Attribut | Svarar på | Dokumentation |
| --- | --- | --- |
| `hx-post` | Vilken adress ska postas till? | [Referens](https://four.htmx.org/reference/attributes/hx-post) |
| `hx-target` | Var i sidan ska svaret in? | [Referens](https://four.htmx.org/reference/attributes/hx-target) |
| `hx-swap` | Hur ska det sättas in? | [Referens](https://four.htmx.org/reference/attributes/hx-swap) |

Målet är `#todo-rows` — `<tbody>`, inte hela tabellen — och bytet är
`beforeend`, som lägger svaret sist bland det som redan finns i stället för att
ersätta något.

## Steg

### 1. Öppna `views/todo-app/new-todo-form.liquid`

Lägg de tre attributen på `<form>`-taggen. Adressen är
`/todo-app/fragments/todos`.

??? example "Facit"

    ```html
    <form class="new-todo" id="new-todo-form" method="post" action="/todo-app/todos"
          hx-post="/todo-app/fragments/todos"
          hx-target="#todo-rows"
          hx-swap="beforeend">
    ```

Lägg till en todo. Den dyker upp längst ned, utan att sidan laddas om.

!!! warning "Det här förutsätter en sak"

    Att listan är sorterad äldst först och att ingen sökning är aktiv. Att
    lägga något sist är bara rätt om listan går i den ordningen. Sortera
    nyast först och lägg till en todo till, så ser du vad som händer.

    Övningen rättar inte det. Det är värt att veta att det är så, inte att
    bygga bort här.

### 2. Skicka in ett tomt fält

Töm textfältet och tryck **Add**.

Servern svarar redan som den ska: den renderar formuläret med fältet markerat.
Problemet är var svaret hamnar. Titta noga — formuläret dyker upp **inne i
listan**, som en ny rad.

Det är väntat. Attributen du nyss satte säger "lägg svaret sist i `#todo-rows`",
och servern har inget sätt att säga emot dem från HTML:en.

### 3. Låt servern styra svaret

Två svarsrubriker i `src/app.ts`, i felgrenen för `POST /fragments/todos`.

`HX-Retarget` byter ut `hx-target` för det här ena svaret. `HX-Reswap` byter ut
`hx-swap`.

??? tip "Varför räcker det inte med `HX-Retarget`?"

    För att `hx-swap="beforeend"` fortfarande gäller. Du pekar om svaret till
    formuläret och lägger det sedan **sist inuti** formuläret — ett formulär
    inuti ett formulär. Båda rubrikerna behövs: en för vart, en för hur.

??? example "Facit"

    ```ts
    if (!text) {
      res.set('HX-Retarget', '#new-todo-form')
      res.set('HX-Reswap', 'outerHTML')
      res.status(422).render('todo-app/new-todo-form', { q, sort, error: true })
      return
    }
    ```

Textfältet kommer tillbaka med röd ram. Inget felmeddelande — ramen är hela
felrapporten.

## Klart när

- [ ] En ny todo läggs till sist i listan utan att sidan laddas om.
- [ ] Nätverkspanelen visar en `POST` till `/todo-app/fragments/todos`, och inget dokument.
- [ ] Ett tomt fält ger röd ram **på formuläret**, inte ett formulär inne i listan.
- [ ] Efter felet går det att skriva något och lägga till som vanligt.

??? question "Formuläret hamnar fortfarande i listan"

    Då saknas `HX-Reswap`. Se den fällbara rutan i steg 3.

??? question "Ingenting händer alls vid tomt fält"

    Titta på statuskoden i nätverkspanelen. Servern svarar `422`, och htmx 4
    byter innehåll även på felsvar. Om du har läst att htmx hoppar över svar
    som inte är `2xx` så stämmer det för htmx 2, inte för htmx 4.

## Det som faktiskt hände

### Servern bestämde var svaret skulle hamna

`hx-target` och `hx-swap` står i HTML:en och gäller normalt varje gång. Men
elementet kan inte veta i förväg att just den här förfrågan skulle misslyckas.

Det vet servern. Och i stället för att skicka tillbaka ett felobjekt som
klienten får tolka, skickade den tillbaka **det som skulle visas** plus två
rubriker som säger var det hör hemma. Klienten behövde ingen felhantering, ingen
`if`-sats och ingen kunskap om vad som kunde gå fel.

### Räknaren stämmer inte längre

Titta på rubriken högst upp. Den säger fortfarande samma antal som innan du
lade till något.

Det är inte ett misstag i övningen. Du bytte ut en del av sidan, och räknaren är
en annan del som ingen bad om. Den ligger inte i närheten av raden som ändrades,
och den är inte det förfrågan siktade på.

**Nästa övning handlar om precis det.** Låt den vara trasig så länge.

## Extra: töm textfältet

En liten sak som stör efter ett tag: texten ligger kvar i fältet efter att todon
lagts till. Formuläret renderas aldrig om när allt gick bra — servern skickar
bara raden — så fältet behåller det du skrev.

Lägg till en lyssnare i `public/js/app.js`.

!!! warning "Händelsenamn i htmx 4 har kolon"

    Den heter `htmx:after:swap`. Inte `htmx:afterSwap` — det är htmx 2, och det
    är vad nästan varje handledning och AI-assistent föreslår. Fel stavning ger
    inget felmeddelande. Lyssnaren körs bara aldrig.

??? tip "Ledtråd — den uppenbara varianten har en bugg"

    Att tömma fältet vid varje `htmx:after:swap` fungerar — men sorteringen från
    förra övningen byter också innehåll, och utlöser alltså samma händelse.

    Skriv halva en todo, sortera utan att skicka in, och se vad som händer med
    det du skrivit.

??? example "Facit"

    ```js
    document.addEventListener('htmx:after:swap', function (e) {
      if (e.target.id !== 'new-todo-form') return
      document.querySelector('.new-todo__input').value = ''
    })
    ```

    Vid det här bytet är `e.target` formuläret som gjorde förfrågan. Genom att
    kontrollera det rör lyssnaren inte andra byten — sorteringens byte har ett
    annat `target` och faller igenom på första raden.
