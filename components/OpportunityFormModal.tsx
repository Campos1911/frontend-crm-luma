import React, { useState, useRef, useEffect } from 'react';
import { Modal } from './ui/Modal';
import { CardData } from '../types';
import { Icon } from './ui/Icon';

interface OpportunityFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: Partial<CardData>) => void;
}

// Mock list of existing accounts for the search demo
const MOCK_ACCOUNTS = [
    'TechSolutions',
    'InovaWeb',
    'GlobalCorp',
    'Connecta',
    'Future Systems',
    'MegaCorp',
    'Vértice Digital',
    'Alfa Soluções',
    'Beta Industries',
    'Gamma Group'
];

export const OpportunityFormModal: React.FC<OpportunityFormModalProps> = ({ isOpen, onClose, onSave }) => {
    const [accountSearch, setAccountSearch] = useState('');
    const [selectedAccount, setSelectedAccount] = useState('');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    
    const [salesType, setSalesType] = useState<'B2B' | 'B2C' | 'B2G'>('B2B');

    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Reset form when modal opens
    useEffect(() => {
        if (isOpen) {
            setAccountSearch('');
            setSelectedAccount('');
            setSalesType('B2B');
            setIsDropdownOpen(false);
        }
    }, [isOpen]);

    const filteredAccounts = MOCK_ACCOUNTS.filter(acc => 
        acc.toLowerCase().includes(accountSearch.toLowerCase())
    );

    const handleAccountSelect = (account: string) => {
        setSelectedAccount(account);
        setAccountSearch(account);
        setIsDropdownOpen(false);
    };

    const handleAddNewAccount = () => {
        if (accountSearch.trim()) {
            setSelectedAccount(accountSearch);
            setIsDropdownOpen(false);
        }
    };

    const handleSubmit = () => {
        if (!selectedAccount) {
            alert('Por favor, selecione ou adicione uma conta.');
            return;
        }

        onSave({
            name: selectedAccount, // Using Account Name as the Card Name
            salesType,
            type: 'Novo negócio', // Default value since field was removed from UI
            amount: 'R$ 0,00', // Default value since field was removed
            closeDate: new Date().toISOString().split('T')[0] // Default to today or handle separate field
        });
        onClose();
    };

    const inputClasses = "w-full rounded-lg border border-neutral-200 dark:border-gray-700 bg-neutral-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm focus:ring-2 focus:ring-primary/50 focus:border-primary p-3 outline-none transition-all";
    const labelClasses = "text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5 block";

    return (
        <Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-md">
            <div className="flex flex-col h-full">
                <div className="flex items-center justify-between p-5 border-b border-neutral-100 dark:border-gray-800">
                    <h2 className="text-lg font-black text-gray-900 dark:text-white tracking-tight">
                        Nova Oportunidade
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                        <Icon name="close" />
                    </button>
                </div>

                <div className="p-5 flex flex-col gap-5">
                    {/* Account Search Field */}
                    <div className="relative" ref={dropdownRef}>
                        <label className={labelClasses}>Conta</label>
                        <div className="relative">
                            <input
                                type="text"
                                value={accountSearch}
                                onChange={(e) => {
                                    setAccountSearch(e.target.value);
                                    setIsDropdownOpen(true);
                                    setSelectedAccount(''); // Clear selection on edit
                                }}
                                onFocus={() => setIsDropdownOpen(true)}
                                placeholder="Pesquisar ou adicionar conta..."
                                className={inputClasses}
                            />
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                                <Icon name="search" style={{fontSize: '18px'}} />
                            </div>
                        </div>

                        {isDropdownOpen && (accountSearch || filteredAccounts.length > 0) && (
                            <div className="absolute z-50 w-full mt-1 bg-white dark:bg-[#1e1d24] border border-neutral-200 dark:border-gray-700 rounded-lg shadow-xl max-h-60 overflow-y-auto">
                                {filteredAccounts.length > 0 && (
                                    <div className="py-1">
                                        <p className="px-3 py-1 text-xs font-semibold text-gray-400 uppercase">Contas Existentes</p>
                                        {filteredAccounts.map(acc => (
                                            <button
                                                key={acc}
                                                onClick={() => handleAccountSelect(acc)}
                                                className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-neutral-100 dark:hover:bg-gray-700 flex items-center gap-2"
                                            >
                                                <Icon name="apartment" style={{fontSize: '16px'}} />
                                                {acc}
                                            </button>
                                        ))}
                                    </div>
                                )}
                                
                                {accountSearch && !filteredAccounts.includes(accountSearch) && (
                                    <div className="py-1 border-t border-neutral-100 dark:border-gray-700">
                                        <button
                                            onClick={handleAddNewAccount}
                                            className="w-full text-left px-4 py-2 text-sm text-primary font-bold hover:bg-primary/5 flex items-center gap-2"
                                        >
                                            <Icon name="add_circle" style={{fontSize: '16px'}} />
                                            Adicionar nova conta: "{accountSearch}"
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Sales Type */}
                    <div>
                        <label className={labelClasses}>Tipo de Venda</label>
                        <div className="relative">
                            <select
                                value={salesType}
                                onChange={(e) => setSalesType(e.target.value as any)}
                                className={`${inputClasses} appearance-none cursor-pointer`}
                            >
                                <option value="B2B">B2B</option>
                                <option value="B2C">B2C</option>
                                <option value="B2G">B2G</option>
                            </select>
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                                <Icon name="expand_more" style={{fontSize: '18px'}} />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-3 p-5 pt-0">
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
                        Criar Oportunidade
                    </button>
                </div>
            </div>
        </Modal>
    );
};