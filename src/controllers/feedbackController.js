const feedbackService = require('../services/feedbackService');
const ApiResponse = require('../utils/ApiResponse');

class FeedbackController {
  async create(req, res) {
    const data = await feedbackService.create(req.body, req.user);
    return ApiResponse.success(res, {
      statusCode: 201,
      message: 'Feedback enviado com sucesso.',
      data
    });
  }

  async getByEvent(req, res) {
    const data = await feedbackService.getByEvent(req.params.id, req.user);
    return ApiResponse.success(res, {
      message: 'Feedbacks do evento listados com sucesso.',
      data
    });
  }
}

module.exports = new FeedbackController();
