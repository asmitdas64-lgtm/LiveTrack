// Shared navigation bar for all staff pages
import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { Activity, LayoutGrid, Users, BarChart3, ArrowLeft } from 'lucide-react';

export default function StaffNav() {
    const linkClass = ({ isActive }) =>
        `flex items-center gap-2 px-4 py-2 text-xs uppercase tracking-wider font-medium transition-colors ${isActive
            ? 'text-green-400 border-b-2 border-green-400'
            : 'text-neutral-500 hover:text-neutral-300'
        }`;

    return (
        <header className="border-b border-neutral-900 bg-black">
            <div className="flex items-center justify-between px-6 py-3">
                <div className="flex items-center gap-2.5">
                    <Activity className="text-green-500 w-5 h-5" />
                    <span className="text-base font-semibold text-white tracking-wide">LiveTrack</span>
                    <span className="text-neutral-600 text-base font-normal">/ Staff</span>
                </div>
                <Link to="/board" className="text-neutral-600 hover:text-neutral-300 text-xs flex items-center gap-1 transition-colors">
                    <ArrowLeft className="w-3 h-3" /> Dashboard
                </Link>
            </div>
            <nav className="flex px-6 gap-2">
                <NavLink to="/staff" end className={linkClass}>
                    <LayoutGrid className="w-3.5 h-3.5" /> Liveboard
                </NavLink>
                <NavLink to="/staff/team" className={linkClass}>
                    <Users className="w-3.5 h-3.5" /> Team
                </NavLink>
                <NavLink to="/staff/analytics" className={linkClass}>
                    <BarChart3 className="w-3.5 h-3.5" /> Analytics
                </NavLink>
            </nav>
        </header>
    );
}
