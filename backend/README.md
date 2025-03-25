## REST API для работы с товарами и категориями

### Запуск приложения локально:

_Linux/MacOs_:
```bash
export MONGO_URL= # URL (с кредами, если они есть) до монго: mongodb//localhost:27017/
npm i
npm run start
```

_Windows_
```cmd
set MONGO_URL= # URL (с кредами, если они есть) до монго: mongodb//localhost:27017/
npm i
npm run start
```

### Запуск приложения в Docker Compose

```bash
docker compose build
docker compose up
```

__На некоторых системах команда может отличаться - `docker-compose`__

После запуска контейнеров поднимутся три приложения:
+ MongoDB на порте 27017
+ MongoExpress на порте 8888 - UI для MongoDB (логин: `admin`, пароль: `pass`)
+ Backend на порте 3000 - реализуемый REST API сервер на express.js


## Тестирование приложения

### Категории

Создание категории:
```bash
➜  react-homework-5 git:(main) ✗ curl localhost:3000/api/categories/ --json '{"name": "Category 3", "description": "This is a category"}' -s | jq
{
  "id": "67bbc415902be1db597c160d"
}
```

Чтение категории:
```bash
➜  react-homework-5 git:(main) ✗ curl localhost:3000/api/categories/67bbc415902be1db597c160d -s | jq
{
  "category": {
    "_id": "67bbc415902be1db597c160d",
    "name": "Category 3",
    "description": "This is a category"
  }
}
```

Получение всех категорий:
```bash
➜  react-homework-5 git:(main) ✗ curl localhost:3000/api/categories -s | jq
{
  "categories": [
    {
      "_id": "67bbc3d3902be1db597c160b",
      "name": "Category",
      "description": null
    },
    {
      "_id": "67bbc3f6902be1db597c160c",
      "name": "Category 2",
      "description": null
    },
    {
      "_id": "67bbc415902be1db597c160d",
      "name": "Category 3",
      "description": "This is a category"
    }
  ]
}
```

Обновление категории:
```bash
➜  react-homework-5 git:(main) ✗ curl -X PUT localhost:3000/api/categories/67bbc415902be1db597c160d --json '{"name": "Category Three"}' -s | jq
{
  "updated": true
}
➜  react-homework-5 git:(main) ✗ curl localhost:3000/api/categories/67bbc415902be1db597c160d -s | jq
{
  "category": {
    "_id": "67bbc415902be1db597c160d",
    "name": "Category Three",
    "description": "This is a category"
  }
}
```

Удаление категории:
```bash
➜  react-homework-5 git:(main) ✗ curl -X DELETE localhost:3000/api/categories/67bbc3f6902be1db597c160c -s | jq
{
  "deleted": true
}
➜  react-homework-5 git:(main) ✗ curl localhost:3000/api/categories -s | jq
{
  "categories": [
    {
      "_id": "67bbc3d3902be1db597c160b",
      "name": "Category",
      "description": null
    },
    {
      "_id": "67bbc415902be1db597c160d",
      "name": "Category Three",
      "description": "This is a category"
    }
  ]
}
```

Запрос на несуществующую категорию:
```bash
➜  react-homework-5 git:(main) ✗ curl localhost:3000/api/categories/67bbc3f6902be1db597c160c -s -w "%{response_code}"| jq
{
  "context": {
    "detail": "Category with id=67bbc3f6902be1db597c160c is not found."
  }
}
404
```

Невалидный запрос на создание категории:
```bash
➜  react-homework-5 git:(main) ✗ curl localhost:3000/api/categories -s -w "%{response_code}" --json '{"name": "some category", "description": 0}' | jq
{
  "context": {
    "violations": [
      "field `description` should be string"
    ]
  }
}
422
```

### Продукты

Создание невалидного продукта
```bash
➜  react-homework-5 git:(main) ✗ curl localhost:3000/api/products -s -w "%{response_code}" --json '{}' | jq
{
  "context": {
    "violations": [
      "field `name` is required",
      "field `quantity` is required",
      "field `price` is required"
    ]
  }
}
422
```

