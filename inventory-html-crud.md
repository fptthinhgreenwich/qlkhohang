# Inventory Management (HTML/CSS/JS + SQL Server) — Simple CRUD + Validation

Goal: Build a simple inventory management app with pure HTML/CSS/JavaScript (UI) + Node/Express API + SQL Server (SSMS).
Scope: 1 table only, full CRUD, full validation, minimal UI/UX. No frameworks (no React, Vue, Angular).

---

## 1) Database (SQL Server / SSMS)

### 1.1 Create Database
```sql
CREATE DATABASE InventoryDB;
GO
USE InventoryDB;
GO
```

### 1.2 Create Table (1 table only)
Table name: `InventoryItems`

```sql
CREATE TABLE dbo.InventoryItems (
  id           INT IDENTITY(1,1) PRIMARY KEY,
  sku          NVARCHAR(50)  NOT NULL UNIQUE,
  name         NVARCHAR(200) NOT NULL,
  category     NVARCHAR(100) NULL,
  quantity     INT           NOT NULL CONSTRAINT CK_InventoryItems_Quantity CHECK (quantity >= 0),
  unitPrice    DECIMAL(18,2) NOT NULL CONSTRAINT CK_InventoryItems_UnitPrice CHECK (unitPrice >= 0),
  supplier     NVARCHAR(200) NULL,
  status       NVARCHAR(20)  NOT NULL CONSTRAINT DF_InventoryItems_Status DEFAULT ('active'), -- active | inactive
  note         NVARCHAR(500) NULL,
  createdAt    DATETIME2     NOT NULL CONSTRAINT DF_InventoryItems_CreatedAt DEFAULT (SYSDATETIME()),
  updatedAt    DATETIME2     NOT NULL CONSTRAINT DF_InventoryItems_UpdatedAt DEFAULT (SYSDATETIME())
);
GO
```

### 1.3 Optional: Trigger to auto update updatedAt
```sql
CREATE TRIGGER dbo.TR_InventoryItems_UpdateTimestamp
ON dbo.InventoryItems
AFTER UPDATE
AS
BEGIN
  SET NOCOUNT ON;
  UPDATE i
  SET updatedAt = SYSDATETIME()
  FROM dbo.InventoryItems i
  INNER JOIN inserted ins ON i.id = ins.id;
END
GO
```

### 1.4 Sample Data
```sql
INSERT INTO dbo.InventoryItems (sku, name, category, quantity, unitPrice, supplier, status, note)
VALUES
('SKU-0001', 'USB Keyboard', 'Accessories', 25, 12.50, 'Tech Supplier A', 'active', 'Basic model'),
('SKU-0002', 'Wireless Mouse', 'Accessories', 40, 9.99,  'Tech Supplier B', 'active', NULL),
('SKU-0003', '27-inch Monitor', 'Display',     10, 149.00,'Tech Supplier A', 'inactive', 'Discontinued');
GO
```

---

## 2) Business Rules & Validation (Must Implement)

### 2.1 Field Rules
- `sku` (required)
  - length: 3..50
  - allowed: letters, numbers, hyphen `-`, underscore `_`
  - must be unique
- `name` (required)
  - length: 2..200
- `category` (optional)
  - length: 0..100
- `quantity` (required)
  - integer >= 0
- `unitPrice` (required)
  - number >= 0 (allow decimals)
  - max 2 decimal places
- `supplier` (optional)
  - length: 0..200
- `status` (required)
  - enum: `active` | `inactive`
- `note` (optional)
  - length: 0..500

### 2.2 API Response Errors
Return consistent validation errors:
```json
{
  "message": "Validation failed",
  "errors": {
    "sku": "SKU is required",
    "quantity": "Quantity must be >= 0"
  }
}
```

### 2.3 Prevent Dangerous Actions
- Delete: confirm modal before deleting
- Disallow negative quantity/unitPrice both client + server
- Handle unique constraint (duplicate SKU): show friendly error

---

## 3) REST API Spec (Node/Express)

Base URL: `/api/items`

