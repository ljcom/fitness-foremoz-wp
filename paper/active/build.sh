#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
WHITEPAPER_DIR="$ROOT_DIR/01-whitepaper"
DIAGRAM_DIR="$ROOT_DIR/02-diagrams"
BUILD_DIR="$ROOT_DIR/04-build"
OUTPUT_PDF="${1:-$BUILD_DIR/active-foremoz-whitepaper.pdf}"
PDF_ENGINE="${PDF_ENGINE:-/Library/TeX/texbin/xelatex}"

if ! command -v pandoc >/dev/null 2>&1; then
  echo "Error: pandoc tidak ditemukan. Install dulu: brew install pandoc" >&2
  exit 1
fi

if [[ ! -x "$PDF_ENGINE" ]]; then
  echo "Error: PDF_ENGINE tidak valid atau tidak executable: $PDF_ENGINE" >&2
  echo "Set path valid, contoh:" >&2
  echo "  PDF_ENGINE=/Library/TeX/texbin/xelatex ./paper/active/build.sh" >&2
  exit 1
fi

mkdir -p "$BUILD_DIR"

collect_markdown_files() {
  local dir="$1"
  if [[ ! -d "$dir" ]]; then
    return 0
  fi
  find "$dir" -maxdepth 1 -type f -name "*.md" | sort
}

generate_diagram_pngs() {
  if [[ ! -d "$DIAGRAM_DIR" ]]; then
    return 0
  fi

  mapfile -t mmd_files < <(find "$DIAGRAM_DIR" -maxdepth 1 -type f -name "*.mmd" | sort)
  if [[ "${#mmd_files[@]}" -eq 0 ]]; then
    return 0
  fi

  if ! command -v mmdc >/dev/null 2>&1; then
    echo "Error: mmdc tidak ditemukan. Install dulu: npm i -g @mermaid-js/mermaid-cli" >&2
    exit 1
  fi

  echo "Generating diagram PNG(s)..."
  for src in "${mmd_files[@]}"; do
    out="${src%.mmd}.png"
    mmdc -i "$src" -o "$out" -b transparent
    echo "  - $out"
  done
}

build_pdf() {
  local output_file="$1"
  local doc_title="$2"
  shift 2
  local files=("$@")

  if [[ "${#files[@]}" -eq 0 ]]; then
    echo "Error: tidak ada file markdown untuk dibuild: $doc_title" >&2
    exit 1
  fi

  pandoc     "${files[@]}"     --from markdown     --toc     --standalone     --resource-path="$WHITEPAPER_DIR:$DIAGRAM_DIR:$ROOT_DIR"     --metadata title="$doc_title"     --pdf-engine="$PDF_ENGINE"     -o "$output_file"

  echo "PDF berhasil dibuat: $output_file"
}

files=()

while IFS= read -r file; do
  files+=("$file")
done < <(collect_markdown_files "$WHITEPAPER_DIR")

if [[ -f "$WHITEPAPER_DIR/appendix/glossary.md" ]]; then
  files+=("$WHITEPAPER_DIR/appendix/glossary.md")
fi

while IFS= read -r file; do
  files+=("$file")
done < <(collect_markdown_files "$DIAGRAM_DIR")

generate_diagram_pngs
build_pdf "$OUTPUT_PDF" "Active Foremoz Whitepaper" "${files[@]}"
