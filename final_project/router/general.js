const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    // Check if both username and password are provided
    if (username && password) {
        // Check if the user does not already exist
        if (!isValid(username)) {
            // Add the new user to the users array
            users.push({ "username": username, "password": password });
            return res.status(200).json({ message: "User successfully registered. Now you can login" });
        } else {
            return res.status(404).json({ message: "User already exists!" });
        }
    }
    // Return error if username or password is missing
    return res.status(404).json({ message: "Unable to register user." });
});

// Get the book list available in the shop
public_users.get('/', function (req, res) {

    const response = JSON.stringify(books, null, 4);
    return res.status(200).send(response);

});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {

    const isbn = req.params.isbn;
    // Check if the book with the given ISBN exists
    if (books[isbn]) {
        return res.status(200).json(books[isbn]); // Send the book details as JSON
    } else {
        return res.status(404).json({ message: "No book found by this ISBN" }); // Send a 404 if the book doesn't exist
    }

});
  
// Get book details based on author
public_users.get('/author/:author', function (req, res) {

    // Retrieve the author's name from the request parameters and convert it to lowercase to handle case-insensitivity
    const author = req.params.author.toLowerCase();

    // Use Array.prototype.filter to filter books written by the specified author
    let booksByAuthor = Object.values(books).filter(book => book.author.toLowerCase() === author);

    // Check if any books were found
    if (booksByAuthor.length > 0) {
        // Send the list of found books as a JSON response
        return res.status(200).json(booksByAuthor);
    } else {
        // Send an error message if no books were found
        return res.status(404).json({ message: "No books found by this author" });
    }
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {

    // Retrieve the title's name from the request parameters and convert it to lowercase to handle case-insensitivity
    const title = req.params.title.toLowerCase();

    // Use Array.prototype.filter to filter books written by the specified title
    let booksByTitle = Object.values(books).filter(book => book.title.toLowerCase() === title);

    // Check if any books were found
    if (booksByTitle.length > 0) {
        // Send the list of found books as a JSON response
        return res.status(200).json(booksByTitle);
    } else {
        // Send an error message if no books were found
        return res.status(404).json({ message: "No books found by this title" });
    }
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {

    const isbn = req.params.isbn;
    // Check if the book with the given ISBN exists
    if (books[isbn]) {
        return res.status(200).json(books[isbn]["reviews"]); // // Send the book reviews as JSON
    } else {
        // Send a 404 if the book doesn't exist
        return res.status(404).json({ message: "No reviews found by this ISBN" }); 
    }
});

module.exports.general = public_users;