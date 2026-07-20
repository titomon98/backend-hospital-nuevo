require('dotenv').config();

const express       = require('express');
const cors          = require('cors');
const logger        = require('morgan');
const bodyParser    = require('body-parser');
const http = require('http');
const app = express();
const path = require('path');
/*  require('./routes')(app); */

app.use(logger('dev'));

//validacion de rutas
app.use(cors({origin:true}));

/* Agruegué el de express que el de bodyparser daba deprecate */
app.use(express.json({limit:"50mb"}));  
app.use(express.urlencoded({limit:"50mb" , extended: false }));  
app.use('/documents',express.static(path.join(__dirname,"documents")));

require("./routes")(app);

app.use(express.static('./public'));

app.get('*', (req, res) => res.status(200).send({
     message: 'Index.',
}));

// Sin secreto no se pueden firmar ni verificar tokens: es mejor fallar al
// arrancar que hasta que alguien intente iniciar sesión.
if (!process.env.JWT_SECRET) {
    console.error('Falta JWT_SECRET. Copie .env.example a .env y complételo.');
    process.exit(1);
}

const port = parseInt(process.env.PORT, 10) || 3000;
app.set('port', port);
const server = http.createServer(app);
server.listen(port);
module.exports = app;
