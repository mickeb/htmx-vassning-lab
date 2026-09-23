# 4. Ser du buggen?

## Mål

Sorteringen överlever att du lägger till en todo.

## Vilken bugg?

1. Sortera **nyast först** genom att klicka på **Created at**.
2. Lägg till en todo.

Listan hoppar tillbaka till äldst först. Sorteringen du valde är borta.

### Vad som skickades

Öppna nätverkspanelen och gör om det. Titta på kroppen i den `POST` som går
iväg när du lägger till todon:

```
sort=asc&q=&description=Köp mjölk
```

Där står `asc`, trots att tabellen framför dig är sorterad fallande.

Servern gjorde alltså inget fel. Den blev ombedd om en lista i stigande ordning
och renderade en lista i stigande ordning. Felet ligger i requesten, inte i
svaret.

### Varför skickar formuläret `asc`?

Formuläret har ett dolt fält:

```html
<input type="hidden" name="sort" value="{{ sort }}">
```

Templaten skrev ut värdet när **sidan** renderades, och då var sorteringen `asc`.

Sorteringslänken ersätter bara `#todo-table`. Formuläret ligger utanför, i en
helt annan del av sidan, och ingenting har renderat om det sedan sidladdningen.
Fältet säger fortfarande `asc`, och det kommer att göra det hur många gånger du
än sorterar.

Vi behöver alltså ett sätt att skicka med sorteringen från den senast hämtade
tabellen. Ett fält inuti `#todo-table` renderas om varje gång du sorterar och har
därför alltid rätt värde. Det måste bara fortfarande höra till formuläret.

## Attribut använda under övningen

| Attribut | Svarar på | Dokumentation |
| --- | --- | --- |
| `form` | Vilket formulär hör det här fältet till? | [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input#form) |

Ett fält med `form="nånting"` tillhör formuläret vars `id` är `nånting`, var i
dokumentet fältet än står. Det behöver inte ligga inuti `<form>`-taggen alls.

!!! tip "Det här är inte htmx!"

    `form` är ett vanligt HTML-attribut och har funnits sedan HTML5. Webbläsaren
    räknar fältet till formuläret när den bygger requesten, oavsett vem som
    skickar den.

## Template-fragment använda under övningen

| Template | Route | Innehåller |
| --- | --- | --- |
| `views/todo-app/todo-table.liquid` | [`GET /todo-app/fragments/table`](http://localhost:4000/todo-app/fragments/table) | Tabellen, och efter den här övningen även det dolda `sort`-fältet |

## Flytta fältet

1. Öppna `views/todo-app/new-todo-form.liquid` och ta bort det dolda
   `sort`-fältet.
2. Öppna `views/todo-app/todo-table.liquid` och lägg in fältet överst inuti
   `<div class="todo-table" id="todo-table">`.
3. Lägg till `form`-attributet, med formulärets `id` som värde.

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

## Fungerar det inte?

??? question "Fältet skickas inte alls"

    Kontrollera att `form`-attributets värde är exakt samma sträng som
    formulärets `id`. Matchar de inte tillhör fältet inget formulär, och då
    skickas det inte med. Inget felmeddelande säger till.

??? question "Kan jag inte bara lägga fältet inuti formuläret igen?"

    Jo, och då är du tillbaka där du började. Fältet måste ligga i den del av
    sidan som ersätts, annars renderas det aldrig om.
