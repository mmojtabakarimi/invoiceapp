# Invoice and Daily Sales Report System

## Overview
This project is a backend service for generating invoices and daily sales reports. It consists of two main services:

1. **Invoice Service** (NestJS + MongoDB) for handling invoices and generating reports.
2. **Email Service** (NestJS) for consuming RabbitMQ messages and sending emails.

The system runs on Docker and includes RabbitMQ for communication between services.

## Features
- Create invoices with customer details, items, and total amounts.
- Retrieve invoices via RESTful APIs.
- Generate daily sales summary reports at 12:00 PM via a cron job.
- Send daily sales reports through RabbitMQ to an email service.
- Access monitoring dashboards for RabbitMQ and MongoDB.

## Prerequisites
Ensure you have the following installed on your machine:
- [Docker](https://www.docker.com/)
- [Docker Compose](https://docs.docker.com/compose/install/)

## Setup and Installation
1. Download and unzip the source code:
   ```sh
   unzip invoice-system.zip
   cd invoice-system
   ```
2. Start the services using Docker Compose:
   ```sh
   docker-compose up -d --build
   ```
3. Access the services:
   - Invoice API: [http://localhost:3000](http://localhost:3000)
   - RabbitMQ Dashboard: [http://localhost:15672](http://localhost:15672) (user: guest, password: guest)
   - MongoDB Express Dashboard: [http://localhost:8081](http://localhost:8081)

## API Endpoints
### Invoice Service
- **Create Invoice**
  ```http
  POST /invoices
  ```
- **Get Invoice by ID**
  ```http
  GET /invoices/:id
  ```
- **Get All Invoices**
  ```http
  GET /invoices
  ```

## Daily Sales Report
- The report is generated at 12:00 PM daily.
- The report includes total sales amount and per-item sales summary.
- Published to RabbitMQ under the queue `daily_sales_report`.

## Testing
Run tests using:
```sh
npm test
```

## Logs and Debugging
To check logs for the services:
```sh
docker-compose logs -f app
```

## Stopping Services
To stop all services:
```sh
docker-compose down
```

## Contributing
Feel free to submit issues or pull requests to improve the system.

## Invoice and Daily Sales Report System

### Overview
This project is a backend service for generating invoices and daily sales reports. It consists of two main services:

1. **Invoice Service** (NestJS + MongoDB) for handling invoices and generating reports.
2. **Email Service** (NestJS) for consuming RabbitMQ messages and sending emails.

The system runs on Docker and includes RabbitMQ for communication between services.

### Features
- Create invoices with customer details, items, and total amounts.
- Retrieve invoices via RESTful APIs.
- Generate daily sales summary reports at 12:00 PM via a cron job.
- Send daily sales reports through RabbitMQ to an email service.
- Access monitoring dashboards for RabbitMQ and MongoDB.

### Prerequisites
Ensure you have the following installed on your machine:
- [Docker](https://www.docker.com/)
- [Docker Compose](https://docs.docker.com/compose/install/)

### Setup and Installation
1. Clone the repository:
   ```sh
   git clone <repository-url>
   cd invoice-system
   ```
2. Start the services using Docker Compose:
   ```sh
   docker-compose up -d --build
   ```
3. Access the services:
   - Invoice API: [http://localhost:3000](http://localhost:3000)
   - RabbitMQ Dashboard: [http://localhost:15672](http://localhost:15672) (user: guest, password: guest)
   - MongoDB Express Dashboard: [http://localhost:8081](http://localhost:8081)

### API Endpoints

#### Invoice Service
- **Create Invoice**
  ```http
  POST /invoices
  ```
  **Request Body Example:**
  ```json
  {
    "customer": "John Doe",
    "amount": 1450.50,
    "reference": "INV-029",
    "date": "2025-01-31T00:00:00.000Z",
    "items": [
      { "sku": "ITEM-123", "qt": 2 },
      { "sku": "ITEM-456", "qt": 10 }
    ]
  }
  ```

- **Get Invoice by ID**
  ```http
  GET /invoices/:id
  ```

- **Get All Invoices**
  ```http
  GET /invoices
  ```

#### Daily Sales Report
- **Get Daily Sales Report**
  ```http
  GET /invoices/reports/daily/?date=YYYY-MM-DD
  ```
  
### Daily Sales Report Generation
- The report is generated at **12:00 PM** daily.
- The report includes total sales amount and per-item sales summary.
- Published to RabbitMQ under the queue `daily_sales_report`.

### Testing
Run tests using:
```sh
npm test
```

### Logs and Debugging
To check logs for the services:
```sh
docker-compose logs -f app
```

### Stopping Services
To stop all services:
```sh
docker-compose down
```

### Contributing
Feel free to submit issues or pull requests to improve the system.

### License
This project is licensed under the MIT License.

### API List Summary

### API List Summary

| Endpoint                                             | Method | Description                                         |
|------------------------------------------------------|--------|-----------------------------------------------------|
| `/invoices`                                         | POST   | Create a new invoice                                |
| `/invoices/reports/daily/?date=2025-01-31`         | GET    | Retrieve daily sales report for a specific date    |
| `/invoices/:id`                                     | GET    | Retrieve an invoice by ID                           |
| `/invoices`                                         | GET    | Retrieve all invoices                               |
| `/invoices`                                         | POST   | Generate report                                     |
| `/invoices/:id`                                     | PUT    | Update an existing invoice                          |
| `/invoices/:id`                                     | DELETE | Delete an existing invoice                          |

