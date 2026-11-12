import os; B = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
"""Setzt Daten, Texte und Logo in die Vorlage ein. Aussagen werden aus den Zählungen gebildet (Python)."""
import json, re
P = json.load(open(B + "/aus/paket2.json"))
NAMEN = P["parteinamen"]; LAND = P["laender"]
de = lambda x, n=0: f"{x:,.{n}f}".replace(",", "X").replace(".", ",").replace("X", ".")
A = {a["id"]: a for a in P["ansichten"]}
def aussage(id, c):
    z = A[id]["zahl"].get(c, {}); n = lambda k: z.get(str(k), 0)
    ort = "Österreich" if c == "AT" else LAND[c]
    if id == "bgm":
        bek = sum(n(k) for k in range(7))
        if not bek: return f"{ort}: Bürgermeister werden vom Gemeinderat gewählt, die Partei ist in den amtlichen Wahldaten nicht enthalten."
        top = max(range(7), key=n)
        t = f"{ort}: {NAMEN[top]} {'stellen' if top == 6 else 'stellt'} in {de(n(top))} von {de(bek)} Gemeinden mit erfasster Partei den Bürgermeister"
        if n(7): t += f"; in {de(n(7))} Gemeinden ist die Partei nicht erfasst (meist Wahl durch den Gemeinderat)"
        if n(9): t += f"; in {de(n(9))} Gemeinden ist der Bürgermeister namentlich bekannt, die Partei aber nicht ausgewiesen"
        return t + "."
    if id == "st":
        ges = sum(n(k) for k in range(7)); top = max(range(7), key=n)
        return f"{ort}: {NAMEN[top]} ist in {de(n(top))} von {de(ges)} Gemeinden die mandatsstärkste Liste." if ges else ""
    if id == "mh":
        ges = n(1) + n(2) + n(3)
        return f"{ort}: In {de(n(2) + n(3))} von {de(ges)} Gemeinden hält die stärkste Liste die absolute Mehrheit der Mandate, davon in {de(n(3))} eine Zweidrittelmehrheit." if ges else ""
    if id.startswith("a"):
        i = int(id[1:]); ges = sum(n(k) for k in range(6)); an = sum(n(k) for k in range(1, 6))
        return f"{ort}: {NAMEN[i]} ist in {de(an)} von {de(ges)} Gemeinden mit Daten angetreten, in {de(n(5))} davon mit mindestens 50 % der Stimmen." if ges else ""
    if id == "kh":
        ges = n(1) + n(2)
        return f"{ort}: In {de(n(2))} von {de(ges)} bestimmbaren Gemeinden kommt der Bürgermeister nicht aus der mandatsstärksten Liste." if ges else f"{ort}: nicht bestimmbar, weil die Partei des Bürgermeisters nicht erfasst ist."
    if id.startswith("d") and id != "dbet":
        i = int(id[1:]); ges = sum(n(k) for k in range(1, 8))
        return f"{ort}: {NAMEN[i]} hat gegenüber der Vorwahl in {de(n(5) + n(6) + n(7))} von {de(ges)} vergleichbaren Gemeinden mindestens 2 Prozentpunkte gewonnen und in {de(n(1) + n(2) + n(3))} mindestens 2 Prozentpunkte verloren." if ges else f"{ort}: kein Vergleich mit der Vorwahl möglich."
    if id == "ws":
        ges = n(8) + sum(n(10 + k) for k in range(7)); w = sum(n(10 + k) for k in range(7))
        if not ges: return f"{ort}: kein Vergleich mit der Vorwahl möglich."
        t = f"{ort}: In {de(w)} von {de(ges)} vergleichbaren Gemeinden ist eine andere Parteigruppe stärkste Kraft als bei der Vorwahl"
        if w: top = max(range(7), key=lambda k: n(10 + k)); t += f", am häufigsten zugunsten {'der Namens- und Bürgerlisten' if top == 6 else 'der ' + NAMEN[top] if top == 3 else 'von ' + NAMEN[top]} ({de(n(10 + top))})"
        return t + "."
    if id == "dbet":
        ges = sum(n(k) for k in range(1, 8))
        return f"{ort}: Die Wahlbeteiligung ist in {de(n(5) + n(6) + n(7))} von {de(ges)} vergleichbaren Gemeinden um mindestens 2 Prozentpunkte gestiegen und in {de(n(1) + n(2) + n(3))} um mindestens 2 Prozentpunkte gesunken." if ges else f"{ort}: kein Vergleich der Wahlbeteiligung möglich."
    if id == "bet":
        z2 = next((x for x in P["zus"] if x["land"] == ort), None)
        b = z2["bet"] if z2 else None
        if c == "AT":
            return "Die Wahlbeteiligung reicht von unter " + de(P["grenzen"]["bet"][0], 1) + " % im unteren Fünftel bis über " + de(P["grenzen"]["bet"][3], 1) + " % im oberen Fünftel der Gemeinden."
        return f"{ort}: Wahlbeteiligung über alle Gemeinden mit Daten {de(b, 1)} %." if b is not None else f"{ort}: Wahlbeteiligung nicht verfügbar (abgegebene Stimmen fehlen im Datensatz)."
    return ""
