
import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area, LineChart, Line, Cell, PieChart, Pie 
} from 'recharts';
import { 
  TrendingUp, 
  Users, 
  Clock, 
  ShieldCheck, 
  Zap, 
  UserPlus, 
  AlertCircle, 
  ArrowUpRight, 
  Target, 
  Award,
  ChevronRight,
  Timer,
  CheckCircle2,
  UserRoundX
} from 'lucide-react';

const PERFORMANCE_DATA = [
  { name: 'Mon', art: 45, slas: 98, reassignments: 2 },
  { name: 'Tue', art: 52, slas: 95, reassignments: 5 },
  { name: 'Wed', art: 38, slas: 99, reassignments: 1 },
  { name: 'Thu', art: 65, slas: 92, reassignments: 8 },
  { name: 'Fri', art: 42, slas: 97, reassignments: 3 },
  { name: 'Sat', art: 30, slas: 100, reassignments: 0 },
  { name: 'Sun', art: 35, slas: 99, reassignments: 1 },
];

const OPERATOR_STATS = [
  { id: 'RTC-01', name: 'Ahmad Faisal', incidents: 142, avgResponse: '42s', success: 98.2, reassignments: 1 },
  { id: 'RTC-02', name: 'Siti Rahma', incidents: 128, avgResponse: '58s', success: 94.5, reassignments: 4 },
  { id: 'RTC-03', name: 'Budi Hartono', incidents: 156, avgResponse: '35s', success: 99.1, reassignments: 0 },
  { id: 'RTC-04', name: 'Dewi Lestari', incidents: 98, avgResponse: '72s', success: 91.2, reassignments: 7 },
];

