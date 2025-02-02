// Configurações globais
const API_BASE_URL = 'http://localhost:3000/api';
const PRODUCTIONS_PER_PAGE = 5;

// Função para buscar produções com suporte a paginação e filtros
async function fetchProductions(page = 1, searchQuery = '', type = '') {
  fetch(`${API_BASE_URL}/productions/search?query=${searchQuery}&type=${type}&page=${page}&limit=${PRODUCTIONS_PER_PAGE}`)
    .then(response => {
      // Verifica se a resposta é um JSON válido
      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      const listDiv = document.getElementById('list');
      listDiv.innerHTML = ''; // Limpa a lista antes de atualizar

      if (!data || data.productions.length === 0) {
        listDiv.innerHTML = '<p class="text-center text-muted">Nenhuma produção encontrada.</p>';
        return;
      }

      renderProductions(data.productions);
      renderPagination(data.total, page);
    })
    .catch(error => {
      console.error('Erro ao buscar produções:', error);
      const listDiv = document.getElementById('list');
      listDiv.innerHTML = `
        <div class="alert alert-danger text-center" role="alert">
          Erro ao carregar produções. 
          <br>Detalhes: ${error.message}
          <br><button onclick="fetchProductions()" class="btn btn-sm btn-outline-danger mt-2">Tentar Novamente</button>
        </div>
      `;
    });
}

// Função para renderizar produções com design melhorado
function renderProductions(productions) {
  const listDiv = document.getElementById('list');
  listDiv.innerHTML = '';

  if (productions.length === 0) {
    listDiv.innerHTML = '<p class="text-center text-muted">Nenhuma produção encontrada.</p>';
    return;
  }

  productions.forEach(prod => {
    const prodDiv = document.createElement('div');
    prodDiv.className = 'production-item';
    prodDiv.innerHTML = `
      <div class="d-flex justify-content-between align-items-center">
        <div>
          <h5 class="mb-1">${prod.title}</h5>
          <p class="mb-1">
            <span class="badge bg-primary">${prod.type}</span>
            <span class="badge bg-secondary">${prod.genre}</span>
            <span class="badge bg-info">${prod.year}</span>
          </p>
          <small class="text-muted">Avaliação: ${prod.rating || 'N/A'}/10</small>
        </div>
        <div>
          <button onclick="handleEdit(${prod.id})" class="btn btn-sm btn-warning btn-action">Editar</button>
          <button onclick="handleDelete(${prod.id})" class="btn btn-sm btn-danger btn-action">Excluir</button>
        </div>
      </div>
    `;
    listDiv.appendChild(prodDiv);
  });
}

// Função de paginação com design Bootstrap
function renderPagination(total, currentPage) {
  const paginationDiv = document.getElementById('pagination');
  const totalPages = Math.ceil(total / PRODUCTIONS_PER_PAGE);

  paginationDiv.innerHTML = `
    <nav>
      <ul class="pagination justify-content-center">
        <li class="page-item ${currentPage === 1 ? 'disabled' : ''}">
          <a class="page-link" href="#" onclick="fetchProductions(${currentPage - 1})">Anterior</a>
        </li>
        ${Array.from({length: totalPages}, (_, i) => `
          <li class="page-item ${currentPage === i + 1 ? 'active' : ''}">
            <a class="page-link" href="#" onclick="fetchProductions(${i + 1})">${i + 1}</a>
          </li>
        `).join('')}
        <li class="page-item ${currentPage === totalPages ? 'disabled' : ''}">
          <a class="page-link" href="#" onclick="fetchProductions(${currentPage + 1})">Próximo</a>
        </li>
      </ul>
    </nav>
  `;
}

