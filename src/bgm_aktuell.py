"""Tagesaktueller Stand der Bürgermeister und Protokoll der Wechsel.

Quellen je Lauf:
- Oberösterreich: amtliche Gemeindeliste des Landes (land-oberoesterreich.gv.at/gemeinden/ooeGem.txt), täglich aktualisiert.
- Alle übrigen Gemeinden: Infobox des deutschsprachigen Wikipedia-Artikels (Felder Bürgermeister, Partei, Wahljahr).
  Zuordnung Gemeindekennziffer zu Artikel über Wikidata (Eigenschaft P964).
Vergleichsbasis:
- Erster Lauf: Bürgermeister nach der letzten Wahl (daten/alle.json). Gefundene Wechsel werden über die Bearbeitungsgeschichte
  des Artikels datiert (erste Revision mit dem neuen Namen), sonst ohne Datum.
- Folgende Läufe: Stand des Vortags (daten/bgm_stand.json). Ein neuer Wechsel bekommt das Datum des Laufs.
Wikipedia gilt als veraltet, wenn das Wahljahr der Infobox vor der letzten Gemeinderatswahl liegt; dann kein Wechsel.
Schreibt daten/bgm_stand.json (aktueller Stand) und daten/bgm_wechsel.json (Protokoll, wird nur ergänzt).
Aufruf: python src/bgm_aktuell.py [--offline <ordner mit ooeGem.txt, wiki.json, titel.json>]
"""
import os; B = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
import json, re, sys, time, datetime, difflib, urllib.request, urllib.parse, urllib.error
sys.path.insert(0, B + "/src"); from gemeinsam import gruppe

UA = {"User-Agent": "gemeinderatswahlen-karte/1.1 (https://github.com/silvioroccella/gemeinderatswahlen) Python-urllib"}
PAUSE = 1.5      # Sekunden zwischen Wikipedia-Abfragen (Wikimedia-Richtlinie: seriell, gedrosselt)
HEUTE = datetime.date.today().isoformat()
OOE_URL = "https://www.land-oberoesterreich.gv.at/gemeinden/ooeGem.txt"
WD_URL = "https://query.wikidata.org/sparql"
WP_API = "https://de.wikipedia.org/w/api.php"

def hole(url, params=None, versuche=6):
    """Abruf mit Rücksicht auf Drosselung: bei 429/503 Wartezeit aus Retry-After, sonst steigend."""
    if params: url += "?" + urllib.parse.urlencode(params)
    for v in range(versuche):
        try:
            with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=90) as r:
                return r.read()
        except urllib.error.HTTPError as e:
            if v == versuche - 1 or e.code not in (429, 500, 502, 503, 504): raise
            warte = int(e.headers.get("Retry-After") or 0) or 30 * (v + 1)
            print(f"  HTTP {e.code}, warte {warte} s"); time.sleep(min(warte, 300))
        except Exception:
            if v == versuche - 1: raise
            time.sleep(15 * (v + 1))

# ---------- Namen vergleichen ----------
TITEL = re.compile(r"\b(mag|dr|ing|di|dipl|mba|msc|bsc|bed|ma|ba|med|iur|rer|nat|phil|fh|mmag|prof|ök|oec|hlfl|kr|dkfm|ll\.?m|mas|bakk|labg|nabg|abg|bgm|vbgm|ökr|rr|or|ir|hr)\b\.?", re.I)
def tokens(n):
    n = re.sub(r"\(.*?\)", " ", n or "")
    n = re.sub(r"([a-zäöüß])([A-ZÄÖÜ])", r"\1 \2", n)          # zusammengeschrieben: "KlepitsGerhard"
    n = TITEL.sub(" ", n.lower())
    n = re.sub(r"[^a-zäöüß\- ]", " ", n)
    return {t for t in re.split(r"[\s\-]+", n) if len(t) > 1}
