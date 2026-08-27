const Collection = require('../models/Collection');

const getCollections = async (req, res) => {
  try {
    const filter = {};
    if (req.query.departmentId) {
      filter.departmentId = req.query.departmentId;
    }
    const collections = await Collection.find(filter)
      .populate('departmentId', 'name code')
      .sort({ name: 1 });
    res.status(200).json({ success: true, count: collections.length, data: collections });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const createCollection = async (req, res) => {
  try {
    const { name, code, departmentId, description } = req.body;
    const collection = await Collection.create({
      name,
      code: code.toUpperCase(),
      departmentId,
      description,
    });
    res.status(201).json({ success: true, data: collection });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

const deleteCollection = async (req, res) => {
  try {
    await Collection.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Collection deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  getCollections,
  createCollection,
  deleteCollection,
};
