import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { GitCompare, Sparkles, Plus, Trash2, ArrowRight, ShieldCheck, HelpCircle, Star, Award, MapPin } from 'lucide-react';
import { useCompare } from '../context/CompareContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import ImageWithFallback from '../components/ImageWithFallback';

export default function ComparePage() {
  const { compareList, removeFromCompare, clearCompare } = useCompare();
  const { user } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [compareData, setCompareData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchComparison() {
      // Comparison requires at least 2 events
      if (compareList.length < 2) {
        setLoading(false);
        return;
      }
      
      if (!user) return;

      try {
        setLoading(true);
        const eventIds = compareList.map(e => e.id);
        const res = await axios.post('/api/ai/compare', { eventIds }, {
          headers: { 'x-user-id': user.id }
        });
        setCompareData(res.data);
      } catch (err) {
        console.error('Comparison call failed:', err.message);
        addToast('Error generating AI comparison', 'error');
      } finally {
        setLoading(false);
      }
    }

    fetchComparison();
  }, [compareList, user]);

  if (compareList.length < 2) {
    return (
      <div className="bg-white dark:bg-[#0B0C0E] min-h-[70vh] flex items-center justify-center text-gray-900 dark:text-white px-4 transition-colors duration-200">
        <div className="max-w-md w-full text-center p-8 bg-gray-55 dark:bg-[#15171B] border border-gray-200 dark:border-gray-800 rounded-2xl shadow-xl space-y-5">
          <div className="w-16 h-16 rounded-full bg-brand/10 text-brand flex items-center justify-center mx-auto border border-brand/20">
            <GitCompare className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-bold">Smart Compare is Empty</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold leading-relaxed">
              Please add at least 2 events (up to 5) to compare them side-by-side. Use the compare pins on show cards.
            </p>
          </div>
          <button
            onClick={() => navigate('/')}
            className="w-full bg-brand hover:bg-brand-dark text-white text-xs font-bold py-3 rounded-lg shadow-lg active:scale-95 transition-transform"
          >
            Explore Shows & Events
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-[#0B0C0E] min-h-screen text-gray-900 dark:text-white py-10 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 space-y-8">
        
        {/* Header bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 dark:border-gray-800 pb-5">
          <div>
            <h1 className="text-xl md:text-3xl font-extrabold flex items-center gap-2 font-sans">
              <GitCompare className="w-7 h-7 text-brand" />
              Smart Compare
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Cross-category comparison matrix for up to 5 events powered by Gemini AI.</p>
          </div>
          <button
            onClick={clearCompare}
            className="text-xs text-gray-600 dark:text-gray-300 hover:text-white px-4 py-2 border border-gray-200 dark:border-gray-850 hover:bg-brand hover:text-white rounded-lg transition-all font-semibold w-fit"
          >
            Clear Comparison
          </button>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 space-y-4">
            <div className="relative">
              <div className="w-12 h-12 rounded-full border-2 border-brand border-t-transparent animate-spin" />
              <Sparkles className="w-5 h-5 text-brand absolute inset-0 m-auto animate-pulse" />
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 font-bold">Gemini AI is analyzing event parameters, price details, and match suitability...</p>
          </div>
        ) : (
          <div className="space-y-8 animate-fade-in">
            
            {/* AI Recommendation Summary banner */}
            {compareData && (
              <div className="p-6 rounded-2xl border border-brand/35 bg-gradient-to-br from-brand/10 via-[#1C1115]/10 to-[#15171B]/20 dark:to-transparent shadow-xl space-y-3 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-36 h-36 bg-brand/5 rounded-full filter blur-xl" />
                <h4 className="text-xs font-black uppercase text-brand tracking-widest flex items-center gap-1.5 animate-pulse">
                  <Sparkles className="w-4 h-4" />
                  AI Recommendation & Conclusion
                </h4>
                <p className="text-xs md:text-sm text-gray-800 dark:text-gray-200 leading-relaxed font-semibold">
                  {compareData.recommendationSummary}
                </p>
                <div className="pt-2">
                  <button
                    onClick={() => navigate(`/events/${compareData.recommendedEventId}`)}
                    className="inline-flex items-center gap-1.5 bg-brand hover:bg-brand-dark text-white font-bold text-xs px-4 py-2.5 rounded-lg shadow-lg hover:shadow-brand/20 transition-all scale-[1.01] hover:scale-[1.02] active:scale-95"
                  >
                    View Recommended Event
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* Side-by-Side Comparison Matrix */}
            <div className="overflow-x-auto border border-gray-255 dark:border-gray-800 rounded-2xl bg-gray-50 dark:bg-[#15171B]/40 shadow-xl no-scrollbar">
              <table className="w-full min-w-[800px] border-collapse text-left text-xs">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-800 bg-gray-100 dark:bg-[#15171B] transition-colors">
                    <th className="p-4 font-bold text-gray-900 dark:text-white w-1/6">Event Attributes</th>
                    {compareList.map(e => (
                      <th key={e.id} className="p-4 font-bold text-gray-900 dark:text-white w-1/6 relative border-l border-gray-200 dark:border-gray-800">
                        <button
                          onClick={() => removeFromCompare(e.id)}
                          className="absolute top-3 right-3 text-gray-400 hover:text-brand"
                          title="Remove event"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                        <div className="flex flex-col items-center text-center gap-2 pt-3">
                          <ImageWithFallback
                            src={e.poster_url}
                            alt={e.title}
                            category={e.category_id}
                            title={e.title}
                            type="poster"
                            className="w-14 h-20 rounded-lg object-cover shadow border border-gray-200 dark:border-gray-800"
                          />
                          <span className="line-clamp-2 block text-xs font-black leading-snug tracking-tight text-gray-900 dark:text-white mt-1">{e.title}</span>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-800/60">
                  
                  {/* AI Match percentage row */}
                  <tr className="bg-brand/5 dark:bg-brand/5">
                    <td className="p-4 font-bold text-gray-800 dark:text-gray-200">AI Match Score</td>
                    {compareList.map(e => {
                      const details = compareData?.events.find(item => Number(item.id) === Number(e.id));
                      const matchPct = details ? details.matchPercentage : 75;
                      return (
                        <td key={e.id} className="p-4 font-black text-brand text-sm border-l border-gray-200 dark:border-gray-800">
                          {matchPct}% Match
                        </td>
                      );
                    })}
                  </tr>

                  {/* Critics Rating */}
                  <tr>
                    <td className="p-4 font-bold text-gray-500 dark:text-gray-400">Critics Rating</td>
                    {compareList.map(e => {
                      const critics = e.metadata?.critics_rating || 8.0;
                      return (
                        <td key={e.id} className="p-4 text-gray-900 dark:text-gray-200 font-bold border-l border-gray-200 dark:border-gray-800">
                          <span className="flex items-center gap-1">
                            <Award className="w-4 h-4 text-brand" /> {critics.toFixed(1)}/10
                          </span>
                        </td>
                      );
                    })}
                  </tr>

                  {/* User Rating */}
                  <tr>
                    <td className="p-4 font-bold text-gray-500 dark:text-gray-400">User Rating</td>
                    {compareList.map(e => (
                      <td key={e.id} className="p-4 font-bold text-gray-900 dark:text-gray-200 border-l border-gray-200 dark:border-gray-800">
                        <span className="flex items-center gap-1">
                          <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                          {Number(e.rating).toFixed(1)}/10 ({e.rating_count.toLocaleString()})
                        </span>
                      </td>
                    ))}
                  </tr>

                  {/* Price row */}
                  <tr>
                    <td className="p-4 font-bold text-gray-500 dark:text-gray-400">Ticket Price</td>
                    {compareList.map(e => (
                      <td key={e.id} className="p-4 font-extrabold text-brand border-l border-gray-200 dark:border-gray-800">
                        {Number(e.price).toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 })}
                      </td>
                    ))}
                  </tr>

                  {/* Genre row */}
                  <tr>
                    <td className="p-4 font-bold text-gray-500 dark:text-gray-400">Genre</td>
                    {compareList.map(e => (
                      <td key={e.id} className="p-4 font-semibold text-gray-800 dark:text-gray-200 border-l border-gray-200 dark:border-gray-800">
                        {e.genre}
                      </td>
                    ))}
                  </tr>

                  {/* Duration row */}
                  <tr>
                    <td className="p-4 font-bold text-gray-500 dark:text-gray-400">Runtime</td>
                    {compareList.map(e => (
                      <td key={e.id} className="p-4 text-gray-800 dark:text-gray-300 border-l border-gray-200 dark:border-gray-800">
                        {e.duration_mins} minutes
                      </td>
                    ))}
                  </tr>

                  {/* Language row */}
                  <tr>
                    <td className="p-4 font-bold text-gray-500 dark:text-gray-400">Language</td>
                    {compareList.map(e => (
                      <td key={e.id} className="p-4 text-gray-800 dark:text-gray-300 border-l border-gray-200 dark:border-gray-800">
                        {e.language}
                      </td>
                    ))}
                  </tr>

                  {/* Venue row */}
                  <tr>
                    <td className="p-4 font-bold text-gray-500 dark:text-gray-400">Venue</td>
                    {compareList.map(e => (
                      <td key={e.id} className="p-4 leading-normal text-gray-800 dark:text-gray-300 border-l border-gray-200 dark:border-gray-800">
                        {e.venue_name}
                      </td>
                    ))}
                  </tr>

                  {/* Distance row */}
                  <tr>
                    <td className="p-4 font-bold text-gray-500 dark:text-gray-400">Distance</td>
                    {compareList.map(e => {
                      const dist = e.metadata?.distance_km || 4.5;
                      return (
                        <td key={e.id} className="p-4 text-gray-800 dark:text-gray-300 border-l border-gray-200 dark:border-gray-800">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-brand" /> {dist} KM from center
                          </span>
                        </td>
                      );
                    })}
                  </tr>

                  {/* Date & Time */}
                  <tr>
                    <td className="p-4 font-bold text-gray-500 dark:text-gray-400">Date & Time</td>
                    {compareList.map(e => {
                      const date = new Date(e.event_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
                      return (
                        <td key={e.id} className="p-4 text-gray-800 dark:text-gray-300 border-l border-gray-200 dark:border-gray-800">
                          {date} at {e.event_time}
                        </td>
                      );
                    })}
                  </tr>

                  {/* Best For row */}
                  <tr>
                    <td className="p-4 font-bold text-gray-500 dark:text-gray-400">Best For</td>
                    {compareList.map(e => {
                      const details = compareData?.events.find(item => Number(item.id) === Number(e.id));
                      const bestFor = e.metadata?.best_for || details?.bestFor || 'General Audiences';
                      return (
                        <td key={e.id} className="p-4 text-gray-800 dark:text-gray-200 border-l border-gray-200 dark:border-gray-800">
                          {bestFor}
                        </td>
                      );
                    })}
                  </tr>

                  {/* Mood row */}
                  <tr>
                    <td className="p-4 font-bold text-gray-500 dark:text-gray-400">Mood</td>
                    {compareList.map(e => {
                      const mood = e.metadata?.mood || 'Exciting';
                      return (
                        <td key={e.id} className="p-4 text-gray-800 dark:text-gray-300 border-l border-gray-200 dark:border-gray-800">
                          {mood}
                        </td>
                      );
                    })}
                  </tr>

                  {/* Age Suitability */}
                  <tr>
                    <td className="p-4 font-bold text-gray-500 dark:text-gray-400">Age Suitability</td>
                    {compareList.map(e => {
                      const age = e.metadata?.age_suitability || 'UA';
                      return (
                        <td key={e.id} className="p-4 text-gray-800 dark:text-gray-300 border-l border-gray-200 dark:border-gray-800">
                          <span className="px-2 py-0.5 rounded border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 font-bold text-[10px]">
                            {age}
                          </span>
                        </td>
                      );
                    })}
                  </tr>

                  {/* Highlights row */}
                  <tr>
                    <td className="p-4 font-bold text-gray-500 dark:text-gray-400">Highlights</td>
                    {compareList.map(e => {
                      const highlights = e.metadata?.highlights || ['Top Booking Choice'];
                      return (
                        <td key={e.id} className="p-4 border-l border-gray-200 dark:border-gray-800">
                          <div className="flex flex-wrap gap-1">
                            {highlights.map((h, i) => (
                              <span key={i} className="bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700/60 px-2 py-0.5 rounded text-[9px] text-gray-700 dark:text-gray-300 font-bold">
                                {h}
                              </span>
                            ))}
                          </div>
                        </td>
                      );
                    })}
                  </tr>

                  {/* Pros list */}
                  <tr>
                    <td className="p-4 font-bold text-emerald-500">Pros</td>
                    {compareList.map(e => {
                      const details = compareData?.events.find(item => Number(item.id) === Number(e.id));
                      const pros = e.metadata?.pros || details?.pros || ['Popular rating', 'Great venue'];
                      return (
                        <td key={e.id} className="p-4 border-l border-gray-200 dark:border-gray-800">
                          <ul className="list-disc pl-4 space-y-1 text-[11px] text-gray-700 dark:text-gray-300 font-semibold">
                            {pros.map((pro, index) => (
                              <li key={index} className="text-emerald-500">{pro}</li>
                            ))}
                          </ul>
                        </td>
                      );
                    })}
                  </tr>

                  {/* Cons list */}
                  <tr>
                    <td className="p-4 font-bold text-red-500">Cons</td>
                    {compareList.map(e => {
                      const details = compareData?.events.find(item => Number(item.id) === Number(e.id));
                      const cons = e.metadata?.cons || details?.cons || ['Limited tickets'];
                      return (
                        <td key={e.id} className="p-4 border-l border-gray-200 dark:border-gray-800">
                          <ul className="list-disc pl-4 space-y-1 text-[11px] text-gray-700 dark:text-gray-300 font-semibold">
                            {cons.map((con, index) => (
                              <li key={index} className="text-red-400">{con}</li>
                            ))}
                          </ul>
                        </td>
                      );
                    })}
                  </tr>

                </tbody>
              </table>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
