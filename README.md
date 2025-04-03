# <p style="width: 100%; font-size: 46px; text-align: center; color: #ffffff; line-height: 0">WebPricer</p>
### <p style="width: 100%; font-size: 18px; text-align: center;">Веб-интерфейс для аналитической работы с данными</p>

## Запуск сервиса через Docker

### Развёртывание сервиса и создание контейнеров

Для запуска процесса развёртывания проекта перейдите в корень проекта через терминал и выполните следующую команду:
```console
docker-compose up -d --build
```

### Настройка серверной части Laravel

После успешного завершения развёртывания откройте терминал в контейнере **app** через Docker Desktop и выполните следующие команды:

```console
php artisan key:generate
```
```console
php artisan migrate
```
```console
php artisan db:seed
```

### Первоначальный импорт данных

Настройте данные для импорта на странице настроек (URL, логин, пароль)

Далее выполните следующую команду в контейнере **app** (выполнение команды займёт несколько минут):

```console
php artisan import:excel
```

### Дополнительно

По умолчанию пароль для входа `12341234`

Для смены пароля через Docker Desktop выполните следующую команду в контейнере **app**:
```console
php artisan password:change 
```

Чтобы увидеть время следующего запланированного импорта, выполните следующую команду в контейнере **app**:
```console
php artisan schedule:list 
```

## Лицензия

The Laravel framework is open-sourced software licensed under the [MIT license](https://opensource.org/licenses/MIT).
