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

## Övningarna

1. [**Installera htmx med en import map**](01-import-map/README.md) — få in htmx
   i appen och bekräfta att det är rätt version.
