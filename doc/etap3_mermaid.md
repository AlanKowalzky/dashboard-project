# Etap 3 — Diagramy z implementacji

## 1. Assign Popup — pełny przepływ

```mermaid
flowchart TD
    BTN[btn-assign klik] --> CHECK{totalCap >= 1.5?}
    CHECK -- Tak --> DISABLED[przycisk disabled\nnie otwiera]
    CHECK -- Nie --> REMOVE[assign-popup?.remove\nusuń poprzedni]
    REMOVE --> FILTER[projects.filter\nnot in emp.assignments]
    FILTER --> EMPTY{brak projektów?}
    EMPTY -- Tak --> MSG[No available projects\nbtn Close]
    EMPTY -- Nie --> BUILD[Buduj HTML\ncurrent cap / available\nselect projects\nslider cap 0-1.5\nslider fit 0-1.0\neff cap preview\ncap after preview\nwarn / err divs]
    BUILD --> APPEND[appendChild popup]
    APPEND --> POS[positionPopup popup btn]
    POS --> LISTEN[addEventListener\nscroll → reposition\nresize → reposition]
    LISTEN --> OUTSIDE[setTimeout\nmousedown outsideClick]
```

## 2. positionPopup — algorytm viewport

```mermaid
flowchart LR
    RECT[btn.getBoundingClientRect] --> CALC[top = rect.bottom + 6\nleft = rect.left]
    CALC --> OVERFLOW_R{left + pw\n> innerWidth - 8?}
    OVERFLOW_R -- Tak --> FIX_L[left = innerWidth - pw - 8]
    OVERFLOW_R -- Nie --> OVERFLOW_B{top + ph\n> innerHeight - 8?}
    FIX_L --> OVERFLOW_B
    OVERFLOW_B -- Tak --> FIX_T[top = rect.top - ph - 6\npowyżej przycisku]
    OVERFLOW_B -- Nie --> CLAMP[left = max 8 left\ntop = max 8 top]
    FIX_T --> CLAMP
    CLAMP --> SET[popup.style.position = fixed\ntop left zIndex=400]
```

## 3. updateSliders — real-time walidacja w Assign Popup

```mermaid
flowchart TD
    INPUT[slider cap lub fit zmiana\nlub select project zmiana] --> READ[cap = capSlider.value\nfit = fitSlider.value]
    READ --> UPDATE[capVal.textContent\nfitVal.textContent\neffEl = cap × fit toFixed 3\nafterEl = usedCap + cap / 1.5]
    UPDATE --> ERR{usedCap + cap > 1.5?}
    ERR -- Tak --> SHOW_ERR[errEl.hidden = false\nExceeds max capacity]
    ERR -- Nie --> HIDE_ERR[errEl.hidden = true]
    SHOW_ERR & HIDE_ERR --> WARN_CHECK[pobierz projekt z select\ncalcProjectSummary proj allEmp\nvacCoef = getVacationCoefficient\nnewEff = cap × fit × vacCoef]
    WARN_CHECK --> OVER{pUsed + newEff\n> proj.capacity?}
    OVER -- Tak --> SHOW_WARN[warnEl.hidden = false\nWarning: over-capacity]
    OVER -- Nie --> HIDE_WARN[warnEl.hidden = true]
```

## 4. openShowEmployeesPopup — struktura i odświeżanie

```mermaid
flowchart TD
    OPEN[openShowEmployeesPopup pid] --> LOAD[getMonthData\nfilter assigned\nsort by surname]
    LOAD --> CALC[calcProjectSummaryFull p employees\n→ revenuePerUnit]
    CALC --> RENDER[render\nbuildRows per emp:\neffCap = cap × fit × vacCoef\nrev = revenuePerUnit × effCap\ncost = salary × max 0.5 cap\nprofit = rev - cost\ncolorClass profit]
    RENDER --> BIND[bindEvents\nbtn-edit-asgn → openEditAssignmentPopup\nbtn-unassign → openUnassignConfirm\naction-link → openActionMenu]
    BIND --> EDIT[Edit → openEditAssignmentPopup\nonSave: refreshPopupData + render]
    BIND --> UNASSIGN[Unassign → openUnassignConfirm\nonConfirm: refreshPopupData + render]
    EDIT & UNASSIGN --> REFRESH[refreshPopupData\ngetMonthData fresh\nupdate assigned array\nupdate p object\nrenderActiveView]
```

