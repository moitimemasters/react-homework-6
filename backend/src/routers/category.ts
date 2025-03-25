import "reflect-metadata";
import express, { Router, Request, Response, NextFunction } from "express";
import { container } from "tsyringe";
import { Service } from "../services/service";
import { handleErrorAsync } from "../lifespan";
import { authMiddleware, categoryAccessMiddleware, roleMiddleware } from "../auth/auth.middleware";

// Создаем router
const router: Router = express.Router();
const service: Service = container.resolve(Service);

// Получение всех категорий
router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    await service.getCategories(req, res);
  } catch (error) {
    next(error);
  }
});

// Получение категории по ID
router.get("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Применяем middleware
    authMiddleware(req, res, (err: any) => {
      if (err) return next(err);

      categoryAccessMiddleware(req, res, async (err: any) => {
        if (err) return next(err);

        try {
          await service.getCategory(req, res);
        } catch (error) {
          next(error);
        }
      });
    });
  } catch (error) {
    next(error);
  }
});

// Создание новой категории
router.post("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Применяем middleware
    authMiddleware(req, res, (err: any) => {
      if (err) return next(err);

      // Проверяем роль
      if (req.user?.group !== 'admin') {
        return res.status(403).json({ error: 'Forbidden - Insufficient permissions' });
      }

      // Выполняем основную логику
      try {
        service.addCategory(req, res);
      } catch (error) {
        next(error);
      }
    });
  } catch (error) {
    next(error);
  }
});

// Удаление категории
router.delete("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Применяем middleware
    authMiddleware(req, res, (err: any) => {
      if (err) return next(err);

      // Проверяем роль
      if (req.user?.group !== 'admin') {
        return res.status(403).json({ error: 'Forbidden - Insufficient permissions' });
      }

      // Выполняем основную логику
      try {
        service.deleteCategory(req, res);
      } catch (error) {
        next(error);
      }
    });
  } catch (error) {
    next(error);
  }
});

// Обновление категории
router.put("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Применяем middleware
    authMiddleware(req, res, (err: any) => {
      if (err) return next(err);

      // Проверяем доступ к категории
      categoryAccessMiddleware(req, res, (err: any) => {
        if (err) return next(err);

        // Выполняем основную логику
        try {
          service.updateCategory(req, res);
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
