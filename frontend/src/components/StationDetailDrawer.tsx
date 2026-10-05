import React from 'react';
import { Station, Recommendation } from '../types';
import { X, BatteryCharging, Zap, MapPin, Building, ShieldCheck, Navigation, ExternalLink, Award } from 'lucide-react';

interface StationDetailDrawerProps {
  station: Station | null;
  recommendation: Recommendation | null;
  onClose: () => void;
  onFlyTo: (coords: [number, number]) => void;
}

export const StationDetailDrawer: React.FC<StationDetailDrawerProps> = ({
  station,
  recommendation,
  onClose,
  onFlyTo
}) => {
  if (!station && !recommendation) return null;

  const isRec = Boolean(recommendation);
  const title = isRec ? recommendation!.name : station!.name;
  const cpo = isRec ? 'Proposed PMC / MSEDCL Franchise Hub' : station!.cpo;
  const ward = isRec ? recommendation!.ward : (station!.ward || 'Pune Metropolitan Fringe');
  const address = isRec ? `Proposed high-capacity hub at ${recommendation!.traffic_node}` : station!.address;
  const power = isRec ? 120 : station!.power_kw;
  const type = isRec ? recommendation!.recommended_hardware : station!.charger_type;
  const lat = isRec ? recommendation!.latitude : station!.latitude;
  const lon = isRec ? recommendation!.longitude : station!.longitude;

  return (
    <div className="glass-panel-elevated fixed bottom-6 right-6 z-40 max-w-md w-full p-4 rounded-xl border border-white/15 space-y-3 shadow-2xl">
      {/* Top Header */}
      <div className="flex items-start justify-between gap-2 border-b border-white/10 pb-2.5">
        <div className="flex items-center gap-2">
          {isRec ? (
            <div className="w-8 h-8 rounded-lg bg-yellow-500/20 text-yellow-300 flex items-center justify-center border border-yellow-500/40">
              <Award className="w-5 h-5" />
            </div>
          ) : (
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/40">
              <BatteryCharging className="w-5 h-5" />
            </div>
          )}
          <div>
            <span className="text-[10px] font-mono-tech px-1.5 py-0.5 rounded bg-white/10 text-slate-300 font-semibold uppercase">
              {isRec ? `RECOMMENDED SITE #${recommendation!.rank}` : 'VERIFIED BEE CHARGING POINT'}
            </span>
            <h3 className="text-sm font-bold text-white leading-tight mt-0.5">{title}</h3>
          </div>
        </div>

        <button
          onClick={onClose}
          className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Details Grid */}
      <div className="space-y-2 text-xs">
        <div className="flex items-center justify-between">
          <span className="text-slate-400 flex items-center gap-1.5">
            <Building className="w-3.5 h-3.5 text-cyan-400" />
            <span>Operator / CPO:</span>
          </span>
          <span className="font-semibold text-white">{cpo}</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-slate-400 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-rose-400" />
            <span>Ward Jurisdiction:</span>
          </span>
          <span className="font-mono-tech text-slate-200">{ward}</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-slate-400 flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>Connector & Power:</span>
          </span>
          <span className="font-mono-tech text-emerald-400 font-bold">{power} kW · {type}</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-slate-400 flex items-center gap-1.5">
            <Navigation className="w-3.5 h-3.5 text-blue-400" />
            <span>Coordinates:</span>
          </span>
          <span className="font-mono-tech text-slate-300">{lat.toFixed(5)}, {lon.toFixed(5)}</span>
        </div>

        {/* Address */}
        <div className="pt-1">
          <span className="text-slate-400 text-[11px]">Location / Address:</span>
          <p className="text-[11px] text-slate-200 bg-black/40 p-2 rounded border border-white/5 mt-0.5">
            {address}
          </p>
        </div>

        {/* Grounding Authority Reference */}
        <div className="pt-1 text-[11px] border-t border-white/10 flex items-center justify-between text-slate-400">
          <span className="flex items-center gap-1 text-emerald-400 font-mono-tech">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{isRec ? 'Greedy Sited' : 'BEE Official Gazetted'}</span>
          </span>
          <button
            onClick={() => onFlyTo([lon, lat])}
            className="text-cyan-400 hover:text-cyan-300 font-medium cursor-pointer"
          >
            Center on Map →
          </button>
        </div>
      </div>
    </div>
  );
};
