#!/bin/bash

# Set git configuration with your name and email
git config user.name "Prajwolpakka"
git config user.email "prajwolpakka@gmail.com"

# Check if there are any changes to commit
if [[ -z $(git status --porcelain) ]]; then
  echo "No changes to commit."
  exit 0
fi

# Get commit message from command-line argument
commit_message="$1"

# If no commit message is provided, exit with an error
if [[ -z "$commit_message" ]]; then
  echo "Error: Commit message is required."
  echo "Usage: $0 \"Your commit message\""
  exit 1
fi

# Add all changes
git add .

# Commit with the provided message
git commit -m "$commit_message"

# Get current branch name
current_branch=$(git symbolic-ref --short HEAD)

# Push to remote repository
git push origin $current_branch

echo "Changes committed and pushed to remote repository on branch $current_branch"