
import React, { useState, useEffect } from 'react';
import { Modal } from './ui/Modal';
import { LeadCardData } from '../types';
import { Icon } from './ui/Icon';
import { ConfirmStageModal } from './ConfirmStageModal';
import { ConfirmDeleteModal } from './ConfirmDeleteModal';

interface LeadDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    lead: LeadCardData | null;
    currentStatus: string;
    onUpdate: (lead: LeadCardData) => void;
    onDelete?: (id: string) => void;
    onMove: (leadId: string, targetStage: string) => void;
}

interface Task {
    id: string;
    title: string;
    isCompleted: boolean;
    dueDate: string; // YYYY-MM-DD
    completedDate: string | null; // YYYY-MM-DD or ISO string
}

const MOCK_INITIAL_TASKS: Task[] = [
    {
        id: 't1',
        title: 'Enviar proposta comercial',
        isCompleted: false,
        dueDate: new Date().toISOString().split('T')[0], // Today
        completedDate: null
    },
    {
        id: 't2',
        title: 'Ligar para confirmação',
        isCompleted: true,
        dueDate: '2023-10-25',
        completedDate: '2023-10-24'
    }
];

const COUNTRY_CODES = [
  { name: 'Brasil', code: '+55' },
  { name: 'EUA', code: '+1' },
  { name: 'Portugal', code: '+351' },
  { name: 'Reino Unido', code: '+44' },
  { name: 'Alemanha', code: '+49' },
  { name: 'França', code: '+33' },
  { name: 'Espanha', code: '+34' },
  { name: 'Itália', code: '+39' },
  { name: 'Argentina', code: '+54' },
  { name: 'Uruguai', code: '+598' },
];

const DetailDisplayItem: React.FC<{ label: string; value: React.ReactNode; fullWidth?: boolean; className?: string }> = ({ label, value, fullWidth = false, className = '' }) => (
    <div className={`${fullWidth ? 'col-span-1 md:col-span-2' : ''} ${className}`}>
        <p className="text-xs text-primary dark:text-primary/80 font-bold uppercase tracking-wider">{label}</p>
        <div className="text-gray-900 dark:text-gray-100 text-base mt-1 break-words">{value}</div>
    </div>
);

