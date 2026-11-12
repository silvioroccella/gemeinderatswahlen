# Gemeinderatswahlen und Bürgermeister in Österreich

Karte aller 2.092 Gemeinden: Ergebnisse der jeweils letzten Gemeinderatswahl, Veränderung zur Vorwahl und Bürgermeister mit täglich erkannten Wechseln. Eine HTML-Datei, läuft offline. Kein BDO-Produkt und nicht Teil von BDO Meridian.

## Täglicher Lauf (GitHub Actions)
`.github/workflows/taeglich.yml` läuft jeden Morgen und manuell über „Run workflow“:
1. `src/bgm_aktuell.py` holt die amtliche Bürgermeisterliste des Landes Oberösterreich und die Wikipedia-Infobox aller übrigen Gemeinden, vergleicht mit dem Vortag und ergänzt `daten/bgm_wechsel.json`.
2. `src/bauen_daten.py`, `src/bauen_ansichten.py`, `src/bauen_html.py` bauen die Karte.
3. Stand und Protokoll werden ins Repo committet, die Karte auf GitHub Pages veröffentlicht.

Der erste Lauf vergleicht mit dem Bürgermeister nach der letzten Wahl und datiert gefundene Wechsel über die Bearbeitungsgeschichte in Wikipedia (dauert länger).

## Einrichtung (einmalig)
- Settings → Pages → Build and deployment → Source: **GitHub Actions**.
- Actions → „Bürgermeister täglich abgleichen …“ → Run workflow.
- Settings → Billing → Spending limit für Actions auf 0 lassen.

## Neue Wahl einarbeiten (nicht automatisch)
Die Wahlergebnisse ändern sich nur bei Wahlen. Je Land gibt es ein Skript `src/land_<land>.py` mit Quelle im Kopf; die Rohdaten liegen in `roh/`. Ablauf: Rohdaten ablegen, Skript anpassen, dann `src/zusammen.py`, `src/wiki_bgm.py`, `src/vorwahl.py` und die drei `bauen_*`-Skripte. Danach `daten/bgm_stand.json` und `daten/bgm_wechsel.json` für das betroffene Land bereinigen, weil die Wahl die neue Basis ist.

## Quellen
Je Land im Kopf der Skripte `src/land_*.py` und im Abschnitt „Datenlage, Quellen und Abgrenzung“ der Karte. Kartengeometrie Statistik Austria (CC BY 4.0), vereinfacht durch Flooh Perlot (CC BY 4.0); Einwohner Statistik Austria.
