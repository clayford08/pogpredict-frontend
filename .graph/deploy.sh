#!/bin/bash

# Check if environment variables are set
if [ -z "$GRAPH_ACCESS_TOKEN" ]; then
    echo "Error: GRAPH_ACCESS_TOKEN is not set"
    exit 1
fi

if [ -z "$SUBGRAPH_NAME" ]; then
    echo "Error: SUBGRAPH_NAME is not set"
    exit 1
fi

# Build and deploy subgraph
echo "Building subgraph..."
cd subgraph
npm run codegen
npm run build

echo "Deploying subgraph..."
npm run deploy

echo "Deployment complete!" 