
import React, { useState } from 'react';
import { AlertCategory, DEFAULT_CATEGORIES, AutoCloseRule, AlertSeverity } from '../types';
import { Plus, Trash2, Settings, Shield, Info, AlertTriangle, CheckCircle2, Zap, Clock } from 'lucide-react';

interface ConfigurationProps {
  categories: AlertCategory[];
  autoCloseRules: AutoCloseRule[];
  onAddCategory: (category: string) => void;
  onRemoveCategory: (category: string) => void;
  onAddAutoCloseRule: (rule: AutoCloseRule) => void;
  onRemoveAutoCloseRule: (id: string) => void;
}

const Configuration: React.FC<ConfigurationProps> = ({ 
  categories, 
  autoCloseRules,
  onAddCategory, 
  onRemoveCategory,
  onAddAutoCloseRule,
  onRemoveAutoCloseRule
}) => {
  const [newCategory, setNewCategory] = useState('');
  
  // Rule Form State
  const [ruleCategory, setRuleCategory] = useState(categories[0]);
  const [ruleInactivity, setRuleInactivity] = useState(30);
  const [ruleSeverity, setRuleSeverity] = useState(AlertSeverity.WARNING);

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (newCategory.trim() && !categories.includes(newCategory.trim())) {
      onAddCategory(newCategory.trim());
      setNewCategory('');
    }
  };

  const handleAddRule = () => {
    const newRule: AutoCloseRule = {
      id: `rule-${Date.now()}`,
      category: ruleCategory,
      inactivityMinutes: ruleInactivity,
      severityThreshold: ruleSeverity,
      enabled: true
    };
    onAddAutoCloseRule(newRule);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      <div className="flex items-center gap-4">
        <div className="bg-black p-3 rounded-2xl text-white shadow-xl shadow-black/10">
          <Settings size={28} />
        </div>
        <div>
          <h2 className="text-3xl font-bold tracking-tight">System Configuration</h2>
          <p className="text-gray-500 font-medium mt-1">Manage global operational logic and automation parameters.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-8">
          {/* Category Management */}
          <section className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm">
            <h3 className="text-xl font-bold mb-2">Alert Classification</h3>
            <p className="text-sm text-gray-500 mb-8 leading-relaxed">Define operational buckets for distribution incidents. System defaults are protected to ensure base compliance reporting.</p>

            <form onSubmit={handleAddCategory} className="flex gap-3 mb-8">
              <input
                type="text"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                placeholder="New classification (e.g., Infrastructure)"
                className="flex-1 px-5 py-3 bg-gray-50 border border-gray-100 focus:bg-white focus:border-black rounded-2xl text-sm outline-none transition-all shadow-inner"
              />
              <button
                type="submit"
                disabled={!newCategory.trim()}
                className="bg-black text-white px-8 py-3 rounded-2xl text-sm font-bold shadow-lg hover:bg-gray-800 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus size={18} /> Add
              </button>
            </form>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {categories.map((category) => (
                <div key={category} className="flex items-center justify-between p-5 bg-gray-50 rounded-[24px] border border-gray-100 group hover:border-black hover:bg-white transition-all">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center border border-gray-100 shadow-sm group-hover:scale-110 transition-transform">
                      <AlertTriangle size={16} className="text-gray-400 group-hover:text-black" />
                    </div>
                    <span className="text-sm font-bold">{category}</span>
                  </div>
                  {!DEFAULT_CATEGORIES.includes(category) ? (
                    <button
                      onClick={() => onRemoveCategory(category)}
                      className="p-2 text-gray-300 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  ) : (
                    <span className="px-2 py-0.5 bg-blue-50 text-blue-500 text-[10px] font-bold uppercase rounded-lg tracking-widest ring-1 ring-blue-100">
                      Protected
                    </span>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* Automation Rules */}
          <section className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm overflow-hidden relative">
            <div className="absolute top-0 right-0 p-8 opacity-5">
              <Zap size={120} />
            </div>
            <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
              <Zap size={20} className="text-amber-500" /> Auto-Close Automation
            </h3>
            <p className="text-sm text-gray-500 mb-8 leading-relaxed">Establish rules to resolve inactive investigations automatically. This maintains a lean RTC Queue and ensures operational efficiency.</p>

            <div className="bg-gray-50 p-6 rounded-[28px] border border-gray-100 mb-8 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Category Target</label>
                  <select 
                    value={ruleCategory}
                    onChange={(e) => setRuleCategory(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white border border-gray-100 rounded-xl text-sm outline-none focus:border-black transition-all"
                  >
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Inactivity Limit</label>
                  <div className="flex items-center gap-3">
                    <input 
                      type="number" 
                      value={ruleInactivity}
                      onChange={(e) => setRuleInactivity(Number(e.target.value))}
                      className="w-20 px-4 py-2.5 bg-white border border-gray-100 rounded-xl text-sm outline-none focus:border-black transition-all"
                    />
                    <span className="text-xs text-gray-500 font-medium">Minutes</span>
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Severity Safe-Zone</label>
                <div className="flex gap-2">
                  {Object.values(AlertSeverity).map(s => (
                    <button
                      key={s}
                      onClick={() => setRuleSeverity(s)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                        ruleSeverity === s ? 'bg-black text-white border-black shadow-lg' : 'bg-white text-gray-400 border-gray-100 hover:border-gray-300'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
              <button 
                onClick={handleAddRule}
                className="w-full py-3 bg-emerald-600 text-white rounded-2xl text-sm font-bold shadow-lg shadow-emerald-100 hover:bg-emerald-700 transition-all flex items-center justify-center gap-2"
              >
                <Plus size={18} /> Deploy Auto-Close Rule
              </button>
            </div>

            <div className="space-y-4">
              {autoCloseRules.map((rule) => (
                <div key={rule.id} className="flex items-center justify-between p-5 bg-white border border-gray-100 rounded-[24px] hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600">
                      <Clock size={24} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-bold">{rule.category}</p>
                        <span className="px-1.5 py-0.5 bg-gray-100 text-[8px] font-black uppercase rounded tracking-tighter">Rule Active</span>
                      </div>
                      <p className="text-[10px] text-gray-500 font-medium mt-1">
                        Auto-closes after <span className="text-black font-bold">{rule.inactivityMinutes}m</span> of inactivity if severity ≤ <span className="text-black font-bold">{rule.severityThreshold}</span>.
                      </p>
                    </div>
                  </div>
                  <button 
                    onClick={() => onRemoveAutoCloseRule(rule.id)}
                    className="p-2.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm">
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <Info size={18} className="text-gray-400" /> System Integrity
            </h3>
            <div className="space-y-4">
              <div className="p-5 bg-gray-50 rounded-2xl border border-gray-100">
                <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Active Categories</p>
                <p className="text-lg font-black">{categories.length}</p>
              </div>
              <div className="p-5 bg-gray-50 rounded-2xl border border-gray-100">
                <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Automation Rules</p>
                <p className="text-lg font-black">{autoCloseRules.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-emerald-600 p-8 rounded-[32px] shadow-2xl text-white relative overflow-hidden group">
            <div className="relative z-10">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-4">
                <Shield size={24} />
              </div>
              <h3 className="font-black text-xl mb-2">Policy Guard</h3>
              <p className="text-emerald-100 text-xs leading-relaxed mb-6">
                System automation ensures all investigations follow standard operating procedures without manual intervention.
              </p>
              <button className="w-full py-3 bg-white text-emerald-700 text-xs font-black rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-black/10 hover:bg-emerald-50 transition-all">
                View Audit Trail
              </button>
            </div>
            <div className="absolute -bottom-10 -right-10 text-white/5 group-hover:scale-110 transition-transform duration-700">
              <Settings size={200} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Configuration;
