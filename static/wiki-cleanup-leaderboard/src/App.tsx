import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Header } from './components/Header';
import { Leaderboard } from './components/Leaderboard';
import { Rules } from './components/Rules';
import { UpdatedPagesList } from './components/UpdatedPagesList';
import { getCompetitionUpdates, getConfig } from './services/confluenceService';
import type { User, PageUpdate, Contest } from './types';
import { ContestTabs } from './components/ContestTabs';

const App: React.FC = () => {
  const [allPageUpdates, setAllPageUpdates] = useState<PageUpdate[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [contests, setContests] = useState<Contest[] | null>(null);
  const [selectedContest, setSelectedContest] = useState<Contest | null>(null);

  const calculateScores = useCallback((updates: PageUpdate[]): User[] => {
    const userScores: { [username: string]: { name: string; score: number; avatar: string } } = {};

    updates.forEach(update => {
      const { user, editCharacterCount, multiplier } = update;
      if (!user.username) return;

      if (!userScores[user.username]) {
        userScores[user.username] = { name: user.name, score: 0, avatar: user.avatar };
      }
      userScores[user.username].score += editCharacterCount * multiplier;
    });

    return Object.entries(userScores)
      .map(([username, data]) => ({ 
        username,
        name: data.name, 
        score: data.score, 
        avatar: data.avatar 
      }))
      .sort((a, b) => b.score - a.score);
  }, []);

  const fetchLeaderboardData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const updates = await getCompetitionUpdates();
      setAllPageUpdates(updates);
    } catch (err) {
      setError('Failed to fetch leaderboard data. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  useEffect(() => {
    const loadInitialData = async () => {
      setIsLoading(true);
      try {
        const config = await getConfig();
        setContests(config.contests);
        
        const now = new Date();
        const currentWeekContest = config.contests.find(c => c.name.startsWith('Week') && now >= c.start && now <= c.end);
        const initialContest = currentWeekContest || config.contests.find(c => c.name === 'Overall') || config.contests[0];
        setSelectedContest(initialContest);
        
        await fetchLeaderboardData();
      } catch (err) {
        setError('Failed to load competition configuration. Please try again.');
        console.error(err);
        setIsLoading(false); // Stop loading on config error
      }
    };

    loadInitialData();
  }, [fetchLeaderboardData]);

  const filteredUpdates = useMemo(() => {
    if (!selectedContest) return [];
    return allPageUpdates.filter(update => {
      const updateDate = new Date(update.timestamp);
      return updateDate >= selectedContest.start && updateDate <= selectedContest.end;
    });
  }, [allPageUpdates, selectedContest]);

  const leaderboardUsers = useMemo(() => {
    return calculateScores(filteredUpdates);
  }, [filteredUpdates, calculateScores]);

  return (
    <div className="min-h-screen bg-nr-dark text-nr-font font-sans p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <Header 
          onRefresh={fetchLeaderboardData} 
          isLoading={isLoading} 
          prize={selectedContest?.prize ?? ''} 
          contests={contests}
        />
        
        {contests && selectedContest ? (
          <ContestTabs 
            contests={contests}
            selectedContest={selectedContest}
            onSelectContest={setSelectedContest}
          />
        ) : (
          <div className="my-6 h-[53px] animate-pulse bg-nr-dark-light/50 rounded-md"></div>
        )}

        {error && (
          <div className="mt-8 bg-rose-900/50 border border-rose-800 text-rose-200 px-4 py-3 rounded-lg" role="alert">
            <p className="font-bold">Error</p>
            <p className="text-sm">{error}</p>
          </div>
        )}

        <main className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <Leaderboard users={leaderboardUsers} updates={filteredUpdates} isLoading={isLoading} />
            <UpdatedPagesList updates={filteredUpdates} isLoading={isLoading} />
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
