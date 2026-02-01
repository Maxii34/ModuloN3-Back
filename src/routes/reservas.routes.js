import { Router } from "express";
import validarToken from "../middlewares/validarToken.js";
import { crearReserva, obtenerMisReservas, cancelarReserva } from "../controllers/reservas.controllers.js";
import validacionesReserva from "../middlewares/validacionesReservas.js";


const router = Router();

//http://localhost:4000/api/reserva
router.route("/")
.post([validarToken, validacionesReserva], crearReserva)
.get(validarToken, obtenerMisReservas);

//http://localhost:4000/api/reserva/:id
router.route("/:id").put(validarToken, cancelarReserva);

//router.route("/mias").get(validarToken, obtenerMisReservas);

export default router;
