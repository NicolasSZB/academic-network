import React, { useState, useEffect } from 'react';
import { MessageSquare, ThumbsUp, Clock, Hash, Plus, X, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const topics = ['All Topics', 'Logic', 'Programming', 'Admissions'];

// Helper to generate consistent mock avatar colors
const getAvatarColor = (id) => {
  const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-red-500', 'bg-indigo-500'];
  return colors[id % colors.length];
};

const ClassForum = () => {
  const [threads, setThreads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTopic, setActiveTopic] = useState('All Topics');
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showToast, setShowToast] = useState(false);
  
  const navigate = useNavigate();

  const fetchThreads = () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    
    fetch('http://localhost:8000/api/forum/threads', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
      .then(res => {
        if (!res.ok) {
          console.error(`GET /api/forum/threads Failed - HTTP Status: ${res.status} ${res.statusText}`);
          if (res.status === 401) {
            navigate('/login');
          }
          throw new Error('Failed to fetch threads');
        }
        return res.json();
      })
      .then(data => {
        // Map backend data to UI format, filling in mock data for missing fields
        const mappedData = data.map(thread => ({
          id: thread.id,
          title: thread.title,
          snippet: thread.content,
          timestamp: new Date(thread.created_at).toLocaleDateString() + ' ' + new Date(thread.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
          author: `User ${thread.author_id}`, // Mock author name
          avatarInitials: `U${thread.author_id}`,
          upvotes: Math.floor(Math.random() * 20), // Mock interactions
          comments: Math.floor(Math.random() * 10),
          tag: topics[(thread.id % (topics.length - 1)) + 1], // Random tag from topics
          color: getAvatarColor(thread.author_id)
        }));
        setThreads(mappedData);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchThreads();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const payload = {
      title,
      content
    };

    const token = localStorage.getItem('token');

    fetch('http://localhost:8000/api/forum/threads', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    })
    .then(res => {
      if (!res.ok) {
        console.error(`POST /api/forum/threads Failed - HTTP Status: ${res.status} ${res.statusText}`);
        if (res.status === 401) {
          navigate('/login');
        }
        throw new Error('Failed to submit thread');
      }
      return res.json();
    })
    .then(() => {
      setIsSubmitting(false);
      setIsModalOpen(false);
      setTitle('');
      setContent('');
      
      // Trigger toast
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
      
      // Refresh data
      fetchThreads();
    })
    .catch(err => {
      console.error(err);
      setIsSubmitting(false);
      alert('Error creating thread');
    });
  };

  const filteredThreads = activeTopic === 'All Topics' 
    ? threads 
    : threads.filter(t => t.tag === activeTopic);

  return (
    <div className="flex flex-col lg:flex-row gap-8 relative">
      
      {/* Toast Notification */}
      {showToast && (
        <div className="fixed top-24 right-8 z-50 flex items-center p-4 space-x-3 text-gray-800 dark:text-white bg-white dark:bg-gray-800 rounded-lg shadow-xl border-l-4 border-green-500 animate-fade-in-down transition-all">
          <CheckCircle className="w-6 h-6 text-green-500" />
          <div className="text-sm font-medium">Discussion created successfully!</div>
        </div>
      )}

      {/* Secondary Left Sidebar */}
      <div className="w-full lg:w-64 flex-shrink-0">
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-4 transition-colors duration-300 sticky top-6">
          <button 
            onClick={() => setIsModalOpen(true)}
            className="w-full mb-6 flex items-center justify-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-gray-900"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Thread
          </button>
          
          <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3 px-2">
            Categories
          </h3>
          <ul className="space-y-1">
            {topics.map(topic => (
              <li key={topic}>
                <button
                  onClick={() => setActiveTopic(topic)}
                  className={`w-full text-left flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeTopic === topic
                      ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  <Hash className="w-4 h-4 mr-3 opacity-70" />
                  {topic}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Main Forum Area */}
      <div className="flex-1 space-y-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white transition-colors">
            {activeTopic} Discussions
          </h2>
          <span className="text-sm font-medium text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 px-3 py-1 rounded-full border border-gray-100 dark:border-gray-700 shadow-sm">
            {filteredThreads.length} threads
          </span>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-16">
            <div className="w-10 h-10 border-4 border-indigo-400 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : error ? (
          <div className="text-center py-12 text-red-500 font-medium bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
            Error: {error}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredThreads.length > 0 ? (
              filteredThreads.map(thread => (
                <div key={thread.id} className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer group">
                  <div className="flex items-start gap-4">
                    {/* Avatar Placeholder */}
                    <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-sm ${thread.color}`}>
                      {thread.avatarInitials}
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium text-gray-900 dark:text-white">{thread.author}</span>
                          <span className="text-gray-300 dark:text-gray-600">•</span>
                          <span className="inline-flex items-center text-xs text-gray-500 dark:text-gray-400">
                            <Clock className="w-3 h-3 mr-1" />
                            {thread.timestamp}
                          </span>
                        </div>
                        <span className="hidden sm:inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                          {thread.tag}
                        </span>
                      </div>
                      
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        {thread.title}
                      </h3>
                      
                      <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-4 leading-relaxed pr-4 whitespace-pre-wrap">
                        {thread.snippet}
                      </p>
                      
                      {/* Interactions */}
                      <div className="flex items-center space-x-6">
                        <button className="flex items-center text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400 transition-colors text-sm font-medium focus:outline-none">
                          <ThumbsUp className="w-4 h-4 mr-1.5" />
                          {thread.upvotes}
                        </button>
                        <button className="flex items-center text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400 transition-colors text-sm font-medium focus:outline-none">
                          <MessageSquare className="w-4 h-4 mr-1.5" />
                          {thread.comments}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm transition-colors duration-300">
                <MessageSquare className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400 font-medium">No discussions found in this category.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal Overlay */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm transition-opacity">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden transform transition-all">
            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Start New Discussion</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 focus:outline-none">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label>
                <input 
                  type="text" 
                  required
                  value={title} 
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="What's on your mind?"
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors outline-none"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Content</label>
                <textarea 
                  required
                  rows="6"
                  value={content} 
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Share details or ask a question..."
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors outline-none resize-none"
                ></textarea>
              </div>

              <div className="pt-4 flex space-x-3 justify-end border-t border-gray-100 dark:border-gray-700">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors focus:outline-none"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors focus:outline-none flex justify-center items-center min-w-[120px]"
                >
                  {isSubmitting ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    'Post Thread'
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

export default ClassForum;
