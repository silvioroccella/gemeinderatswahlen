import os; B = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
"""Burgenland: Gemeinderats- und Bürgermeisterwahlen 02.10.2022, Statistik Burgenland, Publikation GRW und BMW 2022 (PDF), inkl. Zurechnung der Namenslisten."""
import json, re, sys, pdfplumber
sys.path.insert(0, B + "/src"); from gemeinsam import zahl, gruppe, namensindex, norm, karte
R = B + "/roh/"
idx = namensindex(1); K = karte()
namen = sorted({K["namen"][g] for g in K["namen"] if g.startswith("1")}, key=len, reverse=True)
ALIAS = {"eisenstadt stadt": "10101", "rust stadt": "10201"}
def gkz(n):
    t = ALIAS.get(norm(n)) or (idx.get(norm(n)) or [None])[0]
    return t
pdf = pdfplumber.open(R + "bgld_grw22.pdf"); seiten = [(p.extract_text() or "") for p in pdf.pages]
# Zurechnung 2022 (Seite 22 der Publikation, Index 21)
zur = {}; partei = None
for z in seiten[21].splitlines()[3:]:
    z = z.strip()
    if z in ("SPÖ", "ÖVP", "FPÖ", "GRÜNE", "NEOS", "LBL"): partei = z; continue
    for n in namen:
        if z.endswith(" " + n):
            kurz = z[: -len(n) - 1].split()[-1]; zur[(gkz(n), kurz.upper())] = partei; break
# Gemeinderatswahl
aus = {}; akt = None
ZAHLEN = re.compile(r"^[+\-]?[\d.]+(,\d+)?$")
for i, t in enumerate(seiten):
    L = t.splitlines()
    if not L or not L[0].startswith("Gemeinderatswahlen 2022 und 2017"): continue
    bezirksseite = L[0].strip().endswith("Bezirke")
    for j, z in enumerate(L):
        z = z.strip()
        if j + 1 < len(L) and L[j + 1].startswith("Wahlberechtigte") and not z.startswith("Wahlberechtigte"):
            g = gkz(z)
            if bezirksseite and g not in ("10101", "10201"): akt = None; continue
            akt = None
            if g: akt = aus.setdefault(g, {"gkz": g, "name": z, "land": "Burgenland", "wahl": "Gemeinderatswahl 2022", "datum": "02.10.2022", "listen": [],
                                         "quelle": "Statistik Burgenland, Gemeinderats- und Bürgermeisterwahl 2022 (PDF)"})
            elif not bezirksseite: print("ohne GKZ:", z)
            continue
        if akt is None: continue
        tok = z.split()
        if not tok: continue
        if tok[0] == "Wahlberechtigte": akt["mandate"], akt["wb"] = zahl(tok[1]), zahl(tok[2]); continue
        if tok[0] == "abgegeben": akt["abgegeben"] = zahl(tok[1]); continue
        if tok[0] == "gültig": akt["gueltig"] = zahl(tok[1]); continue
        if tok[0] in ("ungültig", "Partei", "punkte", "Prozent-") or z.startswith("Gemeinderatswahl"): continue
        # Parteizeile: Name (1-2 Wörter), Mandate, Stimmen, %
        k = 1
        while k < len(tok) and not ZAHLEN.match(tok[k]): k += 1
        name = " ".join(tok[:k]); rest = tok[k:]
        if len(rest) < 3: continue
        m, s = zahl(rest[0]), zahl(rest[1]); tail = rest[3:]
        if len(tail) == 3 and all(ZAHLEN.match(x) for x in tail) and zahl(tail[1]) == -s and s: continue  # nur 2017
        grp = gruppe(name)
        if grp == "Liste": grp = {"SPÖ": "SPÖ", "ÖVP": "ÖVP", "FPÖ": "FPÖ", "GRÜNE": "GRÜNE", "NEOS": "NEOS"}.get(zur.get((akt["gkz"], name.upper())), "Liste")
        akt["listen"].append({"name": name, "gruppe": grp, "stimmen": s, "mandate": m or 0})
# Bürgermeister (Liste der Bürgermeister, Seiten 14 bis 18)
for t in seiten[12:19]:
    if "Liste der Bürgermeister" not in t or "sortiert" in t: continue
    for z in t.splitlines():
        z = z.strip()
        if not z.endswith("*"): continue
        for n in namen + ["Eisenstadt-Stadt", "Rust-Stadt"]:
            if z.startswith(n + " "):
                rest = z[len(n) + 1:].rstrip("* ").split(); wg = 2 if z.count("*") == 1 and re.search(r"\s{1}\*$", z) and False else None
                par = rest[-1]; person = " ".join(rest[:-1]); g = gkz(n)
                if g in aus:
                    grp = gruppe(par)
                    if grp == "Liste": grp = {"SPÖ": "SPÖ", "ÖVP": "ÖVP", "FPÖ": "FPÖ"}.get(zur.get((g, par.upper())), "Liste")
                    aus[g]["bgm"] = {"name": person, "partei": par, "gruppe": grp, "direktwahl": True, "quelle": "Bürgermeisterwahl 2022 (Statistik Burgenland)"}
                break
json.dump(list(aus.values()), open(B + "/daten/bgld.json", "w"), ensure_ascii=False, indent=0)
import collections
print(len(aus), sum(1 for a in aus.values() if a.get("bgm")), collections.Counter(a["bgm"]["gruppe"] for a in aus.values() if a.get("bgm")))
bad = [a["name"] for a in aus.values() if sum(l["mandate"] for l in a["listen"]) != a.get("mandate")]
print("Mandate ungleich:", len(bad), bad[:10])
bad2 = [a["name"] for a in aus.values() if sum(l["stimmen"] for l in a["listen"]) != a.get("gueltig")]
print("Stimmen ungleich:", len(bad2), bad2[:10]); print(len(zur))
