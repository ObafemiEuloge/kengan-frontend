/**
 * Type représentant le format de token JWT retourné par Django Rest Framework avec Simple JWT
 */
export interface Token {
  // Format backend
  access?: string;
  refresh?: string;
  
  // Format frontend
  accessToken?: string;
  refreshToken?: string;
  expiresIn?: number;
  tokenType?: string;
}

export interface DecodedToken {
  userId: number;
  username: string;
  email: string;
  role: string;
  iat: number;
  exp: number;
}