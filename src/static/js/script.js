(function () {
  const dropzone = document.getElementById("dropzone");
  const dzContent = document.getElementById("dropzoneContent");
  const dzFilename = document.getElementById("dzFilename");
  const fileInput = document.getElementById("fileInput");

  const rateSlider = document.getElementById("rateSlider");
  const rateValue = document.getElementById("rateValue");
  const kValue = document.getElementById("kValue");
  const spectrum = document.getElementById("spectrum");

  const compressBtn = document.getElementById("compressBtn");
  const btnLabel = document.getElementById("btnLabel");
  const btnSpinner = document.getElementById("btnSpinner");
  const errorMsg = document.getElementById("errorMsg");

  const beforeFrame = document.getElementById("beforeFrame");
  const afterFrame = document.getElementById("afterFrame");
  const downloadBtn = document.getElementById("downloadBtn");
  const statsRow = document.getElementById("statsRow");
  const statDiff = document.getElementById("statDiff");
  const statTime = document.getElementById("statTime");

  let selectedFile = null;

  dropzone.addEventListener("click", () => fileInput.click());
  dropzone.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") fileInput.click();
  });

  ["dragenter", "dragover"].forEach((evt) =>
    dropzone.addEventListener(evt, (e) => {
      e.preventDefault();
      dropzone.classList.add("dragover");
    })
  );
  ["dragleave", "drop"].forEach((evt) =>
    dropzone.addEventListener(evt, (e) => {
      e.preventDefault();
      dropzone.classList.remove("dragover");
    })
  );
  dropzone.addEventListener("drop", (e) => {
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  });
  fileInput.addEventListener("change", () => {
    if (fileInput.files[0]) handleFile(fileInput.files[0]);
  });

  function handleFile(file) {
    if (!file.type.match(/image\/(png|jpeg)/)) {
      showError("File harus berupa PNG atau JPG.");
      return;
    }
    hideError();
    selectedFile = file;
    dzFilename.textContent = file.name;
    dzFilename.hidden = false;
    dzContent.hidden = true;

    const url = URL.createObjectURL(file);
    beforeFrame.innerHTML = `<img src="${url}" alt="Gambar sebelum kompresi">`;

    afterFrame.innerHTML = `<span class="placeholder-text">Hasil kompresi akan muncul di sini</span>`;
    downloadBtn.hidden = true;
    statsRow.hidden = true;
  }

  const MAX_BARS = 24;

  function drawSpectrum(rate) {
    const persenDipertahankan = (100 - rate) / 100;
    const kBars = Math.max(1, Math.round(MAX_BARS * persenDipertahankan));
    kValue.textContent = `k \u2248 ${kBars}`;

    const barWidth = 300 / MAX_BARS;
    let svgContent = "";
    for (let i = 0; i < MAX_BARS; i++) {
      const height = 62 * Math.exp(-i / 6) + 3;
      const x = i * barWidth + 1;
      const y = 66 - height;
      const active = i < kBars;
      const fill = active ? "var(--accent-pink)" : "var(--accent-pink-light)";
      svgContent += `<rect x="${x.toFixed(2)}" y="${y.toFixed(2)}" width="${(barWidth - 2).toFixed(2)}" height="${height.toFixed(2)}" fill="${fill}" rx="1"></rect>`;
    }
    spectrum.innerHTML = svgContent;
  }

  rateSlider.addEventListener("input", () => {
    rateValue.textContent = rateSlider.value;
    drawSpectrum(Number(rateSlider.value));
  });
  drawSpectrum(Number(rateSlider.value));

  compressBtn.addEventListener("click", async () => {
    if (!selectedFile) {
      showError("Silakan pilih file gambar terlebih dahulu.");
      return;
    }
    hideError();
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("image", selectedFile);
      formData.append("rate", rateSlider.value);

      const res = await fetch("/compress", { method: "POST", body: formData });
      const data = await res.json();

      if (!res.ok) {
        showError(data.error || "Terjadi kesalahan saat memproses gambar.");
        return;
      }

      afterFrame.innerHTML = `<img src="${data.image}" alt="Gambar hasil kompresi">`;
      downloadBtn.href = data.image;
      downloadBtn.hidden = false;

      statDiff.textContent = `${data.persen_beda} %`;
      statTime.textContent = `${data.runtime} s`;
      statsRow.hidden = false;
    } catch (err) {
      showError("Tidak bisa terhubung ke server. Pastikan Flask sedang berjalan.");
    } finally {
      setLoading(false);
    }
  });

  function setLoading(isLoading) {
    compressBtn.disabled = isLoading;
    btnSpinner.hidden = !isLoading;
    btnLabel.textContent = isLoading ? "Memproses..." : "Compress Image";
  }

  function showError(msg) {
    errorMsg.textContent = msg;
    errorMsg.hidden = false;
  }
  function hideError() {
    errorMsg.hidden = true;
  }
})();
