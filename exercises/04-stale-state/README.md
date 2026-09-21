# 4. Ser du buggen?

## Mål

Sorteringen överlever att du lägger till en todo.

## Vilken bugg?

Den här övningen bygger ingenting nytt. Den lagar något som varit trasigt ett
tag, och poängen ligger i *varför* det var trasigt.

Börja med att se det hända.

!!! note "Gör det här först"

    1. Sortera **nyast först** — klicka på **Created at**.
    2. Lägg till en todo.

    Listan hoppar tillbaka till äldst först. Sorteringen du valde är borta.

Ingen sidladdning, inget felmeddelande, ingenting i konsolen. Servern svarade
`200` och htmx satte in svaret precis som den skulle. Ändå är resultatet fel.

### Vad som faktiskt skickades

Öppna nätverkspanelen och gör om det. Titta på kroppen i den `POST` som går
iväg när du lägger till todon:

```
sort=asc&q=&description=Köp mjölk
```

`asc` — trots att tabellen framför dig är sorterad fallande.

Servern gjorde alltså inget fel. Den blev ombedd om en lista i stigande ordning
och renderade en lista i stigande ordning. Felet ligger i requesten, inte i
svaret.

??? question "Varför skickar formuläret `asc`?"

    Formuläret har ett dolt fält:

    ```html
    <input type="hidden" name="sort" value="{{ sort }}">
    ```

    Templaten renderade värdet när **sidan** renderades, och då var sorteringen
    `asc`.

    Sorteringslänken ersätter bara `#todo-table`. Formuläret ligger utanför, i
    en helt annan del av sidan, och ingenting har renderat om det sedan
    sidladdningen. Fältet säger fortfarande `asc`, och det kommer att göra det
    hur många gånger du än sorterar.

!!! warning "Bara det som svaret ersätter är aktuellt"

    Allt annat på sidan har kvar det värde det hade när det senast renderades.

    Det finns ingenting i markupen som avslöjar att ett värde blivit inaktuellt.
    Ett gammalt `value="asc"` ser exakt ut som ett färskt. Det syns först när
    något skickar iväg det.

!!! note "Appen var aldrig fel — förrän sidladdningen försvann"

    Det dolda fältet är inte ett designmisstag. I en vanlig flersidesapp kan det
    aldrig bli inaktuellt: varje post laddar om hela sidan, och då renderas
    formuläret om tillsammans med allt annat. Fältet var färskt varje gång, hela
    tiden, ända tills du gjorde något åt sorteringen.

    Det är övning 2 som skapar problemet, inte den här koden. När bara en del av
    sidan ersätts blir "renderas om" plötsligt något som gäller vissa element och
    inte andra — och ingenting i markupen skiljer dem åt.

    Buggen syntes först när du la till en todo, en övning senare. Så brukar det
    se ut: den kommer fram någon helt annanstans än där den bor.

## Användbara attribut

Fältet måste ligga någonstans som renderas om när du sorterar — alltså **inuti
`#todo-table`**. Men det måste fortfarande skickas med formuläret, och
formuläret ligger någon annanstans på sidan.

Det finns ett HTML-attribut för precis det.

| Attribut | Svarar på | Dokumentation |
| --- | --- | --- |
| `form` | Vilket formulär hör det här fältet till? | [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input#form) |

Ett fält med `form="nånting"` tillhör formuläret vars `id` är `nånting` — var i
dokumentet fältet än står. Det behöver inte ligga inuti `<form>`-taggen alls.

!!! tip "Det här är inte htmx"

    `form` är ett vanligt HTML-attribut och har funnits sedan HTML5. Webbläsaren
    räknar fältet till formuläret när den bygger requesten, oavsett vem som
    skickar den.

    Det syns sällan i kod, och det är synd — det löser precis den här sortens
    problem, och det gör det utan en rad JavaScript.

## Steg

### Flytta fältet

Öppna `views/todo-app/new-todo-form.liquid` och ta bort raden:

```html
<input type="hidden" name="sort" value="{{ sort }}">
```

Öppna sedan `views/todo-app/todo-table.liquid` och lägg in den överst inuti
`<div class="todo-table" id="todo-table">` — med `form`-attributet satt till
formulärets `id`.

??? tip "Ledtråd"

    `id`:t på formuläret står i `new-todo-form.liquid`. Det är det värdet
    `form`-attributet ska ha.

??? example "Facit"

    ```html
    <div class="todo-table" id="todo-table">
      <input type="hidden" name="sort" value="{{ sort }}" form="new-todo-form">
    ```

Sortera nyast först och lägg till en todo. Den hamnar överst, och ordningen står
kvar.

## Klart när

- [ ] Sortera nyast först, lägg till en todo: den hamnar **överst**, och listan
      står kvar i fallande ordning.
- [ ] Nätverkspanelen visar `sort=desc` i kroppen på den `POST` som går iväg.
- [ ] Sorteringen fungerar fortfarande som vanligt, fram och tillbaka.
- [ ] Räknaren i rubriken är fortfarande fel — den lagas inte här.

## Fungerar det inte?

??? question "Fältet skickas inte alls"

    Kontrollera att `form`-attributets värde är exakt samma sträng som
    formulärets `id`. Matchar de inte tillhör fältet inget formulär, och då
    skickas det med ingenting — tyst.

??? question "Kan jag inte bara lägga fältet inuti formuläret igen?"

    Jo, och då är du tillbaka där du började. Fältet måste ligga i den del av
    sidan som ersätts, annars renderas det aldrig om.

## Nästa övning

Sorteringen överlever ett tillägg. Kvar står räknaren i rubriken, som fortfarande
inte har räknat om sig sedan du la till något.

Nästa övning tar den — och svaret på den är inte HTML den här gången.
