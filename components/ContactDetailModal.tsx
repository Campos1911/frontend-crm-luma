
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Modal } from './ui/Modal';
import { Contact, Address, Account, StudentPageData } from '../types';
import { Icon } from './ui/Icon';
import { ConfirmDeleteModal } from './ConfirmDeleteModal';
import { ConfirmActionModal } from './ConfirmActionModal';
import { AccountDetailModal } from './AccountDetailModal';
import { StudentDetailModal } from './StudentDetailModal';
import { StudentFormModal } from './StudentFormModal';
import { getAccounts, updateAccount, deleteAccount } from '../dataStore';
import { INITIAL_STUDENTS_LIST } from '../constants';

interface ContactDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    contact: Contact | null;
    onUpdate?: (contact: Contact) => void;
    onDelete?: (contactId: string) => void;
}

const COUNTRIES = [
    'Brasil', 
    'EUA', 
    'Portugal', 
    'Reino Unido', 
    'Alemanha', 
    'França', 
    'Espanha', 
    'Itália', 
    'Argentina', 
    'Uruguai'
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

const CONTACT_ROLES = [
    'Principal',
    'RH',
    'Vendedor',
    'Parente'
];

export const ContactDetailModal: React.FC<ContactDetailModalProps> = ({ 
    isOpen, 
    onClose, 
    contact,
    onUpdate,
    onDelete
}) => {
    const [activeTab, setActiveTab] = useState<'Timeline' | 'Propostas'>('Timeline');
    const [isEditing, setIsEditing] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    
    // Student Delete State
    const [pendingDeleteStudentId, setPendingDeleteStudentId] = useState<string | null>(null);
    
    // Student Detail Modal State
    const [selectedStudent, setSelectedStudent] = useState<StudentPageData | null>(null);

    // Student Add/Create States
    const [isStudentSearchOpen, setIsStudentSearchOpen] = useState(false);
    const [studentSearchTerm, setStudentSearchTerm] = useState('');
    const [isStudentFormModalOpen, setIsStudentFormModalOpen] = useState(false);
    const studentSearchRef = useRef<HTMLDivElement>(null);

    // Account Modal State
    const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
    const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);

    // Form State
    const [formData, setFormData] = useState<Contact | null>(null);
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');

    // Phone Edit State
    const [phoneCountryCode, setPhoneCountryCode] = useState('+55');
    const [phoneNumber, setPhoneNumber] = useState('');

    // Account Search State
    const [isAccountDropdownOpen, setIsAccountDropdownOpen] = useState(false);
    const accountDropdownRef = useRef<HTMLDivElement>(null);

    // Available Accounts for Search
    const availableAccounts = getAccounts();

    useEffect(() => {
        if (contact) {
            setFormData(JSON.parse(JSON.stringify(contact)));
            const nameParts = contact.name.split(' ');
            setFirstName(nameParts[0] || '');
            setLastName(nameParts.slice(1).join(' ') || '');

            // Parse phone number
            const phone = contact.phone || '';
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
        setActiveTab('Timeline');
        setIsAccountDropdownOpen(false);
        setIsAccountModalOpen(false);
        setPendingDeleteStudentId(null);
        setSelectedStudent(null);
        
        // Reset Search Student states
        setIsStudentSearchOpen(false);
        setStudentSearchTerm('');
        setIsStudentFormModalOpen(false);
    }, [contact, isOpen]);

    // Handle click outside for dropdowns
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (accountDropdownRef.current && !accountDropdownRef.current.contains(event.target as Node)) {
                setIsAccountDropdownOpen(false);
            }
            if (studentSearchRef.current && !studentSearchRef.current.contains(event.target as Node)) {
                // Only close if click is outside the entire component (including the new row)
                setIsStudentSearchOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Filter available students for search (exclude those already linked)
    const filteredAvailableStudents = useMemo(() => {
        const term = studentSearchTerm.toLowerCase();
        const existingStudentIds = formData?.students?.map(s => s.id) || [];
        
        return INITIAL_STUDENTS_LIST.filter(s => {
            const fullName = `${s.firstName} ${s.lastName}`.toLowerCase();
            return fullName.includes(term) && !existingStudentIds.includes(s.id);
        });
    }, [studentSearchTerm, formData]);

    if (!contact || !formData) return null;

    const handleInputChange = (field: keyof Contact, value: string) => {
        setFormData(prev => prev ? ({ ...prev, [field]: value }) : null);
    };

    const handleAccountSelect = (accountName: string) => {
        handleInputChange('account', accountName);
        setIsAccountDropdownOpen(false);
    };

    const handleAccountClick = () => {
        if (formData.account) {
            const foundAccount = availableAccounts.find(acc => acc.name === formData.account);
            if (foundAccount) {
                setSelectedAccount(foundAccount);
                setIsAccountModalOpen(true);
            }
        }
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

    const handleAddressChange = (field: keyof Address, value: string) => {
        setFormData(prev => {
            if (!prev) return null;
            return {
                ...prev,
                address: {
                    ...prev.address,
                    [field]: value
                } as Address
            };
        });
    };

    const handleSave = () => {
        if (onUpdate && formData) {
            const updatedContact = {
                ...formData,
                name: `${firstName} ${lastName}`.trim()
            };
            onUpdate(updatedContact);
            setIsEditing(false);
        }
    };

    const handleCancel = () => {
        if (contact) {
            setFormData(JSON.parse(JSON.stringify(contact)));
            const nameParts = contact.name.split(' ');
            setFirstName(nameParts[0] || '');
            setLastName(nameParts.slice(1).join(' ') || '');

            const phone = contact.phone || '';
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
        setIsAccountDropdownOpen(false);
    };

    const handleDeleteClick = () => {
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = () => {
        if (onDelete && contact) {
            onDelete(contact.id);
            setIsDeleteModalOpen(false);
            onClose();
        }
    };

    // Student Management
    const handleDeleteStudentClick = (studentId: string) => {
        setPendingDeleteStudentId(studentId);
    };

    const confirmDeleteStudent = () => {
        if (!formData || !pendingDeleteStudentId) return;

        const updatedStudents = formData.students?.filter(s => s.id !== pendingDeleteStudentId) || [];
        const updatedContact = { ...formData, students: updatedStudents };
        
        setFormData(updatedContact);
        if (onUpdate) {
            // Need to merge name here as well if updating immediately
            const contactToUpdate = {
                ...updatedContact,
                name: `${firstName} ${lastName}`.trim()
            };
            onUpdate(contactToUpdate);
        }
        setPendingDeleteStudentId(null);
    };

    const handleStudentNameClick = (studentId: string, studentName: string) => {
        // Try to find full student data from the global store
        const fullStudent = INITIAL_STUDENTS_LIST.find(s => s.id === studentId);
        
        if (fullStudent) {
            setSelectedStudent(fullStudent);
        } else {
            // Fallback mock if not in global list
            const parts = studentName.split(' ');
            const mockStudent: StudentPageData = {
                id: studentId,
                firstName: parts[0] || '',
                lastName: parts.slice(1).join(' ') || '',
                dateOfBirth: new Date().toISOString(),
                school: '',
                financialGuardian: contact.name,
                email: '',
                gender: '',
                schoolYear: '',
                specificities: [],
                guardians: []
            };
            setSelectedStudent(mockStudent);
        }
    };

    const handleStudentUpdate = (updated: StudentPageData) => {
        setSelectedStudent(updated);
        // Here you would typically update the global store or trigger a refresh
    };

    const handleStudentDelete = (id: string) => {
        // Trigger local removal from list as well
        handleDeleteStudentClick(id);
        setSelectedStudent(null);
    };

    const handleAddExistingStudent = (student: StudentPageData) => {
        const newStudentLink = {
            id: student.id,
            name: `${student.firstName} ${student.lastName}`,
            role: 'Aluno',
            financial: false, // Default false when adding existing
            pedagogical: true // Default true
        };

        const updatedContact = {
            ...formData,
            students: [...(formData.students || []), newStudentLink]
        };

        setFormData(updatedContact);
        if (onUpdate) {
             const contactToUpdate = {
                ...updatedContact,
                name: `${firstName} ${lastName}`.trim()
            };
            onUpdate(contactToUpdate);
        }
        
        // Reset Search
        setIsStudentSearchOpen(false);
        setStudentSearchTerm('');
    };

    const handleCreateNewStudentClick = () => {
        setIsStudentSearchOpen(false);
        setIsStudentFormModalOpen(true);
    };

    const handleSaveNewStudentFromModal = (newStudent: StudentPageData) => {
        // Add to the INITIAL_STUDENTS_LIST mock in memory (so search works later)
        // In a real app this would be a store action
        if (!INITIAL_STUDENTS_LIST.some(s => s.id === newStudent.id)) {
            INITIAL_STUDENTS_LIST.unshift(newStudent);
        }

        const newStudentLink = {
            id: newStudent.id,
            name: `${newStudent.firstName} ${newStudent.lastName}`,
            role: 'Aluno',
            financial: true, // Since we created it from here and pre-filled guardian
            pedagogical: true
        };

        const updatedContact = {
            ...formData,
            students: [...(formData.students || []), newStudentLink]
        };

        setFormData(updatedContact);
        if (onUpdate) {
             const contactToUpdate = {
                ...updatedContact,
                name: `${firstName} ${lastName}`.trim()
            };
            onUpdate(contactToUpdate);
        }
        
        setIsStudentFormModalOpen(false);
    };

    const handleUpdateAccountFromDetail = (updated: Account) => {
        updateAccount(updated);
        setSelectedAccount(updated);
    };

    const handleDeleteAccountFromDetail = (id: string) => {
        deleteAccount(id);
        setIsAccountModalOpen(false);
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
                                <span className="text-[#686388] dark:text-gray-400 hover:text-[#6258A6] dark:hover:text-[#6258A6] text-sm font-medium leading-normal cursor-pointer">Home</span>
                                <span className="text-[#686388] dark:text-gray-400 text-sm font-medium leading-normal">/</span>
                                <span className="text-[#686388] dark:text-gray-400 hover:text-[#6258A6] dark:hover:text-[#6258A6] text-sm font-medium leading-normal cursor-pointer" onClick={onClose}>Contatos</span>
                                <span className="text-[#686388] dark:text-gray-400 text-sm font-medium leading-normal">/</span>
                                <span className="text-[#121118] dark:text-white text-sm font-medium leading-normal">{contact.name}</span>
                            </div>

                            {/* Header */}
                            <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
                                <div className="flex min-w-72 flex-col gap-2">
                                    <h1 className="text-[#121118] dark:text-white text-4xl font-black leading-tight tracking-tight">{contact.name}</h1>
                                    <p className="text-[#686388] dark:text-gray-400 text-base font-normal leading-normal">Detalhes deste registro de contato.</p>
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
                                                title="Editar Contato"
                                            >
                                                <Icon name="edit" className="text-xl" />
                                            </button>
                                            <button 
                                                onClick={handleDeleteClick}
                                                className="flex size-10 cursor-pointer items-center justify-center overflow-hidden rounded-lg bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                                                title="Excluir Contato"
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
                                    
                                    {/* Contact Information */}
                                    <div className="bg-white dark:bg-[#131121] border border-[#D1D3D4] dark:border-gray-700 rounded-xl">
                                        <h2 className="text-[#333333] dark:text-white text-[22px] font-bold leading-tight tracking-[-0.015em] px-6 pt-5 pb-3 border-b border-[#D1D3D4] dark:border-gray-700">Informações de Contato</h2>
                                        <div className="p-6 grid grid-cols-1 md:grid-cols-2">
                                            {/* Row 1: Name and Surname */}
                                            <div className="flex flex-col gap-1 border-t border-solid border-[#D1D3D4] dark:border-gray-700 py-4 pr-2">
                                                <p className="text-[#686388] dark:text-gray-400 text-sm font-normal leading-normal">Nome</p>
                                                {isEditing ? (
                                                    <input value={firstName} onChange={(e) => setFirstName(e.target.value)} className={inputClass} />
                                                ) : (
                                                    <p className="text-[#333333] dark:text-white text-sm font-normal leading-normal">{firstName}</p>
                                                )}
                                            </div>
                                            <div className="flex flex-col gap-1 border-t border-solid border-[#D1D3D4] dark:border-gray-700 py-4 md:pl-2">
                                                <p className="text-[#686388] dark:text-gray-400 text-sm font-normal leading-normal">Sobrenome</p>
                                                {isEditing ? (
                                                    <input value={lastName} onChange={(e) => setLastName(e.target.value)} className={inputClass} />
                                                ) : (
                                                    <p className="text-[#333333] dark:text-white text-sm font-normal leading-normal">{lastName}</p>
                                                )}
                                            </div>

                                            {/* Row 2: Account and CPF */}
                                            <div className="flex flex-col gap-1 border-t border-solid border-[#D1D3D4] dark:border-gray-700 py-4 pr-2" ref={accountDropdownRef}>
                                                <p className="text-[#686388] dark:text-gray-400 text-sm font-normal leading-normal">Conta</p>
                                                {isEditing ? (
                                                    <div className="relative">
                                                        <input 
                                                            value={formData.account} 
                                                            onChange={(e) => {
                                                                handleInputChange('account', e.target.value);
                                                                setIsAccountDropdownOpen(true);
                                                            }}
                                                            onFocus={() => setIsAccountDropdownOpen(true)}
                                                            className={inputClass}
                                                            placeholder="Pesquisar conta..."
                                                        />
                                                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                                                            <Icon name="search" style={{fontSize: '16px'}} />
                                                        </div>

                                                        {isAccountDropdownOpen && (
                                                            <div className="absolute z-50 w-full mt-1 bg-white dark:bg-[#1e1d24] border border-neutral-200 dark:border-gray-700 rounded-lg shadow-xl max-h-60 overflow-y-auto">
                                                                {availableAccounts.filter(acc => acc.name.toLowerCase().includes(formData.account.toLowerCase())).length > 0 ? (
                                                                    availableAccounts
                                                                        .filter(acc => acc.name.toLowerCase().includes(formData.account.toLowerCase()))
                                                                        .map(acc => (
                                                                            <button
                                                                                key={acc.id}
                                                                                onClick={() => handleAccountSelect(acc.name)}
                                                                                className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-neutral-100 dark:hover:bg-gray-700 flex items-center gap-2 border-b border-neutral-100 dark:border-gray-800 last:border-0"
                                                                            >
                                                                                <Icon name="apartment" style={{fontSize: '16px'}} className="text-gray-400" />
                                                                                <span className="font-medium">{acc.name}</span>
                                                                            </button>
                                                                        ))
                                                                ) : (
                                                                    <div className="px-4 py-2 text-sm text-gray-500 italic">Nenhuma conta encontrada.</div>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <button 
                                                        onClick={handleAccountClick} 
                                                        className={`text-sm font-normal leading-normal text-left ${formData.account ? 'text-[#6258A6] hover:underline font-medium' : 'text-[#333333] dark:text-white cursor-default'}`}
                                                        disabled={!formData.account}
                                                    >
                                                        {formData.account || '-'}
                                                    </button>
                                                )}
                                            </div>
                                            <div className="flex flex-col gap-1 border-t border-solid border-[#D1D3D4] dark:border-gray-700 py-4 md:pl-2">
                                                <p className="text-[#686388] dark:text-gray-400 text-sm font-normal leading-normal">CPF</p>
                                                {isEditing ? (
                                                    <input 
                                                        value={formData.cpf} 
                                                        onChange={(e) => handleInputChange('cpf', e.target.value.replace(/\D/g, ''))} 
                                                        className={inputClass}
                                                        placeholder="Apenas números"
                                                    />
                                                ) : (
                                                    <p className="text-[#333333] dark:text-white text-sm font-normal leading-normal">{formData.cpf}</p>
                                                )}
                                            </div>

                                            {/* Row 3: Phone and Email */}
                                            <div className="flex flex-col gap-1 border-t border-solid border-[#D1D3D4] dark:border-gray-700 py-4 pr-2">
                                                <p className="text-[#686388] dark:text-gray-400 text-sm font-normal leading-normal">Telefone</p>
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
                                                    <p className="text-[#333333] dark:text-white text-sm font-normal leading-normal">{formData.phone}</p>
                                                )}
                                            </div>
                                            <div className="flex flex-col gap-1 border-t border-solid border-[#D1D3D4] dark:border-gray-700 py-4 md:pl-2">
                                                <p className="text-[#686388] dark:text-gray-400 text-sm font-normal leading-normal">Email</p>
                                                {isEditing ? (
                                                    <input value={formData.email} onChange={(e) => handleInputChange('email', e.target.value)} className={inputClass} />
                                                ) : (
                                                    <p className="text-[#333333] dark:text-white text-sm font-normal leading-normal">{formData.email}</p>
                                                )}
                                            </div>

                                            {/* Row 4: DOB and Role */}
                                            <div className="flex flex-col gap-1 border-t border-solid border-[#D1D3D4] dark:border-gray-700 py-4 pr-2">
                                                <p className="text-[#686388] dark:text-gray-400 text-sm font-normal leading-normal">Data de Nascimento</p>
                                                {isEditing ? (
                                                    <input 
                                                        type="date"
                                                        value={formData.dateOfBirth || ''} 
                                                        onChange={(e) => handleInputChange('dateOfBirth', e.target.value)} 
                                                        className={inputClass} 
                                                    />
                                                ) : (
                                                    <p className="text-[#333333] dark:text-white text-sm font-normal leading-normal">
                                                        {formData.dateOfBirth ? new Date(formData.dateOfBirth).toLocaleDateString('pt-BR') : '-'}
                                                    </p>
                                                )}
                                            </div>
                                            <div className="flex flex-col gap-1 border-t border-solid border-[#D1D3D4] dark:border-gray-700 py-4 md:pl-2">
                                                <p className="text-[#686388] dark:text-gray-400 text-sm font-normal leading-normal">Função</p>
                                                {isEditing ? (
                                                    <div className="relative">
                                                        <select 
                                                            value={formData.role || ''} 
                                                            onChange={(e) => handleInputChange('role', e.target.value)} 
                                                            className={`${inputClass} appearance-none pr-8 cursor-pointer bg-none`}
                                                        >
                                                            <option value="" disabled>Selecione...</option>
                                                            {CONTACT_ROLES.map(r => (
                                                                <option key={r} value={r}>{r}</option>
                                                            ))}
                                                        </select>
                                                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-[#686388] dark:text-[#dddce5]">
                                                            <Icon name="expand_more" className="text-xl" />
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <p className="text-[#333333] dark:text-white text-sm font-normal leading-normal">{formData.role || '-'}</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Address */}
                                    <div className="bg-white dark:bg-[#131121] border border-[#D1D3D4] dark:border-gray-700 rounded-xl">
                                        <h2 className="text-[#333333] dark:text-white text-[22px] font-bold leading-tight tracking-[-0.015em] px-6 pt-5 pb-3 border-b border-[#D1D3D4] dark:border-gray-700">Endereço</h2>
                                        <div className="p-6 grid grid-cols-1 md:grid-cols-2">
                                            <div className="flex flex-col gap-1 border-t border-solid border-[#D1D3D4] dark:border-gray-700 py-4 pr-2">
                                                <p className="text-[#686388] dark:text-gray-400 text-sm font-normal leading-normal">País</p>
                                                {isEditing ? (
                                                    <div className="relative">
                                                        <select 
                                                            value={formData.address?.country || ''} 
                                                            onChange={(e) => handleAddressChange('country', e.target.value)} 
                                                            className={`${inputClass} appearance-none pr-8 cursor-pointer bg-none`}
                                                        >
                                                            <option value="" disabled>Selecione...</option>
                                                            {COUNTRIES.map(c => (
                                                                <option key={c} value={c}>{c}</option>
                                                            ))}
                                                        </select>
                                                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-[#686388] dark:text-[#dddce5]">
                                                            <Icon name="expand_more" className="text-xl" />
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <p className="text-[#333333] dark:text-white text-sm font-normal leading-normal">{formData.address?.country || formData.country}</p>
                                                )}
                                            </div>
                                            <div className="flex flex-col gap-1 border-t border-solid border-[#D1D3D4] dark:border-gray-700 py-4 md:pl-2">
                                                <p className="text-[#686388] dark:text-gray-400 text-sm font-normal leading-normal">CEP</p>
                                                {isEditing ? (
                                                    <input value={formData.address?.postalCode || ''} onChange={(e) => handleAddressChange('postalCode', e.target.value)} className={inputClass} />
                                                ) : (
                                                    <p className="text-[#333333] dark:text-white text-sm font-normal leading-normal">{formData.address?.postalCode || '-'}</p>
                                                )}
                                            </div>
                                            <div className="flex flex-col gap-1 border-t border-solid border-[#D1D3D4] dark:border-gray-700 py-4 pr-2">
                                                <p className="text-[#686388] dark:text-gray-400 text-sm font-normal leading-normal">Estado</p>
                                                {isEditing ? (
                                                    <input value={formData.address?.state || ''} onChange={(e) => handleAddressChange('state', e.target.value)} className={inputClass} />
                                                ) : (
                                                    <p className="text-[#333333] dark:text-white text-sm font-normal leading-normal">{formData.address?.state || '-'}</p>
                                                )}
                                            </div>
                                            <div className="flex flex-col gap-1 border-t border-solid border-[#D1D3D4] dark:border-gray-700 py-4 md:pl-2">
                                                <p className="text-[#686388] dark:text-gray-400 text-sm font-normal leading-normal">Cidade</p>
                                                {isEditing ? (
                                                    <input value={formData.address?.city || ''} onChange={(e) => handleAddressChange('city', e.target.value)} className={inputClass} />
                                                ) : (
                                                    <p className="text-[#333333] dark:text-white text-sm font-normal leading-normal">{formData.address?.city || '-'}</p>
                                                )}
                                            </div>
                                            {/* Rua and Número on the same line in desktop */}
                                            <div className="flex flex-col gap-1 border-t border-solid border-[#D1D3D4] dark:border-gray-700 py-4 pr-2">
                                                <p className="text-[#686388] dark:text-gray-400 text-sm font-normal leading-normal">Rua</p>
                                                {isEditing ? (
                                                    <input value={formData.address?.street || ''} onChange={(e) => handleAddressChange('street', e.target.value)} className={inputClass} />
                                                ) : (
                                                    <p className="text-[#333333] dark:text-white text-sm font-normal leading-normal">{formData.address?.street || '-'}</p>
                                                )}
                                            </div>
                                            <div className="flex flex-col gap-1 border-t border-solid border-[#D1D3D4] dark:border-gray-700 py-4 md:pl-2">
                                                <p className="text-[#686388] dark:text-gray-400 text-sm font-normal leading-normal">Número</p>
                                                {isEditing ? (
                                                    <input value={formData.address?.number || ''} onChange={(e) => handleAddressChange('number', e.target.value)} className={inputClass} />
                                                ) : (
                                                    <p className="text-[#333333] dark:text-white text-sm font-normal leading-normal">{formData.address?.number || '-'}</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Students List */}
                                    <div className="bg-white dark:bg-[#131121] border border-[#D1D3D4] dark:border-gray-700 rounded-xl">
                                        <div className="flex items-center justify-between px-6 pt-5 pb-3 border-b border-[#D1D3D4] dark:border-gray-700">
                                            <h2 className="text-[#333333] dark:text-white text-[22px] font-bold leading-tight tracking-[-0.015em]">Lista de Alunos</h2>
                                            {!isEditing && !isStudentSearchOpen && (
                                                <button 
                                                    onClick={() => setIsStudentSearchOpen(true)}
                                                    className="flex max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-9 px-3 bg-transparent text-[#6258A6] text-sm font-bold leading-normal tracking-[0.015em] hover:bg-[#6258A6]/10 gap-2 transition-colors"
                                                >
                                                    <Icon name="add" className="text-base" />
                                                    <span className="truncate">Adicionar Novo Aluno</span>
                                                </button>
                                            )}
                                        </div>
                                        <div className="overflow-visible">
                                            <table className="w-full text-left">
                                                <thead className="bg-gray-50 dark:bg-gray-800/50">
                                                    <tr>
                                                        <th className="p-4 px-6 text-xs font-bold text-[#686388] dark:text-gray-400 uppercase tracking-wider">Nome do Aluno</th>
                                                        <th className="p-4 px-6 text-xs font-bold text-[#686388] dark:text-gray-400 uppercase tracking-wider text-center">Financeiro</th>
                                                        <th className="w-12 p-4 px-6 text-xs font-bold text-[#686388] dark:text-gray-400 uppercase tracking-wider text-right"></th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-[#D1D3D4] dark:divide-gray-700 relative">
                                                    {formData.students && formData.students.length > 0 ? (
                                                        formData.students.map((student) => (
                                                            <tr key={student.id}>
                                                                <td className="p-4 px-6 text-sm text-[#333333] dark:text-white">
                                                                    <button 
                                                                        onClick={() => handleStudentNameClick(student.id, student.name)}
                                                                        className="font-medium text-[#6258A6] hover:underline"
                                                                    >
                                                                        {student.name}
                                                                    </button>
                                                                </td>
                                                                <td className="p-4 px-6 text-sm text-center">
                                                                    <input 
                                                                        readOnly 
                                                                        disabled
                                                                        checked={student.financial} 
                                                                        className="h-4 w-4 rounded border-gray-300 text-[#6258A6] focus:ring-[#6258A6] disabled:opacity-50 disabled:cursor-not-allowed" 
                                                                        type="checkbox"
                                                                    />
                                                                </td>
                                                                <td className="p-4 px-6 text-right">
                                                                    {!isEditing && (
                                                                        <button 
                                                                            onClick={() => handleDeleteStudentClick(student.id)}
                                                                            className="text-[#686388] dark:text-gray-400 hover:text-red-600 dark:hover:text-red-500 transition-colors"
                                                                        >
                                                                            <Icon name="delete_outline" className="text-xl" />
                                                                        </button>
                                                                    )}
                                                                </td>
                                                            </tr>
                                                        ))
                                                    ) : (
                                                        !isStudentSearchOpen && (
                                                            <tr>
                                                                <td colSpan={3} className="p-6 text-center text-[#686388] dark:text-gray-400 text-sm italic">
                                                                    Nenhum aluno vinculado.
                                                                </td>
                                                            </tr>
                                                        )
                                                    )}

                                                    {/* Search Row */}
                                                    {isStudentSearchOpen && (
                                                        <tr className="bg-gray-50 dark:bg-gray-800/30 animate-fade-in relative">
                                                            <td colSpan={3} className="p-2 px-4 relative">
                                                                <div className="relative w-full" ref={studentSearchRef}>
                                                                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                                                                        <Icon name="search" style={{fontSize: '16px'}} />
                                                                    </div>
                                                                    <input
                                                                        autoFocus
                                                                        type="text"
                                                                        value={studentSearchTerm}
                                                                        onChange={(e) => setStudentSearchTerm(e.target.value)}
                                                                        placeholder="Pesquisar aluno..."
                                                                        className={`${inputClass} pl-9 h-10 w-full bg-white dark:bg-gray-900`}
                                                                    />
                                                                    <button 
                                                                        onClick={() => {
                                                                            setIsStudentSearchOpen(false);
                                                                            setStudentSearchTerm('');
                                                                        }}
                                                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500 p-1"
                                                                    >
                                                                        <Icon name="close" style={{fontSize: '16px'}} />
                                                                    </button>

                                                                    {/* Dropdown Results */}
                                                                    <div className="absolute top-full left-0 w-full z-50 mt-1 bg-white dark:bg-[#1e1d24] border border-neutral-200 dark:border-gray-700 rounded-lg shadow-xl max-h-60 overflow-y-auto">
                                                                        {filteredAvailableStudents.length > 0 && (
                                                                            <>
                                                                                <div className="px-3 py-2 text-xs font-semibold text-gray-400 uppercase border-b border-neutral-100 dark:border-gray-800">
                                                                                    Alunos Encontrados
                                                                                </div>
                                                                                {filteredAvailableStudents.map(student => (
                                                                                    <button
                                                                                        key={student.id}
                                                                                        onClick={() => handleAddExistingStudent(student)}
                                                                                        className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-neutral-100 dark:hover:bg-gray-700 flex items-center gap-2 border-b border-neutral-100 dark:border-gray-800"
                                                                                    >
                                                                                        <div className="size-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px] font-bold">
                                                                                            {student.firstName[0]}
                                                                                        </div>
                                                                                        <div className="flex flex-col">
                                                                                            <span className="font-bold leading-tight">{student.firstName} {student.lastName}</span>
                                                                                            <span className="text-[10px] text-gray-400">{student.school}</span>
                                                                                        </div>
                                                                                    </button>
                                                                                ))}
                                                                            </>
                                                                        )}
                                                                        
                                                                        <button
                                                                            onClick={handleCreateNewStudentClick}
                                                                            className="w-full text-left px-4 py-3 text-sm text-primary font-bold hover:bg-primary/5 flex items-center gap-2 transition-colors border-t border-neutral-100 dark:border-gray-800 sticky bottom-0 bg-white dark:bg-[#1e1d24]"
                                                                        >
                                                                            <Icon name="add_circle" className="text-base" />
                                                                            Criar aluno
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </table>
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
                                                onClick={() => setActiveTab('Propostas')}
                                                className={`flex-1 py-3 text-sm font-bold transition-colors ${activeTab === 'Propostas' ? 'text-[#6258A6] border-b-2 border-[#6258A6]' : 'text-[#686388] dark:text-gray-400 hover:text-[#333333] dark:hover:text-white'}`}
                                            >
                                                Propostas
                                            </button>
                                        </div>
                                        <div className="pt-6">
                                            {activeTab === 'Timeline' && (
                                                <div className="flex flex-col items-center justify-center text-center p-8 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                                                    <Icon name="history" className="text-4xl text-[#686388] dark:text-gray-400 mb-2" />
                                                    <p className="text-sm text-[#686388] dark:text-gray-400">Nenhum histórico disponível.</p>
                                                </div>
                                            )}
                                            {activeTab === 'Propostas' && (
                                                 <div className="flex flex-col items-center justify-center text-center p-8 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                                                    <Icon name="request_quote" className="text-4xl text-[#686388] dark:text-gray-400 mb-2" />
                                                    <p className="text-sm text-[#686388] dark:text-gray-400">Nenhuma proposta encontrada.</p>
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
                leadName={contact.name}
                entityType="Contato"
            />

            <ConfirmActionModal
                isOpen={!!pendingDeleteStudentId}
                onClose={() => setPendingDeleteStudentId(null)}
                onConfirm={confirmDeleteStudent}
                title="Remover aluno da lista?"
                description="O aluno será desvinculado deste contato."
                confirmText="Remover"
                cancelText="Cancelar"
                icon="delete"
            />

            <AccountDetailModal 
                isOpen={isAccountModalOpen}
                onClose={() => setIsAccountModalOpen(false)}
                account={selectedAccount}
                onUpdate={handleUpdateAccountFromDetail}
                onDelete={handleDeleteAccountFromDetail}
            />

            <StudentDetailModal 
                isOpen={!!selectedStudent}
                onClose={() => setSelectedStudent(null)}
                student={selectedStudent}
                onUpdate={handleStudentUpdate}
                onDelete={handleStudentDelete}
            />

            <StudentFormModal
                isOpen={isStudentFormModalOpen}
                onClose={() => setIsStudentFormModalOpen(false)}
                onSave={handleSaveNewStudentFromModal}
                initialGuardianName={contact.name}
            />
        </>
    );
};
