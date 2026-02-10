const API_BASE = 'http://localhost:5000/api/items';

export async function fetchItems({ search = '', status = '', page = 1, pageSize = 10, sort = 'createdAt', order = 'desc' } = {}) {
  const params = new URLSearchParams({
    search,
    status,
    page: String(page),
    pageSize: String(pageSize),
    sort,
    order
  });

  const response = await fetch(`${API_BASE}?${params}`);
  if (!response.ok) {
    throw new Error('Failed to fetch items');
  }
  return response.json();
}

export async function fetchItem(id) {
  const response = await fetch(`${API_BASE}/${id}`);
  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('Item not found');
    }
    throw new Error('Failed to fetch item');
  }
  return response.json();
}

export async function createItem(data) {
  const response = await fetch(API_BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });

  const result = await response.json();

  if (!response.ok) {
    const error = new Error(result.message || 'Failed to create item');
    error.status = response.status;
    error.errors = result.errors;
    throw error;
  }

  return result;
}

export async function updateItem(id, data) {
  const response = await fetch(`${API_BASE}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });

  const result = await response.json();

  if (!response.ok) {
    const error = new Error(result.message || 'Failed to update item');
    error.status = response.status;
    error.errors = result.errors;
    throw error;
  }

  return result;
}

export async function deleteItem(id) {
  const response = await fetch(`${API_BASE}/${id}`, {
    method: 'DELETE'
  });

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('Item not found');
    }
    throw new Error('Failed to delete item');
  }

  return true;
}
