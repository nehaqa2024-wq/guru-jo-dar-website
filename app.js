/* ==========================================
   APP STATE & INITIALIZATION
   ========================================== */
let currentLanguage = 'en';
let currentTheme = 'dark';
let isAmbientPlaying = false;

try {
    currentLanguage = localStorage.getItem("gjd_lang") || 'en';
    currentTheme = localStorage.getItem("gjd_theme") || 'dark';
} catch (e) {
    console.warn("localStorage is blocked or not supported:", e);
}

// Apply saved theme immediately to prevent flashing
if (currentTheme === "light") {
    document.documentElement.setAttribute('data-theme', 'light');
} else {
    document.documentElement.removeAttribute('data-theme');
}

// Playlist Data
function bhajanSrc(file) {
    const base = window.GJD_BASE || "";
    return `${base}assets/bhajans/${file}`;
}

const AMBIENT_CHANT_SRC = "Background.mp3";

function initAmbientAudio() {
    const ambientAudio = document.getElementById("ambient-audio");
    if (ambientAudio) {
        ambientAudio.src = bhajanSrc(AMBIENT_CHANT_SRC);
    }
}

const playlist = [
    {
        title: "Shukrana Tera - Blessings Always",
        artist: "Siddharth Mohan",
        duration: "3:24",
        src: bhajanSrc("shukrana-tera.mp3")
    },
    {
        title: "Tu Maane Ya Na Maane",
        artist: "Siddharth Mohan",
        duration: "6:30",
        src: bhajanSrc("tu-maane-ya-na-maane.mp3")
    },
    {
        title: "Mera Aapki Kripa Se - Guru Jo Dar Rajkot",
        artist: "Sai Bharatlal Ji Masand",
        duration: "4:34",
        src: bhajanSrc("mera-aapki-kripa-se.mp3")
    },
    {
        title: "Maha Aarti - Guru Arjandev Masand Saheb",
        artist: "Sai Bharatlal Ji Masand",
        duration: "7:26",
        src: bhajanSrc("maha-aarti-guru-arjandev.mp3")
    },
    {
        title: "Kar Maher Achi Sabh Te",
        artist: "Sai Bharatlal Ji Masand",
        duration: "5:37",
        src: bhajanSrc("kar-maher-achi-sabh-te.mp3")
    },
    {
        title: "Aarti of Saijan - Sai Rameshlal Ji Masand",
        artist: "Guru Jo Dar Rajkot",
        duration: "6:47",
        src: bhajanSrc("aarti-of-saijan-sai-rameshlal-ji.mp3")
    },
    {
        title: "Wah Guru Guru Jo Dar",
        artist: "Sai Bharatlal Ji Masand",
        duration: "4:01",
        src: bhajanSrc("wah-guru-guru-jo-dar.mp3")
    },
    {
        title: "Palav Saheb (Lord Jhulelal)",
        artist: "Sai Bharatlal Ji Masand",
        duration: "5:25",
        src: bhajanSrc("palav-saheb-lord-jhulelal.mp3")
    },
    {
        title: "Tu Mere Saath Hai Guruji",
        artist: "Siddharth Mohan",
        duration: "3:49",
        src: bhajanSrc("tu-mere-saath-hai-guruji.mp3")
    },
    {
        title: "Mere Satguru Ji Tussi Mehar Karo",
        artist: "Siddharth Mohan",
        duration: "3:32",
        src: bhajanSrc("mere-satguru-ji-tussi-mehar-karo.mp3")
    },
    {
        title: "Hath Guraan Da Guruji - Bade Mandir",
        artist: "Siddharth Mohan",
        duration: "4:28",
        src: bhajanSrc("hath-guraan-da-guruji--siddharth-mohan.mp3")
    },
    {
        title: "Tereya Charana Ch Meri Ardaas Daata Guruji",
        artist: "Siddharth Mohan",
        duration: "6:15",
        src: bhajanSrc("tereya-charana-ch-meri-ardaas.mp3")
    }
];

let currentTrackIndex = 0;
let isPlaying = false;
let audioPlayer = new Audio();
audioPlayer.volume = 0.8;

// Waveform Animation variables
let animationFrameId;
let canvas;
let ctx;
let wavePhase = 0;

/* ==========================================
   DOM CONTENT LOADED INITIALIZER
   ========================================== */
