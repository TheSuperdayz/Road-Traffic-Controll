
import React from 'react';
import { JobOrder, JobOrderStatus } from '../types';
import { Clock, Info, AlertTriangle, CheckCircle2 } from 'lucide-react';

const HOURS = Array.from({ length: 24 }, (_, i) => i);

const ScheduleTimeline: React.FC<{ jobOrders: JobOrder[] }> = ({ jobOrders }) => {
  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Logistics Timeline</h2>
        <p className="text-gray-500 mt-1">Operational delivery windows & distribution intensity.</p>
      </div>

      <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm overflow-hidden flex flex-col h-[600px]">
        {/* Timeline Header (Hours) */}
        <div className="flex border-b border-gray-50 pb-4 ml-48">
          {HOURS.map(hour => (
            <div key={hour} className="flex-1 text-[10px] font-bold text-gray-400 text-center">
              {hour.toString().padStart(2, '0')}:00
            </div>
          ))}
        </div>

        {/* Scrollable Timeline Area */}
        <div className="flex-1 overflow-y-auto mt-6 custom-scrollbar pr-4">
          <div className="space-y-6">
            {jobOrders.map(lo => {
              const startH = parseInt(lo.plannedStart.split(':')[0]);
              const endH = parseInt(lo.plannedArrival.split(':')[0]);
              const duration = endH - startH;
              
              return (
                <div key={lo.id} className="flex items-center group">
                  {/* Label */}
                  <div className="w-48 pr-6 shrink-0">
                    <p className="text-sm font-bold">{lo.id}</p>
                    <p className="text-[10px] text-gray-400 uppercase tracking-widest">{lo.vehicleId}</p>
                  </div>
                  
                  {/* Track Area */}
                  <div className="flex-1 h-12 relative flex items-center bg-gray-50/50 rounded-2xl border border-gray-100/30">
                    {/* Grid lines inside track */}
                    {HOURS.map(h => <div key={h} className="flex-1 h-full border-r border-gray-100/30 last:border-0" />)}
                    
                    {/* Task Bar */}
                    <div 
                      className={`absolute h-8 rounded-xl flex items-center px-3 shadow-sm transition-all group-hover:scale-[1.02] ${
                        lo.status === JobOrderStatus.EXCEPTION ? 'bg-rose-500 text-white' : 'bg-blue-600 text-white'
                      }`}
                      style={{
                        left: `${(startH / 24) * 100}%`,
                        width: `${(duration / 24) * 100}%`
                      }}
                    >
                      <span className="text-[10px] font-bold truncate">
                        {lo.origin} → {lo.destination}
                      </span>
                      <div className="ml-auto flex items-center gap-1.5 shrink-0">
                         {lo.slaConfidence === 'Low' && <AlertTriangle size={12} className="text-white animate-pulse" />}
                         <span className="text-[9px] font-black opacity-80">{lo.volume}L</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-100 flex justify-between items-center">
           <div className="flex gap-6">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-blue-600"></div>
                <span className="text-xs font-bold text-gray-500">Normal Transit</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-rose-500"></div>
                <span className="text-xs font-bold text-gray-500">Exception / Delayed</span>
              </div>
           </div>
           <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-xl text-xs font-bold text-gray-400 italic">
              <Info size={14} /> System automatically infers region overloading based on concurrent ETAs.
           </div>
        </div>
      </div>
    </div>
  );
};

export default ScheduleTimeline;
