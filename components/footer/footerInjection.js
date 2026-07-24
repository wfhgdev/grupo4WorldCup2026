/**
 * Inyecta el pie de página (footer) en el elemento con id "footerInjection"
 * mediante una petición fetch al archivo componentFooter.html.
 * Incluye manejo básico de errores.
 */
fetch("/components/footer/componentFooter.html")
  .then((response) => response.text())
  .then((data) => {
    document.getElementById("footerInjection").innerHTML = data;
  })
  .catch((error) => {
    console.error("Error al cargar el pie de página:", error);
  });