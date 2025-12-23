
import React, { useState, useEffect, useRef } from 'react';
import { Modal } from './ui/Modal';
import { StudentPageData, Guardian } from '../types';
import { Icon } from './ui/Icon';
import { INITIAL_CONTACTS_DATA } from '../constants';

interface StudentFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (student: StudentPageData) => void;
    initialGuardianName?: string;
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

const GENDER_OPTIONS = [
    'Masculino',
    'Feminino'
];

export const StudentFormModal: React.FC<StudentFormModalProps> = ({ isOpen, onClose, onSave, initialGuardianName }) => {
    // Form States
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [dateOfBirth, setDateOfBirth] = useState('');
    const [gender, setGender] = useState('');
    const [schoolYear, setSchoolYear] = useState('');
    const [school, setSchool] = useState('');
    const [specificities, setSpecificities] = useState<string[]>([]);
    
    // Guardian Search States
    const [guardianSearch, setGuardianSearch] = useState('');
    const [selectedGuardianName, setSelectedGuardianName] = useState('');
    const [isGuardianDropdownOpen, setIsGuardianDropdownOpen] = useState(false);

    // Specificity Dropdown State
    const [isSpecDropdownOpen, setIsSpecDropdownOpen] = useState(false);

    const guardianDropdownRef = useRef<HTMLDivElement>(null);
    const specDropdownRef = useRef<HTMLDivElement>(null);

    // Reset on open
    useEffect(() => {
        if (isOpen) {
            setFirstName('');
            setLastName('');
            setDateOfBirth('');
            setGender('');
            setSchoolYear('');
            setSchool('');
            setSpecificities([]);
            
            // Handle pre-filled guardian
            if (initialGuardianName) {
                setGuardianSearch(initialGuardianName);
                setSelectedGuardianName(initialGuardianName);
            } else {
                setGuardianSearch('');
                setSelectedGuardianName('');
            }
            
            setIsGuardianDropdownOpen(false);
            setIsSpecDropdownOpen(false);
        }
    }, [isOpen, initialGuardianName]);

    // Click outside handlers
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (guardianDropdownRef.current && !guardianDropdownRef.current.contains(event.target as Node)) {
                setIsGuardianDropdownOpen(false);
            }
            if (specDropdownRef.current && !specDropdownRef.current.contains(event.target as Node)) {
                setIsSpecDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const filteredContacts = INITIAL_CONTACTS_DATA.filter(c => 
        c.name.toLowerCase().includes(guardianSearch.toLowerCase())
    );

    const handleGuardianSelect = (name: string) => {
        setSelectedGuardianName(name);
        setGuardianSearch(name);
        setIsGuardianDropdownOpen(false);
    };

    const toggleSpecificity = (option: string) => {
        if (specificities.includes(option)) {
            setSpecificities(prev => prev.filter(s => s !== option));
        } else {
            setSpecificities(prev => [...prev, option]);
        }
    };

    const handleSubmit = () => {
        if (!firstName.trim() || !lastName.trim()) {
            alert('Por favor, preencha o nome e sobrenome do aluno.');
            return;
        }
        if (!selectedGuardianName) {
            alert('Por favor, selecione um responsável financeiro.');
            return;
        }

        const newGuardian: Guardian = {
            id: `g-${Date.now()}`,
            name: selectedGuardianName,
            role: 'Responsável Financeiro',
            isFinancial: true,
            isPedagogical: true 
        };

        const newStudent: StudentPageData = {
            id: `st-${Date.now()}`,
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            dateOfBirth: dateOfBirth,
            gender: gender,
            schoolYear: schoolYear,
            school: school.trim(),
            financialGuardian: selectedGuardianName,
            specificities: specificities,
            guardians: [newGuardian],
            email: ''
        };

        onSave(newStudent);
        onClose();
    };

    const inputClasses = "w-full rounded-lg border border-neutral-200 dark:border-gray-700 bg-neutral-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm focus:ring-2 focus:ring-primary/50 focus:border-primary p-3 outline-none transition-all";
    const labelClasses = "text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5 block";

    return (
        <Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-2xl">
            <div className="flex flex-col h-full">
                <div className="flex items-center justify-between p-6 border-b border-neutral-100 dark:border-gray-800">
                    <h2 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">
                        Novo Aluno
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                        <Icon name="close" />
                    </button>
                </div>

                <div className="p-6 flex flex-col gap-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* First Name */}
                        <div>
                            <label className={labelClasses}>Nome</label>
                            <input
                                type="text"
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                                placeholder="Primeiro nome"
                                className={inputClasses}
                                autoFocus
                            />
                        </div>
                        {/* Last Name */}
                        <div>
                            <label className={labelClasses}>Sobrenome</label>
                            <input
                                type="text"
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                                placeholder="Sobrenome"
                                className={inputClasses}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Date of Birth */}
                        <div>
                            <label className={labelClasses}>Data de Nascimento</label>
                            <input
                                type="date"
                                value={dateOfBirth}
                                onChange={(e) => setDateOfBirth(e.target.value)}
                                className={inputClasses}
                            />
                        </div>
                        {/* Gender */}
                        <div>
                            <label className={labelClasses}>Gênero</label>
                            <div className="relative">
                                <select
                                    value={gender}
                                    onChange={(e) => setGender(e.target.value)}
                                    className={`${inputClasses} appearance-none cursor-pointer`}
                                >
                                    <option value="" disabled>Selecionar gênero...</option>
                                    {GENDER_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                </select>
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                                    <Icon name="expand_more" />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* School Year */}
                        <div>
                            <label className={labelClasses}>Ano Escolar</label>
                            <div className="relative">
                                <select
                                    value={schoolYear}
                                    onChange={(e) => setSchoolYear(e.target.value)}
                                    className={`${inputClasses} appearance-none cursor-pointer`}
                                >
                                    <option value="" disabled>Selecionar ano...</option>
                                    {SCHOOL_YEAR_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                </select>
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                                    <Icon name="expand_more" />
                                </div>
                            </div>
                        </div>
                        {/* School */}
                        <div>
                            <label className={labelClasses}>Escola</label>
                            <input
                                type="text"
                                value={school}
                                onChange={(e) => setSchool(e.target.value)}
                                placeholder="Nome da escola"
                                className={inputClasses}
                            />
                        </div>
                    </div>

                    {/* Specificities Multi-select */}
                    <div className="relative" ref={specDropdownRef}>
                        <label className={labelClasses}>Especificidades</label>
                        <div 
                            className={`${inputClasses} cursor-pointer flex flex-wrap gap-2 min-h-[46px] items-center`}
                            onClick={() => setIsSpecDropdownOpen(!isSpecDropdownOpen)}
                        >
                            {specificities.length > 0 ? (
                                specificities.map(spec => (
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
                                <span className="text-gray-400">Selecione as especificidades...</span>
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
                                        <div className={`w-4 h-4 mr-3 border rounded flex items-center justify-center transition-colors ${specificities.includes(option) ? 'bg-primary border-primary' : 'border-gray-400'}`}>
                                            {specificities.includes(option) && <Icon name="check" className="text-white !text-xs" />}
                                        </div>
                                        {option}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Financial Guardian Search */}
                    <div className="relative" ref={guardianDropdownRef}>
                        <label className={labelClasses}>Responsável Financeiro</label>
                        <div className="relative">
                            <input
                                type="text"
                                value={guardianSearch}
                                onChange={(e) => {
                                    setGuardianSearch(e.target.value);
                                    setIsGuardianDropdownOpen(true);
                                    if (selectedGuardianName && e.target.value !== selectedGuardianName) {
                                        setSelectedGuardianName('');
                                    }
                                }}
                                onFocus={() => setIsGuardianDropdownOpen(true)}
                                placeholder="Pesquisar responsável..."
                                className={`${inputClasses} ${selectedGuardianName ? 'pl-9 border-primary/50 bg-primary/5' : ''}`}
                            />
                            {selectedGuardianName && (
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-primary">
                                    <Icon name="check_circle" style={{fontSize: '18px'}} />
                                </div>
                            )}
                            {!selectedGuardianName && (
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                                    <Icon name="search" style={{fontSize: '18px'}} />
                                </div>
                            )}
                        </div>

                        {isGuardianDropdownOpen && (
                            <div className="absolute z-50 w-full mt-1 bg-white dark:bg-[#1e1d24] border border-neutral-200 dark:border-gray-700 rounded-lg shadow-xl max-h-60 overflow-y-auto">
                                {filteredContacts.length > 0 ? (
                                    filteredContacts.map(contact => (
                                        <button
                                            key={contact.id}
                                            onClick={() => handleGuardianSelect(contact.name)}
                                            className="w-full text-left px-4 py-3 text-sm text-gray-700 dark:text-gray-200 hover:bg-neutral-100 dark:hover:bg-gray-700 flex flex-col gap-0.5 border-b border-neutral-100 dark:border-gray-800 last:border-0"
                                        >
                                            <span className="font-bold">{contact.name}</span>
                                            <span className="text-xs text-gray-500 dark:text-gray-400">{contact.email}</span>
                                        </button>
                                    ))
                                ) : (
                                    <div className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400 italic">
                                        Nenhum contato encontrado.
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex justify-end gap-3 p-6 pt-2">
                    <button 
                        onClick={onClose}
                        className="px-4 py-2 rounded-lg border border-neutral-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-bold text-sm hover:bg-neutral-100 dark:hover:bg-gray-800 transition-colors"
                    >
                        Cancelar
                    </button>
                    <button 
                        onClick={handleSubmit}
                        className="px-6 py-2 rounded-lg bg-primary text-white font-bold text-sm hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all transform active:scale-95"
                    >
                        Criar Aluno
                    </button>
                </div>
            </div>
        </Modal>
    );
};
