
import React, { useState, useEffect, useRef } from 'react';
import { Modal } from './ui/Modal';
import { Contact, Account } from '../types';
import { Icon } from './ui/Icon';
import { getAccounts } from '../dataStore';

interface ContactFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (contact: Contact, newAccount?: Account) => void;
    existingContacts: Contact[];
}

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

export const ContactFormModal: React.FC<ContactFormModalProps> = ({ isOpen, onClose, onSave, existingContacts }) => {
    // Form States
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [cpf, setCpf] = useState('');
    
    // Phone State
    const [phoneCountryCode, setPhoneCountryCode] = useState('+55');
    const [phoneNumber, setPhoneNumber] = useState('');

    const [email, setEmail] = useState('');
    const [dateOfBirth, setDateOfBirth] = useState('');
    
    // Account Search States
    const [accountSearch, setAccountSearch] = useState('');
    const [selectedAccount, setSelectedAccount] = useState('');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    
    // Warning/Error States
    const [showAccountWarning, setShowAccountWarning] = useState(false);
    const [showDuplicatePhoneWarning, setShowDuplicatePhoneWarning] = useState(false);
    const [nameError, setNameError] = useState(false);
    const [phoneError, setPhoneError] = useState(false);
    
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Reset on open
    useEffect(() => {
        if (isOpen) {
            setFirstName('');
            setLastName('');
            setCpf('');
            setPhoneCountryCode('+55');
            setPhoneNumber('');
            setEmail('');
            setDateOfBirth('');
            setAccountSearch('');
            setSelectedAccount('');
            setIsDropdownOpen(false);
            setShowAccountWarning(false);
            setShowDuplicatePhoneWarning(false);
            setNameError(false);
            setPhoneError(false);
        }
    }, [isOpen]);

    // Close dropdown on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const availableAccounts = getAccounts();
    const filteredAccounts = availableAccounts.filter(acc => 
        acc.name.toLowerCase().includes(accountSearch.toLowerCase())
    );

    const handleAccountSelect = (accountName: string) => {
        setSelectedAccount(accountName);
        setAccountSearch(accountName);
        setIsDropdownOpen(false);
    };

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFirstName(e.target.value);
        if (nameError) setNameError(false);
    };

    const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value.replace(/\D/g, '');
        setPhoneNumber(val);
        if (phoneError) setPhoneError(false);
    };

    const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value.replace(/\D/g, '');
        setCpf(val);
    };

    const handleSubmitClick = () => {
        // 1. Mandatory Fields Check
        const isNameEmpty = !firstName.trim();
        const isPhoneEmpty = !phoneNumber.trim();

        setNameError(isNameEmpty);
        setPhoneError(isPhoneEmpty);

        if (isNameEmpty || isPhoneEmpty) {
            return;
        }

        // 2. Duplicate Phone Check
        const fullPhone = `${phoneCountryCode}${phoneNumber}`;
        const cleanNewPhone = fullPhone.replace(/\D/g, ''); // Extract only digits for comparison

        const isDuplicate = existingContacts.some(c => {
            const cleanExisting = (c.phone || '').replace(/\D/g, '');
            return cleanExisting === cleanNewPhone && cleanExisting.length > 0;
        });

        if (isDuplicate) {
            setShowDuplicatePhoneWarning(true);
            return;
        }

        // 3. Account Existence Check
        if (!selectedAccount) {
            setShowAccountWarning(true);
            return;
        }

        submitContact(selectedAccount);
    };

    const handleConfirmAutoAccount = () => {
        const fullName = `${firstName.trim()} ${lastName.trim()}`;
        const fullPhone = `${phoneCountryCode}${phoneNumber}`;
        
        // Create a new Account object
        const newAccount: Account = {
            id: `acc-auto-${Date.now()}`,
            name: fullName,
            type: 'Física',
            phone: fullPhone,
            email: email,
            mainContact: fullName,
            cpfCnpj: cpf, // Ensure CPF is passed to the new account
            manager: 'Você',
            owner: 'Você'
        };

        submitContact(newAccount.name, newAccount);
    };

    const handleCreateWithoutAccount = () => {
        submitContact('');
    };

    const submitContact = (accountName: string, newAccount?: Account) => {
        const fullPhone = `${phoneCountryCode}${phoneNumber}`;

        const newContact: Contact = {
            id: `ct-${Date.now()}`,
            name: `${firstName.trim()} ${lastName.trim()}`,
            account: accountName,
            phone: fullPhone,
            email: email,
            cpf: cpf,
            country: 'Brasil', // Default
            dateOfBirth: dateOfBirth,
            students: [],
            address: {
                street: '',
                number: '',
                city: '',
                state: '',
                postalCode: '',
                country: 'Brasil'
            }
        };

        onSave(newContact, newAccount);
        onClose();
    };

    const inputClasses = "w-full rounded-lg border border-neutral-200 dark:border-gray-700 bg-neutral-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm focus:ring-2 focus:ring-primary/50 focus:border-primary p-3 outline-none transition-all";
    const errorInputClasses = "border-red-500 focus:ring-red-200 focus:border-red-500";
    const labelClasses = "text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5 block";

    return (
        <Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-2xl">
            {showDuplicatePhoneWarning ? (
                <div className="flex flex-col h-full animate-fade-in">
                    <div className="flex flex-col items-center justify-center p-8 text-center gap-4">
                        <div className="size-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-600 dark:text-red-400 mb-2">
                            <Icon name="phone_disabled" className="text-3xl" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Telefone duplicado</h2>
                        <p className="text-gray-600 dark:text-gray-300 max-w-sm">
                            Telefone duplicado: altere o numero de telefone para criar o cliente
                        </p>
                        
                        <div className="flex gap-3 mt-6 w-full justify-center">
                            <button 
                                onClick={() => setShowDuplicatePhoneWarning(false)}
                                className="px-6 py-2.5 rounded-lg bg-primary text-white font-bold text-sm hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all transform active:scale-95"
                            >
                                Voltar e Corrigir
                            </button>
                        </div>
                    </div>
                </div>
            ) : showAccountWarning ? (
                <div className="flex flex-col h-full animate-fade-in">
                    <div className="flex flex-col items-center justify-center p-8 text-center gap-4">
                        <div className="size-16 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-orange-600 dark:text-orange-400 mb-2">
                            <Icon name="warning" className="text-3xl" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Conta não selecionada</h2>
                        <p className="text-gray-600 dark:text-gray-300 max-w-sm">
                            Você não selecionou nenhuma conta. Caso prossiga, será criada uma <strong>nova conta</strong> automaticamente para esse contato com os mesmos dados (nome, telefone e email).
                        </p>
                        
                        <div className="flex flex-wrap gap-3 mt-6 w-full justify-center">
                            <button 
                                onClick={() => setShowAccountWarning(false)}
                                className="px-4 py-2.5 rounded-lg border border-neutral-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-bold text-sm hover:bg-neutral-100 dark:hover:bg-gray-800 transition-colors"
                            >
                                Voltar e Selecionar
                            </button>
                            <button 
                                onClick={handleCreateWithoutAccount}
                                className="px-4 py-2.5 rounded-lg border border-neutral-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-bold text-sm hover:bg-neutral-100 dark:hover:bg-gray-800 transition-colors"
                            >
                                Não criar conta
                            </button>
                            <button 
                                onClick={handleConfirmAutoAccount}
                                className="px-6 py-2.5 rounded-lg bg-primary text-white font-bold text-sm hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all transform active:scale-95"
                            >
                                Confirmar e Criar
                            </button>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="flex flex-col h-full">
                    <div className="flex items-center justify-between p-6 border-b border-neutral-100 dark:border-gray-800">
                        <h2 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">
                            Novo Contato
                        </h2>
                        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                            <Icon name="close" />
                        </button>
                    </div>

                    <div className="p-6 flex flex-col gap-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Name */}
                            <div>
                                <label className={labelClasses}>Nome <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    value={firstName}
                                    onChange={handleNameChange}
                                    placeholder="Primeiro nome"
                                    className={`${inputClasses} ${nameError ? errorInputClasses : ''}`}
                                    autoFocus
                                />
                                {nameError && <span className="text-xs text-red-500 mt-1 font-medium">Nome é obrigatório</span>}
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
                            {/* CPF */}
                            <div>
                                <label className={labelClasses}>CPF</label>
                                <input
                                    type="text"
                                    value={cpf}
                                    onChange={handleCpfChange}
                                    placeholder="Apenas números"
                                    className={inputClasses}
                                />
                            </div>
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
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Phone */}
                            <div>
                                <label className={labelClasses}>Telefone <span className="text-red-500">*</span></label>
                                <div className="flex gap-2">
                                    <div className="relative w-24 shrink-0">
                                        <select 
                                            value={phoneCountryCode}
                                            onChange={(e) => setPhoneCountryCode(e.target.value)}
                                            className={`${inputClasses} pr-6 appearance-none cursor-pointer bg-none`}
                                        >
                                            {COUNTRY_CODES.map(c => (
                                                <option key={c.name} value={c.code}>{c.code}</option>
                                            ))}
                                        </select>
                                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-1 text-gray-500 dark:text-gray-400">
                                            <Icon name="expand_more" className="text-xl" />
                                        </div>
                                    </div>
                                    <input
                                        type="tel"
                                        value={phoneNumber}
                                        onChange={handlePhoneNumberChange}
                                        placeholder="00 99999-9999"
                                        className={`${inputClasses} ${phoneError ? errorInputClasses : ''}`}
                                    />
                                </div>
                                {phoneError && <span className="text-xs text-red-500 mt-1 font-medium">Telefone é obrigatório</span>}
                            </div>
                            {/* Email */}
                            <div>
                                <label className={labelClasses}>Email</label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="exemplo@email.com"
                                    className={inputClasses}
                                />
                            </div>
                        </div>

                        {/* Account Search */}
                        <div className="relative" ref={dropdownRef}>
                            <label className={labelClasses}>Conta</label>
                            <div className="relative">
                                <input
                                    type="text"
                                    value={accountSearch}
                                    onChange={(e) => {
                                        setAccountSearch(e.target.value);
                                        setIsDropdownOpen(true);
                                        if (selectedAccount && e.target.value !== selectedAccount) {
                                            setSelectedAccount('');
                                        }
                                    }}
                                    onFocus={() => setIsDropdownOpen(true)}
                                    placeholder="Pesquisar conta existente..."
                                    className={`${inputClasses} ${selectedAccount ? 'pl-9 border-primary/50 bg-primary/5' : ''}`}
                                />
                                {selectedAccount && (
                                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-primary">
                                        <Icon name="check_circle" style={{fontSize: '18px'}} />
                                    </div>
                                )}
                                {!selectedAccount && (
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                                        <Icon name="search" style={{fontSize: '18px'}} />
                                    </div>
                                )}
                            </div>

                            {isDropdownOpen && (
                                <div className="absolute z-50 w-full mt-1 bg-white dark:bg-[#1e1d24] border border-neutral-200 dark:border-gray-700 rounded-lg shadow-xl max-h-60 overflow-y-auto">
                                    {filteredAccounts.length > 0 ? (
                                        filteredAccounts.map(account => (
                                            <button
                                                key={account.id}
                                                onClick={() => handleAccountSelect(account.name)}
                                                className="w-full text-left px-4 py-3 text-sm text-gray-700 dark:text-gray-200 hover:bg-neutral-100 dark:hover:bg-gray-700 flex flex-col gap-0.5 border-b border-neutral-100 dark:border-gray-800 last:border-0"
                                            >
                                                <span className="font-bold">{account.name}</span>
                                                <span className="text-xs text-gray-500 dark:text-gray-400">{account.type} • {account.email}</span>
                                            </button>
                                        ))
                                    ) : (
                                        <div className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400 italic">
                                            Nenhuma conta encontrada.
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
                            onClick={handleSubmitClick}
                            className="px-6 py-2 rounded-lg bg-primary text-white font-bold text-sm hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all transform active:scale-95"
                        >
                            Criar Contato
                        </button>
                    </div>
                </div>
            )}
        </Modal>
    );
};
