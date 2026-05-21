const categoriaService = require('../services/categoriaService');
const ApiResponse = require('../utils/ApiResponse');

class CategoriaController {
  async create(req, res) {
    const data = await categoriaService.create(req.body);
    return ApiResponse.success(res, {
      statusCode: 201,
      message: 'Categoria criada com sucesso.',
      data
    });
  }

  async findAll(req, res) {
    const data = await categoriaService.findAll();
    return ApiResponse.success(res, {
      message: 'Categorias listadas com sucesso.',
      data
    });
  }

  async findById(req, res) {
    const data = await categoriaService.findById(req.params.id);
    return ApiResponse.success(res, {
      message: 'Categoria encontrada com sucesso.',
      data
    });
  }

  async update(req, res) {
    const data = await categoriaService.update(req.params.id, req.body);
    return ApiResponse.success(res, {
      message: 'Categoria atualizada com sucesso.',
      data
    });
  }

  async delete(req, res) {
    await categoriaService.delete(req.params.id);
    return ApiResponse.success(res, {
      message: 'Categoria removida com sucesso.',
      data: null
    });
  }
}

module.exports = new CategoriaController();