function initApp() {
    initAmbientAudio();

    // Layout chrome (header/footer) may render after this handler on subpages
    const bindChromeControls = () => {
        const header = document.querySelector(".main-header");
        if (header && !header.dataset.scrollBound) {
            header.dataset.scrollBound = "true";
            window.addEventListener("scroll", () => {
                if (window.scrollY > 50) {
                    header.classList.add("scrolled");
                } else if (!document.body.classList.contains("inner-page")) {
                    header.classList.remove("scrolled");
                }
            });
        }

        const mobileMenuToggle = document.getElementById("mobile-menu-toggle");
        const mobileDrawer = document.getElementById("mobile-drawer");
        const mobileDrawerClose = document.getElementById("mobile-drawer-close");

        if (mobileMenuToggle && mobileDrawer && !mobileMenuToggle.dataset.bound) {
            mobileMenuToggle.dataset.bound = "true";
            mobileMenuToggle.addEventListener("click", () => mobileDrawer.classList.add("open"));
            mobileDrawerClose.addEventListener("click", () => mobileDrawer.classList.remove("open"));
        }

        const themeToggle = document.getElementById("theme-toggle");
        if (themeToggle) {
            // Set initial icon to match currentTheme
            themeToggle.innerHTML = currentTheme === 'dark' ? '<i class="fa-solid fa-moon"></i>' : '<i class="fa-solid fa-lightbulb"></i>';
            if (!themeToggle.dataset.bound) {
                themeToggle.dataset.bound = "true";
                themeToggle.addEventListener("click", () => {
                    if (currentTheme === 'dark') {
                        document.documentElement.setAttribute('data-theme', 'light');
                        themeToggle.innerHTML = '<i class="fa-solid fa-lightbulb"></i>';
                        currentTheme = 'light';
                        try {
                            localStorage.setItem("gjd_theme", "light");
                        } catch (e) {
                            console.warn("Could not save theme to localStorage:", e);
                        }
                        showToast("Switched to Light Theme");
                    } else {
                        document.documentElement.removeAttribute('data-theme');
                        themeToggle.innerHTML = '<i class="fa-solid fa-moon"></i>';
                        currentTheme = 'dark';
                        try {
                            localStorage.setItem("gjd_theme", "dark");
                        } catch (e) {
                            console.warn("Could not save theme to localStorage:", e);
                        }
                        showToast("Switched to Dark Theme");
                    }
                });
            }
        }

        const ambientToggle = document.getElementById("ambient-toggle");
        const ambientAudio = document.getElementById("ambient-audio");
        if (ambientToggle && ambientAudio && !ambientToggle.dataset.bound) {
            ambientToggle.dataset.bound = "true";
            const pulseIndicator = ambientToggle.querySelector(".pulse-indicator");
            ambientToggle.addEventListener("click", () => {
        if (isAmbientPlaying) {
            ambientAudio.pause();
            pulseIndicator.classList.remove("active");
            isAmbientPlaying = false;
            showToast("Ambient spiritual background chant paused.");
        } else {
            // Pause the main player if playing
            if (isPlaying) pauseBhajan();
            
            ambientAudio.play().then(() => {
                pulseIndicator.classList.add("active");
                isAmbientPlaying = true;
                showToast("Ambient spiritual background chant playing.");
            }).catch(e => {
                showToast("Please interact with the page to allow audio playback.");
            });
        }
            });
        }
    };

    bindChromeControls();
    document.addEventListener("gjd-layout-ready", bindChromeControls);

    const playlistEl = document.getElementById("playlist");
    if (playlistEl) {
        canvas = document.getElementById("waveform-canvas");
        ctx = canvas ? canvas.getContext("2d") : null;
        renderPlaylist();
        loadTrack(0);
        audioPlayer.addEventListener("timeupdate", updatePlayerProgress);
        audioPlayer.addEventListener("ended", () => nextTrack());

        document.getElementById("play-btn")?.addEventListener("click", togglePlayBhajan);
        document.getElementById("prev-btn")?.addEventListener("click", prevTrack);
        document.getElementById("next-btn")?.addEventListener("click", nextTrack);

        const muteBtn = document.getElementById("mute-btn");
        muteBtn?.addEventListener("click", toggleMute);

        const volumeSlider = document.getElementById("volume-slider");
        volumeSlider?.addEventListener("input", (e) => {
            audioPlayer.volume = e.target.value;
            if (!muteBtn) return;
            if (audioPlayer.volume === 0) {
                muteBtn.innerHTML = '<i class="fa-solid fa-volume-xmark"></i>';
            } else if (audioPlayer.volume < 0.5) {
                muteBtn.innerHTML = '<i class="fa-solid fa-volume-low"></i>';
            } else {
                muteBtn.innerHTML = '<i class="fa-solid fa-volume-high"></i>';
            }
        });

        document.getElementById("progress-bg")?.addEventListener("click", seekAudio);
        resizeCanvas();
        window.addEventListener("resize", resizeCanvas);
        drawWaveform();
    }

    if (document.querySelector(".quote-slide")) {
        startQuoteTicker();
    }

    initGalleryLightbox();

    // 9. Close language dropdown when clicking outside
    document.addEventListener("click", () => {
        const dropdown = document.getElementById("language-dropdown");
        if (dropdown) {
            dropdown.classList.remove("active");
        }
    });

    // Apply saved language on load (without showing a toast)
    if (currentLanguage && ['en', 'hi', 'sd'].includes(currentLanguage)) {
        changeLanguage(currentLanguage, null, false);
    }
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initApp);
} else {
    initApp();
}

/* ==========================================
   TRANSLATION / LOCALIZATION
   ========================================== */
function toggleLangDropdown(event) {
    if (event) {
        event.preventDefault();
        event.stopPropagation();
    }
    const dropdown = document.getElementById("language-dropdown");
    if (dropdown) {
        dropdown.classList.toggle("active");
    }
}

