# Etap 1 — Diagramy Mermaid

## 1. Struktura plików projektu

```mermaid
graph TD
    ROOT[dashboard2/]
    ROOT --> INDEX[index.html]
    ROOT --> CSS[css/]
    ROOT --> JS[js/]
    ROOT --> DOC[doc/]
    CSS --> STYLE[style.css]
    JS --> STORAGE[storage.js]
    JS --> STATE[state.js]
    JS --> MAIN[main.js]
    JS --> PROJECTS[projects.js - etap 2]
    JS --> EMPLOYEES[employees.js - etap 2]
    JS --> CALC[calculations.js - etap 4]
```

## 2. Model danych localStorage

```mermaid
erDiagram
    MONTHLY_DATA {
        string key "YYYY-M"
    }
    MONTH_SNAPSHOT {
        array employees
        array projects
    }
    EMPLOYEE {
        string id
        string name
        string surname
        string dob
        string position
        number salary
        array assignments
        array vacationDays
    }
    ASSIGNMENT {
        string projectId
        number capacity
        number fit
    }
    PROJECT {
        string id
        string projectName
        string companyName
        number budget
        number capacity
    }

    MONTHLY_DATA ||--o{ MONTH_SNAPSHOT : "contains"
    MONTH_SNAPSHOT ||--o{ EMPLOYEE : "has"
    MONTH_SNAPSHOT ||--o{ PROJECT : "has"
    EMPLOYEE ||--o{ ASSIGNMENT : "has"
    ASSIGNMENT }o--|| PROJECT : "references"
```

## 3. Inicjalizacja aplikacji

```mermaid
flowchart TD
    START([Strona załadowana]) --> CHECK{localStorage\nmiesięcznyData?}
    CHECK -- Nie --> INIT[initSampleData]
    CHECK -- Tak --> LOAD[getData]
    INIT --> LOAD
    LOAD --> PERIOD[Ustaw bieżący okres\nmiesiąc + rok]
    PERIOD --> RENDER[Renderuj aktywny widok]
    RENDER --> LISTEN[Podepnij event listenery]
```

## 4. Zmiana okresu (miesiąc/rok)

```mermaid
sequenceDiagram
    participant U as Użytkownik
    participant S as Sidebar
    participant ST as State
    participant DB as Storage
    participant V as View

    U->>S: Zmień miesiąc/rok
    S->>ST: setCurrentPeriod(year, month)
    ST->>DB: getMonthData(year, month)
    DB-->>ST: dane miesiąca
    ST->>V: renderActiveTab()
```

## 5. Seed Data — przepływ

```mermaid
flowchart LR
    BTN[Klik Seed Data] --> POPUP[Popup z listą miesięcy]
    POPUP --> SELECT[Wybierz miesiąc źródłowy]
    SELECT --> CONFIRM{Potwierdź?}
    CONFIRM -- Tak --> COPY[Deep copy danych]
    COPY --> CLEAR[Wyczyść vacationDays]
    CLEAR --> SAVE[Zapisz do bieżącego miesiąca]
    SAVE --> REFRESH[Odśwież tabele]
    CONFIRM -- Nie --> POPUP
```

## 6. Layout aplikacji

```mermaid
graph LR
    APP[#app] --> SIDEBAR[aside#sidebar]
    APP --> MAIN[main#content]
    SIDEBAR --> TOGGLE[btn#sidebar-toggle ☰]
    SIDEBAR --> MONTH[select#month-select]
    SIDEBAR --> YEAR[select#year-select]
    SIDEBAR --> NAV[nav - Projects / Employees]
    SIDEBAR --> SEED[btn#seed-data-btn]
    MAIN --> PV[div#projects-view]
    MAIN --> EV[div#employees-view]
```
