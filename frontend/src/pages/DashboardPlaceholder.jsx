import React from 'react';
import { useAuth } from '../context/AuthContext';

export default function DashboardPlaceholder() {
  const { user } = useAuth();

  return (
    <div className="space-y-8">
      {/* Welcome header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/40 p-6 rounded-2xl border border-slate-850">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">
            Hello, {user?.name || 'Gym Owner'} 👋
          </h1>
          <p className="text-sm text-slate-400">
            Welcome to your FlexiGym workspace dashboard. Here is your gym status.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs bg-emerald-500/10 text-emerald-400 px-3.5 py-2 rounded-xl border border-emerald-500/20 font-bold self-start md:self-auto">
          🛡️ Multi-Tenant Active (Gym ID: {user?.gym_id})
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Card 1 */}
        <div className="bg-slate-900/50 border border-slate-850 p-6 rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs uppercase font-extrabold tracking-wider text-slate-400">Total Members</span>
            <span className="text-xl">👥</span>
          </div>
          <p className="text-3xl font-black text-white">0</p>
          <div className="mt-2 text-xs text-slate-500 flex items-center gap-1">
            <span className="text-emerald-400 font-semibold">Ready</span> to onboard members
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-slate-900/50 border border-slate-850 p-6 rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs uppercase font-extrabold tracking-wider text-slate-400">Today's Checkins</span>
            <span className="text-xl">📅</span>
          </div>
          <p className="text-3xl font-black text-white">0</p>
          <div className="mt-2 text-xs text-slate-500 flex items-center gap-1">
            <span className="text-emerald-400 font-semibold">Active</span> scan monitoring
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-slate-900/50 border border-slate-850 p-6 rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs uppercase font-extrabold tracking-wider text-slate-400">Monthly Revenue</span>
            <span className="text-xl">💳</span>
          </div>
          <p className="text-3xl font-black text-white">$0.00</p>
          <div className="mt-2 text-xs text-slate-500 flex items-center gap-1">
            <span className="text-emerald-400 font-semibold">Stripe</span> payment integration setup
          </div>
        </div>

        {/* Card 4 */}
        <div className="bg-slate-900/50 border border-slate-850 p-6 rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs uppercase font-extrabold tracking-wider text-slate-400">Active Trainers</span>
            <span className="text-xl">💪</span>
          </div>
          <p className="text-3xl font-black text-white">0</p>
          <div className="mt-2 text-xs text-slate-500 flex items-center gap-1">
            <span className="text-emerald-400 font-semibold">Ready</span> to link trainers
          </div>
        </div>
      </div>

      {/* Profile details */}
      <div className="grid md:grid-cols-3 gap-8">
        <div className="bg-slate-900/50 border border-slate-850 p-6 rounded-2xl md:col-span-2">
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <span>🏢</span> Gym Profile Details
          </h2>
          <div className="space-y-4">
            <div className="grid grid-cols-3 py-2.5 border-b border-slate-800 text-sm">
              <span className="text-slate-400 font-medium">Gym Name</span>
              <span className="text-slate-100 col-span-2 font-semibold text-emerald-400">{user?.gym_name || 'My Fitness Club'}</span>
            </div>
            <div className="grid grid-cols-3 py-2.5 border-b border-slate-800 text-sm">
              <span className="text-slate-400 font-medium">Gym Address</span>
              <span className="text-slate-200 col-span-2">{user?.gym_address || 'Not Provided'}</span>
            </div>
            <div className="grid grid-cols-3 py-2.5 border-b border-slate-800 text-sm">
              <span className="text-slate-400 font-medium">Gym Phone</span>
              <span className="text-slate-200 col-span-2 font-mono">{user?.gym_phone || 'Not Provided'}</span>
            </div>
            <div className="grid grid-cols-3 py-2.5 border-b border-slate-800 text-sm">
              <span className="text-slate-400 font-medium">Owner Name</span>
              <span className="text-slate-200 col-span-2">{user?.name}</span>
            </div>
            <div className="grid grid-cols-3 py-2.5 text-sm">
              <span className="text-slate-400 font-medium">Logged-in Email</span>
              <span className="text-slate-200 col-span-2 font-mono">{user?.email}</span>
            </div>
          </div>
        </div>

        <div className="bg-slate-900/50 border border-slate-850 p-6 rounded-2xl">
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <span>🛡️</span> SaaS Data Isolation
          </h2>
          <p className="text-sm text-slate-400 leading-relaxed mb-4">
            All member lists, checkins, transactions, and configs inside this workspace are locked to:
          </p>
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs font-mono text-emerald-400">
            WHERE gym_id = {user?.gym_id || 'NULL'}
          </div>
        </div>
      </div>
    </div>
  );
}
