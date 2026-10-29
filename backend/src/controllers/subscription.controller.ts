import type { Request, Response } from 'express';
import { subscriptionService } from '../services/subscription.service';
import type {
  CreateSubscriptionInput,
  QuerySubscriptionInput,
  UpcomingQueryInput,
  UpdateSubscriptionInput,
} from '../schemas/subscription.schema';
import { UnauthorizedError } from '../utils/AppError';

const requireUserId = (req: Request): string => {
  if (!req.user) {
    throw new UnauthorizedError();
  }
  return req.user.id;
};

const requireId = (req: Request): string => String(req.params['id']);

export class SubscriptionController {
  async create(req: Request, res: Response): Promise<void> {
    const data = await subscriptionService.create(requireUserId(req), req.body as CreateSubscriptionInput);
    res.status(201).json({ success: true, data });
  }

  async getAll(req: Request, res: Response): Promise<void> {
    const data = await subscriptionService.getAll(
      requireUserId(req),
      req.query as unknown as QuerySubscriptionInput,
    );
    res.status(200).json({ success: true, data });
  }

  async getSummary(req: Request, res: Response): Promise<void> {
    const data = await subscriptionService.getSummary(requireUserId(req));
    res.status(200).json({ success: true, data });
  }

  async getUpcoming(req: Request, res: Response): Promise<void> {
    const { days } = req.query as unknown as UpcomingQueryInput;
    const data = await subscriptionService.getUpcoming(requireUserId(req), days);
    res.status(200).json({ success: true, data });
  }

  async getById(req: Request, res: Response): Promise<void> {
    const data = await subscriptionService.getById(requireUserId(req), requireId(req));
    res.status(200).json({ success: true, data });
  }

  async update(req: Request, res: Response): Promise<void> {
    const data = await subscriptionService.update(
      requireUserId(req),
      requireId(req),
      req.body as UpdateSubscriptionInput,
    );
    res.status(200).json({ success: true, data });
  }

  async delete(req: Request, res: Response): Promise<void> {
    await subscriptionService.delete(requireUserId(req), requireId(req));
    res.status(204).send();
  }
}

export const subscriptionController = new SubscriptionController();
