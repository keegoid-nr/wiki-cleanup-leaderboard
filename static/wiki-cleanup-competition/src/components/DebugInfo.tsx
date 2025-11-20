import React, { useState } from 'react';
import { BonusSession } from '../types';

interface DebugInfoProps {
  isProduction: boolean;
  bonusSessions: BonusSession[];
}

export const DebugInfo: React.FC<DebugInfoProps> = ({ isProduction, bonusSessions }) => {
  const [isOpen, setIsOpen] = useState(false);

  if (isProduction) {
    return null;
  }

  return (
    <div className="my-6 bg-yellow-900/30 border border-yellow-800 rounded-lg">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center p-3 text-left"
      >
        <div className="flex items-center">
          <span className="text-yellow-400 font-bold">Debug Info</span>
          <span className="ml-2 text-xs bg-yellow-800 text-yellow-300 px-2 py-0.5 rounded-full">
            Dev/Sandbox Only
          </span>
        </div>
        <span className="text-yellow-400 transform transition-transform">
          {isOpen ? '▲' : '▼'}
        </span>
      </button>
      {isOpen && (
        <div className="p-4 border-t border-yellow-800">
          <h3 className="font-semibold text-white">Focused Flow Bonus Sessions</h3>
          <p className="text-sm text-gray-400 mb-2">
            Found {bonusSessions.length} unique user sessions from the Google Sheet.
          </p>
          <div className="max-h-60 overflow-y-auto bg-nr-dark rounded-md">
            <table className="w-full text-sm text-left text-gray-300">
              <thead className="text-xs text-gray-400 uppercase bg-nr-dark-light/50 sticky top-0">
                <tr>
                  <th scope="col" className="px-4 py-2">User</th>
                  <th scope="col" className="px-4 py-2">Start Time (UTC)</th>
                  <th scope="col" className="px-4 py-2">End Time (UTC)</th>
                </tr>
              </thead>
              <tbody>
                {bonusSessions.length > 0 ? (
                  bonusSessions.map((session, index) => (
                    <tr key={`${session.user}-${index}`} className="border-b border-nr-dark-light/50">
                      <td className="px-4 py-2 font-mono">{session.user}</td>
                      <td className="px-4 py-2 font-mono">{session.startTime.toISOString()}</td>
                      <td className="px-4 py-2 font-mono">{session.endTime.toISOString()}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="text-center py-4">No sessions found or failed to parse.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
