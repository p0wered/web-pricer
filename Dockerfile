# Используем официальный образ PHP 8.2 с Apache
FROM php:8.2-apache

# Устанавливаем необходимые зависимости
RUN apt-get update && apt-get install -y \
    git \
    curl \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    zip \
    unzip \
    && docker-php-ext-install pdo_mysql mbstring exif pcntl bcmath gd

# Устанавливаем Composer 2.8.4
COPY --from=composer:2.8.4 /usr/bin/composer /usr/bin/composer

# Устанавливаем Node.js 20
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs

# Копируем исходный код проекта
COPY . /var/www/html

# Устанавливаем права на папку storage
RUN chown -R www-data:www-data /var/www/html/storage

# Устанавливаем зависимости Composer и Node.js
RUN composer install --no-dev --optimize-autoloader
RUN npm install && npm run build

# Настраиваем Apache
RUN a2enmod rewrite
COPY .docker/vhost.conf /etc/apache2/sites-available/000-default.conf

# Открываем порт 80
EXPOSE 80

# Запускаем Apache
CMD ["apache2-foreground"]
