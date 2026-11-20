function leerCriterios(query) {
  const permitidos = ["q", "sala", "orden", "pagina", "limite"];

  for (const campo of Object.keys(query)) {
    if (!permitidos.includes(campo)) {
      const error = new Error("Parámetro no permitido.");
      error.codigo = "ENTRADA_INVALIDA";
      throw error;
    }

    if (typeof query[campo] !== "string") {
      const error = new Error("Enviá un solo texto por parámetro.");
      error.codigo = "ENTRADA_INVALIDA";
      throw error;
    }
  }

  const q = (query.q ?? "").trim();
  const sala = (query.sala ?? "").trim();
  const orden = query.orden ?? "estudiante";

  if (q.length > 60 || sala.length > 80) {
    const error = new Error("Criterio demasiado largo.");
    error.codigo = "ENTRADA_INVALIDA";
    throw error;
  }

  if (!["estudiante", "personas-asc", "personas-desc"].includes(orden)) {
    const error = new Error("Orden no permitido.");
    error.codigo = "ENTRADA_INVALIDA";
    throw error;
  }

  let pagina = 1;
  if (query.pagina !== undefined) {
    pagina = Number(query.pagina);

    if (!Number.isInteger(pagina) || pagina < 1 || pagina > 1000) {
      const error = new Error("Página fuera de rango.");
      error.codigo = "ENTRADA_INVALIDA";
      throw error;
    }
  }

  let limite = 2;
  if (query.limite !== undefined) {
    limite = Number(query.limite);

    if (!Number.isInteger(limite) || limite < 1 || limite > 20) {
      const error = new Error("Límite fuera de rango.");
      error.codigo = "ENTRADA_INVALIDA";
      throw error;
    }
  }

  return { q, sala, orden, pagina, limite };
}

module.exports = { leerCriterios };
