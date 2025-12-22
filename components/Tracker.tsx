
import React, { useState, useEffect, useRef } from 'react';
import { Unit, AlertSeverity, DriverBehaviorState } from '../types';
import { 
  MapPin, 
  Navigation, 
  Compass, 
  Layers, 
  Maximize2, 
  ZoomIn, 
  ZoomOut, 
  Phone, 
  MessageSquare, 
  Info, 
  Activity, 
  Clock, 
  UserCheck, 
  EyeOff, 
  AlertCircle, 
  Gauge, 
  Truck, 
  ChevronRight, 
  Shield, 
  TriangleAlert, 
  Zap, 
  X,
  Sparkles,
  Globe,
  ExternalLink,
  Map as MapIcon,
  Box,
  Square
} from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

// Mock Layer Data
const GEOFENCES = [
  { id: 'geo-1', name: 'Plumpang Depot Perimeter', x: 250, y: 150, radius: 80, color: 'rgba(59, 130, 246, 0.15)', borderColor: 'rgba(59, 130, 246, 0.4)' },
  { id: 'geo-2', name: 'High-Risk Transit Zone', x: 600, y: 400, radius: 120, color: 'rgba(245, 158, 11, 0.1)', borderColor: 'rgba(245, 158, 11, 0.3)' },
  { id: 'geo-3', name: 'SPBU 31.123 Delivery Point', x: 850, y: 220, radius: 60, color: 'rgba(16, 185, 129, 0.15)', borderColor: 'rgba(16, 185, 129, 0.4)' },
];

const TRAFFIC_ZONES = [
  { x1: 0, y1: 200, x2: 1200, y2: 200, intensity: 'heavy' },
  { x1: 400, y1: 0, x2: 400, y2: 800, intensity: 'moderate' },
  { x1: 700, y1: 150, x2: 1100, y2: 550, intensity: 'heavy' },
];

// Coordinates for Kebayoran Lama, Jakarta Selatan
const KEBAYORAN_LAMA_LAT = -6.2415;
const KEBAYORAN_LAMA_LNG = 106.7725;

