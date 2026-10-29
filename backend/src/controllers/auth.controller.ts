import type { Request, Response } from 'express';
import { authService } from '../services/auth.service';
import type { LoginInput, RegisterInput } from '../schemas/auth.schema';

export class AuthController {
  async register(req: Request, res: Response): Promise<void> {
    const result = await authService.register(req.body as RegisterInput);
    res.status(201).json({ success: true, data: result });
  }

  async login(req: Request, res: Response): Promise<void> {
    const result = await authService.login(req.body as LoginInput);
    res.status(200).json({ success: true, data: result });
  }
}

export const authController = new AuthController();
