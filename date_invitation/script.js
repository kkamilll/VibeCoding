document.addEventListener('DOMContentLoaded', () => {
    /* ==========================================================================
       LANGUAGE LOGIC
       ========================================================================== */
    let currentLang = 'en';
    const langToggleBtn = document.getElementById('lang-toggle');
    const langCodeSpan = document.getElementById('lang-code');
    const noBtn = document.getElementById('no-btn');

    function updateLanguageUI() {
        langCodeSpan.textContent = currentLang.toUpperCase();
        document.querySelectorAll('[data-en]').forEach(el => {
            el.innerHTML = el.getAttribute(`data-${currentLang}`);
        });
        
        // Update page title
        const pageTitle = document.getElementById('page-title');
        if(pageTitle) {
            pageTitle.textContent = currentLang === 'en' ? 'I have a question for you... ✨' : 'Mam do Ciebie pytanie... ✨';
        }
    }

    langToggleBtn.addEventListener('click', () => {
        currentLang = currentLang === 'en' ? 'pl' : 'en';
        updateLanguageUI();
        noBtn.textContent = currentLang === 'en' ? 'NO 😢' : 'NIE 😢';
        dodgeCount = 0;
    });

    /* ==========================================================================
       DOM ELEMENTS
       ========================================================================== */
    const introScreen = document.getElementById('intro-screen');
    const inviteScreen = document.getElementById('invite-screen');
    const planScreen = document.getElementById('plan-screen');
    const finalScreen = document.getElementById('final-screen');

    const startBtn = document.getElementById('start-btn');
    const yesBtn = document.getElementById('yes-btn');
    const submitPlanBtn = document.getElementById('submit-plan-btn');
    const restartBtn = document.getElementById('restart-btn');
    const sendWhatsappBtn = document.getElementById('send-whatsapp-btn');
    const sendSmsBtn = document.getElementById('send-sms-btn');

    // Date & Time form inputs
    const plannerForm = document.getElementById('date-planner-form');
    const customDayRadio = document.getElementById('custom-day-radio');
    const customDateContainer = document.getElementById('custom-date-container');
    const customDateInput = document.getElementById('custom-date-input');
    const customTimeContainer = document.getElementById('custom-time-container');
    const customTimeInput = document.getElementById('custom-time-input');
    const timePresetBtns = document.querySelectorAll('.time-preset-btn');
    const summaryText = document.getElementById('summary-text');

    let chosenTime = '18:00'; // Default time preset

    /* ==========================================================================
       FLOATING HEARTS GENERATOR
       ========================================================================== */
    const heartsContainer = document.getElementById('hearts-container');
    
    function createHeart() {
        const heart = document.createElement('div');
        heart.classList.add('floating-heart');
        heart.innerHTML = '❤️';
        
        // Random horizontal start, size, and duration
        const startX = Math.random() * 100; // in %
        const size = Math.random() * 1.5 + 0.8; // in rem (0.8rem to 2.3rem)
        const duration = Math.random() * 5 + 5; // 5s to 10s
        const delay = Math.random() * 3; // up to 3s delay
        
        heart.style.left = `${startX}%`;
        heart.style.fontSize = `${size}rem`;
        heart.style.animationDuration = `${duration}s`;
        heart.style.animationDelay = `${delay}s`;
        
        // Slightly vary color using CSS filter (hue-rotate)
        const hue = Math.floor(Math.random() * 30) - 15; // -15deg to +15deg
        heart.style.filter = `hue-rotate(${hue}deg)`;
        
        heartsContainer.appendChild(heart);
        
        // Clean up DOM after animation completes
        setTimeout(() => {
            heart.remove();
        }, (duration + delay) * 1000);
    }

    // Start generating hearts
    setInterval(createHeart, 500);
    // Create initial hearts so the screen isn't empty at start
    for (let i = 0; i < 10; i++) {
        createHeart();
    }

    /* ==========================================================================
       SCREEN TRANSITIONS
       ========================================================================== */
    function showScreen(screenToShow) {
        // Hide all screens
        [introScreen, inviteScreen, planScreen, finalScreen].forEach(screen => {
            screen.classList.remove('active');
        });
        // Show the requested one
        screenToShow.classList.add('active');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    startBtn.addEventListener('click', () => {
        showScreen(inviteScreen);
    });

    /* ==========================================================================
       "NO" BUTTON DODGE LOGIC
       ========================================================================== */
    let dodgeCount = 0;
    const noBtnTexts = {
        en: [
            "Are you sure? 🥺",
            "Think again... 💖",
            "Oh come on! 😂",
            "Think about it! 🤫",
            "I'll give you chocolates! 🍫",
            "You won't click me! 😜",
            "Still trying? 😏",
            "I'll cry... 😭",
            "Oh please... 👉👈",
            "Click YES! 🥰"
        ],
        pl: [
            "Na pewno? 🥺",
            "Pomyśl jeszcze raz... 💖",
            "Oj weź! 😂",
            "Zastanów się! 🤫",
            "Dam Ci czekoladki! 🍫",
            "Nie klikniesz mnie! 😜",
            "Ciągle próbujesz? 😏",
            "Będę płakać... 😭",
            "Oj no weeeź... 👉👈",
            "Kliknij TAK! 🥰"
        ]
    };

    function dodgeButton() {
        noBtn.style.position = 'fixed';
        noBtn.style.zIndex = '999';
        
        // Change text to something funny
        const texts = noBtnTexts[currentLang];
        noBtn.textContent = texts[dodgeCount % texts.length];
        dodgeCount++;
        
        const btnWidth = noBtn.offsetWidth;
        const btnHeight = noBtn.offsetHeight;
        
        const pad = 25;
        const maxX = window.innerWidth - btnWidth - pad;
        const maxY = window.innerHeight - btnHeight - pad;
        
        // Keep it within screen bounds
        const randomX = Math.max(pad, Math.floor(Math.random() * maxX));
        const randomY = Math.max(pad, Math.floor(Math.random() * maxY));
        
        noBtn.style.left = `${randomX}px`;
        noBtn.style.top = `${randomY}px`;
    }

    // Trigger on both mouse enter and touch start
    noBtn.addEventListener('mouseenter', dodgeButton);
    noBtn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        dodgeButton();
    });

    // Failsafe in case they manage to click it
    noBtn.addEventListener('click', (e) => {
        e.preventDefault();
        dodgeButton();
        alert(currentLang === 'en' ? "Nice try, but the answer is YES! 😉💖" : "Ładna próba, ale odpowiedź brzmi TAK! 😉💖");
    });

    /* ==========================================================================
       "YES" BUTTON CELEBRATION
       ========================================================================== */
    yesBtn.addEventListener('click', () => {
        // Trigger high energy confetti
        launchConfetti();
        
        // Wait a short moment to let them enjoy the confetti before moving to planning
        setTimeout(() => {
            showScreen(planScreen);
            // Re-trigger a gentle confetti burst
            confetti({
                particleCount: 50,
                angle: 60,
                spread: 55,
                origin: { x: 0 }
            });
            confetti({
                particleCount: 50,
                angle: 120,
                spread: 55,
                origin: { x: 1 }
            });
        }, 1500);
    });

    function launchConfetti() {
        const duration = 2.5 * 1000;
        const end = Date.now() + duration;

        (function frame() {
            confetti({
                particleCount: 4,
                angle: 60,
                spread: 60,
                origin: { x: 0, y: 0.8 }
            });
            confetti({
                particleCount: 4,
                angle: 120,
                spread: 60,
                origin: { x: 1, y: 0.8 }
            });

            if (Date.now() < end) {
                requestAnimationFrame(frame);
            }
        }());
    }

    /* ==========================================================================
       DATE PLANNING FORM INTERACTION
       ========================================================================== */
    // Monitor day selections to show/hide custom date picker
    const dayRadios = document.querySelectorAll('input[name="day"]');
    dayRadios.forEach(radio => {
        radio.addEventListener('change', (e) => {
            if (e.target.id === 'custom-day-radio') {
                customDateContainer.style.display = 'block';
                // Set default custom date to tomorrow
                const tomorrow = new Date();
                tomorrow.setDate(tomorrow.getDate() + 1);
                customDateInput.value = tomorrow.toISOString().split('T')[0];
                customDateInput.min = new Date().toISOString().split('T')[0]; // Can't select past
            } else {
                customDateContainer.style.display = 'none';
            }
        });
    });

    // Time presets management
    timePresetBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active status
            timePresetBtns.forEach(b => b.classList.remove('active'));
            // Add active status to clicked
            btn.classList.add('active');
            
            const selectedVal = btn.getAttribute('data-time');
            if (selectedVal === 'custom') {
                customTimeContainer.style.display = 'block';
                chosenTime = customTimeInput.value;
            } else {
                customTimeContainer.style.display = 'none';
                chosenTime = selectedVal;
            }
        });
    });

    customTimeInput.addEventListener('input', (e) => {
        chosenTime = e.target.value;
    });

    /* ==========================================================================
       PLAN FORM SUBMIT
       ========================================================================== */
    submitPlanBtn.addEventListener('click', (e) => {
        e.preventDefault();
        
        // 1. Get Activity
        const activityVal = document.querySelector('input[name="activity"]:checked').value;
        const mapActivity = {
            coffee: { en: "delicious coffee and dessert", pl: "pyszną kawę i deser" },
            dinner: { en: "romantic dinner", pl: "romantyczną kolację" },
            walk: { en: "walk and ice cream", pl: "spacer i lody" },
            surprise: { en: "surprise date", pl: "randkę-niespodziankę" }
        };
        const activityStr = currentLang === 'en' ? mapActivity[activityVal].en : mapActivity[activityVal].pl;
        
        // 2. Get Day
        const dayRadio = document.querySelector('input[name="day"]:checked');
        let dayString = '';
        if (dayRadio.id === 'custom-day-radio') {
            const rawDate = customDateInput.value;
            if (rawDate) {
                const dateObj = new Date(rawDate);
                const options = { weekday: 'long', month: 'long', day: 'numeric' };
                if (currentLang === 'en') {
                    dayString = `on ${dateObj.toLocaleDateString('en-US', options)}`;
                } else {
                    dayString = `w ${dateObj.toLocaleDateString('pl-PL', options)}`;
                }
            } else {
                dayString = currentLang === 'en' ? "on the selected date" : "w wybranym terminie";
            }
        } else {
            const mapDay = {
                friday: { en: "this coming Friday", pl: "najbliższy piątek" },
                saturday: { en: "this coming Saturday", pl: "najbliższą sobotę" },
                sunday: { en: "this coming Sunday", pl: "najbliższą niedzielę" }
            };
            dayString = currentLang === 'en' ? mapDay[dayRadio.value].en : `w ${mapDay[dayRadio.value].pl}`;
        }
        
        // 3. Get Time
        const timeString = chosenTime;

        let waMsg;
        if (currentLang === 'en') {
            summaryText.innerHTML = `<strong>What:</strong> For ${activityStr}<br>
                                    <strong>When:</strong> ${dayString.replace(/^on\s+/, '')}<br>
                                    <strong>At what time:</strong> at ${timeString}`;
            waMsg = `Hey! Date invitation accepted! 😍\n\nDate plan:\n✨ We are going for ${activityStr}\n📅 ${dayString}\n⏰ Time: ${timeString}\n\nCan't wait! 🥰`;
        } else {
            summaryText.innerHTML = `<strong>Co:</strong> Na ${activityStr}<br>
                                    <strong>Kiedy:</strong> ${dayString.replace(/^w\s+/, '')}<br>
                                    <strong>O której:</strong> o ${timeString}`;
            waMsg = `Hej! Zaproszenie na randkę przyjęte! 😍\n\nPlan spotkania:\n✨ Idziemy na ${activityStr}\n📅 ${dayString}\n⏰ Godzina: ${timeString}\n\nJuż nie mogę się doczekać! 🥰`;
        }
        
        showScreen(finalScreen);
        launchConfetti(); // Celebration burst!

        sendWhatsappBtn.onclick = () => {
            const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(waMsg)}`;
            window.open(url, '_blank');
        };

        sendSmsBtn.onclick = () => {
            // Use standard RFC 5724 format for SMS links, works best on modern iOS and Android
            const url = `sms:?body=${encodeURIComponent(waMsg)}`;
            window.open(url, '_blank');
        };
    });

    /* ==========================================================================
       RESET BUTTON
       ========================================================================== */
    restartBtn.addEventListener('click', () => {
        // Reset "no" button styling and text
        noBtn.style.position = 'static';
        noBtn.style.left = 'auto';
        noBtn.style.top = 'auto';
        noBtn.textContent = currentLang === 'en' ? 'NO 😢' : 'NIE 😢';
        dodgeCount = 0;
        
        // Go back to the planning screen
        showScreen(planScreen);
    });
});
