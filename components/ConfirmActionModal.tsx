
import React from 'react';
import { Modal } from './ui/Modal';
import { Button } from './ui/Button';
import { Icon } from './ui/Icon';

interface ConfirmActionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    description?: string;
    confirmText?: string;
    cancelText?: string;
    icon?: string;
}

export const ConfirmActionModal: React.FC<ConfirmActionModalProps> = ({ 
    isOpen, 
    onClose, 
    onConfirm, 
    title,
    description,
    confirmText = 'Confirmar',
    cancelText = 'Cancelar',
    icon = 'help'
}) => {
    return (
        <Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-md">
            <div className="p-6 flex flex-col gap-4">
                <div className="flex items-center gap-3">
                    <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                        <Icon name={icon} className="text-xl" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white leading-tight">
                        {title}
                    </h2>
                </div>
                
                {description && (
                    <p className="text-gray-500 dark:text-gray-400 text-sm pl-[52px]">
                        {description}
                    </p>
                )}
                
                <div className="flex justify-end gap-3 mt-4 pt-2 border-t border-neutral-100 dark:border-gray-800">
                    <Button onClick={onClose}>
                        {cancelText}
                    </Button>
                    <button 
                        onClick={onConfirm}
                        className="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 gap-2 text-sm font-bold leading-normal tracking-[0.015em] bg-primary text-white hover:bg-primary/90 transition-colors shadow-sm"
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </Modal>
    );
};
