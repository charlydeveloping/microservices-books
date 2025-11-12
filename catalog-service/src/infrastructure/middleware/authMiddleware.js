import jwt from 'jsonwebtoken';

// Middleware simple para validar tokens de Keycloak
export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: 'Token requerido' });
  }

  try {
    // Decodificar el token sin verificación (simple)
    // En producción deberías verificar con la clave pública de Keycloak
    const decoded = jwt.decode(token);
    
    if (!decoded) {
      return res.status(403).json({ error: 'Token inválido' });
    }

    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Token inválido' });
  }
};
