import express from 'express';
import pool from '../db/connection.js';

const router = express.Router();

// Create a new link
router.post('/', async (req, res) => {
  try {
    const { category_id, name, url, open_mode = 'app', iframe_compatible = true, sort_order } = req.body;
    const id = Date.now().toString();
    
    await pool.query(
      'INSERT INTO links (id, category_id, name, url, open_mode, iframe_compatible, sort_order) VALUES ($1, $2, $3, $4, $5, $6, $7)',
      [id, category_id, name, url, open_mode, iframe_compatible, sort_order || 0]
    );
    
    res.json({
      id,
      category_id,
      name,
      url,
      openMode: open_mode,
      iframeCompatible: iframe_compatible,
      sort_order: sort_order || 0
    });
  } catch (error) {
    console.error('Error creating link:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ error: 'Failed to create link', details: error.message });
  }
});

// Update a link
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, url, open_mode, iframe_compatible, sort_order } = req.body;
    
    const updates = [];
    const values = [];
    let paramIndex = 1;
    
    if (name !== undefined) {
      updates.push(`name = $${paramIndex++}`);
      values.push(name);
    }
    if (url !== undefined) {
      updates.push(`url = $${paramIndex++}`);
      values.push(url);
    }
    if (open_mode !== undefined) {
      updates.push(`open_mode = $${paramIndex++}`);
      values.push(open_mode);
    }
    if (iframe_compatible !== undefined) {
      updates.push(`iframe_compatible = $${paramIndex++}`);
      values.push(iframe_compatible);
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
      `UPDATE links SET ${updates.join(', ')} WHERE id = ${whereParam}`,
      values
    );
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error updating link:', error);
    res.status(500).json({ error: 'Failed to update link' });
  }
});

// Delete a link
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM links WHERE id = $1', [id]);
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting link:', error);
    res.status(500).json({ error: 'Failed to delete link' });
  }
});

export default router;
