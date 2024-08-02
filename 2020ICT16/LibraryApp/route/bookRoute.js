const express = require("express");
const router = express.Router();
const Book = require("../models/Book");
const Service = require("../service/GenericService");
const name = "Book";
const { verifyToken } = require("../security/auth");
router.get("/", verifyToken, (req, res) => {
  Service.getAll(res, Book, name).catch((error) => {
    res.status(500).send(error + "Server Error");
  });
});

router.get("/:id", verifyToken, (req, res) => {
  Service.getById(req, res, Book, name).catch((error) => {
    res.status(500).send(error + "Server Error");
  });
});

router.post("/", verifyToken, async (req, res) => {
  const { title, library_id, author_ids } = req.body;
  if (!title || !library_id || !author_ids) {
    res.status(400).send("Please provide required fields");
  } else {
    try {
      const result = await Book.create({ title, library_id, author_ids });
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json(error);
    }
  }
});

router.delete("/:id", verifyToken, (req, res) => {
  Service.deleteById(req, res, Book, name).catch((error) => {
    res.status(500).send(error + "Server Error");
  });
});

router.put("/:id", verifyToken, async (req, res) => {
  const id = req.params.id;
  const book = await Book.findById(id).catch((error) => {
    console.error(error);
  });
  if (!book) {
    res.status(400).send("Book not found");
  } else {
    const { title, library_id, author_ids } = req.body;
    if (!title || !library_id || !author_ids) {
      res.status(400).send("Please provide required fields");
    } else {
      try {
        const result = await book.updateOne({ title, library_id, author_ids });
        res.status(200).json(result);
      } catch (error) {
        res.status(500).json(error);
      }
    }
  }
});

// 2.List all libraries along with the number of books they have.
router.get("/library/noofbooks", verifyToken, async (req, res) => {
  try {
    const result = await Book.aggregate([
      {
        $group: {
          _id: "$library_id",
          noofbooks: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: "libraries",
          localField: "_id",
          foreignField: "_id",
          as: "library_details",
        },
      },
      {
        $unwind: "$library_details",
      },
      {
        $project: {
          _id: 0,
          library_name: "$library_details.name",
          noofbooks: 1,
        },
      },
    ]);
    if (result) {
      res.status(200).json(result);
    } else {
      res.status(404).send(name + " not found");
    }
  } catch (error) {
    res.status(200).json({ error_message: error.message });
  }
});

// 3.Find all books written by "J.K. Rowling".
router.get("/author/jk-rowling", verifyToken, async (req, res) => {
  try {
    const result = await Book.aggregate([
      {
        $lookup: {
          from: "authors",
          localField: "author_ids",
          foreignField: "_id",
          as: "author_details",
        },
      },
      {
        $unwind: "$author_details",
      },
      {
        $match: {
          "author_details.name": "J.K. Rowling",
        },
      },
      {
        $project: {
          author_name: "$author_details.name",
          title: 1,
        },
      },
    ]);

    if (result) {
      res.status(200).json(result);
    } else {
      res.status(404).send(name + " not found");
    }
  } catch (error) {
    res.status(500).json({ error_message: error.message });
  }
});

// 4.List all authors along with the books they have written
router.get("/author/all", verifyToken, async (req, res) => {
  try {
    const result = await Book.aggregate([
      {
        $unwind: "$author_ids",
      },
      {
        $lookup: {
          from: "authors",
          localField: "author_ids",
          foreignField: "_id",
          as: "author_details",
        },
      },

      {
        $project: {
          _id: 0,
          author: { $arrayElemAt: ["$author_details.name", 0] },
          title: 1,
        },
      },
    ]);

    if (result) {
      res.status(200).json(result);
    } else {
      res.status(404).send(name + " not found");
    }
  } catch (error) {
    res.status(500).json({ error_message: error.message });
  }
});

// 5.Find all books along with their authors' details.
router.get("/author-details/all", verifyToken, async (req, res) => {
  try {
    const result = await Book.aggregate([
      {
        $unwind: "$author_ids",
      },
      {
        $lookup: {
          from: "authors",
          localField: "author_ids",
          foreignField: "_id",
          as: "author_details",
        },
      },
      {
        $unwind: "$author_details",
      },

      {
        $group: {
          _id: "$_id",
          title: { $first: "$title" },
          authors: { $push: "$author_details" },
        },
      },
      {
        $project: {
          _id: 0,
          title: 1,
          authors: 1,
        },
      },
    ]);

    if (result) {
      res.status(200).json(result);
    } else {
      res.status(404).send(name + " not found");
    }
  } catch (error) {
    res.status(500).json({ error_message: error.message });
  }
});

// 9.Find all authors who have written more than one book
router.get("/authors/manybooks", verifyToken, async (req, res) => {
  try {
    const result = await Book.aggregate([
      {
        $unwind: "$author_ids",
      },
      {
        $group: {
          _id: "$author_ids",
          bookCount: { $sum: 1 },
        },
      },
      {
        $match: {
          bookCount: { $gt: 1 },
        },
      },
      {
        $lookup: {
          from: "authors",
          localField: "_id",
          foreignField: "_id",
          as: "author_details",
        },
      },
      {
        $unwind: "$author_details",
      },

      {
        $project: {
          _id: 0,
          bookCount: 1,
          author_name: "$author_details.name",
        },
      },
    ]);

    if (result) {
      res.status(200).json(result);
    } else {
      res.status(404).send(name + " not found");
    }
  } catch (error) {
    res.status(500).json({ error_message: error.message });
  }
});

// 10.Retrieve all books along with their authors' names and the library they belong to.
router.get("/allbooks/details", async (req, res) => {
  try {
    const result = await Books.aggregate([
      {
        $lookup: {
          from: "authors",
          localField: "author_ids",
          foreignField: "_id",
          as: "author_details",
        },
      },

      {
        $lookup: {
          from: "libraries",
          localField: "library_id",
          foreignField: "_id",
          as: "library_details",
        },
      },
      {
        $unwind: "$author_details",
      },
      {
        $unwind: "$library_details",
      },
      {
        $group: {
          _id: "$_id",
          title: { $first: "$title" },
          authors: { $push: "$author_details.name" },
          library: { $first: "$library_details.name" },
        },
      },
      {
        $project: {
          _id: 0,
          title: 1,
          authors: 1,
          library: 1,
        },
      },
    ]);

    if (result) {
      res.status(200).json(result);
    } else {
      res.status(404).send(name + " not found");
    }
  } catch (error) {
    res.status(500).json({ error_message: error.message });
  }
});

module.exports = router;
