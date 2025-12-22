
import React, { useMemo, useState } from 'react';
import { Unit, Alert, AlertSeverity, JobOrder, VehicleState, JobOrderStatus, DriverBehaviorState } from '../types';
import { Truck, Activity, AlertCircle, Clock, ArrowUpRight, ShieldAlert, Navigation, Package, Zap, ChevronRight, CheckCircle2, Send, PlayCircle, Flag, Filter, UserCheck, EyeOff, UserMinus, AlertTriangle } from 'lucide-react';

const ETA_DEVIATION_THRESHOLD_MINS = 20; // Configurable threshold for significant deviation

const Dashboard: React.FC<{ units: Unit[], alerts: Alert[], jobOrders: JobOrder[] }> = ({ units, alerts, jobOrders }) => {
  const [statusFilter, setStatusFilter] = useState<JobOrderStatus | 'ALL'>('ALL');
  const [behaviorFilter, setBehaviorFilter] = useState<DriverBehaviorState | 'ALL'>('ALL');

  const stats = useMemo(() => {
    return {
      activeOnLo: units.filter(u => u.opState === VehicleState.ACTIVE_ON_LO).length,
      activeNoLo: units.filter(u => u.opState === VehicleState.ACTIVE_NO_LO).length,
      idlePlanned: units.filter(u => u.opState === VehicleState.IDLE_PLANNED).length,
      idleUnplanned: units.filter(u => u.opState === VehicleState.IDLE_UNPLANNED).length,
      criticalStop: units.filter(u => u.opState === VehicleState.CRITICAL_STOP).length,
      // DMS Stats
      dmsNormal: units.filter(u => u.behaviorState === DriverBehaviorState.NORMAL).length,
      dmsWarning: units.filter(u => u.behaviorState === DriverBehaviorState.WARNING).length,
      dmsCritical: units.filter(u => u.behaviorState === DriverBehaviorState.CRITICAL).length,
      dmsOffline: units.filter(u => u.behaviorState === DriverBehaviorState.OFFLINE).length,
    };
  }, [units]);

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {
      [JobOrderStatus.SCHEDULED]: 0,
      [JobOrderStatus.DISPATCHED]: 0,
      [JobOrderStatus.IN_TRANSIT]: 0,
      [JobOrderStatus.ARRIVED]: 0,
      [JobOrderStatus.COMPLETED]: 0,
      [JobOrderStatus.EXCEPTION]: 0,
    };
    jobOrders.forEach(lo => {
      counts[lo.status] = (counts[lo.status] || 0) + 1;
    });
    return counts;
  }, [jobOrders]);

  const displayedLOs = useMemo(() => {
    let filtered = jobOrders;
    if (statusFilter !== 'ALL') {
      filtered = filtered.filter(lo => lo.status === statusFilter);
    }
    if (behaviorFilter !== 'ALL') {
      const unitIdsWithBehavior = units.filter(u => u.behaviorState === behaviorFilter).map(u => u.id);
      filtered = filtered.filter(lo => unitIdsWithBehavior.includes(lo.vehicleId));
    }
    return filtered;
  }, [jobOrders, statusFilter, behaviorFilter, units]);

  const getStatusConfig = (status: JobOrderStatus) => {
    switch (status) {
      case JobOrderStatus.SCHEDULED: return { color: 'text-gray-500', bg: 'bg-gray-50', icon: Clock };
      case JobOrderStatus.DISPATCHED: return { color: 'text-indigo-600', bg: 'bg-indigo-50', icon: Send };
      case JobOrderStatus.IN_TRANSIT: return { color: 'text-blue-600', bg: 'bg-blue-50', icon: PlayCircle };
      case JobOrderStatus.ARRIVED: return { color: 'text-emerald-600', bg: 'bg-emerald-50', icon: Flag };
      case JobOrderStatus.COMPLETED: return { color: 'text-green-600', bg: 'bg-green-50', icon: CheckCircle2 };
      case JobOrderStatus.EXCEPTION: return { color: 'text-rose-600', bg: 'bg-rose-50', icon: AlertCircle };
      default: return { color: 'text-gray-500', bg: 'bg-gray-50', icon: Package };
    }
  };

  const getBehaviorBadge = (unitId: string) => {
    const unit = units.find(u => u.id === unitId);
    if (!unit) return null;
    
    switch (unit.behaviorState) {
      case DriverBehaviorState.NORMAL: 
        return <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-bold border border-emerald-100"><UserCheck size={10} /> Normal</div>;
      case DriverBehaviorState.WARNING:
        return <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-amber-50 text-amber-600 text-[10px] font-bold border border-amber-100"><Activity size={10} /> Warning</div>;
      case DriverBehaviorState.CRITICAL:
        return <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-rose-50 text-rose-600 text-[10px] font-bold border border-rose-100 animate-pulse"><AlertCircle size={10} /> Critical</div>;
      case DriverBehaviorState.OFFLINE:
        return <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 text-[10px] font-bold border border-gray-200"><EyeOff size={10} /> Offline</div>;
      default: return null;
    }
  };

  const timeToMinutes = (timeStr: string) => {
    if (!timeStr || !timeStr.includes(':')) return null;
    const [h, m] = timeStr.split(':').map(Number);
    if (isNaN(h) || isNaN(m)) return null;
    return h * 60 + m;
  };

  const renderEtaWithDeviation = (lo: JobOrder) => {
    const unit = units.find(u => u.id === lo.vehicleId);
    const eta = unit?.eta || 'N/A';
    const planned = lo.plannedArrival;

    if (eta === 'N/A' || eta === 'DELAYED' || !planned) {
      return (
        <div className="flex flex-col">
          <span className={`text-sm font-bold ${eta === 'DELAYED' ? 'text-rose-600' : 'text-gray-900'}`}>{eta}</span>
          <span className="text-[9px] text-gray-400 font-medium">Plan: {planned}</span>
        </div>
      );
    }

    const etaMins = timeToMinutes(eta);
    const plannedMins = timeToMinutes(planned);
    
    let deviation = 0;
    if (etaMins !== null && plannedMins !== null) {
      deviation = etaMins - plannedMins;
    }

    const isSignificant = deviation >= ETA_DEVIATION_THRESHOLD_MINS;

    return (
      <div className="flex flex-col">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-gray-900">{eta}</span>
          {isSignificant && (
            <div className="flex items-center gap-0.5 text-rose-600 font-black text-[10px] animate-pulse">
              <AlertTriangle size={10} />
              +{deviation}m
            </div>
          )}
        </div>
        <span className="text-[9px] text-gray-400 font-medium">Plan: {planned}</span>
      </div>
    );
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Command Center</h2>
          <p className="text-gray-500 mt-1">Operational Heartbeat & DMS Behavior Monitoring.</p>
        </div>
        <div className="flex gap-3">
          <div className="bg-white border border-gray-100 rounded-xl px-4 py-2 flex items-center gap-3 shadow-sm">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Operator Alert Status</span>
            <div className="flex items-center gap-1 text-xs font-bold text-emerald-600">
               <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
               Steady
            </div>
          </div>
        </div>
      </div>

      {/* Driver Risk Summary Panel (DMS Primary View) */}
      <section className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl"><UserCheck size={20} /></div>
            <h3 className="text-lg font-bold">Driver Behavior Summary</h3>
          </div>
          <button 
            onClick={() => setBehaviorFilter('ALL')}
            className={`text-[10px] font-bold uppercase tracking-widest ${behaviorFilter === 'ALL' ? 'text-gray-300' : 'text-blue-600 hover:underline'}`}
          >
            Clear Behavior Filter
          </button>
        </div>
        <div className="grid grid-cols-4 gap-4">
          <RiskSummaryCard 
            label="Normal" 
            value={stats.dmsNormal} 
            color="text-emerald-500" 
            bg="bg-emerald-50" 
            icon={UserCheck} 
            active={behaviorFilter === DriverBehaviorState.NORMAL}
            onClick={() => setBehaviorFilter(DriverBehaviorState.NORMAL)}
          />
          <RiskSummaryCard 
            label="Warning" 
            value={stats.dmsWarning} 
            color="text-amber-600" 
            bg="bg-amber-50" 
            icon={Activity} 
            active={behaviorFilter === DriverBehaviorState.WARNING}
            onClick={() => setBehaviorFilter(DriverBehaviorState.WARNING)}
          />
          <RiskSummaryCard 
            label="Critical" 
            value={stats.dmsCritical} 
            color="text-rose-600" 
            bg="bg-rose-50" 
            icon={AlertCircle} 
            animate
            active={behaviorFilter === DriverBehaviorState.CRITICAL}
            onClick={() => setBehaviorFilter(DriverBehaviorState.CRITICAL)}
          />
          <RiskSummaryCard 
            label="Offline" 
            value={stats.dmsOffline} 
            color="text-gray-500" 
            bg="bg-gray-100" 
            icon={EyeOff} 
            active={behaviorFilter === DriverBehaviorState.OFFLINE}
            onClick={() => setBehaviorFilter(DriverBehaviorState.OFFLINE)}
          />
        </div>
      </section>

      {/* Operational Heartbeat Panel */}
      <section className="grid grid-cols-5 gap-4">
        <HeartbeatCard label="Active (On LO)" value={stats.activeOnLo} color="text-emerald-500" bg="bg-emerald-50" icon={Activity} />
        <HeartbeatCard label="Active (No LO)" value={stats.activeNoLo} color="text-rose-600" bg="bg-rose-50" icon={Zap} animate />
        <HeartbeatCard label="Idle (Planned)" value={stats.idlePlanned} color="text-blue-500" bg="bg-blue-50" icon={Clock} />
        <HeartbeatCard label="Idle (Unplanned)" value={stats.idleUnplanned} color="text-amber-600" bg="bg-amber-50" icon={AlertCircle} />
        <HeartbeatCard label="Critical Stop" value={stats.criticalStop} color="text-rose-600" bg="bg-rose-100" icon={ShieldAlert} animate />
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-8 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
              <h3 className="text-xl font-bold flex items-center gap-3">
                <Package size={24} className="text-blue-500" /> 
                Job Orders Surveillance
              </h3>
              <div className="flex gap-2">
                <button 
                  onClick={() => setStatusFilter('ALL')}
                  className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${statusFilter === 'ALL' ? 'bg-black text-white shadow-md' : 'text-gray-400 hover:text-black hover:bg-gray-100'}`}
                >
                  Clear Status Filters
                </button>
              </div>
            </div>
            
            <div className="overflow-x-auto min-h-[300px]">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-white text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-50">
                    <th className="px-8 py-4">LO ID / Route</th>
                    <th className="px-8 py-4">Unit / State</th>
                    <th className="px-8 py-4">Behavior</th>
                    <th className="px-8 py-4">ETA</th>
                    <th className="px-8 py-4">Status</th>
                    <th className="px-8 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {displayedLOs.length > 0 ? displayedLOs.map((lo) => (
                    <tr key={lo.id} className="group hover:bg-gray-50/50 transition-colors">
                      <td className="px-8 py-5">
                        <span className="font-bold text-sm">{lo.id}</span>
                        <p className="text-[10px] text-gray-400 mt-0.5">{lo.origin} → {lo.destination}</p>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex flex-col gap-1">
                          <span className="text-sm font-semibold">{lo.vehicleId}</span>
                          <span className="text-[10px] text-gray-400 uppercase font-medium">{units.find(u=>u.id===lo.vehicleId)?.opState}</span>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        {getBehaviorBadge(lo.vehicleId)}
                      </td>
                      <td className="px-8 py-5">
                        {renderEtaWithDeviation(lo)}
                      </td>
                      <td className="px-8 py-5">
                        <span className={`px-2 py-1 rounded-lg text-[10px] font-bold ${
                          lo.status === JobOrderStatus.EXCEPTION ? 'bg-rose-50 text-rose-600' : 'bg-blue-50 text-blue-600'
                        }`}>
                          {lo.status}
                        </span>
                      </td>
                      <td className="px-8 py-5 text-right">
                        <button className="p-2 text-gray-300 hover:text-black hover:bg-white rounded-lg transition-all">
                          <ChevronRight size={18} />
                        </button>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={6} className="px-8 py-20 text-center">
                        <div className="flex flex-col items-center justify-center text-gray-400">
                          <Package size={40} className="mb-2 opacity-20" />
                          <p className="text-sm font-medium">No units match active filters.</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <section className="space-y-4">
            <div className="flex items-center gap-2 px-2">
              <Filter size={14} className="text-gray-400" />
              <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Job Status Filter</h4>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
              {Object.values(JobOrderStatus).map((status) => {
                const { color, bg, icon: StatusIcon } = getStatusConfig(status);
                const isActive = statusFilter === status;
                return (
                  <button
                    key={status}
                    onClick={() => setStatusFilter(isActive ? 'ALL' : status)}
                    className={`flex flex-col p-4 rounded-2xl border transition-all text-left group ${
                      isActive 
                        ? 'bg-black border-black text-white shadow-lg scale-105 z-10' 
                        : `bg-white border-gray-100 hover:border-gray-200 shadow-sm`
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-3 transition-colors ${
                      isActive ? 'bg-white/20 text-white' : `${bg} ${color}`
                    }`}>
                      <StatusIcon size={16} />
                    </div>
                    <p className={`text-[9px] font-bold uppercase tracking-wider mb-1 ${isActive ? 'text-gray-400' : 'text-gray-400'}`}>
                      {status.replace('_', ' ')}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-black">{statusCounts[status] || 0}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm">
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
               <AlertCircle size={20} className="text-rose-500" /> Behavior Watchlist
            </h3>
            <div className="space-y-3">
              {units.filter(u => u.behaviorState === DriverBehaviorState.CRITICAL || u.behaviorState === DriverBehaviorState.OFFLINE).map(unit => (
                <div key={unit.id} className={`p-4 rounded-2xl border ${unit.behaviorState === DriverBehaviorState.CRITICAL ? 'bg-rose-50/50 border-rose-100' : 'bg-gray-50 border-gray-100'}`}>
                  <div className="flex justify-between items-start mb-2">
                    <span className={`text-[10px] font-bold uppercase tracking-widest ${unit.behaviorState === DriverBehaviorState.CRITICAL ? 'text-rose-600' : 'text-gray-500'}`}>
                      {unit.behaviorState}
                    </span>
                    <span className="text-[10px] text-gray-400">{unit.lastUpdate}</span>
                  </div>
                  <h4 className="text-sm font-bold">{unit.plateNumber}</h4>
                  <p className="text-xs text-gray-600 mt-1 font-medium">{unit.behaviorReason || 'No details provided'}</p>
                  <div className="mt-4 flex gap-2">
                    <button className={`flex-1 py-2 text-[10px] font-bold rounded-lg border transition-all ${
                      unit.behaviorState === DriverBehaviorState.CRITICAL ? 'bg-white text-rose-600 border-rose-100 hover:bg-rose-100' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-100'
                    }`}>
                      Intervene
                    </button>
                    <button className={`px-3 py-2 rounded-lg text-white ${unit.behaviorState === DriverBehaviorState.CRITICAL ? 'bg-rose-600' : 'bg-gray-800'}`}>
                       <ShieldAlert size={12}/>
                    </button>
                  </div>
                </div>
              ))}
              {units.filter(u => u.behaviorState === DriverBehaviorState.CRITICAL || u.behaviorState === DriverBehaviorState.OFFLINE).length === 0 && (
                 <div className="text-center py-8">
                    <UserCheck size={32} className="mx-auto text-gray-100 mb-2" />
                    <p className="text-xs text-gray-400">All active drivers are compliant.</p>
                 </div>
              )}
            </div>
          </div>

          <div className="bg-blue-600 p-8 rounded-[32px] shadow-2xl text-white relative overflow-hidden group">
            <div className="relative z-10">
              <h3 className="font-black text-xl mb-2">Policy Intervention</h3>
              <p className="text-blue-100 text-xs leading-relaxed mb-6">
                Manual overrides are restricted. All behavior escalations follow SOP-24.
              </p>
              <button className="w-full py-3 bg-white text-blue-700 text-xs font-black rounded-2xl shadow-lg hover:bg-blue-50 transition-all">
                Review Active Protocols
              </button>
            </div>
            <div className="absolute -bottom-10 -right-10 text-white/10 group-hover:scale-110 transition-transform duration-700">
              <UserMinus size={200} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const RiskSummaryCard = ({ label, value, color, bg, icon: Icon, animate, active, onClick }: any) => (
  <button 
    onClick={onClick}
    className={`p-4 rounded-2xl border transition-all text-left flex flex-col justify-between h-28 group ${
      active ? 'bg-black border-black text-white shadow-lg' : `${bg} border-transparent`
    }`}
  >
    <div className={`p-2 rounded-xl w-fit ${active ? 'bg-white/20 text-white' : `bg-white/60 shadow-sm ${color}`} ${animate && !active ? 'animate-pulse' : ''}`}>
      <Icon size={16} />
    </div>
    <div>
      <p className={`text-[9px] font-bold uppercase tracking-widest leading-none mb-1 ${active ? 'text-gray-400' : 'text-gray-400'}`}>{label}</p>
      <h3 className={`text-xl font-black ${active ? 'text-white' : color}`}>{value}</h3>
    </div>
  </button>
);

const HeartbeatCard = ({ label, value, color, bg, icon: Icon, animate }: any) => (
  <div className={`p-6 ${bg} rounded-[28px] border border-transparent shadow-sm flex flex-col justify-between h-32 group`}>
    <div className="flex justify-between items-start">
      <div className={`p-2 rounded-xl bg-white/60 shadow-sm ${color} ${animate ? 'animate-pulse' : ''}`}>
        <Icon size={18} />
      </div>
      <ArrowUpRight size={16} className="text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity" />
    </div>
    <div>
      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1.5">{label}</p>
      <h3 className={`text-2xl font-black ${color}`}>{value}</h3>
    </div>
  </div>
);

export default Dashboard;
