@echo off
REM Update WALMART_INGEST_URL below once you have your Replit app's real URL.
REM WALMART_INGEST_TOKEN must match the WALMART_INGEST_TOKEN secret set on
REM the deployed app (Replit Secrets tab) — this value must match .env.local.
set WALMART_INGEST_URL=http://localhost:2000/api/walmart-ingest
set WALMART_INGEST_TOKEN=WL2iN6pujguQbKfaNReZ6ToZRk8yXV7H

cd /d "C:\Users\Yashh\OneDrive\Desktop\investment_model\pricescout"
if not exist "data" mkdir "data"
npx tsx scripts\walmart\run-daily.ts >> "data\walmart-scheduler.log" 2>&1
