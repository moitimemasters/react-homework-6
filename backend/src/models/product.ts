import { ValidationError } from "../errors/errors";

export interface Product {
  name: String;
  description?: String | null;
  categoryId?: String | null;
  quantity: Number;
  price: Number;
}

export interface UpdateProduct {
  name?: string;
  description?: string;
  categoryId?: string;
  quantity?: number;
  price?: number;
}

export const validateProduct = (obj: object): Product => {
  let violations: Array<string> = [];
  if (!("name" in obj)) {
    violations.push("field `name` is required");
  } else if (typeof obj.name !== "string") {
    violations.push("field `name` should be a string");
  }
  if (!("quantity" in obj)) {
    violations.push("field `quantity` is required");
  } else if (typeof obj.quantity !== "number") {
    violations.push("field `quantity` should be a number");
  }
  if (!("price" in obj)) {
    violations.push("field `price` is required");
  } else if (typeof obj.price !== "number") {
    violations.push("field `price` should be a number");
  }
  if (violations.length != 0) {
    throw new ValidationError("Validation Error", { violations });
  }

  let description = null;
  if ("description" in obj && typeof obj.description === "string") {
    description = obj.description;
  }

  let categoryId = null;

  if ("categoryId" in obj && typeof obj.categoryId === "string") {
    categoryId = obj.categoryId;
  }

  return {
    // @ts-ignore
    name: obj.name as string,
    description: description || "",
    categoryId: categoryId || "",
    // @ts-ignore
    quantitiy: obj.quantity as number,
    // @ts-ignore
    price: obj.price as number,
  };
};
