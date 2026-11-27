function parseId(value) {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}

function isValidationError(err) {
  return err.name === 'SequelizeValidationError' || err.name === 'SequelizeUniqueConstraintError';
}

function createSqlResourceController(Model, options = {}) {
  const include = options.include || [];

  return {
    async findById(id) {
      return Model.findByPk(id);
    },

    async list(req, res, next) {
      try {
        const data = await Model.findAll({ include });
        res.json({ message: req.__('common.list'), data });
      } catch (err) { next(err); }
    },

    async getById(req, res, next) {
      const id = parseId(req.params.id);
      if (!id) return res.status(400).json({ message: req.__('common.invalidId') });
      try {
        const item = await Model.findByPk(id, { include });
        if (!item) return res.status(404).json({ message: req.__('common.notFound') });
        res.json({ message: req.__('common.detail'), data: item });
      } catch (err) { next(err); }
    },

    async create(req, res, next) {
      try {
        const item = await Model.create(req.body);
        res.status(201).json({ message: req.__('common.created'), data: item });
      } catch (err) {
        if (isValidationError(err)) return res.status(400).json({ message: req.__('common.invalidData'), error: err.message });
        next(err);
      }
    },

    async update(req, res, next) {
      const id = parseId(req.params.id);
      if (!id) return res.status(400).json({ message: req.__('common.invalidId') });
      try {
        const item = await Model.findByPk(id);
        if (!item) return res.status(404).json({ message: req.__('common.notFound') });
        await item.update(req.body);
        res.json({ message: req.__('common.updated'), data: item });
      } catch (err) {
        if (isValidationError(err)) return res.status(400).json({ message: req.__('common.invalidData'), error: err.message });
        next(err);
      }
    },

    async remove(req, res, next) {
      const id = parseId(req.params.id);
      if (!id) return res.status(400).json({ message: req.__('common.invalidId') });
      try {
        const item = await Model.findByPk(id);
        if (!item) return res.status(404).json({ message: req.__('common.notFound') });
        await item.destroy();
        res.json({ message: req.__('common.deleted'), data: { id } });
      } catch (err) { next(err); }
    }
  };
}

module.exports = createSqlResourceController;
