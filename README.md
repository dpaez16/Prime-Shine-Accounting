# Prime-Shine-Accounting
Full-stack React app that allows for easy bookkeeping for Prime Shine Cleaning.

TODOs:
- Front-End:
  - Migrate all class components to functional components
  - Unit tests (for components)
  - Refactoring
  - Consider loading translations via API calls
    - https://stackoverflow.com/questions/56748722/how-can-we-load-translations-using-api-calls-instead-of-having-them-defined-in-s
  - Improve form validations
  - Add interfaces for handling client transactions
    - Blocked on WaveApps API not fully supporting it (5/10/2023)
    - https://developer.waveapps.com/hc/en-us/articles/360019968212-API-Reference
  - Add user session validation to verify session is still valid
  - Deployment
    - Railway? (or somewhere Heroku-like)
- Back-End:
  - Add handshake service
    - Verifies user session
  - Deployment
    - Serverless (Azure Functions, AWS Lambda)
- Integration tests
- CI/CD
