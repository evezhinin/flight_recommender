import React, { useState } from 'react';
import { 
  Plane, Search, Sliders, Activity, 
  Loader2, Star, MapPin, X, 
  Calendar, Users, Clock, AlertCircle 
} from 'lucide-react';

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
  origin, setOrigin, 
  dest, setDest, 
  date, setDate, 
  passengers, setPassengers, 
  travelClass, setTravelClass, 
  onSearch, onOpenFilters, 
  isProcessing, airports 
}) => (
  <div className="bg-white p-3 rounded-[32px] shadow-2xl flex flex-col lg:flex-row items-stretch lg:items-center gap-2 border border-white">
    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 divide-y md:divide-y-0 lg:divide-x divide-slate-100">
      
      {/* Origin */}
      <div className="px-6 py-3 flex flex-col items-start hover:bg-slate-50 transition-all rounded-3xl lg:rounded-r-none group cursor-pointer">
        <label className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-1 group-hover:translate-x-1 transition-transform">From</label>
        <div className="flex items-center gap-2 w-full text-slate-800">
          <MapPin size={16} className="text-slate-300" />
          <select 
            value={origin}
            onChange={(e) => setOrigin(e.target.value)}
            className="w-full bg-transparent border-none p-0 font-bold text-lg outline-none appearance-none cursor-pointer"
          >
            <option value="">Where from?</option>
            {airports.map(a => <option key={a} value={a}>{a}</option>)}
          </select>
        </div>
      </div>

      {/* Destination */}
      <div className="px-6 py-3 flex flex-col items-start hover:bg-slate-50 transition-all group cursor-pointer">
        <label className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-1 group-hover:translate-x-1 transition-transform">To</label>
        <div className="flex items-center gap-2 w-full text-slate-800">
          <div className="w-4 h-4 rounded-full border-2 border-slate-200" />
          <select 
            value={dest}
            onChange={(e) => setDest(e.target.value)}
            className="w-full bg-transparent border-none p-0 font-bold text-lg outline-none appearance-none cursor-pointer"
          >
            <option value="">Where to?</option>
            {airports.map(a => <option key={a} value={a}>{a}</option>)}
          </select>
        </div>
      </div>

      {/* Date */}
      <div className="px-6 py-3 flex flex-col items-start hover:bg-slate-50 transition-all group cursor-pointer text-slate-800">
        <label className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-1 group-hover:translate-x-1 transition-transform">When</label>
        <div className="flex items-center gap-2 w-full">
          <Calendar size={16} className="text-slate-300" />
          <input 
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full bg-transparent border-none p-0 font-bold text-lg outline-none cursor-pointer"
          />
        </div>
      </div>

      {/* Passengers */}
      <div className="px-6 py-3 flex flex-col items-start hover:bg-slate-50 transition-all group cursor-pointer">
        <label className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-1 group-hover:translate-x-1 transition-transform">Who</label>
        <div className="flex items-center gap-2 w-full text-slate-800">
          <Users size={16} className="text-slate-300" />
          <select 
            value={passengers}
            onChange={(e) => setPassengers(parseInt(e.target.value))}
            className="w-full bg-transparent border-none p-0 font-bold text-lg outline-none appearance-none cursor-pointer"
          >
            {[1, 2, 3, 4, 5, 6].map(num => (
              <option key={num} value={num}>{num} {num === 1 ? 'Adult' : 'Adults'}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Class */}
      <div className="px-6 py-3 flex flex-col items-start hover:bg-slate-50 transition-all lg:rounded-l-none group cursor-pointer">
        <label className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-1 group-hover:translate-x-1 transition-transform">What</label>
        <div className="flex items-center gap-2 w-full text-slate-800">
          <Star size={16} className="text-slate-300" />
          <select 
            value={travelClass}
            onChange={(e) => setTravelClass(e.target.value)}
            className="w-full bg-transparent border-none p-0 font-bold text-lg outline-none appearance-none cursor-pointer"
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
        title="Adjust Model Weights"
      >
        <Sliders size={20} />
      </button>
      <button 
        onClick={onSearch}
        disabled={isProcessing || !origin || !dest}
        className="flex-1 lg:flex-none px-10 py-5 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-full md:rounded-2xl shadow-xl shadow-indigo-100 transition-all flex items-center justify-center gap-2 uppercase tracking-widest text-xs"
      >
        {isProcessing ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} />}
        Search
      </button>
    </div>
  </div>
);

const FlightCard = ({ flight, date, passengers, travelClass }) => (
  <div className="bg-white rounded-[40px] shadow-xl shadow-slate-200/50 border border-white p-8 relative overflow-hidden group hover:-translate-y-1 transition-all">
    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-10 bg-[#F8F9FE] rounded-r-full border-y border-r border-slate-100" />
    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-10 bg-[#F8F9FE] rounded-l-full border-y border-l border-slate-100" />
    
    <div className="flex flex-col md:flex-row items-center justify-between gap-8">
      <div className="flex items-center gap-6 w-full md:w-auto">
        <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center font-black text-slate-300 text-2xl border border-slate-100 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
          {(flight.airline_name || flight.airline || 'F')[0]}
        </div>
        <div>
          <h4 className="font-bold text-xl text-slate-800">{flight.airline_name || flight.airline}</h4>
          <div className="flex flex-wrap items-center gap-4 mt-2">
            <span className="text-xs font-bold text-indigo-500 flex items-center gap-1.5 bg-indigo-50 px-2 py-0.5 rounded-md">
              <Clock size={12} /> {flight.duration_label || `${flight.duration}m`}
            </span>
            <span className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
              <Calendar size={12} /> {date}
            </span>
            <span className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
              <Users size={12} /> {passengers}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-12 text-center md:text-right w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 pt-6 md:pt-0 border-slate-50">
        <div>
          <div className="text-xs font-bold text-slate-300 uppercase tracking-widest mb-1">Total Price</div>
          <div className="text-xl font-black text-slate-800">
            {flight.price_label || `$${(flight.price * passengers).toFixed(2)}`}
          </div>
        </div>
        <div className="pl-6 border-l border-slate-100">
          <div className="text-xs font-bold text-slate-300 uppercase tracking-widest mb-1">Match Score</div>
          <div className="text-3xl font-black text-slate-900">
            {(flight.score * 100).toFixed(1)}<span className="text-sm font-normal text-slate-400">%</span>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const WeightsModal = ({ show, onClose, weights, setWeights }) => {
  if (!show) return null;
  return (
    <div className="fixed inset-0 z-[100] bg-indigo-950/40 backdrop-blur-md flex items-center justify-center p-6 animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-md rounded-[48px] p-10 shadow-2xl animate-in zoom-in-95 duration-300 relative border border-white">
        <button onClick={onClose} className="absolute top-10 right-10 p-2 text-slate-400 hover:text-indigo-600 transition-colors focus:outline-none">
          <X size={24} />
        </button>

        <div className="mb-10">
          <h3 className="text-2xl font-black italic tracking-tighter text-indigo-950 uppercase">Your Preferences</h3>
          <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Adjust MapReduce scoring weights</p>
        </div>

        <div className="space-y-10">
          {[
            { id: 'w1', label: 'Price Importance (w1)' },
            { id: 'w2', label: 'Flight Duration (w2)' },
            { id: 'w3', label: 'Stops & Transfers (w3)' },
            { id: 'w4', label: 'Reliability (w4)' },
            { id: 'w5', label: 'Service Quality (w5)' }
          ].map((w) => (
            <div key={w.id}>
              <div className="flex justify-between items-center mb-3">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{w.label}</span>
                <span className="text-sm font-mono text-indigo-600 font-black">{(weights[w.id] * 100).toFixed(0)}%</span>
              </div>
              <div className="relative h-2 bg-slate-100 rounded-full group">
                <div className="absolute h-full bg-indigo-600 rounded-full transition-all" style={{ width: `${weights[w.id] * 100}%` }} />
                <input 
                  type="range" min="0" max="1" step="0.05" value={weights[w.id]} 
                  onChange={(e) => setWeights({...weights, [w.id]: parseFloat(e.target.value)})}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                />
              </div>
            </div>
          ))}
        </div>

        <button onClick={onClose} className="w-full mt-12 py-5 bg-indigo-600 text-white font-black rounded-[24px] shadow-xl uppercase tracking-widest text-xs transition-transform hover:scale-[0.98]">
          Apply Parameters
        </button>
      </div>
    </div>
  );
};

// --- MAIN APP COMPONENT ---

export default function App() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  
  const [origin, setOrigin] = useState('');
  const [dest, setDest] = useState('');
  const [date, setDate] = useState('2024-08-28');
  const [passengers, setPassengers] = useState(1);
  const [travelClass, setTravelClass] = useState('Economy');
  
  const [weights, setWeights] = useState({
    w1: 0.35, w2: 0.20, w3: 0.15, w4: 0.20, w5: 0.10  
  });

  const AIRPORTS = ['JFK', 'LAX', 'ORD', 'SFO', 'DFW', 'ATL', 'ROC', 'LGA'];

  const handleSearch = async () => {
    if (!origin || !dest) return;
    
    setIsProcessing(true);
    setResults(null);
    setError(null);
    setShowFilters(false);

    try {
      const queryParams = new URLSearchParams({
        origin, dest, class: travelClass,
        w1: weights.w1, w2: weights.w2, w3: weights.w3, w4: weights.w4, w5: weights.w5
      });

      const response = await fetch(`http://localhost:8000/api/recommend?${queryParams}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'No flights found for this route.');
      }

      const data = await response.json();
      setResults(data.results);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FE] text-slate-900 font-sans pb-24 selection:bg-indigo-100">
      <Header />

      {/* Hero Section */}
      <div className="pt-32 pb-48 bg-gradient-to-br from-[#6366f1] via-[#4f46e5] to-[#3b82f6] rounded-b-[40px] md:rounded-b-[60px] px-6 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-400/20 rounded-full translate-y-1/2 -translate-x-1/4 blur-3xl pointer-events-none" />
        
        <div className="max-w-6xl mx-auto relative z-10 pt-12 text-center lg:text-left">
          <h1 className="text-4xl md:text-6xl font-black mb-10 tracking-tighter leading-tight drop-shadow-sm">
            Find the <span className="text-indigo-200 underline decoration-indigo-300 underline-offset-8">best</span> route <br className="hidden md:block" /> for your next trip.
          </h1>
          
          <SearchControls 
            origin={origin} setOrigin={setOrigin}
            dest={dest} setDest={setDest}
            date={date} setDate={setDate}
            passengers={passengers} setPassengers={setPassengers}
            travelClass={travelClass} setTravelClass={setTravelClass}
            onSearch={handleSearch}
            onOpenFilters={() => setShowFilters(true)}
            isProcessing={isProcessing}
            airports={AIRPORTS}
          />
        </div>
      </div>

      {/* Content Section */}
      <main className="max-w-4xl mx-auto -mt-24 px-6 relative z-20">
        {error && (
          <div className="bg-white rounded-3xl p-6 mb-8 flex items-center gap-4 text-slate-800 shadow-xl border border-red-50 animate-in slide-in-from-bottom-5">
            <AlertCircle className="text-red-500 shrink-0" />
            <p className="font-bold">{error}</p>
          </div>
        )}

        {isProcessing && (
          <div className="bg-white/90 backdrop-blur-md rounded-[40px] p-12 shadow-2xl border border-white mb-8 flex flex-col items-center justify-center text-center">
            <Activity size={40} className="text-indigo-600 animate-pulse mb-6" />
            <h3 className="text-2xl font-bold text-slate-800 tracking-tight">Searching for Flights</h3>
            <p className="text-slate-400 text-sm mt-2 max-w-xs font-medium">Running MapReduce jobs on historical logs and satisfaction data...</p>
          </div>
        )}

        <div className="space-y-6">
          {results ? (
            results.map((f) => (
              <FlightCard 
                key={f.id || f.rank} 
                flight={f} 
                date={date} 
                passengers={passengers} 
                travelClass={travelClass} 
              />
            ))
          ) : !isProcessing && !error && (
            <div className="py-24 text-center bg-white/50 border-2 border-dashed border-slate-200 rounded-[48px] backdrop-blur-sm shadow-inner">
              <Search size={48} className="mx-auto text-slate-200 mb-6" />
              <h3 className="text-xl font-bold text-slate-400 uppercase tracking-widest mb-2">Search Results</h3>
              <p className="text-slate-400 text-sm max-w-xs mx-auto leading-relaxed">Enter your destination and adjust preferences to see ranked flight options from our Big Data cluster.</p>
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
