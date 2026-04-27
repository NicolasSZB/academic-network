import React from 'react';
import { MessageSquare, Bell, Star, FileText } from 'lucide-react';

const mockActivities = [
  { id: 1, type: 'post', user: 'Dr. Smith', text: 'Posted a new study guide for the upcoming Sciences mock exam.', time: '2 hours ago', icon: FileText, color: 'text-blue-500', bg: 'bg-blue-100 dark:bg-blue-900/30' },
  { id: 2, type: 'alert', user: 'System', text: 'Your Math score (85) was above the target cutoff! Keep it up.', time: '5 hours ago', icon: Star, color: 'text-yellow-500', bg: 'bg-yellow-100 dark:bg-yellow-900/30' },
  { id: 3, type: 'forum', user: 'Alice Johnson', text: 'Does anyone have notes from the last Humanities lecture?', time: '1 day ago', icon: MessageSquare, color: 'text-green-500', bg: 'bg-green-100 dark:bg-green-900/30' },
  { id: 4, type: 'alert', user: 'Admin', text: 'Reminder: Language mock exams are scheduled for next Friday.', time: '2 days ago', icon: Bell, color: 'text-red-500', bg: 'bg-red-100 dark:bg-red-900/30' }
];

const ActivityFeed = () => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden transition-colors duration-300">
      <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Activity Feed</h3>
      </div>
      <div className="p-6">
        <ul className="space-y-6">
          {mockActivities.map((activity) => {
            const Icon = activity.icon;
            return (
              <li key={activity.id} className="flex space-x-4">
                <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${activity.bg}`}>
                  <Icon className={`w-5 h-5 ${activity.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {activity.user}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {activity.text}
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                    {activity.time}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};

export default ActivityFeed;
