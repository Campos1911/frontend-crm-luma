

export type StatusColor = 'blue' | 'orange' | 'purple' | 'yellow' | 'green' | 'red';

export interface NavItem {
    icon: string;
    text: string;
    path: string;
}

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
    salesType?: string;
    type?: string;
    closeDate?: string;
    lossReason?: string;
    experimentalClasses?: ExperimentalClass[];
    financialStatus?: string;
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
    company?: string;
    priority?: string;
    medium?: string;
    campaign?: string;
    term?: string;
    content?: string;
    note?: string;
    disqualificationReason?: string;
}

export interface LeadColumnData {
    id: string;
    title: string;
    cards: LeadCardData[];
}

export interface PaymentInfo {
    installments: string;
    expiryDate: string;
    paymentMethods: string;
    contractPeriod: string;
    contractStatus?: string;
    description?: string;
    automatedContract?: boolean;
}

export interface ProposalTask {
    id: string;
    title: string;
    dueDate: string;
    isCompleted: boolean;
    isNew?: boolean;
}

export interface ProductItem {
    id: string;
    label: string;
    quantity: string;
    tag?: string;
}

export interface ProductGroup {
    id: string;
    name: string;
    quantity: string;
    price: string;
    items: ProductItem[];
}

export interface Proposal {
    id: string;
    opportunityId: string;
    title: string;
    displayId: string;
    status: 'Rascunho' | 'Enviada' | 'Revisão' | 'Aceita' | 'Rejeitada' | 'Cancelada' | 'Substituída';
    value: string;
    date: string;
    paymentInfo?: PaymentInfo;
    discount?: string;
    products?: ProductGroup[];
    tasks?: ProposalTask[];
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

export interface Address {
    street: string;
    number: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
}

export interface ContactStudentLink {
    id: string;
    name: string;
    role: string;
    financial: boolean;
    pedagogical: boolean;
}

export interface Contact {
    id: string;
    name: string;
    account: string;
    phone: string;
    email: string;
    cpf: string;
    country: string;
    dateOfBirth?: string;
    address?: Address;
    students?: ContactStudentLink[];
    role?: string;
}

export interface Guardian {
    id: string;
    name: string;
    role: string;
    isFinancial: boolean;
    isPedagogical: boolean;
    phone?: string;
}

export interface Note {
    id: string;
    content: string;
    date: string;
    author: string;
}

export interface StudentPageData {
    id: string;
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    gender: string;
    schoolYear: string;
    school: string;
    financialGuardian: string;
    email: string;
    specificities: string[];
    guardians: Guardian[];
    notes?: Note[];
}

export interface Account {
    id: string;
    name: string;
    type: string;
    phone: string;
    email: string;
    mainContact: string;
    manager: string;
    owner: string;
    cpfCnpj: string;
}

export type RelatedObjectType = 'conta' | 'contato' | 'oportunidade' | 'lead';

export interface GlobalTask {
    id: string;
    title: string;
    dueDate: string;
    isCompleted: boolean;
    assignee: string;
    relatedObjectType: RelatedObjectType;
    relatedObjectName: string;
    createdAt: string;
    completedAt?: string;
    description?: string;
}
