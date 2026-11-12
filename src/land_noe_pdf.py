import os; B = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
"""NÖ: Einzelergebnisse als PDF des Amtes der NÖ Landesregierung (Neuwahl Vösendorf 2025, Wahlwiederholungen 18.05.2025,
Statutarstädte St. Pölten 2026, Krems 2022, Waidhofen an der Ybbs 2022). Liest die laufende und die Vergleichswahl nach Spaltenlage,
Listennamen aus der Legende. Ergänzt bzw. ersetzt Einträge in daten/noe.json; Vergleichswahl nach daten/vor_noe_pdf.json."""
import glob, json, re, sys, pdfplumber
sys.path.insert(0, B + "/src"); from gemeinsam import zahl, gruppe, namensindex, norm
D = json.load(open(B + "/daten/noe.json")); nach = {a["gkz"]: a for a in D}
idx = namensindex(3)
NUM = re.compile(r"^[\d.]+(,\d+)?$")
MON = {"Jänner": "01", "Februar": "02", "März": "03", "April": "04", "Mai": "05", "Juni": "06", "Juli": "07", "August": "08", "September": "09", "Oktober": "10", "November": "11", "Dezember": "12"}
vor = {}
def kanon(k): return re.sub(r"[^A-ZÄÖÜ0-9]", "", k.upper())
def legende(pdf):
    """Zeilen der Legende: Kurzbezeichnung, dann Langname, bei mehreren Jahren 'JJJJ: Name' in Folgezeilen."""
    zeilen = []
    for pg in pdf.pages[1:] or pdf.pages:
        zeilen += [z.strip() for z in (pg.extract_text() or "").splitlines() if z.strip()]
    return zeilen
def langname(kurz, leg, jahr, erstes):
    k = kanon(kurz); treffer = None
    for i, z in enumerate(leg):
        # Präfix der Zeile, das kanonisch der Kurzbezeichnung entspricht
        for n in range(1, min(len(z), 20) + 1):
            if kanon(z[:n]) == k and (n == len(z) or z[n] in " :"):
                rest = z[n:].lstrip(" :"); folge = [rest] if rest else []
                for z2 in leg[i + 1:]:
                    if re.match(r"^(GRW )?\d{4}", z2): folge.append(z2)
                    else: break
                treffer = folge; break
        if treffer is not None: break
    if not treffer: return kurz
    for t in treffer:
        m = re.match(r"^(?:GRW )?(\d{4})(?: u\. (\d{4}))?(?: und (\d{4}))?:\s*(.*)$", t)
        if m and jahr in [x for x in m.groups()[:3] if x]: return m.group(4)
    t = treffer[0]
    return t if not re.match(r"^(GRW )?\d{4}", t) else t.split(":", 1)[-1].strip()
