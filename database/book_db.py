import json
import os


def load_book():
    if os.path.exists("books.json"):
        with open("books.json", "r", encoding="UTF-8") as load:
            return json.load(load)

    return []


books = load_book()


def save_book():
    with open("books.json", "w", encoding="UTF-8") as save:
        json.dump(books, save)
