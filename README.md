# Development
1. Copy .env.development.example to .env.development, change environment variables in order to match your developing environment.
2. Open terminal, to start up the server, type: **npm run start:dev** (or choose  your preferred way as described in Feature#1).

# Feature
1. Reloading:
   1. Webpack Hot Module Reloading (HMR)
   ```
   npm run start:hmr
   ```
   2. NestJS built-in development server:
   ```
   npm run start:dev
   ```
2. Generate GraphQL schema
   ```
   npm run gen
   ```
# Environment variables
The variable is automatically loaded from `.env.production` variables if `NODE_ENV` set to `production`, or it will load from `.env.development` otherwise.

- `APP_PORT` (default: `8080`): Define the port which server binding to

- `MONGO_URI` (default: `mongodb://localhost:27017/db`): Define the uri string how database driver connect to mongodb. See more at [here](mongodb://[username:password@]host1[:port1][,...hostN[:portN]][/[defaultauthdb][?options]]
)

- `TOKEN_ENCRYPT_SECRET` (default: `11`): Define the secret used to sign jwt.

- `PASSWORD_HASH_SALT` (default: `s3cr3t!@#`): Define number of rounds to encrypt passwords of users before saving into database.
- `GRAPHQL_ENDPOINT_PATH` (default: `/graphql`): Define graphql path

# Deployment
### PM2
### Docker

To build the docker image, run:
```
TAG=$TAG npm run build container
```
`$TAG` can be either *test*, *staging* or *stable*