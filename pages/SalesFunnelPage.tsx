
import React, { useState, useMemo, useEffect } from 'react';
import { Sidebar } from '../components/Sidebar';
import { KanbanBoard } from '../components/KanbanBoard';
import { SalesListView } from '../components/SalesListView';
import { Button } from '../components/ui/Button';
import { Avatar } from '../components/ui/Avatar';
import { Icon } from '../components/ui/Icon';
import { INITIAL_NAV_ITEMS } from '../utils/constants';
import { ColumnData, StatusColor, CardData } from '../types';
import { OpportunityDetailModal } from '../components/OpportunityDetailModal';
import { LossReasonModal } from '../components/LossReasonModal';
import { OpportunityFormModal } from '../components/OpportunityFormModal';
import { getOpportunities, updateOpportunity, moveOpportunity, addOpportunity, deleteOpportunity, getProposalsByOpportunity } from '../utils/dataStore';
import { useStats } from '../hooks/useStats';

const SalesFunnelPage: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [columns, setColumns] = useState<ColumnData[]>(getOpportunities());
    const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
    
    // Hook de Estatísticas integrado
    const { data: stats, isLoading: statsLoading } = useStats();

    useEffect(() => {
        setColumns([...getOpportunities()]);
    }, []);

    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [selectedCardId, setSelectedCardId] = useState<string | null>(null);

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

    const selectedOpportunityData = useMemo(() => {
        if (!selectedCardId) return { card: null, stage: '' };
        for (const col of columns) {
            const found = col.cards.find(c => c.id === selectedCardId);
            if (found) return { card: found, stage: col.title };
        }
        return { card: null, stage: '' };
    }, [selectedCardId, columns]);

    return (
        <div className="flex h-screen w-full font-display bg-background-light dark:bg-background-dark text-gray-900 dark:text-gray-100">
            <Sidebar navItems={INITIAL_NAV_ITEMS} />
            
            <main className="flex flex-col flex-1 w-full overflow-hidden relative">
                <header className="flex flex-col px-6 py-5 border-b border-neutral-100 dark:border-gray-800 bg-background-light dark:bg-background-dark z-10">
                    <div className="flex flex-wrap justify-between items-center gap-4">
                        <div className="flex flex-col">
                            <h1 className="text-primary dark:text-primary text-2xl font-black tracking-tight min-w-72">
                                Funil de Vendas
                            </h1>
                            {/* Dashboard KPI Mini - Dados vindo do n8n via useStats */}
                            <div className="flex items-center gap-4 mt-1">
                                {statsLoading ? (
                                    <div className="h-4 w-48 bg-neutral-200 dark:bg-gray-800 animate-pulse rounded"></div>
                                ) : (
                                    <div className="flex gap-4 text-[10px] font-bold uppercase tracking-wider text-gray-500">
                                        <span className="flex items-center gap-1">
                                            <Icon name="trending_up" className="!text-[12px] text-green-500" />
                                            Valor Total: <span className="text-gray-900 dark:text-white">{stats?.totalValue || 'R$ 0,00'}</span>
                                        </span>
                                        <span className="flex items-center gap-1">
                                            Conversão: <span className="text-gray-900 dark:text-white">{stats?.conversionRate || '0%'}</span>
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="flex items-center gap-4 ml-auto">
                            <Button primary={true} icon="add" onClick={() => setIsAddModalOpen(true)}>Nova Oportunidade</Button>
                            <div className="w-px h-8 bg-neutral-200 dark:bg-gray-800 hidden sm:block"></div>
                            <button className="relative group">
                                <Avatar src="https://lh3.googleusercontent.com/aida-public/AB6AXuAqBvK4GjvciB8lHHxTrHVRW-v9GaQJaJX7vaTZEhMqiIrXlqNSkqiGKnQV_d6pxlrXAkzuyHvD4Kgj9abuzvPwwHDSn43M9tDRZo2MKgciw1zLCJAhKsbxbh42zIT_K5NdoRjDEB0DWjSqWEFYMM_eo-wawPmPH7sUxFgn7eFSjxQweABGRkcYVRWj8-pyjnCquVnO7ZMjuXgRz2kAAHAPMjsroiG7_L-NYAcC8iANDzU5aSosCt0yQfb1Y91Ac42Xk4nd5ujgenQ" alt="User profile" />
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
                        <div className="flex items-center p-1 bg-neutral-200 dark:bg-gray-800/50 rounded-lg h-10">
                            <button onClick={() => setViewMode('kanban')} className={`flex items-center justify-center size-8 rounded-md transition-all ${viewMode === 'kanban' ? 'bg-white dark:bg-gray-700 text-primary shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}><Icon name="view_kanban" /></button>
                            <button onClick={() => setViewMode('list')} className={`flex items-center justify-center size-8 rounded-md transition-all ${viewMode === 'list' ? 'bg-white dark:bg-gray-700 text-primary shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}><Icon name="table_rows" /></button>
                        </div>
                    </div>
                </header>
                
                {viewMode === 'kanban' ? (
                    <KanbanBoard data={filteredData} onCardMove={() => {}} onCardClick={(id) => { setSelectedCardId(id); setIsDetailModalOpen(true); }} />
                ) : (
                    <SalesListView data={filteredData} onCardClick={(id) => { setSelectedCardId(id); setIsDetailModalOpen(true); }} />
                )}

                <OpportunityDetailModal 
                    isOpen={isDetailModalOpen} 
                    onClose={() => setIsDetailModalOpen(false)} 
                    opportunity={selectedOpportunityData.card}
                    currentStage={selectedOpportunityData.stage}
                    onMove={() => {}}
                    onDelete={() => {}}
                    onUpdate={() => {}}
                />

                <OpportunityFormModal 
                    isOpen={isAddModalOpen}
                    onClose={() => setIsAddModalOpen(false)}
                    onSave={() => {}}
                />
            </main>
        </div>
    );
};

export default SalesFunnelPage;
