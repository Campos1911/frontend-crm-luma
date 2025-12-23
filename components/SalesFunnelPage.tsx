import React, { useState, useMemo, useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { KanbanBoard } from './KanbanBoard';
import { SalesListView } from './SalesListView';
import { Button } from './ui/Button';
import { Avatar } from './ui/Avatar';
import { Icon } from './ui/Icon';
import { INITIAL_NAV_ITEMS } from '../constants';
import { ColumnData, StatusColor, CardData } from '../types';
import { OpportunityDetailModal } from './OpportunityDetailModal';
import { LossReasonModal } from './LossReasonModal';
import { OpportunityFormModal } from './OpportunityFormModal';
import { getOpportunities, updateOpportunity, moveOpportunity, addOpportunity, deleteOpportunity } from '../dataStore';

const getStatusForColumn = (columnTitle: string): { status: string; statusColor: StatusColor } => {
    switch (columnTitle) {
        case 'Nova Oportunidade': return { status: 'Novo Lead', statusColor: 'blue' };
        case 'Negociação': return { status: 'Em Negociação', statusColor: 'orange' };
        case 'Assinatura de Contrato': return { status: 'Contrato', statusColor: 'purple' };
        case 'Aguardando Pagamento': return { status: 'Faturado', statusColor: 'yellow' };
        case 'Ganho': return { status: 'Concluído', statusColor: 'green' };
        case 'Perdido': return { status: 'Cancelado', statusColor: 'red' };
        default: return { status: 'Em Andamento', statusColor: 'blue' };
    }
};

const SalesFunnelPage: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');
    // Initialize from DataStore
    const [columns, setColumns] = useState<ColumnData[]>(getOpportunities());
    const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
    
    // Refresh data on mount to ensure updates from other pages (like Proposals) are reflected if any
    useEffect(() => {
        setColumns([...getOpportunities()]);
    }, []);

    // Modal State
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [selectedCardId, setSelectedCardId] = useState<string | null>(null);

    // Loss Reason Modal State for Drag & Drop
    const [isLossModalOpen, setIsLossModalOpen] = useState(false);
    const [pendingMove, setPendingMove] = useState<{cardId: string, sourceColId: string, destColId: string} | null>(null);

    // Filter logic derived from state
    const filteredData = useMemo(() => {
        if (!searchTerm) return columns;
        
        const lowerTerm = searchTerm.toLowerCase();
        return columns.map(col => ({
            ...col,
            cards: col.cards.filter(card => 
                card.name.toLowerCase().includes(lowerTerm) || 
                card.status.toLowerCase().includes(lowerTerm) ||
                card.amount.includes(searchTerm)
            )
        }));
    }, [searchTerm, columns]);

    // Derived state for selected opportunity
    const selectedOpportunityData = useMemo(() => {
        if (!selectedCardId) return { card: null, stage: '' };
        
        for (const col of columns) {
            const found = col.cards.find(c => c.id === selectedCardId);
            if (found) {
                return { card: found, stage: col.title };
            }
        }
        return { card: null, stage: '' };
    }, [selectedCardId, columns]);

    const handleCardClick = (cardId: string) => {
        setSelectedCardId(cardId);
        setIsDetailModalOpen(true);
    };

    const handleCloseDetailModal = () => {
        setIsDetailModalOpen(false);
        setSelectedCardId(null);
        // Refresh data when modal closes to catch any internal updates
        setColumns([...getOpportunities()]);
    };

    const handleAddOpportunity = () => {
        setIsAddModalOpen(true);
    };

    const handleSaveNewOpportunity = (data: Partial<CardData>) => {
        const newCard: CardData = {
            id: `c-${Date.now()}`,
            name: data.name || 'Nova Conta',
            amount: data.amount || 'R$ 0,00',
            status: 'Novo Lead',
            statusColor: 'blue',
            salesType: data.salesType,
            type: data.type,
            closeDate: data.closeDate
        };

        addOpportunity(newCard);
        setColumns([...getOpportunities()]);
    };

    const handleCardMove = (cardId: string, sourceColId: string, destColId: string) => {
        const destCol = columns.find(c => c.id === destColId);
        
        // Intercept move to "Perdido"
        if (destCol && destCol.title === 'Perdido') {
            setPendingMove({ cardId, sourceColId, destColId });
            setIsLossModalOpen(true);
            return;
        }

        executeCardMove(cardId, sourceColId, destColId);
    };

    const executeCardMove = (cardId: string, sourceColId: string, destColId: string, lossReason?: string) => {
        const destCol = columns.find(c => c.id === destColId);
        if (!destCol) return;

        const { status, statusColor } = getStatusForColumn(destCol.title);
        
        const updateData: Partial<CardData> = {
            status,
            statusColor,
            ...(lossReason ? { lossReason } : {})
        };

        moveOpportunity(cardId, sourceColId, destColId, updateData);
        setColumns([...getOpportunities()]);
    };

    const handleConfirmLossReason = (reason: string) => {
        if (pendingMove) {
            executeCardMove(pendingMove.cardId, pendingMove.sourceColId, pendingMove.destColId, reason);
            setPendingMove(null);
            setIsLossModalOpen(false);
        }
    };

    const handleMoveOpportunityToStage = (cardId: string, targetStageTitle: string) => {
        // Find source col id
        let sourceColId = '';
        for (const col of columns) {
            if (col.cards.find(c => c.id === cardId)) {
                sourceColId = col.id;
                break;
            }
        }
        
        // Find dest col id
        const destCol = columns.find(c => c.title === targetStageTitle);
        
        if (sourceColId && destCol) {
            executeCardMove(cardId, sourceColId, destCol.id);
        }
    };

    const handleDeleteOpportunity = (cardId: string) => {
         deleteOpportunity(cardId);
         setColumns([...getOpportunities()]);
         handleCloseDetailModal();
    };
    
    const handleUpdateOpportunity = (updatedCard: CardData) => {
        updateOpportunity(updatedCard);
        setColumns([...getOpportunities()]);
    };

    return (
        <div className="flex h-screen w-full font-display bg-background-light dark:bg-background-dark text-gray-900 dark:text-gray-100">
            <Sidebar navItems={INITIAL_NAV_ITEMS} />
            
            <main className="flex flex-col flex-1 w-full overflow-hidden relative">
                <header className="flex flex-col px-6 py-5 border-b border-neutral-100 dark:border-gray-800 bg-background-light dark:bg-background-dark z-10">
                    <div className="flex flex-wrap justify-between items-center gap-4">
                        <h1 className="text-primary dark:text-primary text-2xl font-black tracking-tight min-w-72">
                            Funil de Vendas
                        </h1>
                        <div className="flex items-center gap-4 ml-auto">
                            <Button primary={true} icon="add" onClick={handleAddOpportunity}>Nova Oportunidade</Button>
                            <div className="w-px h-8 bg-neutral-200 dark:bg-gray-800 hidden sm:block"></div>
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
                                        placeholder="Buscar oportunidades..." 
                                        value={searchTerm} 
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                            </label>
                        </div>
                        <Button icon="filter_list">Filtros</Button>
                        <Button icon="sort">Ordenar</Button>

                        {/* View Toggle Buttons */}
                        <div className="flex items-center p-1 bg-neutral-200 dark:bg-gray-800/50 rounded-lg h-10">
                            <button
                                onClick={() => setViewMode('kanban')}
                                className={`flex items-center justify-center size-8 rounded-md transition-all ${
                                    viewMode === 'kanban' 
                                        ? 'bg-white dark:bg-gray-700 text-primary shadow-sm' 
                                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                                }`}
                                title="Visualização Kanban"
                            >
                                <Icon name="view_kanban" style={{fontSize: '20px'}} />
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                className={`flex items-center justify-center size-8 rounded-md transition-all ${
                                    viewMode === 'list' 
                                        ? 'bg-white dark:bg-gray-700 text-primary shadow-sm' 
                                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                                }`}
                                title="Visualização em Lista"
                            >
                                <Icon name="table_rows" style={{fontSize: '20px'}} />
                            </button>
                        </div>
                    </div>
                </header>
                
                {viewMode === 'kanban' ? (
                    <KanbanBoard 
                        data={filteredData} 
                        onCardMove={handleCardMove}
                        onCardClick={handleCardClick}
                    />
                ) : (
                    <SalesListView 
                        data={filteredData}
                        onCardClick={handleCardClick}
                    />
                )}

                <OpportunityDetailModal 
                    isOpen={isDetailModalOpen} 
                    onClose={handleCloseDetailModal} 
                    opportunity={selectedOpportunityData.card}
                    currentStage={selectedOpportunityData.stage}
                    onMove={handleMoveOpportunityToStage}
                    onDelete={handleDeleteOpportunity}
                    onUpdate={handleUpdateOpportunity}
                />

                <OpportunityFormModal 
                    isOpen={isAddModalOpen}
                    onClose={() => setIsAddModalOpen(false)}
                    onSave={handleSaveNewOpportunity}
                />

                <LossReasonModal 
                    isOpen={isLossModalOpen} 
                    onClose={() => { setIsLossModalOpen(false); setPendingMove(null); }}
                    onConfirm={handleConfirmLossReason}
                />
            </main>
        </div>
    );
};

export default SalesFunnelPage;