import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from './jwt.strategy';
import { Category } from '../models/category';
import { Repository } from '../repositories/repository';
import { container } from 'tsyringe';

// Расширяем интерфейс Request для хранения данных пользователя
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        username: string;
        email: string;
        group: string;
        avatarUrl?: string;
      };
    }
  }
}

/**
 * Middleware для проверки авторизации
 */
export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // Получаем токен из заголовка или из кук
  const authHeader = req.headers.authorization;
  const accessToken = req.cookies?.accessToken;

  if (!authHeader && !accessToken) {
    return res.status(401).json({ error: 'Unauthorized - No token provided' });
  }

  // Используем токен из заголовка или из куки
  let token: string;
  if (authHeader) {
    // Проверяем формат заголовка (Bearer token)
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return res.status(401).json({ error: 'Unauthorized - Invalid token format' });
    }
    token = parts[1];
  } else {
    token = accessToken;
  }

  // Верифицируем токен
  const user = verifyAccessToken(token);
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized - Invalid or expired token' });
  }

  // Добавляем данные пользователя в запрос
  req.user = user;

  next();
};

/**
 * Middleware для проверки роли пользователя
 */
export const roleMiddleware = (allowedGroups: string[]) =>
  (req: Request, res: Response, next: NextFunction) => {
    // Проверяем наличие пользователя
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Проверяем роль пользователя
    if (req.user.group === 'admin' || allowedGroups.includes(req.user.group)) {
      return next();
    }

    // Если роль не подходит, возвращаем ошибку доступа
    return res.status(403).json({ error: 'Forbidden - Insufficient permissions' });
  };

/**
 * Middleware для проверки доступа к категории
 */
export const categoryAccessMiddleware = (req: Request, res: Response, next: NextFunction) => {
  try {
    // Проверяем наличие пользователя
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Админы имеют доступ ко всем категориям
    if (req.user.group === 'admin') {
      return next();
    }

    // Получаем ID категории из параметров запроса
    const categoryId = req.params.id;
    if (!categoryId) {
      return next(); // Нет ID категории, продолжаем (для запросов типа GET /categories)
    }

    // Получаем репозиторий
    const repository = container.resolve(Repository);

    // Асинхронная функция для проверки категории
    const checkCategoryAccess = async () => {
      // Получаем категорию
      const category = await repository.getCategory(categoryId);
      if (!category) {
        return res.status(404).json({ error: 'Category not found' });
      }

      // Проверяем доступ к категории
      if (category.allowedGroups &&
          Array.isArray(category.allowedGroups) &&
          category.allowedGroups.includes(req.user!.group)) {
        return next();
      }

      // Если нет доступа, возвращаем ошибку
      return res.status(403).json({
        error: 'Forbidden - You do not have access to this category'
      });
    };

    // Запускаем проверку и обрабатываем ошибки
    checkCategoryAccess().catch((error) => {
      console.error('Error checking category access:', error);
      return res.status(500).json({ error: 'Internal server error' });
    });

  } catch (error) {
    console.error('Unexpected error in categoryAccessMiddleware:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Middleware для проверки доступа к продукту через его категорию
 */
export const productAccessMiddleware = (req: Request, res: Response, next: NextFunction) => {
  try {
    // Проверяем наличие пользователя
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Админы имеют доступ ко всем продуктам
    if (req.user.group === 'admin') {
      return next();
    }

    // Получаем ID продукта из параметров запроса
    const productId = req.params.id;
    if (!productId) {
      return next(); // Нет ID продукта, продолжаем (для запросов типа GET /products)
    }

    // Получаем репозиторий
    const repository = container.resolve(Repository);

    // Асинхронная функция для проверки доступа к продукту через его категорию
    const checkProductAccess = async () => {
      // Получаем продукт
      const product = await repository.getProduct(productId);
      if (!product) {
        return res.status(404).json({ error: 'Product not found' });
      }

      // Если у продукта нет категории, то доступ разрешен
      if (!product.categoryId) {
        return next();
      }

      // Получаем категорию продукта
      const category = await repository.getCategory(product.categoryId.toString());
      if (!category) {
        // Если категория не найдена, но она указана в продукте, запрещаем доступ
        return res.status(403).json({
          error: 'Forbidden - Unable to determine access to this product'
        });
      }

      // Проверяем доступ к категории
      if (category.allowedGroups &&
          Array.isArray(category.allowedGroups) &&
          category.allowedGroups.includes(req.user!.group)) {
        return next();
      }

      // Если нет доступа, возвращаем ошибку
      return res.status(403).json({
        error: 'Forbidden - You do not have access to this product category'
      });
    };

    // Запускаем проверку и обрабатываем ошибки
    checkProductAccess().catch((error) => {
      console.error('Error checking product access:', error);
      return res.status(500).json({ error: 'Internal server error' });
    });

  } catch (error) {
    console.error('Unexpected error in productAccessMiddleware:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
