// routes/staff.js
import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import db from '../db.js';

const router = express.Router();

// GET /api/staff — List all staff members
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM staff ORDER BY role, name');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching staff:', error);
    res.status(500).json({ error: 'Failed to fetch staff' });
  }
});

// POST /api/staff — Add a new staff member
router.post('/', async (req, res) => {
  try {
    const { name, role } = req.body;
    const id = uuidv4();

    await db.query(
      'INSERT INTO staff (id, name, role) VALUES (?, ?, ?)',
      [id, name, role]
    );

    const newStaff = { id, name, role, is_active: true };
    res.status(201).json(newStaff);
  } catch (error) {
    console.error('Error adding staff:', error);
    res.status(500).json({ error: 'Failed to add staff member' });
  }
});

// DELETE /api/staff/:id — Remove a staff member
router.delete('/:id', async (req, res) => {
  try {
    // First, unassign this staff member from any patients
    await db.query(
      'UPDATE patients SET assigned_staff_id = NULL WHERE assigned_staff_id = ?',
      [req.params.id]
    );

    await db.query('DELETE FROM staff WHERE id = ?', [req.params.id]);

    // Notify dashboards that assignments changed
    const io = req.app.get('io');
    io.emit('patient-updated');

    res.json({ message: 'Staff member removed' });
  } catch (error) {
    console.error('Error deleting staff:', error);
    res.status(500).json({ error: 'Failed to delete staff member' });
  }
});

export default router;
