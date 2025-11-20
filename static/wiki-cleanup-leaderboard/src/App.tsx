import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Header } from './components/Header';
import { Leaderboard } from './components/Leaderboard';
import { Rules } from './components/Rules';
import { UpdatedPagesList } from './components/UpdatedPagesList';
import { getCompetitionUpdates, getConfig, getBonusSessionsData, isProductionEnvironment } from './services/confluenceService';
import type { User, PageUpdate, Contest, BonusSession } from './types';
import { ContestTabs } from './components/ContestTabs';
import { Footer } from './components/Footer';
import { DebugInfo } from './components/DebugInfo';

const App: React.FC = () => {
  const [allPageUpdates, setAllPageUpdates] = useState<PageUpdate[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [contests, setContests] = useState<Contest[] | null>(null);
  const [selectedContest, setSelectedContest] = useState<Contest | null>(null);
  const [bonusSessions, setBonusSessions] = useState<BonusSession[]>([]);
  const [isProduction, setIsProduction] = useState(true);

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
      const [updates, sessions, isProdEnv] = await Promise.all([
        getCompetitionUpdates(),
        getBonusSessionsData(),
        isProductionEnvironment()
      ]);
      setAllPageUpdates(updates);
      setBonusSessions(sessions);
      setIsProduction(isProdEnv);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setError(`Failed to fetch leaderboard data. Details: ${message}`);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  useEffect(() => {
    const loadInitialData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const config = await getConfig();
        setContests(config.contests);
        
        const now = new Date();
        const currentWeekContest = config.contests.find(c => c.name.startsWith('Week') && now >= c.start && now <= c.end);
        const initialContest = currentWeekContest || config.contests.find(c => c.name === 'Overall') || config.contests[0];
        setSelectedContest(initialContest);
        
        await fetchLeaderboardData();
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        setError(`Failed to load competition configuration. Details: ${message}`);
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

  const week1Contest = useMemo(() => contests?.find(c => c.name === 'Week 1'), [contests]);
  const week2Contest = useMemo(() => contests?.find(c => c.name === 'Week 2'), [contests]);

  const week1Users = useMemo(() => {
    if (!week1Contest) return [];
    const updates = allPageUpdates.filter(update => {
      const updateDate = new Date(update.timestamp);
      return updateDate >= week1Contest.start && updateDate <= week1Contest.end;
    });
    return calculateScores(updates);
  }, [allPageUpdates, week1Contest, calculateScores]);

  const week2Users = useMemo(() => {
    if (!week2Contest) return [];
    const updates = allPageUpdates.filter(update => {
      const updateDate = new Date(update.timestamp);
      return updateDate >= week2Contest.start && updateDate <= week2Contest.end;
    });
    return calculateScores(updates);
  }, [allPageUpdates, week2Contest, calculateScores]);

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
          <div className="mt-8 bg-rose-900/50 border border-rose-800 text-rose-200 px-4 py-3 rounded-lg flex items-center justify-between" role="alert">
            <div>
              <p className="font-bold">Error</p>
              <p className="text-sm">{error}</p>
              {error.includes("App ID") && (
                  <div className="mt-2 text-xs bg-rose-950/50 p-2 rounded border border-rose-800/50">
                      <strong>Suggestion:</strong> Check your <code>manifest.yml</code> and ensure the <code>app.id</code> matches your current Forge app. You may need to run <code>forge register</code> or update the ID manually if you recreated the app.
                  </div>
              )}
            </div>
            <button
              onClick={fetchLeaderboardData}
              className="ml-4 px-3 py-1 bg-rose-800 text-white font-bold rounded-md hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-rose-900/50 focus:ring-rose-500 transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        <DebugInfo isProduction={isProduction} bonusSessions={bonusSessions} />

        <main className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <Leaderboard 
              users={leaderboardUsers} 
              updates={filteredUpdates} 
              isLoading={isLoading} 
              selectedContest={selectedContest}
              week1Users={week1Users}
              week2Users={week2Users}
            />
            <UpdatedPagesList updates={filteredUpdates} isLoading={isLoading} />
          </div>

          <div className="lg:col-span-1">
            <Rules />
          </div>
        </main>
        
        <Footer />
      </div>
    </div>
  );
};

export default App;
