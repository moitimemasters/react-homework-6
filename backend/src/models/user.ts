import { ValidationError } from "../errors/errors";

export interface User {
  username: string;
  email: string;
  password: string; // хеш пароля
  group: string; // 'admin', 'user', etc.
  avatarUrl?: string;
}

export interface UserPublic {
  id: string;
  username: string;
  email: string;
  group: string;
  avatarUrl?: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export const validateUser = (obj: object): User => {
  const violations: string[] = [];

  if (!("username" in obj)) {
    violations.push("field `username` is required");
  } else if (typeof (obj as any).username !== "string") {
    violations.push("field `username` should be a string");
  } else if ((obj as any).username.length < 3) {
    violations.push("field `username` should be at least 3 characters");
  }

  if (!("email" in obj)) {
    violations.push("field `email` is required");
  } else if (typeof (obj as any).email !== "string") {
    violations.push("field `email` should be a string");
  } else {
    // Простая проверка формата email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test((obj as any).email)) {
      violations.push("field `email` should be a valid email address");
    }
  }

  if (!("password" in obj)) {
    violations.push("field `password` is required");
  } else if (typeof (obj as any).password !== "string") {
    violations.push("field `password` should be a string");
  } else if ((obj as any).password.length < 6) {
    violations.push("field `password` should be at least 6 characters");
  }

  if (!("group" in obj)) {
    violations.push("field `group` is required");
  } else if (typeof (obj as any).group !== "string") {
    violations.push("field `group` should be a string");
  } else {
    const validGroups = ["admin", "user", "guest"];
    if (!validGroups.includes((obj as any).group)) {
      violations.push(`field \`group\` should be one of: ${validGroups.join(", ")}`);
    }
  }

  if ("avatarUrl" in obj && typeof (obj as any).avatarUrl !== "string") {
    violations.push("field `avatarUrl` should be a string");
  }

  if (violations.length > 0) {
    throw new ValidationError("Validation Error", { violations });
  }

  return {
    username: (obj as any).username as string,
    email: (obj as any).email as string,
    password: (obj as any).password as string,
    group: (obj as any).group as string,
    avatarUrl: "avatarUrl" in obj ? (obj as any).avatarUrl as string : undefined
  };
};

export const validateLoginRequest = (obj: object): LoginRequest => {
  const violations: string[] = [];

  if (!("username" in obj)) {
    violations.push("field `username` is required");
  } else if (typeof (obj as any).username !== "string") {
    violations.push("field `username` should be a string");
  }

  if (!("password" in obj)) {
    violations.push("field `password` is required");
  } else if (typeof (obj as any).password !== "string") {
    violations.push("field `password` should be a string");
  }

  if (violations.length > 0) {
    throw new ValidationError("Validation Error", { violations });
  }

  return {
    username: (obj as any).username as string,
    password: (obj as any).password as string
  };
};