def lies(f):
    pdf = pdfplumber.open(f); pg = pdf.pages[0]; txt = pg.extract_text()
    m = re.search(r"Gemeinderatswahl am (\d+)\. (\w+) (\d{4}) in (.+)", txt)
    datum = f"{int(m.group(1)):02d}.{MON[m.group(2)]}.{m.group(3)}"; gem = m.group(4).strip()
    ws = pg.extract_words()
    kopf = sorted([w for w in ws if re.fullmatch(r"\d\d\.\d\d\.\d{4}", w["text"])], key=lambda w: w["x0"])
    if not kopf:  # Kopf "GRW 2026 GRW 2021"
        kopf = sorted([w for w in ws if w["text"] == "GRW" and w["top"] < 250], key=lambda w: w["x0"])
        jahre = sorted([w for w in ws if re.fullmatch(r"\d{4}", w["text"]) and abs(w["top"] - kopf[0]["top"]) < 3], key=lambda w: w["x0"])
        daten = [datum] + ["01.01." + j["text"] for j in jahre[1:]]
    else: daten = [k["text"] for k in kopf]
    grenzen = [k["x0"] - 20 for k in kopf] + [1e9]
    leg = legende(pdf); zeilen = {}
    for w in ws:
        if w["top"] <= kopf[0]["top"] + 25: continue
        zeilen.setdefault(round(w["top"]), []).append(w)
    spalten = [{"listen": []} for _ in kopf]
    for top in sorted(zeilen):
        z = sorted(zeilen[top], key=lambda w: w["x0"])
        name = " ".join(w["text"] for w in z if not NUM.match(w["text"]) and w["x0"] < grenzen[0])
        if not name: continue
        for s in range(len(kopf)):
            v = [zahl(w["text"]) for w in z if NUM.match(w["text"]) and grenzen[s] <= w["x0"] < grenzen[s + 1]]
            if not v: continue
            sp = spalten[s]
            if name.startswith("WAHLBERECHT"): sp["wb"], sp["mandate"] = v[0], v[-1]
            elif name.startswith("ABGEGEBEN"): sp["abgegeben"] = v[0]
            elif name.startswith("GÜLTIG"): sp["gueltig"] = v[0]
            elif name.startswith("UNGÜLTIG"): pass
            else:
                ln = langname(name, leg, daten[s][-4:], s == 0)
                sp["listen"].append({"name": ln if ln != name else name, "kurz": name, "gruppe": gruppe(ln + " " + name), "stimmen": v[0], "mandate": v[2] if len(v) > 2 else 0})
    return gem, daten, spalten
for f in sorted(glob.glob(B + "/roh/noe_nach/*.pdf")) + sorted(glob.glob(B + "/roh/noe_stat/*.pdf")):
    gem, daten, sp = lies(f)
    g = (idx.get(norm(gem)) or idx.get(norm(gem.replace(" ", "-"))))[0]
    a = nach.get(g)
    if a is None:
        a = {"gkz": g, "name": gem, "land": "Niederösterreich"}; D.append(a); nach[g] = a
    s0 = sp[0]
    a.update({"wb": s0["wb"], "abgegeben": s0["abgegeben"], "gueltig": s0["gueltig"], "mandate": s0["mandate"],
              "listen": [{k: l[k] for k in ("name", "gruppe", "stimmen", "mandate")} for l in s0["listen"]], "gruppiert": False, "datum": daten[0],
              "wahl": ("Wahlwiederholung " if "Wahlwiederholung" in f else "Gemeinderatswahl ") + daten[0][-4:],
              "quelle": "Amt der NÖ Landesregierung, endgültiges Ergebnis " + daten[0] + " (PDF)"})
    # Vergleichswahl: bei Wahlwiederholungen die reguläre Wahl 2020 aus gr20_25.xls, sonst die zweite Spalte
    if "Wahlwiederholung" not in f and len(sp) > 1 and sp[1].get("gueltig"):
        v = sp[1]; kurz_grp = {l["kurz"]: l["gruppe"] for l in s0["listen"]}
        for l in v["listen"]: l["gruppe"] = kurz_grp.get(l["kurz"], l["gruppe"])   # gleiche Liste, gleiche Gruppe in beiden Wahlen
        vor[g] = {"datum": daten[1] if not daten[1].startswith("01.01.") else daten[1][-4:], "wb": v.get("wb"), "ab": v.get("abgegeben"), "gu": v["gueltig"],
                  "listen": [[l["name"], l["gruppe"], l["stimmen"], l["mandate"]] for l in v["listen"]], "quelle": a["quelle"]}
    print(gem, daten, s0["wb"], s0["gueltig"], sum(l["stimmen"] for l in s0["listen"]), s0["mandate"], sum(l["mandate"] for l in s0["listen"]),
          [(l["kurz"], l["gruppe"]) for l in s0["listen"]], "| vor", (vor.get(g) or {}).get("gu"), sum(l[2] for l in (vor.get(g) or {}).get("listen", [])))
json.dump(D, open(B + "/daten/noe.json", "w"), ensure_ascii=False, indent=0)
json.dump(vor, open(B + "/daten/vor_noe_pdf.json", "w"), ensure_ascii=False, indent=0)
