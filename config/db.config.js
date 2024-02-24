module.exports = {
  HOST: "localhost",
  USER: "root",
  PASSWORD: "5920108",
  DB: "hospital",
  dialect: "mysql",
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
};
