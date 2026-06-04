/* Shared header, footer, and nav for Guru Jo Dar multi-page site */
(function () {
    const script = document.currentScript;
    const base = script ? script.getAttribute("data-base") || "" : "";

    const NAV = [
        { id: "home", path: base || "./", label: { en: "Home", hi: "गृह", sd: "घर" } },
        { id: "history", path: base + "history/", label: { en: "Legacy", hi: "इतिहास", sd: "विरसो" } },
        { id: "miracles", path: base + "miracles/", label: { en: "Miracles", hi: "लीला", sd: "लीलाओं" } },
        { id: "bhajans", path: base + "bhajans/", label: { en: "Bhajans", hi: "भजन", sd: "भजन" } },
        { id: "seva", path: base + "seva/", label: { en: "Seva", hi: "सेवा", sd: "सेवा" } },
        { id: "gallery", path: base + "gallery/", label: { en: "Gallery", hi: "गैलरी", sd: "गैलरी" } },
        { id: "ardaas", path: base + "ardaas/", label: { en: "Ardaas", hi: "अरदास", sd: "अरदास" } },
        { id: "contact", path: base + "contact/", label: { en: "Contact", hi: "संपर्क", sd: "संपर्क" } }
    ];

    function navItem(item, activePage, linkClass) {
        const active = item.id === activePage ? " active" : "";
        const l = item.label;
        return `<li><a href="${item.path}" class="${linkClass}${active}" data-en="${l.en}" data-hi="${l.hi}" data-sd="${l.sd}">${l.en}</a></li>`;
    }

    window.GJD_BASE = base;

    window.renderSiteLayout = function (activePage) {
        const headerEl = document.getElementById("site-header");
        const footerEl = document.getElementById("site-footer");
        const drawerEl = document.getElementById("site-drawer");

        const desktopNav = NAV.map((item) => navItem(item, activePage, "nav-link")).join("");
        const drawerNav = NAV.map((item) => {
            const active = item.id === activePage ? " active" : "";
            const l = item.label;
            return `<li><a href="${item.path}" class="drawer-link${active}" onclick="toggleMobileMenu()" data-en="${l.en}" data-hi="${l.hi}" data-sd="${l.sd}">${l.en}</a></li>`;
        }).join("");

        const headerHTML = `
    <header class="main-header">
        <div class="container header-container">
            <a href="${base || "./"}" class="logo">
                <span class="gold-text">Guru Jo Dar</span>
                <span class="logo-subtitle">Baba Mulram Saheb</span>
            </a>
            <nav class="desktop-nav">
                <ul>${desktopNav}</ul>
            </nav>
            <div class="header-actions">
                <button id="ambient-toggle" class="btn-icon" title="Toggle Spiritual Background Chant">
                    <i class="fa-solid fa-om"></i>
                    <span class="pulse-indicator"></span>
                </button>
                <div class="language-dropdown" id="language-dropdown">
                    <button class="lang-btn" onclick="toggleLangDropdown(event)">
                        <i class="fa-solid fa-language"></i>
                        <span id="current-lang">EN</span>
                    </button>
                    <div class="dropdown-content">
                        <a href="javascript:void(0)" onclick="changeLanguage('en', event)">English</a>
                        <a href="javascript:void(0)" onclick="changeLanguage('hi', event)">हिंदी (Hindi)</a>
                        <a href="javascript:void(0)" onclick="changeLanguage('sd', event)">सिंधी (Sindhi)</a>
                    </div>
                </div>
                <button id="theme-toggle" class="btn-icon" title="Toggle Mode">
                    <i class="fa-solid fa-moon"></i>
                </button>
                <button id="mobile-menu-toggle" class="btn-icon mobile-only">
                    <i class="fa-solid fa-bars"></i>
                </button>
            </div>
        </div>
    </header>`;

        const drawerHTML = `
    <div class="mobile-drawer" id="mobile-drawer">
        <div class="drawer-header">
            <h3>Menu</h3>
            <button id="mobile-drawer-close" class="btn-icon">
                <i class="fa-solid fa-xmark"></i>
            </button>
        </div>
        <nav class="drawer-nav">
            <ul>${drawerNav}</ul>
        </nav>
    </div>`;

        const footerHTML = `
    <footer class="main-footer">
        <div class="container footer-grid">
            <div class="footer-about">
                <h4>Guru Jo Dar</h4>
                <p data-en="A charitable and spiritual sanctuary spreading Baba Mulram Saheb's vision of love, equality, and compassion." data-hi="एक धर्मार्थ और आध्यात्मिक धाम जो बाबा मूलराम साहिब के प्रेम, समानता और करुणा के संदेश को फैलाता है।" data-sd="हिक भलाई ऐं रूहानी धाम जो बाबा मूलराम साहिब जी प्रेम ऐं दया जो संदेश फैलाए थो।">A charitable and spiritual sanctuary spreading Baba Mulram Saheb's vision of love, equality, and compassion.</p>
                <div class="social-icons">
                    <a href="#"><i class="fa-brands fa-facebook"></i></a>
                    <a href="#"><i class="fa-brands fa-youtube"></i></a>
                    <a href="#"><i class="fa-brands fa-instagram"></i></a>
                    <a href="#"><i class="fa-brands fa-whatsapp"></i></a>
                </div>
            </div>
            <div class="footer-links">
                <h4 data-en="Quick Links" data-hi="त्वरित संपर्क" data-sd="लिंक्स">Quick Links</h4>
                <ul>
                    <li><a href="${base || "./"}">Home</a></li>
                    <li><a href="${base}history/">Legacy</a></li>
                    <li><a href="${base}bhajans/">Bhajans</a></li>
                    <li><a href="${base}seva/">Seva</a></li>
                    <li><a href="${base}ardaas/">Ardaas Request</a></li>
                </ul>
            </div>
            <div class="footer-timings">
                <h4 data-en="Darbar Timings" data-hi="दरबार का समय" data-sd="सत्संग वक़्त">Darbar Timings</h4>
                <ul>
                    <li><strong data-en="Morning prayers:" data-hi="प्रातः आरती:" data-sd="सुबूह जी आरती:">Morning prayers:</strong> 6:00 AM - 7:30 AM</li>
                    <li><strong data-en="Satsang (Sunday):" data-hi="सत्संग (रविवार):" data-sd="सत्संग (रविवार):">Satsang (Sunday):</strong> 5:00 PM - 8:00 PM</li>
                    <li><strong data-en="Langar Timings:" data-hi="लंगर का समय:" data-sd="लंगर वक़्त:">Langar Timings:</strong> 12:30 PM - 2:30 PM (Daily)</li>
                </ul>
            </div>
        </div>
        <div class="footer-bottom text-center">
            <p>&copy; 2026 Guru Jo Dar Trust. <span data-en="All Rights Reserved. Created in Devotion." data-hi="सर्वाधिकार सुरक्षित। भक्ति भाव से निर्मित।" data-sd="सभ हक़ महफ़ूज़।">All Rights Reserved. Created in Devotion.</span></p>
        </div>
    </footer>`;

        if (headerEl) headerEl.innerHTML = headerHTML;
        if (drawerEl) drawerEl.innerHTML = drawerHTML;
        if (footerEl) footerEl.innerHTML = footerHTML;

        const header = document.querySelector(".main-header");
        if (header && activePage !== "home") {
            header.classList.add("scrolled");
        }
    };

    document.addEventListener("DOMContentLoaded", () => {
        const page = document.body.getAttribute("data-page") || "home";
        renderSiteLayout(page);
        document.dispatchEvent(new CustomEvent("gjd-layout-ready"));
    });
})();
