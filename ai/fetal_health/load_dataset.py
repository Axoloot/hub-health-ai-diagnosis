import csv
import numpy as np
import random


def format_fetal_health_label(y):
    if y == '3.0' or y == '2.0':
        return 1
    return 0


def load_fetal_health_dataset(dataset_path, training_size):
    print('Getting breast cancer dataset...')

    with open(dataset_path, newline='') as f:
        reader = csv.reader(f)
        dataset = list(reader)
        dataset = dataset[1:]
        random.shuffle(dataset)

        d_data = [d[:-1] for d in dataset]
        l_data = [d[-1] for d in dataset]

        d = [[float(x) for x in data] for data in d_data]
        l = [[format_fetal_health_label(y)] for y in l_data]
        np.random.shuffle(dataset)

        x_train = d[:training_size]
        x_test = d[training_size:]
        y_train = l[:training_size]
        y_test = l[training_size:]

        print('Breast cancer dataset ready to be used')
        return x_train, y_train, x_test, y_test
