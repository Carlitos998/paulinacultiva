// controllers/userController.js
const { User, Post, Comment } = require("../models")
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const { agregarContexto } = require('../middlewares/contextMiddleware')
const nodemailer = require('nodemailer')

const SECRET = process.env.JWT_SECRET || 'misecreto'

const getActiveUsers = async (req, res) => {
    try {
        const users = await User.findAll({ attributes: { exclude: ['password'] } })
        res.json(users)
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

const getActiveUserProfile = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id, { attributes: { exclude: ['password'] } });
        if (!user) {
            return res.status(404).json({ message: "Usuario no encontrado" });
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
};

const registerUser = async (req, res) => {
    try {
        const { username, email, password } = req.body

        // Validación adicional en el controlador (sanitización)
        const cleanUsername = username.trim().replace(/\s+/g, '');
        const cleanEmail = email ? email.trim().replace(/\s+/g, '') : null;

        if (!cleanEmail) {
            return res.status(400).json({
                success: false,
                message: 'El email es requerido para el registro'
            })
        }

        // Verificar si el email ya está en uso
        const existingUser = await User.findOne({ where: { email: cleanEmail } });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'El email ya está registrado'
            });
        }

        // Verificar si el username ya está en uso
        const existingUsername = await User.findOne({ where: { username: cleanUsername } });
        if (existingUsername) {
            return res.status(400).json({
                success: false,
                message: 'El nombre de usuario ya está en uso'
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10)

        // Generar un código de verificación único
        const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
        const verificationCodeExpires = new Date(Date.now() + 3600000); // 1 hora

        // Crear usuario con estado 'pendiente' en lugar de 'activo'
        const user = await User.create({
            username: cleanUsername,
            email: cleanEmail,
            password: hashedPassword,
            isAdmin: false,
            estado: 'pendiente',
            emailVerified: false,
            verificationCode: verificationCode,
            verificationCodeExpires: verificationCodeExpires
        });

        // Enviar email de verificación
            try {
                console.log('📧 Intentando enviar email de verificación...');
                console.log('   EMAIL_USER:', process.env.EMAIL_USER);
                console.log('   FROM_EMAIL:', process.env.FROM_EMAIL);
                console.log('   Tiene EMAIL_PASS:', !!process.env.EMAIL_PASS);

                const transporter = nodemailer.createTransport({
                    service: 'gmail',
                    auth: {
                        user: process.env.EMAIL_USER,
                        pass: process.env.EMAIL_PASS
                    }
                });

                const mailOptions = {
                    from: `"Paulina Cultiva" <${process.env.FROM_EMAIL}>`,
                    to: cleanEmail,
                    subject: 'Verifica tu cuenta de Paulina Cultiva',
                    html: `
                        <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
                            <div style="text-align: center; margin-bottom: 30px;">
                                <h1 style="color: #FF6B35; margin: 0;">🍳 Paulina Cultiva</h1>
                                <p style="color: #666; margin: 5px 0 0;">Tu comunidad de recetas caseras</p>
                            </div>

                            <div style="background: #f8f9fa; padding: 30px; border-radius: 10px; text-align: center;">
                                <h2 style="color: #333; margin-top: 0;">¡Bienvenido a Paulina Cultiva!</h2>
                                <p style="color: #666; line-height: 1.6;">
                                    Gracias por registrarte. Para completar tu registro, por favor verifica tu cuenta con el siguiente código:
                                </p>

                                <div style="background: #FF6B35; color: white; padding: 20px; border-radius: 8px; margin: 20px 0; display: inline-block;">
                                    <div style="font-size: 32px; font-weight: bold; letter-spacing: 3px; margin: 0;">
                                        ${verificationCode}
                                    </div>
                                </div>

                                <p style="color: #666; font-size: 14px; margin: 20px 0 0;">
                                    Este código expirará en 1 hora.
                                </p>
                            </div>

                            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
                                <p style="color: #999; font-size: 12px; margin: 0;">
                                    Si no creaste esta cuenta, puedes ignorar este email.
                                </p>
                            </div>
                        </div>
                    `
                };

                await transporter.sendMail(mailOptions);
                console.log('✅ Email enviado exitosamente a:', cleanEmail);

            } catch (emailError) {
                console.error('❌ Error al enviar email de verificación:', emailError.message);

                // Eliminar el usuario creado si falla el envío del email
                await User.destroy({ where: { id: user.id } });
                return res.status(500).json({
                    success: false,
                    message: 'Error al enviar email de verificación. Por favor, intenta nuevamente.'
                });
            }

        res.status(201).json({
            success: true,
            message: 'Usuario registrado correctamente. Por favor, verifica tu email para activar tu cuenta.',
            verificationCode: process.env.NODE_ENV === 'development' ? verificationCode : undefined,
            debugInfo: process.env.NODE_ENV === 'development' ? {
                code: verificationCode,
                expires: verificationCodeExpires,
                email: cleanEmail
            } : undefined
        });

    } catch (error) {
        console.error('Error en registro:', error);

        if (error.name === 'SequelizeValidationError') {
            return res.status(400).json({
                success: false,
                message: 'Error de validación',
                errors: error.errors.map(e => e.message)
            });
        }

        res.status(500).json({
            success: false,
            message: error.message
        });
    }
}

