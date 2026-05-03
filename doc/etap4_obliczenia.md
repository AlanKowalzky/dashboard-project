# Etap 4 — Obliczenia Finansowe i Kolorowanie

## Cel
Poprawna implementacja wszystkich formuł finansowych, kolorowanie wartości, Total Estimated Income.

## Plik

| Plik | Odpowiedzialność |
|------|-----------------|
| `js/calculations.js` | Wszystkie formuły finansowe jako czyste funkcje |

---

## Formuły — implementacja

### 1. Vacation Coefficient

```js
function getVacationCoefficient(year, month, vacationDays) {
  const workingDays = countWorkingDays(year, month)
  const vacWorkingDays = vacationDays.filter(d => !isWeekend(year, month, d)).length
  return workingDays === 0 ? 1 : (workingDays - vacWorkingDays) / workingDays
}

function countWorkingDays(year, month) {
  // Zlicz dni od 1 do lastDay gdzie getDay() !== 0 && !== 6
}

function isWeekend(year, month, day) {
  const d = new Date(year, month, day).getDay()
  return d === 0 || d === 6
}
```

### 2. Effective Capacity

```js
function getEffectiveCapacity(assignedCapacity, fit, vacationCoefficient) {
  return assignedCapacity * fit * vacationCoefficient
}
```

### 3. Revenue (per pracownik i per projekt)

```js
function getProjectRevenue(project, employees, year, month) {
  const usedEffCap = employees.reduce((sum, emp) => {
    const asgn = emp.assignments.find(a => a.projectId === project.id)
    if (!asgn) return sum
    const vacCoef = getVacationCoefficient(year, month, emp.vacationDays)
    return sum + getEffectiveCapacity(asgn.capacity, asgn.fit, vacCoef)
  }, 0)

  const capacityForRevenue = Math.max(project.capacity, usedEffCap)
  const revenuePerUnit = project.budget / capacityForRevenue

  return { usedEffCap, revenuePerUnit, totalRevenue: revenuePerUnit * usedEffCap }
}

function getEmployeeRevenue(revenuePerUnit, effectiveCapacity) {
  return revenuePerUnit * effectiveCapacity
}
```

### 4. Cost

```js
function getEmployeeCost(salary, assignedCapacity) {
  return salary * Math.max(0.5, assignedCapacity)
}

function getBenchCost(salary) {
  return salary * 0.5
}
```

### 5. Profit

```js
function getProfit(revenue, cost) {
  return revenue - cost
}
```

### 6. Estimated Payment pracownika

```js
function getEstimatedPayment(employee) {
  if (employee.assignments.length === 0) return employee.salary * 0.5
  return employee.assignments.reduce((sum, a) =>
    sum + employee.salary * Math.max(0.5, a.capacity), 0)
}
```

### 7. Total Estimated Income (pod tabelą projektów)

```js
function getTotalEstimatedIncome(projects, employees, year, month) {
  const projectsIncome = projects.reduce((sum, p) => {
    const { totalRevenue } = getProjectRevenue(p, employees, year, month)
    const totalCost = employees.reduce((s, emp) => {
      const a = emp.assignments.find(x => x.projectId === p.id)
      return a ? s + getEmployeeCost(emp.salary, a.capacity) : s
    }, 0)
    return sum + totalRevenue - totalCost
  }, 0)

  const benchCosts = employees
    .filter(e => e.assignments.length === 0)
    .reduce((sum, e) => sum + getBenchCost(e.salary), 0)

  return projectsIncome - benchCosts
}
```

---

## Kolorowanie wartości

| Warunek | Klasa CSS | Kolor |
|---------|-----------|-------|
| wartość > 0 | `.positive` | zielony |
| wartość < 0 | `.negative` | czerwony |
| wartość = 0 | brak klasy | domyślny |
| over-capacity projektu | `.over-capacity` | czerwony/pomarańczowy |

### Funkcja pomocnicza

```js
function colorClass(value) {
  if (value > 0) return 'positive'
  if (value < 0) return 'negative'
  return ''
}
```

---

## Formatowanie walut

```js
function formatCurrency(value) {
  return value.toFixed(2)  // lub Intl.NumberFormat
}
```

---

## Gdzie używane obliczenia

| Miejsce | Obliczenia |
|---------|-----------|
| Tabela projektów — Capacity | usedEffCap / project.capacity |
| Tabela projektów — Estimated Income | totalRevenue - totalCost |
| Tabela projektów — Total | getTotalEstimatedIncome() |
| Tabela pracowników — Estimated Payment | getEstimatedPayment() |
| Tabela pracowników — Projected Income | suma profitów ze wszystkich przypisań |
| Show Employees popup | effectiveCap, revenue, cost, profit per pracownik |
| Show Assignments popup | effectiveCap, revenue, cost, profit per projekt |
| Unassign confirm | before/after project income |
| Assign popup | effectiveCapacity = cap × fit (bez vacCoef — preview) |

---

## Kryteria zaliczenia etapu 4

- [ ] effectiveCapacity = capacity × fit × vacationCoefficient (poprawnie)
- [ ] Revenue per pracownik i per projekt poprawne
- [ ] Cost z minimum 0.5 × salary (bench payment)
- [ ] Profit/Income kolorowane zielono/czerwono
- [ ] Total Estimated Income pod tabelą projektów poprawny
- [ ] Over-capacity projektu wizualnie wyróżnione
- [ ] Estimated Payment pracownika poprawny (przypisany vs bench)
