"use strict";

/* =========================================================
   UTILITÁRIOS
========================================================= */
const select = (selector, context = document) => context.querySelector(selector);
const selectAll = (selector, context = document) => [
    ...context.querySelectorAll(selector),
];

/* =========================================================
   MENU MOBILE E NAVEGAÇÃO ATIVA
========================================================= */
const menuToggle = select(".menu-toggle");
const navMenu = select(".nav-menu");
const menuLinks = selectAll(".nav-menu a");

if (menuToggle && navMenu) {
    menuToggle.addEventListener("click", () => {
        const isOpen = navMenu.classList.toggle("open");
        menuToggle.setAttribute("aria-expanded", String(isOpen));
        menuToggle.setAttribute("aria-label", isOpen ? "Fechar menu" : "Abrir menu");
    });

    menuLinks.forEach((link) => {
        link.addEventListener("click", () => {
            navMenu.classList.remove("open");
            menuToggle.setAttribute("aria-expanded", "false");
            menuToggle.setAttribute("aria-label", "Abrir menu");
        });
    });
}

if ("IntersectionObserver" in window) {
    const sectionObserver = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;

                menuLinks.forEach((link) => {
                    link.classList.toggle(
                        "active",
                        link.getAttribute("href") === `#${entry.target.id}`,
                    );
                });
            });
        },
        { rootMargin: "-25% 0px -65% 0px" },
    );

    selectAll("section[id]").forEach((section) => sectionObserver.observe(section));
}

/* =========================================================
   MINI EXPERIÊNCIAS — NOSSAS SOLUÇÕES
========================================================= */
const setGameFeedback = (game, message, state = "") => {
    const feedback = select("[data-game-feedback]", game);
    feedback.className = `mini-game__feedback${state ? ` is-${state}` : ""}`;
    feedback.textContent = message;
};

const setGameScore = (game, value) => {
    select("[data-game-score]", game).textContent = value;
};

const finishGame = (game, button, successMessage, score = "1/1") => {
    game.classList.add("is-complete");
    button?.classList.add("is-correct");
    button?.setAttribute("aria-pressed", "true");
    setGameFeedback(game, successMessage, "success");
    setGameScore(game, score);
};

const markCorrectChoice = (button) => {
    button.classList.remove("is-wrong");
    button.classList.add("is-correct");
    button.setAttribute("aria-pressed", "true");
};

const showWrongChoice = (game, button, message) => {
    button.classList.add("is-wrong");
    button.setAttribute("aria-pressed", "false");
    setGameFeedback(game, message, "error");
};

const workflowGame = select('[data-game="workflow"]');
if (workflowGame) {
    const expectedOrder = ["receive", "validate", "confirm"];
    const stepLabels = {
        receive: "Solicitação recebida",
        validate: "Dados conferidos",
        confirm: "Recebimento confirmado",
    };
    let currentStep = 0;

    selectAll("[data-flow-step]", workflowGame).forEach((option) => {
        option.addEventListener("click", () => {
            if (workflowGame.classList.contains("is-complete")) return;

            const selectedStep = option.dataset.flowStep;
            if (selectedStep !== expectedOrder[currentStep]) {
                showWrongChoice(
                    workflowGame,
                    option,
                    "Essa ação será necessária, mas ainda não é a próxima etapa. Tente outra opção.",
                );
                return;
            }

            markCorrectChoice(option);
            option.disabled = true;
            const slot = select(`[data-flow-slot="${currentStep}"]`, workflowGame);
            slot.classList.add("is-filled");
            select("span", slot).textContent = stepLabels[selectedStep];
            currentStep += 1;
            setGameScore(workflowGame, `${currentStep}/3`);

            if (currentStep === expectedOrder.length) {
                finishGame(
                    workflowGame,
                    option,
                    "Fluxo concluído: a sequência correta reduz falhas e oferece uma confirmação clara a quem realizou a solicitação.",
                    "3/3",
                );
                return;
            }

            setGameFeedback(
                workflowGame,
                `Etapa ${currentStep} concluída. Selecione a próxima ação.`,
                "success",
            );
        });
    });
}

const strategyGame = select('[data-game="strategy"]');
if (strategyGame) {
    selectAll("[data-strategy-option]", strategyGame).forEach((option) => {
        option.addEventListener("click", () => {
            if (
                strategyGame.classList.contains("is-complete") ||
                strategyGame.classList.contains("has-progress")
            ) {
                return;
            }

            if (option.dataset.strategyOption === "map") {
                markCorrectChoice(option);
                strategyGame.classList.add("has-progress");
                setGameScore(strategyGame, "1/2");
                selectAll("[data-strategy-option]", strategyGame).forEach(
                    (button) => (button.disabled = true),
                );
                select('[data-strategy-stage="metric"]', strategyGame).hidden = false;
                setGameFeedback(
                    strategyGame,
                    "Diagnóstico concluído. Agora escolha uma medida objetiva para acompanhar o resultado.",
                    "success",
                );
                return;
            }

            showWrongChoice(
                strategyGame,
                option,
                "Essa decisão pode gerar custo sem resolver a causa. Primeiro, é necessário compreender o processo.",
            );
        });
    });

    selectAll("[data-strategy-metric]", strategyGame).forEach((option) => {
        option.addEventListener("click", () => {
            if (strategyGame.classList.contains("is-complete")) return;

            if (option.dataset.strategyMetric === "time") {
                finishGame(
                    strategyGame,
                    option,
                    "Plano concluído: compreender a causa e acompanhar o tempo de conclusão permite verificar se a mudança produziu uma melhoria real.",
                    "2/2",
                );
                return;
            }

            showWrongChoice(
                strategyGame,
                option,
                "Essa informação não demonstra diretamente se o atraso foi reduzido. Escolha uma medida relacionada ao tempo.",
            );
        });
    });
}

