import React, { useState, useEffect } from 'react';
import { Modal } from './ui/Modal';
import { Account } from '../types';
import { Icon } from './ui/Icon';

interface AccountFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (account: Account) => void;
}

const ACCOUNT_TYPES = ['Física', 'Jurídica', 'Governo', 'Parceiro', 'Outros'];

export const AccountFormModal: React.FC<AccountFormModalProps> = ({ isOpen, onClose, onSave }) => {
    const [name, setName] = useState('');
    const [identifier, setIdentifier] = useState(''); // CPF/CNPJ
    const [type, setType] = useState(ACCOUNT_TYPES[1]); // Default to Jurídica

    // Reset form on open
    useEffect(() => {
        if (isOpen) {
            setName('');
            setIdentifier('');
            setType(ACCOUNT_TYPES[1]);
        }
    }, [isOpen]);

    const handleSubmit = () => {
        if (!name.trim()) {
            alert('Por favor, insira o nome da conta.');
            return;
        }

        const newAccount: Account = {
            id: `acc-${Date.now()}`,
            name: name,
            type: type,
            cpfCnpj: identifier,
            // As per requirements: Phone and Email should NOT be filled (empty)
            // Main Contact is also not selected in this form anymore
            mainContact: '', 
            email: '',
            phone: '', 
            owner: 'Você',
            manager: '-'
        };

        onSave(newAccount);
        onClose();
    };

    const inputClasses = "w-full rounded-lg border border-neutral-200 dark:border-gray-700 bg-neutral-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm focus:ring-2 focus:ring-primary/50 focus:border-primary p-3 outline-none transition-all";
    const labelClasses = "text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5 block";

    return (
        <Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-lg">
            <div className="flex flex-col h-full">
                <div className="flex items-center justify-between p-6 border-b border-neutral-100 dark:border-gray-800">
                    <h2 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">
                        Nova Conta
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                        <Icon name="close" />
                    </button>
                </div>

                <div className="p-6 flex flex-col gap-6">
                    {/* Name */}
                    <div>
                        <label className={labelClasses}>Nome da Conta</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Ex: Empresa X"
                            className={inputClasses}
                            autoFocus
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {/* Type */}
                        <div>
                            <label className={labelClasses}>Tipo</label>
                            <div className="relative">
                                <select
                                    value={type}
                                    onChange={(e) => setType(e.target.value)}
                                    className={`${inputClasses} appearance-none cursor-pointer`}
                                >
                                    {ACCOUNT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                                </select>
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                                    <Icon name="expand_more" style={{fontSize: '18px'}} />
                                </div>
                            </div>
                        </div>

                        {/* Identifier */}
                        <div>
                            <label className={labelClasses}>Identificador (CPF/CNPJ)</label>
                            <input
                                type="text"
                                value={identifier}
                                onChange={(e) => setIdentifier(e.target.value)}
                                placeholder="00.000.000/0000-00"
                                className={inputClasses}
                            />
                        </div>
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
                        Criar Conta
                    </button>
                </div>
            </div>
        </Modal>
    );
};