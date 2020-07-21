# TileHuria

TileHuria - a map tiles proxy

## TODO

- when updating a tileset (format/quality) check what changed first. if no change of quality+format, don't recalculate the mbtile
- when updating an area of interest, re-run the tileset + mbtiles generation
- tileset progress, availability and size. Estimate the proportion download tiles vs generate mbtiles.
- get single tile: re-download after a certain period of time?

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
