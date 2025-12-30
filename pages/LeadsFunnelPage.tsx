
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Sidebar } from '../components/Sidebar';
import { LeadsKanbanBoard } from '../components/LeadsKanbanBoard';
import { LeadsListView } from '../components/LeadsListView';
import { Button } from '../components/ui/Button';
import { Avatar } from '../components/ui/Avatar';
import { Icon } from '../components/ui/Icon';
import { INITIAL_NAV_ITEMS } from '../utils/constants';
import { LeadColumnData, LeadCardData } from '../types';
import { LeadFormModal } from '../components/LeadFormModal';
import { LeadDetailModal } from '../components/LeadDetailModal';
import { DisqualifyLeadModal } from '../components/DisqualifyLeadModal';
import { useLeads } from '../hooks/useLeads';
import { webhookService } from '../services/webhookService';

// Definição padrão das etapas solicitada
const LEAD_STAGES = [
    'Novo Lead',
    'Atendimento',
    'FUP',
    'Pré-qualificado',
    'Qualificado',
    'Desqualificado'
];

const LeadsFunnelPage: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
    
    // Hooks de dados n8n
    const { leads: apiLeads, isLoading, error: apiError, refresh } = useLeads();
    
    // Estado local para manipulação imediata (DND, etc)
    const [columns, setColumns] = useState<LeadColumnData[]>([]);

    // Função auxiliar para normalizar strings e comparar estágios
    const normalize = (str: string) => str.toLowerCase().trim().replace(/_/g, ' ').normalize("NFD").replace(/[\u0300-\u036f]/g, "");

    // Sincroniza e ordena as colunas conforme o padrão LEAD_STAGES
    useEffect(() => {
        if (!isLoading) {
            console.debug('[LeadsFunnelPage] Sincronizando apiLeads:', apiLeads);

            // Cria um mapa dos leads existentes usando chaves normalizadas
            const normalizedLeadsMap = new Map<string, LeadCardData[]>();
            
            apiLeads.forEach(col => {
                const normTitle = normalize(col.title);
                const existingCards = normalizedLeadsMap.get(normTitle) || [];
                normalizedLeadsMap.set(normTitle, [...existingCards, ...col.cards]);
            });

            // Reconstrói as colunas na ordem exata solicitada, buscando no mapa normalizado
            const orderedColumns: LeadColumnData[] = LEAD_STAGES.map((stage, idx) => {
                const normStage = normalize(stage);
                return {
                    id: `l-col-${idx + 1}`,
                    title: stage,
                    cards: normalizedLeadsMap.get(normStage) || []
                };
            });

            setColumns(orderedColumns);
        }
    }, [apiLeads, isLoading]);

    // Estados de Modais
    const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
    const [modals, setModals] = useState({
        add: false,
        detail: false,
        disqualify: false
    });

    // Dados do lead selecionado
    const selectedLeadData = useMemo(() => {
        if (!selectedLeadId) return { lead: null, status: '' };
        for (const col of columns) {
            const found = col.cards.find(c => c.id === selectedLeadId);
            if (found) return { lead: found, status: col.title };
        }
        return { lead: null, status: '' };
    }, [selectedLeadId, columns]);

    const allLeads = useMemo(() => columns.flatMap(col => col.cards), [columns]);

    // Handlers Otimizados
    const handleCardClick = useCallback((id: string) => {
        setSelectedLeadId(id);
        setModals(prev => ({ ...prev, detail: true }));
    }, []);

    const executeMove = useCallback(async (leadId: string, sourceStage: string, destStage: string, disqualificationReason?: string) => {
        // 1. Atualização Otimista no Local State
        setColumns(prev => {
            const sourceCol = prev.find(c => c.title === sourceStage);
            const destCol = prev.find(c => c.title === destStage);
            if (!sourceCol || !destCol || sourceStage === destStage) return prev;

            const card = sourceCol.cards.find(c => c.id === leadId);
            if (!card) return prev;

            const updatedCard = { 
                ...card, 
                stage: destStage,
                disqualificationReason: destStage === 'Desqualificado' ? disqualificationReason : undefined 
            };

            return prev.map(col => {
                if (col.title === sourceStage) return { ...col, cards: col.cards.filter(c => c.id !== leadId) };
                if (col.title === destStage) return { ...col, cards: [...col.cards, updatedCard] };
                return col;
            });
        });

        // 2. Sincronização com o Backend (n8n)
        try {
            await webhookService.updateLeadStage(leadId, destStage);
        } catch (err) {
            console.error('[executeMove] Falha ao sincronizar movimento com o n8n:', err);
            // Opcional: Notificar o usuário ou reverter o estado se a consistência for crítica
        }
    }, []);

    const handleCardMove = (cardId: string, sourceStage: string, destStage: string) => {
        if (destStage === 'Desqualificado') {
            setSelectedLeadId(cardId);
            setModals(prev => ({ ...prev, disqualify: true }));
        } else {
            executeMove(cardId, sourceStage, destStage);
        }
    };

    const filteredData = useMemo(() => {
        const term = searchTerm.toLowerCase();
        if (!term) return columns;
        return columns.map(col => ({
            ...col,
            cards: col.cards.filter(c => 
                c.name.toLowerCase().includes(term) || 
                c.email.toLowerCase().includes(term) ||
                c.phone.includes(term)
            )
        }));
    }, [searchTerm, columns]);

    return (
        <div className="flex h-screen w-full bg-background-light dark:bg-background-dark text-gray-900 dark:text-gray-100 font-display">
            <Sidebar navItems={INITIAL_NAV_ITEMS} />
            
            <main className="flex flex-col flex-1 overflow-hidden relative">
                <header className="flex flex-col px-6 py-5 border-b border-neutral-100 dark:border-gray-800 bg-background-light dark:bg-background-dark z-10">
                    <div className="flex justify-between items-center gap-4">
                        <div className="flex flex-col">
                            <h1 className="text-primary text-2xl font-black tracking-tight">Funil de Leads</h1>
                            <div className="flex items-center gap-2 mt-1">
                                {isLoading ? (
                                    <span className="text-[10px] text-gray-400 animate-pulse font-bold uppercase">Sincronizando n8n...</span>
                                ) : (
                                    <button onClick={refresh} className="flex items-center gap-1 text-[10px] font-bold uppercase text-primary hover:opacity-70">
                                        <Icon name="refresh" className="!text-[12px]" /> Atualizar
                                    </button>
                                )}
                            </div>
                        </div>
                        
                        <div className="flex items-center gap-4">
                            <Button primary icon="add" onClick={() => setModals(p => ({ ...p, add: true }))}>Novo Lead</Button>
                            <div className="w-px h-8 bg-neutral-200 dark:bg-gray-800 hidden sm:block"></div>
                            <Avatar src="https://lh3.googleusercontent.com/aida-public/AB6AXuAqBvK4GjvciB8lHHxTrHVRW-v9GaQJaJX7vaTZEhMqiIrXlqNSkqiGKnQV_d6pxlrXAkzuyHvD4Kgj9abuzvPwwHDSn43M9tDRZo2MKgciw1zLCJAhKsbxbh42zIT_K5NdoRjDEB0DWjSqWEFYMM_eo-wawPmPH7sUxFgn7eFSjxQweABGRkcYVRWj8-pyjnCquVnO7ZMjuXgRz2kAAHAPMjsroiG7_L-NYAcC8iANDzU5aSosCt0yQfb1Y91Ac42Xk4nd5ujgenQ" alt="User" />
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-4 mt-6">
                        <div className="flex-grow max-w-sm relative">
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><Icon name="search" /></div>
                            <input 
                                className="w-full bg-neutral-200 dark:bg-gray-800/50 rounded-lg h-10 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                                placeholder="Buscar leads..." 
                                value={searchTerm} 
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="flex items-center p-1 bg-neutral-200 dark:bg-gray-800/50 rounded-lg h-10">
                            <button onClick={() => setViewMode('kanban')} className={`size-8 flex items-center justify-center rounded-md transition-all ${viewMode === 'kanban' ? 'bg-white dark:bg-gray-700 text-primary shadow-sm' : 'text-gray-500'}`}><Icon name="view_kanban" /></button>
                            <button onClick={() => setViewMode('list')} className={`size-8 flex items-center justify-center rounded-md transition-all ${viewMode === 'list' ? 'bg-white dark:bg-gray-700 text-primary shadow-sm' : 'text-gray-500'}`}><Icon name="table_rows" /></button>
                        </div>
                    </div>
                </header>
                
                {isLoading && columns.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center"><div className="size-10 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" /></div>
                ) : apiError && columns.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
                        <Icon name="cloud_off" className="text-5xl text-red-500 mb-4 opacity-50" />
                        <h2 className="text-xl font-bold mb-2">Erro na integração</h2>
                        <Button primary onClick={refresh}>Tentar Novamente</Button>
                    </div>
                ) : (
                    <div className="flex-1 overflow-hidden">
                        {viewMode === 'kanban' ? (
                            <LeadsKanbanBoard data={filteredData} onCardMove={handleCardMove} onCardClick={handleCardClick} />
                        ) : (
                            <LeadsListView data={filteredData} onCardClick={handleCardClick} />
                        )}
                    </div>
                )}

                {/* Modais */}
                <LeadFormModal 
                    isOpen={modals.add} 
                    onClose={() => setModals(p => ({ ...p, add: false }))} 
                    onSave={(data) => {
                        const newLead = { id: `l-${Date.now()}`, ...data };
                        setColumns(prev => prev.map((col, i) => i === 0 ? { ...col, cards: [newLead, ...col.cards] } : col));
                        setModals(p => ({ ...p, add: false }));
                    }} 
                    existingLeads={allLeads} 
                />

                <LeadDetailModal 
                    isOpen={modals.detail} 
                    onClose={() => setModals(p => ({ ...p, detail: false }))} 
                    lead={selectedLeadData.lead} 
                    currentStatus={selectedLeadData.status} 
                    onUpdate={(updated) => setColumns(prev => prev.map(c => ({ ...c, cards: c.cards.map(l => l.id === updated.id ? updated : l) })))} 
                    onDelete={(id) => {
                        setColumns(prev => prev.map(c => ({ ...c, cards: c.cards.filter(l => l.id !== id) })));
                        setModals(p => ({ ...p, detail: false }));
                    }}
                    onMove={(id, stage) => {
                        const source = columns.find(c => c.cards.some(l => l.id === id));
                        if (source) executeMove(id, source.title, stage);
                    }}
                />

                <DisqualifyLeadModal 
                    isOpen={modals.disqualify} 
                    onClose={() => setModals(p => ({ ...p, disqualify: false }))} 
                    onConfirm={(reason) => {
                        const source = columns.find(c => c.cards.some(l => l.id === selectedLeadId));
                        if (source && selectedLeadId) executeMove(selectedLeadId, source.title, 'Desqualificado', reason);
                        setModals(p => ({ ...p, disqualify: false }));
                    }} 
                />
            </main>
        </div>
    );
};

export default LeadsFunnelPage;
