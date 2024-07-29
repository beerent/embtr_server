#!/bin/bash

# Check if a table name is provided
if [ -z "$1" ]; then
  echo "Usage: $0 <table_name>"
  exit 1
fi

TABLE_NAME=$1
SKIP_DELETE=$2

# Dump the table from the production database
mysqldump --defaults-file=~/.my.cnf.prod --single-transaction --set-gtid-purged=OFF embtr "${TABLE_NAME}" > /tmp/$TABLE_NAME.sql

# Check if the dump was successful
if [ $? -ne 0 ]; then
  echo "Failed to dump table $TABLE_NAME from production database"
  exit 1
fi

if [ -z "$SKIP_DELETE" ]; then
  # Delete all data from the table in the development database before importing
  mysql --defaults-file=~/.my.cnf.dev embtr -e "DELETE FROM \`$TABLE_NAME\`;"

  # Check if the delete was successful
  if [ $? -ne 0 ]; then
    echo "Failed to delete data from table $TABLE_NAME in development database"
    exit 1
  fi

fi

# Import the table into the development database
mysql --defaults-file=~/.my.cnf.dev embtr < /tmp/$TABLE_NAME.sql

# Check if the import was successful
if [ $? -ne 0 ]; then
  echo "Failed to import table $TABLE_NAME into development database"
  exit 1
fi

echo "Successfully pulled table $TABLE_NAME from production to development"

# Scramble the user.email field if the table name is 'user'
if [ "$TABLE_NAME" = "user" ]; then
  mysql --defaults-file=~/.my.cnf.dev -e "UPDATE user SET email = CONCAT(id, '@scrambled.com');"
  if [ $? -ne 0 ]; then
    echo "Failed to scramble email addresses in the user table"
    exit 1
  fi
  echo "Successfully scrambled email addresses in the user table"
fi
