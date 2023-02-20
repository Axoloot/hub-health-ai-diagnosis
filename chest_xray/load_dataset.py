import os
import numpy as np
from PIL import Image, ImageOps

labels = ['NORMAL', 'PNEUMONIA']


def load_data_from_dir(dir):
    x, y = [], []
    listdir = os.listdir(dir)
    for t in listdir:
        label = t
        print('label', t)
        files = os.listdir(dir + '/' + t)
        i = 0
        for f in files:
            i += 1
            image = Image.open(dir + '/' + label + '/' + f)
            image = ImageOps.grayscale(image)
            new_size = (48, 48)
            image = image.resize(new_size)
            x.append((np.asarray(image)).tolist())
            y.append([labels.index(label)])
            image.close()
    return x, y


def load_chest_xray_dataset(train_path, test_path):
    print('Getting chest xray dataset...')
    x_train, y_train = load_data_from_dir(train_path)
    x_test, y_test = load_data_from_dir(test_path)
    print('------------')
    print(np.shape(x_train), np.shape(y_train))
    print(np.shape(x_test), np.shape(y_test))
    return x_train, y_train, x_test, y_test
