
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Modal } from './ui/Modal';
import { Icon } from './ui/Icon';
import { Proposal, ProductGroup, ProductItem, ProposalTask, PaymentInfo, Contact, CardData } from '../types';
import { ConfirmDeleteModal } from './ConfirmDeleteModal';
import { ConfirmProposalStageModal } from './ConfirmProposalStageModal';
import { ProductDetailModal, ProductResult } from './ProductDetailModal';
import { ContactDetailModal } from './ContactDetailModal';
import { OpportunityDetailModal } from './OpportunityDetailModal';
import { getOpportunityById, updateOpportunity, moveOpportunity, deleteOpportunity } from '../dataStore';
import { INITIAL_CONTACTS_DATA } from '../constants';

interface ProposalDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    proposal: Proposal | null;
    opportunityName?: string;
    contactName?: string;
    onUpdate?: (proposal: Proposal) => void;
    onDelete?: (proposalId: string) => void;
}

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

// Initial Mock Data for the editable section
const DEFAULT_PAYMENT_DATA: PaymentInfo = {
    installments: '12x',
    expiryDate: '2024-12-31',
    paymentMethods: 'Cartão de Crédito, Boleto',
    contractPeriod: '12 meses',
    contractStatus: 'Pendente'
};

const PAYMENT_METHOD_OPTIONS = [
    'Cartão de Crédito, Boleto',
    'Boleto',
    'Cartão de Crédito',
    'Pix',
    'Boleto, Pix'
];

const CONTRACT_PERIOD_OPTIONS = [
    '6 meses',
    '12 meses',
    '24 meses',
    '36 meses',
    '48 meses'
];

const CONTRACT_STATUS_OPTIONS = [
    'Pendente',
    'Enviado',
    'Assinado',
    'Cancelado',
    'Expirado'
];

const INSTALLMENT_OPTIONS = Array.from({ length: 12 }, (_, i) => `${i + 1}x`);

const MOCK_PRODUCTS: ProductGroup[] = [
    {
        id: 'prod-1',
        name: 'Trilha',
        quantity: '1x',
        price: 'R$ 15.000,00',
        items: [
            { id: 'i1', label: 'Aulas', tag: 'Matemática', quantity: '10x' },
            { id: 'i2', label: 'Avaliações diagnósticas', tag: 'Matemática', quantity: '2x' },
            { id: 'i3', label: 'Avaliações de progresso', tag: 'Matemática', quantity: '4x' },
            { id: 'i4', label: 'Suportes pedagógicos', quantity: '1x' }
        ]
    }
];

const MOCK_INITIAL_TASKS: ProposalTask[] = [
    { id: 't1', title: 'Follow-up com cliente', dueDate: '2024-11-20', isCompleted: true },
    { id: 't2', title: 'Obter aprovação interna', dueDate: '2024-11-25', isCompleted: false },
    { id: 't3', title: 'Enviar versão finalizada', dueDate: '2024-11-30', isCompleted: false }
];

// Helper functions for currency
const parseCurrency = (value: string): number => {
    if (!value) return 0;
    const cleanValue = value.replace(/[^\d,]/g, '').replace(',', '.');
    return parseFloat(cleanValue) || 0;
};

const formatCurrency = (value: number): string => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};

