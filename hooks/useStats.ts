
import { useState, useEffect } from 'react';
import { DashboardStats } from '../types';
import { webhookService } from '../services/webhookService';

// Configurações de Cache
const CACHE_KEY = 'dashboard_stats_cache';
const CACHE_TTL_MS = 600 * 1000; // 10 minutos (600 segundos)

interface CacheEntry<T> {
    data: T;
    expiry: number;
}

// Cache persistente em memória (singleton no nível do módulo)
const memoryCache = new Map<string, CacheEntry<DashboardStats>>();

/**
 * Hook para obter estatísticas consolidadas do n8n com gerenciamento de cache.
 */
export function useStats() {
    const [data, setData] = useState<DashboardStats | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = async (forceRefresh = false) => {
        setIsLoading(true);
        setError(null);

        try {
            const now = Date.now();
            const cached = memoryCache.get(CACHE_KEY);

            // Verifica se o cache ainda é válido
            if (!forceRefresh && cached && cached.expiry > now) {
                console.debug('[useStats] Retornando dados do cache.');
                setData(cached.data);
                setIsLoading(false);
                return;
            }

            // Busca novos dados se cache expirado ou forceRefresh
            console.debug('[useStats] Cache expirado ou inexistente. Buscando dados do n8n...');
            const stats = await webhookService.fetchStats<DashboardStats>();
            
            // Normalização básica para garantir consistência
            const normalizedStats: DashboardStats = {
                ...stats,
                lastUpdate: new Date().toISOString()
            };

            // Atualiza cache em memória
            memoryCache.set(CACHE_KEY, {
                data: normalizedStats,
                expiry: now + CACHE_TTL_MS
            });

            setData(normalizedStats);
        } catch (err) {
            const msg = err instanceof Error ? err.message : 'Erro ao carregar estatísticas';
            setError(msg);
            
            // Se falhar e houver cache antigo, mantém o dado mas loga o erro
            const staled = memoryCache.get(CACHE_KEY);
            if (staled) {
                setData(staled.data);
                console.warn('[useStats] Servidor offline. Utilizando dados expirados do cache.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    return { 
        data, 
        isLoading, 
        error, 
        refresh: () => fetchData(true) 
    };
}
