const mongoose = require("mongoose");

async function getAll(res, Model, name) {
  const result = await Model.find();
  if (result) {
    res.status(200).json(result);
  } else {
    res.status(400).send(name + " not found");
  }
}

async function getById(req, res, Model, name) {
  const id = req.params.id;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send("Invalid Id");
  }
  const result = await Model.findById(id);
  if (result) {
    res.status(200).json(result);
  } else {
    res.status(400).send(name + " not found");
  }
}

async function add(res, Model, data) {
  try {
    const result = await Model.create(data);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json(error);
  }
}

async function deleteById(req, res, Model, name) {
  const id = req.params.id;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send("Invalid Id");
  }
  const model = await Model.findById(id).catch((error) => {
    return res.status(500).json(error);
  });
  if (!model) {
    res.status(400).send(name + " not found");
  } else {
    try {
      const result = await Model.deleteOne(model);
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json(error);
    }
  }
}

async function update(res, Model, data) {
  try {
    const result = await Model.updateOne(data);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json(error);
  }
}

module.exports = { getAll, getById, add, deleteById, update };