const login = async (req, res) => {
    try {
        const { email, password } = req.body
        const cleanEmail = email.trim().replace(/\s+/g, '');

        const user = await User.findOne({ where: { email: cleanEmail } })
        if (!user) {
            return res.status(400).json({
                success: false,
                message: "Usuario no encontrado"
            })
        }

        const compare = await bcrypt.compare(password, user.password)
        if (!compare) {
            return res.status(400).json({
                success: false,
                message: "Usuario o contraseña incorrecta"
            })
        }

        // Verificar si el email está verificado
        if (!user.emailVerified) {
            return res.status(403).json({
                success: false,
                message: "Por favor, verifica tu email antes de iniciar sesión."
            })
        }

        // Verificar si el usuario está inactivo
        if (user.estado !== 'activo') {
            return res.status(403).json({
                success: false,
                message: "Tu cuenta está inactiva. Contacta al administrador."
            })
        }

        const token = jwt.sign(
            { userId: user.id, email: user.email, isAdmin: user.isAdmin },
            SECRET,
            { expiresIn: '8h' }
        )

        res.json({
            success: true,
            message: "Inicio de sesión exitoso",
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                isAdmin: user.isAdmin,
                estado: user.estado
            }
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

const me = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id, { attributes: { exclude: ['password'] } })
        res.json(user)
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

const createAdmin = async (req, res) => {
    try {
        const { username, password } = req.body

        const existingAdmin = await User.findOne({ where: { isAdmin: true } })
        if (existingAdmin) {
            return res.status(400).json({
                success: false,
                message: "Ya existe un administrador"
            })
        }

        const hashedPassword = await bcrypt.hash(password, 10)

        await User.create({
            username,
            password: hashedPassword,
            isAdmin: true,
            estado: 'activo'
        })

        res.status(201).json({
            success: true,
            message: "Administrador creado correctamente"
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body
        const userId = req.user.id

        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message: "La contraseña actual y la nueva son requeridas"
            })
        }

        if (newPassword.length < 6) {
            return res.status(400).json({
                success: false,
                message: "La nueva contraseña debe tener al menos 6 caracteres"
            })
        }

        // Buscar usuario
        const user = await User.findByPk(userId)
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "Usuario no encontrado"
            })
        }

        // Verificar contraseña actual
        const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password)
        if (!isCurrentPasswordValid) {
            return res.status(400).json({
                success: false,
                message: "La contraseña actual es incorrecta"
            })
        }

        // Hashear nueva contraseña
        const hashedNewPassword = await bcrypt.hash(newPassword, 10)

        // Actualizar contraseña
        await user.update({ password: hashedNewPassword })

        res.json({
            success: true,
            message: "Contraseña actualizada correctamente"
        })

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

