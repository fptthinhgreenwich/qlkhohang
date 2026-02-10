# Validation Rules - Inventory Management

## Tổng quan

Ứng dụng validate dữ liệu ở **2 tầng**:
- **Client-side** (React): Validate ngay khi user nhập liệu
- **Server-side** (Node/Express): Validate trước khi lưu vào database

---

## Chi tiết Validation theo Field

### 1. SKU (Mã sản phẩm)

| Rule | Mô tả | Error Message |
|------|-------|---------------|
| Required | Bắt buộc nhập | `SKU is required` |
| Min length | Tối thiểu 3 ký tự | `SKU must be 3-50 characters` |
| Max length | Tối đa 50 ký tự | `SKU must be 3-50 characters` |
| Pattern | Chỉ cho phép: chữ cái, số, gạch ngang `-`, gạch dưới `_` | `Only letters, numbers, hyphen, underscore allowed` |
| Unique | Không được trùng với SKU khác | `This SKU already exists` (HTTP 409) |

**Ví dụ hợp lệ:** `SKU-0001`, `PROD_123`, `ABC123`
**Ví dụ không hợp lệ:** `SK` (quá ngắn), `SKU@001` (ký tự đặc biệt), `SKU 001` (có khoảng trắng)

---

### 2. Name (Tên sản phẩm)

| Rule | Mô tả | Error Message |
|------|-------|---------------|
| Required | Bắt buộc nhập | `Name is required` |
| Min length | Tối thiểu 2 ký tự | `Name must be 2-200 characters` |
| Max length | Tối đa 200 ký tự | `Name must be 2-200 characters` |

**Ví dụ hợp lệ:** `USB Keyboard`, `Wireless Mouse`
**Ví dụ không hợp lệ:** `A` (quá ngắn)

---

### 3. Category (Danh mục)

| Rule | Mô tả | Error Message |
|------|-------|---------------|
| Optional | Không bắt buộc | - |
| Max length | Tối đa 100 ký tự | `Category must be at most 100 characters` |

**Ví dụ hợp lệ:** `Accessories`, `Electronics`, `Display`

---

### 4. Quantity (Số lượng)

| Rule | Mô tả | Error Message |
|------|-------|---------------|
| Required | Bắt buộc nhập | `Quantity is required` |
| Integer | Phải là số nguyên | `Must be a whole number` |
| Non-negative | Không được âm (>= 0) | `Cannot be negative` |

**Ví dụ hợp lệ:** `0`, `10`, `999`
**Ví dụ không hợp lệ:** `-5` (số âm), `10.5` (số thập phân)

---

### 5. Unit Price (Đơn giá)

| Rule | Mô tả | Error Message |
|------|-------|---------------|
| Required | Bắt buộc nhập | `Unit price is required` |
| Number | Phải là số | `Must be a number` |
| Non-negative | Không được âm (>= 0) | `Cannot be negative` |
| Decimal places | Tối đa 2 chữ số thập phân | `Max 2 decimal places` |

**Ví dụ hợp lệ:** `0`, `10`, `99.99`, `149.5`
**Ví dụ không hợp lệ:** `-10` (số âm), `10.999` (quá 2 số thập phân)

---

### 6. Supplier (Nhà cung cấp)

| Rule | Mô tả | Error Message |
|------|-------|---------------|
| Optional | Không bắt buộc | - |
| Max length | Tối đa 200 ký tự | `Supplier must be at most 200 characters` |

**Ví dụ hợp lệ:** `Tech Supplier A`, `ABC Company`

---

### 7. Status (Trạng thái)

| Rule | Mô tả | Error Message |
|------|-------|---------------|
| Required | Bắt buộc chọn | `Status is required` |
| Enum | Chỉ 2 giá trị: `active` hoặc `inactive` | `Must be active or inactive` |

**Giá trị hợp lệ:** `active`, `inactive`

---

### 8. Note (Ghi chú)

| Rule | Mô tả | Error Message |
|------|-------|---------------|
| Optional | Không bắt buộc | - |
| Max length | Tối đa 500 ký tự | `Note must be at most 500 characters` |

---

## HTTP Error Codes

| Code | Tình huống | Response Body |
|------|------------|---------------|
| `400` | Validation failed | `{ "message": "Validation failed", "errors": { "field": "error message" } }` |
| `404` | Item không tồn tại | `{ "message": "Item not found" }` |
| `409` | SKU bị trùng | `{ "message": "Duplicate SKU", "errors": { "sku": "This SKU already exists" } }` |
| `500` | Lỗi server | `{ "message": "Internal server error" }` |

---

## Validation Response Format

Khi validation fail, API trả về:

```json
{
  "message": "Validation failed",
  "errors": {
    "sku": "SKU is required",
    "quantity": "Cannot be negative",
    "unitPrice": "Max 2 decimal places"
  }
}
```

---

## Database Constraints (SQL Server)

Ngoài validation ở code, database cũng có constraints:

```sql
-- Quantity >= 0
CONSTRAINT CK_InventoryItems_Quantity CHECK (quantity >= 0)

-- Unit Price >= 0
CONSTRAINT CK_InventoryItems_UnitPrice CHECK (unitPrice >= 0)

-- SKU unique
sku NVARCHAR(50) NOT NULL UNIQUE

-- Status default = 'active'
CONSTRAINT DF_InventoryItems_Status DEFAULT ('active')
```

---

## Test Cases

### Các trường hợp cần test:

| Test Case | Input | Expected Result |
|-----------|-------|-----------------|
| SKU trống | `""` | Error: SKU is required |
| SKU quá ngắn | `"AB"` | Error: SKU must be 3-50 characters |
| SKU có ký tự đặc biệt | `"SKU@001"` | Error: Only letters, numbers, hyphen, underscore allowed |
| SKU trùng | `"SKU-0001"` (đã tồn tại) | Error 409: This SKU already exists |
| Quantity âm | `-5` | Error: Cannot be negative |
| Quantity là số thập phân | `10.5` | Error: Must be a whole number |
| Unit Price âm | `-10` | Error: Cannot be negative |
| Unit Price quá 2 decimal | `10.999` | Error: Max 2 decimal places |
| Status không hợp lệ | `"pending"` | Error: Must be active or inactive |
| Name quá ngắn | `"A"` | Error: Name must be 2-200 characters |

---

## Client-side Validation Behavior

1. **Validate on blur**: Khi user rời khỏi field
2. **Validate on submit**: Khi nhấn nút Create/Update
3. **Inline error**: Hiển thị lỗi ngay dưới field
4. **Disable submit**: Button bị disable khi đang saving
5. **Toast notification**: Hiển thị thông báo success/error

---

## Lưu ý quan trọng

1. **Double validation**: Luôn validate ở cả client và server
2. **Server là nguồn tin cậy cuối cùng**: Client validation có thể bị bypass
3. **Parameterized queries**: Sử dụng để chống SQL injection
4. **Confirm delete**: Luôn yêu cầu xác nhận trước khi xóa