const LeadKpiDashboard: React.FC = () => {
  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      <div className="flex justify-between items-end">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-black p-2 rounded-xl text-white shadow-xl shadow-black/10">
              <Target size={24} />
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-zinc-900">Performance Intelligence</h2>
          </div>
          <p className="text-gray-500">RTC Lead Terminal: Monitoring operator agility and SLA compliance.</p>
        </div>
        <div className="flex gap-3">
          <div className="bg-emerald-50 text-emerald-700 px-4 py-2 rounded-xl border border-emerald-100 flex items-center gap-2 text-xs font-bold">
            <CheckCircle2 size={14} /> Center Health: Optimal
          </div>
          <button className="bg-zinc-900 text-white px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-black transition-all">
            Export Shift Audit
          </button>
        </div>
      </div>

      {/* High Level KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <KpiCard 
          label="Avg. Response (ART)" 
          value="44s" 
          subValue="-12% vs LW" 
          icon={Timer} 
          color="text-blue-600" 
          bg="bg-blue-50" 
        />
        <KpiCard 
          label="SLA Adherence" 
          value="97.4%" 
          subValue="+2.1% trend" 
          icon={ShieldCheck} 
          color="text-emerald-600" 
          bg="bg-emerald-50" 
        />
        <KpiCard 
          label="Resolution Rate" 
          value="89%" 
          subValue="Steady" 
          icon={Zap} 
          color="text-amber-600" 
          bg="bg-amber-50" 
        />
        <KpiCard 
          label="Reassignment Pts" 
          value="12" 
          subValue="Critically Low" 
          icon={UserRoundX} 
          color="text-rose-600" 
          bg="bg-rose-50" 
          isWarning
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Trend Analysis Chart */}
        <div className="lg:col-span-2 bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm flex flex-col">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-lg font-black flex items-center gap-3 uppercase tracking-tight">
              <TrendingUp size={22} className="text-blue-600" /> Response Agility Trend
            </h3>
            <div className="flex gap-2">
              <span className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 uppercase"><div className="w-2 h-2 rounded-full bg-blue-500"></div> ART (Seconds)</span>
              <span className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 uppercase"><div className="w-2 h-2 rounded-full bg-rose-500"></div> SLA Breaches</span>
            </div>
          </div>
          <div className="flex-1 min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={PERFORMANCE_DATA}>
                <defs>
                  <linearGradient id="colorArt" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f1f1" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fontSize: 10, fontWeight: 700, fill: '#94a3b8'}} 
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fontSize: 10, fontWeight: 700, fill: '#94a3b8'}} 
                />
                <Tooltip 
                  contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.1)' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="art" 
                  stroke="#3b82f6" 
                  strokeWidth={4} 
                  fillOpacity={1} 
                  fill="url(#colorArt)" 
                />
                <Area 
                  type="monotone" 
                  dataKey="reassignments" 
                  stroke="#ef4444" 
                  strokeWidth={2} 
                  fill="none" 
                  strokeDasharray="5 5"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Live Operator Distribution */}
        <div className="bg-zinc-900 p-8 rounded-[40px] text-white shadow-2xl flex flex-col relative overflow-hidden">
          <div className="relative z-10">
            <h3 className="text-lg font-black mb-8 flex items-center gap-3 uppercase tracking-tight">
              <Users size={22} className="text-emerald-400" /> Center Efficiency
            </h3>
            <div className="space-y-6">
              <EfficiencyMeter label="SLA 5m Window" value={98} color="bg-emerald-500" />
              <EfficiencyMeter label="Intervention Success" value={92} color="bg-blue-500" />
              <EfficiencyMeter label="Hardware Uptime" value={99} color="bg-indigo-500" />
              <EfficiencyMeter label="Operator Alertness" value={85} color="bg-amber-500" />
            </div>
            <div className="mt-12 p-6 bg-white/5 rounded-[32px] border border-white/10">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-emerald-500/20 text-emerald-400 rounded-2xl">
                  <Award size={24} />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase text-zinc-500 tracking-widest">Top Performer</p>
                  <p className="text-sm font-bold">Budi Hartono (RTC-03)</p>
                </div>
              </div>
            </div>
          </div>
          <div className="absolute -bottom-10 -right-10 text-white/5 opacity-20 pointer-events-none">
            <Target size={240} />
          </div>
        </div>

        {/* Individual Operator Breakdown */}
        <div className="lg:col-span-3 bg-white rounded-[40px] border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-8 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
            <h3 className="text-xl font-bold flex items-center gap-3">
              <Users size={24} className="text-zinc-400" /> Operator Performance Audit
            </h3>
            <button className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:underline">View Historical Logs</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-white text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-50">
                  <th className="px-8 py-5">Operator Profile</th>
                  <th className="px-8 py-5">Incidents Handled</th>
                  <th className="px-8 py-5">Avg. Response</th>
                  <th className="px-8 py-5">Success Rate</th>
                  <th className="px-8 py-5">Reassignments</th>
                  <th className="px-8 py-5 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {OPERATOR_STATS.map((op) => (
                  <tr key={op.id} className="group hover:bg-zinc-50 transition-colors">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center font-black text-zinc-400 text-xs border border-zinc-200">
                          {op.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-zinc-900">{op.name}</p>
                          <p className="text-[10px] font-black text-zinc-400 uppercase">{op.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5 font-bold text-sm text-zinc-900">{op.incidents}</td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-2">
                         <Clock size={14} className="text-zinc-400" />
                         <span className="text-sm font-bold text-zinc-900">{op.avgResponse}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                         <div className="flex-1 h-1.5 w-24 bg-zinc-100 rounded-full overflow-hidden">
                           <div className="h-full bg-emerald-500" style={{ width: `${op.success}%` }} />
                         </div>
                         <span className="text-xs font-black text-zinc-900">{op.success}%</span>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <span className={`text-sm font-bold ${op.reassignments > 3 ? 'text-rose-600' : 'text-zinc-500'}`}>
                        {op.reassignments}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-right">
                       <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-widest ${
                         op.success > 95 ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                       }`}>
                         {op.success > 95 ? 'Elite' : 'Stable'}
                       </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

const KpiCard = ({ label, value, subValue, icon: Icon, color, bg, isWarning }: any) => (
  <div className={`p-8 rounded-[40px] bg-white border border-gray-100 shadow-sm flex flex-col justify-between h-44 group hover:shadow-xl transition-all relative overflow-hidden ${isWarning ? 'ring-1 ring-rose-100' : ''}`}>
    <div className="flex justify-between items-start relative z-10">
      <div className={`p-4 rounded-2xl ${bg} ${color} shadow-lg shadow-black/5`}>
        <Icon size={24} />
      </div>
      <ArrowUpRight size={20} className="text-zinc-200 group-hover:text-zinc-900 transition-colors" />
    </div>
    <div className="relative z-10">
      <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1.5">{label}</p>
      <div className="flex items-baseline gap-3">
        <h3 className={`text-3xl font-black ${color}`}>{value}</h3>
        <span className="text-[10px] font-bold text-zinc-400">{subValue}</span>
      </div>
    </div>
  </div>
);

const EfficiencyMeter = ({ label, value, color }: any) => (
  <div>
    <div className="flex justify-between items-center mb-2">
      <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">{label}</p>
      <p className="text-xs font-black text-white">{value}%</p>
    </div>
    <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
      <div className={`h-full ${color}`} style={{ width: `${value}%` }} />
    </div>
  </div>
);

export default LeadKpiDashboard;
