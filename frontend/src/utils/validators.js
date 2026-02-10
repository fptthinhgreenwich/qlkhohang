export function validateItem(data) {
  const errors = {};

  // SKU validation
  if (!data.sku || data.sku.trim() === '') {
    errors.sku = 'SKU is required';
  } else if (data.sku.length < 3 || data.sku.length > 50) {
    errors.sku = 'SKU must be 3-50 characters';
  } else if (!/^[a-zA-Z0-9_-]+$/.test(data.sku)) {
    errors.sku = 'Only letters, numbers, hyphen, underscore allowed';
  }

  // Name validation
  if (!data.name || data.name.trim() === '') {
    errors.name = 'Name is required';
  } else if (data.name.length < 2 || data.name.length > 200) {
    errors.name = 'Name must be 2-200 characters';
  }

  // Category validation
  if (data.category && data.category.length > 100) {
    errors.category = 'Category must be at most 100 characters';
  }

  // Quantity validation
  if (data.quantity === undefined || data.quantity === null || data.quantity === '') {
    errors.quantity = 'Quantity is required';
  } else {
    const qty = Number(data.quantity);
    if (!Number.isInteger(qty)) {
      errors.quantity = 'Must be a whole number';
    } else if (qty < 0) {
      errors.quantity = 'Cannot be negative';
    }
  }

  // Unit Price validation
  if (data.unitPrice === undefined || data.unitPrice === null || data.unitPrice === '') {
    errors.unitPrice = 'Unit price is required';
  } else {
    const price = Number(data.unitPrice);
    if (isNaN(price)) {
      errors.unitPrice = 'Must be a number';
    } else if (price < 0) {
      errors.unitPrice = 'Cannot be negative';
    } else {
      const decimalPart = String(data.unitPrice).split('.')[1];
      if (decimalPart && decimalPart.length > 2) {
        errors.unitPrice = 'Max 2 decimal places';
      }
    }
  }

  // Supplier validation
  if (data.supplier && data.supplier.length > 200) {
    errors.supplier = 'Supplier must be at most 200 characters';
  }

  // Status validation
  if (!data.status || data.status.trim() === '') {
    errors.status = 'Status is required';
  } else if (!['active', 'inactive'].includes(data.status)) {
    errors.status = 'Must be active or inactive';
  }

  // Note validation
  if (data.note && data.note.length > 500) {
    errors.note = 'Note must be at most 500 characters';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

export function validateField(name, value, allData = {}) {
  const data = { ...allData, [name]: value };
  const { errors } = validateItem(data);
  return errors[name] || null;
}
