#!/bin/sh
set -eu

secret_file="/etc/secrets/local-production.json"
config_file="/app/config/local-production.json"

if [ -f "$secret_file" ]; then
  cp "$secret_file" "$config_file"
elif [ "${NODE_ENV:-}" = "production" ]; then
  echo "Missing required Render secret file: $secret_file" >&2
  exit 1
fi

exec "$@"