import express, { Request, Response, NextFunction, Router } from "express";
import morgan from "morgan";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import cors from "cors";
import categoryRoutes from "./routers/category";
import productRoutes from "./routers/product";
import { authRouter } from "./routers/auth.router";
import "reflect-metadata";
import {
  ExceptionHandler,
  NotFoundError,
  ValidationError,
} from "./errors/errors";

const app = express();
const apiRouter = Router();

const exceptionHandler = new ExceptionHandler();
exceptionHandler.register(NotFoundError, NotFoundError.getHandler());
exceptionHandler.register(ValidationError, ValidationError.getHandler());

// Middleware для добавления искусственной задержки в ответы API
const delayMiddleware = (req: Request, res: Response, next: NextFunction) => {
  console.log(`[Delay] Adding 300ms delay to ${req.method} ${req.originalUrl}`);
  // Уменьшаем задержку до 300 мс
  setTimeout(() => {
    console.log(`[Delay] Completed delay for ${req.method} ${req.originalUrl}`);
    next();
  }, 300);
};

// Настройка CORS
const corsOptions = {
  origin: ['http://localhost', 'http://localhost:80', 'http://localhost:5173'],
  credentials: true, // Разрешаем передачу куки
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use(cookieParser()); // Для работы с куки
app.use(morgan("short"));

// Применяем задержку ко всем API запросам
apiRouter.use(delayMiddleware);

// Маршруты аутентификации внутри apiRouter
apiRouter.use("/auth/", authRouter);

// Маршруты категорий и продуктов
apiRouter.use("/categories/", categoryRoutes);
apiRouter.use("/products/", productRoutes);
app.use("/api/", apiRouter);

// Логируем, что маршруты зарегистрированы
console.log('[Routes] API routes registered, including auth routes');

// Обработка ошибок
app.use((err: Error, req: Request, res: Response, next: NextFunction) =>
  exceptionHandler.withExcepionHandler(err, req, res, next),
);

export default app;
