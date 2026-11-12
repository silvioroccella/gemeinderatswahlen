import os; B = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
"""Rechnet alle Kennwerte je Gemeinde (Python, nicht im Browser) und schreibt das Datenpaket für die Karte."""
import json, re, sys, statistics
os.makedirs(B + "/aus", exist_ok=True)
sys.path.insert(0, B + "/src"); from gemeinsam import karte, GRUPPEN
K = karte(); alias = dict(K["kopf"]["alias"]); alias.update({"62252": "62280", "62267": "62280"})
A = json.load(open(B + "/daten/alle.json"))
V = json.load(open(B + "/daten/vor.json"))
# Bürgermeisterwechsel seit der Wahl (src/bgm_aktuell.py); fehlt die Datei, zeigt die Karte den Stand nach der Wahl
_pw = B + "/daten/bgm_wechsel.json"
W = {}
for w in (json.load(open(_pw, encoding="utf-8")) if os.path.exists(_pw) else []):
    W.setdefault(w["gkz"], []).append(w)
EW = json.load(open(B + "/referenz/einwohner_jahresbeginn.json"))["gemeinden"]
LAND = {"1": "Burgenland", "2": "Kärnten", "3": "Niederösterreich", "4": "Oberösterreich", "5": "Salzburg", "6": "Steiermark", "7": "Tirol", "8": "Vorarlberg", "9": "Wien"}
GI = {g: i for i, g in enumerate(GRUPPEN)}
# Bounding Boxes aus den relativen Pfaden
def box(d):
    xs, ys = [], []
    for teil in re.findall(r"M[^M]+", d):
        nums = list(map(int, re.findall(r"-?\d+", teil)))
        x, y = nums[0], nums[1]; xs.append(x); ys.append(y)
        for i in range(2, len(nums) - 1, 2):
            x += nums[i]; y += nums[i + 1]; xs.append(x); ys.append(y)
    return [min(xs), min(ys), max(xs) - min(xs), max(ys) - min(ys)]
def quintile(werte):
    w = sorted(werte); n = len(w)
    def q(p):  # inklusiv, lineare Interpolation
        k = (n - 1) * p; f = int(k); c = min(f + 1, n - 1); return w[f] + (w[c] - w[f]) * (k - f)
    return [round(q(p), 4) for p in (0.2, 0.4, 0.6, 0.8)]
def klasse(v, grenzen):
    if v is None: return 0
    for i, g in enumerate(grenzen):
        if v <= g: return i + 1
    return len(grenzen) + 1
