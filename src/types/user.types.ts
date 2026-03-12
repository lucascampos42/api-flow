export type UserOrderFields = 'createdAt' | 'username' | 'email';
export type PersonOrderFields = 'name' | 'email';
export type SearchUser = {
  username?: {
    contains: string;
    mode: 'insensitive';
  };
};
