import { body } from "express-validator";
import resultadoValidacion from "./resultadoValidacion.js";
import Reserva from "../models/reservas.js";
import Habitacion from "../models/habitaciones.js";
import mongoose from "mongoose";

const validacionesReserva = [
  // Validar habitación
  body("habitacion")
    .notEmpty()
    .withMessage("La habitación es obligatoria")
    .isMongoId()
    .withMessage("ID de habitación inválido")
    .custom(async (valor) => {
      const habitacionExiste = await Habitacion.findById(valor);
      if (!habitacionExiste) {
        throw new Error("La habitación no existe");
      }
      return true;
    }),

  // Validar fecha de entrada
  body("fechaEntrada")
    .notEmpty()
    .withMessage("La fecha de entrada es obligatoria")
    .isISO8601()
    .withMessage("Formato de fecha de entrada inválido")
    .custom((valor) => {
      const fechaEntrada = new Date(valor);
      const hoy = new Date();
      hoy.setUTCHours(0, 0, 0, 0);

      if (fechaEntrada < hoy) {
        throw new Error("La fecha de entrada no puede ser anterior a hoy");
      }
      return true;
    }),

  // Validar fecha de salida
  body("fechaSalida")
    .notEmpty()
    .withMessage("La fecha de salida es obligatoria")
    .isISO8601()
    .withMessage("Formato de fecha de salida inválido")
    .custom((valor, { req }) => {
      const fechaEntrada = new Date(req.body.fechaEntrada);
      const fechaSalida = new Date(valor);

      if (fechaSalida <= fechaEntrada) {
        throw new Error(
          "La fecha de salida debe ser posterior a la fecha de entrada",
        );
      }

      // Valida que la reserva no sea larga
      const diasDiferencia = Math.ceil(
        (fechaSalida - fechaEntrada) / (1000 * 60 * 60 * 24),
      );
      if (diasDiferencia > 30) {
        throw new Error("La reserva no puede ser mayor a 30 días");
      }

      return true;
    }),

  // Valida cantidad de huéspedes
  body("cantidadHuespedes")
    .notEmpty()
    .withMessage("La cantidad de huéspedes es obligatoria")
    .isInt({ min: 1, max: 10 })
    .withMessage("La cantidad de huéspedes debe estar entre 1 y 10")
    .custom(async (valor, { req }) => {
      // Verifica que la cantidad de huéspedes no exceda la capacidad de la habitación
      const habitacion = await Habitacion.findById(req.body.habitacion);
      if (habitacion && valor > habitacion.capacidad) {
        throw new Error(
          `La cantidad de huéspedes (${valor}) excede la capacidad de la habitación (${habitacion.capacidad})`,
        );
      }
      return true;
    }),

  // Valida superposición de fechas
  body("habitacion").custom(async (habitacionId, { req }) => {
    const fechaEntrada = new Date(req.body.fechaEntrada);
    const fechaSalida = new Date(req.body.fechaSalida);

    fechaEntrada.setUTCHours(0, 0, 0, 0);
    fechaSalida.setUTCHours(0, 0, 0, 0);

    // Busca reservas activas que se superpongan con las fechas solicitadas
    const reservasSuperpuestas = await Reserva.find({
      habitacion: new mongoose.Types.ObjectId(habitacionId),
      estado: { $in: ["activa", "confirmada"] },
      $or: [
        // Detecta si hay superposición de fechas entre reservas
        {
          fechaEntrada: { $lt: fechaSalida },
          fechaSalida: { $gt: fechaEntrada },
        },
      ],
    });

    // Si es una edición, excluir la reserva actual
    if (req.params?.id) {
      const reservasConflicto = reservasSuperpuestas.filter(
        (reserva) => reserva._id.toString() !== req.params.id,
      );

      if (reservasConflicto.length > 0) {
        const primeraReserva = reservasConflicto[0];
        throw new Error(
          `La habitación ya está reservada del ${primeraReserva.fechaEntrada.toLocaleDateString()} al ${primeraReserva.fechaSalida.toLocaleDateString()}`,
        );
      }
    } else if (reservasSuperpuestas.length > 0) {
      const primeraReserva = reservasSuperpuestas[0];
      throw new Error(
        `La habitación ya está reservada del ${primeraReserva.fechaEntrada.toLocaleDateString()} al ${primeraReserva.fechaSalida.toLocaleDateString()}`,
      );
    }

    return true;
  }),

  (req, res, next) => resultadoValidacion(req, res, next),
];

export default validacionesReserva;
