-- Inventory Management Database Setup
-- SQL Server / SSMS

-- 1. Create Database
CREATE DATABASE InventoryDB;
GO
USE InventoryDB;
GO

-- 2. Create Table: InventoryItems
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

-- 3. Trigger to auto update updatedAt
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

-- 4. Sample Data
INSERT INTO dbo.InventoryItems (sku, name, category, quantity, unitPrice, supplier, status, note)
VALUES
('SKU-0001', 'USB Keyboard', 'Accessories', 25, 12.50, 'Tech Supplier A', 'active', 'Basic model'),
('SKU-0002', 'Wireless Mouse', 'Accessories', 40, 9.99,  'Tech Supplier B', 'active', NULL),
('SKU-0003', '27-inch Monitor', 'Display',     10, 149.00,'Tech Supplier A', 'inactive', 'Discontinued');
GO