## 5. openUnassignConfirm — obliczenia before/after

```mermaid
flowchart TD
    OPEN[openUnassignConfirm eid pid] --> DATA[getMonthData\nemp p asgn]
    DATA --> BEFORE[calcProjectSummaryFull p employees\n→ revenuePerUnit usedCap incBefore]
    BEFORE --> EFF[vacCoef = getVacationCoefficient\neffCap = cap × fit × vacCoef\nrev = revenuePerUnit × effCap\ncost = salary × max 0.5 cap\nprofit = rev - cost]
    EFF --> AFTER[empWithout = employees.map\nfilter out this assignment\ncalcProjectSummaryFull p empWithout\n→ incAfter\ncapAfter = usedCap - effCap]
    AFTER --> SHOW[Pokaż tabelę:\nEmployee Project\nAssigned Capacity\nSalary Share = salary × cap\nBudget Share = budget × cap/projCap\nEmployee Income = profit\nProject Cap Before After\nProject Income Before After\ncolorClass wszystkich wartości]
    SHOW --> CONFIRM[Confirm → usuń assignment\nsaveMonthData → onConfirm]
```

## 6. openCalendarPopup — cykl render

```mermaid
flowchart TD
    OPEN[openCalendarPopup eid] --> INIT[getMonthData\nemp.vacationDays\nselected = new Set vacationDays]
    INIT --> RENDER[render]
    RENDER --> COUNT[countWorkingDays year month\nvacWorking = selected.filter not weekend\nworkingLeft = total - vacWorking]
    COUNT --> RANGES[formatVacationRanges\nsorted selected days]
    RANGES --> BUILD[buildCalendarCells\nfirstDow = new Date y m 1 .getDay\npuste komórki przed 1\nper dzień: weekend today vacation classes]
    BUILD --> DISPLAY[Wyświetl:\nh2 monthName year\nWorking Days X/Y\ncal-grid\ncal-ranges\nbtn Set Vacation / Cancel]
    DISPLAY --> CLICK[cal-day klik\nselected.has d → delete\nelse → add\nrender ponownie]
    CLICK --> SAVE[Set Vacation klik\nemp2.vacationDays = sorted selected\nsaveMonthData\noverlay.remove\nrenderActiveView]
```

## 7. formatVacationRanges — algorytm grupowania

```mermaid
flowchart TD
    INPUT[days = sorted array\nnp. 3 4 5 10 15 16 17] --> INIT[start = end = days 0]
    INIT --> LOOP[for i = 1 to length]
    LOOP --> DIFF{days i - end <= 3\nAND hasOnlyWeekendsBetween?}
    DIFF -- Tak --> EXTEND[end = days i\nkontynuuj zakres]
    DIFF -- Nie --> PUSH[push start==end\n? fmt2 start\n: fmt2 start - fmt2 end\nstart = end = days i]
    EXTEND & PUSH --> LOOP
    LOOP --> LAST[push ostatni zakres]
    LAST --> JOIN[join przecinkami\nnp. 03.01-05.01 10.01 15.01-17.01]
```

## 8. openActionMenu — nawigacja z filtrem

```mermaid
flowchart TD
    LINK[klik action-link] --> MENU[Utwórz div.action-menu\nSee at X / Unassign]
    MENU --> POS[pozycjonuj przy linku\nrect.bottom + 4]
    POS --> SEE[klik See at Employees/Projects]
    SEE --> NAV[navigateTo tab filters\nsetActiveTab\nstate.filterEmployees lub filterProjects = filters\nrenderActiveView]
    MENU --> UNASSIGN_BTN[klik Unassign]
    UNASSIGN_BTN --> FIND[link.closest tr\nquerySelector btn-unassign\ndataset eid pid]
    FIND --> CONFIRM[openUnassignConfirm\nonConfirm: renderActiveView]
```
