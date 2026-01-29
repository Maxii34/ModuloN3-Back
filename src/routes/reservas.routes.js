import { Router } from "express";
import validarToken from "../middlewares/validarToken.js";
import { crearReserva, obtenerMisReservas } from "../controllers/reservas.controllers.js";
import validacionesReserva from "../middlewares/validacionesReservas.js";


const router = Router();

router.post("/", validarToken, validacionesReserva, crearReserva);

router.get("/mias", validarToken, obtenerMisReservas);

export default router;
