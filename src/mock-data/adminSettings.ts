export const mockSecuritySettings = {
    twoFactorAuthRequired: false,
    passwordPolicy: {
      minLength: 8,
      requireNumbers: true,
      requireSpecialChars: true,
      requireUppercase: true,
      maxAgeInDays: 90
    },
    sessionTimeout: 30, // Minutes
    maxLoginAttempts: 5,
    ipRestriction: false,
    allowedIPs: '',
    loginNotification: true
  };
  
  export const mockSystemConfig = {
    siteName: 'KENGAN',
    siteDescription: 'Plateforme de duels pour otakus',
    maintenanceMode: false,
    maintenanceMessage: 'Site en maintenance. Nous serons de retour bientôt.',
    defaultLanguage: 'fr',
    timeZone: 'Europe/Paris',
    maxUploadSize: 5, // MB
    registrationEnabled: true,
    demoModeEnabled: true,
    duelSettings: {
      defaultQuestionCount: 10,
      timePerQuestion: 15, // seconds
      minStake: 1000,
      maxStake: 10000,
      commissionPercentage: 10
    },
    currencies: {
      mainCurrency: 'FCFA',
      decimalPlaces: 0,
      currencySymbolPosition: 'after' // 'before' or 'after'
    },
    emailSettings: {
      senderName: 'KENGAN Support',
      senderEmail: 'support@kengan.com',
      smtpEnabled: false
    }
  };
  
  export const mockNotificationTemplates = [
    { 
      id: 'welcome_email', 
      name: 'Email de bienvenue', 
      type: 'email',
      description: 'Envoyé aux nouveaux utilisateurs après inscription',
      subject: 'Bienvenue sur KENGAN - Confirmez votre compte',
      content: `Bonjour {{username}},
  
  Merci de vous être inscrit sur KENGAN, la plateforme de duels de connaissances anime et manga !
  
  Pour confirmer votre compte et commencer à participer aux duels, veuillez cliquer sur le lien suivant :
  {{confirmation_link}}
  
  Ce lien expirera dans 24 heures.
  
  Si vous avez des questions, n'hésitez pas à contacter notre équipe de support à {{support_email}}.
  
  À bientôt dans l'arène !
  
  L'équipe KENGAN`,
      variables: ['username', 'confirmation_link', 'support_email']
    },
    { 
      id: 'password_reset', 
      name: 'Réinitialisation de mot de passe', 
      type: 'email',
      description: 'Envoyé lors d\'une demande de réinitialisation de mot de passe',
      subject: 'Réinitialisation de votre mot de passe KENGAN',
      content: `Bonjour {{username}},
  
  Nous avons reçu une demande de réinitialisation de mot de passe pour votre compte KENGAN.
  
  Pour créer un nouveau mot de passe, veuillez cliquer sur le lien suivant :
  {{reset_link}}
  
  Ce lien expirera dans {{expiration_time}}.
  
  Si vous n'avez pas demandé cette réinitialisation, veuillez ignorer cet email.
  
  Cordialement,
  L'équipe KENGAN`,
      variables: ['username', 'reset_link', 'expiration_time']
    },
    { 
      id: 'duel_invitation', 
      name: 'Invitation à un duel', 
      type: 'notification',
      description: 'Notifie un utilisateur qu\'il a été invité à un duel',
      subject: 'Vous avez été défié !',
      content: `{{challenger_name}} vous a défié en duel !
  
  Catégorie : {{category}}
  Mise : {{stake}} FCFA
  
  Acceptez-vous ce défi ?`,
      variables: ['username', 'challenger_name', 'stake', 'category']
    },
    { 
      id: 'duel_result', 
      name: 'Résultat de duel', 
      type: 'notification',
      description: 'Notifie un utilisateur du résultat d\'un duel',
      subject: 'Résultat de votre duel',
      content: `Votre duel contre {{opponent_name}} est terminé !
  
  Résultat : {{result}}
  Score : {{score}}
  Gains : {{earnings}} FCFA
  
  Consultez les détails du duel pour voir votre performance.`,
      variables: ['username', 'opponent_name', 'result', 'earnings', 'score']
    },
    { 
      id: 'deposit_confirmation', 
      name: 'Confirmation de dépôt', 
      type: 'email',
      description: 'Envoyé après un dépôt d\'argent réussi',
      subject: 'Confirmation de dépôt KENGAN',
      content: `Bonjour {{username}},
  
  Nous confirmons avoir reçu votre dépôt sur votre compte KENGAN.
  
  Montant : {{amount}} FCFA
  Identifiant de transaction : {{transaction_id}}
  Date : {{date}}
  Nouveau solde : {{new_balance}} FCFA
  
  Merci de votre confiance !
  
  L'équipe KENGAN`,
      variables: ['username', 'amount', 'transaction_id', 'date', 'new_balance']
    },
    { 
      id: 'withdrawal_confirmation', 
      name: 'Confirmation de retrait', 
      type: 'email',
      description: 'Envoyé après un retrait d\'argent réussi',
      subject: 'Confirmation de retrait KENGAN',
      content: `Bonjour {{username}},
  
  Nous confirmons que votre demande de retrait a été traitée avec succès.
  
  Montant : {{amount}} FCFA
  Identifiant de transaction : {{transaction_id}}
  Date : {{date}}
  Nouveau solde : {{new_balance}} FCFA
  
  Le montant sera crédité sur votre compte dans les 24-48 heures ouvrables.
  
  Cordialement,
  L'équipe KENGAN`,
      variables: ['username', 'amount', 'transaction_id', 'date', 'new_balance']
    },
    { 
      id: 'account_suspension', 
      name: 'Suspension de compte', 
      type: 'email',
      description: 'Notifie un utilisateur de la suspension de son compte',
      subject: 'Information importante concernant votre compte KENGAN',
      content: `Bonjour {{username}},
  
  Nous vous informons que votre compte KENGAN a été temporairement suspendu.
  
  Raison : {{reason}}
  Durée : {{duration}}
  
  Si vous pensez qu'il s'agit d'une erreur ou si vous souhaitez contester cette décision, veuillez contacter notre équipe à {{contact_email}}.
  
  Cordialement,
  L'équipe KENGAN`,
      variables: ['username', 'reason', 'duration', 'contact_email']
    }
  ];
  
  export const mockSystemInfo = {
    serverTime: new Date().toISOString(),
    phpVersion: '8.1.0',
    databaseSize: '256 MB',
    uploadDirectorySize: '1.2 GB',
    cacheSize: '156 MB',
    logSize: '78 MB',
    lastBackup: '2023-12-15 03:00:00',
    cronLastRun: '2023-12-16 00:15:00',
    diskFreeSpace: '45 GB'
  };