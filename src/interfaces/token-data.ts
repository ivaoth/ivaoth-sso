export interface TokenData {
  access_token: string;
  token_type: 'Bot' | 'Bearer';
  expires_in: number;
  refresh_token: string;
  scope: string;
}