// Função para lidar com o envio do formulário
async function handleFormSubmit(event) {
  event.preventDefault();
  
  const production = {
    title: document.getElementById('title').value.trim(),
    type: document.getElementById('type').value,
    genre: document.getElementById('genre').value.trim(),
    year: parseInt(document.getElementById('year').value),
    rating: parseFloat(document.getElementById('rating').value)
  };

  try {
    const response = await fetch(`${API_BASE_URL}/productions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(production)
    });

    if (response.ok) {
      showToast('Produção adicionada com sucesso!', 'success');
      fetchProductions(); // Atualiza a lista
      event.target.reset(); // Limpa o formulário
    } else {
      const errorData = await response.json();
      showToast(errorData.message || 'Erro ao adicionar produção', 'danger');
    }
  } catch (error) {
    console.error('Erro:', error);
    showToast('Erro ao adicionar produção', 'danger');
  }
}

// Função para mostrar toast de notificação
function showToast(message, type = 'info') {
  const toastContainer = document.getElementById('toast-container');
  if (!toastContainer) {
    const container = document.createElement('div');
    container.id = 'toast-container';
    container.style.position = 'fixed';
    container.style.top = '20px';
    container.style.right = '20px';
    container.style.zIndex = '1050';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast align-items-center text-white bg-${type} border-0`;
  toast.innerHTML = `
    <div class="d-flex">
      <div class="toast-body">${message}</div>
      <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
    </div>
  `;

  document.getElementById('toast-container').appendChild(toast);
  new bootstrap.Toast(toast).show();
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('production-form').addEventListener('submit', handleFormSubmit);
  document.getElementById('search').addEventListener('input', (e) => {
    fetchProductions(1, e.target.value);
  });
  
  // Busca inicial
  fetchProductions();
});

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

// Função para editar uma produção
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

// Função para buscar e preencher os dados automaticamente
async function fetchAndAutoFillMovieData() {
  const movieTitle = document.getElementById('title').value.trim();
  
  if (!movieTitle) {
    showToast('Por favor, insira um título', 'warning');
    return;
  }

  try {
    // Busca na API de filmes/séries
    const response = await fetch(`/api/search-media?query=${encodeURIComponent(movieTitle)}`);
    const results = await response.json();

    if (results.length === 0) {
      showToast('Nenhum filme ou série encontrado', 'warning');
      return;
    }

    // Se encontrar apenas um resultado, preenche automaticamente
    if (results.length === 1) {
      const media = results[0];
      document.getElementById('title').value = media.title;
      document.getElementById('type').value = media.type;
      document.getElementById('genre').value = media.genre;
      document.getElementById('year').value = media.year;
      document.getElementById('rating').value = media.rating || '';

      showToast(`Dados de "${media.title}" preenchidos automaticamente`, 'success');
      return;
    }

    // Se múltiplos resultados, mostra modal de seleção
    showMediaSelectionModal(results);

  } catch (error) {
    console.error('Erro ao buscar dados:', error);
    showToast('Erro ao buscar dados automaticamente', 'danger');
  }
}

// Função para mostrar modal de seleção de mídia
function showMediaSelectionModal(results) {
  // Cria um modal de seleção
  const modalDiv = document.createElement('div');
  modalDiv.className = 'modal fade';
  modalDiv.id = 'mediaSelectionModal';
  modalDiv.innerHTML = `
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Selecione o filme/série</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
        </div>
        <div class="modal-body">
          ${results.map(media => `
            <div class="media-option" data-id="${media.id}">
              <img src="${media.poster || 'placeholder.jpg'}" alt="${media.title}" style="max-width: 100px;">
              <div>
                <strong>${media.title}</strong> (${media.year})
                <p>${media.genre} | ${media.type}</p>
                <button class="btn btn-primary btn-sm select-media">Selecionar</button>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;

  // Adiciona o modal ao body
  document.body.appendChild(modalDiv);

  // Inicializa o modal do Bootstrap
  const mediaModal = new bootstrap.Modal(document.getElementById('mediaSelectionModal'));
  mediaModal.show();

  // Adiciona event listeners para os botões de seleção
  document.querySelectorAll('.select-media').forEach((button, index) => {
    button.addEventListener('click', () => {
      const selectedMedia = results[index];
      
      // Preenche o formulário
      document.getElementById('title').value = selectedMedia.title;
      document.getElementById('type').value = selectedMedia.type;
      document.getElementById('genre').value = selectedMedia.genre;
      document.getElementById('year').value = selectedMedia.year;
      document.getElementById('rating').value = selectedMedia.rating || '';

      // Fecha o modal
      mediaModal.hide();
      
      // Remove o modal do DOM
      document.body.removeChild(modalDiv);

      showToast(`Dados de "${selectedMedia.title}" preenchidos automaticamente`, 'success');
    });
  });
}

// Adiciona o evento para o botão de "Adicionar Automaticamente"
document.getElementById('auto-add-button').addEventListener('click', fetchAndAutoFillMovieData);
