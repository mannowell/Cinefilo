# 🎬 Cinefilo - Gerenciador de Produções

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg?logo=nodedotjs)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.x-black.svg?logo=express)](https://expressjs.com/)

## Descrição

Cinefilo é uma aplicação web para gerenciar suas produções cinematográficas favoritas. Com recursos de adicionar, editar, listar, buscar e excluir produções, esta aplicação oferece uma experiência simples e intuitiva.

## Funcionalidades

- Adicionar filmes e séries com validação de campos
- Busca automática de dados via API do TMDB
- Edição de produções existentes
- Exclusão com confirmação
- Filtros por tipo (filme/série), avaliação e texto livre
- Interface responsiva com Bootstrap

## Tecnologias Utilizadas

- **Frontend:** HTML5, CSS3, JavaScript, Bootstrap 5
- **Backend:** Node.js, Express
- **API Externa:** [The Movie Database (TMDB)](https://www.themoviedb.org/)
- **Armazenamento:** Arquivo JSON local

## Como Executar

1. Clone o repositório
2. Instale as dependências:
   ```bash
   npm install
   ```
3. (Opcional) Configure a chave da API do TMDB para busca automática:
   ```bash
   export TMDB_API_KEY=sua_chave_aqui
   ```
4. Inicie o servidor:
   ```bash
   npm start
   ```
5. Acesse no navegador: `http://localhost:3000`

## Estrutura do Projeto

```
Cinefilo/
├── public/
│   ├── index.html          # Página principal (adicionar produções)
│   ├── lista-producoes.html # Lista e filtros de produções
│   └── app.js              # Lógica do frontend
├── server.js               # Servidor Express e rotas da API
├── productions.json         # Armazenamento de dados
├── package.json
└── .gitignore
```

## API

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/productions` | Lista todas as produções |
| POST | `/api/productions` | Adiciona uma nova produção |
| PUT | `/api/productions/:id` | Atualiza uma produção |
| DELETE | `/api/productions/:id` | Remove uma produção |
| GET | `/api/search-media?query=` | Busca mídia no TMDB |

## 👤 Autor

**Wellison Oliveira** ([@mannowell](https://github.com/mannowell))

Desenvolvido com ❤️ por Wellison Oliveira © 2024

## 📄 Licença

Este projeto está licenciado sob a licença **MIT**. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 🤝 Contribuindo

Contribuições são bem-vindas! Siga os passos abaixo:

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/MinhaFeature`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova feature'`)
4. Push para a branch (`git push origin feature/MinhaFeature`)
5. Abra um Pull Request
