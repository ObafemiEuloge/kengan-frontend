const randomDate = (start: Date, end: Date) => {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};

// Liste des catégories disponibles
const categories = [
  'Shonen Classics',
  'Anime Openings',
  'Seinen Masterpieces',
  'Shojo Romance',
  'Mecha Universe'
];

// Liste des statuts possibles
const statuses = ['waiting', 'in_progress', 'completed', 'cancelled'];

// Liste des avatars pour les créateurs et adversaires
const avatars = [
  '/images/avatars/avatar-1.webp',
  '/images/avatars/avatar-2.webp',
  '/images/avatars/avatar-3.webp',
  '/images/avatars/avatar-4.webp',
  '/images/avatars/avatar-5.webp',
  '/images/avatars/avatar-6.webp',
  '/images/avatars/avatar-7.webp'
];

// Liste des noms d'utilisateurs
const usernames = [
  'MangaKing',
  'AnimeFighter',
  'MangaQueen',
  'OtakuLegend',
  'AnimeQueen',
  'OnePieceGuru',
  'NarutoFan99',
  'DragonBallZ',
  'SailorMoonFan',
  'AttackTitan',
  'BleachMaster',
  'MyHeroAcademia',
  'HunterXHunter',
  'TokyoGhoul',
  'JujutsuKaisen',
  'DemonSlayerPro'
];

// Générer un tableau de duels
const generateDuels = (count: number) => {
  const duels = [];
  const now = new Date();
  const threeMonthsAgo = new Date(now);
  threeMonthsAgo.setMonth(now.getMonth() - 3);
  
  for (let i = 0; i < count; i++) {
    const id = 1000 + i;
    const createdAt = randomDate(threeMonthsAgo, now).toISOString();
    const category = categories[Math.floor(Math.random() * categories.length)];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const stake = Math.floor(Math.random() * 9000) + 1000; // entre 1000 et 10000
    
    // Créateur
    const creatorId = Math.floor(Math.random() * 1000) + 1;
    const creatorUsername = usernames[Math.floor(Math.random() * usernames.length)];
    const creatorAvatar = avatars[Math.floor(Math.random() * avatars.length)];
    const creatorLevel = Math.floor(Math.random() * 20) + 1;
    
    // Adversaire (sauf pour les duels en attente)
    let opponent = undefined;
    if (status !== 'waiting') {
      const opponentId = Math.floor(Math.random() * 1000) + 1;
      opponent = {
        id: opponentId,
        username: usernames[Math.floor(Math.random() * usernames.length)],
        avatar: avatars[Math.floor(Math.random() * avatars.length)],
        level: Math.floor(Math.random() * 20) + 1,
        ready: true,
        connected: status !== 'completed',
        score: status === 'completed' ? Math.floor(Math.random() * 10) : undefined
      };
    }
    
    duels.push({
      id,
      createdAt,
      creator: {
        id: creatorId,
        username: creatorUsername,
        avatar: creatorAvatar,
        level: creatorLevel
      },
      opponent,
      category,
      stake,
      status,
      joined: opponent ? 1 : 0
    });
  }
  
  return duels;
};

// Questions mockées pour un duel
const questions = [
  {
    id: 5001,
    text: "Quel est le nom du titan d'Eren Yeager dans Attack on Titan?",
    imageUrl: "/images/questions/aot-titan.jpg",
    options: [
      { id: 1, text: "Titan Colossal" },
      { id: 2, text: "Titan Cuirassé" },
      { id: 3, text: "Titan Assaillant" },
      { id: 4, text: "Titan Bestial" }
    ],
    timeLimit: 15,
    category: "Shonen Classics",
    questionNumber: 1,
    isLastQuestion: false,
    correctOptionId: 3
  },
  {
    id: 5002,
    text: "Qui est le capitaine de l'équipage de Luffy dans One Piece?",
    imageUrl: "/images/questions/one-piece-crew.jpg",
    options: [
      { id: 1, text: "Zoro" },
      { id: 2, text: "Nami" },
      { id: 3, text: "Luffy" },
      { id: 4, text: "Sanji" }
    ],
    timeLimit: 15,
    category: "Shonen Classics",
    questionNumber: 2,
    isLastQuestion: false,
    correctOptionId: 3
  },
  {
    id: 5003,
    text: "Quel est le nom du chakra spécial que possède Naruto?",
    imageUrl: "/images/questions/naruto-jutsu.jpg",
    options: [
      { id: 1, text: "Sharingan" },
      { id: 2, text: "Byakugan" },
      { id: 3, text: "Chakra du Démon Renard" },
      { id: 4, text: "Rinnegan" }
    ],
    timeLimit: 15,
    category: "Shonen Classics",
    questionNumber: 3,
    isLastQuestion: false,
    correctOptionId: 3
  },
  {
    id: 5004,
    text: "Quel est le style de respiration principal de Tanjiro dans Demon Slayer?",
    imageUrl: "/images/questions/demon-slayer.jpg",
    options: [
      { id: 1, text: "Respiration de l'Eau" },
      { id: 2, text: "Respiration de la Foudre" },
      { id: 3, text: "Respiration du Soleil" },
      { id: 4, text: "Respiration de la Bête" }
    ],
    timeLimit: 15,
    category: "Shonen Classics",
    questionNumber: 4,
    isLastQuestion: false,
    correctOptionId: 1
  },
  {
    id: 5005,
    text: "Quel est le nom du pouvoir de Deku dans My Hero Academia?",
    imageUrl: "/images/questions/my-hero-academia.jpg",
    options: [
      { id: 1, text: "One For All" },
      { id: 2, text: "All For One" },
      { id: 3, text: "Explosion" },
      { id: 4, text: "Half-Cold Half-Hot" }
    ],
    timeLimit: 15,
    category: "Shonen Classics",
    questionNumber: 5,
    isLastQuestion: true,
    correctOptionId: 1
  }
];

// Résultats mockés pour un duel
const results = {
  winnerId: 123,
  players: [
    {
      id: 123,
      score: 7,
      earnings: 9000
    },
    {
      id: 456,
      score: 3,
      earnings: -5000
    }
  ],
  commission: 1000
};

// Exporter les données mockées
export const mockDuels = {
  duels: generateDuels(50),
  questions,
  results
};