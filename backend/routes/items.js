const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const InventoryItem = require('../models/InventoryItem');
const { validateItem } = require('../validators/itemValidator');

// GET /api/items - List items with search, filter, pagination, sort
router.get('/', async (req, res) => {
  try {
    const {
      search = '',
      status = '',
      page = 1,
      pageSize = 10,
      sort = 'createdAt',
      order = 'desc'
    } = req.query;

    const pageNum = Math.max(1, parseInt(page));
    const pageSizeNum = Math.max(1, Math.min(100, parseInt(pageSize)));
    const offset = (pageNum - 1) * pageSizeNum;

    // Allowed sort columns
    const allowedSortColumns = ['sku', 'name', 'category', 'quantity', 'unitPrice', 'status', 'updatedAt', 'createdAt'];
    const sortColumn = allowedSortColumns.includes(sort) ? sort : 'updatedAt';
    const sortOrder = order.toLowerCase() === 'asc' ? 1 : -1;

    // Build filter
    const filter = {};

    if (search) {
      const searchRegex = new RegExp(search, 'i');
      filter.$or = [
        { sku: searchRegex },
        { name: searchRegex },
        { category: searchRegex },
        { supplier: searchRegex },
      ];
    }

    if (status && ['active', 'inactive'].includes(status)) {
      filter.status = status;
    }

    // Get total count
    const total = await InventoryItem.countDocuments(filter);

    // Get paginated data
    const data = await InventoryItem.find(filter)
      .sort({ [sortColumn]: sortOrder })
      .skip(offset)
      .limit(pageSizeNum);

    res.json({
      data,
      meta: {
        page: pageNum,
        pageSize: pageSizeNum,
        total
      }
    });
  } catch (error) {
    console.error('Error fetching items:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// GET /api/items/:id - Get single item
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ message: 'Item not found' });
    }

    const item = await InventoryItem.findById(id);

    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    res.json(item);
  } catch (error) {
    console.error('Error fetching item:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// POST /api/items - Create item
router.post('/', async (req, res) => {
  try {
    const { sku, name, category, quantity, unitPrice, supplier, status, note } = req.body;

    // Validate
    const validation = validateItem(req.body);
    if (!validation.isValid) {
      return res.status(400).json({ message: 'Validation failed', errors: validation.errors });
    }

    // Check duplicate SKU
    const existing = await InventoryItem.findOne({ sku });
    if (existing) {
      return res.status(409).json({
        message: 'Duplicate SKU',
        errors: { sku: 'This SKU already exists' }
      });
    }

    // Create
    const item = new InventoryItem({
      sku,
      name,
      category: category || null,
      quantity: parseInt(quantity),
      unitPrice: parseFloat(unitPrice),
      supplier: supplier || null,
      status,
      note: note || null,
    });

    await item.save();

    res.status(201).json(item);
  } catch (error) {
    console.error('Error creating item:', error);
    if (error.code === 11000) {
      return res.status(409).json({
        message: 'Duplicate SKU',
        errors: { sku: 'This SKU already exists' }
      });
    }
    res.status(500).json({ message: 'Internal server error' });
  }
});

// PUT /api/items/:id - Update item
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { sku, name, category, quantity, unitPrice, supplier, status, note } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ message: 'Item not found' });
    }

    // Validate
    const validation = validateItem(req.body, true);
    if (!validation.isValid) {
      return res.status(400).json({ message: 'Validation failed', errors: validation.errors });
    }

    // Check if item exists
    const existingItem = await InventoryItem.findById(id);
    if (!existingItem) {
      return res.status(404).json({ message: 'Item not found' });
    }

    // Check duplicate SKU (excluding current item)
    const duplicate = await InventoryItem.findOne({ sku, _id: { $ne: id } });
    if (duplicate) {
      return res.status(409).json({
        message: 'Duplicate SKU',
        errors: { sku: 'This SKU already exists' }
      });
    }

    // Update
    const updated = await InventoryItem.findByIdAndUpdate(
      id,
      {
        sku,
        name,
        category: category || null,
        quantity: parseInt(quantity),
        unitPrice: parseFloat(unitPrice),
        supplier: supplier || null,
        status,
        note: note || null,
      },
      { new: true, runValidators: true }
    );

    res.json(updated);
  } catch (error) {
    console.error('Error updating item:', error);
    if (error.code === 11000) {
      return res.status(409).json({
        message: 'Duplicate SKU',
        errors: { sku: 'This SKU already exists' }
      });
    }
    res.status(500).json({ message: 'Internal server error' });
  }
});

// DELETE /api/items/:id - Delete item
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ message: 'Item not found' });
    }

    const result = await InventoryItem.findByIdAndDelete(id);

    if (!result) {
      return res.status(404).json({ message: 'Item not found' });
    }

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting item:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