function changeLanguage(langCode, event, showNotification = true) {
    if (event) {
        event.preventDefault();
        event.stopPropagation();
    }

    // Close the dropdown
    const dropdown = document.getElementById("language-dropdown");
    if (dropdown) {
        dropdown.classList.remove("active");
    }

    try {
        localStorage.setItem("gjd_lang", langCode);
    } catch (e) {
        console.warn("Could not save language to localStorage:", e);
    }
    const items = document.querySelectorAll("[data-en]");
    
    items.forEach(el => {
        const text = el.getAttribute(`data-${langCode}`);
        if (text) {
            // Check if element is button or link with standard innerText
            if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
                el.placeholder = text;
            } else {
                // Preserving icon child elements if any
                const icon = el.querySelector("i");
                if (icon) {
                    el.innerHTML = '';
                    const span = document.createElement("span");
                    span.innerText = text + ' ';
                    el.appendChild(span);
                    el.appendChild(icon);
                } else {
                    el.innerText = text;
                }
            }
        }
    });

    // Update current lang text in menu
    const currentLangEl = document.getElementById("current-lang");
    if (currentLangEl) {
        currentLangEl.innerText = langCode.toUpperCase();
    }
    
    if (showNotification) {
        let welcomeMsg = "Language changed successfully.";
        if (langCode === 'hi') welcomeMsg = "भाषा सफलतापूर्वक बदल दी गई है।";
        if (langCode === 'sd') welcomeMsg = "ٻولي ڪاميابيءَ سان تبديل ٿي وئي آهي.";
        showToast(welcomeMsg);
    }
}

function toggleMobileMenu() {
    document.getElementById("mobile-drawer").classList.remove("open");
}

/* ==========================================
   QUOTE TICKER
   ========================================== */
function startQuoteTicker() {
    const slides = document.querySelectorAll(".quote-slide");
    let activeIndex = 0;
    
    setInterval(() => {
        slides[activeIndex].classList.remove("active");
        activeIndex = (activeIndex + 1) % slides.length;
        slides[activeIndex].classList.add("active");
    }, 6000);
}

/* ==========================================
   LEGACY TAB SWITCHING
   ========================================== */
function switchTab(tabId) {
    // Reset active buttons
    const buttons = document.querySelectorAll(".tab-btn");
    buttons.forEach(btn => btn.classList.remove("active"));

    // Find the clicked button and make active
    const activeBtn = Array.from(buttons).find(btn => btn.getAttribute("onclick").includes(tabId));
    if (activeBtn) activeBtn.classList.add("active");

    // Hide all tab content
    const contents = document.querySelectorAll(".tab-content");
    contents.forEach(content => content.classList.remove("active"));

    // Show selected
    document.getElementById(tabId).classList.add("active");
}

function switchMiracleTab(tabId) {
    // Reset active buttons
    const buttons = document.querySelectorAll(".tab-btn-miracles");
    buttons.forEach(btn => btn.classList.remove("active"));

    // Find clicked button and make active
    const activeBtn = Array.from(buttons).find(btn => btn.getAttribute("onclick").includes(tabId));
    if (activeBtn) activeBtn.classList.add("active");

    // Hide all miracle tab content
    const contents = document.querySelectorAll(".tab-content-miracles");
    contents.forEach(content => content.classList.remove("active"));

    // Show selected
    document.getElementById(tabId).classList.add("active");
}

/* ==========================================
   BHAJAN AUDIO PLAYER FUNCTIONS
   ========================================== */
function renderPlaylist() {
    const playlistContainer = document.getElementById("playlist");
    if (!playlistContainer) return;
    playlistContainer.innerHTML = '';

    playlist.forEach((track, index) => {
        const item = document.createElement("li");
        item.className = "playlist-item";
        item.setAttribute("onclick", `selectTrack(${index})`);
        
        item.innerHTML = `
            <div class="track-details">
                <span class="track-index">${(index + 1).toString().padStart(2, '0')}</span>
                <span class="track-title">${track.title}</span>
            </div>
            <span class="track-duration">${track.duration}</span>
        `;
        
        playlistContainer.appendChild(item);
    });
}

function loadTrack(index) {
    currentTrackIndex = index;
    const track = playlist[index];
    
    audioPlayer.src = track.src;
    audioPlayer.load();

    // Update labels
    document.getElementById("player-track-title").innerText = track.title;
    document.getElementById("player-track-artist").innerText = track.artist;
    document.getElementById("total-duration").innerText = track.duration;
    document.getElementById("current-time").innerText = "0:00";
    document.getElementById("progress-fill").style.width = "0%";
    document.getElementById("progress-knob").style.left = "0%";

    // Set active class in playlist
    const listItems = document.querySelectorAll(".playlist-item");
    listItems.forEach(item => item.classList.remove("active"));
    
    if (listItems[index]) {
        listItems[index].classList.add("active");
    }
}

function togglePlayBhajan() {
    if (isPlaying) {
        pauseBhajan();
    } else {
        // Pause ambient audio if it was running
        if (isAmbientPlaying) {
            document.getElementById("ambient-audio").pause();
            document.getElementById("ambient-toggle").querySelector(".pulse-indicator").classList.remove("active");
            isAmbientPlaying = false;
        }

        playBhajan();
    }
}

function playBhajan() {
    audioPlayer.play().then(() => {
        isPlaying = true;
        document.getElementById("play-btn").innerHTML = '<i class="fa-solid fa-pause"></i>';
        document.getElementById("music-disk").classList.add("playing");
        showToast(`Now playing: ${playlist[currentTrackIndex].title}`);
    }).catch(e => {
        showToast("Audio playback blocked. Click play again.");
    });
}

