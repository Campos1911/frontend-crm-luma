
import React, { useState, useMemo, useEffect } from 'react';
import { Sidebar } from '../components/Sidebar';
import { Button } from '../components/ui/Button';
import { Avatar } from '../components/ui/Avatar';
import { Icon } from '../components/ui/Icon';
import { INITIAL_NAV_ITEMS } from '../utils/constants';
import { Account } from '../types';
import { AccountDetailModal } from '../components/AccountDetailModal';
import { AccountFormModal } from '../components/AccountFormModal';
import { getAccounts, updateAccount, deleteAccount, addAccount } from '../utils/dataStore';

const AccountsPage: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [accounts, setAccounts] = useState<Account[]>(getAccounts());
    
    useEffect(() => {
        setAccounts(getAccounts());
    }, []);

    // Modal State
    const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);
    const [isAddAccountModalOpen, setIsAddAccountModalOpen] = useState(false);

    const filteredAccounts = useMemo(() => {
        if (!searchTerm) return accounts;
        const lowerTerm = searchTerm.toLowerCase();
        return accounts.filter(account => 
            account.name.toLowerCase().includes(lowerTerm) || 
            account.email.toLowerCase().includes(lowerTerm) ||
            account.type.toLowerCase().includes(lowerTerm) ||
            account.mainContact.toLowerCase().includes(lowerTerm)
        );
    }, [searchTerm, accounts]);

    const selectedAccount = useMemo(() => {
        return accounts.find(a => a.id === selectedAccountId) || null;
    }, [selectedAccountId, accounts]);

    const handleRowClick = (accountId: string) => {
        setSelectedAccountId(accountId);
    };

    const handleCloseModal = () => {
        setSelectedAccountId(null);
    };

    const handleUpdateAccount = (updatedAccount: Account) => {
        updateAccount(updatedAccount);
        setAccounts(getAccounts());
    };

    const handleDeleteAccount = (accountId: string) => {
        deleteAccount(accountId);
        setAccounts(getAccounts());
        handleCloseModal();
    };

    const handleSaveNewAccount = (newAccount: Account) => {
        addAccount(newAccount);
        setAccounts(getAccounts());
        setIsAddAccountModalOpen(false);
    };

    const getAccountTypeStyle = (type: string) => {
        switch (type) {
            case 'Física': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
            case 'Jurídica': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
            case 'Governo': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300';
            default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
        }
    };

    return (
        <div className="flex h-screen w-full font-display bg-background-light dark:bg-background-dark text-gray-900 dark:text-gray-100">
            <Sidebar navItems={INITIAL_NAV_ITEMS} />
            
            <main className="flex flex-col flex-1 w-full overflow-hidden relative">
                <header className="flex flex-col px-6 py-5 border-b border-neutral-100 dark:border-gray-800 bg-background-light dark:bg-background-dark z-10">
                    <div className="flex flex-wrap justify-between items-center gap-4">
                        <h1 className="text-primary dark:text-primary text-2xl font-black tracking-tight min-w-72">
                            Contas
                        </h1>
                        <div className="flex items-center gap-4 ml-auto">
                            <Button primary={true} icon="add" onClick={() => setIsAddAccountModalOpen(true)}>Nova Conta</Button>
                            <div className="w-px h-8 bg-neutral-200 dark:bg-gray-800 hidden sm:block"></div>
                            <button className="relative group">
                                <Avatar 
                                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuAqBvK4GjvciB8lHHxTrHVRW-v9GaQJaJX7vaTZEhMqiIrXlqNSkqiGKnQV_d6pxlrXAkzuyHvD4Kgj9abuzvPwwHDSn43M9tDRZo2MKgciw1zLCJAhKsbxbh42zIT_K5NdoRjDEB0DWjSqWEFYMM_eo-wawPmPH7sUxFgn7eFSjxQweABGRkcYVRWj8-pyjnCquVnO7ZMjuXgRz2kAAHAPMjsroiG7_L-NYAcC8iANDzU5aSosCt0yQfb1Y91Ac42Xk4nd5ujgenQ" 
                                    alt="User profile avatar" 
                                    className="ring-2 ring-transparent group-hover:ring-primary/50 transition-all"
                                />
                                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-background-dark rounded-full"></div>
                            </button>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-4 mt-6">
                        <div className="flex-grow max-w-sm">
                            <label className="flex flex-col w-full group">
                                <div className="flex w-full flex-1 items-stretch rounded-lg h-10 transition-shadow duration-200 focus-within:ring-2 focus-within:ring-primary/50">
                                    <div className="text-gray-500 dark:text-gray-400 flex bg-neutral-200 dark:bg-gray-800/50 items-center justify-center pl-3 rounded-l-lg border-r-0">
                                        <Icon name="search" />
                                    </div>
                                    <input 
                                        className="flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none border-none bg-neutral-200 dark:bg-gray-800/50 h-full placeholder:text-gray-500 dark:placeholder:text-gray-400 px-4 rounded-l-none border-l-0 pl-2 text-sm font-normal leading-normal" 
                                        placeholder="Buscar contas..." 
                                        value={searchTerm} 
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                            </label>
                        </div>
                        <Button icon="filter_list">Filtros</Button>
                    </div>
                </header>
                
                <div className="flex-1 overflow-auto bg-neutral-200/50 dark:bg-background-dark/50 p-6">
                    <div className="min-w-full inline-block align-middle">
                        <div className="border border-neutral-200 dark:border-gray-800 rounded-xl overflow-hidden bg-white dark:bg-background-dark shadow-sm">
                            <table className="min-w-full divide-y divide-neutral-200 dark:divide-gray-800">
                                <thead className="bg-neutral-50 dark:bg-gray-800/50">
                                    <tr>
                                        <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Nome</th>
                                        <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Tipo</th>
                                        <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Telefone</th>
                                        <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Email</th>
                                        <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Contato Principal</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-neutral-200 dark:divide-gray-800">
                                    {filteredAccounts.map((account) => (
                                        <tr 
                                            key={account.id} 
                                            onClick={() => handleRowClick(account.id)}
                                            className="hover:bg-neutral-50 dark:hover:bg-gray-800/50 cursor-pointer transition-colors"
                                        >
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="flex-shrink-0 h-10 w-10">
                                                        <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                                                            {account.name.substring(0, 2).toUpperCase()}
                                                        </div>
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="text-sm font-bold text-gray-900 dark:text-gray-100">{account.name}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getAccountTypeStyle(account.type)}`}>
                                                    {account.type}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                                                    <Icon name="call" className="text-[14px]" />
                                                    <span>{account.phone || '-'}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                                                    <Icon name="mail" className="text-[14px]" />
                                                    <span>{account.email || '-'}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-2 text-sm text-gray-900 dark:text-gray-100">
                                                    <Icon name="person" className="text-[16px] text-gray-400" />
                                                    <span>{account.mainContact || '-'}</span>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {filteredAccounts.length === 0 && (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400 italic">
                                                Nenhuma conta encontrada.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <AccountDetailModal 
                    isOpen={!!selectedAccountId}
                    onClose={handleCloseModal}
                    account={selectedAccount}
                    onUpdate={handleUpdateAccount}
                    onDelete={handleDeleteAccount}
                />

                <AccountFormModal
                    isOpen={isAddAccountModalOpen}
                    onClose={() => setIsAddAccountModalOpen(false)}
                    onSave={handleSaveNewAccount}
                />
            </main>
        </div>
    );
};

export default AccountsPage;
