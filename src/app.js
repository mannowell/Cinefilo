// app.js - Lógica do Frontend

// Função para buscar e exibir as produções cadastradas
function fetchProductions() {
  fetch('http://localhost:3000/api/productions')
      .then(response => response.json())
      .then(data => {
        const listDiv = document.getElementById('list');
        listDiv.innerHTML = ''; // Limpa a lista antes de atualizar
  
        if (data.length === 0) {
          listDiv.innerHTML = '<p>Nenhuma produção cadastrada.</p>';
          return;
        }
  
        data.forEach(prod => {
          const prodDiv = document.createElement('div');
          prodDiv.className = 'production-item';
          prodDiv.innerHTML = `
            <strong>${prod.title}</strong> (${prod.year})<br>
            Categoria: ${prod.category} | Nota IMDb: ${prod.imdbRating}<br>
            Diretor: ${prod.director} | Ator Principal: ${prod.mainActor}
          `;
          listDiv.appendChild(prodDiv);
        });
      })
      .catch(error => console.error('Erro ao buscar produções:', error));
  }
  
  // Função para lidar com o envio do formulário
  function handleFormSubmit(event) {
    event.preventDefault(); // Impede o envio padrão do formulário
  
    // Captura os valores dos campos
  const title = document.getElementById('title').value.trim();
  const category = document.getElementById('category').value.trim();
  const year = parseInt(document.getElementById('year').value);
  const imdbRating = parseFloat(document.getElementById('imdbRating').value);
  const director = document.getElementById('director').value.trim();
  const mainActor = document.getElementById('mainActor').value.trim();
  
     // Validações simples
  if (!title || !category || !director || !mainActor) {
    alert("Por favor, preencha todos os campos obrigatórios.");
    return;
  }

  if (isNaN(year) || year < 1888 || year > new Date().getFullYear()) {
    alert("Por favor, insira um ano válido.");
    return;
  }

  if (isNaN(imdbRating) || imdbRating < 0 || imdbRating > 10) {
    alert("A nota IMDb deve estar entre 0 e 10.");
    return;
  }

    // Cria o objeto da produção
    const newProduction = {
      title,
      category,
      year,
      imdbRating,
      director,
      mainActor
    };
  
    // Faz a requisição POST para adicionar a nova produção
    fetch('/api/productions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(newProduction)
    })
    .then(response => response.json())
    .then(data => {
      console.log('Produção adicionada:', data);
      // Limpa o formulário
      document.getElementById('production-form').reset();
      // Atualiza a lista de produções
      fetchProductions();
    })
    .catch(error => console.error('Erro ao adicionar produção:', error));
  }
  
  // Associa o envio do formulário à função handleFormSubmit
  document.getElementById('production-form').addEventListener('submit', handleFormSubmit);
  
  // Busca e exibe as produções quando a página é carregada
  fetchProductions();

  function handleSearch() {
    const searchQuery = document.getElementById('search-input').value.toLowerCase();
  
    fetch('/api/productions')
      .then(response => response.json())
      .then(data => {
        const filteredProductions = data.filter(production => {
          return (
            production.title.toLowerCase().includes(searchQuery) ||
            production.category.toLowerCase().includes(searchQuery) ||
            production.director.toLowerCase().includes(searchQuery) ||
            production.mainActor.toLowerCase().includes(searchQuery) ||
            production.year.toString().includes(searchQuery) ||
            production.imdbRating.toString().includes(searchQuery)
          );
        });
  
        renderProductions(filteredProductions);
      })
      .catch(error => console.error('Erro ao buscar produções:', error));
  }
  
  // Função para renderizar as produções com botões de edição e exclusão
function renderProductions(data) {
  const listDiv = document.getElementById('list');
  listDiv.innerHTML = '';

  if (data.length === 0) {
    listDiv.innerHTML = '<p>Nenhuma produção cadastrada.</p>';
    return;
  }

  data.forEach(prod => {
    const prodDiv = document.createElement('div');
    prodDiv.className = 'production-item';
    prodDiv.innerHTML = `
      <strong>${prod.title}</strong> (${prod.year})<br>
      Categoria: ${prod.category} | Nota IMDb: ${prod.imdbRating}<br>
      Diretor: ${prod.director} | Ator Principal: ${prod.mainActor}
      <br>
      <button onclick="handleEdit(${prod.id})">Editar</button>
      <button onclick="handleDelete(${prod.id})">Excluir</button>
    `;
    listDiv.appendChild(prodDiv);
  });
}

