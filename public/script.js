// Bilingual UI: all visible site copy switches between Uzbek and English.
    const translations = {
      uz: {
        pageTitle: "Nebulix.dev — Chegaralardan tashqarida",
        navHome: "Bosh sahifa", navProjects: "Loyihalar", navServices: "Xizmatlar", navAbout: "Men haqimda", navContact: "Bog‘lanish ↗",
        eyebrow: "MUSTAQIL WEB DASTURCHI",
        heroTitle: "Kelajakni loyihala.<br><span class=\"gradient\">Chegaralardan tashqarida yarat.</span>",
        heroCopy: "Men Nebulix — zamonaviy web tajribalar, futuristik interfeyslar va esda qoladigan raqamli mahsulotlar yaratishga intiluvchi dasturchiman.",
        heroProjects: "Loyihalarni ko‘rish ↗", heroAbout: "Men haqimda ↓",
        meta1: "KREATIV DASTURLASH", meta2: "NEON ESTETIKA", meta3: "MOSLASHUVCHAN UI",
        projectsKicker: "01 / TANLANGAN ISHLAR",
        projectsTitle: "G‘oyalardan yaralgan<span class=\"gradient\">.</span>",
        projectsDesc: "Bu namunaviy loyihalar. Ularni o‘zingizning haqiqiy ishlaringiz bilan almashtirishingiz mumkin.",
        projectLink: "LOYIHANGIZ BORMI? ↗",
        project1Desc: "Neon aksentlar va silliq interaktiv effektlarga ega futuristik landing page konsepti.",
        project2Desc: "Toza kompozitsiya va yorqin cyan effektlariga ega dashboard konsepti.",
        project3Desc: "Premium brend uchun kreativ web sahifa va vizual hikoya.",
        project4Desc: "Minimalistik tipografiya, qoramtir ranglar va neon mikrointeraksiyalar.",
        servicesKicker: "02 / XIZMATLARIM",
        servicesTitle: "Maqsad bilan yaratilgan<span class=\"gradient\">.</span>",
        servicesDesc: "Kuchli web tajriba dizayn va kod bir-birini to‘ldirgan joyda boshlanadi.",
        service1Title: "Web dasturlash", service1Desc: "Tezkor, moslashuvchan va barcha ekranlarda qulay ishlaydigan web-saytlar.",
        service2Title: "Interfeys dizayni", service2Desc: "Dark UI, neon estetika, premium kompozitsiya va qulay foydalanuvchi tajribasi.",
        service3Title: "Kreativ g‘oyalar", service3Desc: "Brendni ajratib ko‘rsatadigan o‘ziga xos vizual g‘oyalar va prototiplar.",
        aboutKicker: "03 / DASTURCHI HAQIDA", aboutTitle: "Salom, men <span class=\"gradient\">Ʌnvarbek Tilakov.</span>",
        aboutDesc: "Men web dasturlash va zamonaviy interfeyslar yaratishga qiziqaman. Menga dark mode, neon yorug‘liklar, futuristik detallar va premium ko‘rinish yoqadi. Bu portfolio — o‘z uslubimni namoyish qilish uchun boshlang‘ich nuqta.",
        contactKicker: "04 / BOG‘LANISH",
        contactTitle: "Keling, birgalikda<br><span class=\"gradient\">ajoyib narsa yaratamiz.</span>",
        contactDesc: "Yangi g‘oyangiz bormi? Keling, uni birgalikda raqamli tajribaga aylantiramiz.",
        contactButton: "Bog‘lanish ↗", footerText: "Raqamli olamda yaratilgan.", backTop: "YUQORIGA ↑",
        menuLabel: "Menyuni ochish"
      },
      en: {
        pageTitle: "Nebulix.dev — Beyond the ordinary",
        navHome: "Home", navProjects: "Projects", navServices: "Services", navAbout: "About me", navContact: "Get in touch ↗",
        eyebrow: "INDEPENDENT WEB DEVELOPER",
        heroTitle: "Design the future.<br><span class=\"gradient\">Build beyond limits.</span>",
        heroCopy: "I'm Nebulix — a developer focused on creating modern web experiences, futuristic interfaces, and memorable digital products.",
        heroProjects: "Explore projects ↗", heroAbout: "About me ↓",
        meta1: "CREATIVE DEVELOPMENT", meta2: "NEON AESTHETIC", meta3: "RESPONSIVE UI",
        projectsKicker: "01 / SELECTED WORK",
        projectsTitle: "Made of ideas<span class=\"gradient\">.</span>",
        projectsDesc: "These are sample projects. Replace them with your own real work and case studies.",
        projectLink: "HAVE A PROJECT? ↗",
        project1Desc: "A futuristic landing page concept with neon accents and smooth interactive effects.",
        project2Desc: "A dashboard concept with a clean composition and vivid cyan highlights.",
        project3Desc: "A creative website and visual storytelling concept for a premium brand.",
        project4Desc: "Minimal typography, a dark palette, and neon micro-interactions.",
        servicesKicker: "02 / WHAT I DO",
        servicesTitle: "Built with intention<span class=\"gradient\">.</span>",
        servicesDesc: "Great web experiences happen where thoughtful design and code work together.",
        service1Title: "Web Development", service1Desc: "Fast, responsive websites that feel smooth and work across screen sizes.",
        service2Title: "Interface Design", service2Desc: "Dark UI, neon aesthetics, premium composition, and user-friendly experiences.",
        service3Title: "Creative Concepts", service3Desc: "Distinct visual ideas and prototypes that help brands stand out.",
        aboutKicker: "03 / THE DEVELOPER", aboutTitle: "Hey, I am <span class=\"gradient\">Ʌnvarbek Tilakov.</span>",
        aboutDesc: "I'm interested in web development and crafting modern interfaces. I love dark mode, neon lighting, futuristic details, and premium visuals. This portfolio is a starting point for expressing my style.",
        contactKicker: "04 / LET'S CONNECT",
        contactTitle: "Let's build something<br><span class=\"gradient\">extraordinary.</span>",
        contactDesc: "Have an idea in mind? Let's turn it into a memorable digital experience together.",
        contactButton: "Get in touch ↗", footerText: "Crafted in the digital universe.", backTop: "BACK TO TOP ↑",
        menuLabel: "Open menu"
      }
    };

    function setLanguage(lang) {
      const selected = translations[lang] ? lang : "uz";
      document.documentElement.lang = selected;
      document.title = translations[selected].pageTitle;
      document.querySelectorAll("[data-i18n]").forEach((element) => {
        const key = element.dataset.i18n;
        if (translations[selected][key] !== undefined) element.textContent = translations[selected][key];
      });
      document.querySelectorAll("[data-i18n-html]").forEach((element) => {
        const key = element.dataset.i18nHtml;
        if (translations[selected][key] !== undefined) element.innerHTML = translations[selected][key];
      });
      document.querySelectorAll(".lang-btn").forEach((button) => {
        const active = button.dataset.lang === selected;
        button.classList.toggle("active", active);
        button.setAttribute("aria-pressed", String(active));
      });
      document.getElementById("menuToggle").setAttribute("aria-label", translations[selected].menuLabel);
      try { localStorage.setItem("nebulix-language", selected); } catch (error) {}
    }

    document.querySelectorAll(".lang-btn").forEach((button) => {
      button.addEventListener("click", () => setLanguage(button.dataset.lang));
    });
    let savedLanguage = "uz";
    try { savedLanguage = localStorage.getItem("nebulix-language") || "uz"; } catch (error) {}
    setLanguage(savedLanguage);

    // Day/night theme toggle with saved preference.
    const themeToggle = document.getElementById("themeToggle");
    const themeIcon = document.getElementById("themeIcon");
    function setTheme(theme) {
      const light = theme === "light";
      document.body.classList.toggle("light-theme", light);
      themeIcon.textContent = light ? "☾" : "☼";
      const label = light ? "Tungi rejimga o‘tish" : "Kunduzgi rejimga o‘tish";
      themeToggle.setAttribute("aria-label", label);
      themeToggle.setAttribute("title", label);
      const themeColor = document.querySelector('meta[name="theme-color"]');
      if (themeColor) themeColor.setAttribute("content", light ? "#f6f4fb" : "#05050a");
      try { localStorage.setItem("nebulix-theme", light ? "light" : "dark"); } catch (error) {}
    }
    themeToggle.addEventListener("click", () => {
      // smooth fade of the whole page + neon pulse ring on the button
      document.documentElement.classList.add("theme-anim");
      themeToggle.classList.remove("burst");
      void themeToggle.offsetWidth; // restart animation
      themeToggle.classList.add("burst");
      setTheme(document.body.classList.contains("light-theme") ? "dark" : "light");
      setTimeout(() => {
        document.documentElement.classList.remove("theme-anim");
        themeToggle.classList.remove("burst");
      }, 700);
    });
    let savedTheme = "dark";
    try { savedTheme = localStorage.getItem("nebulix-theme") || "dark"; } catch (error) {}
    setTheme(savedTheme);

    // Current year
    document.getElementById("year").textContent = new Date().getFullYear();

    // Scroll progress glow
    const topline = document.getElementById("topline");
    window.addEventListener("scroll", () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      topline.style.width = (max > 0 ? window.scrollY / max * 100 : 0) + "%";
    }, { passive: true });

    // Reveal sections as they enter the viewport
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    document.querySelectorAll(".reveal").forEach(el => observer.observe(el));

    // Mobile navigation
    const menuToggle = document.getElementById("menuToggle");
    const navLinks = document.getElementById("navLinks");
    menuToggle.addEventListener("click", () => {
      const open = navLinks.classList.toggle("open");
      menuToggle.setAttribute("aria-expanded", String(open));
      menuToggle.textContent = open ? "✕" : "☰";
    });
    navLinks.querySelectorAll("a").forEach(link => link.addEventListener("click", () => {
      navLinks.classList.remove("open");
      menuToggle.setAttribute("aria-expanded", "false");
      menuToggle.textContent = "☰";
    }));

    // Subtle cursor light on devices that have a fine pointer
    const cursorGlow = document.getElementById("cursorGlow");
    if (window.matchMedia("(pointer: fine)").matches) {
      window.addEventListener("pointermove", (event) => {
        cursorGlow.style.left = event.clientX + "px";
        cursorGlow.style.top = event.clientY + "px";
      }, { passive: true });
    } else {
      cursorGlow.style.display = "none";
    }