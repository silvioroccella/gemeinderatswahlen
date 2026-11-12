import os; B = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
"""Oberösterreich: Gemeinderats- und Bürgermeisterwahlen 26.09.2021, Amt der Oö. Landesregierung, Wahlbericht GR21 und BGM-Gemeindeliste (PDF)."""
import json, re, sys, pdfplumber
sys.path.insert(0, B + "/src"); from gemeinsam import zahl, gruppe
R = B + "/roh/"
TYPEN = {"ÖVP FPÖ SPÖ GRÜNE": [("ÖVP", 5), ("FPÖ", 5), ("SPÖ", 5), ("GRÜNE", 5)],
         "NEOS MFG KPÖ BESTE UBB": [("NEOS", 5), ("MFG", 3), ("KPÖ", 5), ("BESTE", 3), ("UBB", 3)],
         "CPÖ R Sonst1 Sonst2 Sonst3": [("CPÖ", 5), ("R", 3), ("Sonstige Liste 1", 3), ("Sonstige Liste 2", 3), ("Sonstige Liste 3", 3)]}
ZEILE = re.compile(r"^(4\d{4})(\D.*?) ([\d.]+) ([\d,]+) ([\d.]+) ([\d.]+) (.*)$")
aus = {}
pdf = pdfplumber.open(R + "ooe_gr21.pdf")
for pg in pdf.pages:
    t = pg.extract_text() or ""
    if not t.startswith("Ergebnisse der Gemeinden und Bezirke Gemeinderatswahl"): continue
    zeilen = t.splitlines(); typ = TYPEN.get(zeilen[1].strip())
    if not typ: continue
    for z in zeilen:
        m = ZEILE.match(z.strip())
        if not m: continue
        g = m.group(1); tok = m.group(7).split()
        a = aus.setdefault(g, {"gkz": g, "name": m.group(2).strip(), "land": "Oberösterreich", "wahl": "Gemeinderatswahl 2021", "datum": "26.09.2021",
                               "wb": zahl(m.group(3)), "gueltig": zahl(m.group(6)), "abgegeben": zahl(m.group(6)) + zahl(m.group(5)), "listen": [],
                               "quelle": "Amt der Oö. Landesregierung, Wahlbericht Gemeinderatswahl 2021 (PDF)", "gruppiert": True})
        pos = 0
        for name, n in typ:
            teil = tok[pos:pos + n]; pos += n
            if len(teil) < 3: raise SystemExit(f"Spalten fehlen {g} {name}: {z}")
            st, mand = zahl(teil[0]), zahl(teil[2])
            if st:
                a["listen"].append({"name": name, "gruppe": {"MFG": "Liste", "BESTE": "Liste", "UBB": "Liste", "CPÖ": "Liste", "R": "Liste"}.get(name, gruppe(name)), "stimmen": st, "mandate": mand or 0})
        if pos != len(tok): raise SystemExit(f"Rest {g}: {tok[pos:]}")
for a in aus.values():
    a["listen"].sort(key=lambda l: -l["stimmen"]); a["mandate"] = sum(l["mandate"] for l in a["listen"])
# Bürgermeister (direkt gewählt), Liste mit Wahlausgang und Partei-Kürzel
BG = re.compile(r"^(4\d{4})(\D.*?) ([\d.]+) ([\d,]+) ([\d.]+) (.+)$")
pdf = pdfplumber.open(R + "ooe_bgm21.pdf"); offen = None
KZ = {"VP": "ÖVP", "SP": "SPÖ", "FP": "FPÖ", "GRÜNE": "GRÜNE", "GR": "GRÜNE", "NEOS": "NEOS", "KPÖ": "KPÖ"}
def bgm_aus(rest):
    toks = rest.split()
    # Name endet vor dem Partei-Kürzel, danach Zahlen
    for i in range(len(toks) - 1, 0, -1):
        if re.fullmatch(r"[A-ZÄÖÜ][A-Za-zÄÖÜäöü/-]{0,9}", toks[i]) and all(re.fullmatch(r"[+\-]?[\d.,]+", x) for x in toks[i + 1:]) and toks[i] not in ("Dr.", "Mag."):
            return " ".join(toks[:i]), toks[i]
    return None, None
_bgm = bgm_aus
def bgm_aus(rest):
    n, k = _bgm(rest)
    return (None, None) if n and re.search(r"\d", n) else (n, k)
for pg in pdf.pages:
    for z in (pg.extract_text() or "").splitlines():
        z = z.strip()
        if re.match(r"^4\d{4}", z): z = z[:5] + re.sub(r"(?<=[A-Za-zäöüÄÖÜß])(?=\d)|(?<=\d)(?=[A-Za-zÄÖÜ])", " ", z[5:])
        else: z = re.sub(r"(?<=[A-Za-zäöüÄÖÜß])(?=\d)|(?<=\d)(?=[A-Za-zÄÖÜ])", " ", z)
        m = BG.match(z)
        if m:
            g = m.group(1); rest = m.group(6)
            if rest.startswith("Stichwahl"): offen = g; continue
            name, kz = bgm_aus(rest)
            if g in aus and name:
                aus[g]["bgm"] = {"name": name, "partei": kz, "gruppe": KZ.get(kz, "Liste"), "direktwahl": True, "wahlgang": 1, "quelle": "Bürgermeisterwahl 26.09.2021"}
            offen = None
        elif z.startswith("Engere Wahl") and offen:
            m2 = re.match(r"Engere Wahl .+? (\d+,\d) ([\d.]+) (\D.+)$", z)
            if m2:
                name, kz = bgm_aus(m2.group(3))
                if name: aus[offen]["bgm"] = {"name": name, "partei": kz, "gruppe": KZ.get(kz, "Liste"), "direktwahl": True, "wahlgang": 2, "quelle": "engere Wahl 10.10.2021"}
            offen = None
json.dump(list(aus.values()), open(B + "/daten/ooe.json", "w"), ensure_ascii=False, indent=0)
import collections
print(len(aus), sum(1 for a in aus.values() if a.get("bgm")), collections.Counter(a["bgm"]["partei"] for a in aus.values() if a.get("bgm")).most_common(15))
print([a["name"] for a in aus.values() if not a.get("bgm")][:20])
