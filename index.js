import express from "express";
import bodyParser from "body-parser";
import pg from "pg";

const app = express();
const port = 3000;

const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "myBooks",
  password: "***",
  port: 5432,
});

db.connect();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

let books = [];

async function getBooks(){
  const result = await db.query("SELECT * FROM books ORDER BY id");
  books = result.rows;
  return books;
}

app.get("/", async (req, res) => {
  let books = await getBooks();
    res.render("index.ejs", {books : books});
  });

  app.get("/add", async (req, res) => {
    res.render("add.ejs",);
  });

  app.post("/addBook", async (req, res) => {
    const title = req.body.title;
    const author = req.body.author;
    const isbn = req.body.isbn;
    const opinion = req.body.opinion;
    try{
      await db.query("INSERT INTO books (title, autor, isbn, opinion) VALUES ($1, $2, $3, $4)", [title, author, isbn, opinion]);
      res.redirect("/");
    }catch(err){
      console.log(err);
    }
  });

  app.post("/edit", async (req, res) => {
    const opinion = req.body.updatedBookOpinion;
    const id = req.body.updatedItemId;
  try{
    await db.query("UPDATE books SET opinion=$1 WHERE id=$2", [opinion ,id]);
    res.redirect("/");
  }catch(err){
    console.log(err);
  }
  });

  app.get("/view", async (req, res) => {
    const bookId = req.query.view;
    const result = await db.query("SELECT * FROM books WHERE id=$1", [bookId]);
    let book = result.rows[0];
    res.render("singlebook.ejs", {book : book});
  });

  app.post("/delete", async (req, res) => {
    const bookId = req.body.view;
    try{
      await db.query("DELETE FROM books WHERE id=$1", [bookId]);
      res.redirect("/");
    }catch(err){
      console.log(err);
    }
  });


  app.get("/search", async (req, res) => {
    const query = req.query.query;
    try {
      const result = await db.query(
          `SELECT * FROM books
          WHERE title ILIKE '%' || $1 || '%'
          OR autor ILIKE '%' || $1 || '%'
          OR isbn ILIKE '%' || $1 || '%'
          OR opinion ILIKE '%' || $1 || '%';`,
          [query]
      );
      if (result.rows.length > 0) {
        res.render('singlebook.ejs', { book: result.rows[0] });
    } else {
        res.render('none.ejs');
    }
  } catch (err) {
      console.error(err);
  }
  });

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });