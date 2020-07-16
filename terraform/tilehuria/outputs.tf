output "cluster-id" {
  value = "${digitalocean_kubernetes_cluster.default.id}"
}

output "end-ip" {
   value = "${data.kubernetes_service.traefik.load_balancer_ingress.0.ip}"
}