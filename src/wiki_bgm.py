import os; B = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
"""Ergänzt Bürgermeister aus der Infobox der deutschsprachigen Wikipedia (roh/wiki_teil*.txt).

Zeilenformat: GKZ|Bürgermeister|Partei|Wahljahr laut Infobox|Revisionsdatum (ausgelesen am 11.11.2026).
Regeln:
- Gemeinden ohne Bürgermeister in der amtlichen Quelle (NÖ, Steiermark, Vorarlberg ohne Direktwahl, Einzelfälle
  in OÖ und Tirol) erhalten Name und Partei aus Wikipedia, Quelle "laut Wikipedia".
- Tirol: amtlich ist nur der Name bekannt. Die Partei aus Wikipedia wird nur übernommen, wenn der Familienname
  übereinstimmt und das Wahljahr der Infobox nicht nach der amtlichen Wahl liegt.
- Liegt das Wahljahr der Infobox vor der letzten amtlichen Wahl, steht ein Vorbehalt in der Quelle.
- Wien: Wahl durch den Gemeinderat am 10.06.2025, eigene Quelle.
"""
import json, re, sys, glob, collections
sys.path.insert(0, B + "/src"); from gemeinsam import gruppe, norm

W = {}
for f in sorted(glob.glob(B + "/roh/wiki_teil*.txt")):
    for z in open(f, encoding="utf-8"):
        p = z.rstrip("\n").split("|")
        if len(p) < 5 or not p[0].isdigit(): continue
        if len(p) > 5: p = [p[0], p[1], p[2], p[-2], p[-1]]           # verschobene Felder (z. B. "Gemeinderatanzahl =")
        g, name, partei, jahr, rev = [re.sub(r"<[^>]+>", "", x).strip() for x in p]
        if "=" in partei: partei = ""
        if "=" in jahr or not re.fullmatch(r"\d{4}", jahr or "x"): jahr = ""
        m = re.fullmatch(r"(.+?)\s*\((.+)\)", name)
        if m and not partei: name, partei = m.group(1), m.group(2)  # "Martin Gstrein (GFK)"
        name = re.sub(r",\s*(M\.A\.|B\.A\.|MSc|BSc|MBA)$", "", name)
        W[g] = {"name": name, "partei": partei, "jahr": jahr, "rev": rev}

def datum(iso): return f"{iso[8:10]}.{iso[5:7]}.{iso[0:4]}"
def familienname_gleich(amtlich, wiki):
    a, w = set(norm(amtlich).split()), norm(wiki).split()
    return bool(w) and w[-1] in a

alle = json.load(open(B + "/daten/alle.json"))
z = collections.Counter(); vorbehalt = []
for g, r in alle.items():
    b = r.get("bgm"); w = W.get(g)
    wahljahr = int(r["datum"][-4:]) if r.get("datum") else None
    if g == "90001":
        r["bgm"] = {"name": "Michael Ludwig", "partei": "SPÖ", "gruppe": "SPÖ", "direktwahl": False,
                    "quelle": "Wahl durch den Gemeinderat am 10.06.2025 (Bericht ganz-wien.at, Neue Wiener Stadtregierung)"}
        z["Wien"] += 1; continue
    if not w: continue
    alt = w["jahr"] and wahljahr and int(w["jahr"]) < wahljahr
    q = f"laut Wikipedia (Infobox der Gemeinde, Revision {datum(w['rev'])})"
    if alt: q += f"; dort Wahljahr {w['jahr']}, Aktualität nach der Wahl {wahljahr} nicht bestätigt"
    elif not w["jahr"]: q += "; Wahljahr dort nicht angegeben"
    if not b or not b.get("name"):
        r["bgm"] = {"name": w["name"], "partei": w["partei"], "gruppe": gruppe(w["partei"]) if w["partei"] else None,
                    "direktwahl": None if r["land"] in ("Oberösterreich", "Tirol") else False, "quelle": q, "wiki": True, "vorbehalt": bool(alt)}
        z[(r["land"], "neu", "mit Partei" if w["partei"] else "ohne Partei")] += 1
        if alt: vorbehalt.append((r["land"], g, r["name"], w["jahr"]))
    elif not b.get("partei") and w["partei"]:
        if familienname_gleich(b["name"], w["name"]) and not (w["jahr"] and wahljahr and int(w["jahr"]) > wahljahr):
            b["partei"] = w["partei"]; b["gruppe"] = gruppe(w["partei"])
            b["quelle"] = b.get("quelle", "") + "; Partei laut Wikipedia (Revision " + datum(w["rev"]) + ")"
            z[(r["land"], "Partei ergänzt")] += 1
        else:
            z[(r["land"], "Name abweichend, nicht übernommen")] += 1
            b["quelle"] = b.get("quelle", "") + f"; laut Wikipedia (Revision {datum(w['rev'])}) inzwischen {w['name']} ({w['partei'] or 'Partei nicht angegeben'})"
            print("  abweichend", g, r["name"], "|", b["name"], "|", w["name"], w["jahr"])
for k, v in sorted(z.items(), key=str): print(k, v)
print("Vorbehalt Wahljahr:", collections.Counter(v[0] for v in vorbehalt))
json.dump(alle, open(B + "/daten/alle.json", "w"), ensure_ascii=False)
