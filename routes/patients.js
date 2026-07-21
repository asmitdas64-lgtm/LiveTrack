// routes/patients.js
import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import db from '../db.js';

const router = express.Router();

// GET /api/patients — Fetch all waiting patients (used by main dashboard)
router.get('/', async (req, res) => {
    try {
        const [rows] = await db.query(`
      SELECT * FROM patients 
      WHERE status = 'waiting' 
      ORDER BY admission_time ASC
    `);
        res.json(rows);
    } catch (error) {
        console.error('Error fetching waitlist:', error);
        res.status(500).json({ error: 'Failed to fetch waitlist' });
    }
});

// GET /api/patients/all — Fetch ALL patients (used by staff liveboard)
router.get('/all', async (req, res) => {
    try {
        const [rows] = await db.query(`
      SELECT p.*, s.name as staff_name, s.role as staff_role
      FROM patients p
      LEFT JOIN staff s ON p.assigned_staff_id = s.id
      WHERE p.status != 'discharged'
      ORDER BY
        FIELD(p.urgency_level, 'critical', 'high', 'medium', 'low'),
        p.admission_time ASC
    `);
        res.json(rows);
    } catch (error) {
        console.error('Error fetching all patients:', error);
        res.status(500).json({ error: 'Failed to fetch patients' });
    }
});

// GET /api/patients/stats — Dashboard stats
router.get('/stats', async (req, res) => {
    try {
        const TOTAL_BEDS = 250;
        const [treatmentRows] = await db.query(`SELECT COUNT(*) as inUse FROM patients WHERE status = 'admitted' OR status = 'treatment'`);
        const bedsInUse = treatmentRows[0].inUse;
        const [deptRows] = await db.query(`SELECT department, COUNT(*) as count FROM patients WHERE status != 'discharged' GROUP BY department`);
        const [genderRows] = await db.query(`SELECT gender, COUNT(*) as count FROM patients WHERE status != 'discharged' GROUP BY gender`);

        res.json({
            beds: { total: TOTAL_BEDS, inUse: bedsInUse, available: TOTAL_BEDS - bedsInUse },
            departments: deptRows,
            demographics: genderRows
        });
    } catch (error) {
        console.error('Error fetching stats:', error);
        res.status(500).json({ error: 'Failed to fetch stats' });
    }
});

// GET /api/patients/analytics — Deeper analytics for staff page
router.get('/analytics', async (req, res) => {
    try {
        // Avg wait time per department
        const [waitByDept] = await db.query(`
      SELECT department,
        ROUND(AVG(TIMESTAMPDIFF(MINUTE, admission_time, COALESCE(treatment_start_time, NOW())))) as avg_wait
      FROM patients
      WHERE status != 'discharged'
      GROUP BY department
    `);

        // Counts by status
        const [statusCounts] = await db.query(`
      SELECT status, COUNT(*) as count FROM patients GROUP BY status
    `);

        // Staff workload (patients per staff member)
        const [workload] = await db.query(`
      SELECT s.name, s.role, COUNT(p.id) as patient_count
      FROM staff s
      LEFT JOIN patients p ON s.id = p.assigned_staff_id AND p.status != 'discharged'
      GROUP BY s.id, s.name, s.role
    `);

        // Today's totals
        const [todayStats] = await db.query(`
      SELECT
        SUM(CASE WHEN status = 'admitted' OR status = 'treatment' THEN 1 ELSE 0 END) as admitted_today,
        SUM(CASE WHEN status = 'discharged' THEN 1 ELSE 0 END) as discharged_today,
        COUNT(*) as total
      FROM patients
      WHERE DATE(admission_time) = CURDATE()
    `);

        // Urgency breakdown
        const [urgencyCounts] = await db.query(`
      SELECT urgency_level, COUNT(*) as count 
      FROM patients 
      WHERE status != 'discharged' 
      GROUP BY urgency_level
      ORDER BY FIELD(urgency_level, 'critical', 'high', 'medium', 'low')
    `);

        res.json({
            waitByDepartment: waitByDept,
            statusBreakdown: statusCounts,
            staffWorkload: workload,
            urgencyBreakdown: urgencyCounts,
            today: todayStats[0] || { admitted_today: 0, discharged_today: 0, total: 0 }
        });
    } catch (error) {
        console.error('Error fetching analytics:', error);
        res.status(500).json({ error: 'Failed to fetch analytics' });
    }
});

// POST /api/patients/admit — Add a new patient to the waitlist
router.post('/admit', async (req, res) => {
    try {
        const { name, age, gender, department, chief_complaint, urgency_level } = req.body;
        const patientId = uuidv4();

        await db.query(`
      INSERT INTO patients (id, name, age, gender, department, chief_complaint, urgency_level, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'waiting')
    `, [patientId, name, age, gender, department, chief_complaint, urgency_level]);

        const newPatient = { id: patientId, name, age, gender, department, chief_complaint, urgency_level, status: 'waiting', admission_time: new Date() };

        const io = req.app.get('io');
        io.emit('patient-admitted', newPatient);

        res.status(201).json({ message: 'Patient admitted successfully', patient: newPatient });
    } catch (error) {
        console.error('Error admitting patient:', error);
        res.status(500).json({ error: 'Failed to admit patient' });
    }
});

// PUT /api/patients/:id/admit — Move patient from waiting to admitted (staff action)
router.put('/:id/admit', async (req, res) => {
    try {
        await db.query(
            `UPDATE patients SET status = 'admitted', treatment_start_time = NOW() WHERE id = ?`,
            [req.params.id]
        );
        const io = req.app.get('io');
        io.emit('patient-updated');
        res.json({ message: 'Patient admitted to bed' });
    } catch (error) {
        console.error('Error admitting patient:', error);
        res.status(500).json({ error: 'Failed to admit patient' });
    }
});

// PUT /api/patients/:id/discharge — Discharge a patient
router.put('/:id/discharge', async (req, res) => {
    try {
        await db.query(
            `UPDATE patients SET status = 'discharged', discharge_time = NOW(), assigned_staff_id = NULL WHERE id = ?`,
            [req.params.id]
        );
        const io = req.app.get('io');
        io.emit('patient-updated');
        res.json({ message: 'Patient discharged' });
    } catch (error) {
        console.error('Error discharging patient:', error);
        res.status(500).json({ error: 'Failed to discharge patient' });
    }
});

// PUT /api/patients/:id/urgency — Update urgency level
router.put('/:id/urgency', async (req, res) => {
    try {
        const { urgency_level } = req.body;
        await db.query(
            'UPDATE patients SET urgency_level = ? WHERE id = ?',
            [urgency_level, req.params.id]
        );
        const io = req.app.get('io');
        io.emit('patient-updated');
        res.json({ message: 'Urgency updated' });
    } catch (error) {
        console.error('Error updating urgency:', error);
        res.status(500).json({ error: 'Failed to update urgency' });
    }
});

// PUT /api/patients/:id/assign — Assign a staff member to a patient
router.put('/:id/assign', async (req, res) => {
    try {
        const { staff_id } = req.body;
        await db.query(
            'UPDATE patients SET assigned_staff_id = ? WHERE id = ?',
            [staff_id, req.params.id]
        );
        const io = req.app.get('io');
        io.emit('patient-updated');
        res.json({ message: 'Staff assigned' });
    } catch (error) {
        console.error('Error assigning staff:', error);
        res.status(500).json({ error: 'Failed to assign staff' });
    }
});

export default router;
