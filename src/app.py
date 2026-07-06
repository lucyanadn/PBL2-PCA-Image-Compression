import io
import time
import base64
import numpy as np
from PIL import Image
from flask import Flask, render_template, request, jsonify
from pca import kompresi_image

app = Flask(__name__)
app.config["MAX_CONTENT_LENGTH"] = 16 * 1024 * 1024 

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/compress", methods=["POST"])
def compress():
    file = request.files.get("image")
    rate_raw = request.form.get("rate")

    if file is None or file.filename == "":
        return jsonify({"error": "Belum ada file gambar yang dikirim."}), 400

    try:
        rate = float(rate_raw)
    except (TypeError, ValueError):
        return jsonify({"error": "Compression rate harus berupa angka."}), 400

    if not (0 <= rate <= 100):
        return jsonify({"error": "Compression rate harus di antara 0 dan 100."}), 400

    file_bytes = file.read()

    try:
        img_pil = Image.open(io.BytesIO(file_bytes)).convert("RGB")
    except Exception:
        return jsonify({"error": "File yang diunggah bukan gambar yang valid."}), 400

    img_rgb = np.array(img_pil)

    waktu_mulai = time.time()
    img_hasil_rgb = kompresi_image(img_rgb, rate)
    runtime = float(round(time.time() - waktu_mulai, 3))

    asli = img_rgb.astype(np.float32)
    kompresi = img_hasil_rgb.astype(np.float32)
    selisih_mutlak = np.abs(asli - kompresi)
    mean_error = np.mean(selisih_mutlak)
    persen_beda = float(round((mean_error / 255.0) * 100.0, 2))

    img_hasil = Image.fromarray(img_hasil_rgb, mode="RGB")
    buffer_hasil = io.BytesIO()
    img_hasil.save(buffer_hasil, format="PNG")
    hasil_base64 = base64.b64encode(buffer_hasil.getvalue()).decode("utf-8")

    return jsonify(
        {
            "image": f"data:image/png;base64,{hasil_base64}",
            "persen_beda": persen_beda,
            "runtime": runtime,
        }
    )

if __name__ == "__main__":
    app.run(debug=True)