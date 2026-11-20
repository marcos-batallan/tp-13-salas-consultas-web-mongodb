const mongoose = require("mongoose");
const { Reserva } = require("../modelos/reserva");

function representarReserva(documento) {
  return {
    id: documento._id.toString(),
    estudiante: documento.estudiante,
    email: documento.email,
    sala: documento.sala,
    fecha: documento.fecha,
    turno: documento.turno,
    personas: documento.personas,
    estado: documento.estado,
  };
}

function comprobarId(id) {
  if (!mongoose.isObjectIdOrHexString(id)) {
    const error = new Error("Identificador inválido");
    error.codigo = "ID_INVALIDO";
    throw error;
  }
}

function escaparTexto(texto) {
  const especiales = "\\^$.*+?()[]{}|";
  let literal = "";

  for (const caracter of texto) {
    if (especiales.includes(caracter)) {
      literal += "\\";
    }

    literal += caracter;
  }
  return literal;
}

function crearServicioReservasMongo({
  salasPermitidas = [],
  turnosPermitidos = [],
} = {}) {
  async function listar() {
    const documentos = await Reserva.find().lean();
    return documentos.map(representarReserva);
  }

  async function consultar(sala, orden = "estudiante", pagina = 1, limite = 2) {
    const filtro = {};

    if (sala !== undefined) {
      filtro.sala = sala.trim();
    }

    const ordenamientos = {
      estudiante: { estudiante: 1, _id: 1 },
      "personas-asc": { personas: 1, _id: 1 },
      "personas-desc": { personas: -1, _id: 1 },
    };

    const salto = (pagina - 1) * limite;

    const total = await Reserva.countDocuments(filtro);

    const documentos = await Reserva.find(filtro)
      .select("estudiante email sala fecha turno personas estado")
      .sort(ordenamientos[orden])
      .skip(salto)
      .limit(limite)
      .lean();

    const datos = documentos.map(representarReserva);

    return {
      datos,
      pagina,
      limite,
      total,
      paginas: Math.ceil(total / limite),
    };
  }

  async function buscar(criterios) {
    const filtro = {};

    if (criterios.q !== "") {
      filtro.estudiante = {
        $regex: escaparTexto(criterios.q),
        $options: "i",
      };
    }

    if (criterios.sala !== "") {
      filtro.sala = criterios.sala;
    }

    let ordenMongo = { estudiante: 1, _id: 1 };

    if (criterios.orden === "personas-asc") {
      ordenMongo = { personas: 1, _id: 1 };
    }

    if (criterios.orden === "personas-desc") {
      ordenMongo = { personas: -1, _id: 1 };
    }

    const total = await Reserva.countDocuments(filtro);

    const salto = (criterios.pagina - 1) * criterios.limite;

    const documentos = await Reserva.find(filtro)
      .select("estudiante email sala fecha turno personas estado")
      .sort(ordenMongo)
      .skip(salto)
      .limit(criterios.limite)
      .lean();

    return {
      datos: documentos.map(representarReserva),
      pagina: criterios.pagina,
      limite: criterios.limite,
      total,
      paginas: Math.ceil(total / criterios.limite),
    };
  }

  async function obtenerPorId(id) {
    comprobarId(id);
    const documento = await Reserva.findById(id).lean();
    return documento ? representarReserva(documento) : null;
  }

  async function crear(datos) {
    const documento = await Reserva.create({
      estudiante: datos.estudiante,
      email: datos.email,
      sala: datos.sala,
      fecha: datos.fecha,
      turno: datos.turno,
      personas: datos.personas,
    });
    return representarReserva(documento);
  }

  async function contar() {
    return Reserva.countDocuments();
  }

  function obtenerOpciones() {
    return {
      salasPermitidas: [...salasPermitidas],
      turnosPermitidos: [...turnosPermitidos],
    };
  }

  async function reemplazar(id, datos) {
    comprobarId(id);
    const reemplazo = {
      estudiante: datos.estudiante,
      email: datos.email,
      sala: datos.sala,
      fecha: datos.fecha,
      turno: datos.turno,
      personas: datos.personas,
      estado: datos.estado,
    };
    const documento = await Reserva.findOneAndReplace({ _id: id }, reemplazo, {
      runValidators: true,
      returnDocument: "after",
      upsert: false,
    });
    return documento ? representarReserva(documento) : null;
  }

  async function actualizar(id, datos) {
    comprobarId(id);
    const cambios = {};
    for (const campo of ["personas", "estado"]) {
      if (Object.hasOwn(datos, campo)) cambios[campo] = datos[campo];
    }
    if (Object.keys(cambios).length === 0) {
      const error = new Error("Actualización vacía");
      error.codigo = "ENTRADA_INVALIDA";
      throw error;
    }
    const documento = await Reserva.findOneAndUpdate(
      { _id: id },
      { $set: cambios },
      { runValidators: true, returnDocument: "after", upsert: false },
    );
    return documento ? representarReserva(documento) : null;
  }

  async function eliminar(id) {
    comprobarId(id);
    const resultado = await Reserva.deleteOne({ _id: id });
    return resultado.deletedCount === 1;
  }

  return {
    listar,
    consultar,
    buscar,
    obtenerPorId,
    crear,
    contar,
    obtenerOpciones,
    reemplazar,
    actualizar,
    eliminar,
  };
}
module.exports = { crearServicioReservasMongo };
