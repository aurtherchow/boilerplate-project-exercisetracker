# Use the official Nginx image from Docker Hub
FROM nginx:latest

# Install OpenSSL and curl
RUN apt-get update && apt-get install -y openssl curl

# Create a directory for the SSL certificates
RUN mkdir -p /etc/nginx/ssl

# Create OpenSSL configuration file
RUN echo "[req]\n\
default_bits       = 2048\n\
prompt             = no\n\
default_md         = sha256\n\
req_extensions     = req_ext\n\
distinguished_name = dn\n\
[dn]\n\
C  = US\n\
ST = State\n\
L  = City\n\
O  = Organization\n\
OU = Department\n\
CN = localhost\n\
[req_ext]\n\
subjectAltName = @alt_names\n\
[alt_names]\n\
IP.1 = 127.0.0.1\n" > /etc/nginx/ssl/openssl.cnf

# Generate the self-signed certificate
RUN openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout /etc/nginx/ssl/key.pem -out /etc/nginx/ssl/cert.pem -config /etc/nginx/ssl/openssl.cnf

# Copy custom Nginx configuration file
COPY nginx.conf /etc/nginx/nginx.conf

# Copy entrypoint script
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Expose ports 80 and 443
EXPOSE 80 443

# Set entrypoint
ENTRYPOINT ["/entrypoint.sh"]
