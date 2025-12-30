import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Modal } from './ui/Modal';
import { Contact, Address, Account, StudentPageData } from '../types';
import { Icon } from './ui/Icon';
import { ConfirmDeleteModal } from './ConfirmDeleteModal';
import { ConfirmActionModal } from './ConfirmActionModal';
import { AccountDetailModal } from './AccountDetailModal';
import { StudentDetailModal } from './StudentDetailModal';
import { StudentFormModal } from './StudentFormModal';
import { getAccounts, updateAccount, deleteAccount } from '../utils/dataStore';
import { INITIAL_STUDENTS_LIST } from '../utils/constants';

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
        // Allow digits only
        const val = e.target.value.replace(/\D/g, '');
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

    // --- Fix: correctly handle setIsDeleteModalOpen and provide component closure ---
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

    const handleStudentClick = (studentId: string) => {
        const found = INITIAL_STUDENTS_LIST.find(s => s.id === studentId);
        if (found) setSelectedStudent(found);
    };

    const handleLinkStudent = (student: StudentPageData) => {
        const newLink = {
            id: student.id,
            name: `${student.firstName} ${student.lastName}`,
            role: 'Aluno',
            financial: false,
            pedagogical: true
        };
        setFormData(prev => prev ? ({
            ...prev,
            students: [...(prev.students || []), newLink]
        }) : null);
        setIsStudentSearchOpen(false);
        setStudentSearchTerm('');
    };

    const handleRemoveStudent = (id: string) => {
        setPendingDeleteStudentId(id);
    };

    const confirmRemoveStudent = () => {
        if (!pendingDeleteStudentId) return;
        setFormData(prev => prev ? ({
            ...prev,
            students: prev.students?.filter(s => s.id !== pendingDeleteStudentId) || []
        }) : null);
        setPendingDeleteStudentId(null);
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
                                <span className="text-[#686388] dark:text-gray-400 text-sm font-medium leading-normal cursor-pointer" onClick={onClose}>Contatos</span>
                                <span className="text-[#686388] dark:text-gray-400 text-sm font-medium leading-normal">/</span>
                                <span className="text-[#121118] dark:text-white text-sm font-medium leading-normal">{contact.name}</span>
                            </div>

                            {/* Header */}
                            <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
                                <div className="flex min-w-72 flex-col gap-2">
                                    <h1 className="text-[#121118] dark:text-white text-4xl font-black leading-tight tracking-tight">{contact.name}</h1>
                                    <p className="text-[#686388] dark:text-gray-400 text-base font-normal leading-normal">Ficha do Contato.</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    {isEditing ? (
                                        <>
                                            <button onClick={handleCancel} className="flex h-10 px-4 items-center justify-center rounded-lg border border-neutral-200 dark:border-gray-700 hover:bg-neutral-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 transition-colors font-medium text-sm">Cancelar</button>
                                            <button onClick={handleSave} className="flex h-10 px-4 items-center justify-center rounded-lg bg-[#6258A6] text-white hover:bg-[#6258A6]/90 transition-colors font-medium text-sm shadow-sm">Salvar</button>
                                        </>
                                    ) : (
                                        <>
                                            <button onClick={() => setIsEditing(true)} className="flex size-10 cursor-pointer items-center justify-center overflow-hidden rounded-lg bg-[#6258A6]/10 text-[#6258A6] hover:bg-[#6258A6]/20 transition-colors" title="Editar Contato"><Icon name="edit" className="text-xl" /></button>
                                            <button onClick={handleDeleteClick} className="flex size-10 cursor-pointer items-center justify-center overflow-hidden rounded-lg bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors" title="Excluir Contato"><Icon name="delete" className="text-xl" /></button>
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
                                    
                                    {/* Personal Info */}
                                    <div className="bg-white dark:bg-[#131121] border border-[#D1D3D4] dark:border-gray-700 rounded-xl">
                                        <h2 className="text-[#333333] dark:text-white text-[22px] font-bold leading-tight tracking-[-0.015em] px-6 pt-5 pb-3 border-b border-[#D1D3D4] dark:border-gray-700">Informações Pessoais</h2>
                                        <div className="p-6 grid grid-cols-1 md:grid-cols-2">
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
                                            <div className="flex flex-col gap-1 border-t border-solid border-[#D1D3D4] dark:border-gray-700 py-4 pr-2">
                                                <p className="text-[#686388] dark:text-gray-400 text-sm font-normal leading-normal">Email</p>
                                                {isEditing ? (
                                                    <input value={formData.email} onChange={(e) => handleInputChange('email', e.target.value)} className={inputClass} />
                                                ) : (
                                                    <p className="text-[#333333] dark:text-white text-sm font-normal leading-normal">{formData.email}</p>
                                                )}
                                            </div>
                                            <div className="flex flex-col gap-1 border-t border-solid border-[#D1D3D4] dark:border-gray-700 py-4 md:pl-2">
                                                <p className="text-[#686388] dark:text-gray-400 text-sm font-normal leading-normal">Telefone</p>
                                                {isEditing ? (
                                                    <div className="flex gap-2">
                                                        <div className="relative w-24 shrink-0">
                                                            <select value={phoneCountryCode} onChange={handlePhoneCountryChange} className={`${inputClass} pr-6 appearance-none cursor-pointer bg-none`}>
                                                                {COUNTRY_CODES.map(c => <option key={c.name} value={c.code}>{c.code}</option>)}
                                                            </select>
                                                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-1 text-[#686388] dark:text-[#dddce5]"><Icon name="expand_more" className="text-xl" /></div>
                                                        </div>
                                                        <input value={phoneNumber} onChange={handlePhoneNumberChange} className={inputClass} />
                                                    </div>
                                                ) : (
                                                    <p className="text-[#333333] dark:text-white text-sm font-normal leading-normal">{formData.phone}</p>
                                                )}
                                            </div>
                                            <div className="flex flex-col gap-1 border-t border-solid border-[#D1D3D4] dark:border-gray-700 py-4 pr-2">
                                                <p className="text-[#686388] dark:text-gray-400 text-sm font-normal leading-normal">CPF</p>
                                                {isEditing ? (
                                                    <input value={formData.cpf} onChange={(e) => handleInputChange('cpf', e.target.value)} className={inputClass} />
                                                ) : (
                                                    <p className="text-[#333333] dark:text-white text-sm font-normal leading-normal">{formData.cpf}</p>
                                                )}
                                            </div>
                                            <div className="flex flex-col gap-1 border-t border-solid border-[#D1D3D4] dark:border-gray-700 py-4 md:pl-2">
                                                <p className="text-[#686388] dark:text-gray-400 text-sm font-normal leading-normal">Conta</p>
                                                {isEditing ? (
                                                    <div className="relative" ref={accountDropdownRef}>
                                                        <input value={formData.account} onChange={(e) => { handleInputChange('account', e.target.value); setIsAccountDropdownOpen(true); }} className={inputClass} onFocus={() => setIsAccountDropdownOpen(true)} />
                                                        {isAccountDropdownOpen && (
                                                            <div className="absolute z-50 w-full mt-1 bg-white dark:bg-[#1e1d24] border border-neutral-200 dark:border-gray-700 rounded-lg shadow-xl max-h-48 overflow-y-auto">
                                                                {availableAccounts.filter(acc => acc.name.toLowerCase().includes(formData.account.toLowerCase())).map(acc => (
                                                                    <button key={acc.id} onClick={() => handleAccountSelect(acc.name)} className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700">{acc.name}</button>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <button onClick={handleAccountClick} className="text-[#6258A6] text-sm font-bold underline hover:text-[#6258A6]/80 text-left">{formData.account}</button>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Students Section */}
                                    <div className="bg-white dark:bg-[#131121] border border-[#D1D3D4] dark:border-gray-700 rounded-xl">
                                        <div className="flex items-center justify-between px-6 pt-5 pb-3 border-b border-[#D1D3D4] dark:border-gray-700">
                                            <h2 className="text-[#333333] dark:text-white text-[22px] font-bold leading-tight tracking-[-0.015em]">Alunos Vinculados</h2>
                                            {!isEditing && (
                                                <div className="relative" ref={studentSearchRef}>
                                                    {!isStudentSearchOpen ? (
                                                        <button onClick={() => setIsStudentSearchOpen(true)} className="flex items-center gap-2 text-primary font-bold text-sm hover:underline"><Icon name="add_circle" className="text-lg" />Vincular Aluno</button>
                                                    ) : (
                                                        <div className="flex items-center gap-2 animate-fade-in">
                                                            <div className="relative">
                                                                <input autoFocus value={studentSearchTerm} onChange={(e) => setStudentSearchTerm(e.target.value)} placeholder="Pesquisar aluno..." className="w-48 p-1 text-xs border rounded-md dark:bg-gray-800 dark:border-gray-700" />
                                                                {studentSearchTerm && (
                                                                    <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white dark:bg-[#1e1d24] border border-neutral-200 dark:border-gray-700 rounded-lg shadow-xl max-h-48 overflow-y-auto">
                                                                        {filteredAvailableStudents.map(s => (
                                                                            <button key={s.id} onClick={() => handleLinkStudent(s)} className="w-full text-left px-3 py-2 text-xs hover:bg-gray-100 dark:hover:bg-gray-700 flex flex-col">
                                                                                <span className="font-bold">{s.firstName} {s.lastName}</span>
                                                                                <span className="text-[10px] text-gray-500">{s.school}</span>
                                                                            </button>
                                                                        ))}
                                                                        {filteredAvailableStudents.length === 0 && <div className="px-3 py-2 text-xs text-gray-500 italic">Nenhum aluno encontrado.</div>}
                                                                        <button onClick={() => setIsStudentFormModalOpen(true)} className="w-full text-left px-3 py-2 text-xs text-primary font-bold hover:bg-gray-100 dark:hover:bg-gray-700 border-t">Criar Novo Aluno</button>
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <button onClick={() => setIsStudentSearchOpen(false)} className="text-gray-400 hover:text-red-500"><Icon name="close" className="text-lg" /></button>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                        <div className="p-6">
                                            {formData.students && formData.students.length > 0 ? (
                                                <div className="flex flex-col gap-4">
                                                    {formData.students.map(s => (
                                                        <div key={s.id} className="flex items-center justify-between p-4 border rounded-lg border-[#D1D3D4] dark:border-gray-700 hover:border-primary transition-colors group">
                                                            <div className="flex items-center gap-4">
                                                                <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">{s.name[0]}</div>
                                                                <div>
                                                                    <button onClick={() => handleStudentClick(s.id)} className="text-sm font-bold text-gray-900 dark:text-white hover:underline">{s.name}</button>
                                                                    <p className="text-xs text-gray-500">{s.role}</p>
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center gap-4">
                                                                <div className="flex gap-2">
                                                                    {s.financial && <span className="px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-[10px] font-bold">FINANCEIRO</span>}
                                                                    {s.pedagogical && <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-[10px] font-bold">PEDAGÓGICO</span>}
                                                                </div>
                                                                {!isEditing && (
                                                                    <button onClick={() => handleRemoveStudent(s.id)} className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-all"><Icon name="delete" /></button>
                                                                )}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <p className="text-gray-500 dark:text-gray-400 italic text-center py-4">Nenhum aluno vinculado.</p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Right Column */}
                                <div className="lg:col-span-1 flex flex-col gap-8">
                                    <div className="flex border-b border-[#D1D3D4] dark:border-gray-700">
                                        <button onClick={() => setActiveTab('Timeline')} className={`flex-1 py-3 text-sm font-bold ${activeTab === 'Timeline' ? 'text-[#6258A6] border-b-2 border-[#6258A6]' : 'text-[#686388] dark:text-gray-400'}`}>Timeline</button>
                                        <button onClick={() => setActiveTab('Propostas')} className={`flex-1 py-3 text-sm font-bold ${activeTab === 'Propostas' ? 'text-[#6258A6] border-b-2 border-[#6258A6]' : 'text-[#686388] dark:text-gray-400'}`}>Propostas</button>
                                    </div>
                                    <div className="pt-2">
                                        {activeTab === 'Timeline' && (
                                            <div className="flex flex-col items-center justify-center p-8 bg-gray-50 dark:bg-gray-800/50 rounded-lg text-center">
                                                <Icon name="history" className="text-4xl text-gray-400 mb-2" />
                                                <p className="text-sm text-gray-500">Sem histórico recente.</p>
                                            </div>
                                        )}
                                        {activeTab === 'Propostas' && (
                                            <div className="flex flex-col items-center justify-center p-8 bg-gray-50 dark:bg-gray-800/50 rounded-lg text-center">
                                                <Icon name="description" className="text-4xl text-gray-400 mb-2" />
                                                <p className="text-sm text-gray-500">Nenhuma proposta vinculada.</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </main>
                </div>
            </Modal>

            <ConfirmDeleteModal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} onConfirm={confirmDelete} leadName={contact.name} entityType="Contato" />
            <ConfirmActionModal isOpen={!!pendingDeleteStudentId} onClose={() => setPendingDeleteStudentId(null)} onConfirm={confirmRemoveStudent} title="Remover Vínculo?" description="Deseja remover o vínculo com este aluno? O registro do aluno não será excluído." confirmText="Remover" icon="link_off" />
            
            {selectedAccount && <AccountDetailModal isOpen={isAccountModalOpen} onClose={() => setIsAccountModalOpen(false)} account={selectedAccount} />}
            {selectedStudent && <StudentDetailModal isOpen={!!selectedStudent} onClose={() => setSelectedStudent(null)} student={selectedStudent} onUpdate={() => {}} onDelete={() => {}} />}
            <StudentFormModal isOpen={isStudentFormModalOpen} onClose={() => setIsStudentFormModalOpen(false)} onSave={(s) => { handleLinkStudent(s); setIsStudentFormModalOpen(false); }} initialGuardianName={contact.name} />
        </>
    );
};