import React from 'react';
import type { Contest } from '../types';

interface ContestTabsProps {
  contests: Contest[];
  selectedContest: Contest | null;
  onSelectContest: (contest: Contest) => void;
}

const formatDateRangeForTab = (start: Date, end: Date): string => {
  const startMonth = start.toLocaleDateString('en-US', { month: 'short', timeZone: 'UTC' });
  const startDay = start.getUTCDate();
  
  const endMonth = end.toLocaleDateString('en-US', { month: 'short', timeZone: 'UTC' });
  const endDay = end.getUTCDate();

  if (startMonth === endMonth) {
    return `${startMonth} ${startDay} – ${endDay}`;
  } else {
    return `${startMonth} ${startDay} – ${endMonth} ${endDay}`;
  }
};


export const ContestTabs: React.FC<ContestTabsProps> = ({ contests, selectedContest, onSelectContest }) => {
  return (
    <div className="my-6">
      <div className="border-b border-nr-dark-light">
        <nav className="-mb-px flex space-x-2 sm:space-x-4" aria-label="Tabs">
          {contests.map((contest) => (
            <button
              key={contest.name}
              onClick={() => onSelectContest(contest)}
              className={`${
                contest.name === selectedContest?.name
                  ? 'border-nr-green text-nr-green-accent'
                  : 'border-transparent text-gray-400 hover:text-white hover:border-gray-400'
              } whitespace-nowrap pt-2 pb-3 px-3 border-b-2 font-medium text-center transition-colors focus:outline-none`}
              aria-current={contest.name === selectedContest?.name ? 'page' : undefined}
            >
              <span className="block text-sm">{contest.name}</span>
              <span className="block text-xs text-gray-500">{formatDateRangeForTab(contest.start, contest.end)}</span>
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
};
