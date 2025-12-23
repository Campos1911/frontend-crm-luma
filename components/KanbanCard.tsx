
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

    const formatDate = (dateStr: string) => {
        if (!dateStr) return '';
        const [y, m, d] = dateStr.split('-');
        return `${d}/${m}`;
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
            
            {/* Status Tag */}
            <div>
                <Tag color={statusColor}>{status}</Tag>
            </div>
            
            {/* Experimental Class Info - Displayed below status */}
            {experimentalClasses && experimentalClasses.length > 0 && (
                <div className="mt-3 flex flex-col gap-1.5">
                    {experimentalClasses.map((cls) => (
                        <div 
                            key={cls.id}
                            className="flex items-center gap-2 p-2 rounded-md bg-primary/5 dark:bg-primary/10 border border-primary/10 dark:border-primary/20"
                        >
                            <div className="flex items-center justify-center size-6 rounded-full bg-white dark:bg-gray-800 text-primary shadow-sm shrink-0">
                                <Icon name="school" className="!text-[14px]" />
                            </div>
                            <div className="flex flex-col leading-none">
                                <span className="text-[10px] font-bold text-primary uppercase tracking-wide">Aula Exp.</span>
                                <span className="text-[11px] font-medium text-gray-600 dark:text-gray-300 mt-0.5">
                                    {formatDate(cls.date)} • {cls.time}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
