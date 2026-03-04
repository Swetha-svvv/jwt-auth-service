#!/bin/bash

echo "Creating keys directory..."
mkdir -p keys

echo "Generating private key..."
openssl genrsa -out keys/private.pem 2048

echo "Generating public key..."
openssl rsa -in keys/private.pem -pubout -out keys/public.pem

echo "✅ RSA keys generated successfully!"