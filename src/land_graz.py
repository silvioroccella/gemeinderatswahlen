import os; B = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
"""Graz: Gemeinderatswahl 28.06.2026, amtliches Endergebnis (wahlergebnis.graz.at, Datenquelle Land Steiermark, Stand 29.06.2026),
Mandate laut Stadt Graz (graz.at, Die Grazer Gemeinderatswahl 2026). Vergleich 2021 aus derselben Ergebnisseite (ohne Mandate).
Bürgermeisterin: Wahl durch den Gemeinderat (Bericht news.at). Ausgelesen 11.11.2026 im Browser."""
import json, sys
sys.path.insert(0, B + "/src"); from gemeinsam import gruppe, GRUPPEN
GI = {g: i for i, g in enumerate(GRUPPEN)}
# Liste, Stimmen 2026, Mandate 2026, Stimmen 2021
L = [("KPÖ", 43145, 18, 34283), ("ÖVP", 30554, 13, 30797), ("GRÜNE", 18066, 7, 20593), ("FPÖ", 14509, 6, 12612),
     ("SPÖ", 6802, 2, 11325), ("NEOS", 5951, 2, 6447), ("KFG", 822, 0, 0), ("MFG", 334, 0, 0), ("PIRAT", 307, 0, 468),
     ("GAZA", 247, 0, 0), ("DBÖ", 130, 0, 0)]
WB, UNG, GU, AB = 225883, 1493, 120867, 122360
WB21, GU21, AB21 = 223512, 118882, 120689
assert sum(x[1] for x in L) == GU and AB == UNG + GU and sum(x[2] for x in L) == 48
Q = "Stadt Graz, wahlergebnis.graz.at (Datenquelle Land Steiermark, Stand 29.06.2026); Mandate laut graz.at"
d = [{"gkz": "60101", "name": "Graz", "land": "Steiermark", "wahl": "Gemeinderatswahl 2026", "datum": "28.06.2026",
      "wb": WB, "abgegeben": AB, "gueltig": GU, "mandate": 48,
      "listen": [{"name": n, "gruppe": gruppe(n), "stimmen": s, "mandate": m} for n, s, m, _ in L],
      "hinweis": None, "quelle": Q,
      "bgm": {"name": "Elke Kahr", "partei": "KPÖ", "gruppe": "KPÖ", "direktwahl": False,
              "quelle": "Wahl durch den Gemeinderat nach der Wahl 2026 (Bericht news.at)"}}]
json.dump(d, open(B + "/daten/graz.json", "w"), ensure_ascii=False)
a = [0.0] * 7
for n, _, _, s21 in L: a[GI[gruppe(n)]] += s21
a[GI["Liste"]] += GU21 - sum(x[3] for x in L)          # übrige Listen 2021, auf der Ergebnisseite nicht einzeln ausgewiesen
vor = {"60101": {"datum": "26.09.2021", "wahl": "Gemeinderatswahl 2021", "quelle": "Stadt Graz, wahlergebnis.graz.at (Vergleichsspalte 2021)",
                 "a": [round(100 * x / GU21, 2) for x in a], "m": None, "bet": round(100 * AB21 / WB21, 2)}}
json.dump(vor, open(B + "/daten/vor_graz.json", "w"), ensure_ascii=False)
print(d[0]["listen"][:2], vor)
