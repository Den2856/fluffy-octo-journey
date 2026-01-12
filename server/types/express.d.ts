import "express";

declare global {
  namespace Express {
    interface User {
      _id: any;
      role?: string;
      email?: string;
      name?: string;
    }

    interface Request {
      user?: User;
    }
  }
}

export {};
