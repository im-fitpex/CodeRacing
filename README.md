# CodeRacing - Платформа рекомендаций мобильных приложений

Полнофункциональная платформа для открытия, поиска и получения рекомендаций мобильных приложений с интеграцией семантического поиска и визуализацией графа рекомендаций.

## 📋 Требования

- **Java**: JDK 11+
- **Node.js**: 16+ (с npm)
- **Python**: 3.8+
- **ClickHouse**: 23.8.16.16+
- **ОС**: Windows, macOS, Linux

## 🚀 Быстрый старт

### 1. Клонирование репозитория

```bash
git clone https://github.com/im-fitpex/CodeRacing.git
cd CodeRacing
```

### 2. Установка и запуск ClickHouse

#### На Windows (с Docker):
```bash
docker run -d --name clickhouse -p 8123:8123 -p 9000:9000 clickhouse/clickhouse-server:23.8.16.16
```

#### Или установка нативно:
- Скачайте с https://clickhouse.com/docs/en/install
- Следуйте инструкциям установки

### 3. Инициализация базы данных

#### Подключение к ClickHouse:
```bash
# Через Docker
docker exec -it clickhouse clickhouse-client

# Или нативно (если установлено локально)
clickhouse-client
```

#### Выполнение SQL-скриптов:
```sql
-- Выполните содержимое файла backend/src/main/resources/database/shema.sql
-- Затем backend/src/main/resources/database/data.sql
-- И backend/src/main/resources/database/videos.sql
```

**Или автоматически (при запуске backend):**
- Backend автоматически инициализирует таблицы при первом запуске (если использует Liquibase/Flyway)

---

## 🔧 Backend Setup

### Зависимости:
- Spring Boot 3.2
- JDBC для ClickHouse
- Maven 3.8+

### Установка и запуск:

```bash
cd backend

# Windows
mvnw.cmd clean install
mvnw.cmd spring-boot:run

# Linux/macOS
./mvnw clean install
./mvnw spring-boot:run
```

**Backend запустится на**: `http://localhost:8080`

### Конфигурация:

Отредактируйте `backend/src/main/resources/application.properties`:

```properties
# ClickHouse Connection
spring.datasource.url=jdbc:ch://localhost:8123/rustore
spring.datasource.username=default
spring.datasource.password=
spring.datasource.driver-class-name=com.clickhouse.jdbc.ClickHouseDriver

# Server Port
server.port=8080

# CORS
spring.web.cors.allowed-origins=http://localhost:5174
```

### API Endpoints:

| Метод | Endpoint | Описание |
|-------|----------|---------|
| GET | `/api/apps` | Список всех приложений |
| GET | `/api/apps/{id}` | Детали приложения |
| GET | `/api/categories` | Список категорий |
| GET | `/api/apps/category/{id}` | Приложения по категориям |
| GET | `/api/apps/popular` | Популярные приложения |
| GET | `/api/apps/editor-choice` | Выбор редактора |
| GET | `/api/apps/new` | Новые приложения |
| GET | `/api/video-feed` | Лента видео (TikTok-style) |
| POST | `/api/video-feed/{id}/like` | Лайк видео |
| POST | `/api/video-feed/{id}/view` | Просмотр видео |

---

## 🎨 Frontend Setup

### Зависимости:
- React 18+
- Vite
- Framer Motion (анимации)
- react-icons
- react-force-graph-2d (для паутины рекомендаций)

### Установка и запуск:

```bash
cd frontend

# Установка зависимостей
npm install

# Разработка (hot reload)
npm run dev

# Production build
npm run build

# Preview production build
npm run preview
```

**Frontend запустится на**: `http://localhost:5174`

### Структура проекта:

```
frontend/src/
├── pages/
│   ├── Search/              # Поиск с ML API
│   ├── Categories/          # Категории приложений
│   ├── Recommendations/     # Рекомендации (комбо, популярные, выбор редактора, новые)
│   ├── VideoFeed/           # TikTok-style видео лента
│   └── AppDetail/           # Детали приложения
├── components/
│   ├── Header/              # Навигация
│   ├── AppCard/             # Карточка приложения
│   ├── SearchBar/           # Поиск с интеграцией ML API
│   ├── RecommendationWeb/   # Граф рекомендаций (force-graph)
│   └── ProtectedRoute/      # Auth wrapper
├── services/
│   └── api.js               # API клиент
└── App.jsx                  # Маршруты
```

### Переменные окружения:

Создайте `.env` в `frontend/`:

```env
VITE_API_URL=http://localhost:8080
VITE_ML_API_URL=http://localhost:8000
VITE_VK_APP_ID=your_vk_app_id
```

---

## 🤖 ML API Setup (Семантический поиск)

### Требования:
- Python 3.8+
- Flask/FastAPI
- Transformers (HuggingFace)

### Установка и запуск:

```bash
cd ml

# Создать виртуальное окружение
python -m venv venv

# Активировать
# Windows
venv\Scripts\activate
# Linux/macOS
source venv/bin/activate

# Установить зависимости
pip install -r requirements.txt

# Запустить сервер
python app.py
```

