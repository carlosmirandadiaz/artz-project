import os
from dotenv import load_dotenv
from flask import Flask, request, render_template, jsonify, redirect, url_for
from flask_pymongo import PyMongo
from pymongo import ReturnDocument

# Carga las variables de entorno desde el archivo .env
load_dotenv()

app = Flask(__name__)

# Configura la conexión a MongoDB usando la variable de entorno.
# La URI debe incluir el nombre de la base de datos (por ejemplo, "Artz")
app.config["MONGO_URI"] = os.getenv("MONGO_URI")
mongo = PyMongo(app)

# Colecciones
workers_col = mongo.db.workers
requests_col = mongo.db.requests
counters_col = mongo.db.counters  # Para llevar el contador de folios

# Variable global para el folio activo (se asigna al agregar el primer worker)
CURRENT_FOLIO = None

def get_next_folio():
    """
    Incrementa de forma atómica el contador de folios en la colección 'counters'
    y devuelve un folio con el formato "NOV2406-XXXX" (donde XXXX es un número secuencial con ceros a la izquierda).
    Se utiliza solo $inc para evitar conflictos.
    """
    counter = counters_col.find_one_and_update(
        {"_id": "folio"},
        {"$inc": {"seq": 1}},
        upsert=True,
        return_document=ReturnDocument.AFTER
    )
    folio_number = counter["seq"]
    folio_suffix = str(folio_number).zfill(4)
    prefix = "NOV2406"
    return f"{prefix}-{folio_suffix}"

@app.route("/")
def index():
    global CURRENT_FOLIO
    # Si CURRENT_FOLIO es None, se intenta leer el contador actual sin modificarlo.
    if CURRENT_FOLIO is None:
        counter = counters_col.find_one({"_id": "folio"})
        if counter and "seq" in counter:
            # Si el contador existe, se muestra su valor actual (por ejemplo, si seq=1, muestra NOV2406-0001)
            folio = f"NOV2406-{str(counter['seq']).zfill(4)}"
        else:
            folio = "NOV2406-0001"
    else:
        folio = CURRENT_FOLIO
    return render_template("index.html", folio=folio)

@app.route("/add_worker", methods=["POST"])
def add_worker():
    global CURRENT_FOLIO
    data = request.get_json()
    if not data:
        return jsonify({"error": "No data received"}), 400

    # Si aún no hay un folio activo, se genera uno nuevo (esto incrementa el contador)
    if CURRENT_FOLIO is None:
        CURRENT_FOLIO = get_next_folio()

    # Se almacenan en la colección workers tanto los datos generales de la solicitud como los específicos del trabajador.
    worker = {
        "request_date": data.get("requestDate", ""),
        "start_date": data.get("startDate", ""),
        "start_time": data.get("startTime", ""),
        "end_date": data.get("endDate", ""),
        "end_time": data.get("endTime", ""),
        "brand": data.get("brand", ""),
        "work_period": data.get("workPeriod", ""),
        "work_category": data.get("workCategory", ""),
        "folio": CURRENT_FOLIO,
        "fullName": data.get("fullName", ""),
        "managerName": data.get("managerName", ""),
        "workerId": data.get("workerId", ""),
        "workerMail": data.get("workerMail", ""),
        "workerPhone": data.get("workerPhone", "")
    }
    workers_col.insert_one(worker)
    return jsonify({"status": "ok", "msg": "Worker added", "folio": CURRENT_FOLIO}), 200

@app.route("/get_workers", methods=["GET"])
def get_workers():
    if CURRENT_FOLIO is None:
        return jsonify([]), 200
    all_workers = list(workers_col.find({"folio": CURRENT_FOLIO}))
    for w in all_workers:
        w["_id"] = str(w["_id"])
    return jsonify(all_workers), 200

@app.route("/send_request", methods=["POST"])
def send_request():
    global CURRENT_FOLIO

    # Campos de la solicitud (recibidos desde el formulario)
    work_description = request.form.get("workDescription")
    supplier = request.form.get("supplier")
    rfc = request.form.get("rfc")
    
    # Se obtiene la lista de _id de los trabajadores asociados al folio activo
    workers_list = list(workers_col.find({"folio": CURRENT_FOLIO}))
    worker_ids = [str(w["_id"]) for w in workers_list]

    solicitud = {
        "work_description": work_description,
        "supplier": supplier,
        "rfc": rfc,
        "workers": worker_ids,
        "folio": CURRENT_FOLIO
    }
    requests_col.insert_one(solicitud)

    # Se resetea CURRENT_FOLIO para iniciar un nuevo grupo en la siguiente solicitud.
    CURRENT_FOLIO = None

    return redirect(url_for("index"))

if __name__ == "__main__":
    app.run(debug=True)