def gleich(a, b):
    ta, tb = tokens(a), tokens(b)
    if not ta or not tb: return True                     # ohne Namen kein Wechsel feststellbar
    if len(ta & tb) >= 2 or (ta & tb and min(len(ta), len(tb)) == 1): return True
    aehnlich = lambda x, y: difflib.SequenceMatcher(None, x, y).ratio() >= 0.8
    klein, gross = (ta, tb) if len(ta) <= len(tb) else (tb, ta)
    if all(any(aehnlich(x, y) for y in gross) for x in klein): return True     # Schreibvarianten (Ullram, Ulram)
    return False

# ---------- Quellen ----------
def ooe(text=None):
    if text is None:
        roh = hole(OOE_URL)
        try: text = roh.decode("utf-8")
        except UnicodeDecodeError: text = roh.decode("cp1252")
    z = [l for l in text.splitlines() if l.strip()]
    kopf = [x.strip('"') for x in z[0].split('";"')]
    aus = {}
    for l in z[1:]:
        f = dict(zip(kopf, [x.strip().strip('"').strip() for x in l.split('";"')]))
        name = " ".join(x for x in (f.get("bgmVorname"), f.get("bgmNachname")) if x)
        if not name: continue
        aus[f["GemKZ"]] = {"name": name, "partei": f.get("bgmKurzPartei") or f.get("bgmPartei") or "",
                           "liste": f.get("bgmPartei") or "", "quelle": "Land Oberösterreich, amtliche Gemeindeliste (ooeGem.txt), Stand " + de_d(HEUTE)}
    return aus

def titel_aus_wikidata():
    q = 'SELECT ?gkz ?art WHERE { ?g wdt:P964 ?gkz . ?art schema:about ?g ; schema:isPartOf <https://de.wikipedia.org/> . }'
    j = json.loads(hole(WD_URL, {"query": q, "format": "json"}))
    return {b["gkz"]["value"]: urllib.parse.unquote(b["art"]["value"].rsplit("/", 1)[1]).replace("_", " ") for b in j["results"]["bindings"]}

FELD = lambda name: re.compile(r"^\|[ \t]*" + name + r"[ \t]*=[ \t]*(.*)$", re.M)   # nur innerhalb der Zeile
def infobox(text):
    def f(n):
        m = FELD(n).search(text or "");
        if not m: return ""
        v = re.sub(r"<ref.*?(</ref>|/>)|<!--.*?-->|<[^>]+>", "", m.group(1))
        v = re.sub(r"\[\[(?:[^\]|]*\|)?([^\]]*)\]\]", r"\1", v)
        return re.sub(r"\{\{.*?\}\}|''+", "", v).strip()
    j = re.search(r"\d{4}", f("Wahljahr"))
    return {"name": f("Bürgermeister"), "partei": f("Partei"), "wahljahr": int(j.group()) if j else None}

def _abfrage(titel_liste, prop):
    p = {"action": "query", "format": "json", "formatversion": 2, "redirects": 1, "maxlag": 5, "titles": "|".join(titel_liste)}
    p.update(prop)
    j = json.loads(hole(WP_API, p))
    if "error" in j:                                         # maxlag: Server überlastet, später erneut
        time.sleep(30); j = json.loads(hole(WP_API, p))
    umleit = {r["from"]: r["to"] for r in j["query"].get("redirects", [])}
    normal = {r["from"]: r["to"] for r in j["query"].get("normalized", [])}
    seiten = {p["title"]: p for p in j["query"]["pages"]}
    return {t: seiten.get(umleit.get(normal.get(t, t), normal.get(t, t))) for t in titel_liste}

