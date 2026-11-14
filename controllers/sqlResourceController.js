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
        res.json({ message: 'ok', data });
      } catch (err) { next(err); }
    },

    async getById(req, res, next) {
      const id = parseId(req.params.id);
      if (!id) return res.status(400).json({ message: 'Id invalido' });
      try {
        const item = await Model.findByPk(id, { include });
        if (!item) return res.status(404).json({ message: 'No encontrado' });
        res.json({ message: 'ok', data: item });
      } catch (err) { next(err); }
    },

    async create(req, res, next) {
      try {
        const item = await Model.create(req.body);
        res.status(201).json({ message: 'creado', data: item });
      } catch (err) {
        if (isValidationError(err)) return res.status(400).json({ message: 'Datos invalidos', error: err.message });
        next(err);
      }
    },

    async update(req, res, next) {
      const id = parseId(req.params.id);
      if (!id) return res.status(400).json({ message: 'Id invalido' });
      try {
        const item = await Model.findByPk(id);
        if (!item) return res.status(404).json({ message: 'No encontrado' });
        await item.update(req.body);
        res.json({ message: 'actualizado', data: item });
      } catch (err) {
        if (isValidationError(err)) return res.status(400).json({ message: 'Datos invalidos', error: err.message });
        next(err);
      }
    },

    async remove(req, res, next) {
      const id = parseId(req.params.id);
      if (!id) return res.status(400).json({ message: 'Id invalido' });
      try {
        const item = await Model.findByPk(id);
        if (!item) return res.status(404).json({ message: 'No encontrado' });
        await item.destroy();
        res.json({ message: 'eliminado', data: { id } });
      } catch (err) { next(err); }
    }
  };
}

module.exports = createSqlResourceController;