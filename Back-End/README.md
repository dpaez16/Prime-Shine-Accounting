# Schedules API

Running the Back-end API:
- You will need a MongoDB cluster.
- Make sure the following environment variables are defined (via `nodemon.json` or shell environment variables):
  - `MONGO_USER`
  - `MONGO_PASSWORD`
  - `MONGO_CLUSTER_DOMAIN`
  - `MONGO_DB`
  - `PORT`
  - `JWT_TOKEN`
- The service will run in the port defined by `PORT` (or 5000 by default).
