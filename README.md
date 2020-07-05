# TileHuria

TileHuria - a map tiles proxy

## TODO

- when updating a tileset (format/quality) check what changed first. if no change of quality+format, don't recalculate the mbtile
- when updating an area of interest, re-run the tileset + mbtiles generation
- tileset progress, availability and size. Estimate the proportion download tiles vs generate mbtiles.
- get single tile: re-download after a certain period of time?

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
