#!/bin/sh
set -e
mkdir -p /app/public/uploads/apartment-gallery/videos \
         /app/public/uploads/apartment-gallery/posters \
         /app/public/uploads/site-logo
chown -R node:node /app/public/uploads
exec su-exec node "$@"