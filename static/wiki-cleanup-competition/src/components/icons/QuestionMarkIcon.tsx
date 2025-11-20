import React from 'react';

export const QuestionMarkIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        {...props}
    >
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9.879 7.519c0-1.03.836-1.867 1.867-1.867s1.867.836 1.867 1.867c0 .683-.37 1.284-.92 1.624a1.867 1.867 0 00-.947 1.624v.467m-3 4.225a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0z"
        />
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 21a9 9 0 110-18 9 9 0 010 18z"
        />
    </svg>
);
