import numpy as np

LR = 0.1


def _donnees():
    rng = np.random.default_rng(0)
    X = rng.normal(size=(50, 2))
    w_vrai = np.array([2.0, -3.0])
    return X, X @ w_vrai, w_vrai


def _gradient_en_zero():
    X, y, _ = _donnees()
    return (2 / len(y)) * X.T @ (X @ np.zeros(2) - y)


def _un_pas(student):
    X, y, _ = _donnees()
    return np.asarray(student.descente_gradient(X, y, LR, 1), dtype=float)


def test_renvoie_un_vecteur_de_la_bonne_forme(student):
    w = _un_pas(student)
    assert w.shape == (2,), f"w devrait avoir la forme (2,), il a la forme {w.shape}"


def test_premier_pas_correct(student):
    w = _un_pas(student)
    attendu = -LR * _gradient_en_zero()
    assert np.allclose(w, attendu), f"après un pas, w vaut {w} au lieu de {attendu}"


def test_converge_vers_la_solution(student):
    X, y, w_vrai = _donnees()
    w = np.asarray(student.descente_gradient(X, y, LR, 500), dtype=float)
    assert np.allclose(w, w_vrai, atol=1e-3), f"après 500 pas, w vaut {w} au lieu de {w_vrai}"


# Diagnostics : (identifiant, message, prédicat). Évalués dans l'ordre, le
# premier qui reconnaît l'erreur est affiché.
DIAGNOSTICS = [
    (
        "w-jamais-mis-a-jour",
        "w ne change pas : ta boucle ne met jamais w à jour.",
        lambda s: np.allclose(_un_pas(s), 0),
    ),
    (
        "signe-inverse",
        "Ton gradient a le signe inversé : tu montes la pente au lieu de la descendre. "
        "La mise à jour est w = w - lr * gradient.",
        lambda s: np.allclose(_un_pas(s), LR * _gradient_en_zero()),
    ),
    (
        "moyenne-oubliee",
        "Tu as oublié de diviser par le nombre d'exemples : le coût est une moyenne, "
        "son gradient aussi.",
        lambda s: np.allclose(_un_pas(s), -LR * _gradient_en_zero() * 50),
    ),
    (
        "facteur-2-oublie",
        "Il manque le facteur 2 qui vient de la dérivée du carré.",
        lambda s: np.allclose(_un_pas(s), -LR * _gradient_en_zero() / 2),
    ),
]
