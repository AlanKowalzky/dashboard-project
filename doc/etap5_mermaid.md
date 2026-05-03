# Etap 5 — Diagramy Mermaid

## 1. Cykl sortowania kolumny

```mermaid
stateDiagram-v2
    [*] --> Unsorted: ikona ⇅
    Unsorted --> Ascending: klik → ikona ↑
    Ascending --> Descending: klik → ikona ↓
    Descending --> Unsorted: klik → ikona ⇅
```

## 2. Przepływ filtrowania

```mermaid
flowchart TD
    ICON[Klik ikony ⌕] --> POPUP[Otwórz popup filtra]
    POPUP --> TYPE{Typ kolumny}
    TYPE -- tekst --> INPUT[input type=text]
    TYPE -- Position --> DROPDOWN[select z opcjami]
    INPUT --> APPLY[Apply / Enter]
    DROPDOWN --> AUTO[Auto-apply]
    APPLY --> SAVE[Zapisz filtr w filterState]
    AUTO --> SAVE
    SAVE --> CHIP[Dodaj filter chip]
    SAVE --> FILTER[Filtruj dane]
    FILTER --> RENDER[Odśwież tabelę]
    POPUP --> CANCEL[Cancel]
    CANCEL --> CLOSE[Zamknij bez zmian]
```

## 3. Filter Chips — zarządzanie

```mermaid
flowchart LR
    FILTERS[filterState\n{col: val, ...}] --> COUNT{Ile filtrów?}
    COUNT -- 1 --> CHIP1[1 chip: Col: val ×]
    COUNT -- 2+ --> CHIPS[N chipów + Clear Filters ×]
    CHIP1 --> REMOVE1[× → usuń filtr]
    CHIPS --> REMOVEX[× na chipie → usuń ten filtr]
    CHIPS --> CLEARALL[Clear Filters → usuń wszystkie]
    REMOVE1 --> RERENDER[Odśwież tabelę]
    REMOVEX --> RERENDER
    CLEARALL --> RERENDER
```

## 4. Nawigacja "See at" — przepływ

```mermaid
sequenceDiagram
    participant U as Użytkownik
    participant PM as Popup
    participant ST as State
    participant FT as FilterState
    participant V as View

    U->>PM: Klik "See at Employees"
    PM->>PM: Zamknij popup
    PM->>ST: setActiveTab("employees")
    PM->>FT: clearFilters()
    PM->>FT: setFilter("name", "Jan")
    PM->>FT: setFilter("surname", "Kowalski")
    FT->>V: renderEmployeesTable()
    V-->>U: Tabela pracowników z filtrem
```

## 5. Pełny przepływ danych — od zmiany do renderowania

```mermaid
flowchart TD
    CHANGE[Zmiana danych\nlub okresu] --> LOAD[Załaduj dane miesiąca]
    LOAD --> FILTER[Zastosuj filtry]
    FILTER --> SORT[Zastosuj sortowanie]
    SORT --> CALC[Oblicz metryki finansowe]
    CALC --> RENDER[Renderuj tabelę]
    RENDER --> CHIPS[Renderuj filter chips]
    RENDER --> TOTAL[Renderuj Total Estimated Income]
```

## 6. Architektura modułów — finalna

```mermaid
graph TD
    MAIN[main.js\nBootstrap + event listenery] --> STATE[state.js\nGlobalny stan]
    MAIN --> STORAGE[storage.js\nlocalStorage]
    MAIN --> PROJECTS[projects.js\nTabela projektów]
    MAIN --> EMPLOYEES[employees.js\nTabela pracowników]
    PROJECTS --> CALC[calculations.js\nFormuły finansowe]
    EMPLOYEES --> CALC
    PROJECTS --> SORT[sort.js]
    EMPLOYEES --> SORT
    PROJECTS --> FILTER[filter.js]
    EMPLOYEES --> FILTER
    EMPLOYEES --> ASSIGN[assign.js\nPopup przypisania]
    EMPLOYEES --> CALENDAR[calendar.js\nKalendarz urlopowy]
    PROJECTS --> POPUPS[popups.js\nShow Employees/Assignments]
    EMPLOYEES --> POPUPS
    ASSIGN --> CALC
    CALENDAR --> CALC
    POPUPS --> CALC
    STATE --> STORAGE
```

## 7. Sidebar — stany

```mermaid
stateDiagram-v2
    [*] --> Expanded: domyślny stan
    Expanded --> Collapsed: klik ☰
    Collapsed --> Expanded: klik →
    Expanded --> Expanded: zmiana zakładki
    Expanded --> Expanded: zmiana miesiąca/roku
```

## 8. Deployment — kroki

```mermaid
flowchart LR
    CODE[Kod lokalny] --> COMMIT[git commit]
    COMMIT --> PUSH[git push origin main]
    PUSH --> PAGES[GitHub Pages\nauto-deploy]
    PAGES --> URL[https://user.github.io/dashboard2]
```
