# TileHuria

TileHuria - a map tiles proxy

## Development

### Prerequisites

- Node 14
- Docker engine

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
