output "cluster-id" {
  value = "${digitalocean_kubernetes_cluster.tilehuria.id}"
}

output "ip-address" {
  value = "${digitalocean_kubernetes_cluster.tilehuria.ipv4_address}"
}
