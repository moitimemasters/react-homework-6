import express, { Request, Response, NextFunction } from "express";
import { container } from "tsyringe";
import { AuthService } from "../services/auth.service";
import { authMiddleware, roleMiddleware } from "../auth/auth.middleware";

/**
 * Роутер для обработки запросов аутентификации
 */
export const authRouter = express.Router();
const authService = container.resolve(AuthService);

// Регистрация нового пользователя
authRouter.post("/register", async (req: Request, res: Response, next: NextFunction) => {
  try {
    await authService.register(req, res);
  } catch (error) {
    next(error);
  }
});

// Аутентификация пользователя
authRouter.post("/login", async (req: Request, res: Response, next: NextFunction) => {
  try {
    await authService.login(req, res);
  } catch (error) {
    next(error);
  }
});

// Выход из системы
authRouter.post("/logout", async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Применяем middleware
    authMiddleware(req, res, (err: any) => {
      if (err) return next(err);

      // Затем выполняем основную логику
      try {
        authService.logout(req, res).catch(next);
      } catch (error) {
        next(error);
      }
    });
  } catch (error) {
    next(error);
  }
});

// Обновление токена
authRouter.post("/refresh-token", async (req: Request, res: Response, next: NextFunction) => {
  try {
    await authService.refreshToken(req, res);
  } catch (error) {
    next(error);
  }
});

// Получение профиля пользователя
authRouter.get("/profile", async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Применяем middleware
    authMiddleware(req, res, (err: any) => {
      if (err) return next(err);

      // Затем выполняем основную логику
      try {
        authService.getProfile(req, res).catch(next);
      } catch (error) {
        next(error);
      }
    });
  } catch (error) {
    next(error);
  }
});

// Получение списка всех пользователей (только для админов)
authRouter.get("/users", async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Применяем middleware
    authMiddleware(req, res, (err: any) => {
      if (err) return next(err);

      // Затем выполняем основную логику
      try {
        authService.getAllUsers(req, res).catch(next);
      } catch (error) {
        next(error);
      }
    });
  } catch (error) {
    next(error);
  }
});

// Обновление группы пользователя (только для админов)
authRouter.put("/users/:id/group", async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Применяем middleware
    authMiddleware(req, res, (err: any) => {
      if (err) return next(err);

      // Затем выполняем основную логику
      try {
        authService.updateUserGroup(req, res).catch(next);
      } catch (error) {
        next(error);
      }
    });
  } catch (error) {
    next(error);
  }
});
