# Etap 4 — Diagramy z implementacji

## 1. Architektura modułów — finalna (etap 4)

```mermaid
graph TD
    MAIN[main.js\ninitTableHeaders\nrenderFilterChips\napplySortProjects\napplySortEmployees\nopenFilterPopup\nopenPanel closePanel\nmonthName]

    CALC[calculations.js\ngetVacationCoefficient\ngetEffectiveCapacity\ngetEmployeeCost getBenchCost\ngetProfit\ncalcProjectSummaryFull\ncalcProjectSummary alias\ncalcTotalIncome\ncalcEstimatedPayment\ncalcEmployeeIncome\ncalcAge\ncolorClass fmt esc]

    STORAGE[storage.js\ngetData saveData\ngetMonthData saveMonthData\nseedData initSampleData uid]

    STATE[state.js\nstate currentYear currentMonth\nactiveTab\nsortProjects sortEmployees\nfilterProjects filterEmployees]

    VALID[validation.js\nvalidateProjectField\nvalidateEmployeeField\ninitFormValidation]

    PROJ[projects.js\nrenderProjectsTable\napplyProjectFilters\napplySortProjects call\nprojectRow renderTotalIncome\nbindProjectEvents deleteProject\ninitAddProjectPanel]

    EMP[employees.js\nrenderEmployeesTable\napplyEmployeeFilters\napplySortEmployees call\nemployeeRow bindEmployeeEvents\ndeleteEmployee\ninlineEditPosition inlineEditSalary\ninitAddEmployeePanel]

    ASSIGN[assign.js\nopenAssignPopup\nopenEditAssignmentPopup\npositionPopup]

    POPUPS[popups.js\nopenShowEmployeesPopup\nopenShowAssignmentsPopup\nopenUnassignConfirm\nopenActionMenu\nnavigateToTab]

    CAL[calendar.js\nopenCalendarPopup\nbuildCalendarCells\ncountWorkingDays isWeekend\nformatVacationRanges\nhasOnlyWeekendsBetween]

    MAIN --> STORAGE
    MAIN --> STATE
    MAIN --> PROJ
    MAIN --> EMP
    CALC --> PROJ
    CALC --> EMP
    CALC --> POPUPS
    CALC --> ASSIGN
    STORAGE --> PROJ
    STORAGE --> EMP
    STORAGE --> POPUPS
    STORAGE --> ASSIGN
    STORAGE --> CAL
    STATE --> PROJ
    STATE --> EMP
    STATE --> POPUPS
    STATE --> ASSIGN
    VALID --> PROJ
    VALID --> EMP
    ASSIGN --> CALC
    POPUPS --> CALC
    CAL --> STORAGE
```

## 2. calculations.js — mapa funkcji i zależności

```mermaid
graph LR
    VAC[getVacationCoefficient\nyear month vacationDays\n→ number 0-1]
    EFF[getEffectiveCapacity\ncapacity fit vacCoef\n→ cap × fit × vacCoef]
    COST[getEmployeeCost\nsalary capacity\n→ salary × max 0.5 cap]
    BENCH[getBenchCost\nsalary\n→ salary × 0.5]
    PROFIT[getProfit\nrevenue cost\n→ revenue - cost]

    PSF[calcProjectSummaryFull\np employees\n→ usedCap revenuePerUnit\ntotalRevenue totalCost income]
    PS[calcProjectSummary\nalias → usedCap income]
    TI[calcTotalIncome\nprojects employees\n→ Σ incomes - bench]
    EP[calcEstimatedPayment\nemployee\n→ Σ cost lub bench]
    EI[calcEmployeeIncome\nemployee projects\n→ Σ profit per assignment]
    AGE[calcAge dob\n→ years]

    VAC --> EFF
    EFF --> PSF
    COST --> PSF
    PSF --> PS
    PSF --> TI
    BENCH --> TI
    COST --> EP
    BENCH --> EP
    PSF --> EI
    EFF --> EI
    COST --> EI
    PROFIT --> EI
```

## 3. calcProjectSummaryFull — szczegółowy przepływ

```mermaid
flowchart TD
    INPUT[projekt p + employees array] --> LOOP[forEach employee]
    LOOP --> FIND{assignment\ndla p.id?}
    FIND -- Nie --> NEXT[następny]
    FIND -- Tak --> VC[getVacationCoefficient\nyear month emp.vacationDays]
    VC --> EFF[usedCap +=\ngetEffectiveCapacity cap fit vc\n= cap × fit × vc]
    EFF --> COST[totalCost +=\ngetEmployeeCost salary cap\n= salary × max 0.5 cap]
    COST --> NEXT
    NEXT --> DONE[po pętli]
    DONE --> CAPREV[capForRev = max p.capacity usedCap]
    CAPREV --> RPU[revenuePerUnit = budget / capForRev]
    RPU --> TOTREV[totalRevenue = revenuePerUnit × usedCap]
    TOTREV --> RETURN[return\nusedCap revenuePerUnit\ntotalRevenue totalCost\nincome = totalRevenue - totalCost]
```

## 4. calcEmployeeIncome — przepływ per assignment

