const express = require('express');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware para converter o body da requisição em JSON
app.use(express.json());
app.use(cors());

// Middleware para servir arquivos estáticos da pasta "public"
app.use(express.static(path.join(__dirname, 'public')));

// Caminho para o arquivo de armazenamento de dados
const DATA_FILE = path.join(__dirname, 'productions.json');

// Função para carregar produções do arquivo
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

// Função para salvar produções no arquivo
function saveProductions(productions) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(productions, null, 2), 'utf8');
  } catch (error) {
    console.error('Erro ao salvar produções:', error);
  }
}

// Carregar produções ao iniciar o servidor
let productions = loadProductions();

// Chave da API do TMDB (você deve criar uma conta no site para obter)
const TMDB_API_KEY = '72ecdc0034e00fd6ba323913c7823084'; // Substitua pela sua chave real

// Rota para buscar informações de filme/série
app.get('/api/search-media', async (req, res) => {
  const { query, language = 'pt-BR' } = req.query;

  try {
    // Busca na API do TMDB
    const response = await axios.get('https://api.themoviedb.org/3/search/multi', {
      params: {
        api_key: TMDB_API_KEY,
        query: query,
        language: language
      }
    });

    // Filtra e mapeia os resultados
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
    console.error('Erro ao buscar mídia:', error);
    res.status(500).json({ message: 'Erro ao buscar informações' });
  }
});

// Função auxiliar para mapear IDs de gênero
function getGenreName(genreId, mediaType) {
  const movieGenres = {
    28: 'Ação', 35: 'Comédia', 18: 'Drama', 10749: 'Romance', 
    27: 'Terror', 878: 'Ficção Científica', 12: 'Aventura'
  };

  const tvGenres = {
    10759: 'Ação & Aventura', 16: 'Animação', 35: 'Comédia', 
    80: 'Crime', 99: 'Documentário', 18: 'Drama'
  };

  return mediaType === 'movie' 
    ? (movieGenres[genreId] || 'Outros') 
    : (tvGenres[genreId] || 'Outros');
}

// Rota básica para testar o servidor
app.get('/api/hello', (req, res) => {
  res.json({ message: 'Servidor funcionando com Express!' });
});

// Endpoint GET para listar todas as produções
app.get('/api/productions', (req, res) => {
  try {
    // Verifica se há produções
    if (!productions || productions.length === 0) {
      return res.status(200).json([]);
    }

    // Retorna as produções como JSON
    res.status(200).json(productions);
  } catch (error) {
    console.error('Erro ao buscar produções:', error);
    res.status(500).json({ 
      message: 'Erro ao buscar produções', 
      error: error.message 
    });
  }
});

// Endpoint POST para adicionar uma nova produção
app.post('/api/productions', (req, res) => {
  const production = req.body;

  // Simplesmente criando um ID incremental
  production.id = productions.length + 1;

  // Adiciona a produção no array
  productions.push(production);

  // Salvar produções no arquivo
  saveProductions(productions);

  // Retorna a produção criada com status 201 (Created)
  res.status(201).json(production);
});

// Endpoint PUT para editar uma produção existente
app.put('/api/productions/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const updatedProduction = req.body;

  const index = productions.findIndex(prod => prod.id === id);
  if (index !== -1) {
    productions[index] = { ...productions[index], ...updatedProduction };

    // Salvar produções no arquivo
    saveProductions(productions);

    res.status(200).json(productions[index]);
  } else {
    res.status(404).json({ message: 'Produção não encontrada.' });
  }
});

// Endpoint DELETE para remover uma produção
app.delete('/api/productions/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const index = productions.findIndex(prod => prod.id === id);

  if (index !== -1) {
    productions.splice(index, 1);

    // Salvar produções no arquivo
    saveProductions(productions);

    res.status(200).json({ message: 'Produção removida com sucesso.' });
  } else {
    res.status(404).json({ message: 'Produção não encontrada.' });
  }
});

// Inicia o servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
