# HUB-Health: AI models

Training code for the four screening models used by the web app. Each folder contains:

- `load_dataset.py`: reads the dataset and builds the train/test split
- `train.py`: defines, trains and saves the Keras model to `model/` (TensorFlow SavedModel)
- `model/`: the trained model that was committed

| Folder | Dataset | Label (1 = sick) |
|---|---|---|
| `heart_disease/` | `heart_disease.csv` (UCI Heart Disease, Kaggle version) | `target == 1` |
| `breast_cancer/` | `breast_cancer.csv` (Breast Cancer Wisconsin Diagnostic) | `diagnosis == M` |
| `fetal_health/` | `fetal_health.csv` (Fetal Health Classification, CTG) | suspect or pathological |
| `chest_xray/` | Chest X-Ray Images (Pneumonia), **not included** | `PNEUMONIA` |

For the chest X-ray model, download the Kaggle dataset into
`chest_xray/chest_xray_dataset/{train,test}/{NORMAL,PNEUMONIA}/` before running `train.py`.

## Using the models in the web app

The web app runs the models in the browser with TensorFlow.js. After retraining, convert them:

```bash
python3.11 -m venv .venv && .venv/bin/pip install -r ai/requirements-convert.txt
PATH=.venv/bin:$PATH ai/convert_to_tfjs.sh   # writes web/public/models/<name>/
```

The browser preprocessing in `web/src/lib/ai/index.ts` must match `load_dataset.py`. The models
take raw, unscaled features in CSV column order, and the X-ray model takes 48×48 grayscale pixels
in 0–255.
