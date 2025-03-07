import type { Duel, DuelResult } from '../types/duel/duel';

// Mock data pour les duels disponibles
export const mockDuels = {
  duels: [
    {
      id: 1001,
      createdAt: "2023-12-15T09:30:00Z",
      creator: {
        id: 456,
        username: "OnePieceGuru",
        avatar: "/images/avatars/avatar-7.webp",
        level: 12
      },
      category: "Shonen Classics",
      stake: 5000,
      status: "waiting",
      joined: 0
    },
    {
      id: 1002,
      createdAt: "2023-12-15T09:45:00Z",
      creator: {
        id: 789,
        username: "NarutoFan99",
        avatar: "/images/avatars/avatar-2.webp",
        level: 8
      },
      category: "Anime Openings",
      stake: 2000,
      status: "waiting",
      joined: 0
    },
    {
      id: 1003,
      createdAt: "2023-12-15T10:15:00Z",
      creator: {
        id: 342,
        username: "MangaKing",
        avatar: "/images/avatars/avatar-4.webp",
        level: 15
      },
      category: "Seinen Masterpieces",
      stake: 8000,
      status: "waiting",
      joined: 0
    },
    {
      id: 1004,
      createdAt: "2023-12-15T10:30:00Z",
      creator: {
        id: 567,
        username: "AnimeQueen",
        avatar: "/images/avatars/avatar-5.webp",
        level: 10
      },
      category: "Shojo Romance",
      stake: 3000,
      status: "waiting",
      joined: 0
    }
  ],
  pagination: {
    total: 24,
    page: 1,
    limit: 10,
    pages: 3
  }
};

// Mock data pour les détails d'un duel en cours
export const mockDuelInProgress = {
  duelStatus: {
    status: "in_progress",
    players: [
      {
        id: 123,
        username: "MangaKing",
        avatar: "/images/avatars/avatar-3.webp",
        ready: true,
        connected: true,
        score: 3
      },
      {
        id: 456,
        username: "OnePieceGuru",
        avatar: "/images/avatars/avatar-7.webp",
        ready: true,
        connected: true,
        score: 2
      }
    ]
  },
  currentQuestion: {
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
    questionNumber: 6,
    isLastQuestion: false
  }
};

// Mock data pour les résultats d'un duel
export const mockDuelResult: DuelResult = {
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
  duelId: 2001,
  resultsUrl: "/duels/results/2001",
  commission: 1000
};