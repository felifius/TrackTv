import dotenv from "dotenv";
dotenv.config();

"use strict";

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE_URL = "https://api.themoviedb.org/3";

function buildUrl(path, params = {}) {
	const url = new URL(`${TMDB_BASE_URL}${path}`);
	Object.entries(params).forEach(([key, value]) => {
		if (value !== undefined && value !== null && value !== "") {
			url.searchParams.set(key, String(value));
		}
	});
	return url.toString();
}

async function getJson(url) {
	const response = await fetch(url);
	if (!response.ok) {
		const errorBody = await response.text();
		throw new Error(`Erro HTTP ${response.status}: ${errorBody}`);
	}
	return response.json();
}

function normalizeResult(baseItem, details) {
	const isTv = baseItem.media_type === "tv";

	return {
		tipo: isTv ? "serie" : "filme",
		nome: isTv ? details.name : details.title,
		descricao: details.overview || "Sem descricao disponivel.",
		rating: details.vote_average ?? null,
		dataDeLancamento: isTv
			? details.first_air_date || null
			: details.release_date || null,
		novoEpisodioEm: isTv
			? details.next_episode_to_air?.air_date || null
			: null,
		status: details.status || null,
	};
}

async function getDetails(item) {
	const endpoint = item.media_type === "tv" ? `/tv/${item.id}` : `/movie/${item.id}`;
	const url = buildUrl(endpoint, {
		api_key: TMDB_API_KEY,
		language: "pt-BR",
	});

	const details = await getJson(url);
	return normalizeResult(item, details);
}

async function searchTitles(query) {
	const url = buildUrl("/search/multi", {
		api_key: TMDB_API_KEY,
		language: "pt-BR",
		query,
		include_adult: false,
	});

	const data = await getJson(url);

	const candidates = (data.results || []).filter(
		(item) => item.media_type === "movie" || item.media_type === "tv"
	);

	if (candidates.length === 0) {
		return [];
	}

	// Limita para evitar muitas chamadas e manter resposta rapida no terminal.
	const topResults = candidates.slice(0, 5);
	return Promise.all(topResults.map(getDetails));
}

async function main() {
	const query = process.argv.slice(2).join(" ").trim();

	if (!TMDB_API_KEY) {
		console.error("Defina a variavel TMDB_API_KEY com sua chave da API do TMDB.");
		console.error("Exemplo (PowerShell): $env:TMDB_API_KEY='SUA_CHAVE_AQUI'");
		process.exit(1);
	}

	if (!query) {
		console.error("Uso: node app.js \"nome da serie ou filme\"");
		process.exit(1);
	}

	try {
		const results = await searchTitles(query);

		if (results.length === 0) {
			console.log("Nenhum filme/serie encontrado para essa busca.");
			return;
		}

		console.log(`Resultados para: ${query}`);
		console.log(JSON.stringify(results, null, 2));
	} catch (error) {
		console.error("Falha ao buscar informacoes:", error.message);
		process.exit(1);
	}
}

main();
