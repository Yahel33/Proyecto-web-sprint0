var mockData = {
  users: [
    { id: 1, nombre: 'Yahel Uribe', correo: 'yahel@inventario.local', rol: 'administrador' },
    { id: 2, nombre: 'Emilio Gallardo', correo: 'emilio@inventario.local', rol: 'almacen' }
  ],
  roles: [
    { id: 1, nombre: 'administrador', descripcion: 'Gestiona usuarios, productos y reportes' },
    { id: 2, nombre: 'almacen', descripcion: 'Registra entradas y salidas de inventario' }
  ],
  permissions: [
    { id: 1, clave: 'productos:editar', descripcion: 'Puede crear y editar productos' },
    { id: 2, clave: 'inventario:mover', descripcion: 'Puede registrar movimientos de inventario' }
  ],
  products: [
    { id: 1, nombre: 'Camiseta blanca', categoria: 'ropa', precio: 249.90 },
    { id: 2, nombre: 'Tenis negros', categoria: 'calzado', precio: 899.00 }
  ],
  variants: [
    { id: 1, productoId: 1, talla: 'M', color: 'blanco', sku: 'PLY-BLA-M' },
    { id: 2, productoId: 2, talla: '27', color: 'negro', sku: 'TEN-NEG-27' }
  ],
  inventory: [
    { id: 1, productoId: 1, cantidad: 18, stockMinimo: 5, ubicacion: 'almacen principal' },
    { id: 2, productoId: 2, cantidad: 4, stockMinimo: 6, ubicacion: 'almacen principal' }
  ],
  customers: [
    { id: 1, nombre: 'Cliente mostrador', telefono: '6140000000' },
    { id: 2, nombre: 'Tienda Centro', telefono: '6141111111' }
  ],
  orders: [
    { id: 1, clienteId: 1, estado: 'pendiente', total: 499.80 },
    { id: 2, clienteId: 2, estado: 'entregado', total: 899.00 }
  ]
};

function getItems(resourceName) {
  return mockData[resourceName] || [];
}

function createResourceController(resourceName) {
  return {
    list(_req, res) {
      res.json({
        message: `Listado de ${resourceName}`,
        data: getItems(resourceName)
      });
    },

    getById(req, res) {
      var id = Number(req.params.id);

      if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({
          message: `Id invalido para ${resourceName}`,
          error: 'El parametro id debe ser un numero entero positivo'
        });
      }

      var item = getItems(resourceName).find(function(mockItem) {
        return mockItem.id === id;
      });

      if (!item) {
        return res.status(404).json({
          message: `${resourceName} no encontrado`,
          error: 'No existe un registro de prueba con ese id'
        });
      }

      return res.json({
        message: `Detalle de ${resourceName}`,
        data: item
      });
    },

    create(req, res) {
      if (!req.body || Object.keys(req.body).length === 0) {
        return res.status(400).json({
          message: `Datos incompletos para ${resourceName}`,
          error: 'El cuerpo de la solicitud es obligatorio'
        });
      }

      return res.status(201).json({
        message: `${resourceName} creado`,
        data: {
          id: 3,
          ...req.body
        }
      });
    },

    update(req, res) {
      var id = Number(req.params.id);

      if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({
          message: `Id invalido para ${resourceName}`,
          error: 'El parametro id debe ser un numero entero positivo'
        });
      }

      if (!req.body || Object.keys(req.body).length === 0) {
        return res.status(400).json({
          message: `Datos incompletos para ${resourceName}`,
          error: 'El cuerpo de la solicitud es obligatorio'
        });
      }

      var currentItem = getItems(resourceName).find(function(mockItem) {
        return mockItem.id === id;
      }) || {};

      return res.json({
        message: `${resourceName} actualizado`,
        data: {
          ...currentItem,
          id,
          ...req.body
        }
      });
    },

    remove(req, res) {
      var id = Number(req.params.id);

      if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({
          message: `Id invalido para ${resourceName}`,
          error: 'El parametro id debe ser un numero entero positivo'
        });
      }

      return res.json({
        message: `${resourceName} eliminado`,
        data: {
          id,
          eliminado: true
        }
      });
    }
  };
}

module.exports = createResourceController;
