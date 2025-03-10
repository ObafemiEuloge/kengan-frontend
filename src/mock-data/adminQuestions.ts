// src/mock-data/adminQuestions.ts
import { AdminQuestion, QuestionCategory, QuestionStats } from '../types/admin/question';

// Questions mockées
export const mockQuestions: AdminQuestion[] = [
  {
    id: 1,
    text: "Quel est le nom du titan d'Eren Yeager dans Attack on Titan?",
    type: 'text',
    options: [
      { id: 1, text: "Titan Colossal", isCorrect: false },
      { id: 2, text: "Titan Cuirassé", isCorrect: false },
      { id: 3, text: "Titan Assaillant", isCorrect: true },
      { id: 4, text: "Titan Bestial", isCorrect: false }
    ],
    categoryId: 1,
    difficulty: 'medium',
    timeLimit: 15,
    active: true,
    createdAt: '2023-11-12T14:30:00Z',
    updatedAt: '2023-11-12T14:30:00Z',
    usageCount: 243
  },
  {
    id: 2,
    text: "Dans One Piece, qui est le capitaine de l'équipage du chapeau de paille?",
    type: 'image',
    mediaUrl: '/images/questions/one-piece-crew.jpg',
    options: [
      { id: 1, text: "Zoro", isCorrect: false },
      { id: 2, text: "Luffy", isCorrect: true },
      { id: 3, text: "Sanji", isCorrect: false },
      { id: 4, text: "Nami", isCorrect: false }
    ],
    categoryId: 1,
    difficulty: 'easy',
    timeLimit: 10,
    active: true,
    createdAt: '2023-11-13T09:15:00Z',
    updatedAt: '2023-11-13T09:15:00Z',
    usageCount: 315
  },
  {
    id: 3,
    text: "Quel est le nom de cette technique utilisée par Naruto?",
    type: 'video',
    mediaUrl: '/videos/questions/naruto-rasengan.mp4',
    options: [
      { id: 1, text: "Chidori", isCorrect: false },
      { id: 2, text: "Rasengan", isCorrect: true },
      { id: 3, text: "Kage Bunshin", isCorrect: false },
      { id: 4, text: "Sexy Jutsu", isCorrect: false }
    ],
    categoryId: 1,
    difficulty: 'medium',
    timeLimit: 20,
    active: true,
    createdAt: '2023-11-14T11:45:00Z',
    updatedAt: '2023-11-14T11:45:00Z',
    usageCount: 187
  },
  {
    id: 4,
    text: "Identifiez cet opening de My Hero Academia.",
    type: 'audio',
    mediaUrl: '/audio/questions/mha-opening.mp3',
    options: [
      { id: 1, text: "Peace Sign", isCorrect: true },
      { id: 2, text: "The Day", isCorrect: false },
      { id: 3, text: "Odd Future", isCorrect: false },
      { id: 4, text: "Polaris", isCorrect: false }
    ],
    categoryId: 3,
    difficulty: 'hard',
    timeLimit: 25,
    active: true,
    createdAt: '2023-11-15T16:20:00Z',
    updatedAt: '2023-11-15T16:20:00Z',
    usageCount: 125
  },
  {
    id: 5,
    text: "Qui est l'auteur du manga Death Note?",
    type: 'text',
    options: [
      { id: 1, text: "Masashi Kishimoto", isCorrect: false },
      { id: 2, text: "Tite Kubo", isCorrect: false },
      { id: 3, text: "Tsugumi Ohba", isCorrect: true },
      { id: 4, text: "Eiichiro Oda", isCorrect: false }
    ],
    categoryId: 2,
    difficulty: 'medium',
    timeLimit: 15,
    active: true,
    createdAt: '2023-11-16T10:30:00Z',
    updatedAt: '2023-11-16T10:30:00Z',
    usageCount: 156
  },
  {
    id: 6,
    text: "Dans Demon Slayer, quelle est la technique de respiration utilisée par Tanjiro?",
    type: 'image',
    mediaUrl: '/images/questions/demon-slayer.jpg',
    options: [
      { id: 1, text: "Respiration de l'Eau", isCorrect: false },
      { id: 2, text: "Respiration du Soleil", isCorrect: true },
      { id: 3, text: "Respiration du Tonnerre", isCorrect: false },
      { id: 4, text: "Respiration de la Flamme", isCorrect: false }
    ],
    categoryId: 1,
    difficulty: 'hard',
    timeLimit: 20,
    active: true,
    createdAt: '2023-11-17T13:45:00Z',
    updatedAt: '2023-11-17T13:45:00Z',
    usageCount: 203
  },
  {
    id: 7,
    text: "Quel est le nom du personnage principal dans Fullmetal Alchemist?",
    type: 'text',
    options: [
      { id: 1, text: "Roy Mustang", isCorrect: false },
      { id: 2, text: "Alphonse Elric", isCorrect: false },
      { id: 3, text: "Edward Elric", isCorrect: true },
      { id: 4, text: "Scar", isCorrect: false }
    ],
    categoryId: 1,
    difficulty: 'easy',
    timeLimit: 10,
    active: true,
    createdAt: '2023-11-18T09:20:00Z',
    updatedAt: '2023-11-18T09:20:00Z',
    usageCount: 278
  },
  {
    id: 8,
    text: "Identifiez ce personnage de Jujutsu Kaisen.",
    type: 'image',
    mediaUrl: '/images/questions/jujutsu-kaisen.jpg',
    options: [
      { id: 1, text: "Yuji Itadori", isCorrect: false },
      { id: 2, text: "Megumi Fushiguro", isCorrect: false },
      { id: 3, text: "Nobara Kugisaki", isCorrect: false },
      { id: 4, text: "Satoru Gojo", isCorrect: true }
    ],
    categoryId: 1,
    difficulty: 'medium',
    timeLimit: 15,
    active: false,
    createdAt: '2023-11-19T14:10:00Z',
    updatedAt: '2023-11-19T14:10:00Z',
    usageCount: 0
  },
  {
    id: 9,
    text: "Quelle est la particularité du cahier dans Death Note?",
    type: 'text',
    options: [
      { id: 1, text: "Il permet de voyager dans le temps", isCorrect: false },
      { id: 2, text: "Il rend invisible celui qui le touche", isCorrect: false },
      { id: 3, text: "Il permet de tuer en écrivant un nom", isCorrect: true },
      { id: 4, text: "Il permet de lire dans les pensées", isCorrect: false }
    ],
    categoryId: 2,
    difficulty: 'easy',
    timeLimit: 10,
    active: true,
    createdAt: '2023-11-20T11:30:00Z',
    updatedAt: '2023-11-20T11:30:00Z',
    usageCount: 192
  },
  {
    id: 10,
    text: "Quel est cet ending de Tokyo Ghoul?",
    type: 'audio',
    mediaUrl: '/audio/questions/tokyo-ghoul-ending.mp3',
    options: [
      { id: 1, text: "Unravel", isCorrect: false },
      { id: 2, text: "Asphyxia", isCorrect: false },
      { id: 3, text: "Katharsis", isCorrect: false },
      { id: 4, text: "Glassy Sky", isCorrect: true }
    ],
    categoryId: 3,
    difficulty: 'hard',
    timeLimit: 25,
    active: true,
    createdAt: '2023-11-21T15:45:00Z',
    updatedAt: '2023-11-21T15:45:00Z',
    usageCount: 98
  }
];

