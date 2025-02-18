require('dotenv').config()
const  { Sequelize, DataTypes } = require('sequelize');
const express = require('express')
const app = express()
const port = process.env.PORT


const sequelize = new Sequelize(`postgres://admin:admin@${process.env.DB_HOST}/mydatabase`)
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


console.log(port, 'PORT 1')

app.get('/', async (req, res) => {
    try {
        const length = await ClicksCount.count()
        console.log('sending length', length)
        res.json({ length: length || 0 }); // Send the data as a JSON response
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