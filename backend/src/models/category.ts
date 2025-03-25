import { ValidationError } from "../errors/errors";

export interface Category {
  name: String;
  description?: String | null;
  allowedGroups: string[]; // Группы пользователей, которым разрешен доступ
}

export const validateCategory = (obj: object): Category => {
  if ("name" in obj) {
    if (typeof obj.name !== "string") {
      throw new ValidationError("Validation Error", {
        violations: ["field `name` should be string"],
      });
    }
    let name = obj.name as String;
    let description = null;
    if ("description" in obj) {
      if (typeof obj.description !== "string") {
        throw new ValidationError("Validation Error", {
          violations: ["field `description` should be string"],
        });
      }
      description = obj.description;
    }

    // Проверка и обработка allowedGroups
    let allowedGroups: string[] = ["admin"]; // По умолчанию только админы
    if ("allowedGroups" in obj) {
      if (!Array.isArray(obj.allowedGroups)) {
        throw new ValidationError("Validation Error", {
          violations: ["field `allowedGroups` should be an array"],
        });
      }

      const groups = obj.allowedGroups as any[];
      // Проверим что все элементы - строки
      if (groups.some(g => typeof g !== "string")) {
        throw new ValidationError("Validation Error", {
          violations: ["All items in `allowedGroups` should be strings"],
        });
      }

      allowedGroups = groups as string[];

      // Всегда добавляем admin в список разрешенных групп
      if (!allowedGroups.includes("admin")) {
        allowedGroups.push("admin");
      }
    }

    return { name, description, allowedGroups };
  } else {
    throw new ValidationError("Validation Error", {
      violations: ["field `name` is required"],
    });
  }
};