function pauseBhajan() {
    audioPlayer.pause();
    isPlaying = false;
    document.getElementById("play-btn").innerHTML = '<i class="fa-solid fa-play"></i>';
    document.getElementById("music-disk").classList.remove("playing");
}

function selectTrack(index) {
    loadTrack(index);
    playBhajan();
}

function nextTrack() {
    let nextIndex = (currentTrackIndex + 1) % playlist.length;
    loadTrack(nextIndex);
    if (isPlaying) {
        playBhajan();
    } else {
        playBhajan(); // Auto play when switching track
    }
}

function prevTrack() {
    let prevIndex = currentTrackIndex - 1;
    if (prevIndex < 0) prevIndex = playlist.length - 1;
    loadTrack(prevIndex);
    if (isPlaying) {
        playBhajan();
    } else {
        playBhajan();
    }
}

function toggleMute() {
    audioPlayer.muted = !audioPlayer.muted;
    const muteBtn = document.getElementById("mute-btn");
    
    if (audioPlayer.muted) {
        muteBtn.innerHTML = '<i class="fa-solid fa-volume-xmark"></i>';
        showToast("Audio Muted");
    } else {
        muteBtn.innerHTML = '<i class="fa-solid fa-volume-high"></i>';
        showToast("Audio Unmuted");
    }
}

function updatePlayerProgress() {
    const duration = audioPlayer.duration;
    const currentTime = audioPlayer.currentTime;
    
    if (duration) {
        const progressPercent = (currentTime / duration) * 100;
        document.getElementById("progress-fill").style.width = `${progressPercent}%`;
        document.getElementById("progress-knob").style.left = `${progressPercent}%`;
        
        // Update Time displays
        document.getElementById("current-time").innerText = formatTime(currentTime);
        document.getElementById("total-duration").innerText = formatTime(duration);
    }
}

function seekAudio(e) {
    const progressBg = document.getElementById("progress-bg");
    const rect = progressBg.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const width = rect.width;
    const seekTime = (clickX / width) * audioPlayer.duration;
    
    audioPlayer.currentTime = seekTime;
}

function formatTime(seconds) {
    const min = Math.floor(seconds / 60);
    const sec = Math.floor(seconds % 60);
    return `${min}:${sec.toString().padStart(2, '0')}`;
}

/* ==========================================
   WAVEFORM CANVAS VISUALIZER
   ========================================== */
function resizeCanvas() {
    if (!canvas || !canvas.parentElement) return;
    canvas.width = canvas.parentElement.clientWidth;
    canvas.height = canvas.parentElement.clientHeight;
}

function drawWaveform() {
    if (!canvas || !ctx) return;
    animationFrameId = requestAnimationFrame(drawWaveform);
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Aesthetic Styling
    let themeColor = getComputedStyle(document.documentElement).getPropertyValue('--primary-gold').trim();
    if (!themeColor) themeColor = '#D4AF37';

    ctx.strokeStyle = themeColor;
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    
    // Wave configuration
    const numWaves = 3;
    const amplitude = isPlaying ? 25 : 2; // Flat when paused, animated when playing
    const frequency = isPlaying ? 0.04 : 0.01;
    const speed = isPlaying ? 0.08 : 0.005;
    
    wavePhase += speed;

    for (let w = 0; w < numWaves; w++) {
        ctx.beginPath();
        // Lower opacity for background overlapping waves
        ctx.strokeStyle = w === 0 ? themeColor : `rgba(212, 175, 55, ${0.4 - w * 0.15})`;
        ctx.lineWidth = w === 0 ? 3 : 1.5;

        for (let x = 0; x < canvas.width; x++) {
            // Apply a window function (sine) so the wave tapers to 0 at edges
            const taper = Math.sin((x / canvas.width) * Math.PI);
            
            // Multiple overlapping waves with phases
            const y = canvas.height / 2 + 
                      Math.sin(x * frequency + wavePhase + (w * Math.PI / 3)) * 
                      amplitude * taper;
            
            if (x === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }
        ctx.stroke();
    }
}

/* ==========================================
   LIGHTBOX GALLERY
   ========================================== */
function initGalleryLightbox() {
    const lightbox = document.getElementById("lightbox");
    if (!lightbox) return;

    document.querySelectorAll(".gallery-item").forEach((item) => {
        const openFromItem = (event) => {
            if (event.type === "keydown" && event.key !== "Enter" && event.key !== " ") return;
            event.preventDefault();

            const img = item.querySelector("img");
            const src = item.getAttribute("data-full") || (img && (img.currentSrc || img.src));
            if (src) openLightbox(src);
        };

        item.addEventListener("click", openFromItem);
        item.addEventListener("keydown", openFromItem);
    });

    lightbox.querySelector(".lightbox-close")?.addEventListener("click", (e) => {
        e.stopPropagation();
        closeLightbox();
    });

    lightbox.addEventListener("click", (e) => {
        if (e.target === lightbox) closeLightbox();
    });

    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && lightbox.classList.contains("is-open")) closeLightbox();
    });
}

