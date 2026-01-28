
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
  Square,
  Search,
  Crosshair,
  Building2,
  Signal,
  RotateCw,
  Move
} from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

// Mock Layer Data
const GEOFENCES = [
  { id: 'geo-1', name: 'Plumpang Depot Perimeter', x: 250, y: 150, radius: 80, color: 'rgba(59, 130, 246, 0.15)', borderColor: 'rgba(59, 130, 246, 0.4)' },
  { id: 'geo-2', name: 'High-Risk Transit Zone', x: 600, y: 400, radius: 120, color: 'rgba(245, 158, 11, 0.1)', borderColor: 'rgba(245, 158, 11, 0.3)' },
  { id: 'geo-3', name: 'SPBU 31.123 Delivery Point', x: 850, y: 220, radius: 60, color: 'rgba(16, 185, 129, 0.15)', borderColor: 'rgba(16, 185, 129, 0.4)' },
];

const MOCK_BUILDINGS = [
  { x: 100, y: 100, w: 80, h: 60, depth: 40 },
  { x: 300, y: 450, w: 40, h: 40, depth: 20 },
  { x: 800, y: 100, w: 120, h: 80, depth: 60 },
  { x: 500, y: 300, w: 60, h: 40, depth: 30 },
  { x: 1050, y: 600, w: 90, h: 100, depth: 80 },
];

const TRAFFIC_ZONES = [
  { x1: 0, y1: 200, x2: 1200, y2: 200, intensity: 'heavy' },
  { x1: 400, y1: 0, x2: 400, y2: 800, intensity: 'moderate' },
  { x1: 700, y1: 150, x2: 1100, y2: 550, intensity: 'heavy' },
];

