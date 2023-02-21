import numpy as np
import tensorflow as tf

from load_dataset import load_fetal_health_dataset

x_train, y_train, x_test, y_test = load_fetal_health_dataset('./fetal_health.csv', 1500)

model = tf.keras.models.Sequential([
  tf.keras.layers.Flatten(input_shape=(21,)),
  tf.keras.layers.Dense(40, activation='relu'),
  tf.keras.layers.Dense(20, activation='softmax'),
  tf.keras.layers.Dense(1)
])

model.compile(
    optimizer='adam',
    loss='mean_squared_error',
    metrics=['accuracy']
)

model.fit(
    x_train,
    y_train,
    epochs=15,
    validation_data=(x_test, y_test),
)

print('Saving...')
model.save('model')

print('Loading...')
model = tf.keras.models.load_model('model')

scores = model.evaluate(x_test, y_test)
print("Neural network accuracy: %.2f%%" % (scores[1]*100))
