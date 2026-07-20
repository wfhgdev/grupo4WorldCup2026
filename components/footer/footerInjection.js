fetch("../componentFooter.html")
.then(response => response.text())
.then(data => {
    document.getElementById("footerInjection").innerHTML = data;
});

// fetch("components/footer/componentFooter.html")