# Bugfix — Diagramy diagnostyczne i poprawki

## BUG 1 — Panele Add Project / Add Employee nie otwierają się

### Diagnoza

```mermaid
flowchart TD
    SYMPTOM[Panel nie otwiera się\npo kliknięciu + Add Project] --> CHECK1[Sprawdź składnię JS\nnode --check wszystkie pliki]
    CHECK1 --> OK1[Brak błędów składniowych]
    OK1 --> CHECK2[Sprawdź CSS\nslide-panel]
    CHECK2 --> FOUND1[slide-panel ma\ntransform translateX 100%\ni display flex]
    FOUND1 --> CHECK3[Sprawdź czy hidden attribute\njest obsługiwany przez CSS]
    CHECK3 --> ROOT1[PROBLEM:\nbrak reguły hidden display none\nw CSS reset]
    ROOT1 --> FIX1[Dodaj do CSS reset:\nhidden display none important]
```

### Przyczyna

```mermaid
flowchart LR
    HTML[slide-panel hidden\nw HTML] --> BROWSER[Przeglądarka:\nhidden = display none\ndomyślnie w HTML5]
    BROWSER --> CSS_RESET[Ale CSS reset\n* margin 0 padding 0\nnadpisuje user-agent stylesheet]
    CSS_RESET --> BROKEN[hidden przestaje działać\npanel widoczny ale\npoza ekranem translateX 100%]
    BROKEN --> PANEL_OVERLAY[panel-overlay też\nnie chowa się\npo closePanel]
```

### Naprawa

```mermaid
flowchart LR
    BEFORE[CSS reset\n tylko margin padding] --> AFTER[CSS reset\n+ hidden display none important]
    AFTER --> RESULT[hidden attribute\ndziała poprawnie\nwe wszystkich elementach:\nslide-panel\npanel-overlay\nprojects-view\nemployees-view]
```

---

## BUG 2 — Seed Data nie działa / pokazuje błędne income

### Diagnoza

```mermaid
flowchart TD
    SYMPTOM[Seed popup\nnie otwiera się\nlub pokazuje błędne income] --> CHECK1[calcTotalIncome\nwywołuje calcProjectSummaryFull]
    CHECK1 --> CHECK2[calcProjectSummaryFull\nużywa state.currentYear\nstate.currentMonth]
    CHECK2 --> CHECK3[Seed popup iteruje\npo INNYCH miesiącach\nniż bieżący state]
    CHECK3 --> ROOT2[PROBLEM:\nvacationCoefficient obliczany\ndla złego roku i miesiąca\nnp. dane z 2026-0\nale state = 2026-5]
    ROOT2 --> CRASH[Jeśli d.employees\nma vacationDays = undefined\ngetVacationCoefficient\nrzuca TypeError]
```

### Przyczyna — dwa problemy naraz

```mermaid
flowchart TD
    P1[Problem 1\nstate.currentYear Month\nnie odpowiada kluczowi\niterowanego miesiąca] --> WRONG_COEF[vacationCoefficient\nobliczany dla złego miesiąca\nwartości income niepoprawne]

    P2[Problem 2\nd.employees z localStorage\nmogą mieć vacationDays = undefined\njeśli dane starsze] --> CRASH[TypeError:\nCannot read properties\nof undefined includes]
```

### Naprawa — dwie poprawki

```mermaid
flowchart TD
    FIX_A[Poprawka A — state swap\nopenSeedPopup per miesiąc:\nsavedYear = state.currentYear\nsavedMonth = state.currentMonth\nstate.currentYear = y\nstate.currentMonth = m\ntotal = calcTotalIncome\nstate.currentYear = savedYear\nstate.currentMonth = savedMonth] --> CORRECT[income obliczony\ndla właściwego okresu]

    FIX_B[Poprawka B — null guard\ncalcProjectSummaryFull:\ne.vacationDays OR array\nzamiast e.vacationDays] --> SAFE[brak crash\ngdy vacationDays undefined]
```

---

## BUG 3 — td.actions psuje layout tabeli

### Diagnoza

```mermaid
flowchart TD
    SYMPTOM[Kolumna Actions\nma dziwny layout\nlub wiersze tabeli\nsą różnej wysokości] --> CHECK[td.actions\nma display flex]
    CHECK --> ROOT3[PROBLEM:\ntd jako flex container\nw niektórych przeglądarkach\npsuje model tabeli\ntr height obliczany błędnie]
```

### Naprawa

```mermaid
flowchart LR
    BEFORE[td.actions\ndisplay flex\ngap 4px\nalign-items center] --> AFTER[td.actions\nwhite-space nowrap\nbutton margin-right 2px]
    AFTER --> RESULT[Przyciski w jednej linii\nbez flex na td\nlayout tabeli poprawny]
```

---

## BUG 4 — Ikony sortowania resetują się po re-renderze

### Diagnoza

```mermaid
flowchart TD
    SYMPTOM[Kliknięcie sort icon\nposortuje tabelę\nale ikona wraca do\ndomyślnego stanu po\nzmianie filtra lub okresu] --> CHECK[renderActiveView\nwywołuje renderProjectsTable\nktóra nadpisuje innerHTML tbody]
    CHECK --> ROOT4[PROBLEM:\ninitTableHeaders dodaje\nlistenery raz przy starcie\nale ikony są w thead\nktóry NIE jest nadpisywany\nwięc listenery działają\nALE ikona textContent\ni klasa active nie są\nprzywracane po re-renderze]
```

### Naprawa — restoreSortIcons

```mermaid
flowchart TD
    FIX[Dodaj restoreSortIcons\ndo renderActiveView] --> LOOP[forEach projects-table\ni employees-table]
    LOOP --> RESET[querySelectorAll sort-icon\nclassList.remove active\ntextContent = ⇅]
    RESET --> CHECK{st.column\ni st.direction\nistnieją?}
    CHECK -- Tak --> RESTORE[querySelector\ndata-col = st.column\nclassList.add active\ntextContent = ↑ lub ↓]
    CHECK -- Nie --> DONE[ikony w stanie domyślnym]
    RESTORE --> DONE
```

---

## Podsumowanie — mapa wszystkich bugów i poprawek

```mermaid
flowchart TD
    subgraph BUGS [Znalezione błędy]
        B1[BUG 1\nPanele nie otwierają się\nCSS reset usuwa hidden]
        B2[BUG 2\nSeed Data crash\nzły state + undefined vacationDays]
        B3[BUG 3\ntd.actions display flex\npsuje tabelę]
        B4[BUG 4\nIkony sort resetują się\npo re-renderze]
    end

    subgraph FIXES [Poprawki]
        F1[css/style.css\nhidden display none important\ntd.actions white-space nowrap]
        F2[js/main.js\nstate swap w seed popup]
        F3[js/calculations.js\ne.vacationDays OR array]
        F4[js/main.js\nrestoreSortIcons\nw renderActiveView]
    end

    B1 --> F1
    B3 --> F1
    B2 --> F2
    B2 --> F3
    B4 --> F4
```
