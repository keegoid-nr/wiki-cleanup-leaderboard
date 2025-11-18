import React from 'react';
import { RefreshIcon } from './icons/RefreshIcon';
import { NewRelicLogo } from './icons/NewRelicLogo';
import type { Contest } from '../types';

interface HeaderProps {
  onRefresh: () => void;
  isLoading: boolean;
  prize: string;
  contests: Contest[] | null;
}

const formatDateRange = (start: Date, end: Date): string => {
  const options: Intl.DateTimeFormatOptions = { 
    month: 'short', 
    day: 'numeric', 
    timeZone: 'UTC' 
  };
  
  const startStr = start.toLocaleDateString('en-US', options);
  const endStr = end.toLocaleDateString('en-US', { 
    ...options, 
    year: 'numeric' 
  });
  
  return `${startStr} – ${endStr}`;
};

export const Header: React.FC<HeaderProps> = ({ onRefresh, isLoading, prize, contests }) => {
  const overallContest = contests?.find(c => c.name === 'Overall');

  return (
    <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b-2 border-nr-dark-light">
      <div className="flex items-center space-x-4">
        <NewRelicLogo className="h-10 w-10 text-nr-green shrink-0" />
        <div>
            <h2 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">Global Technical Support</h2>
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight -mt-1">
                Wiki Cleanup Competition
            </h1>
            <div className="mt-1.5 space-y-1">
              {overallContest && (
                <p className="text-sm text-gray-400">
                  {formatDateRange(overallContest.start, overallContest.end)}
                </p>
              )}
              {prize && <p className="text-sm text-nr-green-accent font-semibold">{prize}<sup>*</sup></p>}
            </div>
        </div>
      </div>
      <button
        onClick={onRefresh}
        disabled={isLoading}
        className="flex items-center justify-center px-4 py-2 bg-nr-green text-nr-dark font-bold rounded-md shadow-sm hover:bg-nr-green-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-nr-dark focus:ring-nr-green-accent disabled:bg-nr-green/50 disabled:cursor-not-allowed transition-colors duration-200 mt-4 sm:mt-0 self-end sm:self-center"
      >
        <RefreshIcon className={`h-5 w-5 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
        <span>{isLoading ? 'Refreshing...' : 'Refresh'}</span>
      </button>
    </header>
  );
};
