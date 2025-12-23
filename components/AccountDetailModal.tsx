
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Modal } from './ui/Modal';
import { Account, Contact, CardData } from '../types';
import { Icon } from './ui/Icon';
import { ConfirmDeleteModal } from './ConfirmDeleteModal';
import { ContactDetailModal } from './ContactDetailModal';
import { OpportunityFormModal } from './OpportunityFormModal';
import { INITIAL_CONTACTS_DATA } from '../constants';
import { addOpportunity } from '../dataStore';

interface AccountDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    account: Account | null;
    onUpdate?: (account: Account) => void;
    onDelete?: (accountId: string) => void;
}

interface Task {
    id: string;
    text: string;
    dueDate: string;
    isCompleted: boolean;
}

interface AccountContactMock {
    id: string;
    name: string;
    role: string;
    email: string;
    phone: string;
    isPrimary: boolean;
}

const MOCK_ACCOUNT_TASKS: Task[] = [
    { id: 't1', text: 'Chamada de acompanhamento com Maria', dueDate: 'Amanhã', isCompleted: false },
    { id: 't2', text: 'Enviar proposta atualizada', dueDate: 'Ontem', isCompleted: true },
    { id: 't3', text: 'Agendar revisão de negócios do 4º tri', dueDate: '25 de Out, 2024', isCompleted: false },
];

const MOCK_BASE_CONTACTS: AccountContactMock[] = [
    { id: 'c1', name: 'Maria Garcia', role: 'CEO', email: 'maria.g@innovate.com', phone: '(55) 11 98765-4321', isPrimary: false },
    { id: 'c2', name: 'Carlos Silva', role: 'CTO', email: 'carlos.s@innovate.com', phone: '(55) 21 91234-5678', isPrimary: false },
];

const ACCOUNT_TYPES = ['Física', 'Jurídica', 'Governo', 'Parceiro', 'Outros'];

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

