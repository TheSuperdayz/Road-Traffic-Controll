
import React, { useMemo, useState } from 'react';
import { JobOrder, JobOrderStatus, Unit, VehicleState } from '../types';
import { 
  Clock, 
  Info, 
  AlertTriangle, 
  CheckCircle2, 
  Truck, 
  Wrench, 
  Warehouse, 
  Navigation,
  Timer,
  ShieldCheck,
  Zap,
  Activity,
  LayoutGrid,
  List,
  ChevronRight,
  Database,
  ExternalLink,
  Signal
} from 'lucide-react';

const HOURS = Array.from({ length: 24 }, (_, i) => i);

interface Props {
  jobOrders: JobOrder[];
  units: Unit[];
}

const ScheduleTimeline: React.FC<Props> = ({ jobOrders, units }) => {
  const [viewMode, setViewMode] = useState<'timeline' | 'table'>('table');
  const currentHour = new Date().getHours();
  const currentMinute = new Date().getMinutes();
  const nowPosition = ((currentHour + currentMinute / 60) / 24) * 100;

  // Mocking non-shipment data for demonstration of the matrix
  const standbyData = [
    { id: 'TRK-005', location: 'Plumpang Depot', start: 0, end: 14, duration: '14h 00m' },
    { id: 'TRK-006', location: 'Balongan Terminal', start: 4, end: 18, duration: '14h 00m' },
    { id: 'TRK-007', location: 'Merak Storage', start: 2, end: 12, duration: '10h 00m' },
  ];

  const maintenanceData = [
    { id: 'TRK-008', task: 'DMS Calibration', start: 8, end: 12, priority: 'Routine', engineer: 'Tech Team Alpha' },
    { id: 'TRK-010', task: 'Sensor Array Replacement', start: 14, end: 20, priority: 'Critical', engineer: 'Lead Specialist' },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-black tracking-tight text-zinc-900 uppercase">Fleet Deployment Matrix</h2>
          <p className="text-zinc-500 mt-1 font-medium italic">24-Hour Operational Lifecycle & Readiness Audit.</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="bg-white p-1 rounded-2xl border border-zinc-100 shadow-sm flex items-center">
            <button 
              onClick={() => setViewMode('table')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'table' ? 'bg-zinc-900 text-white shadow-lg' : 'text-zinc-400 hover:text-zinc-900'}`}
            >
              <List size={16} /> Registry
            </button>
            <button 
              onClick={() => setViewMode('timeline')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'timeline' ? 'bg-zinc-900 text-white shadow-lg' : 'text-zinc-400 hover:text-zinc-900'}`}
            >
              <LayoutGrid size={16} /> Timeline
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[48px] border border-zinc-100 shadow-2xl overflow-hidden flex flex-col min-h-[600px] relative">
        {viewMode === 'timeline' ? (
          <>
            {/* Timeline Header (Hours) */}
            <div className="flex border-b border-zinc-50 bg-zinc-50/50 backdrop-blur-md sticky top-0 z-30">
              <div className="w-64 border-r border-zinc-100 shrink-0 p-6">
                 <span className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.3em]">Matrix Nodes</span>
              </div>
              <div className="flex-1 flex relative">
                {HOURS.map(hour => (
                  <div key={hour} className="flex-1 text-[10px] font-black text-zinc-400 py-6 text-center border-r border-zinc-100/50 last:border-0">
                    {hour.toString().padStart(2, '0')}:00
                  </div>
                ))}
              </div>
            </div>

            {/* Scrollable Matrix Area */}
            <div className="flex-1 overflow-y-auto custom-scrollbar relative max-h-[600px]">
              {/* NOW Indicator Line */}
              <div 
                className="absolute top-0 bottom-0 w-0.5 bg-rose-500 z-20 shadow-[0_0_15px_rgba(244,63,94,0.6)] flex flex-col items-center"
                style={{ left: `calc(16rem + ${nowPosition}%)` }}
              >
                 <div className="bg-rose-500 text-white text-[8px] font-black px-1.5 py-0.5 rounded-full whitespace-nowrap absolute -top-1 shadow-lg">NOW</div>
              </div>

              <div className="divide-y divide-zinc-50">
                <MatrixSection title="Active Distribution" icon={Navigation} color="text-indigo-600" bg="bg-indigo-50/30">
                  {jobOrders.map(lo => (
                    <MatrixRow 
                      key={lo.id} id={lo.id} subId={lo.vehicleId}
                      start={parseInt(lo.plannedStart.split(':')[0]) + (parseInt(lo.plannedStart.split(':')[1])/60)}
                      end={parseInt(lo.plannedArrival.split(':')[0]) + (parseInt(lo.plannedArrival.split(':')[1])/60)}
                      label={`${lo.origin} → ${lo.destination}`} type="ACTIVE"
                      meta={{ volume: lo.volume, sla: lo.slaConfidence }}
                    />
                  ))}
                </MatrixSection>
                <MatrixSection title="Terminal Standby" icon={Warehouse} color="text-zinc-500" bg="bg-zinc-50/30">
                  {standbyData.map(st => (
                    <MatrixRow key={st.id} id={st.id} subId="PARKED" start={st.start} end={st.end} label={st.location} type="DEPOT" />
                  ))}
                </MatrixSection>
                <MatrixSection title="Hardware Rectification" icon={Wrench} color="text-amber-600" bg="bg-amber-50/30">
                  {maintenanceData.map(mt => (
                    <MatrixRow key={mt.id} id={mt.id} subId="MAINTENANCE" start={mt.start} end={mt.end} label={mt.task} type="MAINTENANCE" meta={{ priority: mt.priority }} />
                  ))}
                </MatrixSection>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col">
             {/* Table View: Categorized Registry */}
             <div className="overflow-x-auto">
               <table className="w-full text-left">
                  <thead className="sticky top-0 z-10">
                     <tr className="bg-zinc-50 text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] border-b border-zinc-100">
                        <th className="px-8 py-6">Operational Node</th>
                        <th className="px-8 py-6">Assignment / Activity</th>
                        <th className="px-8 py-6">Start Window</th>
                        <th className="px-8 py-6">End Window</th>
                        <th className="px-8 py-6">Audit Status</th>
                        <th className="px-8 py-6 text-right">Action</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-50">
                     {/* Registry Group: Active Shipment */}
                     <TableCategoryRow label="Active Distribution" icon={Navigation} color="text-indigo-600" count={jobOrders.length} />
                     {jobOrders.map(lo => (
                        <tr key={lo.id} className="group hover:bg-zinc-50 transition-colors">
                           <td className="px-8 py-6">
                              <div className="flex items-center gap-4">
                                 <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl border border-indigo-100 shadow-sm"><Truck size={18}/></div>
                                 <div>
                                    <p className="text-sm font-black text-zinc-900 uppercase tracking-tight">{lo.vehicleId}</p>
                                    <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest mt-1">Job: {lo.id}</p>
                                 </div>
                              </div>
                           </td>
                           <td className="px-8 py-6">
                              <p className="text-xs font-black text-zinc-700 uppercase tracking-tighter">{lo.origin} <ChevronRight size={10} className="inline mx-1 text-zinc-300"/> {lo.destination}</p>
                              <div className="flex items-center gap-3 mt-1.5">
                                 <span className="text-[9px] font-black px-1.5 py-0.5 bg-zinc-100 text-zinc-500 rounded uppercase tracking-widest">{lo.volume} L</span>
                                 <span className="text-[9px] font-black text-indigo-500 uppercase flex items-center gap-1"><Signal size={10}/> Telemetry Linked</span>
                              </div>
                           </td>
                           <td className="px-8 py-6 text-xs font-black text-zinc-500">{lo.plannedStart}</td>
                           <td className="px-8 py-6 text-xs font-black text-zinc-500">{lo.plannedArrival}</td>
                           <td className="px-8 py-6">
                              <div className={`px-3 py-1.5 rounded-xl border w-fit text-[10px] font-black uppercase tracking-widest flex items-center gap-2 ${
                                 lo.slaConfidence === 'High' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                 lo.slaConfidence === 'Medium' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                                 'bg-rose-50 text-rose-600 border-rose-100 animate-pulse'
                              }`}>
                                 <div className={`w-1.5 h-1.5 rounded-full ${lo.slaConfidence === 'High' ? 'bg-emerald-500' : lo.slaConfidence === 'Medium' ? 'bg-blue-500' : 'bg-rose-500'}`}></div>
                                 SLA: {lo.slaConfidence}
                              </div>
                           </td>
                           <td className="px-8 py-6 text-right">
                              <button className="p-2.5 bg-white border border-zinc-100 text-zinc-400 hover:bg-zinc-900 hover:text-white rounded-xl transition-all shadow-sm">
                                 <ExternalLink size={16} />
                              </button>
                           </td>
                        </tr>
                     ))}

                     {/* Registry Group: Parking in Depot */}
                     <TableCategoryRow label="Terminal Standby (Parking)" icon={Warehouse} color="text-zinc-500" count={standbyData.length} />
                     {standbyData.map(st => (
                        <tr key={st.id} className="group hover:bg-zinc-50 transition-colors">
                           <td className="px-8 py-6">
                              <div className="flex items-center gap-4">
                                 <div className="p-2.5 bg-zinc-100 text-zinc-500 rounded-xl border border-zinc-200 shadow-sm"><Database size={18}/></div>
                                 <div>
                                    <p className="text-sm font-black text-zinc-900 uppercase tracking-tight">{st.id}</p>
                                    <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest mt-1">FLEET POOL</p>
                                 </div>
                              </div>
                           </td>
                           <td className="px-8 py-6">
                              <p className="text-xs font-black text-zinc-700 uppercase tracking-widest">{st.location}</p>
                              <p className="text-[10px] text-zinc-400 font-bold mt-1.5">Standby Duration: {st.duration}</p>
                           </td>
                           <td className="px-8 py-6 text-xs font-black text-zinc-400 italic">Pre-Dispatch</td>
                           <td className="px-8 py-6 text-xs font-black text-zinc-400 italic">Awaiting LO</td>
                           <td className="px-8 py-6">
                              <div className="px-3 py-1.5 bg-zinc-50 text-zinc-400 border border-zinc-200 rounded-xl text-[10px] font-black uppercase tracking-widest w-fit">
                                 Docked
                              </div>
                           </td>
                           <td className="px-8 py-6 text-right">
                              <button className="p-2.5 bg-white border border-zinc-100 text-zinc-400 hover:bg-zinc-900 hover:text-white rounded-xl transition-all shadow-sm">
                                 <ExternalLink size={16} />
                              </button>
                           </td>
                        </tr>
                     ))}

                     {/* Registry Group: Maintenance */}
                     <TableCategoryRow label="Hardware Rectification" icon={Wrench} color="text-amber-600" count={maintenanceData.length} />
                     {maintenanceData.map(mt => (
                        <tr key={mt.id} className="group hover:bg-zinc-50 transition-colors">
                           <td className="px-8 py-6">
                              <div className="flex items-center gap-4">
                                 <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl border border-amber-100 shadow-sm"><Activity size={18}/></div>
                                 <div>
                                    <p className="text-sm font-black text-zinc-900 uppercase tracking-tight">{mt.id}</p>
                                    <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest mt-1">OFF-LINE</p>
                                 </div>
                              </div>
                           </td>
                           <td className="px-8 py-6">
                              <p className="text-xs font-black text-zinc-700 uppercase tracking-widest">{mt.task}</p>
                              <p className="text-[10px] text-amber-600 font-bold mt-1.5 flex items-center gap-1"><Wrench size={10}/> Assigned to: {mt.engineer}</p>
                           </td>
                           <td className="px-8 py-6 text-xs font-black text-zinc-500">{mt.start}:00</td>
                           <td className="px-8 py-6 text-xs font-black text-zinc-500">{mt.end}:00</td>
                           <td className="px-8 py-6">
                              <div className={`px-3 py-1.5 rounded-xl border w-fit text-[10px] font-black uppercase tracking-widest flex items-center gap-2 ${
                                 mt.priority === 'Critical' ? 'bg-rose-50 text-rose-600 border-rose-100 animate-pulse' : 'bg-amber-50 text-amber-600 border-amber-100'
                              }`}>
                                 <Zap size={10}/> {mt.priority}
                              </div>
                           </td>
                           <td className="px-8 py-6 text-right">
                              <button className="p-2.5 bg-white border border-zinc-100 text-zinc-400 hover:bg-zinc-900 hover:text-white rounded-xl transition-all shadow-sm">
                                 <ExternalLink size={16} />
                              </button>
                           </td>
                        </tr>
                     ))}
                  </tbody>
               </table>
             </div>
          </div>
        )}

        {/* Legend / Stats Footer */}
        <div className="p-8 border-t border-zinc-100 bg-zinc-50/80 flex justify-between items-center z-40">
           <div className="flex gap-10">
              <div className="flex items-center gap-3">
                 <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600 shadow-sm"><Truck size={16} /></div>
                 <div>
                    <p className="text-[10px] font-black text-zinc-400 uppercase">Operational Density</p>
                    <p className="text-sm font-bold text-zinc-900">{jobOrders.length} Shipments Live</p>
                 </div>
              </div>
              <div className="flex items-center gap-3">
                 <div className="p-2 bg-amber-100 rounded-lg text-amber-600 shadow-sm"><Activity size={16} /></div>
                 <div>
                    <p className="text-[10px] font-black text-zinc-400 uppercase">Maintenance Queue</p>
                    <p className="text-sm font-bold text-zinc-900">{maintenanceData.length} Units Docked</p>
                 </div>
              </div>
           </div>
           <div className="flex items-center gap-3 px-6 py-3 bg-white border border-zinc-100 rounded-[20px] shadow-sm">
              <Timer size={14} className="text-zinc-400" />
              <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest italic">
                AI Correlation: <span className="text-emerald-600">No overlapping ETA bottlenecks predicted.</span>
              </p>
           </div>
        </div>
      </div>
    </div>
  );
};

