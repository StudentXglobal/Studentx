/*
=========================================================
 STUDENTX SHARED BOTTOM NAVIGATION
=========================================================
Fayil daya ne ga duk shafuka. Girma, siffa da kala iri daya ne.
Yana fixed a kasa kamar X, kuma yana nuna shafin da ake ciki.

YADDA AKE AMFANI DA SHI:
Ka saka wannan layi daya kafin </body> a kowane shafi:

    <script src="nav.js"></script>

Idan shafin yana da tsohon <nav class="bnav">, wannan fayil
yana cire shi kansa, amma ka share shi daga HTML shima.
=========================================================
*/
(function () {
    "use strict";

    if (window.__studentxNavLoaded) return;
    window.__studentxNavLoaded = true;

    /* ---------- ITEMS ---------- */
    var ITEMS = [
        { key: "home",     label: "Home",     icon: "fa-house",          href: "home.html" },
        { key: "video",    label: "Video",    icon: "fa-video",          href: "video.html" },
        { key: "chat",     label: "Chat",     icon: "fa-comment-dots",   href: "chat.html" },
        { key: "studyhub", label: "StudyHub", icon: "fa-book-open",      href: "studyhub.html" },
        { key: "profile",  label: "Profile",  icon: "fa-user",           href: "profile.html" }
    ];

    /* ---------- WANE SHAFI YAKE WANE TAB ---------- */
    function currentKey() {
        var file = (location.pathname.split("/").pop() || "index.html").toLowerCase();

        if (file === "home.html" || file === "notification.html" || file === "search.html" || file === "create-post.html" || file === "comment.html") return "home";
        if (file === "video.html" || file === "view-live.html" || file === "go-live.html" || file === "live.html") return "video";
        if (file === "chat.html") return "chat";
        if (file.indexOf("studyhub") === 0 || file.indexOf("course-") === 0 || file === "jobs.html" || file === "scholarship.html") return "studyhub";

        var profileGroup = [
            "profile.html", "menu.html", "settings.html", "premium.html", "dashboard.html",
            "ads.html", "adsmanager.html", "events.html", "marketplace.html", "about.html",
            "help.html", "modem-ai.html", "play-games.html"
        ];
        if (profileGroup.indexOf(file) !== -1) return "profile";

        return "";
    }

    /* ---------- CSS ---------- */
    function addCSS() {
        if (document.getElementById("sx-nav-css")) return;

        var style = document.createElement("style");
        style.id = "sx-nav-css";
        style.textContent =
            ":root{--sx-nav-bg:#0a0a0f;--sx-nav-border:rgba(255,255,255,.08);--sx-nav-icon:rgba(255,255,255,.5);--sx-nav-active:#dc2743;--sx-nav-h:62px}" +
            ":root.sx-light{--sx-nav-bg:#ffffff;--sx-nav-border:#e4e6eb;--sx-nav-icon:#65676b;--sx-nav-active:#dc2743}" +

            "nav.sx-nav{position:fixed!important;left:0!important;right:0!important;bottom:0!important;" +
            "width:100%!important;max-width:500px!important;margin:0 auto!important;transform:none!important;" +
            "height:calc(var(--sx-nav-h) + env(safe-area-inset-bottom,0px))!important;" +
            "padding:0 0 env(safe-area-inset-bottom,0px)!important;box-sizing:border-box!important;" +
            "display:flex!important;align-items:stretch!important;justify-content:space-around!important;" +
            "background:var(--sx-nav-bg)!important;border-top:1px solid var(--sx-nav-border)!important;" +
            "z-index:9000!important;-webkit-tap-highlight-color:transparent;font-family:Poppins,Arial,sans-serif}" +

            "nav.sx-nav a.sx-item{flex:1 1 0!important;min-width:0!important;height:var(--sx-nav-h)!important;" +
            "display:flex!important;flex-direction:column!important;align-items:center!important;justify-content:center!important;" +
            "gap:4px!important;text-decoration:none!important;color:var(--sx-nav-icon)!important;" +
            "cursor:pointer;user-select:none;background:none!important}" +

            "nav.sx-nav a.sx-item i{font-size:20px!important;line-height:1!important;width:auto!important;height:auto!important;color:inherit!important}" +
            "nav.sx-nav a.sx-item span{font-size:10px!important;font-weight:500!important;line-height:1!important;color:inherit!important}" +
            "nav.sx-nav a.sx-item.sx-on{color:var(--sx-nav-active)!important}" +
            "nav.sx-nav a.sx-item.sx-on span{font-weight:700!important}" +
            "nav.sx-nav a.sx-item.sx-on i{background:linear-gradient(45deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888)!important;" +
            "-webkit-background-clip:text!important;background-clip:text!important;" +
            "-webkit-text-fill-color:transparent!important;color:transparent!important}" +
            "nav.sx-nav a.sx-item:active{opacity:.7}" +

            "body{padding-bottom:calc(var(--sx-nav-h) + env(safe-area-inset-bottom,0px))}";

        document.head.appendChild(style);
    }

    /* ---------- FONT AWESOME ---------- */
    function ensureIcons() {
        var has = document.querySelector('link[href*="font-awesome"]');
        if (has) return;

        var link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css";
        document.head.appendChild(link);
    }

    /* ---------- THEME (Dark / White / System) ---------- */
    function syncTheme() {
        var theme = "dark";
        try { theme = localStorage.getItem("studentx-theme") || "dark"; } catch (e) {}

        var light = theme === "light" ||
            (theme === "auto" && window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches);

        document.documentElement.classList.toggle("sx-light", light);
    }

    /* ---------- BUILD ---------- */
    function buildNav() {
        // Cire tsoffin navigation na kowane shafi
        document.querySelectorAll("nav.bnav, .bnav").forEach(function (el) { el.remove(); });

        var old = document.querySelector("nav.sx-nav");
        if (old) old.remove();

        var active = currentKey();

        var nav = document.createElement("nav");
        nav.className = "sx-nav";
        nav.setAttribute("aria-label", "Main navigation");

        nav.innerHTML = ITEMS.map(function (item) {
            var on = item.key === active;
            return '<a class="sx-item' + (on ? " sx-on" : "") + '" href="' + item.href + '"' +
                (on ? ' aria-current="page"' : "") + ">" +
                '<i class="fas ' + item.icon + '"></i>' +
                "<span>" + item.label + "</span></a>";
        }).join("");

        document.body.appendChild(nav);
    }

    /* ---------- INIT ---------- */
    function init() {
        addCSS();
        ensureIcons();
        syncTheme();
        buildNav();

        // Idan an canja theme a Settings ba tare da sake bude shafi ba
        var observer = new MutationObserver(syncTheme);
        observer.observe(document.head, { childList: true });

        window.addEventListener("storage", syncTheme);
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init, { once: true });
    } else {
        init();
    }
})();
