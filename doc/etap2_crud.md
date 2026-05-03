# Etap 2 — CRUD: Pracownicy i Projekty

## Cel
Pełne operacje dodawania/usuwania pracowników i projektów, walidacja formularzy, inline editing.

## Nowe pliki

| Plik | Odpowiedzialność |
|------|-----------------|
| `js/projects.js` | Renderowanie tabeli projektów, CRUD projektów |
| `js/employees.js` | Renderowanie tabeli pracowników, CRUD pracowników |
| `js/validation.js` | Reguły walidacji formularzy |

---

## Tabela Projektów

### Kolumny
| Kolumna | Typ | Uwagi |
|---------|-----|-------|
| Company Name | string | sortowalna, filtrowalna |
| Project Name | string | sortowalna, filtrowalna |
| Budget | number | waluta, 2 miejsca dziesiętne |
| Employee Capacity | string | "used/total", over-capacity = czerwony |
| Employees | button | "Show Employees (N)" |
| Estimated Income | number | zielony/czerwony |
| Actions | button | Delete |

### Delete Project
1. Confirm dialog z nazwą projektu
2. Usuń wszystkie assignments pracowników do tego projektu
3. Usuń projekt z bieżącego miesiąca
4. Odśwież obie tabele

---

## Tabela Pracowników

### Kolumny
| Kolumna | Typ | Uwagi |
|---------|-----|-------|
| Name | string | sortowalna, filtrowalna |
| Surname | string | sortowalna, filtrowalna |
| Age | number | obliczany z DOB, sortowalna |
| Position | dropdown | inline editable |
| Salary | number | inline editable, waluta |
| Estimated Payment | number | obliczany, sortowalna |
| Project | button | "Show Assignments (N) X/1.5" |
| Projected Income | number | zielony/czerwony, sortowalna |
| Actions | buttons | Availability, Assign, Delete |

### Obliczanie wieku
```js
age = Math.floor((today - new Date(dob)) / (365.25 * 24 * 3600 * 1000))
```

### Delete Employee
1. Confirm dialog z imieniem i nazwiskiem
2. Usuń pracownika ze wszystkich projektów (assignments)
3. Usuń pracownika z bieżącego miesiąca
4. Odśwież obie tabele

---

## Formularz Dodawania Projektu (slide-in panel)

### Pola i reguły walidacji
| Pole | Reguła |
|------|--------|
| Project Name | wymagane, min 3 znaki, alfanumeryczne |
| Company Name | wymagane, min 2 znaki, alfanumeryczne |
| Budget | wymagane, liczba > 0, 2 miejsca dziesiętne |
| Employee Capacity | wymagane, liczba całkowita ≥ 1 |

### Zachowanie
- Walidacja na `input` i `blur`
- Submit disabled dopóki wszystkie pola niepoprawne
- Komunikaty błędów pod polami
- Panel wysuwa się z prawej strony

---

## Formularz Dodawania Pracownika (slide-in panel)

### Pola i reguły walidacji
| Pole | Reguła |
|------|--------|
| Name | wymagane, min 3 znaki, tylko litery |
| Surname | wymagane, min 3 znaki, tylko litery |
| Date of Birth | wymagane, wiek ≥ 18 lat |
| Position | wymagane, wybór z listy |
| Salary | wymagane, liczba > 0, 2 miejsca dziesiętne |

### Pozycje (dropdown)
`Junior | Middle | Senior | Lead | Architect | BO`

---

## Inline Editing

### Position
```
klik na komórkę → <select> z opcjami → onChange/onBlur → zapisz → odśwież
```

### Salary
```
klik na komórkę → <input type="number"> → onBlur/Enter → zapisz → odśwież
                                         → Escape → anuluj (przywróć wartość)
```

---

## Kryteria zaliczenia etapu 2

- [x] Formularz projektu tworzy nowy projekt ze wszystkimi polami
- [x] Formularz pracownika tworzy nowego pracownika ze wszystkimi polami
- [x] Delete Project usuwa projekt i odpisuje pracowników
- [x] Delete Employee usuwa pracownika i jego przypisania
- [x] Inline editing Position działa (dropdown)
- [x] Inline editing Salary działa (input, Enter, Escape)
- [x] Submit disabled do czasu poprawności formularza
- [x] Komunikaty błędów pojawiają się i znikają
