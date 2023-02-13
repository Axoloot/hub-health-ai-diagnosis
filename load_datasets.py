import csv
import numpy as np

# BREAST CANCER DATASET
def format_breast_cancer_label(y):
    if y == 'M':
        return 1
    return 0


def load_breast_cancer_dataset(dataset_patch, training_size):
    print('Getting breast cancer dataset...')

    with open(dataset_patch, newline='') as f:
        reader = csv.reader(f)
        dataset = list(reader)

        d_data = [d[2:] for d in dataset[1:]]
        l_data = [d[1] for d in dataset[1:]]

        d = [[float(x) for x in data] for data in d_data]
        l = [[format_breast_cancer_label(y)] for y in l_data]
        np.random.shuffle(dataset)

        x_train = d[:training_size]
        x_test = d[training_size:]
        y_train = l[:training_size]
        y_test = l[training_size:]

        print('Breast cancer dataset ready to be used')
        return x_train, y_train, x_test, y_test
