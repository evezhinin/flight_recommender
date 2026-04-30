import React, { useState, useEffect } from 'react';
import {
  Plane, Search, Sliders, Activity,
  Loader2, Star, MapPin, X,
  Users, Clock, AlertCircle, GitBranch, ArrowRight
} from 'lucide-react';

const API = 'https://flight-recommender.onrender.com';

const AIRPORT_CITIES = {
  ATL: 'Atlanta', AUS: 'Austin', BNA: 'Nashville', BOS: 'Boston',
  BWI: 'Baltimore', DFW: 'Dallas', IAD: 'Washington DC', IND: 'Indianapolis',
  JFK: 'New York', LAX: 'Los Angeles', LGA: 'New York (LGA)', MIA: 'Miami',
  MSP: 'Minneapolis', ORD: 'Chicago', ROC: 'Rochester', SFO: 'San Francisco',
  SRQ: 'Sarasota',
};

const AIRLINE_COLORS = {
  AA: 'bg-blue-600 text-white',
  AS: 'bg-teal-600 text-white',
  B6: 'bg-indigo-500 text-white',
  DL: 'bg-red-600 text-white',
  G4: 'bg-amber-500 text-white',
  NK: 'bg-yellow-400 text-yellow-900',
  UA: 'bg-blue-900 text-white',
  WN: 'bg-orange-500 text-white',
};

const airportLabel = (code) =>
  AIRPORT_CITIES[code] ? `${code} — ${AIRPORT_CITIES[code]}` : code;

// --- SUB-COMPONENTS ---

const Header = () => (
  <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-100 px-8 py-5">
    <div className="max-w-7xl mx-auto flex items-center gap-3">
      <div className="bg-indigo-600 p-2 rounded-xl text-white shadow-lg shadow-indigo-200">
        <Plane size={24} />
      </div>
      <span className="font-bold text-xl tracking-tight text-indigo-950">Flight Recommender System</span>
    </div>
  </header>
);

