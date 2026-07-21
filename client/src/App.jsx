import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';

// Icons — we only import what we actually use
import { Activity, Clock, Users, AlertTriangle } from 'lucide-react';

// Recharts — each chart type + helpers
import {
  AreaChart, Area,
  BarChart, Bar,
  PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer
} from 'recharts';

// ──────────────────────────────────────────────
// CONSTANTS (stuff that doesn't change)
// ──────────────────────────────────────────────

const socket = io('http://localhost:3000');

// Dummy data for the 24-hour chart (will be replaced with real data later)
const historicalVolume = [
  { time: '00:00', patients: 12 },
  { time: '04:00', patients: 8 },
  { time: '08:00', patients: 25 },
  { time: '12:00', patients: 45 },
  { time: '16:00', patients: 38 },
  { time: '20:00', patients: 55 },
  { time: '23:59', patients: 30 },
];

// Chart colors — greens with enough contrast to tell apart
const DONUT_COLORS = ['#4ade80', '#166534', '#86efac', '#14532d'];
const BAR_COLORS = ['#4ade80', '#15803d', '#a7f3d0', '#064e3b', '#bbf7d0'];


// ──────────────────────────────────────────────
// MAIN COMPONENT
// ──────────────────────────────────────────────

export default function App() {

  // State: patients list, stats object, avg wait time, last sync time
  const [patients, setPatients] = useState([]);
  const [stats, setStats] = useState(null);
  const [avgWaitTime, setAvgWaitTime] = useState(0);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  // On mount: fetch data + listen for real-time updates
  useEffect(() => {
    fetchDashboardData();
    socket.on('patient-admitted', () => fetchDashboardData());
    return () => socket.off('patient-admitted');
  }, []);

  // Fetch both patients and stats from the backend
  const fetchDashboardData = async () => {
    try {
      const [patientsRes, statsRes] = await Promise.all([
        fetch('http://localhost:3000/api/patients'),
        fetch('http://localhost:3000/api/patients/stats'),
      ]);
      const patientsData = await patientsRes.json();
      const statsData = await statsRes.json();

      setPatients(patientsData);
      setStats(statsData);
      setLastUpdated(new Date());           // track when we last got fresh data
      calculateAvgWait(patientsData);
    } catch (error) {
      console.error('Failed to fetch dashboard data', error);
    }
  };

  // Calculate the average wait time in minutes
  const calculateAvgWait = (list) => {
    if (list.length === 0) return setAvgWaitTime(0);
    const now = new Date();
    const total = list.reduce(
      (sum, p) => sum + Math.floor((now - new Date(p.admission_time)) / 60000),
      0
    );
    setAvgWaitTime(Math.round(total / list.length));
  };

  // Derived values
  const criticalCount = patients.filter(p => p.urgency_level === 'critical').length;
  const bedTotal = stats ? stats.beds.total : 250;
  const bedUsed = stats ? stats.beds.inUse : 0;
  const bedPercent = bedTotal > 0 ? Math.round((bedUsed / bedTotal) * 100) : 0;

  // "Updated X seconds ago" text
  const secondsAgo = Math.round((new Date() - lastUpdated) / 1000);

  // ──────────────────────────────────────────────
  // SMALL HELPER COMPONENTS
  // ──────────────────────────────────────────────

  // Custom tooltip for all charts (clean, no glow)
  const ChartTooltip = ({ active, payload, label }) => {
    if (!active || !payload || !payload.length) return null;
    return (
      <div className="bg-[#0a0a0a] border border-neutral-800 px-3 py-2">
        <p className="text-neutral-400 text-xs mb-1">{label || payload[0].name}</p>
        <p className="text-white font-semibold">
          {payload[0].value} <span className="text-neutral-500 font-normal text-xs">patients</span>
        </p>
      </div>
    );
  };

  // Simple legend dot used in the donut chart
  const LegendDot = ({ color, label, value }) => (
    <div className="flex items-center gap-2">
      <div className="w-2.5 h-2.5" style={{ backgroundColor: color }} />
      <span className="text-neutral-400 text-xs">{label}</span>
      <span className="text-white text-xs font-medium ml-auto">{value}</span>
    </div>
  );


  // ──────────────────────────────────────────────
  // RENDER
  // ──────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-black text-neutral-200 flex flex-col">

      {/* ── HEADER ── */}
      <header className="flex justify-between items-center px-6 py-4 border-b border-neutral-900">
        <div className="flex items-center gap-2.5">
          <Activity className="text-green-500 w-5 h-5" />
          <span className="text-base font-semibold text-white tracking-wide">LiveTrack</span>
          <span className="text-neutral-600 text-base font-normal">/ ER Dashboard</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-neutral-600 text-xs">Updated {secondsAgo}s ago</span>
          <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
        </div>
      </header>


      {/* ── MAIN CONTENT ── */}
      <main className="flex-1 p-6 space-y-6">

        {/* KPI ROW — 4 cards, consistent gap-6 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

          {/* Total Waiting */}
          <div className="bg-neutral-950 border border-neutral-900 p-5">
            <div className="flex justify-between items-start">
              <p className="text-neutral-500 text-xs font-medium uppercase tracking-wider">Total Waiting</p>
              <Users className="text-neutral-700 w-4 h-4" />
            </div>
            <h3 className="text-3xl font-semibold text-white mt-3">{patients.length}</h3>
            <p className="text-neutral-600 text-xs mt-1">patients in queue</p>
          </div>

          {/* Avg Wait */}
          <div className="bg-neutral-950 border border-neutral-900 p-5">
            <div className="flex justify-between items-start">
              <p className="text-neutral-500 text-xs font-medium uppercase tracking-wider">Avg Wait Time</p>
              <Clock className="text-neutral-700 w-4 h-4" />
            </div>
            <h3 className="text-3xl font-semibold text-white mt-3">
              {avgWaitTime}<span className="text-lg text-neutral-600 font-normal ml-1">min</span>
            </h3>
            <p className="text-neutral-600 text-xs mt-1">
              {avgWaitTime < 30 ? 'within target' : 'above 30m target'}
            </p>
          </div>

          {/* Critical */}
          <div className="bg-neutral-950 border border-neutral-900 p-5">
            <div className="flex justify-between items-start">
              <p className="text-neutral-500 text-xs font-medium uppercase tracking-wider">Critical</p>
              <AlertTriangle className={criticalCount > 0 ? 'text-red-500 w-4 h-4' : 'text-neutral-700 w-4 h-4'} />
            </div>
            <h3 className="text-3xl font-semibold text-white mt-3">{criticalCount}</h3>
            <p className="text-neutral-600 text-xs mt-1">
              {criticalCount === 0 ? 'no alerts' : 'requires attention'}
            </p>
          </div>

          {/* Bed Capacity */}
          <div className="bg-neutral-950 border border-neutral-900 p-5">
            <div className="flex justify-between items-start">
              <p className="text-neutral-500 text-xs font-medium uppercase tracking-wider">Bed Capacity</p>
              <span className="text-neutral-500 text-xs font-mono">{bedPercent}%</span>
            </div>
            <h3 className="text-3xl font-semibold text-white mt-3">
              {bedUsed}<span className="text-lg text-neutral-600 font-normal ml-1">/ {bedTotal}</span>
            </h3>
            {/* Simple progress bar instead of a circular ring */}
            <div className="h-1 w-full bg-neutral-900 mt-3">
              <div
                className="h-full bg-green-500 transition-all duration-700"
                style={{ width: `${bedPercent}%` }}
              />
            </div>
          </div>
        </div>


        {/* CHARTS + QUEUE — 2/3 charts, 1/3 queue */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* LEFT: Charts stacked */}
          <div className="lg:col-span-2 space-y-6">

            {/* Top row: Donut + Bar side by side */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              {/* Demographics Donut */}
              <div className="bg-neutral-950 border border-neutral-900 p-5 h-72 flex flex-col">
                <h3 className="text-neutral-400 text-xs font-medium uppercase tracking-wider mb-4">Demographics</h3>
                {stats && stats.demographics.length > 0 ? (
                  <div className="flex-1 flex items-center gap-4">
                    {/* The chart itself */}
                    <div className="flex-1 h-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={stats.demographics}
                            dataKey="count"
                            nameKey="gender"
                            cx="50%" cy="50%"
                            innerRadius={50}
                            outerRadius={70}
                            paddingAngle={2}
                            stroke="none"
                          >
                            {stats.demographics.map((entry, i) => (
                              <Cell key={i} fill={DONUT_COLORS[i % DONUT_COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip content={<ChartTooltip />} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    {/* Manual legend on the right */}
                    <div className="flex flex-col gap-2 min-w-[90px]">
                      {stats.demographics.map((entry, i) => (
                        <LegendDot
                          key={i}
                          color={DONUT_COLORS[i % DONUT_COLORS.length]}
                          label={entry.gender}
                          value={entry.count}
                        />
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-neutral-700 text-xs mt-10 text-center">No data</p>
                )}
              </div>

              {/* Department Bar Chart */}
              <div className="bg-neutral-950 border border-neutral-900 p-5 h-72 flex flex-col">
                <h3 className="text-neutral-400 text-xs font-medium uppercase tracking-wider mb-4">Department Load</h3>
                <div className="flex-1 w-full">
                  {stats && stats.departments.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={stats.departments} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#171717" vertical={false} />
                        <XAxis dataKey="department" stroke="#262626" tick={{ fill: '#525252', fontSize: 10 }} axisLine={false} />
                        <YAxis stroke="#262626" tick={{ fill: '#525252', fontSize: 10 }} axisLine={false} tickLine={false} />
                        <Tooltip content={<ChartTooltip />} cursor={{ fill: '#0a0a0a' }} />
                        <Bar dataKey="count" radius={[0, 0, 0, 0]}>
                          {stats.departments.map((entry, i) => (
                            <Cell key={i} fill={BAR_COLORS[i % BAR_COLORS.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <p className="text-neutral-700 text-xs mt-10 text-center">No data</p>
                  )}
                </div>
              </div>
            </div>

            {/* Area Chart (full width) */}
            <div className="bg-neutral-950 border border-neutral-900 p-5 h-64 flex flex-col">
              <h3 className="text-neutral-400 text-xs font-medium uppercase tracking-wider mb-4">24-Hour Patient Influx</h3>
              <div className="flex-1 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={historicalVolume} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                    <defs>
                      <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#4ade80" stopOpacity={0.15} />
                        <stop offset="100%" stopColor="#4ade80" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#171717" vertical={false} />
                    <XAxis dataKey="time" stroke="#262626" tick={{ fill: '#525252', fontSize: 10 }} axisLine={false} />
                    <YAxis stroke="#262626" tick={{ fill: '#525252', fontSize: 10 }} axisLine={false} tickLine={false} />
                    <Tooltip content={<ChartTooltip />} />
                    <Area type="monotone" dataKey="patients" stroke="#4ade80" strokeWidth={1.5} fill="url(#areaGradient)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>


          {/* RIGHT: Live Queue as a table */}
          <div className="bg-neutral-950 border border-neutral-900 flex flex-col overflow-hidden">
            <div className="px-5 py-3 border-b border-neutral-900 flex justify-between items-center">
              <h3 className="text-neutral-400 text-xs font-medium uppercase tracking-wider">Live Queue</h3>
              <div className="flex items-center gap-2">
                <span className="text-neutral-600 text-xs">{patients.length} waiting</span>
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
              </div>
            </div>

            {/* Table Header */}
            <div className="grid grid-cols-12 gap-2 px-5 py-2 border-b border-neutral-900 text-neutral-600 text-[10px] uppercase tracking-wider font-medium">
              <span className="col-span-1">#</span>
              <span className="col-span-4">Patient</span>
              <span className="col-span-3">Dept</span>
              <span className="col-span-2">Arrived</span>
              <span className="col-span-2 text-right">Status</span>
            </div>

            {/* Table Body */}
            <div className="flex-1 overflow-y-auto">
              {patients.length === 0 ? (
                <p className="text-neutral-700 text-xs text-center py-10">Queue is empty</p>
              ) : (
                patients.map((patient, idx) => (
                  <div
                    key={patient.id}
                    className="grid grid-cols-12 gap-2 px-5 py-2.5 border-b border-neutral-900/50 hover:bg-neutral-900/30 transition-colors items-center text-sm"
                  >
                    <span className="col-span-1 text-neutral-600 text-xs">{idx + 1}</span>
                    <span className="col-span-4 text-neutral-200 font-medium text-xs truncate">{patient.name}</span>
                    <span className="col-span-3 text-neutral-500 text-xs">{patient.department}</span>
                    <span className="col-span-2 text-neutral-500 text-xs font-mono">
                      {new Date(patient.admission_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <span className="col-span-2 text-right">
                      <span className={`text-[10px] font-medium px-2 py-0.5 uppercase tracking-wider
                        ${patient.urgency_level === 'critical' ? 'bg-red-500/10 text-red-400' :
                          patient.urgency_level === 'high' ? 'bg-orange-500/10 text-orange-400' :
                          patient.urgency_level === 'medium' ? 'bg-yellow-500/10 text-yellow-400' :
                          'bg-green-500/10 text-green-400'}`}
                      >
                        {patient.urgency_level}
                      </span>
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      </main>


      {/* ── HEALTH QUOTES SLIDER ── */}
      <div className="border-t border-neutral-900 h-10 flex items-center overflow-hidden">
        <div
          className="whitespace-nowrap flex gap-20"
          style={{ animation: 'marquee 80s linear infinite' }}
        >
          {[
            '"The greatest wealth is health." – Virgil',
            '"To ensure good health: eat lightly, breathe deeply, live moderately." – William Londen',
            '"Let food be thy medicine and medicine be thy food." – Hippocrates',
            '"Take care of your body. It\'s the only place you have to live." – Jim Rohn',
            '"Health is a state of complete harmony of the body, mind and spirit." – B.K.S. Iyengar',
            '"The greatest wealth is health." – Virgil',
            '"To ensure good health: eat lightly, breathe deeply, live moderately." – William Londen',
            '"Let food be thy medicine and medicine be thy food." – Hippocrates',
            '"Take care of your body. It\'s the only place you have to live." – Jim Rohn',
            '"Health is a state of complete harmony of the body, mind and spirit." – B.K.S. Iyengar',
          ].map((quote, i) => (
            <span key={i} className="text-yellow-400/80 text-xs tracking-wider">{quote}</span>
          ))}
        </div>
      </div>

      {/* ── FOOTER ── */}
      <footer className="px-6 py-3 border-t border-neutral-900 flex justify-between items-center">
        <span className="text-neutral-700 text-xs">© 2026 LiveTrack ER</span>
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
          <span className="text-neutral-600 text-xs">All systems operational</span>
        </div>
      </footer>

    </div>
  );
}
