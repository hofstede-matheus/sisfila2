# Sisfila2

## Description

Sisfila é uma aplicação para gerenciamento de filas de atendimento. Apesar de ser um sistema de filas genérico, a aplicação será desenvolvida com um escopo de matrícula do Instituto de Computação em mente.

## Configuração inicial
```bash
## não necessário fazer caso o banco e a aplicação sejam inicializadas pelo docker-compose

## algumas variáveis do .env podem precisar de modificação

cp .env.example .env
cp .env.test.example .env.test
npm ci
```

## Subir ambiente de desenvolvimento

```bash
docker-compose up --build
```
ou
```bash
docker-compose up db
npm run start:dev
```

## Documentação swagger
<http:localhost:3000/docs>

## Teste

```bash
# all tests
$ npm run test

# unit tests
$ npm run test:unit

# integration tests
$ npm run test:integration

# test coverage
$ npm run test:cov
```