function openLightbox(src) {
    const lightbox = document.getElementById("lightbox");
    const lightboxImg = document.getElementById("lightbox-img");
    if (!lightbox || !lightboxImg) return;

    document.getElementById("lightbox-caption")?.remove();

    lightboxImg.src = src;
    lightboxImg.alt = "";
    lightbox.classList.add("is-open");
    lightbox.setAttribute("aria-hidden", "false");
    document.body.classList.add("lightbox-open");
}

function closeLightbox() {
    const lightbox = document.getElementById("lightbox");
    if (!lightbox) return;

    lightbox.classList.remove("is-open");
    lightbox.setAttribute("aria-hidden", "true");
    document.body.classList.remove("lightbox-open");
}

/* ==========================================
   SEVA MODAL & RECEIPTS
   ========================================== */
function openSevaModal(sevaType) {
    const modal = document.getElementById("seva-modal");
    document.getElementById("seva-modal-title").innerText = `Pledge Support: ${sevaType}`;
    document.getElementById("pledge-type").value = sevaType;

    // Reset Modal Content States
    document.getElementById("seva-pledge-form").classList.remove("hidden");
    document.getElementById("receipt-result").classList.add("hidden");
    
    modal.style.display = "flex";
}

function closeSevaModal() {
    document.getElementById("seva-modal").style.display = "none";
}

function generatePledgeReceipt(event) {
    event.preventDefault();
    
    const name = document.getElementById("pledge-name").value;
    const email = document.getElementById("pledge-email").value;
    const type = document.getElementById("pledge-type").value;
    const details = document.getElementById("pledge-amount").value;
    
    // Fill receipt details
    document.getElementById("r-name").innerText = name;
    document.getElementById("r-email").innerText = email;
    document.getElementById("r-type").innerText = type;
    document.getElementById("r-details").innerText = details;
    
    // Generate a random high-fidelity receipt ID
    const randomId = "GJD-2026-" + Math.floor(1000 + Math.random() * 9000);
    document.getElementById("r-id").innerText = randomId;
    
    // Toggle displays inside modal
    document.getElementById("seva-pledge-form").classList.add("hidden");
    document.getElementById("receipt-result").classList.remove("hidden");
    
    showToast(`Thank you ${name}! Seva Pledge registered successfully.`);
}

/* ==========================================
   SUPPORT US & DONATION SYSTEM
   ========================================== */
function selectAmount(amount) {
    const presetCards = document.querySelectorAll(".amount-card");
    presetCards.forEach(card => {
        if (card.textContent === `₹${amount}`) {
            card.classList.add("active");
        } else {
            card.classList.remove("active");
        }
    });
    const amountInput = document.getElementById("donation-amount");
    if (amountInput) {
        amountInput.value = amount;
    }
}

function clearPresetAmounts() {
    const presetCards = document.querySelectorAll(".amount-card");
    presetCards.forEach(card => card.classList.remove("active"));
}

function copyToClipboard(text, label) {
    if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text).then(() => {
            showToast(`${label} Copied Successfully`);
        }).catch(err => {
            console.error("Failed to copy text: ", err);
            fallbackCopyText(text, label);
        });
    } else {
        fallbackCopyText(text, label);
    }
}

function fallbackCopyText(text, label) {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";  // Avoid scrolling to bottom
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
        document.execCommand('copy');
        showToast(`${label} Copied Successfully`);
    } catch (err) {
        console.error('Fallback copy failed', err);
    }
    document.body.removeChild(textArea);
}

function handleDonationSubmit(event) {
    event.preventDefault();

    const name = document.getElementById("donor-name").value.trim();
    const phone = document.getElementById("donor-phone").value.trim();
    const email = document.getElementById("donor-email").value.trim();
    const city = document.getElementById("donor-city").value.trim();
    const state = document.getElementById("donor-state").value.trim();
    const country = document.getElementById("donor-country").value;
    const amount = parseFloat(document.getElementById("donation-amount").value);
    const purpose = document.getElementById("donation-purpose").value;
    const message = document.getElementById("donation-message").value.trim();

    // Basic Validations
    if (!name) {
        alert("Please enter your full name.");
        return;
    }
    if (!phone || !/^\d{10}$/.test(phone)) {
        alert("Please enter a valid 10-digit mobile number.");
        return;
    }
    if (isNaN(amount) || amount <= 0) {
        alert("Donation amount must be greater than ₹0.");
        return;
    }
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        alert("Please enter a valid email address.");
        return;
    }

    // Prevent Duplicate Submissions (Disable button & show loading state)
    const submitBtn = document.getElementById("submit-btn");
    const originalBtnContent = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = `<span class="spinner"></span> <span>Processing...</span>`;

    // Simulate Payment processing delay (UPI/Razorpay placeholder)
    setTimeout(() => {
        const randomId = Math.floor(100000 + Math.random() * 900000);
        const donationId = "GJD-DON-" + randomId;
        const txnId = "GJD-TXN-" + randomId;
        const now = new Date();
        const dateStr = now.toLocaleDateString() + " " + now.toLocaleTimeString();

        // Create new donation object
        const newDonation = {
            id: donationId,
            name: name,
            phone: phone,
            email: email || "N/A",
            city: city || "N/A",
            state: state || "N/A",
            country: country,
            amount: amount,
            purpose: purpose,
            message: message || "N/A",
            status: "Completed",
            txnId: txnId,
            dateTime: dateStr,
            rawDate: now.getTime()
        };

        // Save to Database (localStorage)
        let donations = [];
        try {
            const saved = localStorage.getItem("gjd_donations");
            if (saved) {
                donations = JSON.parse(saved);
            }
        } catch (e) {
            console.warn("localStorage read failed:", e);
        }
        donations.unshift(newDonation);
        try {
            localStorage.setItem("gjd_donations", JSON.stringify(donations));
        } catch (e) {
            console.warn("localStorage write failed:", e);
        }

        // Reset submit button state
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnContent;

        // Show Success Overlay Modal
        const successOverlay = document.getElementById("success-overlay");
        if (successOverlay) {
            successOverlay.style.display = "flex";
        }

        showToast(`Thank you, donation of ₹${amount} received successfully.`);
    }, 1500);
}

