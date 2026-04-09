# UniEvent Backend

Backend do sistema web **UniEvent**, voltado ao gerenciamento de eventos universitários.

## Stack
- Node.js
- Express.js
- MongoDB + Mongoose
- JWT
- bcrypt
- Arquitetura MVC

## Como executar
```bash
npm install
cp .env.example .env
npm run dev
```

## Estrutura
```text
src/
  app.js
  server.js
  config/
    db.js
  controllers/
    authController.js
    userController.js
    categoriaController.js
    palestranteController.js
    eventoController.js
    inscricaoController.js
    certificadoController.js
    feedbackController.js
    iaController.js
  middlewares/
    authMiddleware.js
    authorizeMiddleware.js
    validateRequest.js
    notFoundMiddleware.js
    errorMiddleware.js
  models/
    User.js
    Categoria.js
    Palestrante.js
    Evento.js
    Inscricao.js
    Certificado.js
    Feedback.js
  routes/
    index.js
    authRoutes.js
    userRoutes.js
    categoriaRoutes.js
    palestranteRoutes.js
    eventoRoutes.js
    inscricaoRoutes.js
    certificadoRoutes.js
    feedbackRoutes.js
    iaRoutes.js
  services/
    authService.js
    userService.js
    categoriaService.js
    palestranteService.js
    eventoService.js
    inscricaoService.js
    certificadoService.js
    feedbackService.js
    iaService.js
  utils/
    ApiError.js
    ApiResponse.js
    asyncHandler.js
    generateToken.js
    generateValidationCode.js
    pickAllowedFields.js
  validators/
    authValidator.js
    userValidator.js
    categoriaValidator.js
    palestranteValidator.js
    eventoValidator.js
    inscricaoValidator.js
    certificadoValidator.js
    feedbackValidator.js
    iaValidator.js
```

## Perfis
- **admin**: controla tudo
- **organizador**: gerencia eventos, palestrantes, categorias, certificados e participantes
- **participante**: se inscreve, cancela inscrição, envia feedback e consulta certificados

## Rotas principais
### Auth
- POST `/api/auth/register`
- POST `/api/auth/login`
- POST `/api/auth/forgot-password`
- POST `/api/auth/reset-password`
- GET `/api/auth/me`

### Users
- GET `/api/users`
- GET `/api/users/:id`
- POST `/api/users`
- PUT `/api/users/:id`
- DELETE `/api/users/:id`

### Categorias
- GET `/api/categorias`
- GET `/api/categorias/:id`
- POST `/api/categorias`
- PUT `/api/categorias/:id`
- DELETE `/api/categorias/:id`

### Palestrantes
- GET `/api/palestrantes`
- GET `/api/palestrantes/:id`
- POST `/api/palestrantes`
- PUT `/api/palestrantes/:id`
- DELETE `/api/palestrantes/:id`

### Eventos
- GET `/api/eventos`
- GET `/api/eventos/:id`
- POST `/api/eventos`
- PUT `/api/eventos/:id`
- DELETE `/api/eventos/:id`
- GET `/api/eventos/:id/participantes`
- GET `/api/eventos/:id/feedbacks`

### Inscrições
- POST `/api/inscricoes`
- PATCH `/api/inscricoes/:id/cancelar`
- GET `/api/inscricoes/minhas`

### Certificados
- POST `/api/certificados/emitir`
- GET `/api/certificados/meus`
- GET `/api/certificados/:id`

### Feedbacks
- POST `/api/feedbacks`

### IA
- POST `/api/ia/resumir-feedbacks`
- POST `/api/ia/classificar-satisfacao`
- POST `/api/ia/sugerir-descricao-evento`

## Observações
- A camada de IA está preparada com uma implementação acadêmica e simples, pronta para ser substituída por integração real com OpenAI no futuro.
- O logout pode ser tratado no frontend removendo o token do armazenamento. Para produção, pode-se usar blacklist/refresh token.
