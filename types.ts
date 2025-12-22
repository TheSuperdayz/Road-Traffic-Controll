
export enum AlertSeverity {
  NORMAL = 'NORMAL',
  WARNING = 'WARNING',
  CRITICAL = 'CRITICAL'
}

export enum DriverBehaviorState {
  NORMAL = 'NORMAL',
  WARNING = 'WARNING',
  CRITICAL = 'CRITICAL',
  OFFLINE = 'SENSOR_OFF'
}

export type AlertCategory = string;

export const DEFAULT_CATEGORIES: AlertCategory[] = [
  'Safety',
  'Security',
  'Compliance',
  'Operational',
  'DMS_Fatigue',
  'DMS_Distraction'
];

export enum JobOrderStatus {
  SCHEDULED = 'SCHEDULED',
  DISPATCHED = 'DISPATCHED',
  IN_TRANSIT = 'IN_TRANSIT',
  ARRIVED = 'ARRIVED',
  COMPLETED = 'COMPLETED',
  EXCEPTION = 'EXCEPTION'
}

export enum VehicleState {
  ACTIVE_ON_LO = 'Active (On LO)',
  ACTIVE_NO_LO = 'Active (No LO) Anomaly',
  IDLE_PLANNED = 'Idle (Planned)',
  IDLE_UNPLANNED = 'Idle (Unplanned)',
  CRITICAL_STOP = 'Critical Stop'
}

export interface JobOrder {
  id: string;
  vehicleId: string;
  driverId: string;
  origin: string;
  destination: string;
  plannedStart: string;
  plannedArrival: string;
  actualArrival?: string;
  volume: number; // in Liters
  route: string;
  status: JobOrderStatus;
  slaConfidence: 'High' | 'Medium' | 'Low';
}

export interface Unit {
  id: string;
  plateNumber: string;
  driverName: string;
  status: AlertSeverity;
  opState: VehicleState; 
  behaviorState: DriverBehaviorState;
  behaviorReason?: string;
  speed: number;
  lat: number;
  lng: number;
  heading: number;
  lastUpdate: string;
  eta: string;
  routeDeviation: boolean;
  history: { lat: number; lng: number }[];
  currentLoId?: string;
}

export interface Alert {
  id: string;
  timestamp: string;
  unitId: string;
  category: AlertCategory;
  severity: AlertSeverity;
  message: string;
  evidenceId?: string;
}

export interface Incident {
  id: string;
  startTime: string;
  unitId: string;
  status: 'OPEN' | 'ESCALATED' | 'HSSE_ESCALATED' | 'CLOSED';
  severity: AlertSeverity;
  category?: AlertCategory;
  timeline: { time: string; event: string }[];
  evidenceSnapshot?: string;
  lastActivityTime?: number;
}

export interface AutoCloseRule {
  id: string;
  category: string;
  inactivityMinutes: number;
  severityThreshold: AlertSeverity;
  enabled: boolean;
}

export enum TicketStatus {
  OPEN = 'OPEN',
  IN_PROGRESS = 'IN_PROGRESS',
  RESOLVED = 'RESOLVED'
}

export interface Ticket {
  id: string;
  unitId: string;
  driverName: string;
  issue: string;
  timestamp: string;
  assignedTo: string;
  status: TicketStatus;
}