const deleteAccount = async (req, res) => {
    try {
        const { password } = req.body
        const userId = req.user.id

        if (!password) {
            return res.status(400).json({
                success: false,
                message: "La contraseña es requerida para desactivar la cuenta"
            })
        }

        // Buscar usuario
        const user = await User.findByPk(userId)
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "Usuario no encontrado"
            })
        }

        // Verificar contraseña
        const isPasswordValid = await bcrypt.compare(password, user.password)
        if (!isPasswordValid) {
            return res.status(400).json({
                success: false,
                message: "La contraseña es incorrecta"
            })
        }

        // Marcar como inactivo en lugar de eliminar
        await user.update({
            estado: 'inactivo',
            emailVerified: false // También invalidar email verification
        })

        res.json({
            success: true,
            message: "Cuenta desactivada correctamente"
        })

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

// Nueva función para desactivar cuenta sin contraseña (para el frontend)
const deactivateAccount = async (req, res) => {
    try {
        const userId = req.user.id

        // Buscar usuario
        const user = await User.findByPk(userId)
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "Usuario no encontrado"
            })
        }

        // Marcar como inactivo y invalidar email
        await user.update({
            estado: 'inactivo',
            emailVerified: false
        })

        // Desactivar todas las publicaciones del usuario
        await Post.update(
            { estado: 'inactivo' },
            { where: { autorId: userId } }
        )

        // Desactivar todos los comentarios del usuario
        await Comment.update(
            { estado: 'inactivo' },
            { where: { autorId: userId } }
        )

        res.json({
            success: true,
            message: "Cuenta desactivada correctamente"
        })

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

