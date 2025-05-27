# Prime-Shine-Accounting
Full-stack React app that allows for easy bookkeeping for Prime Shine Cleaning.

## Setting up dev environment
1. You will need a `.env` file with the following:
  - `USER_ID` := ID of the user that running the dev environment (`id -u`).
  - `USER_GROUP` := Group ID of the user that is running the dev environment (`id -g`).
  - `JWT_TOKEN` := String used for generating JSON Web Tokens.
  - `WAVE_TOKEN` := API token supplied by WaveApps.
  - `POSTGRES_DB` := Name of the database where the tables will be stored.
  - `POSTGRES_USER` := Database username.
  - `POSTGRES_PASSWORD` := Database password.
  - `POSTGRES_HOST` := URI pointing to the database.
2. Add this entry to your `/etc/hosts` file:
```
127.0.0.1 local.prime-shine-cleaning.com
```
- `C:\Windows\System32\drivers\etc\hosts` is the Windows equivalent.
3. Start the application:
```
docker compose up -d
```

TODOs:
- Front-End:
  - Generate proper `favicon.ico`
  - Unit tests (for components)
  - Consider loading translations via API calls
    - https://stackoverflow.com/questions/56748722/how-can-we-load-translations-using-api-calls-instead-of-having-them-defined-in-s
  - Improve form validations
  - Add interfaces for handling client transactions
    - Blocked on WaveApps API not fully supporting it (5/10/2023)
    - https://developer.waveapps.com/hc/en-us/articles/360019968212-API-Reference
  - Add user session validation to verify session is still valid
- Integration tests
- CI/CD
- Deployment
  - Railway? (or somewhere Heroku-like)
