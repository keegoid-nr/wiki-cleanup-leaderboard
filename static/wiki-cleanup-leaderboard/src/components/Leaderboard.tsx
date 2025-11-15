import React, { useState } from 'react';
import type { User, PageUpdate } from '../types';
import { TrophyIcon } from './icons/TrophyIcon';
import { ChevronDownIcon } from './icons/ChevronDownIcon';

interface LeaderboardProps {
  users: User[];
  updates: PageUpdate[];
  isLoading: boolean;
}

const getRankColor = (rank: number): string => {
  switch (rank) {
    case 0: return 'text-yellow-400';
    case 1: return 'text-gray-300';
    case 2: return 'text-yellow-600';
    default: return 'text-gray-500';
  }
};

const LeaderboardSkeleton: React.FC = () => (
  <div className="space-y-3 animate-pulse">
    {[...Array(5)].map((_, i) => (
      <div key={i} className="flex items-center p-3 h-[60px] bg-gray-700/50 rounded-lg">
        <div className="w-8 h-8 rounded-full bg-gray-600 mr-4"></div>
        <div className="flex-grow h-6 bg-gray-600 rounded"></div>
        <div className="w-12 h-6 bg-gray-600 rounded ml-4"></div>
      </div>
    ))}
  </div>
);


export const Leaderboard: React.FC<LeaderboardProps> = ({ users, updates, isLoading }) => {
  const [expandedUser, setExpandedUser] = useState<string | null>(null);

  const handleToggle = (userName: string) => {
    setExpandedUser(expandedUser === userName ? null : userName);
  };

  return (
    <section className="bg-gray-800 rounded-lg shadow-lg p-6">
      <h2 className="text-xl font-semibold mb-4 text-white">Leaderboard</h2>
      {isLoading ? <LeaderboardSkeleton /> : (
        <div className="space-y-2">
          {users.length > 0 ? (
            users.slice(0, 10).map((user, index) => (
              <div key={user.name} className="bg-gray-700/50 rounded-lg transition-colors duration-200 hover:bg-gray-700">
                <div 
                  onClick={() => handleToggle(user.name)}
                  className="flex items-center p-3 cursor-pointer"
                  aria-expanded={expandedUser === user.name}
                  aria-controls={`details-${user.name}`}
                >
                  <div className="flex items-center w-12 shrink-0">
                    <span className={`font-bold text-lg ${index < 3 ? 'hidden' : ''}`}>{index + 1}</span>
                    {index < 3 && <TrophyIcon className={`h-6 w-6 ${getRankColor(index)}`} />}
                  </div>
                  <img src={user.avatar} alt={user.name} className="h-10 w-10 rounded-full mr-4 border-2 border-gray-600" />
                  <span className="font-medium flex-grow text-gray-200">{user.name}</span>
                  <span className="font-bold text-indigo-400 text-lg mr-4">{Math.round(user.score)} pts</span>
                  <ChevronDownIcon className={`h-5 w-5 text-gray-400 transform transition-transform duration-200 ${expandedUser === user.name ? 'rotate-180' : ''}`} />
                </div>
                
                <div 
                  id={`details-${user.name}`}
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${expandedUser === user.name ? 'max-h-96' : 'max-h-0'}`}
                >
                  <div className="pl-16 pr-4 pb-3">
                    <ul className="space-y-2 text-sm border-l-2 border-gray-600 pl-4">
                      {updates
                        .filter(update => update.user.name === user.name)
                        .map(update => (
                          <li key={update.id} className="flex justify-between items-center text-gray-400">
                            <div className="flex items-center truncate">
                                <a href={update.pageUrl} target="_blank" rel="noopener noreferrer" className="truncate hover:underline hover:text-indigo-400" title={update.pageTitle}>
                                {update.pageTitle}
                                </a>
                                {update.multiplier > 1 && (
                                    <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-bold ${
                                        update.bonusType === 'Critical Content Blitz' ? 'bg-red-500/30 text-red-300' : 'bg-green-500/30 text-green-300'
                                    }`}>
                                        x{update.multiplier}
                                    </span>
                                )}
                            </div>
                            <span className="font-mono text-indigo-400 ml-4 shrink-0">
                                +{update.editCharacterCount * update.multiplier}
                                {update.multiplier > 1 && <span className="text-xs text-gray-400"> ({update.editCharacterCount} &times; {update.multiplier})</span>}
                            </span>
                          </li>
                        ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-400">
              <p>No updates found for today yet.</p>
              <p>Be the first to make an edit!</p>
            </div>
          )}
        </div>
      )}
    </section>
  );
};