// Função para excluir uma produção
function handleDelete(id) {
  if (confirm('Tem certeza que deseja excluir esta produção?')) {
    fetch(`/api/productions/${id}`, {
      method: 'DELETE'
    })
    .then(response => response.json())
    .then(() => fetchProductions())
    .catch(error => console.error('Erro ao excluir produção:', error));
  }
}

// Função básica para edição (simplesmente preenche o formulário para edição)
function handleEdit(id) {
  fetch(`/api/productions`)
    .then(response => response.json())
    .then(data => {
      const production = data.find(prod => prod.id === id);
      if (production) {
        document.getElementById('title').value = production.title;
        document.getElementById('category').value = production.category;
        document.getElementById('year').value = production.year;
        document.getElementById('imdbRating').value = production.imdbRating;
        document.getElementById('director').value = production.director;
        document.getElementById('mainActor').value = production.mainActor;
        
        // Atualiza o submit para salvar a edição
        document.getElementById('production-form').onsubmit = (event) => {
          event.preventDefault();
          saveEdit(id);
        };
      }
    })
    .catch(error => console.error('Erro ao buscar produção para edição:', error));
}

// Função para salvar a edição
function saveEdit(id) {
  const updatedProduction = {
    title: document.getElementById('title').value.trim(),
    category: document.getElementById('category').value.trim(),
    year: parseInt(document.getElementById('year').value),
    imdbRating: parseFloat(document.getElementById('imdbRating').value),
    director: document.getElementById('director').value.trim(),
    mainActor: document.getElementById('mainActor').value.trim()
  };

  fetch(`/api/productions/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(updatedProduction)
  })
  .then(response => response.json())
  .then(() => {
    document.getElementById('production-form').reset();
    document.getElementById('production-form').onsubmit = handleFormSubmit;
    fetchProductions();
  })
  .catch(error => console.error('Erro ao salvar edição:', error));
}

const form = document.getElementById("production-form");
const list = document.getElementById("list");

let productions = []; // Simula dados no frontend temporariamente

form.addEventListener("submit", (e) => {
  e.preventDefault();

  const newProduction = {
    id: Date.now(), // ID único para simulação
    title: form.title.value,
    category: form.category.value,
    year: form.year.value,
    imdbRating: form.imdbRating.value,
    director: form.director.value,
    mainActor: form.mainActor.value,
  };

  productions.push(newProduction);
  form.reset();
  renderProductions();
});

function renderProductions() {
  list.innerHTML = "";

  productions.forEach((production) => {
    const div = document.createElement("div");
    div.classList.add("production-item");

    div.innerHTML = `
      <strong>${production.title}</strong> (${production.year}) - ${production.category} 
      <br> Nota IMDb: ${production.imdbRating} | Diretor: ${production.director} | Ator: ${production.mainActor}
    `;

    const editButton = document.createElement("button");
    editButton.textContent = "Editar";
    editButton.onclick = () => editProduction(production.id);

    const deleteButton = document.createElement("button");
    deleteButton.textContent = "Excluir";
    deleteButton.onclick = () => deleteProduction(production.id);

    div.appendChild(editButton);
    div.appendChild(deleteButton);
    list.appendChild(div);
  });
}

function editProduction(id) {
  const production = productions.find((p) => p.id === id);
  if (production) {
    form.title.value = production.title;
    form.category.value = production.category;
    form.year.value = production.year;
    form.imdbRating.value = production.imdbRating;
    form.director.value = production.director;
    form.mainActor.value = production.mainActor;

    productions = productions.filter((p) => p.id !== id);
    renderProductions();
  }
}

function deleteProduction(id) {
  productions = productions.filter((p) => p.id !== id);
  renderProductions();
}



  // Teste inicial
  console.log("Aplicação do Gerenciador de Filmes e Séries iniciada!");
  