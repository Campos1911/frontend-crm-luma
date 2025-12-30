
import { useState, useEffect } from 'react';
import { LeadColumnData } from '../types';
import { webhookService } from '../services/webhookService';

const CACHE_KEY = 'leads_data_cache';
const CACHE_TTL_MS = 300 * 1000; // 5 minutos

interface CacheEntry {
    data: LeadColumnData[];
    expiry: number;
}

const memoryCache = new Map<string, CacheEntry>();

/**
 * Hook para obter leads do n8n com cache.
 */
export function useLeads() {
    const [leads, setLeads] = useState<LeadColumnData[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const fetchLeads = async (forceRefresh = false) => {
        setIsLoading(true);
        setError(null);

        try {
            const now = Date.now();
            const cached = memoryCache.get(CACHE_KEY);

            if (!forceRefresh && cached && cached.expiry > now) {
                setLeads(cached.data);
                setIsLoading(false);
                return;
            }

            const data = await webhookService.fetchLeads();
            
            memoryCache.set(CACHE_KEY, {
                data,
                expiry: now + CACHE_TTL_MS
            });

            setLeads(data);
        } catch (err) {
            const msg = err instanceof Error ? err.message : 'Erro ao carregar leads';
            setError(msg);
            
            const staled = memoryCache.get(CACHE_KEY);
            if (staled) setLeads(staled.data);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchLeads();
    }, []);

    return { 
        leads, 
        isLoading, 
        error, 
        refresh: () => fetchLeads(true) 
    };
}
