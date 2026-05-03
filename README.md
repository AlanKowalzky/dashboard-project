# Employee & Project Dashboard

A comprehensive management application for tracking employees, projects, and their assignments across different time periods.

## Features

- Monthly snapshot architecture — each month stores independent data
- Employee management with positions and salaries
- Project management with budgets and capacity requirements
- Assign employees to projects with capacity (0.0–1.5) and fit (0.0–1.0)
- Vacation calendar with working days calculation
- Financial projections: revenue, costs, profits per employee and project
- Seed Data — copy any month's data to current month
- Sorting and filtering on all major columns
- Collapsible sidebar navigation
- Dual-view interface: Projects / Employees

## Tech Stack

- Vanilla JavaScript (ES6+)
- HTML5
- CSS3
- localStorage (no backend, no frameworks)

## How to Run

Open `index.html` directly in a browser, or use Live Server in VS Code.

No build step required.

## Deployment

GitHub Pages: https://alankowalzky.github.io/dashboard-project

## Notes

- No jQuery, React, Vue, Angular or any external library
- All data persists in `localStorage` under key `"monthlyData"`
- Structure: `{ "YYYY-M": { employees: [], projects: [] } }`
- Sample data is auto-generated on first load
