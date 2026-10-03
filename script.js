"use strict";

const select = (selector, context = document) => context.querySelector(selector);
const selectAll = (selector, context = document) => [
    ...context.querySelectorAll(selector),
];

/* =========================================================
   TEMA
========================================================= */
const root = document.documentElement;
const themeToggle = select(".theme-toggle");
const themeColor = select('meta[name="theme-color"]');
const colorPreference = window.matchMedia("(prefers-color-scheme: dark)");
const themeStorageKey = "solutech-theme";

const getSavedTheme = () => {
    try {
        return localStorage.getItem(themeStorageKey);
    } catch {
        return null;
    }
};

const applyTheme = (theme, persist = false) => {
    const isDark = theme === "dark";
    root.dataset.theme = isDark ? "dark" : "light";
    root.style.colorScheme = isDark ? "dark" : "light";
    themeColor?.setAttribute("content", isDark ? "#05070b" : "#08111f");

    if (themeToggle) {
        themeToggle.setAttribute("aria-pressed", String(isDark));
        themeToggle.setAttribute(
            "aria-label",
            isDark ? "Ativar tema claro" : "Ativar tema escuro",
        );
    }

    const captcha = select(".h-captcha");
    captcha?.setAttribute("data-theme", isDark ? "dark" : "light");

    if (persist) {
        try {
            localStorage.setItem(themeStorageKey, isDark ? "dark" : "light");
        } catch {
            // O tema continua ativo na sessão mesmo se o armazenamento estiver bloqueado.
        }
    }
};

applyTheme(
    getSavedTheme() ||
        root.dataset.theme ||
        (colorPreference.matches ? "dark" : "light"),
);

themeToggle?.addEventListener("click", () => {
    applyTheme(root.dataset.theme === "dark" ? "light" : "dark", true);
});

colorPreference.addEventListener?.("change", (event) => {
    if (!getSavedTheme()) applyTheme(event.matches ? "dark" : "light");
});

/* =========================================================
   MENU MOBILE E NAVEGAÇÃO ATIVA
========================================================= */
const menuToggle = select(".menu-toggle");
const navMenu = select(".nav-menu");
const menuLinks = selectAll('.nav-menu a[href^="#"]');

const closeMenu = () => {
    if (!menuToggle || !navMenu) return;
    navMenu.classList.remove("open");
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Abrir menu");
};

if (menuToggle && navMenu) {
    menuToggle.addEventListener("click", () => {
        const isOpen = navMenu.classList.toggle("open");
        menuToggle.setAttribute("aria-expanded", String(isOpen));
        menuToggle.setAttribute("aria-label", isOpen ? "Fechar menu" : "Abrir menu");
    });

    menuLinks.forEach((link) => link.addEventListener("click", closeMenu));

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && navMenu.classList.contains("open")) {
            closeMenu();
            menuToggle.focus();
        }
    });

    document.addEventListener("click", (event) => {
        if (
            navMenu.classList.contains("open") &&
            !navMenu.contains(event.target) &&
            !menuToggle.contains(event.target)
        ) {
            closeMenu();
        }
    });

    window.addEventListener("resize", () => {
        if (window.innerWidth > 980) closeMenu();
    });
}

if ("IntersectionObserver" in window) {
    const sections = menuLinks
        .map((link) => select(link.getAttribute("href")))
        .filter(Boolean);

    const sectionObserver = new IntersectionObserver(
        (entries) => {
            const visibleSection = entries.find((entry) => entry.isIntersecting);
            if (!visibleSection) return;

            menuLinks.forEach((link) => {
                const isActive = link.getAttribute("href") === `#${visibleSection.target.id}`;
                link.classList.toggle("active", isActive);
                if (isActive) link.setAttribute("aria-current", "page");
                else link.removeAttribute("aria-current");
            });
        },
        { rootMargin: "-28% 0px -62% 0px", threshold: 0 },
    );

    sections.forEach((section) => sectionObserver.observe(section));
}

/* =========================================================
   VÍDEOS DOS CASES
========================================================= */
selectAll(".case-video").forEach((caseVideo) => {
    const video = select("video", caseVideo);
    const playButton = select(".case-video__play", caseVideo);

    if (!video || !playButton) return;

    playButton.addEventListener("click", async () => {
        playButton.disabled = true;
        video.controls = true;
        caseVideo.classList.add("is-playing");

        try {
            await video.play();
            video.focus({ preventScroll: true });
        } catch {
            video.controls = false;
            caseVideo.classList.remove("is-playing");
            playButton.disabled = false;
        }
    });
});

/* =========================================================
   FORMULÁRIO DE CONTATO
========================================================= */
const contactForm = select("#contact-form");

if (contactForm) {
    const submitButton = select('button[type="submit"]', contactForm);
    const formStatus = select("#form-status");

    contactForm.addEventListener("submit", async (event) => {
        event.preventDefault();
        if (submitButton.disabled) return;

        const captchaToken = select(
            'textarea[name="h-captcha-response"]',
            contactForm,
        )?.value.trim();

        if (!captchaToken) {
            formStatus.className = "form-status is-error";
            formStatus.textContent =
                "Confirme a verificação de segurança antes de enviar.";
            return;
        }

        const originalButtonContent = submitButton.innerHTML;
        submitButton.disabled = true;
        submitButton.textContent = "Enviando...";
        formStatus.className = "form-status";
        formStatus.textContent = "Enviando sua mensagem com segurança...";

        const requestController = new AbortController();
        const requestTimeout = window.setTimeout(
            () => requestController.abort(),
            15000,
        );

        try {
            const response = await fetch("https://api.web3forms.com/submit", {
                method: "POST",
                headers: { Accept: "application/json" },
                body: new FormData(contactForm),
                signal: requestController.signal,
            });
            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.message || "Falha no envio do formulário");
            }

            formStatus.className = "form-status is-success";
            formStatus.textContent =
                "Mensagem enviada! A equipe SoluTech entrará em contato em breve.";
            contactForm.reset();
            window.hcaptcha?.reset();
        } catch (error) {
            console.error("Erro ao enviar formulário:", error);
            formStatus.className = "form-status is-error";
            formStatus.textContent =
                error.name === "AbortError"
                    ? "O envio demorou mais que o esperado. Verifique sua conexão e tente novamente."
                    : "Não foi possível enviar agora. Refaça a verificação de segurança e tente novamente.";
            window.hcaptcha?.reset();
        } finally {
            window.clearTimeout(requestTimeout);
            submitButton.disabled = false;
            submitButton.innerHTML = originalButtonContent;
        }
    });
}
