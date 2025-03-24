# JWT Авторизация

Проект демонстрирует реализацию авторизации с использованием JWT-токенов для защиты API и управления доступом пользователей к ресурсам.

## Запуск проекта

Для запуска проекта выполните следующие шаги:

1. Убедитесь, что у вас установлен Docker и Docker Compose
2. Склонируйте репозиторий
3. Запустите контейнеры:

```bash
docker-compose build
docker-compose up -d
```

4. Приложение будет доступно по адресу: http://localhost

## Учетные записи для тестирования

В системе доступны следующие пользователи:

| Логин     | Пароль | Роль         |
|-----------|--------|--------------|
| admin     | admin  | Администратор|
| user      | user   | Пользователь |

## Основные функции

### Панель администратора

Администраторы могут управлять пользователями и назначать доступ к категориям:

1. Управление пользователями:
   - Просмотр списка пользователей
   - Изменение роли пользователя (администратор/пользователь)

2. Управление доступом к категориям:
   - Настройка доступа групп пользователей к категориям
   - Администраторы имеют доступ ко всем категориям

### Управление категориями и товарами

- Пользователи с ролью "Администратор" имеют полный доступ ко всем категориям и товарам.
- Обычные пользователи могут просматривать, добавлять, редактировать и удалять категории и товары, к которым у них есть доступ.
- Доступ к категориям настраивается в панели администратора.

## Реализация аутентификации и авторизации

### Стратегии авторизации
- Реализована генерация JWT Access токенов с использованием алгоритма SHA-256
- Access токен хранит информацию о пользователе (имя, email, группа, аватар)
- Refresh токены генерируются случайно и хранятся в виде хешей в базе данных
- Оба токена передаются в httpOnly куках для безопасности

### Авторизация и выход
- Путь `/login` выдает Access и Refresh токены после успешной авторизации
- Путь `/logout` удаляет Refresh токен из базы данных и очищает куки

### Защита CRUD-операций
- Все операции с товарами и категориями защищены JWT
- Реализована проверка прав доступа к ресурсам
- Доступ к API определяется группой пользователя

### Интеграция с React
- Приложение автоматически обрабатывает токены авторизации
- Реализована проверка доступа к ресурсам на клиенте
- Автоматическое обновление токенов

### Дополнительные улучшения
- Визуальные уведомления о статусе операций
- Управление доступом к категориям через удобный интерфейс
- Подробное логирование и обработка ошибок

## Структура проекта

- `/backend` - API на Express.js с реализацией JWT-авторизации
- `/frontend` - Клиентское приложение на React
- `/mongo` - База данных MongoDB
- Используется Caddy в качестве прокси-сервера

## Технические детали

### Токены и безопасность
- Access токен: время жизни 30 минут
- Refresh токен: время жизни 7 дней, хранится в базе данных
- Используются httpOnly куки для защиты от XSS-атак
- Проверка групп пользователей для доступа к ресурсам
