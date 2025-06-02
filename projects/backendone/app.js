require('dotenv').config()
const  { Sequelize, DataTypes } = require('sequelize');
const express = require('express')
const client = require('prom-client');
const register = client.register;
const app = express()
const port = process.env.PORT
const dbName = process.env.DB_NAME
const dbHost = process.env.DB_HOST
const user = process.env.DB_USER
const password = encodeURIComponent(process.env.DB_PASSWORD);


// Example: Counter metric
const httpCounter = new client.Counter({
    name: 'http_requests_total',
    help: 'Total number of HTTP requests',
    labelNames: ['method', 'path']
});

// Increment counter on every request
app.use((req, res, next) => {
    httpCounter.inc({ method: req.method, path: req.path });
    next();
});

// /metrics endpoint for Prometheus to scrape
app.get('/metrics', async (req, res) => {
    console.log('let logs some metrics!')
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
});


const sequelize = new Sequelize(`postgres://${user}:${password}@${dbHost}/${dbName}`)

console.log(process.env.DB_NAME,'<<<<<<BD NAME')
console.log(process.env.DB_HOST, '<<<<DB_HOST');
const connectsToDB = async () => {
    try {
        console.log('Trying to connect to postgres.')
        await sequelize.authenticate();
        console.log('Connection has been established successfully.');
    } catch (error) {
        console.error('THERE SOME PROBLEMS')
        console.error('Unable to connect to the database:', error);
        process.exit(1);
    }
}

connectsToDB()


const ClicksCount = sequelize.define('ClicksCount', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
    },
    createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,  // Automatically set the current date/time on creation
    },
    updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,  // Automatically set the current date/time on update
    },
}, {
    tableName: 'clicks_count', // Set table name if different from default (lowercase model name)
    timestamps: true, // Automatically manage `createdAt` and `updatedAt`
});

app.get('/', async (req, res) => {
    try {
        console.log('lets logs it')
        const length = await ClicksCount.count()
        console.log('sending length', length)
        res.json({ length, test:'hello new version' }); // Send the data as a JSON response
    } catch (error) {
        console.error('Error retrieving data:', error);
        res.status(500).send('Internal Server Error');
    }
})

app.post('/', async (req, res) => {
    const newRecord = await ClicksCount.create();
    res.json(newRecord);
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})