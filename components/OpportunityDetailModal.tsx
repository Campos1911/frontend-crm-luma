
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Modal } from './ui/Modal';
import { CardData, Proposal, Account, StudentPageData, ExperimentalClass } from '../types';
import { Icon } from './ui/Icon';
import { ConfirmStageModal } from './ConfirmStageModal';
import { ConfirmDeleteModal } from './ConfirmDeleteModal';
import { LossReasonModal } from './LossReasonModal';
import { ProposalDetailModal } from './ProposalDetailModal';
import { AccountDetailModal } from './AccountDetailModal';
import { getProposalsByOpportunity, updateProposal, addProposal, getAccounts, updateAccount, deleteAccount } from '../dataStore';
import { INITIAL_STUDENTS_LIST } from '../constants';

interface OpportunityDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    opportunity: CardData | null;
    currentStage: string;
    onMove: (cardId: string, targetStage: string) => void;
    onUpdate: (card: CardData) => void;
    onDelete: (cardId: string) => void;
}

interface Task {
    id: string;
    title: string;
    isCompleted: boolean;
    dueDate: string; // YYYY-MM-DD
    completedDate: string | null; // YYYY-MM-DD or ISO string
}

interface Note {
    id: string;
    content: string;
    createdAt: string;
    author: string;
}

const MOCK_INITIAL_TASKS: Task[] = [
    {
        id: 'opt-t1',
        title: 'Revisar termos do contrato',
        isCompleted: false,
        dueDate: new Date().toISOString().split('T')[0], // Today
        completedDate: null
    },
    {
        id: 'opt-t2',
        title: 'Agendar reunião com diretoria',
        isCompleted: true,
        dueDate: '2024-11-01',
        completedDate: '2024-10-30'
    }
];

const MOCK_INITIAL_NOTES: Note[] = [
    {
        id: 'n1',
        content: 'Cliente mencionou que o orçamento para o próximo ano será aprovado em Dezembro.',
        createdAt: '2024-10-20',
        author: 'Você'
    },
    {
        id: 'n2',
        content: 'Interessados principalmente na integração com o ERP atual.',
        createdAt: '2024-10-15',
        author: 'Você'
    }
];

const STAGES = [
    'Nova Oportunidade',
    'Negociação',
    'Assinatura de Contrato',
    'Aguardando Pagamento',
    'Ganho',
    'Perdido'
];

const DISCIPLINES = [
    'Matemática',
    'Português',
    'Física',
    'Química',
    'Biologia',
    'História',
    'Geografia'
];

const TimelineItem: React.FC<{ icon: string; title: string; desc: string; date: string; iconClass?: string }> = ({ icon, title, desc, date, iconClass }) => (
    <div className="flex gap-4 items-start group animate-fade-in">
        <div className="flex flex-col items-center mr-2">
            <div className={`flex items-center justify-center size-8 rounded-full bg-neutral-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 ${iconClass || ''}`}>
                <Icon name={icon} className="text-base" />
            </div>
            <div className="w-px h-10 bg-neutral-200 dark:bg-gray-700 my-1 group-last:hidden"></div>
        </div>
        <div className="flex-1 pb-6">
            <div className="flex justify-between items-start">
                <div>
                    <h3 className="font-bold text-gray-900 dark:text-white text-sm">{title}</h3>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">{desc}</p>
                </div>
                <p className="text-xs text-gray-400 dark:text-gray-500 whitespace-nowrap ml-4">{date}</p>
            </div>
        </div>
    </div>
);

