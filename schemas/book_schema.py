from pydantic import BaseModel


class Book(BaseModel):
    title: str
    author: str


class BookUpdate(BaseModel):
    title: str | None = None
    author: str | None = None
