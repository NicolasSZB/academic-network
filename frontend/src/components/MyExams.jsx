import React, { useState, useEffect } from 'react';
import { Plus, Calendar, BookOpen, Target, CheckCircle, AlertCircle, X } from 'lucide-react';

const MyExams = () => {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal & Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [subject, setSubject] = useState('Math');
  const [score, setScore] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const fetchData = () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    
    fetch('http://localhost:8000/api/mock-exams', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch exams');
        return res.json();
      })
      .then(data => {
        // Map data to include maxScore and a mock date since backend doesn't store dates
        const mappedData = data.map((exam, index) => {
          const date = new Date();
          // Subtract days based on index to create a staggered history timeline
          date.setDate(date.getDate() - (data.length - index));
          
          return {
            id: exam.id,
            subject: exam.subject,
            score: exam.score,
            maxScore: 100,
            date: date.toISOString()
          };
        });
        
        // Sort descending so newest is first
        setExams(mappedData.reverse());
        setLoading(false);
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
    
    // Default user_id 1 for simplicity since the FastAPI model expects it
    const payload = {
      subject: subject,
      score: parseFloat(score),
      user_id: 1 
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
      if (!res.ok) throw new Error('Failed to submit exam');
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
      
      // Refresh the table data
      fetchData();
    })
    .catch(err => {
      console.error(err);
      setIsSubmitting(false);
      alert('Error submitting exam');
    });
  };

  const totalExams = exams.length;
  const passedExams = exams.filter(e => e.score >= 70).length;
  const averageScore = totalExams > 0 ? Math.round(exams.reduce((acc, curr) => acc + curr.score, 0) / totalExams) : 0;

  return (
    <div className="space-y-6 relative">
      
      {/* Toast Notification */}
      {showToast && (
        <div className="fixed top-24 right-8 z-50 flex items-center p-4 space-x-3 text-gray-800 dark:text-white bg-white dark:bg-gray-800 rounded-lg shadow-xl border-l-4 border-green-500 animate-fade-in-down transition-all">
          <CheckCircle className="w-6 h-6 text-green-500" />
          <div className="text-sm font-medium">Exam successfully recorded!</div>
        </div>
      )}

      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Exam History</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">View and analyze your past performance.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-gray-900"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add New Exam
        </button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex items-center space-x-4 transition-colors duration-300">
          <div className="p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total Taken</p>
            <p className="text-xl font-bold text-gray-900 dark:text-white">{totalExams}</p>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex items-center space-x-4 transition-colors duration-300">
          <div className="p-3 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-xl">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Passed</p>
            <p className="text-xl font-bold text-gray-900 dark:text-white">{passedExams}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex items-center space-x-4 transition-colors duration-300">
          <div className="p-3 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-xl">
            <Target className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Average Score</p>
            <p className="text-xl font-bold text-gray-900 dark:text-white">{averageScore}%</p>
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden transition-colors duration-300">
        
        {loading && (
          <div className="flex justify-center items-center p-12">
            <div className="w-10 h-10 border-4 border-indigo-400 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}

        {error && (
          <div className="p-8 text-center text-red-500">
            Failed to load exams: {error}
          </div>
        )}

        {!loading && !error && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-700">
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Subject</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Score</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Performance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {exams.map((exam) => {
                  const isPassing = exam.score >= 70;
                  const barColor = isPassing ? 'bg-green-500' : 'bg-red-500';
                  const textColor = isPassing ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400';
                  const bgColor = isPassing ? 'bg-green-100 dark:bg-green-900/20' : 'bg-red-100 dark:bg-red-900/20';
                  const statusIcon = isPassing ? <CheckCircle className="w-4 h-4 mr-1" /> : <AlertCircle className="w-4 h-4 mr-1" />;

                  return (
                    <tr key={exam.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">{exam.subject}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                          <Calendar className="w-4 h-4 mr-2" />
                          {new Date(exam.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${bgColor} ${textColor}`}>
                          {statusIcon}
                          {exam.score} / {exam.maxScore}
                        </div>
                      </td>
                      <td className="px-6 py-4 min-w-[200px]">
                        <div className="flex items-center">
                          <div className="flex-1 h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full transition-all duration-1000 ${barColor}`} 
                              style={{ width: `${(exam.score / exam.maxScore) * 100}%` }}
                            ></div>
                          </div>
                          <span className={`ml-3 text-sm font-medium ${textColor}`}>
                            {exam.score}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {exams.length === 0 && (
                  <tr>
                    <td colSpan="4" className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                      No exams found. Add one to get started!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Overlay */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm transition-opacity">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all">
            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Record New Exam</h3>
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
                    'Save Exam'
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

export default MyExams;
