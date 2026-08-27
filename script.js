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

/* ==========================================
   FORMULÁRIO DE CONTATO
========================================== */

// Aqui buscamos no HTML o formulário que possui o id="contact-form".
// O document.querySelector() permite selecionar um elemento da página
// usando um seletor CSS.
const contactForm =
    document.querySelector("#contact-form");


// Aqui criamos um "ouvinte" para o evento de envio do formulário.
// O evento "submit" acontece quando o usuário clica no botão
// "Enviar mensagem" ou envia o formulário de outra maneira.
contactForm.addEventListener(
    "submit",
    async (event) => {


        // Normalmente, quando um formulário HTML é enviado,
        // o navegador recarrega a página.
        //
        // O preventDefault() impede esse comportamento.
        // Assim podemos controlar o envio através do JavaScript.
        event.preventDefault();


        // FormData pega automaticamente os valores dos campos
        // que possuem o atributo "name" dentro do formulário.
        //
        // Por exemplo:
        // name="name"    → nome do visitante
        // name="email"   → e-mail
        // name="subject" → assunto
        // name="message" → mensagem
        const formData =
            new FormData(contactForm);


        // O try é usado para tentar executar o envio.
        // Caso aconteça algum erro durante a comunicação,
        // o código poderá ser tratado pelo catch mais abaixo.
        try {


            // fetch() faz uma requisição para o Web3Forms.
            //
            // Estamos enviando os dados do nosso formulário
            // para o endereço da API do Web3Forms.
            //
            // O "await" faz o JavaScript esperar a resposta
            // antes de continuar.
            const response =
                await fetch(
                    "https://api.web3forms.com/submit",
                    {

                        // POST significa que estamos enviando
                        // informações para o servidor.
                        method: "POST",


                        // Aqui enviamos o FormData que criamos
                        // anteriormente.
                        body: formData

                    }
                );


            // O Web3Forms devolve uma resposta.
            //
            // Essa resposta vem em formato JSON.
            // O response.json() transforma essa resposta
            // em um objeto que podemos utilizar no JavaScript.
            const data =
                await response.json();


            // O Web3Forms informa através de "success"
            // se o envio foi realizado corretamente.
            //
            // Se success for true, entramos aqui.
            if (data.success) {


                // Mostra uma mensagem para o visitante
                // informando que o formulário foi enviado.
                alert(
                    "Mensagem enviada com sucesso! A equipe SoluTech entrará em contato em breve."
                );


                // Depois do envio, limpa todos os campos
                // do formulário.
                //
                // Assim o formulário volta a ficar vazio.
                contactForm.reset();


            } else {


                // Se o Web3Forms informar que o envio
                // não foi realizado corretamente,
                // mostramos uma mensagem de erro.
                alert(
                    "Não foi possível enviar sua mensagem. Tente novamente."
                );

            }


        } catch (error) {


            // Se acontecer algum erro na comunicação,
            // o código chega aqui.
            //
            // O console.error() mostra o erro no
            // console do navegador, facilitando a identificação
            // do problema durante o desenvolvimento.
            console.error(
                "Erro ao enviar formulário:",
                error
            );


            // Enquanto para nós o erro aparece no console,
            // o visitante recebe uma mensagem mais simples.
            alert(
                "Ocorreu um erro ao enviar sua mensagem."
            );

        }

    }
);