const TableCategoryRow = ({ label, icon: Icon, color, count }: any) => (
   <tr className="bg-zinc-50/50">
      <td colSpan={6} className="px-8 py-4">
         <div className="flex items-center gap-3">
            <div className={`p-1.5 rounded-lg bg-white shadow-sm border border-zinc-100 ${color}`}><Icon size={14} /></div>
            <h4 className={`text-[10px] font-black uppercase tracking-[0.3em] ${color}`}>{label} ({count})</h4>
         </div>
      </td>
   </tr>
);

const MatrixSection = ({ title, icon: Icon, color, bg, children }: any) => (
  <div className="relative">
    <div className={`sticky left-0 flex items-center gap-3 p-6 ${bg} border-b border-zinc-100 z-10 w-full`}>
       <div className={`p-2 rounded-xl bg-white shadow-sm border border-zinc-100 ${color}`}><Icon size={16} /></div>
       <h3 className={`text-[10px] font-black uppercase tracking-[0.3em] ${color}`}>{title}</h3>
    </div>
    <div className="px-0 py-4">{children}</div>
  </div>
);

const MatrixRow = ({ id, subId, start, end, label, type, meta }: any) => {
  const duration = end - start;
  const leftPos = (start / 24) * 100;
  const widthPos = (duration / 24) * 100;

  const styles = {
    ACTIVE: 'bg-indigo-600 text-white shadow-indigo-200 ring-4 ring-indigo-50 hover:bg-indigo-700',
    DEPOT: 'bg-zinc-100 text-zinc-500 border border-zinc-200 hover:bg-zinc-200',
    MAINTENANCE: 'bg-amber-500 text-white shadow-amber-100 ring-4 ring-amber-50 hover:bg-amber-600',
  };

  return (
    <div className="flex items-center group/row hover:bg-zinc-50/50 transition-colors">
      <div className="w-64 p-6 border-r border-zinc-100 shrink-0 bg-white group-hover/row:bg-zinc-50 transition-colors">
        <div className="flex items-center justify-between">
          <p className="text-sm font-black text-zinc-900">{id}</p>
          <span className={`text-[8px] font-black px-1.5 py-0.5 rounded-lg border uppercase tracking-tighter ${
             type === 'ACTIVE' ? 'bg-indigo-50 text-indigo-600 border-indigo-100' :
             type === 'MAINTENANCE' ? 'bg-amber-50 text-amber-600 border-amber-100' :
             'bg-zinc-50 text-zinc-400 border-zinc-100'
          }`}>{subId}</span>
        </div>
      </div>
      
      <div className="flex-1 h-20 relative flex items-center px-4">
        {/* Grid lines background */}
        <div className="absolute inset-0 flex">
          {HOURS.map(h => <div key={h} className="flex-1 h-full border-r border-zinc-50 last:border-0" />)}
        </div>
        
        {/* Bar */}
        <div 
          className={`absolute h-12 rounded-[20px] flex items-center px-5 shadow-xl transition-all duration-500 group-hover/row:scale-[1.01] overflow-hidden ${styles[type as keyof typeof styles]}`}
          style={{ left: `${leftPos}%`, width: `${widthPos}%` }}
        >
          <div className="flex flex-col gap-0.5 min-w-0">
             <span className="text-[10px] font-black uppercase tracking-tight truncate">{label}</span>
             {type === 'ACTIVE' && meta && (
               <div className="flex items-center gap-3 opacity-80">
                  <span className="text-[9px] font-bold whitespace-nowrap uppercase tracking-widest">{meta.volume}L</span>
                  <div className="w-[1px] h-2 bg-white/30"></div>
                  <span className="text-[9px] font-bold whitespace-nowrap uppercase tracking-widest">SLA: {meta.sla}</span>
               </div>
             )}
             {type === 'MAINTENANCE' && meta && (
               <p className="text-[9px] font-bold uppercase tracking-widest opacity-80">{meta.priority} Priority</p>
             )}
          </div>
          {type === 'ACTIVE' && meta.sla === 'Low' && (
            <div className="ml-auto animate-pulse">
               <AlertTriangle size={14} className="text-white" />
            </div>
          )}
          {type === 'DEPOT' && (
             <Warehouse size={14} className="ml-auto text-zinc-300" />
          )}
        </div>
      </div>
    </div>
  );
};

export default ScheduleTimeline;
