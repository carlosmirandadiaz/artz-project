import os
from dotenv import load_dotenv
from flask import Flask, request, jsonify, render_template, redirect, url_for, send_from_directory, Response
from flask_pymongo import PyMongo
from pymongo import ReturnDocument
from werkzeug.utils import secure_filename
from functools import wraps

# Cargar variables de entorno
load_dotenv()

app = Flask(__name__)

# Configurar conexión a MongoDB
mongo_uri = os.getenv("MONGO_URI")
if not mongo_uri:
    app.logger.error("❌ MONGO_URI no está definida en las variables de entorno")
    raise Exception("La variable MONGO_URI es requerida")

app.config["MONGO_URI"] = mongo_uri
mongo = PyMongo(app)
db = mongo.db

# Colecciones
workers_col = db.workers
requests_col = db.requests
counters_col = db.counters
images_col = db.images

# Configuración de subida de imágenes
ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "gif"}
UPLOAD_FOLDER = "uploads"
app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER

# Crear la carpeta de uploads si no existe
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

# Variable global para el folio
CURRENT_FOLIO = None

def get_next_folio():
    """
    Incrementa el contador de folios en la colección 'counters'
    y devuelve un folio con el formato "NOV2406-XXXX".
    """
    try:
        counter = counters_col.find_one_and_update(
            {"_id": "folio"},
            {"$inc": {"seq": 1}},
            upsert=True,
            return_document=ReturnDocument.AFTER
        )
        if not counter:
            # Si no existe el doc "folio", crearlo con seq=1
            counters_col.insert_one({"_id": "folio", "seq": 1})
            counter = counters_col.find_one({"_id": "folio"})

        folio_number = counter["seq"]
        folio_suffix = str(folio_number).zfill(4)
        prefix = "NOV2406"
        folio = f"{prefix}-{folio_suffix}"
        app.logger.info(f"📄 Folio generado: {folio}")
        return folio
    except Exception as e:
        app.logger.error(f"❌ Error al generar el folio: {e}")
        return "NOV2406-0001"

# -----------------------------------------------------------------------------
# Autenticación básica para /admin
def check_auth(username, password):
    # Para pruebas: usuario "admin" y contraseña "password"
    return username == "admin" and password == "password"

def authenticate():
    return Response(
        'No se pudo verificar el acceso.\nIntroduce credenciales válidas.',
        401,
        {'WWW-Authenticate': 'Basic realm="Login Required"'}
    )

