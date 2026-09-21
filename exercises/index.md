# Övningar

Labbmiljön serverar en todo-app på [http://localhost:4000/todo-app](http://localhost:4000/todo-app).
Den är en helt vanlig flersidesapp: varje sökning, sortering, bock och formulär
skickar om hela sidan. Övningarna tar bort de sidladdningarna, en i taget.

Du arbetar i **en och samma kodbas** hela vägen. Varje övning börjar där den
förra slutade, så det finns inget att kopiera mellan mappar.

## Innan du börjar

Labbet ska vara igång. Om du inte har startat det än:

```bash
docker compose up
```

Öppna sedan [http://localhost:4000](http://localhost:4000). Därifrån når du
både övningarna och lekplatsen.

!!! tip "Du behöver inte kunna Node"

    Allt som har med Node att göra körs inne i Docker-containern. Du redigerar
    filer i din egen editor och laddar om sidan i webbläsaren — det är hela
    arbetsflödet. Behöver en övning ett terminalkommando utöver
    `docker compose up` är det ett misstag i övningen, inte i din miljö.

## Det labbet redan ger dig

Appen har **två uppsättningar routes över samma data**.

De vanliga — `/todo-app`, och formulären som postar till den — returnerar hela
sidor, precis som webben fungerade innan JavaScript blev inblandat.

Vid sidan av dem ligger en andra uppsättning **routes**, under
`/todo-app/fragments/...`. De
renderar exakt samma templates, men utan sidan runt omkring. De fanns med
redan när du klonade labbet: du ska inte skriva dem, och du behöver inte öppna
någon serverkod för att använda dem.

Det är ett medvetet val. Sessionen handlar om hypermedia och htmx, inte om
routing i Express. Varje övning pekar ut den route den behöver.

Två av dem går att öppna direkt i en flik:

- [`/todo-app/fragments/table`](http://localhost:4000/todo-app/fragments/table)
  — hela listan
- [`/todo-app/fragments/header`](http://localhost:4000/todo-app/fragments/header)
  — räknaren överst

Gör det en gång innan du börjar. Det som kommer tillbaka är **HTML**. Ingen kod
i webbläsaren behöver tolka svaret och bygga element av det — det är en färdig
tabell som kan sättas in rakt av. Det är halva poängen med hela angreppssättet,
och det är lättare att se än att läsa sig till.

Resten svarar bara på `POST` och dyker upp i senare övningar.

## Övningarna

1. [**Installera htmx med en import map**](01-import-map/README.md) — få in htmx
   i appen och bekräfta att det är rätt version.
2. [**Sortera utan sidladdning**](02-sorting/README.md) — tre attribut på en
   länk, och en sidladdning försvinner.
3. [**Lägg till en todo utan sidladdning**](03-adding/README.md) — en `POST`
   som skickar med formuläret, och ett fel som servern placerar själv.
4. [**Ser du buggen?**](04-stale-state/README.md) — ett värde som blivit
   gammalt utan att synas, och ett HTML-attribut som löser det.
5. [**Uppdatera två ställen med ett svar**](05-out-of-band/README.md) — ett svar
   där varje del säger var den hör hemma.
6. [**Bocka av en todo**](06-complete/README.md) — ett mål som beskriver ett
   släktskap i stället för en adress.
7. [**Fyrverkerier när allt är klart**](07-fireworks/README.md) — en HTTP-header
   som säger att något hänt, inte vad sidan ska göra åt det.
8. [**En adress, två svar**](08-one-url/README.md) — servern läser en header och
   svarar olika beroende på vem som frågar.
9. [**Ge tillbaka adressen**](09-url-state/README.md) — ett attribut som lämnar
   tillbaka något webben alltid har haft.
10. [**Sök medan du skriver**](10-search/README.md) — en request innehåller exakt det
    du lägger i den, och det du lägger i den måste renderas om.

Blir det tid över finns [**extrauppgifter**](extra/README.md) — uppgifter utan
ledtrådar och facit — och [**vidare läsning**](reading/README.md) om delar av
htmx 4 som övningarna inte rör vid.
