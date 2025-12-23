import React, { useState, useEffect } from 'react';
import { Modal } from './ui/Modal';
import { Icon } from './ui/Icon';
import { ProductItem, ProductGroup } from '../types';

export interface ProductResult extends ProductGroup {}

interface ProductDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (product: ProductResult) => void;
}

// Extended interface for internal state to track preset items
interface ProductItemState extends ProductItem {
    isPreset?: boolean;
}

const ITEM_TYPES = [
    'Aulas', 
    'Avaliações diagnósticas', 
    'Avaliações de progresso', 
    'Suportes pedagógicos'
];

const DISCIPLINES = [
    'Matemática',
    'Português',
    'Física',
    'Química',
    'Biologia',
    'História',
    'Geografia'
];

const PRODUCT_PRESETS: Record<string, { price: string, items: { type: string, qty: number }[] }> = {
    'Trilha': {
        price: '15.000,00',
        items: [
            { type: 'Aulas', qty: 62 },
            { type: 'Avaliações diagnósticas', qty: 1 },
            { type: 'Avaliações de progresso', qty: 2 },
            { type: 'Suportes pedagógicos', qty: 2 }
        ]
    },
    'Pacote de Aulas': {
        price: '5.000,00',
        items: [
            { type: 'Aulas', qty: 20 }
        ]
    },
    'Suporte Pedagógico': {
        price: '2.500,00',
        items: [
            { type: 'Suportes pedagógicos', qty: 1 }
        ]
    },
    'Relatório de progresso': {
        price: '1.200,00',
        items: [
            { type: 'Avaliações de progresso', qty: 1 }
        ]
    },
    'Diagnósticos': {
        price: '800,00',
        items: [
            { type: 'Avaliações diagnósticas', qty: 1 }
        ]
    }
};

