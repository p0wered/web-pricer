FROM php:8.4-fpm

RUN apt-get update && apt-get install -y \
    apt-utils \
    libpng-dev \
    libjpeg-dev \
    libfreetype6-dev \
    zip \
    unzip \
    git \
    curl \
    libonig-dev \
    libxml2-dev \
    libzip-dev \
    && docker-php-ext-install pdo pdo_mysql mbstring exif pcntl bcmath gd zip

COPY --from=composer:2.8 /usr/bin/composer /usr/bin/composer

RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && \
    apt-get install -y nodejs

WORKDIR /var/www

COPY . .

RUN composer install --no-dev --no-scripts --optimize-autoloader
RUN npm install && npm run build

RUN chown -R www-data:www-data /var/www/storage /var/www/bootstrap/cache

RUN echo "upload_max_filesize=512M" >> /usr/local/etc/php/conf.d/custom.ini && \
    echo "post_max_size=512M" >> /usr/local/etc/php/conf.d/custom.ini && \
    echo "memory_limit=-1" >> /usr/local/etc/php/conf.d/custom.ini

CMD ["php-fpm"]