const Tracker: React.FC<{ units: Unit[] }> = ({ units }) => {
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(units[0]);
  const [showLayerControl, setShowLayerControl] = useState(false);
  const [viewType, setViewType] = useState<'2D' | '3D'>('3D');
  const [mapTilt, setMapTilt] = useState(48);
  const [mapRotation, setMapRotation] = useState(0);
  const [mapScale, setMapScale] = useState(1.15);

  const [activeLayers, setActiveLayers] = useState({
    geofences: true,
    deviations: true,
    traffic: true,
    trails: true,
    terrain: true
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
    return {
      x: (lng - 106.6) * 1200,
      y: Math.abs(lat + 6.0) * 1200
    };
  };

  const toggleLayer = (layer: keyof typeof activeLayers) => {
    setActiveLayers(prev => ({ ...prev, [layer]: !prev[layer] }));
  };

  const fetchUnitIntelligence = async (unit: Unit) => {
    setIntelligenceLoading(true);
    setShowIntelligence(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `Audit the immediate surroundings for logistics unit ${unit.id} at coordinates [${unit.lat}, ${unit.lng}]. 
        Identify:
        1. Nearest Fuel Terminals (TBBM) or Gas Stations (SPBU).
        2. Known road hazards or major traffic bottlenecks at this exact location.
        3. Critical emergency infrastructure (Hospitals/Fire Stations) within 2km.
        
        Provide a clinical situational brief for the RTC operator.`,
        config: {
          tools: [{ googleMaps: {} }],
          toolConfig: {
            retrievalConfig: {
              latLng: {
                latitude: unit.lat,
                longitude: unit.lng
              }
            }
          }
        },
      });

      const text = response.text || "Situational audit complete. No immediate hazards detected in mapping layers.";
      const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
      
      const links = chunks
        .filter((chunk: any) => chunk.maps)
        .map((chunk: any) => ({
          title: chunk.maps.title || "Context Detail",
          uri: chunk.maps.uri
        }));

      setIntelligenceResult({ text, links });
    } catch (error) {
      console.error("Maps Grounding Error:", error);
      setIntelligenceResult({ 
        text: "Regional Mapping Hub currently unavailable. Telemetry remains active.", 
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
          <p className="text-sm text-gray-500">Monitoring Regional Distribution Corridor (Kebayoran Area).</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white p-1 rounded-xl border border-gray-100 shadow-sm relative">
            <button 
              onClick={() => setViewType(viewType === '2D' ? '3D' : '2D')}
              className={`p-2.5 rounded-lg transition-all flex items-center gap-2 ${viewType === '3D' ? 'bg-indigo-600 text-white shadow-lg' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              title="Toggle 3D Map Perspective"
            >
              {viewType === '3D' ? <Box size={18} /> : <Square size={18} />}
              <span className="text-[10px] font-black uppercase tracking-widest">{viewType}</span>
            </button>
            
            <button 
              onClick={() => setShowLayerControl(!showLayerControl)}
              className={`p-2.5 rounded-lg transition-all ${showLayerControl ? 'bg-black text-white shadow-lg' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`} 
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
                  <LayerToggleItem icon={Shield} label="Geofences" active={activeLayers.geofences} onClick={() => toggleLayer('geofences')} />
                  <LayerToggleItem icon={Building2} label="Terrain Hubs" active={activeLayers.terrain} onClick={() => toggleLayer('terrain')} />
                  <LayerToggleItem icon={TriangleAlert} label="Deviations" active={activeLayers.deviations} onClick={() => toggleLayer('deviations')} color="text-amber-500" />
                  <LayerToggleItem icon={Zap} label="Traffic Flow" active={activeLayers.traffic} onClick={() => toggleLayer('traffic')} color="text-blue-500" />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 flex gap-6 overflow-hidden relative">
        {/* Camera HUD (Active in 3D View) */}
        {viewType === '3D' && (
          <div className="absolute left-8 top-8 z-40 flex flex-col gap-4 animate-in fade-in slide-in-from-left-4 duration-500">
            <div className="bg-black/80 backdrop-blur-xl border border-white/10 rounded-[28px] p-5 shadow-2xl flex flex-col gap-4">
              <div className="flex items-center justify-between gap-8 mb-2">
                <div className="flex items-center gap-2">
                  <RotateCw size={14} className="text-indigo-400" />
                  <span className="text-[9px] font-black text-zinc-400 uppercase tracking-[0.2em]">Orientation</span>
                </div>
                <span className="text-[10px] font-black text-white tabular-nums">{mapRotation}°</span>
              </div>
              <input 
                type="range" min="-180" max="180" value={mapRotation} 
                onChange={(e) => setMapRotation(parseInt(e.target.value))}
                className="w-40 h-1 bg-zinc-800 rounded-full appearance-none cursor-pointer accent-indigo-500"
              />
              
              <div className="flex items-center justify-between gap-8 mt-2 mb-2">
                <div className="flex items-center gap-2">
                  <Move size={14} className="text-indigo-400" />
                  <span className="text-[9px] font-black text-zinc-400 uppercase tracking-[0.2em]">Camera Tilt</span>
                </div>
                <span className="text-[10px] font-black text-white tabular-nums">{mapTilt}°</span>
              </div>
              <input 
                type="range" min="0" max="75" value={mapTilt} 
                onChange={(e) => setMapTilt(parseInt(e.target.value))}
                className="w-40 h-1 bg-zinc-800 rounded-full appearance-none cursor-pointer accent-indigo-500"
              />

              <button 
                onClick={() => { setMapRotation(0); setMapTilt(48); setMapScale(1.15); }}
                className="mt-4 py-2 bg-white/5 border border-white/10 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-white/10 transition-all text-zinc-400 hover:text-white"
              >
                Reset Camera
              </button>
            </div>
          </div>
        )}

        {/* Surveillance Grid / Tactical Map */}
        <div className="flex-1 bg-zinc-950 rounded-[40px] relative border border-white/5 overflow-hidden shadow-2xl" style={{ perspective: '1200px' }}>
          <div 
            className={`absolute inset-0 transition-transform duration-1000 ease-out origin-center`}
            style={{ 
              transform: viewType === '3D' ? `rotateX(${mapTilt}deg) rotateZ(${mapRotation}deg) translateY(-8%) scale(${mapScale})` : 'none',
              transformStyle: 'preserve-3d'
            }}
          >
            {/* Grid & Terrain Visuals */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_#1a1a1a_0%,_#0a0a0a_100%)] opacity-50"></div>
            
            <div className="absolute inset-0 pointer-events-none opacity-20">
              <div className="grid grid-cols-24 h-full w-full">
                {Array.from({ length: 24 }).map((_, i) => <div key={i} className="border-r border-white/5 h-full w-full"></div>)}
              </div>
              <div className="grid grid-rows-24 h-full w-full absolute inset-0">
                {Array.from({ length: 24 }).map((_, i) => <div key={i} className="border-b border-white/5 h-full w-full"></div>)}
              </div>
            </div>

            {/* Road Network (Mocked Vectors) */}
            <svg className="absolute inset-0 w-full h-full opacity-10">
              <path d="M0,200 L1200,200" stroke="white" strokeWidth="20" fill="none" />
              <path d="M400,0 L400,1200" stroke="white" strokeWidth="20" fill="none" />
              <path d="M0,600 L1200,600" stroke="white" strokeWidth="15" fill="none" />
              <path d="M800,0 L800,1200" stroke="white" strokeWidth="15" fill="none" />
            </svg>

            {/* 3D Buildings Rendering */}
            {activeLayers.terrain && MOCK_BUILDINGS.map((b, i) => (
              <div 
                key={`bldg-${i}`}
                className="absolute transition-all duration-1000"
                style={{
                  left: `${b.x}px`,
                  top: `${b.y}px`,
                  width: `${b.w}px`,
                  height: `${b.h}px`,
                  transformStyle: 'preserve-3d'
                }}
              >
                {/* 3D Prism Construction */}
                <div className="relative w-full h-full" style={{ transformStyle: 'preserve-3d' }}>
                  {/* Top Face */}
                  <div className="absolute inset-0 bg-zinc-800 border border-white/10 shadow-inner" style={{ transform: viewType === '3D' ? `translateZ(${b.depth}px)` : 'none' }}></div>
                  {viewType === '3D' && (
                    <>
                      {/* Side Faces (Visible in 3D) */}
                      <div className="absolute top-0 left-0 h-full bg-zinc-900 border border-white/5 origin-left" style={{ width: `${b.depth}px`, transform: `rotateY(-90deg)` }}></div>
                      <div className="absolute top-0 right-0 h-full bg-zinc-900 border border-white/5 origin-right" style={{ width: `${b.depth}px`, transform: `rotateY(90deg)` }}></div>
                      <div className="absolute top-0 left-0 w-full bg-zinc-800 border border-white/5 origin-top" style={{ height: `${b.depth}px`, transform: `rotateX(90deg)` }}></div>
                      <div className="absolute bottom-0 left-0 w-full bg-zinc-950 border border-white/5 origin-bottom" style={{ height: `${b.depth}px`, transform: `rotateX(-90deg)` }}></div>
                    </>
                  )}
                </div>
              </div>
            ))}

            {activeLayers.traffic && TRAFFIC_ZONES.map((zone, idx) => (
              <div 
                key={`traffic-${idx}`}
                className={`absolute bg-gradient-to-r ${zone.intensity === 'heavy' ? 'from-rose-500/30 to-rose-500/10' : 'from-amber-500/30 to-amber-500/10'} animate-pulse`}
                style={{
                  left: `${Math.min(zone.x1, zone.x2)}px`,
                  top: `${zone.y1 - 10}px`,
                  width: `${Math.abs(zone.x1 - zone.x2) || 20}px`,
                  height: `${Math.abs(zone.y1 - zone.y2) || 20}px`,
                  transform: viewType === '3D' ? 'translateZ(2px)' : 'none'
                }}
              />
            ))}

            {activeLayers.geofences && GEOFENCES.map(geo => (
              <div 
                key={geo.id}
                className="absolute rounded-full border-[2px] border-dashed flex items-center justify-center group"
                style={{
                  left: `${geo.x}px`,
                  top: `${geo.y}px`,
                  width: `${geo.radius * 2}px`,
                  height: `${geo.radius * 2}px`,
                  transform: 'translate(-50%, -50%)',
                  backgroundColor: geo.color,
                  borderColor: geo.borderColor,
                }}
              >
                <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-black/90 text-white text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl absolute -top-12 shadow-2xl border border-white/10">
                  {geo.name}
                </div>
              </div>
            ))}

            {units.map(unit => {
              const { x, y } = getMapCoords(unit.lat, unit.lng);
              const styles = getBehaviorStyles(unit.behaviorState);
              const isSelected = selectedUnit?.id === unit.id;

              return (
                <button 
                  key={unit.id}
                  onClick={() => setSelectedUnit(unit)}
                  className={`absolute flex flex-col items-center transition-all duration-1000 ease-linear ${isSelected ? 'z-50' : 'z-20'}`}
                  style={{ 
                    left: `${x}px`, 
                    top: `${y}px`,
                    transform: `translate(-50%, -50%) ${viewType === '3D' ? `rotateZ(${-mapRotation}deg) rotateX(${-mapTilt}deg)` : ''}`,
                    transformStyle: 'preserve-3d'
                  }}
                >
                  <div className={`relative p-2.5 rounded-full border-[3px] transition-all duration-300 ${styles.bg} ${styles.border} ${styles.glow} ${styles.animate || ''} ${
                    isSelected ? 'scale-125 ring-[12px] ring-blue-500/20 shadow-blue-500/40 shadow-2xl' : 'shadow-lg hover:scale-110'
                  }`}>
                    <Navigation 
                      size={18} 
                      className={`${styles.text} transition-transform duration-1000`} 
                      style={{ transform: `rotate(${unit.heading}deg)` }}
                    />
                  </div>

                  <div className={`mt-3 px-3 py-1 rounded-xl text-[10px] font-black tracking-tight shadow-2xl transition-all duration-300 flex items-center gap-2 ${
                    isSelected ? 'bg-white text-black border border-blue-500' : 'bg-black/80 text-white backdrop-blur-md border border-white/10'
                  }`}>
                    <div className={`w-2 h-2 rounded-full ${styles.bg} ${styles.animate ? 'animate-pulse' : ''}`}></div>
                    {unit.plateNumber}
                  </div>
                  
                  {viewType === '3D' && (
                    <div className="absolute top-full w-[1px] h-16 bg-gradient-to-b from-white/60 to-transparent origin-top transform translate-y-3"></div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Intelligence Overlays */}
          {showIntelligence && (
            <div className="absolute left-8 bottom-8 w-[400px] bg-white/95 backdrop-blur-xl rounded-[40px] border border-gray-100 shadow-2xl z-[60] overflow-hidden flex flex-col animate-in slide-in-from-bottom-8 duration-500 ease-out">
              <div className="p-8 bg-blue-600 text-white flex justify-between items-center shadow-lg">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-xl">
                    <Sparkles size={20} />
                  </div>
                  <div>
                    <span className="font-black text-[10px] uppercase tracking-widest block opacity-70">Situational Brief</span>
                    <h4 className="text-sm font-black uppercase tracking-tight">Regional Mapping Hub</h4>
                  </div>
                </div>
                <button onClick={() => setShowIntelligence(false)} className="hover:bg-white/20 p-2 rounded-xl transition-colors"><X size={20} /></button>
              </div>
              
              <div className="p-8 flex-1 overflow-y-auto max-h-[440px] custom-scrollbar space-y-8">
                {intelligenceLoading ? (
                  <div className="flex flex-col items-center justify-center py-20 gap-6">
                    <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    <div className="text-center">
                       <p className="text-[10px] font-black uppercase text-gray-400 tracking-[0.2em] animate-pulse">Querying Google Maps</p>
                       <p className="text-xs text-gray-400 mt-2 italic">Grounding operational coordinates...</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-8 animate-in fade-in duration-700">
                    <div className="text-sm text-gray-700 leading-relaxed font-semibold bg-blue-50/30 p-6 rounded-[32px] border border-blue-100/50">
                      {intelligenceResult?.text}
                    </div>
                    
                    {intelligenceResult?.links && intelligenceResult.links.length > 0 && (
                      <div className="space-y-4 pt-4 border-t border-gray-100">
                        <p className="text-[10px] font-black uppercase text-gray-400 tracking-[0.2em]">Contextual References</p>
                        <div className="grid gap-3">
                          {intelligenceResult.links.map((link, i) => (
                            <a 
                              key={i} 
                              href={link.uri} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="flex items-center justify-between p-4 bg-gray-50 rounded-[24px] border border-gray-100 hover:bg-white hover:border-blue-400 hover:shadow-xl hover:scale-[1.02] transition-all group"
                            >
                              <div className="flex items-center gap-4">
                                <div className="p-2 bg-white rounded-xl border border-gray-100 group-hover:text-blue-600">
                                   <MapIcon size={16} />
                                </div>
                                <span className="text-xs font-black text-gray-900 line-clamp-1 uppercase tracking-tight">{link.title}</span>
                              </div>
                              <ExternalLink size={14} className="text-gray-300 group-hover:text-blue-600" />
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
              <div className="px-8 py-5 bg-gray-50 border-t border-gray-100">
                <p className="text-[9px] text-gray-400 font-bold italic flex items-center gap-2">
                  <Globe size={10} /> Data verified via Google Maps Grounding Layer
                </p>
              </div>
            </div>
          )}

          {/* Zoom Controls */}
          <div className="absolute right-8 bottom-8 flex flex-col gap-3 z-40">
            <button 
              onClick={() => setMapScale(prev => Math.min(prev + 0.1, 2.5))}
              className="w-14 h-14 bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl border border-white/20 flex items-center justify-center hover:bg-white transition-all active:scale-90 group"
            >
              <ZoomIn size={22} className="text-zinc-500 group-hover:text-black" />
            </button>
            <button 
              onClick={() => setMapScale(prev => Math.max(prev - 0.1, 0.5))}
              className="w-14 h-14 bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl border border-white/20 flex items-center justify-center hover:bg-white transition-all active:scale-90 group"
            >
              <ZoomOut size={22} className="text-zinc-500 group-hover:text-black" />
            </button>
          </div>
        </div>

        {/* Selected Unit Dossier Panel */}
        {selectedUnit && (
          <div className="w-[440px] bg-white rounded-[40px] border border-gray-100 shadow-2xl flex flex-col animate-in fade-in slide-in-from-right-8 duration-500 ease-out">
            <div className="p-8 border-b border-gray-50 bg-gradient-to-b from-gray-50/50 to-transparent rounded-t-[40px]">
              <div className="flex justify-between items-start mb-8">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <Truck size={14} className="text-blue-500" />
                    <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Active Surveillance Hub</span>
                  </div>
                  <h3 className="text-3xl font-black text-zinc-900 tracking-tighter">{selectedUnit.plateNumber}</h3>
                  <div className="flex items-center gap-2 text-sm text-zinc-500 font-bold">
                    <UserCheck size={14} /> {selectedUnit.driverName}
                  </div>
                </div>
                <div className={`px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-[0.1em] border shadow-sm ${
                  selectedUnit.behaviorState === DriverBehaviorState.CRITICAL ? 'bg-rose-50 text-rose-600 border-rose-100' :
                  selectedUnit.behaviorState === DriverBehaviorState.WARNING ? 'bg-amber-50 text-amber-700 border-amber-200' :
                  'bg-emerald-50 text-emerald-600 border-emerald-100'
                }`}>
                  {selectedUnit.behaviorState.replace('_', ' ')}
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <button 
                  onClick={() => fetchUnitIntelligence(selectedUnit)}
                  className="w-full flex items-center justify-center gap-3 py-4 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-indigo-200 hover:bg-indigo-700 transition-all hover:scale-[1.02] active:scale-95 group"
                >
                  <Sparkles size={16} className="group-hover:animate-spin" /> Contextual Awareness Audit
                </button>
                <div className="flex gap-2">
                   <button className="flex-1 py-4 bg-zinc-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all shadow-lg flex items-center justify-center gap-2">
                      <Phone size={14} /> Open Link
                   </button>
                   <button className="px-6 py-4 bg-white border border-gray-100 rounded-2xl hover:bg-gray-50 transition-all shadow-sm">
                      <MessageSquare size={18} className="text-zinc-400" />
                   </button>
                </div>
              </div>
            </div>

            <div className="flex-1 p-8 overflow-y-auto space-y-10 custom-scrollbar">
               <section>
                 <div className="flex items-center justify-between mb-4">
                    <h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] flex items-center gap-2">
                       <Crosshair className="w-3 h-3" /> Spatial Telemetry
                    </h4>
                    <span className="text-[9px] font-bold text-emerald-600 uppercase">Grounded: Active</span>
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <TelemetryTile icon={Compass} label="Bearing" value={`${Math.round(selectedUnit.heading)}°`} sub="Heading" />
                    <TelemetryTile icon={Signal} label="GPS Status" value="Locked" sub="Precision 1.2m" isSuccess />
                 </div>
               </section>

               <section>
                 <div className="flex items-center justify-between mb-4">
                    <h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] flex items-center gap-2">
                       <Gauge className="w-3 h-3" /> Performance Profile
                    </h4>
                 </div>
                 <div className="p-8 rounded-[32px] border border-gray-100 bg-zinc-50 shadow-inner space-y-6">
                    <div className="flex items-baseline justify-between">
                      <div className="flex items-baseline gap-2">
                        <span className="text-5xl font-black text-zinc-900 tracking-tighter">{Math.round(selectedUnit.speed)}</span>
                        <span className="text-sm font-black text-zinc-400 uppercase tracking-widest">km/h</span>
                      </div>
                      <div className="text-right">
                         <p className="text-[9px] font-black uppercase text-zinc-400 mb-0.5">District Limit</p>
                         <p className="text-xs font-black text-zinc-900">80 km/h</p>
                      </div>
                    </div>
                    <div className="w-full h-3 bg-zinc-200 rounded-full overflow-hidden relative shadow-inner">
                      <div 
                        className={`h-full transition-all duration-1000 ease-out rounded-full ${selectedUnit.speed > 80 ? 'bg-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.5)]' : 'bg-blue-600 shadow-[0_0_15px_rgba(37,99,235,0.4)]'}`}
                        style={{ width: `${Math.min((selectedUnit.speed / 120) * 100, 100)}%` }}
                      ></div>
                    </div>
                 </div>
               </section>

               <section>
                 <div className="flex items-center justify-between mb-4">
                    <h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] flex items-center gap-2">
                       <Shield size={12} className="text-blue-500" /> Grounded Context
                    </h4>
                 </div>
                 <div className="p-8 rounded-[32px] border border-gray-100 bg-zinc-50 text-sm font-semibold leading-relaxed shadow-inner italic text-zinc-500 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                      <MapIcon size={80} />
                    </div>
                    Unit is currently traversing the <span className="text-zinc-900 font-black">Kebayoran Corridor</span>. 
                    <p className="mt-4 text-[10px] not-italic font-black uppercase text-zinc-400">Regional Integrity: <span className="text-emerald-600">Optimal</span></p>
                 </div>
               </section>

               <button className="w-full py-5 border-2 border-dashed border-zinc-100 rounded-3xl flex items-center justify-center gap-3 text-zinc-400 hover:text-zinc-900 hover:border-zinc-300 hover:bg-zinc-50 transition-all group">
                 <span className="text-[10px] font-black uppercase tracking-[0.2em]">Situational Dossier</span>
                 <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
               </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const TelemetryTile = ({ icon: Icon, label, value, sub, isSuccess }: any) => (
  <div className="bg-zinc-50 p-6 rounded-[28px] border border-zinc-100 flex flex-col justify-between h-32 hover:bg-white hover:shadow-lg hover:border-blue-100 transition-all group">
    <div className="flex justify-between items-start">
      <div className={`p-2 rounded-xl transition-colors ${isSuccess ? 'bg-emerald-50 text-emerald-600' : 'bg-white text-zinc-400 border border-zinc-100 group-hover:text-blue-500'}`}>
        <Icon size={18} />
      </div>
      <span className="text-[9px] font-black text-zinc-300 uppercase tracking-widest group-hover:text-zinc-500">{label}</span>
    </div>
    <div>
      <span className={`text-2xl font-black block tracking-tight ${isSuccess ? 'text-emerald-700' : 'text-zinc-900'}`}>{value}</span>
      <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">{sub}</span>
    </div>
  </div>
);

const LayerToggleItem = ({ icon: Icon, label, active, onClick, color = "text-gray-400" }: any) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all ${active ? 'bg-blue-50/50 border border-blue-100 shadow-sm' : 'hover:bg-gray-50/50'}`}
  >
    <div className={`p-2.5 rounded-xl border transition-all ${active ? 'bg-white border-blue-200 shadow-md' : 'bg-gray-100 border-transparent'} transition-colors`}>
      <Icon size={18} className={active ? color : 'text-gray-400'} />
    </div>
    <div className="text-left flex-1">
      <p className={`text-xs font-black uppercase tracking-tight ${active ? 'text-blue-900' : 'text-gray-500'}`}>{label}</p>
    </div>
    <div className={`w-10 h-5 rounded-full relative transition-colors ${active ? 'bg-blue-600 shadow-inner' : 'bg-gray-200'}`}>
      <div className={`absolute top-1 bottom-1 w-3 h-3 bg-white rounded-full transition-all shadow-sm ${active ? 'right-1' : 'left-1'}`} />
    </div>
  </button>
);

export default Tracker;
