# 10. Sök medan du skriver

## Mål

Listan filtreras medan du skriver, sorteringen följer med sökningen, och
sökordet hamnar i adressen utan att fylla historiken med ett steg per
tangenttryckning.

## Attribut använda under övningen

| Attribut | Svarar på | Dokumentation |
| --- | --- | --- |
| `hx-get` | Vilken adress ska hämtas? | [Referens](https://four.htmx.org/reference/attributes/hx-get) |
| `hx-trigger` | Vad ska trigga requesten, och när? | [Referens](https://four.htmx.org/reference/attributes/hx-trigger) |
| `hx-target` | Var i sidan ska svaret in? | [Referens](https://four.htmx.org/reference/attributes/hx-target) |
| `hx-swap` | Hur ska det sättas in? | [Referens](https://four.htmx.org/reference/attributes/hx-swap) |
| `hx-include` | Vad mer än elementets eget värde ska skickas med? | [Referens](https://four.htmx.org/reference/attributes/hx-include) |
| `hx-replace-url` | Ska adressen bytas ut utan att ett steg läggs till? | [Referens](https://four.htmx.org/reference/attributes/hx-replace-url) |

## Template-fragment använda under övningen

| Template | Route | Innehåller |
| --- | --- | --- |
| `views/todo-app/todo-table.liquid` | `GET /todo-app`, med `HX-Request` | Tabellen, filtrerad på sökordet i `q` |

## Steg

### 1. Sök medan du skriver

Sökrutan är nu det sista som laddar om sidan. Den är ett vanligt formulär med
en knapp.

Kanske lite oväntat är det input-fältet som kommer få de nya attributen, och
inte själva form-elementet. Detta beror på att det är interaktionen med
sökfältet och inte själva formuläret (via dess submit-knapp) som ska trigga en
sökning.

Det innebär också att sökningen fortsätter fungera utan JavaScript. Knappen
**Search** kommer fortsätta submitta formuläret precis som vanligt.

1. Öppna `views/todo-app/search-form.liquid` och leta upp
   `<input class="search__input">`.
2. Tilldela `hx-get` värdet `/todo-app`, samma adress som sorteringen hämtar sedan
   övning 8.
3. Tilldela `hx-trigger` värdet `input changed delay:300ms`.
4. Tilldela `hx-target` värdet `#todo-table`.
5. Tilldela `hx-swap` värdet `outerHTML`. Svaret är tabellen i sin helhet, inte
   innehållet i den.

`hx-trigger` är det nya attributet. `input` är webbläsarens eget event, och det triggas
varje gång texten i fältet ändras. `delay:300ms` startar om nedräkningen vid
varje nytt event, så en request går iväg när du **pausar**, inte per varje tecken.
`changed` hoppar över requesten om värdet inte har ändrats.

??? example "Facit"

    ```html
    <input class="search__input" type="search" name="q" value="{{ q }}" placeholder="Search todos"
           hx-get="/todo-app"
           hx-trigger="input changed delay:300ms"
           hx-target="#todo-table"
           hx-swap="outerHTML">
    ```

Skriv i rutan med nätverkspanelen öppen. Fem tecken ska ge **en** request,
inte fem.

### 2. Ta hänsyn till sorteringen

Sortera nyast först. Skriv sedan något i sökrutan.

Ordningen slår tillbaka till äldst först vid första tangenttryckningen.

Titta i nätverkspanelen, på adressen som gick iväg:

```
/todo-app?q=alpha            <- det som skickades
/todo-app?q=alpha&sort=desc  <- det formuläret hade skickat
```

Sorteringen är inte med i requesten. Servern vet alltså inte att du valde
nyast först, och sorterar som standard äldst först.

!!! note "En `GET` skickar inte med sitt formulär"

    I övning 3 satt attributen på formuläret, och ett formulär skickar alltid
    alla sina fält. Här sitter de på fältet. Ett fält skickar **sitt eget
    värde**, och formulärets övriga fält följer med bara när requesten har en
    kropp
    ([htmx-dokumentationen om formulär](https://four.htmx.org/docs#forms)).

    `GET` har ingen kropp. Fältet skickar `q` och ingenting annat. Det dolda
    sorteringsfältet ligger i samma formulär och följer ändå inte med.

Lösningen är `hx-include`, som ger dig möjlighet att specificera ytterligare
data som ska inkluderas i requesten.

1. Öppna `views/todo-app/todo-table.liquid` och ge det dolda sorteringsfältet
   ett `id`. Det är fältet du flyttade dit i övning 4.
2. Lägg till `hx-include` på sökfältet i `search-form.liquid`, och peka det på
   fältets `id`.

??? example "Facit — `views/todo-app/todo-table.liquid`"

    ```html
    <div class="todo-table" id="todo-table">
      <input type="hidden" id="current-sort" name="sort" value="{{ sort }}" form="new-todo-form">
    ```

??? example "Facit — fältet i sökrutan"

    ```html
           hx-include="#current-sort"
    ```

Sortera nyast först och skriv igen. Ordningen ligger kvar. Sortera medan en
sökning är aktiv. Sökordet ligger kvar också, för sorteringslänken har haft
`q` i adressen sedan övning 2.

!!! note "Fältet i tabellen har nu två användningar"

    `form="new-todo-form"` gör att det följer med när en todo läggs till, och
    `hx-include` att det följer med när du söker. Sökformuläret har kvar sitt
    eget dolda sorteringsfält för den vanliga submiten. Bara ett av dem skickas
    per request.

### 3. Sökordet i adressen

Sorteringen lägger sin adress i historiken sedan förra övningen. Gör samma sak
här: lägg `hx-push-url="true"` på sökfältet och skriv några ord med korta
pauser.

Titta sedan på bakåtknappen.

Att ta sig tillbaka till där du var innan du började söka kräver ett tryck per
paus. Adressen stämmer, men varje sökning har blivit ett sidbesök.

Byt ut attributet mot `hx-replace-url="true"`.

??? example "Facit"

    ```html
           hx-include="#current-sort"
           hx-replace-url="true"
    ```

### 4. Extra: visa att något händer

Sökningen sker först efter att 300ms passerat, och på en långsam förbindelse
hinner det gå en stund innan listan byts. Just nu syns ingenting under tiden.

| Attribut | Svarar på | Dokumentation |
| --- | --- | --- |
| `hx-indicator` | Vilket element ska markeras medan requesten pågår? | [Referens](https://four.htmx.org/reference/attributes/hx-indicator) |

htmx lägger klassen `htmx-request` på elementet under tiden, och tar bort den
när svaret kommit. Stylingen som visar elementet under tiden kommer från htmx
självt.

Du behöver alltså bara ett element med klassen `htmx-indicator` och ett
`hx-indicator` som pekar på det.

??? example "Facit"

    I `search-form.liquid`, efter `</label>`:

    ```html
    <span class="htmx-indicator" id="search-status">Searching…</span>
    ```

    Och på fältet:

    ```html
           hx-indicator="#search-status"
    ```

!!! warning "Du kommer inte se den lokalt"

    Servern svarar på några millisekunder, men indikatorn tonas in under
    200 ms. Den hinner aldrig synas.

    I route handlern för `GET /` i `src/app.ts` finns en utkommenterad rad som
    gör att svaret tar en sekund. Ta bort kommentartecknen på den raden så
    syns indikatorn. Lägg tillbaka dem när du är klar.

## Klart när

- [ ] Listan filtreras medan du skriver, utan att sidan laddas om.
- [ ] Fem tecken i rad ger **en** request, inte fem.
- [ ] Sortera nyast först och sök: ordningen ligger kvar.
- [ ] Adressen visar `?q=...`, och bakåtknappen går **inte** tillbaka genom
      varje paus.
- [ ] Bakåt efter en sortering tar dig till sökningen igen, med sökordet kvar i
      rutan.
- [ ] Knappen **Search** fungerar fortfarande, med en vanlig sidladdning.

## Fungerar det inte?

??? question "Ordningen slår tillbaka så fort jag skriver"

    Antingen saknas `hx-include`, eller så pekar den på fältet i formuläret i
    stället för på det i tabellen. Titta på adressen i nätverkspanelen: saknas
    `sort` helt är det det första, står det fel värde är det det andra.

??? question "Listan hamnar inuti sig själv"

    `hx-swap="outerHTML"` saknas. Ladda om sidan så försvinner dubbleringen.

??? question "Varje bokstav ger en request"

    `delay:300ms` saknas i `hx-trigger`, eller står på fel plats. Den hör till
    `input`, inte till elementet.

## Och sen då?

Det var den sista övningen. Appen du började med har nu blivit något många
skulle tro är skrivet med React eller Vue, och du har inte skrivit en rad kod
som bygger HTML i webbläsaren.

Har du tid över finns [**extrauppgifter**](../extra/README.md) att utforska och
[**vidare läsning**](../reading/README.md) om andra koncept och tekniker i
htmx-sfären som kan vara bra att känna till.