const SearchControls = ({
  origin, onOriginChange,
  dest, setDest,
  passengers, setPassengers,
  travelClass, setTravelClass,
  onSearch, onOpenFilters,
  isProcessing, origins, originsLoading, destinations,
}) => (
  <div className="bg-white p-3 rounded-[32px] shadow-2xl flex flex-col lg:flex-row items-stretch lg:items-center gap-2 border border-white">
    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 divide-y md:divide-y-0 lg:divide-x divide-slate-100">

      {/* Origin */}
      <div className="px-6 py-3 flex flex-col items-start hover:bg-slate-50 transition-all rounded-3xl lg:rounded-r-none group cursor-pointer">
        <label className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-1 group-hover:translate-x-1 transition-transform">From</label>
        <div className="flex items-center gap-2 w-full text-slate-800">
          <MapPin size={16} className="text-slate-300 shrink-0" />
          <select
            value={origin}
            onChange={(e) => onOriginChange(e.target.value)}
            className="w-full bg-transparent border-none p-0 font-bold text-base outline-none appearance-none cursor-pointer"
          >
            <option value="">{originsLoading ? 'Loading airports…' : 'Where from?'}</option>
            {origins.map(a => <option key={a} value={a}>{airportLabel(a)}</option>)}
          </select>
        </div>
      </div>

      {/* Destination */}
      <div className="px-6 py-3 flex flex-col items-start hover:bg-slate-50 transition-all group cursor-pointer">
        <label className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-1 group-hover:translate-x-1 transition-transform">To</label>
        <div className="flex items-center gap-2 w-full text-slate-800">
          <div className="w-4 h-4 rounded-full border-2 border-slate-200 shrink-0" />
          <select
            value={dest}
            onChange={(e) => setDest(e.target.value)}
            disabled={!origin}
            className="w-full bg-transparent border-none p-0 font-bold text-base outline-none appearance-none cursor-pointer disabled:opacity-40"
          >
            <option value="">{origin ? 'Where to?' : 'Pick origin first'}</option>
            {destinations.map(a => <option key={a} value={a}>{airportLabel(a)}</option>)}
          </select>
        </div>
      </div>

      {/* Passengers */}
      <div className="px-6 py-3 flex flex-col items-start hover:bg-slate-50 transition-all group cursor-pointer">
        <label className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-1 group-hover:translate-x-1 transition-transform">Who</label>
        <div className="flex items-center gap-2 w-full text-slate-800">
          <Users size={16} className="text-slate-300 shrink-0" />
          <select
            value={passengers}
            onChange={(e) => setPassengers(parseInt(e.target.value))}
            className="w-full bg-transparent border-none p-0 font-bold text-base outline-none appearance-none cursor-pointer"
          >
            {[1, 2, 3, 4, 5, 6].map(num => (
              <option key={num} value={num}>{num} {num === 1 ? 'Adult' : 'Adults'}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Class */}
      <div className="px-6 py-3 flex flex-col items-start hover:bg-slate-50 transition-all lg:rounded-l-none group cursor-pointer">
        <label className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-1 group-hover:translate-x-1 transition-transform">Class</label>
        <div className="flex items-center gap-2 w-full text-slate-800">
          <Star size={16} className="text-slate-300 shrink-0" />
          <select
            value={travelClass}
            onChange={(e) => setTravelClass(e.target.value)}
            className="w-full bg-transparent border-none p-0 font-bold text-base outline-none appearance-none cursor-pointer"
          >
            <option value="Economy">Economy</option>
            <option value="Eco Plus">Eco Plus</option>
            <option value="Business">Business</option>
          </select>
        </div>
      </div>
    </div>

    {/* Search Actions */}
    <div className="flex items-center gap-2 px-2 py-2 lg:py-0">
      <button
        onClick={onOpenFilters}
        className="p-5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-full md:rounded-2xl transition-all"
        title="Adjust Scoring Weights"
      >
        <Sliders size={20} />
      </button>
      <button
        onClick={onSearch}
        disabled={isProcessing || !origin || !dest}
        className="flex-1 lg:flex-none px-10 py-5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black rounded-full md:rounded-2xl shadow-xl shadow-indigo-100 transition-all flex items-center justify-center gap-2 uppercase tracking-widest text-xs"
      >
        {isProcessing ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} />}
        Search
      </button>
    </div>
  </div>
);

const RANK_COLORS = [
  'bg-yellow-400 text-yellow-900',
  'bg-slate-200 text-slate-600',
  'bg-orange-200 text-orange-700',
];

const StopsBadge = ({ stops }) => {
  const label = stops === 0 ? 'Direct' : stops === 1 ? '1 Stop' : `${stops} Stops`;
  const color = stops === 0
    ? 'text-emerald-600 bg-emerald-50'
    : stops === 1 ? 'text-amber-600 bg-amber-50'
    : 'text-red-500 bg-red-50';
  return (
    <span className={`text-xs font-bold flex items-center gap-1.5 px-2 py-0.5 rounded-md ${color}`}>
      <GitBranch size={12} /> {label}
    </span>
  );
};

const FlightCard = ({ flight, passengers }) => {
  const rank = flight.rank ?? null;
  const scorePercent = (flight.score * 100).toFixed(1);
  const rankColor = rank != null && rank <= 3 ? RANK_COLORS[rank - 1] : 'bg-slate-100 text-slate-500';
  const delayPct = ((flight.delay_prob ?? 0) * 100).toFixed(0);
  const perPersonPrice = flight.price ?? 0;
  const totalPrice = (perPersonPrice * passengers).toFixed(2);
  const airlineCode = flight.airline ?? '';
  const avatarColor = AIRLINE_COLORS[airlineCode] ?? 'bg-slate-100 text-slate-400';

  return (
    <div className="bg-white rounded-[40px] shadow-xl shadow-slate-200/50 border border-white p-8 relative overflow-hidden group hover:-translate-y-1 transition-all">
      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-10 bg-[#F8F9FE] rounded-r-full border-y border-r border-slate-100" />
      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-10 bg-[#F8F9FE] rounded-l-full border-y border-l border-slate-100" />

      {rank != null && (
        <div className={`absolute top-6 left-6 w-8 h-8 rounded-full flex items-center justify-center text-xs font-black ${rankColor}`}>
          #{rank}
        </div>
      )}

      <div className="flex flex-col md:flex-row items-center justify-between gap-8">
        {/* Left: airline + tags */}
        <div className="flex items-center gap-6 w-full md:w-auto">
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center font-black text-2xl shrink-0 transition-opacity group-hover:opacity-90 ${avatarColor}`}>
            {airlineCode || (flight.airline_name ?? 'F')[0]}
          </div>
          <div>
            <h4 className="font-bold text-xl text-slate-800">{flight.airline_name || flight.airline}</h4>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <span className="text-xs font-bold text-indigo-500 flex items-center gap-1.5 bg-indigo-50 px-2 py-0.5 rounded-md">
                <Clock size={12} /> {flight.duration_label || `${flight.duration}m`}
              </span>
              <StopsBadge stops={flight.stops ?? 0} />
            </div>
          </div>
        </div>

        {/* Right: stats */}
        <div className="flex items-center gap-8 text-center md:text-right w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 pt-6 md:pt-0 border-slate-50">
          <div>
            <div className="text-xs font-bold text-slate-300 uppercase tracking-widest mb-1">Delay Risk</div>
            <div className={`text-xl font-black ${Number(delayPct) < 20 ? 'text-emerald-600' : Number(delayPct) < 40 ? 'text-amber-500' : 'text-red-500'}`}>
              {delayPct}<span className="text-sm font-normal text-slate-400">%</span>
            </div>
          </div>

          <div>
            <div className="text-xs font-bold text-slate-300 uppercase tracking-widest mb-1">
              {passengers > 1 ? `Total (${passengers} pax)` : 'Price'}
            </div>
            <div className="text-xl font-black text-slate-800">${totalPrice}</div>
            {passengers > 1 && (
              <div className="text-xs text-slate-400 font-medium mt-0.5">${perPersonPrice.toFixed(2)}/person</div>
            )}
          </div>

          <div className="pl-6 border-l border-slate-100">
            <div className="text-xs font-bold text-slate-300 uppercase tracking-widest mb-1">Match Score</div>
            <div className="text-3xl font-black text-slate-900">
              {scorePercent}<span className="text-sm font-normal text-slate-400">%</span>
            </div>
            <div className="mt-2 h-1.5 w-24 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${scorePercent}%` }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const WEIGHT_DEFS = [
  { id: 'w1', label: 'Price' },
  { id: 'w2', label: 'Flight Duration' },
  { id: 'w3', label: 'Stops & Transfers' },
  { id: 'w4', label: 'Reliability' },
  { id: 'w5', label: 'Service Quality' },
];

const WeightsModal = ({ show, onClose, weights, setWeights }) => {
  if (!show) return null;

  const total = WEIGHT_DEFS.reduce((s, w) => s + weights[w.id], 0) || 1;
  const effectivePct = (id) => Math.round((weights[id] / total) * 100);

  return (
    <div className="fixed inset-0 z-[100] bg-indigo-950/40 backdrop-blur-md flex items-center justify-center p-6">
      <div className="bg-white w-full max-w-md rounded-[48px] p-10 shadow-2xl relative border border-white">
        <button onClick={onClose} className="absolute top-10 right-10 p-2 text-slate-400 hover:text-indigo-600 transition-colors focus:outline-none">
          <X size={24} />
        </button>

        <div className="mb-8">
          <h3 className="text-2xl font-black italic tracking-tighter text-indigo-950 uppercase">Scoring Weights</h3>
          <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Drag to set priority — always sums to 100%</p>
        </div>

        <div className="space-y-8">
          {WEIGHT_DEFS.map((w) => {
            const pct = effectivePct(w.id);
            return (
              <div key={w.id}>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{w.label}</span>
                  <span className="text-sm font-mono text-indigo-600 font-black">{pct}%</span>
                </div>
                <div className="relative h-2 bg-slate-100 rounded-full">
                  <div className="absolute h-full bg-indigo-600 rounded-full transition-all" style={{ width: `${pct}%` }} />
                  <input
                    type="range" min="0.05" max="1" step="0.05" value={weights[w.id]}
                    onChange={(e) => setWeights({ ...weights, [w.id]: parseFloat(e.target.value) })}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-8 p-4 bg-slate-50 rounded-2xl">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Travel Class Bonus</p>
          <p className="text-xs text-slate-500 leading-relaxed">
            Business adds a fixed scoring boost · Eco Plus adds a small boost · Economy has no bonus.
            This is applied on top of the weights above.
          </p>
        </div>

        <button onClick={onClose} className="w-full mt-6 py-5 bg-indigo-600 text-white font-black rounded-[24px] shadow-xl uppercase tracking-widest text-xs transition-transform hover:scale-[0.98]">
          Apply
        </button>
      </div>
    </div>
  );
};

const STOPS_FILTERS = [
  { id: 'any',    label: 'Any' },
  { id: 'direct', label: 'Direct' },
  { id: '1',      label: '1 Stop' },
  { id: '2+',     label: '2+ Stops' },
];

// --- MAIN APP COMPONENT ---

export default function App() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [slowLoad, setSlowLoad]         = useState(false);
  const [showFilters, setShowFilters]   = useState(false);
  const [results, setResults]           = useState(null);
  const [searchMeta, setSearchMeta]     = useState(null);
  const [error, setError]               = useState(null);
  const [stopsFilter, setStopsFilter]   = useState('any');

  const [origin, setOrigin]         = useState('');
  const [dest, setDest]             = useState('');
  const [passengers, setPassengers] = useState(1);
  const [travelClass, setTravelClass] = useState('Economy');

  const [origins, setOrigins]           = useState([]);
  const [originsLoading, setOriginsLoading] = useState(true);
  const [destinations, setDestinations] = useState([]);

  const [weights, setWeights] = useState({
    w1: 0.35, w2: 0.20, w3: 0.15, w4: 0.20, w5: 0.10,
  });

  // Cold-start warning after 8 s — all setState calls wrapped in setTimeout to satisfy lint rule
  useEffect(() => {
    const t = setTimeout(() => setSlowLoad(isProcessing), isProcessing ? 8000 : 0);
    return () => clearTimeout(t);
  }, [isProcessing]);

  useEffect(() => {
    fetch(`${API}/api/origins`)
      .then(r => r.json())
      .then(data => { setOrigins(data); setOriginsLoading(false); })
      .catch(() => setOriginsLoading(false));
  }, []);

  // Clearing dest/destinations happens in the event handler, not here — avoids synchronous setState in effect
  useEffect(() => {
    if (!origin) return;
    fetch(`${API}/api/destinations?origin=${origin}`)
      .then(r => r.json())
      .then(setDestinations)
      .catch(() => {});
  }, [origin]);

  const handleOriginChange = (value) => {
    setOrigin(value);
    setDest('');
    setDestinations([]);
  };

  const handleSearch = async () => {
    if (!origin || !dest) return;

    setIsProcessing(true);
    setResults(null);
    setSearchMeta(null);
    setError(null);
    setShowFilters(false);
    setStopsFilter('any');

    try {
      const queryParams = new URLSearchParams({
        origin, dest, class: travelClass,
        w1: weights.w1, w2: weights.w2, w3: weights.w3, w4: weights.w4, w5: weights.w5,
      });

      const response = await fetch(`${API}/api/recommend?${queryParams}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'No flights found for this route.');
      }

      const data = await response.json();
      setResults(data.results);
      setSearchMeta({ origin, dest, travelClass, count: data.results.length });
    } catch (err) {
      setError(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const visibleResults = (results ?? []).filter(f => {
    if (stopsFilter === 'direct') return f.stops === 0;
    if (stopsFilter === '1')      return f.stops === 1;
    if (stopsFilter === '2+')     return f.stops >= 2;
    return true;
  });

  return (
    <div className="min-h-screen bg-[#F8F9FE] text-slate-900 font-sans pb-24 selection:bg-indigo-100">
      <Header />

      {/* Hero */}
      <div className="pt-32 pb-48 bg-gradient-to-br from-[#6366f1] via-[#4f46e5] to-[#3b82f6] rounded-b-[40px] md:rounded-b-[60px] px-6 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-400/20 rounded-full translate-y-1/2 -translate-x-1/4 blur-3xl pointer-events-none" />

        <div className="max-w-6xl mx-auto relative z-10 pt-12 text-center lg:text-left">
          <h1 className="text-4xl md:text-6xl font-black mb-10 tracking-tighter leading-tight drop-shadow-sm">
            Find the <span className="text-indigo-200 underline decoration-indigo-300 underline-offset-8">best</span> route <br className="hidden md:block" /> for your next trip.
          </h1>

          <SearchControls
            origin={origin} onOriginChange={handleOriginChange}
            dest={dest} setDest={setDest}
            passengers={passengers} setPassengers={setPassengers}
            travelClass={travelClass} setTravelClass={setTravelClass}
            onSearch={handleSearch}
            onOpenFilters={() => setShowFilters(true)}
            isProcessing={isProcessing}
            origins={origins} originsLoading={originsLoading}
            destinations={destinations}
          />

          <p className="mt-4 text-indigo-200/70 text-xs font-medium">
            Results are based on historical flight data · Rankings update with your preference weights
          </p>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-4xl mx-auto -mt-24 px-6 relative z-20">
        {error && (
          <div className="bg-white rounded-3xl p-6 mb-8 flex items-center gap-4 text-slate-800 shadow-xl border border-red-50">
            <AlertCircle className="text-red-500 shrink-0" />
            <p className="font-bold">{error}</p>
          </div>
        )}

        {isProcessing && (
          <div className="bg-white/90 backdrop-blur-md rounded-[40px] p-12 shadow-2xl border border-white mb-8 flex flex-col items-center justify-center text-center">
            <Activity size={40} className="text-indigo-600 animate-pulse mb-6" />
            <h3 className="text-2xl font-bold text-slate-800 tracking-tight">Searching for Flights</h3>
            <p className="text-slate-400 text-sm mt-2 max-w-xs font-medium">Scoring routes with your preferences…</p>
            {slowLoad && (
              <p className="text-amber-500 text-xs font-bold mt-4 max-w-xs">
                The server may be waking up from sleep — this can take up to 30 s on the first request.
              </p>
            )}
          </div>
        )}

        {/* Results header + stops filter chips */}
        {results && searchMeta && !isProcessing && (
          <div className="mb-4 px-2 space-y-3">
            <div className="flex items-center gap-2 text-slate-500 text-white quickytext-sm font-bold">
              <span>{searchMeta.origin}</span>
              <ArrowRight size={14} />
              <span>{searchMeta.dest}</span>
              <span className="text-slate-300 font-normal">·</span>
              <span>{searchMeta.travelClass}</span>
              <span className="text-slate-300 font-normal">·</span>
              <span>{searchMeta.count} result{searchMeta.count !== 1 ? 's' : ''}</span>
            </div>
            <div className="flex items-center gap-2">
              {STOPS_FILTERS.map(f => (
                <button
                  key={f.id}
                  onClick={() => setStopsFilter(f.id)}
                  className={`text-xs font-black uppercase tracking-widest px-3 py-1.5 rounded-full transition-all ${stopsFilter === f.id ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-6">
          {results ? (
            visibleResults.length > 0 ? (
              visibleResults.map((f) => (
                <FlightCard key={f.id || f.rank} flight={f} passengers={passengers} />
              ))
            ) : (
              <div className="py-16 text-center">
                <p className="text-slate-400 text-sm font-medium">No flights match this filter.</p>
                <button onClick={() => setStopsFilter('any')} className="mt-3 text-indigo-500 text-xs font-bold underline">
                  Show all flights
                </button>
              </div>
            )
          ) : !isProcessing && !error && (
            <div className="py-20 text-center">
              <p className="text-slate-400 text-sm font-medium">Select an origin and destination above, then hit Search.</p>
            </div>
          )}
        </div>
      </main>

      <WeightsModal
        show={showFilters}
        onClose={() => setShowFilters(false)}
        weights={weights}
        setWeights={setWeights}
      />
    </div>
  );
}
