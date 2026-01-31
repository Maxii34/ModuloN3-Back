import Habitacion from "../models/habitaciones.js";

export const crearHabitacion = async (req, res) => {
  try {
    const habitacionNueva = new Habitacion(req.body);
    await habitacionNueva.save();
    res.status(201).json({ mensaje: "Habitacion creada con exito" });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ mensaje: "Ocurrio un error al crear la habitacion" });
  }
};

export const listarHabitaciones = async (req, res) => {
  try {
    const { fechaEntrada, fechaSalida } = req.query;

    // Si no hay fechas, devolver todas
    if (!fechaEntrada || !fechaSalida) {
      const habitaciones = await Habitacion.find();
      return res.status(200).json(habitaciones);
    }

    // Normalizar fechas a UTC
    const entrada = new Date(fechaEntrada);
    const salida = new Date(fechaSalida);
    entrada.setUTCHours(0, 0, 0, 0);
    salida.setUTCHours(0, 0, 0, 0);

    // Importar Reserva
    const Reserva = (await import("../models/reservas.js")).default;

    // Obtener todas las habitaciones
    const todasHabitaciones = await Habitacion.find();

    // Filtrar las disponibles
    const habitacionesDisponibles = [];
    for (const habitacion of todasHabitaciones) {
      const reservasSuperpuestas = await Reserva.find({
        habitacion: habitacion._id,
        estado: { $in: ["activa", "confirmada"] },
        fechaEntrada: { $lt: salida },
        fechaSalida: { $gt: entrada }
      });

      if (reservasSuperpuestas.length === 0) {
        habitacionesDisponibles.push(habitacion);
      }
    }

    res.status(200).json(habitacionesDisponibles);
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: "Ocurrió un error al listar las habitaciones" });
  }
};

export const editarHabitacionID = async (req, res) => {
  try {
    console.log(req.params.id);
    const editarhabitacion = await Habitacion.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!editarhabitacion) {
      return res.status(404).json({ mensaje: "Habitacion no encontrada" });
    }
    res.status(200).json({ mensaje: "Habitacion editada con exito" });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ mensaje: "Ocurrio un error al editar la habitacion" });
  }
};

export const obtenerHabitacionID = async (req, res) => {
try {
  console.log(req.params.id);
  const habitacionObtenida = await Habitacion.findById(req.params.id);
  if (!habitacionObtenida) {
    return res.status(404).json({ mensaje: "Habitacion no encontrada" });
  }
  res.status(200).json(habitacionObtenida);
} catch (error) {
  console.error(error);
  res
    .status(500)
    .json({ mensaje: "Ocurrio un error al obtener la habitacion" });
}
};

export const borrarHabitacion = async (req, res) => {
try {
  console.log(req.params.id);
  const habitacionObtenida = await Habitacion.findByIdAndDelete(req.params.id);
  if (!habitacionObtenida) {
    return res.status(404).json({ mensaje: "Habitacion no encontrada" });
  }
  res.status(200).json({mensaje:"Habitación eliminada correctamente"})
} catch (error) {
  console.error(error);
  res
    .status(500)
    .json({ mensaje: "Ocurrio un error al eliminar la habitacion" });
}
};