**ML API запустится на**: `http://localhost:8000`

### Доступные endpoints:

```bash
# Семантический поиск
POST /search
Content-Type: application/json

{
  "query": "мобильный банк",
  "limit": 10
}

# Граф рекомендаций
POST /recommendation-web
Content-Type: application/json

{
  "installed_app_ids": [1, 2, 4],
  "max_depth": 2,
  "max_recommendations": 30
}
```

---

## 📹 Добавление видео

### Структура видео-файлов:

```
backend/src/main/resources/static/
├── videos/
│   ├── clashroyal.mp4
│   └── yandexgo.mp4
└── thumbnails/
    ├── clash_1.jpg
    ├── clash_2.jpg
    └── ...
```

### Добавление видео в БД:

1. Положите MP4 в `/static/videos/`
2. Выполните SQL в ClickHouse:

```sql
INSERT INTO rustore.video_clips 
(app_id, title, description, video_url, thumbnail_url, duration_sec, is_playable, demo_time_limit_sec, orientation, views, likes)
VALUES
(12, 'Мой видео', 'Описание', '/videos/myvideo.mp4', '/thumbnails/thumb.jpg', 300, 1, 90, 'vertical', 0, 0);
```

---

## 🌍 Развертывание на сервер

### Docker Compose (рекомендуется):

Создайте `docker-compose.yml` в корне проекта:

```yaml
version: '3.8'

services:
  clickhouse:
    image: clickhouse/clickhouse-server:23.8.16.16
    ports:
      - "8123:8123"
      - "9000:9000"
    environment:
      CLICKHOUSE_DB: rustore
    volumes:
      - clickhouse_data:/var/lib/clickhouse

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    ports:
      - "8080:8080"
    environment:
      SPRING_DATASOURCE_URL: jdbc:ch://clickhouse:8123/rustore
    depends_on:
      - clickhouse

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    ports:
      - "80:80"
    depends_on:
      - backend

  ml-api:
    build:
      context: ./ml
      dockerfile: Dockerfile
    ports:
      - "8000:8000"

volumes:
  clickhouse_data:
```

### Запуск:

```bash
docker-compose up -d
```

---

## 🔑 Основные функции

### 1. 🔍 Поиск
- Семантический поиск с ML API
- Поиск по названию, разработчику, описанию
- Результаты с релевантностью

### 2. 📂 Категории
- Фильтрация по 10+ категориям
- Типы: приложения и игры
- Детальный просмотр категорий

### 3. ⭐ Рекомендации
- Популярные приложения
- Выбор редактора
- Новые приложения
- Комбо (все вместе)

### 4. 🕸️ Граф рекомендаций
- Force-graph визуализация
- Семантические связи между приложениями
- Интерактивный просмотр

### 5. 📹 Видео лента
- TikTok-style интерфейс
- Свайпы и клавиатурные управления
- Like, wishlist, "не интересно"
- Demo trials с таймером

---

## 🐛 Troubleshooting

### ClickHouse не подключается:
```bash
# Проверить, что контейнер запущен
docker ps | grep clickhouse

# Проверить логи
docker logs clickhouse

# Переподключиться через CLI
docker exec -it clickhouse clickhouse-client
```

### Frontend не видит backend:
- Убедитесь, что backend запущен на 8080
- Проверьте CORS в `application.properties`
- Проверьте `VITE_API_URL` в `.env`

### ML API не работает:
```bash
# Проверить зависимости
pip list | grep -E "torch|transformers|flask"

# Переустановить
pip install -r requirements.txt --force-reinstall
```

### Видео не загружаются:
1. Проверьте, что файлы в `/static/videos/`
2. Убедитесь, что URL в БД совпадает с путём файла
3. Проверьте права доступа к папке

---

## 📊 Архитектура

```
┌─────────────┐
│  Frontend   │ (React + Vite)
│  localhost  │
│   :5174     │
└──────┬──────┘
       │
       ├──────────┬──────────┬──────────┐
       │          │          │          │
┌──────▼────┐┌────▼──────┐┌─▼────────┐┌─▼───────┐
│  Backend   ││  ML API   ││ClickHouse││ Storage │
│  Spring    ││  Python   ││Database  ││Videos   │
│:8080       ││ :8000     ││  :8123   ││         │
└────────────┘└───────────┘└──────────┘└─────────┘
```

---

## 📝 Лицензия

MIT License - см. `LICENSE` файл

## 👨‍💻 Автор

[im-fitpex](https://github.com/im-fitpex)

---

## 📚 Дополнительно

- [Spring Boot Documentation](https://spring.io/projects/spring-boot)
- [React Documentation](https://react.dev)
- [ClickHouse Documentation](https://clickhouse.com/docs)
- [Framer Motion](https://www.framer.com/motion/)
- [React Force Graph](https://github.com/vasturiano/react-force-graph)

---

**Последнее обновление**: Ноябрь 2025