function closeDonationSuccess() {
    const successOverlay = document.getElementById("success-overlay");
    if (successOverlay) {
        successOverlay.style.display = "none";
    }
    const form = document.getElementById("donation-form");
    if (form) {
        form.reset();
    }
    clearPresetAmounts();
}

/* ==========================================
   DONATION MANAGEMENT (ADMIN DASHBOARD)
   ========================================== */
const MOCK_DONATIONS = [
    {
        id: "GJD-DON-928401",
        name: "Ramesh Sharma",
        phone: "9876543210",
        email: "ramesh.sharma@gmail.com",
        city: "Rajkot",
        state: "Gujarat",
        country: "India",
        amount: 501,
        purpose: "Langar Seva",
        message: "Blessings for the family",
        status: "Completed",
        txnId: "GJD-TXN-928401",
        dateTime: "06/28/2026 11:30:15 AM",
        rawDate: 1782635415000
    },
    {
        id: "GJD-DON-748201",
        name: "Pooja Masand",
        phone: "9123456789",
        email: "pooja.masand@yahoo.com",
        city: "Bhopal",
        state: "Madhya Pradesh",
        country: "India",
        amount: 2501,
        purpose: "Temple Development",
        message: "In memory of late grandparents",
        status: "Completed",
        txnId: "GJD-TXN-748201",
        dateTime: "06/27/2026 05:45:20 PM",
        rawDate: 1782571520000
    },
    {
        id: "GJD-DON-362810",
        name: "Kabir Advani",
        phone: "9988776655",
        email: "kabir_advani@outlook.com",
        city: "Orlando",
        state: "Florida",
        country: "United States",
        amount: 1001,
        purpose: "Education Support",
        message: "Keep up the noble work!",
        status: "Completed",
        txnId: "GJD-TXN-362810",
        dateTime: "06/26/2026 09:15:00 AM",
        rawDate: 1782453300000
    },
    {
        id: "GJD-DON-524901",
        name: "Neha Nanwani",
        phone: "9624217247",
        email: "nehananwani@gmail.com",
        city: "Haridwar",
        state: "Uttarakhand",
        country: "India",
        amount: 101,
        purpose: "General Donation",
        message: "Jai Baba Mulram Saheb",
        status: "Completed",
        txnId: "GJD-TXN-524901",
        dateTime: "06/25/2026 08:30:45 PM",
        rawDate: 1782408645000
    },
    {
        id: "GJD-DON-128472",
        name: "Anil Masand",
        phone: "9090100159",
        email: "anilmasand@gmail.com",
        city: "Nandurbar",
        state: "Maharashtra",
        country: "India",
        amount: 5001,
        purpose: "Medical Assistance",
        message: "Langar and Medical Seva support",
        status: "Completed",
        txnId: "GJD-TXN-128472",
        dateTime: "06/24/2026 02:15:10 PM",
        rawDate: 1782299710000
    }
];

let adminDonations = [];
let filteredDonations = [];
let sortField = "date";
let sortDirection = "desc";
let currentPage = 1;
const itemsPerPage = 5;

function initAdminDashboard() {
    try {
        const saved = localStorage.getItem("gjd_donations");
        if (saved) {
            adminDonations = JSON.parse(saved);
        } else {
            adminDonations = [...MOCK_DONATIONS];
            localStorage.setItem("gjd_donations", JSON.stringify(adminDonations));
        }
    } catch (e) {
        console.warn("Could not read/write local storage admin init:", e);
        adminDonations = [...MOCK_DONATIONS];
    }
    
    filteredDonations = [...adminDonations];
    applySort();
    renderAdminTable();
}

