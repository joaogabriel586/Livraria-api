# Livraria API

API REST para gerenciar livros, feita com Python e FastAPI.
Os dados ficam salvos em um arquivo JSON.


## O que a API faz

Rotas disponíveis:

- GET /books: lista todos os livros
- GET /books/{id}: busca um livro pelo id
- POST /books: cria um livro novo
- PUT /books/{id}: troca o livro inteiro
- PATCH /books/{id}: muda só uma parte do livro
- DELETE /books/{id}: apaga um livro

Erros possíveis:

- 404: o livro não existe
- 422: os dados enviados estão no formato errado


## Exemplo de livro

```json
{
  "id": 1,
  "title": "Dune",
  "author": "Frank Herbert"
}
```


## Tecnologias

- Python 3
- FastAPI
- Pydantic
- Uvicorn


## Estrutura do projeto

```text
Livraria/
├── main.py              (ponto de entrada da aplicação)
├── books.json           (dados salvos em JSON)
├── requirements.txt     (dependências do projeto)
├── schemas/
│   └── book_schema.py   (modelos Pydantic, validam os dados)
├── database/
│   └── book_db.py       (lê e grava o arquivo JSON)
└── routers/
    └── book_router.py   (rotas da API)
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

5. Abra a documentação interativa e teste as rotas:

http://127.0.0.1:8000/docs


## Chamando a API com Python

Com o servidor ligado, crie outro arquivo (por exemplo, teste.py):

```python
import requests

resposta = requests.get("http://127.0.0.1:8000/books")
print(resposta.status_code)
print(resposta.json())
```


## Próximos passos

- Trocar o arquivo JSON por um banco de dados (SQLite)
- Criar uma interface para a API