### 3.1 Endpoints
1) GET list (with search + pagination)
- `GET /api/items?search=&status=&page=1&pageSize=10&sort=updatedAt&order=desc`
- search applies to: sku, name, category, supplier

Response:
```json
{
  "data": [
    {
      "id": 1,
      "sku": "SKU-0001",
      "name": "USB Keyboard",
      "category": "Accessories",
      "quantity": 25,
      "unitPrice": 12.5,
      "supplier": "Tech Supplier A",
      "status": "active",
      "note": "Basic model",
      "createdAt": "2026-02-06T00:00:00.000Z",
      "updatedAt": "2026-02-06T00:00:00.000Z"
    }
  ],
  "meta": { "page": 1, "pageSize": 10, "total": 3 }
}
```

2) GET detail
- `GET /api/items/:id`

3) CREATE
- `POST /api/items`
Body:
```json
{
  "sku": "SKU-1001",
  "name": "Laptop Stand",
  "category": "Accessories",
  "quantity": 12,
  "unitPrice": 19.99,
  "supplier": "Tech Supplier C",
  "status": "active",
  "note": ""
}
```

4) UPDATE
- `PUT /api/items/:id`
Same body as create.

5) DELETE
- `DELETE /api/items/:id`

### 3.2 Server-side Requirements
- Validate all inputs (same rules as section 2)
- Use parameterized queries (avoid SQL injection)
- Handle 404 for non-existing id
- Duplicate SKU -> 409 Conflict with friendly message
- Return 201 on create, 200 on update, 204 on delete

---

## 4) Frontend UI Spec (Pure HTML/CSS/JS)

### 4.1 Tech Stack
- **HTML5** — semantic markup
- **CSS3** — custom styling (no Bootstrap, no Tailwind, no framework)
- **Vanilla JavaScript** — no jQuery, no React, no Vue
- **Fetch API** — for HTTP requests to backend

### 4.2 File Structure
```
frontend/
├── index.html          # Single page (entry point)
├── css/
│   └── style.css       # All styles
└── js/
    ├── app.js           # Main app: init, event listeners, orchestration
    ├── api.js           # All fetch calls to backend API
    ├── ui.js            # DOM manipulation: render table, modal, toast, pagination
    └── validators.js    # Client-side validation logic
```

### 4.3 Page Layout (index.html)
Single page layout — all sections in one HTML file:

```
┌─────────────────────────────────────────────────┐
│  Header: "Inventory Management"                 │
├─────────────────────────────────────────────────┤
│  Toolbar:                                       │
│  [Search input] [Status filter ▼] [+ Add Item]  │
├─────────────────────────────────────────────────┤
│  Table:                                         │
│  SKU | Name | Category | Qty | Price | Status   │
│       | Updated | Actions (Edit / Delete)       │
├─────────────────────────────────────────────────┤
│  Pagination:                                    │
│  [< Prev] Page 1 of 3 [Next >] [PageSize ▼]    │
└─────────────────────────────────────────────────┘

<!-- Modal overlay (hidden by default) -->
┌─────────────────────────────────────────────────┐
│  Modal: Add / Edit Item                         │
│  ┌─────────────────────────────────────────┐    │
│  │ SKU:        [____________]  error msg   │    │
│  │ Name:       [____________]  error msg   │    │
│  │ Category:   [____________]              │    │
│  │ Quantity:   [____________]  error msg   │    │
│  │ Unit Price: [____________]  error msg   │    │
│  │ Supplier:   [____________]              │    │
│  │ Status:     [active ▼    ]              │    │
│  │ Note:       [____________]              │    │
│  │                                         │    │
│  │       [Cancel]  [Save]                  │    │
│  └─────────────────────────────────────────┘    │
└─────────────────────────────────────────────────┘

<!-- Confirm dialog (hidden by default) -->
┌─────────────────────────────────────────────────┐
│  "Are you sure you want to delete {name}?"      │
│           [Cancel]  [Delete]                    │
└─────────────────────────────────────────────────┘
```

### 4.4 Table Columns
| SKU | Name | Category | Qty | Unit Price | Status | Updated | Actions |