export const AccountDetailModal: React.FC<AccountDetailModalProps> = ({ isOpen, onClose, account, onUpdate, onDelete }) => {
    const [formData, setFormData] = useState<Account | null>(null);
    const [activeTab, setActiveTab] = useState<'Contatos' | 'Oportunidades' | 'Timeline'>('Contatos');
    
    // Task State
    const [tasks, setTasks] = useState<Task[]>(MOCK_ACCOUNT_TASKS);
    const [isAddingTask, setIsAddingTask] = useState(false);
    const [newTaskText, setNewTaskText] = useState('');
    const [newTaskDate, setNewTaskDate] = useState('');
    
    // Contacts List State
    const [contactsList, setContactsList] = useState<AccountContactMock[]>([]);

    // Contact Search State
    const [isSearchingContact, setIsSearchingContact] = useState(false);
    const [contactSearchTerm, setContactSearchTerm] = useState('');
    const searchDropdownRef = useRef<HTMLDivElement>(null);

    // Sub-Modals Statee
    const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
    const [isAddOpportunityModalOpen, setIsAddOpportunityModalOpen] = useState(false);

    // UI States
    const [isEditing, setIsEditing] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    // Phone Edit State
    const [phoneCountryCode, setPhoneCountryCode] = useState('+55');
    const [phoneNumber, setPhoneNumber] = useState('');

    useEffect(() => {
        if (account) {
            setFormData(JSON.parse(JSON.stringify(account)));
            setTasks(MOCK_ACCOUNT_TASKS); // Reset tasks
            setActiveTab('Contatos');
            setIsEditing(false); // Reset edit mode
            setIsAddingTask(false);
            setIsSearchingContact(false);
            setContactSearchTerm('');

            // Parse phone number
            const phone = account.phone || '';
            const foundCode = COUNTRY_CODES.find(c => phone.startsWith(c.code));
            if (foundCode) {
                setPhoneCountryCode(foundCode.code);
                setPhoneNumber(phone.replace(foundCode.code, ''));
            } else {
                setPhoneCountryCode('+55');
                setPhoneNumber(phone);
            }

            // Logic to build contact list including the main contact
            const mainContactName = account.mainContact;
            
            let initialContacts = [...MOCK_BASE_CONTACTS];

            if (mainContactName) {
                const existingMainInMock = initialContacts.find(c => c.name === mainContactName);

                if (existingMainInMock) {
                    initialContacts = initialContacts.map(c => 
                        c.name === mainContactName ? { ...c, isPrimary: true } : { ...c, isPrimary: false }
                    );
                } else {
                    const globalContact = INITIAL_CONTACTS_DATA.find(c => c.name === mainContactName);
                    
                    const newMainContact: AccountContactMock = {
                        id: globalContact ? globalContact.id : `c-main-${Date.now()}`,
                        name: mainContactName,
                        role: 'Principal', 
                        email: globalContact ? globalContact.email : '-',
                        phone: globalContact ? globalContact.phone : '-',
                        isPrimary: true
                    };
                    
                    initialContacts = [newMainContact, ...initialContacts.map(c => ({...c, isPrimary: false}))];
                }
            } else {
                initialContacts = initialContacts.map(c => ({...c, isPrimary: false}));
            }
            
            setContactsList(initialContacts);
        }
    }, [account, isOpen]);

    // Handle click outside contact search dropdown
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchDropdownRef.current && !searchDropdownRef.current.contains(event.target as Node)) {
                setIsSearchingContact(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const filteredAvailableContacts = useMemo(() => {
        const term = contactSearchTerm.toLowerCase();
        // Don't show contacts already in the account
        const existingIds = new Set(contactsList.map(c => c.id));
        const existingNames = new Set(contactsList.map(c => c.name));

        return INITIAL_CONTACTS_DATA.filter(c => 
            (c.name.toLowerCase().includes(term) || c.email.toLowerCase().includes(term)) &&
            !existingIds.has(c.id) &&
            !existingNames.has(c.name)
        );
    }, [contactSearchTerm, contactsList]);

    if (!account || !formData) return null;

    const toggleTask = (taskId: string) => {
        setTasks(prev => prev.map(t => t.id === taskId ? { ...t, isCompleted: !t.isCompleted } : t));
    };

    // Add Task Handlers
    const handleAddTaskClick = () => {
        setNewTaskText('');
        setNewTaskDate(new Date().toISOString().split('T')[0]);
        setIsAddingTask(true);
    };

    const handleCancelAddTask = () => {
        setIsAddingTask(false);
        setNewTaskText('');
        setNewTaskDate('');
    };

    const handleSaveTask = () => {
        if (!newTaskText.trim()) return;

        let displayDate = newTaskDate;
        if (newTaskDate) {
            const [y, m, d] = newTaskDate.split('-');
            displayDate = `${d}/${m}/${y}`;
        } else {
            displayDate = 'Sem data';
        }

        const newTask: Task = {
            id: `new-task-${Date.now()}`,
            text: newTaskText,
            dueDate: displayDate,
            isCompleted: false
        };

        setTasks(prev => [...prev, newTask]);
        handleCancelAddTask();
    };

    const handleInputChange = (field: keyof Account, value: string) => {
        setFormData(prev => prev ? ({ ...prev, [field]: value }) : null);
    };

    const handlePhoneCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newCode = e.target.value;
        setPhoneCountryCode(newCode);
        const fullPhone = `${newCode}${phoneNumber}`;
        handleInputChange('phone', fullPhone);
    };

    const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setPhoneNumber(val);
        const fullPhone = `${phoneCountryCode}${val}`;
        handleInputChange('phone', fullPhone);
    };

    const handleSave = () => {
        if (onUpdate && formData) {
            onUpdate(formData);
            setIsEditing(false);
        }
    };

    const handleCancel = () => {
        if (account) {
            setFormData(JSON.parse(JSON.stringify(account)));
            // Reset phone state
            const phone = account.phone || '';
            const foundCode = COUNTRY_CODES.find(c => phone.startsWith(c.code));
            if (foundCode) {
                setPhoneCountryCode(foundCode.code);
                setPhoneNumber(phone.replace(foundCode.code, ''));
            } else {
                setPhoneCountryCode('+55');
                setPhoneNumber(phone);
            }
        }
        setIsEditing(false);
    };

    const handleDeleteClick = () => {
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = () => {
        if (onDelete && account) {
            onDelete(account.id);
            setIsDeleteModalOpen(false);
            onClose();
        }
    };

    const handleViewContact = (contactId: string, name: string) => {
        const fullContact = INITIAL_CONTACTS_DATA.find(c => c.id === contactId || c.name === name);
        const contactRole = contactsList.find(c => c.id === contactId || c.name === name)?.role;
        
        if (fullContact) {
            setSelectedContact({ ...fullContact, role: contactRole || fullContact.role });
        } else {
            const mockFull: Contact = {
                id: contactId,
                name: name,
                account: account.name,
                email: contactsList.find(c => c.id === contactId)?.email || '',
                phone: contactsList.find(c => c.id === contactId)?.phone || '',
                cpf: '-',
                country: 'Brasil',
                role: contactRole
            };
            setSelectedContact(mockFull);
        }
    };

    const handleAddExistingContact = (contact: Contact) => {
        const newContact: AccountContactMock = {
            id: contact.id,
            name: contact.name,
            role: contact.role || 'Contato',
            email: contact.email,
            phone: contact.phone,
            isPrimary: false
        };
        setContactsList(prev => [...prev, newContact]);
        setIsSearchingContact(false);
        setContactSearchTerm('');
    };

    const handleSaveNewOpportunity = (data: Partial<CardData>) => {
        const newCard: CardData = {
            id: `c-${Date.now()}`,
            name: data.name || account.name,
            amount: data.amount || 'R$ 0,00',
            status: 'Nova Oportunidade',
            statusColor: 'blue',
            salesType: data.salesType,
            type: data.type,
            closeDate: data.closeDate
        };

        addOpportunity(newCard);
        setIsAddOpportunityModalOpen(false);
    };

    const inputClass = "w-full p-2 text-sm font-medium text-[#121118] dark:text-[#FFFFFF] bg-[#f1f0f4] dark:bg-[#121118]/50 border border-[#dddce5] dark:border-[#686388] rounded-md focus:ring-[#6258A6] focus:border-[#6258A6] outline-none transition-all";

    return (
        <>
            <Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-[1400px]">
                <div className="flex flex-col h-full max-h-[90vh] bg-[#FFFFFF] dark:bg-[#131121] text-[#121118] dark:text-[#FFFFFF] overflow-hidden rounded-xl">
                    
                    {/* Header */}
                    <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-neutral-200 dark:border-gray-700 px-6 sm:px-10 py-5 bg-white dark:bg-[#131121]">
                        <div className="flex items-center gap-4">
                            <h2 className="text-[#121118] dark:text-white text-lg font-bold leading-tight">Contas</h2>
                        </div>
                        <div className="flex flex-1 justify-end items-center gap-4">
                            <button onClick={onClose} className="p-2 hover:bg-neutral-100 dark:hover:bg-gray-800 rounded-lg text-gray-500 dark:text-gray-400 transition-colors">
                                <Icon name="close" className="text-xl" />
                            </button>
                        </div>
                    </header>

                    <main className="flex-1 overflow-y-auto p-6 sm:p-10 space-y-6">
                        {/* Breadcrumbs */}
                        <div className="flex flex-wrap gap-2">
                            <span className="text-gray-500 dark:text-gray-400 text-sm font-medium leading-normal cursor-pointer" onClick={onClose}>Contas</span>
                            <span className="text-gray-500 dark:text-gray-400 text-sm font-medium leading-normal">/</span>
                            <span className="text-[#121118] dark:text-white text-sm font-medium leading-normal">{formData.name}</span>
                        </div>

                        {/* Account Info Card */}
                        <div className="p-6 border border-neutral-200 dark:border-gray-700 rounded-xl bg-white dark:bg-[#131121] shadow-sm">
                            <div className="flex flex-wrap justify-between gap-4 items-start pb-4 border-b border-neutral-200 dark:border-gray-700">
                                <div className="flex flex-col gap-2 flex-1">
                                    {isEditing ? (
                                        <input 
                                            value={formData.name}
                                            onChange={(e) => handleInputChange('name', e.target.value)}
                                            className="text-3xl font-bold leading-tight bg-transparent border-b border-neutral-300 dark:border-gray-600 focus:border-primary outline-none text-[#121118] dark:text-white w-full max-w-md"
                                        />
                                    ) : (
                                        <p className="text-[#121118] dark:text-white text-3xl font-bold leading-tight">{formData.name}</p>
                                    )}
                                    <p className="text-gray-500 dark:text-gray-400 text-base font-normal leading-normal">Detalhes da Conta</p>
                                </div>
                                <div className="flex items-center gap-3">
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
                                                className="flex size-10 cursor-pointer items-center justify-center overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                                                title="Editar"
                                            >
                                                <Icon name="edit" className="text-xl" />
                                            </button>
                                            <button 
                                                onClick={handleDeleteClick}
                                                className="flex size-10 cursor-pointer items-center justify-center overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-white hover:bg-red-100 dark:hover:bg-red-900/30 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                                                title="Excluir"
                                            >
                                                <Icon name="delete" className="text-xl" />
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                            <div className="pt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                                <div className="flex flex-col gap-1 py-2">
                                    <p className="text-gray-500 dark:text-gray-400 text-sm font-normal leading-normal">Telefone</p>
                                    {isEditing ? (
                                        <div className="flex gap-2">
                                            <div className="relative w-24 shrink-0">
                                                <select 
                                                    value={phoneCountryCode}
                                                    onChange={handlePhoneCountryChange}
                                                    className={`${inputClass} pr-6 appearance-none cursor-pointer bg-none`}
                                                >
                                                    {COUNTRY_CODES.map(c => (
                                                        <option key={c.name} value={c.code}>{c.code}</option>
                                                    ))}
                                                </select>
                                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-1 text-[#686388] dark:text-[#dddce5]">
                                                    <Icon name="expand_more" className="text-xl" />
                                                </div>
                                            </div>
                                            <input 
                                                type="text"
                                                value={phoneNumber}
                                                onChange={handlePhoneNumberChange}
                                                className={inputClass} 
                                                placeholder="00 00000-0000"
                                            />
                                        </div>
                                    ) : (
                                        <p className="text-[#121118] dark:text-white text-sm font-medium leading-normal">{formData.phone || '-'}</p>
                                    )}
                                </div>
                                <div className="flex flex-col gap-1 py-2">
                                    <p className="text-gray-500 dark:text-gray-400 text-sm font-normal leading-normal">Email Principal</p>
                                    {isEditing ? (
                                        <input value={formData.email} onChange={(e) => handleInputChange('email', e.target.value)} className={inputClass} />
                                    ) : (
                                        <p className="text-[#121118] dark:text-white text-sm font-medium leading-normal">{formData.email}</p>
                                    )}
                                </div>
                                <div className="flex flex-col gap-1 py-2">
                                    <p className="text-gray-500 dark:text-gray-400 text-sm font-normal leading-normal">Tipo</p>
                                    {isEditing ? (
                                        <div className="relative">
                                            <select 
                                                value={formData.type} 
                                                onChange={(e) => handleInputChange('type', e.target.value)} 
                                                className={`${inputClass} appearance-none pr-8 cursor-pointer bg-none`}
                                            >
                                                {ACCOUNT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                                            </select>
                                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-[#686388] dark:text-[#dddce5]">
                                                <Icon name="expand_more" className="text-xl" />
                                            </div>
                                        </div>
                                    ) : (
                                        <p className="text-[#121118] dark:text-white text-sm font-medium leading-normal">{formData.type || '-'}</p>
                                    )}
                                </div>
                                <div className="flex flex-col gap-1 py-2">
                                    <p className="text-gray-500 dark:text-gray-400 text-sm font-normal leading-normal">Identificador</p>
                                    {isEditing ? (
                                        <input value={formData.cpfCnpj || ''} onChange={(e) => handleInputChange('cpfCnpj', e.target.value)} className={inputClass} />
                                    ) : (
                                        <p className="text-[#121118] dark:text-white text-sm font-medium leading-normal">{formData.cpfCnpj || '-'}</p>
                                    )}
                                </div>
                                <div className="flex flex-col gap-1 py-2">
                                    <p className="text-gray-500 dark:text-gray-400 text-sm font-normal leading-normal">Proprietário</p>
                                    {isEditing ? (
                                        <input value={formData.owner || ''} onChange={(e) => handleInputChange('owner', e.target.value)} className={inputClass} />
                                    ) : (
                                        <p className="text-[#121118] dark:text-white text-sm font-medium leading-normal">{formData.owner || '-'}</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Main Content Area */}
                        <div className="flex flex-col lg:flex-row gap-6">
                            
                            {/* Left: Tabs & Table */}
                            <div className="flex-grow">
                                <div className="border-b border-neutral-200 dark:border-gray-700">
                                    <nav aria-label="Tabs" className="flex gap-6 -mb-px">
                                        {['Contatos', 'Oportunidades', 'Timeline'].map((tab) => (
                                            <button
                                                key={tab}
                                                onClick={() => setActiveTab(tab as any)}
                                                className={`shrink-0 border-b-2 px-1 py-3 text-sm font-medium transition-colors ${
                                                    activeTab === tab 
                                                        ? 'border-primary text-primary font-bold' 
                                                        : 'border-transparent text-gray-500 dark:text-gray-400 hover:border-neutral-300 dark:hover:border-gray-600 hover:text-gray-700 dark:hover:text-gray-300'
                                                }`}
                                            >
                                                {tab}
                                            </button>
                                        ))}
                                    </nav>
                                </div>
                                
                                <div className="py-6">
                                    {activeTab === 'Contatos' && (
                                        <div className="flex flex-col gap-4">
                                            <div className="overflow-x-auto border border-neutral-200 dark:border-gray-700 rounded-xl bg-white dark:bg-[#131121]">
                                                <table className="min-w-full text-sm divide-y divide-neutral-200 dark:divide-gray-700">
                                                    <thead className="bg-neutral-50 dark:bg-gray-800/50">
                                                        <tr>
                                                            <th className="px-6 py-3 text-left font-bold text-[#121118] dark:text-white" scope="col">Nome</th>
                                                            <th className="px-6 py-3 text-left font-bold text-[#121118] dark:text-white" scope="col">Função</th>
                                                            <th className="px-6 py-3 text-left font-bold text-[#121118] dark:text-white" scope="col">Email</th>
                                                            <th className="px-6 py-3 text-left font-bold text-[#121118] dark:text-white" scope="col">Telefone</th>
                                                            <th className="relative px-6 py-3" scope="col"><span className="sr-only">Ações</span></th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-neutral-200 dark:divide-gray-700">
                                                        {contactsList.map((contact) => (
                                                            <tr key={contact.id} className={contact.isPrimary ? 'bg-primary/5 dark:bg-primary/10' : ''}>
                                                                <td className="whitespace-nowrap px-6 py-4 text-[#121118] dark:text-white">
                                                                    <div className="flex items-center gap-2">
                                                                        <span>{contact.name}</span>
                                                                        {contact.isPrimary && (
                                                                            <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">Principal</span>
                                                                        )}
                                                                    </div>
                                                                </td>
                                                                <td className="whitespace-nowrap px-6 py-4 text-gray-500 dark:text-gray-400">{contact.role}</td>
                                                                <td className="whitespace-nowrap px-6 py-4 text-gray-500 dark:text-gray-400">{contact.email}</td>
                                                                <td className="whitespace-nowrap px-6 py-4 text-gray-500 dark:text-gray-400">{contact.phone}</td>
                                                                <td className="whitespace-nowrap px-6 py-4 text-right">
                                                                    <button 
                                                                        onClick={() => handleViewContact(contact.id, contact.name)}
                                                                        className="text-primary hover:underline font-medium"
                                                                    >
                                                                        Ver
                                                                    </button>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                            {!isEditing && (
                                                <div className="flex flex-col gap-2 relative" ref={searchDropdownRef}>
                                                    {!isSearchingContact ? (
                                                        <button 
                                                            onClick={() => setIsSearchingContact(true)}
                                                            className="flex items-center gap-2 text-primary font-bold text-sm hover:underline transition-colors w-fit"
                                                        >
                                                            <Icon name="person_add" className="text-lg" />
                                                            Adicionar Contato Existente
                                                        </button>
                                                    ) : (
                                                        <div className="flex flex-col gap-2 animate-fade-in w-full max-w-md">
                                                            <div className="relative">
                                                                <input
                                                                    autoFocus
                                                                    type="text"
                                                                    value={contactSearchTerm}
                                                                    onChange={(e) => setContactSearchTerm(e.target.value)}
                                                                    placeholder="Pesquisar contato por nome ou email..."
                                                                    className="w-full rounded-lg border border-primary/30 bg-primary/5 dark:bg-primary/10 text-[#121118] dark:text-white p-2.5 pl-10 outline-none focus:ring-2 focus:ring-primary/50 transition-all text-sm"
                                                                />
                                                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-primary">
                                                                    <Icon name="search" className="!text-lg" />
                                                                </div>
                                                                <button 
                                                                    onClick={() => { setIsSearchingContact(false); setContactSearchTerm(''); }}
                                                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500"
                                                                >
                                                                    <Icon name="close" className="!text-lg" />
                                                                </button>
                                                            </div>

                                                            {contactSearchTerm && (
                                                                <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white dark:bg-[#1e1d24] border border-neutral-200 dark:border-gray-700 rounded-lg shadow-2xl max-h-60 overflow-y-auto">
                                                                    {filteredAvailableContacts.length > 0 ? (
                                                                        filteredAvailableContacts.map(contact => (
                                                                            <button
                                                                                key={contact.id}
                                                                                onClick={() => handleAddExistingContact(contact)}
                                                                                className="w-full text-left px-4 py-3 text-sm text-gray-700 dark:text-gray-200 hover:bg-neutral-100 dark:hover:bg-gray-700 flex items-center gap-3 border-b border-neutral-50 dark:border-gray-800 last:border-0"
                                                                            >
                                                                                <div className="size-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                                                                                    {contact.name[0]}
                                                                                </div>
                                                                                <div className="flex flex-col">
                                                                                    <span className="font-bold">{contact.name}</span>
                                                                                    <span className="text-[10px] text-gray-400 uppercase">{contact.email}</span>
                                                                                </div>
                                                                            </button>
                                                                        ))
                                                                    ) : (
                                                                        <div className="px-4 py-3 text-sm text-gray-500 italic text-center">Nenhum contato disponível encontrado.</div>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                    
                                    {activeTab === 'Oportunidades' && (
                                         <div className="flex flex-col gap-6">
                                            <div className="flex items-center justify-center p-8 bg-neutral-50 dark:bg-gray-800/20 border border-neutral-200 dark:border-gray-700 rounded-xl">
                                                <p className="text-gray-500 dark:text-gray-400 italic">Nenhuma oportunidade recente.</p>
                                            </div>
                                            {!isEditing && (
                                                <div className="flex justify-start">
                                                    <button 
                                                        onClick={() => setIsAddOpportunityModalOpen(true)}
                                                        className="flex items-center gap-2 text-primary font-bold text-sm hover:underline transition-colors"
                                                    >
                                                        <Icon name="add_shopping_cart" className="text-lg" />
                                                        Criar Nova Oportunidade
                                                    </button>
                                                </div>
                                            )}
                                         </div>
                                    )}

                                    {activeTab === 'Timeline' && (
                                         <div className="flex items-center justify-center p-8 bg-neutral-50 dark:bg-gray-800/20 border border-neutral-200 dark:border-gray-700 rounded-xl">
                                             <p className="text-gray-500 dark:text-gray-400 italic">Sem histórico disponível na Timeline.</p>
                                         </div>
                                    )}
                                </div>
                            </div>

                            {/* Right: Sidebar (Tasks) */}
                            <aside className="w-full lg:w-80 lg:flex-shrink-0">
                                <div className="p-6 border border-neutral-200 dark:border-gray-700 rounded-xl bg-white dark:bg-[#131121] h-full shadow-sm">
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="text-lg font-bold text-[#121118] dark:text-white">Tarefas</h3>
                                        <button 
                                            onClick={handleAddTaskClick}
                                            disabled={isAddingTask}
                                            className="flex items-center justify-center size-8 rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <Icon name="add" className="text-xl" />
                                        </button>
                                    </div>
                                    <div className="space-y-4">
                                        {tasks.map((task) => (
                                            <div key={task.id} className="flex items-start gap-3">
                                                <input 
                                                    checked={task.isCompleted} 
                                                    onChange={() => toggleTask(task.id)}
                                                    className="form-checkbox mt-1 size-4 rounded text-primary focus:ring-primary border-gray-300 dark:border-gray-600 bg-transparent" 
                                                    type="checkbox"
                                                />
                                                <div className="flex flex-col">
                                                    <label 
                                                        className={`text-sm font-medium transition-colors ${task.isCompleted ? 'text-gray-400 line-through' : 'text-[#121118] dark:text-white'}`}
                                                    >
                                                        {task.text}
                                                    </label>
                                                    <p className={`text-xs transition-colors ${task.isCompleted ? 'text-gray-300 line-through' : 'text-gray-500 dark:text-gray-400'}`}>
                                                        Vencimento: {task.dueDate}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}

                                        {isAddingTask && (
                                            <div className="flex flex-col gap-2 p-3 border border-dashed border-primary/30 rounded-lg bg-primary/5 animate-fade-in">
                                                <input
                                                    autoFocus
                                                    type="text"
                                                    placeholder="Nome da tarefa"
                                                    value={newTaskText}
                                                    onChange={(e) => setNewTaskText(e.target.value)}
                                                    className="w-full bg-transparent border-b border-primary/20 text-sm font-medium text-[#121118] dark:text-white placeholder:text-gray-500 focus:border-primary focus:outline-none pb-1 transition-colors"
                                                />
                                                <div className="flex items-center justify-between mt-1">
                                                    <input
                                                        type="date"
                                                        value={newTaskDate}
                                                        onChange={(e) => setNewTaskDate(e.target.value)}
                                                        className="bg-transparent border-none text-xs text-gray-500 dark:text-gray-400 focus:ring-0 p-0 cursor-pointer"
                                                    />
                                                    <div className="flex gap-2">
                                                        <button 
                                                            onClick={handleCancelAddTask}
                                                            className="flex items-center justify-center size-6 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-red-100 hover:text-red-500 dark:hover:bg-red-900/30 transition-colors"
                                                            title="Cancelar"
                                                        >
                                                            <Icon name="close" className="text-sm" />
                                                        </button>
                                                        <button 
                                                            onClick={handleSaveTask}
                                                            disabled={!newTaskText.trim()}
                                                            className="flex items-center justify-center size-6 rounded-full bg-primary text-white hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                                            title="Salvar"
                                                        >
                                                            <Icon name="check" className="text-sm" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </aside>

                        </div>
                    </main>
                </div>
            </Modal>

            {/* Sub-Modals */}
            {selectedContact && (
                <ContactDetailModal 
                    isOpen={!!selectedContact}
                    onClose={() => setSelectedContact(null)}
                    contact={selectedContact}
                />
            )}

            <OpportunityFormModal 
                isOpen={isAddOpportunityModalOpen}
                onClose={() => setIsAddOpportunityModalOpen(false)}
                onSave={handleSaveNewOpportunity}
            />

            {account && (
                <ConfirmDeleteModal
                    isOpen={isDeleteModalOpen}
                    onClose={() => setIsDeleteModalOpen(false)}
                    onConfirm={confirmDelete}
                    leadName={account.name}
                    entityType="Conta" 
                />
            )}
        </>
    );
};
