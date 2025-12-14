# Kubernetes manifests (optional)

These manifests are optional helpers if you are managing configuration alongside this repo.

## Frontend

- `leapmailr-frontend-configmap.yaml`: non-secret configuration for the UI.

Recommended for GitOps: if you later add Secrets, use Sealed Secrets / External Secrets instead of committing a plaintext Secret.

Note: Next.js often bakes `NEXT_PUBLIC_*` variables at build time. If your Docker build already sets `NEXT_PUBLIC_API_URL`, this ConfigMap may be redundant.