def wikipedia(titel, cache):
    """Infobox je Artikel. Zuerst nur die Revisionsnummern (50 Artikel je Abfrage, ohne Inhalt);
    den Inhalt (Abschnitt 0) nur für Artikel, deren Revision sich seit dem letzten Lauf geändert hat.
    Artikel, die nicht abgerufen werden konnten, fehlen im Ergebnis (der Lauf übernimmt dann den Vortag)."""
    aus, liste = {}, sorted(set(titel.values()))
    neu_laden = []
    for i in range(0, len(liste), 50):
        try:
            for t, p in _abfrage(liste[i:i + 50], {"prop": "info"}).items():
                if not p or "lastrevid" not in p: continue
                c = cache.get(t)
                if c and c.get("revid") == p["lastrevid"]: aus[t] = c
                else: neu_laden.append(t)
        except Exception as ex: print("  Revisionsabfrage fehlgeschlagen:", ex)
        time.sleep(PAUSE)
    print(f"  Wikipedia: {len(aus)} unverändert, {len(neu_laden)} neu zu lesen")
    for i in range(0, len(neu_laden), 20):
        try:
            for t, p in _abfrage(neu_laden[i:i + 20], {"prop": "revisions", "rvprop": "content|timestamp|ids", "rvslots": "main", "rvsection": 0}).items():
                if not p or "revisions" not in p: continue
                r = p["revisions"][0]
                aus[t] = dict(infobox(r["slots"]["main"].get("content", "")), titel=p["title"], rev=r["timestamp"][:10], revid=r["revid"])
        except Exception as ex: print("  Inhaltsabfrage fehlgeschlagen:", ex)
        time.sleep(PAUSE)
    return aus

def datiere(titel, neu, ab):
    """Erste Revision ab dem Datum ab, deren Infobox den neuen Bürgermeister nennt (Bearbeitungsdatum, nicht Amtsantritt)."""
    erste, weiter = None, {}
    for _ in range(20):
        p = {"action": "query", "format": "json", "formatversion": 2, "prop": "revisions", "titles": titel, "rvprop": "content|timestamp",
             "rvslots": "main", "rvsection": 0, "rvlimit": 20, "rvdir": "older", "maxlag": 5, "rvend": ab + "T00:00:00Z", **weiter}
        j = json.loads(hole(WP_API, p)); seiten = j["query"]["pages"]
        revs = seiten[0].get("revisions", []) if seiten else []
        for r in revs:                                       # neueste zuerst
            if gleich(infobox(r["slots"]["main"].get("content", "")).get("name"), neu): erste = r["timestamp"][:10]
            else: return erste
        if "continue" not in j: return erste
        weiter = j["continue"]; time.sleep(PAUSE)
    return erste

def de_d(d): return ".".join(reversed(d.split("-"))) if d else d
def iso(d):  # TT.MM.JJJJ -> JJJJ-MM-TT
    return f"{d[6:10]}-{d[3:5]}-{d[0:2]}" if d and len(d) == 10 and d[2] == "." else None

