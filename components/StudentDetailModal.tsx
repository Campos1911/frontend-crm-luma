
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Modal } from './ui/Modal';
import { StudentPageData, Guardian, Contact, Note } from '../types';
import { Icon } from './ui/Icon';
import { ConfirmDeleteModal } from './ConfirmDeleteModal';
import { ConfirmActionModal } from './ConfirmActionModal';
import { ContactDetailModal } from './ContactDetailModal';
import { INITIAL_CONTACTS_DATA } from '../constants';

interface StudentDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    student: StudentPageData | null;
    onUpdate: (student: StudentPageData) => void;
    onDelete: (studentId: string) => void;
}

const SPECIFICITY_OPTIONS = [
    'TDAH',
    'TEA',
    'Asperger',
    'Dislexia',
    'Superdotação',
    'TOD'
];

const SCHOOL_YEAR_OPTIONS = [
    '1º Ano Fundamental I',
    '2º Ano Fundamental I',
    '3º Ano Fundamental I',
    '4º Ano Fundamental I',
    '5º Ano Fundamental I',
    '6º Ano Fundamental II',
    '7º Ano Fundamental II',
    '8º Ano Fundamental II',
    '9º Ano Fundamental II',
    '1º Ano Ensino Médio',
    '2º Ano Ensino Médio',
    '3º Ano Ensino Médio',
    'Ensino Médio Completo'
];

