import numpy as np


def descente_gradient(X, y, lr, n_iter):
    """Régression linéaire sans biais, coût = moyenne des carrés des erreurs.

    Part de w = 0 et renvoie w après n_iter pas de descente de gradient.
    """
    w = np.zeros(X.shape[1])
    for _ in range(n_iter):
        # À toi : calcule le gradient du coût par rapport à w, puis mets w à jour.
        pass
    return w
