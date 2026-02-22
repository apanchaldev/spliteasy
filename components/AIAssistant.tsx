
import React, { useState, useEffect } from 'react';
import { Expense, Friend } from '../types';
import { getSpendingInsights } from '../services/geminiService';

interface AIAssistantProps {
  expenses: Expense[];
  friends: Friend[];
}

const AIAssistant: React.FC<AIAssistantProps> = ({ expenses, friends }) => {
  const [insights, setInsights] = useState<{ title: string; message: string; severity: string }[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchInsights = async () => {
    if (expenses.length === 0) return;
    setLoading(true);
    const result = await getSpendingInsights(expenses, friends);
    if (result && result.insights) {
      setInsights(result.insights);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchInsights();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3 bg-gradient-to-br from-[#1CC29F] to-[#18A688] p-6 rounded-2xl text-white shadow-lg">
        <div className="bg-white/20 p-3 rounded-xl backdrop-blur-md">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
        </div>
        <div>
          <h2 className="text-xl font-bold">Smart Insights</h2>
          <p className="text-white/80 text-sm">Powered by Gemini AI</p>
        </div>
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-24 bg-gray-100 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : insights.length > 0 ? (
          insights.map((insight, idx) => (
            <div key={idx} className={`p-4 rounded-xl border border-gray-100 bg-white shadow-sm flex items-start space-x-4`}>
               <div className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${
                 insight.severity === 'warning' ? 'bg-orange-500' : 
                 insight.severity === 'success' ? 'bg-[#1CC29F]' : 'bg-blue-500'
               }`} />
               <div>
                 <h4 className="font-bold text-gray-800 text-sm">{insight.title}</h4>
                 <p className="text-gray-600 text-sm mt-1 leading-relaxed">{insight.message}</p>
               </div>
            </div>
          ))
        ) : (
          <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-200">
            <p className="text-gray-400">Add some expenses to get AI insights!</p>
            <button 
              onClick={fetchInsights}
              className="mt-4 text-[#1CC29F] text-sm font-bold uppercase tracking-wider"
            >
              Refresh Data
            </button>
          </div>
        )}
      </div>

      <div className="bg-gray-50 p-4 rounded-xl">
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">AI Spending Breakdown</h3>
        <div className="flex items-center justify-between text-sm py-2 border-b border-gray-100">
          <span className="text-gray-600">Total Analyzed</span>
          <span className="font-bold text-gray-800">${expenses.reduce((a, b) => a + b.amount, 0).toFixed(2)}</span>
        </div>
        <div className="flex items-center justify-between text-sm py-2">
          <span className="text-gray-600">Active Friends</span>
          <span className="font-bold text-gray-800">{friends.length}</span>
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;
