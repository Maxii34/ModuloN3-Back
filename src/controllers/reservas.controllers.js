import Habitacion from "../models/habitaciones.js";
import Reserva from "../models/reservas.js";
import Usuario from "../models/usuarios.js";
import mongoose from "mongoose";

export const crearReserva = async (req, res) => {
  try {
    const {
      usuario,
      habitacion,
      fechaEntrada,
      fechaSalida,
      cantidadHuespedes,
    } = req.body;

    // Verificar que la habitación existe
    const verificarHabitacion = await Habitacion.findById(habitacion);
    if (!verificarHabitacion) {
      return res.status(404).json({ error: "Habitación no encontrada" });
    }

    // Verificar capacidad de la habitacion
    if (cantidadHuespedes > verificarHabitacion.capacidad) {
      return res.status(400).json({
        error: `La habitación solo tiene capacidad para ${habitacion.capacidad} personas`,
      });
    }

    // Verificar que no haya conflictos con otras reservas
    const reservasExistentes = await Reserva.find({
      habitacion: habitacion,
      estado: { $in: ["activa", "confirmada"] },
      $or: [
        {
          fechaEntrada: { $lte: new Date(fechaEntrada) },
          fechaSalida: { $gt: new Date(fechaEntrada) },
        },
        {
          fechaEntrada: { $lt: new Date(fechaSalida) },
          fechaSalida: { $gte: new Date(fechaSalida) },
        },
        {
          fechaEntrada: { $gte: new Date(fechaEntrada) },
          fechaSalida: { $lte: new Date(fechaSalida) },
        },
      ],
    });
    //Si la habitación no está disponible en las fechas indicadas
    if (reservasExistentes.length > 0) {
      return res.status(409).json({
        error: "La habitación no está disponible en esas fechas",
      });
    }

    //Crear la reserva
    const nuevaReserva = new Reserva({
      usuario: usuario,
      habitacion: habitacion,
      fechaEntrada: new Date(fechaEntrada),
      fechaSalida: new Date(fechaSalida),
      cantidadHuespedes: cantidadHuespedes,
      estado: "activa",
    });

    await nuevaReserva.save();

    //Agregar la reserva al array de la habitaciónes
    await Habitacion.findByIdAndUpdate(habitacion, {
      $push: { reservas: nuevaReserva._id },
    });
    //Agregar la reserva al array de usuarios
    await Usuario.findByIdAndUpdate(usuario, {
      $push: { reservas: nuevaReserva._id },
    });

    res.status(201).json({
      mensaje: "Reserva creada exitosamente",
      reserva: nuevaReserva,
    });
  } catch (error) {
    console.error("Error al crear reserva:", error);
    res.status(500).json({ error: error.message });
  }
};

export const obtenerMisReservas = async (req, res) => {
  try {
    const reservas = await Reserva.find({
      usuario: new mongoose.Types.ObjectId(req.usuario),
      estado: "activa"
    })
      .populate("habitacion")
      .sort({ createdAt: -1 });

    res.status(200).json(reservas);
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: "Error al obtener las reservas" });
  }
};

export const cancelarReserva = async (req, res) => {
  try {
    const { id } = req.params;
    const buscarReserva = await Reserva.findById(id);

    if (!buscarReserva) {
      return res.status(404).json({ mensaje: "Reserva no encontrada" });
    }
    // Actualizar el estado de la reserva a "cancelada"
    await Reserva.findByIdAndUpdate(id, { estado: "cancelada" });

    // Eliminar la reserva del array de reservas del usuario
    await Usuario.findByIdAndUpdate(buscarReserva.usuario, {
      $pull: { reservas: buscarReserva._id },
    });

    res.status(200).json({ mensaje: "Reserva cancelada exitosamente" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: "Error al cancelar la reserva" });
  }
};
