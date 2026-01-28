
import React, { useState, useEffect, useMemo } from 'react';
import { HashRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Map as MapIcon, 
  Bell, 
  AlertTriangle, 
  ShieldCheck, 
  History, 
  BarChart3, 
  Settings,
  Truck,
  Activity,
  LogOut,
  User,
  Search,
  Menu,
  ChevronRight,
  ClipboardCheck,
  FileSearch,
  Package,
  CalendarDays,
  FileBarChart,
  UserCheck,
  EyeOff,
  Wrench,
  ShieldAlert,
  Target
} from 'lucide-react';
import Dashboard from './components/Dashboard';
import Tracker from './components/Tracker';
import IncidentWorkspace from './components/IncidentWorkspace';
import Analytics from './components/Analytics';
import Configuration from './components/Configuration';
import ScheduleTimeline from './components/ScheduleTimeline';
import OperationalReport from './components/OperationalReport';
import TechnicianTicketing from './components/TechnicianTicketing';
import HseDashboard from './components/HseDashboard';
import LeadKpiDashboard from './components/LeadKpiDashboard';
import { Unit, Alert, AlertSeverity, AlertCategory, DEFAULT_CATEGORIES, AutoCloseRule, JobOrder, JobOrderStatus, VehicleState, DriverBehaviorState, Ticket, TicketStatus, Incident, IncidentOutcome } from './types';

const MOCK_LOs: JobOrder[] = [
  { id: 'LO-9901', vehicleId: 'TRK-001', driverId: 'D-101', origin: 'Plumpang Depot', destination: 'SPBU 31.123', plannedStart: '08:00', plannedArrival: '14:20', status: JobOrderStatus.IN_TRANSIT, volume: 24000, route: 'Route Alpha', slaConfidence: 'High' },
  { id: 'LO-9902', vehicleId: 'TRK-002', driverId: 'D-102', origin: 'Plumpang Depot', destination: 'SPBU 31.456', plannedStart: '09:30', plannedArrival: '15:45', status: JobOrderStatus.EXCEPTION, volume: 16000, route: 'Route Beta', slaConfidence: 'Low' },
  { id: 'LO-9904', vehicleId: 'TRK-004', driverId: 'D-104', origin: 'Balongan Terminal', destination: 'Cileungsi Storage', plannedStart: '07:00', plannedArrival: '13:10', status: JobOrderStatus.IN_TRANSIT, volume: 32000, route: 'Route Gamma', slaConfidence: 'Medium' },
];

const INITIAL_UNITS: Unit[] = [
  { id: 'TRK-001', plateNumber: 'B 1234 ABC', driverName: 'Budi Santoso', status: AlertSeverity.NORMAL, opState: VehicleState.ACTIVE_ON_LO, behaviorState: DriverBehaviorState.NORMAL, speed: 65, lat: -6.2088, lng: 106.8456, heading: 45, lastUpdate: 'Just now', eta: '14:20', routeDeviation: false, history: [], currentLoId: 'LO-9901' },
  { id: 'TRK-002', plateNumber: 'B 5678 DEF', driverName: 'Andi Wijaya', status: AlertSeverity.WARNING, opState: VehicleState.ACTIVE_ON_LO, behaviorState: DriverBehaviorState.WARNING, behaviorReason: 'Frequent Distraction', speed: 82, lat: -6.3000, lng: 106.8000, heading: 120, lastUpdate: '2m ago', eta: '15:45', routeDeviation: true, history: [], currentLoId: 'LO-9902' },
  { id: 'TRK-003', plateNumber: 'B 9012 GHI', driverName: 'Siti Aminah', status: AlertSeverity.CRITICAL, opState: VehicleState.CRITICAL_STOP, behaviorState: DriverBehaviorState.CRITICAL, behaviorReason: 'Drowsiness Detected', speed: 0, lat: -6.4000, lng: 106.7000, heading: 0, lastUpdate: '5m ago', eta: 'DELAYED', routeDeviation: false, history: [] },
  { id: 'TRK-004', plateNumber: 'B 3456 JKL', driverName: 'Rahmat Hidayat', status: AlertSeverity.NORMAL, opState: VehicleState.ACTIVE_ON_LO, behaviorState: DriverBehaviorState.NORMAL, speed: 58, lat: -6.1500, lng: 106.9000, heading: 270, lastUpdate: 'Just now', eta: '13:10', routeDeviation: false, history: [], currentLoId: 'LO-9904' },
  { id: 'TRK-009', plateNumber: 'B 0009 XYZ', driverName: 'Anomaly Driver', status: AlertSeverity.CRITICAL, opState: VehicleState.ACTIVE_NO_LO, behaviorState: DriverBehaviorState.OFFLINE, behaviorReason: 'Camera Blocked', speed: 45, lat: -6.1000, lng: 106.8000, heading: 90, lastUpdate: 'Live', eta: 'N/A', routeDeviation: false, history: [] },
];

