document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("loginForm");
    const emailInput = document.getElementById("email");
    const passwordInput = document.getElementById("password");

    form.addEventListener("submit", function (event) {
        event.preventDefault(); 

        const email = emailInput.value.trim();
        const password = passwordInput.value.trim();

        if (email === "rafael.negrao.souza@gmail.com" && password === "123") {
            const token = Math.random().toString(36).substring(2) + Date.now().toString(36);

            sessionStorage.setItem("authToken", token);
            console.log("Login bem-sucedido! Token gerado:", token);

            window.location.href = "/src/index.html"; 
        } else {
            alert("E-mail ou senha incorretos.");
        }
    });
});
