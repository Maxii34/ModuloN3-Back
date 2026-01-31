import Habitacion from "../models/habitaciones.js";
import Reserva from "../models/reservas.js";

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

    // CASO 1: Sin fechas - Devolver TODAS con sus reservas pobladas
    if (!fechaEntrada || !fechaSalida) {
      const habitaciones = await Habitacion.find().populate({
        path: "reservas",
        match: { estado: "activa" },
        select: "fechaEntrada fechaSalida cantidadHuespedes estado usuario",
      });

      return res.status(200).json(habitaciones);
    }

    // CASO 2: Con fechas - Filtrar disponibles

    // Normalizar fechas a UTC
    const entrada = new Date(fechaEntrada);
    const salida = new Date(fechaSalida);
    entrada.setUTCHours(0, 0, 0, 0);
    salida.setUTCHours(0, 0, 0, 0);

    // Validación de fechas
    if (entrada >= salida) {
      return res.status(400).json({
        mensaje: "La fecha de entrada debe ser anterior a la fecha de salida",
      });
    }

    if (entrada < new Date()) {
      return res.status(400).json({
        mensaje: "La fecha de entrada no puede ser en el pasado",
      });
    }

    // Obtener todas las habitaciones con sus reservas pobladas
    const todasHabitaciones = await Habitacion.find().populate({
      path: "reservas",
      match: { estado: "activa" }, 
      select: "fechaEntrada fechaSalida estado",
    });

    // Filtrar habitaciones disponibles
    const habitacionesDisponibles = todasHabitaciones.filter((habitacion) => {
      // Si no tiene reservas, está disponible
      if (!habitacion.reservas || habitacion.reservas.length === 0) {
        return true;
      }

      // Verificar si alguna reserva se superpone con las fechas solicitadas
      const hayConflicto = habitacion.reservas.some((reserva) => {
        const reservaEntrada = new Date(reserva.fechaEntrada);
        const reservaSalida = new Date(reserva.fechaSalida);

        // Normalizar fechas de reserva
        reservaEntrada.setUTCHours(0, 0, 0, 0);
        reservaSalida.setUTCHours(0, 0, 0, 0);

        // Hay conflicto si las fechas se superponen
        return (
          (entrada >= reservaEntrada && entrada < reservaSalida) ||
          (salida > reservaEntrada && salida <= reservaSalida) ||
          (entrada <= reservaEntrada && salida >= reservaSalida)
        );
      });

      // La habitación está disponible si NO hay conflicto
      return !hayConflicto;
    });

    res.status(200).json(habitacionesDisponibles);
  } catch (error) {
    console.error("Error al listar habitaciones:", error);
    res.status(500).json({
      mensaje: "Ocurrió un error al listar las habitaciones",
      error: error.message,
    });
  }
};

export const editarHabitacionID = async (req, res) => {
  try {
    console.log(req.params.id);
    const editarhabitacion = await Habitacion.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true },
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
    const habitacionObtenida = await Habitacion.findByIdAndDelete(
      req.params.id,
    );
    if (!habitacionObtenida) {
      return res.status(404).json({ mensaje: "Habitacion no encontrada" });
    }
    res.status(200).json({ mensaje: "Habitación eliminada correctamente" });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ mensaje: "Ocurrio un error al eliminar la habitacion" });
  }
};
