
import React from 'react';
import { ColumnData, CardData } from '../types';
import { Icon } from './ui/Icon';
import { Tag } from './ui/Tag';

interface SalesListViewProps {
    data: ColumnData[];
    onCardClick: (cardId: string) => void;
}

interface FlatCard extends CardData {
    stage: string; // Column title
}

export const SalesListView: React.FC<SalesListViewProps> = ({ data, onCardClick }) => {
    // Flatten data
    const allCards: FlatCard[] = React.useMemo(() => {
        return data.flatMap(col => 
            col.cards.map(card => ({
                ...card,
                stage: col.title
            }))
        );
    }, [data]);

    const formatDate = (dateStr?: string) => {
        if (!dateStr) return '-';
        try {
            const [y, m, d] = dateStr.split('-');
            const date = new Date(Number(y), Number(m) - 1, Number(d));
            return date.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short', year: 'numeric' });
        } catch {
            return dateStr;
        }
    };

    const getOpportunityCode = (id: string) => {
        // Simple mock logic to generate a code like OPP-001 from id "c1"
        return `OPP-${id.replace('c', '00')}`;
    };

    if (allCards.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400">
                <Icon name="inbox" className="text-6xl mb-4 opacity-20" />
                <p>Nenhuma oportunidade encontrada.</p>
            </div>
        );
    }

    return (
        <div className="flex-1 overflow-auto bg-neutral-200/50 dark:bg-background-dark/50 p-6">
             <div className="min-w-full inline-block align-middle">
                <div className="border border-neutral-200 dark:border-gray-800 rounded-xl overflow-hidden bg-white dark:bg-background-dark shadow-sm">
                    <table className="min-w-full divide-y divide-neutral-200 dark:divide-gray-800">
                        <thead className="bg-neutral-50 dark:bg-gray-800/50">
                            <tr>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Código</th>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Conta</th>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Etapa</th>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Valor</th>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden sm:table-cell">Tipo Venda</th>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden md:table-cell">Tipo</th>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden lg:table-cell">Previsão</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-200 dark:divide-gray-800">
                             {allCards.map((card) => (
                                <tr 
                                    key={card.id} 
                                    onClick={() => onCardClick(card.id)}
                                    className="hover:bg-neutral-50 dark:hover:bg-gray-800/50 cursor-pointer transition-colors"
                                >
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-bold text-gray-900 dark:text-gray-100">
                                            {getOpportunityCode(card.id)}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                                            {card.name}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <Tag color={card.statusColor}>{card.stage}</Tag>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900 dark:text-white">{card.amount}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap hidden sm:table-cell">
                                        <div className="text-sm text-gray-500 dark:text-gray-400">{card.salesType || '-'}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap hidden md:table-cell">
                                        <div className="text-sm text-gray-500 dark:text-gray-400">{card.type || '-'}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap hidden lg:table-cell">
                                        <div className="text-sm text-gray-500 dark:text-gray-400">{formatDate(card.closeDate)}</div>
                                    </td>
                                </tr>
                             ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
