import os; B = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
"""Tirol, Einzelwahlen außerhalb des CSV-Bestands, amtlich (wahlen.tirol.gv.at, Gemeindeseiten, ausgelesen 11.11.2026 im Browser):
Wängle 09.01.2022, Musau 2024, Seefeld in Tirol 2024. Schreibt daten/tirol_nach.json und daten/vor_tirol_nach.json."""
import json, sys
sys.path.insert(0, B + "/src"); from gemeinsam import gruppe, GRUPPEN
GI = {g: i for i, g in enumerate(GRUPPEN)}
def dhondt(stimmen, sitze):
    m = [0] * len(stimmen)
    for _ in range(sitze):
        i = max(range(len(stimmen)), key=lambda k: stimmen[k] / (m[k] + 1)); m[i] += 1
    return m
W = [
 dict(gkz="70835", name="Wängle", datum="09.01.2022", wahl="Gemeinderatswahl 2022", seite="gemeinderats_und_buergermeisterwahlen_2022_waengle/gemeinden/waengle.html",
      wb=811, ab=576, gu=562, sitze=11, listen=[("Allgemeine Wängler Gemeindeliste - AWG - Gemeinsam für Wängle - AWG", 263, 5), ("Aktive Bürgervertretung Wängle - ABW", 299, 6)],
      bgm=("Barbist Florian", 53.02)),
 dict(gkz="70822", name="Musau", datum="25.02.2024", wahl="Gemeinderatswahl 2024", seite="gemeinderats_und_buergermeisterwahl_2024_gemeinde_musau/gemeinden/musau.html",
      wb=340, ab=248, gu=243, sitze=11, listen=[("Wir für Musau - WFM", 172, None), ("Musau Gestalten - FÜRMUASA", 71, None)],
      bgm=("Tschol Christine Maria", 100.0)),
 dict(gkz="70351", name="Seefeld in Tirol", datum="25.02.2024", wahl="Gemeinderatswahl 2024", seite="gemeinderats_und_buergermeisterwahl_2024_gemeinde_seefeld/gemeinden/seefeld_in_tirol.html",
      wb=2811, ab=1319, gu=1206, sitze=15, listen=[("Seefeld bewegen-Andrea Neuner - SBW", 649, 8), ("Aktiv für Seefeld - AS", 557, 7)],
      bgm=("Neuner Andrea Alexandra", 100.0)),
]
alt = {x["gkz"]: x for x in json.load(open(B + "/daten/tirol.json"))}
aus, vor = [], {}
for w in W:
    st = [s for _, s, _ in w["listen"]]; assert sum(st) == w["gu"]
    mand = [m for _, _, m in w["listen"]]; hinweis = None
    if None in mand:
        mand = dhondt(st, w["sitze"]); hinweis = "Mandate in der Quelle nicht ausgewiesen, nach d'Hondt aus den Stimmen berechnet"
    q = "Land Tirol, wahlen.tirol.gv.at/" + w["seite"]
    aus.append({"gkz": w["gkz"], "name": w["name"], "land": "Tirol", "wahl": w["wahl"], "datum": w["datum"], "wb": w["wb"], "abgegeben": w["ab"], "gueltig": w["gu"],
                "mandate": w["sitze"], "listen": [{"name": n, "gruppe": gruppe(n), "stimmen": s, "mandate": m} for (n, s, _), m in zip(w["listen"], mand)],
                "hinweis": hinweis, "quelle": q,
                "bgm": {"name": w["bgm"][0], "partei": "", "direktwahl": True, "wahlgang": 1, "anteil": w["bgm"][1], "quelle": q}})
    a = alt.get(w["gkz"])
    if a and a.get("gueltig") and w["wahl"].endswith("2024"):       # Vergleich: Wahl 2022
        s = [0.0] * 7; m = [0] * 7
        for l in a["listen"]: s[GI[l["gruppe"]]] += l["stimmen"]; m[GI[l["gruppe"]]] += l["mandate"]
        vor[w["gkz"]] = {"datum": a["datum"], "wahl": a["wahl"], "quelle": a["quelle"], "a": [round(100 * x / a["gueltig"], 2) for x in s], "m": m,
                         "bet": round(100 * a["abgegeben"] / a["wb"], 2)}
json.dump(aus, open(B + "/daten/tirol_nach.json", "w"), ensure_ascii=False)
json.dump(vor, open(B + "/daten/vor_tirol_nach.json", "w"), ensure_ascii=False)
print([(a["name"], [l["mandate"] for l in a["listen"]], a["hinweis"]) for a in aus], list(vor))
