// controller/category.js
const { Category } = require('../models/Category');
const { agregarContexto } = require('../middlewares/contextMiddleware');

// Obtener todas las categorías activas
const getCategories = async (req, res) => {
  try {
    const categories = await Category.findAll({
      where: { isActive: true },
      order: [['name', 'ASC']]
    });

    res.json(categories);
  } catch (error) {
    console.error('Error al obtener categorías:', error);
    res.status(500).json({ message: 'Error al obtener las categorías' });
  }
};

// Obtener una categoría por ID
const getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await Category.findByPk(id);

    if (!category) {
      return res.status(404).json({ message: 'Categoría no encontrada' });
    }

    res.json(category);
  } catch (error) {
    console.error('Error al obtener categoría:', error);
    res.status(500).json({ message: 'Error al obtener la categoría' });
  }
};

// Crear una nueva categoría (solo admin)
const createCategory = async (req, res) => {
  try {
    const { name, description, icon, color } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'El nombre de la categoría es requerido' });
    }

    const opciones = agregarContexto(req);

    const category = await Category.create({
      name,
      description,
      icon: icon || '🍳',
      color: color || '#f97316'
    }, opciones);

    res.status(201).json(category);
  } catch (error) {
    console.error('Error al crear categoría:', error);
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ message: 'Ya existe una categoría con ese nombre' });
    }
    res.status(500).json({ message: 'Error al crear la categoría' });
  }
};

// Actualizar una categoría (solo admin)
const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, icon, color, isActive } = req.body;

    const category = await Category.findByPk(id);
    if (!category) {
      return res.status(404).json({ message: 'Categoría no encontrada' });
    }

    const opciones = agregarContexto(req);

    await category.update({
      name,
      description,
      icon,
      color,
      isActive
    }, opciones);

    res.json(category);
  } catch (error) {
    console.error('Error al actualizar categoría:', error);
    res.status(500).json({ message: 'Error al actualizar la categoría' });
  }
};

// Eliminar una categoría (solo admin)
const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await Category.findByPk(id);
    if (!category) {
      return res.status(404).json({ message: 'Categoría no encontrada' });
    }

    // Soft delete: marcar como inactiva
    const opciones = agregarContexto(req);
    await category.update({ isActive: false }, opciones);

    res.json({ message: 'Categoría eliminada correctamente' });
  } catch (error) {
    console.error('Error al eliminar categoría:', error);
    res.status(500).json({ message: 'Error al eliminar la categoría' });
  }
};

module.exports = {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory
};