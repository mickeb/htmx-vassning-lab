# 10. Sök medan du skriver

## Mål

Listan filtreras medan du skriver, sorteringen följer med sökningen, och
sökordet hamnar i adressen utan att fylla historiken med ett steg per
tangenttryckning.

## Bakgrund

Sökrutan är det sista som laddar om sidan. Den är ett vanligt formulär med en
knapp, precis som den alltid har varit — och den får förbli det. Attributen
hamnar på **fältet**, inte på formuläret, så att söka medan man skriver läggs
ovanpå det som redan fungerar.

Det innebär också att sökningen fortsätter fungera utan JavaScript. Knappen
**Search** gör fortfarande en vanlig sidladdning till samma adress. Det är inte
något som ska byggas bort; det är reservvägen, synlig.

Två nya attribut, och två till längre fram i övningen:

| Attribut | Svarar på | Dokumentation |
| --- | --- | --- |
| `hx-trigger` | Vad ska utlösa förfrågan, och när? | [Referens](https://four.htmx.org/reference/attributes/hx-trigger) |
| `hx-include` | Vad mer än elementets eget värde ska skickas med? | [Referens](https://four.htmx.org/reference/attributes/hx-include) |

Sökningen är en `GET` hela vägen. Frågesträngen i adressen är själva poängen —
det är den som gör en sökning möjlig att skicka vidare, och det är den du
lämnade tillbaka till sorteringen i förra övningen.

## Steg

### 1. Sök medan du skriver

Öppna `views/todo-app/search-form.liquid` och lägg attributen på
`<input class="search__input">`. Adressen är `/todo-app` — samma som
sorteringen hämtar sedan övning 8.

Utlösaren är det nya:

```
hx-trigger="input changed delay:300ms"
```

`input` är webbläsarens egen händelse: den kommer vid varje tangenttryckning.
`delay:300ms` startar om nedräkningen vid varje ny händelse, så en förfrågan går
iväg när du **pausar**, inte per tecken. `changed` hoppar över förfrågan om
värdet inte faktiskt ändrats — pilknappar och liknande ger `input` utan att
texten blir en annan.

!!! warning "Glöm inte `hx-swap`"

    Svaret **är** `#todo-table`. Standardbytet i htmx 4 är `innerHTML`, så utan
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

Skriv i rutan med nätverkspanelen öppen. Fem tecken ska ge **en** förfrågan,
inte fem. Ta bort `delay:300ms` en stund och skriv igen om du vill se
skillnaden.

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

!!! note "En `GET` bär inte med sig sitt formulär"

    I övning 3 följde hela formuläret med av sig självt. Det gjorde det för att
    en `POST` har en kropp. Regeln, från
    [htmx-dokumentationen om formulär](https://four.htmx.org/docs#forms), är att
    ett element skickar **sitt eget värde**, och att formulärets alla fält
    följer med först när förfrågan har en kropp.

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
    `hx-get="/todo-app?sort={{ sort }}"`. Liquid skriver in värdet när sidan
    renderas, och formuläret renderas inte om.

Lägg därför ett sorteringsfält **inuti** `#todo-table`, som varje byte renderar
om, och peka `hx-include` på det.

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
sökning är aktiv — sökordet ligger kvar också, för sorteringslänken har burit
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

De två sitter kvar sida vid sida i appen nu: sorteringslänken lägger till steg,
sökrutan byter ut. Samma sorts adress, två olika svar på frågan om det är värt
ett steg bakåt.

### 4. Extra: visa att något händer

Sökningen sker på en paus, och på en långsam förbindelse hinner det gå en stund
innan listan byts. Just nu syns ingenting under tiden.

| Attribut | Svarar på | Dokumentation |
| --- | --- | --- |
| `hx-indicator` | Vilket element ska markeras medan förfrågan pågår? | [Referens](https://four.htmx.org/reference/attributes/hx-indicator) |

htmx lägger klassen `htmx-request` på elementet under tiden, och tar bort den
när svaret kommit. Stilmallen som får det att synas kommer från htmx självt:

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

!!! note "Attributet måste sitta på elementet som gör förfrågan"

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
- [ ] Fem tecken i rad ger **en** förfrågan, inte fem.
- [ ] Sortera nyast först och sök — ordningen ligger kvar.
- [ ] Adressen visar `?q=...`, och bakåtknappen går **inte** tillbaka genom
      varje paus.
- [ ] Bakåt efter en sortering tar dig till sökningen igen — med sökordet kvar i
      rutan.
- [ ] Knappen **Search** fungerar fortfarande, med en vanlig sidladdning.

??? question "Ordningen slår tillbaka så fort jag skriver"

    Antingen saknas `hx-include`, eller så pekar den på fältet i formuläret i
    stället för på det i tabellen. Titta på adressen i nätverkspanelen: saknas
    `sort` helt är det det första, står det fel värde är det det andra.

??? question "Listan hamnar inuti sig själv"

    `hx-swap="outerHTML"` saknas. Ladda om sidan så försvinner dubbleringen.

??? question "Varje bokstav ger en förfrågan"

    `delay:300ms` saknas i `hx-trigger`, eller står på fel plats — den hör till
    `input`, inte till elementet.

## Det som faktiskt hände

### En förfrågan bär exakt det du lägger i den

Det är hela lärdomen från steg 2, och den gäller vidare än htmx. En `GET` har
ingen kropp, så det finns ingenstans att lägga ett formulär. Fältet skickade
sitt eget värde, för det var det enda någon hade bett om.

Ingenting kommer med "av sig självt", och ingenting minns förra förfrågan.
Behöver servern veta något måste det stå i den här förfrågan.

### Det du skickar måste renderas om

Den andra halvan är lättare att missa och dyrare att upptäcka sent. Det räcker
inte att peka ut ett värde — värdet måste komma från något som uppdateras när
det det beskriver ändras.

Sorteringsfältet i formuläret låg utanför det som byttes. Det var korrekt när
sidan laddades och blev inaktuellt vid första sorteringen, utan att någonting
såg fel ut.

Det är samma idé som räknaren i övning 5, en nivå ner: där skickade servern med
det som ändrades så att sidan inte behövde räkna själv. Här måste den skicka med
det som ändrades så att nästa förfrågan kan citera tillbaka det rätt.

### Adressen är inte en etikett

Tryck bakåt efter en sortering och titta på sökrutan: sökordet står kvar i den.

Ingen kod lade tillbaka det. htmx hämtade adressen på nytt, servern renderade
sidan för den adressen — inklusive `value="{{ q }}"` i sökfältet — och det som
kom tillbaka var hela tillståndet. Adressen beskrev sidan tillräckligt väl för
att sidan skulle gå att bygga upp igen från den.

Det är därför sökningen fick förbli en `GET` med sina fält i frågesträngen, och
inte blev en `POST`.

## Och sen?

Det var den sista övningen. Appen du började med laddade om sidan vid varje
sortering, varje tillagd todo, varje bock och varje sökning. Nu gör den inget av
det — och du har inte skrivit en rad kod som bygger HTML i webbläsaren.

Det som togs bort var sidladdningarna. Det som fick vara kvar var allt annat:
länkar med adresser, formulär som postar, svar som är HTML, och en server som
bestämmer vad ett svar innehåller.
