import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, ArrowLeft, CheckCircle2 } from 'lucide-react';

export default function PatientIntake() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        age: '',
        gender: 'Male',
        department: 'Cardiology',
        urgency_level: 'low'
    });
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch('http://localhost:3000/api/patients/admit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    chief_complaint: 'General checkup' // Dummy field since we didn't include it in the form
                })
            });
            if (res.ok) {
                setSubmitted(true);
            }
        } catch (error) {
            console.error('Failed to submit form', error);
        }
    };

    if (submitted) {
        return (
            <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6">
                <div className="bg-neutral-950 border border-neutral-900 p-8 flex flex-col items-center text-center max-w-md w-full animate-fade-in">
                    <CheckCircle2 className="w-16 h-16 text-green-500 mb-6" />
                    <h2 className="text-2xl font-semibold mb-2">You're in the queue</h2>
                    <p className="text-neutral-400 mb-8">Please have a seat. A triage nurse will be with you shortly.</p>
                    <button 
                        onClick={() => navigate('/board')}
                        className="bg-green-600 hover:bg-green-500 text-white px-6 py-3 font-medium transition-colors w-full"
                    >
                        View Live Board
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6">
            <div className="w-full max-w-md">
                
                {/* Form */}
                <div className="bg-neutral-950 border border-neutral-900 p-8 relative">
                    {/* Header inside box */}
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-2">
                            <Activity className="text-green-500 w-5 h-5" />
                            <span className="font-semibold tracking-wide text-lg">LiveTrack</span>
                        </div>
                        <button 
                            onClick={() => navigate('/')}
                            className="text-neutral-500 hover:text-white transition-colors flex items-center gap-2 text-sm font-medium"
                        >
                            Back <ArrowLeft className="w-4 h-4" />
                        </button>
                    </div>

                    <h2 className="text-xl font-semibold mb-6 text-center">Patient Admission</h2>
                    
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-xs font-medium text-neutral-400 uppercase tracking-wider mb-2">Full Name</label>
                            <input 
                                required
                                type="text"
                                className="w-full bg-neutral-900 border border-neutral-800 text-white px-4 py-3 focus:outline-none focus:border-green-500 transition-colors"
                                value={formData.name}
                                onChange={e => setFormData({...formData, name: e.target.value})}
                                placeholder="John Doe"
                            />
                        </div>

                        <div className="flex gap-4">
                            <div className="flex-1">
                                <label className="block text-xs font-medium text-neutral-400 uppercase tracking-wider mb-2">Age</label>
                                <input 
                                    required
                                    type="number"
                                    min="0"
                                    className="w-full bg-neutral-900 border border-neutral-800 text-white px-4 py-3 focus:outline-none focus:border-green-500 transition-colors"
                                    value={formData.age}
                                    onChange={e => setFormData({...formData, age: e.target.value})}
                                    placeholder="35"
                                />
                            </div>
                            <div className="flex-1">
                                <label className="block text-xs font-medium text-neutral-400 uppercase tracking-wider mb-2">Gender</label>
                                <select 
                                    className="w-full bg-neutral-900 border border-neutral-800 text-white px-4 py-3 focus:outline-none focus:border-green-500 transition-colors appearance-none"
                                    value={formData.gender}
                                    onChange={e => setFormData({...formData, gender: e.target.value})}
                                >
                                    <option>Male</option>
                                    <option>Female</option>
                                    <option>Other</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-neutral-400 uppercase tracking-wider mb-2">Department</label>
                            <select 
                                className="w-full bg-neutral-900 border border-neutral-800 text-white px-4 py-3 focus:outline-none focus:border-green-500 transition-colors appearance-none"
                                value={formData.department}
                                onChange={e => setFormData({...formData, department: e.target.value})}
                            >
                                <option>Cardiology</option>
                                <option>Neurology</option>
                                <option>Orthopedics</option>
                                <option>General</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-neutral-400 uppercase tracking-wider mb-2">Urgency Level</label>
                            <div className="grid grid-cols-4 gap-2">
                                {['low', 'medium', 'high', 'critical'].map(level => (
                                    <button
                                        key={level}
                                        type="button"
                                        onClick={() => setFormData({...formData, urgency_level: level})}
                                        className={`py-2 text-xs font-medium uppercase tracking-wider border transition-colors ${
                                            formData.urgency_level === level 
                                                ? level === 'critical' ? 'bg-red-500/20 border-red-500/50 text-red-400'
                                                : level === 'high' ? 'bg-orange-500/20 border-orange-500/50 text-orange-400'
                                                : level === 'medium' ? 'bg-yellow-500/20 border-yellow-500/50 text-yellow-400'
                                                : 'bg-green-500/20 border-green-500/50 text-green-400'
                                            : 'bg-neutral-900 border-neutral-800 text-neutral-500 hover:border-neutral-700'
                                        }`}
                                    >
                                        {level}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <button 
                            type="submit"
                            className="w-full bg-green-600 hover:bg-green-500 text-white py-4 font-medium transition-colors mt-4"
                        >
                            Submit Registration
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
