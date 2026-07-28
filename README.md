# STANS — DevSecOps Pipeline

[![CI](https://img.shields.io/github/actions/workflow/status/mo7hamd2003/STANS/ci.yml?branch=main&label=CI)](https://github.com/mo7hamd2003/STANS/actions/workflows/ci.yml)
[![Deploy](https://img.shields.io/github/actions/workflow/status/mo7hamd2003/STANS/deploy.yml?branch=main&label=Deploy)](https://github.com/mo7hamd2003/STANS/actions/workflows/deploy.yml)
[![CodeQL](https://img.shields.io/github/actions/workflow/status/mo7hamd2003/STANS/codeql.yml?branch=main&label=CodeQL)](https://github.com/mo7hamd2003/STANS/actions/workflows/codeql.yml)

This repo is a DevSecOps hardening exercise, built around the [roadmap.sh STANS project](https://roadmap.sh/projects/stans-navigation-deployment): containerizing a React/TypeScript app and shipping it through a hardened, security-scanned CI/CD pipeline.

See [`DEPLOYMENT.md`](./DEPLOYMENT.md) for the full pipeline writeup.

## Status

- **Phase 1 — Container & pipeline hardening:** complete
- **Phase 2 — Advanced security hardening:** in progress

## Phase 1 — completed

- **Multi-stage Dockerfile** — `node:24-alpine3.20` build stage, `nginx:1.27-alpine3.20` runtime stage, with only the compiled `dist/` output and `nginx.conf` copied into the final image.
- **Pinned base image versions** — no floating tags.
- **Non-root container user** — runs as the built-in `nginx` user, not root.
- **`.dockerignore`** — keeps `node_modules`, `.git`, `.env`, and docs out of the build context.
- **OCI image labels** — `org.opencontainers.image.revision` / `.created`, injected at build time so any running image traces back to its exact commit and build timestamp.
- **Health check** — an exact-match `/health` route in `nginx.conf`, backed by a Docker `HEALTHCHECK` polling every 30s.
- **`docker-compose.yaml`** — for local dev/prod parity.
- **Nginx security headers** — `server_tokens off`, `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`.
- **Hardened CI/CD pipeline** — all third-party GitHub Actions pinned to a full commit SHA; the image is built and health-verified *before* being pushed, so `:latest` on GHCR can never point at a build that failed its own health check. Images are tagged both `:latest` and `:<commit-sha>`.

## Phase 2 — in progress

Completed so far:
- **Dependabot** — weekly update PRs for both the `npm` and `github-actions` ecosystems.
- **Trivy vulnerability scanning** — filesystem/dependency scan in CI, image scan before push in CD, both gating the pipeline on `CRITICAL`/`HIGH` findings. `trivy-action` is pinned by commit SHA rather than tag, in direct response to the March 2026 supply-chain tag-hijacking incident affecting that action.
- **CodeQL static analysis (SAST)** — `security-extended` query pack, running on push/PR plus a weekly schedule, with results surfaced in the repo's Security tab.

Not yet done:
- Read-only root filesystem + dropped Linux capabilities at the container level.
- SBOM generation (Syft) per image build.
- Image signing / provenance verification (cosign/Sigstore).
- Content-Security-Policy header.

## Also still pending

- **Live deployment** (Part 4 of the original brief) — provisioning a real VPS, Certbot TLS, and firewall rules. No server has been provisioned yet; the SSH deploy step in `deploy.yml` is written but commented out until one exists.

## Running it

```bash
# Local dev (underlying app)
npm install
npm run dev
```

```bash
# Plain Docker
docker build \
  --build-arg REVISION=$(git rev-parse HEAD) \
  --build-arg BUILD_DATE=$(date -u +'%Y-%m-%dT%H:%M:%SZ') \
  -t stans-app .

docker run -d --name stans-app -p 8080:80 stans-app
```

```bash
# Docker Compose
docker compose up -d --build
docker compose ps   # confirm (healthy) status
```