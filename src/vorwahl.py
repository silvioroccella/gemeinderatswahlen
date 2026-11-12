import os; B = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
"""Vergleichswahl je Gemeinde: Stimmenanteile (und wo vorhanden Mandate) je Parteigruppe der jeweils vorangegangenen Gemeinderatswahl.
Ergebnis daten/vor.json: {gkz: {"datum", "wahl", "quelle", "a": [7 Anteile in %, None = unbekannt], "m": [7] oder None, "bet": %}}"""
import csv, glob, html, io, json, re, sys
import pandas as pd, pdfplumber
sys.path.insert(0, B + "/src"); from gemeinsam import zahl, gruppe, GRUPPEN, namensindex, norm
R = B + "/roh/"; GI = {g: i for i, g in enumerate(GRUPPEN)}
vor = {}
def aus_listen(listen, gu, wb=None, ab=None):
    a = [0.0] * 7; m = [0] * 7; mand = True
    for name, grp, st, md in listen:
        a[GI[grp]] += st or 0
        if md is None: mand = False
        else: m[GI[grp]] += md
    return {"a": [round(100 * x / gu, 2) for x in a], "m": m if mand else None, "bet": round(100 * ab / wb, 2) if wb and ab else None}
def setze(g, datum, wahl, quelle, werte): vor[g] = {"datum": datum, "wahl": wahl, "quelle": quelle, **werte}
# NÖ: 2020 im Gebietsstand 2025 (gr20_25.xls), Einzel-PDFs für Vösendorf und Statutarstädte
x = pd.read_excel(R + "noe_gr20_25.xls", header=None)
NOEG = [("ÖVP", 7), ("SPÖ", 12), ("FPÖ", 17), ("GRÜNE", 22), ("NEOS", 27), ("Liste", 32)]
for i in range(4, len(x)):
    r = x.iloc[i].tolist(); kz = str(r[0]).strip()
    if len(kz) != 5 or not kz.isdigit() or kz.endswith("00"): continue
    wb, gu, ung = zahl(r[2]), zahl(r[5]), zahl(r[4])
    L = [(g, g, zahl(r[c]) or 0, zahl(r[c + 3]) or 0) for g, c in NOEG]
    setze(kz, "26.01.2020", "Gemeinderatswahl 2020", "Amt der NÖ Landesregierung, gr20_25.xls (Gebietsstand 2025)", aus_listen(L, gu, wb, gu + ung))
for g, v in json.load(open(B + "/daten/vor_noe_pdf.json")).items():
    setze(g, v["datum"], "Gemeinderatswahl " + v["datum"][-4:], v["quelle"], aus_listen(v["listen"], v["gu"], v["wb"], v["ab"]))
# OÖ: Wahlbericht 2021, Vergleich 2015 als Anteil minus Differenz (nur Parteien mit Vergleichsspalte)
TYPEN = {"ÖVP FPÖ SPÖ GRÜNE": [("ÖVP", 5), ("FPÖ", 5), ("SPÖ", 5), ("GRÜNE", 5)], "NEOS MFG KPÖ BESTE UBB": [("NEOS", 5), ("MFG", 3), ("KPÖ", 5), ("BESTE", 3), ("UBB", 3)],
         "CPÖ R Sonst1 Sonst2 Sonst3": [("CPÖ", 5), ("R", 3), ("S1", 3), ("S2", 3), ("S3", 3)]}
ZEILE = re.compile(r"^(4\d{4})(\D.*?) ([\d.]+) ([\d,]+) ([\d.]+) ([\d.]+) (.*)$")
ooe = {}
for pg in pdfplumber.open(R + "ooe_gr21.pdf").pages:
    t = pg.extract_text() or ""
    if not t.startswith("Ergebnisse der Gemeinden und Bezirke Gemeinderatswahl"): continue
    z = t.splitlines(); typ = TYPEN.get(z[1].strip())
    if not typ: continue
    for zz in z:
        m = ZEILE.match(zz.strip())
        if not m: continue
        tok = m.group(7).split(); pos = 0; e = ooe.setdefault(m.group(1), {})
        for name, n in typ:
            teil = tok[pos:pos + n]; pos += n
            if n == 5: e[name] = (zahl(teil[1]) - zahl(teil[3]), zahl(teil[2]) - zahl(teil[4]))
            else: e[name] = (0.0, 0)   # neu angetreten 2021, ohne Vergleichsspalte
for g, e in ooe.items():
    a = [None] * 7; mm = [None] * 7
    for name, grp in (("ÖVP", "ÖVP"), ("SPÖ", "SPÖ"), ("FPÖ", "FPÖ"), ("GRÜNE", "GRÜNE"), ("NEOS", "NEOS"), ("KPÖ", "KPÖ")):
        a[GI[grp]] = round(e[name][0], 2); mm[GI[grp]] = e[name][1]
    setze(g, "27.09.2015", "Gemeinderatswahl 2015", "Amt der Oö. Landesregierung, Wahlbericht 2021 (Differenzen zu 2015)", {"a": a, "m": mm, "bet": None})
