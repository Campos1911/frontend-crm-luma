
import React from 'react';
import { Modal } from './Modal';
import { Icon } from './Icon';

interface AlertModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    message: string;
}

export const AlertModal: React.FC<AlertModalProps> = ({ isOpen, onClose, title, message }) => {
    return (
        <Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-sm">
            <div className="p-6 flex flex-col items-center text-center gap-4">
                <div className="size-14 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-orange-600 dark:text-orange-400">
                    <Icon name="warning" className="text-3xl" />
                </div>
                <div className="flex flex-col gap-2">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                        {title}
                    </h2>
                    <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">
                        {message}
                    </p>
                </div>
                <button 
                    onClick={onClose}
                    className="w-full mt-2 flex items-center justify-center rounded-lg h-10 px-4 text-sm font-bold bg-primary text-white hover:bg-primary/90 transition-colors shadow-sm"
                >
                    Entendi
                </button>
            </div>
        </Modal>
    );
};
