import bcrypt from 'bcryptjs';
import { User, UserPublic } from '../models/user';
import { Repository } from '../repositories/repository';

/**
 * Создает хеш пароля
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
}

/**
 * Сравнивает введенный пароль с хешем
 */
export async function comparePasswords(password: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(password, hash);
}

/**
 * Валидирует учетные данные пользователя
 * @returns Данные пользователя или null при ошибке
 */
export async function validateUser(
  repository: Repository,
  username: string,
  password: string
): Promise<UserPublic | null> {
  // Получаем пользователя по имени
  const user = await repository.getUserByUsername(username);

  if (!user) {
    return null;
  }

  // Проверяем пароль
  const isPasswordValid = await comparePasswords(password, user.password);

  if (!isPasswordValid) {
    return null;
  }

  // Преобразуем в публичные данные пользователя
  return {
    id: user.id!,
    username: user.username,
    email: user.email,
    group: user.group,
    avatarUrl: user.avatarUrl
  };
}
