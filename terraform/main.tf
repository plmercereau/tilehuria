# https://github.com/kubernetes-digitalocean-terraform/kubernetes-digitalocean-terraform
provider "digitalocean" {
  token = var.do_token
}

# TODO https://github.com/adamdecaf/terraform-provider-namecheap
# TODO keep the third-party plugin in the repo, of download in pipeline?
# provider "namecheap" {
# }

# # Create a DNS A Record for a domain you own
# resource "namecheap_record" "tilehuria-platyplus-io" {
#   name    = "tilehuria"
#   domain  = "platyplus.io"
#   address = "127.0.0.1" # TODO
#   mx_pref = 10
#   type    = "A"
# }

resource "digitalocean_kubernetes_cluster" "tilehuria" {
  name   = "tilehuria"
  region = "ams3"

  version = "1.18.3-do.0"
  tags    = ["staging"]

  node_pool {
    name = "worker-pool"
    size = "s-1vcpu-2gb"
    # node_count = 1
    auto_scale = true
    min_nodes  = 1
    max_nodes  = 3
  }
}

provider "kubernetes" {
  load_config_file = false
  host             = digitalocean_kubernetes_cluster.tilehuria.endpoint
  token            = digitalocean_kubernetes_cluster.tilehuria.kube_config[0].token
  cluster_ca_certificate = base64decode(
    digitalocean_kubernetes_cluster.tilehuria.kube_config[0].cluster_ca_certificate
  )
}