function renderAdminTable() {
    const tableBody = document.getElementById("donations-table-body");
    if (!tableBody) return;

    tableBody.innerHTML = "";

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, filteredDonations.length);
    const paginatedItems = filteredDonations.slice(startIndex, endIndex);

    if (paginatedItems.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="7" class="text-center" style="padding: 30px; color: var(--text-muted);">No donations found matching criteria.</td></tr>`;
        document.getElementById("pagination-stats").innerText = "Showing 0 to 0 of 0 entries";
        renderAdminPagination(0);
        return;
    }

    paginatedItems.forEach(item => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td style="font-weight: 600;">${item.id}</td>
            <td>
                <div style="font-weight: 600;">${item.name}</div>
                <div style="font-size: 0.8rem; color: var(--text-muted);">${item.phone}</div>
            </td>
            <td style="font-weight: 700; color: var(--primary-gold);">₹${item.amount}</td>
            <td>${item.purpose}</td>
            <td><span class="status-badge ${item.status.toLowerCase()}">${item.status}</span></td>
            <td style="font-size: 0.85rem; color: var(--text-muted);">${item.dateTime}</td>
            <td>
                <button type="button" class="btn-view-details" onclick="viewDonationDetails('${item.id}')">
                    <i class="fa-solid fa-eye"></i> View
                </button>
            </td>
        `;
        tableBody.appendChild(row);
    });

    document.getElementById("pagination-stats").innerText = `Showing ${startIndex + 1} to ${endIndex} of ${filteredDonations.length} entries`;
    
    const totalPages = Math.ceil(filteredDonations.length / itemsPerPage);
    renderAdminPagination(totalPages);
}

function renderAdminPagination(totalPages) {
    const controls = document.getElementById("pagination-controls-wrapper");
    if (!controls) return;

    controls.innerHTML = "";

    if (totalPages <= 1) return;

    // Previous Button
    const prevBtn = document.createElement("button");
    prevBtn.className = "btn-page";
    prevBtn.disabled = currentPage === 1;
    prevBtn.innerHTML = `<i class="fa-solid fa-chevron-left"></i>`;
    prevBtn.onclick = () => {
        if (currentPage > 1) {
            currentPage--;
            renderAdminTable();
        }
    };
    controls.appendChild(prevBtn);

    // Page Buttons
    for (let i = 1; i <= totalPages; i++) {
        const pageBtn = document.createElement("button");
        pageBtn.className = `btn-page ${i === currentPage ? 'active' : ''}`;
        pageBtn.innerText = i;
        pageBtn.onclick = () => {
            currentPage = i;
            renderAdminTable();
        };
        controls.appendChild(pageBtn);
    }

    // Next Button
    const nextBtn = document.createElement("button");
    nextBtn.className = "btn-page";
    nextBtn.disabled = currentPage === totalPages;
    nextBtn.innerHTML = `<i class="fa-solid fa-chevron-right"></i>`;
    nextBtn.onclick = () => {
        if (currentPage < totalPages) {
            currentPage++;
            renderAdminTable();
        }
    };
    controls.appendChild(nextBtn);
}

function handleAdminSearch() {
    const query = document.getElementById("admin-search").value.toLowerCase().trim();
    currentPage = 1;
    applyFilterAndSearch(query);
}

function handleAdminFilter() {
    currentPage = 1;
    const query = document.getElementById("admin-search").value.toLowerCase().trim();
    applyFilterAndSearch(query);
}

function applyFilterAndSearch(searchQuery) {
    const purposeVal = document.getElementById("filter-purpose").value;
    const statusVal = document.getElementById("filter-status").value;

    filteredDonations = adminDonations.filter(item => {
        const matchesSearch = !searchQuery || 
            item.name.toLowerCase().includes(searchQuery) ||
            item.phone.toLowerCase().includes(searchQuery) ||
            item.email.toLowerCase().includes(searchQuery) ||
            item.id.toLowerCase().includes(searchQuery) ||
            item.txnId.toLowerCase().includes(searchQuery);

        const matchesPurpose = !purposeVal || item.purpose === purposeVal;
        const matchesStatus = !statusVal || item.status === statusVal;

        return matchesSearch && matchesPurpose && matchesStatus;
    });

    applySort();
    renderAdminTable();
}

function sortTable(field) {
    if (sortField === field) {
        sortDirection = sortDirection === "asc" ? "desc" : "asc";
    } else {
        sortField = field;
        sortDirection = "asc";
    }

    // Update Sorting Icons
    const fields = ["id", "name", "amount", "purpose", "status", "date"];
    fields.forEach(f => {
        const icon = document.getElementById(`sort-icon-${f}`);
        if (icon) {
            if (f === field) {
                icon.className = sortDirection === "asc" ? "fa-solid fa-sort-up" : "fa-solid fa-sort-down";
            } else {
                icon.className = "fa-solid fa-sort";
            }
        }
    });

    applySort();
    renderAdminTable();
}

function applySort() {
    filteredDonations.sort((a, b) => {
        let valA, valB;
        if (sortField === "amount") {
            valA = a.amount;
            valB = b.amount;
        } else if (sortField === "date") {
            valA = a.rawDate || 0;
            valB = b.rawDate || 0;
        } else if (sortField === "id") {
            valA = a.id;
            valB = b.id;
        } else if (sortField === "name") {
            valA = a.name.toLowerCase();
            valB = b.name.toLowerCase();
        } else if (sortField === "purpose") {
            valA = a.purpose.toLowerCase();
            valB = b.purpose.toLowerCase();
        } else {
            valA = a.status.toLowerCase();
            valB = b.status.toLowerCase();
        }

        if (valA < valB) return sortDirection === "asc" ? -1 : 1;
        if (valA > valB) return sortDirection === "asc" ? 1 : -1;
        return 0;
    });
}

