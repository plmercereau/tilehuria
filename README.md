# TileHuria

TileHuria - a map tiles proxy

## Development

### Prerequisites

- Node 14
- Docker engine
- Hasura CLI

### Installation

```sh
git clone https://github.com/plmercereau/tilehuria
cd tilehuria
cp .env.example .env
# ATTENTION: change the values in the .env file you just created !!!
yarn install
```

### Run the stack

```sh
docker-compose up -d
yarn dev
```

Any change in the schema must be done through the Hasura console, that can be started in running `hasura console`.