# Burgenland: 2017 aus der Publikation (rechte Hälfte der Tabellen)
sys.argv = ["x"]
pdf = pdfplumber.open(R + "bgld_grw22.pdf"); seiten = [(p.extract_text() or "") for p in pdf.pages]
bidx = namensindex(1); ALIAS = {"eisenstadt stadt": "10101", "rust stadt": "10201"}
ZAHL = re.compile(r"^[+\-]?[\d.]+(,\d+)?$")
akt = None; bgl = {}
for t in seiten:
    L = t.splitlines()
    if not L or not L[0].startswith("Gemeinderatswahlen 2022 und 2017"): continue
    bezirksseite = L[0].strip().endswith("Bezirke")
    for j, z in enumerate(L):
        z = z.strip()
        if j + 1 < len(L) and L[j + 1].startswith("Wahlberechtigte") and not z.startswith("Wahlberechtigte"):
            g = ALIAS.get(norm(z)) or (bidx.get(norm(z)) or [None])[0]
            akt = None if (not g or (bezirksseite and g not in ("10101", "10201"))) else bgl.setdefault(g, {"listen": []}); continue
        if akt is None: continue
        tok = z.split()
        if not tok: continue
        if tok[0] == "Wahlberechtigte":
            k = tok.index("Wahlberechtigte", 1) if "Wahlberechtigte" in tok[1:] else None
            if k: akt["wb"] = zahl(tok[k + 2])
            continue
        if tok[0] == "abgegeben" and "abgegeben" in tok[1:]: akt["ab"] = zahl(tok[tok.index("abgegeben", 1) + 1]); continue
        if tok[0] == "gültig" and "gültig" in tok[1:]: akt["gu"] = zahl(tok[tok.index("gültig", 1) + 1]); continue
        if tok[0] in ("ungültig", "abgegeben", "gültig", "Partei", "punkte", "Prozent-") or z.startswith("Gemeinderatswahl"): continue
        k = 1
        while k < len(tok) and not ZAHL.match(tok[k]): k += 1
        rest = tok[k:]
        if len(rest) < 3: continue
        m22, s22 = zahl(rest[0]), zahl(rest[1]); tail = rest[3:]
        if len(tail) == 3 and all(ZAHL.match(x) for x in tail):
            if zahl(tail[1]) == -s22 and s22:   # nur 2017
                akt["listen"].append((" ".join(tok[:k]), m22, s22))
            continue
        k2 = 0
        while k2 < len(tail) and not ZAHL.match(tail[k2]): k2 += 1
        if k2 and len(tail) >= k2 + 3: akt["listen"].append((" ".join(tail[:k2]), zahl(tail[k2]), zahl(tail[k2 + 1])))
for g, e in bgl.items():
    if not e.get("gu"): continue
    L = [(n, {"SPÖ": "SPÖ", "ÖVP": "ÖVP", "FPÖ": "FPÖ", "GRÜNE": "GRÜNE", "NEOS": "NEOS"}.get(n, gruppe(n)), s, m) for n, m, s in e["listen"]]
    setze(g, "01.10.2017", "Gemeinderatswahl 2017", "Statistik Burgenland, Publikation 2022 (Vergleich 2017)", aus_listen(L, e["gu"], e.get("wb"), e.get("ab")))
# Salzburg: Vergleichswahl 2019 aus der Wahlanwendung
s = open(R + "sbg_wahldaten.js", encoding="utf-8-sig").read()
reg = {int(m.group(1)): m.group(2) for m in re.finditer(r'ID:\s*(\d+),\s*GKZ:\s*"(\d{5})",\s*bez:\s*"[^"]+",\s*typID:\s*4', s)}
gv = json.load(open(R + "sbg_GVW2024.js", encoding="utf-8-sig")); par = {p["region_id"]: p for p in gv["parteien"]}; man = {m["region_id"]: m for m in gv["mandate"]}
for st in gv["stimmen"]:
    rid = st["region_id"]
    if rid not in reg or not st.get("daten_vgl"): continue
    d = st["daten_vgl"][0]; lab = par[rid]["vgl"][0]; sv = st["pdaten_vgl"][0]; mv = man.get(rid, {}).get("pdaten_vgl", [[None] * len(sv)])[0]
    L = [(l, l if l in GI else "Liste", sv[i] or 0, (mv[i] if i < len(mv) else None)) for i, l in enumerate(lab) if l and i < len(sv) and sv[i] is not None]
    setze(reg[rid], "10.03.2019", "Gemeindevertretungswahl 2019", "Land Salzburg, Landesstatistik (Vergleich 2019)", aus_listen(L, d[4], d[0], d[2]))
