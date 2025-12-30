
import { WebhookPayload, LeadsApiResponse, LeadColumnData } from '../types';

const N8N_OPPORTUNITIES_WEBHOOK = 'https://n8n-luma-n8n-teste.5ucjhf.easypanel.host/webhook/oportunidades';
const N8N_LEADS_WEBHOOK = 'https://n8n-luma-n8n-teste.5ucjhf.easypanel.host/webhook/leads';
const N8N_LEAD_UPDATE_WEBHOOK = 'https://n8n-luma-n8n-teste.5ucjhf.easypanel.host/webhook/lead';

const logFailure = (event: string, error: any) => {
    console.error(`[Webhook Error] [Event: ${event}] [Timestamp: ${new Date().toISOString()}]`, {
        message: error instanceof Error ? error.message : 'Unknown error',
        details: error
    });
};

export const webhookService = {
    async sendEvent(payload: WebhookPayload): Promise<Response> {
        try {
            console.debug(`[Webhook] Enviando evento: ${payload.event}`, payload);
            
            const response = await fetch(N8N_OPPORTUNITIES_WEBHOOK, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const errorBody = await response.text();
                throw new Error(`Falha na integração: ${response.status} - ${errorBody}`);
            }

            return response;
        } catch (error) {
            logFailure(payload.event, error);
            throw error;
        }
    },

    async fetchStats<T>(): Promise<T> {
        try {
            const response = await fetch(N8N_OPPORTUNITIES_WEBHOOK, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json'
                }
            });

            if (!response.ok) throw new Error(`Erro ao buscar estatísticas: ${response.status}`);
            
            return await response.json() as T;
        } catch (error) {
            logFailure('fetch_stats', error);
            throw error;
        }
    },

    async fetchLeads(): Promise<LeadColumnData[]> {
        try {
            const response = await fetch(N8N_LEADS_WEBHOOK, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json'
                }
            });

            if (!response.ok) throw new Error(`Erro ao buscar leads: ${response.status}`);
            
            const rawData = await response.json();
            const leadsObj = Array.isArray(rawData) ? (rawData[0] || {}) : (rawData || {});
            
            console.debug('[webhookService] Dados brutos recebidos:', leadsObj);

            return Object.keys(leadsObj).map((category, index) => ({
                id: `l-col-${index + 1}`,
                title: category,
                cards: Array.isArray(leadsObj[category]) ? leadsObj[category].map((apiLead: any) => ({
                    id: String(apiLead.Id),
                    name: apiLead.name || 'Sem nome',
                    email: apiLead.email || '',
                    phone: (apiLead.ddi ? `+${apiLead.ddi} ` : '') + (apiLead.phone || ''),
                    source: apiLead.id_externo_cep ? 'Site/Form' : 'n8n',
                    stage: category,
                    disqualificationReason: apiLead.motivo_desqualificacao || undefined,
                    note: apiLead.observacao || undefined,
                    priority: 'Normal',
                    tasksCount: apiLead.tasks || 0,
                    recordsCount: apiLead.registros_lead || 0,
                    updatedAt: apiLead.UpdatedAt
                })) : []
            }));
        } catch (error) {
            logFailure('fetch_leads', error);
            throw error;
        }
    },

    async updateLeadStage(leadId: string, stage: string): Promise<Response> {
        try {
            console.debug(`[Webhook] Atualizando lead ${leadId} para estágio: ${stage}`);
            const response = await fetch(N8N_LEAD_UPDATE_WEBHOOK, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({ 
                    leadId: leadId, 
                    stage: stage 
                }),
            });

            if (!response.ok) {
                const errorBody = await response.text();
                throw new Error(`Erro ao atualizar lead: ${response.status} - ${errorBody}`);
            }

            return response;
        } catch (error) {
            logFailure('update_lead_stage', error);
            throw error;
        }
    }
};
