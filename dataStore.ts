import { ColumnData, ProposalColumnData, ProposalCardData, CardData, Proposal, Account, GlobalTask } from './types';
import { INITIAL_FUNNEL_DATA, INITIAL_PROPOSALS_KANBAN_DATA, INITIAL_ACCOUNTS_DATA, INITIAL_TASKS_DATA } from './constants';

// Internal State Containers
let opportunitiesState: ColumnData[] = JSON.parse(JSON.stringify(INITIAL_FUNNEL_DATA));
let proposalsState: ProposalColumnData[] = JSON.parse(JSON.stringify(INITIAL_PROPOSALS_KANBAN_DATA));
let accountsState: Account[] = JSON.parse(JSON.stringify(INITIAL_ACCOUNTS_DATA));
let tasksState: GlobalTask[] = JSON.parse(JSON.stringify(INITIAL_TASKS_DATA));

// --- Opportunities API ---

export const getOpportunities = (): ColumnData[] => {
    return opportunitiesState;
};

export const getOpportunityById = (id: string): { card: CardData, stage: string } | null => {
    for (const col of opportunitiesState) {
        const found = col.cards.find(c => c.id === id);
        if (found) {
            return { card: found, stage: col.title };
        }
    }
    return null;
};

export const updateOpportunity = (updatedCard: CardData) => {
    opportunitiesState = opportunitiesState.map(col => ({
        ...col,
        cards: col.cards.map(c => c.id === updatedCard.id ? updatedCard : c)
    }));
};

export const moveOpportunity = (cardId: string, sourceColId: string, destColId: string, updatedCardData?: Partial<CardData>) => {
    const sourceCol = opportunitiesState.find(c => c.id === sourceColId);
    const destCol = opportunitiesState.find(c => c.id === destColId);
    
    if (!sourceCol || !destCol) return;

    const cardIndex = sourceCol.cards.findIndex(c => c.id === cardId);
    if (cardIndex === -1) return;

    const [card] = sourceCol.cards.splice(cardIndex, 1);
    
    const movedCard = { ...card, ...updatedCardData };
    destCol.cards.push(movedCard);
    
    opportunitiesState = [...opportunitiesState];
};

export const addOpportunity = (newCard: CardData) => {
    const newOppCol = opportunitiesState.find(c => c.title === 'Nova Oportunidade');
    if (newOppCol) {
        newOppCol.cards.unshift(newCard);
    }
};

export const deleteOpportunity = (cardId: string) => {
    opportunitiesState = opportunitiesState.map(col => ({
        ...col,
        cards: col.cards.filter(c => c.id !== cardId)
    }));
};

// --- Proposals API ---

export const getProposalsColumns = (): ProposalColumnData[] => {
    return proposalsState;
};

export const getProposalsByOpportunity = (opportunityId: string): Proposal[] => {
    const allProposals = proposalsState.flatMap(col => col.cards);
    return allProposals.filter(p => p.opportunityId === opportunityId);
};

export const addProposal = (proposal: Proposal) => {
    const col = proposalsState.find(c => c.title === proposal.status);
    if (!col) return;

    let oppName = 'Unknown';
    let contactName = 'Unknown';
    
    outerLoop:
    for (const oppCol of opportunitiesState) {
        for (const opp of oppCol.cards) {
            if (opp.id === proposal.opportunityId) {
                oppName = opp.name;
                contactName = 'Contato Principal'; 
                break outerLoop;
            }
        }
    }

    const cardData: ProposalCardData = {
        ...proposal,
        opportunityName: oppName,
        contactName: contactName
    };

    col.cards.unshift(cardData);
};

export const updateProposal = (updatedProposal: Proposal) => {
    if (updatedProposal.status === 'Aceita') {
        proposalsState.forEach(col => {
            const cardsToDemote = col.cards.filter(c => 
                c.opportunityId === updatedProposal.opportunityId && 
                c.id !== updatedProposal.id && 
                c.status === 'Aceita'
            );

            cardsToDemote.forEach(card => {
                const idx = col.cards.indexOf(card);
                if (idx > -1) col.cards.splice(idx, 1);
                card.status = 'Substituída';
                const subCol = proposalsState.find(c => c.title === 'Substituída');
                if (subCol) {
                    subCol.cards.unshift(card);
                } else {
                    proposalsState[0].cards.unshift(card);
                }
            });
        });
    }

    let currentCard: ProposalCardData | null = null;
    
    proposalsState = proposalsState.map(col => {
        const idx = col.cards.findIndex(c => c.id === updatedProposal.id);
        if (idx !== -1) {
            [currentCard] = col.cards.splice(idx, 1);
        }
        return col;
    });

    if (currentCard) {
        const newCard: ProposalCardData = {
            ...currentCard,
            ...updatedProposal
        };
        
        const targetCol = proposalsState.find(c => c.title === newCard.status);
        if (targetCol) {
            targetCol.cards.unshift(newCard);
        } else {
            proposalsState[0].cards.unshift(newCard);
        }
    }
};

export const moveProposal = (cardId: string, sourceColId: string, destColId: string) => {
    const sourceCol = proposalsState.find(c => c.id === sourceColId);
    const destCol = proposalsState.find(c => c.id === destColId);
    
    if (!sourceCol || !destCol) return;

    const cardIndex = sourceCol.cards.findIndex(c => c.id === cardId);
    if (cardIndex === -1) return;

    const [card] = sourceCol.cards.splice(cardIndex, 1);
    
    const newStatus = destCol.title as Proposal['status'];
    const updatedCard = { ...card, status: newStatus };

    if (newStatus === 'Aceita') {
         updateProposal(updatedCard);
    } else {
        destCol.cards.push(updatedCard);
    }
};

// --- Accounts API ---

export const getAccounts = (): Account[] => {
    return accountsState;
};

export const updateAccount = (updatedAccount: Account) => {
    accountsState = accountsState.map(a => a.id === updatedAccount.id ? updatedAccount : a);
};

export const deleteAccount = (accountId: string) => {
    accountsState = accountsState.filter(a => a.id !== accountId);
};

export const addAccount = (newAccount: Account) => {
    accountsState = [newAccount, ...accountsState];
};

// --- Tasks API ---

export const getTasks = (): GlobalTask[] => {
    return tasksState;
};

export const updateTask = (updatedTask: GlobalTask) => {
    tasksState = tasksState.map(t => t.id === updatedTask.id ? updatedTask : t);
};

export const deleteTask = (taskId: string) => {
    tasksState = tasksState.filter(t => t.id !== taskId);
};

export const addTask = (newTask: GlobalTask) => {
    tasksState = [newTask, ...tasksState];
};

export const toggleTaskCompletion = (taskId: string) => {
    tasksState = tasksState.map(t => {
        if (t.id === taskId) {
            const nextStatus = !t.isCompleted;
            return {
                ...t,
                isCompleted: nextStatus,
                completedAt: nextStatus ? new Date().toISOString().split('T')[0] : undefined
            };
        }
        return t;
    });
};