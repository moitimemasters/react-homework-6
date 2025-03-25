import "reflect-metadata";
import express, { Router, Request, Response, NextFunction } from "express";
import { container } from "tsyringe";
import { Service } from "../services/service";
import { handleErrorAsync } from "../lifespan";
import { authMiddleware, categoryAccessMiddleware, roleMiddleware, productAccessMiddleware } from "../auth/auth.middleware";
import { Repository } from "../repositories/repository";

// Создаем router
const router: Router = express.Router();
const service: Service = container.resolve(Service);

// Получение всех продуктов
router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    await service.getProducts(req, res);
  } catch (error) {
    next(error);
  }
});

// Получение продукта по ID
router.get("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Применяем middleware
    authMiddleware(req, res, (err: any) => {
      if (err) return next(err);

      try {
        service.getProduct(req, res);
      } catch (error) {
        next(error);
      }
    });
  } catch (error) {
    next(error);
  }
});

// Создание нового продукта
router.post("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Применяем middleware
    authMiddleware(req, res, (err: any) => {
      if (err) return next(err);

      // Получаем ID категории из тела запроса
      const categoryId = req.body.categoryId;

      // Если категория не указана, проверяем только роль администратора
      if (!categoryId) {
        if (req.user?.group !== 'admin') {
          return res.status(403).json({ error: 'Forbidden - Only administrators can create products without a category' });
        }

        // Продолжаем с созданием продукта
        try {
          service.addProduct(req, res);
        } catch (error) {
          next(error);
        }
        return;
      }

      // Если категория указана, проверяем доступ к ней
      const repository = container.resolve(Repository);

      // Асинхронная функция для проверки доступа к категории
      const checkCategoryAccess = async () => {
        // Получаем категорию
        const category = await repository.getCategory(categoryId);
        if (!category) {
          return res.status(404).json({ error: 'Category not found' });
        }

        // Админы всегда имеют доступ
        if (req.user?.group === 'admin') {
          try {
            service.addProduct(req, res);
          } catch (error) {
            next(error);
          }
          return;
        }

        // Проверяем доступ к категории
        if (category.allowedGroups &&
            Array.isArray(category.allowedGroups) &&
            category.allowedGroups.includes(req.user!.group)) {
          try {
            service.addProduct(req, res);
          } catch (error) {
            next(error);
          }
          return;
        }

        // Если нет доступа, возвращаем ошибку
        return res.status(403).json({
          error: 'Forbidden - You do not have access to this category'
        });
      };

      // Запускаем проверку и обрабатываем ошибки
      checkCategoryAccess().catch((error) => {
        console.error('Error checking category access for product creation:', error);
        return res.status(500).json({ error: 'Internal server error' });
      });
    });
  } catch (error) {
    next(error);
  }
});

// Обновление продукта
router.put("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Применяем middleware
    authMiddleware(req, res, (err: any) => {
      if (err) return next(err);

      // Проверяем доступ к продукту
      productAccessMiddleware(req, res, (err: any) => {
        if (err) return next(err);

        // Выполняем основную логику
        try {
          service.updateProduct(req, res);
        } catch (error) {
          next(error);
        }
      });
    });
  } catch (error) {
    next(error);
  }
});

// Удаление продукта
router.delete("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Применяем middleware
    authMiddleware(req, res, (err: any) => {
      if (err) return next(err);

      // Проверяем доступ к продукту
      productAccessMiddleware(req, res, (err: any) => {
        if (err) return next(err);

        // Выполняем основную логику
        try {
          service.deleteProduct(req, res);
        } catch (error) {
          next(error);
        }
      });
    });
  } catch (error) {
    next(error);
  }
});

export default router;
