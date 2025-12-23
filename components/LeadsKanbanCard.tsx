
import React from 'react';
import { LeadCardData } from '../types';
import { Icon } from './ui/Icon';

interface LeadsKanbanCardProps extends LeadCardData {
    columnId: string;
    isFaded?: boolean;
    onCardClick?: (leadId: string) => void;
}

export const LeadsKanbanCard: React.FC<LeadsKanbanCardProps> = ({ 
    id, 
    name, 
    email, 
    phone, 
    source, 
    company,
    columnId, 
    isFaded = false,
    onCardClick 
}) => {
    const handleDragStart = (e: React.DragEvent) => {
        if (isFaded) {
            e.preventDefault();
            return;
        }
        e.dataTransfer.setData('cardId', id);
        e.dataTransfer.setData('sourceColId', columnId);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleClick = () => {
        if (onCardClick) {
            onCardClick(id);
        }
    };

    const cardClasses = `bg-white dark:bg-gray-800 p-4 rounded-xl border border-neutral-200 dark:border-gray-700/60 shadow-sm transition-all duration-200 group relative ${
        isFaded 
            ? 'opacity-60 grayscale cursor-not-allowed' 
            : 'hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] dark:hover:shadow-none dark:hover:bg-gray-750 hover:-translate-y-1 hover:border-primary/30 cursor-pointer active:scale-[0.98]'
    }`;

    const getSourceColor = (sourceName: string) => {
        const s = sourceName.toLowerCase();
        if (s.includes('linkedin')) return 'bg-[#0077b5]/10 text-[#0077b5] border-[#0077b5]/20 dark:bg-[#0077b5]/20 dark:text-blue-300';
        if (s.includes('google')) return 'bg-orange-50 text-orange-700 border-orange-100 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-800';
        if (s.includes('site') || s.includes('web')) return 'bg-purple-50 text-purple-700 border-purple-100 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800';
        if (s.includes('indicação')) return 'bg-green-50 text-green-700 border-green-100 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800';
        return 'bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600';
    };

    return (
        <div 
            className={cardClasses}
            draggable={!isFaded}
            onDragStart={handleDragStart}
            onClick={handleClick}
        >
            <div className="flex justify-between items-start mb-3">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${getSourceColor(source)} uppercase tracking-wide`}>
                    {source}
                </span>
                <button 
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1 -mr-2 -mt-2 opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-label="Opções"
                  onClick={(e) => { e.stopPropagation(); }}
                >
                    <Icon name="more_horiz" />
                </button>
            </div>

            <div className="mb-4">
                <h3 className="font-bold text-gray-900 dark:text-gray-100 text-[15px] leading-snug group-hover:text-primary transition-colors">
                    {name}
                </h3>
            </div>

            <div className="flex flex-col gap-1.5 pt-3 border-t border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors">
                    <Icon name="mail" className="text-[14px]" />
                    <span className="truncate">{email}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors">
                    <Icon name="call" className="text-[14px]" />
                    <span>{phone}</span>
                </div>
            </div>
        </div>
    );
};
