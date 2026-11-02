// Decoraciones de Halloween. Solo se activan con temporada: "halloween" en config.js.
(() => {
  if (window.MAFER.temporada !== "halloween") return;
  document.documentElement.classList.add("t-halloween");

  // Telaraña para una esquina: rayos desde la esquina y anillos que se curvan hacia adentro
  function telarana(clase) {
    const W = 170, R = 160, rayos = [90, 105, 120, 135, 150, 165, 180];
    const p = (r, a) => [W + r * Math.cos((a * Math.PI) / 180), r * Math.sin((a * Math.PI) / 180)].map((n) => n.toFixed(1));
    let d = rayos.map((a) => `M${W},0 L${p(R, a)}`).join(" ");
    for (let r = 28; r <= R; r += 26)
      for (let i = 0; i < rayos.length - 1; i++) {
        const [x1, y1] = p(r, rayos[i]), [x2, y2] = p(r, rayos[i + 1]), [cx, cy] = p(r * 0.86, (rayos[i] + rayos[i + 1]) / 2);
        d += ` M${x1},${y1} Q${cx},${cy} ${x2},${y2}`;
      }
    return `<svg class="${clase}" viewBox="0 0 ${W} ${W}" aria-hidden="true"><path d="${d}"/></svg>`;
  }

  document.querySelector("main").insertAdjacentHTML("afterbegin", `
    <div class="hw-banner">🎃 <b>Temporada de Halloween en El Mafer</b> · ¡Pollos de miedo, sabor de muerte! 👻</div>`);

  document.querySelector(".hero").insertAdjacentHTML("beforeend", `
    <div class="hw-deco" aria-hidden="true">
      ${telarana("hw-web")}
      <div class="hw-spider"><span>🕷️</span></div>
      <span class="hw-bat b1">🦇</span>
      <span class="hw-bat b2">🦇</span>
      <span class="hw-bat b3">🦇</span>
    </div>`);

  document.querySelector(".footer").insertAdjacentHTML("afterbegin", `
    <div class="hw-calabazas" aria-hidden="true"><span>🎃</span><span>🕯️</span><span>💀</span><span>🕯️</span><span>🎃</span></div>`);
})();
