# Security Policy

## Supported versions

Security fixes are applied on the `main` branch of this repository.

## Reporting a vulnerability

Please open a **private** security advisory on GitHub if available, or an issue without including secrets:
https://github.com/Z3n1thh/app_journal/security

Do **not** post API keys, Sync IDs, or personal journal data in public issues.

## Secrets & keys

This project must **never** commit:

- OpenAI / Anthropic API keys
- Supabase service-role keys (use anon key only in the client, with RLS)
- `.env` files with secrets
- User backups containing personal data

Keys for optional features are entered by the user in Settings and stored locally on their device.
