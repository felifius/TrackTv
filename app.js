import express from "express";
import router from "./routes/appRouter.js";
import ejs from "ejs";

const app = express();
const PORT = process.env.PORT || 3000;

// Configuração do EJS como mecanismo de visualização
app.set("view engine", "ejs");
app.set("views", "./views");
app.use(express.static("public"));
app.use(express.json());
app.use(router);

// Rota para a página inicial
app.use("/", router);

// Inicia o servidor
app.listen(PORT, () => {
	console.log(`Servidor rodando em http://localhost:${PORT}`);
});