const getIconForType = (type: string) => {
    switch (type) {
        case 'Aulas': return 'play_circle';
        case 'Avaliações diagnósticas': return 'fact_check';
        case 'Avaliações de progresso': return 'trending_up';
        case 'Suportes pedagógicos': return 'local_library';
        default: return 'circle';
    }
};

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({ isOpen, onClose, onSave }) => {
    const [selectedProduct, setSelectedProduct] = useState('');
    const [price, setPrice] = useState('');
    const [items, setItems] = useState<ProductItemState[]>([]);

    useEffect(() => {
        if (isOpen) {
            setSelectedProduct('');
            setPrice('');
            setItems([]);
        }
    }, [isOpen]);

    const handleProductChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const productName = e.target.value;
        setSelectedProduct(productName);
        
        if (productName && PRODUCT_PRESETS[productName]) {
            const preset = PRODUCT_PRESETS[productName];
            setPrice(preset.price);
            
            // Map preset items to state items
            const newItems: ProductItemState[] = preset.items.map((pi, idx) => ({
                id: `item-${Date.now()}-${idx}`,
                label: pi.type, 
                quantity: pi.qty.toString(),
                tag: (pi.type !== 'Suportes pedagógicos') ? 'Matemática' : undefined,
                isPreset: true // Mark as preset
            }));
            setItems(newItems); 
        } else {
            setPrice('');
            setItems([]);
        }
    };

    const handleAddItem = () => {
        setItems(prev => [
            ...prev,
            {
                id: `item-${Date.now()}`,
                label: 'Aulas',
                quantity: '1',
                tag: 'Matemática',
                isPreset: false // Mark as custom
            }
        ]);
    };

    const handleRemoveItem = (id: string) => {
        setItems(prev => prev.filter(i => i.id !== id));
    };

    const updateItem = (id: string, field: keyof ProductItemState, value: any) => {
        setItems(prev => prev.map(item => {
            if (item.id === id) {
                const updated = { ...item, [field]: value };
                
                // Logic when item type changes (only for custom items really, but good to have)
                if (field === 'label') { // label stores the Type
                    if (value === 'Suportes pedagógicos') {
                        updated.tag = undefined;
                    } else if (!updated.tag) {
                         updated.tag = 'Matemática';
                    }
                }
                
                return updated;
            }
            return item;
        }));
    };

    const handleQuantityChange = (id: string, delta: number) => {
        setItems(prev => prev.map(item => {
            if (item.id === id) {
                const currentQty = parseInt(item.quantity) || 0;
                const newQty = Math.max(1, currentQty + delta);
                return { ...item, quantity: newQty.toString() };
            }
            return item;
        }));
    };

    const handleSave = () => {
        if (!selectedProduct) return;

        const result: ProductResult = {
            id: `prod-${Date.now()}`,
            name: selectedProduct,
            price: `R$ ${price}`,
            quantity: '1x',
            items: items.map(i => ({
                id: i.id,
                label: i.label,
                quantity: `${i.quantity}x`,
                tag: i.tag
            }))
        };

        onSave(result);
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-[960px]">
            <div className="flex flex-col h-full bg-white dark:bg-[#131121] text-[#121118] dark:text-white rounded-xl overflow-hidden">
                {/* Header */}
                <header className="flex items-start justify-between gap-4 border-b border-[#dddce5] dark:border-gray-700 p-6">
                    <div className="flex flex-col gap-1">
                        <h2 className="text-[#121118] dark:text-white text-xl font-bold leading-tight">
                            {selectedProduct ? `Detalhes do ${selectedProduct}` : 'Novo Produto'}
                        </h2>
                        <p className="text-[#686388] dark:text-gray-400 text-sm font-normal leading-normal">
                            Ajuste os valores, quantidades e disciplinas para este item da proposta.
                        </p>
                    </div>
                    <button 
                        onClick={onClose}
                        className="flex h-8 w-8 items-center justify-center rounded-full text-[#686388] dark:text-gray-400 transition-colors hover:bg-black/10 dark:hover:bg-white/10"
                    >
                        <Icon name="close" className="!text-2xl" />
                    </button>
                </header>

                <div className="flex flex-col gap-6 p-6 overflow-y-auto max-h-[70vh]">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Product Select */}
                        <div className="flex flex-col">
                            <label className="flex flex-col">
                                <p className="pb-2 text-base font-medium leading-normal text-[#121118] dark:text-white">Selecionar Produto</p>
                                <div className="relative">
                                    <select 
                                        value={selectedProduct} 
                                        onChange={handleProductChange}
                                        className="form-select h-14 w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg border border-[#dddce5] dark:border-gray-700 bg-white dark:bg-gray-800 p-[15px] pr-8 text-base font-normal leading-normal text-[#121118] dark:text-white placeholder:text-[#686388] focus:border-[#6258A6] focus:outline-0 focus:ring-2 focus:ring-[#6258A6]/20 appearance-none"
                                    >
                                        <option value="" disabled>Selecione...</option>
                                        {Object.keys(PRODUCT_PRESETS).map(key => (
                                            <option key={key} value={key}>{key}</option>
                                        ))}
                                    </select>
                                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                                        <Icon name="expand_more" />
                                    </div>
                                </div>
                            </label>
                        </div>

                        {/* Price Input */}
                        <div className="flex flex-col">
                            <label className="flex flex-col">
                                <p className="pb-2 text-base font-medium leading-normal text-[#121118] dark:text-white">Valor do Produto</p>
                                <div className="relative">
                                    <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-[#686388]">R$</span>
                                    <input 
                                        type="text" 
                                        value={price}
                                        onChange={(e) => setPrice(e.target.value)}
                                        className="form-input h-14 w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg border border-[#dddce5] dark:border-gray-700 bg-white dark:bg-gray-800 p-[15px] pl-10 text-base font-normal leading-normal text-[#121118] dark:text-white placeholder:text-[#686388] focus:border-[#6258A6] focus:outline-0 focus:ring-2 focus:ring-[#6258A6]/20"
                                        placeholder="0,00"
                                    />
                                </div>
                            </label>
                        </div>
                    </div>

                    <div className="flex flex-col">
                        <h3 className="border-b border-[#dddce5] dark:border-gray-700 px-0 pb-3 text-lg font-bold leading-tight tracking-[-0.015em] text-[#121118] dark:text-white">Itens Inclusos</h3>
                        
                        <div className="flex flex-col divide-y divide-[#dddce5] dark:divide-gray-700">
                            {items.map((item) => (
                                <div key={item.id} className="grid grid-cols-1 items-center gap-4 py-4 md:grid-cols-2">
                                    {/* Type Select & Icon */}
                                    <div className="flex items-center gap-4">
                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#f1f0f4] dark:bg-gray-800 text-[#121118] dark:text-white">
                                            <Icon name={getIconForType(item.label)} />
                                        </div>
                                        <div className="relative flex-1">
                                            {item.isPreset ? (
                                                <div className="flex items-center h-full px-1">
                                                    <span className="text-base font-medium text-[#121118] dark:text-white">{item.label}</span>
                                                </div>
                                            ) : (
                                                <select 
                                                    value={item.label}
                                                    onChange={(e) => updateItem(item.id, 'label', e.target.value)}
                                                    className="w-full bg-transparent text-base font-normal leading-normal text-[#121118] dark:text-white outline-none appearance-none pr-6 cursor-pointer border-b border-transparent focus:border-[#6258A6] transition-colors py-1"
                                                >
                                                    {ITEM_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                                                </select>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex w-full items-center justify-end gap-3">
                                        {/* Quantity */}
                                        <div className="flex items-center justify-start gap-2 text-[#121118] dark:text-white">
                                            <button 
                                                onClick={() => handleQuantityChange(item.id, -1)}
                                                className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-full bg-[#f1f0f4] dark:bg-gray-700 text-base font-medium leading-normal transition-colors hover:bg-[#D1D3D4] dark:hover:bg-gray-600"
                                            >
                                                -
                                            </button>
                                            <input 
                                                type="number" 
                                                value={item.quantity}
                                                onChange={(e) => updateItem(item.id, 'quantity', parseInt(e.target.value) || 0)}
                                                className="w-10 border-none bg-transparent p-0 text-center text-base font-medium leading-normal focus:border-none focus:outline-0 focus:ring-0 appearance-textfield [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                                            />
                                            <button 
                                                onClick={() => handleQuantityChange(item.id, 1)}
                                                className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-full bg-[#f1f0f4] dark:bg-gray-700 text-base font-medium leading-normal transition-colors hover:bg-[#D1D3D4] dark:hover:bg-gray-600"
                                            >
                                                +
                                            </button>
                                        </div>

                                        {/* Discipline Select (Conditional) */}
                                        {item.label !== 'Suportes pedagógicos' ? (
                                            <select 
                                                value={item.tag}
                                                onChange={(e) => updateItem(item.id, 'tag', e.target.value)}
                                                className="form-select h-12 w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg border border-[#dddce5] dark:border-gray-700 bg-white dark:bg-gray-800 p-3 text-base font-normal leading-normal text-[#121118] dark:text-white placeholder:text-[#686388] focus:border-[#6258A6] focus:outline-0 focus:ring-2 focus:ring-[#6258A6]/20"
                                            >
                                                <option value="" disabled>Selecionar disciplina</option>
                                                {DISCIPLINES.map(d => <option key={d} value={d}>{d}</option>)}
                                            </select>
                                        ) : (
                                            <div className="flex-1"></div>
                                        )}

                                        {/* Delete Button - Only for non-preset items */}
                                        {!item.isPreset ? (
                                            <button 
                                                onClick={() => handleRemoveItem(item.id)}
                                                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-[#686388] dark:text-gray-400 transition-colors hover:bg-red-100 hover:text-red-500 dark:hover:bg-red-900/30"
                                                title="Remover item"
                                            >
                                                <Icon name="delete" />
                                            </button>
                                        ) : (
                                            // Spacer to maintain alignment
                                            <div className="w-10 h-10"></div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="py-4">
                            <button 
                                onClick={handleAddItem}
                                className="flex items-center gap-2 text-[#6258A6] transition-opacity hover:opacity-80"
                            >
                                <Icon name="add_circle" />
                                <span className="text-base font-semibold leading-normal">Adicionar item</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <footer className="flex flex-col-reverse items-center justify-end gap-3 border-t border-[#dddce5] dark:border-gray-700 p-6 sm:flex-row bg-white dark:bg-[#131121]">
                    <button 
                        onClick={onClose}
                        className="h-11 w-full rounded-lg px-6 text-base font-semibold text-[#686388] dark:text-gray-300 transition-colors hover:bg-[#686388]/10 dark:hover:bg-white/10 sm:w-auto"
                    >
                        Cancelar
                    </button>
                    <button 
                        onClick={handleSave}
                        disabled={!selectedProduct}
                        className="h-11 w-full rounded-lg bg-[#6258A6] px-6 text-base font-semibold text-white shadow-sm transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed sm:w-auto"
                    >
                        Adicionar à proposta
                    </button>
                </footer>
            </div>
        </Modal>
    );
};