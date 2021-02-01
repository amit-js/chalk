#!/bin/bash
export APP_PORT=5000
#!npm start
#!node dist/main.js

# --inspect-brk  

nodemon  --inspect-brk  src/server.ts
