const API_BASE_URL = "/books";

let allBooks = [];
let bookIdToDelete = null;

const COVER_PALETTES = [
  { bg: "#E6EFE9", text: "#1E4631" },
  { bg: "#F4E8E1", text: "#7C2D12" },
  { bg: "#E8EEF5", text: "#1E3A8A" },
  { bg: "#F3EBF5", text: "#581C87" },
  { bg: "#F5F0E1", text: "#713F12" },
  { bg: "#EAEAEA", text: "#262626" }
];

async function handleApiResponse(response) {
  if (response.ok) {
    return response.json();
  }

  if (response.status === 404) {
    throw new Error("Livro não encontrado no acervo (Erro 404). Ele pode já ter sido removido.");
  }

  if (response.status === 422) {
    throw new Error("Dados em formato inválido (Erro 422). Verifique o título e o autor informados.");
  }

  throw new Error(`Erro inesperado do servidor (Código ${response.status}).`);
}

async function fetchAllBooks() {
  setLoadingState(true);
  setOfflineBanner(false);

  try {
    const response = await fetch(API_BASE_URL);
    const data = await handleApiResponse(response);
    allBooks = Array.isArray(data) ? data : [];
    renderFilteredBooks();
  } catch (error) {
    if (error instanceof TypeError) {
      setOfflineBanner(true);
      showToast("Servidor desligado. Ligue o FastAPI para carregar os livros.", "error");
    } else {
      showToast(error.message, "error");
    }
    allBooks = [];
    renderFilteredBooks();
  } finally {
    setLoadingState(false);
  }
}

async function fetchBookById(bookId) {
  const response = await fetch(`${API_BASE_URL}/${bookId}`);
  return handleApiResponse(response);
}

async function createBookRequest(bookPayload) {
  const response = await fetch(API_BASE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(bookPayload)
  });
  return handleApiResponse(response);
}

