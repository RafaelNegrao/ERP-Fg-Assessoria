document.addEventListener("DOMContentLoaded", function () {
    const token = sessionStorage.getItem("authToken");

    if (!token) {
        window.location.href = "/src/login.html"; 
    } else {
        document.body.style.display = "block"; 
    }
});
