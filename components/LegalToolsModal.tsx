
import React, { useState } from 'react';
import { X, Calculator, Calendar, Scale, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import { LIMITATION_RULES, calculateLimitation, calculateCourtFee, LimitationResult } from '../utils/legalTools';

interface Props {
  onClose: () => void;
}

export const LegalToolsModal: React.FC<Props> = ({ onClose }) => {
  const [activeTool, setActiveTool] = useState<'limitation' | 'courtFee'>('limitation');

  // Limitation State
  const [causeDate, setCauseDate] = useState('');
  const [selectedRuleId, setSelectedRuleId] = useState(LIMITATION_RULES[0].id);
  const [limitationResult, setLimitationResult] = useState<LimitationResult | null>(null);

  // Fee State
  const [suitValue, setSuitValue] = useState('');
  const [calculatedFee, setCalculatedFee] = useState<number | null>(null);

  const handleCalculateLimitation = () => {
    const result = calculateLimitation(causeDate, selectedRuleId);
    setLimitationResult(result);
  };

  const handleCalculateFee = () => {
    const val = parseFloat(suitValue);
    if (!isNaN(val)) {
      setCalculatedFee(calculateCourtFee(val));
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in slide-in-from-top-4 transition-colors">
        {/* Header */}
        <div className="bg-[#1a2333] dark:bg-slate-950 p-6 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#cfb586] rounded text-[#1a2333]">
              <Calculator className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-serif font-bold">Legal Calculators</h2>
              <p className="text-blue-200 text-xs">Standardized Indian Legal Tools</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-stone-200 dark:border-slate-800 bg-stone-50 dark:bg-slate-900">
          <button
            onClick={() => setActiveTool('limitation')}
            className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors flex items-center justify-center gap-2 ${
              activeTool === 'limitation' ? 'border-[#cfb586] text-[#1a2333] dark:text-slate-100 bg-white dark:bg-slate-800' : 'border-transparent text-stone-500 dark:text-slate-400'
            }`}
          >
            <ClockIcon /> Limitation Act
          </button>
          <button
            onClick={() => setActiveTool('courtFee')}
            className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors flex items-center justify-center gap-2 ${
              activeTool === 'courtFee' ? 'border-[#cfb586] text-[#1a2333] dark:text-slate-100 bg-white dark:bg-slate-800' : 'border-transparent text-stone-500 dark:text-slate-400'
            }`}
          >
            <CoinsIcon /> Court Fees
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 min-h-[400px]">
          
          {/* --- LIMITATION CALCULATOR --- */}
          {activeTool === 'limitation' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-stone-600 dark:text-slate-400 uppercase">Case Nature / Article</label>
                  <select
                    value={selectedRuleId}
                    onChange={(e) => { setSelectedRuleId(e.target.value); setLimitationResult(null); }}
                    className="w-full p-3 bg-stone-50 dark:bg-slate-800 border border-stone-200 dark:border-slate-700 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#cfb586] text-slate-800 dark:text-slate-200"
                  >
                    {LIMITATION_RULES.map(rule => (
                      <option key={rule.id} value={rule.id}>{rule.label} ({rule.periodYears > 0 ? `${rule.periodYears} Yrs` : `${rule.periodDays} Days`})</option>
                    ))}
                  </select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-xs font-bold text-stone-600 dark:text-slate-400 uppercase">Date of Cause of Action</label>
                  <input
                    type="date"
                    value={causeDate}
                    onChange={(e) => { setCauseDate(e.target.value); setLimitationResult(null); }}
                    className="w-full p-3 bg-stone-50 dark:bg-slate-800 border border-stone-200 dark:border-slate-700 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#cfb586] text-slate-800 dark:text-slate-200"
                  />
                </div>
              </div>

              {/* Rule Description */}
              <div className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-xs rounded-lg">
                <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <p>
                  <span className="font-bold block mb-1">
                    {LIMITATION_RULES.find(r => r.id === selectedRuleId)?.article}:
                  </span>
                  {LIMITATION_RULES.find(r => r.id === selectedRuleId)?.description}
                </p>
              </div>

              <button
                onClick={handleCalculateLimitation}
                disabled={!causeDate}
                className="w-full py-3 bg-[#1a2333] dark:bg-slate-800 hover:bg-[#2d3a52] dark:hover:bg-slate-700 text-white font-medium rounded-lg transition-colors shadow-lg shadow-blue-900/10 disabled:opacity-50"
              >
                Calculate Deadline
              </button>

              {limitationResult && (
                <div className={`mt-6 p-6 rounded-xl border-2 ${limitationResult.isBarred ? 'border-red-100 dark:border-red-900/50 bg-red-50 dark:bg-red-900/20' : 'border-green-100 dark:border-green-900/50 bg-green-50 dark:bg-green-900/20'} animate-in fade-in slide-in-from-top-4`}>
                  <div className="flex items-center gap-4 mb-4">
                    <div className={`p-3 rounded-full ${limitationResult.isBarred ? 'bg-red-200 dark:bg-red-900/50 text-red-700 dark:text-red-300' : 'bg-green-200 dark:bg-green-900/50 text-green-700 dark:text-green-300'}`}>
                      {limitationResult.isBarred ? <AlertTriangle className="w-6 h-6" /> : <CheckCircle className="w-6 h-6" />}
                    </div>
                    <div>
                      <h3 className={`text-lg font-bold ${limitationResult.isBarred ? 'text-red-800 dark:text-red-300' : 'text-green-800 dark:text-green-300'}`}>
                        {limitationResult.isBarred ? 'Barred by Limitation' : 'Within Limitation Period'}
                      </h3>
                      <p className="text-sm text-stone-600 dark:text-slate-400">
                        {limitationResult.isBarred 
                          ? `Deadline passed ${Math.abs(limitationResult.daysRemaining)} days ago` 
                          : `${limitationResult.daysRemaining} days remaining to file`}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between bg-white/60 dark:bg-slate-800/60 p-4 rounded-lg">
                    <span className="text-stone-500 dark:text-slate-400 font-medium text-sm">Last Filing Date</span>
                    <span className="text-xl font-mono font-bold text-[#1a2333] dark:text-slate-100">{limitationResult.formattedDate}</span>
                  </div>
                  <p className="text-[10px] text-stone-400 dark:text-slate-500 mt-2 text-center">
                    *Calculation excludes standard holidays. Subject to Section 5 condonation & Section 12 exclusions.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* --- COURT FEE CALCULATOR --- */}
          {activeTool === 'courtFee' && (
            <div className="space-y-6">
               <div className="space-y-2">
                  <label className="text-xs font-bold text-stone-600 dark:text-slate-400 uppercase">Suit Value / Claim Amount (₹)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-3.5 text-stone-400 dark:text-slate-500 font-serif">₹</span>
                    <input
                      type="number"
                      value={suitValue}
                      onChange={(e) => setSuitValue(e.target.value)}
                      placeholder="e.g. 500000"
                      className="w-full pl-8 pr-4 py-3 bg-stone-50 dark:bg-slate-800 border border-stone-200 dark:border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-[#cfb586] font-mono text-slate-800 dark:text-slate-200"
                    />
                  </div>
                </div>

                <button
                  onClick={handleCalculateFee}
                  disabled={!suitValue}
                  className="w-full py-3 bg-[#1a2333] dark:bg-slate-800 hover:bg-[#2d3a52] dark:hover:bg-slate-700 text-white font-medium rounded-lg transition-colors shadow-lg shadow-blue-900/10 disabled:opacity-50"
                >
                  Calculate Ad Valorem Fee
                </button>

                {calculatedFee !== null && (
                   <div className="mt-6 bg-white dark:bg-slate-800 border border-stone-200 dark:border-slate-700 rounded-xl p-6 text-center shadow-sm animate-in fade-in">
                      <p className="text-stone-500 dark:text-slate-400 text-sm mb-2">Estimated Court Fee</p>
                      <h3 className="text-4xl font-serif font-bold text-[#1a2333] dark:text-slate-100">
                        ₹{calculatedFee.toLocaleString('en-IN')}
                      </h3>
                      <p className="text-xs text-stone-400 dark:text-slate-500 mt-4">
                        Based on generic Ad Valorem slabs (7.5% base). <br/>
                        Actual fees may vary by State specific Court Fees Acts.
                      </p>
                   </div>
                )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

// Icons
const ClockIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
);
const CoinsIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="8" cy="8" r="6"/><path d="M18.09 10.37A6 6 0 1 1 10.34 18"/><path d="M7 6h1v4"/><path d="m16.71 13.88.7.71-2.82 2.82"/></svg>
);