- Actions column: Edit button, Delete button
- Status: show as badge/tag (green for active, gray for inactive)
- Unit Price: format with 2 decimals (e.g., `$12.50`)
- Updated: format as readable date (e.g., `2026-02-06 14:30`)

### 4.5 Form Fields (in Modal)
- SKU (text input)
- Name (text input)
- Category (text input)
- Quantity (number input)
- Unit Price (number input, step="0.01")
- Supplier (text input)
- Status (select: active / inactive)
- Note (textarea)

### 4.6 Client Validation UX
- Validate on form submit
- Validate individual field on blur (when user leaves field)
- Show inline error message (`<span class="error-msg">`) under each invalid field
- Highlight invalid field border in red
- Disable "Save" button while API call is in progress (prevent double submit)
- If server returns `errors` object -> map each key to the corresponding field error
- Toast notification for success ("Item created successfully") and failure ("Failed to save item")

### 4.7 Modal Behavior
- "Add Item" button -> open modal with empty form, title = "Add New Item"
- Edit button in table row -> open modal pre-filled with item data, title = "Edit Item"
- Close modal: click Cancel, click overlay backdrop, or press Escape
- On successful save -> close modal, refresh table, show success toast

### 4.8 Confirm Dialog Behavior
- Delete button -> show confirm dialog with item name
- Confirm -> call DELETE API -> refresh table -> show success toast
- Cancel -> close dialog, do nothing

### 4.9 Search & Filter
- Search input: debounce 300ms, then call API with `search` param
- Status filter dropdown: All / Active / Inactive -> call API with `status` param
- Both reset to page 1 when changed

### 4.10 Pagination
- Show: "Page X of Y" or "Showing 1-10 of 25"
- Prev / Next buttons (disabled at boundaries)
- Page size selector: 5 / 10 / 20

---

## 5) JavaScript Module Details

### 5.1 api.js — API Functions
```js
// All functions return Promise
async function fetchItems({ search, status, page, pageSize, sort, order })
async function fetchItem(id)
async function createItem(data)
async function updateItem(id, data)
async function deleteItem(id)
```
- Use `fetch()` with proper headers (`Content-Type: application/json`)
- Handle non-OK responses: parse error body, throw/return error object
- Base URL configurable: `const API_BASE = 'http://localhost:3000/api/items'`

### 5.2 validators.js — Validation Functions
```js
function validateItemForm(formData)
// Returns: { valid: boolean, errors: { fieldName: "error message", ... } }
```
- Same rules as section 2.1
- Return errors object with field name as key, error message as value
- If valid, errors object is empty

### 5.3 ui.js — DOM Rendering
```js
function renderTable(items)           // Build <tbody> rows from items array
function renderPagination(meta)       // Build pagination controls
function openModal(mode, item?)       // Show modal: mode = 'create' | 'edit'
function closeModal()                 // Hide modal, reset form
function showConfirmDialog(item)      // Show delete confirm
function closeConfirmDialog()         // Hide confirm
function showToast(message, type)     // type = 'success' | 'error'
function showFieldErrors(errors)      // Display inline errors on form fields
function clearFieldErrors()           // Remove all inline errors
function setSubmitLoading(loading)    // Disable/enable save button
```

### 5.4 app.js — Main Orchestration
```js
// State
let currentPage = 1;
let currentPageSize = 10;
let currentSearch = '';
let currentStatus = '';
let currentSort = 'updatedAt';
let currentOrder = 'desc';
let editingItemId = null;  // null = create mode, number = edit mode

// Init
document.addEventListener('DOMContentLoaded', init);

function init() {
  // Attach event listeners
  // Load initial data
  loadItems();
}

async function loadItems() { ... }
function handleSearch(e) { ... }
function handleStatusFilter(e) { ... }
function handleAddClick() { ... }
function handleEditClick(id) { ... }
function handleDeleteClick(id, name) { ... }
function handleFormSubmit(e) { ... }
function handlePageChange(page) { ... }
function handlePageSizeChange(size) { ... }
```

---

## 6) CSS Styling Guidelines

