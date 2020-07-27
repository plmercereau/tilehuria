# TileHuria

TileHuria - a map tiles proxy

## TODO

- [ ] Lerna package to use "platyplus" packages e.g. gis etc
- get single tile: re-download after a certain period of time?
- get single tile: compare with the existing tile. If the downloaded tile is of better quality, replace the tile.
  - Set a `quality` metadata field when creating the tile (from an mbtile). Then if quality < 100, re-download
  - but what if we want to generate mbtiles without downloading anything more than what's already in the server?
- upload mbtiles. see above
- set a progress system when generating the aoi's coordinates. To do so:
  - [x] estimate the number of tiles from the aoi boundaries and the zoom levels
- ? Are zoom levels really part of the aoi or the tile set?
- [x] if format=png and quality=100 then don't run the image transformation when generating the mbtiles file
- what png compression means? How does it work? See https://sharp.pixelplumbing.com/api-output#png
- edit aoi:
  - [x] zoom levels
  - source: import from file
  - [x] source: edit with leaflet
- create new aoi: use the same interface as the 'update' one
- create new tileset from the aoi screen
- edit tileset from the aoi screen
- remove components and pages that are not used anymore (e.g. new aoi, new tileset etc)
- edit tile providers
  - to be considered: when changing the slug, change the object keys and the mbtile files
  - change the name
  - change the url (only if it has no tileset?)
- delete tile providers (only if it has no tileset)
- fix the login/refresh token bug
- page titles
- ! In dev, the tsconfig microservices are somehow linked. On a general basis, it is not properly configured
- review the size limit of events sent to the hook service
- confirm when logout
- home page
  - unauthenticated
  - authenticated -> redirect to aoi list?
- aoi map buttons:
  - fullscreen
  - [x] center
- tile provider: "copy" link of the local server
- remove unused Hasura actions in hooks
- rename event hooks
- ? split aoi source update / tileset update -> when finishing the aoi coordinates calculation from source, save the source, that will trigger an aoi xyz coordinates updates, that will queue tile set updates if some exist
- next
  - talk about user permissions with Ivan
  - include a mapathon module?
  - package the server to automate local installation

## Production

### Requirements

- A Kubernetes cluster.
- A DNS domain name.
- The [Kubectl](https://kubernetes.io/docs/tasks/tools/install-kubectl/) Kubernetes client.
- [Helm](https://helm.sh/docs/intro/install/).

### Create and connect to the cluster

You can run a cheap Kubernetes cluster on [Digital Ocean](https://www.digitalocean.com/docs/kubernetes/how-to/create-clusters/).

### Install Traefik

```sh
helm install traefik traefik \
  --repo https://charts.platyplus.io \
  --namespace traefik \
  --create-namespace
```

Check if you have access to the dashboard. First, forward the pod to a local port:

```sh
kubectl port-forward -n traefik $(kubectl get pods -n traefik --selector "app.kubernetes.io/name=traefik" --output=name) 9000:9000
```

Then you can check [http://127.0.0.1:9000/dashboard/](http://127.0.0.1:9000/dashboard/). Don't forget the trailing backslash...

### Install cert-manager

```sh
helm install cert-manager cert-manager \
  --repo https://charts.platyplus.io \
  --namespace cert-manager \
  --create-namespace \
  --version v0.15.2
```

Verify cert-manager installation:

```sh
kubectl get pods --namespace cert-manager
```

### Get IP bound to traefik, and update your DNS records

TODO: how to get the IP with kubectl

Given a `example.com` domain name, you must create a A record pointing to Traefik for the following hosts:

- example.com
- hasura.example.com
- hbp.example.com

### Install Tilehuria

```sh
helm install tilehuria tilehuria \
    --repo https://charts.platyplus.io \
    --set global.hostname=example.com
```

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