// Catégories mockées
export const mockCategories: QuestionCategory[] = [
  {
    id: 1,
    name: 'Shonen Classics',
    description: 'Questions sur les animes et mangas shonen populaires',
    questionCount: 5,
    active: true,
    createdAt: '2023-10-01T10:00:00Z',
    updatedAt: '2023-10-01T10:00:00Z'
  },
  {
    id: 2,
    name: 'Seinen Masterpieces',
    description: 'Questions sur les œuvres seinen pour public mature',
    questionCount: 2,
    active: true,
    createdAt: '2023-10-02T11:30:00Z',
    updatedAt: '2023-10-02T11:30:00Z'
  },
  {
    id: 3,
    name: 'Anime Openings & Endings',
    description: 'Questions sur les musiques d\'animes',
    questionCount: 2,
    active: true,
    createdAt: '2023-10-03T14:15:00Z',
    updatedAt: '2023-10-03T14:15:00Z'
  },
  {
    id: 4,
    name: 'Shojo Romance',
    description: 'Questions sur les animes et mangas shojo romantiques',
    questionCount: 0,
    active: true,
    createdAt: '2023-10-04T09:45:00Z',
    updatedAt: '2023-10-04T09:45:00Z'
  },
  {
    id: 5,
    name: 'Mecha & Sci-Fi',
    description: 'Questions sur les animes et mangas de science-fiction et mecha',
    questionCount: 0,
    active: false,
    createdAt: '2023-10-05T16:20:00Z',
    updatedAt: '2023-10-05T16:20:00Z'
  }
];


export const mockQuestionStats: QuestionStats = {
  totalQuestions: mockQuestions.length,
  totalCategories: mockCategories.length,
  questionsPerType: {
    text: 4,
    image: 3,
    audio: 2,
    video: 1
  },
  questionsPerCategory: {
    1: 5,
    2: 2,
    3: 2,
    4: 0,
    5: 0
  },
  questionsPerDifficulty: {
    easy: 3,
    medium: 4,
    hard: 3
  },
  topUsedQuestions: mockQuestions.sort((a, b) => b.usageCount - a.usageCount).slice(0, 5)
};