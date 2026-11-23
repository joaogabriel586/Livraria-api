# Livraria API (Acervo & Cia)

API REST para gerenciar livros feita com **Python** e **FastAPI**, organizada em arquitetura modular (`routers`, `schemas`, `database`) e integrada a uma interface web (**Acervo & Cia – Catálogo da Livraria**).

## O que a API faz

Rotas disponíveis:

- `GET /books`: lista todos os livros
- `GET /books/{id}`: busca um livro pelo `id`
- `POST /books`: cria um livro novo
- `PUT /books/{id}`: atualiza o livro inteiro
- `PATCH /books/{id}`: atualiza parcialmente um livro
- `DELETE /books/{id}`: remove um livro

Erros tratados:

- `404`: livro não encontrado
- `422`: dados enviados fora do formato esperado

### Exemplo de payload

```json
{
  "id": 1,
  "title": "Dune",
  "author": "Frank Herbert"
}
```

## Tecnologias

- **Python 3**
- **FastAPI** & **Uvicorn**
- **Pydantic** (validação de dados)
- **HTML, CSS e JavaScript** (interface web servida via `StaticFiles` com CORS configurado)

## Estrutura do projeto

```text
Livraria-api/
├── main.py                  # Ponto de entrada FastAPI, CORS e StaticFiles
├── books.json               # Persistência em JSON
├── requirements.txt         # Dependências do projeto
├── frontend/                # Interface web (Acervo & Cia)
│   ├── index.html
│   ├── app.js
│   └── style.css
├── schemas/
│   └── book_schema.py       # Modelos Pydantic
├── database/
│   └── book_db.py           # Leitura e gravação no arquivo JSON
└── routers/
    └── book_router.py       # Rotas da API (/books)
```

## Como executar

1. Clone o repositório e entre na pasta:
   ```bash
   git clone https://github.com/joaogabriel586/Livraria-api.git
   cd Livraria-api
   ```

2. Crie e ative o ambiente virtual:
   ```bash
   python -m venv .venv
   .venv\Scripts\activate
   ```

3. Instale as dependências:
   ```bash
   pip install -r requirements.txt
   ```

4. Inicie o servidor:
   ```bash
   uvicorn main:app --reload
   ```

5. Acesse no navegador:
   - Interface web: `http://127.0.0.1:8000/`
   - Documentação interativa (Swagger): `http://127.0.0.1:8000/docs`

## Próximos passos

- Migrar a persistência em JSON (`books.json`) para banco de dados relacional (**SQLite** / **PostgreSQL**)
- Adicionar testes automatizados de rotas com `pytest`
