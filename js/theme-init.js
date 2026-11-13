"use strict";

/* Aplica o tema antes da primeira pintura para evitar o flash do tema claro. */
(function () {
    var theme = "light";

    try {
        var saved = localStorage.getItem("solutech-theme");
        if (saved === "dark" || saved === "light") {
            theme = saved;
        } else if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
            theme = "dark";
        }
    } catch (error) {
        theme = "light";
    }

    var root = document.documentElement;
    root.dataset.theme = theme;
    root.style.colorScheme = theme;

    var themeColor = document.querySelector('meta[name="theme-color"]');
    if (themeColor) {
        themeColor.setAttribute("content", theme === "dark" ? "#05070b" : "#08111f");
    }
})();
