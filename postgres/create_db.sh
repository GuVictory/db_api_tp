#!/bin/bash
set -e

POSTGRES_USER=docker
DB_NAME=forum_api_tp
POPULATE_DB=1

POSTGRES="psql"

echo "Creating database: ${DB_NAME}"

$POSTGRES <<EOSQL
CREATE DATABASE ${DB_NAME} OWNER ${POSTGRES_USER};
EOSQL

echo "Creating schema..."
psql -d "${DB_NAME}" -a -f /Users/guvictoria/Desktop/study/technoPark/dataBase/db_api_tp/postgres/init.sql

if [ "${POPULATE_DB}" -eq 1 ]; then
    echo "Populating database..."
    psql -d "${DB_NAME}" -a -f /Users/guvictoria/Desktop/study/technoPark/dataBase/db_api_tp/postgres/data.sql
fi