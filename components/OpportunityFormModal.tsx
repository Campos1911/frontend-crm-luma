
import React, { useState, useRef, useEffect } from 'react';
import { Modal } from './ui/Modal';
import { CardData } from '../types';
import { Icon } from './ui/Icon';

interface OpportunityFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: Partial<CardData>) => void;
    initialAccountName?: string;
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

export const OpportunityFormModal: React.FC<OpportunityFormModalProps> = ({ isOpen, onClose, onSave, initialAccountName }) => {
    const [accountSearch, setAccountSearch] = useState('');
    const [selectedAccount, setSelectedAccount] = useState('');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    
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
            if (initialAccountName) {
                setAccountSearch(initialAccountName);
                setSelectedAccount(initialAccountName);
            } else {
                setAccountSearch('');
                setSelectedAccount('');
            }
            setIsDropdownOpen(false);
        }
    }, [isOpen, initialAccountName]);

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
            // Default values for fields not in this simplified form
            salesType: 'B2B', 
            type: 'Novo negócio', 
            amount: 'R$ 0,00',
            closeDate: new Date().toISOString().split('T')[0]
        });
        onClose();
    };

    const inputClasses = "w-full rounded-xl border-2 border-neutral-100 dark:border-gray-700 bg-neutral-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-base font-medium focus:ring-4 focus:ring-primary/10 focus:border-primary p-4 pl-11 outline-none transition-all placeholder:text-gray-400";
    const labelClasses = "text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 block ml-1";

    return (
        <Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-md">
            <div className="flex flex-col h-full bg-white dark:bg-[#131121] rounded-xl overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-neutral-100 dark:border-gray-800">
                    <div className="flex items-center gap-3">
                        <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                            <Icon name="add_shopping_cart" className="text-xl" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">
                            Nova Oportunidade
                        </h2>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-gray-800">
                        <Icon name="close" />
                    </button>
                </div>

                <div className="p-8 flex flex-col gap-6">
                    <div className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                        Selecione a conta para a qual deseja criar esta oportunidade. Se a conta não existir, você pode criá-la digitando o nome.
                    </div>

                    {/* Account Search Field */}
                    <div className="relative" ref={dropdownRef}>
                        <label className={labelClasses}>Conta da Oportunidade</label>
                        <div className="relative group">
                            <input
                                type="text"
                                value={accountSearch}
                                onChange={(e) => {
                                    setAccountSearch(e.target.value);
                                    setIsDropdownOpen(true);
                                    if (e.target.value !== selectedAccount) setSelectedAccount('');
                                }}
                                onFocus={() => setIsDropdownOpen(true)}
                                placeholder="Pesquisar ou adicionar conta..."
                                className={inputClasses}
                                autoFocus
                            />
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors">
                                <Icon name="search" style={{fontSize: '20px'}} />
                            </div>
                            {selectedAccount && (
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-green-500 animate-scale-in">
                                    <Icon name="check_circle" style={{fontSize: '20px'}} />
                                </div>
                            )}
                        </div>

                        {isDropdownOpen && (accountSearch || filteredAccounts.length > 0) && (
                            <div className="absolute z-50 w-full mt-2 bg-white dark:bg-[#1e1d24] border border-neutral-200 dark:border-gray-700 rounded-xl shadow-2xl max-h-60 overflow-y-auto animate-fade-in">
                                {filteredAccounts.length > 0 && (
                                    <div className="py-2">
                                        <p className="px-4 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Contas Encontradas</p>
                                        {filteredAccounts.map(acc => (
                                            <button
                                                key={acc}
                                                onClick={() => handleAccountSelect(acc)}
                                                className="w-full text-left px-4 py-3 text-sm text-gray-700 dark:text-gray-200 hover:bg-primary/5 dark:hover:bg-primary/10 hover:text-primary transition-colors flex items-center gap-3"
                                            >
                                                <div className="size-8 rounded-full bg-neutral-100 dark:bg-gray-800 flex items-center justify-center text-gray-500 font-bold text-xs">
                                                    {acc.substring(0, 2).toUpperCase()}
                                                </div>
                                                <span className="font-medium">{acc}</span>
                                            </button>
                                        ))}
                                    </div>
                                )}
                                
                                {accountSearch && !filteredAccounts.includes(accountSearch) && (
                                    <div className="py-2 border-t border-neutral-100 dark:border-gray-700 bg-neutral-50/50 dark:bg-gray-800/50">
                                        <button
                                            onClick={handleAddNewAccount}
                                            className="w-full text-left px-4 py-3 text-sm text-primary font-bold hover:bg-primary/10 flex items-center gap-2 transition-colors"
                                        >
                                            <Icon name="add_circle" style={{fontSize: '18px'}} />
                                            <span>Criar nova conta: "{accountSearch}"</span>
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex justify-end gap-3 p-6 pt-2 border-t border-neutral-100 dark:border-gray-800 bg-gray-50/30 dark:bg-gray-800/20">
                    <button 
                        onClick={onClose}
                        className="px-5 py-2.5 rounded-lg border border-neutral-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-bold text-sm hover:bg-white dark:hover:bg-gray-800 hover:shadow-sm transition-all"
                    >
                        Cancelar
                    </button>
                    <button 
                        onClick={handleSubmit}
                        disabled={!selectedAccount && !accountSearch}
                        className="px-6 py-2.5 rounded-lg bg-primary text-white font-bold text-sm hover:bg-primary/90 shadow-lg shadow-primary/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform active:scale-95 flex items-center gap-2"
                    >
                        <Icon name="check" className="text-lg" />
                        Criar Oportunidade
                    </button>
                </div>
            </div>
        </Modal>
    );
};
