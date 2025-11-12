
import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { Leaderboard } from './components/Leaderboard';
import { Rules } from './components/Rules';
import { UpdatedPagesList } from './components/UpdatedPagesList';
import { getTodaysUpdates } from './services/confluenceService';
import type { User, PageUpdate, BonusType } from './types';

const App: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [pageUpdates, setPageUpdates] = useState<PageUpdate[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const calculateScores = useCallback((updates: PageUpdate[]): User[] => {
    const userScores: { [key: string]: { score: number; avatar: string } } = {};

    updates.forEach(update => {
      if (!userScores[update.user.name]) {
        userScores[update.user.name] = { score: 0, avatar: update.user.avatar };
      }

      let points = 1;
      if (update.bonusType === 'FOCUSED_FLOW') {
        points = 2;
      } else if (update.bonusType === 'CRITICAL_BLITZ') {
        points = 3;
      }

      userScores[update.user.name].score += points;
    });

    return Object.entries(userScores)
      .map(([name, data]) => ({ name, score: data.score, avatar: data.avatar }))
      .sort((a, b) => b.score - a.score);
  }, []);

  const fetchLeaderboardData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const updates = await getTodaysUpdates();
      const qualifyingUpdates = updates.filter(update => update.editCharacterCount >= 10);
      const scoredUsers = calculateScores(qualifyingUpdates);
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

        <main className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <Leaderboard users={users} isLoading={isLoading} />
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
