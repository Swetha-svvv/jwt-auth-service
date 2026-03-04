#!/bin/bash

API="http://localhost:5000"

echo "Registering user..."

REGISTER=$(curl -s -X POST $API/auth/register \
-H "Content-Type: application/json" \
-d '{"username":"yashu","email":"yashu@test.com","password":"Pass@123"}')

echo $REGISTER

echo "Logging in..."

LOGIN=$(curl -s -X POST $API/auth/login \
-H "Content-Type: application/json" \
-d '{"username":"testuser","password":"Pass@123"}')

echo $LOGIN

ACCESS=$(echo $LOGIN | sed -n 's/.*"access_token":"\([^"]*\)".*/\1/p')
REFRESH=$(echo $LOGIN | sed -n 's/.*"refresh_token":"\([^"]*\)".*/\1/p')

echo "Access Token:"
echo $ACCESS

echo "Calling profile..."

curl -s $API/api/profile \
-H "Authorization: Bearer $ACCESS"

echo ""
echo "Refreshing token..."

curl -s -X POST $API/auth/refresh \
-H "Content-Type: application/json" \
-d "{\"refresh_token\":\"$REFRESH\"}"

echo ""
echo "Logging out..."

curl -s -X POST $API/auth/logout \
-H "Content-Type: application/json" \
-d "{\"refresh_token\":\"$REFRESH\"}"

echo ""
echo "Flow completed."