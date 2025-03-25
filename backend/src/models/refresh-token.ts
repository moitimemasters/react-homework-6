export interface RefreshToken {
  userId: string; // ID пользователя
  token: string; // Хеш токена обновления
  expiresAt: Date; // Срок действия
  createdAt: Date; // Дата создания
}