const INITIAL_INCIDENTS: Incident[] = [
  {
    id: 'INC-2024-0012',
    startTime: '10:45 AM',
    unitId: 'TRK-003',
    status: 'OPEN',
    severity: AlertSeverity.CRITICAL,
    outcome: 'PENDING',
    lastActivityTime: Date.now() - 60000,
    category: 'DMS_Fatigue',
    timeline: [
      { time: '10:45:02', event: 'DMS Signal: Eyes closed > 3.0s detected' },
      { time: '10:45:15', event: 'Vehicle stopped in unplanned route (Critical Stop)' },
      { time: '10:45:30', event: 'DMS: Automated Drowsiness Escalation' },
      { time: '10:46:10', event: 'Operator: Commenced emergency protocol' },
      { time: '10:46:10', event: 'Event log frozen for compliance audit' }
    ]
  },
  {
    id: 'INC-2024-0015',
    startTime: '11:02 AM',
    unitId: 'TRK-002',
    status: 'OPEN',
    severity: AlertSeverity.WARNING,
    outcome: 'PENDING',
    lastActivityTime: Date.now() - 240000,
    timeline: [
      { time: '11:02:10', event: 'DMS: High distraction rate (Mobile usage risk)' },
      { time: '11:05:00', event: 'Route deviation detected concurrently' },
      { time: '11:07:22', event: 'Operator: Manual intervention recommended by AI' }
    ]
  },
  {
    id: 'INC-2024-0018',
    startTime: '11:15 AM',
    unitId: 'TRK-009',
    status: 'OPEN',
    severity: AlertSeverity.CRITICAL,
    outcome: 'PENDING',
    lastActivityTime: Date.now(),
    timeline: [
      { time: '11:15:00', event: 'DMS: Camera Blockage detected' },
      { time: '11:15:45', event: 'Unauthorized transit without LO' },
      { time: '11:16:00', event: 'High risk of cabin intrusion / policy breach' }
    ]
  }
];

