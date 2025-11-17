import React, { useState } from 'react';

const RuleItem: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <li className="mb-4">
    <h4 className="font-semibold text-nr-green-accent">{title}</h4>
    <div className="pl-4 border-l-2 border-nr-dark-light mt-1 text-gray-300 text-sm">
      {children}
    </div>
  </li>
);

export const Rules: React.FC = () => {
    const [isOpen, setIsOpen] = useState(true);

    return (
        <aside className="bg-nr-dark-card rounded-lg shadow-lg p-6 sticky top-8">
             <button onClick={() => setIsOpen(!isOpen)} className="w-full flex justify-between items-center text-xl font-semibold text-white mb-4">
                <span>Competition Rules</span>
                <svg className={`w-6 h-6 transform transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
            </button>
            {isOpen && (
                <div className="prose prose-invert prose-sm max-w-none">
                    <ul className="list-none p-0">
                        <RuleItem title="1. Scoring">
                            <p>Your score is the total number of characters changed (added or removed) across all your edits on any Support Engineering Wiki Article. Each character is worth 1 point by default.</p>
                        </RuleItem>
                        <RuleItem title="2. Bonus: Focused Flow (2x Points)">
                            <p>Activate a 60-minute double points session by using the <strong>#WIKIFLOW</strong> command in the <strong>#gts-wikicleanup</strong> Slack channel. This can be used once per day, per editor.</p>
                        </RuleItem>
                        <RuleItem title="3. Bonus: Critical Content Blitz (3x Points)">
                            <p>On <strong>December 2nd only</strong>, all edits made to a curated list of critical pages will earn triple points. Edits to these pages will automatically receive the bonus.</p>
                        </RuleItem>
                         <RuleItem title="4. General Rules & Limitations">
                            <p>Points are awarded based on character changes to <strong>existing</strong> pages. Due to API limitations, the following actions are <strong>not scored</strong>:</p>
                            <ul className="list-disc pl-5 mt-2 space-y-1">
                                <li>Creating new pages.</li>
                                <li>Archiving or deleting pages.</li>
                                <li>Formatting-only changes (e.g., bolding text, changing colors).</li>
                            </ul>
                            <p className="mt-3 text-gray-400">The goal is to improve our wiki. While not all valuable contributions can be scored automatically, all efforts to make our SE space more readable and useful are appreciated!</p>
                        </RuleItem>
                        <RuleItem title="5. Prizes">
                            <p>A <strong>$100 prize</strong> is awarded to the top scorer of each weekly period. A <strong>$250 grand prize</strong> is awarded to the overall top scorer at the end of the competition.</p>
                        </RuleItem>
                    </ul>
                </div>
            )}
        </aside>
    );
};
