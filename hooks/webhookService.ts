
import { WebhookPayload } from '../types';

const N8N_OPPORTUNITIES_WEBHOOK = 'https://n8n-luma-n8n-teste.5ucjhf.easypanel.host/webhook/oportunidades';

/**
 * Log estruturado de falhas para facilitar monitoramento.
 */
// Fix: Accessibility modifiers like 'private' cannot be used in object literals. 
// Moved logFailure to module scope to keep it private to the module.
const logFailure = (event: string, error: any) => {
    console.error(`[Webhook Error] [Event: ${event}] [Timestamp: ${new Date().toISOString()}]`, {
        message: error instanceof Error ? error.message : 'Unknown error',
        details: error
    });
};

/**
 * Serviço responsável por gerenciar a comunicação com o n8n.
 * Projetado para ser extensível a novos endpoints.
 */
export const webhookService = {
    /**
     * Envia um evento de negócio para o n8n via webhook.
     */
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
            // Fix: Calling module-level logFailure
            logFailure(payload.event, error);
            throw error;
        }
    },

    /**
     * Busca dados do webhook (usado para polling ou dashboards).
     */
    async fetchStats<T>(): Promise<T> {
        try {
            const response = await fetch(N8N_OPPORTUNITIES_WEBHOOK, {
                method: 'GET', // n8n webhooks aceitam GET se configurados
                headers: {
                    'Accept': 'application/json'
                }
            });

            if (!response.ok) throw new Error(`Erro ao buscar estatísticas: ${response.status}`);
            
            return await response.json() as T;
        } catch (error) {
            // Fix: Calling module-level logFailure
            logFailure('fetch_stats', error);
            throw error;
        }
    }
};
