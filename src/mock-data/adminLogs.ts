// src/mock-data/adminLogs.ts
import type { AdminLog } from '../types/admin/adminLog';

// Fonction pour générer une date aléatoire dans les derniers jours
const randomDate = (daysBack: number): string => {
  const date = new Date();
  date.setDate(date.getDate() - Math.floor(Math.random() * daysBack));
  date.setHours(Math.floor(Math.random() * 24));
  date.setMinutes(Math.floor(Math.random() * 60));
  date.setSeconds(Math.floor(Math.random() * 60));
  return date.toISOString();
};

// Données mockées des logs d'administration
export const mockAdminLogs: AdminLog[] = [
  {
    id: 1001,
    timestamp: randomDate(1),
    type: 'auth',
    severity: 'info',
    user: 'admin@kengan.com',
    action: 'Connexion',
    details: 'Connexion réussie au panneau d\'administration'
  },
  {
    id: 1002,
    timestamp: randomDate(1),
    type: 'user',
    severity: 'success',
    user: 'admin@kengan.com',
    action: 'Création d\'utilisateur',
    details: 'Nouvel utilisateur créé: MangaKing (ID: 542)'
  },
  {
    id: 1003,
    timestamp: randomDate(1),
    type: 'transaction',
    severity: 'error',
    user: 'admin@kengan.com',
    action: 'Validation de transaction',
    details: 'Échec de validation de la transaction #TR-7845, motif: Fonds insuffisants'
  },
  {
    id: 1004,
    timestamp: randomDate(2),
    type: 'transaction',
    severity: 'success',
    user: 'finance@kengan.com',
    action: 'Retrait validé',
    details: 'Retrait #WD-3421 validé pour AnimeQueen, montant: 15000 FCFA'
  },
  {
    id: 1005,
    timestamp: randomDate(2),
    type: 'duel',
    severity: 'warning',
    user: 'moderator@kengan.com',
    action: 'Annulation de duel',
    details: 'Duel #DL-9876 annulé pour suspicion de triche, utilisateur: NarutoFan99'
  },
  {
    id: 1006,
    timestamp: randomDate(3),
    type: 'question',
    severity: 'info',
    user: 'content@kengan.com',
    action: 'Ajout de questions',
    details: '50 nouvelles questions ajoutées dans la catégorie "Seinen Masterpieces"'
  },
  {
    id: 1007,
    timestamp: randomDate(3),
    type: 'system',
    severity: 'error',
    user: 'system',
    action: 'Erreur système',
    details: 'Erreur de connexion à la base de données: Timeout after 30s'
  },
  {
    id: 1008,
    timestamp: randomDate(4),
    type: 'user',
    severity: 'warning',
    user: 'moderator@kengan.com',
    action: 'Blocage de compte',
    details: 'Compte utilisateur OnePunchMan (ID: 263) bloqué pour violation des CGU'
  },
  {
    id: 1009,
    timestamp: randomDate(4),
    type: 'transaction',
    severity: 'success',
    user: 'finance@kengan.com',
    action: 'Remboursement',
    details: 'Remboursement effectué pour DragonBallZ (ID: 187), montant: 3000 FCFA, motif: Problème technique'
  },
  {
    id: 1010,
    timestamp: randomDate(5),
    type: 'auth',
    severity: 'error',
    user: 'unknown',
    action: 'Tentative de connexion',
    details: 'Tentative de connexion échouée, IP: 192.168.1.105, Motif: Identifiants incorrects'
  },
  {
    id: 1011,
    timestamp: randomDate(5),
    type: 'system',
    severity: 'info',
    user: 'system',
    action: 'Maintenance',
    details: 'Début de maintenance planifiée, durée estimée: 2 heures'
  },
  {
    id: 1012,
    timestamp: randomDate(6),
    type: 'system',
    severity: 'success',
    user: 'system',
    action: 'Maintenance',
    details: 'Fin de maintenance planifiée, durée réelle: 1h45'
  },
  {
    id: 1013,
    timestamp: randomDate(6),
    type: 'question',
    severity: 'warning',
    user: 'content@kengan.com',
    action: 'Modification de question',
    details: 'Question #Q-4532 modifiée suite à un signalement d\'erreur'
  },
  {
    id: 1014,
    timestamp: randomDate(7),
    type: 'duel',
    severity: 'info',
    user: 'moderator@kengan.com',
    action: 'Vérification de duel',
    details: 'Duel #DL-10234 vérifié suite à un signalement, aucune anomalie détectée'
  },
  {
    id: 1015,
    timestamp: randomDate(7),
    type: 'user',
    severity: 'success',
    user: 'admin@kengan.com',
    action: 'Déblocage de compte',
    details: 'Compte utilisateur AkiraFans (ID: 129) débloqué après vérification'
  },
  {
    id: 1016,
    timestamp: randomDate(8),
    type: 'transaction',
    severity: 'info',
    user: 'finance@kengan.com',
    action: 'Rapport financier',
    details: 'Rapport financier hebdomadaire généré, total transactions: 287, volume: 2,450,000 FCFA'
  },
  {
    id: 1017,
    timestamp: randomDate(8),
    type: 'auth',
    severity: 'warning',
    user: 'admin@kengan.com',
    action: 'Changement de rôle',
    details: 'Utilisateur ModerationStaff (ID: 15) promu au rôle "Modérateur senior"'
  },
  {
    id: 1018,
    timestamp: randomDate(9),
    type: 'system',
    severity: 'error',
    user: 'system',
    action: 'Échec de backup',
    details: 'Échec de la sauvegarde automatique quotidienne, erreur: Espace disque insuffisant'
  },
  {
    id: 1019,
    timestamp: randomDate(9),
    type: 'question',
    severity: 'success',
    user: 'content@kengan.com',
    action: 'Import de questions',
    details: 'Import batch réussi, 200 questions ajoutées dans diverses catégories'
  },
  {
    id: 1020,
    timestamp: randomDate(10),
    type: 'duel',
    severity: 'warning',
    user: 'system',
    action: 'Détection d\'anomalie',
    details: 'Tendance suspecte détectée: 5 victoires consécutives de l\'utilisateur MangaGuru (ID: 456) en moins de 10 minutes'
  },
  
  // Plus de logs pour avoir au moins 50 entrées
  ...Array.from({ length: 30 }, (_, i) => ({
    id: 1021 + i,
    timestamp: randomDate(Math.floor(Math.random() * 30)),
    type: ['auth', 'user', 'transaction', 'duel', 'question', 'system'][Math.floor(Math.random() * 6)] as any,
    severity: ['info', 'warning', 'error', 'success'][Math.floor(Math.random() * 4)] as any,
    user: ['admin@kengan.com', 'moderator@kengan.com', 'finance@kengan.com', 'content@kengan.com', 'system'][Math.floor(Math.random() * 5)],
    action: [
      'Connexion', 
      'Déconnexion', 
      'Modification', 
      'Création', 
      'Suppression', 
      'Vérification',
      'Validation',
      'Annulation',
      'Maintenance',
      'Blocage'
    ][Math.floor(Math.random() * 10)],
    details: `Action ${i + 1021} effectuée avec succès par l'administrateur`
  }))
];

// Trier les logs par date décroissante (du plus récent au plus ancien)
mockAdminLogs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

// Assurez-vous que les IDs sont uniques et en ordre décroissant pour les nouveaux logs
mockAdminLogs.forEach((log, index) => {
  log.id = mockAdminLogs.length - index;
});