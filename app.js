/* ==========================================
   APP STATE & INITIALIZATION
   ========================================== */
let currentLanguage = localStorage.getItem("gjd_lang") || 'en';
let currentTheme = localStorage.getItem("gjd_theme") || 'dark';
let isAmbientPlaying = false;

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
                        localStorage.setItem("gjd_theme", "light");
                        showToast("Switched to Light Theme");
                    } else {
                        document.documentElement.removeAttribute('data-theme');
                        themeToggle.innerHTML = '<i class="fa-solid fa-moon"></i>';
                        currentTheme = 'dark';
                        localStorage.setItem("gjd_theme", "dark");
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

    currentLanguage = langCode;
    localStorage.setItem("gjd_lang", langCode);
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
   ARDAAS FORM SUBMISSION
   ========================================== */
function handleArdaasSubmit(event) {
    event.preventDefault();
    
    const name = document.getElementById("ardaas-name").value;
    const email = document.getElementById("ardaas-email").value;
    const phone = document.getElementById("ardaas-phone").value;
    const msg = document.getElementById("ardaas-message").value;
    
    // Visualizing Success Overlay (ripple & modal zoom)
    const successOverlay = document.getElementById("success-overlay");
    successOverlay.style.display = "flex";
    
    showToast(`Ardaas submitted successfully for ${name}.`);
}

function closeSuccessCard() {
    document.getElementById("success-overlay").style.display = "none";
    // Reset Form
    document.getElementById("ardaas-form").reset();
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
window.closeSuccessCard = closeSuccessCard;
window.closeSevaModal = closeSevaModal;
window.openSevaModal = openSevaModal;
window.generatePledgeReceipt = generatePledgeReceipt;
window.handleArdaasSubmit = handleArdaasSubmit;
window.togglePlayBhajan = togglePlayBhajan;
window.prevTrack = prevTrack;
window.nextTrack = nextTrack;
window.toggleMute = toggleMute;
window.seekAudio = seekAudio;
window.showToast = showToast;

