import os; B = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
"""Kärnten: Gemeinderats- und Bürgermeisterwahl 28.02.2021, Stichwahl 14.03.2021, amtliche Ergebnisse des Landes.

Quellen (ausgelesen 11.11.2026 im Browser, abgelegt unter roh/):
- roh/ktn21_gr.txt: Gemeinderatswahl 2021 je Gemeinde mit Vergleich 2015 (ktn.gv.at/wahlen/grwahl2021/gr2021_<GKZ>.html)
- roh/ktn21_bgm.txt: gewählte Bürgermeister (bd2021_<GKZ>.html, Stichwahl bs2021_<GKZ>.html), Wahlberechtigte 2021, Beteiligung 2015
Vizebürgermeister stehen nicht in der amtlichen Quelle; sie kommen weiter aus dem Datawrapper-Datensatz und sind so gekennzeichnet.
Schreibt daten/ktn.json und daten/vor_ktn.json (Wahl 2015 als Vergleich).
"""
import csv, json, re, sys, collections, difflib
sys.path.insert(0, B + "/src"); from gemeinsam import gruppe, karte, norm, namensindex, zahl, GRUPPEN
R = B + "/roh/"
K = karte(); GI = {g: i for i, g in enumerate(GRUPPEN)}
QG = "Amt der Kärntner Landesregierung, Gemeinderatswahl 28.02.2021 (ktn.gv.at/wahlen/grwahl2021)"
QB1 = "Amt der Kärntner Landesregierung, Bürgermeisterwahl 28.02.2021 (ktn.gv.at/wahlen/bgmwahl2021)"
QB2 = "Amt der Kärntner Landesregierung, Bürgermeister-Stichwahl 14.03.2021 (ktn.gv.at/wahlen/bgmstichwahl2021)"

G, P, B, W = {}, collections.defaultdict(list), {}, {}
for z in open(R + "ktn21_gr.txt", encoding="utf-8"):
    if z.startswith("#") or not z.strip(): continue
    p = z.rstrip("\n").split("|")
    if p[0] == "G": G[p[1]] = p
    else: P[p[1]].append(p)
for z in open(R + "ktn21_bgm.txt", encoding="utf-8"):
    if z.startswith("#") or not z.strip(): continue
    p = z.rstrip("\n").split("|")
    if p[0] in "BS":
        trenn = " / " if p[0] == "B" else " - "
        name, liste = p[2].rsplit(trenn, 1)
        B[p[1]] = (name.strip(), liste.strip(), p[0] == "S", float(p[3].replace(",", ".")))
    elif p[0] == "W": W[p[1]] = (int(p[2]), float(p[3].replace(",", ".")))

# Vizebürgermeister und Namensabgleich aus dem Datawrapper-Datensatz
idx = namensindex(2); dw = {}
for r in csv.DictReader(open(B + "/roh/ktn_datawrapper_PrrAp.csv", encoding="utf-8")):
    t = idx.get(norm(r["Gemeinde"].strip()))
    if t and r["Typ"]: dw[t[0]] = r
def person(s):
    m = re.match(r"(.+?)\s*\(([^)]+)\)\s*$", s or "")
    return (m.group(1).strip(), m.group(2).strip()) if m else ((s or "").strip(), "")
def umdrehen(n):
    """'Scheider Christian' -> 'Christian Scheider', Titel nach dem Komma bleiben hinten."""
    teil, _, titel = n.partition(",")
    w = teil.split()
    if len(w) >= 2 and not re.search(r"\b(Ing|Dr|Mag|DI)\b", teil): teil = " ".join(w[1:] + w[:1])
    return teil + ("," + titel if titel else "")

aus, vor, pruef = [], {}, []
for g, p in G.items():
    if g not in K["namen"]: print("GKZ ohne Fläche", g, p[3]); continue
    wb, bet15 = W[g]
    ab, ung, gu, ab15, ung15, gu15 = (int(x) for x in p[6:12])
    listen = [{"name": x[2], "gruppe": gruppe(x[2]), "stimmen": int(x[3]), "mandate": int(x[4])} for x in P[g] if x[3]]
    l15 = [{"name": x[2], "gruppe": gruppe(x[2]), "stimmen": int(x[5]), "mandate": int(x[6])} for x in P[g] if x[5]]
    bn, bl, stich, anteil = B[g]
    bgm = {"name": bn, "partei": bl, "gruppe": gruppe(bl), "direktwahl": True, "wahlgang": 2 if stich else 1,
           "anteil": anteil, "quelle": QB2 if stich else QB1}
    r = dw.get(g); vize = []
    if r:
        vize = [{"name": v[0], "partei": v[1], "gruppe": gruppe(v[1]), "quelle": "Datawrapper-Datensatz"} for v in (person(r["Vizebürgermeister 1"]), person(r["Vizebürgermeister 2"])) if v[0]]
        dn, _ = person(r["Bürgermeister"])
        fam = lambda n: [w for w in norm(n).split() if len(w) > 3]
        gleich = dn and any(difflib.SequenceMatcher(None, a, b).ratio() > 0.8 for a in fam(dn) for b in fam(bn))
        kopie = dn and any(set(fam(dn)) <= set(fam(v[0])) for k, v in B.items() if k != g)   # Kopierfehler: Bürgermeister einer anderen Gemeinde
        if dn and not gleich and not kopie:
            bgm["quelle"] += f"; laut Datawrapper-Datensatz inzwischen {dn}"
            pruef.append((g, p[3], bn, dn))
    aus.append({"gkz": g, "name": K["namen"][g], "land": "Kärnten", "wahl": "Gemeinderatswahl 2021", "datum": "28.02.2021",
                "wb": wb, "abgegeben": ab, "gueltig": gu, "mandate": sum(l["mandate"] for l in listen), "listen": listen,
                "hinweis": None, "bgm": bgm, "vize": vize, "quelle": QG})
    a = [0.0] * 7; m = [0] * 7
    for l in l15: a[GI[l["gruppe"]]] += l["stimmen"]; m[GI[l["gruppe"]]] += l["mandate"]
    vor[g] = {"datum": "01.03.2015", "wahl": "Gemeinderatswahl 2015", "quelle": "Amt der Kärntner Landesregierung, Vergleichsspalte GR2015 der Ergebnisse 2021",
              "a": [round(100 * x / gu15, 2) for x in a], "m": m, "bet": bet15}
json.dump(aus, open(B + "/daten/ktn.json", "w"), ensure_ascii=False, indent=0)
json.dump(vor, open(B + "/daten/vor_ktn.json", "w"), ensure_ascii=False)
print(len(aus), "Gemeinden, Stichwahl", sum(1 for a in aus if a["bgm"]["wahlgang"] == 2), "| Bürgermeister laut Datawrapper abweichend:", len(pruef))
for x in pruef: print("  ", x)
