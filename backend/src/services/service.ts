import "reflect-metadata";
import { inject, singleton } from "tsyringe";
import { Repository } from "../repositories/repository";
import { Category, validateCategory } from "../models/category";
import { Request, Response } from "express";
import {
  ExceptionHandler,
  NotFoundError,
  ValidationError,
} from "../errors/errors";
import { UpdateProduct, validateProduct } from "../models/product";

/**
* An `injectable`, `singleton` class that encapsulates all the buisness logic from routing.
Thus, routes are left declarative, while all the _"dirty"_ work is done in this class such as:
+ Error handling
+ Calling to repository
+ Extracting request data (params, query, body)
+ Validating incoming requests
*/
@singleton()
export class Service {
  private exceptionHandler: ExceptionHandler = new ExceptionHandler();
  constructor(@inject(Repository) private repository: Repository) {}

  async getCategories(_: Request, res: Response): Promise<void> {
    const categories = await this.repository.getCategories();
    res.send({ categories: categories });
  }

  async addCategory(req: Request, res: Response): Promise<void> {
    const category = validateCategory(req.body);
    const insertedId = await this.repository.insertCategory(category);
    res.send({ id: insertedId });
  }

  async getCategory(req: Request, res: Response): Promise<void> {
    const id = req.params["id"];
    const category = await this.repository.getCategory(id);
    if (category == null) {
      throw new NotFoundError("Not found error", {
        detail: `Category with id=${id} is not found.`,
      });
    }
    res.send({ category });
  }

  async updateCategory(req: Request, res: Response): Promise<void> {
    const id = req.params.id;

    // Проверяем и извлекаем все возможные поля для обновления
    const updateData: Partial<Category> = {};

    if (req.body.name !== undefined) {
      if (typeof req.body.name !== "string") {
        throw new ValidationError("Validation Error", {
          violations: ["Field `name` should be a string"],
        });
      }
      updateData.name = req.body.name;
    }

    if (req.body.description !== undefined) {
      if (req.body.description !== null && typeof req.body.description !== "string") {
        throw new ValidationError("Validation Error", {
          violations: ["Field `description` should be a string or null"],
        });
      }
      updateData.description = req.body.description;
    }

    if (req.body.allowedGroups !== undefined) {
      if (!Array.isArray(req.body.allowedGroups)) {
        throw new ValidationError("Validation Error", {
          violations: ["Field `allowedGroups` should be an array"],
        });
      }

      // Проверяем, что все элементы массива являются строками
      if (req.body.allowedGroups.some((g: any) => typeof g !== "string")) {
        throw new ValidationError("Validation Error", {
          violations: ["All items in `allowedGroups` should be strings"],
        });
      }

      // Создаем новый массив, добавляя "admin", если его нет
      const allowedGroups = [...req.body.allowedGroups];
      if (!allowedGroups.includes("admin")) {
        allowedGroups.push("admin");
      }

      updateData.allowedGroups = allowedGroups;
    }

    // Проверяем, есть ли данные для обновления
    if (Object.keys(updateData).length === 0) {
      throw new ValidationError("Validation Error", {
        violations: ["No valid fields provided for update"],
      });
    }

    const updated = await this.repository.updateCategory(id, updateData);
    if (!updated) {
      throw new NotFoundError("Not found error", {
        detail: `Category with id=${id} is not found and therefore was not updated.`,
      });
    }
    res.send({ updated });
  }

  async deleteCategory(req: Request, res: Response): Promise<void> {
    const id = req.params.id;
    const deleted = await this.repository.deleteCategory(id);
    if (!deleted) {
      throw new NotFoundError("Not found error", {
        detail: `Category with id=${id} is not found and therefore was not deleted.`,
      });
    }
    res.send({ deleted });
  }

  async getProducts(req: Request, res: Response): Promise<void> {
    let limit = (req.query.limit && Number(req.query.limit)) || null;
    let offset = (req.query.offset && Number(req.query.offset)) || null;
    const products = await this.repository.getProducts(limit, offset);
    res.send({ products });
  }

  async addProduct(req: Request, res: Response): Promise<void> {
    const body = validateProduct(req.body);
    const id = await this.repository.insertProduct(body);
    res.send({ id });
  }

  async updateProduct(req: Request, res: Response): Promise<void> {
    const id = req.params.id;
    const body = req.body;
    let updates: UpdateProduct = {};

    const fields: Array<[keyof UpdateProduct, string]> = [
      ["name", "string"],
      ["description", "string"],
      ["categoryId", "string"],
      ["quantity", "number"],
      ["price", "number"],
    ];

    for (let i in fields) {
      let [field, type] = fields[i];
      if (field in body && typeof body[field] === type) {
        updates[field] = body[field];
      }
    }

    let updated = await this.repository.updateProduct(id, updates);
    if (!updated) {
      throw new NotFoundError("Not found error", {
        detail: `Product with id=${id} is not found and therefore was not updated.`,
      });
    }
    res.send({ updated });
  }

  async deleteProduct(req: Request, res: Response): Promise<void> {
    const id = req.params.id;

    let deleted = await this.repository.deleteProduct(id);
    if (!deleted) {
      throw new NotFoundError("Not found error", {
        detail: `Product with id=${id} is not found and therefore was not deleted.`,
      });
    }
    res.send({ deleted });
  }

  async getProduct(req: Request, res: Response): Promise<void> {
    const id = req.params.id;

    let product = await this.repository.getProduct(id);
    if (!product) {
      throw new NotFoundError("Not found error", {
        detail: `Product with id=${id} was not found.`,
      });
    }
    res.send({ product });
  }
}
