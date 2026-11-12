import os; B = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
"""Klassen je Ansicht und Gemeinde sowie Zählungen je Ausschnitt (Rechnung in Python)."""
import json
P = json.load(open(B + "/aus/paket.json"))
gem = P["gem"]; GR = P["gruppen"]; gr = P["grenzen"]
NAMEN = ["ÖVP", "SPÖ", "FPÖ", "Grüne", "NEOS", "KPÖ", "Namens- und Bürgerlisten"]
PF = [f"var(--p{i})" for i in range(7)]
S = ["var(--s1)", "var(--s2)", "var(--s3)", "var(--s4)", "var(--s5)"]
LEER = "var(--leer)"; SCHRAFF = "url(#schraffur)"
de = lambda x, n=1: f"{x:,.{n}f}".replace(",", "X").replace(".", ",").replace("X", ".")
def fuenftel_labels(g, fmt):
    return [f"bis {fmt(g[0])}", f"{fmt(g[0])} bis {fmt(g[1])}", f"{fmt(g[1])} bis {fmt(g[2])}", f"{fmt(g[2])} bis {fmt(g[3])}", f"über {fmt(g[3])}"]
ans = []
def neu(id, name, sub, klassen, wert):
    werte = [wert(e) for e in gem]
    ans.append({"id": id, "name": name, "sub": sub, "klassen": klassen, "werte": werte})
# 1 Bürgermeister
kl = [{"k": i, "t": NAMEN[i], "f": PF[i]} for i in range(7)] + [{"k": 9, "t": "Name bekannt, Partei in der Quelle nicht ausgewiesen", "f": "var(--s2)"}, {"k": 7, "t": "Partei nicht erfasst (meist Wahl durch den Gemeinderat)", "f": SCHRAFF}, {"k": 8, "t": "keine Daten", "f": LEER}]
def bgm(e):
    if e.get("b"): return e["b"][2] if e["b"][2] < 7 else 9
    return 7 if e.get("L") or e["l"] in "369" else 8
neu("bgm", "Bürgermeister: Partei", "Partei oder Liste der amtierenden Bürgermeisterin bzw. des amtierenden Bürgermeisters (nach der Wahl, ergänzt um erkannte Wechsel)", kl, bgm)
# 2 stärkste Liste
neu("st", "Stärkste Liste im Gemeinderat", "Liste mit den meisten Mandaten (bei Gleichstand meiste Stimmen), nach Parteigruppe",
    [{"k": i, "t": NAMEN[i], "f": PF[i]} for i in range(7)] + [{"k": 8, "t": "keine Daten", "f": LEER}], lambda e: e.get("st", 8))
# 3 Mehrheit
neu("mh", "Mehrheit der stärksten Liste", "Mandatsanteil der stärksten Liste im Gemeinderat",
    [{"k": 1, "t": "relative Mehrheit (bis 50 %)", "f": S[0]}, {"k": 2, "t": "absolute Mehrheit (über 50 %)", "f": S[2]}, {"k": 3, "t": "Zweidrittelmehrheit (ab 66,7 %)", "f": S[4]}, {"k": 0, "t": "keine Daten", "f": LEER}],
    lambda e: e.get("mh", 0))
# 4 Stimmenanteil je Partei
a = gr["a"]; lab = [f"unter {a[0]} %", f"{a[0]} bis unter {a[1]} %", f"{a[1]} bis unter {a[2]} %", f"{a[2]} bis unter {a[3]} %", f"ab {a[3]} %"]
def anteil_klasse(v):
    if v is None: return 6
    if v == 0: return 0
    for i, g in enumerate(a):
        if v < g: return i + 1
    return 5
for i in range(7):
    stufen = [f"color-mix(in srgb, var(--p{i}) {p}%, var(--karte))" for p in (22, 42, 62, 82, 100)]
    neu(f"a{i}", f"Stimmenanteil {NAMEN[i]}", f"Anteil an den gültigen Stimmen der Gemeinderatswahl; {NAMEN[i]} einschließlich zugeordneter Listen",
        [{"k": 0, "t": "nicht angetreten", "f": "var(--leer2)"}] + [{"k": j + 1, "t": lab[j], "f": stufen[j]} for j in range(5)] + [{"k": 6, "t": "keine Daten", "f": LEER}],
        lambda e, i=i: anteil_klasse(e["a"][i]) if e.get("a") else 6)
# 5 Wahlbeteiligung
neu("bet", "Wahlbeteiligung", "Abgegebene Stimmen je Wahlberechtigte, Fünftel über alle Gemeinden mit Daten",
    [{"k": j + 1, "t": t, "f": S[j]} for j, t in enumerate(fuenftel_labels(gr["bet"], lambda x: de(x, 1) + " %"))] + [{"k": 0, "t": "keine Daten", "f": LEER}], lambda e: e.get("kb", 0))
# 6 Wahlberechtigte
neu("wb", "Wahlberechtigte", "Zahl der Wahlberechtigten der Gemeinderatswahl, Fünftel über alle Gemeinden",
    [{"k": j + 1, "t": t, "f": S[j]} for j, t in enumerate(fuenftel_labels(gr["wb"], lambda x: de(x, 0)))] + [{"k": 0, "t": "keine Daten", "f": LEER}], lambda e: e.get("kw", 0))
