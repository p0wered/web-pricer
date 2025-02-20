<p style="width: 100%; font-size: 48px; text-align: center; color: #ffffff">WebPricer</p>
<p style="width: 100%; font-size: 18px; text-align: center; line-height: 0">Веб-интерфейс для аналитической работы с данными</p>

## <p>Запуск сервис через <span style="color: #008CFFFF">Docker</span></p>

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

После успешного завершения развёртывания откройте контейнер **laravel_app** (через терминал или Docker Desktop) и выполните следующие команды:

```console
composer install
```
```console
php artisan key:generate
```
```console
php artisan migrate
```

### <p> После выполнение данных шагов сервис должен быть готов к работе</p>

## Лицензия

The Laravel framework is open-sourced software licensed under the [MIT license](https://opensource.org/licenses/MIT).
