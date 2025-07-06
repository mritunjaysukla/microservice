#!/bin/bash

REDIS_HOST="103.250.133.86"
REDIS_PORT=6379
REDIS_DB=0

cursor=0
fileUrls=()

while :; do
  # SCAN Redis keys with match pattern
  mapfile -t result < <(redis-cli -h "$REDIS_HOST" -p "$REDIS_PORT" -n "$REDIS_DB" SCAN "$cursor" MATCH "presigned-url:*")

  cursor="${result[0]}"

  # From index 1 onward are keys
  for ((i=1; i<${#result[@]}; i++)); do
    key="${result[i]}"
    # Get value of key (already JSON quoted string)
    url=$(redis-cli -h "$REDIS_HOST" -p "$REDIS_PORT" -n "$REDIS_DB" GET "$key")

    if [[ -n "$url" ]]; then
      fileUrls+=("$url")
    fi
  done

  [[ "$cursor" == "0" ]] && break
done

# Join the already quoted URLs with commas, wrap in []
json_urls="["
for url in "${fileUrls[@]}"; do
  json_urls+="$url,"
done
json_urls="${json_urls%,}]"  # remove trailing comma, add closing bracket

# Write JSON file
cat <<EOF > zip-request-dto.json
{
  "fileUrls": $json_urls,
  "zipFileName": "my-archive.zip"
}
EOF

echo "Generated zip-request-dto.json with ${#fileUrls[@]} URLs"