# ---------- Lauf ----------
def lauf(offline=None):
    alle = json.load(open(B + "/daten/alle.json", encoding="utf-8"))
    stand_p, prot_p = B + "/daten/bgm_stand.json", B + "/daten/bgm_wechsel.json"
    vorher = json.load(open(stand_p, encoding="utf-8")) if os.path.exists(stand_p) else None
    prot = json.load(open(prot_p, encoding="utf-8")) if os.path.exists(prot_p) else []
    if offline:
        o = ooe(open(offline + "/ooeGem.txt", encoding="utf-8").read())
        titel = json.load(open(offline + "/titel.json", encoding="utf-8")); wp = json.load(open(offline + "/wiki.json", encoding="utf-8"))
    else:
        cache_p = B + "/daten/wiki_cache_v2.json"
        cache = json.load(open(cache_p, encoding="utf-8")) if os.path.exists(cache_p) else {}
        o = ooe(); titel = titel_aus_wikidata(); wp = wikipedia({g: t for g, t in titel.items() if g in alle}, cache)
        json.dump(wp, open(cache_p, "w", encoding="utf-8"), ensure_ascii=False, indent=0)
    print(f"Quellen: OÖ {len(o)} Gemeinden, Wikipedia {len(wp)} Artikel")
    soll = len({titel[g] for g in alle if g in titel})
    if vorher is None and not offline and len(wp) < 0.9 * soll:
        sys.exit(f"Erster Lauf abgebrochen: nur {len(wp)} von {soll} Wikipedia-Artikeln gelesen; Zwischenstand im Cache, bitte erneut starten.")

    stand, neu_w = {}, []
    datierungen = 0
    for g, r in alle.items():
        wahl = r.get("bgm") or {}
        w = wp.get(titel.get(g, ""), {})
        wahljahr = int(r["datum"][-4:]) if r.get("datum") else None
        if g in o:
            akt = dict(o[g], wiki=None)
        elif w.get("name") and not (w.get("wahljahr") and wahljahr and w["wahljahr"] < wahljahr):
            akt = {"name": w["name"], "partei": w.get("partei", ""), "liste": "", "wiki": w["titel"],
                   "quelle": f"Wikipedia, Artikel {w['titel']} (Revision vom {de_d(w['rev'])})"}
        elif vorher and g in vorher and titel.get(g) and titel[g] not in wp:
            akt = dict(vorher[g])                            # Artikel heute nicht abrufbar: Stand des Vortags
        else:
            akt = {"name": wahl.get("name", ""), "partei": wahl.get("partei", ""), "liste": "", "wiki": None, "quelle": "wie nach der Wahl"}
        akt["gruppe"] = gruppe(akt["partei"] or akt.get("liste", "")) if (akt["partei"] or akt.get("liste")) else None
        stand[g] = akt
        basis = (vorher or {}).get(g) or ({"name": wahl.get("name", ""), "partei": wahl.get("partei", ""), "gruppe": wahl.get("gruppe")} if vorher is None else None)
        if not basis or not basis.get("name") or not akt["name"] or gleich(basis["name"], akt["name"]): continue
        e = {"gkz": g, "gemeinde": r["name"], "land": r["land"], "alt": {k: basis.get(k) for k in ("name", "partei", "gruppe")},
             "neu": {k: akt.get(k) for k in ("name", "partei", "gruppe")}, "quelle": akt["quelle"], "erfasst": HEUTE}
        if vorher is not None:
            e.update(datum=HEUTE, datum_art="im täglichen Abgleich erkannt")
        else:
            d = None
            t = w.get("titel") if w else None
            if t and not offline and datierungen < 400:
                datierungen += 1
                try: d = datiere(t, akt["name"], iso(r.get("datum")) or "2021-01-01")
                except Exception as ex: print("  Datierung fehlgeschlagen", g, ex)
            if d: e.update(datum=d, datum_art="Bearbeitung in Wikipedia (erste Nennung des neuen Namens)")
            else: e.update(datum=None, datum_art="seit der Wahl am " + (r.get("datum") or "?") + ", Datum unbekannt")
        neu_w.append(e)
    prot.extend(neu_w)
    json.dump(stand, open(stand_p, "w", encoding="utf-8"), ensure_ascii=False, indent=0)
    json.dump(prot, open(prot_p, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    json.dump({"datum": HEUTE, "ooe": len(o), "wikipedia": len(wp), "neu": len(neu_w)}, open(B + "/daten/bgm_lauf.json", "w"), ensure_ascii=False)
    print(f"{len(neu_w)} neue Wechsel ({'erster Lauf gegen die Wahl' if vorher is None else 'gegen den Vortag'}), Protokoll {len(prot)} Einträge")
    for e in neu_w[:40]: print(" ", e["gkz"], e["gemeinde"], ":", e["alt"]["name"], "->", e["neu"]["name"], e["neu"]["partei"], e["datum"])
    return neu_w

if __name__ == "__main__":
    lauf(sys.argv[sys.argv.index("--offline") + 1] if "--offline" in sys.argv else None)
