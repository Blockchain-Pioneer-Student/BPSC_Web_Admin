// API Endpoints Configuration for ShopNest
// export const API_BASE_URL = 'https://bpsclub-web.onrender.com/api';
export const API_BASE_URL = 'http://localhost:4000/api';
export const EVENT_ENDPOINTS = {
    GET_ALL: '/events/get-all',           // GET - Public: Get all events with optional sorting and limiting
} as const;

export const PARTNER_ENDPOINTS = {
    GET_ALL: '/partners/get-all',         // GET - Public: Get all partners
} as const;
// ===== ENDPOINT BUILDERS =====
export const buildEndpoint = {
    events: {
        getAll: (params?: { sort?: string; limit?: number }) => {
            const queryParams = new URLSearchParams();
            if (params?.sort) {
                queryParams.append('sort', params.sort);
            }
            if (params?.limit) {
                queryParams.append('limit', params.limit.toString());
            }
            return `${EVENT_ENDPOINTS.GET_ALL}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
        },
        partners: {
            getAll: () => PARTNER_ENDPOINTS.GET_ALL,
        }
    }
} as const;

// ===== ALL ENDPOINTS OBJECT =====
export const API_ENDPOINTS = {
    ...EVENT_ENDPOINTS,
    ...PARTNER_ENDPOINTS,
    BASE_URL: API_BASE_URL,
} as const;

export default API_ENDPOINTS;