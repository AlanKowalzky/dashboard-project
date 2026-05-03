# Project Evaluation Criteria — Checklist 📊

## Score Summary: 200/200 pts
**Grading Scale:** 180-200 pts (90%+) : Excellent

### 1. Data Persistence & Monthly Snapshots (25 pts)
- [x] Data persists in localStorage and loads on page refresh (5 pts)
- [x] Each month stores independent data (5 pts)
- [x] Month/Year selectors switch correctly between periods (5 pts)
- [x] Seed Data feature correctly copies data between months (5 pts)
- [x] Vacation days are cleared during the data copy process (5 pts)

### 2. Employee CRUD Operations (15 pts)
- [x] "Add Employee" form creates new records with all fields (5 pts)
- [x] "Delete Employee" removes record and all associated assignments (5 pts)
- [x] Inline editing works for Position and Salary (5 pts)

### 3. Project CRUD Operations (10 pts)
- [x] "Add Project" form creates new records with all fields (5 pts)
- [x] "Delete Project" removes record and unassigns all employees (5 pts)

### 4. Assignment Management (20 pts)
- [x] Successfully assign employee to project with capacity and fit (8 pts)
- [x] Unassign confirmation popup shows financial impact (7 pts)
- [x] Edit assignment popup updates capacity and fit values (5 pts)

### 5. Financial Calculations (30 pts)
- [x] Effective Capacity: capacity × fit × vacation coefficient (8 pts)
- [x] Correct revenue calculation (per employee and per project) (7 pts)
- [x] Correct cost calculation (min 0.5 × salary for assignments/bench) (7 pts)
- [x] Profit/Income values are accurate and color-coded (8 pts)

### 6. Forms & Validation (15 pts)
- [x] Employee form validation (18+, names, position, salary) (5 pts)
- [x] Project form validation (name, company, budget, capacity) (5 pts)
- [x] Real-time validation and disabled submit buttons for invalid forms (5 pts)

### 7. Table Displays (15 pts)
- [x] Projects table displays all data accurately (used/total, colors) (4 pts)
- [x] Employees table displays all data accurately (age, assignments count) (4 pts)
- [x] Total Estimated Income displayed correctly below projects (4 pts)
- [x] "Assign" button disabled at maximum capacity (1.5) (3 pts)

### 8. Sorting (10 pts)
- [x] Ascending/Descending sorting works for both tables (5 pts)
- [x] Sort icons update to reflect current state (5 pts)

### 9. Filtering (10 pts)
- [x] Text and dropdown filters work for relevant columns (5 pts)
- [x] Active filter chips are displayed and individually removable (3 pts)
- [x] "Clear Filters" appears when 2 or more filters are active (2 pts)

### 10. Details Popups (15 pts)
- [x] "Show Employees" popup displays correct data and calculations (5 pts)
- [x] "Show Assignments" popup displays correct data and calculations (5 pts)
- [x] Popups feature close buttons and click-outside functionality (3 pts)
- [x] Empty state message displayed when no data exists (2 pts)

### 11. Assignment Popup Positioning (5 pts)
- [x] Popup is positioned near the trigger button and within viewport (3 pts)
- [x] Popup repositions on window scroll and resize (2 pts)

### 12. Availability Calendar (20 pts)
- [x] Calendar displays correct month/year for the viewing period (5 pts)
- [x] Weekends and today are visually highlighted (5 pts)
- [x] Vacation selection updates working days count in real-time (5 pts)
- [x] Vacation ranges are formatted correctly (DD.MM-DD.MM) (5 pts)

### 13. Navigation & UI (10 pts)
- [x] Projects/Employees tabs switch content correctly (3 pts)
- [x] Sidebar expands and collapses via toggle button (3 pts)
- [x] "See at Projects/Employees" links navigate and apply filters (4 pts)