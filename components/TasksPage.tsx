import React, { useState, useMemo, useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { Button } from './ui/Button';
import { Avatar } from './ui/Avatar';
import { Icon } from './ui/Icon';
import { INITIAL_NAV_ITEMS, INITIAL_CONTACTS_DATA, INITIAL_LEADS_DATA } from '../constants';
import { GlobalTask, RelatedObjectType, Contact, Account, LeadCardData, CardData } from '../types';
import { getTasks, toggleTaskCompletion, deleteTask, updateTask, getAccounts, getOpportunities, addTask } from '../dataStore';
import { TaskDetailModal } from './TaskDetailModal';
import { TasksCalendarView } from './TasksCalendarView';
import { TaskFormModal } from './TaskFormModal';

// Related Object Modalss
import { LeadDetailModal } from './LeadDetailModal';
import { ContactDetailModal } from './ContactDetailModal';
import { AccountDetailModal } from './AccountDetailModal';
import { OpportunityDetailModal } from './OpportunityDetailModal';

const TasksPage: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [tasks, setTasks] = useState<GlobalTask[]>(getTasks());
    const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
    
    // Task Detail Modal State
    const [selectedTask, setSelectedTask] = useState<GlobalTask | null>(null);
    const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);

    // Navigation Modals State
    const [navLead, setNavLead] = useState<{lead: LeadCardData, status: string} | null>(null);
    const [navContact, setNavContact] = useState<Contact | null>(null);
    const [navAccount, setNavAccount] = useState<Account | null>(null);
    const [navOpportunity, setNavOpportunity] = useState<{card: CardData, stage: string} | null>(null);

    useEffect(() => {
        setTasks([...getTasks()]);
    }, []);

    const filteredTasks = useMemo(() => {
        if (!searchTerm) return tasks;
        const lowerTerm = searchTerm.toLowerCase();
        return tasks.filter(task => 
            task.title.toLowerCase().includes(lowerTerm) || 
            task.assignee.toLowerCase().includes(lowerTerm) ||
            task.relatedObjectName.toLowerCase().includes(lowerTerm) ||
            task.relatedObjectType.toLowerCase().includes(lowerTerm)
        );
    }, [searchTerm, tasks]);

    const handleToggleTask = (taskId: string, e?: React.MouseEvent) => {
        e?.stopPropagation();
        toggleTaskCompletion(taskId);
        setTasks([...getTasks()]);
    };

    const handleDeleteTask = (taskId: string) => {
        if (window.confirm('Deseja excluir esta tarefa?')) {
            deleteTask(taskId);
            setTasks([...getTasks()]);
            setSelectedTask(null);
        }
    };

    const handleUpdateTask = (updatedTask: GlobalTask) => {
        updateTask(updatedTask);
        setTasks([...getTasks()]);
        setSelectedTask(updatedTask);
    };

    const handleSaveNewTask = (newTask: GlobalTask) => {
        addTask(newTask);
        setTasks([...getTasks()]);
    };

    const handleRowClick = (task: GlobalTask) => {
        setSelectedTask(task);
    };

    const handleObjectClick = (type: RelatedObjectType, name: string, e?: React.MouseEvent) => {
        e?.stopPropagation();
        
        // Find the object in global data stores
        switch (type) {
            case 'lead':
                for (const col of INITIAL_LEADS_DATA) {
                    const found = col.cards.find(c => c.name === name);
                    if (found) {
                        setNavLead({ lead: found, status: col.title });
                        return;
                    }
                }
                break;
            case 'contato':
                const foundContact = INITIAL_CONTACTS_DATA.find(c => c.name === name);
                if (foundContact) setNavContact(foundContact);
                break;
            case 'conta':
                const foundAccount = getAccounts().find(a => a.name === name);
                if (foundAccount) setNavAccount(foundAccount);
                break;
            case 'oportunidade':
                const opps = getOpportunities();
                for (const col of opps) {
                    const found = col.cards.find(c => c.name === name);
                    if (found) {
                        setNavOpportunity({ card: found, stage: col.title });
                        return;
                    }
                }
                break;
        }
    };

    const formatDate = (dateStr: string) => {
        if (!dateStr) return '-';
        const [y, m, d] = dateStr.split('-');
        return `${d}/${m}/${y}`;
    };

    const getObjectBadgeStyle = (type: RelatedObjectType) => {
        switch (type) {
            case 'conta': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
            case 'contato': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400';
            case 'oportunidade': return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400';
            case 'lead': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    return (
        <div className="flex h-screen w-full font-display bg-background-light dark:bg-background-dark text-gray-900 dark:text-gray-100">
            <Sidebar navItems={INITIAL_NAV_ITEMS} />
            
            <main className="flex flex-col flex-1 w-full overflow-hidden relative">
                <header className="flex flex-col px-6 py-5 border-b border-neutral-100 dark:border-gray-800 bg-background-light dark:bg-background-dark z-10">
                    <div className="flex flex-wrap justify-between items-center gap-4">
                        <h1 className="text-primary dark:text-primary text-2xl font-black tracking-tight min-w-72">
                            Tarefas
                        </h1>
                        <div className="flex items-center gap-4 ml-auto">
                            <Button primary={true} icon="add_task" onClick={() => setIsAddTaskModalOpen(true)}>Nova Tarefa</Button>
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
                                        placeholder="Pesquisar em tarefas..." 
                                        value={searchTerm} 
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                            </label>
                        </div>
                        <Button icon="filter_list">Filtros</Button>

                        {/* View Toggle Buttons */}
                        <div className="flex items-center p-1 bg-neutral-200 dark:bg-gray-800/50 rounded-lg h-10 ml-2">
                            <button
                                onClick={() => setViewMode('list')}
                                className={`flex items-center justify-center size-8 rounded-md transition-all ${
                                    viewMode === 'list' 
                                        ? 'bg-white dark:bg-gray-700 text-primary shadow-sm' 
                                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                                }`}
                                title="Visualização em Lista"
                            >
                                <Icon name="table_rows" style={{fontSize: '20px'}} />
                            </button>
                            <button
                                onClick={() => setViewMode('calendar')}
                                className={`flex items-center justify-center size-8 rounded-md transition-all ${
                                    viewMode === 'calendar' 
                                        ? 'bg-white dark:bg-gray-700 text-primary shadow-sm' 
                                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                                }`}
                                title="Visualização em Calendário"
                            >
                                <Icon name="calendar_month" style={{fontSize: '20px'}} />
                            </button>
                        </div>
                    </div>
                </header>
                
                <div className="flex-1 overflow-auto bg-neutral-200/50 dark:bg-background-dark/50 p-6">
                    {viewMode === 'list' ? (
                        <div className="min-w-full inline-block align-middle">
                            <div className="border border-neutral-200 dark:border-gray-800 rounded-xl overflow-hidden bg-white dark:bg-background-dark shadow-sm">
                                <table className="min-w-full divide-y divide-neutral-200 dark:divide-gray-800">
                                    <thead className="bg-neutral-50 dark:bg-gray-800/50">
                                        <tr>
                                            <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Tarefa</th>
                                            <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Data Fim</th>
                                            <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-center">Status</th>
                                            <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Responsável</th>
                                            <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Objeto</th>
                                            <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Nome Objeto</th>
                                            <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Data Criação</th>
                                            <th scope="col" className="px-6 py-4 text-right text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-neutral-200 dark:divide-gray-800">
                                        {filteredTasks.map((task) => (
                                            <tr 
                                                key={task.id} 
                                                onClick={() => handleRowClick(task)}
                                                className="hover:bg-neutral-50 dark:hover:bg-gray-800/50 transition-colors group cursor-pointer"
                                            >
                                                <td className="px-6 py-4">
                                                    <span className={`text-sm font-bold ${task.isCompleted ? 'text-gray-400 line-through' : 'text-gray-900 dark:text-gray-100'}`}>
                                                        {task.title}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className={`text-sm font-medium ${!task.isCompleted && new Date(task.dueDate) < new Date() ? 'text-red-500' : 'text-gray-500 dark:text-gray-400'}`}>
                                                        {formatDate(task.dueDate)}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-center">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                                                        task.isCompleted 
                                                            ? 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800' 
                                                            : 'bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800'
                                                    }`}>
                                                        {task.isCompleted ? 'Concluído' : 'Pendente'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center gap-2">
                                                        <div className="size-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px] font-bold">
                                                            {task.assignee.substring(0, 1).toUpperCase()}
                                                        </div>
                                                        <span className="text-sm text-gray-700 dark:text-gray-300">{task.assignee}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold uppercase ${getObjectBadgeStyle(task.relatedObjectType)}`}>
                                                        {task.relatedObjectType}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <button 
                                                        onClick={(e) => handleObjectClick(task.relatedObjectType, task.relatedObjectName, e)}
                                                        className="text-sm text-primary hover:underline font-bold"
                                                    >
                                                        {task.relatedObjectName}
                                                    </button>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-xs text-gray-500 dark:text-gray-500">
                                                        {formatDate(task.createdAt)}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <button 
                                                        onClick={(e) => { e.stopPropagation(); handleDeleteTask(task.id); }}
                                                        className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 opacity-0 group-hover:opacity-100 transition-all"
                                                    >
                                                        <Icon name="delete" className="!text-lg" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                        {filteredTasks.length === 0 && (
                                            <tr>
                                                <td colSpan={8} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400 italic">
                                                    Nenhuma tarefa encontrada.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ) : (
                        <div className="h-full border border-neutral-200 dark:border-gray-800 rounded-xl overflow-hidden shadow-sm">
                            <TasksCalendarView 
                                tasks={filteredTasks} 
                                onTaskClick={handleRowClick} 
                            />
                        </div>
                    )}
                </div>

                {/* Main Task Detail Modal */}
                <TaskDetailModal 
                    isOpen={!!selectedTask}
                    onClose={() => setSelectedTask(null)}
                    task={selectedTask}
                    onUpdate={handleUpdateTask}
                    onDelete={handleDeleteTask}
                    onObjectClick={(type, name) => handleObjectClick(type, name)}
                />

                {/* Add Task Modal */}
                <TaskFormModal
                    isOpen={isAddTaskModalOpen}
                    onClose={() => setIsAddTaskModalOpen(false)}
                    onSave={handleSaveNewTask}
                />

                {/* Related Object Modals for Navigation */}
                {navLead && (
                    <LeadDetailModal 
                        isOpen={!!navLead} 
                        onClose={() => setNavLead(null)} 
                        lead={navLead.lead} 
                        currentStatus={navLead.status} 
                        onUpdate={() => {}} // Read-only for this specific view path for simplicity
                        onMove={() => {}}
                    />
                )}
                {navContact && (
                    <ContactDetailModal 
                        isOpen={!!navContact} 
                        onClose={() => setNavContact(null)} 
                        contact={navContact} 
                    />
                )}
                {navAccount && (
                    <AccountDetailModal 
                        isOpen={!!navAccount} 
                        onClose={() => setNavAccount(null)} 
                        account={navAccount} 
                    />
                )}
                {navOpportunity && (
                    <OpportunityDetailModal 
                        isOpen={!!navOpportunity} 
                        onClose={() => setNavOpportunity(null)} 
                        opportunity={navOpportunity.card} 
                        currentStage={navOpportunity.stage} 
                        onMove={() => {}} 
                        onUpdate={() => {}}
                        onDelete={() => {}}
                    />
                )}
            </main>
        </div>
    );
};

export default TasksPage;