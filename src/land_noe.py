import os; B = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
"""NÖ: Gemeinderatswahl 26.01.2025, Amt der NÖ Landesregierung, gr25.xls (Gruppen inkl. nahestehender Listen)."""
import json, sys, pandas as pd
sys.path.insert(0, B + "/src"); from gemeinsam import zahl
x = pd.read_excel(B + "/roh/noe_gr25.xls", header=None)
gruppen = [("ÖVP", 7), ("SPÖ", 12), ("FPÖ", 17), ("GRÜNE", 22), ("NEOS", 27), ("Liste", 32)]
aus = []
for i in range(4, len(x)):
    r = x.iloc[i].tolist(); kz = str(r[0]).strip()
    if len(kz) != 5 or not kz.isdigit() or kz.endswith("00"): continue
    wb, bet, ung, gue, mand = zahl(r[2]), r[3], zahl(r[4]), zahl(r[5]), zahl(r[6])
    listen = []
    for g, c in gruppen:
        st = zahl(r[c]); m = zahl(r[c + 3])
        if st is None: continue
        listen.append({"name": {"Liste": "Sonstige Listen"}.get(g, g + " (inkl. nahestehender Listen)"), "gruppe": g, "stimmen": st, "mandate": m or 0})
    aus.append({"gkz": kz, "name": str(r[1]).strip(), "land": "Niederösterreich", "wahl": "Gemeinderatswahl 2025", "datum": "26.01.2025",
                "wb": wb, "abgegeben": gue + ung, "gueltig": gue, "mandate": mand, "listen": listen,
                "quelle": "Amt der NÖ Landesregierung, gr25.xls (noe.gv.at/wahlen)", "gruppiert": True})
json.dump(aus, open(B + "/daten/noe.json", "w"), ensure_ascii=False, indent=0)
print(len(aus))
