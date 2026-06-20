export interface User {
  id: string;
  email: string;
  name: string;
  image: string | null;
  googleId: string;
  createdAt: Date;
  updatedAt: Date;
}
