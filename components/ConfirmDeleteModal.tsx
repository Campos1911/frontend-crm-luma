
import React from 'react';
import { Modal } from './ui/Modal';
import { Button } from './ui/Button';

interface ConfirmDeleteModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    leadName: string;
    entityType?: string;
}

export const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({ 
    isOpen, 
    onClose, 
    onConfirm, 
    leadName,
    entityType = 'Lead'
}) => {
    // Determine article based on entity type (Portuguese grammar heuristics)
    const isMasculine = ['Lead', 'Contato', 'Aluno', 'Produto'].includes(entityType);
    const article = isMasculine ? 'o' : 'a';

    return (
        <Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-md">
            <div className="p-6 flex flex-col gap-4">
                <div className="flex items-center gap-3 text-red-600 dark:text-red-400">
                    <span className="material-symbols-outlined text-3xl">warning</span>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                        Excluir {entityType}?
                    </h2>
                </div>
                
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                    Você está prestes a excluir {article} {entityType.toLowerCase()} <strong>{leadName}</strong>. 
                    Esta ação é irreversível e removerá todos os dados, histórico e tarefas associadas.
                </p>
                
                <div className="flex justify-end gap-3 mt-4">
                    <Button onClick={onClose}>
                        Cancelar
                    </Button>
                    <button 
                        onClick={onConfirm}
                        className="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 gap-2 text-sm font-bold leading-normal tracking-[0.015em] bg-red-600 text-white hover:bg-red-700 transition-colors shadow-sm"
                    >
                        Excluir Definitivamente
                    </button>
                </div>
            </div>
        </Modal>
    );
};
