# Extrauppgifter

Nedan hittar du ett par föreslagna extrauppgifter. Du avgör själv vad som är
en rimlig lösning och när den är klar.

Presentera gärna din lösning för kollegorna i samband med vässningens
avslutande del.

## 1. Boosta i stället

Labbet börjar som en vanlig flersidesapp: varje länk och varje formulär ger en
sidladdning. `hx-boost` låter htmx ta över dem utan att något attribut sätts på
länkarna och formulären själva.

Backa appen till sitt ursprungliga skick först — som den såg ut innan övning 1 —
och experimentera sedan med `hx-boost` och `hx-select`.

## 2. Släck den röda ramen

Skickar du formuläret med tomt textfält får fältet en röd ram. Den ligger kvar
efteråt — formuläret renderas aldrig om, så varken det du skriver eller ett
lyckat tillägg tar bort den.

Få ramen att försvinna så fort det står något i fältet. Använd `hx-live`, som
beskrivs under [Vidare läsning](../reading/README.md).
