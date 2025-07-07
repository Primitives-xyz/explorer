#!/bin/bash

# Run the fetch action names script with options

# Default values
BATCH_SIZE=${BATCH_SIZE:-100}
IGNORE_CACHE=${IGNORE_CACHE:-false}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    --ignore-cache)
      IGNORE_CACHE=true
      shift
      ;;
    --batch-size)
      BATCH_SIZE="$2"
      shift 2
      ;;
    --all)
      BATCH_SIZE=10000
      shift
      ;;
    *)
      echo "Unknown option: $1"
      echo "Usage: $0 [--ignore-cache] [--batch-size N] [--all]"
      exit 1
      ;;
  esac
done

echo "Running fetch-action-names with:"
echo "  BATCH_SIZE=$BATCH_SIZE"
echo "  IGNORE_CACHE=$IGNORE_CACHE"
echo ""

# Run the script
BATCH_SIZE=$BATCH_SIZE IGNORE_CACHE=$IGNORE_CACHE npx tsx scripts/fetch-action-names.ts 