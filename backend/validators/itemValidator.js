// Validation rules based on inventory-react-crud.md

function validateItem(data, isUpdate = false) {
  const errors = {};

  // SKU validation (required, 3-50 chars, alphanumeric + hyphen + underscore)
  if (!data.sku || data.sku.trim() === '') {
    errors.sku = 'SKU is required';
  } else if (data.sku.length < 3 || data.sku.length > 50) {
    errors.sku = 'SKU must be between 3 and 50 characters';
  } else if (!/^[a-zA-Z0-9_-]+$/.test(data.sku)) {
    errors.sku = 'SKU can only contain letters, numbers, hyphen (-) and underscore (_)';
  }

  // Name validation (required, 2-200 chars)
  if (!data.name || data.name.trim() === '') {
    errors.name = 'Name is required';
  } else if (data.name.length < 2 || data.name.length > 200) {
    errors.name = 'Name must be between 2 and 200 characters';
  }

  // Category validation (optional, max 100 chars)
  if (data.category && data.category.length > 100) {
    errors.category = 'Category must be at most 100 characters';
  }

  // Quantity validation (required, integer >= 0)
  if (data.quantity === undefined || data.quantity === null || data.quantity === '') {
    errors.quantity = 'Quantity is required';
  } else {
    const qty = Number(data.quantity);
    if (!Number.isInteger(qty)) {
      errors.quantity = 'Quantity must be an integer';
    } else if (qty < 0) {
      errors.quantity = 'Quantity must be >= 0';
    }
  }

  // Unit Price validation (required, number >= 0, max 2 decimal places)
  if (data.unitPrice === undefined || data.unitPrice === null || data.unitPrice === '') {
    errors.unitPrice = 'Unit Price is required';
  } else {
    const price = Number(data.unitPrice);
    if (isNaN(price)) {
      errors.unitPrice = 'Unit Price must be a number';
    } else if (price < 0) {
      errors.unitPrice = 'Unit Price must be >= 0';
    } else {
      // Check max 2 decimal places
      const decimalPart = data.unitPrice.toString().split('.')[1];
      if (decimalPart && decimalPart.length > 2) {
        errors.unitPrice = 'Unit Price can have at most 2 decimal places';
      }
    }
  }

  // Supplier validation (optional, max 200 chars)
  if (data.supplier && data.supplier.length > 200) {
    errors.supplier = 'Supplier must be at most 200 characters';
  }

  // Status validation (required, active or inactive)
  if (!data.status || data.status.trim() === '') {
    errors.status = 'Status is required';
  } else if (!['active', 'inactive'].includes(data.status)) {
    errors.status = 'Status must be "active" or "inactive"';
  }

  // Note validation (optional, max 500 chars)
  if (data.note && data.note.length > 500) {
    errors.note = 'Note must be at most 500 characters';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

module.exports = { validateItem };
