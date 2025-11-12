import React from 'react';
import type { PageUpdate } from '../types';

interface UpdatedPagesListProps {
  updates: PageUpdate[];
  isLoading: boolean;
}

const UpdatedPageSkeleton: React.FC = () => (
    <div className="flex items-start space-x-4 p-3 animate-pulse">
        <div className="w-10 h-10 rounded-full bg-gray-600 shrink-0"></div>
        <div className="flex-grow space-y-2">
            <div className="h-5 bg-gray-600 rounded w-3/4"></div>
            <div className="h-4 bg-gray-600 rounded w-1/2"></div>
        </div>
    </div>
)

export const UpdatedPagesList: React.FC<UpdatedPagesListProps> = ({ updates, isLoading }) => {
  return (
    <section className="bg-gray-800 rounded-lg shadow-lg p-6">
      <h2 className="text-xl font-semibold mb-4 text-white">Competition Updates</h2>
      <div className="max-h-[600px] overflow-y-auto pr-2">
        {isLoading ? (
            <div className="space-y-2">
                {[...Array(7)].map((_, i) => <UpdatedPageSkeleton key={i} />)}
            </div>
        ) : (
          <ul className="divide-y divide-gray-700">
            {updates.length > 0 ? (
                updates.map(update => (
                <li key={update.id} className={`py-4 flex items-start space-x-4 transition-opacity ${update.editCharacterCount < 10 ? 'opacity-60' : ''}`}>
                    <img src={update.user.avatar} alt={update.user.name} className="h-10 w-10 rounded-full mt-1" />
                    <div className="flex-grow">
                        <a href={update.pageUrl} target="_blank" rel="noopener noreferrer" className="font-semibold text-gray-200 hover:text-indigo-400 hover:underline">
                            {update.pageTitle}
                        </a>
                        <p className="text-sm text-gray-400">Updated by {update.user.name} &bull; {update.editCharacterCount} char change</p>
                        <div className="mt-2 flex flex-wrap gap-2 items-center">
                             {update.editCharacterCount < 10 && (
                                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-yellow-900 text-yellow-300">
                                    Below Minimum
                                </span>
                            )}
                        </div>
                    </div>
                </li>
                ))
            ) : (
                <div className="text-center py-8 text-gray-400">
                    <p>No activity to show.</p>
                </div>
            )}
          </ul>
        )}
      </div>
    </section>
  );
};