export const OpportunityDetailModal: React.FC<OpportunityDetailModalProps> = ({ 
    isOpen, 
    onClose, 
    opportunity,
    currentStage,
    onMove,
    onUpdate,
    onDelete
}) => {
    const [activeTab, setActiveTab] = useState('Propostas');
    const [isEditing, setIsEditing] = useState(false);
    const [pendingStage, setPendingStage] = useState<string | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isLossModalOpen, setIsLossModalOpen] = useState(false);
    const [formData, setFormData] = useState<CardData | null>(null);

    // Account Modal State
    const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
    const [isAccountDropdownOpen, setIsAccountDropdownOpen] = useState(false);
    const accountDropdownRef = useRef<HTMLDivElement>(null);

    // Tasks State
    const [tasks, setTasks] = useState<Task[]>(MOCK_INITIAL_TASKS);
    const [hasTaskChanges, setHasTaskChanges] = useState(false);

    // Notes State
    const [notes, setNotes] = useState<Note[]>(MOCK_INITIAL_NOTES);
    const [isAddingNote, setIsAddingNote] = useState(false);
    const [noteText, setNoteText] = useState('');

    // Proposals State
    const [proposals, setProposals] = useState<Proposal[]>([]);
    
    // Proposal Detail Modal State
    const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null);

    // Experimental Class State
    const [experimentalClasses, setExperimentalClasses] = useState<ExperimentalClass[]>([]);
    const [isSchedulingClass, setIsSchedulingClass] = useState(false);
    const [editingClassId, setEditingClassId] = useState<string | null>(null);
    const [classFormData, setClassFormData] = useState<Omit<ExperimentalClass, 'id'>>({
        date: '',
        time: '',
        discipline: '',
        studentName: ''
    });

    // Student Search State
    const [studentSearch, setStudentSearch] = useState('');
    const [isStudentDropdownOpen, setIsStudentDropdownOpen] = useState(false);
    const studentDropdownRef = useRef<HTMLDivElement>(null);

    // Load Data
    useEffect(() => {
        if (opportunity) {
            setFormData({
                ...opportunity,
                salesType: opportunity.salesType || 'B2B',
                type: opportunity.type || 'Novo negócio',
                closeDate: opportunity.closeDate || '2024-12-15',
                lossReason: opportunity.lossReason || '',
                experimentalClasses: opportunity.experimentalClasses || []
            });
            
            const loadedProposals = getProposalsByOpportunity(opportunity.id);
            setProposals(loadedProposals);
            setExperimentalClasses(opportunity.experimentalClasses || []);
        }
    }, [opportunity, isOpen, currentStage]); 
    
    useEffect(() => {
        if (isOpen) {
            setActiveTab('Propostas');
            setTasks(MOCK_INITIAL_TASKS);
            setHasTaskChanges(false);
            setNotes(MOCK_INITIAL_NOTES);
            setIsAddingNote(false);
            setNoteText('');
            setIsEditing(false);
            setPendingStage(null);
            setIsDeleteModalOpen(false);
            setIsLossModalOpen(false);
            setSelectedProposal(null);
            setIsAccountModalOpen(false);
            setIsSchedulingClass(false);
            setEditingClassId(null);
            setIsAccountDropdownOpen(false);
        }
    }, [isOpen]);

    // Handle click outside dropdowns
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (studentDropdownRef.current && !studentDropdownRef.current.contains(event.target as Node)) {
                setIsStudentDropdownOpen(false);
            }
            if (accountDropdownRef.current && !accountDropdownRef.current.contains(event.target as Node)) {
                setIsAccountDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const availableAccounts = useMemo(() => getAccounts(), [isOpen]);

    const associatedAccount = useMemo(() => {
        if (!formData) return null;
        // Search based on the current form name to reflect changes in edit mode immediately in the UI if needed
        return availableAccounts.find(a => a.name === formData.name) || null;
    }, [formData, availableAccounts]);

    const filteredStudents = useMemo(() => {
        const term = studentSearch.toLowerCase();
        return INITIAL_STUDENTS_LIST.filter(s => 
            `${s.firstName} ${s.lastName}`.toLowerCase().includes(term)
        );
    }, [studentSearch]);

    if (!opportunity || !formData) return null;

    const isActiveStage = (stage: string) => stage === currentStage;
    const isPastStage = (stage: string) => {
        const currentIndex = STAGES.indexOf(currentStage);
        const stageIndex = STAGES.indexOf(stage);
        return stageIndex < currentIndex;
    };

    const handleStageClick = (stage: string) => {
        if (stage !== currentStage) {
            if (stage === 'Perdido') {
                setIsLossModalOpen(true);
            } else {
                setPendingStage(stage);
            }
        }
    };

    const confirmStageChange = () => {
        if (pendingStage) {
            onMove(opportunity.id, pendingStage);
            setPendingStage(null);
        }
    };

    const handleConfirmLoss = (reason: string) => {
        const updatedCard = { ...formData, lossReason: reason };
        onUpdate(updatedCard!);
        onMove(opportunity.id, 'Perdido');
        setIsLossModalOpen(false);
    };

    const handleDeleteClick = () => {
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = () => {
        onDelete(opportunity.id);
        setIsDeleteModalOpen(false);
        onClose();
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => prev ? ({ ...prev, [name]: value }) : null);
    };

    const handleAccountSelect = (accountName: string) => {
        setFormData(prev => prev ? ({ ...prev, name: accountName }) : null);
        setIsAccountDropdownOpen(false);
    };

    const handleSave = () => {
        if (formData) {
            // Sincroniza as aulas experimentais do estado local com o formData antes de salvar
            onUpdate({ ...formData, experimentalClasses });
            setIsEditing(false);
        }
    };

    const handleCancel = () => {
        if (opportunity) {
            setFormData({
                ...opportunity,
                salesType: opportunity.salesType || 'B2B',
                type: opportunity.type || 'Novo negócio',
                closeDate: opportunity.closeDate || '2024-12-15',
                lossReason: opportunity.lossReason || '',
                experimentalClasses: opportunity.experimentalClasses || []
            });
            setExperimentalClasses(opportunity.experimentalClasses || []);
        }
        setIsEditing(false);
    };

    // Task Logic
    const toggleTask = (taskId: string) => {
        setTasks(prev => prev.map(t => {
            if (t.id === taskId) {
                const newStatus = !t.isCompleted;
                return {
                    ...t,
                    isCompleted: newStatus,
                    completedDate: newStatus ? new Date().toISOString().split('T')[0] : null
                };
            }
            return t;
        }));
        setHasTaskChanges(true);
    };

    const handleTaskChange = (taskId: string, field: keyof Task, value: any) => {
        setTasks(prev => prev.map(t => {
            if (t.id === taskId) {
                return { ...t, [field]: value };
            }
            return t;
        }));
        setHasTaskChanges(true);
    };

    const handleAddTask = () => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const newTask: Task = {
            id: `opt-t-${Date.now()}`,
            title: 'Nova Tarefa',
            isCompleted: false,
            dueDate: tomorrow.toISOString().split('T')[0],
            completedDate: null
        };
        setTasks(prev => [...prev, newTask]);
        setHasTaskChanges(true);
    };

    const handleSaveTasks = () => {
        console.log('Saving tasks:', tasks);
        setHasTaskChanges(false);
    };

    // Notes Logic
    const handleAddNote = () => {
        if (!noteText.trim()) return;
        const newNote: Note = {
            id: `n-${Date.now()}`,
            content: noteText,
            createdAt: new Date().toISOString().split('T')[0],
            author: 'Você'
        };
        setNotes(prev => [newNote, ...prev]);
        setNoteText('');
        setIsAddingNote(false);
    };

    const formatDate = (dateString: string | null) => {
        if (!dateString) return '-';
        const [year, month, day] = dateString.split('-');
        return `${day}/${month}/${year}`;
    };

    // Experimental Class Handlers
    const handleSaveClass = () => {
        if (!classFormData.date || !classFormData.time || !classFormData.discipline || !classFormData.studentName) {
            alert('Por favor, preencha todos os campos da aula, incluindo o aluno.');
            return;
        }
        
        let newClassesList;
        if (editingClassId) {
            newClassesList = experimentalClasses.map(c => c.id === editingClassId ? { ...classFormData, id: editingClassId } : c);
        } else {
            const newClass: ExperimentalClass = {
                ...classFormData,
                id: `class-${Date.now()}`
            };
            newClassesList = [...experimentalClasses, newClass];
        }
        
        setExperimentalClasses(newClassesList);
        setIsSchedulingClass(false);
        setEditingClassId(null);
        
        // Auto-persist changes to formData if not in explicit edit mode for the whole opportunity
        if (!isEditing && formData) {
            onUpdate({ ...formData, experimentalClasses: newClassesList });
        }
    };

    const handleEditClass = (cls: ExperimentalClass) => {
        setClassFormData({
            date: cls.date,
            time: cls.time,
            discipline: cls.discipline,
            studentName: cls.studentName
        });
        setStudentSearch(cls.studentName);
        setEditingClassId(cls.id);
        setIsSchedulingClass(true);
    };

    const handleDeleteClass = (id: string) => {
        const newClassesList = experimentalClasses.filter(c => c.id !== id);
        setExperimentalClasses(newClassesList);
        if (!isEditing && formData) {
            onUpdate({ ...formData, experimentalClasses: newClassesList });
        }
    };

    const handleStartScheduling = () => {
        setClassFormData({ date: '', time: '', discipline: '', studentName: '' });
        setStudentSearch('');
        setIsSchedulingClass(true);
        setEditingClassId(null);
    };

    const handleStudentSelect = (student: StudentPageData) => {
        const fullName = `${student.firstName} ${student.lastName}`;
        setClassFormData(prev => ({ ...prev, studentName: fullName }));
        setStudentSearch(fullName);
        setIsStudentDropdownOpen(false);
    };

    // Proposal Helpers
    const getProposalStatusStyles = (status: Proposal['status']) => {
        switch (status) {
            case 'Aceita': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 border-green-200 dark:border-green-800';
            case 'Substituída': return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600';
            case 'Rascunho': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800';
            case 'Enviada': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 border-blue-200 dark:border-blue-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getProposalContainerStyles = (status: Proposal['status']) => {
        if (status === 'Aceita') return 'border-green-500 bg-green-50 dark:bg-green-900/20';
        return 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50';
    };

    const hasAcceptedProposal = proposals.some(p => p.status === 'Aceita');

    const handleAddProposal = () => {
        if (!opportunity) return;
        const newProposal: Proposal = {
            id: `p-${Date.now()}`,
            opportunityId: opportunity.id,
            title: 'Nova Proposta',
            displayId: `PROP-${Math.floor(Math.random() * 10000)}`,
            status: 'Rascunho',
            value: opportunity.amount,
            date: new Date().toLocaleDateString('pt-BR', { day: 'numeric', month: 'short', year: 'numeric' })
        };
        addProposal(newProposal);
        setProposals(getProposalsByOpportunity(opportunity.id));
    };
    
    const handleProposalClick = (proposal: Proposal) => {
        setSelectedProposal(proposal);
    };

    const handleUpdateProposal = (updatedProposal: Proposal) => {
        updateProposal(updatedProposal);
        if (opportunity) setProposals(getProposalsByOpportunity(opportunity.id));
        if (selectedProposal && selectedProposal.id === updatedProposal.id) setSelectedProposal(updatedProposal);
    };

    const handleOpenAccountDetail = () => {
        if (associatedAccount) {
            setIsAccountModalOpen(true);
        } else {
            alert('Conta não encontrada ou não vinculada.');
        }
    };

    const handleUpdateAccountFromDetail = (updated: Account) => {
        updateAccount(updated);
    };

    const handleDeleteAccountFromDetail = (id: string) => {
        deleteAccount(id);
        setIsAccountModalOpen(false);
    };

    return (
        <>
            <Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-7xl">
                <div className="flex flex-col h-full max-h-[90vh] bg-background-light dark:bg-background-dark text-text-primary dark:text-gray-100 rounded-xl overflow-hidden">
                    <main className="flex-1 p-8 overflow-y-auto">
                        <div className="max-w-7xl mx-auto">
                            <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
                                <p className="text-3xl md:text-4xl font-black leading-tight tracking-tighter text-gray-900 dark:text-white">Detalhes da Oportunidade</p>
                                <div className="flex w-full flex-wrap gap-3 sm:w-auto self-start sm:self-center">
                                    {isEditing ? (
                                        <>
                                            <button onClick={handleCancel} className="flex h-10 px-4 items-center justify-center rounded-lg border border-neutral-200 dark:border-gray-700 hover:bg-neutral-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 transition-colors font-medium text-sm">Cancelar</button>
                                            <button onClick={handleSave} className="flex h-10 px-4 items-center justify-center rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors font-medium text-sm shadow-sm">Salvar</button>
                                        </>
                                    ) : (
                                        <>
                                            <button onClick={() => setIsEditing(true)} className="flex size-10 cursor-pointer items-center justify-center overflow-hidden rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors" title="Editar"><Icon name="edit" className="text-xl" /></button>
                                            <button onClick={handleDeleteClick} className="flex size-10 cursor-pointer items-center justify-center overflow-hidden rounded-lg bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors" title="Excluir"><Icon name="delete" className="text-xl" /></button>
                                        </>
                                    )}
                                </div>
                            </div>

                            <div className="flex gap-2 p-1 overflow-x-auto mb-8 pb-4 scrollbar-hide">
                                {STAGES.map((stage) => {
                                    const active = isActiveStage(stage);
                                    const past = isPastStage(stage);
                                    let containerClass = "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700";
                                    if (active) containerClass = "bg-primary/20 ring-2 ring-primary text-primary cursor-default";
                                    else if (past) containerClass = "bg-primary/10 text-primary dark:text-primary/80 hover:bg-primary/20";
                                    return (
                                        <button key={stage} onClick={() => handleStageClick(stage)} disabled={active} className={`flex h-8 shrink-0 items-center justify-center gap-x-2 rounded-lg px-4 whitespace-nowrap transition-colors cursor-pointer disabled:cursor-default ${containerClass}`}>
                                            <p className={`text-sm ${active ? 'font-bold' : 'font-medium'} leading-normal`}>{stage}</p>
                                        </button>
                                    );
                                })}
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                <div className="lg:col-span-1 flex flex-col gap-8">
                                    <div className="border border-primary/50 rounded-lg p-6 bg-primary/5 dark:bg-primary/10">
                                        <h2 className="text-sm font-semibold uppercase tracking-wider text-primary mb-4">Conta</h2>
                                        
                                        {isEditing ? (
                                            <div className="relative mb-4" ref={accountDropdownRef}>
                                                <input
                                                    type="text"
                                                    name="name"
                                                    value={formData.name}
                                                    onChange={(e) => {
                                                        handleInputChange(e);
                                                        setIsAccountDropdownOpen(true);
                                                    }}
                                                    onFocus={() => setIsAccountDropdownOpen(true)}
                                                    placeholder="Pesquisar conta..."
                                                    className="w-full rounded-lg border border-primary/30 bg-white dark:bg-gray-800 text-gray-900 dark:text-white p-3 outline-none focus:ring-2 focus:ring-primary/50 transition-all shadow-sm"
                                                />
                                                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-primary">
                                                    <Icon name="search" />
                                                </div>

                                                {isAccountDropdownOpen && (
                                                    <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white dark:bg-[#1e1d24] border border-neutral-200 dark:border-gray-700 rounded-lg shadow-xl max-h-60 overflow-y-auto">
                                                        {availableAccounts
                                                            .filter(acc => acc.name.toLowerCase().includes(formData.name.toLowerCase()))
                                                            .map(acc => (
                                                                <button
                                                                    key={acc.id}
                                                                    onClick={() => handleAccountSelect(acc.name)}
                                                                    className="w-full text-left px-4 py-3 text-sm text-gray-700 dark:text-gray-200 hover:bg-neutral-100 dark:hover:bg-gray-700 flex items-center gap-3 border-b border-neutral-50 dark:border-gray-800 last:border-0"
                                                                >
                                                                    <div className="size-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                                                                        {acc.name.substring(0, 2).toUpperCase()}
                                                                    </div>
                                                                    <span className="font-medium">{acc.name}</span>
                                                                </button>
                                                            ))
                                                        }
                                                        {availableAccounts.filter(acc => acc.name.toLowerCase().includes(formData.name.toLowerCase())).length === 0 && (
                                                            <div className="px-4 py-3 text-sm text-gray-500 italic">
                                                                Nenhuma conta encontrada.
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-4">
                                                <div className="rounded-full size-12 bg-cover bg-center border border-primary/20" style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuAnVFFsSs9cY9L84f7rtk4gL8zQ4gZXbI0geSRIRnczndN8mxXPkVN4pg2uqdtr6peh6aZLdiREGVGNvO35BE6IHm539IGeypRGcahAh6fDtu6wTY1IFI6VYQImqHJfh91Wd0lxmEOpktbpxLDMyN9NgXSzm2kPYP-zKNDykvmab9PAu6q8TzMlVaxgFymNc3rR6uO2XAINCQNO0-beAP77beZwSfJTYo6DxGrBm99lDbQt2YNLjKrC1ciJwQcD7oXng1pMEl0RQ0g")' }}></div>
                                                <div>
                                                    <p className="text-lg font-bold text-gray-900 dark:text-white">{opportunity.name}</p>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400">Contato Principal: {associatedAccount?.mainContact || '-'}</p>
                                                </div>
                                            </div>
                                        )}
                                        
                                        {!isEditing && (
                                            <button onClick={handleOpenAccountDetail} className="mt-4 inline-flex items-center text-sm font-bold text-primary hover:underline cursor-pointer">
                                                Ver Detalhes da Conta <Icon name="arrow_forward" className="text-base ml-1" />
                                            </button>
                                        )}
                                    </div>

                                    <div className="border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800/20">
                                        <div className="p-4 grid grid-cols-1">
                                            <div className="flex flex-col gap-1 py-4">
                                                <p className="text-sm font-normal leading-normal text-gray-500 dark:text-gray-400">Código da Oportunidade</p>
                                                <p className="text-sm font-medium leading-normal text-gray-900 dark:text-white">OPP-{opportunity.id.replace('c', '00')}</p>
                                            </div>
                                            <div className="flex flex-col gap-1 border-t border-solid border-gray-200 dark:border-gray-700 py-4">
                                                <p className="text-sm font-normal leading-normal text-gray-500 dark:text-gray-400">Modelo de Negócio</p>
                                                {isEditing ? (<select name="salesType" value={formData.salesType} onChange={handleInputChange} className="w-full rounded-md border-neutral-200 dark:border-gray-700 bg-neutral-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm focus:ring-primary focus:border-primary p-2"><option value="B2B">B2B</option><option value="B2C">B2C</option><option value="B2G">B2G</option></select>) : (<p className="text-sm font-medium leading-normal text-gray-900 dark:text-white">{formData.salesType}</p>)}
                                            </div>
                                            <div className="flex flex-col gap-1 border-t border-solid border-gray-200 dark:border-gray-700 py-4">
                                                <p className="text-sm font-normal leading-normal text-gray-500 dark:text-gray-400">Tipo</p>
                                                {isEditing ? (<select name="type" value={formData.type} onChange={handleInputChange} className="w-full rounded-md border-neutral-200 dark:border-gray-700 bg-neutral-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm focus:ring-primary focus:border-primary p-2"><option value="Novo negócio">Novo negócio</option><option value="Recompra">Recompra</option><option value="Reativação">Reativação</option></select>) : (<p className="text-sm font-medium leading-normal text-gray-900 dark:text-white">{formData.type}</p>)}
                                            </div>
                                            <div className="flex flex-col gap-1 border-t border-solid border-gray-200 dark:border-gray-700 py-4"><p className="text-sm font-normal leading-normal text-gray-500 dark:text-gray-400">Valor</p><p className="text-sm font-medium leading-normal text-gray-900 dark:text-white">{opportunity.amount}</p></div>
                                            {currentStage === 'Perdido' && (<div className="flex flex-col gap-1 border-t border-solid border-gray-200 dark:border-gray-700 py-4 animate-fade-in"><p className="text-sm font-normal leading-normal text-red-500 dark:text-red-400">Motivo da Perda</p>{isEditing ? (<textarea name="lossReason" value={formData.lossReason} onChange={handleInputChange} rows={3} className="w-full rounded-md border-neutral-200 dark:border-gray-700 bg-neutral-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm focus:ring-primary focus:border-primary p-2" />) : (<p className="text-sm font-medium leading-normal text-gray-900 dark:text-white italic">{formData.lossReason || 'Nenhum motivo informado.'}</p>)}</div>)}
                                        </div>
                                    </div>
                                </div>

                                <div className="lg:col-span-2">
                                    <div className="border-b border-gray-200 dark:border-gray-700">
                                        <div className="flex px-4 gap-8 overflow-x-auto">
                                            {['Propostas', 'Aula Experimental', 'Notas', 'Tarefas', 'Timeline'].map((tab) => (
                                                <button key={tab} onClick={() => setActiveTab(tab)} className={`flex flex-col items-center justify-center border-b-[3px] pb-3 pt-4 transition-colors min-w-[80px] whitespace-nowrap ${activeTab === tab ? 'border-b-primary' : 'border-b-transparent hover:border-b-gray-300 dark:hover:border-gray-600'}`}><p className={`text-sm font-bold leading-normal tracking-wide ${activeTab === tab ? 'text-primary' : 'text-gray-500 dark:text-gray-400'}`}>{tab}</p></button>
                                            ))}
                                        </div>
                                    </div>
                                    
                                    {activeTab === 'Propostas' && (<div className="py-6 flex flex-col gap-4 animate-fade-in">{proposals.map(proposal => (<div key={proposal.id} onClick={() => handleProposalClick(proposal)} className={`border rounded-lg p-4 cursor-pointer hover:shadow-md transition-all duration-200 ${getProposalContainerStyles(proposal.status)}`}><div className="flex justify-between items-start"><div><p className="font-bold text-gray-900 dark:text-white">{proposal.title}</p><p className="text-sm text-gray-500 dark:text-gray-400">ID: {proposal.displayId}</p></div><span className={`inline-flex items-center text-xs font-semibold px-2.5 py-0.5 rounded-full ${getProposalStatusStyles(proposal.status)}`}>{proposal.status}</span></div><div className="mt-3 text-sm text-gray-500 dark:text-gray-400"><p>Valor: <span className="font-medium text-gray-900 dark:text-white">{proposal.value}</span></p><p>Data: {proposal.date}</p></div></div>))}{proposals.length === 0 && (<div className="text-center text-gray-500 dark:text-gray-400 py-4 italic">Nenhuma proposta cadastrada.</div>)}<button onClick={handleAddProposal} disabled={hasAcceptedProposal} className={`flex items-center gap-2 font-bold text-sm mt-2 transition-colors ${hasAcceptedProposal ? 'text-gray-400 dark:text-gray-600 cursor-not-allowed opacity-70' : 'text-primary hover:underline cursor-pointer'}`} title={hasAcceptedProposal ? "Não é possível adicionar nova proposta quando já existe uma proposta aceita." : "Adicionar nova proposta"}><Icon name="add" className="text-lg" /> Adicionar nova proposta</button></div>)}
                                    
                                    {activeTab === 'Aula Experimental' && (
                                        <div className="py-6 flex flex-col gap-6 animate-fade-in">
                                            {/* Check if associated account has Identifier (CPF/CNPJ) */}
                                            {!associatedAccount?.cpfCnpj ? (
                                                <div className="flex flex-col items-center justify-center p-12 bg-orange-50 dark:bg-orange-900/10 border border-orange-100 dark:border-orange-900/30 rounded-xl text-center animate-scale-in">
                                                    <div className="size-16 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-orange-600 dark:text-orange-400 mb-4">
                                                        <Icon name="lock" className="text-3xl" />
                                                    </div>
                                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Funcionalidade Bloqueada</h3>
                                                    <p className="text-gray-500 dark:text-gray-400 text-sm max-w-sm mb-6">
                                                        Para agendar aulas experimentais, é necessário preencher o campo <strong>Identificador (CPF/CNPJ)</strong> na conta vinculada ({associatedAccount?.name || 'Conta não encontrada'}).
                                                    </p>
                                                    {associatedAccount && (
                                                        <button 
                                                            onClick={handleOpenAccountDetail}
                                                            className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-gray-800 border border-neutral-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-lg font-bold hover:bg-neutral-50 dark:hover:bg-gray-700 transition-all shadow-sm"
                                                        >
                                                            <Icon name="edit" /> Editar Conta
                                                        </button>
                                                    )}
                                                </div>
                                            ) : (
                                                <>
                                                    {isSchedulingClass ? (
                                                        <div className="border border-neutral-200 dark:border-gray-700 rounded-xl p-6 bg-white dark:bg-gray-800/20 animate-scale-in origin-top shadow-xl">
                                                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">
                                                                {editingClassId ? 'Editar Aula Experimental' : 'Novo Agendamento'}
                                                            </h3>
                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                                <div className="flex flex-col gap-2 md:col-span-2 relative" ref={studentDropdownRef}>
                                                                    <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Aluno da Aula</label>
                                                                    <div className="relative">
                                                                        <input 
                                                                            type="text" 
                                                                            value={studentSearch}
                                                                            onChange={(e) => {
                                                                                setStudentSearch(e.target.value);
                                                                                setIsStudentDropdownOpen(true);
                                                                                setClassFormData(prev => ({ ...prev, studentName: '' }));
                                                                            }}
                                                                            onFocus={() => setIsStudentDropdownOpen(true)}
                                                                            placeholder="Pesquisar aluno por nome..."
                                                                            className={`w-full rounded-lg border border-neutral-200 dark:border-gray-700 bg-neutral-50 dark:bg-gray-800 text-gray-900 dark:text-white p-3 outline-none focus:ring-2 focus:ring-primary/50 transition-all ${classFormData.studentName ? 'border-green-500 dark:border-green-800 ring-1 ring-green-100 dark:ring-green-900/20' : ''}`}
                                                                        />
                                                                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                                                                            {classFormData.studentName ? <Icon name="check_circle" className="text-green-500" /> : <Icon name="search" />}
                                                                        </div>
                                                                    </div>
                                                                    
                                                                    {isStudentDropdownOpen && (
                                                                        <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white dark:bg-[#1e1d24] border border-neutral-200 dark:border-gray-700 rounded-lg shadow-2xl max-h-60 overflow-y-auto">
                                                                            {filteredStudents.length > 0 ? (
                                                                                filteredStudents.map(student => (
                                                                                    <button
                                                                                        key={student.id}
                                                                                        onClick={() => handleStudentSelect(student)}
                                                                                        className="w-full text-left px-4 py-3 text-sm text-gray-700 dark:text-gray-200 hover:bg-neutral-100 dark:hover:bg-gray-700 flex items-center gap-3 border-b border-neutral-50 dark:border-gray-800 last:border-0"
                                                                                    >
                                                                                        <div className="size-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                                                                                            {student.firstName[0]}{student.lastName[0]}
                                                                                        </div>
                                                                                        <div className="flex flex-col">
                                                                                            <span className="font-bold">{student.firstName} {student.lastName}</span>
                                                                                            <span className="text-[10px] text-gray-400 uppercase">{student.school}</span>
                                                                                        </div>
                                                                                    </button>
                                                                                ))
                                                                            ) : (
                                                                                <div className="px-4 py-3 text-sm text-gray-500 italic">Nenhum aluno encontrado.</div>
                                                                            )}
                                                                        </div>
                                                                    )}
                                                                </div>

                                                                <div className="flex flex-col gap-2">
                                                                    <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Data da Aula</label>
                                                                    <input 
                                                                        type="date" 
                                                                        value={classFormData.date}
                                                                        onChange={(e) => setClassFormData(prev => ({...prev, date: e.target.value}))}
                                                                        className="w-full rounded-lg border border-neutral-200 dark:border-gray-700 bg-neutral-50 dark:bg-gray-800 text-gray-900 dark:text-white p-3 outline-none focus:ring-2 focus:ring-primary/50"
                                                                    />
                                                                </div>
                                                                <div className="flex flex-col gap-2">
                                                                    <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Horário</label>
                                                                    <input 
                                                                        type="time" 
                                                                        value={classFormData.time}
                                                                        onChange={(e) => setClassFormData(prev => ({...prev, time: e.target.value}))}
                                                                        className="w-full rounded-lg border border-neutral-200 dark:border-gray-700 bg-neutral-50 dark:bg-gray-800 text-gray-900 dark:text-white p-3 outline-none focus:ring-2 focus:ring-primary/50"
                                                                    />
                                                                </div>
                                                                <div className="flex flex-col gap-2 md:col-span-2">
                                                                    <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Disciplina</label>
                                                                    <select 
                                                                        value={classFormData.discipline}
                                                                        onChange={(e) => setClassFormData(prev => ({...prev, discipline: e.target.value}))}
                                                                        className="w-full rounded-lg border border-neutral-200 dark:border-gray-700 bg-neutral-50 dark:bg-gray-800 text-gray-900 dark:text-white p-3 outline-none focus:ring-2 focus:ring-primary/50"
                                                                    >
                                                                        <option value="" disabled>Selecionar disciplina...</option>
                                                                        {DISCIPLINES.map(d => <option key={d} value={d}>{d}</option>)}
                                                                    </select>
                                                                </div>
                                                            </div>
                                                            <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-100 dark:border-gray-800">
                                                                <button onClick={() => setIsSchedulingClass(false)} className="px-4 py-2 text-sm font-bold text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">Cancelar</button>
                                                                <button onClick={handleSaveClass} className="px-6 py-2 bg-primary text-white rounded-lg text-sm font-bold hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20">
                                                                    {editingClassId ? 'Atualizar Agendamento' : 'Salvar Agendamento'}
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className="flex flex-col gap-4">
                                                            {experimentalClasses.length === 0 ? (
                                                                <div className="flex flex-col items-center justify-center p-12 bg-neutral-50 dark:bg-gray-800/20 border border-dashed border-neutral-300 dark:border-gray-700 rounded-xl text-center">
                                                                    <div className="size-16 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-4">
                                                                        <Icon name="event" className="text-3xl" />
                                                                    </div>
                                                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Nenhuma Aula Agendada</h3>
                                                                    <p className="text-gray-500 dark:text-gray-400 text-sm max-w-sm mb-6">Agende uma aula experimental para que o prospect possa conhecer nossa metodologia.</p>
                                                                    <button onClick={handleStartScheduling} className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20">
                                                                        <Icon name="add" /> Agendar Aula Experimental
                                                                    </button>
                                                                </div>
                                                            ) : (
                                                                <>
                                                                    <div className="flex flex-col gap-4">
                                                                        {experimentalClasses.map((cls) => (
                                                                            <div key={cls.id} className="border border-primary/20 rounded-xl p-5 bg-white dark:bg-gray-800/20 hover:border-primary/40 transition-colors shadow-sm group">
                                                                                <div className="flex justify-between items-start mb-4">
                                                                                    <div className="flex items-center gap-3">
                                                                                        <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                                                                            <Icon name="school" />
                                                                                        </div>
                                                                                        <div>
                                                                                            <h4 className="text-base font-bold text-gray-900 dark:text-white">Aula de {cls.discipline}</h4>
                                                                                            <p className="text-xs text-primary font-bold">{cls.studentName}</p>
                                                                                        </div>
                                                                                    </div>
                                                                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                                        <button onClick={() => handleEditClass(cls)} className="p-2 text-gray-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-colors"><Icon name="edit" className="text-lg" /></button>
                                                                                        <button onClick={() => handleDeleteClass(cls.id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"><Icon name="delete" className="text-lg" /></button>
                                                                                    </div>
                                                                                </div>
                                                                                <div className="grid grid-cols-2 gap-4">
                                                                                    <div className="flex items-center gap-3 p-2 bg-neutral-50 dark:bg-gray-800/40 rounded-lg border border-neutral-100 dark:border-gray-700">
                                                                                        <Icon name="calendar_today" className="text-gray-400 text-sm" />
                                                                                        <div>
                                                                                            <p className="text-[10px] font-bold text-gray-400 uppercase">Data</p>
                                                                                            <p className="text-sm font-bold text-gray-700 dark:text-gray-200">{formatDate(cls.date)}</p>
                                                                                        </div>
                                                                                    </div>
                                                                                    <div className="flex items-center gap-3 p-2 bg-neutral-50 dark:bg-gray-800/40 rounded-lg border border-neutral-100 dark:border-gray-700">
                                                                                        <Icon name="schedule" className="text-gray-400 text-sm" />
                                                                                        <div>
                                                                                            <p className="text-[10px] font-bold text-gray-400 uppercase">Horário</p>
                                                                                            <p className="text-sm font-bold text-gray-700 dark:text-gray-200">{cls.time}</p>
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                    <button 
                                                                        onClick={handleStartScheduling}
                                                                        className="flex items-center justify-center gap-2 w-full py-4 border-2 border-dashed border-neutral-200 dark:border-gray-700 rounded-xl text-gray-400 hover:text-primary hover:border-primary/50 hover:bg-primary/5 transition-all font-bold text-sm"
                                                                    >
                                                                        <Icon name="add_circle" /> Agendar Outra Aula Experimental
                                                                    </button>
                                                                </>
                                                            )}
                                                        </div>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                    )}

                                    {activeTab === 'Notas' && (<div className="py-6 flex flex-col gap-6 animate-fade-in"><div className="flex flex-col gap-4">{notes.map(note => (<div key={note.id} className="p-4 rounded-lg bg-neutral-50 dark:bg-gray-800/50 border border-neutral-200 dark:border-gray-700"><p className="text-sm text-gray-900 dark:text-gray-100 whitespace-pre-wrap">{note.content}</p><div className="flex items-center gap-2 mt-3 text-xs text-gray-500 dark:text-gray-400"><span className="font-semibold">{note.author}</span><span>•</span><span>{formatDate(note.createdAt)}</span></div></div>))}{notes.length === 0 && (<div className="text-center text-gray-500 dark:text-gray-400 py-4 italic">Nenhuma nota registrada.</div>)}</div><div className="border-t border-gray-200 dark:border-gray-700 pt-6">{!isAddingNote ? (<button onClick={() => setIsAddingNote(true)} className="flex items-center gap-2 text-primary font-bold text-sm hover:underline"><Icon name="add" className="text-lg" /> Adicionar nota</button>) : (<div className="flex flex-col gap-3 animate-scale-in origin-top"><textarea autoFocus value={noteText} onChange={(e) => setNoteText(e.target.value)} placeholder="Digite sua nota aqui..." rows={3} className="w-full rounded-lg border border-neutral-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none p-3" /><div className="flex gap-2"><button onClick={handleAddNote} disabled={!noteText.trim()} className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-bold hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">Salvar</button><button onClick={() => { setIsAddingNote(false); setNoteText(''); }} className="px-4 py-2 bg-transparent border border-neutral-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-bold hover:bg-neutral-100 dark:hover:bg-gray-700 transition-colors">Cancelar</button></div></div>)}</div></div>)}
                                    {activeTab === 'Tarefas' && (<div className="py-6 flex flex-col gap-4 animate-fade-in"><div className="flex flex-col gap-3">{tasks.map((task) => (<div key={task.id} className="flex flex-col sm:flex-row sm:items-center p-3 rounded-lg border border-neutral-200 dark:border-gray-700 bg-neutral-50 dark:bg-gray-800/50 gap-2"><div className="flex items-start sm:items-center flex-1"><input type="checkbox" className="mt-1 sm:mt-0 mr-3 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer" checked={task.isCompleted} onChange={() => toggleTask(task.id)}/><div className="flex-1"><input type="text" value={task.title} onChange={(e) => handleTaskChange(task.id, 'title', e.target.value)} className={`text-sm font-medium bg-transparent border-b border-transparent focus:border-primary outline-none w-full ${task.isCompleted ? 'line-through text-gray-500' : 'text-gray-900 dark:text-gray-100'}`}/><div className="flex flex-wrap gap-x-4 mt-1 items-center"><div className="flex items-center gap-1"><span className="text-xs font-semibold text-gray-500 dark:text-gray-400">Data Fim:</span><input type="date" value={task.dueDate} onChange={(e) => handleTaskChange(task.id, 'dueDate', e.target.value)} className="bg-transparent border-none text-xs text-gray-500 dark:text-gray-400 focus:ring-0 p-0" /></div>{task.isCompleted && (<p className="text-xs text-green-600 dark:text-green-400"><span className="font-semibold">Conclusão:</span> {formatDate(task.completedDate)}</p>)}</div></div></div></div>))}<div className="flex items-center gap-4 mt-2"><button onClick={handleAddTask} className="flex items-center text-sm text-primary font-bold hover:underline"><Icon name="add" className="text-lg mr-1" /> Adicionar nova tarefa</button>{hasTaskChanges && (<button onClick={handleSaveTasks} className="px-4 py-1.5 rounded-md bg-primary text-white text-xs font-bold hover:bg-primary/90 transition-colors shadow-sm animate-fade-in">Salvar Alterações</button>)}</div></div></div>)}
                                    {activeTab === 'Timeline' && (<div className="py-6 flex flex-col gap-4 animate-fade-in"><TimelineItem icon="add_call" title="Ligação de Descoberta" desc="Discutido escopo inicial, orçamento e prazos. Cliente demonstrou alto interesse." date="21 Mai, 2024" /><TimelineItem icon="send" title="Proposta Enviada" desc="Enviada proposta v1 para revisão técnica." date="22 Mai, 2024" /><TimelineItem icon="event" title="Reunião Agendada" desc="Apresentação da solução para os stakeholders." date="24 Mai, 2024" iconClass="bg-transparent" /></div>)}
                                </div>
                            </div>
                        </div>
                    </main>
                </div>
            </Modal>

            <ConfirmStageModal isOpen={!!pendingStage} onClose={() => setPendingStage(null)} onConfirm={confirmStageChange} currentStage={currentStage} targetStage={pendingStage || ''} />
            <LossReasonModal isOpen={isLossModalOpen} onClose={() => setIsLossModalOpen(false)} onConfirm={handleConfirmLoss} />
            <ConfirmDeleteModal 
                isOpen={isDeleteModalOpen} 
                onClose={() => setIsDeleteModalOpen(false)} 
                onConfirm={confirmDelete} 
                leadName={opportunity.name}
                entityType="Oportunidade" 
            />
            <ProposalDetailModal isOpen={!!selectedProposal} onClose={() => setSelectedProposal(null)} proposal={selectedProposal} opportunityName={opportunity.name} onUpdate={handleUpdateProposal} />
            
            {/* Account Detail Modal */}
            <AccountDetailModal 
                isOpen={isAccountModalOpen} 
                onClose={() => setIsAccountModalOpen(false)} 
                account={associatedAccount}
                onUpdate={handleUpdateAccountFromDetail}
                onDelete={handleDeleteAccountFromDetail}
            />
        </>
    );
};
