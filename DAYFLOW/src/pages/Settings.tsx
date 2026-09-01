import React, { useState } from 'react';
import { Settings as SettingsIcon, User, Globe, Moon, Bell, Volume2, Save, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { sounds } from '../lib/sound';

export const Settings: React.FC = () => {
  const { user, profile, updateProfile, signOut, isDemoUser } = useAuth();
  const { theme, setTheme } = useTheme();

  const [fullName, setFullName] = useState(profile?.full_name || 'Vivek Kumar');
  const [timezone, setTimezone] = useState(profile?.timezone || 'Asia/Kolkata');
  const [dailyGoalHours, setDailyGoalHours] = useState(profile?.daily_goal_hours || 6);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSavedSuccess(false);

    await updateProfile({
      full_name: fullName,
      timezone,
      daily_goal_hours: Number(dailyGoalHours),
    });

    setSaving(false);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleSoundToggle = (val: boolean) => {
    setSoundEnabled(val);
    sounds.setMuted(!val);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-2.5 mb-2">
        <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
          <SettingsIcon className="w-4 h-4" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight">
            Settings & Preferences
          </h1>
          <p className="text-sm text-slate-400">
            Manage your account, timezone, theme, and application preferences
          </p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Profile Card */}
        <div className="glass-card rounded-3xl p-6 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800 text-sm font-bold text-slate-200">
            <User className="w-4 h-4 text-emerald-400" />
            <span>Profile Information</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-4 py-2 text-sm text-slate-100 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                disabled
                value={user?.email || (isDemoUser ? 'demo@dayflow.app' : 'user@dayflow.app')}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-sm text-slate-500 cursor-not-allowed"
              />
            </div>
          </div>
        </div>

        {/* Timezone & Scheduling */}
        <div className="glass-card rounded-3xl p-6 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800 text-sm font-bold text-slate-200">
            <Globe className="w-4 h-4 text-emerald-400" />
            <span>Timezone & Schedule Goals</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                Timezone (Streak Calculation)
              </label>
              <select
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none"
              >
                <option value="Asia/Kolkata">Asia/Kolkata (IST +5:30)</option>
                <option value="America/New_York">America/New_York (EST)</option>
                <option value="America/Los_Angeles">America/Los_Angeles (PST)</option>
                <option value="Europe/London">Europe/London (GMT)</option>
                <option value="UTC">UTC Universal</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                Daily Goal Study/Work (Hours)
              </label>
              <input
                type="number"
                min={1}
                max={24}
                value={dailyGoalHours}
                onChange={(e) => setDailyGoalHours(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-4 py-2 text-sm text-slate-100 focus:outline-none font-mono"
              />
            </div>
          </div>
        </div>

        {/* Appearance & Sound */}
        <div className="glass-card rounded-3xl p-6 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800 text-sm font-bold text-slate-200">
            <Moon className="w-4 h-4 text-emerald-400" />
            <span>Appearance & Sound</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                Theme
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['dark', 'light', 'system'] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTheme(t)}
                    className={`py-2 rounded-xl text-xs font-bold uppercase transition-all ${
                      theme === t
                        ? 'bg-emerald-500 text-slate-950 shadow-sm'
                        : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-slate-200'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                Interactive Audio FX
              </label>
              <button
                type="button"
                onClick={() => handleSoundToggle(!soundEnabled)}
                className={`w-full py-2 px-3 rounded-xl border flex items-center justify-between text-xs font-semibold transition-all ${
                  soundEnabled
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                    : 'bg-slate-950 border-slate-800 text-slate-500'
                }`}
              >
                <span className="flex items-center gap-2">
                  <Volume2 className="w-4 h-4" />
                  Sound Effects (Completions & Level Up)
                </span>
                <span>{soundEnabled ? 'Enabled' : 'Muted'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Save Bar */}
        <div className="flex items-center justify-between pt-2">
          <div>
            {savedSuccess && (
              <span className="text-xs font-bold text-emerald-400 animate-pulse">
                ✓ Preferences updated successfully!
              </span>
            )}
          </div>

          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/20 transition-all active:scale-95 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save Preferences'}</span>
          </button>
        </div>
      </form>

      {/* Account Actions */}
      <div className="glass-card rounded-3xl p-6 border-red-500/20 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h4 className="text-sm font-bold text-red-400">Account Management</h4>
          <p className="text-xs text-slate-500">
            Sign out of your session on this device
          </p>
        </div>

        <button
          onClick={() => signOut()}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 text-xs font-bold transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
};
