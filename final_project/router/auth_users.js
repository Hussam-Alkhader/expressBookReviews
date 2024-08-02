const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => {
      // Filter the users array for any user with the same username
      let userswithsamename = users.filter((user) => {
            return user.username === username;
      });
      // Return true if any user with the same username is found, otherwise false
      if (userswithsamename.length > 0) {
            return true;
      } else {
            return false;
      }
}

const authenticatedUser = (username, password) => {
      // Filter the users array for any user with the same username and password
      let validusers = users.filter((user) => {
            return (user.username === username && user.password === password);
      });
      // Return true if any valid user is found, otherwise false
      if (validusers.length > 0) {
            return true;
      } else {
            return false;
      }
}

//only registered users can login
regd_users.post("/login", (req, res) => {
      const username = req.body.username;
      const password = req.body.password;

      // Check if username or password is missing
      if (!username || !password) {
            return res.status(404).json({ message: "Error logging in" });
      }
      // Authenticate user
      if (authenticatedUser(username, password)) {
            req.session.username = username
            // Generate JWT access token
            let accessToken = jwt.sign({
                  data: password
            }, 'access', { expiresIn: 60 * 60 });

            // Store access token and username in session
            req.session.authorization = {
                  accessToken, username
            }
            return res.status(200).send("User successfully logged in");
      } else {
            return res.status(208).json({ message: "Invalid Login. Check username and password" });
      }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
      // Retrieve the fields from the request body
      const username = req.session.username;
      const isbn = req.params.isbn;
      let author = req.body.author;
      let title = req.body.title;
      let reviews = req.body.reviews;
      let book = books[isbn]; // Check if the book exists in the database
      // Check if the book exists
      if (book) {
            // If the book exists, check if all required fields are missing
            if (!author && !title && !reviews) {
                  return res.status(400).json({ message: "Please provide at least one of the following: author, title, reviews." });
            }
            // Update the book fields if provided
            if (author) {
                  book["author"] = author; // Update author if provided
            }
            if (title) {
                  book["title"] = title; // Update title if provided
            }
            if (reviews) {
                  book["reviews"][username] = reviews; // Update reviews if provided
            }
            books[isbn] = book; // Save the updated book information
            return res.status(200).send(`Book with the ISBN ${isbn} updated.`); // Respond with success message
      } else {
            // If the book does not exist, check if all required fields are provided
            if (!author || !title || !reviews) {
                  return res.status(400).json({ message: "Please provide all of the following: author, title, reviews." });
            }
            // Create a new book entry
            books[isbn] = {
                  "author": author,
                  "title": title,
                  "reviews": { [username]: reviews }
            };
            return res.status(201).send(`The book "${req.body.title}" has been added!`); // Respond with success message
      }
});


regd_users.delete("/auth/review/:isbn", (req, res) => {
      const username = req.session.username;
      const isbn = req.params.isbn;
      const book = books[isbn];
      if (isbn) {
            if (book.reviews && book.reviews[username]) {
                  delete book.reviews[username];
                  return res.status(200).send(`Review by user '${username}' in the book with ISBN ${isbn} has been deleted.`);
            } else {
                  return res.status(404).json({ message: `No review found for user ${username} in the book with ISBN ${isbn}.` });
            }
      } else {
            return res.status(404).json({ message: `Book with the ISBN ${isbn} doesn't exist.` });
      }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
