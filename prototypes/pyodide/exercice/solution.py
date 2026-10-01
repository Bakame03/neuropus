import numpy as np


def descente_gradient(X, y, lr, n_iter):
    w = np.zeros(X.shape[1])
    n = len(y)
    for _ in range(n_iter):
        gradient = (2 / n) * X.T @ (X @ w - y)
        w = w - lr * gradient
    return w