### 6.1 General
- Clean, minimal design
- Use CSS custom properties (variables) for colors:
```css
:root {
  --color-primary: #4f46e5;
  --color-primary-hover: #4338ca;
  --color-danger: #dc2626;
  --color-danger-hover: #b91c1c;
  --color-success: #16a34a;
  --color-gray-50: #f9fafb;
  --color-gray-100: #f3f4f6;
  --color-gray-200: #e5e7eb;
  --color-gray-300: #d1d5db;
  --color-gray-500: #6b7280;
  --color-gray-700: #374151;
  --color-gray-900: #111827;
  --border-radius: 6px;
  --shadow-sm: 0 1px 2px rgba(0,0,0,0.05);
  --shadow-md: 0 4px 6px rgba(0,0,0,0.1);
  --shadow-lg: 0 10px 15px rgba(0,0,0,0.1);
}
```

### 6.2 Table Styling
- Bordered, striped rows (alternate row background)
- Hover highlight on rows
- Responsive: horizontal scroll on small screens (`overflow-x: auto`)
- Fixed header if possible

### 6.3 Modal Styling
- Centered overlay with semi-transparent backdrop
- Card-style modal box with shadow
- Smooth open/close (CSS transition or simple toggle)

### 6.4 Form Styling
- Label above input
- Input full width within modal
- Error state: red border + red error text below field
- Consistent padding/spacing

### 6.5 Button Styling
- Primary button (Add/Save): solid primary color
- Danger button (Delete): solid red
- Ghost/outline button (Cancel): border only
- Disabled state: reduced opacity, no pointer

### 6.6 Toast/Notification
- Fixed position top-right
- Auto-dismiss after 3 seconds
- Green for success, red for error
- Slide-in animation

### 6.7 Status Badge
- `active`: green background, white text
- `inactive`: gray background, white text
- Small rounded pill shape

---

## 7) Backend Serves Frontend (Static Files)

Express serves the `frontend/` folder as static files:
```js
app.use(express.static('frontend'));
```
- Access UI at: `http://localhost:3000/`
- API at: `http://localhost:3000/api/items`
- No separate dev server needed — one single `node server.js` runs everything

---

## 8) Acceptance Criteria (Done = Pass)

1) CRUD works end-to-end (HTML page -> Fetch API -> Express -> SQL Server)
2) Validation works in BOTH:
   - client side (vanilla JS)
   - server side (Express API)
3) Duplicate SKU:
   - cannot create/update to an existing SKU
   - UI shows friendly error
4) Table supports:
   - search (debounced)
   - status filter
   - pagination (page/pageSize)
   - sort by updatedAt (default desc)
5) Delete requires confirmation dialog
6) UI clean, minimal, consistent spacing
7) No external CSS/JS frameworks — pure HTML/CSS/JS only
8) Single page — no routing, no page reloads (all via fetch + DOM manipulation)

---

## 9) Test Checklist (Manual)

- Create item with empty sku -> error shown inline
- Create item with invalid sku characters (e.g., `sku@#$`) -> error
- Create item with negative quantity -> error
- Create item with unitPrice 10.999 (3 decimals) -> error
- Create item with duplicate sku -> 409 + friendly UI error
- Update item changes updatedAt timestamp
- Delete item shows confirm -> confirm -> item removed from table
- Delete item shows confirm -> cancel -> nothing happens
- Search works across sku/name/category/supplier
- Filter active/inactive works
- Pagination works with pageSize = 5 / 10 / 20
- Modal opens for Add (empty form) and Edit (pre-filled form)
- Modal closes on Cancel / backdrop click / Escape key
- Toast appears on success and error
- Form fields validate on blur
- Save button disabled during API call
- Page works with JavaScript only (no page reload for any action)

---

## 10) Notes (Keep It Simple)

- No authentication
- No multi-table relations
- No upload images
- Only one page in UI
- One table only in DB
- No external libraries (no jQuery, no Bootstrap, no Tailwind, no React)
- All frontend code is vanilla HTML/CSS/JS
- Backend serves both API and static frontend files
