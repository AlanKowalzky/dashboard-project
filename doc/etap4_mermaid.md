# Etap 4 — Diagramy Mermaid

## 1. Mapa wszystkich obliczeń finansowych

```mermaid
flowchart TD
    VAC[vacationDays] --> VACCOEF[vacationCoefficient\n= workingDays - vacWorkDays / workingDays]
    ASGN_CAP[assignedCapacity] --> EFFCAP[effectiveCapacity\n= cap × fit × vacCoef]
    FIT[fit] --> EFFCAP
    VACCOEF --> EFFCAP

    EFFCAP --> USEDCAP[usedEffectiveCapacity\n= Σ effectiveCapacity]
    PROJECT_CAP[projectCapacity] --> CAPREV[capacityForRevenue\n= max projectCap, usedEffCap]
    USEDCAP --> CAPREV
    BUDGET[budget] --> REVUNIT[revenuePerUnit\n= budget / capacityForRevenue]
    CAPREV --> REVUNIT
    REVUNIT --> EMPREV[employeeRevenue\n= revenuePerUnit × effectiveCap]
    EFFCAP --> EMPREV

    SALARY[salary] --> EMPCOST[employeeCost\n= salary × max 0.5, capacity]
    ASGN_CAP --> EMPCOST

    EMPREV --> PROFIT[profit\n= revenue - cost]
    EMPCOST --> PROFIT

    PROFIT --> PROJPROFIT[projectProfit\n= Σ revenue - Σ cost]
    PROFIT --> EMPPROFIT[employeeProjectedIncome\n= Σ profits]
```

## 2. Vacation Coefficient — obliczanie

```mermaid
flowchart LR
    MONTH[Miesiąc + Rok] --> ALLDAYS[Wszystkie dni miesiąca]
    ALLDAYS --> WORKDAYS[Dni robocze\ngetDay != 0 i != 6]
    WORKDAYS --> COUNT_W[workingDays = N]
    VAC[vacationDays array] --> FILTER[Filtruj: tylko dni robocze]
    FILTER --> COUNT_V[vacWorkingDays = M]
    COUNT_W --> COEF[vacCoef = N-M / N]
    COUNT_V --> COEF
```

## 3. Revenue — przepływ obliczeń dla projektu

```mermaid
sequenceDiagram
    participant P as Projekt
    participant E as Pracownicy
    participant C as Calculations

    P->>C: getProjectRevenue(project, employees)
    loop każdy pracownik przypisany do projektu
        C->>E: pobierz assignment (capacity, fit)
        C->>C: vacCoef = getVacationCoefficient()
        C->>C: effCap = capacity × fit × vacCoef
        C->>C: usedEffCap += effCap
    end
    C->>C: capForRevenue = max(project.capacity, usedEffCap)
    C->>C: revenuePerUnit = budget / capForRevenue
    C->>C: totalRevenue = revenuePerUnit × usedEffCap
    C-->>P: { usedEffCap, revenuePerUnit, totalRevenue }
```

## 4. Total Estimated Income — składowe

```mermaid
flowchart TD
    PROJECTS[Wszystkie projekty] --> PROJ_INCOME[Σ project incomes\ntotalRevenue - totalCost]
    EMPLOYEES[Wszyscy pracownicy] --> UNASSIGNED[Nieprzypisani pracownicy]
    UNASSIGNED --> BENCH[Σ bench costs\nsalary × 0.5]
    PROJ_INCOME --> TOTAL[Total Estimated Income\n= Σ project incomes - Σ bench costs]
    BENCH --> TOTAL
    TOTAL --> COLOR{wartość}
    COLOR -- > 0 --> GREEN[zielony]
    COLOR -- < 0 --> RED[czerwony]
```

## 5. Kolorowanie wartości — logika

```mermaid
flowchart LR
    VALUE[wartość liczbowa] --> CHECK{porównaj z 0}
    CHECK -- > 0 --> POS[klasa .positive\nkolor zielony]
    CHECK -- < 0 --> NEG[klasa .negative\nkolor czerwony]
    CHECK -- = 0 --> NEUTRAL[brak klasy\nkolor domyślny]
```

## 6. Over-capacity projektu

```mermaid
flowchart TD
    USED[usedEffectiveCapacity] --> COMPARE{usedEffCap\n> project.capacity?}
    COMPARE -- Tak --> OVERCAP[Klasa .over-capacity\nCzerwony/pomarańczowy tekst]
    COMPARE -- Nie --> NORMAL[Normalny tekst]
    OVERCAP --> DISPLAY[Wyświetl: usedEffCap/capacity]
    NORMAL --> DISPLAY
```

## 7. Estimated Payment pracownika

```mermaid
flowchart TD
    EMP[Pracownik] --> CHECK{Czy ma\nprzypisania?}
    CHECK -- Nie --> BENCH[salary × 0.5\nbench payment]
    CHECK -- Tak --> SUM[Σ salary × max 0.5, capacity\ndla każdego przypisania]
    BENCH --> DISPLAY[Wyświetl Estimated Payment]
    SUM --> DISPLAY
```
