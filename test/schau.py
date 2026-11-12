import os; B = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
import sys, asyncio
from playwright.async_api import async_playwright
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path="/usr/bin/google-chrome", args=["--no-sandbox"])
        ctx = await b.new_context(viewport={"width": 1500, "height": 1100}, offline=True)
        pg = await ctx.new_page(); fehler = []
        pg.on("console", lambda m: fehler.append(m.text) if m.type in ("error", "warning") else None)
        pg.on("pageerror", lambda e: fehler.append(str(e)))
        await pg.goto("file://" + B + "/aus/Gemeinderatswahlen_Oesterreich.html"); await pg.wait_for_timeout(800)
        await pg.screenshot(path=B + "/test/1_bgm.png", full_page=False)
        await pg.select_option("#ansicht", "st"); await pg.wait_for_timeout(500); await pg.screenshot(path=B + "/test/2_st.png")
        await pg.select_option("#ansicht", "a"); await pg.select_option("#partei", "2"); await pg.wait_for_timeout(500); await pg.screenshot(path=B + "/test/3_fpoe.png")
        await pg.fill("#suche", "Vösendorf (Niederösterreich)"); await pg.dispatch_event("#suche", "change"); await pg.wait_for_timeout(900)
        await pg.screenshot(path=B + "/test/4_voes.png")
        await pg.select_option("#ausschnitt", "7"); await pg.select_option("#ansicht", "bet"); await pg.wait_for_timeout(900); await pg.screenshot(path=B + "/test/5_tirol.png")
        await pg.click("#modus button[data-m=tabelle]"); await pg.wait_for_timeout(300); await pg.screenshot(path=B + "/test/6_tab.png")
        await pg.click("#thema"); await pg.click("#modus button[data-m=karte]"); await pg.select_option("#ausschnitt", "AT"); await pg.select_option("#ansicht", "bgm"); await pg.wait_for_timeout(800)
        await pg.screenshot(path=B + "/test/7_dunkel.png")
        await pg.screenshot(path=B + "/test/8_ganz.png", full_page=True)
        await pg.click("#thema"); await pg.select_option("#ansicht", "d"); await pg.select_option("#partei", "0"); await pg.wait_for_timeout(700); await pg.screenshot(path=B + "/test/9_dvp.png")
        await pg.select_option("#ansicht", "ws"); await pg.wait_for_timeout(700); await pg.screenshot(path=B + "/test/10_ws.png")
        await pg.fill("#suche", "Klagenfurt am Wörthersee (Kärnten)"); await pg.dispatch_event("#suche", "change"); await pg.wait_for_timeout(900); await pg.screenshot(path=B + "/test/11_klu.png", full_page=True)
        await pg.select_option("#ansicht", "dbet"); await pg.fill("#suche", "Graz (Steiermark)"); await pg.dispatch_event("#suche", "change"); await pg.wait_for_timeout(900); await pg.screenshot(path=B + "/test/12_graz.png", full_page=True)
        await pg.click("#thema"); await pg.wait_for_timeout(500); await pg.screenshot(path=B + "/test/13_dbet_dunkel.png")
        print("Fehler:", fehler)
        await b.close()
asyncio.run(main())
