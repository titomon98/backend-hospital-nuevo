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
                
                // Solo lo mínimo para identificar y autorizar. La instancia
                // completa incluía el hash de la contraseña, y el payload de un
                // JWT viaja legible hacia el cliente.
                const token = jwt.sign(
                    {
                        user_id: usuario.id,
                        user: usuario.user,
                        id_tipo_usuario: usuario.id_tipo_usuario
                    },
                    process.env.JWT_SECRET,
                    {
                        expiresIn: "2h",
                    }
                );

                // objeto con id, usuario, tipo de usuario, token, vencimiento
                let autenticado = {
                    token: token,
                    id: usuario.id,
                    tipo_usuario: usuario.id_tipo_usuario,
                    usuario: usuario.user,
                    id_medico: usuario.id_medico
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
        jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
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

    async validatePassword (req, res) {
        
        try {
            const { id_usuario, password } = req.body;

            // Validación de backend
            if (!(id_usuario && password)) {
                res.status(400).send("No llenó todos los campos");
            }

            const usuario = await Usuario.findOne({where: {
                id: id_usuario
              }});
            
            //El bcrypt en npm tiene 10 rondas
            if (usuario && (await bcrypt.compare(password, usuario.password))) {

                // devolver usuario
                res.status(200).json({ message: "Credenciales aprobadas"});
            }
            // res.status(400).send("Credenciales incorrectas");
            res.status(401).json({ message: "Contraseña incorrecta"});
        } catch (err) {
            console.log(err);
        }
    },

    // Cada usuario cambia SU propia contraseña: el id sale del token (req.user),
    // nunca del body, y se exige la contraseña actual.
    async cambiarPassword (req, res) {
        try {
            const { actual, nueva } = req.body;
            if (!actual || !nueva) {
                return res.status(400).json({ msg: 'Ingrese la contraseña actual y la nueva' });
            }
            if (String(nueva).length < 6) {
                return res.status(400).json({ msg: 'La nueva contraseña debe tener al menos 6 caracteres' });
            }
            const usuario = await Usuario.findByPk(req.user.user_id);
            if (!usuario) {
                return res.status(404).json({ msg: 'Usuario no encontrado' });
            }
            // 400 (no 401) para no confundirlo con un token vencido.
            if (!(await bcrypt.compare(actual, usuario.password))) {
                return res.status(400).json({ msg: 'La contraseña actual es incorrecta' });
            }
            const hash = bcrypt.hashSync(nueva, bcrypt.genSaltSync(10));
            await usuario.update({ password: hash });
            return res.status(200).json({ msg: 'Contraseña actualizada correctamente' });
        } catch (err) {
            console.log(err);
            return res.status(500).json({ msg: 'Ha ocurrido un error, por favor intente más tarde' });
        }
    },
};