async function updateBookRequest(bookId, bookPayload) {
  const response = await fetch(`${API_BASE_URL}/${bookId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(bookPayload)
  });
  return handleApiResponse(response);
}

async function deleteBookRequest(bookId) {
  const response = await fetch(`${API_BASE_URL}/${bookId}`, {
    method: "DELETE"
  });
  return handleApiResponse(response);
}

function getCoverStyle(book) {
  const cleanTitle = (book.title || "L").trim();
  const initial = cleanTitle.charAt(0).toUpperCase();
  const paletteIndex = Math.abs(Number(book.id) || 0) % COVER_PALETTES.length;
  return {
    initial,
    palette: COVER_PALETTES[paletteIndex]
  };
}

function renderFilteredBooks() {
  const searchInput = document.getElementById("searchInput");
  const clearBtn = document.getElementById("clearSearchBtn");
  const query = searchInput.value.trim().toLowerCase();

  clearBtn.classList.toggle("hidden", query.length === 0);

  const filtered = allBooks.filter((book) => {
    const titleMatch = book.title.toLowerCase().includes(query);
    const authorMatch = book.author.toLowerCase().includes(query);
    return titleMatch || authorMatch;
  });

  updateBookCounter(filtered.length, allBooks.length, query);
  renderBooksGrid(filtered, query);
}

function updateBookCounter(filteredCount, totalCount, query) {
  const badge = document.getElementById("bookCountBadge");
  if (query) {
    badge.textContent = `${filteredCount} de ${totalCount} livro(s)`;
  } else {
    badge.textContent = totalCount === 1 ? "1 livro no acervo" : `${totalCount} livros no acervo`;
  }
}

function renderBooksGrid(booksToRender, currentQuery) {
  const grid = document.getElementById("booksGrid");
  const emptyState = document.getElementById("emptyState");
  const emptySubtitle = document.getElementById("emptyStateSubtitle");
  const emptyActionBtn = document.getElementById("emptyStateActionBtn");

  grid.innerHTML = "";

  if (booksToRender.length === 0) {
    grid.classList.add("hidden");
    emptyState.classList.remove("hidden");

    if (currentQuery) {
      emptySubtitle.textContent = `Não encontramos nenhum título ou autor correspondente a "${currentQuery}".`;
      emptyActionBtn.textContent = "Limpar filtro de busca";
      emptyActionBtn.onclick = () => {
        document.getElementById("searchInput").value = "";
        renderFilteredBooks();
      };
    } else {
      emptySubtitle.textContent = "O catálogo está vazio no momento. Que tal adicionar a primeira obra?";
      emptyActionBtn.textContent = "Adicionar primeiro livro";
      emptyActionBtn.onclick = () => openBookFormModal();
    }
    return;
  }

  emptyState.classList.add("hidden");
  grid.classList.remove("hidden");

  booksToRender.forEach((book) => {
    const card = createBookCardElement(book);
    grid.appendChild(card);
  });
}

function createBookCardElement(book) {
  const { initial, palette } = getCoverStyle(book);

  const article = document.createElement("article");
  article.className = "book-card";

  const cover = document.createElement("div");
  cover.className = "book-cover";
  cover.style.backgroundColor = palette.bg;
  cover.style.color = palette.text;
  cover.title = `Ver detalhes de ${book.title}`;
  cover.innerHTML = `
    <div class="cover-spine"></div>
    <div class="cover-content">
      <span class="cover-initial"></span>
      <span class="cover-ornament"></span>
    </div>
  `;
  cover.querySelector(".cover-initial").textContent = initial;
  cover.addEventListener("click", () => openDetailsModal(book.id));

  const metaTop = document.createElement("div");
  metaTop.className = "card-meta-top";
  const idBadge = document.createElement("span");
  idBadge.className = "id-badge";
  idBadge.textContent = `#${book.id}`;
  metaTop.appendChild(idBadge);

  const titleEl = document.createElement("h3");
  titleEl.className = "book-title";
  titleEl.textContent = book.title;
  titleEl.addEventListener("click", () => openDetailsModal(book.id));

  const authorEl = document.createElement("p");
  authorEl.className = "book-author";
  authorEl.textContent = book.author;

  const actions = document.createElement("div");
  actions.className = "card-actions";

  const detailsBtn = document.createElement("button");
  detailsBtn.type = "button";
  detailsBtn.className = "btn btn-secondary btn-sm";
  detailsBtn.textContent = "Ver detalhes";
  detailsBtn.addEventListener("click", () => openDetailsModal(book.id));

  const actionGroup = document.createElement("div");
  actionGroup.className = "card-action-group";

  const editBtn = document.createElement("button");
  editBtn.type = "button";
  editBtn.className = "icon-action-btn";
  editBtn.setAttribute("aria-label", `Editar livro ${book.title}`);
  editBtn.title = "Editar livro";
  editBtn.innerHTML = `
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M12 20h9"></path>
      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
    </svg>
  `;
  editBtn.addEventListener("click", () => openBookFormModal(book));

  const deleteBtn = document.createElement("button");
  deleteBtn.type = "button";
  deleteBtn.className = "icon-action-btn delete-action";
  deleteBtn.setAttribute("aria-label", `Excluir livro ${book.title}`);
  deleteBtn.title = "Excluir livro";
  deleteBtn.innerHTML = `
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <polyline points="3 6 5 6 21 6"></polyline>
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
    </svg>
  `;
  deleteBtn.addEventListener("click", () => openDeleteConfirmModal(book));

  actionGroup.append(editBtn, deleteBtn);
  actions.append(detailsBtn, actionGroup);

  article.append(cover, metaTop, titleEl, authorEl, actions);
  return article;
}

function openModalById(modalId) {
  document.getElementById(modalId).classList.remove("hidden");
}

function closeModalById(modalId) {
  document.getElementById(modalId).classList.add("hidden");
}

function openBookFormModal(book = null) {
  const modalTitle = document.getElementById("formModalTitle");
  const idInput = document.getElementById("bookIdInput");
  const titleInput = document.getElementById("bookTitleInput");
  const authorInput = document.getElementById("bookAuthorInput");
  const saveBtn = document.getElementById("saveBookBtn");

  clearFormValidationErrors();

  if (book) {
    modalTitle.textContent = "Editar Livro";
    saveBtn.textContent = "Salvar Alterações";
    idInput.value = book.id;
    titleInput.value = book.title;
    authorInput.value = book.author;
  } else {
    modalTitle.textContent = "Adicionar Novo Livro";
    saveBtn.textContent = "Cadastrar Livro";
    idInput.value = "";
    titleInput.value = "";
    authorInput.value = "";
  }

  openModalById("formModal");
  titleInput.focus();
}

async function handleBookFormSubmit(event) {
  event.preventDefault();
  clearFormValidationErrors();

  const idValue = document.getElementById("bookIdInput").value;
  const titleInput = document.getElementById("bookTitleInput");
  const authorInput = document.getElementById("bookAuthorInput");
  const saveBtn = document.getElementById("saveBookBtn");

  const title = titleInput.value.trim();
  const author = authorInput.value.trim();

  let isValid = true;
  if (!title) {
    document.getElementById("titleError").classList.remove("hidden");
    titleInput.classList.add("input-error");
    isValid = false;
  }
  if (!author) {
    document.getElementById("authorError").classList.remove("hidden");
    authorInput.classList.add("input-error");
    isValid = false;
  }
  if (!isValid) return;

  saveBtn.disabled = true;
  saveBtn.textContent = "Salvando...";

  try {
    if (idValue) {
      await updateBookRequest(Number(idValue), { title, author });
      showToast("Livro atualizado com sucesso!", "success");
    } else {
      await createBookRequest({ title, author });
      showToast("Novo livro adicionado ao acervo!", "success");
    }

    closeModalById("formModal");
    await fetchAllBooks();
  } catch (error) {
    const apiErrorBox = document.getElementById("formApiError");
    apiErrorBox.textContent = error.message;
    apiErrorBox.classList.remove("hidden");
  } finally {
    saveBtn.disabled = false;
    saveBtn.textContent = idValue ? "Salvar Alterações" : "Cadastrar Livro";
  }
}

function clearFormValidationErrors() {
  document.getElementById("titleError").classList.add("hidden");
  document.getElementById("authorError").classList.add("hidden");
  document.getElementById("formApiError").classList.add("hidden");
  document.getElementById("bookTitleInput").classList.remove("input-error");
  document.getElementById("bookAuthorInput").classList.remove("input-error");
}

async function openDetailsModal(bookId) {
  const loadingEl = document.getElementById("detailsLoading");
  const contentEl = document.getElementById("detailsContent");

  openModalById("detailsModal");
  loadingEl.classList.remove("hidden");
  contentEl.classList.add("hidden");

  try {
    const book = await fetchBookById(bookId);
    const { initial, palette } = getCoverStyle(book);

    document.getElementById("detailsIdBadge").textContent = `#${book.id}`;
    document.getElementById("detailsMetaId").textContent = book.id;
    document.getElementById("detailsModalTitle").textContent = book.title;
    document.getElementById("detailsBookAuthor").textContent = book.author;

    const coverEl = document.getElementById("detailsCover");
    coverEl.style.backgroundColor = palette.bg;
    coverEl.style.color = palette.text;
    document.getElementById("detailsCoverInitial").textContent = initial;

    document.getElementById("detailsEditBtn").onclick = () => {
      closeModalById("detailsModal");
      openBookFormModal(book);
    };

    document.getElementById("detailsDeleteBtn").onclick = () => {
      closeModalById("detailsModal");
      openDeleteConfirmModal(book);
    };

    loadingEl.classList.add("hidden");
    contentEl.classList.remove("hidden");
  } catch (error) {
    closeModalById("detailsModal");
    showToast(error.message, "error");
    await fetchAllBooks();
  }
}

function openDeleteConfirmModal(book) {
  bookIdToDelete = book.id;
  document.getElementById("deleteBookTitle").textContent = `"${book.title}"`;
  openModalById("deleteModal");
}

async function handleConfirmDelete() {
  if (bookIdToDelete === null) return;

  const confirmBtn = document.getElementById("confirmDeleteBtn");
  confirmBtn.disabled = true;
  confirmBtn.textContent = "Excluindo...";

  try {
    const result = await deleteBookRequest(bookIdToDelete);
    showToast(result.message || "Livro removido com sucesso!", "success");
    closeModalById("deleteModal");
    await fetchAllBooks();
  } catch (error) {
    showToast(error.message, "error");
    closeModalById("deleteModal");
  } finally {
    confirmBtn.disabled = false;
    confirmBtn.textContent = "Sim, excluir livro";
    bookIdToDelete = null;
  }
}

function setLoadingState(isLoading) {
  const loadingState = document.getElementById("loadingState");
  const grid = document.getElementById("booksGrid");
  const emptyState = document.getElementById("emptyState");

  if (isLoading) {
    loadingState.classList.remove("hidden");
    grid.classList.add("hidden");
    emptyState.classList.add("hidden");
  } else {
    loadingState.classList.add("hidden");
  }
}

function setOfflineBanner(isOffline) {
  const banner = document.getElementById("offlineBanner");
  banner.classList.toggle("hidden", !isOffline);
}

function showToast(message, type = "success") {
  const container = document.getElementById("toastContainer");
  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  toast.textContent = message;

  container.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 4000);
}

document.addEventListener("DOMContentLoaded", () => {
  fetchAllBooks();

  document.getElementById("searchInput").addEventListener("input", renderFilteredBooks);
  document.getElementById("clearSearchBtn").addEventListener("click", () => {
    const input = document.getElementById("searchInput");
    input.value = "";
    input.focus();
    renderFilteredBooks();
  });

  document.getElementById("openCreateModalBtn").addEventListener("click", () => openBookFormModal());
  document.getElementById("retryBtn").addEventListener("click", fetchAllBooks);
  document.getElementById("bookForm").addEventListener("submit", handleBookFormSubmit);
  document.getElementById("confirmDeleteBtn").addEventListener("click", handleConfirmDelete);

  document.querySelectorAll("[data-close-modal]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const targetId = btn.getAttribute("data-close-modal");
      closeModalById(targetId);
    });
  });

  document.querySelectorAll(".modal-backdrop").forEach((backdrop) => {
    backdrop.addEventListener("click", (event) => {
      if (event.target === backdrop) {
        backdrop.classList.add("hidden");
      }
    });
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      document.querySelectorAll(".modal-backdrop").forEach((modal) => {
        modal.classList.add("hidden");
      });
    }
  });
});