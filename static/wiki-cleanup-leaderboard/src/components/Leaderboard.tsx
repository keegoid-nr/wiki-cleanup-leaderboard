
import React from 'react';
import type { User } from '../types';
import { TrophyIcon } from './icons/TrophyIcon';

interface LeaderboardProps {
  users: User[];
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
      <div key={i} className="flex items-center p-3 bg-gray-700/50 rounded-lg">
        <div className="w-8 h-8 rounded-full bg-gray-600 mr-4"></div>
        <div className="flex-grow h-6 bg-gray-600 rounded"></div>
        <div className="w-12 h-6 bg-gray-600 rounded ml-4"></div>
      </div>
    ))}
  </div>
);


export const Leaderboard: React.FC<LeaderboardProps> = ({ users, isLoading }) => {
  return (
    <section className="bg-gray-800 rounded-lg shadow-lg p-6">
      <h2 className="text-xl font-semibold mb-4 text-white">Leaderboard</h2>
      {isLoading ? <LeaderboardSkeleton /> : (
        <div className="space-y-2">
          {users.length > 0 ? (
            users.map((user, index) => (
              <div key={user.name} className="flex items-center p-3 bg-gray-700/50 hover:bg-gray-700 rounded-lg transition-colors duration-200">
                <div className="flex items-center w-12 shrink-0">
                  <span className={`font-bold text-lg ${index < 3 ? 'hidden' : ''}`}>{index + 1}</span>
                  {index < 3 && <TrophyIcon className={`h-6 w-6 ${getRankColor(index)}`} />}
                </div>
                <img src={user.avatar} alt={user.name} className="h-10 w-10 rounded-full mr-4 border-2 border-gray-600" />
                <span className="font-medium flex-grow text-gray-200">{user.name}</span>
                <span className="font-bold text-indigo-400 text-lg">{user.score} pts</span>
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