export const StudentDetailModal: React.FC<StudentDetailModalProps> = ({ 
    isOpen, 
    onClose, 
    student, 
    onUpdate, 
    onDelete 
}) => {
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState<StudentPageData | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<'Timeline' | 'Notas'>('Timeline');

    // Guardian Add State
    const [isAddingGuardian, setIsAddingGuardian] = useState(false);
    const [guardianSearch, setGuardianSearch] = useState('');
    const [pendingGuardian, setPendingGuardian] = useState<Contact | null>(null);
    const guardianSearchRef = useRef<HTMLDivElement>(null);

    // Guardian Actions State
    const [pendingDeleteGuardianId, setPendingDeleteGuardianId] = useState<string | null>(null);
    const [pendingFinancialId, setPendingFinancialId] = useState<string | null>(null);

    // Specificity State
    const [isSpecDropdownOpen, setIsSpecDropdownOpen] = useState(false);
    const specDropdownRef = useRef<HTMLDivElement>(null);
    
    // Contact Detail State
    const [selectedContact, setSelectedContact] = useState<Contact | null>(null);

    // Notes State
    const [isAddingNote, setIsAddingNote] = useState(false);
    const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
    const [noteText, setNoteText] = useState('');

    // Sync form data when student prop changes (e.g. after an update)
    useEffect(() => {
        if (student) {
            setFormData(JSON.parse(JSON.stringify(student)));
        }
    }, [student]);

    // Reset UI state only when the modal opens/closes
    useEffect(() => {
        if (isOpen) {
            setIsEditing(false);
            setIsAddingGuardian(false);
            setGuardianSearch('');
            setPendingGuardian(null);
            setPendingFinancialId(null);
            setPendingDeleteGuardianId(null);
            setSelectedContact(null);
            
            // Reset Notes State
            setIsAddingNote(false);
            setEditingNoteId(null);
            setNoteText('');
            setActiveTab('Timeline');
        }
    }, [isOpen]);

    // Handle click outside dropdowns
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (guardianSearchRef.current && !guardianSearchRef.current.contains(event.target as Node)) {
                // Only close if we haven't selected someone yet
                if (!pendingGuardian) {
                    // setIsAddingGuardian(false); 
                }
            }
            if (specDropdownRef.current && !specDropdownRef.current.contains(event.target as Node)) {
                setIsSpecDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [pendingGuardian]);

    const filteredContacts = useMemo(() => {
        const term = guardianSearch.toLowerCase();
        // Exclude already added guardians
        const existingIds = formData?.guardians?.map(g => g.name) || []; 
        return INITIAL_CONTACTS_DATA.filter(c => 
            c.name.toLowerCase().includes(term) && !existingIds.includes(c.name)
        );
    }, [guardianSearch, formData]);

    if (!student || !formData) return null;

    const handleInputChange = (field: keyof StudentPageData, value: any) => {
        setFormData(prev => prev ? ({ ...prev, [field]: value }) : null);
    };

    // --- Guardian Logic ---

    const initiateFinancialChange = (id: string, currentStatus: boolean) => {
        // Prevent change if already financial OR if in edit mode (as requested)
        if (currentStatus || isEditing) return; 
        setPendingFinancialId(id);
    };

    const confirmFinancialChange = () => {
        if (!pendingFinancialId || !formData) return;

        const updatedGuardians = formData.guardians?.map(g => ({
            ...g,
            isFinancial: g.id === pendingFinancialId 
        })) || [];

        const newFinancialGuardian = updatedGuardians.find(g => g.isFinancial);
        
        const newData = { 
            ...formData, 
            guardians: updatedGuardians,
            financialGuardian: newFinancialGuardian ? newFinancialGuardian.name : formData.financialGuardian
        };

        setFormData(newData);
        onUpdate(newData); 
        setPendingFinancialId(null);
    };

    const handleDeleteGuardianClick = (id: string) => {
        setPendingDeleteGuardianId(id);
    };

    const confirmDeleteGuardian = () => {
        if (!pendingDeleteGuardianId) return;

        setFormData(prev => {
            if (!prev) return null;
            const newData = { 
                ...prev, 
                guardians: prev.guardians?.filter(g => g.id !== pendingDeleteGuardianId) || [] 
            };
            onUpdate(newData);
            return newData;
        });
        setPendingDeleteGuardianId(null);
    };

    const handleSelectGuardian = (contact: Contact) => {
        setPendingGuardian(contact);
        setGuardianSearch(contact.name);
    };

    const handleConfirmAddGuardian = () => {
        if (!pendingGuardian) return;

        const newGuardian: Guardian = {
            id: `g-${Date.now()}`,
            name: pendingGuardian.name,
            role: 'Responsável',
            phone: pendingGuardian.phone,
            isFinancial: false,
            isPedagogical: false
        };

        const newData = {
            ...formData,
            guardians: [...(formData.guardians || []), newGuardian]
        };

        setFormData(newData);
        onUpdate(newData); 

        setIsAddingGuardian(false);
        setGuardianSearch('');
        setPendingGuardian(null);
    };

    const handleCancelAddGuardian = () => {
        setIsAddingGuardian(false);
        setGuardianSearch('');
        setPendingGuardian(null);
    };

    const handleGuardianNameClick = (name: string) => {
        const contact = INITIAL_CONTACTS_DATA.find(c => c.name === name);
        if (contact) {
            setSelectedContact(contact);
        } else {
            const mockContact: Contact = {
                id: 'temp-' + Date.now(),
                name: name,
                account: '',
                phone: '',
                email: '',
                cpf: '',
                country: 'Brasil'
            };
            setSelectedContact(mockContact);
        }
    };

    const getGuardianPhone = (guardian: Guardian) => {
        if (guardian.phone) return guardian.phone;
        const contact = INITIAL_CONTACTS_DATA.find(c => c.name === guardian.name);
        return contact ? contact.phone : '-';
    };

    // --- Notes Logic ---

    const handleAddNoteClick = () => {
        setIsAddingNote(true);
        setEditingNoteId(null);
        setNoteText('');
    };

    const handleEditNoteClick = (note: Note) => {
        setIsAddingNote(false);
        setEditingNoteId(note.id);
        setNoteText(note.content);
    };

    const handleSaveNote = () => {
        if (!noteText.trim()) return;

        let updatedNotes = [...(formData?.notes || [])];

        if (isAddingNote) {
            const newNote: Note = {
                id: `note-${Date.now()}`,
                content: noteText,
                date: new Date().toISOString(),
                author: 'Você' // In a real app, get current user
            };
            updatedNotes = [newNote, ...updatedNotes];
        } else if (editingNoteId) {
            updatedNotes = updatedNotes.map(n => 
                n.id === editingNoteId ? { ...n, content: noteText } : n
            );
        }

        const newData = { ...formData, notes: updatedNotes } as StudentPageData;
        setFormData(newData);
        onUpdate(newData); // Independent update

        // Reset
        setIsAddingNote(false);
        setEditingNoteId(null);
        setNoteText('');
    };

    const handleCancelNote = () => {
        setIsAddingNote(false);
        setEditingNoteId(null);
        setNoteText('');
    };

    const formatDate = (dateStr: string) => {
        if (!dateStr) return '-';
        try {
            const date = new Date(dateStr);
            if (isNaN(date.getTime())) return dateStr;
            return date.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short', year: 'numeric' });
        } catch {
            return dateStr;
        }
    };

    // --- General Form Logic ---

    const toggleSpecificity = (option: string) => {
        if (!isEditing) return;
        setFormData(prev => {
            if (!prev) return null;
            const current = prev.specificities || [];
            if (current.includes(option)) {
                return { ...prev, specificities: current.filter(s => s !== option) };
            } else {
                return { ...prev, specificities: [...current, option] };
            }
        });
    };

    const handleSave = () => {
        if (formData) {
            onUpdate(formData);
            setIsEditing(false);
        }
    };

    const handleCancel = () => {
        if (student) {
            setFormData(JSON.parse(JSON.stringify(student)));
        }
        setIsEditing(false);
    };

    const handleDeleteClick = () => {
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = () => {
        if (onDelete && student) {
            onDelete(student.id);
            setIsDeleteModalOpen(false);
            onClose();
        }
    };

    const inputClass = "w-full p-2 text-sm font-medium text-[#121118] dark:text-[#FFFFFF] bg-[#f1f0f4] dark:bg-[#121118]/50 border border-[#dddce5] dark:border-[#686388] rounded-md focus:ring-[#6258A6] focus:border-[#6258A6] outline-none transition-all";

    return (
        <>
            <Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-[1280px]">
                <div className="flex flex-col h-full max-h-[90vh] bg-[#FFFFFF] dark:bg-[#131121] text-[#121118] dark:text-[#FFFFFF] overflow-hidden rounded-xl">
                    <main className="flex-1 px-4 sm:px-6 lg:px-10 py-8 lg:py-10 overflow-y-auto">
                        <div className="flex flex-col w-full max-w-7xl mx-auto">
                            
                            {/* Breadcrumbs */}
                            <div className="flex flex-wrap gap-2 mb-6">
                                <span className="text-[#686388] dark:text-gray-400 text-sm font-medium leading-normal cursor-pointer" onClick={onClose}>Alunos</span>
                                <span className="text-[#686388] dark:text-gray-400 text-sm font-medium leading-normal">/</span>
                                <span className="text-[#121118] dark:text-white text-sm font-medium leading-normal">{student.firstName} {student.lastName}</span>
                            </div>

                            {/* Header */}
                            <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
                                <div className="flex min-w-72 flex-col gap-2">
                                    <h1 className="text-[#121118] dark:text-white text-4xl font-black leading-tight tracking-tight">{student.firstName} {student.lastName}</h1>
                                    <p className="text-[#686388] dark:text-gray-400 text-base font-normal leading-normal">Ficha do Aluno.</p>
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
                                                title="Editar Aluno"
                                            >
                                                <Icon name="edit" className="text-xl" />
                                            </button>
                                            <button 
                                                onClick={handleDeleteClick}
                                                className="flex size-10 cursor-pointer items-center justify-center overflow-hidden rounded-lg bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                                                title="Excluir Aluno"
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

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                
                                {/* Left Column (2 spans) */}
                                <div className="lg:col-span-2 flex flex-col gap-8">
                                    
                                    {/* Student Info */}
                                    <div className="bg-white dark:bg-[#131121] border border-[#D1D3D4] dark:border-gray-700 rounded-xl">
                                        <h2 className="text-[#333333] dark:text-white text-[22px] font-bold leading-tight tracking-[-0.015em] px-6 pt-5 pb-3 border-b border-[#D1D3D4] dark:border-gray-700">Informações Pessoais</h2>
                                        <div className="p-6 grid grid-cols-1 md:grid-cols-2">
                                            <div className="flex flex-col gap-1 border-t border-solid border-[#D1D3D4] dark:border-gray-700 py-4 pr-2">
                                                <p className="text-[#686388] dark:text-gray-400 text-sm font-normal leading-normal">Nome</p>
                                                {isEditing ? (
                                                    <input value={formData.firstName} onChange={(e) => handleInputChange('firstName', e.target.value)} className={inputClass} />
                                                ) : (
                                                    <p className="text-[#333333] dark:text-white text-sm font-normal leading-normal">{formData.firstName}</p>
                                                )}
                                            </div>
                                            <div className="flex flex-col gap-1 border-t border-solid border-[#D1D3D4] dark:border-gray-700 py-4 md:pl-2">
                                                <p className="text-[#686388] dark:text-gray-400 text-sm font-normal leading-normal">Sobrenome</p>
                                                {isEditing ? (
                                                    <input value={formData.lastName} onChange={(e) => handleInputChange('lastName', e.target.value)} className={inputClass} />
                                                ) : (
                                                    <p className="text-[#333333] dark:text-white text-sm font-normal leading-normal">{formData.lastName}</p>
                                                )}
                                            </div>
                                            <div className="flex flex-col gap-1 border-t border-solid border-[#D1D3D4] dark:border-gray-700 py-4 pr-2">
                                                <p className="text-[#686388] dark:text-gray-400 text-sm font-normal leading-normal">Data de Nascimento</p>
                                                {isEditing ? (
                                                    <input type="date" value={formData.dateOfBirth} onChange={(e) => handleInputChange('dateOfBirth', e.target.value)} className={inputClass} />
                                                ) : (
                                                    <p className="text-[#333333] dark:text-white text-sm font-normal leading-normal">{new Date(formData.dateOfBirth).toLocaleDateString('pt-BR')}</p>
                                                )}
                                            </div>
                                            <div className="flex flex-col gap-1 border-t border-solid border-[#D1D3D4] dark:border-gray-700 py-4 md:pl-2">
                                                <p className="text-[#686388] dark:text-gray-400 text-sm font-normal leading-normal">Gênero</p>
                                                {isEditing ? (
                                                    <select value={formData.gender || ''} onChange={(e) => handleInputChange('gender', e.target.value)} className={inputClass}>
                                                        <option value="Masculino">Masculino</option>
                                                        <option value="Feminino">Feminino</option>
                                                    </select>
                                                ) : (
                                                    <p className="text-[#333333] dark:text-white text-sm font-normal leading-normal">{formData.gender}</p>
                                                )}
                                            </div>
                                            <div className="flex flex-col gap-1 border-t border-solid border-[#D1D3D4] dark:border-gray-700 py-4 pr-2">
                                                <p className="text-[#686388] dark:text-gray-400 text-sm font-normal leading-normal">Escola</p>
                                                {isEditing ? (
                                                    <input value={formData.school} onChange={(e) => handleInputChange('school', e.target.value)} className={inputClass} />
                                                ) : (
                                                    <p className="text-[#333333] dark:text-white text-sm font-normal leading-normal">{formData.school}</p>
                                                )}
                                            </div>
                                            <div className="flex flex-col gap-1 border-t border-solid border-[#D1D3D4] dark:border-gray-700 py-4 md:pl-2">
                                                <p className="text-[#686388] dark:text-gray-400 text-sm font-normal leading-normal">Ano Escolar</p>
                                                {isEditing ? (
                                                    <div className="relative">
                                                        <select 
                                                            value={formData.schoolYear || ''} 
                                                            onChange={(e) => handleInputChange('schoolYear', e.target.value)} 
                                                            className={`${inputClass} appearance-none cursor-pointer`}
                                                        >
                                                            <option value="" disabled>Selecione o ano...</option>
                                                            {SCHOOL_YEAR_OPTIONS.map(opt => (
                                                                <option key={opt} value={opt}>{opt}</option>
                                                            ))}
                                                        </select>
                                                        <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                                                            <Icon name="expand_more" />
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <p className="text-[#333333] dark:text-white text-sm font-normal leading-normal">{formData.schoolYear}</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Specificities */}
                                    <div className="bg-white dark:bg-[#131121] border border-[#D1D3D4] dark:border-gray-700 rounded-xl">
                                        <h2 className="text-[#333333] dark:text-white text-[22px] font-bold leading-tight tracking-[-0.015em] px-6 pt-5 pb-3 border-b border-[#D1D3D4] dark:border-gray-700">Especificidades</h2>
                                        <div className="p-6">
                                            {isEditing ? (
                                                <div className="relative" ref={specDropdownRef}>
                                                    <div 
                                                        className={`${inputClass} cursor-pointer flex flex-wrap gap-2 min-h-[46px] items-center`}
                                                        onClick={() => setIsSpecDropdownOpen(!isSpecDropdownOpen)}
                                                    >
                                                        {formData.specificities && formData.specificities.length > 0 ? (
                                                            formData.specificities.map(spec => (
                                                                <span key={spec} className="inline-flex items-center gap-1 bg-primary/10 text-primary text-xs font-bold px-2 py-1 rounded-full">
                                                                    {spec}
                                                                    <div 
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            toggleSpecificity(spec);
                                                                        }}
                                                                        className="hover:text-primary/80 cursor-pointer"
                                                                    >
                                                                        <Icon name="close" style={{ fontSize: '14px' }} />
                                                                    </div>
                                                                </span>
                                                            ))
                                                        ) : (
                                                            <span className="text-gray-400">Selecione...</span>
                                                        )}
                                                        <div className="ml-auto text-gray-400">
                                                            <Icon name="expand_more" />
                                                        </div>
                                                    </div>

                                                    {isSpecDropdownOpen && (
                                                        <div className="absolute z-50 w-full mt-1 bg-white dark:bg-[#1e1d24] border border-neutral-200 dark:border-gray-700 rounded-lg shadow-xl max-h-60 overflow-y-auto">
                                                            {SPECIFICITY_OPTIONS.map(option => (
                                                                <div
                                                                    key={option}
                                                                    onClick={() => toggleSpecificity(option)}
                                                                    className="flex items-center w-full px-4 py-3 text-sm text-left hover:bg-neutral-100 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100 cursor-pointer border-b border-neutral-100 dark:border-gray-800 last:border-0"
                                                                >
                                                                    <div className={`w-4 h-4 mr-3 border rounded flex items-center justify-center transition-colors ${formData.specificities?.includes(option) ? 'bg-primary border-primary' : 'border-gray-400'}`}>
                                                                        {formData.specificities?.includes(option) && <Icon name="check" className="text-white !text-xs" />}
                                                                    </div>
                                                                    {option}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            ) : (
                                                <div className="flex flex-wrap gap-2">
                                                    {formData.specificities && formData.specificities.length > 0 ? (
                                                        formData.specificities.map((spec) => (
                                                            <span key={spec} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">
                                                                {spec}
                                                            </span>
                                                        ))
                                                    ) : (
                                                        <p className="text-gray-500 dark:text-gray-400 italic">Nenhuma especificidade registrada.</p>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Guardians */}
                                    <div className="border border-neutral-200 dark:border-gray-700 rounded-xl bg-white dark:bg-[#131121] flex flex-col">
                                        <div className="p-6 border-b border-neutral-200 dark:border-gray-700 rounded-t-xl">
                                            <h3 className="text-lg font-bold text-gray-800 dark:text-white">Responsáveis</h3>
                                        </div>
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-left">
                                                <thead className="border-b border-neutral-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                                                    <tr className="text-sm text-gray-500 dark:text-gray-400">
                                                        <th className="font-medium px-6 py-3">Nome do Responsável</th>
                                                        <th className="font-medium px-6 py-3">Telefone</th>
                                                        <th className="font-medium px-6 py-3 text-center">Financeiro</th>
                                                        <th className="font-medium px-6 py-3 text-right"></th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-neutral-200 dark:divide-gray-700">
                                                    {formData.guardians?.map((guardian) => (
                                                        <tr key={guardian.id} className={`text-sm ${guardian.isFinancial ? 'bg-primary/5 dark:bg-primary/10' : ''}`}>
                                                            <td className="px-6 py-4 whitespace-nowrap">
                                                                <div className="flex items-center gap-3">
                                                                    <button 
                                                                        onClick={() => handleGuardianNameClick(guardian.name)}
                                                                        className="font-medium text-[#6258A6] hover:underline dark:text-primary/90 text-left"
                                                                    >
                                                                        {guardian.name}
                                                                    </button>
                                                                    {guardian.isFinancial && (
                                                                        <span className="text-[10px] font-bold text-primary dark:text-primary/90 bg-primary/10 dark:bg-primary/20 px-2 py-0.5 rounded-full border border-primary/20">
                                                                            FINANCEIRO
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-4 text-gray-600 dark:text-gray-300">
                                                                {getGuardianPhone(guardian)}
                                                            </td>
                                                            <td className="px-6 py-4 text-center">
                                                                <input 
                                                                    type="checkbox" 
                                                                    checked={guardian.isFinancial} 
                                                                    disabled={isEditing}
                                                                    onChange={(e) => initiateFinancialChange(guardian.id, guardian.isFinancial)}
                                                                    className="rounded text-primary focus:ring-primary cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed" 
                                                                />
                                                            </td>
                                                            <td className="px-6 py-4 text-right">
                                                                <button 
                                                                    onClick={() => handleDeleteGuardianClick(guardian.id)} 
                                                                    disabled={guardian.isFinancial}
                                                                    title={guardian.isFinancial ? "O responsável financeiro não pode ser removido." : "Remover responsável"}
                                                                    className={`p-1 rounded-lg transition-colors ${
                                                                        guardian.isFinancial 
                                                                        ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed' 
                                                                        : 'text-gray-400 hover:text-red-500 hover:bg-neutral-100 dark:hover:bg-gray-800'
                                                                    }`}
                                                                >
                                                                    <Icon name="delete" />
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                        
                                        <div className="p-6 border-t border-neutral-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/10 rounded-b-xl">
                                            {isAddingGuardian ? (
                                                <div className="flex items-center gap-3 w-full animate-fade-in" ref={guardianSearchRef}>
                                                    <div className="relative flex-1">
                                                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                                                            <Icon name="search" />
                                                        </div>
                                                        <input 
                                                            autoFocus
                                                            type="text" 
                                                            value={guardianSearch}
                                                            onChange={(e) => setGuardianSearch(e.target.value)}
                                                            className={`${inputClass} pl-9 h-10`}
                                                            placeholder="Pesquisar contato..."
                                                        />
                                                        
                                                        {guardianSearch && !pendingGuardian && (
                                                            <div className="absolute bottom-full left-0 right-0 z-50 mb-1 bg-white dark:bg-[#1e1d24] border border-neutral-200 dark:border-gray-700 rounded-lg shadow-xl max-h-48 overflow-y-auto">
                                                                {filteredContacts.length > 0 ? (
                                                                    filteredContacts.map(contact => (
                                                                        <button
                                                                            key={contact.id}
                                                                            onClick={() => handleSelectGuardian(contact)}
                                                                            className="w-full text-left px-4 py-3 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex flex-col gap-0.5 border-b border-neutral-100 dark:border-gray-800 last:border-0"
                                                                        >
                                                                            <span className="font-bold text-gray-900 dark:text-gray-100">{contact.name}</span>
                                                                            <span className="text-xs text-gray-500 dark:text-gray-400">{contact.email}</span>
                                                                        </button>
                                                                    ))
                                                                ) : (
                                                                    <div className="px-4 py-3 text-sm text-gray-500 italic">Nenhum contato encontrado.</div>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                    
                                                    <button 
                                                        onClick={handleConfirmAddGuardian}
                                                        disabled={!pendingGuardian}
                                                        className="flex size-10 items-center justify-center rounded-lg bg-green-500 text-white hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition-colors"
                                                        title="Confirmar"
                                                    >
                                                        <Icon name="check" />
                                                    </button>
                                                    <button 
                                                        onClick={handleCancelAddGuardian}
                                                        className="flex size-10 items-center justify-center rounded-lg bg-white border border-gray-200 text-gray-500 hover:bg-red-50 hover:text-red-500 hover:border-red-200 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-red-900/20 transition-colors shadow-sm"
                                                        title="Cancelar"
                                                    >
                                                        <Icon name="close" />
                                                    </button>
                                                </div>
                                            ) : (
                                                <button 
                                                    onClick={() => setIsAddingGuardian(true)}
                                                    className="flex w-full sm:w-auto items-center justify-center rounded-lg h-10 px-4 bg-primary text-white text-sm font-bold gap-2 hover:bg-primary/90 transition-colors"
                                                >
                                                    <Icon name="add" className="!text-base" />
                                                    <span>Adicionar Responsável</span>
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Right Column (Sidebar) */}
                                <div className="lg:col-span-1">
                                    <div className="sticky top-8">
                                        <div className="flex border-b border-[#D1D3D4] dark:border-gray-700">
                                            <button 
                                                onClick={() => setActiveTab('Timeline')}
                                                className={`flex-1 py-3 text-sm font-bold transition-colors ${activeTab === 'Timeline' ? 'text-[#6258A6] border-b-2 border-[#6258A6]' : 'text-[#686388] dark:text-gray-400 hover:text-[#333333] dark:hover:text-white'}`}
                                            >
                                                Timeline
                                            </button>
                                            <button 
                                                onClick={() => setActiveTab('Notas')}
                                                className={`flex-1 py-3 text-sm font-bold transition-colors ${activeTab === 'Notas' ? 'text-[#6258A6] border-b-2 border-[#6258A6]' : 'text-[#686388] dark:text-gray-400 hover:text-[#333333] dark:hover:text-white'}`}
                                            >
                                                Notas
                                            </button>
                                        </div>
                                        <div className="pt-6">
                                            {activeTab === 'Timeline' && (
                                                <div className="flex flex-col items-center justify-center text-center p-8 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                                                    <Icon name="history" className="text-4xl text-[#686388] dark:text-gray-400 mb-2" />
                                                    <p className="text-sm text-[#686388] dark:text-gray-400">Nenhum histórico disponível.</p>
                                                </div>
                                            )}
                                            {activeTab === 'Notas' && (
                                                 <div className="flex flex-col gap-4">
                                                    {/* Add Note Button */}
                                                    {!isAddingNote && (
                                                        <button 
                                                            onClick={handleAddNoteClick}
                                                            className="flex items-center gap-2 text-sm text-primary font-bold hover:underline mb-2 transition-colors"
                                                        >
                                                            <Icon name="add_circle" className="text-lg" />
                                                            Adicionar Nota
                                                        </button>
                                                    )}

                                                    {/* Add Note Input Area */}
                                                    {isAddingNote && (
                                                        <div className="p-3 bg-white dark:bg-gray-800 border border-primary/30 rounded-lg shadow-sm animate-scale-in origin-top">
                                                            <textarea
                                                                autoFocus
                                                                value={noteText}
                                                                onChange={(e) => setNoteText(e.target.value)}
                                                                className="w-full bg-transparent border-none focus:ring-0 text-sm text-[#121118] dark:text-white placeholder-gray-400 resize-none mb-2"
                                                                placeholder="Escreva sua nota aqui..."
                                                                rows={3}
                                                            />
                                                            <div className="flex justify-end gap-2">
                                                                <button 
                                                                    onClick={handleCancelNote}
                                                                    className="px-3 py-1.5 text-xs font-bold text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-md transition-colors"
                                                                >
                                                                    Cancelar
                                                                </button>
                                                                <button 
                                                                    onClick={handleSaveNote}
                                                                    disabled={!noteText.trim()}
                                                                    className="px-3 py-1.5 text-xs font-bold text-white bg-primary hover:bg-primary/90 rounded-md transition-colors disabled:opacity-50"
                                                                >
                                                                    Salvar
                                                                </button>
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Notes List */}
                                                    {formData.notes && formData.notes.length > 0 ? (
                                                        <div className="flex flex-col gap-3">
                                                            {formData.notes.map(note => (
                                                                <div key={note.id} className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700 transition-all">
                                                                    {editingNoteId === note.id ? (
                                                                        <div className="animate-fade-in">
                                                                            <textarea
                                                                                autoFocus
                                                                                value={noteText}
                                                                                onChange={(e) => setNoteText(e.target.value)}
                                                                                className="w-full bg-white dark:bg-gray-900 border border-primary/30 rounded-md p-2 focus:ring-1 focus:ring-primary text-sm text-[#121118] dark:text-white resize-none mb-2"
                                                                                rows={3}
                                                                            />
                                                                            <div className="flex justify-end gap-2">
                                                                                <button 
                                                                                    onClick={handleCancelNote}
                                                                                    className="px-2 py-1 text-xs font-bold text-gray-500 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                                                                                >
                                                                                    Cancelar
                                                                                </button>
                                                                                <button 
                                                                                    onClick={handleSaveNote}
                                                                                    className="px-2 py-1 text-xs font-bold text-white bg-primary rounded hover:bg-primary/90 transition-colors"
                                                                                >
                                                                                    Salvar
                                                                                </button>
                                                                            </div>
                                                                        </div>
                                                                    ) : (
                                                                        <div 
                                                                            onClick={() => handleEditNoteClick(note)}
                                                                            className="cursor-pointer group"
                                                                        >
                                                                            <p className="text-sm text-[#333333] dark:text-gray-200 whitespace-pre-wrap group-hover:text-primary transition-colors">
                                                                                {note.content}
                                                                            </p>
                                                                            <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                                                                                <span className="text-[10px] font-bold text-gray-400 uppercase">{note.author}</span>
                                                                                <span className="text-[10px] text-gray-400">{formatDate(note.date)}</span>
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        !isAddingNote && (
                                                            <div className="flex flex-col items-center justify-center text-center p-8 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                                                                <Icon name="edit_note" className="text-4xl text-[#686388] dark:text-gray-400 mb-2" />
                                                                <p className="text-sm text-[#686388] dark:text-gray-400">Nenhuma nota registrada.</p>
                                                            </div>
                                                        )
                                                    )}
                                                </div>
                                            )}
                                        </div>
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
                leadName={`${student.firstName} ${student.lastName}`}
                entityType="Aluno"
            />

            <ConfirmActionModal
                isOpen={!!pendingFinancialId}
                onClose={() => setPendingFinancialId(null)}
                onConfirm={confirmFinancialChange}
                title="Alterar responsável financeiro?"
                description="Apenas um responsável pode ser definido como financeiro. O responsável anterior será desmarcado."
                confirmText="Confirmar"
            />

            <ConfirmActionModal
                isOpen={!!pendingDeleteGuardianId}
                onClose={() => setPendingDeleteGuardianId(null)}
                onConfirm={confirmDeleteGuardian}
                title="Remover responsável?"
                description="Tem certeza que deseja remover este responsável? Esta ação não pode ser desfeita."
                confirmText="Remover"
                cancelText="Cancelar"
                icon="delete"
            />

            <ContactDetailModal
                isOpen={!!selectedContact}
                onClose={() => setSelectedContact(null)}
                contact={selectedContact}
                onUpdate={(updated) => {
                    // Optional: If contact details update, refresh local state if needed
                    setSelectedContact(updated);
                }}
            />
        </>
    );
};
