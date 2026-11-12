var $j = jQuery.noConflict();
(function ($j, e, b) {
  var c = "hashchange",
    h = document,
    f,
    g = $j.event.special,
    i = h.documentMode,
    d = "on" + c in e && (i === b || i > 7);
  function a(j) {
    j = j || location.href;
    return "#" + j.replace(/^[^#]*#?(.*)$/, "$1");
  }
  $j.fn[c] = function (j) {
    return j ? this.bind(c, j) : this.trigger(c);
  };
  $j.fn[c].delay = 50;
  g[c] = $j.extend(g[c], {
    setup: function () {
      if (d) {
        return false;
      }
      $j(f.start);
    },
    teardown: function () {
      if (d) {
        return false;
      }
      $j(f.stop);
    },
  });
  f = (function () {
    var j = {},
      p,
      m = a(),
      k = function (q) {
        return q;
      },
      l = k,
      o = k;
    j.start = function () {
      p || n();
    };
    j.stop = function () {
      p && clearTimeout(p);
      p = b;
    };
    function n() {
      var r = a(),
        q = o(m);
      if (r !== m) {
        l((m = r), q);
        $j(e).trigger(c);
      } else {
        if (q !== m) {
          location.href = location.href.replace(/#.*/, "") + q;
        }
      }
      p = setTimeout(n, $j.fn[c].delay);
    }
    !document.createElement("canvas").getContext &&
      !d &&
      (function () {
        var q, r;
        j.start = function () {
          if (!q) {
            r = $j.fn[c].src;
            r = r && r + a();
            q = $j('<iframe tabindex="-1" title="empty"/>')
              .hide()
              .one("load", function () {
                r || l(a());
                n();
              })
              .attr("src", r || "javascript:0")
              .insertAfter("body")[0].contentWindow;
            h.onpropertychange = function () {
              try {
                if (event.propertyName === "title") {
                  q.document.title = h.title;
                }
              } catch (s) {}
            };
          }
        };
        j.stop = k;
        o = function () {
          return a(q.location.href);
        };
        l = function (v, s) {
          var u = q.document;
          if (v !== s) {
            u.title = h.title;
            q.location.hash = v;
          }
        };
      })();
    return j;
  })();
})($j, this);

var wahltypID,
  wahljahr,
  wahlgang,
  startRegionID = 5,
  startGemeindeRegionID = 100,
  balkengrafikSchwelle = 1.0,
  balkengrafikAnzMaxParteien = 10,
  erstesWahljahr = [1951, 1996, 1945, 1945, 1949, 1994, 2024], // BPW, EUW, NRW, LTW, GVW, BMW, VBF
  istBPW_Wdh,
  wv = {
    aktiv: false,
    stand: 5,
    inhalt: null,
    regionID: null,
    indexAkt: null,
    indexVgl: null,
    radio1: null,
    check1: null,
  },
  // Einstellungen für obere Navigation
  wahlnav = [
    [
      { typID: 0, jahr: 2022 },
      { typID: 0, jahr: 2016, wahlgang: 2 },
      { typID: 0, jahr: 2016, wahlgang: 1 },
      { typID: 0, jahr: 2010 },
    ],
    [
      { typID: 1, jahr: 2024 },
      { typID: 1, jahr: 2019 },
      { typID: 1, jahr: 2014 },
      { typID: 1, jahr: 2009 },
    ],
    [
      { typID: 2, jahr: 2024 },
      { typID: 2, jahr: 2019 },
      { typID: 2, jahr: 2017 },
      { typID: 2, jahr: 2013 },
      { typID: 2, jahr: 2008 },
    ],
    [
      { typID: 3, jahr: 2023 },
      { typID: 3, jahr: 2018 },
      { typID: 3, jahr: 2013 },
      { typID: 3, jahr: 2009 },
    ],
    [
      { typID: 4, jahr: 2024 },
      { typID: 5, jahr: 2024 },
      { typID: 4, jahr: 2019 },
      { typID: 5, jahr: 2019 },
      { typID: 4, jahr: 2014 },
      { typID: 5, jahr: 2014 },
      { typID: 4, jahr: 2009 },
      { typID: 5, jahr: 2009 },
    ],
    [{ typID: 6, jahr: 2024 }],
  ],
  subnav = {
    subnav: [
      [
        // Navigation der BPW
        { name: "Ergebnisse", inhalt: "erg" },
        { name: "Wahlstatus", inhalt: "status" },
        { name: "Ranglisten", inhalt: "rang" },
        { name: "Kartogramme", inhalt: "karte" },
        { name: "Präsidenten seit 1918", inhalt: "praes" },
        { name: "Download", inhalt: "dl" },
      ],
      [
        // Navigation der EUW
        //{"name": "Hochrechnung", "inhalt": "hr", "stand": [0,1,2]},
        { name: "Ergebnisse", inhalt: "erg" },
        { name: "Wahlstatus", inhalt: "status" },
        { name: "Ranglisten", inhalt: "rang" },
        { name: "Kartogramme", inhalt: "karte" },
        { name: "Vorzugsstimmen", inhalt: "vorzug" }, // 0=alle Bewerber, 1=nur Bewerber mit Stimmen
        { name: "Wählerströme", inhalt: "stroeme", jahr: [2019, 2024] },
        { name: "Wahlen seit " + erstesWahljahr[1], inhalt: "hist" },
        { name: "Download", inhalt: "dl" },
      ],
      [
        // Navigation der NRW
        { name: "Hochrechnung", inhalt: "hr", stand: [0, 1, 2] },
        { name: "Ergebnisse", inhalt: "erg" },
        { name: "Wahlstatus", inhalt: "status" },
        { name: "Ranglisten", inhalt: "rang" },
        { name: "Kartogramme", inhalt: "karte" },
        { name: "Vorzugsstimmen", inhalt: "vorzug" }, // 0=alle Bewerber, 1=nur Bewerber mit Stimmen
        { name: "Wählerströme", inhalt: "stroeme", jahr: [2019, 2024] },
        { name: "Wahlen seit " + erstesWahljahr[2], inhalt: "hist" },
        { name: "Download", inhalt: "dl" },
      ],
      [
        // Navigation der LTW
        { name: "Hochrechnung", inhalt: "hr", stand: [0, 1] },
        { name: "Ergebnisse", inhalt: "erg" },
        { name: "Wahlstatus", inhalt: "status" },
        { name: "Ranglisten", inhalt: "rang" },
        { name: "Kartogramme", inhalt: "karte" },
        { name: "Vorzugsstimmen", inhalt: "vorzug" }, // 0=alle Bewerber, 1=nur Bewerber mit Stimmen
        { name: "Wählerströme", inhalt: "stroeme", jahr: [2023] },
        { name: "Wahlen seit " + erstesWahljahr[3], inhalt: "hist" },
        { name: "Download", inhalt: "dl" },
      ],
      [
        // Navigation der GVW
        { name: "Ergebnisse", inhalt: "erg" },
        { name: "Wahlstatus", inhalt: "status" },
        { name: "Ranglisten", inhalt: "rang" },
        { name: "Kartogramme", inhalt: "karte" },
        { name: "Vorzugsstimmen", inhalt: "vorzug", jahr: [2024] },
        { name: "Wahlen seit " + erstesWahljahr[4], inhalt: "hist" },
        { name: "Download", inhalt: "dl" },
      ],
      [
        // Navigation der BMW
        { name: "Ergebnisse Land/Bezirke", inhalt: "erg" },
        {
          name: "Ergebnisse Gemeinden",
          inhalt: "erg." + startGemeindeRegionID + ".1",
        },
        { name: "Wahlstatus 1. Wahlgang", inhalt: "status" },
        {
          name: "Wahlstatus 2. Wahlgang",
          inhalt: "status." + startRegionID + ".1",
        },
        { name: "Ranglisten 1. Wahlgang", inhalt: "rang" },
        {
          name: "Ranglisten 2. Wahlgang",
          inhalt: "rang." + startRegionID + ".1",
        },
        { name: "Kartogramme", inhalt: "karte" },
        { name: "Nachwahlen", inhalt: "nwue", jahr: [2009, 2014, 2019,2024] },
        { name: "Wahlen seit " + erstesWahljahr[5], inhalt: "hist" },
        { name: "Download", inhalt: "dl" },
      ],
      [
        //Navigation der VBF
		//{ name: "Information", inhalt: "info" },
        { name: "Ergebnisse", inhalt: "erg" },
        { name: "Wahlstatus", inhalt: "status" },
        { name: "Ranglisten", inhalt: "rang" },
        { name: "Kartogramme", inhalt: "karte" },
        { name: "Download", inhalt: "dl" },
      ],
    ],
  };

// Cache ausschalten, damit immer die aktuellen Daten geladen werden
// Cache ausschalten, damit immer die aktuellen Daten geladen werden
$j.ajaxSetup({ cache: false });

// Wird ausgeführt, wenn HTML-Seite geladen ist
$j(function () {
  ladeParameterAusURL();
  ladeStandAktiverWahl();
  ladeNavigation();
  ladeSubnavigation();
  // ladeLinksKontakt();
  ladeSeite(location.hash);
  // Event-Handler zum Laden neuer Inhalte; so funktioniert auch der Zurück-Button und das Aktualisieren
  $j(window).hashchange(function () {
    ladeSeite(location.hash);
  });
});
// Liest WahltypID, Wahljahr und Wahlgang aus URL aus; checkt, ob aktive Wahl geöffnet ist
function ladeParameterAusURL() {
  var url = document.location.pathname;
  if (wahltypID === undefined)
    wahltypID = findeWahltypID(url.split("/").reverse()[1]);
  if (wahljahr === undefined) wahljahr = +url.split("index")[1].substr(0, 4);
  if (url.split("-").length > 1) wahlgang = +url.split("-")[1].substr(0, 1);
  var tempWahltypID = wahltypID;
  if (tempWahltypID === 5 && datenAktiveWahl.wahlgang === 1) tempWahltypID--;
  wv.aktiv =
    tempWahltypID === datenAktiveWahl.typID &&
    wahljahr === datenAktiveWahl.jahr &&
    (wahlgang === undefined || wahlgang === datenAktiveWahl.wahlgang);
  istBPW_Wdh = wahltypID === 0 && wahljahr === 2016 && wahlgang === 2;
}
// Lädt Stand der Wahl, falls aktive Wahl geöffnet, im synchronen Modus
// Prinzipiell ist synchron schlecht, also sollten das so wenig Daten wie möglich sein
function ladeStandAktiverWahl() {
  var tempWahltypID = wahltypID;
  if (tempWahltypID === 5 && datenAktiveWahl.wahlgang === 1) tempWahltypID--;
  wv.aktiv =
    tempWahltypID === datenAktiveWahl.typID &&
    wahljahr === datenAktiveWahl.jahr &&
    (wahlgang === undefined || wahlgang === datenAktiveWahl.wahlgang);
  if (wv.aktiv) {
    $j.ajaxSetup({ async: false });
    $j.getJSON("aktuelleWahl.js", function (s) {
      wv.stand = s.stand;
    });
    $j.ajaxSetup({ async: true });
  }
}

function ladeNavigation() {
  var j, m, html;
  $j("li", "#statWahlen_navbar").each(function (i) {
	if(i == (wahltypID === 5 ? 4 : (wahltypID === 6 ? 5 : wahltypID))){
    $j(this).addClass("");
    }
    html = '<div class="dropdown-menu" data-bs-popper="static">' + 
            '<ul class="dropdown-list" data-level="0">';
    html += '<li class="submenu-top-header p-0 list-style-none">' + 
            '<a class="prev-link" href="../' + wahltypen[wahlnav[i][0].typID].kurzbez + '/index.html" data-current-level="0" tabindex="0">zurück zur Startseite</a>' + 
            '<div class="menu-title">' + 
            '<a class="active" href="../' + wahltypen[wahlnav[i][0].typID].kurzbez + '/index.html">' + 
            (i === 4 ? "Gemeindewahlen" : (i === 5 ? "Volksbefragung" :  wahltypen[i].bez)) + '</a>' + 
            '</div></li>';

    for (j = 0, m = wahlnav[i].length; j < m; j++){
		html +=
        '<li class="dropdown-item lvl-1" data-state="closed">' + 
        '<a class="nav-link" ' +
        'tabindex="0" href="../' +
        wahltypen[wahlnav[i][j].typID].kurzbez +
        "/index" +
        wahlnav[i][j].jahr +
        (wahlnav[i][j].wahlgang === undefined
          ? ""
          : "-" + wahlnav[i][j].wahlgang) +
        '.html">' +
          wahltypen[wahlnav[i][j].typID].bez +
		 (i === 4 ? "en " : " ") +
        //" " +
        wahlnav[i][j].jahr +
        (wahlnav[i][j].wahlgang === undefined
          ? ""
          : "&emsp;(" + wahlnav[i][j].wahlgang + ". Wahlgang)") +
        "</a></li>";
	}
  html += '</ul></div>';
  $j(this).children("a").after(html);
  });
}


function ladeNavigationAlt() {
  var j, m, html;
  $j("li", "#zz2_RootAspMenu").each(function (i) {
	if(i == (wahltypID === 5 ? 4 : (wahltypID === 6 ? 5 : wahltypID))){
	//if (i == Math.min(4, wahltypID)) {
	 $j(this).addClass("selected");
      $j(this)
        .children("a")
        .addClass("selected ms-bold ms-core-listMenu-selected");
      $j(this).children("a").attr("accesskey", "1");
    }
    html = "";
    for (j = 0, m = wahlnav[i].length; j < m; j++){
		html +=
        '<li class="dynamic"><a class="dynamic menu-item ms-core-listMenu-item ms-displayInline ms-navedit-linkNode" ' +
        'tabindex="0" href="../' +
        wahltypen[wahlnav[i][j].typID].kurzbez +
        "/index" +
        wahlnav[i][j].jahr +
        (wahlnav[i][j].wahlgang === undefined
          ? ""
          : "-" + wahlnav[i][j].wahlgang) +
        '.html"><span class="additional-background ms-navedit-flyoutArrow">' +
        '<span class="menu-item-text">' +
        wahltypen[wahlnav[i][j].typID].bez +
        " " +
        wahlnav[i][j].jahr +
        (wahlnav[i][j].wahlgang === undefined
          ? ""
          : "<br>&emsp;&ensp;" + wahlnav[i][j].wahlgang + ". Wahlgang") +
        "</span></span></a></li>";
	}
      
    $j(this).children("ul").html(html);
  });
}
function ladeSubnavigation() {

//Füge Breadcrumbs hinzu
  $j("#statWahlen_breadcrumbs").html(
    '<ol class="breadcrumb mb-4 mt-3 mt-lg-0 mb-lg-5">' +
		//allgemein Wahlen
    '<li class="breadcrumb-item">' + 
    '<a class="breadcrumb-link" href="../index.html"><span class="breadcrumb-title">' + 
    'Wahlen</span></a></li>' + 
    //Wahltyp
    '<li class="breadcrumb-item">' + 
    '<a class="breadcrumb-link" href="../'+ wahltypen[wahltypID].kurzbez +'/index.html"><span class="breadcrumb-title">' + 
    wahltypen[wahltypID].bez +  ((wahltypID === 4 | wahltypID == 5) ? "en " : " ") +  '</span></a></li>' + 
    //explizite Wahl
    '<li class="breadcrumb-item">' + 
    '<a class="breadcrumb-link" '+
    'href="javascript:window.location.href=window.location.href.split('+
    "'#'" + 
    ')[0];"' + 
    '><span class="breadcrumb-title">' + 
    wahltypen[wahltypID].bez +  ((wahltypID === 4 | wahltypID == 5) ? "en " : " ") +
      " " +
      wahljahr +
      (wahlgang === undefined ? "" : "<br>" + wahlgang + ". Wahlgang") +
      '</span></a></li></ol>'
  );

  $j("#statWahlen_subnavigation").html(
    // '<div class="list-item bg-lightgray">' +
    //   '<h3 class="stat_h3"><a class="d-flex align-items-center p-3 px-4" tabindex="0" href="javascript:window.location.href=window.location.href.split(' +
    //   "'#'" +
    //   ')[0];">' +
    //   '<span>' +
    //   wahltypen[wahltypID].bez +
    //   " " +
    //   wahljahr +
    //   (wahlgang === undefined ? "" : "<br>" + wahlgang + ". Wahlgang") +
    //   "</span></a></h3></div>" +
      '<ul id="wahlnav" class="list-unstyled d-flex mt-4 mb-4 flex-wrap">' +
      erstelleSubnavListe() +
      "</ul></li>" +
      (wv.stand < 2 ? '<div id="aktualisieren"></div>' : "")
  );

  // Event-Handler für Navigation
  $j("#wahlnav a").click(function () {
    var inhalt = $j(this).attr("data-inhalt").split(".");
    loescheParameter();
    wv.inhalt = inhalt[0];
    wv.regionID = inhalt.length > 1 ? inhalt[1] : wv.regionID;
    wv.indexAkt = inhalt.length > 2 ? inhalt[2] : wv.indexAkt;
    ergaenzeParameter();
    veraendereHash();
  });
}

function ladeSubnavigationAlt() {
  $j("#zz4_RootAspMenu").html(
    '<li class="static selected">' +
      '<a class="static selected menu-item ms-core-listMenu-item ms-displayInline ms-bold ms-core-listMenu-selected ' +
      'ms-navedit-linkNode" tabindex="0" href="javascript:window.location.href=window.location.href.split(' +
      "'#'" +
      ')[0];">' +
      '<span class="additional-background ms-navedit-flyoutArrow">' +
      '<span class="menu-item-text">' +
      wahltypen[wahltypID].bez +
      " " +
      wahljahr +
      (wahlgang === undefined ? "" : "<br>" + wahlgang + ". Wahlgang") +
      "</span>" +
      '<span class="ms-hidden">Zurzeit ausgewählt</span>' +
      '</span></a><ul class="static" id="wahlnav">' +
      erstelleSubnavListe() +
      "</ul></li>" +
      (wv.stand < 2 ? '<div id="aktualisieren"></div>' : "")
  );

  // Event-Handler für Navigation
  $j("#wahlnav a").click(function () {
    var inhalt = $j(this).attr("data-inhalt").split(".");
    loescheParameter();
    wv.inhalt = inhalt[0];
    wv.regionID = inhalt.length > 1 ? inhalt[1] : wv.regionID;
    wv.indexAkt = inhalt.length > 2 ? inhalt[2] : wv.indexAkt;
    ergaenzeParameter();
    veraendereHash();
  });
}

function erstelleSubnavListe() {
  var i,
    l,
    html = "";
  var liste = subnav.subnav[wahltypID] || [];
  for (i = 0, l = liste.length; i < l; i++) {
    if (
      (liste[i].stand === undefined ||
        liste[i].stand.join().indexOf(wv.stand) >= 0) &&
      (liste[i].jahr === undefined ||
        liste[i].jahr.join().indexOf(wahljahr) >= 0)
    )
      html +=
        '<li class="my-2 d-flex" style="height:50px">' + 
        '<a class="btn btn-primary" ' +
        'href="javascript:void(0)" data-inhalt="' +
        liste[i].inhalt +
        '">' +
        '<span>' +
        liste[i].name +
        "</span></a></li>";
  }
  return html;
}

function erstelleSubnavListeAlt() {
  var i,
    l,
    html = "";
  var liste = subnav.subnav[wahltypID] || [];
  for (i = 0, l = liste.length; i < l; i++) {
    if (
      (liste[i].stand === undefined ||
        liste[i].stand.join().indexOf(wv.stand) >= 0) &&
      (liste[i].jahr === undefined ||
        liste[i].jahr.join().indexOf(wahljahr) >= 0)
    )
      html +=
        '<li class="static"><a class="static menu-item ms-core-listMenu-item ms-displayInline' +
        'ms-navedit-linkNode" tabindex="0" href="javascript:void(0)" data-inhalt="' +
        liste[i].inhalt +
        '">' +
        '<span class="additional-background ms-navedit-flyoutArrow"><span class="menu-item-text">' +
        liste[i].name +
        "</span></span></a></li>";
  }
  return html;
}




function ladeLinksKontaktAlt() {
  var i,
    t1 = ["LeftContent", "Main"],
    t2 = ["", "xssm"];
  for (i = 0; i < 2; i++) {
    $j("aside", "#spcms-" + ["menuleft", "area-content"][i]).html(
      '<section id="ctl00_PlaceHolder' +
        t1[i] +
        "_divLinksContainer" +
        t2[i] +
        '" class="col-xs-12">' +
        "<h3>Links</h3>" +
        '<div id="ctl00_PlaceHolder' +
        t1[i] +
        "_slfLinks" +
        t2[i] +
        '__ControlWrapper_SummaryLinkFieldControl" style="display:inline">' +
        '<div id="slwp_ctl00_PlaceHolder' +
        t1[i] +
        "_slfLinks" +
        t2[i] +
        "_slfLinks" +
        t2[i] +
        '" class="slm-layout-main slwpmarker" xmlns:pcm="urn:PageContentManager">' +
        '<div class="dfwp-column" style="width:100%"><div class="slm-layout-main groupmarker"><ul class="dfwp-list">' +
        '<li><div class="item"><div class="link-item">' +
        '<a href="http://www.salzburg.gv.at/themen/statistik" title="">Landesstatistik</a><div class="description"></div></div></div></li></ul>' +
        '<div class="footermarker"></div></div></div></div></div></section>' +
        '<section id="ctl00_PlaceHolder' +
        t1[i] +
        "_divRueckfragen" +
        t2[i] +
        '" class="col-xs-12">' +
        "<h3>Kontakt</h3>" +
        '<div id="ctl00_PlaceHolder' +
        t1[i] +
        "_slfRueckfragen" +
        t2[i] +
        '__ControlWrapper_SummaryLinkFieldControl" style="display:inline">' +
        '<div id="slwp_ctl00_PlaceHolder' +
        t1[i] +
        "_slfRueckfragen" +
        t2[i] +
        "_slfRueckfragen" +
        t2[i] +
        '" class="slm-layout-main slwpmarker" xmlns:pcm="urn:PageContentManager">' +
        '<div class="dfwp-column" style="width:100%"><div class="slm-layout-main groupmarker"><ul class="dfwp-list">' +
        '<li><div class="item"><div class="link-item">' +
        '<a href="mailto:statistik@salzburg.gv.at" title="">Landesstatistik</a><div class="description"></div></div></div></li></ul>' +
        '<div class="footermarker"></div></div></div></div></div></section>'
    );
  }
}

function ladeAktualisierungsbutton() {
  var seconds = 9,
    interval,
    akt_text = "Ergebnis aktualisieren",
    akt_button = $j(
      '<button type="button" disabled="disabled" onclick="ladeSeite(location.hash);">' +
        akt_text +
        "</button>"
    );
  akt_button.text(akt_text + " (" + seconds + ")");
  interval = setInterval(function () {
    akt_button.text(akt_text + " (" + --seconds + ")");
    if (seconds === 0) {
      akt_button.removeAttr("disabled").text(akt_text);
      clearInterval(interval);
    }
  }, 1000);
  $j("#aktualisieren").html(akt_button);
}

/*** Hash-Steuerung - damit ein Verlauf angelegt wird und der Zurück-Button funktioniert ***/
// Hash initialisieren bzw. auf Voreinstellung zurücksetzen, für Navigationsaufrufen
function ergaenzeParameter() {
  if (wv.inhalt == null)
    wv.inhalt =
      wahltypID >= 4 && wahltypID < 6
        ? "karte"
        : wahltypID > 0 &&
          wv.aktiv &&
          subnav.subnav[wahltypID][0].stand != undefined &&
          subnav.subnav[wahltypID][0].stand.join().indexOf(wv.stand) >= 0
        ? "hr"
        : "erg";
  if (wv.regionID == null) wv.regionID = startRegionID;
  if (wv.indexAkt == null)
    wv.indexAkt =
      wv.inhalt === "karte"
        ? wahltypID === 5
          ? "a0"
          : "a1"
        : wahltypID === 5 && (wv.inhalt === "erg" || wv.inhalt === "nwerg")
        ? 1
        : 0;
  if (wv.indexVgl == null) wv.indexVgl = wv.inhalt === "karte" ? "a2" : 0;
  if (wv.radio1 == null) wv.radio1 = 0;
  if (wv.check1 == null)
    wv.check1 = wv.inhalt === "status" || wv.inhalt === "rang" ? 1 : 0;
  ladeStandAktiverWahl();
}
function loescheParameter() {
  $j.each(wv, function (k) {
    wv[k] = null;
  });
}

// Hash verändern, sodass Event-Handler greift und Seite mit neuem Inhalt geladen wird
function veraendereHash() {
  if (wv.inhalt === "erg" || wv.inhalt === "nwerg")
    location.hash =
      wv.inhalt +
      "." +
      wv.regionID +
      "." +
      wv.indexAkt +
      "." +
      wv.indexVgl +
      "." +
      wv.radio1;
  else if (wv.inhalt === "hr" || wv.inhalt === "hist")
    location.hash = wv.inhalt + "." + wv.regionID + "." + wv.radio1;
  else if (wv.inhalt === "status")
    location.hash =
      wv.inhalt + "." + wv.regionID + "." + wv.indexAkt + "." + wv.check1;
  else if (wv.inhalt === "rang")
    location.hash =
      wv.inhalt +
      "." +
      wv.regionID +
      "." +
      wv.indexAkt +
      "." +
      wv.radio1 +
      "." +
      wv.check1;
  else if (wv.inhalt === "karte")
    location.hash =
      wv.inhalt +
      "." +
      wv.regionID +
      "." +
      wv.indexAkt +
      "." +
      wv.indexVgl +
      "." +
      wv.radio1;
  else if (wv.inhalt === "vorzug")
    location.hash =
      wv.inhalt + "." + wv.regionID + "." + wv.radio1 + "." + wv.check1;
  else location.hash = wv.inhalt;
}

// Wird beim erstmaligen Aufruf und beim Klick in Navigation, Rangliste oder Karte aufgerufen
// Lädt ausgewählten Inhalt, klappt die Navigation aus/ein und markiert den aktiven Navigationspunkt
// Im Hash (dem Text in der URL nach dem #-Zeichen) ist der zu ladende Inhalt abgebildet. Dadurch merkt
// sich der Browser die besuchten Seiten und der Zurück-Button und das Aktualisieren erhalten ihre
// ursprüngliche Funktionalität zurück.
function ladeSeite(h) {
  if (wv.aktiv && wv.stand < 4) ladeAktualisierungsbutton();
  var start = [],
    hash = [],
    element;
  if (h.length > 0) {
    hash = h.replace(/#/g, "").split(".");
    wv.inhalt = hash[0];
    if (hash.length > 1) wv.regionID = +findeRegionID(hash[1]);
    if (wv.inhalt === "erg" || wv.inhalt === "nwerg") {
      wv.indexAkt = hash[2];
      wv.indexVgl = hash[3];
      wv.radio1 = hash[4];
    } else if (wv.inhalt === "hr" || wv.inhalt === "hist") {
      wv.radio1 = hash[2];
    } else if (wv.inhalt === "status") {
      wv.indexAkt = hash[2];
      wv.check1 = +hash[3];
    } else if (wv.inhalt === "rang") {
      wv.indexAkt = hash[2];
      wv.radio1 = hash[3];
      wv.check1 = +hash[4];
    } else if (wv.inhalt === "karte") {
      wv.indexAkt = hash[2];
      wv.indexVgl = hash[3];
      wv.radio1 = hash[4];
    } else if (wv.inhalt === "vorzug") {
      wv.radio1 = hash[2];
      wv.check1 = +hash[3];
    }
  }
  ergaenzeParameter();
  ladeInhalt();

  // gewählten Navigationspunkt hervorheben
  element = $j(
    '#wahlnav a[data-inhalt="' +
      wv.inhalt +
      "." +
      startRegionID +
      "." +
      wv.indexAkt +
      '"]:last'
  );
  if (!element.length)
    element = $j(
      '#wahlnav a[data-inhalt="' +
        wv.inhalt +
        "." +
        (wv.regionID !== undefined && regionen[wv.regionID].typID === 4
          ? startGemeindeRegionID + ".1"
          : startRegionID) +
        '"]:last'
    );
  if (!element.length)
    element = $j('#wahlnav a[data-inhalt="' + wv.inhalt + '"]:last');
  if (element.length > 0) {
    $j("a", "#wahlnav").removeClass(
      "selected ms-bold ms-core-listMenu-selected"
    );
    element.addClass("selected ms-bold ms-core-listMenu-selected");
    $j("li", "#wahlnav").removeClass("selected");
    element.parent().addClass("selected");
  }
}

function ladeInhalt() {
  ladeStandAktiverWahl();
  if (wv.inhalt === "hr") {
    if (wv.aktiv && wv.stand > 3) {
      ladeSubnavigation();
      $j("#aktualisieren").css({ display: "none" });
      wv.inhalt = "erg";
      veraendereHash();
      return;
    }
    $j.getJSON(
      wahltypen[wahltypID].kurzbez.toUpperCase() + wahljahr + "-HR.js",
      function (hr) {
        if (hr.text === undefined) {
          var liste = wv.radio1 == 2 ? hr.mandate : hr.stimmen;
          if (findeRegionsindex(liste, wv.regionID, false) == -1) {
            wv.regionID =
              liste[findeRegionsindex(liste, wv.regionID, true)].region_id;
          }
        }
        $j("#ueberschrift-wahl").html(
          erstelleUeberschrift(hr.wahl_akt.datum[0]) +
            (hr.text === undefined
              ? erstelleSubueberschrift1(wv.radio1 != 2, ermittleStand(hr))
              : "")
        );
        $j("#inhalt-wahl").html(erstelleHochrechnung(hr));
        events();
      }
    );
  } else if (wv.inhalt === "vorzug") {
    $j("body").css("cursor", "progress");
    if (wv.radio1 !== "b" && wv.radio1 !== "l" && wv.radio1 !== "r")
      wv.radio1 =
        wahltypID === 1
          ? "b"
          : wahltypID === 2
          ? "l"
          : wahltypID === 3 && wahljahr >= 2023
          ? "l"
          : "r";
    // wv.radio1 = wahltypID === 1 ? 'b' : wahltypID === 2 ? 'l' : 'r';

    $j.getJSON(
      wahltypen[wahltypID].kurzbez.toUpperCase() +
        wahljahr +
        "-VZ" +
        wv.radio1 +
        ".js",
      function (vz) {
        if (
          findeRegionsindex(vz.stimmen, wv.regionID, false) == -1 &&
          wahltypID === 4 &&
          wahljahr >= 2019
        )
          wv.regionID = 100;
        else if (findeRegionsindex(vz.stimmen, wv.regionID, false) == -1)
          wv.regionID = vz.stimmen[0].region_id;
        $j("#ueberschrift-wahl").html(
          erstelleUeberschrift(vz.datum[0]) +
            erstelleSubueberschrift1(
              0,
              wv.aktiv && wv.stand > 0 && wv.stand < 5
                ? "<br>Vorläufiges Ergebnis"
                : ""
            )
        );
        $j("#inhalt-wahl").html(erstelleVorzugsstimmen(vz));
        $j("body").css("cursor", "default");
        events();
      }
    );
  } else if (wv.inhalt === "stroeme") {
    $j.getJSON(
      wahltypen[wahltypID].kurzbez.toUpperCase() + wahljahr + "-stroeme.js",
      function (data) {
        $j("#ueberschrift-wahl").html(
          erstelleUeberschrift(data.datum) +
            "<h3>Wählerströme im Bundesland Salzburg</h3>"
        );
        erstelleWaehlerstroeme(data);
        events();

        //	  if (data.text !== undefined){
        //		$j('#inhalt-wahl').html('<p>' + data.text + '</p>');
        //	  }
        //	  else {
        //		erstelleWaehlerstroeme(data);
        //	  }
        //	  events();
      }
    );
  } else if (wv.inhalt === "hist") {
    if (wv.radio1 != 2 && wahltypID === 5) {
      wv.radio1 = 2;
      veraendereHash();
    } else {
      $j.getJSON(
        wahltypen[wahltypID].kurzbez.toUpperCase() + "-hist.js",
        function (hist) {
          var liste = wv.radio1 == 2 ? hist.mandate : hist.stimmen;
          if (findeRegionsindex(liste, wv.regionID, false) == -1)
            wv.regionID =
              liste[findeRegionsindex(liste, wv.regionID, true)].region_id;
          $j("#ueberschrift-wahl").html(
            "<h2>" +
              wahltypen[wahltypID].bez +
              "en seit " +
              erstesWahljahr[wahltypID] +
              "</h2>" +
              erstelleSubueberschrift1(wv.radio1 != 2, "")
          );
          $j("#inhalt-wahl").html(erstelleWahlhistorie(hist));
          events();
        }
      );
    }
  } else if (wv.inhalt === "praes") {
    $j("#ueberschrift-wahl").html("<h2>Bundespräsidenten seit 1918</h2>");
    $j("#inhalt-wahl").load("praesidenten.html #praesidenten-wahl");
    events();
  } else if (wv.inhalt === "dl") {
    $j("#ueberschrift-wahl").html(
      "<h2>Download zu den " + wahltypen[wahltypID].bez + "en</h2>"
    );
    $j("#inhalt-wahl").load("download.html #download-wahl", function () {
      // Links im neuen Fenster öffnen
      $j("#download-tabelle-wahl a").click(function () {
        window.open($j(this).attr("href"));
        return false;
      });
    });
    events();
  } else if (wv.inhalt === "nwue") {
    $j("#ueberschrift-wahl").html(
      "<h2>Nachwahlen zu den Bürgermeisterwahlen " + wahljahr + "</h2>"
    );
    $j("#inhalt-wahl").load(
      "nachwahlen" + wahljahr + ".html #bmw-nachwahl",
      function () {
        $j("tbody tr", "#bmw-nachwahlen").click(function () {
          wv.inhalt = "nwerg";
          wv.regionID = +$j(this).attr("value");
          wv.indexAkt = 1;
          veraendereHash();
        });
      }
    );
    events();
  } else if (wv.inhalt === "nwerg") {
    $j.getJSON(
      wahltypen[wahltypID].kurzbez.toUpperCase() + wahljahr + "-NW.js",
      function (nw) {
        var t,
          liste = wv.radio1 == 2 ? nw.mandate : nw.stimmen;
        (wv.regionID =
          findeRegionsindex(liste, wv.regionID, false) > -1
            ? wv.regionID
            : liste[0].region_id),
          (index_region = findeRegionsindex(liste, wv.regionID, false));
        if (
          wv.indexAkt == 1 &&
          liste[index_region].daten_akt[wv.indexAkt] === undefined
        )
          wv.indexAkt = 0;
        $j("#ueberschrift-wahl").html(
          "<h2>Nachwahlen zu den Bürgermeisterwahlen " +
            wahljahr +
            "</h2>" +
            erstelleSubueberschrift1(wv.radio1 != 2, "")
        );
        $j("#inhalt-wahl").html(erstelleErgebnisseite(nw));
        events();
      }
    );
  } else if (wv.inhalt) {
    $j.getJSON(
      wahltypen[wahltypID].kurzbez.toUpperCase() +
        wahljahr +
        (wahlgang !== undefined ? "-" + wahlgang : "") +
        ".js",
      function (wahl) {
        if (wv.inhalt === "erg") {
          if (
            wahltypID === 5 &&
            wv.radio1 != 2 &&
            regionen[wv.regionID].typID < 4
          )
            wv.radio1 = 2;
          var liste =
              wv.radio1 == 1
                ? wahl.wahlkarten
                : wv.radio1 == 2
                ? wahl.mandate
                : wahl.stimmen,
            index_region = findeRegionsindex(liste, wv.regionID, false);
          if (
            wv.indexAkt == 1 &&
            index_region > -1 &&
            liste[index_region].daten_akt[wv.indexAkt] === undefined
          )
            wv.indexAkt = 0; // 1., wenn kein 2. Wahlgang
          if (
            (wv.radio1 == 2 &&
              wahl.wahl_akt.id[wv.indexAkt] != wahl.wahl_vgl.id[wv.indexVgl]) ||
            (wahltypID === 2 &&
              index_region > -1 &&
              !liste[index_region].daten_vgl[wv.indexVgl].length)
          )
            wv.indexVgl = wahl.wahl_akt.vgl[wv.indexAkt][0]; // Vorwahl, wenn keine Vergleichswahl
          if (index_region == -1) {
            wv.regionID =
              liste[findeRegionsindex(liste, wv.regionID, true)].region_id;
            index_region = findeRegionsindex(liste, wv.regionID, false); // existierende Überregion, wenn keine Daten
          }
          $j("#ueberschrift-wahl").html(
            erstelleUeberschrift(wahl.wahl_akt.datum[0]) +
              erstelleSubueberschrift1(
                wv.radio1 != 1 && wv.radio1 != 2,
                ermittleStand(wahl)
              )
          );
          $j("#inhalt-wahl").html(erstelleErgebnisseite(wahl));
          events();
        }
        if (wv.inhalt === "rang") {
          $j("#ueberschrift-wahl").html(
            erstelleUeberschrift(wahl.wahl_akt.datum[0]) +
              erstelleSubueberschrift2()
          );
          $j("#inhalt-wahl").html(erstelleRangliste(wahl));
          $j(window).scrollTop(0);
          sortiereRangliste(
            $j("#rangliste-tabelle-wahl table th:eq(1)"),
            false
          );
          $j("#rangliste-tabelle-wahl table").fixeKopfzeile();
          events();
        }
        if (wv.inhalt === "status") {
          $j("#ueberschrift-wahl").html(
            erstelleUeberschrift(wahl.wahl_akt.datum[0]) +
              erstelleSubueberschrift1(0, "")
          );
          $j("#inhalt-wahl").html(erstelleWahlstatus(wahl));
          $j(window).scrollTop(0);
          if (wv.stand === 1) {
            sortiereRangliste($j("#status-tabelle-wahl table th:eq(5)"), false);
          } else {
            sortiereRangliste($j("#status-tabelle-wahl table th:eq(1)"), false);
          }
          $j("#status-tabelle-wahl table").fixeKopfzeile();
          events();
        }
        if (wv.inhalt === "karte") {
          $j("#ueberschrift-wahl").html(
            erstelleUeberschrift(wahl.wahl_akt.datum[0]) + "<h3>&nbsp;</h3>"
          );
          erstelleKarte(wahl);
          fuelleKarte(wahl);
          events();
        }
      }
    );
  } 
}

/*** Event-Handler ***/
function events() {
  // Auswahlmenü Radiobuttons
  $j("input[type=radio]").change(function () {
    wv.radio1 = $j(this).attr("value");
    if (
      wv.inhalt === "karte" &&
      (wv.indexAkt === "a0" ||
        (wv.radio1 == 2 && (wv.indexAkt === "b" || wv.indexAkt === "c")) ||
        (wv.radio1 != 0 && wv.indexAkt === "d"))
    )
      wv.indexAkt = "a1";
    veraendereHash();
  });
  // Auswahlmenü Region
  $j("select.menue_region").change(function () {
    var wert = $j("option:selected", this).attr("value").split(".");
    wv.regionID = wert[0];
    if (wert.length > 1) wv.indexAkt = wv.indexAkt ? wert[1] : wv.indexAkt;
    veraendereHash();
  });
  // Auswahlmenü Aktuelle Wahl
  $j("#menue_wahl_akt").change(function () {
    wv.indexAkt = $j("option:selected", this).attr("value");
    veraendereHash();
  });
  // Auswahlmenü Vergleichswahl
  $j("#menue_wahl_vgl").change(function () {
    wv.indexVgl = $j("option:selected", this).attr("value");
    veraendereHash();
  });
  // Animation für Wahlgrafik
  $j("span.balken").each(function () {
    if (
      wahltypID === 0 &&
      wv.indexVgl == 0 &&
      (wahlgang === undefined || wahlgang === 1)
    ) {
      $j("span.balken_ganz", this).animate(
        { width: $j("span.balken_ganz", this).attr("value") + "%" },
        1500
      );
      $j("span.balken-wert", this).animate(
        { left: $j("span.balken_ganz", this).attr("value") + "%" },
        1500
      );
    } else {
      $j("span.balken_akt", this).animate(
        { width: $j("span.balken_akt", this).attr("value") + "%" },
        1500
      );
      $j("span.balken_vgl", this).animate(
        { width: $j("span.balken_vgl", this).attr("value") + "%" },
        1500
      );
      $j("span.balken-wert", this).animate(
        { left: $j("span.balken_akt", this).attr("value") + "%" },
        1500
      );
    }
  });
  // Reststimmen
  $j("#reststimmenlink-wahl").click(function () {
    if ($j("#reststimmen-wahl").css("display") == "none") {
      $j("#reststimmen-wahl").css({ display: "block" });
      $j(this).html("Reststimmen ausblenden");
    } else {
      $j("#reststimmen-wahl").css({ display: "none" });
      $j(this).html("Reststimmen anzeigen");
    }
  });
  // Gemeindevorstand
  $j("#gemeindevorstandlink-wahl").click(function () {
    if ($j("#gemeindevorstand-wahl").css("display") == "none") {
      $j("#gemeindevorstand-wahl").css({ display: "block" });
      $j(this).html(
        (wv.regionID === 100
          ? "Stadtkollegium und Stadtsenat"
          : "Gemeindevorstand") + " ausblenden"
      );
    } else {
      $j("#gemeindevorstand-wahl").css({ display: "none" });
      $j(this).html(
        (wv.regionID === 100
          ? "Stadtkollegium und Stadtsenat"
          : "Gemeindevorstand") + " anzeigen"
      );
    }
  });
  // Rangliste
  $j("input[type=checkbox]", "#rangliste-wahl,#status-wahl").click(function () {
    wv.check1 = 1 - wv.check1;
    sortiereRangliste(
      $j("th.sortiert,th.resortiert", "tr.variableKopfzeile"),
      true
    );
  });
  $j("thead th", "#rangliste-tabelle-wahl,#status-tabelle-wahl").click(
    function () {
      if (!$j(this).hasClass("nosort")) sortiereRangliste($j(this), false);
    }
  );
  $j("tbody tr", "#rangliste-tabelle-wahl,#status-tabelle-wahl").click(
    function () {
      loescheParameter();
      wv.inhalt = "erg";
      wv.regionID = -$j("td:nth-child(2)", this).attr("value");
      ergaenzeParameter();
      veraendereHash();
    }
  );
  // Auswahlmenü Karten
  $j("select", "#karten-menue-wahl").change(function () {
    var auswahl = $j("option:selected", this).attr("value");
    if ($j(this).is($j("#karten-parteiauswahl2-wahl"))) wv.indexVgl = auswahl;
    else wv.indexAkt = auswahl;
    if (wv.indexAkt === wv.indexVgl)
      wv.indexVgl = wv.indexAkt === "a1" ? "a2" : "a1";
    veraendereHash();
  });
  // Vorzugsstimmen
  $j("#vz-wahl input[type=checkbox]").click(function () {
    wv.check1 = 1 - wv.check1;
    veraendereHash();
  });
}

/***** Erstellt Überschrift *****/
function erstelleUeberschrift(datum) {
  return (
    "<h2>" +
    (wahlgang === undefined
      ? wahltypen[wahltypID].bez +
        (wahltypID > 3 && wahltypID < 6 ? "en" : "") +
        " am " +
        datum +
        " " +
        wahljahr
      : (wahlgang === 1 ? "Ers" : "Zwei") +
        "ter Wahlgang der " +
        wahltypen[wahltypID].bez +
        (wahltypID > 3 ? "en" : "") +
        "<br>am " +
        datum +
        " " +
        wahljahr +
        "") +
    (wv.inhalt === "hr"
      ? (wahltypID !== 2
          ? '<br><br><span class="ue_hr">Hochrechnung inkl. Wahlkartenprognose</span><br>'
          : (wahltypID === 2) & (wv.stand < 2)
          ? '<br><br><span class="ue_hr">Hochrechnung inkl. Wahlkartenprognose</span><br>'
          : '<br><br><span class="ue_hr">Vorläufiges Ergebnis inkl. Wahlkartenprognose</span><br>') +
        regionstypen[regionen[wv.regionID].typID].bez +
        " " +
        regionen[wv.regionID].bez
      : "") +
    "</h2>"
  ); // + (wahljahr === 2024 ? '<text style="color:red">(Testdaten)</text>':'');
}
function erstelleSubueberschrift1(stimmen, stand) {
  return (
    "<h3>" +
    (wv.inhalt !== "hr"
      ? regionstypen[regionen[wv.regionID].typID].bez +
        " " +
        regionen[wv.regionID].bez +
        (wv.inhalt === "vorzug"
          ? ", Vorzugsstimmen" +
            (wahltypID === 2
              ? " der " +
                (wv.radio1 === "b"
                  ? "Bundes"
                  : wv.radio1 === "l"
                  ? "Landes"
                  : "Regional") +
                "parteiliste"
              : "")
          : stimmen
          ? ", Stimmen"
          : wv.radio1 == 2
          ? wahltypID === 5
            ? ", Bürgermeister:innen"
            : ", Mandate"
          : wv.radio1 == 1
          ? ", Wahlkartenstimmen"
          : "")
      : "") +
    stand +
    "</h3>"
  );
}
function erstelleSubueberschrift2() {
  return (
    "<h3>" +
    regionstypen[regionen[wv.regionID].typID].bez +
    " " +
    regionen[wv.regionID].bez +
    ", " +
    (wv.radio1 == 0
      ? "Anteile in Prozent"
      : "Anteilsdifferenzen " +
        (istBPW_Wdh
          ? wv.radio1 == 1
            ? "zum annullierten zweiten Wahlgang"
            : "zum ersten Wahlgang"
          : wahlgang !== undefined && wahlgang === 2
          ? "zum ersten Wahlgang"
          : wv.indexAkt == 0
          ? "zur Vorwahl"
          : "zum " + wv.indexAkt + ". Wahlgang") +
        " in Prozentpunkten") +
    "</h3>"
  );
}
function ermittleStand(wahl) {
  var ergebnis =
      wv.radio1 == 1
        ? wahl.wahlkarten
        : wv.radio1 == 2
        ? wahl.mandate
        : wahl.stimmen,
    index_region = findeRegionsindex(ergebnis, wv.regionID, false);

  var datum =
    ergebnis[index_region].korr !== undefined &&
    ergebnis[index_region].korr[wv.indexAkt] != "" &&
    parseDate(ergebnis[index_region].korr[wv.indexAkt]) >
      parseDate(ergebnis[index_region].ein[wv.indexAkt])
      ? ergebnis[index_region].korr[wv.indexAkt]
      : ergebnis[index_region].ein[wv.indexAkt];

  if (
    wahltypID >= 4 &&
    wahl.status !== 5 &&
    wahljahr >= 2024 &&
    datum.length > 0
  ) {
    return "<br>Stand: " + datum;
  }
  if (
    (wahltypID === 1 || wahltypID === 2) &&
    wahl.status !== 5 &&
    wahljahr >= 2024 &&
    datum.length > 0
  ) {
    return "<br>Stand: " + datum;
  }

  if (
    wahl.status == 5 ||
    datum === "" ||
    wv.indexAkt != wahl.wahl_akt.id.length - 1
  )
    return "";
  if (wv.inhalt === "hr") return "Stand: " + datum;
  return "<br>Stand: " + wahl.stand;
}

/***** Erstellt Ergebnisse *****/
function erstelleErgebnisseite(wahl) {
  if (wahltypID == 6) {
    var t = erstelleErgebnistabelleUndGrafik(wahl);
    return (
      "<div><font size='3pt'><b>Fragestellung:</b></font></div>" +
      "<div><center><i><font size='3pt'>" +
      wahl.fragestellung +
      "</font></i></center></div>" +
	  //"<br><br>" +
      (wahljahr === 2024 && wv.regionID === 5 ? "<br><p><b>Abstimmungsgebiet:</b> Bezirk Salzburg (Stadt), Bezirk Hallein, Bezirk Salzburg-Umgebung</p><br><br>" : "<br><br>") +
      '<div id="tabelle-top-wahl"><div id="tabelle-menue-wahl" class="menue-wahl">' +
      erstelleRegionsauswahl(
        wahl.stimmen,
        1,
        4
      ) +
      "<br>" +
      '</div><div id="tabelle-grafik-wahl" class="balkengrafik">' +
      t[1] +
      "</div></div>" +
      '<div id="tabelle-main-wahl"><br>' +
      t[0] +
      "</div>" +
      ""
    );
  } else {
    var t = erstelleErgebnistabelleUndGrafik(wahl),
      reststimmenAnzeigen =
        findeRegionsindex(wahl.mandate, wv.regionID, false) > -1 &&
        wahl.mandate[findeRegionsindex(wahl.mandate, wv.regionID, false)]
          .wz_akt !== undefined,
      vorstandAnzeigen =
        reststimmenAnzeigen &&
        wahl.mandate[findeRegionsindex(wahl.mandate, wv.regionID, false)]
          .vorstand_akt !== undefined;
    return (
      '<div id="tabelle-top-wahl"><div id="tabelle-menue-wahl" class="menue-wahl">' +
      (wahltypID < 5 ? erstelleAuswertungsauswahl(wahl) : "") +
      erstelleRegionsauswahl(
        wv.radio1 == 1
          ? wahl.wahlkarten
          : wv.radio1 == 2
          ? wahl.mandate
          : wahl.stimmen,
        1,
        4
      ) +
      "<br>" +
      erstelleAktuelleWahlauswahl(wahl) +
      erstelleVergleichswahlauswahl(wahl) +
      '</div><div id="tabelle-grafik-wahl" class="balkengrafik">' +
      t[1] +
      "</div></div>" +
      '<div id="tabelle-main-wahl"><br>' +
      t[0] +
      "</div>" +
      (wahltypID >= 4
        ? '<br><div id="gvw-bmw-link-wahl" class="beschreibung keinDruck"><a href="../' +
          wahltypen[9 - wahltypID].kurzbez +
          "/index" +
          wahljahr +
          ".html#erg." +
          wv.regionID +
          '.1">Zum Ergebnis der ' +
          wahltypen[9 - wahltypID].bez +
          "</a></div>" +
          (reststimmenAnzeigen
            ? '<br><div class="beschreibung"><span id="reststimmenlink-wahl">Reststimmen anzeigen</span>' +
              (vorstandAnzeigen
                ? '<br><span id="gemeindevorstandlink-wahl">' +
                  (wv.regionID === 100
                    ? "Stadtkollegium und Stadtsenat"
                    : "Gemeindevorstand") +
                  " anzeigen</span>"
                : "") +
              "</div>" +
              '<div id="reststimmen-wahl">' +
              erstelleReststimmentabelle(wahl) +
              "</div>" +
              (vorstandAnzeigen
                ? '<div id="gemeindevorstand-wahl">' +
                  erstelleVorstandstabelle(wahl) +
                  "</div>"
                : "")
            : "")
        : "")
    );
  }
}

/***** Erstellt Hochrechnung *****/
function erstelleHochrechnung(hr) {
  if (hr.text !== undefined)
    return '<div class="beschreibung">' + hr.text + "</div>";
  var t = erstelleErgebnistabelleUndGrafik(hr),
    indexAus = t[0].indexOf("Wahlbeteiligung");
  return (
    '<div id="tabelle-top-wahl"><div id="hr-menue-wahl" class="menue-wahl">' +
    erstelleAuswertungsauswahl(hr) +
    erstelleRegionsauswahl(wv.radio1 == 2 ? hr.mandate : hr.stimmen, 1, 4) +
    '</div><div id="tabelle-grafik-wahl" class="balkengrafik hr_balkengrafik">' +
    t[1] +
    "</div></div>" +
    '<div id="hr_auszaehlung"><br>' +
    (indexAus < 0
      ? ""
      : t[0].substr(indexAus, t[0].indexOf("</td>", indexAus) - indexAus)) +
    //t[0].substr(0,t[0].indexOf('<colgroup>'))+
    //t[0].substr(t[0].indexOf('<tfoot>'))+
    "</div>"
  );
}

// Erstellt Tabelle mit den Wahlergebnissen
function erstelleErgebnistabelleUndGrafik(wahl) {
  if (wahltypID === 6) {
    var html = '<table class="wertetabelle">',
      weite_part = 20,
      weite = 100 - weite_part,
      weite1 = runden(weite / 3, 1);
    html +=
      '<colgroup><col width="' +
      weite_part +
      '%" span="2">' +
      '<col width="' +
      weite1 / 2 +
      '%"><col width="1%"><col width="' +
      weite1 / 2 +
      '%">' +
      '<col width="' +
      weite1 / 2 +
      '%"><col width="1%"><col width="' +
      weite1 / 2 +
      '%">' +
      "</colgroup>";
    // Inhalte laden
    var proz_akt,
      diff,
      p_index,
      i,
      j,
      l,
      texte =
        wv.radio1 == 1
          ? ["abgegebene Stimmen", "davon ungültig", "davon gültig"]
          : [
              "Stimmberechtigte",
              "davon weiblich",
              "abgegebene Stimmen",
              "davon ungültig",
              "davon gültig",
            ],
      ergebnis = wahl.stimmen,
      index_region = findeRegionsindex(ergebnis, wv.regionID, false),
      parteien_akt =
        wahl.parteien[findeRegionsindex(wahl.parteien, wv.regionID, true)].akt[
          wv.indexAkt
        ],
      werte_akt = ergebnis[index_region].daten_akt[wv.indexAkt],
      pwerte_akt = ergebnis[index_region].pdaten_akt[wv.indexAkt],
      init = wv.radio1 == 1 ? 0 : wv.radio1 == 2 ? 1 : 2,
      zeile1 = 0,
      zeile2 = 0,
      index_sort = [],
      init_akt = werte_akt[init] == null ? init : 99;
    // Überschriften
    var wahlbez_akt =
      wahltypen[wahl.wahl_akt.id[wv.indexAkt]].bez +
      (
        " " +
        (ergebnis[index_region].nwjahr_akt !== undefined
          ? ergebnis[index_region].nwjahr_akt
          : wahljahr)
      ).toUpperCase();
    html +=
      "<thead><tr><th" +
      (wv.radio1 == 2 ? "" : ' rowspan="2"') +
      ' colspan="2"></th>' +
      '<th colspan="' +
      "6" +
      '" class="v-linie">' +
      wahlbez_akt +
      "</th>" +
      '<tr><td class="v-linie" colspan="3">absolut</td><td colspan="3">in %</td></tr>' +
      "" +
      "</thead><tbody>";
    // Parteiunabhängige Wahlergebnisse
    for (i = 0, l = texte.length; i < l; i++) {
      if (texte[i] === "davon weiblich" && wahljahr >= 2022) continue;
      if (
        i === 1 &&
        wv.radio1 != 1 &&
        wv.radio1 != 2 &&
        werte_akt[1] === 0 &&
        werte_akt[0] > 0
      )
        continue;
      proz_akt = null;
      if (wv.radio1 != 2) {
        p_index =
          wv.radio1 == 1 ? [null, 0, null][i] : [null, 0, 0, 2, null][i];
        if (p_index !== null) {
          proz_akt =
            werte_akt[i] == null
              ? ""
              : werte_akt[p_index] > 0
              ? (werte_akt[i] / werte_akt[p_index]) * 100
              : 0;
          proz_akt = proz_akt === "" ? "" : runden(proz_akt, 1);
        }
      }
      html +=
        "<tr" +
        (zeile1 % 2 === 1 ? ' class="hinterlegt"' : "") +
        '><th class="links' +
        (texte[i].substr(0, 5) === "davon" ? " tab-ebene1" : "") +
        '" colspan="2">' +
        texte[i] +
        "</th>" +
        '<td class="v-linie"></td><td>' +
        (i < init_akt ? formatiereZahl(werte_akt[i]) : "") +
        "</td><td></td>" +
        (wv.radio1 == 2
          ? ""
          : "<td></td><td>" +
            (i < init_akt ? formatiereZahl(proz_akt) : "") +
            "</td><td></td>") +
        "</tr>";
      zeile1++;
    }
    // Parteiergebnisse sowie Grafik
    var grafikwerte_akt = [],
      maxGrafikwert_akt,
      maxGrafikwert,
      grafik = "<table><colgroup><col><col width=100%></colgroup>",
      gibtAkt,
      gibtVgl,
      wechsler = 0,
      istSonstige = [],
      anzSonstigeAkt = 0,
      anzSonstigeVgl = 0,
      summiereSonstige,
      pwerte_akt_sonst = 0,
      pwerte_vgl_sonst = 0,
      parteifarbe,
      parteien_zug = [],
      zaehlerSonstige = 0;
    // Aufbereitung Grafikwerte
    for (i = 0; i < parteien_akt.length; i++) {
      grafikwerte_akt[i] =
        pwerte_akt[i] === undefined
          ? 0
          : wv.radio1 == 2
          ? pwerte_akt[i]
          : werte_akt[werte_akt.length - 1] > 0
          ? pwerte_akt[i] / werte_akt[werte_akt.length - 1]
          : 0;
    }
    maxGrafikwert_akt = Array.max(grafikwerte_akt);
    maxGrafikwert = Math.max(maxGrafikwert_akt / 0.8, 0);
    // Farbauswahl für Grafik
    parteien_zug =
      wahl.parteien[findeRegionsindex(wahl.parteien, wv.regionID, true)].akt[0];
    // Parteiergebnisse;
    for (j = 0; j < Math.max(parteien_akt.length); j++) {
      i = j;
      gibtAkt =
        i < pwerte_akt.length &&
        parteien_akt[i] != "" &&
        parteien_akt[i] !== undefined;
      if (wv.radio1 != 2) {
        proz_akt = gibtAkt
          ? werte_akt[werte_akt.length - 1] > 0
            ? (pwerte_akt[i] / werte_akt[werte_akt.length - 1]) * 100
            : 0
          : null;
        proz_akt =
          gibtAkt && pwerte_akt[i] != null ? runden(proz_akt, 1) : null;
      }
      html +=
        '<tr class="' +
        (zeile2 == 0 ? "h-linie" : "") +
        " " +
        ((zeile1 + zeile2) % 2 == 1 ? "hinterlegt" : "") +
        '">' +
        '<th class="links tab-ebene2"' +
        ' colspan="2"' +
        ">" +
        parteien_akt[i] +
        "</th>" +
        "" +
        '<td class="v-linie"></td><td>' +
        formatiereZahl(pwerte_akt[i]) +
        "</td><td></td>" +
        (wv.radio1 == 2
          ? ""
          : "<td></td><td>" + formatiereZahl(proz_akt) + "</td><td></td>") +
        "</tr>";
      // für Grafik
      if (i < parteien_akt.length && gibtAkt) {
        if (
          parteien_zug.length > 0 &&
          findeParteiindex(parteien_zug[i]) - findeParteiindex("Sonstige") < 0
        ) {
          parteifarbe = ermittleParteifarbe(
            parteien[findeParteiindex(parteien_zug[i])]
          );
        } else if (wahltypID === 0) {
          parteifarbe = ermittleParteifarbe(
            parteien[findeParteiindex(parteien_akt[i])]
          );
        } else {
          parteifarbe = reduziereDeckkraft(
            ermittleParteifarbe(parteien[findeParteiindex(parteien_zug[i])]),
            [0.6, 1][wechsler]
          );
          wechsler = 1 - wechsler;
          if (istSonstige[i]) zaehlerSonstige++;
        }
        parteifarbe =
          "background:#" + parteifarbe + "; border-color:#" + parteifarbe + ";";
        grafik +=
          '<tr><td class="balken-partei" style="' +
          parteifarbe +
          '">' +
          kuerzeKandidatenname(
            parteien_akt[i],
            wahl.wahl_akt.id[0] == 0 ? 3 : 0
          ) +
          '</td><td><span class="balken">' +
          '<span class="balken_' +
          "akt" +
          '" style="' +
          parteifarbe +
          '" value="' +
          Math.round((grafikwerte_akt[i] / maxGrafikwert) * 1000) / 10 +
          '">&nbsp;</span>' +
          '<span class="balken-wert">' +
          '<span class="balken_' +
          "akt" +
          '-wert">' +
          formatiereZahl(wv.radio1 == 2 ? pwerte_akt[i] : proz_akt) +
          (wv.radio1 == 2 ? "" : pwerte_akt[i] !== null ? "&nbsp;%" : "") +
          "</span>" +
          //Ergänzung (Differenz soll angezeigt werden wenn auch kein VGL vorhanden ist)
          "" +
          "</span></span></td></tr>";
        //Ergänzung Ende (es folgt der ursprüngliche Code)
        // (!istBPvgl && gibtVgl ? '<br><span class="balken_vgl-wert">' +
        // (wv.radio1 == 2 ? ermittleVorzeichen(diff) : proz_diff_vz) +
        // formatiereZahl(wv.radio1 == 2 ? diff : proz_diff) + (wv.radio1 == 2 ? '' : '&nbsp;PP') + '</span>' : '') +
        // '</span></span></td></tr>';
      }
      zeile2++;
    }

    html += "</tbody>";
    grafik += "</table>";

    // Kommentare

    var komm_akt = ergebnis[index_region].komm_akt[wv.indexAkt];
    if (komm_akt.length > 0) {
      html +=
        '<tfoot><tr class="h-linie"><td colspan="' +
        (wv.radio1 == 2 ? "11" : "20") +
        '">' +
        (komm_akt.length > 0 ? komm_akt : "") +
        "</td></tr></tfoot>";
    }
    html += "</table>";
    return [html, grafik];
  } else {
    var html = '<table class="wertetabelle">',
      // Definieren der Spalten
      weite_part = wahltypID === 0 || wahltypID === 5 ? 20 : 15,
      weite = 100 - weite_part,
      weite1 = wv.radio1 == 2 ? runden(weite / 6, 1) : runden(weite / 12, 1);
    html +=
      '<colgroup><col width="' +
      weite_part +
      '%" span="2">' +
      '<col width="' +
      weite1 / 2 +
      '%"><col width="1%"><col width="' +
      weite1 / 2 +
      '%">' +
      (wv.radio1 == 2
        ? ""
        : '<col width="' +
          weite1 / 2 +
          '%"><col width="1%"><col width="' +
          weite1 / 2 +
          '%">') +
      '<col width="' +
      weite1 / 2 +
      '%"><col width="1%"><col width="' +
      weite1 / 2 +
      '%">' +
      (wv.radio1 == 2
        ? ""
        : '<col width="' +
          weite1 / 2 +
          '%"><col width="1%"><col width="' +
          weite1 / 2 +
          '%">') +
      '<col width="' +
      weite1 / 2 +
      '%"><col width="1%"><col width="' +
      weite1 / 2 +
      '%">' +
      (wv.radio1 == 2
        ? ""
        : '<col width="' +
          weite1 / 2 +
          '%"><col width="1%"><col width="' +
          weite1 / 2 +
          '%">') +
      "</colgroup>";
    // Inhalte laden
    var proz_akt,
      proz_vgl,
      diff,
      proz_diff,
      proz_diff_vz,
      p_index,
      i,
      j,
      l,
      texte =
        wv.radio1 == 2 && wahltypID === 5
          ? ["Gemeinden insgesamt", "Bürgermeister:innen gewählt"]
          : wv.radio1 == 2
          ? ["Mandate insgesamt", "davon zugewiesen"]
          : wv.radio1 == 1
          ? ["abgegebene Stimmen", "davon ungültig", "davon gültig"]
          : [
              "Wahlberechtigte",
              "davon weiblich",
              "abgegebene Stimmen",
              "davon ungültig",
              "davon gültig",
            ],
      ergebnis =
        wv.radio1 == 1
          ? wahl.wahlkarten
          : wv.radio1 == 2
          ? wahl.mandate
          : wahl.stimmen,
      index_region = findeRegionsindex(ergebnis, wv.regionID, false),
      parteien_akt =
        wahl.parteien[findeRegionsindex(wahl.parteien, wv.regionID, true)].akt[
          wv.indexAkt
        ],
      parteien_vgl =
        wahltypID === 5 && wv.indexAkt == 1 && wv.indexVgl == 0
          ? wahl.parteien[findeRegionsindex(wahl.parteien, wv.regionID, true)]
              .akt[0]
          : wahl.parteien[findeRegionsindex(wahl.parteien, wv.regionID, true)]
              .vgl[wv.indexVgl],
      werte_akt = ergebnis[index_region].daten_akt[wv.indexAkt],
      pwerte_akt = ergebnis[index_region].pdaten_akt[wv.indexAkt],
      werte_vgl =
        wahltypID === 5 && wv.indexAkt == 1 && wv.indexVgl == 0
          ? ergebnis[index_region].daten_akt[0]
          : ergebnis[index_region].daten_vgl[wv.indexVgl],
      pwerte_vgl =
        wahltypID === 5 && wv.indexAkt == 1 && wv.indexVgl == 0
          ? ergebnis[index_region].pdaten_akt[0]
          : ergebnis[index_region].pdaten_vgl[wv.indexVgl],
      init = wv.radio1 == 1 ? 0 : wv.radio1 == 2 ? 1 : 2,
      zeile1 = 0,
      zeile2 = 0,
      index_sort = [],
      init_akt = werte_akt[init] == null ? init : 99,
      init_vgl = werte_vgl[init] == null ? init : 99;
    // Überschriften
    var wahlbez_akt = (
        wahltypen[wahl.wahl_akt.id[wv.indexAkt]].kurzbez +
        " " +
        (ergebnis[index_region].nwjahr_akt !== undefined
          ? ergebnis[index_region].nwjahr_akt
          : wahljahr)
      ).toUpperCase(),
      wahlbez_vgl = (
        wahltypID === 5 && wv.indexAkt == 1 && wv.indexVgl == 0
          ? wahlbez_akt
          : wahltypen[wahl.wahl_vgl.id[wv.indexVgl]].kurzbez +
            " " +
            (ergebnis[index_region].nwjahr_vgl !== undefined && wv.indexVgl == 0
              ? ergebnis[index_region].nwjahr_vgl
              : wahl.wahl_vgl.jahr[wv.indexVgl])
      ).toUpperCase();
    if (istBPW_Wdh) {
      wahlbez_vgl =
        wv.indexVgl == 0
          ? "annullierter<br>2. Wahlgang"
          : "BPW 2016<br>1. Wahlgang";
    }
    html +=
      "<thead><tr><th" +
      (wv.radio1 == 2 ? "" : ' rowspan="2"') +
      ' colspan="2"></th>' +
      '<th colspan="' +
      (wv.radio1 == 2 ? "3" : "6") +
      '" class="v-linie">' +
      wahlbez_akt +
      (wahltypID === 5 && wv.indexAkt == 0 && regionen[wv.regionID].typID === 4
        ? "<br>1. Wahlgang"
        : (wahltypID === 5 &&
            wv.indexAkt == 1 &&
            regionen[wv.regionID].typID === 4) ||
          (wahlgang !== undefined && wahlgang === 2)
        ? "<br>2. Wahlgang"
        : "") +
      "</th>" +
      '<th colspan="' +
      (wv.radio1 == 2 ? "3" : "6") +
      '" class="v-linie">' +
      wahlbez_vgl +
      (wv.indexVgl == 0 &&
      wahljahr === 2016 &&
      wahl.wahl_akt.datum[0] === "4. Dezember"
        ? ""
        : (wahltypID === 5 &&
            wv.indexVgl == 0 &&
            regionen[wv.regionID].typID === 4) ||
          (wahlgang !== undefined && wahlgang === 2 && wv.indexVgl == 0)
        ? "<br>1. Wahlgang"
        : "") +
      "</th>" +
      '<th colspan="' +
      (wv.radio1 == 2 ? "3" : "6") +
      '" class="v-linie">Differenz</th></tr>' +
      (wv.radio1 == 2
        ? ""
        : '<tr><td class="v-linie" colspan="3">absolut</td><td colspan="3">in %</td>' +
          '<td class="v-linie" colspan="3">absolut</td><td colspan="3">in %</td>' +
          '<td class="v-linie" colspan="3">absolut</td><td colspan="3">' +
          //'<a style="cursor:pointer;" title="Die Differenz von Prozentwerten wird ' +
          //'in Prozentpunkten (PP) angegeben.">in PP<sup>&#x1F6C8;</sup></a></td></tr>') +
          '<abbr title="Die Differenz von Prozentwerten wird in Prozentpunkten (PP) angegeben.">in PP</abbr>') +
      "</thead><tbody>";
    // Parteiunabhängige Wahlergebnisse
    for (i = 0, l = texte.length; i < l; i++) {
      if (texte[i] === "davon weiblich" && wahljahr >= 2022) continue;
      if (
        i === 1 &&
        wv.radio1 != 1 &&
        wv.radio1 != 2 &&
        werte_akt[1] === 0 &&
        werte_akt[0] > 0
      )
        continue;
      proz_akt = null;
      proz_vgl = null;
      proz_diff = null;
      proz_diff_vz = "";
      if (wv.radio1 != 2) {
        p_index =
          wv.radio1 == 1 ? [null, 0, null][i] : [null, 0, 0, 2, null][i];
        if (p_index !== null) {
          proz_akt =
            werte_akt[i] == null
              ? ""
              : werte_akt[p_index] > 0
              ? (werte_akt[i] / werte_akt[p_index]) * 100
              : 0;
          proz_vgl =
            werte_vgl[i] == null || werte_vgl.length === 0
              ? ""
              : werte_vgl[p_index] > 0
              ? (werte_vgl[i] / werte_vgl[p_index]) * 100
              : 0;
          proz_diff =
            proz_akt === "" || proz_vgl === ""
              ? ""
              : runden(proz_akt - proz_vgl, 1);
          proz_diff_vz =
            proz_akt === "" || proz_vgl === ""
              ? ""
              : ermittleVorzeichen(proz_akt - proz_vgl);
          proz_akt = proz_akt === "" ? "" : runden(proz_akt, 1);
          proz_vgl = proz_vgl === "" ? "" : runden(proz_vgl, 1);
        }
      }
      diff =
        werte_akt[i] == null
          ? ""
          : werte_akt[i] - (i < werte_vgl.length ? werte_vgl[i] : 0);
      html +=
        "<tr" +
        (zeile1 % 2 === 1 ? ' class="hinterlegt"' : "") +
        '><th class="links' +
        (texte[i].substr(0, 5) === "davon" ? " tab-ebene1" : "") +
        '" colspan="2">' +
        texte[i] +
        "</th>" +
        '<td class="v-linie"></td><td>' +
        (i < init_akt ? formatiereZahl(werte_akt[i]) : "") +
        "</td><td></td>" +
        (wv.radio1 == 2
          ? ""
          : "<td></td><td>" +
            (i < init_akt ? formatiereZahl(proz_akt) : "") +
            "</td><td></td>") +
        '<td class="v-linie"></td><td>' +
        (i < init_vgl ? formatiereZahl(werte_vgl[i]) : "") +
        "</td><td></td>" +
        (wv.radio1 == 2
          ? ""
          : "<td></td><td>" +
            (i < init_vgl ? formatiereZahl(proz_vgl) : "") +
            "</td><td></td>") +
        '<td class="v-linie">' +
        (i < init_akt ? ermittleVorzeichen(diff) : "") +
        "</td><td>" +
        (i < init_akt ? formatiereZahl(diff) : "") +
        "</td><td></td>" +
        (wv.radio1 == 2
          ? ""
          : "<td>" +
            (i < init_akt ? proz_diff_vz : "") +
            "</td><td>" +
            (i < init_akt ? formatiereZahl(proz_diff) : "") +
            "</td><td></td>") +
        "</tr>";
      zeile1++;
    }

    // Parteiergebnisse sowie Grafik
    var grafikwerte_akt = [],
      grafikwerte_vgl = [],
      maxGrafikwert_akt,
      maxGrafikwert_vgl,
      maxGrafikwert,
      grafik = "<table><colgroup><col><col width=100%></colgroup>",
      istBPvgl =
        wahltypID === 0 &&
        wv.indexVgl == 0 &&
        (wahlgang === undefined || wahlgang === 1),
      gibtAkt,
      gibtVgl,
      wechsler = 0,
      istSonstige = [],
      anzSonstigeAkt = 0,
      anzSonstigeVgl = 0,
      summiereSonstige,
      pwerte_akt_sonst = 0,
      pwerte_vgl_sonst = 0,
      parteifarbe,
      parteien_zug = [],
      zaehlerSonstige = 0;

    // Zusammenfassung Sonstige
    summiereSonstige =
      (wahltypID < 4 &&
        parteien_akt.length > balkengrafikAnzMaxParteien &&
        balkengrafikSchwelle > 0) ||
      (wahltypID >= 4 && regionen[wv.regionID].typID < 4);
    istSonstige = ermittleSonstige(wahl, wv.regionID, wv.indexAkt, wv.indexVgl);

    if (summiereSonstige) {
      for (i = 0, l = istSonstige.length; i < l; i++)
        if (istSonstige[i]) {
          pwerte_akt_sonst += i < pwerte_akt.length ? pwerte_akt[i] : 0;
          pwerte_vgl_sonst += i < pwerte_vgl.length ? pwerte_vgl[i] : 0;
          if (i < parteien_akt.length && parteien_akt[i] !== "")
            anzSonstigeAkt++;
          if (i < parteien_vgl.length && parteien_vgl[i] !== "")
            anzSonstigeVgl++;
        }
    }

    summiereSonstige =
      anzSonstigeAkt > 1 ||
      (wahltypID >= 4 && anzSonstigeAkt + anzSonstigeVgl > 0);
    if (summiereSonstige) {
      parteien_akt[istSonstige.length] = "Sonstige";
      pwerte_akt[istSonstige.length] = pwerte_akt_sonst;
      if (anzSonstigeVgl > 0) {
        parteien_vgl[istSonstige.length] = "Sonstige";
        pwerte_vgl[istSonstige.length] = pwerte_vgl_sonst;
      }
    }
    // Aufbereitung Grafikwerte
    for (i = 0; i < parteien_akt.length; i++) {
      grafikwerte_akt[i] =
        pwerte_akt[i] === undefined
          ? 0
          : wv.radio1 == 2
          ? pwerte_akt[i]
          : werte_akt[werte_akt.length - 1] > 0
          ? pwerte_akt[i] / werte_akt[werte_akt.length - 1]
          : 0;
      grafikwerte_vgl[i] = 0;
      if (
        i < pwerte_vgl.length &&
        pwerte_vgl[i] !== undefined &&
        werte_vgl[werte_vgl.length - 1] !== 0 &&
        !istBPvgl
      )
        grafikwerte_vgl[i] =
          wv.radio1 == 2
            ? pwerte_vgl[i]
            : pwerte_vgl[i] / werte_vgl[werte_vgl.length - 1];
    }
    maxGrafikwert_akt = Array.max(grafikwerte_akt);
    maxGrafikwert_vgl = Array.max(grafikwerte_vgl);
    maxGrafikwert = Math.max(maxGrafikwert_akt / 0.8, maxGrafikwert_vgl);
    // Farbauswahl für Grafik
    if (
      wahltypID >= 4 &&
      wahl.parteien[findeRegionsindex(wahl.parteien, wv.regionID, true)].grp !==
        undefined
    )
      parteien_zug =
        wahl.parteien[findeRegionsindex(wahl.parteien, wv.regionID, true)].grp;
    else if (
      (wahltypID === 0 && (wahljahr !== 2016 || wahlgang !== 2)) ||
      wahltypID === 5
    )
      parteien_zug =
        wahl.parteien[findeRegionsindex(wahl.parteien, wv.regionID, true)]
          .vgl[1];
    else
      parteien_zug =
        wahl.parteien[findeRegionsindex(wahl.parteien, wv.regionID, true)]
          .akt[0];

    // Umsortierung, erst alle Parteien von aktueller Wahl, danach alle anderen;
    for (i = 0; i < Math.max(parteien_akt.length, parteien_vgl.length); i++) {
      if (i < parteien_akt.length && parteien_akt[i] !== "") index_sort.push(i);
    }
    for (i = 0; i < Math.max(parteien_akt.length, parteien_vgl.length); i++) {
      if (i >= parteien_akt.length || parteien_akt[i] === "")
        index_sort.push(i);
    }
    // Parteiergebnisse;
    for (j = 0; j < Math.max(parteien_akt.length, parteien_vgl.length); j++) {
      i = index_sort[j];
      gibtAkt =
        i < pwerte_akt.length &&
        parteien_akt[i] != "" &&
        parteien_akt[i] !== undefined;
      gibtVgl =
        i < pwerte_vgl.length &&
        parteien_vgl[i] != "" &&
        parteien_vgl[i] !== undefined;
      if (
        (!gibtAkt && !gibtVgl) ||
        (wahltypID >= 4 && summiereSonstige && istSonstige[i]) ||
        (wv.radio1 == 2 && parteien_akt[i] === "Nein-Stimmen")
      )
        continue;

      //    diff = gibtAkt ? pwerte_akt[i] - (gibtVgl ? pwerte_vgl[i] : 0) : null;
      //    if (wv.radio1 != 2) {
      //      proz_akt = werte_akt[werte_akt.length - 1] > 0 ? pwerte_akt[i] / werte_akt[werte_akt.length - 1] * 100 : 0;
      //      proz_vgl = gibtVgl ?
      //        (werte_vgl[werte_vgl.length - 1] > 0 ? pwerte_vgl[i] / werte_vgl[werte_vgl.length - 1] * 100 : 0) : null;
      //      proz_diff = diff == null ? null : runden(proz_akt - proz_vgl, 1);
      //      proz_diff_vz = gibtAkt ? ermittleVorzeichen(proz_akt - proz_vgl) : '';
      //      proz_akt = gibtAkt && pwerte_akt[i] != null ? runden(proz_akt, 1) : null;
      //      proz_vgl = gibtVgl && pwerte_vgl[i] != null ? runden(proz_vgl, 1) : null;
      //    }

      diff =
        gibtAkt || gibtVgl
          ? (gibtAkt ? pwerte_akt[i] : 0) - (gibtVgl ? pwerte_vgl[i] : 0)
          : null;
      if (wv.radio1 != 2) {
        proz_akt = gibtAkt
          ? werte_akt[werte_akt.length - 1] > 0
            ? (pwerte_akt[i] / werte_akt[werte_akt.length - 1]) * 100
            : 0
          : null;
        proz_vgl = gibtVgl
          ? werte_vgl[werte_vgl.length - 1] > 0
            ? (pwerte_vgl[i] / werte_vgl[werte_vgl.length - 1]) * 100
            : 0
          : null;
        proz_diff = diff == null ? null : runden(proz_akt - proz_vgl, 1);
        proz_diff_vz =
          gibtAkt || gibtVgl ? ermittleVorzeichen(proz_akt - proz_vgl) : "";
        proz_akt =
          gibtAkt && pwerte_akt[i] != null ? runden(proz_akt, 1) : null;
        proz_vgl =
          gibtVgl && pwerte_vgl[i] != null ? runden(proz_vgl, 1) : null;
      }

      if (wahltypID >= 4 || parteien_akt[i] !== "Sonstige")
        html +=
          '<tr class="' +
          (zeile2 == 0 ? "h-linie" : "") +
          " " +
          ((zeile1 + zeile2) % 2 == 1 ? "hinterlegt" : "") +
          '">' +
          '<th class="links tab-ebene2"' +
          (!gibtVgl || parteien_akt[i] === parteien_vgl[i]
            ? ' colspan="2"'
            : "") +
          ">" +
          (gibtAkt
            ? parteien_akt[i].indexOf("(") < 0 || wv.indexVgl == 0
              ? parteien_akt[i]
              : parteien_akt[i].substr(0, parteien_akt[i].indexOf("(") - 1)
            : "") +
          "</th>" +
          (gibtVgl && parteien_akt[i] != parteien_vgl[i]
            ? '<td class="links tab-ebene1">' + parteien_vgl[i] + "</td>"
            : "") +
          '<td class="v-linie"></td><td>' +
          (init_akt < 99 || !gibtAkt ? "" : formatiereZahl(pwerte_akt[i])) +
          "</td><td></td>" +
          (wv.radio1 == 2
            ? ""
            : "<td></td><td>" +
              (init_akt < 99 ? "" : formatiereZahl(proz_akt)) +
              "</td><td></td>") +
          '<td class="v-linie"></td><td>' +
          (init_vgl < 99 || !gibtVgl ? "" : formatiereZahl(pwerte_vgl[i])) +
          "</td><td></td>" +
          (wv.radio1 == 2
            ? ""
            : "<td></td><td>" +
              (init_vgl < 99 ? "" : formatiereZahl(proz_vgl)) +
              "</td><td></td>") +
          '<td class="v-linie">' +
          (init_akt < 99 ? "" : ermittleVorzeichen(diff)) +
          "</td><td>" +
          (init_akt < 99 ? "" : formatiereZahl(diff)) +
          "</td><td></td>" +
          (wv.radio1 == 2
            ? ""
            : "<td>" +
              (init_akt < 99 ? "" : proz_diff_vz) +
              "</td><td>" +
              (init_akt < 99 ? "" : formatiereZahl(proz_diff)) +
              "</td><td></td>") +
          "</tr>";

      // für Grafik
      if (
        i < parteien_akt.length &&
        gibtAkt &&
        !(summiereSonstige && istSonstige[i])
      ) {
        if (
          parteien_zug.length > 0 &&
          findeParteiindex(parteien_zug[i]) - findeParteiindex("Sonstige") < 0
        ) {
          parteifarbe = ermittleParteifarbe(
            parteien[findeParteiindex(parteien_zug[i])]
          );
        } else if (wahltypID === 0) {
          parteifarbe = ermittleParteifarbe(
            parteien[findeParteiindex(parteien_akt[i])]
          );
        } else {
          parteifarbe = reduziereDeckkraft(
            ermittleParteifarbe(parteien[findeParteiindex(parteien_zug[i])]),
            [0.6, 1][wechsler]
          );
          wechsler = 1 - wechsler;
          if (istSonstige[i]) zaehlerSonstige++;
        }
        parteifarbe =
          "background:#" + parteifarbe + "; border-color:#" + parteifarbe + ";";
        grafik +=
          '<tr><td class="balken-partei" style="' +
          parteifarbe +
          '">' +
          kuerzeKandidatenname(
            parteien_akt[i],
            wahl.wahl_akt.id[0] == 0 ? 3 : 0
          ) +
          '</td><td><span class="balken">' +
          '<span class="balken_' +
          (istBPvgl ? "ganz" : "akt") +
          '" style="' +
          parteifarbe +
          '" value="' +
          Math.round((grafikwerte_akt[i] / maxGrafikwert) * 1000) / 10 +
          '">&nbsp;</span>' +
          '<span class="balken_vgl" value="' +
          Math.round((grafikwerte_vgl[i] / maxGrafikwert) * 1000) / 10 +
          '">&nbsp;</span>' +
          '<span class="balken-wert">' +
          '<span class="balken_' +
          (istBPvgl ? "ganz" : "akt") +
          '-wert">' +
          formatiereZahl(wv.radio1 == 2 ? pwerte_akt[i] : proz_akt) +
          (wv.radio1 == 2 ? "" : "&nbsp;%") +
          "</span>" +
          //Ergänzung (Differenz soll angezeigt werden wenn auch kein VGL vorhanden ist)
          (!istBPvgl
            ? '<br><span class="balken_vgl-wert">' +
              (wv.radio1 == 2 ? ermittleVorzeichen(diff) : proz_diff_vz) +
              formatiereZahl(wv.radio1 == 2 ? diff : proz_diff) +
              (wv.radio1 == 2 ? "" : "&nbsp;PP") +
              "</span>"
            : "") +
          "</span></span></td></tr>";
        //Ergänzung Ende (es folgt der ursprüngliche Code)
        // (!istBPvgl && gibtVgl ? '<br><span class="balken_vgl-wert">' +
        // (wv.radio1 == 2 ? ermittleVorzeichen(diff) : proz_diff_vz) +
        // formatiereZahl(wv.radio1 == 2 ? diff : proz_diff) + (wv.radio1 == 2 ? '' : '&nbsp;PP') + '</span>' : '') +
        // '</span></span></td></tr>';
      }
      zeile2++;
    }

    html += "</tbody>";
    grafik += "</table>";

    // Kommentare
    var komm_akt = ergebnis[index_region].komm_akt[wv.indexAkt][wv.indexVgl],
      komm_vgl =
        wahltypID === 5 && wv.indexAkt == 1 && wv.indexVgl == 0
          ? ""
          : ergebnis[index_region].komm_vgl[wv.indexVgl];
    if (komm_akt.length > 0 || komm_vgl.length > 0) {
      html +=
        '<tfoot><tr class="h-linie"><td colspan="' +
        (wv.radio1 == 2 ? "11" : "20") +
        '">' +
        (komm_akt.length > 0
          ? (komm_vgl.length > 0 &&
            wahljahr === 2016 &&
            wahl.wahl_akt.datum[0] === "4. Dezember"
              ? "Zweiter Wahlgang: "
              : komm_vgl.length > 0 || wahltypID === 5
              ? wahlbez_akt +
                (wahlgang !== undefined && wahlgang === 2
                  ? ", zweiter Wahlgang"
                  : "") +
                ": "
              : "") + komm_akt
          : "") +
        (komm_akt.length > 0 && komm_vgl.length > 0 ? "<br>" : "") +
        (komm_vgl.length > 0
          ? (komm_akt.length > 0 &&
            wahljahr === 2016 &&
            wahl.wahl_akt.datum[0] === "4. Dezember"
              ? wv.indexVgl == 0
                ? "Annullierter zweiter Wahlgang: "
                : "Erster Wahlgang: "
              : komm_akt.length > 0 || wahltypID === 5
              ? wahlbez_vgl +
                (wahlgang !== undefined && wahlgang === 2 && wv.indexVgl == 0
                  ? ", erster Wahlgang"
                  : "") +
                ": "
              : "") + komm_vgl
          : "") +
        "</td></tr></tfoot>";
    }
    html += "</table>";
    return [html, grafik];
  }
}

function ermittleSonstige(wahl, regionID, indexAkt, indexVgl) {
  return wahltypID < 4
    ? ermittleSonstigeMaxParteien(wahl, regionID, indexAkt, indexVgl)
    : ermittleSonstigeGVWBMW(wahl, regionID, indexAkt, indexVgl);
}
function ermittleSonstigeMaxParteien(wahl, regionID, indexAkt, indexVgl) {
  var vgl_region_id = regionID < 10 ? regionID : startRegionID,
    istSonstige = [],
    i,
    l,
    parteien_akt =
      wahl.parteien[findeRegionsindex(wahl.parteien, vgl_region_id, false)].akt[
        indexAkt
      ] || [],
    parteien_vgl =
      wahl.parteien[findeRegionsindex(wahl.parteien, vgl_region_id, false)].vgl[
        indexVgl
      ] || [],
    gueltigeStimmen =
      wahl.stimmen[findeRegionsindex(wahl.stimmen, vgl_region_id, false)]
        .daten_akt[indexAkt][4],
    pstimmen =
      wahl.stimmen[findeRegionsindex(wahl.stimmen, vgl_region_id, false)]
        .pdaten_akt[indexAkt];
  for (i = 0, l = parteien_akt.length; i < l; i++) {
    istSonstige[i] =
      (gueltigeStimmen > 0 &&
        pstimmen[i] < (gueltigeStimmen * balkengrafikSchwelle) / 100) ||
      (gueltigeStimmen === 0 && i > balkengrafikAnzMaxParteien);
  }
  for (i = 0, l = parteien_vgl.length; i < l; i++) {
    istSonstige[i] = istSonstige[i] || i >= parteien_akt.length;
  }
  return istSonstige;
}
function ermittleSonstigeGVWBMW(wahl, regionID, indexAkt, indexVgl) {
  var istSonstige = [],
    i,
    l,
    parteien_akt =
      wahl.parteien[findeRegionsindex(wahl.parteien, regionID, false)].akt[
        indexAkt
      ] || [],
    parteien_vgl =
      wahl.parteien[findeRegionsindex(wahl.parteien, regionID, false)].vgl[
        indexVgl
      ] || [];
  for (i = 0, l = parteien_akt.length; i < l; i++) {
    istSonstige[i] = parteien_akt[i].indexOf("Sonstige") === 0;
  }
  for (i = 0, l = parteien_vgl.length; i < l; i++) {
    istSonstige[i] =
      istSonstige[i] || parteien_vgl[i].indexOf("Sonstige") === 0;
  }
  return istSonstige;
}

function erstelleReststimmentabelle(wahl) {
  var html = '<br><table class="wertetabelle">',
    weite_part = 15,
    weite1 = runden((100 - weite_part) / 8, 1),
    index_region_stimmen = findeRegionsindex(wahl.stimmen, wv.regionID, false),
    index_region_mandate = findeRegionsindex(wahl.mandate, wv.regionID, false),
    parteien_akt =
      wahl.parteien[findeRegionsindex(wahl.parteien, wv.regionID, false)]
        .akt[0],
    wahlzahl_akt = wahl.mandate[index_region_mandate].wz_akt,
    stimmen_akt = wahl.stimmen[index_region_stimmen].pdaten_akt[0],
    mandate_akt = wahl.mandate[index_region_mandate].pdaten_akt[0],
    reststimmen_akt = wahl.mandate[index_region_mandate].rest_akt,
    i,
    zeile = 0;
  html +=
    '<colgroup><col width="' +
    weite_part +
    '%">' +
    '<col width="' +
    weite1 / 2 +
    '%"><col width="1%"><col width="' +
    weite1 / 2 +
    '%">' +
    '<col width="' +
    weite1 / 2 +
    '%"><col width="1%"><col width="' +
    weite1 / 2 +
    '%">' +
    '<col width="' +
    weite1 / 2 +
    '%"><col width="1%"><col width="' +
    weite1 / 2 +
    '%">' +
    '<col width="' +
    weite1 / 2 +
    '%"><col width="1%"><col width="' +
    weite1 / 2 +
    '%">' +
    "</colgroup>" +
    "<thead><tr><th></th>" +
    '<th colspan="3" class="v-linie">Stimmen</th>' +
    '<th colspan="3" class="v-linie">Mandate</th>' +
    '<th colspan="3" class="v-linie">Reststimmen</th>' +
    '<th colspan="3" class="v-linie">Fehlende Stimmen</th></tr></thead>' +
    '<tbody><tr><th class="links">Wahlzahl</th>' +
    '<td class="v-linie"></td><td>' +
    formatiereZahl(runden(wahlzahl_akt, 1)) +
    "</td><td></td>" +
    '<td class="v-linie"></td><td></td><td></td>' +
    '<td class="v-linie"></td><td></td><td></td>' +
    '<td class="v-linie"></td><td></td><td></td></tr>';
  for (i = 0; i < parteien_akt.length; i++) {
    if (parteien_akt[i] !== "" && parteien_akt[i] !== undefined) {
      html +=
        '<tr class="' +
        (zeile === 0 ? " h-linie" : "") +
        (zeile % 2 === 0 ? " hinterlegt" : "") +
        '">' +
        '<th class="links tab-ebene2">' +
        parteien_akt[i] +
        "</th>" +
        '<td class="v-linie"></td><td>' +
        formatiereZahl(stimmen_akt[i]) +
        "</td><td></td>" +
        '<td class="v-linie"></td><td>' +
        formatiereZahl(mandate_akt[i]) +
        "</td><td></td>" +
        '<td class="v-linie"></td><td>' +
        formatiereZahl(runden(reststimmen_akt[i], 1)) +
        "</td><td></td>" +
        '<td class="v-linie"></td><td>' +
        (reststimmen_akt[i] > 0
          ? formatiereZahl(aufrunden(wahlzahl_akt - reststimmen_akt[i], 0))
          : "") +
        "</td><td></td></tr>";
      zeile++;
    }
  }
  // Kommentare
  html +=
    '</tbody><tfoot><tr class="h-linie"><td colspan="13">' +
    "Teilt man die Parteistimmen durch die Wahlzahl, erhält man die Anzahl der Mandate sowie " +
    "die verbleibenden Reststimmen. Die aufgerundete Differenz zwischen Wahlzahl und Reststimmen " +
    "gibt an, wie viele Stimmen einer Partei noch gefehlt haben, um ein weiteres Mandat zu erreichen. " +
    "Dies gilt nicht für die Partei ohne Reststimmen, da sich bei ihr mit der Veränderung der " +
    "Stimmen auch die Wahlzahl ändern würde. Ihr fehlten jedenfalls mehr Stimmen, als die Wahlzahl ausmacht." +
    "</td></tr></tfoot></table>";
  return html;
}

function erstelleVorstandstabelle(wahl) {
  var html =
      '<br><table class="wertetabelle" style="width:auto">' +
      '<colgroup><col width="60%"><col width="40%"></colgroup>' +
      '<thead><tr><th>Bezeichnung</th><th class="v-linie">Partei</th></tr></thead><tbody>',
    index_region_mandate = findeRegionsindex(wahl.mandate, wv.regionID, false),
    parteien_akt =
      wahl.parteien[findeRegionsindex(wahl.parteien, wv.regionID, false)]
        .akt[0],
    vorstaende_akt = wahl.mandate[index_region_mandate].vorstand_akt,
    komm_vorstand = wahl.mandate[index_region_mandate].komm_vorstand,
    nVizebgm = wahl.mandate[index_region_mandate].daten_akt[0][0] < 25 ? 1 : 2,
    i,
    zeile = 2;
  html +=
    '<tr><th class="links">Bürgermeister:in</th><td class="v-linie mitte">' +
    ermittleVorstandsparteien(vorstaende_akt[0], parteien_akt) +
    "</td></tr>";
  if (nVizebgm === 1)
    html +=
      '<tr class="hinterlegt"><th class="links">Vizebürgermeister:in</th><td class="v-linie mitte">' +
      ermittleVorstandsparteien(vorstaende_akt[1], parteien_akt) +
      "</td></tr>";
  else {
    html +=
      '<tr class="hinterlegt"><th class="links">1. Vizebürgermeister:in</th><td class="v-linie mitte">' +
      ermittleVorstandsparteien(vorstaende_akt[1], parteien_akt) +
      "</td></tr>" +
      '<tr><th class="links">2. Vizebürgermeister:in</th><td class="v-linie mitte">' +
      ermittleVorstandsparteien(vorstaende_akt[2], parteien_akt) +
      "</td></tr>";
    zeile++;
  }
  if (wv.regionID === 100) {
    for (i = 3; i < 5; i++) {
      html +=
        "<tr" +
        (zeile % 2 === 1 ? ' class="hinterlegt"' : "") +
        '><th class="links">' +
        'Stadtrat/-rätin</th><td class="v-linie mitte">' +
        ermittleVorstandsparteien(vorstaende_akt[i], parteien_akt) +
        "</td></tr>";
      zeile++;
    }
    for (i = 5; i < vorstaende_akt.length; i++) {
      html +=
        "<tr" +
        (zeile % 2 === 1 ? ' class="hinterlegt"' : "") +
        '><th class="links">' +
        'Gemeinderat/-rätin</th><td class="v-linie mitte">' +
        ermittleVorstandsparteien(vorstaende_akt[i], parteien_akt) +
        "</td></tr>";
      zeile++;
    }
    komm_vorstand +=
      (komm_vorstand.length ? "<br>" : "") +
      "Die ersten fünf bilden das Stadtkollegium, alle zwölf den Stadtsenat.";
  } else {
    for (i = nVizebgm + 1; i < vorstaende_akt.length; i++) {
      html +=
        "<tr" +
        (zeile % 2 === 1 ? ' class="hinterlegt"' : "") +
        '><th class="links">' +
        i +
        '. Gemeinderat/-rätin</th><td class="v-linie mitte">' +
        ermittleVorstandsparteien(vorstaende_akt[i], parteien_akt) +
        "</td></tr>";
      zeile++;
    }
  }
  html += "</tbody>";
  if (komm_vorstand.length > 0)
    html +=
      '<tfoot><tr class="h-linie"><td colspan="2">' +
      komm_vorstand +
      "</td></tr></tfoot>";
  html += "</table>";
  return html;
}

function ermittleVorstandsparteien(vorstand, parteiliste) {
  var parteien = ("" + vorstand).split("/").map(function (d) {
    if (parteiliste[d - 1] === undefined) {
      return "";
    } else {
      return parteiliste[d - 1];
    }
  });

  if (parteien.length === 1) return parteien[0];
  return parteien.join(" / ") + " (Los)";
}

/***** Erstellt Rangliste und Wahlstatus und sortiert sie *****/
// Erstellt Wahlstatus
function erstelleWahlstatus(wahl) {
  // Tabellenüberschrift
  var i,
    liste = wahl.stimmen || [],
    l = liste.length,
    rang = 1,
    daten,
    pdaten,
    regionstyp,
    html =
      '<div id="status-wahl">' +
      (wahltypID === 5
        ? ""
        : '<div id="status-menue-wahl" class="menue-wahl">' +
          erstelleRegionsauswahl(liste, 2, 3) +
          "</div><br>" +
          '<div class="beschreibung"><input type="checkbox" value="getrennt"' +
          (wv.check1 === 1 ? ' checked="checked"' : ' checked=""') +
          ">&ensp;" +
          "Unterschiedliche Regionstypen (Gemeinden, Bezirke usw.) getrennt sortieren</div><br>") +
      '<div class="beschreibung keinDruck">Klicken Sie auf eine der Überschriften, um die Tabelle zu sortieren.<br>' +
      "Ein Klick auf eine Zeile öffnet das Wahlergebnis dieser Region.</div><br>" +
      '<div id="status-tabelle-wahl"><table class="wertetabelle sortierbar"><thead><tr>' +
      '<th class="nosort">Rang</th>' +
      "<th>Region</th>" +
      (wahltypID === 6
        ? '<th class="sort_z">Stimmbe-<br>rechtigte</th>'
        : '<th class="sort_z">Wahlbe-<br>rechtigte</th>') +
      (wahltypID === 6
        ? '<th class="sort_z">ausgestellte<br>Stimmkarten</th>'
        : '<th class="sort_z">ausgestellte<br>Wahlkarten</th>') +
      (wahltypID === 6
        ? '<th class="sort_d">Wahl-<br>schluss</th>'
        : '<th class="sort_d">Wahl-<br>schluss</th>') +
      '<th class="sort_d">Datum<br>eingelangt</th>' +
      '<th class="sort_d">Datum<br>korrigiert</th>' +
      "</tr></thead><tbody>";
  $j("#ueberschrift-wahl>h3").html(
    $j("#ueberschrift-wahl>h3").html() +
      //(wahl.status === 5 || wahl.stand === '' || wv.indexAkt != wahl.wahl_akt.id.length - 1 ? '' : '<br>Stand: ' + wahl.stand));
      (wahl.status === 5 ||
      wahl.stand === "" ||
      wv.indexAkt != wahl.wahl_akt.id.length - 1
        ? ""
        : ermittleStand(wahl))
  );

  // Ergebnisse
  for (i = 0; i < l; i++) {
    if (
      liste[i].daten_akt[wv.indexAkt] !== undefined &&
      liste[i].region_id > 0 &&
      vergleicheBaeume(wv.regionID, liste[i].region_id)
    ) {
      daten = liste[i].daten_akt[wv.indexAkt];
      pdaten = liste[i].pdaten_akt[wv.indexAkt];
      regionstyp = regionstypen[regionen[liste[i].region_id].typID];
      html +=
        "<tr" +
        (regionstyp.ID < 4 ? ' class="ebene' + regionstyp.ID + '"' : "") +
        ">" +
        "<td>" +
        (regionstyp.ID === 4 ? rang : "") +
        "</td>" +
        '<td class="links fett" value="' +
        -liste[i].region_id +
        '">' +
        (regionstyp.ID < 4 ? regionstyp.kurzbez + " " : "") +
        regionen[liste[i].region_id].bez +
        "</td>" +
        "<td>" +
        formatiereZahl(liste[i].wb !== undefined ? liste[i].wb : daten[0]) +
        "</td>" +
        "<td>" +
        formatiereZahl(liste[i].wk[wv.indexAkt]) +
        "</td>" +
        "<td>" +
        liste[i].schluss[wv.indexAkt] +
        "</td>" +
        "<td>" +
        liste[i].ein[wv.indexAkt] +
        "</td>" +
        "<td>" +
        liste[i].korr[wv.indexAkt] +
        "</td></tr>";
      if (regionstyp.ID === 4) rang++;
    }
  }
  html += "</tbody></table></div></div>";
  return html;
}

// Erstellt Rangliste
function erstelleRangliste(wahl) {
  // Tabellenüberschrift
  var i,
    j,
    l,
    k,
    liste = wahl.stimmen || [],
    rang = 1,
    wert,
    daten,
    pdaten,
    daten_vgl,
    pdaten_vgl,
    regionstyp,
    parteien_tab =
      wahl.parteien[findeRegionsindex(wahl.parteien, wv.regionID, true)].akt[
        wv.indexAkt
      ] || [],
    parteien_akt,
    parteien_vgl,
    summiereSonstige,
    istSonstige = [],
    anzSonstigeAkt = 0,
    indexNein = -1;

  if (wahltypID === 6) {
    var html =
      '<div id="rangliste-wahl">' +
      '<div id="rangliste-menue-wahl" class="menue-wahl">' +
      // '<input type="radio" name="vergleich" value="0"' +
      // (wv.radio1 == 0 ? ' checked="checked"' : "") +
      // "> Anteile<br>" +
      // "<br><br>" +
      erstelleRegionsauswahl(
        wahltypID === 5 ? wahl.mandate : wahl.stimmen,
        2,
        3
      ) +
      "</div><br>" +
      '<div class="beschreibung"><input type="checkbox" value="getrennt"' +
      (wv.check1 === 1 ? ' checked="checked"' : "") +
      ">&ensp;" +
      "Unterschiedliche Regionstypen (Gemeinden, Bezirke usw.) getrennt sortieren</div><br>" +
      '<div class="beschreibung keinDruck">Klicken Sie auf eine der Überschriften, um die Tabelle zu sortieren.<br>' +
      "Ein Klick auf eine Zeile öffnet das Wahlergebnis dieser Region. Angaben in Prozent (%).</div><br>";

    html +=
      '<div id="rangliste-tabelle-wahl"><table class="wertetabelle sortierbar"><thead><tr>' +
      '<th class="nosort" style = "width: 5%">Rang</th>' +
      '<th style = "width: 35%">Region</th>' +
      '<th style = "width: 12%">Beteiligung</th>' +
      '<th style = "width: 12%">ungültige<br>Stimmen</th>';
    $j("#ueberschrift-wahl>h3").html(
      $j("#ueberschrift-wahl>h3").html() +
        //(wahl.status === 5 || wahl.stand === '' || wv.indexAkt != wahl.wahl_akt.id.length - 1 ? '' : '<br>Stand: ' + wahl.stand));
        (wahl.status === 5 ||
        wahl.stand === "" ||
        wv.indexAkt != wahl.wahl_akt.id.length - 1
          ? ""
          : ermittleStand(wahl)) 
    );
    //
    for (i = 0, l = parteien_tab.length; i < l; i++) {
      if (parteien_tab[i] !== "") html += '<th style = "width: 18%">' + parteien_tab[i] + "<br></th>";
    }
    if (indexNein > -1) html += "<th>Nein</th>";
    html += "</tr></thead>\n<tbody>";

    // Ergebnisse
    for (i = 0, l = liste.length; i < l; i++) {
      if (
        liste[i].daten_akt[wv.indexAkt] !== undefined &&
        vergleicheBaeume(wv.regionID, liste[i].region_id)
      ) {
        parteien_akt =
          wahl.parteien[
            findeRegionsindex(wahl.parteien, liste[i].region_id, true)
          ].akt[wv.indexAkt];
        daten = liste[i].daten_akt[wv.indexAkt];
        pdaten = liste[i].pdaten_akt[wv.indexAkt];

        regionstyp = regionstypen[regionen[liste[i].region_id].typID];
        html +=
          "<tr" +
          (regionstyp.ID < 4 ? ' class="ebene' + regionstyp.ID + '"' : "") +
          ">" +
          "<td>" +
          (regionstyp.ID === 4 ? rang : "") +
          "</td>" +
          '<td class="links fett" value="' +
          -liste[i].region_id +
          '">' +
          (regionstyp.ID < 4 ? regionstyp.kurzbez + " " : "") +
          regionen[liste[i].region_id].bez +
          "</td>";
        wert =
          daten[0] * daten[2] > 0 /*&&(liste[i].region_id!=0||wahl.status!=1)*/
            ? (daten[2] / daten[0]) * 100
            : "";
        html +=
          '<td value="' +
          (wert !== "" ? runden(wert, 4) : "") +
          '">' +
          (wert !== "" ? formatiereZahl(runden(wert, 1)) : "") +
          "</td>";
        wert = daten[2] > 0 ? (daten[3] / daten[2]) * 100 : "";
        html +=
          '<td value="' +
          (wert !== "" ? runden(wert, 4) : "") +
          '">' +
          (wert !== "" ? formatiereZahl(runden(wert, 1)) : "") +
          "</td>";

        for (j = 0, k = parteien_tab.length; j < k; j++) {
          if (parteien_tab[j] !== "" && j !== indexNein) {
            wert =
              daten[4] === 0 ||
              daten[4] === null ||
              j >= parteien_akt.length ||
              parteien_akt[j] === ""
                ? ""
                : (pdaten[j] / daten[4]) * 100;
            html +=
              '<td value="' +
              (wert !== "" ? runden(wert, 4) : "") +
              '">' +
              (wert !== ""
                ? (wv.radio1 > 0 ? ermittleVorzeichen(wert) : "") +
                  formatiereZahl(runden(wert, 1))
                : "") +
              "</td>";
          }
        }

        if (indexNein > -1) {
          wert =
            daten[4] == 0 || indexNein >= parteien_akt.length
              ? ""
              : (pdaten[indexNein] / daten[4]) * 100;
          html +=
            '<td value="' +
            (wert !== "" ? runden(wert, 4) : "") +
            '">' +
            (wert !== ""
              ? (wv.radio1 > 0 ? ermittleVorzeichen(wert) : "") +
                formatiereZahl(runden(wert, 1))
              : "") +
            "</td>";
        }
        html += "</tr>";
        if (regionstyp[0] == 4) rang++;
      }
    }
    html +=
      "</tbody></table>" +
      (wv.radio1 > 0 && wahltypID > 2 ? "" : "") +
      "</div></div>";
    return html;
  } else {
    var html =
      '<div id="rangliste-wahl">' +
      '<div id="rangliste-menue-wahl" class="menue-wahl">' +
      '<input type="radio" name="vergleich" value="0"' +
      (wv.radio1 == 0 ? ' checked="checked"' : "") +
      "> Anteile<br>" +
      (istBPW_Wdh
        ? '<input type="radio" name="vergleich" value="1"' +
          (wv.radio1 == 1 ? ' checked="checked"' : "") +
          "> Differenzen zum annullierten zweiten Wahlgang<br>" +
          '<input type="radio" name="vergleich" value="2"' +
          (wv.radio1 == 2 ? ' checked="checked"' : "") +
          "> Differenzen zum ersten Wahlgang"
        : '<input type="radio" name="vergleich" value="1"' +
          (wv.radio1 == 1 ? ' checked="checked"' : "") +
          "> Differenzen " +
          (wahlgang !== undefined && wahlgang === 2
            ? "zum ersten Wahlgang"
            : wv.indexAkt == 0
            ? "zur Vorwahl"
            : "zum ersten Wahlgang")) +
      "<br><br>" +
      erstelleRegionsauswahl(
        wahltypID === 5 ? wahl.mandate : wahl.stimmen,
        2,
        3
      ) +
      "</div><br>" +
      (wahltypID === 5
        ? ""
        : '<div class="beschreibung"><input type="checkbox" value="getrennt"' +
          (wv.check1 === 1 ? ' checked="checked"' : "") +
          ">&ensp;" +
          "Unterschiedliche Regionstypen (Gemeinden, Bezirke usw.) getrennt sortieren</div><br>") +
      '<div class="beschreibung keinDruck">Klicken Sie auf eine der Überschriften, um die Tabelle zu sortieren.<br>' +
      "Ein Klick auf eine Zeile öffnet das Wahlergebnis dieser Region.</div><br>" +
      (wahltypID === 5
        ? '<div class="beschreibung">Stellten sich in einer Gemeinde Kandidatinnen oder Kandidaten ' +
          "mehrerer sonstiger Parteien der Wahl, wird unter 'Sonstige' der höchste Stimmanteil" +
          (wv.radio1 > 0 ? "sgewinn bzw. niedrigste Stimmanteilsverlust" : "") +
          " angezeigt.</div><br>"
        : "") +
      '<div id="rangliste-tabelle-wahl"><table class="wertetabelle sortierbar"><thead><tr>' +
      '<th class="nosort">Rang</th>' +
      "<th>Region</th>" +
      "<th>Wahlbe-<br>teiligung</th>" +
      "<th>ungültige<br>Stimmen</th>";
    $j("#ueberschrift-wahl>h3").html(
      $j("#ueberschrift-wahl>h3").html() +
        //(wahl.status === 5 || wahl.stand === '' || wv.indexAkt != wahl.wahl_akt.id.length - 1 ? '' : '<br>Stand: ' + wahl.stand));
        (wahl.status === 5 ||
        wahl.stand === "" ||
        wv.indexAkt != wahl.wahl_akt.id.length - 1
          ? ""
          : ermittleStand(wahl))
    );

    // Zusammenfassung Sonstige
    summiereSonstige =
      (parteien_tab !== undefined &&
        parteien_tab.length > balkengrafikAnzMaxParteien &&
        balkengrafikSchwelle > 0) ||
      wahltypID >= 4;
    if (summiereSonstige) {
      istSonstige = ermittleSonstige(wahl, wv.regionID, wv.indexAkt, 0);
      for (i = 0, l = parteien_tab.length; i < l; i++)
        if (parteien_tab[i] !== "" && istSonstige[i]) anzSonstigeAkt++;
    }
    summiereSonstige =
      anzSonstigeAkt > 1 || (wahltypID >= 4 && anzSonstigeAkt > 0);
    for (i = 0, l = parteien_tab.length; i < l; i++) {
      if (parteien_tab[i] === "Nein-Stimmen") indexNein = i;
      else if (parteien_tab[i] !== "" && !(summiereSonstige && istSonstige[i]))
        html += "<th>" + kuerzeKandidatenname(parteien_tab[i], 3) + "</th>";
    }
    if (summiereSonstige) html += "<th>Sonstige</th>";
    if (indexNein > -1) html += "<th>Nein</th>";
    html += "</tr></thead>\n<tbody>";

    // Ergebnisse
    for (i = 0, l = liste.length; i < l; i++) {
      if (
        liste[i].daten_akt[wv.indexAkt] !== undefined &&
        vergleicheBaeume(wv.regionID, liste[i].region_id)
      ) {
        parteien_akt =
          wahl.parteien[
            findeRegionsindex(wahl.parteien, liste[i].region_id, true)
          ].akt[wv.indexAkt];
        daten = liste[i].daten_akt[wv.indexAkt];
        pdaten = liste[i].pdaten_akt[wv.indexAkt];
        if (wv.indexAkt == 0) {
          parteien_vgl =
            wahl.parteien[
              findeRegionsindex(wahl.parteien, liste[i].region_id, true)
            ].vgl[Math.max(0, wv.radio1 - 1)];
          daten_vgl = liste[i].daten_vgl[Math.max(0, wv.radio1 - 1)];
          pdaten_vgl = liste[i].pdaten_vgl[Math.max(0, wv.radio1 - 1)];
        } else {
          parteien_vgl =
            wahl.parteien[
              findeRegionsindex(wahl.parteien, liste[i].region_id, true)
            ].akt[wv.indexAkt - 1];
          daten_vgl = liste[i].daten_akt[wv.indexAkt - 1];
          pdaten_vgl = liste[i].pdaten_akt[wv.indexAkt - 1];
        }
        regionstyp = regionstypen[regionen[liste[i].region_id].typID];
        html +=
          "<tr" +
          (regionstyp.ID < 4 ? ' class="ebene' + regionstyp.ID + '"' : "") +
          ">" +
          "<td>" +
          (regionstyp.ID === 4 ? rang : "") +
          "</td>" +
          '<td class="links fett" value="' +
          -liste[i].region_id +
          '">' +
          (regionstyp.ID < 4 ? regionstyp.kurzbez + " " : "") +
          regionen[liste[i].region_id].bez +
          "</td>";
        wert =
          daten[0] * daten[2] > 0 /*&&(liste[i].region_id!=0||wahl.status!=1)*/
            ? (daten[2] / daten[0] -
                (wv.radio1 > 0 && daten_vgl[0] > 0
                  ? daten_vgl[2] / daten_vgl[0]
                  : 0)) *
              100
            : "";
        html +=
          '<td value="' +
          (wert !== "" ? runden(wert, 4) : "") +
          '">' +
          (wert !== ""
            ? (wv.radio1 > 0 ? ermittleVorzeichen(wert) : "") +
              formatiereZahl(runden(wert, 1))
            : "") +
          "</td>";
        wert =
          daten[2] > 0
            ? (daten[3] / daten[2] -
                (wv.radio1 > 0 && daten_vgl[2] > 0
                  ? daten_vgl[3] / daten_vgl[2]
                  : 0)) *
              100
            : "";
        html +=
          '<td value="' +
          (wert !== "" ? runden(wert, 4) : "") +
          '">' +
          (wert !== ""
            ? (wv.radio1 > 0 ? ermittleVorzeichen(wert) : "") +
              formatiereZahl(runden(wert, 1))
            : "") +
          "</td>";

        for (j = 0, k = parteien_tab.length; j < k; j++) {
          if (
            parteien_tab[j] !== "" &&
            j !== indexNein &&
            !(summiereSonstige && (istSonstige[j] || j >= istSonstige.length))
          ) {
            wert =
              daten[4] === 0 ||
              j >= parteien_akt.length ||
              parteien_akt[j] === ""
                ? ""
                : (pdaten[j] / daten[4] -
                    (wv.radio1 > 0 && pdaten_vgl[j] > 0
                      ? pdaten_vgl[j] / daten_vgl[4]
                      : 0)) *
                  100;
            html +=
              '<td value="' +
              (wert !== "" ? runden(wert, 4) : "") +
              '">' +
              (wert !== ""
                ? (wv.radio1 > 0 ? ermittleVorzeichen(wert) : "") +
                  formatiereZahl(runden(wert, 1))
                : "") +
              "</td>";

            //Neu wenn Differenz für nicht mehr antretenden Parteien auch noch angezeigt werden sollen
            //wert = (daten[4] === 0 || j >= parteien_akt.length || (parteien_akt[j] === '' & wv.radio1 <= 0) ||
            //		 ((parteien_vgl[j] === '' || parteien_vgl[j] === undefined) & parteien_akt[j] === ''))
            //		 ? '' :
            //  (pdaten[j] / daten[4] - (wv.radio1 > 0 && pdaten_vgl[j] > 0 ? pdaten_vgl[j] / daten_vgl[4] : 0)) * 100;
            //html += '<td value="' + (wert !== '' ? runden(wert, 4) : '') + '">' +
            //  (wert !== '' ? (wv.radio1 > 0 ? ermittleVorzeichen(wert) : '') + formatiereZahl(runden(wert, 1)) + (wv.radio1 > 0 && parteien_akt[j] === '' ? '*' : '') : '') + '</td>';
            //Ende Ergänzung
          }
        }
        if (summiereSonstige) {
          pdaten[istSonstige.length] = 0;
          pdaten_vgl[istSonstige.length] = 0;
          anzSonstigeAkt = 0;
          anzSonstigeVor = 0;

          for (j = 0, k = istSonstige.length; j < k; j++) {
            if (wahltypID === 5) {
              // Höchster Anteil bzw. Anteilsgewinn statt Summe bzw. Summendifferenz
              if (
                j < parteien_akt.length &&
                parteien_akt[j] !== "" &&
                istSonstige[j]
              ) {
                //			  if (((j < parteien_akt.length && parteien_akt[j] !== '') || (j < parteien_vgl.length && parteien_vgl[j] !== '')) && istSonstige[j]){
                if (pdaten[istSonstige.length] < pdaten[j])
                  pdaten[istSonstige.length] = pdaten[j];
                if (
                  j < parteien_vgl.length &&
                  parteien_vgl[j] !== "" &&
                  istSonstige[j]
                ) {
                  anzSonstigeVor++;
                }
                if (
                  j < parteien_akt.length &&
                  parteien_akt[j] !== "" &&
                  istSonstige[j]
                ) {
                  anzSonstigeAkt++;
                }
                wert = daten[4] > 0 ? pdaten[j] / daten[4] : 0;
                //wert = daten[4] > 0 ? (pdaten[j] > 0 ? pdaten[j] / daten[4] : 0) : 0;
                if (
                  wert > 0 &&
                  j < parteien_vgl.length &&
                  parteien_vgl[j] !== "" &&
                  istSonstige[j]
                ) {
                  //			  if (j < parteien_vgl.length && parteien_vgl[j] !== '' && istSonstige[j]){
                  wert = wert - pdaten_vgl[j] / daten_vgl[4];
                }
                if (pdaten_vgl[istSonstige.length] == 0) {
                  pdaten_vgl[istSonstige.length] = -1;
                }
                if (pdaten_vgl[istSonstige.length] < wert) {
                  pdaten_vgl[istSonstige.length] = wert;
                }
              }
            } else {
              if (
                j < parteien_akt.length &&
                parteien_akt[j] !== "" &&
                istSonstige[j]
              ) {
                pdaten[istSonstige.length] += pdaten[j];
                anzSonstigeAkt++;
              }
              if (
                j < parteien_vgl.length &&
                parteien_vgl[j] !== "" &&
                istSonstige[j]
              )
                pdaten_vgl[istSonstige.length] += pdaten_vgl[j];
            }
          }
          if (wahltypID === 5 && wv.radio1 > 0) {
            wert =
              daten[4] == 0 || anzSonstigeAkt == 0
                ? ""
                : pdaten_vgl[istSonstige.length] * 100;
            //wert = (daten[4] == 0 || (anzSonstigeVor + anzSonstigeAkt) == 0) ? '' : pdaten_vgl[istSonstige.length] * 100;
          } else
            wert =
              daten[4] == 0 || anzSonstigeAkt == 0
                ? ""
                : (pdaten[istSonstige.length] / daten[4] -
                    (wv.radio1 > 0
                      ? pdaten_vgl[istSonstige.length] / daten_vgl[4]
                      : 0)) *
                  100;
          html +=
            '<td value="' +
            (wert !== "" ? runden(wert, 4) : "") +
            '">' +
            (wert !== ""
              ? (wv.radio1 > 0 ? ermittleVorzeichen(wert) : "") +
                formatiereZahl(runden(wert, 1))
              : "") +
            "</td>";

          //Neu wenn Differenz für nicht mehr antretenden Parteien auch noch angezeigt werden sollen
          //wert = (daten[4] == 0 || (anzSonstigeAkt == 0 && wv.radio1 <= 0) ||
          //			(pdaten_vgl[istSonstige.length] == 0 && anzSonstigeAkt == 0)) ? '' :
          //  (pdaten[istSonstige.length] / daten[4] - (wv.radio1 > 0 ? pdaten_vgl[istSonstige.length] / daten_vgl[4] : 0)) * 100;
          //html += '<td value="' + (wert !== '' ? runden(wert, 4) : '') + '">' +
          // (wert !== '' ? (wv.radio1 > 0 ? ermittleVorzeichen(wert) : '') + formatiereZahl(runden(wert, 1)) + (wv.radio1 > 0 && anzSonstigeAkt == 0 ? '*' : '') : '') + '</td>';
        }
        if (indexNein > -1) {
          wert =
            daten[4] == 0 || indexNein >= parteien_akt.length
              ? ""
              : (pdaten[indexNein] / daten[4] -
                  (wv.radio1 > 0 && pdaten_vgl[indexNein] > 0
                    ? pdaten_vgl[indexNein] / daten_vgl[4]
                    : 0)) *
                100;
          html +=
            '<td value="' +
            (wert !== "" ? runden(wert, 4) : "") +
            '">' +
            (wert !== ""
              ? (wv.radio1 > 0 ? ermittleVorzeichen(wert) : "") +
                formatiereZahl(runden(wert, 1))
              : "") +
            "</td>";
        }
        html += "</tr>";
        if (regionstyp[0] == 4) rang++;
      }
    }
    html +=
      "</tbody></table>" +
      (wv.radio1 > 0 && wahltypID > 2 ? "" : "") +
      "</div></div>";
    return html;
  }
}

// Sortiert die Liste
function sortiereRangliste(spalte, vonCheckbox) {
  var i,
    j,
    l,
    k,
    zelle,
    wert,
    regionstyp,
    regionID,
    html = "",
    rang = 1,
    neueZeile,
    index = spalte.parent().find("th").index(spalte),
    zeilen = $j("table.wertetabelle tbody tr").get(),
    sortZeilen = [[], [], [], [], []];
  spalte.siblings().removeClass("sortiert resortiert");
  if (!vonCheckbox && spalte.hasClass("sortiert"))
    spalte.removeClass("sortiert").addClass("resortiert");
  else if (!vonCheckbox) spalte.removeClass("resortiert").addClass("sortiert");
  for (i = 0; i < zeilen.length; i++) {
    zelle = $j("td:eq(" + index + ")", zeilen[i]);
    wert =
      zelle.attr("value") !== undefined ? zelle.attr("value") : zelle.html();
    regionstyp = 0;
    if ($j("input[type=checkbox]").prop("checked"))
      regionstyp =
        regionen[-$j("td:nth-child(2)", zeilen[i]).attr("value")].typID;
    regionID = +$j("td:eq(1)", zeilen[i]).attr("value");
    if (spalte.hasClass("sort_z"))
      sortZeilen[regionstyp].push([wert.split(".").join(""), regionID, i]);
    else if (spalte.hasClass("sort_d")) {
      wert = wert.split(".");
      if (wert.length === 1 && wert[0] !== "")
        wert = ["0", "0", "0000, " + wert[0]];
      sortZeilen[regionstyp].push([
        wert[0] === ""
          ? ""
          : wert[2].slice(0, 4) * 100000000 +
            wert[1] * 1000000 +
            wert[0] * 10000 +
            wert[2].split(":")[0].slice(-2) * 100 +
            wert[2].split(":")[1].slice(0, 2) * 1,
        regionID,
        i,
      ]);
    } else if (index === 1)
      sortZeilen[regionstyp].push([
        $j("td:eq(2)", zeilen[i]).attr("value") === "" ? "" : regionID,
        regionID,
        i,
      ]);
    else sortZeilen[regionstyp].push([wert, regionID, i]);
  }
  for (i = 0, l = sortZeilen.length; i < l; i++)
    sortZeilen[i].sort(function (a, b) {
      if ((a[0] === "" && b[0] === "") || a[0] === b[0]) return b[1] - a[1];
      if (b[0] === "") return -1;
      if (a[0] === "") return 1;
      if (spalte.hasClass("sortiert")) return b[0] - a[0];
      return a[0] - b[0];
    });
  zeilen = $j("table.wertetabelle tbody")
    .html()
    .split(/<\/tr>/gi);
  for (i = 0, l = sortZeilen.length; i < l; i++)
    for (j = 0, k = sortZeilen[i].length; j < k; j++) {
      neueZeile = zeilen[sortZeilen[i][j][2]];
      if (neueZeile.indexOf("ebene") === -1) {
        neueZeile =
          neueZeile.slice(0, neueZeile.toLowerCase().indexOf("<td")) +
          "<td>" +
          rang +
          neueZeile.slice(neueZeile.toLowerCase().indexOf("</td"));
        rang++;
      }
      html += neueZeile + "</tr>";
    }
  $j("table.wertetabelle tbody").html(html);

  $j("table.wertetabelle tbody tr").click(function () {
    loescheParameter();
    wv.inhalt = "erg";
    wv.regionID = -$j("td:nth-child(2)", this).attr("value");
    ergaenzeParameter();
    veraendereHash();
  });
}

// Kopfzeile der Listen-Tabelle bleibt beim Scrollen sichtbar
(function ($j) {
  $j.fn.fixeKopfzeile = function () {
    var varKZ,
      fixKZ,
      offset,
      scrollTop,
      scrollLeft,
      origCell,
      tab = this,
      $tab = $j(this),
      $this;

    tab.start = function () {
      varKZ = $j("thead tr", tab);
      varKZ.before(varKZ.clone());
      fixKZ = $j("thead tr:first", tab);
      varKZ.addClass("variableKopfzeile");
      fixKZ.addClass("fixierteKopfzeile");
      fixKZ.css("position", "fixed");
      fixKZ.css("top", "0px");
      fixKZ.css("left", $tab.css("margin-left"));
      fixKZ.css("display", "none");

      tab.aktualisiereKopfzeile();
      $j(window).scroll(tab.aktualisiereKopfzeile);
      $j(window).resize(tab.aktualisiereKopfzeile);
    };
    tab.aktualisiereKopfzeile = function () {
      varKZ = $j("tr.variableKopfzeile", tab);
      fixKZ = $j("tr.fixierteKopfzeile", tab);
      offset = $tab.offset();
      scrollTop = $j(window).scrollTop();
      scrollLeft = $j(window).scrollLeft();

      if (scrollTop > offset.top && scrollTop < offset.top + $tab.height()) {
        fixKZ.css("top", "0px");
        fixKZ.css("margin-top", 0);
        fixKZ.css("left", offset.left - scrollLeft + 1 + "px");
        fixKZ.css("display", "block");
        tab.uebertrageFormat(fixKZ, varKZ);
      } else {
        fixKZ.css("display", "none");
        tab.uebertrageFormat(varKZ, fixKZ);
      }
    };
    tab.uebertrageFormat = function (unsichtbareKopfzeile, sichtbareKopfzeile) {
      $j("th", sichtbareKopfzeile).each(function (index) {
        $this = $j(this);
        origCell = $j("th", unsichtbareKopfzeile).eq(index);
        $this.removeClass().addClass(origCell.attr("class"));
        $this.css("width", origCell.width());
      });
      sichtbareKopfzeile.css("width", unsichtbareKopfzeile.width() - 1);
    };
    tab.start();
  };
})($j);

/***** Erstellt Karten *****/
function erstelleKarte(wahl) {
  if (wahltypID === 6) {
    var html =
        '<div id="karten-wahl"><div id="karten-beschreibung-wahl" class="beschreibung">' +
        "Bewegen Sie die Maus über die Karte, um Informationen über die gewünschte Gemeinde zu erhalten.<br>" +
        "Ein Klick öffnet das Wahlergebnis dieser Gemeinde." +
        '</div><div id="karten-menue-wahl" class="menue-wahl">',
      i,
      j,
      regionID,
      anz_Gemeindekandidaturen,
      indexNein = -1,
      auswahl =
        wahl.parteien[
          findeRegionsindex(wahl.parteien, startRegionID, true)
        ].akt[0].slice(),
      anz_Parteien = [0, 0],
      platz = ["erst", "zweit"],
      ordinal = ["Höchster", "Zweithöchster"];

    for (i = 0, l = wahl.stimmen.length; i < l; i++) {
      regionID = wahl.stimmen[i].region_id;
      anz_Gemeindekandidaturen = 0;
      for (j = 0, k = auswahl.length; j < k; j++) {
        if (
          regionen[regionID].typID === 4 &&
          j <
            wahl.parteien[findeRegionsindex(wahl.parteien, regionID, true)]
              .akt[0].length &&
          wahl.parteien[findeRegionsindex(wahl.parteien, regionID, true)]
            .akt[0][j] !== ""
        )
          anz_Gemeindekandidaturen++;
      }
      anz_Parteien[Math.min(anz_Gemeindekandidaturen - 1, 9)]++;
    }
    while (anz_Parteien.pop() < 2) {}

    for (i = 0, l = auswahl.length; i < l; i++) {
      anz_Gemeindekandidaturen = 0;
      for (j = 0, k = wahl.stimmen.length; j < k; j++) {
        regionID = wahl.stimmen[j].region_id;
        if (
          regionen[regionID].typID === 4 &&
          i <
            wahl.parteien[findeRegionsindex(wahl.parteien, regionID, true)]
              .akt[0].length &&
          wahl.parteien[findeRegionsindex(wahl.parteien, regionID, true)]
            .akt[0][i] !== ""
        )
          anz_Gemeindekandidaturen++;
      }
      if (anz_Gemeindekandidaturen < 2 || auswahl[i].indexOf("Sonstige") === 0)
        auswahl[i] = "";
    }

    html += "<select>";
    for (i = 1; i <= Math.min(10, anz_Parteien.length + 1); i++)
      html +=
        '<option value="a' +
        i +
        '"' +
        (wv.indexAkt === "a" + i ? ' selected="selected"' : "") +
        ">" +
        ordinal[i - 1] +
        " Stimmanteil</option>";
    for (i = 0, l = auswahl.length; i < l; i++) {
      if (auswahl[i] === "Nein-Stimmen") indexNein = i;
      else if (auswahl[i] !== "")
        html +=
          '<option value="' +
          i +
          '"' +
          (wv.indexAkt == i ? ' selected="selected"' : "") +
          ">" +
          auswahl[i] +
          "</option>";
    }
    html +=
      '<option value="b"' +
      (wv.indexAkt === "b" ? ' selected="selected"' : "") +
      ">Beteiligung</option>" +
      '<option value="c"' +
      (wv.indexAkt === "c" ? ' selected="selected"' : "") +
      ">Ungültige Stimmen</option>" +
      '<option value="d"' +
      (wv.indexAkt === "d" ? ' selected="selected"' : "") +
      ">Ausgestellte Stimmkarten</option>";
    html +=
      "</select></div>" +
      '<div id="karten-text-wahl"></div>' +
      '<div id="karten-legende-wahl">' +
      '<table><tr><th colspan="2"></th></tr>' +
      '<tr><td id="karten-legendenbalken-wahl" rowspan="3"></td>' +
      '<td id="legende-maxwert"></td></tr>' +
      '<tr><td id="legende-nullwert"></td></tr>' +
      '<tr><td id="legende-minwert"></td></tr></table></div>' +
      '<div id="karten-parteienlegende-wahl"></div>' +
      '<div id="karten-grafik-wahl">' +
      '<img src="../ltw/tools/salzburgkarte.gif" width="727" height="610" usemap="#salzburgkarte"><map name="salzburgkarte">';
    for (i = 0, l = koordinaten.length; i < l; i++)
      html +=
        '<area id="g' +
        koordinaten[i].ID +
        '" href="javascript:void(0);" shape="poly" coords="' +
        koordinaten[i].coords +
        '">';
    html += "</map></div></div>";
    $j("#inhalt-wahl").html(html);

    $j("#ueberschrift-wahl>h3").html(
      (wahltypID === 5 && wv.indexAkt === "a0"
        ? "Bürgermeisterpartei"
        : (wv.indexAkt === "d"
            ? "Anteil ausgestellter Stimmkarten an den Stimmberechtigten"
            : wv.indexAkt.substr(0, 1) === "a"
            ? ordinal[wv.indexAkt.substr(1) - 1] + " Stimmanteil"
            : wv.indexAkt === "b"
            ? "Beteiligung"
            : wv.indexAkt === "c"
            ? "Ungültige Stimmen"
            : wv.indexAkt === "s"
            ? "Stimmhöchste sonstige Partei"
            : auswahl[wv.indexAkt]) + " in Prozent") +
        (wahl.status === 5 || wahl.stand === ""
          ? ""
          : "<br>Stand: " + wahl.stand)
    );
  } else {
    var html =
        '<div id="karten-wahl"><div id="karten-beschreibung-wahl" class="beschreibung">' +
        "Bewegen Sie die Maus über die Karte, um Informationen über die gewünschte Gemeinde zu erhalten.<br>" +
        "Ein Klick öffnet das Wahlergebnis dieser Gemeinde." +
        '</div><div id="karten-menue-wahl" class="menue-wahl">' +
        '<input type="radio" name="vergleich" value="0"' +
        (wv.radio1 == 0 ? ' checked="checked"' : "") +
        "> Anteile<br>" +
        (istBPW_Wdh
          ? '<input type="radio" name="vergleich" value="1"' +
            (wv.radio1 == 1 ? ' checked="checked"' : "") +
            "> Differenzen zum annullierten 2. Wahlgang<br>" +
            '<input type="radio" name="vergleich" value="2"' +
            (wv.radio1 == 2 ? ' checked="checked"' : "") +
            "> Differenzen zum ersten Wahlgang"
          : '<input type="radio" name="vergleich" value="1"' +
            (wv.radio1 == 1 ? ' checked="checked"' : "") +
            "> Differenzen zu" +
            (wahlgang !== undefined && wahlgang === 2
              ? "m ersten Wahlgang"
              : "r Vorwahl")) +
        "<br>" +
        '<input type="radio" name="vergleich" value="3"' +
        (wv.radio1 == 3 ? ' checked="checked"' : "") +
        "> Differenzen zwischen " +
        (wahltypID === 0 || wahltypID === 5 ? "Wahlwerbenden" : "Parteien") +
        "<br><br>" +
        (istBPW_Wdh ? "" : "<span>Auswertung:</span><br>"),
      i,
      j,
      regionID,
      anz_Gemeindekandidaturen,
      indexNein = -1,
      auswahl =
        wahl.parteien[
          findeRegionsindex(wahl.parteien, startRegionID, true)
        ].akt[0].slice(),
      anz_Parteien = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      platz = [
        "erst",
        "zweit",
        "dritt",
        "viert",
        "fünft",
        "sechst",
        "siebt",
        "acht",
        "neunt",
        "zehnt",
      ],
      ordinal = [
        "Höchster",
        "Zweithöchster",
        "Dritthöchster",
        "Vierthöchster",
        "Fünfthöchster",
        "Sechsthöchster",
        "Siebthöchster",
        "Achthöchster",
        "Neunthöchster",
        "Zehnthöchster",
      ];

    for (i = 0, l = wahl.stimmen.length; i < l; i++) {
      regionID = wahl.stimmen[i].region_id;
      anz_Gemeindekandidaturen = 0;
      for (j = 0, k = auswahl.length; j < k; j++) {
        if (
          regionen[regionID].typID === 4 &&
          j <
            wahl.parteien[findeRegionsindex(wahl.parteien, regionID, true)]
              .akt[0].length &&
          wahl.parteien[findeRegionsindex(wahl.parteien, regionID, true)]
            .akt[0][j] !== ""
        )
          anz_Gemeindekandidaturen++;
      }
      anz_Parteien[Math.min(anz_Gemeindekandidaturen - 1, 9)]++;
    }
    while (anz_Parteien.pop() < 2) {}

    for (i = 0, l = auswahl.length; i < l; i++) {
      anz_Gemeindekandidaturen = 0;
      for (j = 0, k = wahl.stimmen.length; j < k; j++) {
        regionID = wahl.stimmen[j].region_id;
        if (
          regionen[regionID].typID === 4 &&
          i <
            wahl.parteien[findeRegionsindex(wahl.parteien, regionID, true)]
              .akt[0].length &&
          wahl.parteien[findeRegionsindex(wahl.parteien, regionID, true)]
            .akt[0][i] !== ""
        )
          anz_Gemeindekandidaturen++;
      }
      if (anz_Gemeindekandidaturen < 2 || auswahl[i].indexOf("Sonstige") === 0)
        auswahl[i] = "";
    }
    if (wv.radio1 == 3) {
      html += '<select id="karten-parteiauswahl1-wahl">';
      for (i = 1; i <= Math.min(10, anz_Parteien.length + 1); i++)
        html +=
          '<option value="a' +
          i +
          '"' +
          (wv.indexAkt === "a" + i ? ' selected="selected"' : "") +
          ">" +
          platz[i - 1].substr(0, 1).toUpperCase() +
          platz[i - 1].substr(1) +
          "er Platz</option>";
      for (i = 0, l = auswahl.length; i < l; i++) {
        if (auswahl[i] === "Nein-Stimmen") indexNein = i;
        else if (auswahl[i] !== "")
          html +=
            '<option value="' +
            i +
            '"' +
            (wv.indexAkt == i ? ' selected="selected"' : "") +
            ">" +
            kuerzeKandidatenname(auswahl[i], 2) +
            "</option>";
      }
      if (wahltypID >= 4)
        html +=
          '<option value="s"' +
          (wv.indexAkt === "s" ? ' selected="selected"' : "") +
          ">Sonstige</option>";
      if (indexNein > -1)
        html +=
          '<option value="' +
          indexNein +
          '"' +
          (wv.indexAkt == indexNein ? ' selected="selected"' : "") +
          ">" +
          auswahl[indexNein] +
          "</option>";

      html += '</select> zu <select id="karten-parteiauswahl2-wahl">';
      for (i = 1; i <= Math.min(10, anz_Parteien.length + 1); i++)
        if (wv.indexAkt !== "a" + i)
          html +=
            '<option value="a' +
            i +
            '"' +
            (wv.indexVgl === "a" + i ? ' selected="selected"' : "") +
            ">" +
            platz[i - 1] +
            "er Platz</option>";
      for (i = 0, l = auswahl.length; i < l; i++) {
        if (auswahl[i] === "Nein-Stimmen") indexNein = i;
        else if (auswahl[i] !== "" && wv.indexAkt != i)
          html +=
            '<option value="' +
            i +
            '"' +
            (wv.indexVgl == i ? ' selected="selected"' : "") +
            ">" +
            kuerzeKandidatenname(auswahl[i], 2) +
            "</option>";
      }
      /*if (wahltypID>=4 && wv.indexAkt!='s')
     html+='<option value="s"'+(wv.indexVgl=='s'?' selected="selected"':'')+'>Sonstige</option>';
     if (indexNein>-1 && wv.indexAkt!=indexNein)
     html+='<option value="'+indexNein+'"'+(wv.indexVgl==indexNein?' selected="selected"':'')+'>'+
     auswahl[indexNein]+'</option>';*/
    } else {
      html += "<select>";
      if (wahltypID === 5 && wv.radio1 == 0)
        html +=
          '<option value="a0"' +
          (wv.indexAkt === "a0" ? ' selected="selected"' : "") +
          ">Bürgermeisterpartei</option>";
      for (i = 1; i <= Math.min(10, anz_Parteien.length + 1); i++)
        html +=
          '<option value="a' +
          i +
          '"' +
          (wv.indexAkt === "a" + i ? ' selected="selected"' : "") +
          ">" +
          (istBPW_Wdh && wv.radio1 == 1
            ? " Stimmanteils" + (i === 1 ? "gewinn" : "verlust")
            : ordinal[i - 1] +
              " Stimmanteil" +
              (wv.radio1 == 0 ? "" : "sgewinn")) +
          "</option>";
      for (i = 0, l = auswahl.length; i < l; i++) {
        if (auswahl[i] === "Nein-Stimmen") indexNein = i;
        else if (auswahl[i] !== "")
          html +=
            '<option value="' +
            i +
            '"' +
            (wv.indexAkt == i ? ' selected="selected"' : "") +
            ">" +
            auswahl[i] +
            "</option>";
      }
      if (wahltypID >= 4)
        html +=
          '<option value="s"' +
          (wv.indexAkt === "s" ? ' selected="selected"' : "") +
          ">Sonstige</option>";
      if (indexNein > -1)
        html +=
          '<option value="' +
          indexNein +
          '"' +
          (wv.indexAkt == indexNein ? ' selected="selected"' : "") +
          ">" +
          auswahl[indexNein] +
          "</option>";
      html +=
        '<option value="b"' +
        (wv.indexAkt === "b" ? ' selected="selected"' : "") +
        ">Wahlbeteiligung</option>" +
        '<option value="c"' +
        (wv.indexAkt === "c" ? ' selected="selected"' : "") +
        ">Ungültige Stimmen</option>" +
        (wv.radio1 == 0
          ? '<option value="d"' +
            (wv.indexAkt === "d" ? ' selected="selected"' : "") +
            ">Ausgestellte Wahlkarten</option>"
          : "");
    }
    html +=
      "</select></div>" +
      '<div id="karten-text-wahl"></div>' +
      '<div id="karten-legende-wahl">' +
      '<table><tr><th colspan="2"></th></tr>' +
      '<tr><td id="karten-legendenbalken-wahl" rowspan="3"></td>' +
      '<td id="legende-maxwert"></td></tr>' +
      '<tr><td id="legende-nullwert"></td></tr>' +
      '<tr><td id="legende-minwert"></td></tr></table></div>' +
      '<div id="karten-parteienlegende-wahl"></div>' +
      '<div id="karten-grafik-wahl">' +
      '<img src="../ltw/tools/salzburgkarte.gif" width="727" height="610" usemap="#salzburgkarte"><map name="salzburgkarte">';
    for (i = 0, l = koordinaten.length; i < l; i++)
      html +=
        '<area id="g' +
        koordinaten[i].ID +
        '" href="javascript:void(0);" shape="poly" coords="' +
        koordinaten[i].coords +
        '">';
    html += "</map></div></div>";
    $j("#inhalt-wahl").html(html);

    $j("#ueberschrift-wahl>h3").html(
      (wahltypID === 5 && wv.indexAkt === "a0"
        ? "Bürgermeisterpartei"
        : (wv.radio1 == 0 && wv.indexAkt === "d"
            ? "Anteil ausgestellter Wahlkarten an den Wahlberechtigten"
            : wv.radio1 == 0 && wv.indexAkt.substr(0, 1) === "a"
            ? ordinal[wv.indexAkt.substr(1) - 1] + " Stimmanteil"
            : wv.radio1 == 0 && wv.indexAkt === "b"
            ? "Wahlbeteiligung"
            : wv.radio1 == 3
            ? "Differenz zwischen " +
              (wv.indexAkt === "s"
                ? "stimmhöchster sonstigen Partei"
                : wv.indexAkt.substr(0, 1) === "a"
                ? platz[wv.indexAkt.substr(1) - 1] +
                  "em" +
                  (wv.indexVgl.substr(0, 1) === "a" ? "" : " Platz")
                : kuerzeKandidatenname(auswahl[wv.indexAkt], 1)) +
              " und " +
              (wv.indexVgl === "s"
                ? "stimmhöchster sonstigen Partei"
                : wv.indexVgl.substr(0, 1) === "a"
                ? platz[wv.indexVgl.substr(1) - 1] + "em Platz"
                : kuerzeKandidatenname(auswahl[wv.indexVgl], 1))
            : wv.radio1 == 1 && wv.indexAkt.substr(0, 1) === "a" && istBPW_Wdh
            ? "Stimmanteils" +
              (wv.indexAkt.substr(1) == 1 ? "gewinn" : "verlust") +
              " zum annullierten zweiten Wahlgang"
            : (wv.radio1 == 1 || wv.radio1 == 2) &&
              wv.indexAkt.substr(0, 1) === "a"
            ? ordinal[wv.indexAkt.substr(1) - 1] +
              " Stimmanteilsgewinn zu" +
              (wahlgang === 2 ? "m ersten Wahlgang" : "r Vorwahl")
            : (wv.radio1 == 1 || wv.radio1 == 2) && wv.indexAkt === "b"
            ? "Differenz der Wahlbeteiligung zu" +
              (wv.radio1 == 1 && istBPW_Wdh
                ? "m annullierten zweiten Wahlgang"
                : wahlgang === 2
                ? "m ersten Wahlgang"
                : "r Vorwahl")
            : (wv.indexAkt === "c"
                ? "Ungültige Stimmen"
                : wv.indexAkt === "s"
                ? "Stimmhöchste sonstige Partei"
                : auswahl[wv.indexAkt]) +
              ", " +
              (wv.radio1 == 0
                ? "Anteil"
                : "Anteilsdifferenz zu" +
                  (wv.radio1 == 1 && istBPW_Wdh
                    ? "m annullierten zweiten Wahlgang"
                    : wahlgang === 2
                    ? "m ersten Wahlgang"
                    : "r Vorwahl"))) +
          (wv.radio1 == 0 ? " in Prozent" : " in Prozentpunkten")) +
        (wahl.status === 5 || wahl.stand === ""
          ? ""
          : "<br>Stand: " + wahl.stand)
    );
  }
}

function fuelleKarte(wahl) {
  
  if (wahltypID === 6) {

    var a,
      b,
      erstelleZeichnung,
      erstellePolygon,
      saeubereZeichnung,
      leseKoordinaten,
      erlaubtCanvas = !!document.createElement("canvas").getContext;
    if (!erlaubtCanvas) {
      a = document.createElement("div");
      a.innerHTML = '<v:shape id="vml_flag1" adj="1" />';
      b = a.firstChild;
      b.style.behavior = "url(#default#VML)";
      if (b && typeof b.adj !== "object") {
        alert(
          "Um das Kartogramm zu befüllen, aktualisieren Sie bitte Ihren Browser auf eine neuere Version."
        );
        return; // stoppen, falls Browser weder Canvas noch VML kann
      }
    }
    if (erlaubtCanvas) {
      erstelleZeichnung = function (img) {
        var c = $j(
          '<canvas style="width:' +
            img.width +
            "px;height:" +
            img.height +
            'px;"></canvas>'
        ).get(0);
        c.getContext("2d").clearRect(0, 0, c.width, c.height);
        return c;
      };
      erstellePolygon = function (
        canvas,
        farbe,
        farbdeckkraft,
        rahmen,
        coords,
        name
      ) {
        var i,
          context = canvas.getContext("2d");
        context.save();
        context.beginPath();
        context.moveTo(coords[0], coords[1]);
        for (i = 2; i < coords.length; i += 2)
          context.lineTo(coords[i], coords[i + 1]);
        context.closePath();
        if (farbe.length) {
          context.fillStyle =
            "rgba(" +
            parseInt(farbe.substr(0, 2), 16) +
            "," +
            parseInt(farbe.substr(2, 2), 16) +
            "," +
            parseInt(farbe.substr(4, 2), 16) +
            "," +
            farbdeckkraft +
            ")";
          context.fill();
        }
        if (rahmen) {
          context.strokeStyle = "rgb(0,0,0)";
          context.lineWidth = rahmen;
          context.stroke();
        }
        context.restore();
      };
      saeubereZeichnung = function (canvas) {
        canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
      };
    } else {
      // IE<=8
      erstelleZeichnung = function (img) {
        return $j(
          '<var style="zoom:1;overflow:hidden;display:block;width:' +
            img.width +
            "px;height:" +
            img.height +
            'px;"></var>'
        ).get(0);
      };
      erstellePolygon = function (
        canvas,
        farbe,
        farbdeckkraft,
        rahmen,
        coords,
        name
      ) {
        var e = $j(
          '<v:shape name="' +
            name +
            '" filled="' +
            (rahmen ? "f" : "t") +
            '" ' +
            (rahmen
              ? 'strokeweight="' +
                rahmen +
                '" stroked="t" strokecolor="#000000"'
              : 'stroked="f"') +
            ' coordorigin="0,0" coordsize="' +
            canvas.width +
            "," +
            canvas.height +
            '" path="m ' +
            coords[0] +
            "," +
            coords[1] +
            " l " +
            coords.join(",") +
            ' x e" style="zoom:1;margin:0;padding:0;display:block;position:absolute;top:0px;left:0px;width:' +
            canvas.width +
            "px;height:" +
            canvas.height +
            'px;"></v:shape>'
        );
        e.get(0).innerHTML = farbe.length
          ? '<v:fill color="#' + farbe + '" opacity="' + farbdeckkraft + '" />'
          : "";
        $j(canvas).append(e);
      };
      saeubereZeichnung = function (canvas) {
        $j(canvas).find("[name=markiert]").remove();
      };
    }
    leseKoordinaten = function (area) {
      var i,
        coords = area.getAttribute("coords").split(",");
      for (i = 0; i < coords.length; i++) coords[i] = parseFloat(coords[i]);
      return coords;
    };
    if (!erlaubtCanvas) {
      document.namespaces.add("v", "urn:schemas-microsoft-com:vml");
      var style = document.createStyleSheet();
      var shapes = ["shape", "fill", "stroke"];
      $j.each(shapes, function () {
        style.addRule(
          "v\\:" + this,
          "behavior: url(#default#VML); antialias:true"
        );
      });
    }

    // Befüllung
    var i,
      j,
      k,
      l,
      m,
      wg,
      canvas,
      canvas2,
      regionID,
      region,
      html = "",
      zeile,
      parteiliste = [],
      parteiliste_vgl = [],
      daten = [],
      daten_vz = [],
      indexWG,
      indexOrd = [],
      index_max_sonst = [],
      wert,
      werte = [],
      gleicherPlatz = [],
      anzGleicherPlatz = 0,
      index_sonst1 = -1,
      anzSonstige = 0,
      istSonstige = [],
      gibtSonstigegleicherPlatz = false,
      parteiindex = -1,
      parteifarbe = [],
      farbe,
      farbwerte = [],
      minFarbwert = 100,
      maxFarbwert = -100,
      farbe_meta = "770066",
      farbe_gewinn = "004400",
      farbe_verlust = "AA0000",
      deckkraft,
      minDeckkraft = 0.25,
      maxDeckkraft = 0.8,
      maxObergrenze = wv.indexAkt == "b" ? 100 : 80,
      minUntergrenze = -maxObergrenze,
      einheit = wv.radio1 == 0 ? "&nbsp;%" : "&nbsp;PP",
      $img = $j("#karten-grafik-wahl img"),
      img = $img.get(0),
      $map = $j("#karten-grafik-wahl map"),
      $legendenbalken = $j("#karten-legendenbalken-wahl"),
      legendenbreite = 25,
      legendenhoehe = 120, //160
      legendenfarbe,
      anz_gemeindeergebnisse = [],
      anz_staerkste = 1;
    parteiliste[startRegionID] = [];

	parteiliste[startRegionID][0] =
      wahl.parteien[
        findeRegionsindex(wahl.parteien, startRegionID, true)
      ].akt[0];
    if (
      wahl.parteien[findeRegionsindex(wahl.parteien, startRegionID, true)].akt
        .length === 2
    )
      parteiliste[startRegionID][1] =
        wahl.parteien[
          findeRegionsindex(wahl.parteien, startRegionID, true)
        ].akt[1];

	istSonstige = false;
	
    for (i = 0; i < parteiliste[startRegionID][0].length; i++) {
      
      if (wahltypID !== 0 || parteiindex === findeParteiindex("Sonstige"))
        parteiindex = findeParteiindex(parteiliste[startRegionID][0][i]);
      parteifarbe[i] = ermittleParteifarbe(parteien[parteiindex]);
      if (istSonstige[i] && index_sonst1 < 0) index_sonst1 = i;
      anz_gemeindeergebnisse[i] = 0;
    }
    for (i = 0, l = wahl.stimmen.length; i < l; i++) {
      region = wahl.stimmen[i];
      if (regionen[region.region_id].typID < 4) continue;
      parteiliste[region.region_id] = [];
      parteiliste[region.region_id][0] =
        wahl.parteien[
          findeRegionsindex(wahl.parteien, region.region_id, true)
        ].akt[0];
      if (
        wahl.parteien[findeRegionsindex(wahl.parteien, region.region_id, true)]
          .akt.length === 2
      )
        parteiliste[region.region_id][1] =
          wahl.parteien[
            findeRegionsindex(wahl.parteien, region.region_id, true)
          ].akt[1];

      // Gemeindeergebnisse zählen
      for (j = 0; j < parteiliste[region.region_id][0].length; j++)
        if (
          parteiliste[region.region_id][0][j] !== "" &&
          region.daten_akt[0][2] != null
        )
          anz_gemeindeergebnisse[j]++;


      // Stimmanteile laden
      daten[region.region_id] = [];
      for (wg = 0; wg < parteiliste[region.region_id].length; wg++) {
        daten[region.region_id][wg] = [];
        for (j = 0; j < parteiliste[startRegionID][wg].length; j++) {
          daten[region.region_id][wg][j] =
            j >= parteiliste[region.region_id][wg].length ||
            region.daten_akt[wg][4] === 0 || region.daten_akt[wg][4] === null ||
            (wv.indexAkt == j &&
              parteiliste[region.region_id][wg][wv.indexAkt] === "")
              ? ""
              : region.pdaten_akt[wg][j] / region.daten_akt[wg][4];
        }
      }

      
      // X-höchster Stimmanteil bzw. Stimmanteilsgewinn finden und Anzahl auf Platz X zählen
      indexWG =
        wv.indexAkt === "a0" ? parteiliste[region.region_id].length - 1 : 0; // Zeiger für Bürgermeisterpartei
      werte = [];
      for (j = 0; j < parteiliste[region.region_id][0].length; j++)
        if (
          parteiliste[region.region_id][0][j] !== "" &&
          daten[region.region_id][indexWG][j] !== ""
        )
          werte[j] = [daten[region.region_id][indexWG][j], j];
        else if (parteiliste[region.region_id][0][j] !== "") werte[j] = [-1, j];
      // werte.sort(function (left, right) {
      // return left[0] > right[0] ? -1 : 1;
      // });  //Diese Sortierung hat 'undefined' nach vorne geordnet im Firefox. Probleme bei BGM-Wahl. Durch folgende zeilen ersetzt.
      werte.sort(function (left, right) {
        if (left[0] > right[0]) {
          return -1;
        }
        if (left[0] < right[0]) {
          return 1;
        } else {
          return 0;
        }
      });
      indexOrd[region.region_id] = [];
      if (wahltypID === 5) indexOrd[region.region_id]["a0"] = werte[0][1];
      for (j = 0; j < werte.length; j++)
        if (werte[j] != null)
          indexOrd[region.region_id]["a" + (j + 1)] = werte[j][1];
      /*if (wv.indexAkt.substr(1)-1<werte.length)
     indexOrd[region.region_id][wv.indexAkt]=werte[Math.max(0,wv.indexAkt.substr(1)-1)][1];
     else indexOrd[region.region_id][wv.indexAkt]=-1;*/
      if (
        indexOrd[region.region_id][wv.indexAkt] > -1 &&
        daten[region.region_id][indexWG][
          indexOrd[region.region_id][wv.indexAkt]
        ] !== ""
      ) {
        if (gleicherPlatz[indexOrd[region.region_id][wv.indexAkt]] == null) {
          gleicherPlatz[indexOrd[region.region_id][wv.indexAkt]] = 1;
          anzGleicherPlatz++;
        } else gleicherPlatz[indexOrd[region.region_id][wv.indexAkt]]++;
      }
      
      // Sonstige Partei mit höchsten Stimmanteil bzw. höchsten Stimmanteilsgewinn finden
      index_max_sonst[region.region_id] = -1;
      wert = -1;
      for (k = 0; k < parteiliste[region.region_id][0].length; k++) {
        if (
          istSonstige[k] &&
          daten[region.region_id][0][k] != "" &&
          wert < daten[region.region_id][0][k]
        ) {
          wert = daten[region.region_id][0][k];
          index_max_sonst[region.region_id] = k;
        }
      }
      // Höchsten Stimmanteil, Wahlbeteiligung, ungültige Stimmen und Anteil ausgest. Wahlkarten ergänzen
      daten_vz[region.region_id] = [];
      if (wv.indexAkt.substr(0, 1) === "a")
        daten[region.region_id][0][wv.indexAkt] =
          indexOrd[region.region_id][wv.indexAkt] > -1
            ? daten[region.region_id][0][
                indexOrd[region.region_id][wv.indexAkt]
              ]
            : "";
      for (wg = 0; wg < parteiliste[region.region_id].length; wg++) {
        daten[region.region_id][wg]["b"] =
          region.daten_akt[wg][2] == null
            ? ""
            : region.daten_akt[wg][2] / region.daten_akt[wg][0];
        daten[region.region_id][wg]["c"] =
          region.daten_akt[wg][2] == null
            ? ""
            : region.daten_akt[wg][3] / region.daten_akt[wg][2];
        daten[region.region_id][wg]["d"] =
          wg < region.wk.length ? region.wk[wg] / region.daten_akt[wg][0] : "";
        daten[region.region_id][wg]["s"] =
          index_max_sonst[region.region_id] === -1
            ? ""
            : daten[region.region_id][wg][index_max_sonst[region.region_id]];
      }

      // Farbwerte sowie größten und kleinsten Wert bestimmen
      farbwerte[region.region_id] =
        daten[region.region_id][0][wv.indexAkt] !== "" &&
        (wv.indexAkt.substr(0, 1) !== "a" ||
          parteiliste[region.region_id][0][
            indexOrd[region.region_id][wv.indexAkt]
          ] !== "")
          ? Math.round(daten[region.region_id][0][wv.indexAkt] * 1000) / 10
          : "";
      if (
        farbwerte[region.region_id] !== "" &&
        farbwerte[region.region_id] < minFarbwert
      )
        minFarbwert = Math.max(minUntergrenze, farbwerte[region.region_id]);
      if (
        farbwerte[region.region_id] !== "" &&
        farbwerte[region.region_id] > maxFarbwert
      )
        maxFarbwert = Math.min(maxObergrenze, farbwerte[region.region_id]);
		

    }

    // Falls stimmenstärkste sonstige Partei an mehreren Positionen vorkommt, nur einmal zählen
    for (i = 0; i < gleicherPlatz.length; i++) {
      if (wahltypID >= 4 && istSonstige[i] && gleicherPlatz[i] != null) {
        if (gibtSonstigegleicherPlatz) {
          gleicherPlatz[i] = null;
          anzGleicherPlatz--;
        } else gibtSonstigegleicherPlatz = true;
      }
    }

    // Legendenbalken erstellen
    if (
      (isNaN(wv.indexAkt)
        ? Array.max(anz_gemeindeergebnisse) > 0
        : anz_gemeindeergebnisse[wv.indexAkt] > 0) &&
      wv.indexAkt !== "a0" &&
      minFarbwert < maxFarbwert &&
      (minFarbwert !== 0 || maxFarbwert !== 0)
    ) {
      $j("#karten-legende-wahl th").html("Legende:");
      $legendenbalken.css({
        width: legendenbreite + "px",
        height: legendenhoehe + "px",
        border: "1px solid",
      });
      if (wv.indexAkt.substr(0, 1) === "a" && wv.radio1 != 3) {
        $legendenbalken.html(Array(anzGleicherPlatz + 1).join("<div></div>"));
        for (i = 0; i < gleicherPlatz.length; i++) {
          if (gleicherPlatz[i] != null) {
            legendenfarbe = parteifarbe[i];
            if (minFarbwert < 0 && maxFarbwert <= 0) {
              fuelleLegendenbalkenteil(
                anz_staerkste,
                erlaubtCanvas,
                reduziereDeckkraft(legendenfarbe, minDeckkraft),
                reduziereDeckkraft(legendenfarbe, maxDeckkraft)
              );
            } else {
              fuelleLegendenbalkenteil(
                anz_staerkste,
                erlaubtCanvas,
                reduziereDeckkraft(legendenfarbe, maxDeckkraft),
                reduziereDeckkraft(legendenfarbe, minDeckkraft)
              );
            }
            anz_staerkste++;
          }
        }
        $legendenbalken.css({
          width:
            Math.round(legendenbreite / anzGleicherPlatz) * anzGleicherPlatz +
            "px",
        });
        $j("div", $legendenbalken).css({
          width: Math.round(legendenbreite / anzGleicherPlatz) + "px",
          height: legendenhoehe + "px",
        });
      } else if (wv.radio1 == 0 || (minFarbwert >= 0 && maxFarbwert >= 0)) {
        $legendenbalken.html("<div></div>");
        if (wv.radio1 > 0)
          legendenfarbe =
            minFarbwert >= 0
              ? farbe_gewinn
              : maxFarbwert <= 0
              ? farbe_verlust
              : "";
        else if (wv.indexAkt === "s") legendenfarbe = parteifarbe[index_sonst1];
        else
          legendenfarbe = isNaN(wv.indexAkt)
            ? farbe_meta
            : parteifarbe[wv.indexAkt];
        fuelleLegendenbalkenteil(
          1,
          erlaubtCanvas,
          reduziereDeckkraft(legendenfarbe, maxDeckkraft),
          reduziereDeckkraft(legendenfarbe, minDeckkraft)
        );
        $j("div", $legendenbalken).css({
          width: legendenbreite + "px",
          height: legendenhoehe + "px",
        });
      } else if (minFarbwert <= 0 && maxFarbwert <= 0) {
        $legendenbalken.html("<div></div>");
        legendenfarbe =
          wv.radio1 == 0
            ? isNaN(wv.indexAkt)
              ? farbe_meta
              : parteifarbe[wv.indexAkt]
            : minFarbwert >= 0
            ? farbe_gewinn
            : maxFarbwert <= 0
            ? farbe_verlust
            : "";
        fuelleLegendenbalkenteil(
          1,
          erlaubtCanvas,
          reduziereDeckkraft(legendenfarbe, minDeckkraft),
          reduziereDeckkraft(legendenfarbe, maxDeckkraft)
        );
        $j("div", $legendenbalken).css({
          width: legendenbreite + "px",
          height: legendenhoehe + "px",
        });
      } else {
        $legendenbalken.html("<div></div><div></div>");
        fuelleLegendenbalkenteil(
          1,
          erlaubtCanvas,
          reduziereDeckkraft(
            farbe_gewinn,
            (maxFarbwert / Math.max(maxFarbwert, -minFarbwert)) *
              (maxDeckkraft - minDeckkraft) +
              minDeckkraft
          ),
          reduziereDeckkraft(farbe_gewinn, minDeckkraft)
        );
        fuelleLegendenbalkenteil(
          2,
          erlaubtCanvas,
          reduziereDeckkraft(farbe_verlust, minDeckkraft),
          reduziereDeckkraft(
            farbe_verlust,
            (-minFarbwert / Math.max(maxFarbwert, -minFarbwert)) *
              (maxDeckkraft - minDeckkraft) +
              minDeckkraft
          )
        );
        $j("#legende-nullwert").html("&#177; 0,0 PP");
        $j("div:nth-child(1)", $legendenbalken).css({
          width: legendenbreite + "px",
          height: legendenhoehe / 2 + "px",
        });
        $j("div:nth-child(2)", $legendenbalken).css({
          width: legendenbreite + "px",
          height: legendenhoehe / 2 + "px",
        });
      }
      if (maxFarbwert >= minFarbwert) {
        $j("#legende-maxwert").html(
          (wv.radio1 == 0 ? "" : ermittleVorzeichen(maxFarbwert)) +
            formatiereZahl(runden(maxFarbwert, 1)) +
            einheit +
            (maxFarbwert === maxObergrenze ? " und mehr" : "")
        );
        $j("#legende-minwert").html(
          minFarbwert === maxFarbwert
            ? "&nbsp;"
            : (wv.radio1 == 0 ? "" : ermittleVorzeichen(minFarbwert)) +
                formatiereZahl(runden(minFarbwert, 1)) +
                einheit +
                (minFarbwert === minUntergrenze ? " und mehr" : "")
        );
      }
    }
    // Parteienlegende

    if (
      wv.indexAkt.substr(0, 1) === "a" &&
      wv.radio1 != 3 &&
      Array.max(anz_gemeindeergebnisse) > 0
    ) {
      for (i = 0; i < gleicherPlatz.length; i++) {
        if (gleicherPlatz[i] != null) {
          html +=
            '<tr><td style="background:#' +
            reduziereDeckkraft(parteifarbe[i], maxDeckkraft) +
            "; border-color:#" +
            reduziereDeckkraft(parteifarbe[i], maxDeckkraft) +
            ';">&nbsp;</td><td>' +
            (parteiliste[startRegionID][0][i].indexOf("Sonstige") > -1
              ? "Sonstige"
              : kuerzeKandidatenname(
                  parteiliste[startRegionID][0][i],
                  wahltypID === 0 ? 3 : 0
                )) +
            "</td></tr>";
        }
      }
	  
      //Ergänze bei VBF den Gleichstand in der Legende.
	  function enthaeltGleichstand(object) {
		return object.some(obj => { 
		return obj && (obj[0].a1 === 0.5 || obj[0].a2 === 0.5)
		});
	  }
      if (
        (wahltypID === 6 & enthaeltGleichstand(daten))
      ) {
        html +=
          '<tr><td style="background:#968C55"></td><td>Gleichstand</td></tr>';
      }
	  html += '<tr><td style="background:#BBBBBB"></td><td>nicht beteiligt</td></tr>';

      $j("#karten-parteienlegende-wahl").html(html);
    }



    if (!erlaubtCanvas) {
      $img.css("filter", "Alpha(opacity=0)");
    }
    canvas = erstelleZeichnung(img);
    $j(canvas).css({
      position: "absolute",
      left: 0,
      top: 0,
      padding: 0,
      border: 0,
    });
    canvas.height = img.height;
    canvas.width = img.width;
    if (erlaubtCanvas) {
      canvas2 = canvas.cloneNode(true);
      $img.before(canvas2);
    }
	

	
    $j("area[coords]", $map)
      .each(function () {
        regionID = +$j(this).attr("id").substr(1);
        $j(this).click(function () {
          loescheParameter();
          wv.inhalt = "erg";
          wv.regionID = regionID;
          wv.indexAkt = parteiliste[regionID].length === 2 ? 1 : 0;
          ergaenzeParameter();
          veraendereHash();
        });
        if (findeRegionsindex(wahl.stimmen, regionID, false) === -1){ 
			//return;
		  // Füge die graue Farbe für Bezirke hinzu, die nicht teilnehmen bei der volksbefragung	
		  if (erlaubtCanvas){			
			  erstellePolygon(
				canvas2,
				"BBBBBB",
				0.3,
				0,
				leseKoordinaten(this),
				""
			  );
			}else {
			  erstellePolygon(
				canvas,
				"BBBBBB",
				0.3,
				0,
				leseKoordinaten(this),
				""
			  );
			  $j(canvas).append("<v:shape></v:shape>");
			}
			return;
			}
			
		if (
          farbwerte[regionID] === undefined ||
          farbwerte[regionID] === "" ||
          (maxFarbwert === 0 && minFarbwert === 0) ||
          (wv.radio1 == 3 && farbwerte[regionID] == 0)
        )
          deckkraft = 0;
        else if (minFarbwert === maxFarbwert || wv.indexAkt === "a0")
          deckkraft = maxDeckkraft;
        else if (minFarbwert * maxFarbwert < 0)
          deckkraft = runden(
            (Math.abs(farbwerte[regionID]) /
              Math.max(Math.abs(maxFarbwert), Math.abs(minFarbwert))) *
              (maxDeckkraft - minDeckkraft) +
              minDeckkraft,
            2
          );
        else if (minFarbwert < 0 && maxFarbwert <= 0)
          deckkraft = runden(
            ((maxFarbwert - farbwerte[regionID]) /
              (maxFarbwert - minFarbwert)) *
              (maxDeckkraft - minDeckkraft) +
              minDeckkraft,
            2
          );
        else
          deckkraft = runden(
            ((farbwerte[regionID] - minFarbwert) /
              (maxFarbwert - minFarbwert)) *
              (maxDeckkraft - minDeckkraft) +
              minDeckkraft,
            2
          );
        // Farbe festlegen
        if (wv.indexAkt.substr(0, 1) === "a" && wv.radio1 != 3)
          if (
            indexOrd[regionID][wv.indexAkt] !== undefined &&
            indexOrd[regionID][wv.indexAkt] > -1
          ) {
            indexWG = parteiliste[regionID].length - 1;
            // Verwende bei Gleichstand eine andere Farbe (Volksbefragung)
			if (
              daten[regionID][indexWG][indexOrd[regionID][wv.indexAkt]] === 0.5
            ){
              farbe = "968C55";
			  deckkraft = 0.7;
            }else farbe = parteifarbe[indexOrd[regionID][wv.indexAkt]];
          }
          else farbe = "FFFFFF";
        else if (wv.radio1 > 0)
          farbe =
            daten[regionID][0][wv.indexAkt] === ""
              ? "FFFFFF"
              : daten[regionID][0][wv.indexAkt] >= 0 && maxFarbwert > 0
              ? farbe_gewinn
              : farbe_verlust;
        else if (wv.indexAkt === "s")
          farbe =
            daten[regionID][0][wv.indexAkt] === ""
              ? "FFFFFF"
              : parteifarbe[index_sonst1];
        else if (isNaN(wv.indexAkt)) farbe = farbe_meta;
        else farbe = parteifarbe[wv.indexAkt];
        // Gemeinden zeichnen		
        if (erlaubtCanvas){
			
			//if(deckkraft === 0) {farbe = "BBBBBB";  deckkraft = 0.3;}
			//console.log(regionID);
          erstellePolygon(
            canvas2,
            farbe,
            deckkraft,
            0,
            leseKoordinaten(this),
            ""
          );
        }else {
          erstellePolygon(
            canvas,
            farbe,
            deckkraft,
            0,
            leseKoordinaten(this),
            ""
          );
          $j(canvas).append("<v:shape></v:shape>");
        }
      })
      .bind("mouseover", function (e) {
        wg = 0;
        regionID = +$j(this).attr("id").substr(1);
        if (findeRegionsindex(wahl.stimmen, regionID, false) === -1) return;
        erstellePolygon(
          canvas,
          "",
          deckkraft,
          2,
          leseKoordinaten(this),
          "markiert"
        );
        if (!erlaubtCanvas) $j(canvas).append("<v:shape></v:shape>");
        anzSonstige = 0;
        for (i = 0; i < parteiliste[regionID][0].length; i++)
          if (parteiliste[regionID][0][i] !== "" && istSonstige[i])
            anzSonstige++;
        // Info-Kästchen erstellen
        html = "";
        for (wg = 0; wg < parteiliste[regionID].length; wg++) {
          html +=
            '<table class="wertetabelle"><colgroup><col><col width="5%"</colgroup>' +
            '<thead><tr><th colspan="2">' +
            regionen[$j(this).attr("id").substr(1)].bez +
            (parteiliste[regionID].length === 2
              ? "<br>" +
                (wg + 1) +
                ". Wahlgang" +
                (wv.radio1 == 1
                  ? " zu " + (wg === 0 ? "Vorwahl" : "1. Wahlgang")
                  : "")
              : "") +
            "</th></tr></thead><tbody>";
          if (daten[regionID][wg]["b"] === "") {
            html +=
              '<tr><td colspan="2" class="mitte">Noch kein Ergebnis eingelangt</td></tr>';
          } else if (
            !isNaN(wv.indexAkt) &&
            (wv.indexAkt >= parteiliste[regionID][0].length ||
              parteiliste[regionID][0][wv.indexAkt] === "")
          ) {
            if (parteiliste[startRegionID][wg][wv.indexAkt] === "Nein-Stimmen")
              html +=
                '<tr><td colspan="2" class="mitte">Es gab mehr als einen Kandidaten.</td></tr>';
            else
              html +=
                '<tr><td colspan="2" class="mitte">Partei hat hier nicht kandidiert.</td></tr>';
            break;
          } else if (wv.indexAkt === "s" && anzSonstige === 0) {
            html +=
              '<tr><td colspan="2" class="mitte">Es hat keine sonstige Partei kandidiert.</td></tr>';
            break;
          }  else {
            html +=
              "<tr" +
              (wv.indexAkt === "b" && wg === 0
                ? ' class="markiert fett"'
                : "") +
              '><td class="links">Beteiligung</td><td>' +
              (wv.radio1 == 1 || wv.radio1 == 2
                ? daten_vz[regionID][wg]["b"]
                : "") +
              formatiereZahl(runden(daten[regionID][wg]["b"] * 100, 1)) +
              (wv.radio1 == 3 ? "&nbsp;%" : einheit) +
              "</td></tr>" +
              '<tr class=" hinterlegt' +
              (wv.indexAkt === "c" && wg === 0 ? " markiert fett" : "") +
              '"><td class="links">ungültige Stimmen</td><td>' +
              (wv.radio1 == 1 || wv.radio1 == 2
                ? daten_vz[regionID][wg]["c"]
                : "") +
              formatiereZahl(runden(daten[regionID][wg]["c"] * 100, 1)) +
              (wv.radio1 == 3 ? "&nbsp;%" : einheit) +
              "</td></tr>";
            zeile = 0;

            

            for (i = 0; i < parteiliste[regionID][wg].length; i++)
              if (parteiliste[regionID][wg][i] !== "") {
                html +=
                  '<tr class="' +
                  (zeile === 0
                    ? " h-linie"
                    : zeile % 2 === 1
                    ? " hinterlegt"
                    : "") +
                  ((wv.indexAkt === "a0" && daten[regionID][wg][i] > 0.5) ||
                  (wv.indexAkt !== "a0" &&
                    wg === 0 &&
                    ((wv.indexAkt.substr(0, 1) === "a" &&
                      i === indexOrd[regionID][wv.indexAkt]) && daten[regionID][wg][i] !== 0.5 ||
                      (wv.indexAkt === "s" &&
                        i === index_max_sonst[regionID]) ||
                      (wv.indexAkt >= 0 && i == wv.indexAkt)))
                    ? " markiert fett"
                    : "") +
                  '"><td class="links">' +
                  (wahltypID === 0
                    ? kuerzeKandidatenname(parteiliste[regionID][wg][i], 2)
                    : parteiliste[regionID][wg][i]) +
                  "</td><td>" +
                  ((wv.radio1 == 0 ? "" : daten_vz[regionID][wg][i]) +
                      formatiereZahl(runden(daten[regionID][wg][i] * 100, 1)) +
                      einheit) +
                  "</td></tr>";
                zeile++;
              }
          }
          html +=
            wv.radio1 != 1 && wv.radio1 != 2 && daten[regionID][wg]["d"] !== ""
              ? '<tr class="h-linie' +
                (wv.indexAkt === "d" && wg === 0 ? " markiert fett" : "") +
                '"><td class="links">ausgestellte Stimmkarten</td><td>' +
                formatiereZahl(runden(daten[regionID][wg]["d"] * 100, 1)) +
                "&nbsp;%</td></tr>"
              : "";
          html += "</tbody></table><br>";
        }
        indexWG = parteiliste[regionID].length - 1;
        if (
          wahltypID === 5 &&
          wv.indexAkt === "a0" &&
          daten[regionID][indexWG]["b"] !== "" &&
          indexOrd[regionID][wv.indexAkt] > -1 &&
          indexWG === wahl.wahl_akt.id.length - 1 &&
          daten[regionID][indexWG][indexOrd[regionID][wv.indexAkt]] <= 0.5
        )
          html +=
            '<div class="beschreibung">Entscheidung im ' +
            (indexWG + 2) +
            ". Wahlgang</div>";
        if (
          indexWG > 0 &&
          wv.indexAkt !== "a0" &&
          daten[regionID][0][wv.indexAkt] !== "" &&
          daten[regionID][1][wv.indexAkt] !== ""
        )
          html +=
            '<div class="beschreibung">Es wird der Wert des<br>1. Wahlgangs dargestellt.</div>';
        if (wv.indexAkt === "s" && anzSonstige > 1)
          html +=
            '<div class="beschreibung">Es wird die sonstige Partei mit dem höchsten Stimmanteil' +
            (wv.radio1 == 1 || wv.radio1 == 2
              ? "sgewinn bzw. niedrigsten Stimmanteilsverlust"
              : "") +
            " dargestellt.</div>";
        if (
          wv.indexAkt.substr(0, 1) === "a" &&
          (wv.radio1 == 1 || wv.radio1 == 2) &&
          indexOrd[regionID][wv.indexAkt] === -1 &&
          daten[regionID][0]["b"] !== ""
        )
          html +=
            '<div class="beschreibung">Es werden nur Gemeinden mit<br>mehreren Kandidaten eingefärbt.</div>';
        $j("#karten-text-wahl").html(html);
      })
      .bind("mouseout", function (e) {
        saeubereZeichnung(canvas);
        $j("#karten-text-wahl").html("");
      });
    $img.before(canvas);
  } else {
	// alle Wahlen 
    //-------------------------------------------------------------------------------------------------------
    var a,
      b,
      erstelleZeichnung,
      erstellePolygon,
      saeubereZeichnung,
      leseKoordinaten,
      erlaubtCanvas = !!document.createElement("canvas").getContext;
    if (!erlaubtCanvas) {
      a = document.createElement("div");
      a.innerHTML = '<v:shape id="vml_flag1" adj="1" />';
      b = a.firstChild;
      b.style.behavior = "url(#default#VML)";
      if (b && typeof b.adj !== "object") {
        alert(
          "Um das Kartogramm zu befüllen, aktualisieren Sie bitte Ihren Browser auf eine neuere Version."
        );
        return; // stoppen, falls Browser weder Canvas noch VML kann
      }
    }
    if (erlaubtCanvas) {
      erstelleZeichnung = function (img) {
        var c = $j(
          '<canvas style="width:' +
            img.width +
            "px;height:" +
            img.height +
            'px;"></canvas>'
        ).get(0);
        c.getContext("2d").clearRect(0, 0, c.width, c.height);
        return c;
      };
      erstellePolygon = function (
        canvas,
        farbe,
        farbdeckkraft,
        rahmen,
        coords,
        name
      ) {
        var i,
          context = canvas.getContext("2d");
        context.save();
        context.beginPath();
        context.moveTo(coords[0], coords[1]);
        for (i = 2; i < coords.length; i += 2)
          context.lineTo(coords[i], coords[i + 1]);
        context.closePath();
        if (farbe.length) {
          context.fillStyle =
            "rgba(" +
            parseInt(farbe.substr(0, 2), 16) +
            "," +
            parseInt(farbe.substr(2, 2), 16) +
            "," +
            parseInt(farbe.substr(4, 2), 16) +
            "," +
            farbdeckkraft +
            ")";
          context.fill();
        }
        if (rahmen) {
          context.strokeStyle = "rgb(0,0,0)";
          context.lineWidth = rahmen;
          context.stroke();
        }
        context.restore();
      };
      saeubereZeichnung = function (canvas) {
        canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
      };
    } else {
      // IE<=8
      erstelleZeichnung = function (img) {
        return $j(
          '<var style="zoom:1;overflow:hidden;display:block;width:' +
            img.width +
            "px;height:" +
            img.height +
            'px;"></var>'
        ).get(0);
      };
      erstellePolygon = function (
        canvas,
        farbe,
        farbdeckkraft,
        rahmen,
        coords,
        name
      ) {
        var e = $j(
          '<v:shape name="' +
            name +
            '" filled="' +
            (rahmen ? "f" : "t") +
            '" ' +
            (rahmen
              ? 'strokeweight="' +
                rahmen +
                '" stroked="t" strokecolor="#000000"'
              : 'stroked="f"') +
            ' coordorigin="0,0" coordsize="' +
            canvas.width +
            "," +
            canvas.height +
            '" path="m ' +
            coords[0] +
            "," +
            coords[1] +
            " l " +
            coords.join(",") +
            ' x e" style="zoom:1;margin:0;padding:0;display:block;position:absolute;top:0px;left:0px;width:' +
            canvas.width +
            "px;height:" +
            canvas.height +
            'px;"></v:shape>'
        );
        e.get(0).innerHTML = farbe.length
          ? '<v:fill color="#' + farbe + '" opacity="' + farbdeckkraft + '" />'
          : "";
        $j(canvas).append(e);
      };
      saeubereZeichnung = function (canvas) {
        $j(canvas).find("[name=markiert]").remove();
      };
    }
    leseKoordinaten = function (area) {
      var i,
        coords = area.getAttribute("coords").split(",");
      for (i = 0; i < coords.length; i++) coords[i] = parseFloat(coords[i]);
      return coords;
    };
    if (!erlaubtCanvas) {
      document.namespaces.add("v", "urn:schemas-microsoft-com:vml");
      var style = document.createStyleSheet();
      var shapes = ["shape", "fill", "stroke"];
      $j.each(shapes, function () {
        style.addRule(
          "v\\:" + this,
          "behavior: url(#default#VML); antialias:true"
        );
      });
    }

    // Befüllung
    var i,
      j,
      k,
      l,
      m,
      wg,
      canvas,
      canvas2,
      regionID,
      region,
      html = "",
      zeile,
      parteiliste = [],
      parteiliste_vgl = [],
      daten = [],
      daten_vz = [],
      indexWG,
      indexOrd = [],
      index_max_sonst = [],
      wert,
      werte = [],
      gleicherPlatz = [],
      anzGleicherPlatz = 0,
      index_sonst1 = -1,
      anzSonstige = 0,
      istSonstige = [],
      gibtSonstigegleicherPlatz = false,
      parteiindex = -1,
      parteifarbe = [],
      farbe,
      farbwerte = [],
      minFarbwert = 100,
      maxFarbwert = -100,
      farbe_meta = "770066",      
	  farbe_gewinn = "004400",
      farbe_verlust = "AA0000",
      deckkraft,
      minDeckkraft = 0.25,
      maxDeckkraft = 0.8,
      maxObergrenze = wv.indexAkt == "b" ? 100 : 80,
      minUntergrenze = -maxObergrenze,
      einheit = wv.radio1 == 0 ? "&nbsp;%" : "&nbsp;PP",
      $img = $j("#karten-grafik-wahl img"),
      img = $img.get(0),
      $map = $j("#karten-grafik-wahl map"),
      $legendenbalken = $j("#karten-legendenbalken-wahl"),
      legendenbreite = 25,
      legendenhoehe = 120, //160
      legendenfarbe,
      anz_gemeindeergebnisse = [],
      anz_staerkste = 1;
    parteiliste[startRegionID] = [];
    

	parteiliste[startRegionID][0] =
      wahl.parteien[
        findeRegionsindex(wahl.parteien, startRegionID, true)
      ].akt[0];
    if (
      wahl.parteien[findeRegionsindex(wahl.parteien, startRegionID, true)].akt
        .length === 2
    )
      parteiliste[startRegionID][1] =
        wahl.parteien[
          findeRegionsindex(wahl.parteien, startRegionID, true)
        ].akt[1];
    istSonstige = ermittleSonstige(wahl, startRegionID, 0, 0);
    for (i = 0; i < parteiliste[startRegionID][0].length; i++) {
      if (wahltypID === 0)
        parteiindex = findeParteiindex(
          wahl.parteien[findeRegionsindex(wahl.parteien, startRegionID, true)]
            .vgl[1][i]
        );
      if (wahltypID !== 0 || parteiindex === findeParteiindex("Sonstige"))
        parteiindex = findeParteiindex(parteiliste[startRegionID][0][i]);
      parteifarbe[i] = ermittleParteifarbe(parteien[parteiindex]);
      if (istSonstige[i] && index_sonst1 < 0) index_sonst1 = i;
      anz_gemeindeergebnisse[i] = 0;
    }
    for (i = 0, l = wahl.stimmen.length; i < l; i++) {
      region = wahl.stimmen[i];
      if (regionen[region.region_id].typID < 4) continue;
      parteiliste[region.region_id] = [];
      parteiliste[region.region_id][0] =
        wahl.parteien[
          findeRegionsindex(wahl.parteien, region.region_id, true)
        ].akt[0];
      if (
        wahl.parteien[findeRegionsindex(wahl.parteien, region.region_id, true)]
          .akt.length === 2
      )
        parteiliste[region.region_id][1] =
          wahl.parteien[
            findeRegionsindex(wahl.parteien, region.region_id, true)
          ].akt[1];

      // Gemeindeergebnisse zählen
      for (j = 0; j < parteiliste[region.region_id][0].length; j++)
        if (
          parteiliste[region.region_id][0][j] !== "" &&
          region.daten_akt[0][2] != null
        )
          anz_gemeindeergebnisse[j]++;


      // Stimmanteile laden
      daten[region.region_id] = [];
      for (wg = 0; wg < parteiliste[region.region_id].length; wg++) {
        daten[region.region_id][wg] = [];
        for (j = 0; j < parteiliste[startRegionID][wg].length; j++) {
          daten[region.region_id][wg][j] =
            j >= parteiliste[region.region_id][wg].length ||
            region.daten_akt[wg][4] == 0 ||
            (wv.indexAkt == j &&
              parteiliste[region.region_id][wg][wv.indexAkt] === "")
              ? ""
              : region.pdaten_akt[wg][j] / region.daten_akt[wg][4];
        }
      }

      // Stimmanteilsdifferenzen laden, falls ausgewählt
      if (wv.radio1 == 1 || wv.radio1 == 2) {
        parteiliste_vgl[region.region_id] =
          wahl.parteien[
            findeRegionsindex(wahl.parteien, region.region_id, true)
          ].vgl[wv.radio1 - 1];
        for (j = 0; j < parteiliste[region.region_id][0].length; j++)
          if (
            daten[region.region_id][0][j] !== "" &&
            j < parteiliste_vgl[region.region_id].length &&
            parteiliste_vgl[region.region_id][j] !== ""
          )
            daten[region.region_id][0][j] =
              daten[region.region_id][0][j] -
              region.pdaten_vgl[wv.radio1 - 1][j] /
                region.daten_vgl[wv.radio1 - 1][4];

        if (parteiliste[region.region_id].length === 2)
          for (j = 0; j < parteiliste[region.region_id][1].length; j++)
            if (
              daten[region.region_id][1][j] != "" &&
              j < region.pdaten_akt[0].length
            )
              daten[region.region_id][1][j] =
                daten[region.region_id][1][j] -
                region.pdaten_akt[0][j] / region.daten_akt[0][4];
      }
      // X-höchster Stimmanteil bzw. Stimmanteilsgewinn finden und Anzahl auf Platz X zählen
      indexWG =
        wv.indexAkt === "a0" ? parteiliste[region.region_id].length - 1 : 0; // Zeiger für Bürgermeisterpartei
      werte = [];
      for (j = 0; j < parteiliste[region.region_id][0].length; j++)
        if (
          parteiliste[region.region_id][0][j] !== "" &&
          daten[region.region_id][indexWG][j] !== ""
        )
          werte[j] = [daten[region.region_id][indexWG][j], j];
        else if (parteiliste[region.region_id][0][j] !== "") werte[j] = [-1, j];
      // werte.sort(function (left, right) {
      // return left[0] > right[0] ? -1 : 1;
      // });  //Diese Sortierung hat 'undefined' nach vorne geordnet im Firefox. Probleme bei BGM-Wahl. Durch folgende zeilen ersetzt.
      werte.sort(function (left, right) {
        if (left[0] > right[0]) {
          return -1;
        }
        if (left[0] < right[0]) {
          return 1;
        } else {
          return 0;
        }
      });
      indexOrd[region.region_id] = [];
      if (wahltypID === 5) indexOrd[region.region_id]["a0"] = werte[0][1];
      for (j = 0; j < werte.length; j++)
        if (werte[j] != null)
          indexOrd[region.region_id]["a" + (j + 1)] = werte[j][1];
      /*if (wv.indexAkt.substr(1)-1<werte.length)
     indexOrd[region.region_id][wv.indexAkt]=werte[Math.max(0,wv.indexAkt.substr(1)-1)][1];
     else indexOrd[region.region_id][wv.indexAkt]=-1;*/
      if (
        indexOrd[region.region_id][wv.indexAkt] > -1 &&
        daten[region.region_id][indexWG][
          indexOrd[region.region_id][wv.indexAkt]
        ] !== ""
      ) {
        if (gleicherPlatz[indexOrd[region.region_id][wv.indexAkt]] == null) {
          gleicherPlatz[indexOrd[region.region_id][wv.indexAkt]] = 1;
          anzGleicherPlatz++;
        } else gleicherPlatz[indexOrd[region.region_id][wv.indexAkt]]++;
      }
      // Differenz zwischen Parteien bzw. Wahlwerbenden bilden, falls ausgewählt
      if (wv.radio1 == 3) {
        if (
          parteiliste[region.region_id][0][
            wv.indexVgl.substr(0, 1) === "a"
              ? indexOrd[region.region_id][wv.indexVgl]
              : wv.indexVgl
          ] === ""
        )
          wert = NaN;
        else
          wert =
            daten[region.region_id][0][
              wv.indexVgl.substr(0, 1) === "a"
                ? indexOrd[region.region_id][wv.indexVgl]
                : wv.indexVgl
            ];
        for (j = 0; j < parteiliste[region.region_id][0].length; j++) {
          if (daten[region.region_id][0][j] !== "")
            daten[region.region_id][0][j] =
              isNaN(wert) ||
              (wv.indexVgl.substr(0, 1) === "a" &&
                j === indexOrd[region.region_id][wv.indexVgl]) ||
              (wv.indexVgl.substr(0, 1) !== "a" && j == wv.indexVgl)
                ? ""
                : daten[region.region_id][0][j] - wert;
        }
      }
      // Sonstige Partei mit höchsten Stimmanteil bzw. höchsten Stimmanteilsgewinn finden
      index_max_sonst[region.region_id] = -1;
      wert = -1;
      for (k = 0; k < parteiliste[region.region_id][0].length; k++) {
        if (
          istSonstige[k] &&
          daten[region.region_id][0][k] != "" &&
          wert < daten[region.region_id][0][k]
        ) {
          wert = daten[region.region_id][0][k];
          index_max_sonst[region.region_id] = k;
        }
      }
      // Höchsten Stimmanteil, Wahlbeteiligung, ungültige Stimmen und Anteil ausgest. Wahlkarten ergänzen
      daten_vz[region.region_id] = [];
	  
      if (wv.indexAkt.substr(0, 1) === "a")
        daten[region.region_id][0][wv.indexAkt] =
          indexOrd[region.region_id][wv.indexAkt] > -1
            ? daten[region.region_id][0][
                indexOrd[region.region_id][wv.indexAkt]
              ]
            : "";
      for (wg = 0; wg < parteiliste[region.region_id].length; wg++) {
        daten[region.region_id][wg]["b"] =
          region.daten_akt[wg][2] == null
            ? ""
            : region.daten_akt[wg][2] / region.daten_akt[wg][0];
        daten[region.region_id][wg]["c"] =
          region.daten_akt[wg][2] == null
            ? ""
            : region.daten_akt[wg][3] / region.daten_akt[wg][2];
        daten[region.region_id][wg]["d"] =
          wg < region.wk.length ? region.wk[wg] / region.daten_akt[wg][0] : "";
        daten[region.region_id][wg]["s"] =
          index_max_sonst[region.region_id] === -1
            ? ""
            : daten[region.region_id][wg][index_max_sonst[region.region_id]];
      }
      // Falls Anteilsdifferenzen: Vorwahl-Anteile laden und Differenzen statt Anteile speichern
      if ((wv.radio1 == 1 || wv.radio1 == 2) && region.daten_akt[0][4] > 0) {
        daten[region.region_id][0]["b"] =
          daten[region.region_id][0]["b"] -
          region.daten_vgl[wv.radio1 - 1][2] /
            region.daten_vgl[wv.radio1 - 1][0];
        daten[region.region_id][0]["c"] =
          daten[region.region_id][0]["c"] -
          region.daten_vgl[wv.radio1 - 1][3] /
            region.daten_vgl[wv.radio1 - 1][2];
        daten_vz[region.region_id][0] = [];
        for (j in daten[region.region_id][0])
          daten_vz[region.region_id][0][j] = ermittleVorzeichen(
            daten[region.region_id][0][j]
          );
        if (
          parteiliste[region.region_id].length === 2 &&
          region.daten_akt[1][4] > 0
        ) {
          daten[region.region_id][1]["b"] =
            daten[region.region_id][1]["b"] -
            region.daten_akt[0][2] / region.daten_akt[0][0];
          daten[region.region_id][1]["c"] =
            daten[region.region_id][1]["c"] -
            region.daten_akt[0][3] / region.daten_akt[0][2];
          daten_vz[region.region_id][1] = [];
          for (j in daten[region.region_id][1])
            daten_vz[region.region_id][1][j] = ermittleVorzeichen(
              daten[region.region_id][1][j]
            );
        }
      }
      if (wv.radio1 == 3 && region.daten_akt[0][4] > 0) {
        daten_vz[region.region_id][0] = [];
        for (j = 0, m = daten[region.region_id][0].length; j < m; j++)
          daten_vz[region.region_id][0][j] = ermittleVorzeichen(
            daten[region.region_id][0][j]
          );
        if (
          parteiliste[region.region_id].length === 2 &&
          region.daten_akt[1][4] > 0
        ) {
          daten_vz[region.region_id][1] = [];
          for (j = 0, m = daten[region.region_id][1].length; j < m; j++)
            daten_vz[region.region_id][1][j] = ermittleVorzeichen(
              daten[region.region_id][1][j]
            );
        }
      }
      // Farbwerte sowie größten und kleinsten Wert bestimmen
      farbwerte[region.region_id] =
        daten[region.region_id][0][wv.indexAkt] !== "" &&
        (wv.indexAkt.substr(0, 1) !== "a" ||
          parteiliste[region.region_id][0][
            indexOrd[region.region_id][wv.indexAkt]
          ] !== "")
          ? Math.round(daten[region.region_id][0][wv.indexAkt] * 1000) / 10
          : "";
      if (
        farbwerte[region.region_id] !== "" &&
        farbwerte[region.region_id] < minFarbwert
      )
        minFarbwert = Math.max(minUntergrenze, farbwerte[region.region_id]);
      if (
        farbwerte[region.region_id] !== "" &&
        farbwerte[region.region_id] > maxFarbwert
      )
        maxFarbwert = Math.min(maxObergrenze, farbwerte[region.region_id]);
    }

    // Falls stimmenstärkste sonstige Partei an mehreren Positionen vorkommt, nur einmal zählen
    for (i = 0; i < gleicherPlatz.length; i++) {
      if (wahltypID >= 4 && istSonstige[i] && gleicherPlatz[i] != null) {
        if (gibtSonstigegleicherPlatz) {
          gleicherPlatz[i] = null;
          anzGleicherPlatz--;
        } else gibtSonstigegleicherPlatz = true;
      }
    }

    // Legendenbalken erstellen
    if (
      (isNaN(wv.indexAkt)
        ? Array.max(anz_gemeindeergebnisse) > 0
        : anz_gemeindeergebnisse[wv.indexAkt] > 0) &&
      wv.indexAkt !== "a0" &&
      minFarbwert < maxFarbwert &&
      (minFarbwert !== 0 || maxFarbwert !== 0)
    ) {
      $j("#karten-legende-wahl th").html("Legende:");
      $legendenbalken.css({
        width: legendenbreite + "px",
        height: legendenhoehe + "px",
        border: "1px solid",
      });
      if (wv.indexAkt.substr(0, 1) === "a" && wv.radio1 != 3) {
        $legendenbalken.html(Array(anzGleicherPlatz + 1).join("<div></div>"));
        for (i = 0; i < gleicherPlatz.length; i++) {
          if (gleicherPlatz[i] != null) {
            legendenfarbe = parteifarbe[i];
            if (minFarbwert < 0 && maxFarbwert <= 0) {
              fuelleLegendenbalkenteil(
                anz_staerkste,
                erlaubtCanvas,
                reduziereDeckkraft(legendenfarbe, minDeckkraft),
                reduziereDeckkraft(legendenfarbe, maxDeckkraft)
              );
            } else {
              fuelleLegendenbalkenteil(
                anz_staerkste,
                erlaubtCanvas,
                reduziereDeckkraft(legendenfarbe, maxDeckkraft),
                reduziereDeckkraft(legendenfarbe, minDeckkraft)
              );
            }
            anz_staerkste++;
          }
        }
        $legendenbalken.css({
          width:
            Math.round(legendenbreite / anzGleicherPlatz) * anzGleicherPlatz +
            "px",
        });
        $j("div", $legendenbalken).css({
          width: Math.round(legendenbreite / anzGleicherPlatz) + "px",
          height: legendenhoehe + "px",
        });
      } else if (wv.radio1 == 0 || (minFarbwert >= 0 && maxFarbwert >= 0)) {
        $legendenbalken.html("<div></div>");
        if (wv.radio1 > 0)
          legendenfarbe =
            minFarbwert >= 0
              ? farbe_gewinn
              : maxFarbwert <= 0
              ? farbe_verlust
              : "";
        else if (wv.indexAkt === "s") legendenfarbe = parteifarbe[index_sonst1];
        else
          legendenfarbe = isNaN(wv.indexAkt)
            ? farbe_meta
            : parteifarbe[wv.indexAkt];
        fuelleLegendenbalkenteil(
          1,
          erlaubtCanvas,
          reduziereDeckkraft(legendenfarbe, maxDeckkraft),
          reduziereDeckkraft(legendenfarbe, minDeckkraft)
        );
        $j("div", $legendenbalken).css({
          width: legendenbreite + "px",
          height: legendenhoehe + "px",
        });
      } else if (minFarbwert <= 0 && maxFarbwert <= 0) {
        $legendenbalken.html("<div></div>");
        legendenfarbe =
          wv.radio1 == 0
            ? isNaN(wv.indexAkt)
              ? farbe_meta
              : parteifarbe[wv.indexAkt]
            : minFarbwert >= 0
            ? farbe_gewinn
            : maxFarbwert <= 0
            ? farbe_verlust
            : "";
        fuelleLegendenbalkenteil(
          1,
          erlaubtCanvas,
          reduziereDeckkraft(legendenfarbe, minDeckkraft),
          reduziereDeckkraft(legendenfarbe, maxDeckkraft)
        );
        $j("div", $legendenbalken).css({
          width: legendenbreite + "px",
          height: legendenhoehe + "px",
        });
      } else {
        $legendenbalken.html("<div></div><div></div>");
        fuelleLegendenbalkenteil(
          1,
          erlaubtCanvas,
          reduziereDeckkraft(
            farbe_gewinn,
            (maxFarbwert / Math.max(maxFarbwert, -minFarbwert)) *
              (maxDeckkraft - minDeckkraft) +
              minDeckkraft
          ),
          reduziereDeckkraft(farbe_gewinn, minDeckkraft)
        );
        fuelleLegendenbalkenteil(
          2,
          erlaubtCanvas,
          reduziereDeckkraft(farbe_verlust, minDeckkraft),
          reduziereDeckkraft(
            farbe_verlust,
            (-minFarbwert / Math.max(maxFarbwert, -minFarbwert)) *
              (maxDeckkraft - minDeckkraft) +
              minDeckkraft
          )
        );
        $j("#legende-nullwert").html("&#177; 0,0 PP");
        $j("div:nth-child(1)", $legendenbalken).css({
          width: legendenbreite + "px",
          height: legendenhoehe / 2 + "px",
        });
        $j("div:nth-child(2)", $legendenbalken).css({
          width: legendenbreite + "px",
          height: legendenhoehe / 2 + "px",
        });
      }
      if (maxFarbwert >= minFarbwert) {
        $j("#legende-maxwert").html(
          (wv.radio1 == 0 ? "" : ermittleVorzeichen(maxFarbwert)) +
            formatiereZahl(runden(maxFarbwert, 1)) +
            einheit +
            (maxFarbwert === maxObergrenze ? " und mehr" : "")
        );
        $j("#legende-minwert").html(
          minFarbwert === maxFarbwert
            ? "&nbsp;"
            : (wv.radio1 == 0 ? "" : ermittleVorzeichen(minFarbwert)) +
                formatiereZahl(runden(minFarbwert, 1)) +
                einheit +
                (minFarbwert === minUntergrenze ? " und mehr" : "")
        );
      }
    }
    // Parteienlegende
    if (
      wv.indexAkt.substr(0, 1) === "a" &&
      wv.radio1 != 3 &&
      Array.max(anz_gemeindeergebnisse) > 0
    ) {
      for (i = 0; i < gleicherPlatz.length; i++) {
        if (gleicherPlatz[i] != null) {
          html +=
            '<tr><td style="background:#' +
            reduziereDeckkraft(parteifarbe[i], maxDeckkraft) +
            "; border-color:#" +
            reduziereDeckkraft(parteifarbe[i], maxDeckkraft) +
            ';">&nbsp;</td><td>' +
            (parteiliste[startRegionID][0][i].indexOf("Sonstige") > -1
              ? "Sonstige"
              : kuerzeKandidatenname(
                  parteiliste[startRegionID][0][i],
                  wahltypID === 0 ? 3 : 0
                )) +
            "</td></tr>";
        }
      }
      //Ergänze bei BMW 1.Wahlgang die Farbe 2.Wahlgang in der Legende.
      if (
        (wahltypID === 5) &
        (parteiliste[5].length === 1) &
        (wv.indexAkt === "a0")
      ) {
        html +=
          '<tr><td style="background:#B3B3B3"></td><td>2.Wahlgang</td></tr>';
      }

      $j("#karten-parteienlegende-wahl").html(html);
    }

    // wahl['stimmen'].map((x) => {
    // console.log(x);
    // var farben_bgm_index = x.bgm_index_akt[0][0];
    // console.log(farben_bgm_index);
    // var test = (farben_bgm_index === -1 ? "#8D3333" : (farben_bgm_index === 0 ? "#B3B3B3" : parteifarbe[farben_bgm_index]));
    // console.log(test);
    // });

    if (!erlaubtCanvas) {
      $img.css("filter", "Alpha(opacity=0)");
    }
    canvas = erstelleZeichnung(img);
    $j(canvas).css({
      position: "absolute",
      left: 0,
      top: 0,
      padding: 0,
      border: 0,
    });
    canvas.height = img.height;
    canvas.width = img.width;
    if (erlaubtCanvas) {
      canvas2 = canvas.cloneNode(true);
      $img.before(canvas2);
    }
    $j("area[coords]", $map)
      .each(function () {
        regionID = +$j(this).attr("id").substr(1);
        $j(this).click(function () {
          loescheParameter();
          wv.inhalt = "erg";
          wv.regionID = regionID;
          wv.indexAkt = parteiliste[regionID].length === 2 ? 1 : 0;
          ergaenzeParameter();
          veraendereHash();
        });
        if (findeRegionsindex(wahl.stimmen, regionID, false) === -1) return;
        if (
          farbwerte[regionID] === undefined ||
          farbwerte[regionID] === "" ||
          (maxFarbwert === 0 && minFarbwert === 0) ||
          (wv.radio1 == 3 && farbwerte[regionID] == 0)
        )
          deckkraft = 0;
        else if (minFarbwert === maxFarbwert || wv.indexAkt === "a0")
          deckkraft = maxDeckkraft;
        else if (minFarbwert * maxFarbwert < 0)
          deckkraft = runden(
            (Math.abs(farbwerte[regionID]) /
              Math.max(Math.abs(maxFarbwert), Math.abs(minFarbwert))) *
              (maxDeckkraft - minDeckkraft) +
              minDeckkraft,
            2
          );
        else if (minFarbwert < 0 && maxFarbwert <= 0)
          deckkraft = runden(
            ((maxFarbwert - farbwerte[regionID]) /
              (maxFarbwert - minFarbwert)) *
              (maxDeckkraft - minDeckkraft) +
              minDeckkraft,
            2
          );
        else
          deckkraft = runden(
            ((farbwerte[regionID] - minFarbwert) /
              (maxFarbwert - minFarbwert)) *
              (maxDeckkraft - minDeckkraft) +
              minDeckkraft,
            2
          );
        // Farbe festlegen
        if (wv.indexAkt.substr(0, 1) === "a" && wv.radio1 != 3)
          if (
            indexOrd[regionID][wv.indexAkt] !== undefined &&
            indexOrd[regionID][wv.indexAkt] > -1
          ) {
            indexWG = parteiliste[regionID].length - 1;
            if (
              wv.indexAkt === "a0" &&
              indexWG === wahl.wahl_akt.id.length - 1 &&
              daten[regionID][indexWG][indexOrd[regionID][wv.indexAkt]] <= 0.5
            )
              farbe = "B3B3B3";
            else farbe = parteifarbe[indexOrd[regionID][wv.indexAkt]];
          }

          //Anfang Ergänzung BGM auf bgm_index setzten (ansonsten Ergänzung kommentieren und oben auskommentieren ab: if (indexOrd[regionID][wv.indexAkt] !== undefined && indexOrd[regionID][wv.indexAkt] > -1) {
          /* if (indexOrd[regionID][wv.indexAkt] !== undefined && indexOrd[regionID][wv.indexAkt] > -1) {
        indexWG = parteiliste[regionID].length - 1;
        if (wv.indexAkt === 'a0' && indexWG === wahl.wahl_akt.id.length - 1 &&
          daten[regionID][indexWG][indexOrd[regionID][wv.indexAkt]] <= .5)
		  farbe = 'B3B3B3';
		else {
			//Neue ifelse Abfrage ab Wahljahr 2024 BMW --> auf bgm_index die Farbe festlegen
			if(wahljahr >= 2024 && wahltypID === 5 && wv.indexAkt === 'a0'){
				let bgm_partei_index = wahl['stimmen'].filter(function(x) {return x.region_id === regionID;})[0].bgm_index_akt;
				//Wahlgang beachten
				if(bgm_partei_index[1][0] === null){
					bgm_partei_index = bgm_partei_index[0][0];
				}else{
					bgm_partei_index = bgm_partei_index[1][0];
				}
				bgm_partei_index = bgm_partei_index-1;
				//Nein-Stimmen
				if(bgm_partei_index === -2){
					bgm_partei_index = daten[regionID][0].length-1;
				}
				
				farbe = parteifarbe[bgm_partei_index];
				//2. Wahlgang Gemeindevertretungsentscheid
				if(bgm_partei_index === -1){
					farbe = 'B3B3B3';
				}
			}else{
				farbe = parteifarbe[indexOrd[regionID][wv.indexAkt]];
			} 	
 		}
      } */
          //Ende Ergänzung
          else farbe = "FFFFFF";
        else if (wv.radio1 > 0)
          farbe =
            daten[regionID][0][wv.indexAkt] === ""
              ? "FFFFFF"
              : daten[regionID][0][wv.indexAkt] >= 0 && maxFarbwert > 0
              ? farbe_gewinn
              : farbe_verlust;
        else if (wv.indexAkt === "s")
          farbe =
            daten[regionID][0][wv.indexAkt] === ""
              ? "FFFFFF"
              : parteifarbe[index_sonst1];
        else if (isNaN(wv.indexAkt)) farbe = farbe_meta;
        else farbe = parteifarbe[wv.indexAkt];
        // Gemeinden zeichnen
        if (erlaubtCanvas)
          erstellePolygon(
            canvas2,
            farbe,
            deckkraft,
            0,
            leseKoordinaten(this),
            ""
          );
        else {
          erstellePolygon(
            canvas,
            farbe,
            deckkraft,
            0,
            leseKoordinaten(this),
            ""
          );
          $j(canvas).append("<v:shape></v:shape>");
        }
      })
      .bind("mouseover", function (e) {
        wg = 0;
        regionID = +$j(this).attr("id").substr(1);
        if (findeRegionsindex(wahl.stimmen, regionID, false) === -1) return;
        erstellePolygon(
          canvas,
          "",
          deckkraft,
          2,
          leseKoordinaten(this),
          "markiert"
        );
        if (!erlaubtCanvas) $j(canvas).append("<v:shape></v:shape>");
        anzSonstige = 0;
        for (i = 0; i < parteiliste[regionID][0].length; i++)
          if (parteiliste[regionID][0][i] !== "" && istSonstige[i])
            anzSonstige++;
        // Info-Kästchen erstellen
        html = "";
        for (wg = 0; wg < parteiliste[regionID].length; wg++) {
          html +=
            '<table class="wertetabelle"><colgroup><col><col width="5%"</colgroup>' +
            '<thead><tr><th colspan="2">' +
            regionen[$j(this).attr("id").substr(1)].bez +
            (parteiliste[regionID].length === 2
              ? "<br>" +
                (wg + 1) +
                ". Wahlgang" +
                (wv.radio1 == 1
                  ? " zu " + (wg === 0 ? "Vorwahl" : "1. Wahlgang")
                  : "")
              : "") +
            "</th></tr></thead><tbody>";
          if (daten[regionID][wg]["b"] === "") {
            html +=
              '<tr><td colspan="2" class="mitte">Noch kein Ergebnis eingelangt</td></tr>';
          } else if (
            !isNaN(wv.indexAkt) &&
            (wv.indexAkt >= parteiliste[regionID][0].length ||
              parteiliste[regionID][0][wv.indexAkt] === "")
          ) {
            if (parteiliste[startRegionID][wg][wv.indexAkt] === "Nein-Stimmen")
              html +=
                '<tr><td colspan="2" class="mitte">Es gab mehr als einen Kandidaten.</td></tr>';
            else
              html +=
                '<tr><td colspan="2" class="mitte">Partei hat hier nicht kandidiert.</td></tr>';
            break;
          } else if (wv.indexAkt === "s" && anzSonstige === 0) {
            html +=
              '<tr><td colspan="2" class="mitte">Es hat keine sonstige Partei kandidiert.</td></tr>';
            break;
          } else if (
            wv.radio1 == 3 &&
            wv.indexVgl.substr(0, 1) === "a" &&
            parteiliste[regionID][0][indexOrd[regionID][wv.indexVgl]] == null
          ) {
            html +=
              '<tr><td colspan="2" class="mitte">Es gab weniger als ' +
              wv.indexVgl.substr(1) +
              (wahltypID === 5 ? " Wahlwerbende" : " Parteien") +
              ".</td></tr>";
          } else if (
            wv.radio1 == 3 &&
            wv.indexVgl.substr(0, 1) !== "a" &&
            parteiliste[regionID][0][wv.indexVgl] === ""
          ) {
            html +=
              '<tr><td colspan="2" class="mitte">' +
              (wahltypID === 5
                ? "Für die Vergleichspartei kandidierte niemand"
                : "Vergleichspartei hat hier nicht kandidiert") +
              ".</td></tr>";
          } else {
            html +=
              "<tr" +
              (wv.indexAkt === "b" && wg === 0
                ? ' class="markiert fett"'
                : "") +
              '><td class="links">Wahlbeteiligung</td><td>' +
              (wv.radio1 == 1 || wv.radio1 == 2
                ? daten_vz[regionID][wg]["b"]
                : "") +
              formatiereZahl(runden(daten[regionID][wg]["b"] * 100, 1)) +
              (wv.radio1 == 3 ? "&nbsp;%" : einheit) +
              "</td></tr>" +
              '<tr class=" hinterlegt' +
              (wv.indexAkt === "c" && wg === 0 ? " markiert fett" : "") +
              '"><td class="links">ungültige Stimmen</td><td>' +
              (wv.radio1 == 1 || wv.radio1 == 2
                ? daten_vz[regionID][wg]["c"]
                : "") +
              formatiereZahl(runden(daten[regionID][wg]["c"] * 100, 1)) +
              (wv.radio1 == 3 ? "&nbsp;%" : einheit) +
              "</td></tr>";
            zeile = 0;

            //Änderung für die Bürgermeisterpartei ab WJ 2024
            /* 		if(wahltypID === 5 && wv.indexAkt === 'a0' && wahljahr >= 2024 && wv.radio1 === 0){
				let bgm_partei_index = wahl['stimmen'].filter(function(x) {return x.region_id === regionID;})[0].bgm_index_akt;
				if(bgm_partei_index[1][0] === null){
					bgm_partei_index = bgm_partei_index[0][0];
				}else{
					bgm_partei_index = bgm_partei_index[1][0];
				}
				bgm_partei_index = bgm_partei_index-1;
				if(bgm_partei_index === -2){
					bgm_partei_index = daten[regionID][0].length-1;
				}
			
			for (i = 0; i < parteiliste[regionID][wg].length; i++)
			  if (parteiliste[regionID][wg][i] !== '') {
				html += '<tr class="' + (zeile === 0 ? ' h-linie' : (zeile % 2 === 1 ? ' hinterlegt' : '')) +
				  (i === bgm_partei_index ? ' markiert fett' : '') + '"><td class="links">' +
				  (wahltypID === 0 ? kuerzeKandidatenname(parteiliste[regionID][wg][i], 2) : parteiliste[regionID][wg][i]) + '</td><td>' +
				  (wv.radio1 == 3 && wv.indexVgl >= 0 && i == wv.indexVgl ? '' :
					wv.radio1 == 3 && wv.indexVgl.substr(0, 1) === 'a' && i === indexOrd[regionID][wv.indexVgl] ? wv.indexVgl.substr(1) + '. Platz' :
					  (wv.radio1 == 0 ? '' : daten_vz[regionID][wg][i]) +
					  formatiereZahl(runden(daten[regionID][wg][i] * 100, 1)) + einheit) + '</td></tr>';
				zeile++;
          }

		}else{
			for (i = 0; i < parteiliste[regionID][wg].length; i++)
			  if (parteiliste[regionID][wg][i] !== '') {
				html += '<tr class="' + (zeile === 0 ? ' h-linie' : (zeile % 2 === 1 ? ' hinterlegt' : '')) +
				  (wv.indexAkt === 'a0' && daten[regionID][wg][i] > .5 ||
				  wv.indexAkt !== 'a0' && wg === 0 &&
				  (wv.indexAkt.substr(0, 1) === 'a' && i === indexOrd[regionID][wv.indexAkt] ||
				  wv.indexAkt === 's' && i === index_max_sonst[regionID] ||
				  wv.indexAkt >= 0 && i == wv.indexAkt) ? ' markiert fett' : '') + '"><td class="links">' +
				  (wahltypID === 0 ? kuerzeKandidatenname(parteiliste[regionID][wg][i], 2) : parteiliste[regionID][wg][i]) + '</td><td>' +
				  (wv.radio1 == 3 && wv.indexVgl >= 0 && i == wv.indexVgl ? '' :
					wv.radio1 == 3 && wv.indexVgl.substr(0, 1) === 'a' && i === indexOrd[regionID][wv.indexVgl] ? wv.indexVgl.substr(1) + '. Platz' :
					  (wv.radio1 == 0 ? '' : daten_vz[regionID][wg][i]) +
					  formatiereZahl(runden(daten[regionID][wg][i] * 100, 1)) + einheit) + '</td></tr>';
				zeile++;
			  }
		} */

            for (i = 0; i < parteiliste[regionID][wg].length; i++)
              if (parteiliste[regionID][wg][i] !== "") {
                html +=
                  '<tr class="' +
                  (zeile === 0
                    ? " h-linie"
                    : zeile % 2 === 1
                    ? " hinterlegt"
                    : "") +
                  ((wv.indexAkt === "a0" && daten[regionID][wg][i] > 0.5) ||
                  (wv.indexAkt !== "a0" &&
                    wg === 0 &&
                    ((wv.indexAkt.substr(0, 1) === "a" &&
                      i === indexOrd[regionID][wv.indexAkt]) ||
                      (wv.indexAkt === "s" &&
                        i === index_max_sonst[regionID]) ||
                      (wv.indexAkt >= 0 && i == wv.indexAkt)))
                    ? " markiert fett"
                    : "") +
                  '"><td class="links">' +
                  (wahltypID === 0
                    ? kuerzeKandidatenname(parteiliste[regionID][wg][i], 2)
                    : parteiliste[regionID][wg][i]) +
                  "</td><td>" +
                  (wv.radio1 == 3 && wv.indexVgl >= 0 && i == wv.indexVgl
                    ? ""
                    : wv.radio1 == 3 &&
                      wv.indexVgl.substr(0, 1) === "a" &&
                      i === indexOrd[regionID][wv.indexVgl]
                    ? wv.indexVgl.substr(1) + ". Platz"
                    : (wv.radio1 == 0 ? "" : daten_vz[regionID][wg][i]) +
                      formatiereZahl(runden(daten[regionID][wg][i] * 100, 1)) +
                      einheit) +
                  "</td></tr>";
                zeile++;
              }
          }

          html +=
            wv.radio1 != 1 && wv.radio1 != 2 && daten[regionID][wg]["d"] !== ""
              ? '<tr class="h-linie' +
                (wv.indexAkt === "d" && wg === 0 ? " markiert fett" : "") +
                '"><td class="links">ausgestellte Wahlkarten</td><td>' +
                formatiereZahl(runden(daten[regionID][wg]["d"] * 100, 1)) +
                "&nbsp;%</td></tr>"
              : "";
          html += "</tbody></table><br>";
        }
        indexWG = parteiliste[regionID].length - 1;
        if (
          wahltypID === 5 &&
          wv.indexAkt === "a0" &&
          daten[regionID][indexWG]["b"] !== "" &&
          indexOrd[regionID][wv.indexAkt] > -1 &&
          indexWG === wahl.wahl_akt.id.length - 1 &&
          daten[regionID][indexWG][indexOrd[regionID][wv.indexAkt]] <= 0.5
        )
          html +=
            '<div class="beschreibung">Entscheidung im ' +
            (indexWG + 2) +
            ". Wahlgang</div>";
        if (
          indexWG > 0 &&
          wv.indexAkt !== "a0" &&
          daten[regionID][0][wv.indexAkt] !== "" &&
          daten[regionID][1][wv.indexAkt] !== ""
        )
          html +=
            '<div class="beschreibung">Es wird der Wert des<br>1. Wahlgangs dargestellt.</div>';
        if (wv.indexAkt === "s" && anzSonstige > 1)
          html +=
            '<div class="beschreibung">Es wird die sonstige Partei mit dem höchsten Stimmanteil' +
            (wv.radio1 == 1 || wv.radio1 == 2
              ? "sgewinn bzw. niedrigsten Stimmanteilsverlust"
              : "") +
            " dargestellt.</div>";
        if (
          wv.indexAkt.substr(0, 1) === "a" &&
          (wv.radio1 == 1 || wv.radio1 == 2) &&
          indexOrd[regionID][wv.indexAkt] === -1 &&
          daten[regionID][0]["b"] !== ""
        )
          html +=
            '<div class="beschreibung">Es werden nur Gemeinden mit<br>mehreren Kandidaten eingefärbt.</div>';
        $j("#karten-text-wahl").html(html);
      })
      .bind("mouseout", function (e) {
        saeubereZeichnung(canvas);
        $j("#karten-text-wahl").html("");
      });
    $img.before(canvas);
  }
}

function fuelleLegendenbalkenteil(legendenteil, erlaubtCanvas, farbe1, farbe2) {
  var $legendenbalken = $j(
    "#karten-legendenbalken-wahl div:nth-child(" + legendenteil + ")"
  );
  $legendenbalken.css(
    "filter",
    "progid:DXImageTransform.Microsoft.Gradient(startColorstr=#FF" +
      farbe1 +
      ", endColorstr=#FF" +
      farbe2 +
      ")"
  );
  $legendenbalken.css(
    "-ms-filter",
    "progid:DXImageTransform.Microsoft.Gradient(startColorstr=#FF" +
      farbe1 +
      ", endColorstr=#FF" +
      farbe2 +
      ")"
  );

  if (erlaubtCanvas) {
    $legendenbalken.css(
      "background",
      "-moz-linear-gradient(top, #" + farbe1 + " 0%, #" + farbe2 + " 100%)"
    );
    $legendenbalken.css(
      "background",
      "-o-linear-gradient(top, #" + farbe1 + " 0%, #" + farbe2 + " 100%)"
    );
    $legendenbalken.css(
      "background",
      "-webkit-gradient(linear, left top, left bottom, from(#" +
        farbe1 +
        "), to(#" +
        farbe2 +
        "))"
    );
    $legendenbalken.css(
      "background",
      "-webkit-linear-gradient(top, #" + farbe1 + " 0%, #" + farbe2 + " 100%)"
    );
    $legendenbalken.css(
      "background",
      "-ms-linear-gradient(top, #" + farbe1 + " 0%, #" + farbe2 + " 100%)"
    );
  }
}

/***** Erstellt Vorzugsstimmen *****/
function erstelleVorzugsstimmen(vz) {
  var i,
    j,
    l,
    m,
    parteifarbe,
    bewerber,
    zeile,
    liste = -1,
    metadaten =
      vz.metadaten[findeRegionsindex(vz.metadaten, wv.regionID, true)],
    stimmen = vz.stimmen[findeRegionsindex(vz.stimmen, wv.regionID, false)],
    html = '<div id="vz-wahl"><div id="vz-menue-wahl" class="menue-wahl">';
  if (wahltypID === 2 && wahljahr >= 2013) {
    html +=
      '<input type="radio" name="vzliste" value="b"' +
      (wv.radio1 === "b" ? ' checked="checked"' : "") +
      "> Bundesparteiliste<br>";
  }
  if (wahltypID === 2 && wahljahr >= 2013) {
    html +=
      '<input type="radio" name="vzliste" value="l"' +
      (wv.radio1 === "l" ? ' checked="checked"' : "") +
      "> Landesparteiliste<br>" +
      '<input type="radio" name="vzliste" value="r"' +
      (wv.radio1 === "r" ? ' checked="checked"' : "") +
      "> Regionalparteiliste<br><br>";
  }
  if (wahltypID === 3 && wahljahr >= 2023) {
    html +=
      '<input type="radio" name="vzliste" value="l"' +
      (wv.radio1 === "l" ? ' checked="checked"' : "") +
      "> Landesparteiliste<br>" +
      '<input type="radio" name="vzliste" value="r"' +
      (wv.radio1 === "r" ? ' checked="checked"' : "") +
      "> Bezirksparteiliste<br><br>";
  }
  html +=
    erstelleRegionsauswahl(vz.stimmen, 1, 4) +
    "</div><br>" +
    '<div class="beschreibung"><input type="checkbox" value="VZStimmen"' +
    (wv.check1 === 1 ? ' checked="checked"' : "") +
    ">&ensp;nur Bewerber mit Vorzugsstimmen anzeigen" +
    "</div><br>" +
    '<div id="vz-tabelle-wahl">';
  for (i = 0, l = metadaten.parteien.length; i < l; i++) {
    if (metadaten.parteien[i] === "") continue;
    liste++;
    if (liste >= metadaten.bewerber.length || !metadaten.bewerber[liste].length)
      continue;

    // Neue Zeilen für Gemeindevertretungswahlen: Farbe von grp nehmen
    if (wahltypID === 4 && wahljahr >= 2019) {
      parteifarbe = reduziereDeckkraft(
        ermittleParteifarbe(
          parteien[findeParteiindex(metadaten.parteikennung[i])]
        ),
        0.4
      );
    } else {
      parteifarbe = reduziereDeckkraft(
        ermittleParteifarbe(parteien[findeParteiindex(metadaten.parteien[i])]),
        0.4
      );
    }

    //parteifarbe = reduziereDeckkraft(ermittleParteifarbe(parteien[findeParteiindex(metadaten.parteien[i])]), 0.4);
    html +=
      '<table class="wertetabelle"><colgroup><col width="7%"><col width="35%">' +
      '<col width="8%"><col width="30%"><col width="10%"><col width="10%"></colgroup>' +
      '<thead style="background:#' +
      parteifarbe +
      '"><tr><th colspan="4">' +
      metadaten.parteien[i] +
      '</th><th class="vz-metadaten" colspan="2">Parteistimmen: ' +
      formatiereZahl(stimmen.stimmen[i]) +
      "<br>Vorzugsstimmen: " +
      formatiereZahl(stimmen.vzstimmen[i]) +
      "</th></tr>" +
      (wv.check1 === 0 || stimmen.vzstimmen[i] > 0
        ? '<tr><th rowspan="2">Lfd.Nr.</th>' +
          '<th rowspan="2">Nachname, Vorname, akad. Grad</th><th rowspan="2">Jahr-<br>gang</th><th rowspan="2">Beruf</th>' +
          '<th colspan="2">Vorzugsstimmen</th></tr><tr><td>absolut</td><td>in %</td></tr>'
        : "") +
      "</thead><tbody>";
    zeile = 0;
    for (j = 0, m = metadaten.bewerber[liste].length; j < m; j++) {
      bewerber = metadaten.bewerber[liste][j];
      if (wv.check1 === 0 || stimmen.vz[i][j] > 0) {
        html +=
          "<tr" +
          (zeile % 2 === 1 ? ' class="hinterlegt"' : "") +
          '><td class="wert">' +
          bewerber.r +
          '</td><td class="links">' +
          bewerber.n +
          '</td><td class="mitte">' +
          bewerber.g +
          '</td><td class="links">' +
          bewerber.b +
          '</td><td class="wert">' +
          (j < stimmen.vz[i].length ? formatiereZahl(stimmen.vz[i][j]) : "0") +
          '</td><td class="pwert">' +
          (j < stimmen.vz[i].length && stimmen.vzstimmen[i] > 0
            ? formatiereZahl(
                runden((stimmen.vz[i][j] / stimmen.vzstimmen[i]) * 100, 1)
              )
            : "0,0") +
          "</td></tr>";
        zeile++;
      }
    }
    html += "</tbody>";

    // Kommentare
    var komm = stimmen.komm || "";
    if (komm.length > 0) {
      html +=
        '<tfoot><tr class="h-linie"><td colspan="6">' +
        komm +
        "</td></tr></tfoot>";
    }
    html += "</table><br>";
  }
  html += "</div>";
  return html;
}


/***** Erstellt Wählerströme *****/
function erstelleWaehlerstroeme_alt(data) {
  var rundungsgenauigkeit = 1000; // nur Zehnerpotenz erlaubt;

  // Inhalt des Hauptfensters löschen
  var div = document.getElementById("inhalt-wahl");
  while (div.firstChild && div.removeChild(div.firstChild));

  // Dimensionen festlegen
  var margin = { top: 50, right: 1, bottom: 20, left: 1 },
    width =
      Math.min(700, div.getBoundingClientRect().width) -
      margin.left -
      margin.right,
    height = 500 - margin.top - margin.bottom;

  // Formatierung und Farben festlegen
  d3.formatDefaultLocale({ decimal: ",", thousands: ".", grouping: [3] });
  var format = function (d) {
    return d3.format(",.0f")(
      Math.round(d / rundungsgenauigkeit) * rundungsgenauigkeit
    );
  };

  var beschreibung = d3.select("#inhalt-wahl").append("div");

  // SVG-Objekt erzeugen
  var svg = d3
    .select("#inhalt-wahl")
    .append("div")
    .attr("id", "waehlerstroeme-wahl")
    .append("svg")
    .attr("width", "100%")
    .attr("height", height + margin.top + margin.bottom);

  // Tooltip-Container erzeugen
  var tooltip = d3
    .select("body")
    .append("div")
    .attr("id", "waehlerstroeme-tooltip-wahl")
    .style("opacity", 0);

  d3.select("#inhalt-wahl")
    .append("div")
    .html(
      "nicht gewählt: Nichtwähler:innen sowie Jungwähler:innen, Zugezogene und Eingebürgerte, abzüglich Weggezogene und Verstorbene"
    );

  //QUICKFIX
  if (wv.stand <= 3 && (wahljahr === datenAktiveWahl.jahr) & (wahltypID === 2))
    d3.select("#inhalt-wahl")
      .append("div")
      .html(
        "<br>Hinweis: Wählerströme basieren auf dem vorläufigen Ergebnis inkl. Wahlkartenprognose."
      );
  //ENDE QUICKFIX

  chart = svg
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  chart
    .append("text")
    .attr("x", 0)
    .attr("y", -20)
    .attr("dy", ".35em")
    .style("font-size", "1.2em")
    .style("font-weight", "bold")
    .text(data.text_von);
  chart
    .append("text")
    .attr("x", width)
    .attr("y", -20)
    .attr("dy", ".35em")
    .attr("text-anchor", "end")
    .style("font-size", "1.2em")
    .style("font-weight", "bold")
    .text(data.text_nach);

  // Set the sankey diagram properties
  var sankey = d3.sankey().nodeWidth(30).nodePadding(15).size([width, height]);

  var path = sankey.link();

  sankey.nodes(data.nodes).links(data.links).layout(0);

  // add in the links
  var link = chart
    .append("g")
    .selectAll(".link")
    .data(data.links)
    .enter()
    .append("path")
    .attr("class", "link")
    .attr("d", path)
    .style("stroke", function (d, i) {
      return d.source.farbe;
    })
    .style("stroke-width", function (d) {
      if (d.value <= rundungsgenauigkeit / 2) return 0;
      return Math.max(1, d.dy);
    })
    .sort(function (a, b) {
      return b.dy - a.dy;
    })
    // Verbindungen hervorheben und Tooltip anzeigen
    .on("mouseover", function (d) {
      d3.select(this).style("stroke-opacity", 1);
      tooltip.transition().duration(200).style("opacity", 0.9);
      tooltip.html(function () {
        return d.source.name + " → " + d.target.name + ": " + format(d.value);
      });
    })
    .on("mousemove", function (d) {
      tooltip
        .style("left", d3.event.pageX + "px")
        .style("top", d3.event.pageY - 28 + "px");
    })
    .on("mouseout", function (d) {
      d3.select(this).style("stroke-opacity", 0.6);
      tooltip.transition().duration(500).style("opacity", 0);
    });

  // add in the nodes
  var node = chart
    .append("g")
    .selectAll(".node")
    .data(data.nodes)
    .enter()
    .append("g")
    .attr("class", "node")
    .attr("transform", function (d) {
      return "translate(" + d.x + "," + d.y + ")";
    })
    .on("mouseover", function (d) {
      d3.selectAll("path.link")
        .filter(function (l) {
          return d.node === l.source.node || d.node === l.target.node;
        })
        .style("stroke-opacity", 1);
    })
    .on("mouseout", function (d) {
      d3.selectAll("path.link").style("stroke-opacity", 0.6);
    });

  // add the rectangles for the nodes
  node
    .append("rect")
    .attr("height", function (d) {
      return d.dy;
    })
    .attr("width", sankey.nodeWidth())
    .style("fill", function (d) {
      return d.farbe;
    })
    .style("stroke", function (d) {
      return d3.rgb(d.farbe).darker(2);
    });

  // add in the title for the nodes
  var wahlberechtigte = 0;
  node
    .append("text")
    .attr("x", -6)
    .attr("y", function (d) {
      return d.dy / 2;
    })
    .attr("dy", ".35em")
    .attr("text-anchor", "end")
    .attr("transform", null)
    .text(function (d) {
      wahlberechtigte += d.value;
      return d.name + ": " + format(d.value);
    })
    .filter(function (d) {
      return d.x < width / 2;
    })
    .attr("x", 6 + sankey.nodeWidth())
    .attr("text-anchor", "start");

  beschreibung.html(
    "In einer Analyse der Wählerströme wird aufgrund der Wahldaten berechnet, wie die " +
      d3.format(",.0f")(
        Math.round(wahlberechtigte / rundungsgenauigkeit / 2) *
          rundungsgenauigkeit
      ) +
      " Wahlberechtigten der aktuellen Wahl bei der vorangegangenen Wahl gewählt haben. " +
      "Die Zahlen sind auf " +
      d3.format(",.0f")(rundungsgenauigkeit) +
      " Stimmen gerundet, Ströme unter " +
      d3.format(",.0f")(rundungsgenauigkeit / 2) +
      " Stimmen werden nicht angezeigt.<br><br>" +
      "Die Grafik ist interaktiv, d.h. mit dem Mauszeiger bzw. durch Bildschirmberührung können die Werte " +
      "der Ströme eingeblendet werden."
  );
}

function erstelleWaehlerstroeme(data) {
  var rundungsgenauigkeit = 1000; // nur Zehnerpotenz erlaubt;

  // Inhalt des Hauptfensters löschen
  var div = document.getElementById("inhalt-wahl");
  while (div.firstChild && div.removeChild(div.firstChild));

  // Dimensionen festlegen
  var margin = { top: 50, right: 1, bottom: 20, left: 1 },
    width =
      Math.min(700, div.getBoundingClientRect().width) -
      margin.left -
      margin.right,
    height = 500 - margin.top - margin.bottom;

  // Formatierung und Farben festlegen
  d3.formatDefaultLocale({ decimal: ",", thousands: ".", grouping: [3] });
  var format = function (d) {
    return d3.format(",.0f")(
      Math.round(d / rundungsgenauigkeit) * rundungsgenauigkeit
    );
  };

  var beschreibung = d3.select("#inhalt-wahl").append("div");

  // SVG-Objekt erzeugen
  var svg = d3
    .select("#inhalt-wahl")
    .append("div")
    .attr("id", "waehlerstroeme-wahl")
    .append("svg")
    .attr("width", "100%")
    .attr("height", height + margin.top + margin.bottom);

  // Tooltip-Container erzeugen
  var tooltip = d3
    .select("body")
    .append("div")
    .attr("id", "waehlerstroeme-tooltip-wahl")
    .style("opacity", 0);

  d3.select("#inhalt-wahl")
    .append("div")
    .html(
      "nicht gewählt: Nichtwähler:innen sowie Jungwähler:innen, Zugezogene und Eingebürgerte, abzüglich Weggezogene und Verstorbene"
    );

  //QUICKFIX
  if (wv.stand <= 3 && (wahljahr === datenAktiveWahl.jahr) & (wahltypID === 2))
    d3.select("#inhalt-wahl")
      .append("div")
      .html(
        "<br>Hinweis: Wählerströme basieren auf dem vorläufigen Ergebnis inkl. Wahlkartenprognose."
      );
  //ENDE QUICKFIX

  var chart = svg
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  chart
    .append("text")
    .attr("x", 0)
    .attr("y", -20)
    .attr("dy", ".35em")
    .style("font-size", "1.2em")
    .style("font-weight", "bold")
    .text(data.text_von);
  chart
    .append("text")
    .attr("x", width)
    .attr("y", -20)
    .attr("dy", ".35em")
    .attr("text-anchor", "end")
    .style("font-size", "1.2em")
    .style("font-weight", "bold")
    .text(data.text_nach);

  // Set the sankey diagram properties
  var sankey = d3.sankey()
    .nodeWidth(30)
    .nodePadding(15)
    .extent([[0, 0], [width, height]]);

  var { nodes, links } = sankey({
    nodes: data.nodes.map(d => Object.assign({}, d)),
    links: data.links.map(d => Object.assign({}, d))
  });

  // add in the links
  var link = chart
    .append("g")
    .selectAll(".link")
    .data(links)
    .enter()
    .append("path")
    .attr("class", "link")
    .attr("d", d3.sankeyLinkHorizontal())
    .style("stroke", function (d) {
      return d.source.farbe;
    })
    .style("stroke-width", function (d) {
      if (d.value <= rundungsgenauigkeit / 2) return 0;
      return Math.max(1, d.width);
    })
    .sort(function (a, b) {
      return b.width - a.width;
    })
    // Verbindungen hervorheben und Tooltip anzeigen
    .on("mouseover", function (event, d) {
      d3.select(this).style("stroke-opacity", 1);
      tooltip.transition().duration(200).style("opacity", 0.9);
      tooltip.html(function () {
        return d.source.name + " → " + d.target.name + ": " + format(d.value);
      });
    })
    .on("mousemove", function (event) {
      tooltip
        .style("left", event.pageX + "px")
        .style("top", event.pageY - 28 + "px");
    })
    .on("mouseout", function () {
      d3.select(this).style("stroke-opacity", 0.6);
      tooltip.transition().duration(500).style("opacity", 0);
    });

  // add in the nodes
  var node = chart
    .append("g")
    .selectAll(".node")
    .data(nodes)
    .enter()
    .append("g")
    .attr("class", "node")
    .attr("transform", function (d) {
      return "translate(" + d.x0 + "," + d.y0 + ")";
    })
    .on("mouseover", function (event, d) {
      d3.selectAll("path.link")
        .filter(function (l) {
          return d.index === l.source.index || d.index === l.target.index;
        })
        .style("stroke-opacity", 1);
    })
    .on("mouseout", function () {
      d3.selectAll("path.link").style("stroke-opacity", 0.6);
    });

  // add the rectangles for the nodes
  node
    .append("rect")
    .attr("height", function (d) {
      return d.y1 - d.y0;
    })
    .attr("width", sankey.nodeWidth())
    .style("fill", function (d) {
      return d.farbe;
    })
    .style("stroke", function (d) {
      return d3.rgb(d.farbe).darker(2);
    });

  // add in the title for the nodes
  var wahlberechtigte = 0;
  node
    .append("text")
    .attr("x", -6)
    .attr("y", function (d) {
      return (d.y1 - d.y0) / 2;
    })
    .attr("dy", ".35em")
    .attr("text-anchor", "end")
    .attr("transform", null)
    .text(function (d) {
      wahlberechtigte += d.value;
      return d.name + ": " + format(d.value);
    })
    .filter(function (d) {
      return d.x0 < width / 2;
    })
    .attr("x", 6 + sankey.nodeWidth())
    .attr("text-anchor", "start");

  beschreibung.html(
    "In einer Analyse der Wählerströme wird aufgrund der Wahldaten berechnet, wie die " +
      d3.format(",.0f")(
        Math.round(wahlberechtigte / rundungsgenauigkeit / 2) *
          rundungsgenauigkeit
      ) +
      " Wahlberechtigten der aktuellen Wahl bei der vorangegangenen Wahl gewählt haben. " +
      "Die Zahlen sind auf " +
      d3.format(",.0f")(rundungsgenauigkeit) +
      " Stimmen gerundet, Ströme unter " +
      d3.format(",.0f")(rundungsgenauigkeit / 2) +
      " Stimmen werden nicht angezeigt.<br><br>" +
      "Die Grafik ist interaktiv, d.h. mit dem Mauszeiger bzw. durch Bildschirmberührung können die Werte " +
      "der Ströme eingeblendet werden."
  );
}

/***** Erstellt Wahlhistorie *****/
function erstelleWahlhistorie(hist) {
  var i,
    j,
    l,
    m,
    daten,
    zeile = 0,
    komm,
    datum,
    ergebnis = wv.radio1 == 2 ? hist.mandate : hist.stimmen,
    html =
      '<div id="historie-wahl"><div id="historie-menue-wahl" class="menue-wahl">' +
      erstelleAuswertungsauswahl(hist) +
      erstelleRegionsauswahl(ergebnis, 1, 4) +
      '</div><div id="historie-tabelle-wahl"><table class="wertetabelle">',
    index_region = findeRegionsindex(ergebnis, wv.regionID, false);
  html +=
    '<colgroup><col width="8%" span="' +
    (hist.parteien.length + (wv.radio1 != 2 ? 5 : wahltypID < 4 ? 3 : 2)) +
    '"></colgroup>';
  // Überschriften
  html +=
    '<thead><tr><th rowspan="2">Wahldatum</th>' +
    (wv.radio1 == 2
      ? '<th class="v-linie" colspan="' +
        (hist.parteien.length + (wahltypID < 4 ? 2 : 1)) +
        '">' +
        (wahltypID === 5 ? "Bürgermeister:innen" : "Mandate") +
        "</th></tr>" +
        '<tr><th class="v-linie">gesamt</th>' +
        (wahltypID < 4 ? "<th>zuge-<br>wiesen</th>" : "")
      : '<th class="v-linie" rowspan="2">Wahlbe-<br>rechtigte</th><th class="v-linie" colspan="3">abgegebene Stimmen</th>' +
        '<th class="v-linie" colspan="' +
        hist.parteien.length +
        '">Parteistimmen</th></tr>' +
        '<tr><th class="v-linie">gesamt</th>' +
        "<th>ungültig</th><th>gültig</th>");
  for (i = 0, l = hist.parteien.length; i < l; i++)
    html +=
      "<th" +
      (i === 0 ? ' class="v-linie"' : "") +
      ">" +
      hist.parteien[i] +
      "</th>";
  html +=
    "</tr></thead><tbody" + (wv.radio1 == 2 ? ' class="zentriert"' : "") + ">";

  // Tabelleninhalt
  if (ergebnis[index_region].datum !== undefined)
    datum = ergebnis[index_region].datum;
  else datum = hist.datum;
  for (i = 0, l = datum.length; i < l; i++) {
    daten = ergebnis[index_region].daten[i];
    if (daten != null) {
      html +=
        "<tr" +
        (zeile % 2 === 1 ? ' class="hinterlegt"' : "") +
        "><th>" +
        datum[i] +
        "</th>";
      for (j = 0, m = daten.length; j < m; j++) {
        html +=
          "<td" +
          (j === 0 ||
          (wv.radio1 == 2 && j === (wahltypID < 4 ? 2 : 1)) ||
          (wv.radio1 != 2 && (j === 1 || j === 4))
            ? ' class="v-linie"'
            : "") +
          ">" +
          (daten[j] == null ? "" : formatiereZahl(daten[j])) +
          "</td>";
      }
      if (wv.radio1 != 2) {
        html +=
          "</tr><tr" +
          (zeile % 2 === 1 ? ' class="hinterlegt"' : "") +
          '><td></td><td class="v-linie"></td>' +
          '<td class="v-linie">' +
          (daten[1] == null
            ? "&nbsp;"
            : formatiereZahl(runden((daten[1] / daten[0]) * 100, 1)) + " %") +
          "</td>" +
          "<td>" +
          (daten[2] == null
            ? ""
            : formatiereZahl(runden((daten[2] / daten[1]) * 100, 1)) +
              "&nbsp;%") +
          "</td>" +
          "<td>" +
          (daten[3] == null
            ? ""
            : formatiereZahl(runden((daten[3] / daten[1]) * 100, 1)) +
              "&nbsp;%") +
          "</td>";
        for (j = 4; j < daten.length; j++) {
          html +=
            "<td" +
            (j === 4 ? ' class="v-linie"' : "") +
            ">" +
            (daten[j] == null
              ? ""
              : formatiereZahl(runden((daten[j] / daten[3]) * 100, 1)) +
                "&nbsp;%") +
            "</td>";
        }
      }
      html += "</tr>";
      zeile++;
    }
  }
  html += "</tbody>";

  // Kommentare
  komm = ergebnis[index_region].komm;
  if (komm.length > 0)
    html +=
      '<tfoot><tr class="h-linie"><td colspan="' +
      (hist.parteien.length + (wv.radio1 != 2 ? 5 : wahltypID < 4 ? 3 : 2)) +
      '">' +
      komm +
      "</td></tr></tfoot>";
  html += "</table></div></div>";
  return html;
}

/***** Wahldaten-bezogene Hilfsfunktionen *****/
// Falls GKZ statt regionID im Link angegeben ist
function findeRegionID(regionID) {
  if (regionID < 10000) return regionID;
  for (var i = 0, l = regionen.length; i < l; i++)
    if (regionID === regionen[i].GKZ) return regionen[i].ID;
  return startRegionID;
}
// Findet Index für Region in Liste, falls nicht gefunden, gibt Funktion entweder -1 zurück
// oder durchsucht rekursiv nach Index der Elternregion, bis Daten gefunden werden;
function findeRegionsindex(liste, regionID, elternregion) {
  liste = liste || [];
  for (var i = 0, l = liste.length; i < l; i++)
    if (liste[i].region_id === regionID) return i;
  return elternregion
    ? regionID === 0
      ? 0
      : findeRegionsindex(liste, regionen[regionID].elternID, true)
    : -1;
}
// Findet Index für Partei in parteien (wahldaten.js), sonst Index von Sonstige;
function findeParteiindex(bez) {
  for (var i = 0, l = parteien.length; i < l; i++)
    if (parteien[i].bez === bez) return i;
  return parteien.length - 1;
}
// Findet ID des Wahltyps in wahltypen (wahldaten.js), sonst -1;
function findeWahltypID(kurzbez) {
  for (var i = 0, l = wahltypen.length; i < l; i++)
    if (wahltypen[i].kurzbez === kurzbez) return i;
  return -1;
}
// Bildet Array mit ID der Region und der Überregionen bis auf eine bestimmte Ebene
function bildeRegionenstammbaum(regionID) {
  return (
    regionID === 0 ? [] : bildeRegionenstammbaum(regionen[regionID].elternID)
  ).concat(regionID);
}
// Vergleicht zwei Stammbäume, ignoriert Regionsebenen ohne Ergebnisse, falls Zähler übermittelt
function vergleicheBaeume(b1, b2, regionsebenen) {
  var baum1 = bildeRegionenstammbaum(b1);
  var baum2 = bildeRegionenstammbaum(b2);
  for (var i = 0, l = baum1.length; i < l; i++)
    if (
      i > 0 &&
      i < baum2.length &&
      baum1[i] !== baum2[i] &&
      (arguments.length === 2 || regionsebenen[i].length > 0)
    )
      return false;
  return true;
}

// Erstellt Auswahlmenü für Auswertung
function erstelleAuswertungsauswahl(wahl) {
  var gibtSt = wahl.stimmen !== undefined;
  var gibtWK =
    wahl.wahlkarten !== undefined && (wahltypID !== 3 || wahljahr < 2013);
  var gibtMand = wahl.mandate !== undefined;
  var html = "";
  if (gibtSt && (gibtWK || gibtMand)) {
    html +=
      '<input type="radio" name="auswertung" value="0"' +
      (wv.radio1 == 0 ? ' checked="checked"' : "") +
      "> Stimmen";
    if (gibtWK & (((wahltypID !== 1) & (wahltypID !== 2)) | (wahljahr < 2024)))
      html +=
        '<br><input type="radio" name="auswertung" value="1"' +
        //(wv.radio1 == 1 ? ' checked="checked"' : '') + '> Wahlkartenstimmen</td></tr>';
        (wv.radio1 == 1 ? ' checked="checked"' : "") +
        (wahljahr >= 2024 ? "> Wahlkartenstimmen" : "> Wahlkartenstimmen") +
        "</td></tr>";
    if (gibtMand)
      html +=
        '<br><input type="radio" name="auswertung" value="2"' +
        (wv.radio1 == 2 ? ' checked="checked"' : "") +
        "> Mandate";
    html += "<br><br>";
  }
  return html;
}
// Erstellt das Auswahlmenü für die Regionen der Liste in ein oder mehreren Ebenen
function erstelleRegionsauswahl(liste, minEbene, maxEbene) {
  var i,
    j,
    l,
    m,
    html = "",
    letzteEbene = -1,
    check,
    auswahl_region_id =
      regionen[wv.regionID].typID >= minEbene ? wv.regionID : startRegionID,
    auswahl_baum = bildeRegionenstammbaum(wv.regionID),
    auswahl = [[], [], [], [], []];

  for (i = 0, l = regionen.length; i < l; i++) {
    if (
      findeRegionsindex(liste, i, false) > -1 &&
      ((regionen[i].typID < minEbene &&
        vergleicheBaeume(auswahl_region_id, regionen[i].ID)) ||
        (regionen[i].typID >= minEbene &&
          vergleicheBaeume(auswahl_region_id, regionen[i].elternID, auswahl)) ||
        (regionen[i].typID >= minEbene &&
          regionen[auswahl_region_id].typID <= 1))
    )
      auswahl[regionen[i].typID].push(regionen[i].ID);
  }

  for (i = minEbene; i <= maxEbene; i++) {
    if (letzteEbene < i - 1 && auswahl[i - 1].length > 0) letzteEbene = i - 1;
    if (
      auswahl[i].length > 1 ||
      (auswahl[i].length > 0 &&
        letzteEbene > -1 &&
        auswahl[letzteEbene].length > 0)
    ) {
      html +=
        '<select id="menue_' +
        regionstypen[i].bez.toLowerCase() +
        '" class="menue_region">';

      if (
        i > 1 &&
        regionen[wv.regionID].typID <= 1 &&
        wv.regionID !== startRegionID
      )
        html += '<option selected="selected"></option>';
      if (i === 1 && findeRegionsindex(liste, 0, false) > -1)
        html += '<option value="0">' + regionen[0].bez + "</option>";
      else if (
        (i === 2 ||
          (i === 3 && auswahl[i - 1].length === 0) ||
          (i > 1 && regionen[wv.regionID].typID <= 1)) &&
        findeRegionsindex(liste, 5, false) > -1
      )
        html +=
          '<option value="5"' +
          ">Alle Salzburger " +
          regionstypen[i].bezPlural +
          "</option>";
      else if (
        i > 2 &&
        findeRegionsindex(
          liste,
          auswahl_baum[Math.min(letzteEbene, regionen[wv.regionID].typID)],
          false
        ) > -1
      )
        html +=
          '<option value="' +
          auswahl_baum[Math.min(letzteEbene, regionen[wv.regionID].typID)] +
          '"' +
          ">Alle " +
          regionstypen[i].bezPlural +
          " im " +
          regionstypen[Math.min(letzteEbene, regionen[wv.regionID].typID)]
            .kurzbez +
          "</option>";

      for (j = 0, m = auswahl[i].length; j < m; j++) {
        check = liste[findeRegionsindex(liste, auswahl[i][j], false)];
        html +=
          '<option value="' +
          auswahl[i][j] +
          ((wahltypID === 0 || wahltypID === 5) &&
          check.daten_akt !== undefined &&
          check.daten_akt[1] !== undefined
            ? ".1"
            : "") +
          '"' +
          (i <= regionen[wv.regionID].typID &&
          vergleicheBaeume(wv.regionID, auswahl[i][j])
            ? ' selected="selected"'
            : "") +
          ">" +
          (i < 4 ? regionstypen[i].kurzbez + " " : "") +
          regionen[auswahl[i][j]].bez +
          "</option>";
      }
      html += "</select><br>";
    }
  }
  return html.length ? "<span>Region:</span><br>" + html : "";
}
// Aktuelle Wahl
function erstelleAktuelleWahlauswahl(wahl) {
  var i,
    l,
    html = "",
    liste =
      wv.radio1 == 1
        ? wahl.wahlkarten
        : wv.radio1 == 2
        ? wahl.mandate
        : wahl.stimmen,
    auswahl =
      liste[findeRegionsindex(liste, wv.regionID, false)].daten_akt || [];
  if (auswahl.length > 1) {
    html += '<span>Aktuelle Wahl:</span><br><select id="menue_wahl_akt">';
    for (i = 0, l = auswahl.length; i < l; i++)
      html +=
        '<option value="' +
        i +
        '"' +
        (i == wv.indexAkt ? ' selected="selected"' : "") +
        ">" +
        (i + 1) +
        ". Wahlgang</option>";
    html += "</select><br><br>";
  }
  return html;
}
// Dazugehörige Vergleichswahl
function erstelleVergleichswahlauswahl(wahl) {
  var auswahl = wahl.wahl_akt.vgl[wv.indexAkt] || [],
    ergebnis = wv.radio1 == 2 ? wahl.mandate : wahl.stimmen,
    index_region = findeRegionsindex(ergebnis, wv.regionID, false);
  var html = "<span>Vergleichswahl:</span><br>";
  var i, l;

  for (i = auswahl.length - 1; i >= 0; i--) {
    if (
      (wv.radio1 == 2 &&
        wahl.wahl_akt.id[wv.indexAkt] != wahl.wahl_vgl.id[auswahl[i]]) ||
      ergebnis[index_region].daten_vgl[auswahl[i]] == undefined ||
      ergebnis[index_region].daten_vgl[auswahl[i]].length === 0
    ) {
      auswahl.splice(i, 1);
    }
  }
  if (auswahl.length === 1)
    html +=
      wahltypen[wahl.wahl_vgl.id[auswahl[0]]].bez +
      " " +
      wahl.wahl_vgl.jahr[auswahl[0]];
  else {
    html += '<select id="menue_wahl_vgl">';
    for (i = 0, l = auswahl.length; i < l; i++)
      html +=
        '<option value="' +
        auswahl[i] +
        '"' +
        (auswahl[i] == wv.indexVgl ? ' selected="selected"' : "") +
        ">" +
        (wahljahr === 2016 && wahl.wahl_akt.datum[0] === "4. Dezember"
          ? i === 0
            ? "annullierter 2. Wahlgang"
            : "1. Wahlgang"
          : (wahltypID === 5 && wv.indexAkt == 1 && i === 0) ||
            (wahlgang === 2 && i === 0)
          ? "1. Wahlgang"
          : wahltypen[wahl.wahl_vgl.id[auswahl[i]]].bez +
            " " +
            (ergebnis[index_region].nwjahr_vgl !== undefined && i === 0
              ? ergebnis[index_region].nwjahr_vgl
              : wahl.wahl_vgl.jahr[auswahl[i]]) +
            (wahltypID === 5 &&
            wv.indexAkt == 0 &&
            wahl.wahl_vgl.id[auswahl[i]] === 5
              ? " (1. WG)"
              : "")) +
        "</option>";
    html += "</select><br>";
  }
  return html;
}
// Kürzt Kandidatennamen nach Grad:
//   in jedem Fall: ohne Partei in Klammern bzw. Nein ohne -Stimmen,
//   1 = ohne Titel, 2 = 1+Vorname mit Initiale, wenn zu lange, 3 = 1+ohne Vorname
function kuerzeKandidatenname(name, grad) {
  var n = name.replace("Van der", "Van&nbsp;der");
  if (name === "Nein-Stimmen") return "Nein";
  if (n.indexOf("(") > 0) n = n.substr(0, n.indexOf("("));
  if (grad >= 1 && n.indexOf(". ") > 0)
    n = n.slice(n.indexOf(". ") + 2, n.length);
  if (grad === 2 && n.length > 20)
    n = n.substr(0, 1) + "." + n.slice(n.indexOf(" "), n.length);
  if (grad >= 3) n = n.slice(n.indexOf(" ") + 1, n.length);
  return n;
}

// Ermittelt Parteifarbe
function ermittleParteifarbe(partei) {
  var i, l, f;
  if (partei.spezialfarbe !== undefined) {
    for (i = 0, l = partei.spezialfarbe.length; i < l; i++) {
      f = partei.spezialfarbe[i];
      if (f.wahltypID === wahltypID && f.jahr === wahljahr) {
        return f.farbe;
      }
    }
  }
  return partei.farbe;
}

/***** allgemeine Hilfsfunktionen *****/
// Rundet Zahl auf eine Kommastelle und gibt sie mit einer Kommastelle zurück (auch x,0);
function runden(zahl, stellen) {
  if (zahl === null) return null;
  var z = (
    Math.round(zahl * Math.pow(10, stellen)) / Math.pow(10, stellen)
  ).toFixed(stellen);
  //if (z !== '50.0')
  return z;
  //return runden(zahl, 2);
}
function aufrunden(zahl, stellen) {
  return zahl === null
    ? null
    : (
        Math.ceil(runden(zahl * Math.pow(10, stellen), stellen + 3)) /
        Math.pow(10, stellen)
      ).toFixed(stellen);
}
// Setzt Tausenderpunkte und ersetzt das Dezimalzeichen '.' durch ','
// Achtung: Vorzeichen wird gelöscht, da Funktion sonst nicht funktioniert
function formatiereZahl(zahl) {
  if (zahl == null) return "";
  return String(zahl)
    .replace("-", "")
    .replace(".", ",")
    .replace(/^\d+/, function (w) {
      var rx = /(\d+)(\d{3})/;
      while (rx.test(w)) w = w.replace(rx, "$1.$2");
      return w;
    });
}
function ermittleVorzeichen(zahl) {
  return isNaN(zahl)
    ? ""
    : zahl < 0
    ? "&#8722;&nbsp;"
    : zahl > 0
    ? "&#43;&nbsp;"
    : zahl === 0
    ? "&#177;&nbsp;"
    : "";
}
// Reduziert eine Hexadezimal-Farbe um die Deckkraft
function reduziereDeckkraft(hexfarbe, deckkraft) {
  var r = (
      255 - Math.round((255 - parseInt(hexfarbe.substr(0, 2), 16)) * deckkraft)
    ).toString(16),
    g = (
      255 - Math.round((255 - parseInt(hexfarbe.substr(2, 2), 16)) * deckkraft)
    ).toString(16),
    b = (
      255 - Math.round((255 - parseInt(hexfarbe.substr(4, 2), 16)) * deckkraft)
    ).toString(16);
  return (
    (r.length === 1 ? "0" : "") +
    r +
    (g.length === 1 ? "0" : "") +
    g +
    (b.length === 1 ? "0" : "") +
    b
  ).toUpperCase();
}
// Findet kleinsten/größten Wert eines Arrays
Array.min = function (array) {
  return Math.min.apply(Math, array);
};
Array.max = function (array) {
  return Math.max.apply(Math, array);
};
// Wandelt das Datumsformat in ein echtes date Format um
function parseDate(dateString) {
  const [datePart, timePart] = dateString.split(", ");
  const [day, month, year] = datePart.split(".").map(Number);
  const [hours, minutes] = timePart.replace(" Uhr", "").split(":").map(Number);
  return new Date(year, month - 1, day, hours, minutes);
}



//Test neues Kartogramm