# Steiermark: Stimmenprotokoll 2020 (Archiv), Fürstenfeld und Söchau zusammengefasst
x = pd.read_excel(R + "stmk_archiv_grw.xlsx", sheet_name="GRW_2020")
ZU = {"ÖVP": "ÖVP", "SPÖ": "SPÖ", "FPÖ": "FPÖ", "GRÜNE": "GRÜNE", "NEOS": "NEOS", "KPÖ": "KPÖ"}
st = {}
for g, df in x.groupby("GEMNR"):
    g = str(int(g)); g = "62280" if g in ("62252", "62267") else g
    e = st.setdefault(g, {"wb": 0, "ab": 0, "gu": 0, "L": []}); kopf = df.iloc[0]
    e["wb"] += zahl(kopf["WAHLBE_GR20"]) or 0; e["ab"] += zahl(kopf["GES_GR20"]) or 0; e["gu"] += zahl(kopf["GUEL_GR20"]) or 0
    for _, r in df.iterrows():
        e["L"].append((r["PARTEI"], ZU.get(str(r["PARTEI_ZU"]).strip().upper(), "Liste"), zahl(r["STIMMEN_GR20"]) or 0, zahl(r["MAND_GR20"]) or 0))
for g, e in st.items():
    setze(g, "28.06.2020", "Gemeinderatswahl 2020", "Amt der Stmk. Landesregierung, Wahlarchiv Stimmenprotokolle (2020)", aus_listen(e["L"], e["gu"], e["wb"], e["ab"]))
# Vorarlberg: Gemeindewahl 2020
for e in json.load(open(R + "vbg_gv20.json", encoding="utf-8-sig"))["ergebnisse"]:
    gw = e.get("gemeinderatswahl") or {}
    if not gw.get("listen") or not gw.get("gueltigeStimmen"): continue
    L = [(l["bezeichnung"], gruppe(l["bezeichnung"]), l["stimmen"], l.get("mandate")) for l in gw["listen"]]
    setze(e["schluessel"], "13.09.2020", "Gemeindevertretungswahl 2020", "Amt der Vorarlberger Landesregierung (Gemeindewahl 2020)", aus_listen(L, gw["gueltigeStimmen"], gw.get("wahlberechtigte"), gw.get("abgegebeneStimmen")))
# Tirol: 2016 (CSV)
t = open(R + "tirol/gemeinderats_und_buergermeisterwahlen_2016__wahl46.csv", encoding="latin-1").read().splitlines()
for r in csv.DictReader(io.StringIO("\n".join(t[1:])), delimiter=";"):
    L = [(r[f"Name/Wählergruppe{i}"], gruppe(r[f"Name/Wählergruppe{i}"]), zahl(r.get(f"Stimmen/Wählergruppe{i}")) or 0, zahl(r.get(f"Mandate/Wählergruppe{i}")) or 0)
         for i in range(1, 40) if r.get(f"Name/Wählergruppe{i}")]
    gu = zahl(r["Gültige Stimmen"])
    if gu and L: setze(r["Gemeinde_Id"].strip(), "28.02.2016", "Gemeinderatswahl 2016", "Land Tirol, wahlen.tirol.gv.at (CSV 2016)", aus_listen(L, gu, zahl(r["Wahlberechtigte gesamt"]), zahl(r["Abgegebene Stimmen"])))
# Wien: 2020 aus der Ergebnisseite 2025 der Stadt Wien (Spalte 2020)
w = html.unescape(re.sub(r"<[^>]+>", " ", open(R + "wien_gr251.html", encoding="utf-8", errors="replace").read())); w = re.sub(r"\s+", " ", w)
m = re.search(r"2020 ([\d.]+) ([\d.]+) [\d,]+% ([\d.]+)", w); wb20, ab20, gu20 = (zahl(m.group(i)) for i in (1, 2, 3))
L = []
for p, grp in (("SPÖ", "SPÖ"), ("ÖVP", "ÖVP"), ("GRÜNE", "GRÜNE"), ("NEOS", "NEOS"), ("FPÖ", "FPÖ"), ("KPÖ", "KPÖ"), ("HC", "Liste"), ("SÖZ", "Liste"), ("PRO", "Liste")):
    m = re.search(p + r" --> " + p + r" [\d.]+ [\d,]+% ([\d.]+) [\d,]+%", w)
    if m: L.append((p, grp, zahl(m.group(1)), None))
setze("90001", "11.10.2020", "Gemeinderatswahl 2020", "Stadt Wien, Ergebnisseite GR251 (Spalte 2020)", aus_listen(L, gu20, wb20, ab20))
for f in ("vor_ktn", "vor_graz", "vor_tirol_nach"):                 # amtliche Vergleichswerte aus den Länderskripten
    vor.update(json.load(open(f"{B}/daten/{f}.json")))
json.dump(vor, open(B + "/daten/vor.json", "w"), ensure_ascii=False, indent=0)
import collections; print(len(vor), collections.Counter(g[0] for g in vor))
print({k: vor[k] for k in ("30101", "40101", "10101", "50101", "60305", "80103", "70201", "90001") if k in vor})
