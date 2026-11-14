function createMongoResourceController(Model, options = {}) {
  const populate = options.populate || [];

  function applyPopulate(query) {
    populate.forEach(function (path) { query = query.populate(path); });
    return query;
  }

  return {
    async findById(id) {
      try { return await Model.findById(id); } catch (err) { return null; }
    },

    async list(req, res, next) {
      try {
        const data = await applyPopulate(Model.find());
        res.json({ message: 'ok', data });
      } catch (err) { next(err); }
    },

    async getById(req, res, next) {
      try {
        const item = await applyPopulate(Model.findById(req.params.id));
        if (!item) return res.status(404).json({ message: 'No encontrado' });
        res.json({ message: 'ok', data: item });
      } catch (err) {
        if (err.name === 'CastError') return res.status(400).json({ message: 'Id invalido' });
        next(err);
      }
    },

    async create(req, res, next) {
      try {
        const item = await Model.create(req.body);
        res.status(201).json({ message: 'creado', data: item });
      } catch (err) {
        if (err.name === 'ValidationError') return res.status(400).json({ message: 'Datos invalidos', error: err.message });
        next(err);
      }
    },

    async update(req, res, next) {
      try {
        const item = await Model.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!item) return res.status(404).json({ message: 'No encontrado' });
        res.json({ message: 'actualizado', data: item });
      } catch (err) {
        if (err.name === 'CastError') return res.status(400).json({ message: 'Id invalido' });
        if (err.name === 'ValidationError') return res.status(400).json({ message: 'Datos invalidos', error: err.message });
        next(err);
      }
    },

    async remove(req, res, next) {
      try {
        const item = await Model.findByIdAndDelete(req.params.id);
        if (!item) return res.status(404).json({ message: 'No encontrado' });
        res.json({ message: 'eliminado', data: { id: item._id } });
      } catch (err) {
        if (err.name === 'CastError') return res.status(400).json({ message: 'Id invalido' });
        next(err);
      }
    }
  };
}

module.exports = createMongoResourceController;