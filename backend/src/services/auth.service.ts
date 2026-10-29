import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Prisma } from '@prisma/client';
import { prisma } from '../config/prisma';
import { env } from '../config/env';
import type { LoginInput, RegisterInput } from '../schemas/auth.schema';
import type { AuthResult, AuthTokenPayload, PublicUser } from '../types/auth.types';
import { ConflictError, UnauthorizedError } from '../utils/AppError';

const BCRYPT_ROUNDS = 12;
// Valid hash used to equalize timing when the email is unknown.
const DUMMY_HASH = bcrypt.hashSync('subradar-timing-equalizer', BCRYPT_ROUNDS);

const publicUserSelect = {
  id: true,
  email: true,
  name: true,
  createdAt: true,
} satisfies Prisma.UserSelect;

export class AuthService {
  async register(input: RegisterInput): Promise<AuthResult> {
    const passwordHash = await bcrypt.hash(input.password, BCRYPT_ROUNDS);

    try {
      const user = await prisma.user.create({
        data: { email: input.email, name: input.name, passwordHash },
        select: publicUserSelect,
      });
      return { user, token: this.signToken(user) };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ConflictError('Email is already registered');
      }
      throw error;
    }
  }

  async login(input: LoginInput): Promise<AuthResult> {
    const record = await prisma.user.findUnique({ where: { email: input.email } });
    const isValid = await bcrypt.compare(input.password, record?.passwordHash ?? DUMMY_HASH);

    if (!record || !isValid) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const user: PublicUser = {
      id: record.id,
      email: record.email,
      name: record.name,
      createdAt: record.createdAt,
    };
    return { user, token: this.signToken(user) };
  }

  private signToken(user: Pick<PublicUser, 'id' | 'email'>): string {
    const payload: AuthTokenPayload = { sub: user.id, email: user.email };
    return jwt.sign(payload, env.JWT_SECRET, {
      expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'],
    });
  }
}

export const authService = new AuthService();
