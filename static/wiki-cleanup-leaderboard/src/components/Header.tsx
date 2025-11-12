
import React from 'react';
import { RefreshIcon } from './icons/RefreshIcon';
import { TrophyIcon } from './icons/TrophyIcon';

interface HeaderProps {
  onRefresh: () => void;
  isLoading: boolean;
}

export const Header: React.FC<HeaderProps> = ({ onRefresh, isLoading }) => {
  return (
    <header className="flex flex-col sm:flex-row items-center justify-between pb-4 border-b-2 border-gray-700">
      <div className="flex items-center space-x-3 mb-4 sm:mb-0">
        <TrophyIcon className="h-8 w-8 text-yellow-400" />
        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
          GTS Wiki Cleanup Competition
        </h1>
      </div>
      <button
        onClick={onRefresh}
        disabled={isLoading}
        className="flex items-center justify-center px-4 py-2 bg-indigo-600 text-white rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-indigo-500 disabled:bg-indigo-400 disabled:cursor-not-allowed transition-colors duration-200"
      >
        <RefreshIcon className={`h-5 w-5 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
        <span>{isLoading ? 'Refreshing...' : 'Refresh'}</span>
      </button>
    </header>
  );
};