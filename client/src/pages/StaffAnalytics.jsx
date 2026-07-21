import React, { useState, useEffect } from 'react';
import StaffNav from '../components/StaffNav';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, Cell, PieChart, Pie
} from 'recharts';

const BAR_COLORS = ['#4ade80', '#15803d', '#a7f3d0', '#064e3b', '#bbf7d0'];
const PIE_COLORS = ['#4ade80', '#166534', '#86efac', '#14532d'];
const URGENCY_COLORS = { critical: '#ef4444', high: '#f97316', medium: '#eab308', low: '#4ade80' };

export default function StaffAnalytics() {
    const [data, setData] = useState(null);

    useEffect(() => {
        fetchAnalytics();
    }, []);

    const fetchAnalytics = async () => {
        try {
            const res = await fetch('http://localhost:3000/api/patients/analytics');
            setData(await res.json());
        } catch (err) {
            console.error('Failed to fetch analytics', err);
        }
    };

    const ChartTooltip = ({ active, payload, label }) => {
        if (!active || !payload || !payload.length) return null;
        return (
            <div className="bg-[#0a0a0a] border border-neutral-800 px-3 py-2">
                <p className="text-neutral-400 text-xs mb-1">{label || payload[0].name}</p>
                <p className="text-white font-semibold text-sm">{payload[0].value}</p>
            </div>
        );
    };

    if (!data) {
        return (
            <div className="min-h-screen bg-black text-neutral-200 flex flex-col">
                <StaffNav />
                <p className="text-neutral-600 text-sm p-6">Loading analytics...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-neutral-200 flex flex-col">
            <StaffNav />

            <main className="flex-1 p-6 space-y-6">
                <h2 className="text-lg font-semibold text-white">Analytics & Reports</h2>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-neutral-950 border border-neutral-900 p-4">
                        <p className="text-neutral-500 text-[10px] font-medium uppercase tracking-wider">Admitted Today</p>
                        <h3 className="text-2xl font-semibold text-white mt-1">{data.today.admitted_today || 0}</h3>
                    </div>
                    <div className="bg-neutral-950 border border-neutral-900 p-4">
                        <p className="text-neutral-500 text-[10px] font-medium uppercase tracking-wider">Discharged Today</p>
                        <h3 className="text-2xl font-semibold text-white mt-1">{data.today.discharged_today || 0}</h3>
                    </div>
                    <div className="bg-neutral-950 border border-neutral-900 p-4">
                        <p className="text-neutral-500 text-[10px] font-medium uppercase tracking-wider">Total Seen Today</p>
                        <h3 className="text-2xl font-semibold text-white mt-1">{data.today.total || 0}</h3>
                    </div>
                </div>

                {/* Charts Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Avg Wait by Department */}
                    <div className="bg-neutral-950 border border-neutral-900 p-5 h-[340px] flex flex-col">
                        <h3 className="text-neutral-400 text-xs font-medium uppercase tracking-wider mb-4">Avg Wait by Department (min)</h3>
                        <div className="flex-1">
                            {data.waitByDepartment.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={data.waitByDepartment} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#171717" vertical={false} />
                                        <XAxis dataKey="department" stroke="#262626" tick={{ fill: '#525252', fontSize: 10 }} axisLine={false} />
                                        <YAxis stroke="#262626" tick={{ fill: '#525252', fontSize: 10 }} axisLine={false} tickLine={false} />
                                        <Tooltip content={<ChartTooltip />} cursor={{ fill: '#0a0a0a' }} />
                                        <Bar dataKey="avg_wait" radius={[0, 0, 0, 0]}>
                                            {data.waitByDepartment.map((_, i) => (
                                                <Cell key={i} fill={BAR_COLORS[i % BAR_COLORS.length]} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : <p className="text-neutral-700 text-xs mt-10 text-center">No data</p>}
                        </div>
                    </div>

                    {/* Status Breakdown */}
                    <div className="bg-neutral-950 border border-neutral-900 p-5 h-[340px] flex flex-col">
                        <h3 className="text-neutral-400 text-xs font-medium uppercase tracking-wider mb-4">Patient Status Breakdown</h3>
                        <div className="flex-1 flex items-center gap-4">
                            {data.statusBreakdown.length > 0 ? (
                                <>
                                    <div className="flex-1 h-full">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie data={data.statusBreakdown} dataKey="count" nameKey="status"
                                                    cx="50%" cy="50%" innerRadius={50} outerRadius={70} paddingAngle={2} stroke="none">
                                                    {data.statusBreakdown.map((_, i) => (
                                                        <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                                                    ))}
                                                </Pie>
                                                <Tooltip content={<ChartTooltip />} />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>
                                    <div className="flex flex-col gap-2 min-w-[90px]">
                                        {data.statusBreakdown.map((entry, i) => (
                                            <div key={i} className="flex items-center gap-2">
                                                <div className="w-2.5 h-2.5" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                                                <span className="text-neutral-400 text-xs">{entry.status}</span>
                                                <span className="text-white text-xs font-medium ml-auto">{entry.count}</span>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            ) : <p className="text-neutral-700 text-xs mt-10 text-center">No data</p>}
                        </div>
                    </div>
                </div>

                {/* Staff Workload + Urgency Breakdown */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                    {/* Staff Workload */}
                    <div className="bg-neutral-950 border border-neutral-900 p-5 h-[320px] flex flex-col">
                        <h3 className="text-neutral-400 text-xs font-medium uppercase tracking-wider mb-4">Staff Workload</h3>
                        <div className="flex-1">
                            {data.staffWorkload.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={data.staffWorkload} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#171717" vertical={false} />
                                        <XAxis dataKey="name" stroke="#262626" tick={{ fill: '#525252', fontSize: 10 }} axisLine={false} />
                                        <YAxis stroke="#262626" tick={{ fill: '#525252', fontSize: 10 }} axisLine={false} tickLine={false} />
                                        <Tooltip content={<ChartTooltip />} cursor={{ fill: '#0a0a0a' }} />
                                        <Bar dataKey="patient_count" fill="#4ade80" radius={[0, 0, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : <p className="text-neutral-700 text-xs mt-10 text-center">No staff data</p>}
                        </div>
                    </div>

                    {/* Urgency Breakdown */}
                    <div className="bg-neutral-950 border border-neutral-900 p-5 h-[320px] flex flex-col">
                        <h3 className="text-neutral-400 text-xs font-medium uppercase tracking-wider mb-4">Patients by Urgency</h3>
                        <div className="flex-1">
                            {data.urgencyBreakdown && data.urgencyBreakdown.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={data.urgencyBreakdown} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#171717" horizontal={false} />
                                        <XAxis type="number" stroke="#262626" tick={{ fill: '#525252', fontSize: 10 }} axisLine={false} tickLine={false} allowDecimals={false} />
                                        <YAxis type="category" dataKey="urgency_level" stroke="#262626" tick={{ fill: '#a3a3a3', fontSize: 11, textTransform: 'capitalize' }} axisLine={false} tickLine={false} width={60} />
                                        <Tooltip content={<ChartTooltip />} cursor={{ fill: '#0a0a0a' }} />
                                        <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                                            {data.urgencyBreakdown.map((entry, i) => (
                                                <Cell key={i} fill={URGENCY_COLORS[entry.urgency_level] || '#4ade80'} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : <p className="text-neutral-700 text-xs mt-10 text-center">No urgency data</p>}
                        </div>
                    </div>

                </div>

            </main>
        </div>
    );
}
