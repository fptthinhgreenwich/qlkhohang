# Inventory Management (ReactJS + SQL Server) — Simple CRUD + Validation

Goal: Build a simple inventory management app with ReactJS (UI) + Node/Express API + SQL Server (SSMS).  
Scope: 1 table only, full CRUD, full validation, minimal UI/UX.

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

## 4) React UI Spec (Simple UI/UX)

### 4.1 Layout
Single page: `InventoryPage`
- Top bar:
  - Title: "Inventory"
  - Search input (by sku/name/category/supplier)
  - Status filter (All/Active/Inactive)
  - Button: "+ Add Item"
- Main area:
  - One table listing items
- Modal / Drawer:
  - Add/Edit form
- Confirm dialog:
  - Delete confirmation

### 4.2 Table Columns (1 table only)
| SKU | Name | Category | Qty | Unit Price | Status | Updated | Actions |
Actions: Edit, Delete

### 4.3 Form Fields
- SKU (text)
- Name (text)
- Category (text)
- Quantity (number)
- Unit Price (number)
- Supplier (text)
- Status (select: active/inactive)
- Note (textarea)

### 4.4 Client Validation UX
- Validate on submit + on blur
- Inline error messages under fields
- Disable submit button while saving
- Toast/snackbar for success/failure
- If server returns errors object -> map to fields

---

## 5) Suggested Frontend Structure (React)

Recommended folders:
- `src/api/itemsApi.js`
- `src/pages/InventoryPage.jsx`
- `src/components/ItemTable.jsx`
- `src/components/ItemFormModal.jsx`
- `src/components/ConfirmDialog.jsx`
- `src/utils/validators.js`

### 5.1 Minimal State
- `items`, `loading`, `error`
- query params: `search`, `status`, `page`, `pageSize`, `sort`, `order`
- modal state: `open`, `mode` (create/edit), `selectedItem`

---

## 6) Acceptance Criteria (Done = Pass)

1) CRUD works end-to-end (React -> API -> SQL Server)
2) Validation works in BOTH:
   - client side (React)
   - server side (API)
3) Duplicate SKU:
   - cannot create/update to an existing SKU
   - UI shows friendly message
4) Table supports:
   - search
   - status filter
   - pagination (page/pageSize)
   - sort by updatedAt (default desc)
5) Delete requires confirmation dialog
6) UI clean, minimal, consistent spacing

---

## 7) Test Checklist (Manual)

- Create item with empty sku -> error
- Create item with invalid sku characters -> error
- Create item with negative quantity -> error
- Create item with unitPrice 10.999 -> error
- Create item with duplicate sku -> 409 + UI error
- Update item changes updatedAt
- Delete item removes from list
- Search works across sku/name/category/supplier
- Filter active/inactive works
- Pagination works with pageSize=5/10

---

## 8) Notes (Keep It Simple)
- No authentication
- No multi-table relations
- No upload images
- Only one page in UI
- One table only in DB
