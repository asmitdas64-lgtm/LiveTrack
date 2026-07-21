import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import StaffNav from '../components/StaffNav';

const socket = io('http://localhost:3000');

export default function StaffTeam() {
    const [staffList, setStaffList] = useState([]);
    const [patients, setPatients] = useState([]);
    const [newName, setNewName] = useState('');
    const [newRole, setNewRole] = useState('doctor');

    useEffect(() => {
        fetchStaff();
        fetchPatients();
        socket.on('patient-updated', () => fetchPatients());
        return () => socket.off('patient-updated');
    }, []);

    const fetchStaff = async () => {
        const res = await fetch('http://localhost:3000/api/staff');
        setStaffList(await res.json());
    };

    const fetchPatients = async () => {
        const res = await fetch('http://localhost:3000/api/patients/all');
        setPatients(await res.json());
    };

    const handleAddStaff = async (e) => {
        e.preventDefault();
        if (!newName.trim()) return;
        await fetch('http://localhost:3000/api/staff', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: newName, role: newRole })
        });
        setNewName('');
        fetchStaff();
    };

    const handleDeleteStaff = async (id) => {
        await fetch(`http://localhost:3000/api/staff/${id}`, { method: 'DELETE' });
        fetchStaff();
        fetchPatients();
    };

    const handleAssign = async (patientId, staffId) => {
        await fetch(`http://localhost:3000/api/patients/${patientId}/assign`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ staff_id: staffId || null })
        });
        fetchPatients();
    };

    return (
        <div className="min-h-screen bg-black text-neutral-200 flex flex-col">
            <StaffNav />

            <main className="flex-1 p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                    {/* LEFT: Staff Directory */}
                    <div>
                        <h2 className="text-lg font-semibold text-white mb-4">Staff Directory</h2>

                        {/* Add Staff Form */}
                        <form onSubmit={handleAddStaff} className="flex gap-3 mb-6">
                            <input
                                type="text"
                                placeholder="Staff name"
                                value={newName}
                                onChange={(e) => setNewName(e.target.value)}
                                className="flex-1 bg-neutral-950 border border-neutral-800 px-3 py-2 text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-green-500/50"
                            />
                            <select
                                value={newRole}
                                onChange={(e) => setNewRole(e.target.value)}
                                className="bg-neutral-950 border border-neutral-800 px-3 py-2 text-sm text-neutral-300 focus:outline-none"
                            >
                                <option value="doctor">Doctor</option>
                                <option value="nurse">Nurse</option>
                                <option value="admin">Admin</option>
                            </select>
                            <button
                                type="submit"
                                className="px-4 py-2 bg-green-500/10 text-green-400 border border-green-500/20 text-xs uppercase tracking-wider font-medium hover:bg-green-500/20 transition-colors"
                            >
                                Add
                            </button>
                        </form>

                        {/* Staff Table */}
                        <div className="bg-neutral-950 border border-neutral-900">
                            <div className="grid grid-cols-12 gap-4 px-5 py-3 border-b border-neutral-900 text-neutral-500 text-[10px] uppercase tracking-wider font-medium">
                                <span className="col-span-5">Name</span>
                                <span className="col-span-3">Role</span>
                                <span className="col-span-2">Patients</span>
                                <span className="col-span-2 text-right">Action</span>
                            </div>
                            {staffList.length === 0 ? (
                                <p className="text-neutral-700 text-xs text-center py-10">No staff members added</p>
                            ) : (
                                staffList.map((s) => {
                                    const assignedCount = patients.filter(p => p.assigned_staff_id === s.id).length;
                                    return (
                                        <div key={s.id} className="grid grid-cols-12 gap-4 px-5 py-3 border-b border-neutral-900/50 hover:bg-neutral-900/30 transition-colors items-center">
                                            <span className="col-span-5 text-neutral-200 text-sm font-medium">{s.name}</span>
                                            <span className="col-span-3 text-neutral-500 text-xs uppercase">{s.role}</span>
                                            <span className="col-span-2 text-neutral-400 text-xs">{assignedCount}</span>
                                            <div className="col-span-2 text-right">
                                                <button
                                                    onClick={() => handleDeleteStaff(s.id)}
                                                    className="text-[10px] text-red-400/60 hover:text-red-400 transition-colors uppercase tracking-wider"
                                                >
                                                    Remove
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>

                    {/* RIGHT: Assignments */}
                    <div>
                        <h2 className="text-lg font-semibold text-white mb-4">Patient Assignments</h2>
                        <div className="bg-neutral-950 border border-neutral-900">
                            <div className="grid grid-cols-12 gap-4 px-5 py-3 border-b border-neutral-900 text-neutral-500 text-[10px] uppercase tracking-wider font-medium">
                                <span className="col-span-4">Patient</span>
                                <span className="col-span-3">Department</span>
                                <span className="col-span-5">Assign To</span>
                            </div>
                            {patients.length === 0 ? (
                                <p className="text-neutral-700 text-xs text-center py-10">No active patients</p>
                            ) : (
                                patients.map((p) => (
                                    <div key={p.id} className="grid grid-cols-12 gap-4 px-5 py-3 border-b border-neutral-900/50 hover:bg-neutral-900/30 transition-colors items-center">
                                        <span className="col-span-4 text-neutral-200 text-sm truncate">{p.name}</span>
                                        <span className="col-span-3 text-neutral-500 text-xs">{p.department}</span>
                                        <div className="col-span-5">
                                            <select
                                                value={p.assigned_staff_id || ''}
                                                onChange={(e) => handleAssign(p.id, e.target.value)}
                                                className="w-full bg-neutral-950 border border-neutral-800 px-2 py-1.5 text-xs text-neutral-300 focus:outline-none focus:border-green-500/50"
                                            >
                                                <option value="">Unassigned</option>
                                                {staffList.map((s) => (
                                                    <option key={s.id} value={s.id}>{s.name} ({s.role})</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                </div>
            </main>
        </div>
    );
}
