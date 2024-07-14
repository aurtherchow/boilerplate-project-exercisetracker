#!/bin/bash

# Fetch the public IP automatically
PUBLIC_IP=$(curl -s https://api.ipify.org)

# Check if PUBLIC_IP was fetched successfully
if [ -z "$PUBLIC_IP" ]; then
  echo "Error: Unable to fetch public IP."
  exit 1
fi

# Replace placeholder with the actual public IP in the Nginx configuration
sed -i "s/PLACEHOLDER_PUBLIC_IP/$PUBLIC_IP/g" /etc/nginx/nginx.conf

# Start Nginx
nginx -g 'daemon off;'
