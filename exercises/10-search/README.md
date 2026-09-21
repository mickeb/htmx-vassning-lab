# 10. Sök medan du skriver

## Mål

Listan filtreras medan du skriver, sorteringen följer med sökningen, och
sökordet hamnar i adressen utan att fylla historiken med ett steg per
tangenttryckning.

## Användbara attribut

| Attribut | Svarar på | Dokumentation |
| --- | --- | --- |
| `hx-trigger` | Vad ska trigga requesten, och när? | [Referens](https://four.htmx.org/reference/attributes/hx-trigger) |
| `hx-include` | Vad mer än elementets eget värde ska skickas med? | [Referens](https://four.htmx.org/reference/attributes/hx-include) |

## Steg

### 1. Sök medan du skriver

Sökrutan är nu det sista som laddar om sidan. Den är ett vanligt formulär med
en knapp.

Kanske lite oväntat är det input-fältet som kommer få de nya attributen, och
inte själva form-elementet. Requesten ska triggas av att du skriver, inte av
att formuläret submittas.

Det innebär också att sökningen fortsätter fungera utan JavaScript. Knappen
**Search** kommer fortsätta submitta formuläret precis som vanligt. Det är inte
något som ska byggas bort; det är reservvägen, synlig.

Sökningen är en `GET` hela vägen. Frågesträngen i adressen är själva poängen —
det är den som gör en sökning möjlig att skicka vidare, och det är den du
lämnade tillbaka till sorteringen i förra övningen.

Öppna `views/todo-app/search-form.liquid` och lägg attributen på
`<input class="search__input">`-elementet. Adressen är `/todo-app` — samma som
sorteringen hämtar sedan övning 8.

`hx-trigger` är det nya:

```
hx-trigger="input changed delay:300ms"
```

`input` är webbläsarens eget event: det kommer vid varje tangenttryckning.
`delay:300ms` startar om nedräkningen vid varje nytt event, så en request går
iväg när du **pausar**, inte per tecken. `changed` hoppar över requesten om
värdet inte ändrats — pilknappar och liknande ger `input` utan att
texten blir en annan.

!!! warning "Glöm inte `hx-swap`"

    Svaret är tabellen i sin helhet, inte innehållet i den. Standardvärdet för
    `hx-swap` i htmx 4 är `innerHTML`, så utan
    `hx-swap="outerHTML"` hamnar en ny `#todo-table` *inuti* den gamla. Listan
    ser rätt ut, men sidan har nu två element med samma `id`.

??? example "Facit"

    ```html
    <input class="search__input" type="search" name="q" value="{{ q }}" placeholder="Search todos"
           id="search-q"
           hx-get="/todo-app"
           hx-trigger="input changed delay:300ms"
           hx-target="#todo-table"
           hx-swap="outerHTML">
    ```

Skriv i rutan med nätverkspanelen öppen. Fem tecken ska ge **en** request,
inte fem.

### 2. Sortera först, sök sedan

Sortera nyast först. Skriv sedan något i sökrutan.

Ordningen slår tillbaka till äldst först vid första tangenttryckningen.

Titta i nätverkspanelen, på adressen som gick iväg:

```
/todo-app?q=alpha            <- det som skickades
/todo-app?q=alpha&sort=desc  <- det formuläret hade skickat
```

Sorteringen är inte med. Servern har ingen aning om vad du valde, faller
tillbaka på sin standardordning och svarar med en helt korrekt lista — på fel
fråga.

!!! note "En `GET` skickar inte med sitt formulär"

    I övning 3 följde hela formuläret med av sig självt. Det gjorde det för att
    en `POST` har en kropp. Regeln, från
    [htmx-dokumentationen om formulär](https://four.htmx.org/docs#forms), är att
    ett element skickar **sitt eget värde**, och att formulärets alla fält
    följer med först när requesten har en kropp.

    `GET` har ingen kropp. Fältet skickar `q` och ingenting annat — det dolda
    sorteringsfältet ligger i samma formulär och följer ändå inte med.

Fixen är `hx-include`, som pekar ut vad mer som ska skickas. Men den kräver en
sak till, och det är den intressanta halvan.

!!! warning "Fältet måste ligga där det renderas om"

    Formuläret har redan ett dolt sorteringsfält. Pekar du `hx-include` på det
    får du **fel svar på ett nytt sätt**: sökrutan ligger utanför `#todo-table`,
    så en sortering renderar aldrig om den. Fältet står kvar på det värde det
    hade när sidan laddades, och `hx-include` skickar lydigt det gamla värdet.

    Resultatet ser exakt ut som buggen du just tittade på.

    Samma sak händer om du bakar in sorteringen i adressen —
    `hx-get="/todo-app?sort={{ sort }}"`. Templaten skriver ut värdet när sidan
    renderas, och formuläret renderas aldrig om.

Lägg därför ett sorteringsfält **inuti** `#todo-table`, som renderas om varje
gång tabellen ersätts, och peka `hx-include` på det.

??? example "Facit — `views/todo-app/todo-table.liquid`"

    ```html
    <div class="todo-table" id="todo-table">
      <input type="hidden" id="current-sort" name="sort" value="{{ sort }}">
    ```

??? example "Facit — fältet i sökrutan"

    ```html
           hx-include="#current-sort"
    ```

Sortera nyast först och skriv igen. Ordningen ligger kvar. Sortera medan en
sökning är aktiv — sökordet ligger kvar också, för sorteringslänken har haft
`q` i adressen sedan övning 2.

!!! note "Nu finns det två dolda sorteringsfält"

    Ett i formuläret och ett i tabellen. Det är inte ett misstag. Formulärets
    används när formuläret postas på vanligt vis — reservvägen — och tabellens
    används av htmx. Bara ett av dem skickas åt gången.

### 3. Sökordet i adressen

Sorteringen lägger sin adress i historiken sedan förra övningen. Gör samma sak
här: lägg `hx-push-url="true"` på sökfältet och skriv några ord med korta
pauser.

Titta sedan på bakåtknappen.

Varje paus har blivit ett eget steg i historiken. Att ta sig tillbaka till där
du var innan du började söka kräver ett tryck per paus. Adressen stämmer, men
historiken har blivit en logg över ditt skrivande.

| Attribut | Svarar på | Dokumentation |
| --- | --- | --- |
| `hx-replace-url` | Ska adressen bytas ut utan att ett steg läggs till? | [Referens](https://four.htmx.org/reference/attributes/hx-replace-url) |

Byt ut attributet mot `hx-replace-url="true"`.

??? example "Facit"

    ```html
           hx-include="#current-sort"
           hx-replace-url="true"
    ```

Regeln, rakt ut: **push för beslut, replace för förfining.** Att sortera är ett
beslut — du vill kunna gå tillbaka till det. Att skriva ett tecken till i en
sökruta är det inte.

### 4. Extra: visa att något händer

Sökningen sker på en paus, och på en långsam förbindelse hinner det gå en stund
innan listan byts. Just nu syns ingenting under tiden.

| Attribut | Svarar på | Dokumentation |
| --- | --- | --- |
| `hx-indicator` | Vilket element ska markeras medan requesten pågår? | [Referens](https://four.htmx.org/reference/attributes/hx-indicator) |

htmx lägger klassen `htmx-request` på elementet under tiden, och tar bort den
när svaret kommit. Den stylesheet som får det att synas kommer från htmx självt:

```css
.htmx-indicator { opacity: 0; visibility: hidden }
.htmx-request .htmx-indicator,
.htmx-request.htmx-indicator { opacity: 1; visibility: visible; transition: opacity 200ms ease-in }
```

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

!!! note "Attributet måste sitta på elementet som gör requesten"

    Arvet mellan element är explicit i htmx 4. Sitter `hx-indicator` på
    formuläret gäller det inte fältet inuti, om det inte skrivs
    `hx-indicator:inherited`.

!!! warning "Du kommer inte se den lokalt"

    Servern svarar på några millisekunder, och intoningen tar 200. Indikatorn
    hinner aldrig bli synlig.

    Strypa hastigheten i nätverkspanelen är det enklaste sättet att se den.
    Annars: markera `<span>` i inspektören och skriv i sökrutan — klassen
    `htmx-request` dyker upp och försvinner.

## Klart när

- [ ] Listan filtreras medan du skriver, utan att sidan laddas om.
- [ ] Fem tecken i rad ger **en** request, inte fem.
- [ ] Sortera nyast först och sök — ordningen ligger kvar.
- [ ] Adressen visar `?q=...`, och bakåtknappen går **inte** tillbaka genom
      varje paus.
- [ ] Bakåt efter en sortering tar dig till sökningen igen — med sökordet kvar i
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

    `delay:300ms` saknas i `hx-trigger`, eller står på fel plats — den hör till
    `input`, inte till elementet.

## Och sen då?

Det var den sista övningen. Appen du började med laddade om sidan vid varje
sortering, varje tillagd todo, varje bock och varje sökning. Nu gör den inget av
det — och du har inte skrivit en rad kod som bygger HTML i webbläsaren.

Det som togs bort var sidladdningarna. Det som fick vara kvar var allt annat:
länkar med adresser, formulär som postar, svar som är HTML, och en server som
bestämmer vad ett svar innehåller.
