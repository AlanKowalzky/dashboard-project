# Etap 1 — Architektura, Dane, Układ

## Cel
Działająca aplikacja z localStorage, nawigacją sidebar i podstawowym layoutem bez logiki biznesowej.

## Pliki do stworzenia

| Plik | Odpowiedzialność |
|------|-----------------|
| `index.html` | Szkielet HTML, sidebar, zakładki, obszar treści |
| `css/style.css` | Layout, sidebar, kolory, typografia |
| `js/storage.js` | Zapis/odczyt localStorage, inicjalizacja danych |
| `js/state.js` | Globalny stan: currentPeriod, activeTab |
| `js/main.js` | Bootstrap aplikacji, event listenery globalne |

## Model danych

```json
{
  "monthlyData": {
    "2026-0": {
      "employees": [
        {
          "id": "uuid",
          "name": "Jan",
          "surname": "Kowalski",
          "dob": "1990-05-15",
          "position": "Senior",
          "salary": 8000,
          "assignments": [
            { "projectId": "uuid", "capacity": 0.8, "fit": 0.9 }
          ],
          "vacationDays": [3, 4, 5]
        }
      ],
      "projects": [
        {
          "id": "uuid",
          "projectName": "Alpha",
          "companyName": "Acme",
          "budget": 50000,
          "capacity": 3
        }
      ]
    }
  }
}
```

## Funkcje storage.js

- `getData()` → odczyt z localStorage
- `saveData(data)` → zapis do localStorage
- `getMonthData(year, month)` → dane dla okresu
- `saveMonthData(year, month, data)` → zapis okresu
- `initSampleData()` → dane przykładowe przy pierwszym uruchomieniu
- `seedData(fromYear, fromMonth, toYear, toMonth)` → kopiowanie miesiąca

## Funkcje state.js

- `state.currentYear`, `state.currentMonth` — bieżący okres
- `state.activeTab` — "projects" | "employees"
- `setCurrentPeriod(year, month)` — zmiana okresu
- `setActiveTab(tab)` — zmiana zakładki

## Layout HTML (struktura)

```
<body>
  <div id="app">
    <aside id="sidebar">
      <button id="sidebar-toggle">☰</button>
      <select id="month-select">...</select>
      <select id="year-select">...</select>
      <nav>
        <button data-tab="projects">Projects</button>
        <button data-tab="employees">Employees</button>
      </nav>
      <button id="seed-data-btn">Seed Data</button>
    </aside>
    <main id="content">
      <div id="projects-view">...</div>
      <div id="employees-view" hidden>...</div>
    </main>
  </div>
</body>
```

## Seed Data — logika

1. Klik "Seed Data" → popup z listą miesięcy (z danymi, bez bieżącego)
2. Każdy wiersz: rok, miesiąc, liczba projektów, liczba pracowników, total income
3. Klik "Seed" → confirm → deep copy danych → wyczyść vacationDays → zapisz → odśwież

## Kryteria zaliczenia etapu 1

- [ ] Dane zapisują się i ładują po odświeżeniu
- [ ] Zmiana miesiąca/roku ładuje właściwe dane
- [ ] Sidebar zwija się i rozwija
- [ ] Zakładki przełączają widok
- [ ] Seed Data kopiuje dane i czyści urlopy
