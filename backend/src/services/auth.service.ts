import "reflect-metadata";
import { inject, singleton } from "tsyringe";
import { Request, Response } from "express";
import { Repository } from "../repositories/repository";
import { LoginRequest, User, validateLoginRequest, validateUser } from "../models/user";
import { hashPassword, comparePasswords } from "../auth/local.strategy";
import { ValidationError } from "../errors/errors";
import {
  generateAccessToken,
  generateRefreshToken,
  getRefreshTokenExpiration,
  verifyAccessToken,
  verifyRefreshToken
} from "../auth/jwt.strategy";
import { RefreshToken } from "../models/refresh-token";

/**
 * Сервис аутентификации и авторизации
 */
@singleton()
export class AuthService {
  constructor(@inject(Repository) private repository: Repository) {}

  /**
   * Регистрация нового пользователя
   */
  async register(req: Request, res: Response): Promise<void> {
    // Валидируем данные пользователя
    const userData = validateUser(req.body);

    // Хешируем пароль
    const hashedPassword = await hashPassword(userData.password);

    // Создаем пользователя с хешированным паролем
    const userId = await this.repository.createUser({
      ...userData,
      password: hashedPassword
    });

    // Получаем созданного пользователя
    const user = await this.repository.getUserById(userId);

    if (!user) {
      throw new Error('Failed to create user');
    }

    // Генерируем токены
    const accessToken = generateAccessToken({
      id: user.id,
      username: user.username,
      email: user.email,
      group: user.group,
      avatarUrl: user.avatarUrl
    });

    const [refreshToken, refreshTokenHash] = generateRefreshToken(user.id);

    // Сохраняем токен обновления в БД
    await this.repository.saveRefreshToken({
      userId: user.id,
      token: refreshTokenHash,
      expiresAt: getRefreshTokenExpiration(),
      createdAt: new Date()
    });

    // Устанавливаем httpOnly куки
    this.setTokenCookies(res, accessToken, refreshToken);

    // Возвращаем данные пользователя
    res.status(201).json({
      id: user.id,
      username: user.username,
      email: user.email,
      group: user.group,
      avatarUrl: user.avatarUrl
    });
  }

  /**
   * Аутентификация пользователя
   */
  async login(req: Request, res: Response): Promise<void> {
    // Валидируем данные запроса
    const loginData = validateLoginRequest(req.body);

    // Получаем пользователя по имени
    const user = await this.repository.getUserByUsername(loginData.username);

    if (!user) {
      res.status(401).json({ error: 'Invalid username or password' });
      return;
    }

    // Проверяем пароль
    const isPasswordValid = await comparePasswords(loginData.password, user.password);

    if (!isPasswordValid) {
      res.status(401).json({ error: 'Invalid username or password' });
      return;
    }

    // Генерируем токены
    const accessToken = generateAccessToken({
      id: user.id,
      username: user.username,
      email: user.email,
      group: user.group,
      avatarUrl: user.avatarUrl
    });

    const [refreshToken, refreshTokenHash] = generateRefreshToken(user.id);

    // Сохраняем токен обновления в БД
    await this.repository.saveRefreshToken({
      userId: user.id,
      token: refreshTokenHash,
      expiresAt: getRefreshTokenExpiration(),
      createdAt: new Date()
    });

    // Устанавливаем httpOnly куки
    this.setTokenCookies(res, accessToken, refreshToken);

    // Возвращаем данные пользователя
    res.json({
      id: user.id,
      username: user.username,
      email: user.email,
      group: user.group,
      avatarUrl: user.avatarUrl
    });
  }

  /**
   * Выход пользователя
   */
  async logout(req: Request, res: Response): Promise<void> {
    // Получаем refresh токен из куки
    const refreshToken = req.cookies.refreshToken;

    if (refreshToken && req.user) {
      // Удаляем токен из БД
      await this.repository.deleteAllUserRefreshTokens(req.user.id);
    }

    // Очищаем куки
    this.clearTokenCookies(res);

    res.json({ message: 'Successfully logged out' });
  }

  /**
   * Обновление токена доступа
   */
  async refreshToken(req: Request, res: Response): Promise<void> {
    // Получаем refresh токен из куки
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      res.status(401).json({ error: 'Refresh token is required' });
      return;
    }

    // Верифицируем access токен для получения ID пользователя
    const accessToken = req.cookies.accessToken;
    let userId: string | null = null;

