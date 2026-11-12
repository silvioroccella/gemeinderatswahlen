import os; B = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
"""Vorarlberg: Gemeindewahl 16.03.2025, Amt der Vorarlberger Landesregierung (apps.vorarlberg.at/wahlen), endgültige Ergebnisse."""
import json, sys, pandas as pd
sys.path.insert(0, B + "/src"); from gemeinsam import zahl, gruppe, namensindex, norm
R = B + "/roh/vbg_Gemeindewahl_2025_-_"
idx = namensindex(8)
def gkz(n):
    t = idx.get(norm(n)); 
    if not t: raise SystemExit("ohne GKZ: " + n)
    return t[0]
def bloecke(datei):
    x = pd.read_excel(datei, header=None); akt = None; out = []
    for i in range(4, len(x)):
        r = x.iloc[i].tolist()
        if str(r[0]).strip().isdigit():
            akt = {"name": str(r[1]).strip(), "wb": zahl(r[3]), "abg": zahl(r[4]), "ung": zahl(r[6]), "gue": zahl(r[8]), "zeilen": []}; out.append(akt)
        elif akt is not None and str(r[2]) != "nan":
            akt["zeilen"].append(r)
    return out
aus = {}
for b in bloecke(R + "GV_endgültiges_Ergebnis.xlsx"):
    g = gkz(b["name"]); listen = []; hinweis = None
    for r in b["zeilen"]:
        if zahl(r[9]) is None: hinweis = str(r[2]).strip(); continue
        listen.append({"name": str(r[2]).strip(), "gruppe": gruppe(str(r[2])), "stimmen": zahl(r[9]), "mandate": zahl(r[11]) or 0})
    aus[g] = {"gkz": g, "name": b["name"], "land": "Vorarlberg", "wahl": "Gemeindevertretungswahl 2025", "datum": "16.03.2025",
              "wb": b["wb"], "abgegeben": b["abg"], "gueltig": b["gue"], "mandate": sum(l["mandate"] for l in listen) or None, "listen": listen,
              "hinweis": hinweis, "quelle": "Amt der Vorarlberger Landesregierung, Gemeindewahl 2025, endgültiges Ergebnis (xlsx)"}
def bgm(datei, wahlgang):
    for b in bloecke(datei):
        g = gkz(b["name"]); kand = []
        for r in b["zeilen"]:
            if zahl(r[9]) is None: continue
            kand.append({"name": str(r[2]).strip(), "liste": str(r[3]).strip() if str(r[3]) != "nan" else "", "stimmen": zahl(r[9]), "anteil": zahl(r[10])})
        gew = None
        if len(kand) == 2 and kand[0]["name"].endswith("- JA"):
            if kand[0]["stimmen"] > kand[1]["stimmen"]: gew = {"name": kand[0]["name"][:-5], "liste": kand[0]["liste"], "anteil": kand[0]["anteil"]}
        else:
            k = max(kand, key=lambda k: k["stimmen"])
            if wahlgang == 2 or k["stimmen"] * 2 > b["gue"]: gew = {"name": k["name"], "liste": k["liste"], "anteil": k["anteil"]}
        if gew:
            aus[g]["bgm"] = {"name": gew["name"], "partei": gew["liste"], "gruppe": gruppe(gew["liste"]), "direktwahl": True, "wahlgang": wahlgang,
                             "anteil": gew["anteil"], "quelle": "Bürgermeisterdirektwahl 2025" + (" (Stichwahl 30.03.2025)" if wahlgang == 2 else "")}
bgm(R + "Bgm_endgültiges_Ergebnis.xlsx", 1)
bgm(R + "Bgm-Stichwahl_endgültiges_Ergebnis.xlsx", 2)
json.dump(list(aus.values()), open(B + "/daten/vbg.json", "w"), ensure_ascii=False, indent=0)
print(len(aus), sum(1 for a in aus.values() if a.get("bgm")))
