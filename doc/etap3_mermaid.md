# Etap 3 — Diagramy Mermaid

## 1. Przepływ przypisania pracownika do projektu

```mermaid
flowchart TD
    BTN[Klik Assign] --> CHECK{capacity\n≥ 1.5?}
    CHECK -- Tak --> DISABLED[Przycisk disabled]
    CHECK -- Nie --> POPUP[Otwórz Assign Popup]
    POPUP --> SELECT[Wybierz projekt]
    POPUP --> SLIDER1[Ustaw capacity 0.0-1.5]
    POPUP --> SLIDER2[Ustaw fit 0.0-1.0]
    SLIDER1 --> CALC[Oblicz effectiveCapacity\n= cap × fit]
    SLIDER2 --> CALC
    CALC --> WARN{Projekt\nover-capacity?}
    WARN -- Tak --> WARNING[Pokaż ostrzeżenie\nnie blokuj]
    WARN -- Nie --> OK[OK]
    WARNING --> SAVE[Klik Assign → Zapisz]
    OK --> SAVE
    SAVE --> REFRESH[Odśwież tabele]
    SAVE --> CLOSE[Zamknij popup]
```

## 2. Pozycjonowanie Assign Popup

```mermaid
sequenceDiagram
    participant U as Użytkownik
    participant B as Przycisk
    participant P as Popup
    participant W as Window

    U->>B: Klik Assign
    B->>P: getBoundingClientRect()
    P->>P: Oblicz pozycję (top, left)
    P->>P: Korekta do viewport
    P-->>U: Wyświetl popup
    W->>P: scroll event → reposition()
    W->>P: resize event → reposition()
    U->>P: Klik poza / Cancel
    P->>W: removeEventListener scroll
    P->>W: removeEventListener resize
    P-->>U: Zamknij popup
```

## 3. Popup Show Employees — struktura

```mermaid
graph TD
    OVERLAY[div.backdrop] --> POPUP[div.popup]
    POPUP --> HEADER[h2 Pracownicy projektu X]
    POPUP --> CLOSE[button ×]
    POPUP --> TABLE[table]
    TABLE --> THEAD[Name | Cap | Fit | Vac | EffCap | Rev | Cost | Profit | Actions]
    TABLE --> TBODY[tr × N pracowników]
    TBODY --> LINK[a.employee-link → action menu]
    TBODY --> EDIT[btn Edit]
    TBODY --> UNASSIGN[btn Unassign]
```

## 4. Action Menu — przepływ

```mermaid
flowchart LR
    LINK[Klik link pracownika/projektu] --> MENU[Pokaż action menu]
    MENU --> SEE[See at Projects/Employees]
    MENU --> UNASSIGN[Unassign]
    SEE --> SWITCH[Zmień zakładkę]
    SWITCH --> FILTER[Zastosuj filtr]
    FILTER --> CLOSE_POPUP[Zamknij popup]
    UNASSIGN --> CONFIRM[Popup potwierdzenia]
```

## 5. Unassign — szczegóły finansowe

```mermaid
flowchart TD
    OPEN[Otwórz Unassign Confirm] --> SHOW[Pokaż szczegóły]
    SHOW --> D1[Pracownik + Projekt]
    SHOW --> D2[Assigned Capacity]
    SHOW --> D3[Salary Share = salary × capacity]
    SHOW --> D4[Budget Share = proporcjonalny]
    SHOW --> D5[Employee Income = profit]
    SHOW --> D6[Project Capacity before/after]
    SHOW --> D7[Project Income before/after]
    D1 & D2 & D3 & D4 & D5 & D6 & D7 --> BUTTONS[Confirm / Cancel]
    BUTTONS -- Confirm --> REMOVE[Usuń assignment]
    REMOVE --> REFRESH[Odśwież tabele + popupy]
```

## 6. Kalendarz urlopowy — stany dnia

```mermaid
stateDiagram-v2
    [*] --> Normal: dzień roboczy
    [*] --> Weekend: sobota/niedziela
    Normal --> Vacation: klik
    Vacation --> Normal: klik (toggle)
    Weekend --> WeekendVacation: klik
    WeekendVacation --> Weekend: klik
    Normal --> Today: bieżący dzień
    Today --> TodayVacation: klik
    TodayVacation --> Today: klik
```

## 7. Obliczanie i formatowanie zakresów urlopowych

```mermaid
flowchart TD
    DAYS[Lista dni urlopowych\nnp. 3,4,5,10,15,16,17] --> SORT[Sortuj rosnąco]
    SORT --> GROUP[Grupuj w zakresy\nkonsekutywne + weekendy między]
    GROUP --> FORMAT[Formatuj każdy zakres]
    FORMAT --> SINGLE{Jeden dzień?}
    SINGLE -- Tak --> DD_MM[DD.MM]
    SINGLE -- Nie --> RANGE[DD.MM-DD.MM]
    DD_MM & RANGE --> JOIN[Połącz przecinkami]
    JOIN --> DISPLAY[Wyświetl w kalendarzu]
```

## 8. Set Vacation — efekt kaskadowy

```mermaid
sequenceDiagram
    participant U as Użytkownik
    participant C as Kalendarz
    participant DB as Storage
    participant CALC as Calculations
    participant PT as Projects Table
    participant ET as Employees Table

    U->>C: Klik Set Vacation
    C->>DB: Zapisz vacationDays pracownika
    DB->>CALC: Przelicz vacationCoefficient
    CALC->>CALC: Przelicz effectiveCapacity
    CALC->>CALC: Przelicz revenue, cost, profit
    CALC->>PT: Odśwież tabelę projektów
    CALC->>ET: Odśwież tabelę pracowników
    C-->>U: Zamknij popup
```