    if (accessToken) {
      const userData = verifyAccessToken(accessToken);
      userId = userData?.id || null;
    }

    if (!userId) {
      res.status(401).json({ error: 'Invalid token' });
      return;
    }

    // Ищем токен в БД
    const storedToken = await this.repository.findRefreshToken(userId, refreshToken);

    if (!storedToken) {
      res.status(401).json({ error: 'Invalid refresh token' });
      return;
    }

    // Проверяем срок действия
    if (new Date() > storedToken.expiresAt) {
      await this.repository.deleteRefreshToken(userId, refreshToken);
      res.status(401).json({ error: 'Refresh token expired' });
      return;
    }

    // Получаем данные пользователя
    const user = await this.repository.getUserById(userId);

    if (!user) {
      res.status(401).json({ error: 'User not found' });
      return;
    }

    // Генерируем новые токены
    const newAccessToken = generateAccessToken({
      id: user.id,
      username: user.username,
      email: user.email,
      group: user.group,
      avatarUrl: user.avatarUrl
    });

    const [newRefreshToken, newRefreshTokenHash] = generateRefreshToken(user.id);

    // Сохраняем новый токен обновления в БД
    await this.repository.saveRefreshToken({
      userId: user.id,
      token: newRefreshTokenHash,
      expiresAt: getRefreshTokenExpiration(),
      createdAt: new Date()
    });

    // Устанавливаем новые httpOnly куки
    this.setTokenCookies(res, newAccessToken, newRefreshToken);

    // Возвращаем данные пользователя
    res.json({
      id: user.id,
      username: user.username,
      email: user.email,
      group: user.group,
      avatarUrl: user.avatarUrl
    });
  }

  /**
   * Получение профиля пользователя
   */
  async getProfile(req: Request, res: Response): Promise<void> {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const userId = req.user.id;
    const user = await this.repository.getUserById(userId);

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json({
      id: user.id,
      username: user.username,
      email: user.email,
      group: user.group,
      avatarUrl: user.avatarUrl
    });
  }

  /**
   * Получение списка всех пользователей (только для админов)
   */
  async getAllUsers(req: Request, res: Response): Promise<void> {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    // Проверяем, является ли пользователь администратором
    if (req.user.group !== 'admin') {
      res.status(403).json({ error: 'Forbidden - Insufficient permissions' });
      return;
    }

    try {
      const users = await this.repository.getAllUsers();
      res.json({ users });
    } catch (error) {
      console.error('Error fetching users:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  /**
   * Обновление группы пользователя (только для админов)
   */
  async updateUserGroup(req: Request, res: Response): Promise<void> {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    // Проверяем, является ли пользователь администратором
    if (req.user.group !== 'admin') {
      res.status(403).json({ error: 'Forbidden - Insufficient permissions' });
      return;
    }

    const userId = req.params.id;
    const { group } = req.body;

    // Проверяем валидность группы
    const validGroups = ["admin", "user", "guest"];
    if (!validGroups.includes(group)) {
      res.status(400).json({
        error: 'Validation Error',
        violations: [`group should be one of: ${validGroups.join(", ")}`]
      });
      return;
    }

    try {
      // Не даем администратору понизить свою роль
      if (userId === req.user.id && group !== 'admin') {
        res.status(403).json({ error: 'Cannot change your own admin status' });
        return;
      }

      const updated = await this.repository.updateUser(userId, { group });

      if (!updated) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      // Получаем обновленного пользователя
      const updatedUser = await this.repository.getUserById(userId);

      res.json({
        id: updatedUser!.id,
        username: updatedUser!.username,
        email: updatedUser!.email,
        group: updatedUser!.group,
        avatarUrl: updatedUser!.avatarUrl
      });
    } catch (error) {
      if (error instanceof ValidationError) {
        res.status(400).json({
          error: error.message,
          violations: (error as any).context?.violations
        });
      } else {
        console.error('Error updating user group:', error);
        res.status(500).json({ error: 'Internal Server Error' });
      }
    }
  }

  /**
   * Устанавливает куки с токенами
   */
  private setTokenCookies(res: Response, accessToken: string, refreshToken: string): void {
    // Настройка куки для access token (кратковременный)
    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 30 * 60 * 1000 // 30 минут
    });

    // Настройка куки для refresh token (долговременный)
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 дней
    });
  }

  /**
   * Очищает куки с токенами
   */
  private clearTokenCookies(res: Response): void {
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
  }
}