AL = json.load(open(B + "/daten/alle.json"))
_lauf = B + "/daten/bgm_lauf.json"
LAUF = json.load(open(_lauf)) if os.path.exists(_lauf) else None
_prot = B + "/daten/bgm_wechsel.json"
PROT = json.load(open(_prot, encoding="utf-8")) if os.path.exists(_prot) else []
import collections
wk = collections.Counter(a["land"] for a in AL.values() if (a.get("bgm") or {}).get("wiki"))
vb = collections.Counter(a["land"] for a in AL.values() if (a.get("bgm") or {}).get("vorbehalt"))
oh = collections.Counter(a["land"] for a in AL.values() if a.get("bgm") and a["bgm"].get("name") and not a["bgm"].get("partei"))
def aufz(c, nach=" Gemeinden"): 
    t = [f"{l} {de(n)}" for l, n in sorted(c.items())]
    return (", ".join(t[:-1]) + " und " + t[-1] if len(t) > 1 else t[0]) + nach if t else "keine"
WIKI_TEXT = aufz(wk) + " (Wahl durch den Gemeinderat oder Einzelfälle ohne amtliche Angabe)"
VORB_TEXT = aufz(vb)
OHNE_TEXT = aufz(oh)
TIROL_ERG = sum(1 for a in AL.values() if a["land"] == "Tirol" and "Partei laut Wikipedia" in (a.get("bgm") or {}).get("quelle", ""))
TIROL_ABW = sum(1 for a in AL.values() if a["land"] == "Tirol" and "inzwischen" in (a.get("bgm") or {}).get("quelle", ""))
KTN_ABW = sum(1 for a in AL.values() if a["land"] == "Kärnten" and "inzwischen" in (a.get("bgm") or {}).get("quelle", ""))
aussagen = {id: {c: aussage(id, c) for c in ["AT"] + list(LAND)} for id in A}
T = {
 "stand": "Wahlergebnisse: amtliche Ergebnisse der jeweils letzten Gemeinderatswahl je Gemeinde (2021 bis 2026), abgerufen am 11.11.2026" + ("; Bürgermeister: täglicher Abgleich, Stand " + ".".join(reversed(LAUF["datum"].split("-"))) if LAUF else ""),
 "wechselvon": "2021-01-01",
 "wechselbis": LAUF["datum"] if LAUF else "2026-11-12",
 "wechselhinweis": "Datum: Erkennung im täglichen Abgleich oder erste Nennung in Wikipedia, nicht der Tag des Amtsantritts.",
 "vermerk": P["geo"]["vermerk"] + "; Gebietsstand 2021, Fürstenfeld und Söchau seit 2025 eine Gemeinde.",
 "titel": {"bgm": "Bürgermeister nach Partei", "st": "Stärkste Liste im Gemeinderat", "mh": "Mehrheitsverhältnisse im Gemeinderat", "a": "Stimmenanteil je Partei",
           "bet": "Wahlbeteiligung bei der Gemeinderatswahl", "wb": "Größe der Gemeinden nach Wahlberechtigten", "enp": "Zersplitterung der Gemeinderäte",
           "kh": "Bürgermeister und stärkste Liste", "d": "Veränderung des Stimmenanteils zur Vorwahl", "ws": "Wechsel der stärksten Partei seit der Vorwahl", "dbet": "Veränderung der Wahlbeteiligung zur Vorwahl", "wechsel": "Bürgermeisterwechsel im gewählten Zeitraum", "j": "Datenstand: Jahr der letzten Gemeinderatswahl"},
 "aussagen": aussagen,
 "infoleer": "Gemeinde auf der Karte anklicken oder oben suchen. Das Feld zeigt Wahlberechtigte, Beteiligung, alle Listen mit Stimmen und Mandaten, den Bürgermeister und die Quelle.",
 "ohne": {},
 "abschnitte": [
  ["Quellen je Land", [
   "Burgenland: Statistik Burgenland, Gemeinderats- und Bürgermeisterwahl 2022 (Wahl 02.10.2022), Publikation mit Zurechnung der Namenslisten zu Parteien.",
   "Kärnten: Amt der Kärntner Landesregierung, Gemeinderatswahl und Bürgermeisterwahl 28.02.2021, Bürgermeister-Stichwahl 14.03.2021 (ktn.gv.at, Ergebnisse je Gemeinde). Ersetzt den Datawrapper-Datensatz; daraus stammen nur noch die Vizebürgermeister, die in der amtlichen Quelle fehlen. Wo der Datawrapper-Datensatz einen anderen Bürgermeister nennt (" + de(KTN_ABW) + " Gemeinden), steht das als Hinweis bei der Quelle.",
   "Niederösterreich: Amt der NÖ Landesregierung, gr25.xls (Wahl 26.01.2025, inkl. Pernersdorf 2024); Neuwahl Vösendorf 21.09.2025 und Wahlwiederholungen 18.05.2025 (Gablitz, Klosterneuburg, Marchegg, Maria Lanzendorf) aus den endgültigen Ergebnissen ersetzt. Statutarstädte aus den endgültigen Ergebnissen: St. Pölten 2026, Krems an der Donau 2022, Waidhofen an der Ybbs 2022. Die Quelle weist Parteigruppen aus, nahestehende Listen sind der Partei zugerechnet.",
   "Oberösterreich: Amt der Oö. Landesregierung, Wahlbericht Gemeinderatswahl 2021 und Liste der Bürgermeisterwahl 2021 (Wahl 26.09.2021, Stichwahlen Oktober 2021). Parteigruppen laut Quelle; MFG, CPÖ und Sonstige als Listen.",
   "Salzburg: Landesstatistik Salzburg, Daten der Wahlanwendung (Gemeindevertretungs- und Bürgermeisterwahl 10.03.2024, Stichwahl 24.03.2024). Parteigruppen und Zuordnung der Bürgermeister laut Landesstatistik.",
   "Steiermark: Amt der Steiermärkischen Landesregierung, Stimmenprotokoll endgültig (Wahl 23.03.2025), Zuordnung der Listen zu Parteien laut Quelle. Graz: Stadt Graz, wahlergebnis.graz.at (Gemeinderatswahl 28.06.2026, Datenquelle Land Steiermark), Mandate laut graz.at.",
   "Tirol: Land Tirol, wahlen.tirol.gv.at, CSV der Gemeinderats- und Bürgermeisterwahlen 27.02.2022 mit engerer Wahl 13.03.2022, Matrei am Brenner 20.03.2022 und Innsbruck 14.04.2024 mit engerer Wahl 28.04.2024; Gemeindeseiten für Wängle 09.01.2022 sowie Musau und Seefeld in Tirol 25.02.2024.",
   "Vorarlberg: Amt der Vorarlberger Landesregierung, Gemeindewahl 2025 endgültig (Wahl 16.03.2025, Stichwahl 30.03.2025).",
   "Wien: Stadt Wien, OGD GR251 (Gemeinderatswahl 27.04.2025, Endergebnis der Stadtwahlbehörde); Mandate laut Rathauskorrespondenz vom 08.05.2025. Bürgermeister: Wahl durch den Gemeinderat am 10.06.2025 (Bericht ganz-wien.at).",
   "Bürgermeister ohne amtliche Liste: deutschsprachige Wikipedia, Infobox der Gemeindeartikel (Name, Partei, Wahljahr, Datum der Revision), ausgelesen am 11.11.2026. Betrifft " + WIKI_TEXT + ". Im Infofeld steht bei jedem dieser Bürgermeister „laut Wikipedia“ mit dem Datum der Revision.",
   "Vorwahl für den Vergleich: Niederösterreich 2020 (gr20_25.xls, Gebietsstand 2025) bzw. Statutarstädte und Neuwahlen aus den endgültigen Ergebnissen, Oberösterreich 2015 (Differenzspalten des Wahlberichts 2021), Burgenland 2017, Kärnten 2015, Salzburg 2019, Steiermark 2020 (Wahlarchiv; Fürstenfeld und Söchau zusammengezählt), Graz 2021, Tirol 2016 (Musau und Seefeld 2022), Vorarlberg 2020, Wien 2020. Jeweils aus derselben amtlichen Stelle wie die letzte Wahl.",
   "Gemeindegrenzen und Einwohner: " + P["geo"]["vermerk"] + "; Einwohner zu Jahresbeginn 2026 laut Statistik Austria."]],
  ["Lücken und Vorbehalte", [
   "Bürgermeister laut Wikipedia: In " + VORB_TEXT + " nennt die Infobox ein Wahljahr vor der letzten Gemeinderatswahl; ob die Angabe danach aktualisiert wurde, ist nicht bestätigt. Das steht bei der Quelle im Infofeld. Wikipedia ist keine amtliche Quelle.",
   "Ohne Partei des Bürgermeisters: " + OHNE_TEXT + " (Name bekannt, Partei weder amtlich noch in Wikipedia angegeben).",
   "Tirol: Die amtliche Quelle nennt den Bürgermeister ohne Liste. Die Liste ist aus Wikipedia ergänzt, wenn der Familienname übereinstimmt (" + de(TIROL_ERG) + " Gemeinden). Wo Wikipedia inzwischen eine andere Person nennt (" + de(TIROL_ABW) + " Gemeinden), bleibt der gewählte Bürgermeister stehen und der Hinweis steht bei der Quelle.",
   "Musau (Tirol, 2024): Die Quelle weist keine Mandate aus; sie sind nach d'Hondt aus den Stimmen berechnet.",
   "Vorarlberg: 13 Gemeinden mit Mehrheitswahl ohne Listen haben keine Stimmen je Liste und keinen Vergleich.",
   "Bürgermeister können seit der Wahl gewechselt haben (Rücktritt, Neuwahl im Gemeinderat). Amtliche Angaben zeigen den Stand nach der Wahl, Wikipedia den Stand der Revision."]],
  ["Bürgermeisterwechsel", [
   "Täglicher Abgleich: amtliche Gemeindeliste des Landes Oberösterreich (ooeGem.txt, vom Land täglich aktualisiert) und die Infobox des Wikipedia-Artikels jeder übrigen Gemeinde (Zuordnung über Wikidata). Für die anderen Länder ist keine amtliche, laufend gepflegte Bürgermeisterliste bekannt.",
   "Erster Abgleich gegen den Bürgermeister nach der letzten Wahl: " + de(len(PROT)) + " Wechsel im Protokoll. Ihr Datum ist die erste Bearbeitung in Wikipedia, die den neuen Namen nennt; ohne solche Bearbeitung bleibt das Datum offen („Datum unbekannt“). Ab dem Start des täglichen Abgleichs gilt der Tag der Erkennung.",
   "Das Datum ist nie der Tag der Wahl im Gemeinderat oder der Angelobung. Wikipedia wird oft Tage bis Wochen später aktualisiert, manche Wechsel nie.",
   "Kein Wechsel wird gemeldet, wenn die Infobox in Wikipedia ein Wahljahr vor der letzten Gemeinderatswahl nennt (Angabe vermutlich veraltet) oder wenn sich nur die Schreibweise des Namens unterscheidet (Titel, Reihenfolge von Vor- und Nachname).",
   "Rückfälle durch Vandalismus in Wikipedia werden mit dem nächsten Abgleich als weiterer Wechsel sichtbar; bei Zweifeln die Quelle im Infofeld prüfen."]],
  ["Veränderung zur Vorwahl", [
   "Verglichen werden die Stimmenanteile der Parteigruppen (nicht einzelner Listen) mit der vorigen Gemeinderatswahl derselben Gemeinde, in Prozentpunkten. Klassen: Verlust bzw. Gewinn ab 10, 5 bis unter 10 und 2 bis unter 5 Punkte, dazwischen „kaum verändert“.",
   "Namens- und Bürgerlisten werden als eine Gruppe verglichen. Eine Veränderung dort bedeutet nicht, dass dieselbe Liste gewonnen oder verloren hat; in Tirol und Vorarlberg ist das die Mehrzahl der Listen.",
   "Oberösterreich 2015: Der Wahlbericht 2021 weist Differenzen nur für die Parteien aus; die Vorwahl der Namenslisten ist nicht bekannt („n. v.“), ebenso die Wahlbeteiligung 2015. Ein Wechsel zu einer Namensliste ist dort nicht bestimmbar.",
   "Graz 2021: Die Ergebnisseite nennt nur die 2026 wieder angetretenen Listen; die übrigen Listen 2021 sind als Rest den Namens- und Bürgerlisten zugerechnet. Keine Mandate 2021.",
   "Wahlbeteiligung: Die Zahl der Wahlberechtigten hängt in Niederösterreich und im Burgenland auch an Nebenwohnsitzen; Änderungen der Wählerevidenz zwischen den Wahlen können die Veränderung der Beteiligung dort mitbestimmen.",
   "Gebietsänderungen: Fürstenfeld und Söchau sind für 2020 zusammengezählt; sonst Gebietsstand der jeweiligen Quelle."]],
  ["Zuordnung und Kennzahlen", [
   "Parteigruppen: Zuordnung laut Quelle, wo vorhanden (NÖ, OÖ, Salzburg, Steiermark, Burgenland). Sonst nach dem Listennamen (Partei im Namen); alle übrigen Listen sind Namens- und Bürgerlisten. Das ist eine Zuordnung nach dem Namen, keine Aussage über die politische Nähe einer Liste.",
   "Stärkste Liste: Liste mit den meisten Mandaten, bei Gleichstand mit den meisten Stimmen. Mehrheit nach dem Mandatsanteil dieser Liste. Stärkste Partei im Vergleich: Parteigruppe mit dem höchsten Stimmenanteil.",
   "Wahlbeteiligung: abgegebene Stimmen geteilt durch Wahlberechtigte. Fünftelgrenzen über alle Gemeinden mit Daten: " + ", ".join(de(x, 1) + " %" for x in P["grenzen"]["bet"]) + ".",
   "Zersplitterung: effektive Zahl der Listen nach Laakso und Taagepera (1 geteilt durch die Summe der quadrierten Stimmenanteile). Nicht berechnet, wo die Quelle nur Parteigruppen ausweist (NÖ ohne Neuwahlen, OÖ, Salzburg).",
   "Die Wahlen liegen zwischen Februar 2021 und Juni 2026; Vergleiche zwischen Ländern spiegeln auch den Zeitpunkt der Wahl."]]]}
daten = {k: P[k] for k in ("gem", "ansichten", "parteinamen", "laender", "zus", "geo")}
v = open(B + "/src/vorlage.html", encoding="utf-8").read()
j = lambda o: json.dumps(o, ensure_ascii=False, separators=(",", ":")).replace("</", "<\\/")
html = v.replace("__DATEN__", j(daten)).replace("__TEXTE__", j(T))
open(B + "/aus/Gemeinderatswahlen_Oesterreich.html", "w", encoding="utf-8").write(html)
import os; print(os.path.getsize(B + "/aus/Gemeinderatswahlen_Oesterreich.html"))
for id in ("bgm", "st", "mh", "kh"): print(aussagen[id]["AT"])
