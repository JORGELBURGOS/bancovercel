document.addEventListener('DOMContentLoaded', function () {
  let data = [];
  let filtros = {
    periodo: '',
    perspectiva: '',
    sucursal: '',
    oficial: ''
  };

  async function cargarDatos() {
    try {
      const response = await fetch('simulacion_kpis_banco_ejemplo.csv');
      const text = await response.text();
      const rows = text.split('\n').slice(1);
      data = rows
        .map(row => row.trim())
        .filter(row => row && row.split(',').length === 7)
        .map(row => {
          const [Mes, Unidad, Sucursal, Perspectiva, Indicador, Valor, UnidadMedida] = row.split(',');
          return { Mes, Unidad, Sucursal, Perspectiva, Indicador, Valor: parseFloat(Valor), UnidadMedida };
        });

      inicializarFiltros();
      aplicarFiltros();
    } catch (error) {
      console.error("Error al cargar datos:", error);
    }
  }

  function inicializarFiltros() {
    const periodos = [...new Set(data.map(d => d.Mes))].sort();
    const sucursales = [...new Set(data.map(d => d.Sucursal))].filter(s => s !== "Casa Matriz").sort();
    const oficiales = [...new Set(data.map(d => d.Unidad))].filter(u => u !== "Procesamiento Comercial").sort();
    const perspectivas = [...new Set(data.map(d => d.Perspectiva))].sort();

    const filtroPeriodo = document.getElementById('filtroPeriodo');
    const filtroSucursal = document.getElementById('filtroSucursal');
    const filtroOficial = document.getElementById('filtroOficial');
    const filtroPerspectiva = document.getElementById('filtroPerspectiva');

    if (!filtroPeriodo || !filtroSucursal || !filtroOficial || !filtroPerspectiva) return;

    filtroPeriodo.innerHTML = '<option value="">Todos</option>';
    filtroSucursal.innerHTML = '<option value="">Todas</option>';
    filtroOficial.innerHTML = '<option value="">Todos</option>';
    filtroPerspectiva.innerHTML = '<option value="">Todas</option>';

    periodos.forEach(p => filtroPeriodo.innerHTML += `<option value="${p}">${p}</option>`);
    sucursales.forEach(s => filtroSucursal.innerHTML += `<option value="${s}">${s}</option>`);
    oficiales.forEach(o => filtroOficial.innerHTML += `<option value="${o}">${o}</option>`);
    perspectivas.forEach(p => filtroPerspectiva.innerHTML += `<option value="${p}">${p}</option>`);

    filtroPeriodo.addEventListener('change', e => { filtros.periodo = e.target.value; aplicarFiltros(); });
    filtroSucursal.addEventListener('change', e => { filtros.sucursal = e.target.value; aplicarFiltros(); });
    filtroOficial.addEventListener('change', e => { filtros.oficial = e.target.value; aplicarFiltros(); });
    filtroPerspectiva.addEventListener('change', e => { filtros.perspectiva = e.target.value; aplicarFiltros(); });
  }

  function aplicarFiltros() {
    const resultados = data.filter(d =>
      (!filtros.periodo || d.Mes === filtros.periodo) &&
      (!filtros.sucursal || d.Sucursal === filtros.sucursal) &&
      (!filtros.oficial || d.Unidad === filtros.oficial) &&
      (!filtros.perspectiva || d.Perspectiva === filtros.perspectiva)
    );

    const contenedor = document.getElementById('resultadoIndicadores');
    if (!contenedor) return;

    contenedor.innerHTML = '';
    resultados.forEach(d => {
      const color = d.Valor >= 85 ? 'green' : d.Valor >= 70 ? 'orange' : 'red';
      contenedor.innerHTML += `
        <div class="indicador-card" style="border-left: 5px solid ${color}; padding: 8px; margin: 4px 0;">
          <strong>${d.Indicador}</strong> (${d.Perspectiva})<br/>
          ${d.Valor} ${d.UnidadMedida} – ${d.Unidad}, ${d.Sucursal}, ${d.Mes}
        </div>`;
    });
  }

  cargarDatos();
});