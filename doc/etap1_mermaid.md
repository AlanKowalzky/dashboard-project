# Etap 1 — Diagramy z implementacji

## 1. Struktura plików (rzeczywista po etapie 1)

```mermaid
graph TD
    ROOT[dashboard2/]
    ROOT --> INDEX[index.html]
    ROOT --> CSS[css/style.css]
    ROOT --> JS[js/]
    ROOT --> DOC[doc/]
    JS --> STORAGE[storage.js]
    JS --> STATE[state.js]
    JS --> MAIN[main.js]
    JS --> PROJECTS[projects.js stub]
    JS --> EMPLOYEES[employees.js stub]
```

## 2. Model danych localStorage

```mermaid
erDiagram
    MONTHLY_DATA {
        string key "YYYY-M np. 2026-5"
    }
    MONTH_SNAPSHOT {
        array employees
        array projects
    }
    EMPLOYEE {
        string id "uid 16 znaków"
        string name
        string surname
        string dob "YYYY-MM-DD"
        string position "Junior Middle Senior Lead Architect BO"
        number salary
        array assignments
        array vacationDays "numery dni 1-31"
    }
    ASSIGNMENT {
        string projectId
        number capacity "0.0-1.5"
        number fit "0.0-1.0"
    }
    PROJECT {
        string id "uid 16 znaków"
        string projectName
        string companyName
        number budget
        number capacity "integer >= 1"
    }

    MONTHLY_DATA ||--o{ MONTH_SNAPSHOT : "klucz YYYY-M"
    MONTH_SNAPSHOT ||--o{ EMPLOYEE : "employees array"
    MONTH_SNAPSHOT ||--o{ PROJECT : "projects array"
    EMPLOYEE ||--o{ ASSIGNMENT : "assignments array"
    ASSIGNMENT }o--|| PROJECT : "projectId ref"
```

## 3. DOMContentLoaded — sekwencja inicjalizacji

```mermaid
sequenceDiagram
    participant DOM as DOMContentLoaded
    participant S as storage.js
    participant ST as state.js
    participant M as main.js

    DOM->>S: initSampleData
    S->>S: getData — czy localStorage pusty?
    alt pusty
        S->>S: utwórz pid1 pid2 pid3 = uid()
        S->>S: sample 5 emp 3 proj
        S->>S: saveMonthData now.getFullYear now.getMonth
    end
    DOM->>M: initPeriodSelectors
    M->>ST: monthSel.value = state.currentMonth
    M->>ST: yearSel.value = state.currentYear
    DOM->>M: initSidebarToggle
    DOM->>M: initTabNav → active class na projects
    DOM->>M: initSeedData → addEventListener seed-data-btn
    DOM->>M: initAddProjectPanel etap2
    DOM->>M: initAddEmployeePanel etap2
    DOM->>M: initTableHeaders etap4
    DOM->>M: renderActiveView
```

## 4. Seed Data — szczegółowy przepływ

```mermaid
flowchart TD
    BTN[klik seed-data-btn] --> GETDATA[getData z localStorage]
    GETDATA --> CURRENTKEY[currentKey = year-month]
    CURRENTKEY --> FILTER[Object.keys data\nfilter k != currentKey]
    FILTER --> EMPTY{months.length == 0?}
    EMPTY -- Tak --> NOMSG[popup: No other months\navailable]
    EMPTY -- Nie --> ROWS[months.map key\ny m = key.split -\nd = data key\ntr: monthName m y\nd.projects.length\nd.employees.length\nbtn-seed data-year data-month]
    ROWS --> POPUP[overlay innerHTML\ntabela miesięcy]
    POPUP --> SEEDBTN[klik btn-seed]
    SEEDBTN --> CONFIRM{confirm\nCopy from X to Y?}
    CONFIRM -- Anuluj --> POPUP
    CONFIRM -- OK --> DEEPCOPY[seedData fy fm toYear toMonth\nJSON.parse JSON.stringify source\nforEach emp vacationDays = array]
    DEEPCOPY --> SAVE[saveMonthData toYear toMonth copy]
    SAVE --> CLOSE[overlay.remove]
    CLOSE --> REFRESH[renderActiveView]
```

## 5. Sidebar toggle

```mermaid
stateDiagram-v2
    [*] --> Expanded : domyślny\nwidth 220px
    Expanded --> Collapsed : klik ☰\nclassList.toggle collapsed\nbtn.textContent = →\nCSS width 42px opacity 0
    Collapsed --> Expanded : klik →\nclassList.toggle collapsed\nbtn.textContent = ☰\nCSS width 220px opacity 1
```

## 6. uid() — generator

```mermaid
flowchart LR
    R1[Math.random\n.toString 36\n.slice 2 10\n8 znaków] --> CONCAT[konkatenacja +]
    R2[Math.random\n.toString 36\n.slice 2 10\n8 znaków] --> CONCAT
    CONCAT --> ID[string 16 znaków\nnp. k3x9mz1qab7f2n4p]
```

## 7. renderActiveView

```mermaid
flowchart LR
    CALL[renderActiveView] --> TAB{state.activeTab}
    TAB -- projects --> SHOW_P[projects-view hidden=false\nemployees-view hidden=true\nrenderProjectsTable]
    TAB -- employees --> SHOW_E[projects-view hidden=true\nemployees-view hidden=false\nrenderEmployeesTable]
```
