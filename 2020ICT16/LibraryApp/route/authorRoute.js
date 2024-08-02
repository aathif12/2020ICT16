const express = require("express");
const router = express.Router();
const Author = require("../models/Author");
const Service = require("../service/GenericService");
const name = "Author";
const { verifyToken } = require("../security/auth");
router.get("/", verifyToken, (req, res) => {
  Service.getAll(res, Author, name).catch((error) => {
    res.status(500).send(error + "Server Error");
  });
});

router.get("/:id", verifyToken, (req, res) => {
  Service.getById(req, res, Author, name).catch((error) => {
    res.status(500).send(error + "Server Error");
  });
});

router.post("/", verifyToken, async (req, res) => {
  const { name, birth_year } = req.body;
  if (!name || !birth_year) {
    res.status(400).send("Please provide required fields");
  } else {
    Service.add(res, Author, { name, birth_year }).catch((error) => {
      res.status(500).send(error + "Server Error");
    });
  }
});

router.delete("/:id", verifyToken, (req, res) => {
  Service.deleteById(req, res, Author, name).catch((error) => {
    res.status(500).send(error + "Server Error");
  });
});

router.put("/:id", verifyToken, async (req, res) => {
  const id = req.params.id;
  const author = await Author.findById(id).catch((error) => {
    console.error(error);
  });
  if (!author) {
    res.status(400).send("Author not found");
  } else {
    const { name, birth_year } = req.body;
    if (!name || !birth_year) {
      res.status(400).send("Please provide required fields");
    } else {
      Service.update(res, Author, { name, birth_year }).catch((error) => {
        res.status(500).send(error + "Server Error");
      });
    }
  }
});

// 6.Sort authors by age in ascending or descendingorder.
// Ascending order
router.get("/age/ascending-order/", verifyToken, async (req, res) => {
  try {
    const result = await Author.find().sort({ birth_year: 1 });
    if (result) {
      res.status(200).json(result);
    } else {
      res.status(404).send(name + " not found");
    }
  } catch (error) {
    res.status(200).json({ error_message: error.message });
  }
});

// Descending order
router.get("/age/descending-order/", verifyToken, async (req, res) => {
  try {
    const result = await Author.find().sort({ birth_year: -1 });
    if (result) {
      res.status(200).json(result);
    } else {
      res.status(404).send(name + " not found");
    }
  } catch (error) {
    res.status(200).json({ error_message: error.message });
  }
});

// 11.. List all authors who have not written any books.
router.get("/books/nobooks", verifyToken, async (req, res) => {
  try {
    const result = await Author.aggregate([
      {
        $lookup: {
          from: "books",
          localField: "_id",
          foreignField: "author_ids",
          as: "books",
        },
      },
      {
        $match: {
          books: { $size: 0 },
        },
      },
      {
        $project: {
          _id: 0,
          name: 1,
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
module.exports = router;
