# Sisfila2

## Description

Sisfila é uma aplicação para gerenciamento de filas de atendimento. Apesar de ser um sistema de filas genérico, a aplicação será desenvolvida com um escopo de matrícula do Instituto de Computação em mente.

## Configuração inicial

```bash
## não necessário caso o banco e a aplicação sejam inicializadas pelo docker-compose

## algumas variáveis do .env podem precisar de modificação

## preencha o arquivo serviceAccountKey.json com as credenciais do firebase

cp .env.example .env
cp .env.test.example .env.test
npm ci
touch serviceAccountKey.json
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

![alt text](sisfila_v11.JPG)
