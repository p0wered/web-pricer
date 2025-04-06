#!/bin/bash

chown -R www-data:www-data /var/www/storage/app/temp
chmod -R 775 /var/www/storage/app/temp

exec "$@"
