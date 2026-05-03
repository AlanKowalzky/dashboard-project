# Employee & Project Dashboard — Szczegółowy Spis Treści i Plan Realizacji

## Podział na 5 Etapów

---

## ETAP 1 — Fundament: Architektura, Dane, Układ (25 pkt)
**Cel:** Działająca aplikacja z localStorage, nawigacją i podstawowym layoutem.

### 1.1 Struktura plików
- `index.html` — szkielet HTML
- `css/style.css` — style globalne, sidebar, layout
- `js/storage.js` — operacje na localStorage
- `js/state.js` — globalny stan (currentPeriod, activeTab)
- `js/main.js` — inicjalizacja, event listenery globalne

### 1.2 Model danych (localStorage)
- Klucz: `"monthlyData"`
- Struktura: `{ "YYYY-M": { employees: [], projects: [] } }`
- Pola pracownika: id, name, surname, dob, position, salary, assignments[], vacationDays[]
- Pola projektu: id, projectName, companyName, budget, capacity

### 1.3 Layout
- Sidebar: toggle (☰/→), month selector (0-11), year selector (2025-2027)
- Zakładki: Projects / Employees
- Główny obszar treści
- Przycisk "Seed Data"

### 1.4 Period Management
- Domyślny okres: bieżący miesiąc/rok
- Zmiana selektora → przeładowanie danych
- Seed Data: kopiowanie danych między miesiącami, czyszczenie vacationDays

### 1.5 Dane przykładowe (seed)
- Inicjalizacja przy braku danych w localStorage

**Dokumentacja etapu 1:** `doc/etap1_architektura.md`
**Diagramy:** `doc/etap1_mermaid.md`

---

## ETAP 2 — CRUD: Pracownicy i Projekty (25 pkt)
**Cel:** Pełne operacje dodawania/usuwania pracowników i projektów z walidacją formularzy.

### 2.1 Tabela Projektów (podstawowa)
- Kolumny: Company Name, Project Name, Budget, Employee Capacity, Employees btn, Estimated Income, Actions
- Wyświetlanie capacity jako "used/total"
- Przycisk Delete z potwierdzeniem

### 2.2 Tabela Pracowników (podstawowa)
- Kolumny: Name, Surname, Age (z DOB), Position, Salary, Estimated Payment, Project btn, Projected Income, Actions
- Obliczanie wieku z daty urodzenia
- Przycisk Delete z potwierdzeniem

### 2.3 Formularz Dodawania Projektu (slide-in panel)
- Pola: Project Name (min 3, alfanumeryczne), Company Name (min 2), Budget (>0, 2 dec), Capacity (int ≥1)
- Walidacja real-time (input + blur)
- Submit disabled do czasu poprawności

### 2.4 Formularz Dodawania Pracownika (slide-in panel)
- Pola: Name (min 3, litery), Surname (min 3, litery), DOB (18+), Position (dropdown), Salary (>0, 2 dec)
- Walidacja real-time
- Obliczanie wieku na bieżąco

### 2.5 Inline Editing
- Position: klik → dropdown → zapis on change/blur
- Salary: klik → input → zapis on blur/Enter, anuluj Escape

**Dokumentacja etapu 2:** `doc/etap2_crud.md`
**Diagramy:** `doc/etap2_mermaid.md`

---

## ETAP 3 — Przypisania i Kalendarz Urlopowy (40 pkt)
**Cel:** Zarządzanie przypisaniami pracownik↔projekt oraz kalendarz urlopowy.

### 3.1 Popup Przypisania (Assign)
- Pozycjonowanie przy przycisku, korekta do viewport
- Dropdown projektów z info o dostępności
- Slider capacity (0.0–1.5, krok 0.1)
- Slider fit (0.0–1.0, krok 0.1)
- Walidacja: max capacity 1.5, ostrzeżenie o przekroczeniu capacity projektu
- Wyświetlanie effective capacity = capacity × fit
- Aktualizacja pozycji przy scroll/resize

### 3.2 Popup Szczegółów Projektu (Show Employees)
- Lista pracowników: name, capacity, fit, vacation days, effective capacity, revenue, cost, profit
- Przyciski Edit i Unassign
- Backdrop, close button, click-outside

### 3.3 Popup Szczegółów Pracownika (Show Assignments)
- Lista projektów: name, capacity, fit, vacation days, effective capacity, revenue, cost, profit
- Przyciski Edit i Unassign
- Action menu dla linków (See at / Unassign)

### 3.4 Popup Potwierdzenia Unassign
- Szczegóły finansowe: salary share, budget share, income, capacity before/after, project income before/after
- Kolorowanie wartości

### 3.5 Edit Assignment
- Sliders capacity i fit z aktualną wartością
- Walidacja dostępnej capacity pracownika

