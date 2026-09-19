# 4. Uppdatera två ställen med ett svar

## Mål

Räknaren i rubriken stämmer igen direkt när du lägger till en todo — utan en
extra förfrågan.

## Bakgrund

Förra övningen lämnade något trasigt. Du lade till en rad, men rubriken högst
upp renderades aldrig om, så den räknar fortfarande som om den nya todon inte
fanns.

Det går inte att lösa med `hx-target`. Det attributet pekar ut **ett** ställe,
och svaret behöver hamna på två.

Lösningen vänder på frågan. I stället för att förfrågan bestämmer var allt ska
hamna får en del av **svaret** säga var just den hör hemma.

| Attribut | Svarar på | Dokumentation |
| --- | --- | --- |
| `hx-swap-oob` | Ska det här elementet hamna någon annanstans än i målet? | [Referens](https://four.htmx.org/reference/attributes/hx-swap-oob) |

`oob` står för *out of band* — vid sidan av. Ett element i svaret som är märkt
`hx-swap-oob="true"` placeras inte där bytet skulle ha lagt det. htmx letar upp
elementet på sidan som har **samma `id`** och ersätter det.

## Steg

### 1. Märk rubriken

Öppna `views/todo-app/todo-header.liquid`. `<header>`-taggen har redan
`id="todo-header"`, vilket är det htmx matchar på. Lägg till attributet.

??? example "Facit"

    ```html
    <header class="todo-header" id="todo-header" hx-swap-oob="true">
    ```

!!! note "Attributet stör inte den vanliga sidan"

    Rubriken renderas också som en del av hela sidan, och där sitter attributet
    nu också. Det gör ingenting: htmx tittar bara efter `hx-swap-oob` i svar som
    byts in, aldrig i sidan som laddades från början.

### 2. Skicka med rubriken i svaret

Öppna `views/todo-app/add-response.liquid`. Just nu renderar den bara den nya
raden. Rendera rubriken också, **efter** raden.

`stats` finns redan tillgängligt i mallen — hanteraren skickar med det — så du
behöver inte ändra något i `app.ts`.

!!! warning "Ordningen är inte valfri: raden måste komma först"

    Svaret innehåller ett `<tr>` och en `<header>`. Lägger du rubriken först
    försvinner raden — och den försvinner **tyst**.

    Det är inte htmx som är kinkig, utan webbläsarens HTML-tolk. Ett `<tr>` som
    inte står i ett tabellsammanhang är ogiltigt, så tolken kastar taggarna och
    behåller texten. Det som hamnar i listan blir en lös textsnutt:
    `2026-09-19 16:27:38 Köp mjölk`. Inget felmeddelande, ingenting i konsolen.

    htmx plockar ut out-of-band-elementen ur svaret innan det byts in — men då
    är raden redan förstörd, ett steg tidigare.

??? example "Facit"

    ```liquid
    {% render 'todo-app/todo-row', todo: todo, q: q, sort: sort %}
    {% render 'todo-app/todo-header', stats: stats %}
    ```

## Klart när

- [ ] Räknaren i rubriken ändras direkt när du lägger till en todo.
- [ ] Nätverkspanelen visar **en** förfrågan, inte två.
- [ ] Sidan laddas inte om.
- [ ] Det finns fortfarande bara en rubrik på sidan.

??? question "Raden försvann, och det står lös text i listan"

    Rubriken ligger före raden i `add-response.liquid`. Byt plats på dem.

??? question "Räknaren ändras inte"

    Kontrollera att `id` på `<header>` är exakt `todo-header` och att attributet
    står på `<header>`-taggen, inte på något inuti den. htmx matchar på `id` och
    gör ingenting alls om den inte hittar något.

## Det som faktiskt hände

Ett svar. En förfrågan. Två ställen på sidan uppdaterade.

Det är värt att stanna vid, för det är inte så det brukar se ut. Det vanliga är
att klienten vet att "när en todo läggs till måste räknaren också uppdateras" —
antingen genom en andra förfrågan, eller genom kod som räknar om siffran själv.
Båda kräver att klienten känner till sambandet.

Här gör den inte det. Servern fick frågan "lägg till den här todon" och svarade
med **allt som ändrades av det**, där varje del bär med sig var den hör hemma.
Ingen kod på sidan vet att en ny todo påverkar en räknare. Om rubriken en dag
visar något annat, eller om det tillkommer fler delar som ändras, är det ett
serverbeslut och sidan behöver inte röras.

Samma idé som i övning 2, från andra hållet: där skickade servern en korrekt
representation, här skickar den flera på en gång.

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

    Två fördelar: målet står utskrivet i stället för att matchas via `id`, och
    `todo-header.liquid` behöver inte ändras alls. Ordningen i svaret spelar
    ingen roll heller. Värt att känna till — men `hx-swap-oob` är det som
    fungerar överallt.
