const API_BASE_URL = '/api';

async function fetchProductions(searchQuery = '', type = '') {
  try {
    const response = await fetch(`${API_BASE_URL}/productions`);
    if (!response.ok) {
      throw new Error(`Erro HTTP: ${response.status}`);
    }

    let data = await response.json();

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      data = data.filter(prod =>
        prod.title.toLowerCase().includes(q) ||
        (prod.genre && prod.genre.toLowerCase().includes(q)) ||
        prod.year.toString().includes(q)
      );
    }

    if (type) {
      data = data.filter(prod => prod.type === type);
    }

    renderProductions(data);
  } catch (error) {
    console.error('Erro ao buscar produções:', error);
    const listDiv = document.getElementById('list');
    if (listDiv) {
      listDiv.innerHTML = `
        <div class="alert alert-danger text-center" role="alert">
          Erro ao carregar produções.
          <br>Detalhes: ${error.message}
          <br><button onclick="fetchProductions()" class="btn btn-sm btn-outline-danger mt-2">Tentar Novamente</button>
        </div>
      `;
    }
  }
}

function renderProductions(productions) {
  const listDiv = document.getElementById('list');
  if (!listDiv) return;
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
            <span class="badge bg-secondary">${prod.genre || 'N/A'}</span>
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

function handleFormSubmit(event) {
  event.preventDefault();

  const production = {
    title: document.getElementById('title').value.trim(),
    type: document.getElementById('type').value,
    genre: document.getElementById('genre').value.trim(),
    year: parseInt(document.getElementById('year').value),
    rating: document.getElementById('rating').value !== '' ? parseFloat(document.getElementById('rating').value) : null
  };

  fetch(`${API_BASE_URL}/productions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(production)
  })
    .then(response => {
      if (!response.ok) throw new Error('Erro ao adicionar produção');
      return response.json();
    })
    .then(data => {
      showToast('Produção adicionada com sucesso!', 'success');
      event.target.reset();
      fetchProductions();
    })
    .catch(error => {
      console.error('Erro:', error);
      showToast('Erro ao adicionar produção', 'danger');
    });
}

function handleDelete(id) {
  if (!confirm('Tem certeza que deseja excluir esta produção?')) return;

  fetch(`${API_BASE_URL}/productions/${id}`, { method: 'DELETE' })
    .then(response => {
      if (!response.ok) throw new Error('Erro ao excluir');
      return response.json();
    })
    .then(() => fetchProductions())
    .catch(error => console.error('Erro ao excluir produção:', error));
}

function handleEdit(id) {
  fetch(`${API_BASE_URL}/productions`)
    .then(response => response.json())
    .then(data => {
      const production = data.find(prod => prod.id === id);
      if (!production) return;

      document.getElementById('title').value = production.title;
      document.getElementById('type').value = production.type;
      document.getElementById('genre').value = production.genre || '';
      document.getElementById('year').value = production.year;
      document.getElementById('rating').value = production.rating ?? '';

      const form = document.getElementById('production-form');
      form.onsubmit = (event) => {
        event.preventDefault();
        saveEdit(id);
      };

      window.scrollTo({ top: 0, behavior: 'smooth' });
    })
    .catch(error => console.error('Erro ao buscar produção para edição:', error));
}

function saveEdit(id) {
  const updatedProduction = {
    title: document.getElementById('title').value.trim(),
    type: document.getElementById('type').value,
    genre: document.getElementById('genre').value.trim(),
    year: parseInt(document.getElementById('year').value),
    rating: document.getElementById('rating').value !== '' ? parseFloat(document.getElementById('rating').value) : null
  };

  fetch(`${API_BASE_URL}/productions/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updatedProduction)
  })
    .then(response => {
      if (!response.ok) throw new Error('Erro ao salvar edição');
      return response.json();
    })
    .then(() => {
      showToast('Produção atualizada com sucesso!', 'success');
      document.getElementById('production-form').reset();
      document.getElementById('production-form').onsubmit = handleFormSubmit;
      fetchProductions();
    })
    .catch(error => {
      console.error('Erro ao salvar edição:', error);
      showToast('Erro ao salvar edição', 'danger');
    });
}

function showToast(message, type = 'info') {
  let toastContainer = document.getElementById('toast-container');
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.id = 'toast-container';
    toastContainer.style.position = 'fixed';
    toastContainer.style.top = '20px';
    toastContainer.style.right = '20px';
    toastContainer.style.zIndex = '1050';
    document.body.appendChild(toastContainer);
  }

  const toast = document.createElement('div');
  toast.className = `toast align-items-center text-white bg-${type} border-0`;
  toast.innerHTML = `
    <div class="d-flex">
      <div class="toast-body">${message}</div>
      <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
    </div>
  `;

  toastContainer.appendChild(toast);
  const bsToast = new bootstrap.Toast(toast);
  bsToast.show();
  toast.addEventListener('hidden.bs.toast', () => toast.remove());
}

async function fetchAndAutoFillMovieData() {
  const movieTitle = document.getElementById('title').value.trim();

  if (!movieTitle) {
    showToast('Por favor, insira um título', 'warning');
    return;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/search-media?query=${encodeURIComponent(movieTitle)}`);
    const results = await response.json();

    if (!results || results.length === 0) {
      showToast('Nenhum filme ou série encontrado', 'warning');
      return;
    }

    if (results.length === 1) {
      fillFormWithMedia(results[0]);
      showToast(`Dados de "${results[0].title}" preenchidos automaticamente`, 'success');
      return;
    }

    showMediaSelectionModal(results);
  } catch (error) {
    console.error('Erro ao buscar dados:', error);
    showToast('Erro ao buscar dados automaticamente', 'danger');
  }
}

function fillFormWithMedia(media) {
  document.getElementById('title').value = media.title;
  document.getElementById('type').value = media.type;
  document.getElementById('genre').value = media.genre || '';
  document.getElementById('year').value = media.year;
  document.getElementById('rating').value = media.rating ?? '';
}

function showMediaSelectionModal(results) {
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
          ${results.map((media, index) => `
            <div class="media-option d-flex align-items-center p-2 border-bottom" data-index="${index}">
              <img src="${media.poster || ''}" alt="${media.title}"
                   style="max-width: 80px; margin-right: 1rem;"
                   onerror="this.style.display='none'">
              <div class="flex-grow-1">
                <strong>${media.title}</strong> (${media.year})
                <p class="mb-1 text-muted">${media.genre} | ${media.type}</p>
              </div>
              <button class="btn btn-primary btn-sm select-media" data-index="${index}">Selecionar</button>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(modalDiv);

  const mediaModal = new bootstrap.Modal(modalDiv);
  mediaModal.show();

  modalDiv.querySelectorAll('.select-media').forEach(button => {
    button.addEventListener('click', () => {
      const idx = parseInt(button.dataset.index);
      fillFormWithMedia(results[idx]);
      mediaModal.hide();
      modalDiv.addEventListener('hidden.bs.modal', () => modalDiv.remove());
      showToast(`Dados de "${results[idx].title}" preenchidos automaticamente`, 'success');
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('production-form');
  if (form) {
    form.addEventListener('submit', handleFormSubmit);
  }

  const searchInput = document.getElementById('search');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      fetchProductions(e.target.value);
    });
  }

  const autoAddBtn = document.getElementById('auto-add-button');
  if (autoAddBtn) {
    autoAddBtn.addEventListener('click', fetchAndAutoFillMovieData);
  }

  fetchProductions();
});
