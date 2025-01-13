#!/bin/bash
required_vars=("CONFIG_MAP_NAME" "VARIABLE_NAME" "VALUE" "NAME_SPACE")
for var in "${required_vars[@]}"; do
  if [[ -z "${!var}" ]]; then
    echo "Error: Environment variable $var is not set."
    exit 1
  fi
done

echo "Patching config map..."

helm upgrade "$CONFIG_MAP_NAME" ./configmap-helm --set env."$VARIABLE_NAME"="$VALUE" --namespace "$NAME_SPACE" --create-namespace  --install