const DetailInputItem: React.FC<{ 
    label: string; 
    name: string; 
    value: string; 
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void; 
    fullWidth?: boolean;
    type?: 'text' | 'textarea' | 'select';
    options?: string[];
}> = ({ label, name, value, onChange, fullWidth = false, type = 'text', options = [] }) => {
    return (
        <div className={fullWidth ? 'col-span-1 md:col-span-2' : ''}>
            <p className="text-xs text-primary dark:text-primary/80 font-bold uppercase tracking-wider mb-1">{label}</p>
            {type === 'textarea' ? (
                <textarea
                    name={name}
                    value={value}
                    onChange={onChange}
                    rows={3}
                    className="w-full rounded-md border-neutral-200 dark:border-gray-700 bg-neutral-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm focus:ring-primary focus:border-primary p-2"
                />
            ) : type === 'select' ? (
                <select
                    name={name}
                    value={value}
                    onChange={onChange}
                    className="w-full rounded-md border-neutral-200 dark:border-gray-700 bg-neutral-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm focus:ring-primary focus:border-primary p-2"
                >
                    {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
            ) : (
                <input
                    type="text"
                    name={name}
                    value={value}
                    onChange={onChange}
                    className="w-full rounded-md border-neutral-200 dark:border-gray-700 bg-neutral-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm focus:ring-primary focus:border-primary p-2"
                />
            )}
        </div>
    );
};

const Step: React.FC<{ label: string; active: boolean; completed: boolean; onClick: () => void }> = ({ label, active, completed, onClick }) => {
    let bgClass = 'bg-neutral-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-neutral-200 dark:hover:bg-gray-700 cursor-pointer';
    if (active) bgClass = 'bg-primary text-white font-bold cursor-default';
    if (completed) bgClass = 'bg-primary/20 text-primary dark:text-primary/80 font-medium hover:bg-primary/30 cursor-pointer';

    return (
        <div className="flex items-center group">
            <button 
                onClick={onClick}
                className={`px-3 py-1 rounded-full text-sm transition-all duration-200 ${bgClass}`}
                disabled={active}
            >
                {label}
            </button>
            <Icon name="chevron_right" className="text-neutral-300 dark:text-gray-600 mx-1" />
        </div>
    );
};

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

export const LeadDetailModal: React.FC<LeadDetailModalProps> = ({ isOpen, onClose, lead, currentStatus, onUpdate, onDelete, onMove }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState<LeadCardData | null>(null);
    const [activeTab, setActiveTab] = useState<'Timeline' | 'Tarefas'>('Timeline');
    
    // Phone Edit State
    const [phoneCountryCode, setPhoneCountryCode] = useState('+55');
    const [phoneNumber, setPhoneNumber] = useState('');

    // State for stage change confirmation
    const [pendingStage, setPendingStage] = useState<string | null>(null);
    // State for delete confirmation
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    // Task State
    const [tasks, setTasks] = useState<Task[]>(MOCK_INITIAL_TASKS);
    const [hasTaskChanges, setHasTaskChanges] = useState(false);

    useEffect(() => {
        if (lead) {
            setFormData(lead);
            
            // Parse phone number for editing
            const phone = lead.phone || '';
            const foundCode = COUNTRY_CODES.find(c => phone.startsWith(c.code));
            if (foundCode) {
                setPhoneCountryCode(foundCode.code);
                setPhoneNumber(phone.replace(foundCode.code, ''));
            } else {
                setPhoneCountryCode('+55');
                setPhoneNumber(phone);
            }

            setIsEditing(false); // Reset edit mode when opening a new lead
            setActiveTab('Timeline'); // Reset tab
            setPendingStage(null);
            setIsDeleteModalOpen(false);
            
            // Reset tasks logic for demo (In real app, fetch tasks for this lead)
            setTasks(MOCK_INITIAL_TASKS);
            setHasTaskChanges(false);
        }
    }, [lead, isOpen, currentStatus]); // Added currentStatus to re-sync if changed externally

    if (!lead || !formData) return null;

    // Define the funnel steps for the stepper
    const steps = ['Novo Lead', 'Atendimento', 'FUP', 'Pré-qualificado', 'Qualificado'];
    // Logic to determine if a step is active or completed
    const getStepStatus = (step: string) => {
        const currentIndex = steps.indexOf(currentStatus);
        const stepIndex = steps.indexOf(step);
        
        if (currentIndex === -1) {
            // If status is not in the main funnel (e.g. Desqualificado)
            return { active: false, completed: false };
        }
        
        return {
            active: step === currentStatus,
            completed: stepIndex < currentIndex
        };
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => prev ? ({ ...prev, [name]: value }) : null);
    };

    const handlePhoneCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newCode = e.target.value;
        setPhoneCountryCode(newCode);
        const fullPhone = `${newCode}${phoneNumber}`;
        setFormData(prev => prev ? ({ ...prev, phone: fullPhone }) : null);
    };

    const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        // Allow digits only
        const val = e.target.value.replace(/\D/g, '');
        setPhoneNumber(val);
        const fullPhone = `${phoneCountryCode}${val}`;
        setFormData(prev => prev ? ({ ...prev, phone: fullPhone }) : null);
    };

    const handleSave = () => {
        if (formData) {
            onUpdate(formData);
            setIsEditing(false);
        }
    };

    const handleCancel = () => {
        setFormData(lead); // Reset to original
        // Reset phone local state
        const phone = lead.phone || '';
        const foundCode = COUNTRY_CODES.find(c => phone.startsWith(c.code));
        if (foundCode) {
            setPhoneCountryCode(foundCode.code);
            setPhoneNumber(phone.replace(foundCode.code, ''));
        } else {
            setPhoneCountryCode('+55');
            setPhoneNumber(phone);
        }
        setIsEditing(false);
    };

    // Stage Change Logic
    const requestStageChange = (targetStage: string) => {
        if (targetStage === currentStatus) return;
        setPendingStage(targetStage);
    };

    const confirmStageChange = () => {
        if (pendingStage) {
            onMove(lead.id, pendingStage);
            setPendingStage(null);
        }
    };

    // Delete Logic
    const handleDeleteClick = () => {
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = () => {
        if (onDelete && lead) {
            onDelete(lead.id);
            setIsDeleteModalOpen(false); 
            onClose();
        }
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
            id: `t-${Date.now()}`,
            title: 'Nova Tarefa',
            isCompleted: false,
            dueDate: tomorrow.toISOString().split('T')[0],
            completedDate: null
        };
        setTasks(prev => [...prev, newTask]);
        setHasTaskChanges(true);
    };

    const handleSaveTasks = () => {
        // Here you would typically make an API call to save tasks
        console.log('Saving tasks:', tasks);
        setHasTaskChanges(false);
    };

    const formatDate = (dateString: string | null) => {
        if (!dateString) return '-';
        const [year, month, day] = dateString.split('-');
        return `${day}/${month}/${year}`;
    };

    return (
        <>
            <Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-7xl">
                <div className="flex flex-col h-full max-h-[90vh]">
                    {/* Header */}
                    <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-6 border-b border-neutral-100 dark:border-gray-800">
                        <div className="flex flex-col gap-4 w-full sm:w-auto">
                            <div className="flex flex-col justify-center">
                                <h1 className="text-gray-900 dark:text-white text-2xl sm:text-3xl font-bold leading-tight tracking-tight">
                                    {formData.name}
                                </h1>
                            </div>
                            <div className="flex flex-wrap items-center gap-1 text-sm overflow-x-auto pb-1">
                                {steps.map(step => {
                                    const { active, completed } = getStepStatus(step);
                                    return (
                                        <Step 
                                            key={step} 
                                            label={step} 
                                            active={active} 
                                            completed={completed} 
                                            onClick={() => requestStageChange(step)}
                                        />
                                    );
                                })}
                                {/* Handle special statuses not in the main flow */}
                                {!steps.includes(currentStatus) && (
                                    <span className={`px-3 py-1 rounded-full font-bold text-xs uppercase tracking-wide ${currentStatus === 'Desqualificado' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}>
                                        {currentStatus}
                                    </span>
                                )}
                                
                                {/* Allow moving to Desqualificado if not already */}
                                {currentStatus !== 'Desqualificado' && currentStatus !== 'Perdido' && (
                                    <button 
                                        onClick={() => requestStageChange('Desqualificado')}
                                        className="px-3 py-1 ml-2 rounded-full text-xs font-bold text-red-500 border border-red-200 dark:border-red-900 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                    >
                                        Desqualificar
                                    </button>
                                )}
                            </div>
                        </div>
                        
                        <div className="flex w-full flex-wrap gap-3 sm:w-auto self-start sm:self-center">
                            {isEditing ? (
                                <>
                                    <button 
                                        onClick={handleCancel}
                                        className="flex h-10 px-4 items-center justify-center rounded-lg border border-neutral-200 dark:border-gray-700 hover:bg-neutral-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 transition-colors font-medium text-sm"
                                    >
                                        Cancelar
                                    </button>
                                    <button 
                                        onClick={handleSave}
                                        className="flex h-10 px-4 items-center justify-center rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors font-medium text-sm shadow-sm"
                                    >
                                        Salvar
                                    </button>
                                </>
                            ) : (
                                <>
                                    <button 
                                        onClick={() => setIsEditing(true)}
                                        className="flex size-10 cursor-pointer items-center justify-center overflow-hidden rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                                        title="Editar Lead"
                                    >
                                        <Icon name="edit" className="text-xl" />
                                    </button>
                                    {onDelete && (
                                        <button 
                                            onClick={handleDeleteClick}
                                            className="flex size-10 cursor-pointer items-center justify-center overflow-hidden rounded-lg bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                                            title="Excluir Lead"
                                        >
                                            <Icon name="delete" className="text-xl" />
                                        </button>
                                    )}
                                </>
                            )}
                        </div>
                    </header>

                    {/* Main Content */}
                    <main className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 p-6 overflow-y-auto">
                        {/* Left Column: Lead Info */}
                        <div className="lg:col-span-1 flex flex-col gap-6">
                            <div className="border border-neutral-200 dark:border-gray-700 rounded-xl p-6 bg-white dark:bg-background-dark shadow-sm">
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">Lead Info</h2>
                                </div>
                                
                                {isEditing ? (
                                    <div className="flex flex-col gap-6">
                                        {/* Group: Contact */}
                                        <div className="flex flex-col gap-3">
                                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100 dark:border-gray-800 pb-1 mb-1">Informações de Contato</h3>
                                            <div className="grid grid-cols-1 gap-3">
                                                <DetailInputItem label="Nome completo" name="name" value={formData.name} onChange={handleInputChange} fullWidth />
                                                <DetailInputItem label="Email" name="email" value={formData.email} onChange={handleInputChange} fullWidth />
                                                
                                                {/* Phone Field (Split for Edit) */}
                                                <div className="col-span-1 md:col-span-2">
                                                    <p className="text-xs text-primary dark:text-primary/80 font-bold uppercase tracking-wider mb-1">Telefone</p>
                                                    <div className="flex gap-2">
                                                        <div className="relative w-32 shrink-0">
                                                            <select 
                                                                value={phoneCountryCode}
                                                                onChange={handlePhoneCountryChange}
                                                                className="w-full rounded-md border-neutral-200 dark:border-gray-700 bg-neutral-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm focus:ring-primary focus:border-primary p-2 pr-8 appearance-none"
                                                            >
                                                                {COUNTRY_CODES.map(c => (
                                                                    <option key={c.name} value={c.code}>{c.code}</option>
                                                                ))}
                                                            </select>
                                                            <div className="pointer-events-none absolute top-1/2 right-2 -translate-y-1/2 text-gray-500">
                                                                <Icon name="expand_more" style={{fontSize: '16px'}} />
                                                            </div>
                                                        </div>
                                                        <input
                                                            type="text"
                                                            value={phoneNumber}
                                                            onChange={handlePhoneNumberChange}
                                                            className="w-full rounded-md border-neutral-200 dark:border-gray-700 bg-neutral-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm focus:ring-primary focus:border-primary p-2"
                                                            placeholder="DDD + Número"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Group: Tracking */}
                                        <div className="flex flex-col gap-3">
                                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100 dark:border-gray-800 pb-1 mb-1">Origem & Rastreamento</h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                <DetailInputItem 
                                                    label="Source" 
                                                    name="source" 
                                                    value={formData.source} 
                                                    onChange={handleInputChange} 
                                                    type="select" 
                                                    options={['Google Ads', 'Facebook Ads', 'Site', 'Instagram', 'Indicação', 'LinkedIn', 'Evento', 'Outros']}
                                                    fullWidth
                                                />
                                                <DetailInputItem label="Medium" name="medium" value={formData.medium || ''} onChange={handleInputChange} />
                                                <DetailInputItem label="Campaign" name="campaign" value={formData.campaign || ''} onChange={handleInputChange} />
                                                <DetailInputItem label="Term" name="term" value={formData.term || ''} onChange={handleInputChange} />
                                                <DetailInputItem label="Content" name="content" value={formData.content || ''} onChange={handleInputChange} />
                                            </div>
                                        </div>

                                        {/* Group: Notes */}
                                        <div className="flex flex-col gap-3">
                                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100 dark:border-gray-800 pb-1 mb-1">Anotações</h3>
                                            <DetailInputItem label="Observações" name="note" value={formData.note || ''} onChange={handleInputChange} type="textarea" fullWidth />
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex flex-col gap-6">
                                        {/* Group: Contact */}
                                        <div className="grid grid-cols-1 gap-4">
                                            <DetailDisplayItem label="Nome completo" value={formData.name} fullWidth />
                                            <DetailDisplayItem label="Email" value={<span className="truncate block" title={formData.email}>{formData.email}</span>} fullWidth />
                                            <DetailDisplayItem label="Telefone" value={formData.phone} fullWidth />
                                            
                                            {/* Disqualification Reason - Visible if Disqualified or just read-only info */}
                                            <div className="col-span-1 md:col-span-2">
                                                <p className="text-xs text-primary dark:text-primary/80 font-bold uppercase tracking-wider">Motivo de Desqualificação</p>
                                                <div className={`text-base mt-1 break-words ${formData.disqualificationReason ? 'text-red-500 font-medium' : 'text-gray-400 italic'}`}>
                                                    {formData.disqualificationReason || 'N/A'}
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <hr className="border-gray-100 dark:border-gray-800" />
                                        
                                        {/* Group: Tracking/Source */}
                                        <div>
                                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Origem & Rastreamento</h3>
                                            <div className="grid grid-cols-2 gap-x-4 gap-y-4">
                                                <DetailDisplayItem label="Source" value={formData.source} fullWidth />
                                                <DetailDisplayItem label="Medium" value={formData.medium || '-'} />
                                                <DetailDisplayItem label="Campaign" value={formData.campaign || '-'} />
                                                <DetailDisplayItem label="Term" value={formData.term || '-'} />
                                                <DetailDisplayItem label="Content" value={formData.content || '-'} />
                                            </div>
                                        </div>

                                        <hr className="border-gray-100 dark:border-gray-800" />

                                        {/* Group: Other */}
                                        <div className="grid grid-cols-1 gap-4">
                                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider -mb-2">Anotações</h3>
                                            <DetailDisplayItem 
                                                label="Observações" 
                                                value={<span className="italic text-gray-500 dark:text-gray-400">{formData.note || 'Nenhuma observação.'}</span>} 
                                                fullWidth 
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Right Column: Timeline & Tabs */}
                        <div className="lg:col-span-2 flex flex-col">
                            <div className="flex border-b border-neutral-200 dark:border-gray-700 gap-8 px-4">
                                {['Timeline', 'Tarefas'].map(tab => (
                                    <button
                                        key={tab}
                                        onClick={() => setActiveTab(tab as any)}
                                        className={`flex flex-col items-center justify-center border-b-[3px] pb-[13px] pt-4 cursor-pointer transition-colors ${
                                            activeTab === tab 
                                                ? 'border-b-primary' 
                                                : 'border-b-transparent'
                                        }`}
                                    >
                                        <p className={`text-sm font-bold leading-normal tracking-[0.015em] ${
                                            activeTab === tab 
                                                ? 'text-primary' 
                                                : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                                        }`}>
                                            {tab}
                                        </p>
                                    </button>
                                ))}
                            </div>
                            
                            <div className="pt-6 flex flex-col gap-4">
                                {/* Content switching based on activeTab */}
                                {activeTab === 'Timeline' && (
                                    <>
                                        <TimelineItem 
                                            icon="add_call" 
                                            title="Initial Discovery Call Logged" 
                                            desc="Discussed initial needs and project scope. Lead showed strong interest." 
                                            date="May 21, 2024" 
                                        />
                                        <TimelineItem 
                                            icon="send" 
                                            title="Follow-up Email Sent" 
                                            desc="Sent a summary of our call and links to relevant case studies." 
                                            date="May 22, 2024" 
                                        />
                                        <TimelineItem 
                                            icon="event" 
                                            title="Product Demo Scheduled" 
                                            desc="Scheduled a 45-minute demo for next Tuesday." 
                                            date="May 24, 2024" 
                                            iconClass="bg-transparent"
                                        />
                                    </>
                                )}

                                {activeTab === 'Tarefas' && (
                                    <div className="flex flex-col gap-3">
                                        {tasks.map((task) => (
                                            <div key={task.id} className="flex flex-col sm:flex-row sm:items-center p-3 rounded-lg border border-neutral-200 dark:border-gray-700 bg-neutral-50 dark:bg-gray-800/50 gap-2">
                                                <div className="flex items-start sm:items-center flex-1">
                                                    <input 
                                                        type="checkbox" 
                                                        className="mt-1 sm:mt-0 mr-3 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer" 
                                                        checked={task.isCompleted}
                                                        onChange={() => toggleTask(task.id)}
                                                    />
                                                    <div className="flex-1">
                                                        <input
                                                            type="text"
                                                            value={task.title}
                                                            onChange={(e) => handleTaskChange(task.id, 'title', e.target.value)}
                                                            className={`text-sm font-medium bg-transparent border-b border-transparent focus:border-primary outline-none w-full ${task.isCompleted ? 'line-through text-gray-500' : 'text-gray-900 dark:text-gray-100'}`}
                                                        />
                                                        <div className="flex flex-wrap gap-x-4 mt-1 items-center">
                                                            <div className="flex items-center gap-1">
                                                                <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">Data Fim:</span>
                                                                <input
                                                                    type="date"
                                                                    value={task.dueDate}
                                                                    onChange={(e) => handleTaskChange(task.id, 'dueDate', e.target.value)}
                                                                    className="bg-transparent border-none text-xs text-gray-500 dark:text-gray-400 focus:ring-0 p-0"
                                                                />
                                                            </div>
                                                            {task.isCompleted && (
                                                                <p className="text-xs text-green-600 dark:text-green-400">
                                                                    <span className="font-semibold">Conclusão:</span> {formatDate(task.completedDate)}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                        
                                        <div className="flex items-center gap-4 mt-2">
                                            <button 
                                                onClick={handleAddTask}
                                                className="flex items-center text-sm text-primary font-bold hover:underline"
                                            >
                                                <Icon name="add" className="text-lg mr-1" /> Adicionar nova tarefa
                                            </button>
                                            
                                            {hasTaskChanges && (
                                                <button 
                                                    onClick={handleSaveTasks}
                                                    className="px-4 py-1.5 rounded-md bg-primary text-white text-xs font-bold hover:bg-primary/90 transition-colors shadow-sm animate-fade-in"
                                                >
                                                    Salvar Alterações
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </main>
                </div>
            </Modal>

            {/* Confirmation Modal */}
            <ConfirmStageModal
                isOpen={!!pendingStage}
                onClose={() => setPendingStage(null)}
                onConfirm={confirmStageChange}
                currentStage={currentStatus}
                targetStage={pendingStage || ''}
            />

             {/* Delete Confirmation Modal */}
             <ConfirmDeleteModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={confirmDelete}
                leadName={lead.name}
            />
        </>
    );
};
