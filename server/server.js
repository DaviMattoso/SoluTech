import express from "express";
import OpenAI from "openai";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";


/* ==========================================
   CONFIGURAÇÕES
========================================== */

dotenv.config();

const app = express();

const PORT = 3000;


/* ==========================================
   CONFIGURAÇÃO DOS CAMINHOS
========================================== */

const __filename = fileURLToPath(import.meta.url);

const __dirname = path.dirname(__filename);


/* ==========================================
   OPENAI
========================================== */

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});


/* ==========================================
   MIDDLEWARE
========================================== */

app.use(express.json());


/* ==========================================
   SERVIR O SITE
========================================== */

app.use(
    express.static(
        path.join(__dirname, "..")
    )
);

app.get("/", (req, res) => {
    res.sendFile(
        path.join(__dirname, "..", "site.html")
    );
});


/* ==========================================
   ROTA DO JARVS
========================================== */

app.post("/api/chat", async (req, res) => {

    try {

        const { message } = req.body;


        /* Verifica se existe uma mensagem */

        if (!message) {

            return res.status(400).json({
                error: "Mensagem não enviada."
            });

        }


        /* ==========================================
           ENVIA A MENSAGEM PARA A OPENAI
        ========================================== */

        const response = await openai.responses.create({

            model: "gpt-5.6",

            instructions: `
Você é Jarvs, o assistente virtual da SoluTech.

A SoluTech é uma empresa de tecnologia que oferece
soluções digitais para pessoas e empresas.

As principais áreas da SoluTech são:

- Desenvolvimento de sistemas
- Automação de processos
- Consultoria
- Inteligência Artificial
- Inteligência de Dados
- Soluções tecnológicas personalizadas

Seu objetivo é conversar com os visitantes do site,
entender suas necessidades e apresentar as soluções
da SoluTech de maneira clara e natural.

Fale sempre em português brasileiro.

Seu comportamento deve ser:

- profissional
- amigável
- direto
- natural
- prestativo

Não invente preços, clientes, serviços ou informações
que não foram fornecidas pela SoluTech.

Quando o visitante apresentar um problema,
procure entender a necessidade antes de sugerir
uma solução.

Quando perceber que o visitante deseja contratar,
fazer um orçamento ou falar com uma pessoa da equipe,
oriente-o para entrar em contato com a equipe da SoluTech.

Você não é humano.

Você é o assistente virtual da SoluTech.

Seu nome é Jarvs.
`,

            input: message

        });


        /* ==========================================
           DEVOLVE A RESPOSTA PARA O SITE
        ========================================== */

        res.json({
            reply: response.output_text
        });


    } catch (error) {

        console.error("Erro no Jarvs:", error);

        res.status(500).json({
            error: "Não foi possível obter uma resposta do Jarvs."
        });

    }

});


/* ==========================================
   INICIAR SERVIDOR
========================================== */

app.listen(PORT, () => {

    console.log(
        `SoluTech rodando em http://localhost:${PORT}`
    );

});