#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
AUDIO_DIR="$ROOT/audio"
JOBS_FILE="$AUDIO_DIR/download-jobs.tsv"
FAIL_FILE="$AUDIO_DIR/download-failures.tsv"
GOOGLE_TTS_IP="142.251.34.202"

node "$ROOT/scripts/generate-tts-jobs.mjs" >/dev/null
mkdir -p "$AUDIO_DIR"
: > "$FAIL_FILE"

total="$(wc -l < "$JOBS_FILE" | tr -d ' ')"
count=0
downloaded=0
skipped=0
failed=0

while IFS=$'\t' read -r file_path url; do
  count=$((count + 1))
  mkdir -p "$(dirname "$file_path")"

  if [ -s "$file_path" ]; then
    skipped=$((skipped + 1))
  else
    temp_path="${file_path}.part"

    if curl -L --fail --silent --show-error --connect-timeout 10 --max-time 30 --retry 3 --retry-delay 2 --resolve "translate.googleapis.com:443:${GOOGLE_TTS_IP}" --output "$temp_path" "$url"; then
      mv "$temp_path" "$file_path"
      downloaded=$((downloaded + 1))
      sleep 0.12
    else
      rm -f "$temp_path"
      failed=$((failed + 1))
      printf '%s\t%s\n' "$file_path" "$url" >> "$FAIL_FILE"
    fi
  fi

  if [ $((count % 25)) -eq 0 ] || [ "$count" -eq "$total" ]; then
    echo "progress ${count}/${total} downloaded=${downloaded} skipped=${skipped} failed=${failed}"
  fi
done < "$JOBS_FILE"

echo "done total=${total} downloaded=${downloaded} skipped=${skipped} failed=${failed}"
echo "jobs=${JOBS_FILE}"
echo "failures=${FAIL_FILE}"
