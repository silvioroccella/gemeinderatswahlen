import os; B = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
"""Tirol: Gemeinderats- und Bürgermeisterwahlen 27.02.2022 (Land Tirol, wahlen.tirol.gv.at, CSV), dazu Matrei a. Br. 2022 und Innsbruck 2024; engere Wahlen."""
import csv, io, json, re, sys, glob, os
sys.path.insert(0, B + "/src"); from gemeinsam import zahl, gruppe
D = B + "/roh/tirol/"
def lies(datei):
    t = open(datei, encoding="latin-1").read().splitlines()
    return list(csv.DictReader(io.StringIO("\n".join(t[1:])), delimiter=";"))
def wb(r): return zahl(r.get("Wahlberechtigte gesamt") or r.get("Wahlberechtigte"))
WAHLEN = [("gemeinderats_und_buergermeisterwahlen_2022__wahl57", "Gemeinderatswahl 2022", "27.02.2022", "engere_wahl_des_buergermeisters_2022__wahl60", "13.03.2022"),
          ("gemeinderats_und_buergermeisterwahlen_2022_matrei_am_br___wahl59", "Gemeinderatswahl 2022", "20.03.2022", "engere_wahl_des_buergermeisters_2022_matrei_am_br___wahl61", "03.04.2022"),
          ("gemeinderats_und_buergermeisterwahl_der_landeshauptstadt_innsbruck_2024__wahl70", "Gemeinderatswahl 2024", "14.04.2024", "engere_wahl_des_buergermeisters_landeshauptstadt_innsbruck_2024__wahl74", "28.04.2024")]
aus = {}
def kandidaten(r, n_max=12):
    k = []
    for i in range(1, n_max + 1):
        nm = r.get(f"Name/Kandidat{i}")
        if nm:
            m = re.match(r"(.+?)\s*\((.+)\)\s*$", nm.strip())
            if m and m.group(2).strip().upper() in ("FH", "UNI"): m = None
            k.append({"name": m.group(1) if m else nm.strip(), "liste": m.group(2) if m else "", "stimmen": zahl(r.get(f"Stimmen/Kandidat{i}")),
                      "anteil": zahl(r.get(f"Prozente/Kandidat{i}")), "gewaehlt": (r.get(f"BGM/Kandidat{i}") or "").strip().lower() == "ja"})
    return k
for gr, wahl, datum, eng, datum2 in WAHLEN:
    for r in lies(D + gr + ".csv"):
        g = r["Gemeinde_Id"].strip(); listen = []
        for i in range(1, 40):
            nm = r.get(f"Name/Wählergruppe{i}")
            if not nm: continue
            listen.append({"name": nm.strip(), "gruppe": gruppe(nm), "stimmen": zahl(r.get(f"Stimmen/Wählergruppe{i}")), "mandate": zahl(r.get(f"Mandate/Wählergruppe{i}")) or 0,
                           "koppelung": (r.get(f"Koppelung/Wählergruppe{i}") or "").strip() or None})
        aus[g] = {"gkz": g, "name": r["Gemeinde"].strip(), "land": "Tirol", "wahl": wahl, "datum": datum, "wb": wb(r), "abgegeben": zahl(r["Abgegebene Stimmen"]),
                  "gueltig": zahl(r["Gültige Stimmen"]), "mandate": sum(l["mandate"] for l in listen), "listen": listen,
                  "quelle": "Land Tirol, wahlen.tirol.gv.at (CSV)"}
    bg = D + gr + "_bgm.csv"
    if os.path.exists(bg):
        for r in lies(bg):
            g = r["Gemeinde_Id"].strip(); k = kandidaten(r)
            if not k or g not in aus: continue
            top = next((x for x in k if x["gewaehlt"]), None) or max(k, key=lambda x: x["stimmen"] or 0)
            if top["gewaehlt"] or (top["stimmen"] or 0) * 2 > (zahl(r["Gültige Stimmen"]) or 0):
                aus[g]["bgm"] = {"name": top["name"], "partei": top["liste"], "direktwahl": True, "wahlgang": 1, "anteil": top["anteil"], "quelle": "Bürgermeisterwahl " + datum}
    if eng and os.path.exists(D + eng + ".csv"):
        for r in lies(D + eng + ".csv"):
            g = r["Gemeinde_Id"].strip(); k = kandidaten(r)
            if not k or g not in aus: continue
            top = next((x for x in k if x["gewaehlt"]), None) or max(k, key=lambda x: x["stimmen"] or 0)
            aus[g]["bgm"] = {"name": top["name"], "partei": top["liste"], "direktwahl": True, "wahlgang": 2, "anteil": top["anteil"], "quelle": "engere Wahl " + datum2}
for a in aus.values():
    if a.get("bgm") and a["bgm"].get("partei"): a["bgm"]["gruppe"] = gruppe(a["bgm"]["partei"])
json.dump(list(aus.values()), open(B + "/daten/tirol.json", "w"), ensure_ascii=False, indent=0)
import collections
print(len(aus), sum(1 for a in aus.values() if a.get("bgm")), collections.Counter(l["gruppe"] for a in aus.values() for l in a["listen"]))
