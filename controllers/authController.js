const Sequelize     = require('sequelize');
const db = require("../models");
const Usuario = db.usuarios;
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs')


module.exports = {
    async login (req, res) {
        
        try {
            const { user, password } = req.body;

            // Validación de backend
            if (!(user && password)) {
                res.status(400).send("No llenó todos los campos");
            }

            const usuario = await Usuario.findOne({where: {
                user: user
              }});
            
            //El bcrypt en npm tiene 10 rondas
            if (usuario && (await bcrypt.compare(password, usuario.password))) {
                
                const token = jwt.sign(
                    {
                        user_id: usuario.id, 
                        usuario: usuario 
                    },
                    'Centro_Galo',
                    {
                        expiresIn: "2h",
                    }
                );

                // objeto con id, usuario, tipo de usuario, token, vencimiento
                let autenticado = {
                    token: token,
                    id: usuario.id,
                    tipo_usuario: usuario.id_tipo_usuario,
                    usuario: usuario.user
                }

                // devolver usuario
                res.status(200).json(autenticado);
            }
            // res.status(400).send("Credenciales incorrectas");
            res.status(401).json({ message: "Credenciales incorrectas"});
        } catch (err) {
            console.log(err);
        }
    },

    refresh (req, res) {
        const token = req.body.token;
        jwt.verify(token, "centro_galo", (err, user) => {
            if (err) {
                return res.sendStatus(404);
            }
            else{
                return res.send(token)
            }
        });
    },

    logout (req, res) {
        const authHeader = req.body.token;
        jwt.sign(authHeader, "", { expiresIn: 1 } , (logout, err) => {
            if (logout) {
               res.send({msg : 'Has sido desconectado' });
            } else {
               res.send({msg:'Error'});
            }
         });
    },

    autenticar (req, res) {
        res.status(200).send("Bienvenido ");
    },
};

