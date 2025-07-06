#!/bin/bash

REDIS_HOST="103.250.133.86"
REDIS_PORT=6379
REDIS_DB=0

cursor=0
fileUrls=()

while :; do
  # Run SCAN command remotely and parse output
  # Format: first line = new cursor, following lines = keys
  result=$(redis-cli -h "$REDIS_HOST" -p "$REDIS_PORT" -n "$REDIS_DB" SCAN "$cursor" MATCH "presigned-url:*")
  
  # Get new cursor (first line)
  cursor=$(echo "$result" | head -n1)
  
  # Get keys (from second line)
  keys=$(echo "$result" | tail -n +2)

  # For each key, get value
  for key in $keys; do
    # Get value of the key
    url=$(redis-cli -h "$REDIS_HOST" -p "$REDIS_PORT" -n "$REDIS_DB" GET "$key")
    if [[ -n "$url" ]]; then
      fileUrls+=("$url")
    fi
  done

  # If cursor is 0, done scanning
  if [[ "$cursor" == "0" ]]; then
    break
  fi
done

# Join array with commas
fileUrlsJson=$(printf ", %s" "${fileUrls[@]}")
fileUrlsJson="[${fileUrlsJson:2}]"

# Output JSON file
cat <<EOF > zip-request-dto.json
{
  "fileUrls": $fileUrlsJson,
  "zipFileName": "my-archive.zip"
}
EOF

echo "Generated zip-request-dto.json with ${#fileUrls[@]} URLs"
