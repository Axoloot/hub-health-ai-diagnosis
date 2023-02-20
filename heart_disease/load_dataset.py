import csv
import numpy as np


def format_heart_disease_label(y):
    if y == '1':
        return 1
    return 0


def load_breast_cancer_dataset(dataset_path, training_size):
    print('Getting heart disease dataset...')

    with open(dataset_path, newline='') as f:
        reader = csv.reader(f)
        dataset = list(reader)

        d_data = [d[:-1] for d in dataset[1:]]
        l_data = [d[-1] for d in dataset[1:]]

        d = [[float(x) for x in data] for data in d_data]
        l = [[format_heart_disease_label(y)] for y in l_data]
        np.random.shuffle(dataset)

        x_train = d[:training_size]
        x_test = d[training_size:]
        y_train = l[:training_size]
        y_test = l[training_size:]

        print('Heart disease dataset ready to be used')
        return x_train, y_train, x_test, y_test
