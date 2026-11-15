function createMongoResourceController(Model, options = {}) {
  const populate = options.populate || [];

  function applyPopulate(query) {
    populate.forEach(function (path) { query = query.populate(path); });
    return query;
  }

  return {
    async findById(id) {
      try { return await Model.findById(id); } catch { return null; }
    },

    async list(req, res, next) {
      try {
        const data = await applyPopulate(Model.find());
        res.json({ message: req.__('common.list'), data });
      } catch (err) { next(err); }
    },

    async getById(req, res, next) {
      try {
        const item = await applyPopulate(Model.findById(req.params.id));
        if (!item) return res.status(404).json({ message: req.__('common.notFound') });
        res.json({ message: req.__('common.detail'), data: item });
      } catch (err) {
        if (err.name === 'CastError') return res.status(400).json({ message: req.__('common.invalidId') });
        next(err);
      }
    },

    async create(req, res, next) {
      try {
        const item = await Model.create(req.body);
        res.status(201).json({ message: req.__('common.created'), data: item });
      } catch (err) {
        if (err.name === 'ValidationError') return res.status(400).json({ message: req.__('common.invalidData'), error: err.message });
        next(err);
      }
    },

    async update(req, res, next) {
      try {
        const item = await Model.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!item) return res.status(404).json({ message: req.__('common.notFound') });
        res.json({ message: req.__('common.updated'), data: item });
      } catch (err) {
        if (err.name === 'CastError') return res.status(400).json({ message: req.__('common.invalidId') });
        if (err.name === 'ValidationError') return res.status(400).json({ message: req.__('common.invalidData'), error: err.message });
        next(err);
      }
    },

    async remove(req, res, next) {
      try {
        const item = await Model.findByIdAndDelete(req.params.id);
        if (!item) return res.status(404).json({ message: req.__('common.notFound') });
        res.json({ message: req.__('common.deleted'), data: { id: item._id } });
      } catch (err) {
        if (err.name === 'CastError') return res.status(400).json({ message: req.__('common.invalidId') });
        next(err);
      }
    }
  };
}

module.exports = createMongoResourceController;
