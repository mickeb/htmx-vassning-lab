# Övningar

Labbmiljön serverar en todo-app på [http://localhost:4000/todo-app](http://localhost:4000/todo-app).
Den är en helt vanlig flersidesapp: varje sökning, sortering, bock och formulär
skickar om hela sidan. Övningarna tar bort de sidladdningarna, en i taget.

Du arbetar i **en och samma kodbas** hela vägen. Varje övning börjar där den
förra slutade, så det finns inget att kopiera mellan mappar.

## Innan du börjar

Labbet ska vara igång. Om du inte har startat det än:

```bash
./setup.sh
```

Öppna sedan [http://localhost:4000](http://localhost:4000). Sidan är en
självkontroll med fyra indikatorer — server, stilmall, JavaScript och hot
reload. Alla fyra ska vara gröna innan du går vidare.

!!! tip "Du behöver inte kunna Node"

    Allt som har med Node att göra körs inne i Docker-containern. Du redigerar
    filer i din egen editor och laddar om sidan i webbläsaren — det är hela
    arbetsflödet. Behöver en övning ett terminalkommando utöver `./setup.sh` är
    det ett misstag i övningen, inte i din miljö.

## Det labbet redan ger dig

Appen har **två uppsättningar rutter över samma data**.

De vanliga — `/todo-app`, och formulären som postar till den — returnerar hela
sidor, precis som webben fungerade innan JavaScript blev inblandat.

Vid sidan av dem ligger **fragmentrutter** under `/todo-app/fragments/...`. De
renderar exakt samma Liquid-mallar, men utan sidan runt omkring. De fanns med
redan när du klonade labbet: du ska inte skriva dem, och du behöver inte öppna
någon serverkod för att använda dem.

Det är ett medvetet val. Sessionen handlar om hypermedia och htmx, inte om
routing i Express. Varje övning pekar ut den rutt den behöver.

Två av dem går att öppna direkt i en flik:

- [`/todo-app/fragments/table`](http://localhost:4000/todo-app/fragments/table)
  — hela listan
- [`/todo-app/fragments/header`](http://localhost:4000/todo-app/fragments/header)
  — räknaren överst

Gör det en gång innan du börjar. Det som kommer tillbaka är **HTML**, inte JSON
— en bit färdig tabell, inte data att bygga ihop något av på klienten. Det är
halva poängen med hela angreppssättet, och det är lättare att se än att läsa sig
till.

Resten av fragmentrutterna svarar bara på `POST` och dyker upp i senare övningar.

## Övningarna

1. [**Installera htmx med en import map**](01-import-map/README.md) — få in htmx
   i appen och bekräfta att det är rätt version.
2. [**Sortera utan sidladdning**](02-sorting/README.md) — tre attribut på en
   länk, och en sidladdning försvinner.
