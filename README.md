# <p style="width: 100%; font-size: 46px; text-align: center; color: #ffffff; line-height: 0">WebPricer</p>
### <p style="width: 100%; font-size: 18px; text-align: center;">Веб-интерфейс для аналитической работы с данными</p>

## Запуск сервиса через Docker

### 1. Настройка .env файла

Для смены часового пояса отредактируйте следующую строку (список всех часовых поясов [здесь](https://www.php.net/manual/en/timezones.php)):
```env
APP_TIMEZONE=
```

Для смены частоты импорта данных из Excel файла отредактируйте следующую строку:
```env
EXCEL_IMPORT_FREQUENCY=daily/weekly/montly
```

Для смены номера дня недели импорта _(в случае выбора weekly)_ или номера месяца _(в случае monthly)_ отредактируйте следующую строку:
```env
EXCEL_IMPORT_DAY=1/2/3...
```

Для смены времени, в которое будет происходить импорт отредактируйте следующую строку:
```env
EXCEL_IMPORT_TIME=18:00/7:00/...
```

Данные для авторизации необходимо указать в следующих строках:
```env
EXCEL_IMPORT_URL=
EXCEL_IMPORT_USERNAME=
EXCEL_IMPORT_PASSWORD=
```

### 2. Развёртывание сервиса и создание контейнеров

Для запуска процесса развёртывания проекта перейдите в корень проекта через терминал и выполните следующую команду:
```console
docker-compose up -d --build
```

### 3. Настройка серверной части Laravel

После успешного завершения развёртывания откройте терминал в контейнере **webpricer-app** через Docker Desktop и выполните следующие команды:

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

### Дополнительно

Чтобы выполнить импорт данных из Excel файла вручную, выполните следующую команду в контейнере **webpricer_app**:
```console
php artisan import:excel
```

## Лицензия

The Laravel framework is open-sourced software licensed under the [MIT license](https://opensource.org/licenses/MIT).
