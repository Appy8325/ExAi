#!/usr/bin/env bash
set -euo pipefail

# =============================================================================
# ExAi (Concourse) — Production Verification Script
# =============================================================================
# Usage:
#   ./scripts/verify-production.sh [api_url] [web_url]
#
# Defaults:
#   API_URL=https://api.exai.app
#   WEB_URL=https://exai.app
# =============================================================================

API_URL="${1:-https://api.exai.app}"
WEB_URL="${2:-https://exai.app}"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

PASS=0
FAIL=0

pass() { PASS=$((PASS + 1)); echo -e "  ${GREEN}✓${NC} $1"; }
fail() { FAIL=$((FAIL + 1)); echo -e "  ${RED}✗${NC} $1"; }

check_http() {
  local url="$1"
  local desc="$2"
  local expected_code="${3:-200}"

  local code
  code=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 "$url" 2>/dev/null || echo "000")
  if [ "$code" = "$expected_code" ]; then
    pass "$desc ($code)"
    return 0
  else
    fail "$desc — expected $expected_code, got $code"
    return 1
  fi
}

check_json() {
  local url="$1"
  local desc="$2"
  local jq_query="$3"
  local expected="$4"

  local result
  result=$(curl -s --max-time 10 "$url" 2>/dev/null | jq -r "$jq_query" 2>/dev/null || echo "__FAIL__")
  if [ "$result" = "$expected" ]; then
    pass "$desc"
    return 0
  else
    fail "$desc — expected '$expected', got '$result'"
    return 1
  fi
}

echo ""
echo "=============================================="
echo "  ExAi — Production Verification"
echo "  API: $API_URL"
echo "  Web: $WEB_URL"
echo "=============================================="
echo ""

echo "--- API Health ---"
check_http "$API_URL/healthz" "Health endpoint" 200

echo ""
echo "--- API CORS ---"
local cors_result
cors_result=$(curl -s -o /dev/null -w "%{http_code}" \
  -H "Origin: $WEB_URL" \
  -H "Access-Control-Request-Method: GET" \
  -X OPTIONS \
  --max-time 10 \
  "$API_URL/healthz" 2>/dev/null || echo "000")
if [ "$cors_result" = "204" ] || [ "$cors_result" = "200" ]; then
  pass "CORS preflight ($cors_result)"
else
  fail "CORS preflight — expected 204/200, got $cors_result"
fi

echo ""
echo "--- Web Availability ---"
check_http "$WEB_URL" "Web home page" 200

echo ""
echo "--- Web Response Headers ---"
local security_check
security_check=$(curl -s -I --max-time 10 "$WEB_URL" 2>/dev/null | grep -i "strict-transport-security" | head -1)
if [ -n "$security_check" ]; then
  pass "HSTS header present"
else
  fail "HSTS header missing"
fi

echo ""
echo "--- DNS Resolution ---"
local api_ip
api_ip=$(dig +short "$API_URL" 2>/dev/null | head -1 || echo "")
if [ -n "$api_ip" ]; then
  pass "API DNS resolves to $api_ip"
else
  fail "API DNS not resolving"
fi

local web_ip
web_ip=$(dig +short "$WEB_URL" 2>/dev/null | head -1 || echo "")
if [ -n "$web_ip" ]; then
  pass "Web DNS resolves to $web_ip"
else
  fail "Web DNS not resolving"
fi

echo ""
echo "--- TLS ---"
local tls_result
tls_result=$(echo | openssl s_client -connect "${API_URL#https://}:443" -servername "${API_URL#https://}" 2>/dev/null | openssl x509 -noout -subject -issuer -dates 2>/dev/null || echo "")
if [ -n "$tls_result" ]; then
  pass "API TLS certificate valid"
else
  fail "API TLS certificate check failed"
fi

echo ""
echo "=============================================="
echo "  Results: $PASS passed, $FAIL failed"
echo "=============================================="

if [ "$FAIL" -gt 0 ]; then
  exit 1
fi
