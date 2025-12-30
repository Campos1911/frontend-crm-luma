
import React, { useState, useMemo, useEffect } from 'react';
import { Sidebar } from '../components/Sidebar';
import { ProposalsKanbanBoard } from '../components/ProposalsKanbanBoard';
import { Button } from '../components/ui/Button';
import { Avatar } from '../components/ui/Avatar';
import { Icon } from '../components/ui/Icon';
import { INITIAL_NAV_ITEMS } from '../utils/constants';
import { ProposalColumnData, ProposalCardData, Proposal } from '../types';
import { ProposalDetailModal } from '../components/ProposalDetailModal';
import { ConfirmProposalStageModal } from '../components/ConfirmProposalStageModal';
import { getProposalsColumns, updateProposal, moveProposal } from '../utils/dataStore';

const ProposalsPage: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [columns, setColumns] = useState<ProposalColumnData[]>(getProposalsColumns());
    
    useEffect(() => {
        setColumns([...getProposalsColumns()]);
    }, []);

    // Modal State
    const [selectedProposalId, setSelectedProposalId] = useState<string | null>(null);

    // Confirmation State for Kanban Move
    const [pendingMove, setPendingMove] = useState<{cardId: string, sourceColId: string, destColId: string} | null>(null);

    // Filter logic
    const filteredData = useMemo(() => {
        if (!searchTerm) return columns;
        
        const lowerTerm = searchTerm.toLowerCase();
        return columns.map(col => ({
            ...col,
            cards: col.cards.filter(card => 
                card.title.toLowerCase().includes(lowerTerm) || 
                card.displayId.toLowerCase().includes(lowerTerm) ||
                card.opportunityName.toLowerCase().includes(lowerTerm) ||
                card.contactName.toLowerCase().includes(lowerTerm)
            )
        }));
    }, [searchTerm, columns]);

    // Derived state for selected proposal
    const selectedProposalData = useMemo(() => {
        if (!selectedProposalId) return null;
        
        for (const col of columns) {
            const found = col.cards.find(c => c.id === selectedProposalId);
            if (found) {
                return found;
            }
        }
        return null;
    }, [selectedProposalId, columns]);

    // Derived info for confirmation modal
    const pendingMoveInfo = useMemo(() => {
        if (!pendingMove) return null;
        const sourceCol = columns.find(c => c.id === pendingMove.sourceColId);
        const destCol = columns.find(c => c.id === pendingMove.destColId);
        if (!sourceCol || !destCol) return null;
        return {
            sourceTitle: sourceCol.title,
            destTitle: destCol.title
        };
    }, [pendingMove, columns]);

    const handleCardClick = (cardId: string) => {
        setSelectedProposalId(cardId);
    };

    const handleCardMove = (cardId: string, sourceColId: string, destColId: string) => {
        if (sourceColId === destColId) return;
        setPendingMove({ cardId, sourceColId, destColId });
    };

    const confirmMove = () => {
        if (pendingMove) {
            moveProposal(pendingMove.cardId, pendingMove.sourceColId, pendingMove.destColId);
            setColumns([...getProposalsColumns()]);
            setPendingMove(null);
        }
    };

    const handleUpdateProposal = (updatedProposal: Proposal) => {
        updateProposal(updatedProposal);
        setColumns([...getProposalsColumns()]);
    };

    return (
        <div className="flex h-screen w-full font-display bg-background-light dark:bg-background-dark text-gray-900 dark:text-gray-100">
            <Sidebar navItems={INITIAL_NAV_ITEMS} />
            
            <main className="flex flex-col flex-1 w-full overflow-hidden relative">
                <header className="flex flex-col px-6 py-5 border-b border-neutral-100 dark:border-gray-800 bg-background-light dark:bg-background-dark z-10">
                    <div className="flex flex-wrap justify-between items-center gap-4">
                        <h1 className="text-primary dark:text-primary text-2xl font-black tracking-tight min-w-72">
                            Funil de Propostas
                        </h1>
                        <div className="flex items-center gap-4 ml-auto">
                            <button className="relative group">
                                <Avatar 
                                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuAqBvK4GjvciB8lHHxTrHVRW-v9GaQJaJX7vaTZEhMqiIrXlqNSkqiGKnQV_d6pxlrXAkzuyHvD4Kgj9abuzvPwwHDSn43M9tDRZo2MKgciw1zLCJAhKsbxbh42zIT_K5NdoRjDEB0DWjSqWEFYMM_eo-wawPmPH7sUxFgn7eFSjxQweABGRkcYVRWj8-pyjnCquVnO7ZMjuXgRz2kAAHAPMjsroiG7_L-NYAcC8iANDzU5aSosCt0yQfb1Y91Ac42Xk4nd5ujgenQ" 
                                    alt="User profile avatar" 
                                    className="ring-2 ring-transparent group-hover:ring-primary/50 transition-all"
                                />
                                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-background-dark rounded-full"></div>
                            </button>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-4 mt-6">
                        <div className="flex-grow max-w-sm">
                            <label className="flex flex-col w-full group">
                                <div className="flex w-full flex-1 items-stretch rounded-lg h-10 transition-shadow duration-200 focus-within:ring-2 focus-within:ring-primary/50">
                                    <div className="text-gray-500 dark:text-gray-400 flex bg-neutral-200 dark:bg-gray-800/50 items-center justify-center pl-3 rounded-l-lg border-r-0">
                                        <Icon name="search" />
                                    </div>
                                    <input 
                                        className="flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none border-none bg-neutral-200 dark:bg-gray-800/50 h-full placeholder:text-gray-500 dark:placeholder:text-gray-400 px-4 rounded-l-none border-l-0 pl-2 text-sm font-normal leading-normal" 
                                        placeholder="Buscar propostas..." 
                                        value={searchTerm} 
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                            </label>
                        </div>
                        <Button icon="filter_list">Filtros</Button>
                        <Button icon="sort">Ordenar</Button>
                    </div>
                </header>
                
                <ProposalsKanbanBoard 
                    data={filteredData} 
                    onCardMove={handleCardMove}
                    onCardClick={handleCardClick}
                />

                <ProposalDetailModal 
                    isOpen={!!selectedProposalId} 
                    onClose={() => setSelectedProposalId(null)} 
                    proposal={selectedProposalData}
                    opportunityName={selectedProposalData?.opportunityName}
                    contactName={selectedProposalData?.contactName}
                    onUpdate={handleUpdateProposal}
                />

                <ConfirmProposalStageModal
                    isOpen={!!pendingMove}
                    onClose={() => setPendingMove(null)}
                    onConfirm={confirmMove}
                    currentStage={pendingMoveInfo?.sourceTitle || ''}
                    targetStage={pendingMoveInfo?.destTitle || ''}
                />
            </main>
        </div>
    );
};

export default ProposalsPage;
