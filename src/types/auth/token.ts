export interface Token {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
    tokenType: string;
  }
  
  export interface DecodedToken {
    userId: number;
    username: string;
    email: string;
    role: string;
    iat: number;
    exp: number;
  }