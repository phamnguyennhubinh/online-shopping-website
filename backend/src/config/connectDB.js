const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('online-shopping-website', 'root', 'ANSKk08aPEDbFjDO', {
    host: 'localhost',
    dialect: 'mysql',
    logging: false,
    port: 3307
});

let connectDB = async () => {
    try {
        await sequelize.authenticate();
        console.log('Database connection successful!!!');
    } catch (error) {
        console.log('Unable to connect to database:', error);
    }
}

module.exports = connectDB;