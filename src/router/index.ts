// src/router/index.ts
import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../pages/HomeView.vue'

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
      path: '/auth/forgot-password',
      name: 'forgot-password',
      component: () => import('../pages/auth/ForgotPasswordView.vue')
    },
    // Pages de Dashboard
    {
      path: '/dashboard',
      name: 'dashboard',
      component: () => import('../pages/dashboard/DashboardView.vue'),
      meta: { requiresAuth: false }
    },
    {
      path: '/dashboard/notifications',
      name: 'notifications',
      component: () => import('../pages/dashboard/NotificationsView.vue'),
      meta: { requiresAuth: false }
    },
    // Pages de profil
    {
      path: '/profile',
      name: 'profile',
      component: () => import('../pages/profile/ProfileView.vue'),
      meta: { requiresAuth: false }
    },
    {
      path: '/profile/edit',
      name: 'edit-profile',
      component: () => import('../pages/profile/EditProfileView.vue'),
      meta: { requiresAuth: false }
    },
    {
      path: '/profile/badges',
      name: 'badges',
      component: () => import('../pages/profile/BadgesView.vue'),
      meta: { requiresAuth: false }
    },
    // Pages de portefeuille
    {
      path: '/wallet',
      name: 'wallet',
      component: () => import('../pages/wallet/WalletView.vue'),
      meta: { requiresAuth: false }
    },
    {
      path: '/wallet/top-up',
      name: 'top-up',
      component: () => import('../pages/wallet/TopUpView.vue'),
      meta: { requiresAuth: false }
    },
    {
      path: '/wallet/withdraw',
      name: 'withdraw',
      component: () => import('../pages/wallet/WithdrawView.vue'),
      meta: { requiresAuth: false }
    },
    {
      path: '/wallet/transactions',
      name: 'transactions',
      component: () => import('../pages/wallet/TransactionsView.vue'),
      meta: { requiresAuth: false }
    },
    // Pages de duel
    {
      path: '/duels',
      name: 'duels',
      component: () => import('../pages/duel/DuelsLobbyView.vue'),
      meta: { requiresAuth: false }
    },
    {
      path: '/duels/create',
      name: 'create-duel',
      component: () => import('../pages/duel/CreateDuelView.vue'),
      // meta: { requiresAuth: false }
    },
    {
      path: '/duels/:id',
      name: 'duel',
      component: () => import('../pages/duel/DuelView.vue'),
      meta: { requiresAuth: false }
    },
    {
      path: '/duels/results/:id',
      name: 'duel-results',
      component: () => import('../pages/duel/DuelResultsView.vue'),
      meta: { requiresAuth: false }
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
      meta: { requiresAuth: false }
    },
    {
      path: '/community/friends',
      name: 'friends',
      component: () => import('../pages/community/FriendsView.vue'),
      meta: { requiresAuth: false }
    },
    {
      path: '/community/invitations',
      name: 'invitations',
      component: () => import('../pages/community/InvitationsView.vue'),
      meta: { requiresAuth: false }
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
router.beforeEach((to, from, next) => {
  const isAuthenticated = localStorage.getItem('token') !== null
  
  if (to.meta.requiresAuth && !isAuthenticated) {
    next({ name: 'login' })
  } else {
    next()
  }
})

export default router