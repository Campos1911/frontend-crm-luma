
import React, { useState, useMemo, useEffect } from 'react';
import { Sidebar } from '../components/Sidebar';
import { Button } from '../components/ui/Button';
import { Avatar } from '../components/ui/Avatar';
import { Icon } from '../components/ui/Icon';
import { INITIAL_NAV_ITEMS } from '../utils/constants';
import { Contact, Account } from '../types';
import { ContactDetailModal } from '../components/ContactDetailModal';
import { ContactFormModal } from '../components/ContactFormModal';
import { addAccount, getContacts, updateContact, addContact, deleteContact } from '../utils/dataStore';

const ContactsPage: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [contacts, setContacts] = useState<Contact[]>(getContacts());
    
    // Refresh contacts from store on mount
    useEffect(() => {
        setContacts(getContacts());
    }, []);

    // State for the Detail Modal
    const [selectedContactId, setSelectedContactId] = useState<string | null>(null);
    
    // State for Add Contact Modal
    const [isAddContactModalOpen, setIsAddContactModalOpen] = useState(false);

    const filteredContacts = useMemo(() => {
        if (!searchTerm) return contacts;
        const lowerTerm = searchTerm.toLowerCase();
        return contacts.filter(contact => 
            contact.name.toLowerCase().includes(lowerTerm) || 
            contact.email.toLowerCase().includes(lowerTerm) ||
            contact.account.toLowerCase().includes(lowerTerm) ||
            contact.cpf.includes(searchTerm)
        );
    }, [searchTerm, contacts]);

    // Find the selected contact object
    const selectedContact = useMemo(() => {
        return contacts.find(c => c.id === selectedContactId) || null;
    }, [selectedContactId, contacts]);

    const handleRowClick = (contactId: string) => {
        setSelectedContactId(contactId);
    };

    const handleCloseModal = () => {
        setSelectedContactId(null);
    };

    const handleUpdateContact = (updatedContact: Contact) => {
        updateContact(updatedContact);
        setContacts(getContacts());
    };

    const handleDeleteContact = (contactId: string) => {
        deleteContact(contactId);
        setContacts(getContacts());
        handleCloseModal();
    };

    const handleSaveNewContact = (newContact: Contact, newAccount?: Account) => {
        // If an account was automatically generated, save it to the store
        if (newAccount) {
            addAccount(newAccount);
        }
        addContact(newContact);
        setContacts(getContacts());
        setIsAddContactModalOpen(false);
    };

    return (
        <div className="flex h-screen w-full font-display bg-background-light dark:bg-background-dark text-gray-900 dark:text-gray-100">
            <Sidebar navItems={INITIAL_NAV_ITEMS} />
            
            <main className="flex flex-col flex-1 w-full overflow-hidden relative">
                <header className="flex flex-col px-6 py-5 border-b border-neutral-100 dark:border-gray-800 bg-background-light dark:bg-background-dark z-10">
                    <div className="flex flex-wrap justify-between items-center gap-4">
                        <h1 className="text-primary dark:text-primary text-2xl font-black tracking-tight min-w-72">
                            Contatos
                        </h1>
                        <div className="flex items-center gap-4 ml-auto">
                            <Button primary={true} icon="add" onClick={() => setIsAddContactModalOpen(true)}>Novo Contato</Button>
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
                                        placeholder="Buscar contatos..." 
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
                                        <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Conta</th>
                                        <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Telefone</th>
                                        <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Email</th>
                                        <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden md:table-cell">CPF</th>
                                        <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden lg:table-cell">País</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-neutral-200 dark:divide-gray-800">
                                    {filteredContacts.map((contact) => (
                                        <tr 
                                            key={contact.id} 
                                            onClick={() => handleRowClick(contact.id)}
                                            className="hover:bg-neutral-50 dark:hover:bg-gray-800/50 cursor-pointer transition-colors"
                                        >
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-bold text-gray-900 dark:text-gray-100">{contact.name}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900 dark:text-gray-100 font-medium">{contact.account}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                                                    <Icon name="call" className="text-[14px]" />
                                                    <span>{contact.phone}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                                                    <Icon name="mail" className="text-[14px]" />
                                                    <span>{contact.email}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap hidden md:table-cell">
                                                <div className="text-sm text-gray-500 dark:text-gray-400">{contact.cpf}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap hidden lg:table-cell">
                                                <div className="text-sm text-gray-500 dark:text-gray-400">{contact.country}</div>
                                            </td>
                                        </tr>
                                    ))}
                                    {filteredContacts.length === 0 && (
                                        <tr>
                                            <td colSpan={6} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400 italic">
                                                Nenhum contato encontrado.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Contact Detail Modal */}
                <ContactDetailModal 
                    isOpen={!!selectedContactId}
                    onClose={handleCloseModal}
                    contact={selectedContact}
                    onUpdate={handleUpdateContact}
                    onDelete={handleDeleteContact}
                />

                {/* Add Contact Modal */}
                <ContactFormModal
                    isOpen={isAddContactModalOpen}
                    onClose={() => setIsAddContactModalOpen(false)}
                    onSave={handleSaveNewContact}
                    existingContacts={contacts}
                />
            </main>
        </div>
    );
};

export default ContactsPage;
