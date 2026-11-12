#!/bin/sh
# Run ON the Coolify server (SSH) after uploading backups/mistwood-local.dump to /tmp/mistwood-local.dump
# Usage: sh restore-on-coolify-server.sh /tmp/mistwood-local.dump

set -e
DUMP="${1:-/tmp/mistwood-local.dump}"
CONTAINER=$(docker ps --format '{{.Names}}' | grep -i postgres | grep -i mistwood | head -n1)
if [ -z "$CONTAINER" ]; then
  CONTAINER=$(docker ps --format '{{.Names}}' | grep -i postgres | head -n1)
fi
if [ -z "$CONTAINER" ]; then
  echo "No postgres container found. Set CONTAINER manually: CONTAINER=name sh $0 $DUMP"
  exit 1
fi
echo "Using container: $CONTAINER"
docker cp "$DUMP" "$CONTAINER:/tmp/mistwood-local.dump"
docker exec "$CONTAINER" pg_restore -U mistwood -d mistwood --clean --if-exists --no-owner --no-acl -v /tmp/mistwood-local.dump
docker exec "$CONTAINER" rm -f /tmp/mistwood-local.dump
echo "Restore finished. Redeploy the Mistwood app if it was running."
