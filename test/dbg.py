import os; B = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
import asyncio
from playwright.async_api import async_playwright
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path="/usr/bin/google-chrome", args=["--no-sandbox"])
        pg = await b.new_page(viewport={"width": 1500, "height": 1100})
        await pg.goto("file://" + B + "/aus/Gemeinderatswahlen_Oesterreich.html"); await pg.wait_for_timeout(500)
        print(await pg.evaluate("Object.entries(landP).map(([k,p])=>{const b=p.getBBox();return k+':'+[b.x,b.y,b.width,b.height].map(Math.round)}).join(' | ')"))
        await pg.select_option("#ausschnitt", "7"); await pg.wait_for_timeout(900)
        print(await pg.evaluate("document.querySelector('svg.oe').getAttribute('viewBox')"))
        await pg.screenshot(path="test/9_tirol_frisch.png")
        await b.close()
asyncio.run(main())
