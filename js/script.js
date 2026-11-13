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
    getSavedTheme() || root.dataset.theme || (colorPreference.matches ? "dark" : "light"),
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
    document.body.classList.remove("menu-open");
};

if (menuToggle && navMenu) {
    menuToggle.addEventListener("click", () => {
        const isOpen = navMenu.classList.toggle("open");
        menuToggle.setAttribute("aria-expanded", String(isOpen));
        menuToggle.setAttribute("aria-label", isOpen ? "Fechar menu" : "Abrir menu");
        document.body.classList.toggle("menu-open", isOpen);
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
            const visibleSection = entries
                .filter((entry) => entry.isIntersecting)
                .sort(
                    (a, b) =>
                        b.intersectionRect.height - a.intersectionRect.height ||
                        b.intersectionRatio - a.intersectionRatio,
                )[0];
            if (!visibleSection) return;

            menuLinks.forEach((link) => {
                const isActive =
                    !link.classList.contains("nav-menu__cta") &&
                    link.getAttribute("href") === `#${visibleSection.target.id}`;
                link.classList.toggle("active", isActive);
                if (isActive) link.setAttribute("aria-current", "page");
                else link.removeAttribute("aria-current");
            });
        },
        { rootMargin: "-28% 0px -62% 0px", threshold: [0, 0.25, 0.5, 0.75, 1] },
    );

    sections.forEach((section) => sectionObserver.observe(section));
}

/* =========================================================
   TRABALHOS — SLIDES
========================================================= */
const workStage = select(".work-stage");
const workDeck = select(".work-deck");

if (workStage && workDeck) {
    const slides = selectAll(".work-slide", workDeck);
    const tabs = selectAll('[role="tab"]', workDeck);
    const panels = selectAll('[role="tabpanel"]', workDeck);
    const pauseButton = select(".work-pause", workStage);
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const rotationMs = 6800;
    let activeIndex = Math.max(slides.findIndex((slide) => slide.classList.contains("is-active")), 0);
    let timer = 0;
    let userPaused = false;
    let pointerInside = false;
    let focusInside = false;
    let inView = !("IntersectionObserver" in window);

    const setPauseLabel = () => {
        if (!pauseButton) return;
        pauseButton.setAttribute(
            "aria-label",
            userPaused ? "Retomar a troca automática" : "Pausar a troca automática",
        );
    };

    const stopRotation = () => {
        window.clearInterval(timer);
        timer = 0;
    };

    const shouldRotate = () => !reducedMotion && !userPaused && !pointerInside && !focusInside && inView;

    const startRotation = () => {
        stopRotation();
        if (!shouldRotate()) return;
        timer = window.setInterval(() => {
            activateSlide((activeIndex + 1) % slides.length);
        }, rotationMs);
    };

    const activateSlide = (index, { focus = false } = {}) => {
        activeIndex = index;

        slides.forEach((slide, slideIndex) => {
            const isActive = slideIndex === index;
            slide.classList.toggle("is-active", isActive);
            tabs[slideIndex].setAttribute("aria-selected", String(isActive));
            tabs[slideIndex].tabIndex = isActive ? 0 : -1;
            if (isActive) panels[slideIndex].removeAttribute("aria-hidden");
            else panels[slideIndex].setAttribute("aria-hidden", "true");
        });

        if (focus) tabs[index].focus();
        startRotation();
    };

    slides.forEach((slide, index) => {
        slide.addEventListener("click", (event) => {
            if (event.target.closest("a")) return;
            activateSlide(index);
        });
    });

    workDeck.addEventListener("keydown", (event) => {
        if (!event.target.closest('[role="tab"]')) return;

        const previous = (activeIndex - 1 + slides.length) % slides.length;
        const next = (activeIndex + 1) % slides.length;
        const keyMap = {
            ArrowRight: next,
            ArrowDown: next,
            ArrowLeft: previous,
            ArrowUp: previous,
            Home: 0,
            End: slides.length - 1,
        };

        if (!(event.key in keyMap)) return;
        event.preventDefault();
        activateSlide(keyMap[event.key], { focus: true });
    });

    workStage.addEventListener("mouseenter", () => {
        pointerInside = true;
        stopRotation();
    });

    workStage.addEventListener("mouseleave", () => {
        pointerInside = false;
        startRotation();
    });

    workStage.addEventListener("focusin", (event) => {
        focusInside = Boolean(event.target.closest("[role='tab']"));
        if (focusInside) stopRotation();
        else startRotation();
    });

    workStage.addEventListener("focusout", (event) => {
        if (workStage.contains(event.relatedTarget)) return;
        focusInside = false;
        startRotation();
    });

    pauseButton?.addEventListener("click", (event) => {
        event.stopPropagation();
        userPaused = !userPaused;
        pauseButton.setAttribute("aria-pressed", String(userPaused));
        setPauseLabel();
        startRotation();
    });

    document.addEventListener("visibilitychange", () => {
        if (document.hidden) stopRotation();
        else startRotation();
    });

    if ("IntersectionObserver" in window) {
        const viewObserver = new IntersectionObserver(
            ([entry]) => {
                inView = entry.isIntersecting;
                startRotation();
            },
            { threshold: 0.35 },
        );
        viewObserver.observe(workDeck);
    }

    if (reducedMotion && pauseButton) pauseButton.hidden = true;
    activateSlide(activeIndex);
}

