import { Router } from 'express';
import habitacionesRoutes from './habitaciones.routes.js';
import usuariosRoutes from './usuarios.routes.js';
import reservasRoutes from './reservas.routes.js';

const router = Router();

//http://localhost:3000/api/habitaciones
router.use('/habitaciones', habitacionesRoutes);

//http://localhost:3000/api/usuarios
router.use('/usuarios', usuariosRoutes);

// http://localhost:3000/api/reserva
router.use('/reserva', reservasRoutes);

export default router;