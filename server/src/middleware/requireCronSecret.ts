import { Request, Response, NextFunction } from "express";

export const requireCronSecret = (req: Request, res: Response, next: NextFunction): void => {
  const secret = req.headers["x-cron-secret"];
  
  // Use a constant time comparison in a real app, but for simplicity:
  if (!secret || secret !== process.env.CRON_SECRET) {
    res.status(403).json({ error: "Forbidden: Invalid cron secret" });
    return;
  }
  
  next();
};