function viewDonationDetails(id) {
    const item = adminDonations.find(d => d.id === id);
    if (!item) return;

    const modal = document.getElementById("details-modal");
    const container = document.getElementById("modal-details-content");

    if (modal && container) {
        container.innerHTML = `
            <div class="admin-detail-item">
                <div class="admin-detail-label">Donation ID</div>
                <div class="admin-detail-value">${item.id}</div>
            </div>
            <div class="admin-detail-item">
                <div class="admin-detail-label">Transaction ID</div>
                <div class="admin-detail-value">${item.txnId}</div>
            </div>
            <div class="admin-detail-item">
                <div class="admin-detail-label">Donor Name</div>
                <div class="admin-detail-value">${item.name}</div>
            </div>
            <div class="admin-detail-item">
                <div class="admin-detail-label">Mobile Number</div>
                <div class="admin-detail-value">${item.phone}</div>
            </div>
            <div class="admin-detail-item">
                <div class="admin-detail-label">Email Address</div>
                <div class="admin-detail-value">${item.email}</div>
            </div>
            <div class="admin-detail-item">
                <div class="admin-detail-label">Donation Amount</div>
                <div class="admin-detail-value" style="color: var(--primary-gold); font-weight: 700;">₹${item.amount}</div>
            </div>
            <div class="admin-detail-item">
                <div class="admin-detail-label">Purpose</div>
                <div class="admin-detail-value">${item.purpose}</div>
            </div>
            <div class="admin-detail-item">
                <div class="admin-detail-label">Payment Status</div>
                <div class="admin-detail-value"><span class="status-badge ${item.status.toLowerCase()}">${item.status}</span></div>
            </div>
            <div class="admin-detail-item">
                <div class="admin-detail-label">Location</div>
                <div class="admin-detail-value">${item.city}, ${item.state}, ${item.country}</div>
            </div>
            <div class="admin-detail-item">
                <div class="admin-detail-label">Date & Time</div>
                <div class="admin-detail-value">${item.dateTime}</div>
            </div>
            <div class="admin-detail-item">
                <div class="admin-detail-label">Message</div>
                <div class="admin-detail-value" style="white-space: pre-line;">${item.message}</div>
            </div>
        `;
        modal.style.display = "flex";
    }
}

function closeDetailsModal() {
    const modal = document.getElementById("details-modal");
    if (modal) modal.style.display = "none";
}

function exportToExcel() {
    if (filteredDonations.length === 0) {
        showToast("No records available to export");
        return;
    }

    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Donation ID,Donor Name,Mobile,Email,City,State,Country,Amount,Purpose,Status,Transaction ID,Date & Time,Message\n";

    filteredDonations.forEach(item => {
        const row = [
            `"${item.id}"`,
            `"${item.name.replace(/"/g, '""')}"`,
            `"${item.phone}"`,
            `"${item.email.replace(/"/g, '""')}"`,
            `"${item.city.replace(/"/g, '""')}"`,
            `"${item.state.replace(/"/g, '""')}"`,
            `"${item.country}"`,
            item.amount,
            `"${item.purpose}"`,
            `"${item.status}"`,
            `"${item.txnId}"`,
            `"${item.dateTime}"`,
            `"${item.message.replace(/"/g, '""').replace(/\n/g, ' ')}"`
        ].join(",");
        csvContent += row + "\n";
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Guru_Jo_Dar_Donations_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("Exported to Excel (CSV) successfully");
}

function exportToPDF() {
    window.print();
}

/* ==========================================
   TOAST NOTIFICATION ENGINE
   ========================================== */
function showToast(message) {
    const container = document.getElementById("toast-container");
    
    const toast = document.createElement("div");
    toast.className = "toast";
    toast.innerHTML = `
        <i class="fa-solid fa-bell toast-icon"></i>
        <span class="toast-message">${message}</span>
    `;
    
    container.appendChild(toast);
    
    // Trigger slide-in and timer to fade out
    setTimeout(() => {
        toast.classList.add("removing");
        toast.addEventListener("animationend", () => {
            toast.remove();
        });
    }, 3500);
}

// Explicit Window Bindings for Global/Inline Event Handlers
window.toggleLangDropdown = toggleLangDropdown;
window.changeLanguage = changeLanguage;
window.toggleMobileMenu = toggleMobileMenu;
window.switchTab = switchTab;
window.switchMiracleTab = switchMiracleTab;
window.selectTrack = selectTrack;
window.closeSevaModal = closeSevaModal;
window.openSevaModal = openSevaModal;
window.generatePledgeReceipt = generatePledgeReceipt;
window.togglePlayBhajan = togglePlayBhajan;
window.prevTrack = prevTrack;
window.nextTrack = nextTrack;
window.toggleMute = toggleMute;
window.seekAudio = seekAudio;
window.showToast = showToast;
window.selectAmount = selectAmount;
window.clearPresetAmounts = clearPresetAmounts;
window.copyToClipboard = copyToClipboard;
window.handleDonationSubmit = handleDonationSubmit;
window.closeDonationSuccess = closeDonationSuccess;
window.initAdminDashboard = initAdminDashboard;
window.renderAdminTable = renderAdminTable;
window.handleAdminSearch = handleAdminSearch;
window.handleAdminFilter = handleAdminFilter;
window.sortTable = sortTable;
window.viewDonationDetails = viewDonationDetails;
window.closeDetailsModal = closeDetailsModal;
window.exportToExcel = exportToExcel;
window.exportToPDF = exportToPDF;