def requires_auth(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        auth = request.authorization
        if not auth or not check_auth(auth.username, auth.password):
            return authenticate()
        return f(*args, **kwargs)
    return decorated

# -----------------------------------------------------------------------------
# Rutas principales

@app.route("/")
def index():
    """
    Muestra la página principal con el folio actual.
    """
    try:
        last_folio_doc = counters_col.find_one({"_id": "folio"})
        if last_folio_doc:
            folio = f"NOV2406-{str(last_folio_doc['seq']).zfill(4)}"
        else:
            folio = "NOV2406-0001"

        app.logger.info(f"🏠 Página de inicio cargada con folio: {folio}")
        return render_template("index.html", folio=folio)
    except Exception as e:
        app.logger.error(f"❌ Error en la ruta /: {e}")
        return jsonify({"error": str(e)}), 500

@app.route("/add_worker", methods=["POST"])
def add_worker():
    """
    Recibe datos de un trabajador vía JSON (fetch POST).
    Los asocia al folio actual y los inserta en la colección 'workers'.
    """
    global CURRENT_FOLIO
    try:
        data = request.get_json()
        app.logger.info(f"📥 Datos recibidos en /add_worker: {data}")
        print("DATA RECIBIDA EN /add_worker:", data)  # Para debug en consola

        if not data:
            return jsonify({"error": "No data received"}), 400

        # Si no hay folio activo, generar uno nuevo y guardarlo como "last_folio"
        if CURRENT_FOLIO is None:
            CURRENT_FOLIO = get_next_folio()
            counters_col.update_one(
                {"_id": "last_folio"},
                {"$set": {"folio": CURRENT_FOLIO}},
                upsert=True
            )

        # Insertar el trabajador con el folio
        worker = {"folio": CURRENT_FOLIO, **data}
        workers_col.insert_one(worker)
        return jsonify({"status": "ok", "folio": CURRENT_FOLIO}), 200

    except Exception as e:
        app.logger.error(f"❌ Error en /add_worker: {e}")
        return jsonify({"error": str(e)}), 500

@app.route("/get_workers", methods=["GET"])
def get_workers():
    """
    Retorna la lista de trabajadores asociados al 'last_folio'.
    """
    try:
        last_folio_doc = counters_col.find_one({"_id": "last_folio"})
        last_folio = last_folio_doc["folio"] if last_folio_doc else None

        if not last_folio:
            return jsonify([]), 200

        workers = list(workers_col.find({"folio": last_folio}))
        for w in workers:
            w["_id"] = str(w["_id"])  # Convertir ObjectId a string
        return jsonify(workers), 200
    except Exception as e:
        app.logger.error(f"❌ Error en /get_workers: {e}")
        return jsonify({"error": str(e)}), 500

@app.route("/send_request", methods=["POST"])
def send_request():
    """
    Procesa el formulario principal. Inserta en 'requests' y
    elimina los trabajadores temporales asociados al folio actual.
    """
    global CURRENT_FOLIO
    try:
        # Estos datos vienen del form (multipart/form-data)
        work_description = request.form.get("workDescription")
        supplier = request.form.get("supplier")
        rfc = request.form.get("rfc")

        # Obtener lista de trabajadores que tengan el folio actual
        workers_list = list(workers_col.find({"folio": CURRENT_FOLIO}))
        worker_ids = [str(w["_id"]) for w in workers_list]

        # Manejo de imagen subida (si la hay)
        image_id = None
        if "file" in request.files:
            file = request.files["file"]
            if file.filename and file.filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS:
                filename = secure_filename(file.filename)
                file_path = os.path.join(app.config["UPLOAD_FOLDER"], filename)
                file.save(file_path)
                image_data = {"filename": filename, "path": file_path}
                image_id = images_col.insert_one(image_data).inserted_id

        # Construir el documento de la solicitud
        request_data = {
            "work_description": work_description,
            "supplier": supplier,
            "rfc": rfc,
            "workers": worker_ids,
            "folio": CURRENT_FOLIO,
            "image_id": str(image_id) if image_id else None
        }

        # Insertar en requests
        requests_col.insert_one(request_data)

        # Guardar el folio como "last_folio"
        counters_col.update_one(
            {"_id": "last_folio"},
            {"$set": {"folio": CURRENT_FOLIO}},
            upsert=True
        )

        # Resetear el folio activo
        CURRENT_FOLIO = None

        return redirect(url_for("index"))
    except Exception as e:
        app.logger.error(f"❌ Error en /send_request: {e}")
        return jsonify({"error": str(e)}), 500

@app.route("/upload_image", methods=["POST"])
def upload_image():
    """
    Ruta opcional para subir imágenes vía fetch (JSON).
    """
    if "file" not in request.files:
        return jsonify({"error": "No se ha enviado ningún archivo"}), 400
    
    file = request.files["file"]
    if file.filename == "":
        return jsonify({"error": "Nombre de archivo vacío"}), 400
    
    if file and file.filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS:
        filename = secure_filename(file.filename)
        file_path = os.path.join(app.config["UPLOAD_FOLDER"], filename)
        file.save(file_path)
        
        image_data = {"filename": filename, "path": file_path}
        image_id = images_col.insert_one(image_data).inserted_id
        
        return jsonify({"message": "Imagen subida exitosamente", "image_id": str(image_id)}), 201
    else:
        return jsonify({"error": "Formato de archivo no permitido"}), 400

@app.route("/uploads/<filename>", methods=["GET"])
def get_image(filename):
    """
    Sirve las imágenes guardadas en /uploads
    """
    return send_from_directory(app.config["UPLOAD_FOLDER"], filename)

# -----------------------------------------------------------------------------
# Ruta /admin protegida con autenticación básica

@app.route("/admin")
@requires_auth
def admin():
    """
    Muestra un panel de administración sencillo con los datos
    de la DB: trabajadores, solicitudes e imágenes.
    """
    workers = list(workers_col.find())
    requests_list = list(requests_col.find())
    images = list(images_col.find())

    # Convertir ObjectId a string para cada documento
    for doc in workers:
        doc["_id"] = str(doc["_id"])
    for doc in requests_list:
        doc["_id"] = str(doc["_id"])
    for doc in images:
        doc["_id"] = str(doc["_id"])

    return render_template("admin.html", workers=workers, requests=requests_list, images=images)

# -----------------------------------------------------------------------------
# Arranque de la aplicación

if __name__ == "__main__":
    port = int(os.getenv("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=True)
