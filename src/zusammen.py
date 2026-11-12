import os; B = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
"""Führt die Länderdateien zusammen und prüft gegen die Kartengeometrie."""
import json, sys, collections
sys.path.insert(0, B + "/src"); from gemeinsam import karte
K = karte(); alias = dict(K["kopf"]["alias"]); alias.update({"62252": "62280", "62267": "62280"})
alle = {}
for f in ["bgld", "ktn", "noe", "ooe", "sbg", "stmk", "graz", "tirol", "tirol_nach", "vbg", "wien"]:
    for a in json.load(open(f"{B}/daten/{f}.json")):
        if a["gkz"] in alle and f != "tirol_nach": print("doppelt", a["gkz"], a["name"])
        alle[a["gkz"]] = a
geo = set(K["gemeinden"])
ziel = {alias.get(g, g) for g in geo}
fehlt = sorted(g for g in ziel if g not in alle)
ueber = sorted(g for g in alle if g not in ziel)
print("Datensätze", len(alle), "Kartenflächen", len(geo), "fehlend", len(fehlt), "ohne Fläche", ueber)
for g in fehlt: print("  fehlt", g, K["namen"].get(g))
json.dump(alle, open(B + "/daten/alle.json", "w"), ensure_ascii=False)