const updateUsername = async (req, res) => {
    try {
        const { newUsername } = req.body
        const userId = req.user.id

        if (!newUsername) {
            return res.status(400).json({
                success: false,
                message: "El nuevo nombre de usuario es requerido"
            })
        }

        // Validar formato del nuevo username
        const cleanUsername = newUsername.trim().replace(/\s+/g, '');

        // Validaciones básicas
        if (!cleanUsername) {
            return res.status(400).json({
                success: false,
                message: "El nombre de usuario no puede estar vacío"
            })
        }

        // Validar que no tenga espacios
        if (/\s/.test(cleanUsername)) {
            return res.status(400).json({
                success: false,
                message: "El nombre de usuario no puede contener espacios"
            })
        }

        // Validar caracteres permitidos
        const regex = /^[a-zA-Z0-9_-]+$/;
        if (!regex.test(cleanUsername)) {
            return res.status(400).json({
                success: false,
                message: "El nombre de usuario solo puede contener letras, números, guiones (-) y guiones bajos (_)"
            })
        }

        // Validar longitud
        if (cleanUsername.length < 3 || cleanUsername.length > 50) {
            return res.status(400).json({
                success: false,
                message: "El nombre de usuario debe tener entre 3 y 50 caracteres"
            })
        }

        // Buscar usuario actual
        const user = await User.findByPk(userId)
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "Usuario no encontrado"
            })
        }

        // No se requiere validación de contraseña para cambiar username

        // Verificar que no sea el mismo username actual
        if (cleanUsername === user.username) {
            return res.status(400).json({
                success: false,
                message: "El nuevo nombre de usuario debe ser diferente al actual"
            })
        }

        // Verificar que el nuevo username no esté en uso
        const existingUser = await User.findOne({
            where: { username: cleanUsername }
        })

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "Este nombre de usuario ya está en uso"
            })
        }

        // Actualizar username
        await user.update({ username: cleanUsername })

        res.json({
            success: true,
            message: "Nombre de usuario actualizado correctamente",
            username: cleanUsername
        })

    } catch (error) {
        console.error('Error en updateUsername:', error)
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

const verifyEmail = async (req, res) => {
    try {
        const { email, code } = req.body;

        if (!email || !code) {
            return res.status(400).json({
                success: false,
                message: 'Email y código de verificación son requeridos'
            });
        }

        const user = await User.findOne({ where: { email } });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }

        // Depuración: mostrar códigos para comparar
        console.log('🔍 Depuración de verificación:');
        console.log('   Email recibido:', email);
        console.log('   Código recibido:', code);
        console.log('   Código en BD:', user.verificationCode);
        console.log('   Tipos:', typeof code, typeof user.verificationCode);
        console.log('   Son iguales?:', code === user.verificationCode);
        console.log('   Son iguales (trim)?:', code.trim() === user.verificationCode.trim());

        // Verificar si el código es correcto (ignorando espacios)
        const cleanCode = code.toString().trim();
        const storedCode = user.verificationCode ? user.verificationCode.toString().trim() : '';

        if (cleanCode !== storedCode) {
            return res.status(400).json({
                success: false,
                message: 'Código de verificación incorrecto'
            });
        }

        // Verificar si el código ha expirado (1 hora)
        if (user.verificationCodeExpires && new Date() > user.verificationCodeExpires) {
            return res.status(400).json({
                success: false,
                message: 'El código de verificación ha expirado. Por favor, solicita uno nuevo.'
            });
        }

        // Verificar si ya está verificado
        if (user.emailVerified) {
            return res.status(400).json({
                success: false,
                message: 'Este email ya ha sido verificado'
            });
        }

        // Actualizar usuario como verificado y activo
        await user.update({
            emailVerified: true,
            estado: 'activo',
            verificationCode: null,
            verificationCodeExpires: null
        });

        // Generar token JWT
        const token = jwt.sign(
            { userId: user.id, email: user.email, isAdmin: user.isAdmin },
            SECRET,
            { expiresIn: '8h' }
        );

        const userResponse = user.toJSON();
        delete userResponse.password;

        res.status(200).json({
            success: true,
            message: 'Email verificado exitosamente',
            user: userResponse,
            token
        });

    } catch (error) {
        console.error('Error en verificación de email:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
}

const requestPasswordReset = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Email es requerido'
            });
        }

        const cleanEmail = email.trim().replace(/\s+/g, '');

        const user = await User.findOne({ where: { email: cleanEmail } });

        if (!user) {
            return res.status(200).json({
                success: true,
                message: 'Si el email está registrado, recibirás instrucciones para restablecer tu contraseña'
            });
        }

        const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
        const resetCodeExpires = new Date(Date.now() + 3600000);

        await user.update({
            passwordResetCode: resetCode,
            passwordResetCodeExpires: resetCodeExpires
        });

        try {
            console.log('📧 Enviando código de recuperación...');
            console.log('   EMAIL_USER:', process.env.EMAIL_USER);
            console.log('   FROM_EMAIL:', process.env.FROM_EMAIL);

            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASS
                }
            });

            const mailOptions = {
                from: `"Paulina Cultiva" <${process.env.FROM_EMAIL}>`,
                to: cleanEmail,
                subject: 'Recupera tu cuenta de Paulina Cultiva',
                html: `
                    <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
                        <div style="text-align: center; margin-bottom: 30px;">
                            <h1 style="color: #FF6B35; margin: 0;">🍳 Paulina Cultiva</h1>
                            <p style="color: #666; margin: 5px 0 0;">Recuperación de cuenta</p>
                        </div>

                        <div style="background: #f8f9fa; padding: 30px; border-radius: 10px; text-align: center;">
                            <h2 style="color: #333; margin-top: 0;">Hola ${user.username}!</h2>
                            <p style="color: #666; line-height: 1.6; margin: 20px 0;">
                                Recibimos una solicitud para recuperar tu cuenta.
                            </p>

                            <div style="background: #FF6B35; color: white; padding: 20px; border-radius: 8px; margin: 20px 0; display: inline-block;">
                                <div style="font-size: 32px; font-weight: bold; letter-spacing: 3px; margin: 0;">
                                    ${resetCode}
                                </div>
                            </div>

                            <p style="color: #666; font-size: 14px; margin: 20px 0;">
                                Este código expirará en 1 hora.
                            </p>
                        </div>

                        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
                            <p style="color: #999; font-size: 12px; margin: 0;">
                                Si no solicitaste esto, ignora este email.
                            </p>
                        </div>
                    </div>
                `
            };

            await transporter.sendMail(mailOptions);
            console.log('✅ Email enviado exitosamente a:', cleanEmail);

        } catch (emailError) {
            console.error('❌ Error al enviar email:', emailError.message);
            return res.status(500).json({
                success: false,
                message: 'Error al enviar email. Por favor, intenta nuevamente.'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Se ha enviado un código a tu email',
            resetCode: process.env.NODE_ENV === 'development' ? resetCode : undefined
        });

    } catch (error) {
        console.error('Error en requestPasswordReset:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const verifyResetCode = async (req, res) => {
    try {
        const { email, code } = req.body;

        if (!email || !code) {
            return res.status(400).json({
                success: false,
                message: 'Email y código son requeridos'
            });
        }

        const user = await User.findOne({ where: { email: email.trim().replace(/\s+/g, '') } });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }

        console.log('🔍 Verificando código de recuperación:');
        console.log('   Código recibido:', code);
        console.log('   Código en BD:', user.passwordResetCode);

        const cleanCode = code.toString().trim();
        const storedCode = user.passwordResetCode ? user.passwordResetCode.toString().trim() : '';

        if (cleanCode !== storedCode) {
            return res.status(400).json({
                success: false,
                message: 'Código incorrecto'
            });
        }

        if (user.passwordResetCodeExpires && new Date() > user.passwordResetCodeExpires) {
            return res.status(400).json({
                success: false,
                message: 'El código ha expirado. Solicita uno nuevo.'
            });
        }

        console.log('✅ Código verificado para:', email);

        res.status(200).json({
            success: true,
            message: 'Código verificado correctamente',
            user: {
                id: user.id,
                email: user.email
            }
        });

    } catch (error) {
        console.error('Error en verifyResetCode:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const resetPassword = async (req, res) => {
    try {
        const { email, code, newPassword } = req.body;

        if (!email || !code || !newPassword) {
            return res.status(400).json({
                success: false,
                message: 'Email, código y nueva contraseña son requeridos'
            });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'La contraseña debe tener al menos 6 caracteres'
            });
        }

        const user = await User.findOne({ where: { email: email.trim().replace(/\s+/g, '') } });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }

        const cleanCode = code.toString().trim();
        const storedCode = user.passwordResetCode ? user.passwordResetCode.toString().trim() : '';

        if (cleanCode !== storedCode) {
            return res.status(400).json({
                success: false,
                message: 'Código inválido'
            });
        }

        if (user.passwordResetCodeExpires && new Date() > user.passwordResetCodeExpires) {
            return res.status(400).json({
                success: false,
                message: 'El código ha expirado'
            });
        }

        const samePassword = await bcrypt.compare(newPassword, user.password);
        if (samePassword) {
            return res.status(400).json({
                success: false,
                message: 'La nueva contraseña no puede ser igual a la actual'
            });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        await user.update({
            password: hashedPassword,
            passwordResetCode: null,
            passwordResetCodeExpires: null
        });

        console.log('✅ Contraseña actualizada para:', email);

        res.status(200).json({
            success: true,
            message: 'Contraseña actualizada correctamente'
        });

    } catch (error) {
        console.error('Error en resetPassword:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Función para sincronizar el estado de los posts y comentarios con el estado del usuario
const syncUserContentStatus = async (userId, userStatus) => {
    try {
        const contentStatus = userStatus === 'activo' ? 'activo' : 'inactivo';

        // Actualizar todos los posts del usuario
        await Post.update(
            { estado: contentStatus },
            { where: { autorId: userId } }
        );

        // Actualizar todos los comentarios del usuario
        await Comment.update(
            { estado: contentStatus },
            { where: { autorId: userId } }
        );

        console.log(`Sincronizado: ${contentStatus} - Usuario ${userId} - Posts y comentarios actualizados`);
        return { success: true, message: 'Contenido sincronizado correctamente' };
    } catch (error) {
        console.error('Error al sincronizar estado de contenido:', error);
        throw error;
    }
}

module.exports = {
    getActiveUsers,
    registerUser,
    verifyEmail,
    login,
    me,
    createAdmin,
    getActiveUserProfile,
    changePassword,
    deleteAccount,
    deactivateAccount,
    updateUsername,
    requestPasswordReset,
    verifyResetCode,
    resetPassword,
    syncUserContentStatus
};