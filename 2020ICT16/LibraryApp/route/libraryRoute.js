const express = require("express");
const router = express.Router();
const Library = require("../models/Library");
const Book = require("../models/Book");
const Service = require("../service/GenericService");
const { default: mongoose } = require("mongoose");
const { verifyToken } = require("../security/auth");
const name = "Library";

router.get("/", verifyToken, (req, res) => {
  Service.getAll(res, Library, name).catch((error) => {
    res.status(500).send(error + "Server Error");
  });
});

router.get("/:id", verifyToken, (req, res) => {
  Service.getById(req, res, Library, name).catch((error) => {
    res.status(500).send(error + "Server Error");
  });
});

router.post("/", verifyToken, async (req, res) => {
  const { name, location } = req.body;
  if (!name || !location) {
    res.status(400).send("Please provide required fields");
  } else {
    Service.add(res, Library, { name, location }).catch((error) => {
      res.status(500).send(error + "Server Error");
    });
  }
});

router.delete("/:id", verifyToken, (req, res) => {
  Service.deleteById(req, res, Library, name).catch((error) => {
    res.status(500).send(error + "Server Error");
  });
});

router.put("/:id", verifyToken, async (req, res) => {
  const id = req.params.id;
  const library = await Library.findById(id).catch((error) => {
    console.error(error);
  });
  if (!library) {
    res.status(400).send("Library not found");
  } else {
    const { name, location } = req.body;
    if (!name || !location) {
      res.status(400).send("Please provide required fields");
    } else {
      Service.update(res, Library, { name, location }).catch((error) => {
        res.status(500).send(error + "Server Error");
      });
    }
  }
});

// 1.Find all books in the "Central Library"
router.get("/books/central-library", verifyToken, async (req, res) => {
  try {
    const result = await Book.aggregate([
      {
        $lookup: {
          from: "libraries",
          localField: "library_id",
          foreignField: "_id",
          as: "library_details",
        },
      },
      { $unwind: "$library_details" },
      { $match: { "library_details.name": "Central Library" } },
      {
        $project: {
          title: 1,
          library: "$library_details.name",
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

// 7.List all libraries and the number of books they have, including libraries with no books.
router.get("/books/noofbooks", verifyToken, async (req, res) => {
  try {
    const result = await Library.aggregate([
      {
        $lookup: {
          from: "books",
          localField: "_id",
          foreignField: "library_id",
          as: "books",
        },
      },

      {
        $project: {
          _id: 0,
          name: 1,
          noofbooks: { $size: "$books" },
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

// 8.Calculate the average number of books per library.
router.get("/books/average-books", verifyToken, async (req, res) => {
  try {
    const result = await Library.aggregate([
      {
        $lookup: {
          from: "books",
          localField: "_id",
          foreignField: "library_id",
          as: "books",
        },
      },
      {
        $project: {
          name: 1,
          book_count: { $size: "$books" },
        },
      },
      {
        $group: {
          _id: null,
          avg_books: { $avg: "$book_count" },
        },
      },
      {
        $project: {
          _id: 0,
          avg_books: 1,
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
