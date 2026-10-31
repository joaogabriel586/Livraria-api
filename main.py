from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import json
import os

app = FastAPI()

class Book(BaseModel):
    title: str
    author: str


class BookUpdate(BaseModel):
    title: str | None = None
    author: str | None = None


def load_book ():
     if os.path.exists("books.json"):
         with open("books.json", "r", encoding="UTF-8") as load:
             return json.load(load)
            
     return []

books = load_book()
         
def save_book ():
 with open("books.json", "w", encoding="UTF-8") as save:
     json.dump(books, save)

msg = "Book not found!"

@app.get("/books")
def get_books():
    return books

@app.get("/books/{id_book}")
def get_id_book(id_book: int):
    for book in books:
        if book["id"] == id_book:
            return book
    raise HTTPException(status_code=404, detail=msg)

@app.post("/books", status_code=201)
def create_book(new_book: Book):  # Renomeado para não conflitar com a lista 'books'
    # Evita IndexError caso todos os livros tenham sido deletados antes
    new_id = books[-1]["id"] + 1 if books else 1
    
    book_data = {
        "id": new_id,
        "title": new_book.title,
        "author": new_book.author
    }
    books.append(book_data)  # Salva de fato na lista em memória
    save_book()
    return book_data

@app.delete("/books/{id_delete}")
def delete_book(id_delete: int):
    for book in books:
        if book["id"] == id_delete:
            books.remove(book)  # Remove o dicionário encontrado, não o número do ID
            save_book()
            return {"message": "Livro removido com sucesso!"}
    raise HTTPException(status_code=404, detail=msg)

@app.put("/books/{id_update}")
def update_book (id_update : int, new_book : Book):
    for book in books:
        if book["id"] == id_update:
            book["title"] = new_book.title
            book["author"] = new_book.author
            save_book()
            return book
    raise HTTPException(status_code=404, detail=msg)

@app.patch("/books/{id_update}")
def update_part_book (id_update : int, new_book : BookUpdate):
    for book in books:
        if book["id"] == id_update:
            if new_book.title is not None:
                book["title"] = new_book.title
            if new_book.author is not None:
                book["author"] = new_book.author
            save_book()
            return book
    raise HTTPException (status_code=404, detail=msg)