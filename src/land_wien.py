import os; B = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
"""Wien: Gemeinderatswahl 27.04.2025, Stadt Wien (OGD GR251.json), Mandate laut Rathauskorrespondenz vom 08.05.2025 (Endergebnis der Stadtwahlbehörde)."""
import html, json, re, sys
sys.path.insert(0, B + "/src"); from gemeinsam import gruppe
R = B + "/roh/"
d = json.load(open(R + "wien_gr251.json", encoding="utf-8-sig"))["Wien"]
t = html.unescape(re.sub(r"<[^>]+>", " ", open(R + "wien_presse.html", encoding="utf-8", errors="replace").read())); t = re.sub(r"\s+", " ", t)
mand = {m.group(1): int(m.group(3)) for m in re.finditer(r"(SPÖ|ÖVP|GRÜNE|NEOS|FPÖ|KPÖ): [\d,]+ % \(([\d.]+) Stimmen\), (\d+) Mandate", t)}
KURZ = {"SPÖ": "SPÖ", "Wiener Volkspartei": "ÖVP", "GRÜNE": "GRÜNE", "NEOS": "NEOS", "Freiheitliche": "FPÖ", "KPÖ": "KPÖ"}
listen = []
for e in d["Ergebnis"]:
    k = next((v for s, v in KURZ.items() if e["Name"].startswith(s)), None)
    listen.append({"name": e["Name"], "gruppe": k or "Liste", "stimmen": e["Stimmen"], "mandate": mand.get(k, 0) if k else 0})
aus = [{"gkz": "90001", "name": "Wien", "land": "Wien", "wahl": "Gemeinderatswahl 2025", "datum": "27.04.2025", "wb": d["Wahlberechtigte"],
        "abgegeben": d["AbgegebeneStimmen"], "gueltig": d["GueltigeStimmen"], "mandate": sum(l["mandate"] for l in listen), "listen": listen,
        "quelle": "Stadt Wien, OGD GR251 (Endergebnis der Stadtwahlbehörde); Mandate laut Rathauskorrespondenz 08.05.2025"}]
json.dump(aus, open(B + "/daten/wien.json", "w"), ensure_ascii=False, indent=0)
print(mand, aus[0]["mandate"], sum(l["stimmen"] for l in listen), d["GueltigeStimmen"])
