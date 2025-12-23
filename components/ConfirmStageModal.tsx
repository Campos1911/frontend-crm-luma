
import React from 'react';
import { Modal } from './ui/Modal';
import { Button } from './ui/Button';

interface ConfirmStageModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    currentStage: string;
    targetStage: string;
}

export const ConfirmStageModal: React.FC<ConfirmStageModalProps> = ({ 
    isOpen, 
    onClose, 
    onConfirm, 
    currentStage, 
    targetStage 
}) => {
    return (
        <Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-md">
            <div className="p-6 flex flex-col gap-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    Mover lead de "{currentStage}" para "{targetStage}"?
                </h2>
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                    Essa ação atualizará a fase do lead no funil.
                </p>
                <div className="flex justify-end gap-3 mt-4">
                    <Button onClick={onClose}>
                        Cancelar
                    </Button>
                    <button 
                        onClick={onConfirm}
                        className="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 gap-2 text-sm font-bold leading-normal tracking-[0.015em] bg-primary text-white hover:bg-opacity-90 transition-colors"
                    >
                        Confirmar
                    </button>
                </div>
            </div>
        </Modal>
    );
};
