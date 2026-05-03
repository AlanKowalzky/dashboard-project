# Etap 2 — Diagramy z implementacji

## 1. Architektura modułów po etapie 2

```mermaid
graph TD
    MAIN[main.js] --> STORAGE[storage.js]
    MAIN --> STATE[state.js]
    MAIN --> VALID[validation.js]
    MAIN --> PROJ[projects.js]
    MAIN --> EMP[employees.js]
    VALID --> PROJ
    VALID --> EMP
    STORAGE --> PROJ
    STORAGE --> EMP
    STATE --> PROJ
    STATE --> EMP
```

## 2. renderProjectsTable — pipeline

```mermaid
flowchart TD
    CALL[renderProjectsTable] --> LOAD[getMonthData → employees projects]
    LOAD --> EMPTY{projects.length == 0?}
    EMPTY -- Tak --> EMPTYROW[No projects\ntotal-income empty string]
    EMPTY -- Nie --> MAP[projects.map projectRow]
    MAP --> ROW[projectRow p employees\ncalcProjectSummary → usedCap income\nusedCap > p.capacity → over-capacity\ncolorClass income\nassignedCount = filter has assignment]
    ROW --> TOTAL[renderTotalIncome\ncalcTotalIncome → colorClass]
    TOTAL --> BIND[bindProjectEvents\nbtn-delete-project\nbtn-show-employees]
```

## 3. renderEmployeesTable — pipeline

```mermaid
flowchart TD
    CALL[renderEmployeesTable] --> LOAD[getMonthData → employees projects]
    LOAD --> EMPTY{employees.length == 0?}
    EMPTY -- Tak --> EMPTYROW[No employees]
    EMPTY -- Nie --> MAP[employees.map employeeRow]
    MAP --> ROW[employeeRow e projects\ncalcAge dob\ncalcEstimatedPayment e\ncalcEmployeeIncome e projects\ntotalCap = sum assignments.capacity\ntotalCap >= 1.5 → assign disabled\ncolorClass income]
    ROW --> BIND[bindEmployeeEvents\nbtn-delete btn-show-assignments\ncell-position cell-salary\nbtn-assign btn-availability]
```

## 4. initFormValidation — mechanizm walidacji

```mermaid
flowchart TD
    INIT[initFormValidation\nform validateFn onValid] --> EACH[forEach input name\nonInput + onBlur]
    EACH --> EVENT[zdarzenie]
    EVENT --> CHECKFIELD[checkField input\nerr = validateFn name value.trim\nspan.textContent = err\nclassList.toggle invalid !!err\nreturn !err]
    CHECKFIELD --> CHECKALL[checkAll\nevery input → validateFn\nsubmit.disabled = !allOk]
    CHECKALL --> VALID{allOk?}
    VALID -- Nie --> DISABLED[submit disabled]
    VALID -- Tak --> ENABLED[submit enabled]
    ENABLED --> SUBMIT[onSubmit\ne.preventDefault\nevery checkField]
    SUBMIT --> ALLOK{wszystkie OK?}
    ALLOK -- Nie --> STOP[return]
    ALLOK -- Tak --> DATA[Object.fromEntries\ninputs.map i → name value.trim]
    DATA --> CALLBACK[onValid data]
    CALLBACK --> RESET[form.reset\nremove invalid classes\nclear field-errors\nsubmit.disabled = true]
```

## 5. validateProjectField — reguły

```mermaid
flowchart LR
    NAME[projectName\nrequired min 3\nalphanumeric regex] --> ERR1[błąd lub empty string]
    COMP[companyName\nrequired min 2\nalphanumeric regex] --> ERR2[błąd lub empty string]
    BUDG[budget\nrequired > 0\nnot NaN] --> ERR3[błąd lub empty string]
    CAP[capacity\nrequired\nNumber.isInteger >= 1] --> ERR4[błąd lub empty string]
```

## 6. validateEmployeeField — reguły

```mermaid
flowchart LR
    NAME[name surname\nrequired min 3\nlitery + polskie znaki] --> ERR1[błąd lub empty]
    DOB[dob\nrequired\nage = Date.now - new Date dob\nage < 18 → błąd] --> ERR2[błąd lub empty]
    POS[position\nrequired\nPOSITIONS.includes value] --> ERR3[błąd lub empty]
    SAL[salary\nrequired > 0\nnot NaN] --> ERR4[błąd lub empty]
```

## 7. inlineEditPosition — stany

```mermaid
stateDiagram-v2
    [*] --> Display : renderEmployeesTable\ntd.cell-position tekst = position
    Display --> Editing : klik\ncell.querySelector select → guard\ncell.textContent = empty\ncreate select z opcjami\ncurrent option selected\nsel.focus
    Editing --> Saving : onChange lub onBlur
    Saving --> Display : getMonthData\nemp.position = sel.value\nsaveMonthData\nrenderEmployeesTable
```

## 8. inlineEditSalary — stany

```mermaid
stateDiagram-v2
    [*] --> Display : renderEmployeesTable\ntd.cell-salary tekst = fmt salary
    Display --> Editing : klik\ncell.querySelector input → guard\noriginal = cell.textContent\ncreate input number\ninp.focus inp.select
    Editing --> Saving : onBlur lub Enter → inp.blur
    Editing --> Display : Escape\ncell.textContent = original
    Saving --> Validate : parseFloat inp.value
    Validate --> Save : val > 0 i not NaN\nemp.salary = val\nsaveMonthData
    Validate --> Display : niepoprawna wartość\npomiń zapis
    Save --> Display : renderEmployeesTable
```

## 9. deleteProject — sekwencja

```mermaid
sequenceDiagram
    participant U as Użytkownik
    participant T as Tabela
    participant DB as storage.js
    participant V as renderActiveView

    U->>T: klik btn-delete-project
    T->>U: confirm Delete project X?
    U->>T: OK
    T->>DB: getMonthData
    T->>DB: md.employees.forEach\nassignments.filter projectId != pid
    T->>DB: md.projects.filter id != pid
    T->>DB: saveMonthData
    DB->>V: renderActiveView
```

## 10. calcTotalIncome — składowe

```mermaid
flowchart TD
    PROJ[projects.reduce\ncalcProjectSummary per p\nΣ income] --> PINCOME[projectsIncome]
    EMP[employees.filter\nassignments.length == 0\nΣ salary × 0.5] --> BENCH[benchCosts]
    PINCOME --> TOTAL[Total = projectsIncome - benchCosts]
    BENCH --> TOTAL
    TOTAL --> COLOR{colorClass total}
    COLOR -- positive --> GREEN[klasa positive]
    COLOR -- negative --> RED[klasa negative]
    COLOR -- empty --> NEUTRAL[brak klasy]
```
