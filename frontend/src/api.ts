import axios, { AxiosResponse } from 'axios';

const api = axios.create({
    baseURL: '/api',
    headers: {
        'Content-Type': 'application/json'
    },
    withCredentials: true, // Enable sending cookies
});

// Organization ID interceptor - adds X-Organization-Id header to all requests
let currentOrganizationId: number | null = null;

export const setCurrentOrganizationId = (id: number | null) => {
    currentOrganizationId = id;
};

export const getCurrentOrganizationId = () => currentOrganizationId;

api.interceptors.request.use((config) => {
    if (currentOrganizationId) {
        config.headers['X-Organization-Id'] = currentOrganizationId.toString();
    }
    return config;
});

// Auth API
export const authApi = {
    register: (data: { email: string; password: string; name: string }): Promise<AxiosResponse> =>
        api.post('/auth/register', data),
    login: (data: { email: string; password: string }): Promise<AxiosResponse> =>
        api.post('/auth/login', data),
    logout: (): Promise<AxiosResponse> =>
        api.post('/auth/logout'),
    me: (): Promise<AxiosResponse> =>
        api.get('/auth/me'),
    verifyEmail: (token: string): Promise<AxiosResponse> =>
        api.get(`/auth/verify/${token}`),
    forgotPassword: (email: string): Promise<AxiosResponse> =>
        api.post('/auth/forgot-password', { email }),
    resetPassword: (token: string, password: string): Promise<AxiosResponse> =>
        api.post(`/auth/reset-password/${token}`, { password }),
    changePassword: (currentPassword: string, newPassword: string): Promise<AxiosResponse> =>
        api.post('/auth/change-password', { currentPassword, newPassword }),
    updateProfile: (data: { name?: string; email?: string; avatar?: string }): Promise<AxiosResponse> =>
        api.put('/auth/profile', data),
};

// Organizations API
export const organizationsApi = {
    getAll: (): Promise<AxiosResponse> => api.get('/organizations'),
    getById: (id: number): Promise<AxiosResponse> => api.get(`/organizations/${id}`),
    create: (data: { name: string; slug?: string; description?: string }): Promise<AxiosResponse> =>
        api.post('/organizations', data),
    update: (id: number, data: { name?: string; description?: string }): Promise<AxiosResponse> =>
        api.put(`/organizations/${id}`, data),
    delete: (id: number): Promise<AxiosResponse> => api.delete(`/organizations/${id}`),
    setDefault: (id: number): Promise<AxiosResponse> => api.post(`/organizations/${id}/default`),
    getMembers: (id: number): Promise<AxiosResponse> => api.get(`/organizations/${id}/members`),
    addMember: (id: number, data: { email: string; role?: string }): Promise<AxiosResponse> =>
        api.post(`/organizations/${id}/members`, data),
    removeMember: (id: number, userId: number): Promise<AxiosResponse> =>
        api.delete(`/organizations/${id}/members/${userId}`),
    updateMemberRole: (id: number, userId: number, role: string): Promise<AxiosResponse> =>
        api.put(`/organizations/${id}/members/${userId}`, { role }),
};

// Invitations API
export const invitationsApi = {
    getAll: (): Promise<AxiosResponse> => api.get('/invitations'),
    getByToken: (token: string): Promise<AxiosResponse> => api.get(`/invitations/token/${token}`),
    getMyInvitations: (): Promise<AxiosResponse> => api.get('/invitations/my'),
    create: (data: { email: string; role?: string }): Promise<AxiosResponse> =>
        api.post('/invitations', data),
    accept: (token: string): Promise<AxiosResponse> => api.post(`/invitations/token/${token}/accept`),
    decline: (token: string): Promise<AxiosResponse> => api.post(`/invitations/token/${token}/decline`),
    cancel: (id: number): Promise<AxiosResponse> => api.delete(`/invitations/${id}`),
    resend: (id: number): Promise<AxiosResponse> => api.post(`/invitations/${id}/resend`),
};


// Ingredients API
export const ingredientsApi = {
    getAll: (): Promise<AxiosResponse> => api.get('/ingredients'),
    create: (data: any): Promise<AxiosResponse> => api.post('/ingredients', data),
    update: (id: number, data: any): Promise<AxiosResponse> => api.put(`/ingredients/${id}`, data),
    delete: (id: number): Promise<AxiosResponse> => api.delete(`/ingredients/${id}`)
};

// Recipes API
export const recipesApi = {
    getAll: (): Promise<AxiosResponse> => api.get('/recipes'),
    getById: (id: number): Promise<AxiosResponse> => api.get(`/recipes/${id}`),
    getComponents: (excludeId?: number): Promise<AxiosResponse> =>
        api.get('/recipes/components', { params: excludeId ? { excludeId } : {} }),
    create: (data: any): Promise<AxiosResponse> => api.post('/recipes', data),
    update: (id: number, data: any): Promise<AxiosResponse> => api.put(`/recipes/${id}`, data),
    delete: (id: number): Promise<AxiosResponse> => api.delete(`/recipes/${id}`)
};

