#!/bin/bash

# Check if a commit message was provided
if [ -z "$1" ]; then
  MESSAGE="pembaharuan kode: $(date +'%Y-%m-%d %H:%M:%S')"
else
  MESSAGE="$1"
fi

echo "🚀 Memulai proses update..."

# Add all changes
git add .

# Commit with the message
git commit -m "$MESSAGE"

# Push to origin main
git push origin main

echo "✅ Selesai! Kode Anda sedang dideploy oleh GitHub Actions."
