
import React from 'react';
import { Unit, JobOrder, Alert, AlertSeverity, JobOrderStatus, VehicleState } from '../types';
import { FileText, Printer, Download, Share2, CheckCircle, ShieldAlert, Truck, Package } from 'lucide-react';

const OperationalReport: React.FC<{ units: Unit[], jobOrders: JobOrder[], alerts: Alert[] }> = ({ units, jobOrders, alerts }) => {
  const totalVolume = jobOrders.reduce((acc, curr) => acc + curr.volume, 0);
  const exceptionCount = jobOrders.filter(lo => lo.status === JobOrderStatus.EXCEPTION).length;
  const criticalCount = alerts.filter(a => a.severity === AlertSeverity.CRITICAL).length;

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold">Operational Briefing</h2>
          <p className="text-gray-500">Auto-generated summary for {new Date().toLocaleDateString()}.</p>
        </div>
        <div className="flex gap-2">
          <button className="p-3 bg-white border border-gray-100 rounded-2xl hover:bg-gray-50 shadow-sm"><Printer size={20}/></button>
          <button className="p-3 bg-white border border-gray-100 rounded-2xl hover:bg-gray-50 shadow-sm"><Download size={20}/></button>
          <button className="bg-black text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-xl shadow-black/10">
            <Share2 size={18} /> Send to Supervisor
          </button>
        </div>
      </div>

      <div className="bg-white p-12 rounded-[48px] border border-gray-100 shadow-2xl space-y-12">
        {/* Header Section */}
        <div className="flex justify-between items-start border-b border-gray-100 pb-12">
          <div className="flex items-center gap-4">
             <div className="bg-black p-3 rounded-2xl text-white">
                <Truck size={32} />
             </div>
             <div>
                <h1 className="text-2xl font-black">BBM FLOW</h1>
                <p className="text-xs text-gray-400 font-bold tracking-widest uppercase">Command Center Report</p>
             </div>
          </div>
          <div className="text-right">
             <p className="text-sm font-bold">Report ID: RTC-{Date.now().toString().slice(-6)}</p>
             <p className="text-xs text-gray-400 mt-1">Generated: {new Date().toLocaleTimeString()}</p>
          </div>
        </div>

        {/* KPIs Summary */}
        <div className="grid grid-cols-3 gap-8">
           <div className="space-y-2">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Distribution Vol.</p>
              <h3 className="text-4xl font-black text-gray-900">{(totalVolume/1000).toFixed(0)}K <span className="text-lg text-gray-400 font-normal">Litres</span></h3>
              <p className="text-[10px] text-emerald-600 font-bold">+12% vs Yesterday</p>
           </div>
           <div className="space-y-2">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Active Jobs (LO)</p>
              <h3 className="text-4xl font-black text-gray-900">{jobOrders.length}</h3>
              <p className="text-[10px] text-gray-500 font-bold">4 Completed Today</p>
           </div>
           <div className="space-y-2">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">System Score</p>
              <h3 className="text-4xl font-black text-emerald-500">92%</h3>
              <p className="text-[10px] text-emerald-600 font-bold">Optimal Integrity</p>
           </div>
        </div>

        {/* Integrity Check */}
        <div className="bg-gray-50 rounded-[32px] p-8 border border-gray-100">
           <h3 className="font-bold text-lg mb-6">Security & Integrity Audit</h3>
           <div className="space-y-4">
              <AuditRow label="Movement without LO" value={units.filter(u => u.opState === VehicleState.ACTIVE_NO_LO).length} isCritical />
              <AuditRow label="Unplanned Stops (>30m)" value={units.filter(u => u.opState === VehicleState.CRITICAL_STOP).length} isCritical />
              <AuditRow label="Route Deviations" value={units.filter(u => u.routeDeviation).length} isWarning />
              <AuditRow label="SLA Compliance Risks" value={jobOrders.filter(lo => lo.slaConfidence === 'Low').length} isWarning />
           </div>
        </div>

        {/* Closing Summary */}
        <div className="space-y-4">
           <h3 className="font-bold text-lg">Shift Remarks</h3>
           <div className="p-6 bg-white border border-gray-100 rounded-3xl text-sm text-gray-600 leading-relaxed shadow-inner italic">
              "Network health remained stable during peak morning hours. One high-severity anomaly detected on Unit B 0009 XYZ (Active No LO) - case escalated to HSSE. Terminal Balongan experiencing slight 20-min lag in dispatch. All other deliveries tracking within SLA windows."
           </div>
        </div>

        <div className="pt-12 border-t border-gray-100 flex justify-between items-center opacity-40">
           <div className="flex items-center gap-2">
              <CheckCircle size={16} />
              <span className="text-xs font-bold uppercase tracking-tighter">Automated Verification Pass</span>
           </div>
           <span className="text-xs font-bold">© 2024 BBM FLOW RTCP</span>
        </div>
      </div>
    </div>
  );
};

const AuditRow = ({ label, value, isCritical, isWarning }: any) => (
  <div className="flex justify-between items-center py-2">
     <div className="flex items-center gap-3">
        <div className={`w-2 h-2 rounded-full ${isCritical ? 'bg-rose-500' : isWarning ? 'bg-amber-500' : 'bg-emerald-500'}`}></div>
        <span className="text-sm font-medium text-gray-700">{label}</span>
     </div>
     <span className={`font-black ${value > 0 && isCritical ? 'text-rose-600' : value > 0 && isWarning ? 'text-amber-600' : 'text-gray-900'}`}>
       {value} Cases
     </span>
  </div>
);

export default OperationalReport;
