import dotenv from "dotenv";
import express from "express";
import helmet from "helmet";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const app = express();
const PORT = Number.parseInt(process.env.PORT ?? "3000", 10);
const IS_PRODUCTION = process.env.NODE_ENV === "production";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicRoot = path.resolve(__dirname, "..");
const imageRoot = path.join(publicRoot, "img");
const videoRoot = path.join(publicRoot, "videos");

/* =========================================================
   CABEÇALHOS DE SEGURANÇA

   A CSP permite somente os recursos usados pelo site,
   pelo formulário Web3Forms e pela verificação hCaptcha.
========================================================= */
app.disable("x-powered-by");

app.use(
    helmet({
        crossOriginEmbedderPolicy: false,
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],
                baseUri: ["'self'"],
                objectSrc: ["'none'"],
                frameAncestors: ["'none'"],
                scriptSrc: [
                    "'self'",
                    "https://web3forms.com",
                    "https://hcaptcha.com",
                    "https://*.hcaptcha.com",
                ],
                styleSrc: [
                    "'self'",
                    "'unsafe-inline'",
                    "https://fonts.googleapis.com",
                    "https://hcaptcha.com",
                    "https://*.hcaptcha.com",
                ],
                fontSrc: ["'self'", "https://fonts.gstatic.com", "data:"],
                imgSrc: [
                    "'self'",
                    "data:",
                    "https://hcaptcha.com",
                    "https://*.hcaptcha.com",
                ],
                connectSrc: [
                    "'self'",
                    "https://api.web3forms.com",
                    "https://hcaptcha.com",
                    "https://*.hcaptcha.com",
                ],
                frameSrc: ["https://hcaptcha.com", "https://*.hcaptcha.com"],
                formAction: ["'self'", "https://api.web3forms.com"],
                upgradeInsecureRequests: IS_PRODUCTION ? [] : null,
            },
        },
        referrerPolicy: { policy: "strict-origin-when-cross-origin" },
    }),
);

app.use((req, res, next) => {
    res.setHeader(
        "Permissions-Policy",
        "camera=(), microphone=(), geolocation=(), payment=(), usb=()",
    );
    next();
});

/* =========================================================
   ARQUIVOS PÚBLICOS

   Esta lista fechada impede que .env, código do servidor,
   anotações e arquivos de configuração sejam publicados.
========================================================= */
const sendPublicFile = (fileName) => (req, res, next) => {
    res.sendFile(path.join(publicRoot, fileName), (error) => {
        if (error) next(error);
    });
};

app.get(["/", "/index.html"], sendPublicFile("index.html"));
app.get("/style.css", sendPublicFile("style.css"));
app.get("/script.js", sendPublicFile("script.js"));
app.use(
    "/img",
    express.static(imageRoot, {
        dotfiles: "deny",
        fallthrough: false,
        immutable: IS_PRODUCTION,
        maxAge: IS_PRODUCTION ? "7d" : 0,
    }),
);
app.use(
    "/videos",
    express.static(videoRoot, {
        dotfiles: "deny",
        fallthrough: false,
        immutable: IS_PRODUCTION,
        maxAge: IS_PRODUCTION ? "7d" : 0,
    }),
);

app.use((req, res) => {
    res.status(404).type("text/plain").send("Página não encontrada.");
});

app.use((error, req, res, next) => {
    if (res.headersSent) return next(error);
    return res.status(404).type("text/plain").send("Arquivo não encontrado.");
});

const server = app.listen(PORT, () => {
    console.log(`SoluTech rodando em http://localhost:${PORT}`);
});

/* Limites de tempo ajudam contra conexões lentas mantidas artificialmente. */
server.requestTimeout = 20000;
server.headersTimeout = 15000;
server.keepAliveTimeout = 5000;
