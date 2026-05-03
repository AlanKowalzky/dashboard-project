# Kryteria oceny projektu — Checklist 📊

## Podsumowanie punktacji: 200/200 pkt
**Skala ocen:** 180-200 pkt (90%+) : Doskonały

### 1. Trwałość danych i miesięczne migawki (25 pkt)
- [x] Dane są zapisywane w pamięci lokalnej i ładowane po odświeżeniu strony (5 pkt)
- [x] Każdy miesiąc przechowuje niezależne dane (5 pkt)
- [x] Selektory miesiąca/roku prawidłowo przełączają się (5 pkt)
- [x] Funkcja danych początkowych kopiuje dane (5 pkt)
- [x] Dni urlopowe są kasowane podczas kopiowania do nowego miesiąca (5 pkt)

### 2. Operacje CRUD pracowników (15 pkt)
- [x] Formularz „Dodaj pracownika” tworzy nowych pracowników (5 pkt)
- [x] Przycisk „Usuń pracownika” usuwa pracownika i zadania (5 pkt)
- [x] Edycja w tekście działa dla pozycji i wynagrodzenia (5 pkt)

### 3. Operacje projektu CRUD (10 pkt)
- [x] Formularz „Dodaj projekt” tworzy nowe projekty (5 pkt)
- [x] Przycisk Usuń projekt usuwa projekt i anuluje przypisania (5 pkt)

### 4. Zarządzanie zadaniami (20 pkt)
- [x] Pomyślne przypisywanie pracownika do projektu (8 pkt)
- [x] Okno potwierdzenia anulowania przypisania z danymi finansowymi (7 pkt)
- [x] Edycja zadania aktualizuje pojemność i dopasowanie (5 pkt)

### 5. Obliczenia finansowe (30 pkt)
- [x] Efektywna pojemność: pojemność × dopasowanie × współczynnik urlopowy (8 pkt)
- [x] Prawidłowe wyliczenie przychodów (pracownik/projekt) (7 pkt)
- [x] Prawidłowe wyliczenie kosztów (min 0,5 × wynagrodzenie) (7 pkt)
- [x] Zysk/dochód poprawny i oznaczony kolorami (8 pkt)

### 6. Formularze i walidacja (15 pkt)
- [x] Formularz pracownika (18+, imię, nazwisko, pensja) (5 pkt)
- [x] Formularz projektu (budżet, pojemność) (5 pkt)
- [x] Walidacja real-time, przyciski disabled przy błędach (5 pkt)

### 7. Wyświetlanie tabel (15 pkt)
- [x] Tabela projektów (wykorzystana/całkowita, kolory) (4 pkt)
- [x] Tabela Pracownicy (wiek, liczba zadań) (4 pkt)
- [x] Całkowity szacunkowy dochód pod tabelą (4 pkt)
- [x] Przycisk „Przypisz” wyłączony przy 1,5 capacity (3 pkt)

### 8. Sortowanie (10 pkt)
- [x] Sortowanie rosnąco/malejąco w obu tabelach (5 pkt)
- [x] Ikony sortowania aktualizują się (5 pkt)

### 9. Filtrowanie (10 pkt)
- [x] Filtry tekstowe i dropdown pozycji (5 pkt)
- [x] Aktywne chipy z możliwością usuwania (3 pkt)
- [x] „Wyczyść filtry” przy ≥ 2 filtrach (2 pkt)

### 10. Okienka ze szczegółami (15 pkt)
- [x] „Pokaż pracowników” z poprawnymi obliczeniami (5 pkt)
- [x] „Pokaż przypisania” z poprawnymi obliczeniami (5 pkt)
- [x] Przycisk zamykania i click-outside (3 pkt)
- [x] Komunikat o braku danych (2 pkt)

### 11. Pozycjonowanie wyskakującego okienka zadania (5 pkt)
- [x] Okienko przy przycisku i w viewport (3 pkt)
- [x] Repozycjonowanie przy scroll/resize (2 pkt)

### 12. Kalendarz dostępności (20 pkt)
- [x] Prawidłowy miesiąc/rok w kalendarzu (5 pkt)
- [x] Weekendy i dziś wyróżnione (5 pkt)
- [x] Wybór urlopu i aktualizacja dni roboczych (5 pkt)
- [x] Formatowanie zakresów urlopu DD.MM-DD.MM (5 pkt)

### 13. Nawigacja i interfejs użytkownika (10 pkt)
- [x] Przełączanie kart Projekty/Pracownicy (3 pkt)
- [x] Zwijanie/rozwijanie paska bocznego (3 pkt)
- [x] Linki „Zobacz w Projektach/Pracownicy” z filtrami (4 pkt)