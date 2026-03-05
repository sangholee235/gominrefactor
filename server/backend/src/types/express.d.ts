declare global {
  namespace Express {
    interface AuthUser {
      id: number;
      provider: string;
    }

    // eslint-disable-next-line @typescript-eslint/no-empty-interface
    interface Request {
      user?: AuthUser;
    }
  }
}

export {};
