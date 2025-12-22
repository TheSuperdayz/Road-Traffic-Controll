
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, AreaChart, Area, PieChart, Pie } from 'recharts';
import { TrendingUp, AlertCircle, Map, UserX, Package, ShieldCheck, ArrowUpRight, Award, Zap, ChevronRight } from 'lucide-react';

const violationData = [
  { type: 'Speeding', count: 45, color: '#f59e0b' },
  { type: 'Geofence Exit', count: 28, color: '#3b82f6' },
  { type: 'Sudden Brake', count: 12, color: '#ef4444' },
  { type: 'Fatigue (DMS)', count: 32, color: '#8b5cf6' },
  { type: 'Unauthorized Stop', count: 18, color: '#ec4899' },
];

const vendorRisk = [
  { name: 'Pertamina Trans', score: 92, status: 'Exemplary' },
  { name: 'Logistic Prime', score: 78, status: 'Watchlist' },
  { name: 'Jalur Hijau', score: 85, status: 'Stable' },
  { name: 'Swift BBM', score: 64, status: 'Critical' },
];

const routeHeatmap = [
  { route: 'Plumpang - Cileungsi', risk: 'High', intensity: 85, hotspots: 4 },
  { route: 'Balongan - Jakarta', risk: 'Medium', intensity: 42, hotspots: 2 },
  { route: 'Tanjung Gerem - Serang', risk: 'Low', intensity: 12, hotspots: 0 },
  { route: 'Ujung Berung - Bandung', risk: 'High', intensity: 78, hotspots: 3 },
];

const repeatOffenders = [
  { driver: 'Budi Santoso', incidents: 5, lastAlert: '2h ago' },
  { driver: 'Andi Wijaya', incidents: 3, lastAlert: '1d ago' },
  { driver: 'Rahmat Hidayat', incidents: 2, lastAlert: '3d ago' },
];

