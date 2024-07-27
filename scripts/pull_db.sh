#!/bin/bash

# Check if a table name is provided
if [ -z "$1" ]; then
  echo "Usage: $0 <table_name>"
  exit 1
fi

TABLE_NAME=$1

# Production database credentials
PRODUCTION_DB_USER="1frlm5uak6r5m6c166zk"
PRODUCTION_DB_PASS="pscale_pw_CIlVeGhgxCUZwQDjaVDPFPaakUfcFl4IVjt4t1sQElr"
PRODUCTION_DB_HOST="aws.connect.psdb.cloud"
PRODUCTION_DB_NAME="embtr"

# Development database credentials
DEVELOPMENT_DB_USER="4dae0dolxds58g43rb41"
DEVELOPMENT_DB_PASS="pscale_pw_MpoxZLN9DXkV3ObrnunlckUJxXgsKYX2MsQrNOJSiPC"
DEVELOPMENT_DB_HOST="aws.connect.psdb.cloud"
DEVELOPMENT_DB_NAME="embtr"

# Dump the table from the production database
mysqldump --single-transaction --set-gtid-purged=OFF --user=$PRODUCTION_DB_USER --password=$PRODUCTION_DB_PASS --host=$PRODUCTION_DB_HOST $PRODUCTION_DB_NAME $TABLE_NAME > /tmp/$TABLE_NAME.sql

# Check if the dump was successful
if [ $? -ne 0 ]; then
  echo "Failed to dump table $TABLE_NAME from production database"
  exit 1
fi

# Delete all data from the table in the development database before importing
mysql --user=$DEVELOPMENT_DB_USER --password=$DEVELOPMENT_DB_PASS --host=$DEVELOPMENT_DB_HOST $DEVELOPMENT_DB_NAME -e "DELETE FROM $TABLE_NAME;"

# Check if the delete was successful
if [ $? -ne 0 ]; then
  echo "Failed to delete data from table $TABLE_NAME in development database"
  exit 1
fi

# Import the table into the development database
mysql --user=$DEVELOPMENT_DB_USER --password=$DEVELOPMENT_DB_PASS --host=$DEVELOPMENT_DB_HOST $DEVELOPMENT_DB_NAME < /tmp/$TABLE_NAME.sql

# Check if the import was successful
if [ $? -ne 0 ]; then
  echo "Failed to import table $TABLE_NAME into development database"
  exit 1
fi

echo "Successfully pulled table $TABLE_NAME from production to development"

