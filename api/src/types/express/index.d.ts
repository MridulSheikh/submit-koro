import { TRole } from "../../modules/user/user.type";

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        name: string;
        role: TRole | null;
        emailVerified: boolean;
      };
    }
  }
}

export {};
