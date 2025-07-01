
document.addEventListener("DOMContentLoaded", () => {
  const periodoSelect = document.getElementById("periodoSelect");
  const perspectivaSelect = document.getElementById("perspectivaSelect");
  const sucursalSelect = document.getElementById("sucursalSelect");
  const oficialSelect = document.getElementById("oficialSelect");
  const cardsContainer = document.getElementById("cardsContainer");
  const tablaIndicadores = document.getElementById("tablaIndicadores");
  const tablaCasaMatriz = document.getElementById("tablaCasaMatriz");

  let datos = [];
  let oficialesPorSucursal = {};

  fetch("datos.csv")
    .then(response => response.text())
    .then(csv => {
      datos = csv.split("\n").slice(1).map(linea => {
        const [periodo, perspectiva, sucursal, oficial, indicador, valor] = linea.split(",");
        if (!oficialesPorSucursal[sucursal]) oficialesPorSucursal[sucursal] = new Set();
        oficialesPorSucursal[sucursal].add(oficial);
        return { periodo, perspectiva, sucursal, oficial, indicador, valor: parseFloat(valor) };
      });

      cargarFiltros();
      aplicarFiltros();
    });

  function cargarFiltros() {
    const periodos = [...new Set(datos.map(d => d.periodo))];
    const perspectivas = [...new Set(datos.map(d => d.perspectiva))];
    const sucursales = [...new Set(datos.map(d => d.sucursal))];

    periodoSelect.innerHTML = "<option value=''>Todos</option>" + periodos.map(p => `<option>${p}</option>`).join("");
    perspectivaSelect.innerHTML = "<option value=''>Todas</option>" + perspectivas.map(p => `<option>${p}</option>`).join("");
    sucursalSelect.innerHTML = "<option value=''>Todas</option>" + sucursales.map(s => `<option>${s}</option>`).join("");
    oficialSelect.innerHTML = "<option value=''>Todos</option>";
  }

  sucursalSelect.addEventListener("change", () => {
    const sucursal = sucursalSelect.value;
    oficialSelect.innerHTML = "<option value=''>Todos</option>";
    if (sucursal && oficialesPorSucursal[sucursal]) {
      oficialesPorSucursal[sucursal].forEach(oficial => {
        oficialSelect.innerHTML += `<option>${oficial}</option>`;
      });
    }
    aplicarFiltros();
  });

  [periodoSelect, perspectivaSelect, oficialSelect].forEach(select =>
    select.addEventListener("change", aplicarFiltros)
  );

  function aplicarFiltros() {
    const periodo = periodoSelect.value;
    const perspectiva = perspectivaSelect.value;
    const sucursal = sucursalSelect.value;
    const oficial = oficialSelect.value;

    const filtrados = datos.filter(d =>
      (!periodo || d.periodo === periodo) &&
      (!perspectiva || d.perspectiva === perspectiva) &&
      (!sucursal || d.sucursal === sucursal) &&
      (!oficial || d.oficial === oficial)
    );

    mostrarCards(filtrados);
    mostrarTabla(filtrados);
  }

  function mostrarCards(filtrados) {
    cardsContainer.innerHTML = "";
    const resumen = {};
    filtrados.forEach(d => {
      const clave = d.perspectiva + " - " + d.indicador;
      resumen[clave] = (resumen[clave] || 0) + d.valor;
    });

    Object.entries(resumen).forEach(([clave, valor]) => {
      const card = document.createElement("div");
      card.className = "card";
      card.innerHTML = `<strong>${clave}</strong><br/>${valor.toFixed(2)}`;
      cardsContainer.appendChild(card);
    });
  }

  function mostrarTabla(filtrados) {
    const agrupado = {};
    filtrados.forEach(d => {
      if (!agrupado[d.perspectiva]) agrupado[d.perspectiva] = [];
      agrupado[d.perspectiva].push(d);
    });

    tablaIndicadores.innerHTML = "";
    Object.keys(agrupado).forEach(perspectiva => {
      const grupo = agrupado[perspectiva];
      let html = `<h3>${perspectiva}</h3><table><tr><th>Sucursal</th><th>Oficial</th><th>Indicador</th><th>Valor</th></tr>`;
      grupo.forEach(d => {
        html += `<tr><td>${d.sucursal}</td><td>${d.oficial}</td><td>${d.indicador}</td><td>${d.valor}</td></tr>`;
      });
      html += "</table>";
      tablaIndicadores.innerHTML += html;
    });
  }
});
