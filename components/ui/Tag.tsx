import React from 'react';
import { StatusColor } from '../../types';

interface TagProps {
    color: StatusColor;
    children: React.ReactNode;
}

export const Tag: React.FC<TagProps> = ({ color, children }) => {
    const colorMap: Record<StatusColor, string> = {
        blue: 'bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300',
        orange: 'bg-orange-100 dark:bg-orange-900/40 text-orange-800 dark:text-orange-300',
        purple: 'bg-purple-100 dark:bg-purple-900/40 text-purple-800 dark:text-purple-300',
        yellow: 'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-800 dark:text-yellow-300',
        green: 'bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300',
        red: 'bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-300',
    };
    
    const dotColorMap: Record<StatusColor, string> = {
        blue: 'bg-blue-500',
        orange: 'bg-orange-500',
        purple: 'bg-purple-500',
        yellow: 'bg-yellow-500',
        green: 'bg-green-500',
        red: 'bg-red-500',
    };
    
    return (
        <div className={`mt-3 inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-xs font-medium ${colorMap[color]}`}>
            <span className={`size-1.5 rounded-full ${dotColorMap[color]}`}></span> {children}
        </div>
    );
};