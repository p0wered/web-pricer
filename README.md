# <p style="width: 100%; font-size: 46px; text-align: center; color: #ffffff; line-height: 0">WebPricer</p>
### <p style="width: 100%; font-size: 18px; text-align: center;">Веб-интерфейс для аналитической работы с данными</p>

## Запуск сервиса через Docker

### Развёртывание сервиса и создание контейнеров

Для запуска процесса развёртывания проекта перейдите в корень проекта через терминал и выполните следующую команду:
```console
docker-compose up -d --build
```

### Настройка серверной части Laravel

После успешного завершения развёртывания откройте терминал в контейнере **webpricer-app** через Docker Desktop и выполните следующие команды:

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

### Дополнительно

По умолчанию пароль для входа `12341234`

Для смены пароля выполните данную команду:
```console
php artisan password:change 
```

Чтобы выполнить импорт данных из Excel файла вручную, выполните следующую команду в контейнере **webpricer_app**:
```console
php artisan import:excel
```

## Лицензия

The Laravel framework is open-sourced software licensed under the [MIT license](https://opensource.org/licenses/MIT).
