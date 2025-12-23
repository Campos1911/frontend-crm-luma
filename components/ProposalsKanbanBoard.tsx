
import React, { useState } from 'react';
import { ProposalColumnData } from '../types';
import { ProposalsKanbanCard } from './ProposalsKanbanCard';

interface ProposalsKanbanBoardProps {
    data: ProposalColumnData[];
    onCardMove: (cardId: string, sourceColId: string, destColId: string) => void;
    onCardClick: (cardId: string) => void;
}

interface ProposalsKanbanColumnProps extends ProposalColumnData {
    onCardMove: (cardId: string, sourceColId: string, destColId: string) => void;
    onCardClick: (cardId: string) => void;
}

const ProposalsKanbanColumn: React.FC<ProposalsKanbanColumnProps> = ({ id, title, cards, onCardMove, onCardClick }) => {
    const [isDragOver, setIsDragOver] = useState(false);
    
    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(true);
    };

    const handleDragLeave = () => {
        setIsDragOver(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
        const cardId = e.dataTransfer.getData('cardId');
        const sourceColId = e.dataTransfer.getData('sourceColId');
        
        if (cardId && sourceColId) {
            onCardMove(cardId, sourceColId, id);
        }
    };

    // Color bar for column header based on proposal status semantics
    const getHeaderColor = (colTitle: string) => {
        switch(colTitle) {
            case 'Aceita': return 'bg-green-500';
            case 'Rejeitada': return 'bg-red-500';
            case 'Cancelada': return 'bg-gray-500';
            case 'Enviada': return 'bg-blue-500';
            case 'Revisão': return 'bg-purple-500';
            default: return 'bg-yellow-500'; // Rascunho
        }
    };

    return (
        <div 
            className={`flex flex-col w-72 h-full shrink-0 transition-colors duration-200 rounded-xl ${isDragOver ? 'bg-primary/5 dark:bg-primary/10' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
        >
            <div className="flex justify-between items-center px-4 py-3 mb-2 rounded-lg bg-neutral-200/50 dark:bg-gray-800/30 border border-transparent dark:border-gray-800 relative overflow-hidden">
                <div className={`absolute left-0 top-0 bottom-0 w-1 ${getHeaderColor(title)}`}></div>
                <h2 className="font-bold text-gray-800 dark:text-gray-200 text-sm tracking-tight pl-2">{title}</h2>
                <span className="text-xs font-bold text-gray-500 dark:text-gray-400 bg-neutral-100 dark:bg-gray-800 px-2 py-0.5 rounded-full border border-neutral-200 dark:border-gray-700">
                    {cards.length}
                </span>
            </div>
            
            <div className="flex flex-col gap-3 flex-1 overflow-y-auto px-1 pb-4 kanban-scroll">
                {cards.map((card) => (
                    <ProposalsKanbanCard 
                        key={card.id} 
                        {...card} 
                        columnId={id}
                        onCardClick={onCardClick}
                    />
                ))}
                
                {/* Drop Area Placeholder */}
                <div className={`h-full min-h-[4rem] rounded-lg border-2 border-dashed border-neutral-200 dark:border-gray-800 flex items-center justify-center text-gray-400 text-sm transition-opacity duration-200 ${cards.length === 0 || isDragOver ? 'opacity-100' : 'opacity-0 h-2'}`}>
                     {cards.length === 0 ? 'Solte aqui' : ''}
                </div>
            </div>
        </div>
    );
};

export const ProposalsKanbanBoard: React.FC<ProposalsKanbanBoardProps> = ({ data, onCardMove, onCardClick }) => {
    return (
        <div className="flex-1 overflow-x-auto overflow-y-hidden bg-neutral-200/50 dark:bg-background-dark/50">
            <div className="flex h-full min-w-max p-6 gap-6">
                {data.map((column) => (
                    <ProposalsKanbanColumn 
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