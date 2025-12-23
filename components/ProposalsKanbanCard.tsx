
import React from 'react';
import { ProposalCardData } from '../types';
import { Icon } from './ui/Icon';

interface ProposalsKanbanCardProps extends ProposalCardData {
    columnId: string;
    onCardClick?: (proposalId: string) => void;
}

export const ProposalsKanbanCard: React.FC<ProposalsKanbanCardProps> = ({ 
    id, 
    title, 
    displayId, 
    value, 
    date,
    opportunityName,
    contactName,
    columnId,
    onCardClick
}) => {
    const handleDragStart = (e: React.DragEvent) => {
        e.dataTransfer.setData('cardId', id);
        e.dataTransfer.setData('sourceColId', columnId);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleClick = () => {
        if (onCardClick) {
            onCardClick(id);
        }
    };

    return (
        <div 
            className="bg-background-light dark:bg-gray-800/60 p-4 rounded-lg border border-neutral-100 dark:border-gray-700/50 shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 hover:border-primary/30 cursor-pointer active:cursor-grabbing group"
            draggable={true}
            onDragStart={handleDragStart}
            onClick={handleClick}
        >
            <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">{displayId}</span>
                <span className="text-xs text-gray-400 dark:text-gray-500">{date}</span>
            </div>
            
            <h3 className="font-bold text-gray-900 dark:text-gray-100 leading-tight mb-3 group-hover:text-primary transition-colors">
                {title}
            </h3>

            <div className="flex flex-col gap-1 border-t border-gray-100 dark:border-gray-700/50 pt-3">
                 <div className="flex justify-between items-center">
                    <p className="text-sm font-bold text-gray-800 dark:text-gray-200">{value}</p>
                 </div>
                 <div className="flex flex-col gap-0.5 mt-1">
                    <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                         <Icon name="workspaces" className="text-[14px]" />
                         <span className="truncate">{opportunityName}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                         <Icon name="person" className="text-[14px]" />
                         <span className="truncate">{contactName}</span>
                    </div>
                 </div>
            </div>
        </div>
    );
};