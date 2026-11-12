import os; B = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
"""Gemeinsame Hilfen: Parteigruppen, Namensabgleich mit der Kartengeometrie."""
import json, re, unicodedata
KARTE = B + "/referenz/gemeinden_karte.json"
GRUPPEN = ["ÖVP", "SPÖ", "FPÖ", "GRÜNE", "NEOS", "KPÖ", "Liste"]

def gruppe(text):
    """Ordnet einen Listennamen einer Parteigruppe zu (Schlüsselwörter, sonst 'Liste')."""
    t = " " + (text or "") + " "
    tu = t.upper()
    if re.search(r"\b(ÖVP|OEVP|OVP|VOLKSPARTEI|VP-|-VP\b|ÖVP-NAHE|OÖVP|BAUERNBUND)", tu) or re.search(r"[ (/-]VP[ )/-]", tu): return "ÖVP"
    if re.search(r"\b(SPÖ|SPOE|SOZIALDEMOKRAT|SP-|SPÖ-NAHE)", tu) or re.search(r"[ (/-]SP[ )/-]", tu): return "SPÖ"
    if re.search(r"\b(FPÖ|FPOE|FREIHEITLICH)", tu) or re.search(r"[ (/-]FP[ )/-]", tu): return "FPÖ"
    if re.search(r"GRÜNE|GRUENE|GRÜNEN|GRÜN\b|DIE GRÜNE", tu): return "GRÜNE"
    if re.search(r"\bNEOS\b", tu): return "NEOS"
    if re.search(r"\bKPÖ\b|KOMMUNIST", tu): return "KPÖ"
    return "Liste"

def norm(n):
    n = unicodedata.normalize("NFKC", n or "").lower()
    n = n.replace("st.", "sankt ").replace("sankt-", "sankt ").replace("–", "-").replace("-", " ")
    n = re.sub(r"\(.*?\)", " ", n)
    n = re.sub(r"[^a-zäöüß0-9 ]", " ", n)
    return re.sub(r"\s+", " ", n).strip()

def karte():
    return json.load(open(KARTE))

def namensindex(land_ziffer=None):
    k = karte(); idx = {}
    for g, n in k["namen"].items():
        if land_ziffer and not g.startswith(str(land_ziffer)): continue
        idx.setdefault(norm(n), []).append(g)
    return idx

def zahl(s):
    if s is None: return None
    if isinstance(s, (int, float)):
        return None if s != s else s
    s = str(s).strip().replace(".", "").replace(" ", "").replace(",", ".")
    if s in ("", "-", "nan"): return None
    try:
        f = float(s); return int(f) if f.is_integer() else f
    except ValueError:
        return None
