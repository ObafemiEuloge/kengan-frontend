// src/router/index.ts
import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../pages/HomeView.vue'
import { truncate } from 'node:fs'
import { useAuthStore } from '../store/auth/authStore'
import { useNotificationStore } from '../store/notification/notificationStore'
import { websocketService } from '../services/websocketService'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    // Pages statiques pour les liens du footer
    {
      path: '/about',
      name: 'about',
      component: () => import('../pages/AboutView.vue')
    },
    {
      path: '/faq',
      name: 'faq',
      component: () => import('../pages/FAQView.vue')
    },
    {
      path: '/terms',
      name: 'terms',
      component: () => import('../pages/TermsView.vue')
    },
    {
      path: '/privacy',
      name: 'privacy',
      component: () => import('../pages/PrivacyView.vue')
    },
    {
      path: '/payment-terms',
      name: 'payment-terms',
      component: () => import('../pages/PaymentTermsView.vue')
    },
    {
      path: '/contact',
      name: 'contact',
      component: () => import('../pages/ContactView.vue')
    },
    // Pages d'authentification
    {
      path: '/auth/login',
      name: 'login',
      component: () => import('../pages/auth/LoginView.vue')
    },
    {
      path: '/auth/register',
      name: 'register',
      component: () => import('../pages/auth/RegisterView.vue')
    },
    {
      path: '/auth/verify-email',
      name: 'verify-email',
      component: () => import('../pages/auth/EmailVerificationView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/auth/confirm-email',
      name: 'confirm-email',
      component: () => import('../pages/auth/EmailConfirmationView.vue')
    },
    {
      path: '/auth/forgot-password',
      name: 'forgot-password',
      component: () => import('../pages/auth/ForgotPasswordView.vue')
    },
    // Pages de Dashboard
    {
      path: '/dashboard',
      name: 'dashboard',
      component: () => import('../pages/dashboard/DashboardView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/dashboard/notifications',
      name: 'notifications',
      component: () => import('../pages/dashboard/NotificationsView.vue'),
      meta: { requiresAuth: true }
    },
    // Pages de profil
    {
      path: '/profile',
      name: 'profile',
      component: () => import('../pages/profile/ProfileView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/profile/edit',
      name: 'edit-profile',
      component: () => import('../pages/profile/EditProfileView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/profile/badges',
      name: 'badges',
      component: () => import('../pages/profile/BadgesView.vue'),
      meta: { requiresAuth: true }
    },
    // Pages de portefeuille
    {
      path: '/wallet',
      name: 'wallet',
      component: () => import('../pages/wallet/WalletView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/wallet/top-up',
      name: 'top-up',
      component: () => import('../pages/wallet/TopUpView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/wallet/withdraw',
      name: 'withdraw',
      component: () => import('../pages/wallet/WithdrawView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/wallet/transactions',
      name: 'transactions',
      component: () => import('../pages/wallet/TransactionsView.vue'),
      meta: { requiresAuth: true }
    },
    // Pages de duel
    {
      path: '/duels',
      name: 'duels',
      component: () => import('../pages/duel/DuelsLobbyView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/duels/create',
      name: 'create-duel',
      component: () => import('../pages/duel/CreateDuelView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/duels/:id',
      name: 'duel',
      component: () => import('../pages/duel/DuelView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/duels/results/:id',
      name: 'duel-results',
      component: () => import('../pages/duel/DuelResultsView.vue'),
      meta: { requiresAuth: true }
    },
    // Page de classement
    {
      path: '/ranking',
      name: 'ranking',
      component: () => import('../pages/ranking/RankingView.vue')
    },
    // Pages de communauté
    {
      path: '/community',
      name: 'community',
      component: () => import('../pages/community/CommunityView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/community/friends',
      name: 'friends',
      component: () => import('../pages/community/FriendsView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/community/invitations',
      name: 'invitations',
      component: () => import('../pages/community/InvitationsView.vue'),
      meta: { requiresAuth: true }
    },
    // Pages de démo
    {
      path: '/demo',
      name: 'demo',
      component: () => import('../pages/demo/DemoView.vue')
    },
    {
      path: '/demo/tutorial',
      name: 'demo-tutorial',
      component: () => import('../pages/demo/DemoTutorialView.vue')
    },
    {
      path: '/demo/duel',
      name: 'demo-duel',
      component: () => import('../pages/demo/DemoDuelView.vue')
    },
    {
      path: '/admin',
      component: () => import('../layouts/AdminLayout.vue'),
      meta: { requiresAdmin: true },
      children: [
        {
          path: '',
          name: 'admin-dashboard',
          component: () => import('../pages/admin/AdminDashboardView.vue')
        },
        {
          path: 'users',
          name: 'admin-users',
          component: () => import('../pages/admin/UsersManagementView.vue')
        },
        {
          path: 'transactions',
          name: 'admin-transactions',
          component: () => import('../pages/admin/TransactionsManagementView.vue')
        },
        {
          path: 'duels',
          name: 'admin-duels',
          component: () => import('../pages/admin/DuelsManagementView.vue')
        },
        {
          path: 'questions',
          name: 'admin-questions',
          component: () => import('../pages/admin/QuestionsManagementView.vue')
        },
        {
          path: 'questions/create',
          name: 'admin-questions-create',
          component: () => import('../pages/admin/QuestionEditView.vue')
        },
        {
          path: 'questions/edit/:id',
          name: 'admin-questions-edit',
          component: () => import('../pages/admin/QuestionCreateView.vue')
        },
        {
          path: 'reports',
          name: 'admin-reports',
          component: () => import('../pages/admin/ReportsView.vue')
        },
        {
          path: 'settings',
          name: 'admin-settings',
          component: () => import('../pages/admin/SystemSettingsView.vue')
        },
        {
          path: 'logs',
          name: 'admin-logs',
          component: () => import('../pages/admin/AdminLogsView.vue')
        }
      ]
    },
   
    {
      path: '/admin/login',
      name: 'admin-login',
      component: () => import('../pages/admin/AdminLoginView.vue')
    },
    {
      path: '/admin/register',
      name: 'admin-register',
      component: () => import('../pages/admin/AdminRegisterView.vue')
    },
    // Route 404 pour les pages non trouvées
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('../pages/NotFoundView.vue')
    }
  ],
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  }
})

// Navigation guard
router.beforeEach(async (to, from, next) => {
  const isAuthenticated = localStorage.getItem('token') !== null
  
  // Vérification pour les routes qui nécessitent des privilèges d'administrateur
  if (to.meta.requiresAdmin) {
    if (!isAuthenticated) {
      console.log('Utilisateur non authentifié, redirection vers la page de connexion admin');
      next({ name: 'admin-login' });
      return;
    }
    
    // Chargement du profil utilisateur pour vérifier les rôles
    const authStore = useAuthStore();
    
    // Si le profil n'est pas encore chargé, nous le chargeons
    if (!authStore.user) {
      try {
        console.log('Profil utilisateur non chargé, tentative de chargement...');
        await authStore.fetchUserProfile();
        console.log('Profil utilisateur chargé avec succès:', authStore.user);
      } catch (error) {
        console.error('Erreur lors du chargement du profil utilisateur:', error);
        next({ name: 'admin-login' });
        return;
      }
    }
    
    // Vérification directe des droits administrateur
    try {
      console.log('Vérification des droits administrateur pour l\'accès à', to.path);
      const isAdmin = await authStore.checkAdminRights();
      console.log('Résultat de la vérification des droits admin dans le routeur:', isAdmin);
      
      if (!isAdmin) {
        console.log('Accès refusé : l\'utilisateur n\'a pas les droits administrateur');
        next({ name: 'admin-login', query: { denied: 'true' } });
        return;
      }
      
      console.log('Accès autorisé: l\'utilisateur a les droits administrateur');
    } catch (error) {
      console.error('Erreur lors de la vérification des droits admin dans le routeur:', error);
      next({ name: 'admin-login', query: { error: 'true' } });
      return;
    }
  }
  // Vérification standard pour l'authentification
  else if (to.meta.requiresAuth && !isAuthenticated) {
    next({ name: 'login' })
    return
  } 
  
  // Si l'utilisateur est authentifié et navigue vers une page qui requiert l'authentification,
  // nous initialisons la connexion WebSocket pour les notifications
  if (isAuthenticated && to.meta.requiresAuth) {
    // Utiliser Pinia en dehors d'un composant nécessite l'initialisation manuelle
    const notificationStore = useNotificationStore()
    
    // Initialiser la connexion WebSocket si elle n'est pas déjà établie
    if (!notificationStore.isWebSocketConnected) {
      notificationStore.connectWebSocket()
    }
  }
  
  next()
})

export default router