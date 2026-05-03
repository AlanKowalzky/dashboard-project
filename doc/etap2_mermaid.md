# Etap 2 — Diagramy Mermaid

## 1. Przepływ dodawania projektu

```mermaid
flowchart TD
    BTN[Klik Add Project] --> PANEL[Otwórz slide-in panel]
    PANEL --> INPUT[Użytkownik wypełnia pola]
    INPUT --> VALIDATE{Walidacja\nreal-time}
    VALIDATE -- błąd --> ERROR[Pokaż komunikat błędu\nDisable Submit]
    VALIDATE -- OK --> ENABLE[Enable Submit]
    ENABLE --> SUBMIT[Klik Submit]
    SUBMIT --> SAVE[Zapisz projekt do localStorage]
    SAVE --> CLOSE[Zamknij panel]
    CLOSE --> REFRESH[Odśwież tabelę projektów]
```

## 2. Przepływ dodawania pracownika

```mermaid
flowchart TD
    BTN[Klik Add Employee] --> PANEL[Otwórz slide-in panel]
    PANEL --> INPUT[Wypełnij pola]
    INPUT --> AGE{Wiek ≥ 18?}
    AGE -- Nie --> ERRAGE[Błąd: za młody]
    AGE -- Tak --> VALIDATE{Pozostałe\npola OK?}
    VALIDATE -- Nie --> ERROTHER[Pokaż błędy]
    VALIDATE -- Tak --> ENABLE[Enable Submit]
    ENABLE --> SUBMIT[Klik Submit]
    SUBMIT --> SAVE[Zapisz pracownika]
    SAVE --> CLOSE[Zamknij panel]
    CLOSE --> REFRESH[Odśwież tabelę pracowników]
```

## 3. Delete Project — przepływ

```mermaid
sequenceDiagram
    participant U as Użytkownik
    participant T as Tabela
    participant D as Dialog
    participant DB as Storage

    U->>T: Klik Delete (projekt)
    T->>D: Confirm "Usuń projekt X?"
    D-->>U: Wyświetl dialog
    U->>D: Potwierdź
    D->>DB: Usuń assignments pracowników
    D->>DB: Usuń projekt
    DB-->>T: Odśwież obie tabele
```

## 4. Inline editing — stany komórki

```mermaid
stateDiagram-v2
    [*] --> Display: renderuj wartość
    Display --> Editing: klik na komórkę
    Editing --> Saving: blur / Enter
    Editing --> Display: Escape (anuluj)
    Saving --> Display: zapisz + odśwież
```

## 5. Walidacja formularza — maszyna stanów

```mermaid
stateDiagram-v2
    [*] --> Pristine: formularz otwarty
    Pristine --> Touched: pierwsze wpisanie
    Touched --> Valid: wszystkie reguły OK
    Touched --> Invalid: naruszenie reguły
    Invalid --> Valid: poprawka
    Valid --> Invalid: nowa zmiana
    Valid --> Submitted: klik Submit
    Submitted --> [*]: zamknij panel
```

## 6. Struktura tabeli projektów

```mermaid
graph LR
    TABLE[table#projects-table] --> THEAD[thead]
    TABLE --> TBODY[tbody]
    THEAD --> TH1[Company ⇅⌕]
    THEAD --> TH2[Project ⇅⌕]
    THEAD --> TH3[Budget ⇅]
    THEAD --> TH4[Capacity ⇅]
    THEAD --> TH5[Employees]
    THEAD --> TH6[Income ⇅]
    THEAD --> TH7[Actions]
    TBODY --> TR[tr × N projektów]
```

## 7. Struktura tabeli pracowników

```mermaid
graph LR
    TABLE[table#employees-table] --> THEAD[thead]
    TABLE --> TBODY[tbody]
    THEAD --> TH1[Name ⇅⌕]
    THEAD --> TH2[Surname ⇅⌕]
    THEAD --> TH3[Age ⇅]
    THEAD --> TH4[Position ⇅⌕]
    THEAD --> TH5[Salary ⇅]
    THEAD --> TH6[Est. Payment ⇅]
    THEAD --> TH7[Project]
    THEAD --> TH8[Proj. Income ⇅]
    THEAD --> TH9[Actions]
```
