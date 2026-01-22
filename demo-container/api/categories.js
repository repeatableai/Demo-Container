import express from 'express';
import pool from '../db/connection.js';

const router = express.Router();

// Get all categories with their links
router.get('/', async (req, res) => {
  try {
    const categoriesResult = await pool.query(
      'SELECT * FROM categories ORDER BY sort_order ASC'
    );
    const categories = categoriesResult.rows;
    
    const linksResult = await pool.query(
      'SELECT * FROM links ORDER BY sort_order ASC'
    );
    const links = linksResult.rows;
    
    // Group links by category
    const categoriesWithLinks = categories.map(category => ({
      ...category,
      expanded: Boolean(category.expanded),
      links: links
        .filter(link => link.category_id === category.id)
        .map(link => ({
          ...link,
          iframeCompatible: Boolean(link.iframe_compatible),
          openMode: link.open_mode
        }))
    }));
    
    res.json(categoriesWithLinks);
  } catch (error) {
    console.error('Error fetching categories:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ error: 'Failed to fetch categories', details: error.message });
  }
});

// Create a new category
router.post('/', async (req, res) => {
  try {
    const { name, expanded = false, sort_order } = req.body;
    const id = Date.now().toString();
    
    await pool.query(
      'INSERT INTO categories (id, name, expanded, sort_order) VALUES ($1, $2, $3, $4)',
      [id, name, expanded, sort_order || 0]
    );
    
    res.json({ id, name, expanded, sort_order: sort_order || 0, links: [] });
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({ error: 'Failed to create category' });
  }
});

  // Update a category
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, expanded, sort_order } = req.body;
    
    const updates = [];
    const values = [];
    let paramIndex = 1;
    
    if (name !== undefined) {
      updates.push(`name = $${paramIndex++}`);
      values.push(name);
    }
    if (expanded !== undefined) {
      updates.push(`expanded = $${paramIndex++}`);
      values.push(expanded);
    }
    if (sort_order !== undefined) {
      updates.push(`sort_order = $${paramIndex++}`);
      values.push(sort_order);
    }
    
    if (updates.length === 0) {
      return res.json({ success: true });
    }
    
    values.push(id);
    const whereParam = `$${paramIndex}`;
    
    await pool.query(
      `UPDATE categories SET ${updates.join(', ')} WHERE id = ${whereParam}`,
      values
    );
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error updating category:', error);
    res.status(500).json({ error: 'Failed to update category' });
  }
});

// Delete a category
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM categories WHERE id = $1', [id]);
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({ error: 'Failed to delete category' });
  }
});

export default router;
