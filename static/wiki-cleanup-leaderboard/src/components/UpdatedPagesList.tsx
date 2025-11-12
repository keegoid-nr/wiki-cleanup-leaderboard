
import React from 'react';
import type { PageUpdate, BonusType } from '../types';

interface UpdatedPagesListProps {
  updates: PageUpdate[];
  isLoading: boolean;
}

const getBonusTagClass = (bonusType: BonusType) => {
  switch(bonusType) {
    case 'FOCUSED_FLOW':
      return 'bg-blue-500 text-white';
    case 'CRITICAL_BLITZ':
      return 'bg-red-500 text-white';
    default:
      return '';
  }
}

const getEditTypeTagClass = (editType: string) => {
    switch(editType) {
        case 'Typo Fix': return 'bg-green-200 text-green-800';
        case 'Link Update': return 'bg-yellow-200 text-yellow-800';
        case 'Formatting': return 'bg-purple-200 text-purple-800';
        case 'Minor Content': return 'bg-pink-200 text-pink-800';
        default: return 'bg-gray-200 text-gray-800';
    }
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
      <h2 className="text-xl font-semibold mb-4 text-white">Today's Updates</h2>
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
                        <p className="font-semibold text-gray-200">{update.pageTitle}</p>
                        <p className="text-sm text-gray-400">Updated by {update.user.name} &bull; {update.editCharacterCount} chars</p>
                        <div className="mt-2 flex flex-wrap gap-2 items-center">
                            <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${getEditTypeTagClass(update.editType)}`}>
                                {update.editType}
                            </span>
                             {update.bonusType && (
                                <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${getBonusTagClass(update.bonusType)}`}>
                                    {update.bonusType === 'FOCUSED_FLOW' ? 'Focused Flow (2x)' : 'Critical Blitz (3x)'}
                                </span>
                            )}
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