const aiGame = select('[data-game="ai-route"]');
if (aiGame) {
    const tickets = [
        {
            message: "“Minha cobrança veio duplicada este mês. Preciso de ajuda.”",
            destination: "finance",
        },
        {
            message: "“Não consigo acessar minha conta, mesmo após alterar a senha.”",
            destination: "support",
        },
        {
            message: "“Gostaria de receber uma proposta para um novo sistema.”",
            destination: "sales",
        },
    ];
    const ticketMessage = select("[data-ticket-message]", aiGame);
    const ticketMeta = select("[data-ticket-meta]", aiGame);
    let ticketIndex = 0;
    let isChangingTicket = false;

    selectAll("[data-ai-route]", aiGame).forEach((option) => {
        option.addEventListener("click", () => {
            if (aiGame.classList.contains("is-complete") || isChangingTicket) return;

            if (option.dataset.aiRoute === tickets[ticketIndex].destination) {
                markCorrectChoice(option);
                ticketIndex += 1;
                setGameScore(aiGame, `${ticketIndex}/3`);

                if (ticketIndex === tickets.length) {
                    finishGame(
                        aiGame,
                        option,
                        "Triagem concluída: as três solicitações foram direcionadas corretamente, com rapidez e critérios consistentes.",
                        "3/3",
                    );
                    return;
                }

                isChangingTicket = true;
                setGameFeedback(
                    aiGame,
                    "Encaminhamento correto. Preparando a próxima solicitação...",
                    "success",
                );
                window.setTimeout(() => {
                    selectAll("[data-ai-route]", aiGame).forEach((button) => {
                        button.classList.remove("is-correct", "is-wrong");
                        button.removeAttribute("aria-pressed");
                    });
                    ticketMessage.textContent = tickets[ticketIndex].message;
                    ticketMeta.textContent = `Solicitação ${ticketIndex + 1} de 3`;
                    setGameFeedback(
                        aiGame,
                        "Leia a nova necessidade e escolha uma área.",
                    );
                    isChangingTicket = false;
                }, 500);
                return;
            }

            showWrongChoice(
                aiGame,
                option,
                "Esse destino não corresponde à necessidade principal da mensagem. Tente novamente.",
            );
        });
    });
}

const dataGame = select('[data-game="data"]');
if (dataGame) {
    let chartAnswered = false;

    selectAll("[data-data-option]", dataGame).forEach((bar) => {
        bar.addEventListener("click", () => {
            if (dataGame.classList.contains("is-complete") || chartAnswered) return;

            if (bar.dataset.dataOption === "true") {
                chartAnswered = true;
                markCorrectChoice(bar);
                setGameScore(dataGame, "1/2");
                select('[data-data-stage="insight"]', dataGame).hidden = false;
                setGameFeedback(
                    dataGame,
                    "Leitura correta: abril apresentou o maior resultado. Agora escolha como utilizar essa informação.",
                    "success",
                );
                return;
            }

            showWrongChoice(
                dataGame,
                bar,
                "Esse mês não foi o líder. Compare a altura e o valor de todas as barras.",
            );
        });
    });

    selectAll("[data-data-insight]", dataGame).forEach((option) => {
        option.addEventListener("click", () => {
            if (dataGame.classList.contains("is-complete")) return;

            if (option.dataset.dataInsight === "analyze") {
                finishGame(
                    dataGame,
                    option,
                    "Análise concluída: dados orientam boas decisões quando são interpretados com contexto e avaliados antes de uma nova ação.",
                    "2/2",
                );
                return;
            }

            showWrongChoice(
                dataGame,
                option,
                "Uma decisão responsável considera o contexto antes de repetir ou descartar uma estratégia.",
            );
        });
    });
}

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
            formStatus.textContent = error.name === "AbortError"
                ? "O envio demorou mais que o esperado. Verifique sua conexão e tente novamente."
                : "Não foi possível enviar agora. Refaça a verificação de segurança e tente novamente.";
            window.hcaptcha?.reset();
        } finally {
            window.clearTimeout(requestTimeout);
            submitButton.disabled = false;
            submitButton.textContent = "Enviar mensagem →";
        }
    });
}
