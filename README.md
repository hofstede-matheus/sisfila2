# Sisfila2

## Summary

Sisfila2 is a real-world queue management application and the foundation of my undergraduate thesis. Although it is a generic queue system, the application was developed with a focus on enrollment in the Institute of Computing in mind.

I was in charge of the development of this NestJS application, which was integrated with a React Native application developed by another graduation student.

## Architecture

### Container Diagram

```mermaid
C4Container
    title System Container Diagram

    Person(user, "User")
    Rel(user, webApp, "Uses")
    Rel(user, mobileApp, "Uses")
    Rel(user, googleAuthSDK, "Authenticates", "SDK/HTTPS")

    Container_Boundary(frontendBoundary, "Frontend") {
        Container(webApp, "Web Application", "React Native Web", "Provides user interface for web users")
        Container(mobileApp, "Mobile Application", "React Native", "Provides user interface for mobile users")
        Rel(webApp, restAPI, "Sends requests", "HTTP/JSON")
        Rel(mobileApp, restAPI, "Sends requests", "HTTP/JSON")

    }

    Container_Boundary(systemBoundary, "Backend System (Google Cloud)") {
        Container(restAPI, "REST API", "Nest.js", "Handles HTTP requests and business logic")
        Rel(restAPI, firebaseSDK, "Sends notifications using", "SDK/HTTPS")
        Rel(restAPI, sendgridSDK, "Sends emails using", "SDK/HTTPS")
        Rel(restAPI, db, "Reads and persists data", "SQL/TCP")
    }

    ContainerDb_Ext(db, "Database", "PostgreSQL/NeonDB", "Stores application data")

    Container_Boundary(googleBoundary, "Google") {
        System_Ext(firebaseSDK, "Firebase SDK", "Notification Service", "Sends push notifications")
        System_Ext(googleAuthSDK, "Google Auth SDK", "Authentication Service", "Handles user authentication and forwards it to REST API")
        Rel(firebaseSDK, webApp, "Sends notifications", "SDK/HTTPS")
        Rel(firebaseSDK, mobileApp, "Sends notifications", "SDK/HTTPS")
    }

    System_Ext(sendgridSDK, "Sendgrid SDK", "Email Service", "Sends emails")
    Rel(sendgridSDK, user, "Sends email to", "SDK/HTTPS")

    Rel(googleAuthSDK, restAPI, "Validate", "SDK/HTTPS")

    UpdateRelStyle(webApp, restAPI, $offsetX="-250")
    UpdateRelStyle(mobileApp, restAPI, $offsetX="-50")
    UpdateRelStyle(user, googleAuthSDK, $offsetX="-50", $offsetY="100")
    UpdateRelStyle(firebaseSDK, mobileApp, $offsetY="-50")
    UpdateRelStyle(restAPI, sendgridSDK, $offsetY="-50")
    UpdateRelStyle(sendgridSDK, user, $offsetX="120")
```

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
