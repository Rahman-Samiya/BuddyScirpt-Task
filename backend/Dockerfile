# Use official PHP image with FPM
FROM php:8.2-fpm

# Install system dependencies
RUN apt-get update && apt-get install -y \
    git \
    curl \
    zip \
    unzip \
    libzip-dev \
    libonig-dev \
    libxml2-dev \
    libpng-dev \
    libpq-dev

# Install PHP extensions (IMPORTANT: add pgsql)
RUN docker-php-ext-install \
    pdo \
    pdo_mysql \
    pdo_pgsql \
    mbstring \
    zip \
    exif \
    pcntl \
    bcmath

# Install Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

# Set working directory
WORKDIR /var/www/html

# Copy files
COPY . .

# Install dependencies
RUN composer install --no-dev --no-interaction --prefer-dist --optimize-autoloader

# Permissions
RUN chmod -R 777 storage bootstrap/cache

# Storage link
RUN php artisan storage:link

# Expose port
EXPOSE 10000

# Start app (Render provides PORT env)
CMD php artisan migrate --force && php artisan serve --host=0.0.0.0 --port=${PORT}