import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Check, ArrowRight, Code, BookOpen, Dumbbell, Briefcase, User, Clock } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import confetti from 'canvas-confetti';

export const Onboarding: React.FC = () => {
  const { updateProfile } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [selectedFocus, setSelectedFocus] = useState<string[]>(['Coding', 'Study']);
  const [goalHours, setGoalHours] = useState<number>(6);
  const [saving, setSaving] = useState(false);

  const focusOptions = [
    { id: 'Coding', label: 'Coding & LeetCode', icon: Code },
    { id: 'Study', label: 'College & Academics', icon: BookOpen },
    { id: 'Fitness', label: 'Gym & Fitness', icon: Dumbbell },
    { id: 'Career', label: 'Career & Projects', icon: Briefcase },
    { id: 'Personal', label: 'Personal Habits', icon: User },
  ];

  const hourOptions = [
    { hours: 3, label: '2–4 Hours', sub: 'Light consistency' },
    { hours: 5, label: '4–6 Hours', sub: 'Balanced study & work' },
    { hours: 7, label: '6–8 Hours', sub: 'Serious productivity' },
    { hours: 9, label: '8+ Hours', sub: 'Hardcore grinder' },
  ];

  const toggleFocus = (id: string) => {
    setSelectedFocus((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleFinish = async () => {
    setSaving(true);
    await updateProfile({
      focus_areas: selectedFocus,
      daily_goal_hours: goalHours,
    });
    setSaving(false);

    confetti({
      particleCount: 150,
      spread: 90,
      origin: { y: 0.6 },
    });

    navigate('/');
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 selection:bg-emerald-500/30 selection:text-emerald-300 relative overflow-hidden">
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-xl">
        {/* Step Indicator */}
        <div className="flex items-center justify-center gap-3 mb-8">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                  step === s
                    ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20 ring-4 ring-emerald-500/20'
                    : step > s
                    ? 'bg-emerald-500/20 text-emerald-400'
                    : 'bg-slate-800 text-slate-500'
                }`}
              >
                {step > s ? <Check className="w-4 h-4" /> : s}
              </div>
              {s < 3 && <div className="w-10 h-0.5 bg-slate-800" />}
            </div>
          ))}
        </div>

        <div className="glass-card rounded-3xl p-8 shadow-2xl relative">
          {/* Step 1: Focus Areas */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Step 1 of 3</span>
                <h2 className="text-2xl font-black text-slate-100 mt-1">What do you want to focus on?</h2>
                <p className="text-sm text-slate-400 mt-1">
                  Select the main areas of your daily routine
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {focusOptions.map((f) => {
                  const Icon = f.icon;
                  const isSelected = selectedFocus.includes(f.id);
                  return (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => toggleFocus(f.id)}
                      className={`p-4 rounded-2xl border text-left flex items-center gap-3.5 transition-all ${
                        isSelected
                          ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300 shadow-md shadow-emerald-500/10'
                          : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                      }`}
                    >
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${isSelected ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-400'}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="font-semibold text-sm">{f.label}</span>
                    </button>
                  );
                })}
              </div>

              <button
                type="button"
                onClick={() => setStep(2)}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-slate-950 font-extrabold text-sm shadow-lg shadow-emerald-500/20 transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                <span>Continue to Goal Hours</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>
          )}

          {/* Step 2: Study/Work Hours */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Step 2 of 3</span>
                <h2 className="text-2xl font-black text-slate-100 mt-1">Daily Target Hours</h2>
                <p className="text-sm text-slate-400 mt-1">
                  How many hours do you usually work or study every day?
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {hourOptions.map((h) => {
                  const isSelected = goalHours === h.hours;
                  return (
                    <button
                      key={h.hours}
                      type="button"
                      onClick={() => setGoalHours(h.hours)}
                      className={`p-4 rounded-2xl border text-left flex flex-col justify-between gap-1 transition-all ${
                        isSelected
                          ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300 shadow-md shadow-emerald-500/10'
                          : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                      }`}
                    >
                      <span className="font-bold text-base text-slate-100">{h.label}</span>
                      <span className="text-xs text-slate-400">{h.sub}</span>
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-5 py-3 rounded-xl bg-slate-800 text-slate-300 text-sm font-semibold hover:bg-slate-700"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-slate-950 font-extrabold text-sm shadow-lg shadow-emerald-500/20 transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  <span>Continue</span>
                  <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Ready to Launch */}
          {step === 3 && (
            <div className="space-y-6 text-center">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-400 to-emerald-600 text-slate-950 flex items-center justify-center mx-auto shadow-xl shadow-emerald-500/30">
                <Sparkles className="w-8 h-8" />
              </div>

              <div>
                <h2 className="text-2xl font-black text-slate-100">You're All Set! 🚀</h2>
                <p className="text-sm text-slate-400 max-w-sm mx-auto mt-2 leading-relaxed">
                  Your personalized timetable and streak engine are primed and ready in Supabase. Let's start building consistency!
                </p>
              </div>

              <button
                type="button"
                disabled={saving}
                onClick={handleFinish}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-slate-950 font-extrabold text-sm shadow-lg shadow-emerald-500/20 transition-all active:scale-95"
              >
                {saving ? 'Setting Up...' : 'Launch My Dashboard ⚡'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