const Analytics: React.FC = () => {
  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Risk & Performance</h2>
          <p className="text-gray-500 mt-1">Advanced pattern recognition and audit trail insights.</p>
        </div>
        <div className="bg-white border border-gray-100 p-1 rounded-xl shadow-sm flex gap-1">
          <button className="px-4 py-1.5 bg-black text-white text-xs font-bold rounded-lg transition-all">Export PDF</button>
          <button className="px-4 py-1.5 text-gray-400 text-xs font-bold hover:text-black transition-all">CSV</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Violation Pattern */}
        <div className="lg:col-span-2 bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <TrendingUp size={20} className="text-blue-500" /> Violation Distribution
            </h3>
            <select className="bg-gray-100 border-none rounded-lg text-[10px] font-bold px-3 py-1.5 outline-none uppercase tracking-wider text-gray-500">
              <option>Last 30 Days</option>
              <option>Last Quarter</option>
            </select>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={violationData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f1f1" />
                <XAxis type="number" hide />
                <YAxis 
                  dataKey="type" 
                  type="category" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fontSize: 12, fill: '#6b7280', fontWeight: 600}} 
                  width={130} 
                />
                <Tooltip 
                  cursor={{fill: 'transparent'}}
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }} 
                />
                <Bar dataKey="count" radius={[0, 8, 8, 0]} barSize={32}>
                  {violationData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} fillOpacity={0.8} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Vendor Risk Scoring */}
        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm flex flex-col">
          <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
            <ShieldCheck size={20} className="text-emerald-500" /> Vendor Risk Matrix
          </h3>
          <div className="flex-1 space-y-6">
            {vendorRisk.map((vendor, idx) => (
              <div key={idx} className="group cursor-default">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-bold text-gray-800">{vendor.name}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                    vendor.score > 90 ? 'bg-emerald-50 text-emerald-600' :
                    vendor.score > 75 ? 'bg-blue-50 text-blue-600' : 'bg-rose-50 text-rose-600'
                  }`}>
                    {vendor.status}
                  </span>
                </div>
                <div className="w-full h-2 bg-gray-50 rounded-full overflow-hidden border border-gray-100">
                  <div 
                    className={`h-full transition-all duration-1000 ${
                      vendor.score > 90 ? 'bg-emerald-500' :
                      vendor.score > 75 ? 'bg-blue-500' : 'bg-rose-500'
                    }`} 
                    style={{ width: `${vendor.score}%` }}
                  ></div>
                </div>
                <p className="text-[10px] text-gray-400 mt-2 font-medium">Compliance Score: {vendor.score}/100</p>
              </div>
            ))}
          </div>
          <button className="w-full mt-8 py-3 bg-gray-50 text-gray-400 text-xs font-bold rounded-2xl hover:bg-black hover:text-white transition-all">
            Detailed Vendor Governance
          </button>
        </div>

        {/* Route Risk Heatmap */}
        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
          <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
            <Map size={20} className="text-amber-500" /> Route Risk Heatmap
          </h3>
          <div className="space-y-4">
            {routeHeatmap.map((item, idx) => (
              <div key={idx} className="flex flex-col gap-4 p-5 bg-gray-50 rounded-[28px] border border-gray-100 hover:border-amber-200 hover:bg-white transition-all group">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg ${
                    item.risk === 'High' ? 'bg-rose-500 shadow-rose-100' : 
                    item.risk === 'Medium' ? 'bg-amber-500 shadow-amber-100' : 
                    'bg-emerald-500 shadow-emerald-100'
                  }`}>
                    <Zap size={20} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-black text-gray-900">{item.route}</p>
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-lg border uppercase tracking-widest ${
                        item.risk === 'High' ? 'bg-rose-50 text-rose-600 border-rose-100' : 
                        item.risk === 'Medium' ? 'bg-amber-50 text-amber-600 border-amber-100' : 
                        'bg-emerald-50 text-emerald-600 border-emerald-100'
                      }`}>
                        {item.risk} Risk
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-2">
                      <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className={`h-full transition-all duration-1000 ${
                            item.risk === 'High' ? 'bg-rose-500' : 
                            item.risk === 'Medium' ? 'bg-amber-500' : 
                            'bg-emerald-500'
                          }`}
                          style={{ width: `${item.intensity}%` }}
                        />
                      </div>
                      <span className="text-[10px] font-black text-gray-400">{item.intensity}% Intensity</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between pt-3 border-t border-gray-100/50">
                  <div className="flex items-center gap-2">
                    <AlertCircle size={12} className={item.hotspots > 0 ? 'text-rose-500' : 'text-gray-300'} />
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-tight">
                      {item.hotspots} Active Hotspots Detected
                    </span>
                  </div>
                  <button className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:underline opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                    View Geo-Audit <ChevronRight size={10} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Repeat Offenders & Behavior */}
        <div className="lg:col-span-2 bg-black text-white p-8 rounded-3xl shadow-xl relative overflow-hidden">
          <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
                <UserX size={20} className="text-rose-400" /> High-Risk Driver Profiling
              </h3>
              <p className="text-gray-400 text-sm mb-8">Repeat offenders identified via DMS & Telemetry correlation.</p>
              <div className="space-y-4">
                {repeatOffenders.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-2xl">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center font-bold text-sm">
                        {item.driver.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <p className="text-sm font-bold">{item.driver}</p>
                        <p className="text-[10px] text-gray-500 uppercase">Alert: {item.lastAlert}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-rose-400 font-bold">{item.incidents} Incidents</p>
                      <button className="text-[10px] text-gray-400 hover:text-white underline">Coach Driver</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white/5 rounded-3xl p-6 border border-white/10 flex flex-col items-center justify-center text-center">
              <div className="w-32 h-32 rounded-full border-[6px] border-rose-500/20 flex items-center justify-center relative mb-4">
                <div className="text-3xl font-black">12%</div>
                <div className="absolute inset-0 border-[6px] border-rose-500 border-t-transparent rounded-full animate-[spin_3s_linear_infinite]"></div>
              </div>
              <h4 className="text-lg font-bold">Network Alert Density</h4>
              <p className="text-xs text-gray-400 mt-2 max-w-[200px]">Drivers with >3 violations in 7 days require mandatory policy intervention.</p>
              <button className="mt-6 px-6 py-2 bg-white text-black text-xs font-bold rounded-xl hover:bg-gray-200 transition-all flex items-center gap-2">
                Review Policy <ArrowUpRight size={14} />
              </button>
            </div>
          </div>
          <div className="absolute -bottom-12 -right-12 text-white/5 opacity-10">
            <ShieldCheck size={240} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
