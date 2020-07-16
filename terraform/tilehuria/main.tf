# https://github.com/kubernetes-digitalocean-terraform/kubernetes-digitalocean-terraform
provider "digitalocean" {
  token = var.do_token
}

resource "digitalocean_kubernetes_cluster" "default" {
  name   = var.project_name
  region = var.region

  version = "1.18.3-do.0"
  tags    = [var.environment]

  node_pool {
    name        = "worker-pool"
    size        = "s-1vcpu-2gb" # TODO variable
    # node_count = 1
    auto_scale  = var.auto_scale
    min_nodes   = var.min_nodes
    max_nodes   = var.max_nodes
  }
}

provider "kubernetes" {
  load_config_file        = false
  host                    = digitalocean_kubernetes_cluster.default.endpoint
  token                   = digitalocean_kubernetes_cluster.default.kube_config[0].token
  cluster_ca_certificate  = base64decode(
    digitalocean_kubernetes_cluster.default.kube_config[0].cluster_ca_certificate
  )
}

provider "helm" {
  kubernetes {
    host                   = digitalocean_kubernetes_cluster.default.endpoint
    cluster_ca_certificate = base64decode(
      digitalocean_kubernetes_cluster.default.kube_config[0].cluster_ca_certificate
    )
    token                  = digitalocean_kubernetes_cluster.default.kube_config[0].token
    load_config_file       = false
  }
}

resource "helm_release" "traefik" {
  name              = "traefik"
  repository        = "https://containous.github.io/traefik-helm-chart"
  chart             = "traefik"
  namespace         = "traefik"
  create_namespace  = true
  set {
    name    = "additionalArguments"
    value   = "{${join(",",[
        "--log.level=DEBUG",
        "--entrypoints.websecure.http.tls",
        "--providers.kubernetesIngress.ingressClass=traefik-cert-manager",
        "--ping",
        "--metrics.prometheus",
        "--entrypoints.web.http.redirections.entrypoint.to=:443",
        "--entrypoints.web.http.redirections.entrypoint.permanent=true"
    ])}}"
  }
}


data "kubernetes_service" "traefik" {
  depends_on = [helm_release.traefik]
  metadata {
    name      = "traefik"
    namespace = "traefik"
  }
}

resource "digitalocean_domain" "default" {
  name = var.domain
}

resource "digitalocean_record" "default" {
  domain = digitalocean_domain.default.name
  type   = "A"
  name   = "@"
  value  = data.kubernetes_service.traefik.load_balancer_ingress.0.ip
}

# TODO wildcard DNS
resource "digitalocean_record" "hasura" {
  domain = digitalocean_domain.default.name
  type   = "A"
  name   = "hasura"
  value  = data.kubernetes_service.traefik.load_balancer_ingress.0.ip
}

resource "digitalocean_record" "hbp" {
  domain = digitalocean_domain.default.name
  type   = "A"
  name   = "hbp"
  value  = data.kubernetes_service.traefik.load_balancer_ingress.0.ip
}

resource "helm_release" "cert-manager" {
  depends_on        = [digitalocean_record.default, digitalocean_record.hasura, digitalocean_record.hbp]
  name              = "cert-manager"
  repository        = "https://charts.jetstack.io"
  chart             = "cert-manager"
  namespace         = "cert-manager"
  create_namespace  = true
  version           = "v0.15.2"
  set {
    name            = "installCRDs"
    value           = "true"
  }
  set {
    name            = "featureGates"
    value           = "ExperimentalCertificateControllers=true"
  }
}

# resource "helm_release" "app" {
#   depends_on        = [helm_release.traefik, helm_release.cert-manager]
#   name    = var.project_name
#   chart   = "../helm-chart"
#   values  = ["${file("../helm-chart/values.yaml")}"]
#   set {
#     name            = "global.environment"
#     value           = var.environment
#   }
# }

