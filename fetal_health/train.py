import numpy as np
import tensorflow as tf

from load_dataset import load_fetal_health_dataset

x_train, y_train, x_test, y_test = load_fetal_health_dataset('./fetal_health.csv', 1500)

print(np.shape(x_train))
print(np.shape(x_test))
model = tf.keras.models.Sequential([
  tf.keras.layers.Flatten(input_shape=(20,)),
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
    epochs=10,
    validation_data=(x_test, y_test),
)

print('Saving...')
model.save('model')

print('Loading...')
model = tf.keras.models.load_model('model')

scores = model.evaluate(x_test, y_test)
print("Neural network accuracy: %.2f%%" % (scores[1]*100))