export const ProposalDetailModal: React.FC<ProposalDetailModalProps> = ({ 
    isOpen, 
    onClose, 
    proposal,
    opportunityName = 'Plano de Aula #OP12345',
    contactName = 'Escola B C D',
    onUpdate,
    onDelete
}) => {
    const [isEditing, setIsEditing] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    
    // State for navigation modals
    const [isContactModalOpen, setIsContactModalOpen] = useState(false);
    const [isOpportunityModalOpen, setIsOpportunityModalOpen] = useState(false);

    // State for stage confirmation
    const [pendingStage, setPendingStage] = useState<string | null>(null);

    // State for Product Modal
    const [isProductModalOpen, setIsProductModalOpen] = useState(false);

    // State for editable fields (Formas de Pagamento)
    const [formData, setFormData] = useState<PaymentInfo>(DEFAULT_PAYMENT_DATA);
    
    // State for Products
    const [products, setProducts] = useState<ProductGroup[]>([]);
    
    // State for Discount
    const [discount, setDiscount] = useState('0,00');

    // State for Contact Edit
    const [currentContactName, setCurrentContactName] = useState(contactName || '');
    const [isContactSearchOpen, setIsContactSearchOpen] = useState(false);
    const contactSearchRef = useRef<HTMLDivElement>(null);

    // State for Tasks
    const [tasks, setTasks] = useState<ProposalTask[]>([]);
    const [hasTaskChanges, setHasTaskChanges] = useState(false);

    // Store initial state to revert on Cancel
    const initialFormData = useRef<PaymentInfo>(DEFAULT_PAYMENT_DATA);
    const initialDiscount = useRef('0,00');
    const initialContactName = useRef(contactName || '');

    // Reset internal state when modal opens/closes
    useEffect(() => {
        if (isOpen) {
            setPendingStage(null);
            setIsEditing(false);
            setIsDeleteModalOpen(false);
            setHasTaskChanges(false);
            setIsContactModalOpen(false);
            setIsOpportunityModalOpen(false);
            setIsContactSearchOpen(false);
            
            const initContact = contactName || '';
            setCurrentContactName(initContact);
            initialContactName.current = initContact;

            // Load Payment Data
            if (proposal && proposal.paymentInfo) {
                setFormData({
                    ...DEFAULT_PAYMENT_DATA,
                    ...proposal.paymentInfo
                });
                initialFormData.current = { ...DEFAULT_PAYMENT_DATA, ...proposal.paymentInfo };
            } else {
                setFormData(DEFAULT_PAYMENT_DATA); 
                initialFormData.current = DEFAULT_PAYMENT_DATA;
            }
            
            // Load Discount
            const loadedDiscount = proposal?.discount || '0,00';
            setDiscount(loadedDiscount);
            initialDiscount.current = loadedDiscount;
            
            // Load Products
            if (proposal && proposal.products) {
                setProducts(proposal.products);
            } else {
                setProducts(JSON.parse(JSON.stringify(MOCK_PRODUCTS)));
            }

            // Load Tasks
            if (proposal && proposal.tasks) {
                setTasks(proposal.tasks);
            } else {
                setTasks(JSON.parse(JSON.stringify(MOCK_INITIAL_TASKS)));
            }
            
            setIsProductModalOpen(false);
        }
    }, [isOpen, proposal]);

    // Handle click outside contact dropdown
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (contactSearchRef.current && !contactSearchRef.current.contains(event.target as Node)) {
                setIsContactSearchOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Calculate Totals
    const subtotalValue = products.reduce((acc, product) => {
        return acc + parseCurrency(product.price);
    }, 0);

    const discountValue = parseCurrency(discount);
    const totalValue = Math.max(0, subtotalValue - discountValue);

    // Look up the contact object based on the currently selected name
    const fullContact = useMemo(() => {
        const found = INITIAL_CONTACTS_DATA.find(c => c.name === currentContactName);
        if (found) return found;
        
        // Fallback: Create a temporary contact object if name exists but not in DB
        // This ensures the detail modal can still open
        if (currentContactName) {
            return {
                id: 'temp-contact',
                name: currentContactName,
                account: '',
                phone: '',
                email: '',
                cpf: '',
                country: 'Brasil'
            } as Contact;
        }
        return null;
    }, [currentContactName]);

    // Filter contacts for dropdown
    const filteredContacts = useMemo(() => {
        const term = currentContactName.toLowerCase();
        return INITIAL_CONTACTS_DATA.filter(c => c.name.toLowerCase().includes(term));
    }, [currentContactName]);

    const fullOpportunity = useMemo(() => {
        if (!proposal?.opportunityId) return null;
        return getOpportunityById(proposal.opportunityId);
    }, [proposal?.opportunityId, isOpportunityModalOpen]);

    if (!proposal) return null;

    const steps = ['Rascunho', 'Enviada', 'Revisão', 'Aceita', 'Rejeitada', 'Cancelada'];

    const handleSave = () => {
        setIsEditing(false);
        initialFormData.current = formData; 
        initialDiscount.current = discount;
        initialContactName.current = currentContactName;
        
        if (onUpdate) {
            onUpdate({ 
                ...proposal, 
                products,
                tasks, // Persist tasks
                value: formatCurrency(totalValue),
                discount: discount,
                paymentInfo: formData,
                // Pass contactName. Note: This requires the store to handle merging `contactName` into the proposal card data.
                // We cast to any to bypass strict type check on the basic Proposal interface which might not strictly list contactName
                ...({ contactName: currentContactName } as any) 
            });
        }
    };

    const handleCancel = () => {
        setIsEditing(false);
        setFormData(initialFormData.current);
        setDiscount(initialDiscount.current);
        setCurrentContactName(initialContactName.current);
        if (proposal.products) {
            setProducts(proposal.products);
        } else {
             setProducts(JSON.parse(JSON.stringify(MOCK_PRODUCTS)));
        }
    };

    const handleDeleteClick = () => {
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = () => {
        if (onDelete) {
            onDelete(proposal.id);
        }
        setIsDeleteModalOpen(false);
        onClose();
    };
    
    const handleStageClick = (newStatus: string) => {
        if (newStatus !== proposal.status) {
            setPendingStage(newStatus);
        }
    };

    const confirmStageChange = () => {
        if (onUpdate && proposal && pendingStage) {
            onUpdate({ ...proposal, status: pendingStage as any });
        }
        setPendingStage(null);
    };

    const getStepStatus = (step: string) => {
        const currentIndex = steps.indexOf(proposal.status);
        const stepIndex = steps.indexOf(step);
        
        return {
            active: step === proposal.status,
            completed: stepIndex < currentIndex
        };
    };

    const handleInputChange = (field: keyof PaymentInfo, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleDiscountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value.replace(/[^0-9,]/g, '');
        setDiscount(val);
    };

    const handleRemoveProduct = (productId: string) => {
        const updatedProducts = products.filter(p => p.id !== productId);
        setProducts(updatedProducts);
    };

    // Task Handlers
    const handleToggleTask = (taskId: string) => {
        setTasks(prev => prev.map(t => t.id === taskId ? { ...t, isCompleted: !t.isCompleted } : t));
        setHasTaskChanges(true);
    };

    const handleAddTask = () => {
        const newTask: ProposalTask = {
            id: `task-${Date.now()}`,
            title: '',
            dueDate: new Date().toISOString().split('T')[0],
            isCompleted: false,
            isNew: true
        };
        setTasks(prev => [...prev, newTask]);
        setHasTaskChanges(true);
    };

    const handleTaskChange = (taskId: string, field: keyof ProposalTask, value: any) => {
        setTasks(prev => prev.map(t => t.id === taskId ? { ...t, [field]: value } : t));
        setHasTaskChanges(true);
    };

    const handleRemoveTask = (taskId: string) => {
        setTasks(prev => prev.filter(t => t.id !== taskId));
        setHasTaskChanges(true);
    };

    const handleSaveTasks = () => {
        if (onUpdate) {
            onUpdate({ ...proposal, tasks, products, discount, paymentInfo: formData, value: formatCurrency(totalValue) });
        }
        setHasTaskChanges(false);
        // Remove the isNew flag from all tasks after saving
        setTasks(prev => prev.map(t => ({ ...t, isNew: false })));
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return '-';
        try {
            const [y, m, d] = dateString.split('-');
            if (!y || !m || !d || y.length !== 4) return dateString;
            return `${d}/${m}/${y}`;
        } catch {
            return dateString;
        }
    };

    const handleSaveProduct = (newProduct: ProductResult) => {
        const productToAdd: ProductGroup = {
            ...newProduct,
            items: newProduct.items.map(i => ({
                ...i,
                tag: i.tag 
            }))
        };
        setProducts(prev => [...prev, productToAdd]);
    };

    const handleUpdateOppInModal = (updated: CardData) => {
        updateOpportunity(updated);
    };

    const handleMoveOppInModal = (id: string, target: string) => {
        const opp = getOpportunityById(id);
        if (opp) {
            moveOpportunity(id, opp.stage, target);
        }
    };

    const handleDeleteOppInModal = (id: string) => {
        deleteOpportunity(id);
        setIsOpportunityModalOpen(false);
    };

    const handleContactSelect = (name: string) => {
        setCurrentContactName(name);
        setIsContactSearchOpen(false);
    };

    const inputClass = "w-full p-2 text-sm font-medium text-[#121118] dark:text-[#FFFFFF] bg-[#f1f0f4] dark:bg-[#121118]/50 border border-[#dddce5] dark:border-[#686388] rounded-md focus:ring-[#6258A6] focus:border-[#6258A6] outline-none transition-all";

    return (
        <>
            <Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-[1280px]">
                <div className="flex flex-col h-full max-h-[90vh] bg-[#FFFFFF] dark:bg-[#131121] text-[#121118] dark:text-[#FFFFFF] overflow-hidden rounded-xl">
                    <main className="flex-1 px-4 sm:px-6 lg:px-10 py-8 lg:py-10 overflow-y-auto">
                        <div className="flex flex-col w-full max-w-7xl mx-auto gap-8">
                            
                            {/* Header */}
                            <div className="flex flex-wrap items-center justify-between gap-4">
                                <p className="text-[#121118] dark:text-[#FFFFFF] text-3xl md:text-4xl font-black leading-tight tracking-[-0.033em] min-w-72">
                                    Detalhes da Proposta #{proposal.displayId}
                                </p>
                                <div className="flex items-center gap-2 ml-auto">
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
                                                className="flex h-10 px-4 items-center justify-center rounded-lg bg-[#6258A6] text-white hover:bg-[#6258A6]/90 transition-colors font-medium text-sm shadow-sm"
                                            >
                                                Salvar
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <button 
                                                onClick={() => setIsEditing(true)}
                                                className="flex size-10 cursor-pointer items-center justify-center overflow-hidden rounded-lg bg-[#6258A6]/10 text-[#6258A6] hover:bg-[#6258A6]/20 transition-colors"
                                                title="Editar Proposta"
                                            >
                                                <Icon name="edit" className="text-xl" />
                                            </button>
                                            <button 
                                                onClick={handleDeleteClick}
                                                className="flex size-10 cursor-pointer items-center justify-center overflow-hidden rounded-lg bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                                                title="Excluir Proposta"
                                            >
                                                <Icon name="delete" className="text-xl" />
                                            </button>
                                        </>
                                    )}
                                    <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg md:hidden">
                                        <Icon name="close" />
                                    </button>
                                </div>
                            </div>

                            {/* Status & Links */}
                            <div className="flex flex-wrap items-end justify-between gap-6">
                                <div className="flex flex-wrap items-center gap-1 text-sm overflow-x-auto pb-1">
                                    {steps.map((step) => {
                                        const { active, completed } = getStepStatus(step);
                                        return (
                                            <Step 
                                                key={step} 
                                                label={step} 
                                                active={active} 
                                                completed={completed} 
                                                onClick={() => handleStageClick(step)}
                                            />
                                        );
                                    })}
                                </div>

                                <div className="flex flex-col gap-4 sm:flex-row sm:gap-8">
                                    <div className="flex flex-col gap-1 relative min-w-[200px]" ref={contactSearchRef}>
                                        <p className="text-[#686388] dark:text-[#dddce5] text-sm font-normal leading-normal">Contato</p>
                                        {isEditing ? (
                                            <div className="relative">
                                                <input
                                                    type="text"
                                                    value={currentContactName}
                                                    onChange={(e) => {
                                                        setCurrentContactName(e.target.value);
                                                        setIsContactSearchOpen(true);
                                                    }}
                                                    onFocus={() => setIsContactSearchOpen(true)}
                                                    className={`${inputClass} !py-1 !px-2 !text-sm`}
                                                    placeholder="Pesquisar contato..."
                                                />
                                                {isContactSearchOpen && filteredContacts.length > 0 && (
                                                    <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-[#1e1d24] border border-neutral-200 dark:border-gray-700 rounded-lg shadow-lg z-50 max-h-48 overflow-y-auto">
                                                        {filteredContacts.map(contact => (
                                                            <button
                                                                key={contact.id}
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleContactSelect(contact.name);
                                                                }}
                                                                className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 flex flex-col"
                                                            >
                                                                <span className="font-bold">{contact.name}</span>
                                                                <span className="text-xs text-gray-500">{contact.email}</span>
                                                            </button>
                                                        ))}
                                                    </div>
                                                )}
                                                <div className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                                                    <Icon name="search" style={{ fontSize: '16px' }} />
                                                </div>
                                            </div>
                                        ) : (
                                            <button 
                                                onClick={() => {
                                                    if (fullContact) {
                                                        setIsContactModalOpen(true);
                                                    }
                                                }}
                                                className={`text-sm font-bold text-left truncate max-w-[200px] transition-colors ${
                                                    fullContact 
                                                    ? 'text-[#6258A6] underline hover:text-[#6258A6]/80' 
                                                    : 'text-[#121118] dark:text-[#FFFFFF] cursor-default'
                                                }`}
                                                disabled={!fullContact}
                                            >
                                                {currentContactName || '-'}
                                            </button>
                                        )}
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <p className="text-[#686388] dark:text-[#dddce5] text-sm font-normal leading-normal">Oportunidade</p>
                                        <button 
                                            onClick={() => setIsOpportunityModalOpen(true)}
                                            className="text-[#6258A6] text-sm font-bold underline hover:text-[#6258A6]/80 transition-colors text-left"
                                        >
                                            {opportunityName}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Grid Content */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                
                                {/* Left Column (2 spans) */}
                                <div className="lg:col-span-2 flex flex-col gap-8">
                                    
                                    {/* Formas de Pagamento - EDITABLE */}
                                    <div className="flex flex-col rounded-lg border border-[#dddce5] dark:border-[#686388] bg-[#FFFFFF] dark:bg-[#131121] p-6 shadow-sm">
                                        <h2 className="text-[#121118] dark:text-[#FFFFFF] text-xl font-bold leading-tight tracking-[-0.015em] mb-4">Formas de Pagamento</h2>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
                                            
                                            <div className="flex flex-col gap-1 border-t border-solid border-[#dddce5] dark:border-[#686388] py-4">
                                                <p className="text-[#686388] dark:text-[#dddce5] text-sm font-normal leading-normal">Número de Parcelas</p>
                                                {isEditing ? (
                                                    <div className="relative">
                                                        <select 
                                                            value={formData.installments}
                                                            onChange={(e) => handleInputChange('installments', e.target.value)}
                                                            className={`${inputClass} pr-8 appearance-none cursor-pointer`}
                                                        >
                                                            {INSTALLMENT_OPTIONS.map(opt => (
                                                                <option key={opt} value={opt}>{opt}</option>
                                                            ))}
                                                        </select>
                                                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-[#686388] dark:text-[#dddce5]">
                                                            <Icon name="expand_more" className="text-xl" />
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="w-full p-2 text-sm font-medium text-[#121118] dark:text-[#FFFFFF] bg-transparent border border-transparent">
                                                        {formData.installments}
                                                    </div>
                                                )}
                                            </div>
                                            
                                            <div className="flex flex-col gap-1 border-t border-solid border-[#dddce5] dark:border-[#686388] py-4">
                                                <p className="text-[#686388] dark:text-[#dddce5] text-sm font-normal leading-normal">Data de Validade</p>
                                                {isEditing ? (
                                                    <input 
                                                        value={formData.expiryDate}
                                                        onChange={(e) => handleInputChange('expiryDate', e.target.value)}
                                                        className={inputClass} 
                                                        type="date"
                                                    />
                                                ) : (
                                                    <div className="w-full p-2 text-sm font-medium text-[#121118] dark:text-[#FFFFFF] bg-transparent border border-transparent">
                                                        {formatDate(formData.expiryDate)}
                                                    </div>
                                                )}
                                            </div>
                                            
                                            <div className="flex flex-col gap-1 border-t border-solid border-[#dddce5] dark:border-[#686388] py-4">
                                                <p className="text-[#686388] dark:text-[#dddce5] text-sm font-normal leading-normal">Formas de Pagamento</p>
                                                {isEditing ? (
                                                    <div className="relative">
                                                        <select 
                                                            value={formData.paymentMethods}
                                                            onChange={(e) => handleInputChange('paymentMethods', e.target.value)}
                                                            className={`${inputClass} pr-8 appearance-none cursor-pointer`}
                                                        >
                                                            {PAYMENT_METHOD_OPTIONS.map(opt => (
                                                                <option key={opt} value={opt}>{opt}</option>
                                                            ))}
                                                        </select>
                                                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-[#686388] dark:text-[#dddce5]">
                                                            <Icon name="expand_more" className="text-xl" />
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="w-full p-2 text-sm font-medium text-[#121118] dark:text-[#FFFFFF] bg-transparent border border-transparent">
                                                        {formData.paymentMethods}
                                                    </div>
                                                )}
                                            </div>
                                            
                                            <div className="flex flex-col gap-1 border-t border-solid border-[#dddce5] dark:border-[#686388] py-4">
                                                <p className="text-[#686388] dark:text-[#dddce5] text-sm font-normal leading-normal">Período de Contratação</p>
                                                {isEditing ? (
                                                    <div className="relative">
                                                        <select 
                                                            value={formData.contractPeriod}
                                                            onChange={(e) => handleInputChange('contractPeriod', e.target.value)}
                                                            className={`${inputClass} pr-8 appearance-none cursor-pointer`}
                                                        >
                                                            {CONTRACT_PERIOD_OPTIONS.map(opt => (
                                                                <option key={opt} value={opt}>{opt}</option>
                                                            ))}
                                                        </select>
                                                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-[#686388] dark:text-[#dddce5]">
                                                            <Icon name="expand_more" className="text-xl" />
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="w-full p-2 text-sm font-medium text-[#121118] dark:text-[#FFFFFF] bg-transparent border border-transparent">
                                                        {formData.contractPeriod}
                                                    </div>
                                                )}
                                            </div>

                                        </div>
                                    </div>

                                    {/* Lista de Produtos */}
                                    <div className="flex flex-col rounded-lg border border-[#dddce5] dark:border-[#686388] bg-[#FFFFFF] dark:bg-[#131121] p-6 shadow-sm">
                                        <div className="flex items-center justify-between mb-4">
                                            <h2 className="text-[#121118] dark:text-[#FFFFFF] text-xl font-bold leading-tight tracking-[-0.015em]">Lista de Produtos</h2>
                                            {!isEditing && (
                                                <button 
                                                    onClick={() => setIsProductModalOpen(true)}
                                                    className="flex items-center gap-2 max-w-[480px] cursor-pointer justify-center overflow-hidden rounded-lg h-9 px-3 bg-[#6258A6] text-white text-xs font-bold leading-normal tracking-[0.015em] hover:bg-[#6258A6]/90 transition-colors"
                                                >
                                                    <Icon name="add" className="text-sm" />
                                                    <span className="truncate">Adicionar Novo Produto</span>
                                                </button>
                                            )}
                                        </div>
                                        
                                        <div className="flex flex-col">
                                            {products.length === 0 ? (
                                                <div className="text-center text-gray-400 py-6 text-sm italic">
                                                    Nenhum produto adicionado.
                                                </div>
                                            ) : (
                                                products.map((product, productIndex) => (
                                                    <div key={product.id} className={`flex flex-col ${productIndex > 0 ? 'mt-4' : ''}`}>
                                                        <div className="flex items-center justify-between py-4 border-b border-[#dddce5] dark:border-[#686388]">
                                                            <p className="text-[#121118] dark:text-[#FFFFFF] font-bold">{product.name}</p>
                                                            <div className="flex items-center gap-2">
                                                                <div className="w-32 p-2 text-sm text-center font-bold text-[#121118] dark:text-[#FFFFFF] bg-transparent">{product.price}</div>
                                                                {!isEditing && (
                                                                    <button 
                                                                        onClick={() => handleRemoveProduct(product.id)}
                                                                        className="p-2 text-gray-400 hover:text-red-500 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                                                                        title="Remover produto"
                                                                    >
                                                                        <Icon name="delete" className="text-lg" />
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <div className="flex flex-col pl-6">
                                                            {product.items.map((item, index) => (
                                                                <div key={item.id} className={`flex items-center justify-between py-3 ${index < product.items.length - 1 ? 'border-b border-[#dddce5] dark:border-[#686388]' : ''}`}>
                                                                    <div className="flex items-center gap-4">
                                                                        <p className="text-[#686388] dark:text-[#dddce5] text-sm">{item.label}</p>
                                                                        {item.tag && (
                                                                            <span className="text-xs font-medium leading-normal px-2 py-0.5 rounded-full bg-[#f0effa] text-[#6258A6] dark:bg-[#6258A6]/20">{item.tag}</span>
                                                                        )}
                                                                    </div>
                                                                    <div className="w-20 p-2 text-sm text-center text-[#686388] dark:text-[#dddce5] bg-transparent">{item.quantity}</div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Right Column (1 span) */}
                                <div className="lg:col-span-1 flex flex-col gap-8">
                                    
                                    {/* Resumo da Proposta */}
                                    <div className="flex flex-col rounded-lg border border-[#dddce5] dark:border-[#686388] bg-[#FFFFFF] dark:bg-[#131121] p-6 shadow-sm">
                                        <h2 className="text-[#121118] dark:text-[#FFFFFF] text-xl font-bold leading-tight tracking-[-0.015em] mb-4">Resumo da Proposta</h2>
                                        <div className="flex flex-col gap-3">
                                            <div className="flex items-center justify-between">
                                                <p className="text-[#686388] dark:text-[#dddce5] text-sm">Subtotal</p>
                                                <p className="text-[#686388] dark:text-[#dddce5] text-sm">{formatCurrency(subtotalValue)}</p>
                                            </div>
                                            <div className="flex items-center justify-between min-h-[28px]">
                                                <p className="text-[#686388] dark:text-[#dddce5] text-sm">Desconto</p>
                                                {isEditing ? (
                                                    <div className="flex items-center justify-end">
                                                        <span className="text-red-500 text-sm mr-1">- R$</span>
                                                        <input 
                                                            type="text" 
                                                            value={discount} 
                                                            onChange={handleDiscountChange}
                                                            className="w-24 p-1 text-right text-sm text-red-500 bg-[#f1f0f4] dark:bg-[#121118]/50 border border-[#dddce5] dark:border-[#686388] rounded-md focus:ring-1 focus:ring-[#6258A6] outline-none"
                                                            placeholder="0,00"
                                                        />
                                                    </div>
                                                ) : (
                                                    <p className="text-red-500 text-sm">- {formatCurrency(discountValue)}</p>
                                                )}
                                            </div>
                                            <div className="w-full h-px bg-[#dddce5] dark:bg-[#686388] my-2"></div>
                                            <div className="flex items-center justify-between">
                                                <p className="text-[#121118] dark:text-[#FFFFFF] text-base font-bold">Valor Total</p>
                                                <p className="text-[#121118] dark:text-[#FFFFFF] text-lg font-bold">{formatCurrency(totalValue)}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Contrato */}
                                    <div className="flex flex-col rounded-lg border border-[#dddce5] dark:border-[#686388] bg-[#FFFFFF] dark:bg-[#131121] p-6 shadow-sm">
                                        <h2 className="text-[#121118] dark:text-[#FFFFFF] text-xl font-bold leading-tight tracking-[-0.015em] mb-4">Contrato</h2>
                                        <div className="flex flex-col gap-4">
                                            <div className="flex flex-col gap-1">
                                                <p className="text-[#686388] dark:text-[#dddce5] text-sm">ID do Contrato</p>
                                                <p className="text-[#121118] dark:text-[#FFFFFF] text-sm font-medium">CT-2024-06-001</p>
                                            </div>
                                            <div className="flex flex-col gap-1">
                                                <p className="text-[#686388] dark:text-[#dddce5] text-sm">Status</p>
                                                {isEditing ? (
                                                    <div className="relative">
                                                        <select 
                                                            value={formData.contractStatus || 'Pendente'}
                                                            onChange={(e) => handleInputChange('contractStatus', e.target.value)}
                                                            className={`${inputClass} pr-8 appearance-none cursor-pointer`}
                                                        >
                                                            {CONTRACT_STATUS_OPTIONS.map(opt => (
                                                                <option key={opt} value={opt}>{opt}</option>
                                                            ))}
                                                        </select>
                                                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-[#686388] dark:text-[#dddce5]">
                                                            <Icon name="expand_more" className="text-xl" />
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <p className="text-[#121118] dark:text-[#FFFFFF] text-sm font-medium">{formData.contractStatus || 'Pendente'}</p>
                                                )}
                                            </div>
                                            <div className="flex flex-col gap-1">
                                                <p className="text-[#686388] dark:text-[#dddce5] text-sm">Link do Contrato</p>
                                                <a 
                                                    className="text-[#6258A6] text-sm font-medium underline" 
                                                    href="https://api.autentique.com.br/documentos/90ed8760834b22d5ba3e1facf9e32fa898db890580f3ea5ab/assinado.pdf"
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                >
                                                    Visualizar Contrato
                                                </a>
                                            </div>
                                            <div className="flex flex-col gap-1">
                                                <p className="text-[#686388] dark:text-[#dddce5] text-sm">Data de Assinatura</p>
                                                <p className="text-[#121118] dark:text-[#FFFFFF] text-sm font-medium">15/06/2024</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Lista de Tarefas */}
                                    <div className="flex flex-col rounded-lg border border-[#dddce5] dark:border-[#686388] bg-[#FFFFFF] dark:bg-[#131121] p-6 shadow-sm">
                                        <div className="flex items-center justify-between mb-4">
                                            <h2 className="text-[#121118] dark:text-[#FFFFFF] text-xl font-bold leading-tight tracking-[-0.015em]">Lista de Tarefas</h2>
                                            {!isEditing && (
                                                <button 
                                                    onClick={handleAddTask}
                                                    className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                                                    title="Adicionar Tarefa"
                                                >
                                                    <Icon name="add" />
                                                </button>
                                            )}
                                        </div>
                                        
                                        <div className="flex flex-col gap-4">
                                            {tasks.length === 0 ? (
                                                <p className="text-center text-gray-400 text-xs italic py-2">Nenhuma tarefa.</p>
                                            ) : (
                                                tasks.map((task) => (
                                                    <div key={task.id} className="flex items-start gap-3 group">
                                                        <input 
                                                            checked={task.isCompleted} 
                                                            onChange={() => handleToggleTask(task.id)}
                                                            className="mt-1 h-5 w-5 rounded-md border-[#dddce5] text-[#6258A6] focus:ring-[#6258A6] cursor-pointer" 
                                                            type="checkbox"
                                                        />
                                                        <div className="flex-1 min-w-0">
                                                            {task.isNew ? (
                                                                <div className="flex flex-col gap-1">
                                                                    <input 
                                                                        type="text"
                                                                        value={task.title}
                                                                        onChange={(e) => handleTaskChange(task.id, 'title', e.target.value)}
                                                                        placeholder="Nome da tarefa..."
                                                                        className="w-full bg-transparent border-b border-primary/30 text-sm font-medium text-[#121118] dark:text-white outline-none focus:border-primary"
                                                                        autoFocus
                                                                    />
                                                                    <input 
                                                                        type="date"
                                                                        value={task.dueDate}
                                                                        onChange={(e) => handleTaskChange(task.id, 'dueDate', e.target.value)}
                                                                        className="bg-transparent border-none text-[10px] text-gray-500 p-0 focus:ring-0"
                                                                    />
                                                                </div>
                                                            ) : (
                                                                <>
                                                                    <label className={`text-[#121118] dark:text-[#FFFFFF] text-sm font-medium transition-all ${task.isCompleted ? 'opacity-50 line-through' : ''}`}>
                                                                        {task.title}
                                                                    </label>
                                                                    <p className="text-[#686388] dark:text-[#dddce5] text-xs">Vence em: {formatDate(task.dueDate)}</p>
                                                                </>
                                                            )}
                                                        </div>
                                                        
                                                        {task.isNew && (
                                                            <button 
                                                                onClick={() => handleRemoveTask(task.id)}
                                                                className="text-red-500 hover:text-red-600 p-1"
                                                            >
                                                                <Icon name="close" className="text-base" />
                                                            </button>
                                                        )}
                                                    </div>
                                                ))
                                            )}
                                        </div>

                                        {hasTaskChanges && !isEditing && (
                                            <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-800">
                                                <button 
                                                    onClick={handleSaveTasks}
                                                    className="w-full py-2 bg-primary text-white text-xs font-bold rounded-lg hover:bg-primary/90 transition-colors shadow-md animate-fade-in"
                                                >
                                                    Salvar Alterações de Tarefas
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>

                            </div>
                        </div>
                    </main>
                </div>
            </Modal>
            
            <ConfirmDeleteModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={confirmDelete}
                leadName={`Proposta #${proposal.displayId}`}
                entityType="Proposta"
            />

            <ConfirmProposalStageModal
                isOpen={!!pendingStage}
                onClose={() => setPendingStage(null)}
                onConfirm={confirmStageChange}
                currentStage={proposal.status}
                targetStage={pendingStage || ''}
            />

            <ProductDetailModal
                isOpen={isProductModalOpen}
                onClose={() => setIsProductModalOpen(false)}
                onSave={handleSaveProduct}
            />

            {/* Navigation Modals */}
            <ContactDetailModal 
                isOpen={isContactModalOpen}
                onClose={() => setIsContactModalOpen(false)}
                contact={fullContact}
            />

            {fullOpportunity && (
                <OpportunityDetailModal 
                    isOpen={isOpportunityModalOpen}
                    onClose={() => setIsOpportunityModalOpen(false)}
                    opportunity={fullOpportunity.card}
                    currentStage={fullOpportunity.stage}
                    onUpdate={handleUpdateOppInModal}
                    onMove={handleMoveOppInModal}
                    onDelete={handleDeleteOppInModal}
                />
            )}
        </>
    );
};
