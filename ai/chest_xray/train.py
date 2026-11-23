import numpy as np
import tensorflow as tf

from load_dataset import load_chest_xray_dataset

x_train, y_train, x_test, y_test = load_chest_xray_dataset('./chest_xray_dataset/train', './chest_xray_dataset/test')

model = tf.keras.models.Sequential()
model.add(tf.keras.layers.Conv2D(48, (4, 4), activation='relu', input_shape=(48, 48, 1)))
model.add(tf.keras.layers.MaxPooling2D((3, 3)))
model.add(tf.keras.layers.Conv2D(64, (4, 4), activation='relu'))
model.add(tf.keras.layers.MaxPooling2D((3, 3)))
model.add(tf.keras.layers.Conv2D(64, (3, 3), activation='relu'))

model.add(tf.keras.layers.Flatten())
model.add(tf.keras.layers.Dense(64, activation='relu'))
model.add(tf.keras.layers.Dense(2))

model.compile(
    optimizer='adam',
    loss=tf.keras.losses.SparseCategoricalCrossentropy(from_logits=True),
    metrics=['accuracy']
)

model.fit(
    x_train,
    y_train,
    epochs=10,
    validation_data=(x_test, y_test),
)

print('Saving...')
model.save('model')

print('Loading...')
model = tf.keras.models.load_model('model')

scores = model.evaluate(x_test, y_test)
print("Neural network accuracy: %.2f%%" % (scores[1]*100))
