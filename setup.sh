#!/usr/bin/env bash
#
# One-command setup for the HTMX vassning lab.
#
#   ./setup.sh                 start on http://localhost:4000
#   LAB_PORT=4002 ./setup.sh   start on a different port
#
# Safe to re-run at any time.

set -euo pipefail

cd "$(dirname "$0")"

PORT="${LAB_PORT:-4000}"
URL="http://localhost:${PORT}"
HEALTH_TIMEOUT=90

bold=$(tput bold 2>/dev/null || echo "")
dim=$(tput dim 2>/dev/null || echo "")
red=$(tput setaf 1 2>/dev/null || echo "")
green=$(tput setaf 2 2>/dev/null || echo "")
reset=$(tput sgr0 2>/dev/null || echo "")

step() { echo "${bold}==>${reset} $*"; }
info() { echo "    ${dim}$*${reset}"; }
ok()   { echo "    ${green}OK${reset}  $*"; }

# Print a readable explanation and stop. Never let a raw stack trace be the
# last thing an attendee sees.
die() {
  echo ""
  echo "${red}${bold}Setup stopped.${reset} $1"
  echo ""
  [ "$#" -gt 1 ] && { echo "$2"; echo ""; }
  exit 1
}

# --- 1. Docker present? ------------------------------------------------------
step "Checking Docker"
if ! command -v docker >/dev/null 2>&1; then
  die "Docker is not installed." \
"This lab runs Node inside Docker so you don't need Node on your machine.

Install Docker Desktop, then run ./setup.sh again:
  https://www.docker.com/products/docker-desktop/"
fi

# --- 2. Docker daemon running? -----------------------------------------------
if ! docker info >/dev/null 2>&1; then
  die "Docker is installed, but the Docker daemon isn't running." \
"Start Docker Desktop, wait until it says it's running, then run ./setup.sh again."
fi

# Compose v2 ships inside the docker CLI. v1 (docker-compose) is end-of-life.
if ! docker compose version >/dev/null 2>&1; then
  die "Your Docker install doesn't have Compose v2." \
"Update Docker Desktop to a current version, then run ./setup.sh again.
(The old standalone 'docker-compose' command is not supported here.)"
fi
ok "Docker is running"

# --- 3. Is the port free? ----------------------------------------------------
step "Checking port ${PORT}"
port_in_use() {
  if command -v lsof >/dev/null 2>&1; then
    lsof -iTCP:"$PORT" -sTCP:LISTEN -n -P >/dev/null 2>&1
  elif command -v nc >/dev/null 2>&1; then
    nc -z localhost "$PORT" >/dev/null 2>&1
  else
    return 1  # can't tell; let Docker report the conflict instead
  fi
}

# Our own container holding the port is fine -- that's just a re-run.
ours_is_up() {
  [ "$(docker compose ps --status running --quiet lab 2>/dev/null | wc -l)" -gt 0 ]
}

if port_in_use && ! ours_is_up; then
  die "Port ${PORT} is already in use by something else." \
"Either stop whatever is using port ${PORT}, or start the lab on another port:

  LAB_PORT=4002 ./setup.sh"
fi
ok "Port ${PORT} is available"

# --- 4. Build the image ------------------------------------------------------
step "Building the container image"
info "First run downloads Node and takes a minute or two. Later runs are cached."
if ! docker compose build; then
  die "The container image failed to build." \
"Scroll up for the reason. If it mentions network or TLS problems, check your
connection (or VPN) and run ./setup.sh again."
fi
ok "Image built"

# --- 5. Install dependencies into the bind mount -----------------------------
# Installing from inside the container guarantees the Linux/Node 24 resolution,
# while the bind mount puts node_modules on the host for editor IntelliSense.
step "Installing dependencies"
if ! docker compose run --rm --no-deps lab npm install --no-audit --no-fund; then
  die "Installing npm dependencies failed." \
"Scroll up for the reason. A stale install can also be cleared with:

  rm -rf node_modules package-lock.json && ./setup.sh"
fi
ok "Dependencies installed into ./node_modules"

# --- 6. Start the server -----------------------------------------------------
step "Starting the dev server"
docker compose up -d --force-recreate

# --- 7. Wait until it actually answers ---------------------------------------
step "Waiting for the server to respond"
healthy=""
for _ in $(seq 1 "$HEALTH_TIMEOUT"); do
  if curl -fsS "${URL}/healthz" >/dev/null 2>&1; then healthy="yes"; break; fi
  sleep 1
done

if [ -z "$healthy" ]; then
  echo ""
  echo "${red}The server didn't respond within ${HEALTH_TIMEOUT}s.${reset} Last log output:"
  echo ""
  docker compose logs --tail 40 lab || true
  die "Could not reach ${URL}/healthz" \
"The container is still running, so you can keep investigating:

  docker compose logs -f lab     follow the logs
  docker compose restart lab     restart the server
  docker compose down            stop everything"
fi
ok "Server is responding"

# --- 8. Done -----------------------------------------------------------------
echo ""
echo "${green}${bold}The lab is running.${reset}"
echo ""
echo "  ${bold}${URL}${reset}"
echo ""
echo "  Open this folder in your editor and change any file under views/,"
echo "  public/ or src/ -- the browser reloads by itself."
echo ""
echo "  ${dim}docker compose logs -f lab   follow the logs${reset}"
echo "  ${dim}docker compose down          stop the lab${reset}"
echo ""

if command -v open >/dev/null 2>&1; then
  open "$URL" >/dev/null 2>&1 || true
elif command -v xdg-open >/dev/null 2>&1; then
  xdg-open "$URL" >/dev/null 2>&1 || true
fi
