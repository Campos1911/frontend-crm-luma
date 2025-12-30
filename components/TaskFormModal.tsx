
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Modal } from './ui/Modal';
import { GlobalTask, RelatedObjectType } from '../types';
import { Icon } from './ui/Icon';
import { INITIAL_CONTACTS_DATA } from '../constants';
import { getAccounts, getOpportunities } from '../dataStore';
import { useLeads } from '../hooks/useLeads';

interface TaskFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (task: GlobalTask) => void;
}

const OBJECT_TYPES: { value: RelatedObjectType; label: string; icon: string }[] = [
    { value: 'conta', label: 'Conta', icon: 'apartment' },
    { value: 'contato', label: 'Contato', icon: 'person' },
    { value: 'oportunidade', label: 'Oportunidade', icon: 'workspaces' },
    { value: 'lead', label: 'Lead', icon: 'filter_alt' }
];

export const TaskFormModal: React.FC<TaskFormModalProps> = ({ isOpen, onClose, onSave }) => {
    // Hooks dinâmicos
    const { leads } = useLeads();

    // Form States
    const [title, setTitle] = useState('');
    const [dueDate, setDueDate] = useState('');
    const [assignee, setAssignee] = useState('Você');
    const [description, setDescription] = useState('');
    const [relatedObjectType, setRelatedObjectType] = useState<RelatedObjectType>('conta');
    
    // Search States
    const [objectSearch, setObjectSearch] = useState('');
    const [selectedObjectName, setSelectedObjectName] = useState('');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Reset on open
    useEffect(() => {
        if (isOpen) {
            setTitle('');
            setDueDate(new Date().toISOString().split('T')[0]);
            setAssignee('Você');
            setDescription('');
            setRelatedObjectType('conta');
            setObjectSearch('');
            setSelectedObjectName('');
            setIsDropdownOpen(false);
        }
    }, [isOpen]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const filteredObjects = useMemo(() => {
        const term = objectSearch.toLowerCase();
        let data: string[] = [];

        switch (relatedObjectType) {
            case 'conta':
                data = getAccounts().map(a => a.name);
                break;
            case 'contato':
                data = INITIAL_CONTACTS_DATA.map(c => c.name);
                break;
            case 'lead':
                // Busca nos leads dinâmicos do hook
                data = leads.flatMap(col => col.cards.map(c => c.name));
                break;
            case 'oportunidade':
                data = getOpportunities().flatMap(col => col.cards.map(c => c.name));
                break;
        }

        return data.filter(item => item.toLowerCase().includes(term));
    }, [relatedObjectType, objectSearch, leads]);

    const handleObjectSelect = (name: string) => {
        setSelectedObjectName(name);
        setObjectSearch(name);
        setIsDropdownOpen(false);
    };

    const handleSubmit = () => {
        if (!title.trim()) {
            alert('Por favor, informe o nome da tarefa.');
            return;
        }
        if (!selectedObjectName) {
            alert('Por favor, selecione um objeto relacionado.');
            return;
        }

        const newTask: GlobalTask = {
            id: `gt-${Date.now()}`,
            title: title.trim(),
            dueDate: dueDate,
            isCompleted: false,
            assignee: assignee,
            relatedObjectType: relatedObjectType,
            relatedObjectName: selectedObjectName,
            createdAt: new Date().toISOString().split('T')[0],
            description: description
        };

        onSave(newTask);
        onClose();
    };

    const inputClasses = "w-full rounded-lg border border-neutral-200 dark:border-gray-700 bg-neutral-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm focus:ring-2 focus:ring-primary/50 focus:border-primary p-3 outline-none transition-all";
    const labelClasses = "text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5 block";

    return (
        <Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-2xl">
            <div className="flex flex-col h-full">
                <div className="flex items-center justify-between p-6 border-b border-neutral-100 dark:border-gray-800">
                    <h2 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">
                        Nova Tarefa
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                        <Icon name="close" />
                    </button>
                </div>

                <div className="p-6 flex flex-col gap-6 max-h-[70vh] overflow-y-auto">
                    <div>
                        <label className={labelClasses}>Nome da Tarefa</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Ex: Enviar contrato assinado"
                            className={inputClasses}
                            autoFocus
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className={labelClasses}>Data de Vencimento</label>
                            <input
                                type="date"
                                value={dueDate}
                                onChange={(e) => setDueDate(e.target.value)}
                                className={inputClasses}
                            />
                        </div>
                        <div>
                            <label className={labelClasses}>Responsável</label>
                            <input
                                type="text"
                                value={assignee}
                                onChange={(e) => setAssignee(e.target.value)}
                                placeholder="Nome do responsável"
                                className={inputClasses}
                            />
                        </div>
                    </div>

                    <hr className="border-neutral-100 dark:border-gray-800" />

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="md:col-span-1">
                            <label className={labelClasses}>Relacionado a</label>
                            <div className="relative">
                                <select
                                    value={relatedObjectType}
                                    onChange={(e) => {
                                        setRelatedObjectType(e.target.value as RelatedObjectType);
                                        setObjectSearch('');
                                        setSelectedObjectName('');
                                    }}
                                    className={`${inputClasses} appearance-none cursor-pointer`}
                                >
                                    {OBJECT_TYPES.map(type => (
                                        <option key={type.value} value={type.value}>{type.label}</option>
                                    ))}
                                </select>
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                                    <Icon name="expand_more" style={{fontSize: '18px'}} />
                                </div>
                            </div>
                        </div>

                        <div className="md:col-span-2 relative" ref={dropdownRef}>
                            <label className={labelClasses}>Nome do Registro</label>
                            <div className="relative">
                                <input
                                    type="text"
                                    value={objectSearch}
                                    onChange={(e) => {
                                        setObjectSearch(e.target.value);
                                        setIsDropdownOpen(true);
                                        if (selectedObjectName && e.target.value !== selectedObjectName) {
                                            setSelectedObjectName('');
                                        }
                                    }}
                                    onFocus={() => setIsDropdownOpen(true)}
                                    placeholder={`Pesquisar ${relatedObjectType}...`}
                                    className={`${inputClasses} ${selectedObjectName ? 'pl-9 border-primary/50 bg-primary/5' : ''}`}
                                />
                                {selectedObjectName && (
                                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-primary">
                                        <Icon name="check_circle" style={{fontSize: '18px'}} />
                                    </div>
                                )}
                                {!selectedObjectName && (
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                                        <Icon name="search" style={{fontSize: '18px'}} />
                                    </div>
                                )}
                            </div>

                            {isDropdownOpen && (
                                <div className="absolute z-50 w-full mt-1 bg-white dark:bg-[#1e1d24] border border-neutral-200 dark:border-gray-700 rounded-lg shadow-xl max-h-60 overflow-y-auto">
                                    {filteredObjects.length > 0 ? (
                                        filteredObjects.map((name, idx) => (
                                            <button
                                                key={`${name}-${idx}`}
                                                onClick={() => handleObjectSelect(name)}
                                                className="w-full text-left px-4 py-3 text-sm text-gray-700 dark:text-gray-200 hover:bg-neutral-100 dark:hover:bg-gray-700 flex items-center gap-2 border-b border-neutral-100 dark:border-gray-800 last:border-0"
                                            >
                                                <Icon name={OBJECT_TYPES.find(t => t.value === relatedObjectType)?.icon || 'circle'} className="text-gray-400 text-base" />
                                                <span className="font-medium">{name}</span>
                                            </button>
                                        ))
                                    ) : (
                                        <div className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400 italic text-center">
                                            Nenhum registro encontrado.
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    <div>
                        <label className={labelClasses}>Descrição / Observações</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={4}
                            placeholder="Detalhes adicionais sobre a tarefa..."
                            className={`${inputClasses} resize-none`}
                        />
                    </div>
                </div>

                <div className="flex justify-end gap-3 p-6 pt-2 border-t border-neutral-100 dark:border-gray-800">
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
                        Criar Tarefa
                    </button>
                </div>
            </div>
        </Modal>
    );
};
