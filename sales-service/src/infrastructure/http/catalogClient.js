// src/infrastructure/http/catalogClient.js
// Cliente HTTP al microservicio de catálogo con Retry + Circuit Breaker

import axios from 'axios';
import axiosRetry from 'axios-retry';
import CircuitBreaker from 'opossum';

const BASE_URL = process.env.CATALOG_BASE_URL || 'http://load-balancer:3000';

// Axios instance with retry strategy
const http = axios.create({ baseURL: BASE_URL, timeout: 2000 });
axiosRetry(http, {
  retries: 3,
  retryDelay: axiosRetry.exponentialDelay,
  retryCondition: (error) => {
    const status = error?.response?.status;
    return axiosRetry.isNetworkError(error) || axiosRetry.isRetryableError(error) || (status >= 500 && status <= 599);
  },
});

async function getBookByIdRaw(id) {
  const res = await http.get(`/books/${id}`);
  return res.data;
}

const breaker = new CircuitBreaker(getBookByIdRaw, {
  timeout: 3000, // tiempo máximo por solicitud
  errorThresholdPercentage: 50, // abre el circuito si >50% fallan
  resetTimeout: 5000, // intenta cerrar después de 5s
  volumeThreshold: 2, // mínimo de solicitudes para calcular errores
});

breaker.fallback(() => {
  const err = new Error('Catalog service unavailable (circuit open)');
  err.code = 'CATALOG_UNAVAILABLE';
  throw err;
});

export function createCatalogGateway() {
  return {
    /**
     * @returns {Promise<object|null>} Book o null si 404
     */
    async getBookById(id) {
      try {
        const book = await breaker.fire(id);
        return book;
      } catch (err) {
        // Si el catálogo responde 404, devolvemos null
        const status = err?.response?.status;
        if (status === 404) return null;
        throw err;
      }
    },
  };
}
