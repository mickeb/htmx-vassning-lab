# 5. Uppdatera två ställen med ett svar

## Mål

Räknaren i rubriken stämmer igen direkt när du lägger till en todo.

## Användbara attribut

| Attribut | Svarar på | Dokumentation |
| --- | --- | --- |
| `hx-swap-oob` | Ska det här elementet hamna någon annanstans än där `hx-target` pekar? | [Referens](https://four.htmx.org/reference/attributes/hx-swap-oob) |

Räknaren går inte att laga med `hx-target`. Det attributet pekar ut **ett**
ställe, och svaret behöver på något sätt uppdatera två ställen på sidan.

Återigen låter vi servern bestämma var svaret ska hamna — den här gången varje
del för sig.

`oob` står för *out of band* — vid sidan av. Ett element i svaret som har
`hx-swap-oob="true"` placeras inte där `hx-target` pekar. htmx letar i stället
upp elementet på sidan som har **samma `id`** och ersätter det.

[Mer om out-of-band swaps](https://four.htmx.org/docs#out-of-band-swaps)

## Steg

### 1. Rendera `hx-swap-oob` bara i svar

Öppna `views/todo-app/todo-header.liquid`. `<header>`-taggen har redan
`id="todo-header"`, vilket är det htmx matchar på. Nu ska templaten rendera
`hx-swap-oob="true"` på den, men bara när rubriken skickas som en del av ett
svar.

Samma template renderas nämligen på två ställen: som en del av hela sidan, och som
en del av svaret du bygger i nästa steg. Attributet hör till svaret, inte till
elementet.

??? example "Facit"

    ```liquid
    <header class="todo-header" id="todo-header"{% if oob %} hx-swap-oob="true"{% endif %}>
    ```

    `oob` är inget inbyggt — det är bara ett värde som den som renderar
    template-fragmentet skickar med. Gör ingen det blir villkoret falskt och
    attributet uteblir.

!!! note "Varför inte sätta attributet rakt av?"

    För att det då skulle ligga kvar i sidan som webbläsaren laddar helt vanligt.
    Det gör ingen skada så länge sidan bara laddas — htmx tittar efter
    `hx-swap-oob` i svar som sätts in, inte i sidan som redan ligger där.

    Men en sida kan också *vara* ett svar. Den dagen den är det börjar ett
    `hx-swap-oob` som ligger kvar gälla på ett ställe där ingen bett om det, och
    det som försvinner gör det tyst.

### 2. Skicka med rubriken i svaret

Öppna `views/todo-app/add-response.liquid`. Just nu renderar den bara listan.
Rendera rubriken också, och skicka med `oob: true`.

`stats` finns redan tillgängligt i templaten — hanteraren skickar med det — så du
behöver inte ändra något i `app.ts`.

!!! note "Ordningen spelar ingen roll här"

    Svaret innehåller en `<div>` och en `<header>`, och båda två är giltig HTML
    var som helst. Lägg dem i vilken ordning du vill.

    Det är värt att nämna, för det gäller inte alltid. Nästa övning skickar
    tillbaka ett `<tr>`, och där är ordningen plötsligt inte valfri.

??? example "Facit"

    ```liquid
    {% render 'todo-app/todo-table', todos: todos, q: q, sort: sort %}
    {% render 'todo-app/todo-header', stats: stats, oob: true %}
    ```

## Klart när

- [ ] Räknaren i rubriken ändras direkt när du lägger till en todo.
- [ ] Nätverkspanelen visar **en** request, inte två.
- [ ] Sidan laddas inte om.
- [ ] Det finns fortfarande bara en rubrik på sidan.
- [ ] Sidan du laddar om innehåller ingen `hx-swap-oob` — bara svaren gör det.
      Titta i sidkällan, och i svaret i nätverkspanelen.

## Fungerar det inte?

??? question "Räknaren ändras inte"

    Titta först på svaret i nätverkspanelen. Står det ingen `hx-swap-oob` i
    rubriken där, så saknas `oob: true` i `add-response.liquid`.

    Står den där matchar htmx på `id`: kontrollera att det är exakt
    `todo-header`, och att attributet hamnar på `<header>`-taggen och inte på
    något inuti den. Hittar htmx inget att matcha mot gör den ingenting alls.

## Värt att känna till

!!! note "htmx 4 har också ett nyare sätt"

    `hx-swap-oob` finns i alla versioner av htmx och är det du kommer stöta på
    i handledningar, forumsvar och andra kodbaser. Därför är det det du lär dig
    här.

    htmx 4 lade till `<hx-partial>`, som gör samma sak genom att slå in
    innehållet i ett element som pekar ut sitt eget mål:

    ```html
    <hx-partial hx-target="#todo-header" hx-swap="outerHTML">
      ...rubriken...
    </hx-partial>
    ```

    `hx-target` står utskrivet i stället för att matchas via `id`, och
    `todo-header.liquid` behöver inte ändras alls. Men `hx-swap-oob` är det som
    fungerar överallt.
