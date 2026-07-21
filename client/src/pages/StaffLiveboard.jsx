import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import StaffNav from '../components/StaffNav';

const socket = io('http://localhost:3000');

export default function StaffLiveboard() {
    const [patients, setPatients] = useState([]);

    useEffect(() => {
        fetchPatients();
        socket.on('patient-admitted', () => fetchPatients());
        socket.on('patient-updated', () => fetchPatients());
        return () => {
            socket.off('patient-admitted');
            socket.off('patient-updated');
        };
    }, []);

    const fetchPatients = async () => {
        try {
            const res = await fetch('http://localhost:3000/api/patients/all');
            const data = await res.json();
            setPatients(data);
        } catch (err) {
            console.error('Failed to fetch patients', err);
        }
    };

    const handleAdmit = async (id) => {
        await fetch(`http://localhost:3000/api/patients/${id}/admit`, { method: 'PUT' });
    };

    const handleDischarge = async (id) => {
        await fetch(`http://localhost:3000/api/patients/${id}/discharge`, { method: 'PUT' });
    };

    const handleUrgency = async (id, level) => {
        await fetch(`http://localhost:3000/api/patients/${id}/urgency`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ urgency_level: level })
        });
    };

    const urgencyColor = (level) => {
        switch (level) {
            case 'critical': return 'bg-red-500/10 text-red-400';
            case 'high': return 'bg-orange-500/10 text-orange-400';
            case 'medium': return 'bg-yellow-500/10 text-yellow-400';
            default: return 'bg-green-500/10 text-green-400';
        }
    };

    return (
        <div className="min-h-screen bg-black text-neutral-200 flex flex-col">
            <StaffNav />

            <main className="flex-1 p-6">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-lg font-semibold text-white">ER Liveboard</h2>
                    <span className="text-neutral-600 text-xs">{patients.length} active patients</span>
                </div>

                {/* Table */}
                <div className="bg-neutral-950 border border-neutral-900 overflow-hidden">
                    {/* Table Header */}
                    <div className="grid grid-cols-12 gap-4 px-5 py-3 border-b border-neutral-900 text-neutral-500 text-[10px] uppercase tracking-wider font-medium">
                        <span className="col-span-2">Patient</span>
                        <span className="col-span-2">Department</span>
                        <span className="col-span-1">Urgency</span>
                        <span className="col-span-1">Status</span>
                        <span className="col-span-2">Assigned To</span>
                        <span className="col-span-1">Arrived</span>
                        <span className="col-span-3 text-right">Actions</span>
                    </div>

                    {/* Table Rows */}
                    {patients.length === 0 ? (
                        <p className="text-neutral-700 text-xs text-center py-10">No active patients</p>
                    ) : (
                        patients.map((patient) => (
                            <div key={patient.id} className="grid grid-cols-12 gap-4 px-5 py-3 border-b border-neutral-900/50 hover:bg-neutral-900/30 transition-colors items-center">
                                {/* Name */}
                                <div className="col-span-2">
                                    <p className="text-neutral-200 text-sm font-medium truncate">{patient.name}</p>
                                    <p className="text-neutral-600 text-[10px]">Age: {patient.age} · {patient.gender}</p>
                                </div>

                                {/* Department */}
                                <span className="col-span-2 text-neutral-400 text-xs">{patient.department}</span>

                                {/* Urgency (dropdown) */}
                                <div className="col-span-1">
                                    <select
                                        value={patient.urgency_level}
                                        onChange={(e) => handleUrgency(patient.id, e.target.value)}
                                        className={`text-[10px] font-medium px-2 py-1 uppercase tracking-wider bg-transparent border border-neutral-800 cursor-pointer ${urgencyColor(patient.urgency_level)}`}
                                    >
                                        <option value="low">Low</option>
                                        <option value="medium">Medium</option>
                                        <option value="high">High</option>
                                        <option value="critical">Critical</option>
                                    </select>
                                </div>

                                {/* Status */}
                                <span className="col-span-1 text-neutral-400 text-xs uppercase">{patient.status}</span>

                                {/* Assigned Staff */}
                                <span className="col-span-2 text-neutral-500 text-xs">
                                    {patient.staff_name ? `${patient.staff_name} (${patient.staff_role})` : '—'}
                                </span>

                                {/* Arrived Time */}
                                <span className="col-span-1 text-neutral-500 text-xs font-mono">
                                    {new Date(patient.admission_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>

                                {/* Action Buttons */}
                                <div className="col-span-3 flex justify-end gap-2">
                                    {patient.status === 'waiting' && (
                                        <button
                                            onClick={() => handleAdmit(patient.id)}
                                            className="text-[10px] font-medium uppercase tracking-wider px-3 py-1.5 bg-green-500/10 text-green-400 border border-green-500/20 hover:bg-green-500/20 transition-colors"
                                        >
                                            Admit to Bed
                                        </button>
                                    )}
                                    {(patient.status === 'waiting' || patient.status === 'admitted') && (
                                        <button
                                            onClick={() => handleDischarge(patient.id)}
                                            className="text-[10px] font-medium uppercase tracking-wider px-3 py-1.5 bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-colors"
                                        >
                                            Discharge
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </main>
        </div>
    );
}
