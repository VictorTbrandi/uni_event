# UniEvent

Sistema web para gerenciamento de eventos universitarios, com frontend em Vue 3 e API REST em Node.js/Express. O projeto permite divulgar eventos, organizar programacoes, controlar inscricoes, emitir certificados, coletar feedbacks e administrar dados institucionais da universidade.

## Funcionalidades

- Autenticacao com JWT, cadastro, login, recuperacao e redefinicao de senha.
- Controle de acesso por perfil: `admin`, `organizador` e `participante`.
- Cadastro e consulta de eventos, categorias, palestrantes e atividades da programacao.
- Inscricao em eventos, cancelamento de inscricoes e listagem das inscricoes do participante.
- Emissao e consulta de certificados.
- Envio e analise de feedbacks.
- Painel administrativo para usuarios e dados institucionais.
- Gestao de universidades, campi, departamentos, cursos e salas.
- Assistente de IA academico para chat, resumo de feedbacks, classificacao de satisfacao e sugestao de descricao de eventos.
- Consulta de previsao de chuva para eventos.

## Stack

### Frontend

- Vue 3
- TypeScript
- Vue Router
- Vue CLI
- CSS

### Backend

- Node.js
- Express.js
- MongoDB + Mongoose
- JWT
- bcrypt
- express-validator
- Helmet, CORS e Morgan
- Arquitetura em camadas: routes, controllers, services, models e validators

## Estrutura do projeto

```text
uni_event/
  README.md
  src/
    client/                 # Aplicacao Vue 3
      public/
      src/
        assets/
        components/
        router/
        services/
        utils/
        views/
      package.json
    server/                 # API Node.js/Express
      app.js
      server.js
      config/
      controllers/
      middlewares/
      models/
      routes/
      services/
      utils/
      validators/
      package.json
```

## Como executar

### Pre-requisitos

- Node.js
- npm
- MongoDB em execucao

### Backend

Entre na pasta da API:

```bash
cd src/server
npm install
```

Crie o arquivo `.env` em `src/server`:

```env
PORT=3000
MONGODB_URI=mongodb://localhost:27018/uni_event
CLIENT_URL=http://localhost:8080
JWT_SECRET=sua_chave_secreta
```

Inicie o servidor:

```bash
npm run dev
```

A API ficara disponivel em:

```text
http://localhost:3000/api
```

Endpoint de saude:

```text
GET http://localhost:3000/api/health
```

### Frontend

Em outro terminal, entre na pasta do client:

```bash
cd src/client
npm install
npm run serve
```

O frontend ficara disponivel, por padrao, em:

```text
http://localhost:8080
```

O client usa `http://localhost:3000/api` como URL padrao da API. Caso precise alterar, crie um `.env` em `src/client` com:

```env
VUE_APP_API_URL=http://localhost:3000/api
```

## Scripts

### Backend

```bash
npm run dev     # inicia com nodemon
npm start       # inicia com node
```

### Frontend

```bash
npm run serve   # ambiente de desenvolvimento
npm run build   # build de producao
npm run lint    # verificacao com ESLint
```

## Perfis

- **admin**: gerencia usuarios, dados institucionais e todos os recursos do sistema.
- **organizador**: gerencia eventos, categorias, palestrantes, atividades, participantes, feedbacks e certificados.
- **participante**: consulta eventos, realiza inscricoes, envia feedbacks e acessa seus certificados.

## Usuarios padrao

Ao iniciar o backend, o sistema garante automaticamente um usuario para cada perfil. A senha padrao e `123456`.

- **admin**: `admin@unievent.com`
- **organizador**: `organizador@unievent.com`
- **participante**: `participante@unievent.com`

Variaveis opcionais para o seed:

```env
SEED_DEFAULT_USERS=false
SEED_USER_PASSWORD=123456
SEED_ADMIN_EMAIL=admin@unievent.com
SEED_ORGANIZADOR_EMAIL=organizador@unievent.com
SEED_PARTICIPANTE_EMAIL=participante@unievent.com
```

## Dados institucionais padrao

O servidor tambem pode criar dados iniciais de universidades, campi, departamentos e cursos. Atualmente o seed inclui dados academicos de exemplo para UNIFEI e USP.

Para desativar esse seed:

```env
SEED_DEFAULT_INSTITUTIONS=false
```

## Rotas principais da API

Todas as rotas abaixo usam o prefixo `/api`.

### Autenticacao

- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/forgot-password`
- `POST /auth/reset-password`
- `GET /auth/me`

### Usuarios

- `GET /users`
- `GET /users/:id`
- `POST /users`
- `PUT /users/:id`
- `DELETE /users/:id`

### Eventos

- `GET /eventos`
- `GET /eventos/:id`
- `POST /eventos`
- `PUT /eventos/:id`
- `DELETE /eventos/:id`
- `GET /eventos/:id/participantes`
- `GET /eventos/:id/feedbacks`
- `GET /eventos/:id/previsao-chuva`
- `POST /eventos/previsao-chuva/preview`

### Programacao e conteudo

- `GET /categorias`
- `POST /categorias`
- `GET /palestrantes`
- `POST /palestrantes`
- `GET /atividades/evento/:eventoId`
- `POST /atividades`

### Inscricoes, certificados e feedbacks

- `POST /inscricoes`
- `PATCH /inscricoes/:id/cancelar`
- `GET /inscricoes/minhas`
- `POST /certificados/emitir`
- `POST /certificados/eventos/:eventoId/emitir`
- `GET /certificados/meus`
- `GET /certificados/:id`
- `POST /feedbacks`
- `GET /feedbacks/eventos/:id`

### Institucional

- `GET /universidades`
- `GET /campi`
- `GET /departamentos`
- `GET /cursos`
- `GET /salas`

As rotas institucionais tambem possuem operacoes `POST`, `PUT` e `DELETE` restritas ao perfil `admin`.

### IA

- `POST /ia/chat`
- `POST /ia/resumir-feedbacks`
- `POST /ia/classificar-satisfacao`
- `POST /ia/sugerir-descricao-evento`

## Telas do frontend

- Home com listagem de eventos.
- Login, cadastro, recuperar senha e redefinir senha.
- Detalhe do evento e programacao.
- Categorias e palestrantes.
- Perfil do usuario.
- Minhas inscricoes.
- Meus certificados e detalhe do certificado.
- Assistente de IA.
- Painel de usuarios.
- Painel institucional.
- Painel de participantes e feedbacks por evento.

## Observacoes

- O logout e tratado no frontend removendo o token salvo no navegador.
- A camada de IA atual e uma implementacao academica simples, preparada para ser substituida por uma integracao real futuramente.
- A previsao de chuva usa servicos externos de geocodificacao e clima quando os dados do evento permitem a consulta.
- Em producao, defina um `JWT_SECRET` forte e revise as configuracoes de CORS, banco de dados e variaveis de ambiente.

## Desenvolvido por

- **Victor Terrengui Brandi** — RA: 262318806
- **Joao Claudio Martinez** — RA: 262319640
