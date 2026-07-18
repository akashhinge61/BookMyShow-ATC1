import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { GitCompare, Sparkles, Plus, Trash2, ArrowRight, ShieldCheck, HelpCircle, Star } from 'lucide-react';
import { useCompare } from '../context/CompareContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

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
      <div className="bg-[#0B0C0E] min-h-[70vh] flex items-center justify-center text-white px-4">
        <div className="max-w-md w-full text-center p-8 bg-[#15171B] border border-gray-800 rounded-2xl shadow-xl space-y-5">
          <div className="w-16 h-16 rounded-full bg-brand/10 text-brand flex items-center justify-center mx-auto border border-brand/20">
            <GitCompare className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-bold">Compare Corner is Empty</h3>
            <p className="text-xs text-gray-400">
              Please add at least 2 events (movies, concerts, plays, or activities) to compare them side-by-side. Use the compare pins on show cards.
            </p>
          </div>
          <button
            onClick={() => navigate('/')}
            className="w-full bg-brand hover:bg-brand-dark text-white text-xs font-bold py-3 rounded-lg shadow-lg"
          >
            Explore Shows & Events
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#0B0C0E] min-h-screen text-white py-10">
      <div className="max-w-6xl mx-auto px-4 space-y-8">
        
        {/* Header bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-800 pb-5">
          <div>
            <h1 className="text-xl md:text-3xl font-extrabold flex items-center gap-2">
              <GitCompare className="w-7 h-7 text-brand" />
              Compare Corner
            </h1>
            <p className="text-xs text-gray-400 mt-1">Cross-category side-by-side AI comparisons and tailored recommendations.</p>
          </div>
          <button
            onClick={clearCompare}
            className="text-xs text-gray-400 hover:text-white px-4 py-2 border border-gray-850 hover:border-gray-700 bg-[#15171B] rounded-lg transition-colors w-fit"
          >
            Clear Comparison
          </button>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <div className="relative">
              <div className="w-12 h-12 rounded-full border-2 border-brand border-t-transparent animate-spin" />
              <Sparkles className="w-5 h-5 text-brand absolute inset-0 m-auto animate-pulse" />
            </div>
            <p className="text-xs text-gray-400 font-semibold">Gemini AI is analyzing event parameters, price details, and pros/cons...</p>
          </div>
        ) : (
          <div className="space-y-8 fade-in">
            
            {/* AI Recommendation Summary banner */}
            {compareData && (
              <div className="p-6 rounded-xl border border-brand/35 bg-gradient-to-br from-brand/10 via-[#1C1115] to-[#15171B] relative overflow-hidden shadow-xl space-y-3">
                <div className="absolute top-0 right-0 w-32 h-32 bg-brand/5 rounded-full filter blur-xl" />
                <h4 className="text-sm font-black uppercase text-white tracking-widest flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-brand animate-pulse" />
                  AI Recommendation & Conclusion
                </h4>
                <p className="text-xs md:text-sm text-gray-200 leading-relaxed font-medium">
                  {compareData.recommendationSummary}
                </p>
                <div className="pt-2">
                  <button
                    onClick={() => navigate(`/events/${compareData.recommendedEventId}`)}
                    className="inline-flex items-center gap-1.5 bg-brand hover:bg-brand-dark text-white font-bold text-xs px-4 py-2.5 rounded shadow-lg hover:shadow-brand/20 transition-all"
                  >
                    View Recommended Event
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* Side-by-Side Comparison Matrix */}
            <div className="overflow-x-auto border border-gray-800 rounded-xl bg-[#15171B]/60 shadow-xl">
              <table className="w-full min-w-[600px] border-collapse text-left text-xs text-gray-300">
                <thead>
                  <tr className="border-b border-gray-800 bg-[#15171B]">
                    <th className="p-4 font-bold text-white w-1/4">Event Attributes</th>
                    {compareList.map(e => (
                      <th key={e.id} className="p-4 font-black text-white w-1/4 relative">
                        <button
                          onClick={() => removeFromCompare(e.id)}
                          className="absolute top-3 right-3 text-gray-500 hover:text-white"
                          title="Remove event"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                        <div className="flex items-center gap-2.5 pt-2">
                          <img src={e.poster_url} alt={e.title} className="w-10 h-14 rounded object-cover shadow border border-gray-800" />
                          <span className="line-clamp-2 block text-xs leading-normal">{e.title}</span>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/60">
                  
                  {/* AI Match percentage row */}
                  <tr className="bg-brand/5">
                    <td className="p-4 font-bold text-[#F5F5F7]">AI Match %</td>
                    {compareList.map(e => {
                      const details = compareData?.events.find(item => Number(item.id) === Number(e.id));
                      const matchPct = details ? details.matchPercentage : 75;
                      return (
                        <td key={e.id} className="p-4 font-black text-brand text-sm">
                          {matchPct}% Match
                        </td>
                      );
                    })}
                  </tr>

                  {/* Best For description row */}
                  <tr>
                    <td className="p-4 font-bold text-gray-400">Best For</td>
                    {compareList.map(e => {
                      const details = compareData?.events.find(item => Number(item.id) === Number(e.id));
                      return (
                        <td key={e.id} className="p-4 text-gray-300 leading-normal">
                          {details?.bestFor || 'General Entertainment'}
                        </td>
                      );
                    })}
                  </tr>

                  {/* Price row */}
                  <tr>
                    <td className="p-4 font-bold text-gray-400">Ticket Price</td>
                    {compareList.map(e => (
                      <td key={e.id} className="p-4 font-bold text-white">
                        {Number(e.price).toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 })}
                      </td>
                    ))}
                  </tr>

                  {/* Duration row */}
                  <tr>
                    <td className="p-4 font-bold text-gray-400">Duration</td>
                    {compareList.map(e => (
                      <td key={e.id} className="p-4">
                        {e.duration_mins} minutes
                      </td>
                    ))}
                  </tr>

                  {/* Rating row */}
                  <tr>
                    <td className="p-4 font-bold text-gray-400">User Rating</td>
                    {compareList.map(e => (
                      <td key={e.id} className="p-4 font-bold text-white flex items-center gap-1 mt-1 bg-transparent">
                        <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                        {Number(e.rating).toFixed(1)}/10 ({e.rating_count.toLocaleString()})
                      </td>
                    ))}
                  </tr>

                  {/* Genre row */}
                  <tr>
                    <td className="p-4 font-bold text-gray-400">Genre</td>
                    {compareList.map(e => (
                      <td key={e.id} className="p-4 font-semibold">
                        {e.genre}
                      </td>
                    ))}
                  </tr>

                  {/* Language row */}
                  <tr>
                    <td className="p-4 font-bold text-gray-400">Language</td>
                    {compareList.map(e => (
                      <td key={e.id} className="p-4">
                        {e.language}
                      </td>
                    ))}
                  </tr>

                  {/* Venue row */}
                  <tr>
                    <td className="p-4 font-bold text-gray-400">Venue & City</td>
                    {compareList.map(e => (
                      <td key={e.id} className="p-4 leading-normal">
                        {e.venue_name}
                      </td>
                    ))}
                  </tr>

                  {/* Pros list */}
                  <tr>
                    <td className="p-4 font-bold text-emerald-400">Pros</td>
                    {compareList.map(e => {
                      const details = compareData?.events.find(item => Number(item.id) === Number(e.id));
                      const pros = details?.pros || ['Popular rating', 'Great venue'];
                      return (
                        <td key={e.id} className="p-4">
                          <ul className="list-disc pl-4 space-y-1 text-[11px] text-gray-300">
                            {pros.map((pro, index) => (
                              <li key={index} className="text-emerald-400">{pro}</li>
                            ))}
                          </ul>
                        </td>
                      );
                    })}
                  </tr>

                  {/* Cons list */}
                  <tr>
                    <td className="p-4 font-bold text-red-400">Cons</td>
                    {compareList.map(e => {
                      const details = compareData?.events.find(item => Number(item.id) === Number(e.id));
                      const cons = details?.cons || ['Limited tickets'];
                      return (
                        <td key={e.id} className="p-4">
                          <ul className="list-disc pl-4 space-y-1 text-[11px] text-gray-300">
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
