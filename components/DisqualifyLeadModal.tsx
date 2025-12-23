
import React, { useState } from 'react';
import { Modal } from './ui/Modal';
import { Button } from './ui/Button';
import { Icon } from './ui/Icon';

interface DisqualifyLeadModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (reason: string) => void;
}

const DISQUALIFICATION_REASONS = [
    'Sem interesse',
    'Preço alto',
    'Concorrente',
    'Contato inválido',
    'Não responde',
    'Outro perfil',
    'Timing errado'
];

export const DisqualifyLeadModal: React.FC<DisqualifyLeadModalProps> = ({ 
    isOpen, 
    onClose, 
    onConfirm 
}) => {
    const [reason, setReason] = useState('');

    const handleConfirm = () => {
        if (reason.trim()) {
            onConfirm(reason);
            setReason('');
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-md">
            <div className="p-6 flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                        <Icon name="block" className="text-2xl" />
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                            Desqualificar Lead
                        </h2>
                    </div>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">
                        Por favor, selecione o motivo pelo qual este lead está sendo desqualificado.
                    </p>
                </div>
                
                <div className="relative">
                    <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5 block">Motivo</label>
                    <select
                        autoFocus
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        className="w-full appearance-none rounded-lg border border-neutral-200 dark:border-gray-700 bg-neutral-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm focus:ring-2 focus:ring-primary/50 focus:border-primary p-3 outline-none transition-all pr-10"
                    >
                        <option value="" disabled>Selecione um motivo...</option>
                        {DISQUALIFICATION_REASONS.map((r) => (
                            <option key={r} value={r}>{r}</option>
                        ))}
                    </select>
                    <div className="pointer-events-none absolute top-[2.2rem] right-3 text-gray-500 dark:text-gray-400">
                        <Icon name="expand_more" />
                    </div>
                </div>

                <div className="flex justify-end gap-3 mt-4 pt-2 border-t border-gray-100 dark:border-gray-700">
                    <Button onClick={onClose}>
                        Cancelar
                    </Button>
                    <button 
                        onClick={handleConfirm}
                        disabled={!reason}
                        className="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 gap-2 text-sm font-bold leading-normal tracking-[0.015em] bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
                    >
                        Confirmar
                    </button>
                </div>
            </div>
        </Modal>
    );
};
