const express = require('express');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

const DATA_FILE = path.join(__dirname, 'productions.json');
const TMDB_API_KEY = process.env.TMDB_API_KEY || '';

function loadProductions() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const data = fs.readFileSync(DATA_FILE, 'utf8');
      return JSON.parse(data);
    }
    return [];
  } catch (error) {
    console.error('Erro ao carregar produções:', error);
    return [];
  }
}

function saveProductions(productions) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(productions, null, 2), 'utf8');
  } catch (error) {
    console.error('Erro ao salvar produções:', error);
  }
}

function getNextId(productions) {
  if (productions.length === 0) return 1;
  return Math.max(...productions.map(p => p.id)) + 1;
}

let productions = loadProductions();

const movieGenres = {
  28: 'Ação', 35: 'Comédia', 18: 'Drama', 10749: 'Romance',
  27: 'Terror', 878: 'Ficção Científica', 12: 'Aventura',
  16: 'Animação', 80: 'Crime', 99: 'Documentário',
  10752: 'Guerra', 37: 'Faroeste'
};

const tvGenres = {
  10759: 'Ação & Aventura', 16: 'Animação', 35: 'Comédia',
  80: 'Crime', 99: 'Documentário', 18: 'Drama',
  10765: 'Ficção Científica & Fantasia', 10768: 'Guerra & Política',
  9648: 'Mistério', 10762: 'Infantil', 10763: 'Noticiário',
  10764: 'Realidade', 10766: 'Telenovela', 10767: 'Talk Show'
};

function getGenreName(genreId, mediaType) {
  const genres = mediaType === 'movie' ? movieGenres : tvGenres;
  return genres[genreId] || 'Outros';
}

function validateProduction(body) {
  const errors = [];
  if (!body.title || typeof body.title !== 'string' || !body.title.trim()) {
    errors.push('Título é obrigatório');
  }
  if (!body.type || !['filme', 'serie'].includes(body.type)) {
    errors.push('Tipo deve ser "filme" ou "serie"');
  }
  if (body.year === undefined || body.year === null) {
    errors.push('Ano é obrigatório');
  } else {
    const year = Number(body.year);
    if (isNaN(year) || year < 1888 || year > new Date().getFullYear()) {
      errors.push('Ano inválido');
    }
  }
  if (body.rating !== undefined && body.rating !== null && body.rating !== '') {
    const rating = Number(body.rating);
    if (isNaN(rating) || rating < 0 || rating > 10) {
      errors.push('Avaliação deve estar entre 0 e 10');
    }
  }
  return errors;
}

app.get('/api/search-media', async (req, res) => {
  const { query, language = 'pt-BR' } = req.query;

  if (!query || !query.trim()) {
    return res.status(400).json({ message: 'Parâmetro "query" é obrigatório' });
  }

  if (!TMDB_API_KEY) {
    return res.status(503).json({ message: 'Chave da API TMDB não configurada. Defina a variável de ambiente TMDB_API_KEY.' });
  }

  try {
    const response = await axios.get('https://api.themoviedb.org/3/search/multi', {
      params: { api_key: TMDB_API_KEY, query, language }
    });

    const results = response.data.results
      .filter(item => item.media_type === 'movie' || item.media_type === 'tv')
      .map(item => ({
        id: item.id,
        title: item.media_type === 'movie' ? item.title : item.name,
        originalTitle: item.media_type === 'movie' ? item.original_title : item.original_name,
        type: item.media_type === 'movie' ? 'filme' : 'serie',
        genre: item.genre_ids.length > 0
          ? getGenreName(item.genre_ids[0], item.media_type)
          : 'Não especificado',
        year: item.media_type === 'movie'
          ? new Date(item.release_date).getFullYear()
          : new Date(item.first_air_date).getFullYear(),
        rating: item.vote_average ? Number(item.vote_average.toFixed(1)) : null,
        poster: item.poster_path
          ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
          : null
      }));

    res.json(results);
  } catch (error) {
    console.error('Erro ao buscar mídia:', error.message);
    res.status(500).json({ message: 'Erro ao buscar informações' });
  }
});

app.get('/api/productions', (req, res) => {
  res.status(200).json(productions);
});

app.post('/api/productions', (req, res) => {
  const errors = validateProduction(req.body);
  if (errors.length > 0) {
    return res.status(400).json({ message: errors.join(', ') });
  }

  const production = {
    id: getNextId(productions),
    title: req.body.title.trim(),
    type: req.body.type,
    genre: (req.body.genre || '').trim(),
    year: Number(req.body.year),
    rating: req.body.rating !== undefined && req.body.rating !== '' ? Number(req.body.rating) : null
  };

  productions.push(production);
  saveProductions(productions);

  res.status(201).json(production);
});

app.put('/api/productions/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const index = productions.findIndex(prod => prod.id === id);

  if (index === -1) {
    return res.status(404).json({ message: 'Produção não encontrada.' });
  }

  const errors = validateProduction(req.body);
  if (errors.length > 0) {
    return res.status(400).json({ message: errors.join(', ') });
  }

  productions[index] = {
    ...productions[index],
    title: (req.body.title || productions[index].title).trim(),
    type: req.body.type || productions[index].type,
    genre: req.body.genre !== undefined ? req.body.genre.trim() : productions[index].genre,
    year: req.body.year !== undefined ? Number(req.body.year) : productions[index].year,
    rating: req.body.rating !== undefined ? (req.body.rating !== '' ? Number(req.body.rating) : null) : productions[index].rating
  };

  saveProductions(productions);
  res.status(200).json(productions[index]);
});

app.delete('/api/productions/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const index = productions.findIndex(prod => prod.id === id);

  if (index === -1) {
    return res.status(404).json({ message: 'Produção não encontrada.' });
  }

  productions.splice(index, 1);
  saveProductions(productions);

  res.status(200).json({ message: 'Produção removida com sucesso.' });
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
