import React from 'react';
import { CardData } from '../types';
import { Tag } from './ui/Tag';
import { Icon } from './ui/Icon';

interface KanbanCardProps extends CardData {
    columnId: string;
    isFaded?: boolean;
    onCardClick?: (cardId: string) => void;
}

export const KanbanCard: React.FC<KanbanCardProps> = ({ 
    id, 
    name, 
    amount, 
    status, 
    statusColor, 
    columnId, 
    isFaded = false,
    onCardClick,
    experimentalClasses = []
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

    const cardClasses = `bg-background-light dark:bg-gray-800/60 p-4 rounded-lg border border-neutral-100 dark:border-gray-700/50 shadow-sm transition-all duration-200 ${
        isFaded 
            ? 'opacity-70 grayscale-[0.5]' 
            : 'hover:shadow-md hover:-translate-y-0.5 hover:border-primary/30 cursor-pointer active:cursor-grabbing'
    }`;

    return (
        <div 
            className={cardClasses}
            draggable={true}
            onDragStart={handleDragStart}
            onClick={handleClick}
        >
            <div className="flex justify-between items-start">
                <p className="font-bold text-gray-900 dark:text-gray-100 leading-tight">{name}</p>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 font-medium tracking-wide">{amount}</p>
            
            <div className="flex flex-wrap gap-2 items-center">
                <Tag color={statusColor}>{status}</Tag>
                
                {experimentalClasses && experimentalClasses.length > 0 && (
                    <div 
                        className="mt-3 inline-flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-bold bg-primary/10 text-primary border border-primary/20"
                        title={`${experimentalClasses.length} aula(s) experimental(is) agendada(s)`}
                    >
                        <Icon name="school" className="!text-[12px]" />
                        Aula Exp.
                    </div>
                )}
            </div>
        </div>
    );
};