#!/bin/bash
echo "ALTER TABLE sessions ADD COLUMN IF NOT EXISTS target_phones text NOT NULL DEFAULT '';" | psql $DATABASE_URL
echo "Migration completed successfully"
