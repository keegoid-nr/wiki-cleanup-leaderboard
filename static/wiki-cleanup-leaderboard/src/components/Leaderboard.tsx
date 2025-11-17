import React, { useState } from 'react';
import type { User, PageUpdate } from '../types';
import { TrophyIcon } from './icons/TrophyIcon';
import { ChevronDownIcon } from './icons/ChevronDownIcon';

interface LeaderboardProps {
  users: User[];
  updates: PageUpdate[];
  isLoading: boolean;
}

const LeaderboardSkeleton: React.FC = () => (
  <div className="space-y-3 animate-pulse">
    {[...Array(5)].map((_, i) => (
      <div key={i} className="flex items-center p-3 h-[60px] bg-nr-dark-light/50 rounded-lg">
        <div className="w-8 h-8 rounded-full bg-nr-dark-light mr-4"></div>
        <div className="flex-grow h-6 bg-nr-dark-light rounded"></div>
        <div className="w-12 h-6 bg-nr-dark-light rounded ml-4"></div>
      </div>
    ))}
  </div>
);


export const Leaderboard: React.FC<LeaderboardProps> = ({ users, updates, isLoading }) => {
  const [expandedUser, setExpandedUser] = useState<string | null>(null);

  const handleToggle = (username: string) => {
    setExpandedUser(expandedUser === username ? null : username);
  };

  return (
    <section className="bg-nr-dark-card rounded-lg shadow-lg p-6">
      <h2 className="text-xl font-semibold mb-4 text-white">Leaderboard</h2>
      {isLoading ? <LeaderboardSkeleton /> : (
        <div className="space-y-2">
          {users.length > 0 ? (
            users.slice(0, 10).map((user, index) => (
              <div key={user.username} className="bg-nr-dark-light/50 rounded-lg transition-colors duration-200 hover:bg-nr-dark-light">
                <div 
                  onClick={() => handleToggle(user.username)}
                  className="flex items-center p-3 cursor-pointer"
                  aria-expanded={expandedUser === user.username}
                  aria-controls={`details-${user.username}`}
                >
                  <div className="flex items-center justify-center w-12 shrink-0">
                    {index === 0 ? (
                        <TrophyIcon className="h-6 w-6 text-nr-green-accent" />
                    ) : (
                        <span className="font-bold text-lg text-gray-400">{index + 1}</span>
                    )}
                  </div>
                  <img src={user.avatar} alt={user.name} className="h-10 w-10 rounded-full mr-4 border-2 border-gray-600" />
                  <span className="font-medium flex-grow text-nr-font">{user.name}</span>
                  <span className="font-bold text-nr-green-accent text-lg mr-4">{Math.round(user.score)} pts</span>
                  <ChevronDownIcon className={`h-5 w-5 text-gray-400 transform transition-transform duration-200 ${expandedUser === user.username ? 'rotate-180' : ''}`} />
                </div>
                
                <div 
                  id={`details-${user.username}`}
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${expandedUser === user.username ? 'max-h-96' : 'max-h-0'}`}
                >
                  <div className="pl-16 pr-4 pb-3">
                    <ul className="space-y-2 text-sm border-l-2 border-nr-dark-light pl-4">
                      {updates
                        .filter(update => update.user.username === user.username)
                        .map(update => (
                          <li key={update.id} className="flex justify-between items-center text-gray-400">
                            <div className="flex items-center truncate">
                                <a href={update.pageUrl} target="_blank" rel="noopener noreferrer" className="truncate hover:underline hover:text-nr-green-accent" title={update.pageTitle}>
                                {update.pageTitle}
                                </a>
                                {update.multiplier > 1 && (
                                    <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-bold ${
                                        update.bonusType === 'Critical Content Blitz' ? 'bg-rose-500/30 text-rose-300' : 'bg-teal-500/30 text-teal-300'
                                    }`}>
                                        x{update.multiplier}
                                    </span>
                                )}
                            </div>
                            <span className="font-mono text-nr-green-accent ml-4 shrink-0">
                                +{Math.round(update.editCharacterCount * update.multiplier)}
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
              <p>No updates found for this period yet.</p>
              <p>Be the first to make an edit!</p>
            </div>
          )}
        </div>
      )}
    </section>
  );
};
