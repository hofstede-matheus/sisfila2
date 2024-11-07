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

## Initial setup

```bash
## not necessary if the database and the application are initialized by docker-compose
## some variables in the .env may need modification
## fill in the serviceAccountKey.json file with the firebase credentials

cp .env.example .env
cp .env.test.example .env.test
npm ci
touch serviceAccountKey.json
```

## Start development environment

```bash
## to start the database and the application
docker-compose up --build
```

ou

```bash
## to start only the database and run the application manually
docker-compose up db
npm run start:dev
```

## Swagger Docs

<http:localhost:3000/docs>

## Running the tests

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

## Database

### Entity Relationship Diagram

```mermaid
erDiagram
    ORGANIZATIONS ||--o{ CLIENTS : "has"
    ORGANIZATIONS ||--o{ GROUPS : "has"
    ORGANIZATIONS ||--o{ QUEUES : "has"
    ORGANIZATIONS ||--o{ SERVICES : "has"
    ORGANIZATIONS ||--o{ DESKS : "has"
    ORGANIZATIONS }|--|{ USERS : "has roles in"

    USERS }|--|{ ORGANIZATIONS : "works in"

    USERS ||--o{ DESKS : "assigned to"

    CLIENTS ||--o{ FCM_TOKENS : "has"
    CLIENTS }|--|{ GROUPS : "member of"
    CLIENTS }|--|{ QUEUES : "is in"

    GROUPS }|--|{ QUEUES : "associated with"

    SERVICES ||--o{ QUEUES : "has"
    SERVICES }|--|{ DESKS : "provided by"

    DESKS ||--o{ CLIENTS : "serves"

    USERS ||--o{ CLIENTS : "attends"

    USERS {
        varchar email
        varchar name
        text password
        boolean is_super_admin
    }
    ORGANIZATIONS {
        varchar name
        varchar code
    }
    CLIENTS {
        varchar name
        varchar registration_id
    }
    GROUPS {
        varchar name
    }
    QUEUES {
        varchar name
        varchar description
        int priority
        varchar code
    }
    SERVICES {
        varchar subscription_token
        varchar name
        boolean guest_enroll
        timestamp opens_at
        timestamp closes_at
    }
    DESKS {
        varchar name
    }
    FCM_TOKENS {
        varchar fcm_token PK
    }
```

### Relational Database Model

![alt text](sisfila_v11.png)
