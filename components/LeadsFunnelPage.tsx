
import React, { useState, useMemo } from 'react';
import { Sidebar } from './Sidebar';
import { LeadsKanbanBoard } from './LeadsKanbanBoard';
import { LeadsListView } from './LeadsListView';
import { Button } from './ui/Button';
import { Avatar } from './ui/Avatar';
import { Icon } from './ui/Icon';
import { INITIAL_LEADS_DATA, INITIAL_NAV_ITEMS } from '../constants';
import { LeadColumnData, LeadCardData } from '../types';
import { LeadFormModal } from './LeadFormModal';
import { LeadDetailModal } from './LeadDetailModal';
import { DisqualifyLeadModal } from './DisqualifyLeadModal';

const LeadsFunnelPage: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [columns, setColumns] = useState<LeadColumnData[]>(INITIAL_LEADS_DATA);
    const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
    
    // Modal States
    const [isAddLeadModalOpen, setIsAddLeadModalOpen] = useState(false);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);

    // Disqualification State
    const [isDisqualifyModalOpen, setIsDisqualifyModalOpen] = useState(false);
    const [pendingDisqualification, setPendingDisqualification] = useState<{
        leadId: string, 
        sourceColId: string, 
        destColId: string
    } | null>(null);

    // Helpers to manage modals
    const handleCloseAddModal = () => setIsAddLeadModalOpen(false);
    const handleAddLead = () => setIsAddLeadModalOpen(true);
    
    const handleCloseDetailModal = () => {
        setIsDetailModalOpen(false);
        setSelectedLeadId(null);
    };

    const handleCardClick = (leadId: string) => {
        setSelectedLeadId(leadId);
        setIsDetailModalOpen(true);
    };

    // Derived state for selected lead info
    const selectedLeadData = useMemo(() => {
        if (!selectedLeadId) return { lead: null, status: '' };
        
        for (const col of columns) {
            const found = col.cards.find(c => c.id === selectedLeadId);
            if (found) {
                return { lead: found, status: col.title };
            }
        }
        return { lead: null, status: '' };
    }, [selectedLeadId, columns]);

    // Flatten all leads for validation
    const allLeads = useMemo(() => {
        return columns.flatMap(col => col.cards);
    }, [columns]);

    const handleSaveNewLead = (leadData: Omit<LeadCardData, 'id'>) => {
        const newLead: LeadCardData = {
            id: `l-${Date.now()}`,
            ...leadData
        };

        setColumns(prevColumns => prevColumns.map(column => {
            if (column.title === 'Novo Lead') {
                return {
                    ...column,
                    cards: [newLead, ...column.cards]
                };
            }
            return column;
        }));

        setIsAddLeadModalOpen(false);
    };

    const handleUpdateLead = (updatedLead: LeadCardData) => {
        setColumns(prevColumns => prevColumns.map(column => ({
            ...column,
            cards: column.cards.map(card => card.id === updatedLead.id ? updatedLead : card)
        })));
    };

    const handleDeleteLead = (id: string) => {
        setColumns(prev => prev.map(col => ({
            ...col,
            cards: col.cards.filter(c => c.id !== id)
        })));
        handleCloseDetailModal();
    };

    // Helper to execute the move logic
    const executeMove = (leadId: string, sourceColId: string, destColId: string, disqualificationReason?: string) => {
        setColumns(prev => {
            const sourceCol = prev.find(c => c.id === sourceColId);
            const destCol = prev.find(c => c.id === destColId);
            
            if (!sourceCol || !destCol) return prev;
            if (sourceColId === destColId) return prev; 
            
            const card = sourceCol.cards.find(c => c.id === leadId);
            if (!card) return prev;

            // Determine updates to the card
            let updatedCard = { ...card };
            
            if (destCol.title === 'Desqualificado') {
                updatedCard.disqualificationReason = disqualificationReason;
            } else {
                // Clear reason if moving out of disqualification or to any other active stage
                updatedCard.disqualificationReason = undefined; 
            }

            // Remove from source
            const newSourceCol = {
                ...sourceCol,
                cards: sourceCol.cards.filter(c => c.id !== leadId)
            };
            
            // Add to dest
            const newDestCol = {
                ...destCol,
                cards: [...destCol.cards, updatedCard]
            };

            return prev.map(col => {
                if (col.id === sourceColId) return newSourceCol;
                if (col.id === destColId) return newDestCol;
                return col;
            });
        });
    };

    const handleMoveLeadToStage = (leadId: string, targetStageTitle: string) => {
        // 1. Find source column and lead
        let sourceColId = '';
        for (const col of columns) {
            if (col.cards.some(c => c.id === leadId)) {
                sourceColId = col.id;
                break;
            }
        }

        // 2. Find dest column ID
        const destCol = columns.find(col => col.title === targetStageTitle);
        
        if (sourceColId && destCol) {
            // Check if moving to Desqualificado
            if (targetStageTitle === 'Desqualificado') {
                setPendingDisqualification({ leadId, sourceColId, destColId: destCol.id });
                setIsDisqualifyModalOpen(true);
            } else {
                executeMove(leadId, sourceColId, destCol.id);
            }
        }
    };
    
    // Handle Drag & Drop move
    const handleCardMove = (cardId: string, sourceColId: string, destColId: string) => {
        const destCol = columns.find(c => c.id === destColId);
        
        if (destCol && destCol.title === 'Desqualificado') {
            setPendingDisqualification({ leadId: cardId, sourceColId, destColId });
            setIsDisqualifyModalOpen(true);
        } else {
            executeMove(cardId, sourceColId, destColId);
        }
    };

    const handleConfirmDisqualification = (reason: string) => {
        if (pendingDisqualification) {
            executeMove(
                pendingDisqualification.leadId, 
                pendingDisqualification.sourceColId, 
                pendingDisqualification.destColId, 
                reason
            );
            setPendingDisqualification(null);
            setIsDisqualifyModalOpen(false);
        }
    };

    // Filter logic derived from state
    const filteredData = useMemo(() => {
        if (!searchTerm) return columns;
        
        const lowerTerm = searchTerm.toLowerCase();
        return columns.map(col => ({
            ...col,
            cards: col.cards.filter(card => 
                card.name.toLowerCase().includes(lowerTerm) || 
                card.email.toLowerCase().includes(lowerTerm) ||
                card.source.toLowerCase().includes(lowerTerm)
            )
        }));
    }, [searchTerm, columns]);

    return (
        <div className="flex h-screen w-full font-display bg-background-light dark:bg-background-dark text-gray-900 dark:text-gray-100">
            <Sidebar navItems={INITIAL_NAV_ITEMS} />
            
            <main className="flex flex-col flex-1 w-full overflow-hidden relative">
                <header className="flex flex-col px-6 py-5 border-b border-neutral-100 dark:border-gray-800 bg-background-light dark:bg-background-dark z-10">
                    <div className="flex flex-wrap justify-between items-center gap-4">
                        <h1 className="text-primary dark:text-primary text-2xl font-black tracking-tight min-w-72">
                            Leads Kanban - Qualificação
                        </h1>
                        <div className="flex items-center gap-4 ml-auto">
                            <Button primary={true} icon="add" onClick={handleAddLead}>Adicionar Lead</Button>
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
                                        placeholder="Buscar leads..." 
                                        value={searchTerm} 
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                            </label>
                        </div>
                        <Button icon="filter_list">Filtros</Button>
                        
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
                    <LeadsKanbanBoard 
                        data={filteredData} 
                        onCardMove={handleCardMove} 
                        onCardClick={handleCardClick}
                    />
                ) : (
                    <LeadsListView
                        data={filteredData}
                        onCardClick={handleCardClick}
                    />
                )}

                {/* Add Lead Form Modal */}
                <LeadFormModal 
                    isOpen={isAddLeadModalOpen} 
                    onClose={handleCloseAddModal} 
                    onSave={handleSaveNewLead} 
                    existingLeads={allLeads}
                />

                {/* Lead Detail Modal */}
                <LeadDetailModal
                    isOpen={isDetailModalOpen}
                    onClose={handleCloseDetailModal}
                    lead={selectedLeadData.lead}
                    currentStatus={selectedLeadData.status}
                    onUpdate={handleUpdateLead}
                    onDelete={handleDeleteLead}
                    onMove={handleMoveLeadToStage}
                />

                {/* Disqualification Modal */}
                <DisqualifyLeadModal
                    isOpen={isDisqualifyModalOpen}
                    onClose={() => {
                        setIsDisqualifyModalOpen(false);
                        setPendingDisqualification(null);
                    }}
                    onConfirm={handleConfirmDisqualification}
                />
            </main>
        </div>
    );
};

export default LeadsFunnelPage;