# 7 Zersplitterung
eg = gr["enp"]
def enp(e):
    v = e.get("enp")
    if v is None: return 0
    for j, g in enumerate(eg):
        if v < g: return j + 1
    return 5
neu("enp", "Zersplitterung des Gemeinderats", "Effektive Zahl der Listen nach Stimmen (1 geteilt durch die Summe der quadrierten Anteile); ohne Länder mit nur Parteigruppen",
    [{"k": 1, "t": "unter 1,5 (eine Liste dominiert)", "f": S[0]}, {"k": 2, "t": "1,5 bis unter 2", "f": S[1]}, {"k": 3, "t": "2 bis unter 2,5", "f": S[2]}, {"k": 4, "t": "2,5 bis unter 3", "f": S[3]}, {"k": 5, "t": "ab 3 (stark zersplittert)", "f": S[4]}, {"k": 0, "t": "keine Daten oder nur Parteigruppen", "f": LEER}], enp)
# 8 Bürgermeister und stärkste Liste
neu("kh", "Bürgermeister aus der stärksten Liste?", "Vergleich der Partei bzw. Liste der Bürgermeisterin oder des Bürgermeisters mit der mandatsstärksten Liste",
    [{"k": 1, "t": "ja, aus der stärksten Liste", "f": S[1]}, {"k": 2, "t": "nein, aus einer anderen Liste", "f": S[4]}, {"k": 0, "t": "nicht bestimmbar", "f": LEER}], lambda e: e.get("kh", 0))
# 9 Wahljahr
jahre = sorted({e["j"] for e in gem if e.get("j")})
neu("j", "Jahr der letzten Gemeinderatswahl", "Datenstand je Gemeinde; die Länder wählen zu unterschiedlichen Terminen",
    [{"k": y, "t": str(y), "f": S[min(4, i)]} for i, y in enumerate(jahre)] + [{"k": 0, "t": "keine Daten", "f": LEER}], lambda e: e.get("j", 0))
# 10 bis 12 Veränderung zur vorigen Wahl (divergierend: Verlust orange, Gewinn violett, Mitte grau)
DV = [f"var(--v{i})" for i in range(1, 8)]
DS = [-10, -5, -2, 2, 5, 10]
DL = ["Verlust ab 10 Punkten", "Verlust 5 bis unter 10 Punkte", "Verlust 2 bis unter 5 Punkte", "kaum verändert (unter 2 Punkte)",
      "Gewinn 2 bis unter 5 Punkte", "Gewinn 5 bis unter 10 Punkte", "Gewinn ab 10 Punkten"]
def dklasse(x):
    if x <= DS[0]: return 1
    if x <= DS[1]: return 2
    if x <= DS[2]: return 3
    if x < DS[3]: return 4
    if x < DS[4]: return 5
    if x < DS[5]: return 6
    return 7
NV = {"k": 0, "t": "nicht vergleichbar oder keine Vorwahl", "f": LEER}
for i in range(7):
    def dw(e, i=i):
        if not e.get("da") or e["da"][i] is None: return 0
        if e["a"][i] == 0 and e["va"][i] == 0: return 8
        return dklasse(e["da"][i])
    neu(f"d{i}", f"Veränderung {NAMEN[i]}", f"Stimmenanteil {NAMEN[i]} gegenüber der vorigen Gemeinderatswahl, in Prozentpunkten",
        [{"k": j + 1, "t": DL[j], "f": DV[j]} for j in range(7)] + [{"k": 8, "t": "in beiden Wahlen nicht angetreten", "f": "var(--leer2)"}, NV], dw)
def ws(e):
    if not e.get("ws"): return 0
    a, b = e["ws"]
    return 8 if a == b else 10 + b
neu("ws", "Wechsel der stärksten Partei", "Parteigruppe mit dem höchsten Stimmenanteil, verglichen mit der vorigen Gemeinderatswahl",
    [{"k": 8, "t": "unverändert", "f": "var(--s2)"}] + [{"k": 10 + i, "t": "Wechsel zu " + NAMEN[i], "f": PF[i]} for i in range(7)] + [NV], ws)
DB = [-10, -5, -2, 2, 5, 10]
neu("dbet", "Veränderung der Wahlbeteiligung", "Wahlbeteiligung gegenüber der vorigen Gemeinderatswahl, in Prozentpunkten",
    [{"k": j + 1, "t": DL[j].replace("Verlust", "Rückgang").replace("Gewinn", "Anstieg"), "f": DV[j]} for j in range(7)] + [NV],
    lambda e: dklasse(e["dbet"]) if e.get("dbet") is not None else 0)
# Zählungen je Ausschnitt (ohne die zweite Fläche fusionierter Gemeinden)
for v in ans:
    z = {}; gesehen = set()
    for e, w in zip(gem, v["werte"]):
        if e.get("fus"):
            if e["fus"] in gesehen: continue
            gesehen.add(e["fus"])
        for c in ("AT", e["l"]): z.setdefault(c, {}); z[c][str(w)] = z[c].get(str(w), 0) + 1
    v["zahl"] = z
P["ansichten"] = ans; P["parteinamen"] = NAMEN
json.dump(P, open(B + "/aus/paket2.json", "w"), ensure_ascii=False, separators=(",", ":"))
for v in ans[:3]: print(v["id"], v["zahl"]["AT"])
