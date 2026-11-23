#!/usr/bin/env bash
# Convert the trained Keras SavedModels to TF.js graph models for in-browser inference.
# Requires: pip install -r ai/requirements-convert.txt
set -euo pipefail
cd "$(dirname "$0")"
OUT=../web/public/models
for model in heart_disease breast_cancer fetal_health chest_xray; do
  rm -rf "$OUT/$model"
  tensorflowjs_converter \
    --input_format=tf_saved_model \
    --output_format=tfjs_graph_model \
    --signature_name=serving_default \
    --saved_model_tags=serve \
    "$model/model" "$OUT/$model"
  echo "converted $model -> $OUT/$model"
done
