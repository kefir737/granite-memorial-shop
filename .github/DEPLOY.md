# GitHub Actions Deploy Setup

## Настройка секретов в GitHub

Добавьте следующие секреты в репозиторий (Settings → Secrets and variables → Actions → New repository secret):

| Название секрета | Описание | Пример |
|-----------------|----------|--------|
| `VPS_HOST` | IP-адрес или домен VPS | `185.123.45.67` или `granit-sever.ru` |
| `VPS_USERNAME` | Имя пользователя SSH | `root` или `admin` |
| `VPS_SSH_KEY` | Приватный SSH-ключ для подключения | `-----BEGIN OPENSSH PRIVATE KEY-----...` |
| `VPS_PORT` | Порт SSH | `22` |

## Как получить SSH-ключ

1. Сгенерируйте ключ на локальной машине (если нет):
   ```bash
   ssh-keygen -t ed25519 -C "github-actions" -f ~/.ssh/github_actions
   ```

2. Добавьте публичный ключ на VPS:
   ```bash
   ssh-copy-id -i ~/.ssh/github_actions.pub user@vps-host
   ```

3. Скопируйте приватный ключ для секрета:
   ```bash
   cat ~/.ssh/github_actions | pbcopy  # macOS
   # или
   cat ~/.ssh/github_actions | clip    # Windows
   ```

## Как работает деплой

1. При пуше в ветку `main` запускается workflow
2. Собирается проект (`npm run build`)
3. Через SSH подключается к VPS
4. Выполняется скрипт деплоя:
   - Git pull последних изменений
   - Установка зависимостей
   - Сборка проекта
   - Копирование `dist/` в директорию сайта

## Проверка статуса деплоя

- Зайдите в репозиторий на GitHub
- Перейдите во вкладку **Actions**
- Выберите последний запуск workflow **Deploy to VPS**
- Проверьте логи на наличие ошибок