gem = []
for g in sorted(K["gemeinden"]):
    d = A.get(alias.get(g, g))
    e = {"g": g, "n": K["namen"][g], "l": g[0]}
    ew = EW.get(g, {}).get("einwohner", {}); jahr_ew = max(ew) if ew else None
    if jahr_ew: e["ew"] = ew[jahr_ew]
    if alias.get(g, g) != g: e["fus"] = alias[g]
    if not d: gem.append(e); continue
    if d["name"] != e["n"]: e["dn"] = d["name"]
    L = sorted(d["listen"], key=lambda l: (-(l["mandate"] or 0), -(l["stimmen"] or 0)))
    gu = d.get("gueltig") or sum(l["stimmen"] or 0 for l in L) or None
    e.update({"w": d["wahl"], "dt": d["datum"], "j": int(d["datum"][-4:]), "wb": d.get("wb"), "ab": d.get("abgegeben"), "gu": gu, "m": d.get("mandate"),
              "q": d["quelle"], "grp": 1 if d.get("gruppiert") else 0,
              "L": [[l["name"], GI[l["gruppe"]], l["stimmen"], l["mandate"] or 0] for l in L]})
    if d.get("hinweis"): e["h"] = d["hinweis"]
    if d.get("vize"): e["vz"] = [[v["name"], v["partei"]] for v in d["vize"]]
    if e["wb"] and e["ab"]: e["bet"] = round(100 * e["ab"] / e["wb"], 2)
    if gu and L:
        ant = [0.0] * len(GRUPPEN); man = [0] * len(GRUPPEN)
        for l in L:
            ant[GI[l["gruppe"]]] += (l["stimmen"] or 0); man[GI[l["gruppe"]]] += l["mandate"] or 0
        e["a"] = [round(100 * x / gu, 2) for x in ant]; e["mg"] = man
        st = max(L, key=lambda l: ((l["mandate"] or 0), l["stimmen"] or 0))
        e["st"] = GI[st["gruppe"]]; e["stn"] = st["name"]; e["sta"] = round(100 * (st["stimmen"] or 0) / gu, 2)
        mges = e["m"] or sum(l["mandate"] or 0 for l in L)
        if mges:
            q = (st["mandate"] or 0) / mges
            e["mh"] = 3 if q >= 2 / 3 else (2 if q > 0.5 else 1)
        if not d.get("gruppiert"):
            p = [(l["stimmen"] or 0) / gu for l in L if l["stimmen"]]
            e["enp"] = round(1 / sum(x * x for x in p), 2) if p else None
    # Vergleich mit der vorigen Wahl (Werte aus daten/vor.json, Differenzen hier gerechnet)
    v = V.get(alias.get(g, g))
    if v:
        e["v"] = [v["wahl"], v["datum"], v["quelle"], v.get("bet")]
        if e.get("a") and v.get("a"):
            va = v["a"]
            e["va"] = va
            e["da"] = [None if va[i] is None else round(e["a"][i] - va[i], 2) for i in range(7)]
            def staerkste(x):
                ok = [(x[i], i) for i in range(7) if x[i] is not None]
                return max(ok)[1] if ok else None
            sv_, sn_ = staerkste(va), staerkste(e["a"])
            if va[6] is None and sn_ == 6: sv_ = None                  # Listen der Vorwahl unbekannt (OÖ 2015)
            if sv_ is not None and sn_ is not None: e["ws"] = [sv_, sn_]
        if e.get("bet") is not None and v.get("bet") is not None: e["dbet"] = round(e["bet"] - v["bet"], 2)
    b = d.get("bgm")
    if b:
        e["b"] = [b["name"], b.get("partei", ""), GI.get(b.get("gruppe") or "Liste", 6) if b.get("partei") else 7, 1 if b.get("direktwahl") else 0, b.get("quelle", "")]
        if e.get("L"):
            mx = max(l[3] for l in e["L"])
            fuehrend = [l for l in e["L"] if l[3] == mx]
            if any(l[0] == b.get("partei") for l in e["L"]):           # Liste namentlich bekannt (Vorarlberg)
                e["kh"] = 1 if any(l[0] == b.get("partei") for l in fuehrend) else 2
            elif e["b"][2] < 6:
                e["kh"] = 1 if any(l[1] == e["b"][2] for l in fuehrend) else 2
    ws_ = sorted(W.get(alias.get(g, g), []), key=lambda w: (w["datum"] or "", w["erfasst"]))
    if ws_:
        grp = lambda x: GI.get(x.get("gruppe") or "Liste", 6) if x.get("partei") else 7
        e["bw"] = [[w["datum"] or "", w["datum_art"], w["alt"]["name"], w["alt"].get("partei") or "", grp(w["alt"]),
                    w["neu"]["name"], w["neu"].get("partei") or "", grp(w["neu"]), w["quelle"]] for w in ws_]
        if e.get("b"): e["bg"] = e["b"][:2]                              # gewählt bei der letzten Wahl
        n = ws_[-1]["neu"]
        e["b"] = [n["name"], n.get("partei") or "", grp(n), 0, ws_[-1]["quelle"] + " (" + (ws_[-1]["datum"] or "Datum unbekannt") + ")"]
    gem.append(e)
mit = lambda k: [e[k] for e in gem if e.get(k) is not None]
gr = {"bet": quintile(mit("bet")), "wb": quintile(mit("wb")), "enp": [1.5, 2.0, 2.5, 3.0], "a": [10, 20, 35, 50]}
for e in gem:
    if "bet" in e: e["kb"] = klasse(e["bet"], gr["bet"])
    if e.get("wb"): e["kw"] = klasse(e["wb"], gr["wb"])
# Zusammenfassung je Land (Rechnung hier, das Blatt zeigt nur an)
zus = []
for c, land in LAND.items():
    gl = [e for e in gem if e["l"] == c and not e.get("fus")]
    md = [e for e in gl if e.get("L")]
    bg = [0] * 9
    for e in gl:
        bg[(e["b"][2] if e["b"][2] < 7 else 8) if e.get("b") else 7] += 1
    st = [0] * 7
    for e in md: st[e["st"]] += 1
    wb = sum(e["wb"] for e in md if e.get("wb") and e.get("ab")); ab = sum(e["ab"] for e in md if e.get("wb") and e.get("ab"))
    wahlen = sorted({(e["w"], e["dt"]) for e in md}, key=lambda x: (x[1][-4:], x[1][3:5], x[1][:2]))
    zus.append({"land": land, "n": len(gl), "mit": len(md), "bgm": bg, "st": st, "bet": round(100 * ab / wb, 2) if wb else None, "wahlen": wahlen})
boxen = {"g": {g: box(d) for g, d in K["gemeinden"].items()}, "b": {b: box(d) for b, d in K["bezirke"].items()}, "l": {l: box(d) for l, d in K["laender"].items()}}
paket = {"gem": gem, "grenzen": gr, "zus": zus, "gruppen": GRUPPEN, "laender": LAND,
         "geo": {"breite": K["kopf"]["breite"], "hoehe": K["kopf"]["hoehe"], "g": K["gemeinden"], "b": K["bezirke"], "l": K["laender"], "vermerk": K["kopf"]["vermerk"]}}
json.dump(paket, open(B + "/aus/paket.json", "w"), ensure_ascii=False, separators=(",", ":"))
import os; print(os.path.getsize(B + "/aus/paket.json"), gr)
for z in zus: print(z["land"], z["n"], z["mit"], z["bgm"], z["st"], z["bet"], z["wahlen"][:3])
