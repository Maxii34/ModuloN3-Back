import Reserva from "../models/reservas.js";
import mongoose from "mongoose";


export const crearReserva = async (req, res) => {
  try {
    console.log("REQ.USUARIO:", req.usuario);

    const { habitacion, cantidadHuespedes } = req.body;

    if (!habitacion || !req.body.fechaEntrada || !req.body.fechaSalida || !cantidadHuespedes) {
      return res.status(400).json({ mensaje: "Faltan datos obligatorios" });
    }

    // Normalizar fechas a UTC
    const fechaEntrada = new Date(req.body.fechaEntrada);
    fechaEntrada.setUTCHours(0, 0, 0, 0);

    const fechaSalida = new Date(req.body.fechaSalida);
    fechaSalida.setUTCHours(0, 0, 0, 0);

    const nuevaReserva = new Reserva({
      usuario: new mongoose.Types.ObjectId(req.usuario),
      habitacion,
      fechaEntrada,
      fechaSalida,
      cantidadHuespedes,
    });

    await nuevaReserva.save();

    res.status(201).json({
      mensaje: "Reserva creada correctamente",
      reserva: nuevaReserva,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: "Error al crear la reserva" });
  }
};


export const obtenerMisReservas = async (req, res) => {
  try {
    const reservas = await Reserva.find({
      usuario: new mongoose.Types.ObjectId(req.usuario),
    })
      .populate("habitacion")
      .sort({ createdAt: -1 });

    res.status(200).json(reservas);
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: "Error al obtener las reservas" });
  }
};