const SidebarItem = ({ icon: Icon, label, path, active }: { icon: any, label: string, path: string, active: boolean }) => (
  <Link to={path} className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
    active ? 'bg-black text-white shadow-lg' : 'text-gray-500 hover:bg-gray-100'
  }`}>
    <Icon size={20} strokeWidth={active ? 2.5 : 2} />
    <span className="font-medium">{label}</span>
  </Link>
);

const App: React.FC = () => {
  const [units, setUnits] = useState<Unit[]>(INITIAL_UNITS);
  const [jobOrders, setJobOrders] = useState<JobOrder[]>(MOCK_LOs);
  const [categories, setCategories] = useState<AlertCategory[]>(DEFAULT_CATEGORIES);
  const [autoCloseRules, setAutoCloseRules] = useState<AutoCloseRule[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>(INITIAL_INCIDENTS);
  const [alerts, setAlerts] = useState<Alert[]>([
    { id: 'A-1', timestamp: '10:45', unitId: 'TRK-003', category: 'DMS_Fatigue', severity: AlertSeverity.CRITICAL, message: 'Drowsiness Detected: Driver eyes closed > 3s' },
    { id: 'A-2', timestamp: '10:42', unitId: 'TRK-002', category: 'Compliance', severity: AlertSeverity.WARNING, message: 'Geofence Exit: Route Deviation Detected' },
  ]);

  const addTicket = (ticket: Omit<Ticket, 'id' | 'status' | 'timestamp'>) => {
    const newTicket: Ticket = {
      ...ticket,
      id: `TKT-${Math.floor(Math.random() * 9000) + 1000}`,
      status: TicketStatus.OPEN,
      timestamp: new Date().toLocaleTimeString(),
    };
    setTickets(prev => [newTicket, ...prev]);
  };

  const updateTicketStatus = (id: string, status: TicketStatus) => {
    setTickets(prev => prev.map(t => t.id === id ? { ...t, status } : t));
  };

  const updateIncidentStatus = (id: string, status: Incident['status']) => {
    setIncidents(prev => prev.map(inc => inc.id === id ? { ...inc, status, lastActivityTime: Date.now() } : inc));
  };

  const setIncidentOutcome = (id: string, outcome: IncidentOutcome) => {
    setIncidents(prev => prev.map(inc => inc.id === id ? { ...inc, outcome, status: 'CLOSED', lastActivityTime: Date.now() } : inc));
  };

  const updateIncidentCategory = (id: string, category: AlertCategory) => {
    setIncidents(prev => prev.map(inc => inc.id === id ? { ...inc, category } : inc));
  };

  const addIncidentEvent = (id: string, event: string) => {
    setIncidents(prev => prev.map(inc => {
      if (inc.id === id) {
        return {
          ...inc,
          lastActivityTime: Date.now(),
          timeline: [...inc.timeline, { time: new Date().toLocaleTimeString(), event }]
        };
      }
      return inc;
    }));
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setUnits((prevUnits) => 
        prevUnits.map((unit) => {
          if (unit.id === 'TRK-003') return unit;

          const rad = (unit.heading * Math.PI) / 180;
          const speedFactor = unit.speed / 100000;
          
          let opState = unit.opState;
          if (unit.speed > 0) {
            opState = unit.currentLoId ? VehicleState.ACTIVE_ON_LO : VehicleState.ACTIVE_NO_LO;
          } else {
            opState = unit.currentLoId ? VehicleState.CRITICAL_STOP : VehicleState.IDLE_PLANNED;
          }

          return {
            ...unit,
            lat: unit.lat + Math.sin(rad) * speedFactor,
            lng: unit.lng + Math.cos(rad) * speedFactor,
            opState,
            lastUpdate: 'Live',
            history: [{ lat: unit.lat, lng: unit.lng }, ...unit.history].slice(0, 10)
          };
        })
      );
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <Router>
      <div className="flex h-screen bg-[#fcfcfd]">
        <aside className="w-64 border-r border-gray-100 flex flex-col p-6 glass-effect z-20">
          <div className="flex items-center gap-3 mb-10 px-2">
            <div className="bg-black p-2 rounded-lg">
              <Truck className="text-white" size={24} />
            </div>
            <h1 className="text-xl font-bold tracking-tight">BBM <span className="text-gray-400 font-light">Flow</span></h1>
          </div>

          <nav className="flex-1 space-y-1">
            <SidebarNav />
          </nav>

          <div className="mt-auto pt-6 border-t border-gray-100">
            <div className="flex items-center gap-3 px-2 mb-6">
              <div className="w-10 h-10 rounded-full bg-zinc-900 flex items-center justify-center border border-gray-200">
                <User size={20} className="text-white" />
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-semibold truncate">Lead Supervisor</p>
                <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-tight">RTC Control Lead</p>
              </div>
            </div>
          </div>
        </aside>

        <main className="flex-1 flex flex-col relative overflow-hidden">
          <header className="h-16 border-b border-gray-100 flex items-center justify-between px-8 glass-effect z-10">
            <div className="flex items-center gap-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                  type="text" 
                  placeholder="Search LO ID or Unit..." 
                  className="pl-10 pr-4 py-2 bg-gray-100 border-transparent focus:bg-white focus:border-gray-200 rounded-full text-sm outline-none transition-all w-64"
                />
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-green-50 text-green-700 px-3 py-1.5 rounded-full text-xs font-medium border border-green-100">
                <div className="w-2 h-2 rounded-full bg-green-500 status-pulse"></div>
                System Live
              </div>
              <button className="p-2 text-gray-400 hover:text-black hover:bg-gray-100 rounded-full transition-all relative">
                <Bell size={20} />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
              </button>
            </div>
          </header>

          <div className="flex-1 overflow-y-auto p-8">
            <Routes>
              <Route path="/" element={<Dashboard units={units} alerts={alerts} jobOrders={jobOrders} />} />
              <Route path="/map" element={<Tracker units={units} />} />
              <Route path="/incidents" element={<IncidentWorkspace 
                alerts={alerts} 
                onAddTicket={addTicket} 
                units={units}
                incidents={incidents}
                onUpdateStatus={updateIncidentStatus}
                onUpdateCategory={updateIncidentCategory}
                onAddEvent={addIncidentEvent}
                onSetOutcome={setIncidentOutcome}
              />} />
              <Route path="/lead-kpi" element={<LeadKpiDashboard />} />
              <Route path="/schedule" element={<ScheduleTimeline jobOrders={jobOrders} units={units} />} />
              <Route path="/report" element={<OperationalReport units={units} jobOrders={jobOrders} alerts={alerts} incidents={incidents} />} />
              <Route path="/ticketing" element={<TechnicianTicketing tickets={tickets} onUpdateTicket={updateTicketStatus} />} />
              <Route path="/hse" element={<HseDashboard incidents={incidents} onUpdateStatus={updateIncidentStatus} onAddEvent={addIncidentEvent} />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route 
                path="/settings" 
                element={<Configuration categories={categories} autoCloseRules={autoCloseRules} onAddCategory={()=>{}} onRemoveCategory={()=>{}} onAddAutoCloseRule={()=>{}} onRemoveAutoCloseRule={()=>{}} />} 
              />
            </Routes>
          </div>
        </main>
      </div>
    </Router>
  );
};

const SidebarNav = () => {
  const location = useLocation();
  return (
    <div className="space-y-6">
      <section>
        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-4 mb-3">RTC Monitoring</div>
        <SidebarItem icon={LayoutDashboard} label="Data RTC" path="/" active={location.pathname === '/'} />
        <SidebarItem icon={MapIcon} label="Live Tracker" path="/map" active={location.pathname === '/map'} />
        <SidebarItem icon={AlertTriangle} label="Incident Center" path="/incidents" active={location.pathname === '/incidents'} />
      </section>

      <section>
        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-4 mb-3">Intelligence</div>
        <SidebarItem icon={CalendarDays} label="Logistics Timeline" path="/schedule" active={location.pathname === '/schedule'} />
        <SidebarItem icon={FileBarChart} label="Daily Report" path="/report" active={location.pathname === '/report'} />
      </section>

      <section>
        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-4 mb-3">Leadership</div>
        <SidebarItem icon={Target} label="Lead KPIs" path="/lead-kpi" active={location.pathname === '/lead-kpi'} />
      </section>

      <section>
        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-4 mb-3">Governance</div>
        <SidebarItem icon={ShieldAlert} label="HSE Dashboard" path="/hse" active={location.pathname === '/hse'} />
        <SidebarItem icon={Wrench} label="Technician Portal" path="/ticketing" active={location.pathname === '/ticketing'} />
      </section>

      <section>
        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-4 mb-3">System</div>
        <SidebarItem icon={Settings} label="Configuration" path="/settings" active={location.pathname === '/settings'} />
      </section>
    </div>
  );
};

export default App;
