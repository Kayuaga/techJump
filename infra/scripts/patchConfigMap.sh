required_vars=("CONFIG_MAP_NAME" "VARIABLE_NAME" "VALUE" "NAME_SPACE")
for var in "${required_vars[@]}"; do
  if [[ -z "${!var}" ]]; then
    echo "Error: Environment variable $var is not set."
    exit 1
  fi
done

echo "Patching config map..."
#kubectl patch configmap "$CONFIG_MAP_NAME" --type=merge -p "{\"data\": {\"$VARIABLE_NAME\": \"$VALUE\"}}" -n="$NAME_SPACE"