const Tracker: React.FC<{ units: Unit[] }> = ({ units }) => {
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(units[0]);
  const [showLayerControl, setShowLayerControl] = useState(false);
  const [viewType, setViewType] = useState<'2D' | '3D'>('2D');
  const [activeLayers, setActiveLayers] = useState({
    geofences: true,
    deviations: true,
    traffic: false,
    trails: true
  });

  // Maps Grounding State
  const [showIntelligence, setShowIntelligence] = useState(false);
  const [intelligenceLoading, setIntelligenceLoading] = useState(false);
  const [intelligenceResult, setIntelligenceResult] = useState<{
    text: string;
    links: { title: string; uri: string }[];
  } | null>(null);

  const layerMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (layerMenuRef.current && !layerMenuRef.current.contains(event.target as Node)) {
        setShowLayerControl(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (selectedUnit) {
      const freshData = units.find(u => u.id === selectedUnit.id);
      if (freshData) setSelectedUnit(freshData);
    }
  }, [units]);

  const getMapCoords = (lat: number, lng: number) => {
    // Basic mapping for visual representation
    return {
      x: (lng - 106.6) * 1200,
      y: Math.abs(lat + 6.0) * 1200
    };
  };

  const toggleLayer = (layer: keyof typeof activeLayers) => {
    setActiveLayers(prev => ({ ...prev, [layer]: !prev[layer] }));
  };

  const fetchLocalIntelligence = async () => {
    setIntelligenceLoading(true);
    setShowIntelligence(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: "Identify key logistics infrastructure in Kebayoran Lama, Jakarta Selatan. Specifically list fuel depots (TBBM), SPBU gas stations, and major transport hubs nearby. Provide a brief situational assessment for distribution units in this area.",
        config: {
          tools: [{ googleMaps: {} }],
          toolConfig: {
            retrievalConfig: {
              latLng: {
                latitude: KEBAYORAN_LAMA_LAT,
                longitude: KEBAYORAN_LAMA_LNG
              }
            }
          }
        },
      });

      const text = response.text || "No specific intelligence found.";
      const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
      
      const links = chunks
        .filter((chunk: any) => chunk.maps)
        .map((chunk: any) => ({
          title: chunk.maps.title || "Maps Location",
          uri: chunk.maps.uri
        }));

      setIntelligenceResult({ text, links });
    } catch (error) {
      console.error("Maps Grounding Error:", error);
      setIntelligenceResult({ 
        text: "Error retrieving live maps data. Please check connectivity.", 
        links: [] 
      });
    } finally {
      setIntelligenceLoading(false);
    }
  };

  const getBehaviorStyles = (state: DriverBehaviorState) => {
    switch (state) {
      case DriverBehaviorState.NORMAL: 
        return { bg: 'bg-emerald-500', border: 'border-white', text: 'text-white', glow: 'shadow-[0_0_15px_rgba(16,185,129,0.3)]' };
      case DriverBehaviorState.WARNING:
        return { bg: 'bg-amber-400', border: 'border-white', text: 'text-black', glow: 'shadow-[0_0_15px_rgba(251,191,36,0.3)]' };
      case DriverBehaviorState.CRITICAL:
        return { bg: 'bg-rose-600', border: 'border-white', text: 'text-white', glow: 'shadow-[0_0_20px_rgba(225,29,72,0.6)]', animate: 'animate-pulse scale-110' };
      case DriverBehaviorState.OFFLINE:
        return { bg: 'bg-black', border: 'border-zinc-700', text: 'text-zinc-400', glow: 'shadow-none' };
      default:
        return { bg: 'bg-white', border: 'border-gray-200', text: 'text-gray-600', glow: 'shadow-sm' };
    }
  };

  return (
    <div className="h-full flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Fleet Surveillance</h2>
          <p className="text-sm text-gray-500">Monitoring Kebayoran Lama District, Jakarta Selatan.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={fetchLocalIntelligence}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl font-bold text-xs shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all active:scale-95"
          >
            <Sparkles size={14} /> Local Intelligence
          </button>
          
          <div className="flex items-center gap-2 bg-white p-1 rounded-xl border border-gray-100 shadow-sm relative">
            <button 
              onClick={() => setViewType(viewType === '2D' ? '3D' : '2D')}
              className={`p-2 rounded-lg transition-all ${viewType === '3D' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              title="Toggle 3D Map Perspective"
            >
              {viewType === '3D' ? <Box size={18} /> : <Square size={18} />}
            </button>
            
            <button 
              onClick={() => setShowLayerControl(!showLayerControl)}
              className={`p-2 rounded-lg transition-all ${showLayerControl ? 'bg-black text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`} 
              title="Map Layers"
            >
              <Layers size={18} />
            </button>
            
            {showLayerControl && (
              <div 
                ref={layerMenuRef}
                className="absolute top-full right-0 mt-2 w-64 bg-white rounded-[24px] shadow-2xl border border-gray-100 z-50 p-4 animate-in fade-in slide-in-from-top-2 duration-200"
              >
                <div className="flex items-center justify-between mb-4 px-2">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Surveillance Layers</span>
                  <button onClick={() => setShowLayerControl(false)}><X size={14} className="text-gray-400" /></button>
                </div>
                <div className="space-y-1">
                  <LayerToggleItem 
                    icon={Shield} 
                    label="Geofences" 
                    description="Security perimeters & depots"
                    active={activeLayers.geofences} 
                    onClick={() => toggleLayer('geofences')} 
                  />
                  <LayerToggleItem 
                    icon={TriangleAlert} 
                    label="Route Deviations" 
                    description="Anomalous path detections"
                    active={activeLayers.deviations} 
                    onClick={() => toggleLayer('deviations')} 
                    color="text-amber-500"
                  />
                  <LayerToggleItem 
                    icon={Zap} 
                    label="Traffic Intensity" 
                    description="Real-time road congestion"
                    active={activeLayers.traffic} 
                    onClick={() => toggleLayer('traffic')} 
                    color="text-blue-500"
                  />
                  <LayerToggleItem 
                    icon={Activity} 
                    label="Unit Breadcrumbs" 
                    description="Historical path trails"
                    active={activeLayers.trails} 
                    onClick={() => toggleLayer('trails')} 
                  />
                </div>
              </div>
            )}

            <button className="p-2 hover:bg-gray-100 rounded-lg" title="Recenter"><Compass size={18} /></button>
            <button className="p-2 hover:bg-gray-100 rounded-lg" title="Full Screen"><Maximize2 size={18} /></button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex gap-6 overflow-hidden">
        {/* Surveillance Grid / Mock Map */}
        <div className="flex-1 bg-zinc-900 rounded-[40px] relative border border-gray-800 overflow-hidden shadow-2xl" style={{ perspective: '1000px' }}>
          <div 
            className={`absolute inset-0 transition-transform duration-1000 ease-in-out origin-center`}
            style={{ 
              transform: viewType === '3D' ? 'rotateX(45deg) translateY(-10%) scale(1.2)' : 'none',
              transformStyle: 'preserve-3d'
            }}
          >
            <div className="absolute inset-0 opacity-10 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
            
            <div className="absolute inset-0 pointer-events-none">
              <div className="grid grid-cols-12 h-full w-full">
                {Array.from({ length: 12 }).map((_, i) => (
                  <div key={i} className="border-r border-white/5 h-full w-full"></div>
                ))}
              </div>
              <div className="grid grid-rows-12 h-full w-full absolute inset-0">
                {Array.from({ length: 12 }).map((_, i) => (
                  <div key={i} className="border-b border-white/5 h-full w-full"></div>
                ))}
              </div>
            </div>

            {activeLayers.traffic && (
              <svg className="absolute inset-0 w-full h-full pointer-events-none">
                {TRAFFIC_ZONES.map((zone, idx) => (
                  <line 
                    key={`traffic-${idx}`}
                    x1={zone.x1} y1={zone.y1} x2={zone.x2} y2={zone.y2}
                    stroke={zone.intensity === 'heavy' ? '#ef4444' : '#f59e0b'}
                    strokeWidth="8"
                    strokeOpacity="0.3"
                    strokeLinecap="round"
                    className="animate-pulse"
                  />
                ))}
              </svg>
            )}

            {activeLayers.geofences && GEOFENCES.map(geo => (
              <div 
                key={geo.id}
                className="absolute rounded-full border-[2px] border-dashed transition-all duration-500 flex items-center justify-center group"
                style={{
                  left: `${geo.x}px`,
                  top: `${geo.y}px`,
                  width: `${geo.radius * 2}px`,
                  height: `${geo.radius * 2}px`,
                  transform: 'translate(-50%, -50%)',
                  backgroundColor: geo.color,
                  borderColor: geo.borderColor,
                  boxShadow: '0 0 20px rgba(0,0,0,0.5)'
                }}
              >
                <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-black/80 text-white text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded absolute -top-8 whitespace-nowrap">
                  {geo.name}
                </div>
              </div>
            ))}

            {activeLayers.trails && units.map(unit => (
              <React.Fragment key={`trail-${unit.id}`}>
                {unit.history.map((pos, idx) => {
                  const { x, y } = getMapCoords(pos.lat, pos.lng);
                  return (
                    <div 
                      key={`breadcrumb-${unit.id}-${idx}`}
                      className="absolute w-1 h-1 bg-white/20 rounded-full z-0 transition-opacity duration-1000"
                      style={{ 
                        left: `${x}px`, 
                        top: `${y}px`, 
                        opacity: (1 - idx / 10) * 0.4,
                        transform: 'translate(-50%, -50%)'
                      }}
                    />
                  );
                })}
              </React.Fragment>
            ))}

            {activeLayers.deviations && units.filter(u => u.routeDeviation).map(unit => {
              const { x, y } = getMapCoords(unit.lat, unit.lng);
              return (
                <div 
                  key={`dev-${unit.id}`}
                  className="absolute w-32 h-32 rounded-full bg-amber-500/10 border-[2px] border-amber-500/30 animate-ping"
                  style={{ 
                    left: `${x}px`, 
                    top: `${y}px`,
                    transform: 'translate(-50%, -50%)',
                    animationDuration: '3s'
                  }}
                />
              );
            })}

            {units.map(unit => {
              const { x, y } = getMapCoords(unit.lat, unit.lng);
              const styles = getBehaviorStyles(unit.behaviorState);
              const isSelected = selectedUnit?.id === unit.id;

              return (
                <button 
                  key={unit.id}
                  onClick={() => setSelectedUnit(unit)}
                  className={`absolute flex flex-col items-center transition-all duration-1000 ease-linear ${isSelected ? 'z-40' : 'z-20'}`}
                  style={{ 
                    left: `${x}px`, 
                    top: `${y}px`,
                    transform: `translate(-50%, -50%) ${viewType === '3D' ? 'rotateX(-45deg)' : ''}`,
                    transformStyle: 'preserve-3d'
                  }}
                >
                  <div className={`relative p-2 rounded-full border-[2px] transition-all duration-300 ${styles.bg} ${styles.border} ${styles.glow} ${styles.animate || ''} ${
                    isSelected ? 'scale-125 ring-8 ring-blue-500/20' : 'shadow-lg hover:scale-110'
                  }`}>
                    <Navigation 
                      size={16} 
                      className={`${styles.text} transition-transform duration-1000`} 
                      style={{ transform: `rotate(${unit.heading}deg)` }}
                    />
                  </div>

                  <div className={`mt-2 px-2 py-0.5 rounded-lg text-[10px] font-black tracking-tight shadow-md transition-all duration-300 flex items-center gap-1.5 ${
                    isSelected ? 'bg-white text-black' : 'bg-black/60 text-white backdrop-blur-sm'
                  }`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${styles.bg}`}></div>
                    {unit.plateNumber}
                  </div>
                  
                  {/* Elevation line in 3D */}
                  {viewType === '3D' && (
                    <div className="absolute top-full w-[1px] h-8 bg-white/20 origin-top transform translate-y-2"></div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Intelligence Panel Overlay */}
          {showIntelligence && (
            <div className="absolute left-8 bottom-8 w-96 bg-white/95 backdrop-blur-md rounded-[32px] border border-gray-100 shadow-2xl z-50 overflow-hidden flex flex-col animate-in slide-in-from-bottom-4 duration-300">
              <div className="p-6 bg-blue-600 text-white flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Sparkles size={18} />
                  <span className="font-black text-xs uppercase tracking-widest">District Intelligence</span>
                </div>
                <button onClick={() => setShowIntelligence(false)} className="hover:bg-white/20 p-1 rounded-lg"><X size={18} /></button>
              </div>
              <div className="p-6 flex-1 overflow-y-auto max-h-[400px] custom-scrollbar">
                {intelligenceLoading ? (
                  <div className="flex flex-col items-center justify-center py-12 gap-4">
                    <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Querying Google Maps...</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="text-sm text-gray-700 leading-relaxed font-medium">
                      {intelligenceResult?.text}
                    </div>
                    {intelligenceResult?.links && intelligenceResult.links.length > 0 && (
                      <div className="space-y-3 pt-4 border-t border-gray-100">
                        <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Grounded Reference Locations</p>
                        {intelligenceResult.links.map((link, i) => (
                          <a 
                            key={i} 
                            href={link.uri} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-2xl border border-gray-100 hover:bg-white hover:border-blue-200 hover:shadow-sm transition-all group"
                          >
                            <div className="flex items-center gap-3">
                              <MapIcon size={14} className="text-blue-500" />
                              <span className="text-xs font-bold text-gray-900 line-clamp-1">{link.title}</span>
                            </div>
                            <ExternalLink size={12} className="text-gray-300 group-hover:text-blue-500" />
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
              <div className="p-4 bg-gray-50 border-t border-gray-100">
                <p className="text-[9px] text-gray-400 font-bold italic text-center">Grounded via Google Maps • Kebayoran Lama District</p>
              </div>
            </div>
          )}

          <div className="absolute right-8 top-8 flex flex-col gap-2">
            <button className="w-12 h-12 bg-white rounded-2xl shadow-xl border border-gray-100 flex items-center justify-center hover:bg-gray-50 transition-all active:scale-95"><ZoomIn size={20} /></button>
            <button className="w-12 h-12 bg-white rounded-2xl shadow-xl border border-gray-100 flex items-center justify-center hover:bg-gray-50 transition-all active:scale-95"><ZoomOut size={20} /></button>
          </div>
          
          {/* Legend HUD Overlay */}
          <div className="absolute left-8 top-8 p-4 bg-black/40 backdrop-blur-md rounded-2xl border border-white/10 text-white pointer-events-none">
            <div className="flex items-center gap-2 mb-2">
               <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]"></div>
               <span className="text-[10px] font-bold uppercase tracking-widest opacity-80">Compliance Normal</span>
            </div>
            <div className="flex items-center gap-2">
               <div className="w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.8)]"></div>
               <span className="text-[10px] font-bold uppercase tracking-widest opacity-80">Critical Breach</span>
            </div>
          </div>
        </div>

        {/* Selected Unit Dossier Panel */}
        {selectedUnit && (
          <div className="w-[420px] bg-white rounded-[40px] border border-gray-100 shadow-2xl flex flex-col animate-in fade-in slide-in-from-right-8 duration-500 ease-out">
            <div className="p-8 border-b border-gray-50 bg-gradient-to-b from-gray-50/50 to-transparent rounded-t-[40px]">
              <div className="flex justify-between items-start mb-6">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Truck size={16} className="text-zinc-400" />
                    <span className="text-xs font-black text-zinc-400 uppercase tracking-widest">Active Surveillance</span>
                  </div>
                  <h3 className="text-2xl font-black text-zinc-900 tracking-tight">{selectedUnit.plateNumber}</h3>
                  <p className="text-sm text-zinc-500 font-medium">{selectedUnit.driverName} • Shift Lead</p>
                </div>
                <div className={`px-3 py-1.5 rounded-2xl text-[10px] font-black uppercase tracking-widest border shadow-sm ${
                  selectedUnit.behaviorState === DriverBehaviorState.CRITICAL ? 'bg-rose-50 text-rose-600 border-rose-100' :
                  selectedUnit.behaviorState === DriverBehaviorState.WARNING ? 'bg-amber-50 text-amber-700 border-amber-200' :
                  selectedUnit.behaviorState === DriverBehaviorState.OFFLINE ? 'bg-zinc-900 text-zinc-400 border-zinc-700' :
                  'bg-emerald-50 text-emerald-600 border-emerald-100'
                }`}>
                  {selectedUnit.behaviorState.replace('_', ' ')}
                </div>
              </div>

              <div className="flex gap-3">
                <button className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-[20px] text-xs font-black uppercase tracking-widest shadow-lg transition-all active:scale-95 ${
                  selectedUnit.behaviorState === DriverBehaviorState.CRITICAL ? 'bg-rose-600 text-white hover:bg-rose-700 shadow-rose-200' : 'bg-black text-white hover:bg-zinc-800 shadow-zinc-200'
                }`}>
                  <Phone size={14} /> Open Comm Link
                </button>
                <button className="w-14 h-14 border border-zinc-100 bg-white rounded-[20px] flex items-center justify-center text-zinc-400 hover:text-black hover:border-zinc-300 transition-all shadow-sm">
                  <MessageSquare size={20} />
                </button>
              </div>
            </div>

            <div className="flex-1 p-8 overflow-y-auto space-y-8 custom-scrollbar">
               <section className="grid grid-cols-2 gap-4">
                  <div className="bg-zinc-50 p-5 rounded-[24px] border border-zinc-100 flex flex-col justify-between h-28">
                    <div className="flex justify-between">
                      <Compass size={18} className="text-zinc-400" />
                      <span className="text-[10px] font-bold text-zinc-400 uppercase">Heading</span>
                    </div>
                    <div>
                      <span className="text-2xl font-black text-zinc-900">{Math.round(selectedUnit.heading)}°</span>
                      <span className="text-xs text-zinc-400 ml-1 font-bold uppercase">Bearing</span>
                    </div>
                  </div>
                  <div className="bg-zinc-50 p-5 rounded-[24px] border border-zinc-100 flex flex-col justify-between h-28">
                    <div className="flex justify-between">
                      <Navigation size={18} className="text-zinc-400" />
                      <span className="text-[10px] font-bold text-zinc-400 uppercase">Compliance</span>
                    </div>
                    <div>
                      <span className={`text-2xl font-black ${selectedUnit.routeDeviation ? 'text-rose-600' : 'text-emerald-600'}`}>
                        {selectedUnit.routeDeviation ? 'FAIL' : 'PASS'}
                      </span>
                    </div>
                  </div>
               </section>

               <section>
                 <div className="flex items-center justify-between mb-4">
                    <h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                       <Gauge className="w-3 h-3" /> Velocity Profile
                    </h4>
                 </div>
                 <div className="p-6 rounded-[24px] border border-zinc-100 bg-zinc-50 shadow-inner flex flex-col gap-4">
                    <div className="flex items-baseline justify-between">
                      <div className="flex items-baseline gap-1">
                        <span className="text-4xl font-black text-zinc-900 leading-none">{Math.round(selectedUnit.speed)}</span>
                        <span className="text-sm font-black text-zinc-400 uppercase tracking-tighter">km/h</span>
                      </div>
                    </div>
                    <div className="w-full h-2 bg-zinc-200 rounded-full overflow-hidden relative">
                      <div 
                        className={`h-full transition-all duration-700 ease-out ${selectedUnit.speed > 80 ? 'bg-rose-500' : 'bg-emerald-500'}`}
                        style={{ width: `${Math.min((selectedUnit.speed / 120) * 100, 100)}%` }}
                      ></div>
                    </div>
                 </div>
               </section>

               <section>
                 <div className="flex items-center justify-between mb-4">
                    <h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                       <Shield size={12} className="text-zinc-400" /> District Context
                    </h4>
                 </div>
                 <div className="p-6 rounded-[24px] border border-zinc-100 bg-zinc-50 text-sm font-semibold leading-relaxed shadow-inner italic text-zinc-500">
                    Unit is currently traversing the <span className="text-zinc-900 font-black">Kebayoran Lama</span> logistics corridor. Higher traffic density expected near commercial hubs.
                 </div>
               </section>

               <button className="w-full py-4 border-2 border-dashed border-zinc-100 rounded-2xl flex items-center justify-center gap-3 text-zinc-400 hover:text-zinc-900 hover:border-zinc-300 transition-all group">
                 <span className="text-[11px] font-black uppercase tracking-widest">View Detailed Case Log</span>
                 <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
               </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const LayerToggleItem = ({ icon: Icon, label, description, active, onClick, color = "text-gray-400" }: any) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center gap-3 p-3 rounded-2xl transition-all ${active ? 'bg-gray-50 border border-gray-100 shadow-sm' : 'hover:bg-gray-50/50'}`}
  >
    <div className={`p-2 rounded-xl border ${active ? 'bg-white border-gray-200' : 'bg-gray-100 border-transparent'} transition-colors`}>
      <Icon size={16} className={active ? color : 'text-gray-400'} />
    </div>
    <div className="text-left flex-1">
      <p className={`text-xs font-bold leading-none ${active ? 'text-black' : 'text-gray-500'}`}>{label}</p>
      <p className="text-[9px] text-gray-400 font-medium mt-1 leading-none">{description}</p>
    </div>
    <div className={`w-8 h-4 rounded-full relative transition-colors ${active ? 'bg-black' : 'bg-gray-200'}`}>
      <div className={`absolute top-0.5 bottom-0.5 w-3 h-3 bg-white rounded-full transition-all ${active ? 'right-0.5' : 'left-0.5'}`} />
    </div>
  </button>
);

export default Tracker;
