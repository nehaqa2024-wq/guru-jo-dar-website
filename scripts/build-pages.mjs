import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const indexPath = path.join(root, "index.html");
const html = fs.readFileSync(indexPath, "utf8");

const headMatch = html.match(/<head>[\s\S]*?<\/head>/);
const head = headMatch ? headMatch[0] : "";

function extractSection(id) {
    const re = new RegExp(`<section id="${id}"[\\s\\S]*?<\\/section>`, "m");
    const m = html.match(re);
    return m ? m[0] : "";
}

function fixAssetPaths(section, base) {
    return section
        .replace(/src="assets\//g, `src="${base}assets/`)
        .replace(/openLightbox\('assets\//g, `openLightbox('${base}assets/`);
}

const pages = [
    { slug: "history", id: "legacy", title: "Legacy - Guru Jo Dar", page: "history" },
    { slug: "miracles", id: "miracles", title: "Miracles - Guru Jo Dar", page: "miracles" },
    { slug: "bhajans", id: "bhajans", title: "Bhajans - Guru Jo Dar", page: "bhajans" },
    { slug: "seva", id: "seva", title: "Seva - Guru Jo Dar", page: "seva" },
    { slug: "gallery", id: "gallery", title: "Gallery - Guru Jo Dar", page: "gallery" },
    { slug: "support", id: "support", title: "Support Us - Guru Jo Dar", page: "support" },
    { slug: "contact", id: "contact", title: "Contact - Guru Jo Dar", page: "contact" }
];

const modals = {
    gallery: `
    <div class="lightbox" id="lightbox" aria-hidden="true">
        <button type="button" class="lightbox-close" aria-label="Close image"><i class="fa-solid fa-xmark"></i></button>
        <div class="lightbox-stage">
            <img id="lightbox-img" src="" alt="">
        </div>
    </div>`,
    seva: `
    <div class="modal" id="seva-modal">
        <div class="modal-content">
            <button class="modal-close" onclick="closeSevaModal()"><i class="fa-solid fa-xmark"></i></button>
            <h3 id="seva-modal-title">Pledge Seva</h3>
            <p data-en="Generate a digital receipt to commit your support for this service. You will receive coordination details via email." data-hi="इस सेवा के समर्थन का संकल्प लेने के लिए एक डिजिटल रसीद बनाएं। आपको विवरण ईमेल पर प्राप्त होगा।" data-sd="पंहिंजी सेवा जो संकल्प रसीद बनायो। वधिक जानकारी ईमेल ते मिळन्दी।">Generate a digital receipt to commit your support for this service. You will receive coordination details via email.</p>
            <form id="seva-pledge-form" onsubmit="generatePledgeReceipt(event)">
                <input type="hidden" id="pledge-type">
                <div class="form-group">
                    <label for="pledge-name" data-en="Your Name" data-hi="आपका नाम" data-sd="नालो">Your Name *</label>
                    <input type="text" id="pledge-name" required placeholder="Enter name">
                </div>
                <div class="form-group">
                    <label for="pledge-email" data-en="Email Address" data-hi="ईमेल" data-sd="ईमेल">Email Address *</label>
                    <input type="email" id="pledge-email" required placeholder="yourname@domain.com">
                </div>
                <div class="form-group">
                    <label for="pledge-amount" data-en="Number of Days / Committment" data-hi="दिनों की संख्या / संकल्प" data-sd="दींहुन जो तादाद">Number of Days / Commitment (e.g. 5 days, 1 month)</label>
                    <input type="text" id="pledge-amount" required placeholder="e.g. 3 Days Langar, 1 Month medicines">
                </div>
                <button type="submit" class="btn btn-primary btn-wide" data-en="Generate Pledge Receipt" data-hi="संकल्प रसीद बनाएं" data-sd="रसीद बनायो">Generate Pledge Receipt</button>
            </form>
            <div class="receipt-result hidden" id="receipt-result">
                <div class="receipt-header">
                    <h4>Guru Jo Dar Seva</h4>
                    <p>Pledge Receipt</p>
                </div>
                <div class="receipt-body">
                    <p><strong>Pledger:</strong> <span id="r-name">Name</span></p>
                    <p><strong>Email:</strong> <span id="r-email">Email</span></p>
                    <p><strong>Seva Type:</strong> <span id="r-type">Type</span></p>
                    <p><strong>Pledge Details:</strong> <span id="r-details">Details</span></p>
                    <p><strong>Receipt ID:</strong> <span id="r-id" class="gold-text">GJD-2026-X</span></p>
                    <p class="receipt-footer">"May Baba Mulram Saheb shower his blessings."</p>
                </div>
                <button class="btn btn-secondary btn-sm btn-wide" onclick="closeSevaModal()" data-en="Download & Close" data-hi="डाउनलोड करें और बंद करें" data-sd="डाउनलोड ऐं बंद">Download & Close</button>
            </div>
        </div>
    </div>`
};

function pageShell({ slug, section, title, page, extraModals = "" }) {
    const base = "../";
    const pageHead = head
        .replace(/<title>.*?<\/title>/, `<title>${title}</title>`)
        .replace(/href="styles.css"/, `href="${base}styles.css"`);

    return `<!DOCTYPE html>
<html lang="en">
${pageHead}
<body data-page="${page}" class="inner-page">
    <audio id="ambient-audio" loop preload="metadata"></audio>
    <div id="site-header"></div>
    <div id="site-drawer"></div>
    <main class="page-main">
${fixAssetPaths(section, base)}
    </main>
${extraModals}
    <div id="toast-container" class="toast-container"></div>
    <div id="site-footer"></div>
    <script src="${base}site-layout.js" data-base="${base}"></script>
    <script src="${base}app.js"></script>
</body>
</html>`;
}

for (const p of pages) {
    const section = extractSection(p.id);
    if (!section) {
        console.error(`Missing section: ${p.id}`);
        process.exit(1);
    }
    const dir = path.join(root, p.slug);
    fs.mkdirSync(dir, { recursive: true });
    const extra = modals[p.page] || "";
    fs.writeFileSync(
        path.join(dir, "index.html"),
        pageShell({ ...p, section, extraModals: extra }),
        "utf8"
    );
    console.log(`Created ${p.slug}/index.html`);
}

// Home page: hero only
const hero = extractSection("home");
const homeHead = head.replace(/<title>.*?<\/title>/, "<title>Guru Jo Dar - Baba Mulram Saheb</title>");
const homeHtml = `<!DOCTYPE html>
<html lang="en">
${homeHead}
<body data-page="home">
    <audio id="ambient-audio" loop preload="metadata"></audio>
    <div id="site-header"></div>
    <div id="site-drawer"></div>
    <main>
${hero.replace('href="#support"', 'href="support/"').replace('href="#bhajans"', 'href="bhajans/"')}
    </main>
    <div id="toast-container" class="toast-container"></div>
    <div id="site-footer"></div>
    <script src="site-layout.js" data-base=""></script>
    <script src="app.js"></script>
</body>
</html>`;

fs.writeFileSync(indexPath, homeHtml, "utf8");
console.log("Updated index.html (home only)");
