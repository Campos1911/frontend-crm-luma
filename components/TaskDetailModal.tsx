import React, { useState, useEffect } from 'react';
import { Modal } from './ui/Modal';
import { GlobalTask } from '../types';
import { Icon } from './ui/Icon';
import { ConfirmDeleteModal } from './ConfirmDeleteModal';

interface TaskDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    task: GlobalTask | null;
    onUpdate?: (task: GlobalTask) => void;
    onDelete?: (taskId: string) => void;
    onObjectClick?: (type: GlobalTask['relatedObjectType'], name: string) => void;
}

export const TaskDetailModal: React.FC<TaskDetailModalProps> = ({ 
    isOpen, 
    onClose, 
    task,
    onUpdate,
    onDelete,
    onObjectClick
}) => {
    const [isEditing, setIsEditing] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [formData, setFormData] = useState<GlobalTask | null>(null);

    useEffect(() => {
        if (task) {
            setFormData(JSON.parse(JSON.stringify(task)));
        }
        setIsEditing(false);
    }, [task, isOpen]);

    if (!task || !formData) return null;

    const handleInputChange = (field: keyof GlobalTask, value: any) => {
        setFormData(prev => prev ? ({ ...prev, [field]: value }) : null);
    };

    const handleSave = () => {
        if (onUpdate && formData) {
            onUpdate(formData);
            setIsEditing(false);
        }
    };

    const handleCancel = () => {
        if (task) {
            setFormData(JSON.parse(JSON.stringify(task)));
        }
        setIsEditing(false);
    };

    const confirmDelete = () => {
        if (onDelete && task) {
            onDelete(task.id);
            setIsDeleteModalOpen(false);
            onClose();
        }
    };

    const formatDate = (dateStr: string) => {
        if (!dateStr) return '-';
        const [y, m, d] = dateStr.split('-');
        return `${d}/${m}/${y}`;
    };

    const inputClass = "w-full p-2.5 text-sm font-medium text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all";

    return (
        <>
            <Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-2xl">
                <div className="flex flex-col bg-white dark:bg-[#131121] text-gray-900 dark:text-white overflow-hidden rounded-xl">
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800">
                        <div>
                            <h2 className="text-xl font-black tracking-tight">Detalhes da Tarefa</h2>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 uppercase font-bold tracking-wider">ID: {task.id}</p>
                        </div>
                        <div className="flex items-center gap-2">
                            {isEditing ? (
                                <>
                                    <button onClick={handleCancel} className="px-4 py-2 text-sm font-bold text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors">Cancelar</button>
                                    <button onClick={handleSave} className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-bold hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20">Salvar</button>
                                </>
                            ) : (
                                <>
                                    <button 
                                        onClick={() => setIsEditing(true)}
                                        className="size-10 flex items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                                        title="Editar"
                                    >
                                        <Icon name="edit" />
                                    </button>
                                    <button 
                                        onClick={() => setIsDeleteModalOpen(true)}
                                        className="size-10 flex items-center justify-center rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
                                        title="Excluir"
                                    >
                                        <Icon name="delete" />
                                    </button>
                                    <button onClick={onClose} className="size-10 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
                                        <Icon name="close" />
                                    </button>
                                </>
                            )}
                        </div>
                    </div>

                    <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
                        {/* Task Title */}
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Nome da Tarefa</label>
                            {isEditing ? (
                                <input 
                                    value={formData.title} 
                                    onChange={(e) => handleInputChange('title', e.target.value)} 
                                    className={inputClass}
                                    placeholder="Ex: Enviar contrato"
                                />
                            ) : (
                                <p className="text-lg font-bold text-gray-900 dark:text-white">{formData.title}</p>
                            )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Due Date */}
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Data Fim</label>
                                {isEditing ? (
                                    <input 
                                        type="date"
                                        value={formData.dueDate} 
                                        onChange={(e) => handleInputChange('dueDate', e.target.value)} 
                                        className={inputClass}
                                    />
                                ) : (
                                    <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                                        <Icon name="event" className="text-gray-400" />
                                        <span className="font-medium">{formatDate(formData.dueDate)}</span>
                                    </div>
                                )}
                            </div>

                            {/* Status */}
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</label>
                                {isEditing ? (
                                    <select 
                                        value={formData.isCompleted ? 'completed' : 'pending'} 
                                        onChange={(e) => handleInputChange('isCompleted', e.target.value === 'completed')} 
                                        className={inputClass}
                                    >
                                        <option value="pending">Pendente</option>
                                        <option value="completed">Concluído</option>
                                    </select>
                                ) : (
                                    <div className="pt-1">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                                            formData.isCompleted 
                                                ? 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800' 
                                                : 'bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800'
                                        }`}>
                                            {formData.isCompleted ? 'Concluído' : 'Pendente'}
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Assignee */}
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Responsável</label>
                                {isEditing ? (
                                    <input 
                                        value={formData.assignee} 
                                        onChange={(e) => handleInputChange('assignee', e.target.value)} 
                                        className={inputClass}
                                    />
                                ) : (
                                    <div className="flex items-center gap-2">
                                        <div className="size-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px] font-bold">
                                            {formData.assignee.substring(0, 1).toUpperCase()}
                                        </div>
                                        <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">{formData.assignee}</span>
                                    </div>
                                )}
                            </div>

                            {/* Creation Date (Read-only) */}
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Data Criação</label>
                                <div className="flex items-center gap-2 text-gray-500 dark:text-gray-500 text-sm">
                                    <Icon name="history" className="text-gray-400 text-base" />
                                    <span>{formatDate(formData.createdAt)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Related Object */}
                        <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/30 border border-gray-100 dark:border-gray-800">
                             <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.1em] mb-2 block">Objeto Relacionado</label>
                             <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className={`size-8 rounded-lg flex items-center justify-center ${
                                        formData.relatedObjectType === 'conta' ? 'bg-blue-100 text-blue-600' :
                                        formData.relatedObjectType === 'contato' ? 'bg-purple-100 text-purple-600' :
                                        formData.relatedObjectType === 'oportunidade' ? 'bg-orange-100 text-orange-600' :
                                        'bg-green-100 text-green-600'
                                    }`}>
                                        <Icon name={
                                            formData.relatedObjectType === 'conta' ? 'apartment' :
                                            formData.relatedObjectType === 'contato' ? 'person' :
                                            formData.relatedObjectType === 'oportunidade' ? 'workspaces' :
                                            'filter_alt'
                                        } className="text-lg" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">{formData.relatedObjectType}</p>
                                        <button 
                                            onClick={() => onObjectClick?.(formData.relatedObjectType, formData.relatedObjectName)}
                                            className="text-primary font-bold hover:underline text-sm text-left"
                                        >
                                            {formData.relatedObjectName}
                                        </button>
                                    </div>
                                </div>
                                <Icon name="arrow_forward_ios" className="text-xs text-gray-400" />
                             </div>
                        </div>

                        {/* Description */}
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Descrição Detalhada</label>
                            {isEditing ? (
                                <textarea 
                                    rows={4}
                                    value={formData.description || ''} 
                                    onChange={(e) => handleInputChange('description', e.target.value)} 
                                    className={`${inputClass} resize-none`}
                                    placeholder="Adicione observações detalhadas sobre esta tarefa..."
                                />
                            ) : (
                                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap italic">
                                    {formData.description || 'Nenhuma descrição detalhada informada.'}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="p-6 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/10 text-right">
                        <button onClick={onClose} className="text-sm font-bold text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">Fechar</button>
                    </div>
                </div>
            </Modal>

            <ConfirmDeleteModal 
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={confirmDelete}
                leadName={`Tarefa: ${task.title}`}
            />
        </>
    );
};