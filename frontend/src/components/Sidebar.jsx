import React from 'react';
import { LayoutDashboard, FileText, MessageSquare } from 'lucide-react';

const Sidebar = ({ isOpen }) => {
  return (
    <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 transition-transform duration-300 ease-in-out transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0`}>
      <div className="flex items-center justify-center h-16 border-b border-gray-200 dark:border-gray-800">
        <h1 className="text-xl font-bold text-indigo-600 dark:text-indigo-400">AcademicNet</h1>
      </div>
      <div className="overflow-y-auto overflow-x-hidden flex-grow h-full">
        <ul className="flex flex-col py-4 space-y-1">
          <li className="px-5 mt-4">
            <div className="flex flex-row items-center h-8">
              <div className="text-xs font-light tracking-wide text-gray-400 uppercase">Menu</div>
            </div>
          </li>
          <li>
            <a href="#" className="relative flex flex-row items-center h-11 focus:outline-none hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 border-l-4 border-transparent hover:border-indigo-500 pr-6">
              <span className="inline-flex justify-center items-center ml-4">
                <LayoutDashboard className="w-5 h-5" />
              </span>
              <span className="ml-2 text-sm tracking-wide truncate">Dashboard</span>
            </a>
          </li>
          <li>
            <a href="#" className="relative flex flex-row items-center h-11 focus:outline-none hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 border-l-4 border-transparent hover:border-indigo-500 pr-6">
              <span className="inline-flex justify-center items-center ml-4">
                <FileText className="w-5 h-5" />
              </span>
              <span className="ml-2 text-sm tracking-wide truncate">My Exams</span>
            </a>
          </li>
          <li>
            <a href="#" className="relative flex flex-row items-center h-11 focus:outline-none hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 border-l-4 border-transparent hover:border-indigo-500 pr-6">
              <span className="inline-flex justify-center items-center ml-4">
                <MessageSquare className="w-5 h-5" />
              </span>
              <span className="ml-2 text-sm tracking-wide truncate">Class Forum</span>
            </a>
          </li>
        </ul>
      </div>
    </aside>
  );
};

export default Sidebar;