```mermaid
flowchart TD
    INPUT[employee e + projects] --> CHECK{assignments\npuste?}
    CHECK -- Tak --> ZERO[return 0]
    CHECK -- Nie --> VACCOEF[getVacationCoefficient\nyear month e.vacationDays]
    VACCOEF --> ALLEMP[getMonthData → allEmp\ndla poprawnego revenuePerUnit]
    ALLEMP --> REDUCE[assignments.reduce]
    REDUCE --> FINDP{projekt\nistnieje?}
    FINDP -- Nie --> SKIP[pomiń sum]
    FINDP -- Tak --> RPU[calcProjectSummaryFull p allEmp\n→ revenuePerUnit]
    RPU --> EFFCAP[getEffectiveCapacity\ncap fit vacCoef]
    EFFCAP --> REV[rev = revenuePerUnit × effCap]
    REV --> COST[cost = getEmployeeCost salary cap]
    COST --> PROFIT[getProfit rev cost\nsum += profit]
    PROFIT --> REDUCE
    REDUCE --> RESULT[return total profit]
```

## 5. Sortowanie — cykl stanów i logika

```mermaid
stateDiagram-v2
    [*] --> Unsorted : ikona ⇅\nst.column = null
    Unsorted --> Ascending : klik\nst.column = col\nst.direction = asc\nikona ↑ active
    Ascending --> Descending : klik\nst.direction = desc\nikona ↓
    Descending --> Unsorted : klik\nst.direction = null\nst.column = null\nikona ⇅
```

## 6. applySortProjects — wartości sortowania

```mermaid
flowchart LR
    COL{column} --> INC[income\ncalcProjectSummary.income]
    COL --> CAP[capacity\ncalcProjectSummary.usedCap]
    COL --> STR[companyName projectName\na col .localeCompare b col]
    COL --> NUM[budget\na col - b col]
    INC & CAP & NUM --> NUMSORT[numeryczne\nva - vb]
    STR --> STRSORT[alfabetyczne\nlocaleCompare]
    NUMSORT & STRSORT --> DIR{direction}
    DIR -- asc --> CMP[cmp]
    DIR -- desc --> NEG[-cmp]
```

## 7. Filtrowanie — openFilterPopup

```mermaid
flowchart TD
    ICON[klik filter-icon] --> REMOVE[filter-popup?.remove]
    REMOVE --> COL{col === position?}
    COL -- Tak --> SELECT[select z opcjami\nJunior Middle Senior\nLead Architect BO\nauto-apply on change]
    COL -- Nie --> INPUT[input type=text\nwartość = current filter\nApply + Cancel buttons]
    SELECT & INPUT --> APPEND[appendChild popup\npositionPopup icon]
    APPEND --> APPLY[apply\nval ? filters col = val\n: delete filters col\npopup.remove\nrenderActiveView]
    APPEND --> CANCEL[cancel\npopup.remove]
    APPEND --> KEYDOWN[Enter → apply\nEscape → cancel]
    APPEND --> OUTSIDE[mousedown outside\n→ popup.remove]
```

## 8. renderFilterChips — logika chipów

```mermaid
flowchart TD
    CALL[renderFilterChips\ncontainerId filters onRemove] --> ENTRIES[Object.entries filters]
    ENTRIES --> EMPTY{entries.length == 0?}
    EMPTY -- Tak --> CLEAR[container.innerHTML = empty]
    EMPTY -- Nie --> CHIPS[map entries\nspan.chip Label: value ×]
    CHIPS --> TWO{entries.length >= 2?}
    TWO -- Tak --> CLEARALL[+ span.chip.clear-all\nClear Filters ×]
    TWO -- Nie --> RENDER[innerHTML = chips html]
    CLEARALL --> RENDER
    RENDER --> BIND[querySelectorAll button data-key\nonClick]
    BIND --> KEY{data-key == __all__?}
    KEY -- Tak --> DELETEALL[Object.keys filters\nforEach delete\nonRemove __all__]
    KEY -- Nie --> DELETEONE[onRemove key\ndelete filters key]
```

## 9. colorClass — kolorowanie wartości

```mermaid
flowchart LR
    VAL[wartość liczbowa] --> GT{> 0?}
    GT -- Tak --> POS[positive\nkolor zielony]
    GT -- Nie --> LT{< 0?}
    LT -- Tak --> NEG[negative\nkolor czerwony]
    LT -- Nie --> NONE[pusty string\nkolor domyślny]
```

## 10. Pełny pipeline render tabeli projektów

```mermaid
flowchart TD
    CALL[renderProjectsTable] --> LOAD[getMonthData → employees projects]
    LOAD --> FILTER[applyProjectFilters\nObject.entries filterProjects\nevery k v → p k includes v]
    FILTER --> SORT[applySortProjects\nfiltered employees\n→ sorted array]
    SORT --> CHIPS[renderFilterChips\nprojects-filter-chips\nstate.filterProjects]
    CHIPS --> EMPTY{filtered.length == 0?}
    EMPTY -- Tak --> EMPTYROW[No projects\ntotal-income empty]
    EMPTY -- Nie --> ROWS[filtered.map projectRow\ncalcProjectSummary per row\ncolorClass income\nover-capacity class]
    ROWS --> TOTAL[renderTotalIncome\ncalcTotalIncome all projects employees\ncolorClass total]
    TOTAL --> BIND[bindProjectEvents\nbtn-delete btn-show-employees]
```
