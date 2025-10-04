#!/bin/bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

pass() { echo -e "\033[0;32m✓\033[0m $1"; }
fail() { echo -e "\033[0;31m✗\033[0m $1"; exit 1; }

# Check README essential identifiers align with AWS live state
grep -q "82z3xjob1g" "$ROOT_DIR/README.md" && pass "README includes HTTP API id"
grep -q "worldsense-gdelt-os-dev" "$ROOT_DIR/README.md" && pass "README includes OpenSearch domain name"
grep -q "E3MJ8UIOB3UH8Q" "$ROOT_DIR/README.md" && pass "README includes CloudFront distribution id"

# Check PROJECT_DOCUMENTATION.md reflects timeout and routes
grep -q "Timeout.*300 seconds" "$ROOT_DIR/doc/PROJECT_DOCUMENTATION.md" && pass "PROJECT_DOCUMENTATION gdelt-fetch-clean timeout updated"
grep -q "Routes" "$ROOT_DIR/doc/PROJECT_DOCUMENTATION.md" && pass "PROJECT_DOCUMENTATION has HTTP API routes"

# Mermaid diagrams presence
[ -f "$ROOT_DIR/doc/diagrams/ARCHITECTURE.mmd" ] && pass "ARCHITECTURE.mmd exists" || fail "Missing ARCHITECTURE.mmd"
[ -f "$ROOT_DIR/doc/diagrams/SEQUENCE_API_SEARCH.mmd" ] && pass "SEQUENCE_API_SEARCH.mmd exists" || fail "Missing SEQUENCE_API_SEARCH.mmd"
[ -f "$ROOT_DIR/doc/diagrams/DATA_PIPELINE.mmd" ] && pass "DATA_PIPELINE.mmd exists" || fail "Missing DATA_PIPELINE.mmd"
[ -f "$ROOT_DIR/doc/diagrams/SECURITY_OVERVIEW.mmd" ] && pass "SECURITY_OVERVIEW.mmd exists" || fail "Missing SECURITY_OVERVIEW.mmd"

echo "All validations passed."

