from fastapi import APIRouter, HTTPException
from schemas.book_schema import Book, BookUpdate
from database.book_db import books, save_book

router = APIRouter(prefix="/books", tags=["Books"])

msg = "Book not found!"


@router.get("")
def get_books():
    return books


@router.get("/{id_book}")
def get_id_book(id_book: int):
    for book in books:
        if book["id"] == id_book:
            return book
    raise HTTPException(status_code=404, detail=msg)


@router.post("", status_code=201)
def create_book(new_book: Book):
    new_id = books[-1]["id"] + 1 if books else 1

    book_data = {
        "id": new_id,
        "title": new_book.title,
        "author": new_book.author
    }
    books.append(book_data)
    save_book()
    return book_data


@router.delete("/{id_delete}")
def delete_book(id_delete: int):
    for book in books:
        if book["id"] == id_delete:
            books.remove(book)
            save_book()
            return {"message": "Livro removido com sucesso!"}
    raise HTTPException(status_code=404, detail=msg)


@router.put("/{id_update}")
def update_book(id_update: int, new_book: Book):
    for book in books:
        if book["id"] == id_update:
            book["title"] = new_book.title
            book["author"] = new_book.author
            save_book()
            return book
    raise HTTPException(status_code=404, detail=msg)


@router.patch("/{id_update}")
def update_part_book(id_update: int, new_book: BookUpdate):
    for book in books:
        if book["id"] == id_update:
            if new_book.title is not None:
                book["title"] = new_book.title
            if new_book.author is not None:
                book["author"] = new_book.author
            save_book()
            return book
    raise HTTPException(status_code=404, detail=msg)
