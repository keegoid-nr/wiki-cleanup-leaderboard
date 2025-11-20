import React, { useState } from 'react';
import type { User, PageUpdate, Contest } from '../types';
import { TrophyIcon } from './icons/TrophyIcon';
import { ChevronDownIcon } from './icons/ChevronDownIcon';
import { QuestionMarkIcon } from './icons/QuestionMarkIcon';

interface LeaderboardProps {
  users: User[];
  updates: PageUpdate[];
  isLoading: boolean;
  selectedContest: Contest | null;
  week1Users: User[];
  week2Users: User[];
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

const getTrophy = (index: number): React.ReactNode => {
    switch(index) {
        case 0:
            return <TrophyIcon className="h-6 w-6 text-yellow-400" />;
        case 1:
            return <TrophyIcon className="h-6 w-6 text-slate-400" />;
        case 2:
            return <TrophyIcon className="h-6 w-6 text-amber-700" />;
        default:
            return <span className="font-bold text-lg text-gray-400">{index + 1}</span>;
    }
}

const EligibleUserList: React.FC<{ title: string; users: User[] }> = ({ title, users }) => (
    <div>
        <h3 className="text-lg font-semibold text-nr-green-accent mb-2">{title}</h3>
        <ul className="space-y-2">
            {users.length > 0 ? users.slice(0, 10).map((user, index) => (
                <li key={user.username} className="flex items-center bg-nr-dark-light/50 p-2 rounded-md">
                    <span className="text-gray-400 w-8 text-center">{index + 1}.</span>
                    <img src={user.avatar} alt={user.name} className="h-8 w-8 rounded-full mr-3" />
                    <span className="text-nr-font truncate">{user.name}</span>
                </li>
            )) : <p className="text-gray-500">No participants yet for this week.</p>}
        </ul>
    </div>
);


export const Leaderboard: React.FC<LeaderboardProps> = ({ users, updates, isLoading, selectedContest, week1Users, week2Users }) => {
  const [expandedUser, setExpandedUser] = useState<string | null>(null);

  const handleToggle = (username: string) => {
    setExpandedUser(expandedUser === username ? null : username);
  };

  if (isLoading && !selectedContest) {
    return (
        <section className="bg-nr-dark-card rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4 text-white">Competition</h2>
            <LeaderboardSkeleton />
        </section>
    );
  }
  
  if (selectedContest?.name === 'Overall') {
      return (
        <section className="bg-nr-dark-card rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4 text-white">Overall Winner Drawing</h2>
            <div className="bg-nr-dark-light/50 rounded-lg p-6 flex flex-col items-center text-center">
                <div className="bg-nr-dark rounded-full p-4">
                    <QuestionMarkIcon className="h-16 w-16 text-nr-green-accent" />
                </div>
                <h3 className="text-2xl font-bold text-white mt-4">Mystery Winner!</h3>
                <p className="text-gray-300 mt-2 max-w-md">
                    The <strong>$250 grand prize</strong> winner will be randomly drawn from the top 10 editors of Week 1 and Week 2.
                </p>
            </div>

            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                <EligibleUserList title="Week 1 Qualifiers" users={week1Users} />
                <EligibleUserList title="Week 2 Qualifiers" users={week2Users} />
            </div>
        </section>
      )
  }

  return (
    <section className="bg-nr-dark-card rounded-lg shadow-lg p-6">
      <h2 className="text-xl font-semibold mb-4 text-white">Competition</h2>
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
                    {getTrophy(index)}
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
                                <span className="font-mono text-nr-green-accent ml-4 shrink-0 text-right flex items-center justify-end gap-2">
                                    {update.multiplier > 1 && (
                                        <span className="text-xs text-gray-500 whitespace-nowrap">
                                            ({update.editCharacterCount} x{update.multiplier})
                                        </span>
                                    )}
                                    <span>+{Math.round(update.editCharacterCount * update.multiplier)}</span>
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
