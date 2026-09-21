# 9. Ge tillbaka adressen

## Mål

Sorteringen syns i adressfältet igen. Adressen går att kopiera och skicka
vidare, och bakåtknappen tar dig ett steg tillbaka i listan i stället för ut ur
appen.

## Användbara attribut

Sortera nyast först och titta på adressfältet. Det står fortfarande `/todo-app`.

Det är en sak som gick förlorad någonstans mellan övning 2 och nu. Innan htmx
var varje sortering en sidladdning, och adressen följde med av sig själv — det
var webbläsaren som bytte sida. Nu är det htmx som hämtar, och då händer det
inte av sig själv.

Konsekvenserna märks först när någon gör något vanligt:

- kopierar adressen och skickar den till en kollega — som får listan i
  standardordning
- bokmärker sidan — bokmärket tappar sorteringen
- trycker på bakåtknappen — och åker ut ur appen, för appen har inte lagt något
  i historiken

| Attribut | Svarar på | Dokumentation |
| --- | --- | --- |
| `hx-push-url` | Ska adressen som hämtades hamna i adressfältet och i historiken? | [Referens](https://four.htmx.org/reference/attributes/hx-push-url) |

`hx-push-url="true"` betyder "lägg adressen du hämtade i historiken". Läs den
meningen en gång till, för det är just *den adressen* som hamnar där — inte
sidans nuvarande adress, inte något du skriver.

!!! note "Det här hade inte fungerat före förra övningen"

    Fram till övning 8 hämtade sorteringslänken
    `/todo-app/fragments/table?sort=desc`. Den adressen fungerar — men det som
    kommer tillbaka är en naken tabell utan sida omkring. Att lägga den i
    adressfältet hade gett en kollega en ostylad tabell.

    Nu hämtar länken `/todo-app?sort=desc`, och det är en adress som duger att
    skicka vidare. Att slå ihop de två adresserna tog inte bara bort en route —
    det gjorde historiken användbar.

## Steg

### 1. Lägg till attributet

Öppna `views/todo-app/todo-table.liquid` och lägg `hx-push-url="true"` på
sorteringslänken.

??? example "Facit"

    ```html
    <a class="sort sort--{{ sort }}"
       href="/todo-app?sort={{ next_sort }}{% if q != "" %}&amp;q={{ q | url_encode }}{% endif %}"
       hx-get="/todo-app?sort={{ next_sort }}{% if q != "" %}&amp;q={{ q | url_encode }}{% endif %}"
       hx-target="#todo-table"
       hx-swap="outerHTML"
       hx-push-url="true">
    ```

Sortera. Adressen ändras nu till `/todo-app?sort=desc` utan att sidan laddas om.

### 2. Titta på vad bakåtknappen gör

Det här steget bygger ingenting. Öppna nätverkspanelen, sortera några gånger och
tryck sedan bakåt.

Du ser en request gå iväg — och den är **större** än de som sorteringen gör.
Sorteringen hämtar bara tabellen; bakåtknappen hämtar hela sidan.

!!! note "htmx 4 hämtar om sidan i stället för att komma ihåg den"

    htmx 2 sparade en kopia av sidan i `localStorage` och lade tillbaka den vid
    bakåtnavigering. Det gav en snabb återgång och ett obehagligt fel: kopian
    kunde vara tagen efter att annan JavaScript hunnit ändra i DOM:en, och då
    återställdes något som aldrig hade funnits på servern.

    htmx 4 gör i stället en vanlig request till adressen och sätter in svaret i
    `<body>`. Långsammare, och mycket svårare att få fel. Det är också därför du
    ser hela sidan komma tillbaka i nätverkspanelen.

## Klart när

- [ ] Sortering ändrar adressfältet utan att sidan laddas om.
- [ ] Kopierar du adressen och öppnar den i en ny flik får du samma ordning.
- [ ] Bakåtknappen går tillbaka till föregående sortering i stället för ut ur
      appen, och fungerar flera steg bakåt.
- [ ] Bakåt ger **en** request i nätverkspanelen, och svaret är större än vid
      en sortering.
- [ ] Efter bakåt fungerar sidan fortfarande: lägg till en todo och se att
      räknaren uppdateras utan sidladdning.

## Fungerar det inte?

??? question "Adressen ändras inte"

    Kontrollera att attributet sitter på `<a>`-taggen, tillsammans med de andra
    `hx-`-attributen, och att värdet är `"true"`.

??? question "Bakåtknappen tar mig ut ur appen"

    Då har ingenting lagts i historiken. Har du sorterat efter att du lade till
    attributet? Bara sorteringar som gjorts *efter* det hamnar där.

## Nästa övning

Sortering har adressen tillbaka. Sökrutan har den inte — skriv något i den och
se efter.

Nästa övning tar sökningen hela vägen: den ska söka medan du skriver, skicka med
sorteringen, och lägga sökordet i adressen utan att fylla historiken med ett
steg per tangenttryckning.
