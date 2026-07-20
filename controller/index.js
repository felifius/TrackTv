import ejs from "ejs";

export async function index(req, res) {
    try {
        res.render("index", { title: "TrackTv" });
    } catch (error) {
        console.error("Erro ao renderizar a página inicial:", error);
        res.status(500).send("Erro interno do servidor");
    }
}
