import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

const PerformanceChart = ({ data, loading, error }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden h-full flex flex-col transition-colors duration-300">
      <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Performance Summary</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Your latest mock exam scores vs target cutoffs.</p>
      </div>
      <div className="p-6 flex-1 min-h-[300px] flex items-center justify-center">
        
        {loading && (
          <div className="w-10 h-10 border-4 border-indigo-400 border-t-transparent rounded-full animate-spin"></div>
        )}
        
        {error && (
          <div className="text-red-400 text-sm font-medium text-center bg-red-50 dark:bg-red-900/20 px-4 py-2 rounded-lg">
            Error loading chart: {error}
          </div>
        )}

        {!loading && !error && data && data.length > 0 && (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 20, right: 30, left: -20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#6B7280" opacity={0.15} vertical={false} />
              <XAxis dataKey="subject" tick={{ fill: '#6B7280', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#6B7280', fontSize: 12 }} axisLine={false} tickLine={false} domain={[0, 100]} />
              <Tooltip 
                cursor={{ fill: 'rgba(99, 102, 241, 0.05)' }}
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', backgroundColor: 'rgba(255,255,255,0.9)' }}
              />
              <ReferenceLine y={70} stroke="#EF4444" strokeDasharray="3 3" label={{ position: 'top', value: 'Target (70)', fill: '#EF4444', fontSize: 10 }} />
              <Bar dataKey="score" fill="#6366F1" radius={[4, 4, 0, 0]} maxBarSize={50} />
            </BarChart>
          </ResponsiveContainer>
        )}
        
        {!loading && !error && (!data || data.length === 0) && (
          <div className="text-gray-500 dark:text-gray-400 text-sm">
            No exam data available.
          </div>
        )}
      </div>
    </div>
  );
};

export default PerformanceChart;
