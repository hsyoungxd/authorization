require('dotenv').config();

const { Pool } = require("pg");

const isProduction = process.env.NODE_ENV === "production";

const connectionString = `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_DATABASE}`;
// connectionString: isProduction ? prrocess.env.DATABASE_URL : connectionString
const pool = new Pool({
    // connectionString: (()=>{
    //     if(isProduction)
    //         return process.env.DATABASE_URL;
    //     else
    //         return connectionString;
    // })
    connectionString: isProduction ? prrocess.env.DATABASE_URL : connectionString
});


module.exports = {pool};