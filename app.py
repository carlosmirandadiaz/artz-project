import os
from dotenv import load_dotenv
from flask import Flask, request, render_template, jsonify, redirect, url_for, send_from_directory
from flask_pymongo import PyMongo
from pymongo import ReturnDocument
from werkzeug.utils import secure_filename

# Carga las variables de entorno desde .env
load_dotenv()

app = Flask(__name__)

# Obtiene la URI de MongoDB desde Railway
mongo_uri = os.getenv("MONGO_URI")
if not mongo_uri:
    app.logger.error("❌ MONGO_URI no está definida en las variables de entorno")
    raise Exception("La variable MONGO_URI es requerida")

# Configurar conexión con MongoDB
app.config["MONGO_URI"] = mongo_uri
app.logger.info(f"🔗 Conectando a MongoDB en: {mongo_uri}")

try:
    mongo = PyMongo(app)
    db = mongo.db
    workers_col = db.workers
    requests_col = db.requests
    counters_col = db.counters
    images_col = db.images  # Nueva colección para imágenes
    app.logger.info("✅ Conexión a MongoDB establecida correctamente")
except Exception as e:
    app.logger.error(f"❌ Error al conectar a MongoDB: {e}")
    raise e

# Configuración de almacenamiento de imágenes
UPLOAD_FOLDER = "uploads"
ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "gif"}
app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

# Variable global para el folio activo
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

from flask import Flask, request, jsonify, render_template, redirect, url_for, send_from_directory, Response
from werkzeug.utils import secure_filename
from functools import wraps
import os

app = Flask(__name__)

# Configuraciones y definiciones previas (por ejemplo, conexión a la BD, colecciones, ALLOWED_EXTENSIONS, etc.)

# Ejemplo: variables globales y configuraciones
CURRENT_FOLIO = None
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}
app.config["UPLOAD_FOLDER"] = "uploads"

# ---------------------------------------------
# Decorador de autenticación básica para /admin
def check_auth(username, password):
    # Para pruebas: usuario "admin" y contraseña "password"
    return username == "admin" and password == "password"

def authenticate():
    # Respuesta 401 para solicitar credenciales
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

# ---------------------------------------------
# Rutas existentes

@app.route("/")
def index():
    try:
        last_folio_doc = counters_col.find_one({"_id": "folio"})
        folio = f"NOV2406-{str(last_folio_doc['seq']).zfill(4)}" if last_folio_doc else "NOV2406-0001"
        app.logger.info(f"🏠 Página de inicio cargada con folio: {folio}")
        return render_template("index.html", folio=folio)
    except Exception as e:
        app.logger.error(f"❌ Error en la ruta /: {e}")
        return jsonify({"error": str(e)}), 500

@app.route("/add_worker", methods=["POST"])
def add_worker():
    global CURRENT_FOLIO
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "No data received"}), 400

        if CURRENT_FOLIO is None:
            CURRENT_FOLIO = get_next_folio()
            counters_col.update_one({"_id": "last_folio"}, {"$set": {"folio": CURRENT_FOLIO}}, upsert=True)

        worker = {"folio": CURRENT_FOLIO, **data}
        workers_col.insert_one(worker)
        return jsonify({"status": "ok", "folio": CURRENT_FOLIO}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/get_workers", methods=["GET"])
def get_workers():
    try:
        last_folio_doc = counters_col.find_one({"_id": "last_folio"})
        last_folio = last_folio_doc["folio"] if last_folio_doc else None

        if not last_folio:
            return jsonify([]), 200

        workers = list(workers_col.find({"folio": last_folio}))
        for w in workers:
            w["_id"] = str(w["_id"])
        return jsonify(workers), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/send_request", methods=["POST"])
def send_request():
    global CURRENT_FOLIO
    try:
        work_description = request.form.get("workDescription")
        supplier = request.form.get("supplier")
        rfc = request.form.get("rfc")

        workers_list = list(workers_col.find({"folio": CURRENT_FOLIO}))
        worker_ids = [str(w["_id"]) for w in workers_list]

        # Manejo de imagen subida
        image_id = None
        if "file" in request.files:
            file = request.files["file"]
            if file.filename != "" and file.filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS:
                filename = secure_filename(file.filename)
                file_path = os.path.join(app.config["UPLOAD_FOLDER"], filename)
                file.save(file_path)
                image_data = {"filename": filename, "path": file_path}
                image_id = images_col.insert_one(image_data).inserted_id

        request_data = {
            "work_description": work_description,
            "supplier": supplier,
            "rfc": rfc,
            "workers": worker_ids,
            "folio": CURRENT_FOLIO,
            "image_id": str(image_id) if image_id else None
        }

        requests_col.insert_one(request_data)
        workers_col.delete_many({"folio": CURRENT_FOLIO})
        counters_col.update_one({"_id": "last_folio"}, {"$set": {"folio": CURRENT_FOLIO}}, upsert=True)
        CURRENT_FOLIO = None
        return redirect(url_for("index"))
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/upload_image", methods=["POST"])
def upload_image():
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
    return send_from_directory(app.config["UPLOAD_FOLDER"], filename)

# ---------------------------------------------
# Nueva ruta /admin protegida con autenticación

@app.route("/admin")
@requires_auth
def admin():
    # Obtener todos los trabajadores, solicitudes e imágenes
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

# ---------------------------------------------
# Inicio de la aplicación
if __name__ == "__main__":
    port = int(os.getenv("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=True)
