
import React, { useState } from 'react';
import { LeadColumnData, LeadCardData } from '../types';
import { LeadsKanbanCard } from './LeadsKanbanCard';

interface LeadsKanbanBoardProps {
    data: LeadColumnData[];
    onCardMove: (cardId: string, sourceStage: string, destStage: string) => void;
    onCardClick: (leadId: string) => void;
}

interface LeadsKanbanColumnProps extends LeadColumnData {
    onCardMove: (cardId: string, sourceStage: string, destStage: string) => void;
    onCardClick: (leadId: string) => void;
}

const LeadsKanbanColumn: React.FC<LeadsKanbanColumnProps> = ({ title, cards, onCardMove, onCardClick }) => {
    const [isDragOver, setIsDragOver] = useState(false);
    
    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(true);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
        const cardId = e.dataTransfer.getData('cardId');
        const sourceStage = e.dataTransfer.getData('sourceStage');
        
        if (cardId && sourceStage && sourceStage !== title) {
            onCardMove(cardId, sourceStage, title);
        }
    };

    return (
        <div 
            className={`flex flex-col w-72 h-full shrink-0 transition-colors rounded-xl ${isDragOver ? 'bg-primary/5 dark:bg-primary/10' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={handleDrop}
        >
            <div className="flex justify-between items-center px-4 py-3 mb-2 rounded-lg bg-neutral-100/50 dark:bg-gray-800/40 border border-transparent dark:border-gray-800">
                <h2 className="font-black text-gray-800 dark:text-gray-200 text-xs uppercase tracking-widest">{title}</h2>
                <span className="text-[10px] font-black text-gray-500 bg-white dark:bg-gray-800 px-2 py-0.5 rounded-full border border-neutral-200 dark:border-gray-700 shadow-sm">
                    {cards.length}
                </span>
            </div>
            
            <div className="flex flex-col gap-3 flex-1 overflow-y-auto px-1 pb-4 kanban-scroll">
                {cards.length === 0 && !isDragOver ? (
                    <div className="p-8 text-center text-gray-400 text-xs italic border-2 border-dashed border-neutral-100 dark:border-gray-800/50 rounded-xl">
                        Vazio
                    </div>
                ) : (
                    cards.map((card) => (
                        <LeadsKanbanCard 
                            key={card.id} 
                            lead={card}
                            onCardClick={onCardClick}
                        />
                    ))
                )}
                {isDragOver && (
                    <div className="h-20 border-2 border-dashed border-primary/30 rounded-xl bg-primary/5 animate-pulse" />
                )}
            </div>
        </div>
    );
};

export const LeadsKanbanBoard: React.FC<LeadsKanbanBoardProps> = ({ data, onCardMove, onCardClick }) => {
    return (
        <div className="flex-1 overflow-x-auto overflow-y-hidden bg-neutral-50 dark:bg-background-dark/50">
            <div className="flex h-full min-w-max p-6 gap-6">
                {data.map((column) => (
                    <LeadsKanbanColumn 
                        key={column.id} 
                        {...column} 
                        onCardMove={onCardMove} 
                        onCardClick={onCardClick} 
                    />
                ))}
            </div>
        </div>
    );
};
