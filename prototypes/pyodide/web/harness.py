# Harnais d'exécution et de correction, chargé une fois dans le worker.
import contextlib
import io
import json
import traceback
import types

FICHIER = "<apprenant>"


def _executer(code):
    """Exécute le code de l'apprenant dans un espace de noms neuf."""
    sortie = io.StringIO()
    ns = {"__name__": "__main__"}
    erreur = None
    with contextlib.redirect_stdout(sortie), contextlib.redirect_stderr(sortie):
        try:
            exec(compile(code, FICHIER, "exec"), ns)
        except KeyboardInterrupt:
            raise
        except BaseException as e:
            erreur = _decrire(e)
    return ns, sortie.getvalue(), erreur


def _decrire(e):
    """Ne garde de la trace que ce qui concerne le code de l'apprenant."""
    lignes = [f.lineno for f in traceback.extract_tb(e.__traceback__) if f.filename == FICHIER]
    if isinstance(e, SyntaxError) and e.filename == FICHIER:
        lignes = [e.lineno]
    return {
        "type": type(e).__name__,
        "message": str(e),
        "ligne": lignes[-1] if lignes else None,
    }


def run(code):
    _, sortie, erreur = _executer(code)
    return json.dumps({"statut": "erreur" if erreur else "ok", "stdout": sortie, "erreur": erreur})


def grade(code, tests_src):
    ns, sortie, erreur = _executer(code)
    if erreur:
        return json.dumps({"statut": "erreur", "stdout": sortie, "erreur": erreur})

    student = types.SimpleNamespace(**ns)
    tns = {}
    exec(compile(tests_src, "<tests>", "exec"), tns)

    tests = []
    for nom, fn in tns.items():
        if not (nom.startswith("test_") and callable(fn)):
            continue
        try:
            with contextlib.redirect_stdout(io.StringIO()):
                fn(student)
            tests.append({"nom": nom, "reussi": True, "message": None})
        except KeyboardInterrupt:
            raise
        except AssertionError as e:
            tests.append({"nom": nom, "reussi": False, "message": str(e)})
        except BaseException as e:
            tests.append({"nom": nom, "reussi": False, "message": f"{type(e).__name__} : {e}"})

    reussi = all(t["reussi"] for t in tests)
    diagnostic = None
    if not reussi:
        # Premier diagnostic qui reconnaît l'erreur ; un diagnostic qui plante
        # ne reconnaît rien.
        for ident, message, predicat in tns.get("DIAGNOSTICS", []):
            try:
                with contextlib.redirect_stdout(io.StringIO()):
                    if predicat(student):
                        diagnostic = {"id": ident, "message": message}
                        break
            except KeyboardInterrupt:
                raise
            except BaseException:
                pass

    return json.dumps(
        {
            "statut": "reussi" if reussi else "echec",
            "stdout": sortie,
            "tests": tests,
            "diagnostic": diagnostic,
        }
    )
