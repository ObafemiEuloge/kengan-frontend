// src/services/adminUsersService.ts
import api from './api';

export const adminUsersService = {
  // Récupérer un utilisateur par ID
  async getUser(userId: number) {
    const response = await api.get(`/admin/users/${userId}/`);
    return response;
  },
  
  // Rechercher des utilisateurs
  async searchUsers(query: string) {
    const response = await api.get('/admin/users/search/', {
      params: { query }
    });
    return response.results || response;
  },
  
  // Liste des utilisateurs avec pagination
  async getUsers(page = 1, limit = 10, filters = {}) {
    const response = await api.get('/admin/users/', {
      params: {
        page,
        limit,
        ...filters
      }
    });
    return response;
  }
};

export default adminUsersService;