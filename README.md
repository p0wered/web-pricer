# <p style="width: 100%; font-size: 46px; text-align: center; color: #ffffff; line-height: 0">WebPricer</p>
### <p style="width: 100%; font-size: 18px; text-align: center;">Веб-интерфейс для аналитической работы с данными</p>

## Запуск сервиса через Docker

### 1. Настройка .env файла (опционально)

По умолчанию сервис использует порт 8000. Если этот порт занят, вы можете изменить его, отредактировав следующую строчку:
```env
APP_PORT=
```

Для смены часового пояса отредактируйте следующую строчку (список всех часовых поясов [здесь](https://www.php.net/manual/en/timezones.php)):
```env
APP_TIMEZONE=
```

Для смены URL используйте следующую строчку:
```env
APP_URL=
```
Если вы меняете на кастомный URL, не забудьте добавить его в файл hosts системы

### 2. Развёртывание сервиса и создание контейнеров

Для запуска процесса развёртывания проекта перейдите в корень проекта через терминал и выполните следующую команду:
```console
docker-compose up --build
```

### 3. Настройка серверной части Laravel

После успешного завершения развёртывания откройте терминал в контейнере **laravel_app** через Docker Desktop и выполните следующие команды:

```console
composer install
```
```console
php artisan key:generate
```
```console
php artisan migrate
```
```console
php artisan db:seed
```

После выполнение данных шагов сервис должен быть готов к работе

### 4. Смена пароля для авторизации

По умолчанию пароль для входа `12341234`

Для смены пароля выполните данную команду:
```console
php artisan password:change 
```

## Лицензия

The Laravel framework is open-sourced software licensed under the [MIT license](https://opensource.org/licenses/MIT).
