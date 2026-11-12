import os; B = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
"""Salzburg: Gemeindevertretungs- und Bürgermeisterwahlen 10.03.2024 (Stichwahl 24.03.2024), Landesstatistik Salzburg (salzburg.gv.at/stat/wahlen, Datendateien der Wahlanwendung)."""
import json, re, sys
sys.path.insert(0, B + "/src"); from gemeinsam import gruppe
R = B + "/roh/"
s = open(R + "sbg_wahldaten.js", encoding="utf-8-sig").read()
reg = {int(m.group(1)): (m.group(2), m.group(3)) for m in re.finditer(r'ID:\s*(\d+),\s*GKZ:\s*"(\d{5})",\s*bez:\s*"([^"]+)",\s*typID:\s*4', s)}
gv = json.load(open(R + "sbg_GVW2024.js", encoding="utf-8-sig")); bm = json.load(open(R + "sbg_BMW2024.js", encoding="utf-8-sig"))
par = {p["region_id"]: p for p in gv["parteien"]}; man = {m["region_id"]: m for m in gv["mandate"]}
G = {"ÖVP": "ÖVP", "SPÖ": "SPÖ", "FPÖ": "FPÖ", "GRÜNE": "GRÜNE", "NEOS": "NEOS", "KPÖ": "KPÖ"}
aus = {}
for st in gv["stimmen"]:
    rid = st["region_id"]
    if rid not in reg: continue
    gkz, name = reg[rid]; d = st["daten_akt"][0]; p = par[rid]["akt"][0]; grp = par[rid]["grp"]
    sv = st["pdaten_akt"][0]; mv = man[rid]["pdaten_akt"][0] if rid in man else [None] * len(sv)
    listen = []
    for i, lab in enumerate(p):
        if not lab or i >= len(sv) or sv[i] is None: continue
        listen.append({"name": "Sonstige Liste" + (" " + lab[8:] if lab.startswith("Sonstige") and lab[8:] else "") if lab.startswith("Sonstige") else lab,
                       "gruppe": G.get(grp[i], "Liste"), "stimmen": sv[i], "mandate": (mv[i] if i < len(mv) and mv[i] is not None else 0)})
    aus[gkz] = {"gkz": gkz, "name": name, "land": "Salzburg", "wahl": "Gemeindevertretungswahl 2024", "datum": "10.03.2024", "wb": d[0], "abgegeben": d[2], "gueltig": d[4],
                "mandate": sum(l["mandate"] for l in listen), "listen": listen, "quelle": "Land Salzburg, Landesstatistik, Wahlanwendung (GVW2024)", "gruppiert": True}
bpar = {p["region_id"]: p for p in bm["parteien"]}
import html
for st in bm["stimmen"]:
    rid = st["region_id"]
    if rid not in reg or reg[rid][0] not in aus: continue
    gkz = reg[rid][0]; bi = st.get("bgm_index_akt") or [[None], [None]]
    wg = 2 if len(bi) > 1 and bi[1] and bi[1][0] else 1
    i = bi[wg - 1][0]
    if not i: continue
    p = bpar[rid]; lab = html.unescape(p["akt"][wg - 1][i - 1] if len(p["akt"]) >= wg and len(p["akt"][wg - 1]) >= i and p["akt"][wg - 1][i - 1] else p["akt"][0][i - 1])
    m = re.match(r"(.+?) \(([^)]+)\)$", lab)
    name, partei = (m.group(1), m.group(2)) if m else (lab, "")
    grp = p["grp"][i - 1] if i - 1 < len(p["grp"]) else "Sonstige"
    aus[gkz]["bgm"] = {"name": name.replace("\u2011", "-"), "partei": partei, "gruppe": G.get(grp, "Liste"), "direktwahl": True, "wahlgang": wg,
                       "quelle": "Bürgermeisterwahl 2024" + (" (Stichwahl 24.03.2024)" if wg == 2 else "") + ", Zuordnung laut Landesstatistik"}
json.dump(list(aus.values()), open(B + "/daten/sbg.json", "w"), ensure_ascii=False, indent=0)
import collections
print(len(aus), sum(1 for a in aus.values() if a.get("bgm")), collections.Counter(a["bgm"]["gruppe"] for a in aus.values() if a.get("bgm")))
print([ (a["name"], a.get("bgm")) for a in aus.values() if not a.get("bgm")][:5])
