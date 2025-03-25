import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { UserPublic } from '../models/user';

// Секреты для подписи токенов (в реальном приложении должны быть в .env)
const JWT_ACCESS_SECRET = 'access-secret-key-should-be-in-env';
const JWT_REFRESH_SECRET = 'refresh-secret-key-should-be-in-env';

// Время жизни токенов
const ACCESS_TOKEN_EXPIRES_IN = '30m'; // 30 минут
const REFRESH_TOKEN_EXPIRES_IN = '7d'; // 7 дней

// Интерфейс для данных в токене
interface TokenPayload {
  userId: string;
  username: string;
  email: string;
  group: string;
  avatarUrl?: string;
}

/**
 * Генерирует Access JWT токен
 */
export function generateAccessToken(user: UserPublic): string {
  const payload: TokenPayload = {
    userId: user.id,
    username: user.username,
    email: user.email,
    group: user.group,
    avatarUrl: user.avatarUrl
  };

  return jwt.sign(payload, JWT_ACCESS_SECRET, {
    expiresIn: ACCESS_TOKEN_EXPIRES_IN,
    algorithm: 'HS256' // SHA-256
  });
}

/**
 * Генерирует Refresh токен и его хеш
 * @returns [token, tokenHash] - пара из токена и его хеша для хранения в БД
 */
export function generateRefreshToken(userId: string): [string, string] {
  // Генерируем случайный токен
  const token = crypto.randomBytes(40).toString('hex');

  // Создаем хеш токена для хранения в БД
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

  return [token, tokenHash];
}

/**
 * Верифицирует Access токен
 * @returns Данные пользователя при успешной верификации или null при ошибке
 */
export function verifyAccessToken(token: string): UserPublic | null {
  try {
    const decoded = jwt.verify(token, JWT_ACCESS_SECRET) as TokenPayload;

    return {
      id: decoded.userId,
      username: decoded.username,
      email: decoded.email,
      group: decoded.group,
      avatarUrl: decoded.avatarUrl
    };
  } catch (error) {
    return null;
  }
}

/**
 * Верифицирует Refresh токен
 * @param token - сам токен
 * @param storedHash - хеш из БД для сравнения
 * @returns true если токен валиден, false в противном случае
 */
export function verifyRefreshToken(token: string, storedHash: string): boolean {
  const calculatedHash = crypto.createHash('sha256').update(token).digest('hex');
  return calculatedHash === storedHash;
}

/**
 * Вычисляет срок действия Refresh токена
 */
export function getRefreshTokenExpiration(): Date {
  const expirationMs = 7 * 24 * 60 * 60 * 1000; // 7 дней в миллисекундах
  return new Date(Date.now() + expirationMs);
}
