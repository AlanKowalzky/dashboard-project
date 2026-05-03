# Etap 5 — Sortowanie, Filtrowanie, Nawigacja i Finalizacja

## Cel
Pełna funkcjonalność sortowania, filtrowania z chipami, nawigacja między zakładkami z filtrami, deployment.

## Nowe pliki

| Plik | Odpowiedzialność |
|------|-----------------|
| `js/sort.js` | Logika sortowania kolumn |
| `js/filter.js` | Logika filtrowania, filter chips |
| `README.md` | Dokumentacja projektu |
| `.gitignore` | Wykluczenia git |

---

## Sortowanie kolumn

### Cykl stanów ikony
```
⇅ (brak) → ↑ (asc) → ↓ (desc) → ⇅ (reset)
```

### Sortowalne kolumny

**Projekty:** Company Name, Project Name, Budget, Employee Capacity (used), Estimated Income

**Pracownicy:** Name, Surname, Age, Position, Salary, Estimated Payment, Projected Income

### Implementacja

```js
// state sortowania per tabela
const sortState = { column: null, direction: null }  // null | 'asc' | 'desc'

function sortData(data, column, direction, getValueFn) {
  return [...data].sort((a, b) => {
    const va = getValueFn(a, column)
    const vb = getValueFn(b, column)
    const cmp = typeof va === 'string' ? va.localeCompare(vb) : va - vb
    return direction === 'asc' ? cmp : -cmp
  })
}
```

### Zachowanie
- Klik na ikonę ⇅ → asc
- Klik ponownie → desc
- Klik ponownie → reset (oryginalna kolejność)
- Aktywna kolumna wyróżniona
- Sortowanie zachowane przy zmianie filtrów

---

## Filtrowanie kolumn

### Filtrowalne kolumny

**Projekty:** Company Name, Project Name

**Pracownicy:** Name, Surname, Position

### Popup filtra
- Otwiera się przy kliknięciu ikony ⌕ w nagłówku
- Pozycjonowanie pod nagłówkiem kolumny
- Text input dla Name, Surname, Company Name, Project Name
- Dropdown dla Position (Junior/Middle/Senior/Lead/Architect/BO)
- Przyciski Apply / Cancel
- Enter = Apply
- Dropdown: auto-apply przy wyborze

### Implementacja

```js
const filterState = {}  // { columnKey: value }

function applyFilters(data, filters) {
  return data.filter(row =>
    Object.entries(filters).every(([col, val]) =>
      String(getField(row, col)).toLowerCase().includes(val.toLowerCase())
    )
  )
}
```

---

## Filter Chips

### Wyświetlanie
```
[Company: Acme ×]  [Position: Senior ×]  [Clear Filters ×]
```

### Zasady
- Chip per aktywny filtr: `"Kolumna: wartość"`
- × na chipie = usuń ten filtr
- "Clear Filters" pojawia się gdy ≥ 2 aktywne filtry
- Klik "Clear Filters" = usuń wszystkie filtry
- Chips wyświetlane nad tabelą

---

## Nawigacja z filtrami

### "See at Projects" (z popupu pracownika)
1. Zamknij popup
2. Przełącz na zakładkę Projects
3. Wyczyść poprzednie filtry
4. Zastosuj filtr: `projectName = "nazwa projektu"`
5. Odśwież tabelę

### "See at Employees" (z popupu projektu)
1. Zamknij popup
2. Przełącz na zakładkę Employees
3. Wyczyść poprzednie filtry
4. Zastosuj filtry: `name = "imię"` + `surname = "nazwisko"`
5. Odśwież tabelę

---

## Sidebar — finalizacja

### Toggle
```
Rozwinięty: przycisk ☰ → zwija sidebar
Zwinięty: przycisk → → rozwija sidebar
```

### CSS
```css
#sidebar { width: 240px; transition: width 0.3s; }
#sidebar.collapsed { width: 0; overflow: hidden; }
```

---

## README.md — wymagana zawartość

```markdown
# Employee & Project Dashboard

## Opis
Aplikacja do zarządzania pracownikami, projektami i przypisaniami.

## Funkcje
- Miesięczne snapshoty danych
- CRUD pracownicy i projekty
- Przypisania z capacity i fit
- Kalendarz urlopowy
- Obliczenia finansowe
- Sortowanie i filtrowanie

## Tech Stack
- Vanilla JavaScript (ES6+)
- HTML5
- CSS3
- localStorage

## Uruchomienie
Otwórz index.html w przeglądarce lub użyj Live Server.

## Deployment
https://[username].github.io/dashboard2
```

---

## .gitignore

```
node_modules/
.DS_Store
.idea/
.vscode/
*.log
```

---

## Checklist finalizacji

- [ ] Brak błędów w konsoli (F12)
- [ ] Wszystkie funkcje działają w deployed wersji
- [ ] README.md kompletny
- [ ] .gitignore dodany
- [ ] GitHub Pages skonfigurowany

---

## Kryteria zaliczenia etapu 5

- [ ] Sortowanie asc/desc działa na obu tabelach
- [ ] Ikony sortowania aktualizują się (⇅ ↑ ↓)
- [ ] Filtry text działają dla Name, Surname, Company, Project
- [ ] Filtr dropdown działa dla Position
- [ ] Filter chips wyświetlają aktywne filtry
- [ ] × na chipie usuwa filtr
- [ ] "Clear Filters" pojawia się przy ≥ 2 filtrach
- [ ] "See at Projects/Employees" nawiguje i filtruje
- [ ] Sidebar zwija się i rozwija
- [ ] Aplikacja działa na GitHub Pages bez błędów
