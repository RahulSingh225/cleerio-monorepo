#!/bin/bash
set -e

# Replace the placeholder API URL with the real one at runtime
if [ -n "$NEXT_PUBLIC_API_URL" ]; then
  echo "Replacing API URL placeholder with $NEXT_PUBLIC_API_URL..."
  # Use find to locate all JS files in the .next directory and replace the placeholder
  find apps/dashboard/.next -type f -name "*.js" -exec sed -i "s|__NEXT_PUBLIC_API_URL_PLACEHOLDER__|$NEXT_PUBLIC_API_URL|g" {} +
else
  echo "Warning: NEXT_PUBLIC_API_URL is not set. Using default built-in values."
fi

# Start the Next.js application
echo "Starting Next.js dashboard..."
exec node_modules/.bin/next start apps/dashboard --port 3000
