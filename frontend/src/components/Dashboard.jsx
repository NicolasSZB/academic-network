import React, { useState, useEffect } from 'react';
import PerformanceChart from './PerformanceChart';
import ActivityFeed from './ActivityFeed';
import { BookOpen, Award, Users, Plus, X, CheckCircle, Brain } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const [examData, setExamData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Modal & Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [subject, setSubject] = useState('Math');
  const [score, setScore] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showToast, setShowToast] = useState(false);

  // Diagnostic State
  const [diagnosticData, setDiagnosticData] = useState(null);
  const [diagnosticLoading, setDiagnosticLoading] = useState(true);
  const [diagnosticError, setDiagnosticError] = useState(null);

  const fetchDiagnostic = async (exams) => {
    setDiagnosticLoading(true);
    
    // Group by subject to get latest score
    const latestScores = {
      math: 0,
      sciences: 0,
      humanities: 0,
      languages: 0
    };

    exams.forEach(exam => {
      const subj = exam.subject.toLowerCase();
      if (latestScores[subj] !== undefined) {
        latestScores[subj] = exam.score;
      }
    });

    const queryParams = new URLSearchParams(latestScores).toString();
    const token = localStorage.getItem('token');

    try {
      const response = await fetch(`http://localhost:8000/api/diagnostic?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) {
        console.error(`Diagnostic Fetch Failed - HTTP Status: ${response.status}`);
        if (response.status === 401) navigate('/login');
        throw new Error('Failed to fetch diagnostic');
      }
      const data = await response.json();
      setDiagnosticData(data);
    } catch (err) {
      setDiagnosticError(err.message);
    } finally {
      setDiagnosticLoading(false);
    }
  };

  const fetchData = () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    
    fetch('http://localhost:8000/api/mock-exams', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
      .then(res => {
        if (!res.ok) {
          console.error(`GET /api/mock-exams Failed - HTTP Status: ${res.status} ${res.statusText}`);
          if (res.status === 401) {
            navigate('/login');
          }
          throw new Error('Failed to fetch exams');
        }
        return res.json();
      })
      .then(data => {
        const mappedData = data.slice(-4).map(exam => ({
          subject: exam.subject,
          score: exam.score,
          target: 70
        }));
        setExamData(mappedData);
        setLoading(false);
        fetchDiagnostic(data);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const payload = {
      subject: subject,
      score: parseFloat(score),
      user_id: 1 // Default user for mock tests
    };

    const token = localStorage.getItem('token');

    fetch('http://localhost:8000/api/mock-exams', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    })
    .then(res => {
      if (!res.ok) {
        console.error(`POST /api/mock-exams Failed - HTTP Status: ${res.status} ${res.statusText}`);
        if (res.status === 401) {
          navigate('/login');
        }
        throw new Error('Failed to submit score');
      }
      return res.json();
    })
    .then(() => {
      setIsSubmitting(false);
      setIsModalOpen(false);
      setScore('');
      setSubject('Math');
      
      // Trigger toast
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
      
      // Refresh the chart data
      fetchData();
    })
    .catch(err => {
      console.error(err);
      setIsSubmitting(false);
      alert('Error submitting score');
    });
  };

  return (
    <div className="space-y-6 relative">
      
      {/* Toast Notification */}
      {showToast && (
        <div className="fixed top-24 right-8 z-50 flex items-center p-4 space-x-3 text-gray-800 dark:text-white bg-white dark:bg-gray-800 rounded-lg shadow-xl border-l-4 border-green-500 animate-fade-in-down transition-all">
          <CheckCircle className="w-6 h-6 text-green-500" />
          <div className="text-sm font-medium">Score successfully recorded!</div>
        </div>
      )}

      {/* Header with New Score Button */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Dashboard Overview</h2>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Score
        </button>
      </div>

      {/* Top Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center space-x-4 transition-colors duration-300">
          <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Exams</p>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">12</h3>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center space-x-4 transition-colors duration-300">
          <div className="p-3 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-xl">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Average Score</p>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">78.5</h3>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center space-x-4 transition-colors duration-300">
          <div className="p-3 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-xl">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Class Rank</p>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Top 15%</h3>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <PerformanceChart data={examData} loading={loading} error={error} />
          
          {/* AI Diagnostic Section */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 transition-colors duration-300">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">AI Study Diagnostic</h3>
            
            {diagnosticLoading ? (
              <div className="flex flex-col items-center justify-center py-8">
                <div className="w-8 h-8 border-4 border-indigo-400 border-t-transparent rounded-full animate-spin"></div>
                <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">Analyzing performance...</p>
              </div>
            ) : diagnosticError ? (
              <div className="text-red-500 bg-red-50 dark:bg-red-900/20 p-4 rounded-xl text-sm">
                Failed to load diagnostic: {diagnosticError}
              </div>
            ) : diagnosticData ? (
              <div className="space-y-6">
                <div className={`p-4 rounded-xl border ${diagnosticData.overall_status === 'Excellent' ? 'bg-green-50 border-green-100 dark:bg-green-900/20 dark:border-green-800' : 'bg-yellow-50 border-yellow-100 dark:bg-yellow-900/20 dark:border-yellow-800'}`}>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Diagnostic Summary</h4>
                  <p className="text-gray-700 dark:text-gray-300 text-sm">
                    Overall Status: <span className="font-bold">{diagnosticData.overall_status}</span>
                  </p>
                </div>
                
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                    <Brain className="w-5 h-5 mr-2 text-indigo-500" />
                    Study Recommendations
                  </h4>
                  <ul className="space-y-2">
                    {diagnosticData.recommendations.map((rec, i) => (
                      <li key={i} className="flex items-start">
                        <CheckCircle className="w-4 h-4 text-indigo-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-gray-600 dark:text-gray-400 leading-tight">{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : null}
          </div>
        </div>
        <div className="lg:col-span-1">
          <ActivityFeed />
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm transition-opacity">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all">
            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Record New Score</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 focus:outline-none">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Subject</label>
                <select 
                  value={subject} 
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors outline-none"
                >
                  <option value="Math">Math</option>
                  <option value="Sciences">Sciences</option>
                  <option value="Humanities">Humanities</option>
                  <option value="Languages">Languages</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Score</label>
                <input 
                  type="number" 
                  step="0.1"
                  required
                  min="0"
                  max="100"
                  value={score} 
                  onChange={(e) => setScore(e.target.value)}
                  placeholder="e.g., 85.5"
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors outline-none"
                />
              </div>

              <div className="pt-2 flex space-x-3">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors focus:outline-none"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors focus:outline-none flex justify-center items-center"
                >
                  {isSubmitting ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    'Save Score'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