Создание валидного продукта:
```bash
➜  react-homework-5 git:(main) ✗ curl localhost:3000/api/products -s --json '{"name": "First Product", "description": "This is a first product", "categoryId": "67bbc415902be1db597c160d", "quantity": 10, "price": 100}' | jq
{
  "id": "67bbc771902be1db597c160e"
}
➜  react-homework-5 git:(main) ✗ curl localhost:3000/api/products -s --json '{"name": "Second Product", "quantity": 2, "price": 50}' | jq
{
  "id": "67bbc7b9902be1db597c160f"
}
```

Получение всех продуктов:
```bash
➜  react-homework-5 git:(main) ✗ curl localhost:3000/api/products -s | jq
{
  "products": [
    {
      "_id": "67bbc771902be1db597c160e",
      "name": "First Product",
      "description": "This is a first product",
      "categoryId": "67bbc415902be1db597c160d",
      "quantitiy": 10,
      "price": 100
    },
    {
      "_id": "67bbc7b9902be1db597c160f",
      "name": "Second Product",
      "description": "",
      "categoryId": "",
      "quantitiy": 2,
      "price": 50
    }
  ]
}
```

Получение продуктов с пагинацией:
```bash
➜  react-homework-5 git:(main) ✗ curl "localhost:3000/api/products?limit=1&offset=0" -s | jq
{
  "products": [
    {
      "_id": "67bbc771902be1db597c160e",
      "name": "First Product",
      "description": "This is a first product",
      "categoryId": "67bbc415902be1db597c160d",
      "quantitiy": 10,
      "price": 100
    }
  ]
}
➜  react-homework-5 git:(main) ✗ curl "localhost:3000/api/products?limit=1&offset=1" -s | jq
{
  "products": [
    {
      "_id": "67bbc7b9902be1db597c160f",
      "name": "Second Product",
      "description": "",
      "categoryId": "",
      "quantitiy": 2,
      "price": 50
    }
  ]
}
```

Обновление (и чтение) продукта:
```bash
➜  react-homework-5 git:(main) ✗ curl -X PUT localhost:3000/api/products/67bbc7b9902be1db597c160f --json '{"description": "This is a second product", "categoryId": "67bbc415902be1db597c160d"}' -s | jq
{
  "updated": true
}
➜  react-homework-5 git:(main) ✗ curl localhost:3000/api/products/67bbc7b9902be1db597c160f  -s | jq
{
  "product": {
    "_id": "67bbc7b9902be1db597c160f",
    "name": "Second Product",
    "description": "This is a second product",
    "categoryId": "67bbc415902be1db597c160d",
    "quantitiy": 2,
    "price": 50
  }
}
```

Удаление несуществующего продукта:
```bash
➜  react-homework-5 git:(main) ✗ curl localhost:3000/api/products/someid -s -X DELETE -w "%{response_code}" | jq
{
  "context": {
    "context": "Cannot interpret id=someid as an id of object in Mongo"
  }
}
422
➜  react-homework-5 git:(main) ✗ curl localhost:3000/api/products/67bbc3d3902be1db597c160b -s -X DELETE -w "%{response_code}" | jq
{
  "context": {
    "detail": "Product with id=67bbc3d3902be1db597c160b is not found and therefore was not deleted."
  }
}
404
```

Удаление существующего продукта:
```bash
➜  react-homework-5 git:(main) ✗ curl localhost:3000/api/products/67bbc7b9902be1db597c160f -s -X DELETE | jq
{
  "deleted": true
}
➜  react-homework-5 git:(main) ✗ curl localhost:3000/api/products/ -s | jq
{
  "products": [
    {
      "_id": "67bbc771902be1db597c160e",
      "name": "First Product",
      "description": "This is a first product",
      "categoryId": "67bbc415902be1db597c160d",
      "quantitiy": 10,
      "price": 100
    }
  ]
```
