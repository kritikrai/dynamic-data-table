# Dynamic Data Table Manager

Built with Next.js 14 (App Router), Redux Toolkit, MUI, TypeScript, React Hook Form, PapaParse, and FileSaver.

## Features implemented
- Table view with columns: Name, Email, Age, Role
- Sorting (ASC/DESC) by clicking headers
- Global search across visible fields
- Client-side pagination (10 rows/page)
- Manage Columns modal: add, show/hide columns
- Persist column visibility to localStorage
- Import CSV (PapaParse) with error handling
- Export CSV (FileSaver) including only visible columns
- Inline editing (double-click), with Save All / Cancel All
- Row actions: Edit, Delete with confirmation
- Theme toggle (light/dark)
- Responsive layout

## How to run
1. `npm install`
2. `npm run dev`
3. Open http://localhost:3000

