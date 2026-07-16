fetch("components/footer/componentFooter.html")
.then(response => response.text())
.then(data => {
    document.getElementById("footerInjection").innerHTML = data;
});