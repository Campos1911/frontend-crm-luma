
import React, { useState } from 'react';
import { Modal } from './ui/Modal';
import { Button } from './ui/Button';

interface LossReasonModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (reason: string) => void;
}

const LOSS_REASONS = [
    'Preço muito alto',
    'Optou pelo concorrente',
    'Sem orçamento disponível',
    'Funcionalidade insuficiente',
    'Projeto cancelado',
    'Sem contato/Desistência',
    'Timing inadequado',
    'Outros'
];

export const LossReasonModal: React.FC<LossReasonModalProps> = ({ 
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
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                        Motivo da Perda
                    </h2>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">
                        Por favor, selecione o motivo pelo qual esta oportunidade foi perdida. Este campo é obrigatório.
                    </p>
                </div>
                
                <div className="relative">
                    <select
                        autoFocus
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        className="w-full appearance-none rounded-md border-neutral-200 dark:border-gray-700 bg-neutral-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm focus:ring-primary focus:border-primary p-3 outline-none ring-1 ring-transparent focus:ring-2 pr-10"
                    >
                        <option value="" disabled>Selecione um motivo...</option>
                        {LOSS_REASONS.map((r) => (
                            <option key={r} value={r}>{r}</option>
                        ))}
                    </select>
                    <div className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-gray-500 dark:text-gray-400">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                    </div>
                </div>

                <div className="flex justify-end gap-3 mt-2">
                    <Button onClick={onClose}>
                        Cancelar
                    </Button>
                    <button 
                        onClick={handleConfirm}
                        disabled={!reason}
                        className="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 gap-2 text-sm font-bold leading-normal tracking-[0.015em] bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
                    >
                        Confirmar Perda
                    </button>
                </div>
            </div>
        </Modal>
    );
};
