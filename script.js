/* ==========================================
   MENU MOBILE
========================================== */
const menuToggle = document.querySelector(".menu-toggle");

const navMenu = document.querySelector(".nav-menu");


menuToggle.addEventListener("click", () => {

    navMenu.classList.toggle("open");

    const menuAberto =
        navMenu.classList.contains("open");

    menuToggle.setAttribute(
        "aria-expanded",
        menuAberto
    );

});


const menuLinks =
    document.querySelectorAll(".nav-menu a");


menuLinks.forEach(link => {

    link.addEventListener("click", () => {

        navMenu.classList.remove("open");

        menuToggle.setAttribute(
            "aria-expanded",
            "false"
        );

    });

});

// =====================================================
// Nav ativa (header)
// =====================================================
const sections = document.querySelectorAll("main section[id]");

const observer = new IntersectionObserver( //O IntersectionObserver permite observar quando um elemento entra em determinada região da tela
    (entries) => {

        entries.forEach(entry => {

            if (entry.isIntersecting) {

                const id = entry.target.getAttribute("id"); // Essa parte pega as seções que possuem id

                menuLinks.forEach(link => {

                    link.classList.remove("active");

                    if (link.getAttribute("href") === `#${id}`) {
                        link.classList.add("active");
                    }

                });

            }

        });

    },
    {
        rootMargin: "-25% 0px -65% 0px"
    }
);

sections.forEach(section => {
    observer.observe(section);
});


/* ==========================================
   ELEMENTOS DO JARVS
========================================== */
const jarvsChat =
    document.querySelector("#jarvs-chat");

const jarvsButton =
    document.querySelector("#jarvs-button");

const jarvsClose =
    document.querySelector("#jarvs-close");

const headerJarvs =
    document.querySelector("#header-jarvs");


/* ==========================================
   ELEMENTOS DA CONVERSA
========================================== */
const jarvsForm =
    document.querySelector("#jarvs-form");

const jarvsInput =
    document.querySelector("#jarvs-input");

const jarvsMessages =
    document.querySelector("#jarvs-messages");


/* ==========================================
   ABRIR JARVS
========================================== */
function abrirJarvs() {

    jarvsChat.classList.add("open");

    jarvsChat.setAttribute(
        "aria-hidden",
        "false"
    );

    jarvsInput.focus();

}


/* ==========================================
   FECHAR JARVS
========================================== */
function fecharJarvs() {

    jarvsChat.classList.remove("open");

    jarvsChat.setAttribute(
        "aria-hidden",
        "true"
    );

}


/* ==========================================
   BOTÕES DO JARVS
========================================== */
jarvsButton.addEventListener(
    "click",
    abrirJarvs
);


headerJarvs.addEventListener(
    "click",
    abrirJarvs
);


jarvsClose.addEventListener(
    "click",
    fecharJarvs
);


/* ==========================================
   ADICIONAR MENSAGEM NA TELA
========================================== */
function adicionarMensagem(
    mensagem,
    tipo
) {

    const div =
        document.createElement("div");

    div.classList.add(
        "jarvs-message",
        tipo
    );


    const p =
        document.createElement("p");

    p.textContent = mensagem;


    div.appendChild(p);

    jarvsMessages.appendChild(div);


    /* Desce automaticamente para
       a mensagem mais recente */

    jarvsMessages.scrollTop =
        jarvsMessages.scrollHeight;
}


/* ==========================================
   ENVIAR MENSAGEM
========================================== */
jarvsForm.addEventListener(
    "submit",
    async (event) => {

        event.preventDefault();


        const mensagem =
            jarvsInput.value.trim();


        /* Não envia mensagem vazia */

        if (!mensagem) {
            return;
        }


        /* Mostra a mensagem do usuário */

        adicionarMensagem(
            mensagem,
            "user"
        );


        /* Limpa o campo */

        jarvsInput.value = "";


        /* Desabilita temporariamente
           o campo enquanto espera */

        jarvsInput.disabled = true;


        try {

            /* ==========================================
               ENVIA PARA O BACKEND
            ========================================== */
            const response =
                await fetch("/api/chat", { //"Ei, servidor Node, tenho uma mensagem para o Jarvs."

                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({
                        message: mensagem
                    })

                });


            /* Verifica se o servidor respondeu
               corretamente */
            if (!response.ok) {

                throw new Error(
                    "Erro ao comunicar com o servidor."
                );

            }


            /* Converte a resposta para JSON */

            const data =
                await response.json();


            /* ==========================================
               MOSTRA RESPOSTA DO JARVS
            ========================================== */
            adicionarMensagem(
                data.reply,
                "bot"
            );


        } catch (error) {

            console.error(
                "Erro no Jarvs:",
                error
            );


            adicionarMensagem(
                "Desculpe, não consegui responder agora. Tente novamente em alguns instantes.",
                "bot"
            );


        } finally {

            /* Libera o campo novamente */
            jarvsInput.disabled = false;

            jarvsInput.focus();

        }

    }
);