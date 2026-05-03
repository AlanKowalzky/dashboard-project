# Etap 3 — Przypisania i Kalendarz Urlopowy

## Cel
Pełne zarządzanie przypisaniami pracownik↔projekt oraz interaktywny kalendarz urlopowy.

## Nowe pliki

| Plik | Odpowiedzialność |
|------|-----------------|
| `js/assign.js` | Popup przypisania, edit assignment |
| `js/popups.js` | Show Employees, Show Assignments, Unassign confirm |
| `js/calendar.js` | Kalendarz urlopowy |

---

## Popup Przypisania (Assign)

### Wyzwalacz
Przycisk "Assign" w tabeli pracowników (disabled gdy capacity ≥ 1.5)

### Zawartość
- Aktualna capacity: "X.X / 1.5"
- Dostępna capacity: "Y.Y"
- Dropdown projektów: `"Projekt (wolne: Z.Z / total)"` — tylko projekty z bieżącego miesiąca
- Slider capacity: 0.0–1.5, krok 0.1
- Slider fit: 0.0–1.0, krok 0.1
- Wyświetlanie: `effectiveCapacity = capacity × fit`
- Przewidywana capacity po przypisaniu
- Ostrzeżenie gdy capacity projektu zostanie przekroczona (nie blokuje)
- Walidacja: suma capacity pracownika ≤ 1.5

### Pozycjonowanie
```js
// Pozycja przy przycisku, korekta do viewport
const rect = button.getBoundingClientRect()
popup.style.top = ...
popup.style.left = ...
// Nasłuchuj scroll i resize → reposition()
// Usuń listenery przy zamknięciu
```

---

## Popup Show Employees (projekt → pracownicy)

### Wyzwalacz
Przycisk "Show Employees (N)" w tabeli projektów

### Kolumny tabeli
| Kolumna | Obliczenie |
|---------|-----------|
| Name | link z action menu |
| Capacity | 2 dec |
| Fit | 2 dec |
| Vacation Days | liczba dni |
| Effective Capacity | capacity × fit × vacCoef, 3 dec |
| Revenue | revenuePerUnit × effectiveCap |
| Cost | salary × max(0.5, capacity) |
| Profit | revenue - cost, kolorowany |
| Actions | Edit, Unassign |

### Cechy
- Backdrop overlay
- Przycisk × (zamknij)
- Klik poza popupem = zamknij
- Pusta lista → komunikat "No employees assigned"
- Sortowanie po nazwisku

---

## Popup Show Assignments (pracownik → projekty)

### Wyzwalacz
Przycisk "Show Assignments (N) X/1.5" w tabeli pracowników

### Kolumny tabeli
Identyczne jak Show Employees (z perspektywy pracownika)

### Action Menu (klik na link projektu/pracownika)
```
┌─────────────────────────┐
│ See at Projects/Employees│
│ Unassign                │
└─────────────────────────┘
```
- Pozycjonowanie przy linku
- Klik poza = zamknij
- "See at ..." → zmień zakładkę + zastosuj filtr

---

## Popup Potwierdzenia Unassign

### Zawartość
| Pole | Wartość |
|------|---------|
| Pracownik | imię i nazwisko |
| Projekt | nazwa |
| Assigned Capacity | wartość |
| Salary Share | salary × capacity |
| Budget Share | proporcjonalny udział w budżecie |
| Employee Income | profit z tego przypisania |
| Project Capacity Before/After | X/total → (X-cap)/total |
| Project Income Before/After | kolorowane |

### Przyciski
- Confirm → usuń assignment → odśwież → zamknij
- Cancel → zamknij

---

## Edit Assignment

### Wyzwalacz
Przycisk "Edit" w Show Employees lub Show Assignments

### Zawartość
- Aktualne wartości capacity i fit
- Slider capacity (0.0–1.5)
- Slider fit (0.0–1.0)
- Walidacja: nowa suma capacity ≤ 1.5
- Zapisz → odśwież wszystkie otwarte popupy

---

## Kalendarz Urlopowy

### Wyzwalacz
Przycisk "Availability" w tabeli pracowników

### Siatka kalendarza
```
[Styczeń 2026]
Sun Mon Tue Wed Thu Fri Sat
                  1   2   3
 4   5   6   7   8   9  10
...
```

### Wyróżnienia wizualne
- Weekendy: szare tło
- Dzisiaj: obramowanie (tylko w bieżącym miesiącu)
- Dni urlopowe: kolorowe tło (np. żółte)

### Licznik dni roboczych
```
Working Days: X/Y days
X = Y - vacationWorkingDays
Y = liczba dni roboczych w miesiącu (bez weekendów)
```
Aktualizacja real-time przy każdym kliknięciu.

### Formatowanie zakresów urlopowych
```
Zasada: kolejne dni (z weekendami między nimi) = jeden zakres
Przykład: [3,4,5,10,15,16,17] → "03.01-05.01, 10.01, 15.01-17.01"
```

### Przycisk "Set Vacation"
1. Zapisz vacationDays do pracownika w bieżącym miesiącu
2. Przelicz wszystkie metryki (effectiveCapacity, revenue, cost, profit)
3. Odśwież obie tabele
4. Zamknij popup

---

## Kryteria zaliczenia etapu 3

- [ ] Assign popup otwiera się przy przycisku i przypisuje pracownika
- [ ] Assign popup zostaje w viewport, aktualizuje pozycję przy scroll/resize
- [ ] Show Employees wyświetla poprawne dane z obliczeniami
- [ ] Show Assignments wyświetla poprawne dane z obliczeniami
- [ ] Unassign confirmation pokazuje szczegóły finansowe
- [ ] Edit assignment aktualizuje capacity i fit
- [ ] Kalendarz wyświetla poprawny miesiąc z bieżącego okresu
- [ ] Weekendy wyróżnione, dzisiaj wyróżniony (jeśli bieżący miesiąc)
- [ ] Klik dnia = toggle urlopu, licznik aktualizuje się real-time
- [ ] Set Vacation zapisuje i przelicza wszystkie metryki
- [ ] Formatowanie zakresów urlopowych poprawne
