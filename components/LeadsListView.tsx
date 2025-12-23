
import React from 'react';
import { LeadColumnData, LeadCardData } from '../types';
import { Icon } from './ui/Icon';
import { Avatar } from './ui/Avatar';

interface LeadsListViewProps {
    data: LeadColumnData[];
    onCardClick: (leadId: string) => void;
}

interface FlatLead extends LeadCardData {
    status: string; // The column title (e.g., "Novo Lead")
}

export const LeadsListView: React.FC<LeadsListViewProps> = ({ data, onCardClick }) => {
    // Flatten the column data into a single list of leads
    const allLeads: FlatLead[] = React.useMemo(() => {
        return data.flatMap(column => 
            column.cards.map(card => ({
                ...card,
                status: column.title
            }))
        );
    }, [data]);

    const getPriorityColor = (priority?: string) => {
        switch (priority) {
            case 'Alta': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
            case 'Média': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
            case 'Baixa': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
            default: return 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400';
        }
    };

    if (allLeads.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400">
                <Icon name="inbox" className="text-6xl mb-4 opacity-20" />
                <p>Nenhum lead encontrado.</p>
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
                                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Lead</th>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Etapa</th>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden md:table-cell">Empresa</th>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden lg:table-cell">Contatos</th>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden sm:table-cell">Prioridade</th>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden xl:table-cell">Fonte</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-200 dark:divide-gray-800">
                            {allLeads.map((lead) => (
                                <tr 
                                    key={lead.id} 
                                    onClick={() => onCardClick(lead.id)}
                                    className="hover:bg-neutral-50 dark:hover:bg-gray-800/50 cursor-pointer transition-colors"
                                >
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0 h-10 w-10">
                                                <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                                                    {lead.name.substring(0, 2).toUpperCase()}
                                                </div>
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-bold text-gray-900 dark:text-gray-100">{lead.name}</div>
                                                <div className="text-xs text-gray-500 dark:text-gray-400 md:hidden">{lead.company}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-neutral-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 border border-neutral-200 dark:border-gray-700">
                                            {lead.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap hidden md:table-cell">
                                        <div className="text-sm text-gray-900 dark:text-gray-100">{lead.company || '-'}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap hidden lg:table-cell">
                                        <div className="flex flex-col gap-1">
                                            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                                                <Icon name="mail" className="text-[14px]" />
                                                <span>{lead.email}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                                                <Icon name="call" className="text-[14px]" />
                                                <span>{lead.phone}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap hidden sm:table-cell">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(lead.priority)}`}>
                                            {lead.priority || 'Normal'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap hidden xl:table-cell">
                                        <div className="text-sm text-gray-500 dark:text-gray-400">{lead.source}</div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
