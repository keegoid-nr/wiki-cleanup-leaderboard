
import React, { useState } from 'react';

const RuleItem: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <li className="mb-4">
    <h4 className="font-semibold text-indigo-400">{title}</h4>
    <div className="pl-4 border-l-2 border-gray-700 mt-1 text-gray-300 text-sm">
      {children}
    </div>
  </li>
);

export const Rules: React.FC = () => {
    const [isOpen, setIsOpen] = useState(true);

    return (
        <aside className="bg-gray-800 rounded-lg shadow-lg p-6 sticky top-8">
             <button onClick={() => setIsOpen(!isOpen)} className="w-full flex justify-between items-center text-xl font-semibold text-white mb-4">
                <span>Competition Rules</span>
                <svg className={`w-6 h-6 transform transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
            </button>
            {isOpen && (
                <div className="prose prose-invert prose-sm max-w-none">
                    <ul className="list-none p-0">
                        <RuleItem title="1. Earn Points">
                            <p>Edit any Support Engineering Wiki Article on Confluence to earn points. Points reset weekly.</p>
                        </RuleItem>

                        <RuleItem title="2. Qualifying Edits (1 Point)">
                            <p>Each validated edit of <strong className="text-white">10 characters or more</strong> earns one point. Qualifying edits include:</p>
                            <ul className="list-disc pl-5 mt-2 space-y-1">
                                <li>Fixing typos or grammatical errors.</li>
                                <li>Repairing broken links.</li>
                                <li>Improving formatting for readability.</li>
                                <li>Making content updates for clarity or accuracy.</li>
                            </ul>
                            <p className="mt-2 text-gray-400">Archiving pages and creating new articles are not included.</p>
                        </RuleItem>

                        <RuleItem title="3. Bonus: Focused Flow (2x Points)">
                            <p>Earn double points for 60 minutes. Each article edit is worth 2 points.</p>
                            <ul className="list-disc pl-5 mt-2 space-y-1">
                                <li>Activate by using #WIKIFLOW in the designated Slack channel.</li>
                                <li>Limit of one Focused Flow per engineer, per day.</li>
                            </ul>
                        </RuleItem>

                        <RuleItem title="4. Bonus: Critical Content Blitz (3x Points)">
                            <p>Earn triple points on December 2nd. Each article edit is worth 3 points.</p>
                            <ul className="list-disc pl-5 mt-2 space-y-1">
                                <li>Edit 5 critical articles from the pre-approved list to qualify for the blitz bonus.</li>
                            </ul>
                        </RuleItem>
                    </ul>
                </div>
            )}
        </aside>
    );
};