// Categories API
export const categoriesApi = {
    getAll: (): Promise<AxiosResponse> => api.get('/categories'),
    create: (data: any): Promise<AxiosResponse> => api.post('/categories', data),
    update: (id: number, data: any): Promise<AxiosResponse> => api.put(`/categories/${id}`, data),
    delete: (id: number): Promise<AxiosResponse> => api.delete(`/categories/${id}`)
};

// Menus API
export const menusApi = {
    getAll: (): Promise<AxiosResponse> => api.get('/menus'),
    getById: (id: number): Promise<AxiosResponse> => api.get(`/menus/${id}`),
    create: (data: any): Promise<AxiosResponse> => api.post('/menus', data),
    update: (id: number, data: any): Promise<AxiosResponse> => api.put(`/menus/${id}`, data),
    delete: (id: number): Promise<AxiosResponse> => api.delete(`/menus/${id}`)
};

// Stats API
export const statsApi = {
    get: (): Promise<AxiosResponse> => api.get('/stats')
};

// Units API (for unit conversion)
export const unitsApi = {
    getPurchaseUnits: (): Promise<AxiosResponse> => api.get('/units/purchase-units'),
    getUsageUnits: (): Promise<AxiosResponse> => api.get('/units/usage-units'),
    getUnitGroups: (): Promise<AxiosResponse> => api.get('/units/groups'),
    getCompatibleUnits: (purchaseUnit: string): Promise<AxiosResponse> => api.get(`/units/compatible/${purchaseUnit}`),
    calculateConversion: (purchaseUnit: string, usageUnit: string, packageSize?: number): Promise<AxiosResponse> =>
        api.get('/units/convert', { params: { purchaseUnit, usageUnit, packageSize } })
};

// Price History API
export const priceHistoryApi = {
    getAll: (limit?: number): Promise<AxiosResponse> => api.get('/price-history', { params: { limit } }),
    getByIngredient: (ingredientId: number, limit?: number): Promise<AxiosResponse> =>
        api.get(`/price-history/ingredient/${ingredientId}`, { params: { limit } }),
    getStatistics: (ingredientId: number, months?: number): Promise<AxiosResponse> =>
        api.get(`/price-history/ingredient/${ingredientId}/stats`, { params: { months } }),
    getTrends: (ingredientIds: number[], months?: number): Promise<AxiosResponse> =>
        api.get('/price-history/trends', { params: { ids: ingredientIds.join(','), months } }),
    getSummaryReport: (): Promise<AxiosResponse> => api.get('/price-history/summary'),
    create: (data: any): Promise<AxiosResponse> => api.post('/price-history', data),
    delete: (id: number): Promise<AxiosResponse> => api.delete(`/price-history/${id}`)
};

// Unit Master API (Master Satuan)
export const unitMasterApi = {
    getAll: (): Promise<AxiosResponse> => api.get('/unit-master'),
    getGrouped: (): Promise<AxiosResponse> => api.get('/unit-master/grouped'),
    getPurchaseUnits: (): Promise<AxiosResponse> => api.get('/unit-master/purchase'),
    getUsageUnits: (): Promise<AxiosResponse> => api.get('/unit-master/usage'),
    getCompatibleUnits: (purchaseUnit: string): Promise<AxiosResponse> =>
        api.get(`/unit-master/compatible/${purchaseUnit}`),
    getConversionRate: (fromUnit: string, toUnit: string, packageSize?: number): Promise<AxiosResponse> =>
        api.get('/unit-master/convert', { params: { fromUnit, toUnit, packageSize } }),
    getById: (id: number): Promise<AxiosResponse> => api.get(`/unit-master/${id}`),
    create: (data: any): Promise<AxiosResponse> => api.post('/unit-master', data),
    update: (id: number, data: any): Promise<AxiosResponse> => api.put(`/unit-master/${id}`, data),
    delete: (id: number): Promise<AxiosResponse> => api.delete(`/unit-master/${id}`),
    seedDefaults: (): Promise<AxiosResponse> => api.post('/unit-master/seed')
};

// Recipe Categories API (Master Kategori Resep)
export const recipeCategoriesApi = {
    getAll: (): Promise<AxiosResponse> => api.get('/recipe-categories'),
    getById: (id: number): Promise<AxiosResponse> => api.get(`/recipe-categories/${id}`),
    create: (data: any): Promise<AxiosResponse> => api.post('/recipe-categories', data),
    update: (id: number, data: any): Promise<AxiosResponse> => api.put(`/recipe-categories/${id}`, data),
    delete: (id: number): Promise<AxiosResponse> => api.delete(`/recipe-categories/${id}`)
};

// Menu Categories API (Master Kategori Menu)
export const menuCategoriesApi = {
    getAll: (): Promise<AxiosResponse> => api.get('/menu-categories'),
    getById: (id: number): Promise<AxiosResponse> => api.get(`/menu-categories/${id}`),
    create: (data: any): Promise<AxiosResponse> => api.post('/menu-categories', data),
    update: (id: number, data: any): Promise<AxiosResponse> => api.put(`/menu-categories/${id}`, data),
    delete: (id: number): Promise<AxiosResponse> => api.delete(`/menu-categories/${id}`)
};

export default api;