### 3.6 Kalendarz Urlopowy
- Siatka kalendarza dla bieżącego okresu
- Wyróżnienie weekendów i dzisiejszej daty
- Klik = toggle dnia urlopowego
- Licznik "Working Days: X/Y" aktualizowany real-time
- Formatowanie zakresów: "DD.MM" / "DD.MM-DD.MM"
- Przycisk "Set Vacation" → zapis → przeliczenie wszystkich metryk

**Dokumentacja etapu 3:** `doc/etap3_przypisania_kalendarz.md`
**Diagramy:** `doc/etap3_mermaid.md`

---

## ETAP 4 — Obliczenia Finansowe i Kolorowanie (30 pkt)
**Cel:** Poprawne implementacje wszystkich formuł finansowych i wizualne oznaczenia.

### 4.1 Vacation Coefficient
```
workingDays = liczba dni roboczych w miesiącu
vacationWorkingDays = liczba dni urlopowych będących dniami roboczymi
vacationCoefficient = (workingDays - vacationWorkingDays) / workingDays
```

### 4.2 Effective Capacity
```
effectiveCapacity = assignedCapacity × fit × vacationCoefficient
```

### 4.3 Revenue
```
usedEffectiveCapacity = suma effectiveCapacity wszystkich pracowników projektu
capacityForRevenue = max(projectCapacity, usedEffectiveCapacity)
revenuePerUnit = budget / capacityForRevenue
employeeRevenue = revenuePerUnit × employeeEffectiveCapacity
```

### 4.4 Cost
```
employeeCost = salary × max(0.5, assignedCapacity)
benchCost = salary × 0.5  // dla nieprzypisanych
```

### 4.5 Profit
```
profit = revenue - cost
projectProfit = totalRevenue - totalCosts
employeeProfit = suma profitów ze wszystkich przypisań
```

### 4.6 Total Estimated Income (pod tabelą projektów)
```
totalIncome = suma project incomes - bench payments dla nieprzypisanych
```

### 4.7 Kolorowanie
- Zielony: wartości dodatnie
- Czerwony: wartości ujemne
- Over-capacity projektu: wyróżnienie wizualne

### 4.8 Estimated Payment pracownika
```
jeśli przypisany: suma (salary × max(0.5, capacity)) dla każdego przypisania
jeśli nieprzypisany: salary × 0.5
```

**Dokumentacja etapu 4:** `doc/etap4_obliczenia.md`
**Diagramy:** `doc/etap4_mermaid.md`

---

## ETAP 5 — Sortowanie, Filtrowanie, Nawigacja i Finalizacja (35 pkt)
**Cel:** Pełna funkcjonalność sortowania, filtrowania, nawigacji i deployment.

### 5.1 Sortowanie kolumn
- Ikona ⇅ → ↑ (asc) → ↓ (desc) → ⇅
- Projekty: Company Name, Project Name, Budget, Employee Capacity, Estimated Income
- Pracownicy: Name, Surname, Age, Position, Salary, Estimated Payment, Projected Income
- Stringi alfabetycznie, liczby numerycznie

### 5.2 Filtrowanie kolumn
- Ikona ⌕ → popup przy nagłówku
- Text input dla większości kolumn
- Dropdown dla Position
- Apply/Cancel, Enter = apply, auto-apply dla dropdown

### 5.3 Filter Chips
- Wyświetlanie aktywnych filtrów jako "Kolumna: wartość"
- × na chipie = usuń filtr
- "Clear Filters" przy 2+ aktywnych filtrach

### 5.4 Nawigacja z filtrami
- "See at Projects" → zakładka Projects + filtr po nazwie projektu
- "See at Employees" → zakładka Employees + filtr po name + surname
- Czyszczenie poprzednich filtrów

### 5.5 Sidebar
- Toggle ☰ → collapse → przycisk →
- Aktywna zakładka wyróżniona

### 5.6 Finalizacja
- README.md
- .gitignore
- Brak błędów w konsoli
- Deployment GitHub Pages

**Dokumentacja etapu 5:** `doc/etap5_sortowanie_filtrowanie.md`
**Diagramy:** `doc/etap5_mermaid.md`

---

## Podsumowanie punktacji

| Etap | Zakres | Punkty |
|------|--------|--------|
| 1 | Architektura, dane, layout, period management | 25 |
| 2 | CRUD pracownicy/projekty, formularze, inline edit | 25 |
| 3 | Przypisania, popupy, kalendarz urlopowy | 40 |
| 4 | Obliczenia finansowe, kolorowanie | 30 |
| 5 | Sortowanie, filtrowanie, nawigacja, finalizacja | 35 |
| **Razem** | | **155 / 200** |

> Pozostałe 45 pkt pochodzi z dopracowania szczegółów w każdym etapie (pozycjonowanie popupów, edge cases, responsywność).