/* =========================================================
   FORMULÁRIO DE CONTATO
========================================================= */
const contactForm = select("#contact-form");

const formatBrazilPhone = (value) => {
    let digits = value.replace(/\D/g, "");
    if (digits.startsWith("55") && digits.length > 11) digits = digits.slice(2);
    digits = digits.slice(0, 11);
    if (!digits) return "";
    if (digits.length < 3) return `(${digits}`;

    const ddd = digits.slice(0, 2);
    const number = digits.slice(2);
    if (number.length < 5) return `(${ddd}) ${number}`;
    if (digits.length <= 10) return `(${ddd}) ${number.slice(0, 4)}-${number.slice(4)}`;
    return `(${ddd}) ${number.slice(0, 5)}-${number.slice(5, 9)}`;
};

if (contactForm) {
    const submitButton = select('button[type="submit"]', contactForm);
    const formStatus = select("#form-status");
    const phoneInput = select("#contact-phone", contactForm);
    const consent = select("#contact-consent", contactForm);
    const consentMessage = "Autorize o uso dos dados para que a equipe possa responder.";
    let isSubmitting = false;

    const setStatus = (type, message) => {
        formStatus.className = type ? `form-status ${type}` : "form-status";
        formStatus.textContent = message;
    };

    phoneInput?.addEventListener("input", () => {
        phoneInput.value = formatBrazilPhone(phoneInput.value);
    });

    selectAll("input, textarea", contactForm).forEach((field) => {
        if (field.type === "checkbox" || field.type === "hidden") return;
        field.addEventListener("blur", () => {
            field.value = field.value.trim();
            if (field === phoneInput) field.value = formatBrazilPhone(field.value);
        });
    });

    if (consent) {
        consent.setCustomValidity(consent.checked ? "" : consentMessage);
        consent.addEventListener("change", () => {
            consent.setCustomValidity(consent.checked ? "" : consentMessage);
        });
    }

    contactForm.addEventListener("submit", async (event) => {
        event.preventDefault();
        if (isSubmitting) return;

        const honeypotText = contactForm.elements.solutech_leave_blank?.value.trim();
        if (contactForm.elements.botcheck?.checked || honeypotText) {
            setStatus("is-success", "Mensagem enviada! A equipe SoluTech entrará em contato em breve.");
            contactForm.reset();
            if (consent) consent.setCustomValidity(consentMessage);
            return;
        }

        selectAll("input, textarea", contactForm).forEach((field) => {
            if (field.type === "checkbox" || field.type === "hidden") return;
            field.value = field.value.trim();
        });
        if (phoneInput) phoneInput.value = formatBrazilPhone(phoneInput.value);

        if (!contactForm.checkValidity()) {
            contactForm.reportValidity();
            return;
        }

        const captchaField = select(".h-captcha", contactForm);
        const captchaToken = select('textarea[name="h-captcha-response"]', contactForm)?.value.trim();

        if (!captchaToken) {
            const captchaLoaded = Boolean(captchaField?.querySelector("iframe") || window.hcaptcha);
            setStatus(
                "is-error",
                captchaLoaded
                    ? "Confirme a verificação de segurança antes de enviar."
                    : "A verificação de segurança não carregou. Atualize a página e tente novamente.",
            );
            formStatus.focus();
            return;
        }

        const originalButtonContent = submitButton.innerHTML;
        isSubmitting = true;
        submitButton.disabled = true;
        submitButton.setAttribute("aria-busy", "true");
        submitButton.textContent = "Enviando...";
        setStatus("", "Enviando sua mensagem com segurança...");

        const requestController = new AbortController();
        const requestTimeout = window.setTimeout(() => requestController.abort(), 15000);

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

            setStatus("is-success", "Mensagem enviada! A equipe SoluTech entrará em contato em breve.");
            contactForm.reset();
            if (consent) consent.setCustomValidity(consentMessage);
            window.hcaptcha?.reset();
            formStatus.focus();
        } catch (error) {
            setStatus(
                "is-error",
                error.name === "AbortError"
                    ? "O envio demorou mais que o esperado. Verifique sua conexão e tente novamente."
                    : "Não foi possível enviar agora. Refaça a verificação de segurança e tente novamente.",
            );
            window.hcaptcha?.reset();
            formStatus.focus();
        } finally {
            window.clearTimeout(requestTimeout);
            isSubmitting = false;
            submitButton.disabled = false;
            submitButton.removeAttribute("aria-busy");
            submitButton.innerHTML = originalButtonContent;
        }
    });
}
