# Invoice App

A modern invoice management system built with NestJS and MongoDB.

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/install/)
- Node.js 18+ (for local development)

## Getting Started

### Using Docker (Recommended)

1. Clone the repository:
```bash
git clone <repository-url>
cd invoiceapp
```

2. Start the application:
```bash
docker compose up
```

The application will be available at:
- NestJS Application: http://localhost:3000
- MongoDB Express (Database Management): http://localhost:8081

### Database Configuration

The application uses MongoDB with the following default configuration:
- Host: mongodb
- Port: 27017
- Database: invoiceapp
- Root Username: root
- Root Password: root123

You can access the MongoDB Express interface at http://localhost:8081 to manage your database.

### Environment Variables

```env
MONGODB_URI=mongodb://root:root123@mongodb:27017/invoiceapp
```

## Available Scripts

- `npm run start` - Start the application
- `npm run start:dev` - Start the application in watch mode
- `npm run start:debug` - Start the application in debug mode
- `npm run start:prod` - Start the application in production mode
- `npm run build` - Build the application
- `npm run test` - Run unit tests
- `npm run test:e2e` - Run end-to-end tests
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

## Project Structure

```
src/
├── app.module.ts        # Main application module
├── main.ts             # Application entry point
├── modules/            # Feature modules
│   └── invoices/       # Invoice module
├── common/             # Shared resources
└── config/            # Configuration files
```

### RabbitMQ

RabbitMQ is used to send messages to the invoice service.

### RabbitMQ Management UI

RabbitMQ Management UI is available at http://localhost:15672.

### RabbitMQ Admin UI

RabbitMQ Admin UI is available at http://localhost:15672.   


## License

[MIT Licensed](LICENSE)
