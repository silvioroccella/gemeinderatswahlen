import os; B = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
"""Steiermark: Gemeinderatswahl 23.03.2025 (ohne Graz), Amt der Stmk. Landesregierung, Stimmenprotokoll endgültig (xlsx), Zuordnung laut Quelle."""
import json, sys, pandas as pd
sys.path.insert(0, B + "/src"); from gemeinsam import zahl
x = pd.read_excel(B + "/roh/stmk_gr25.xlsx")
ZU = {"ÖVP": "ÖVP", "SPÖ": "SPÖ", "FPÖ": "FPÖ", "GRÜNE": "GRÜNE", "NEOS": "NEOS", "KPÖ": "KPÖ"}
aus = {}
for _, r in x.iterrows():
    g = str(int(r["GEMNR"]))
    a = aus.setdefault(g, {"gkz": g, "name": str(r["GEMNAME"]).strip(), "land": "Steiermark", "wahl": "Gemeinderatswahl 2025", "datum": "23.03.2025",
                           "wb": zahl(r["WAHLBE_GR25"]), "abgegeben": zahl(r["GES_GR25"]), "gueltig": zahl(r["GUEL_GR25"]), "listen": [],
                           "quelle": "Amt der Steiermärkischen Landesregierung, GR2025 Stimmenprotokoll endgültig (xlsx)"})
    zu = str(r["PARTEI_ZU"]).strip().upper()
    a["listen"].append({"name": str(r["PARTEI"]).strip(), "gruppe": ZU.get(zu, ZU.get(zu.replace("DIE ", ""), "Liste")), "zuordnung_quelle": str(r["PARTEI_ZU"]).strip(),
                        "stimmen": zahl(r["STIMMEN_GR25"]), "mandate": zahl(r["MAND_GR25"]) or 0})
for a in aus.values():
    a["listen"].sort(key=lambda l: -(l["stimmen"] or 0)); a["mandate"] = sum(l["mandate"] for l in a["listen"])
json.dump(list(aus.values()), open(B + "/daten/stmk.json", "w"), ensure_ascii=False, indent=0)
import collections; print(len(aus), collections.Counter(l["zuordnung_quelle"] for a in aus.values() for l in a["listen"]).most_common(12))
