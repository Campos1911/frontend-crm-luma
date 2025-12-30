
import React from 'react';
import { LeadCardData } from '../types';
import { Icon } from './ui/Icon';

interface LeadsKanbanCardProps {
    lead: LeadCardData;
    onCardClick?: (leadId: string) => void;
}

export const LeadsKanbanCard: React.FC<LeadsKanbanCardProps> = ({ lead, onCardClick }) => {
    // Fix: Added source to the destructuring assignment
    const { id, name, email, phone, source, tasksCount = 0, recordsCount = 0, stage } = lead;

    const handleDragStart = (e: React.DragEvent) => {
        e.dataTransfer.setData('cardId', id);
        e.dataTransfer.setData('sourceStage', stage); // Usa stage em vez de ID de coluna
        e.dataTransfer.effectAllowed = 'move';
    };

    const getSourceStyles = (src: string) => {
        const s = src.toLowerCase();
        if (s.includes('linkedin')) return 'bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800';
        if (s.includes('site')) return 'bg-purple-50 text-purple-600 border-purple-100 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800';
        return 'bg-gray-50 text-gray-600 border-gray-100 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700';
    };

    return (
        <div 
            className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-neutral-200 dark:border-gray-700/60 shadow-sm transition-all hover:shadow-md hover:border-primary/30 cursor-pointer active:scale-[0.98] group relative"
            draggable
            onDragStart={handleDragStart}
            onClick={() => onCardClick?.(id)}
        >
            <div className="flex justify-between items-start mb-3">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${getSourceStyles(source)}`}>
                    {source}
                </span>
                
                <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    {tasksCount > 0 && (
                        <div className="flex items-center gap-0.5 text-orange-500 font-black text-[10px]" title="Tarefas">
                            <Icon name="task_alt" className="!text-[12px]" />
                            {tasksCount}
                        </div>
                    )}
                    {recordsCount > 0 && (
                        <div className="flex items-center gap-0.5 text-primary font-black text-[10px]" title="Registros">
                            <Icon name="history" className="!text-[12px]" />
                            {recordsCount}
                        </div>
                    )}
                </div>
            </div>

            <h3 className="font-bold text-gray-900 dark:text-gray-100 text-[15px] mb-3 leading-tight group-hover:text-primary transition-colors">
                {name}
            </h3>

            <div className="flex flex-col gap-1.5 pt-3 border-t border-gray-50 dark:border-gray-700/50">
                <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                    <Icon name="mail" className="!text-[14px]" />
                    <span className="truncate">{email || 'Sem e-mail'}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                    <Icon name="call" className="!text-[14px]" />
                    <span>{phone || 'Sem telefone'}</span>
                </div>
            </div>
        </div>
    );
};
