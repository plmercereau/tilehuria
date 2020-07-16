# TileHuria

TileHuria - a map tiles proxy

## TODO

- when updating a tileset (format/quality) check what changed first. if no change of quality+format, don't recalculate the mbtile
- when updating an area of interest, re-run the tileset + mbtiles generation
- tileset progress, availability and size. Estimate the proportion download tiles vs generate mbtiles.
- get single tile: re-download after a certain period of time?

## Production

### Requirements

- A domain name
- Kubernetes
- Helm

#### Clone this repository

```sh
git clone https://github.com/plmercereau/tilehuria
cd tilehuria/helm-chart
```

#### Create the Kubernetes cluster

You can automatically create a Kubernetes plaform on Digital Ocean with Terraform. See the terraform folder.

Once the Kubernetes cluster is connected, select it as the default context.

#### Install Traefik

```sh
helm repo add traefik https://containous.github.io/traefik-helm-chart
helm repo update

kubectl create namespace traefik
helm install --namespace traefik traefik traefik/traefik --values traefik/values.yaml
```

Check if you have access to the dashboard. First, forward the pod to a local port:

```sh
kubectl port-forward -n traefik $(kubectl get pods -n traefik --selector "app.kubernetes.io/name=traefik" --output=name) 9000:9000
```

Then you can check [http://127.0.0.1:9000/dashboard/](http://127.0.0.1:9000/dashboard/). Don't forget the trailing backslash...

#### Get IP bound to traefik, and update your DNS records

Given a `example.com` domain name, you must create a A record pointing to Traefik for the following hosts:

- example.com
- hasura.example.com
- hbp.example.com

#### Install cert-manager

```sh
# Install the CustomResourceDefinition resources separately
kubectl apply --validate=false -f https://github.com/jetstack/cert-manager/releases/download/v0.15.2/cert-manager.crds.yaml

# Create the namespace for cert-manager
kubectl create namespace cert-manager

# Add the Jetstack Helm repository
helm repo add jetstack https://charts.jetstack.io

# Update your local Helm chart repository cache
helm repo update

# Install the cert-manager Helm chart
helm install \
  cert-manager jetstack/cert-manager \
  --namespace cert-manager \
  --version v0.15.2

# Verify cert-manager installation
kubectl get pods --namespace cert-manager
```

#### Configure the Helm Chart

Edit the `values.yaml` file.
Some are really important:

- Secrets
- `global.hostname`must be your main domain name, e.g. `example.com`

#### Install the Chart

```sh
helm dependencies update
helm install tilehuria .
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
