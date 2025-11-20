import React from 'react';
import type { PageUpdate } from '../types';

interface UpdatedPagesListProps {
  updates: PageUpdate[];
  isLoading: boolean;
}

const formatTimestamp = (isoString: string): string => {
  return new Date(isoString).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
};

const UpdatedPageSkeleton: React.FC = () => (
    <div className="flex items-start space-x-4 p-3 animate-pulse">
        <div className="w-10 h-10 rounded-full bg-nr-dark-light shrink-0"></div>
        <div className="flex-grow space-y-2">
            <div className="h-5 bg-nr-dark-light rounded w-3/4"></div>
            <div className="h-4 bg-nr-dark-light rounded w-1/2"></div>
        </div>
    </div>
)

export const UpdatedPagesList: React.FC<UpdatedPagesListProps> = ({ updates, isLoading }) => {
  return (
    <section className="bg-nr-dark-card rounded-lg shadow-lg p-6">
      <h2 className="text-xl font-semibold mb-4 text-white">Competition Updates</h2>
      <div className="max-h-[600px] overflow-y-auto pr-2">
        {isLoading ? (
            <div className="space-y-2">
                {[...Array(7)].map((_, i) => <UpdatedPageSkeleton key={i} />)}
            </div>
        ) : (
          <ul className="divide-y divide-nr-dark-light">
            {updates.length > 0 ? (
                updates.map(update => (
                <li key={update.id} className="py-4 flex items-start space-x-4">
                    <img src={update.user.avatar} alt={update.user.name} className="h-10 w-10 rounded-full mt-1" />
                    <div className="flex-grow">
                        <a href={update.pageUrl} target="_blank" rel="noopener noreferrer" className="font-semibold text-nr-font hover:text-nr-green-accent hover:underline">
                            {update.pageTitle}
                        </a>
                        <p className="text-sm text-gray-400 flex items-center flex-wrap">
                           <span>Updated by <strong>{update.user.name}</strong></span>
                            <span className="mx-1.5">&bull;</span>
                            <span>{formatTimestamp(update.timestamp)}</span>
                            <span className="mx-1.5">&bull;</span>
                            <span>{update.editCharacterCount} {update.editCharacterCount === 1 ? 'point' : 'points'}</span>
                            {update.multiplier > 1 && (
                                <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-bold ${
                                    update.bonusType === 'Critical Content Blitz' ? 'bg-rose-500/30 text-rose-300' : 'bg-teal-500/30 text-teal-300'
                                }`}>
                                    x{update.multiplier}
                                </span>
                            )}
                        </p>
                    </div>
                </li>
                ))
            ) : (
                <div className="text-center py-8 text-gray-400">
                    <p>No activity to show for this period.</p>
                </div>
            )}
          </ul>
        )}
      </div>
    </section>
  );
};
