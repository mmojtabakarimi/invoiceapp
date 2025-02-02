#!/bin/bash

# Wait for MongoDB to start
echo "Waiting for MongoDB to start..."
sleep 5  # Adjust if necessary


echo "Database 'invoicedb' created"
mongosh -u root -p root123 --eval 'db = db.getSiblingDB("invoicedb")'

echo "User 'root' added with password 'root123'"
mongosh -u root -p root123 --eval 'db = db.getSiblingDB("invoicedb"); db.dropUser("root"); db.createUser({ user: "root", pwd: "root123", roles: [{ role: "readWrite", db: "invoicedb" }, { role: "dbAdmin", db: "invoicedb" }, { role: "dbOwner", db: "invoicedb" }] });'
