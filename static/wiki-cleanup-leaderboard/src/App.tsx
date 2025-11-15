import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { Leaderboard } from './components/Leaderboard';
import { Rules } from './components/Rules';
import { UpdatedPagesList } from './components/UpdatedPagesList';
import { getCompetitionUpdates } from './services/confluenceService';
import type { User, PageUpdate } from './types';

const App: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [pageUpdates, setPageUpdates] = useState<PageUpdate[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const calculateScores = useCallback((updates: PageUpdate[]): User[] => {
    const userScores: { [key: string]: { score: number; avatar: string } } = {};

    updates.forEach(update => {
      const { user, editCharacterCount, multiplier } = update;
      if (!userScores[user.name]) {
        userScores[user.name] = { score: 0, avatar: user.avatar };
      }
      userScores[user.name].score += editCharacterCount * multiplier;
    });

    return Object.entries(userScores)
      .map(([name, data]) => ({ name, score: data.score, avatar: data.avatar }))
      .sort((a, b) => b.score - a.score);
  }, []);

  const fetchLeaderboardData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const updates = await getCompetitionUpdates();
      const scoredUsers = calculateScores(updates);
      setPageUpdates(updates);
      setUsers(scoredUsers);
    } catch (err) {
      setError('Failed to fetch leaderboard data. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [calculateScores]);

  useEffect(() => {
    fetchLeaderboardData();
  }, [fetchLeaderboardData]);

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 font-sans p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <Header onRefresh={fetchLeaderboardData} isLoading={isLoading} />

        {error && (
          <div className="mt-8 bg-red-800/50 border border-red-600 text-red-200 px-4 py-3 rounded-lg" role="alert">
            <p className="font-bold">Error</p>
            <p className="text-sm">{error}</p>
          </div>
        )}

        <main className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <Leaderboard users={users} updates={pageUpdates} isLoading={isLoading} />
            <UpdatedPagesList updates={pageUpdates} isLoading={isLoading} />
          </div>

          <div className="lg:col-span-1">
            <Rules />
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;
