const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const bookSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    library_id: {
        type: mongoose.Types.ObjectId,
        required: true,
        ref: 'Library' 
    },
    author_ids: {
        type: Array,
        required: true,
        ref: 'Author' 
    }
});

const Book = mongoose.model('books', bookSchema);

module.exports = Book;