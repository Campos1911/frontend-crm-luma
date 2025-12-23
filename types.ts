
export type StatusColor = 'blue' | 'orange' | 'purple' | 'yellow' | 'green' | 'red';

export interface ExperimentalClass {
    id: string;
    date: string;
    time: string;
    discipline: string;
    studentName: string;
}

export interface CardData {
    id: string;
    name: string;
    amount: string;
    status: string;
    statusColor: StatusColor;
    salesType?: 'B2B' | 'B2C' | 'B2G';
    closeDate?: string; // ISO string YYYY-MM-DD
    lossReason?: string;
    type?: 'Novo negócio' | 'Recompra' | 'Reativação';
    experimentalClasses?: ExperimentalClass[];
}

export interface ColumnData {
    id: string;
    title: string;
    cards: CardData[];
}

export interface LeadCardData {
    id: string;
    name: string;
    email: string;
    phone: string;
    source: string;
    note?: string;
    // Extended Details
    company?: string;
    priority?: 'Alta' | 'Média' | 'Baixa';
    medium?: string;
    campaign?: string;
    term?: string;
    content?: string;
    disqualificationReason?: string; // Novo campo
}

export interface LeadColumnData {
    id: string;
    title: string;
    cards: LeadCardData[];
}

export interface NavItem {
    icon: string;
    text: string;
    path: string;
}

export interface ProductItem {
    id: string;
    label: string;
    tag?: string;
    quantity: string;
}

export interface ProductGroup {
    id: string;
    name: string;
    quantity: string;
    price: string;
    items: ProductItem[];
}

export interface PaymentInfo {
    installments: string;
    expiryDate: string;
    paymentMethods: string;
    contractPeriod: string;
    contractStatus?: string; // Novo campo
}

export interface ProposalTask {
    id: string;
    title: string;
    dueDate: string;
    isCompleted: boolean;
    isNew?: boolean;
}

export interface Proposal {
    id: string;
    opportunityId: string; // Foreign Key to Opportunity
    title: string;
    displayId: string;
    status: 'Aceita' | 'Substituída' | 'Rascunho' | 'Enviada' | 'Revisão' | 'Rejeitada' | 'Cancelada';
    value: string;
    date: string;
    products?: ProductGroup[];
    discount?: string;
    paymentInfo?: PaymentInfo;
    tasks?: ProposalTask[]; // Novo campo
}

export interface ProposalCardData extends Proposal {
    opportunityName: string;
    contactName: string;
}

export interface ProposalColumnData {
    id: string;
    title: string;
    cards: ProposalCardData[];
}

export interface Student {
    id: string;
    name: string;
    role: string;
    financial: boolean;
    pedagogical: boolean;
}

export interface Guardian {
    id: string;
    name: string;
    role: string; // e.g. 'Pai', 'Mãe'
    phone?: string; // Novo campo
    isFinancial: boolean;
    isPedagogical: boolean;
}

export interface Note {
    id: string;
    content: string;
    date: string; // ISO String or YYYY-MM-DD
    author: string;
}

// New Interface for the Students Page
export interface StudentPageData {
    id: string;
    firstName: string;
    lastName: string;
    dateOfBirth: string; // YYYY-MM-DD
    school: string;
    financialGuardian: string;
    email?: string; // Used for Avatar generation
    schoolYear?: string;
    gender?: string;
    // Extended fields
    specificities?: string[];
    guardians?: Guardian[];
    notes?: Note[]; // Novo campo
}

export interface Address {
    street: string;
    number: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
}

export interface Contact {
    id: string;
    name: string;
    account: string;
    phone: string;
    email: string;
    cpf: string;
    country: string;
    role?: string; // Nova propriedade para 'Função'
    // Extended Fields for Detail View
    dateOfBirth?: string;
    address?: Address;
    students?: Student[];
}

export interface Account {
    id: string;
    name: string;
    type: string; // 'Física' | 'Jurídica' | 'Governo' | etc.
    phone: string;
    email: string;
    mainContact: string;
    // Extended
    manager?: string;
    owner?: string;
    cpfCnpj?: string;
}

export type RelatedObjectType = 'conta' | 'contato' | 'oportunidade' | 'lead';

export interface GlobalTask {
    id: string;
    title: string;
    dueDate: string; // YYYY-MM-DD
    isCompleted: boolean;
    assignee: string;
    relatedObjectType: RelatedObjectType;
    relatedObjectName: string;
    createdAt: string; // YYYY-MM-DD
    completedAt?: string;
    description?: string;
}
