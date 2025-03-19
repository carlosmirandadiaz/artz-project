Documentación del Proyecto
==========================

### Resumen

Este proyecto es una pequeña aplicación **Flask** que te permite:

-   Llevar un registro de **trabajadores** asociados a un **folio** específico.

-   Enviar una **solicitud** (incluyendo una descripción, información del proveedor y una imagen opcional).

-   Enviar automáticamente una **notificación por correo electrónico** vía SMTP después de cada solicitud.

-   Gestionar y visualizar los datos a través de un **panel de administración** (`/admin`).

### Características

1.  **Generación de folio**: Genera automáticamente un folio (por ejemplo, `NOV2406-0001`, `NOV2406-0002`, etc.) utilizando un contador de MongoDB.

2.  **Trabajadores**: Agrega trabajadores (nombre, correo electrónico, teléfono, etc.) vinculados al folio actual.

3.  **Solicitudes**: Envía solicitudes con una descripción, información del proveedor, RFC y una imagen opcional. Los datos se guardan en MongoDB y se envía una notificación por correo electrónico.

4.  **Panel de administración**: Accede a `/admin` (con **admin/password**) para ver trabajadores, solicitudes e imágenes subidas.

5.  **Subida de imágenes**: Almacena las imágenes subidas en una carpeta local `uploads/` y las referencia en MongoDB.

### Requisitos

-   **Python 3.7+**

-   **Flask**

-   **Flask-PyMongo**

-   **Werkzeug**

-   **MongoDB** (local o remoto)

-   Servicio SMTP para enviar correos electrónicos (por ejemplo, Gmail, Outlook, etc.)

### Variables de Entorno

Crea un archivo llamado `.env` (o configura estas variables en tu entorno de hosting) con:

# MongoDB
MONGO_URI=mongodb+srv://<usuario>:<contraseña>@<cluster>/<nombre_db>?retryWrites=true&w=majority

# SMTP para enviar correos electrónicos
SMTP_SERVER=smtp.tuproveedor.com
SMTP_PORT=587
SMTP_USER=tu_correo@dominio.com
SMTP_PASSWORD=tu_contraseña_smtp

# Destinatario de la notificación
NOTIFICATION_EMAIL_TO=destinatario@dominio.com

**Nota:** Si usas Gmail, es posible que necesites habilitar "Contraseñas de aplicación" o configurar "Aplicaciones menos seguras". Ajusta `SMTP_PORT` según tu proveedor (por ejemplo, 465 para SSL, 587 para TLS).

### Instalación

1.  Clona este repositorio o copia los archivos en tu directorio de trabajo.

2.  Instala las dependencias:

    pip install -r requirements.txt

3.  Crea tu archivo `.env` como se describió anteriormente o configura las variables de entorno en tu plataforma de hosting.

### Estructura del Proyecto (Ejemplo)

proyecto/
├── app.py
├── requirements.txt
├── .env
├── Procfile
├── templates/
│   ├── index.html
│   └── admin.html
├── static/
│   ├── script.js
│   └── styles.css
├── uploads/
└── ...

### Ejecución del Proyecto

1.  Asegúrate de que tu instancia de MongoDB esté en ejecución (o que tengas un URI de MongoDB remoto).

2.  Inicia la aplicación Flask:

    bash

    Copy

    python app.py

    Por defecto, la aplicación se ejecuta en `http://0.0.0.0:5000`.

3.  Accede a la aplicación en tu navegador:

    -   Página principal: `http://localhost:5000/`

    -   Panel de administración: `http://localhost:5000/admin` (usuario: `admin`, contraseña: `password`)

### Uso / Endpoints

-   **GET `/`**: Renderiza la página principal (`index.html`) con el folio actual (o el último utilizado).

-   **POST `/add_worker`**: Recibe un cuerpo JSON con la información del trabajador (nombre, teléfono, correo electrónico, etc.) y lo vincula al folio actual.

-   **GET `/get_workers`**: Devuelve los trabajadores asociados al último folio activo.

-   **POST `/send_request`**:

    -   Envía el formulario principal de solicitud (`multipart/form-data`) con una descripción, información del proveedor, RFC y una imagen opcional.

    -   Guarda la solicitud en MongoDB.

    -   Envía una notificación por correo electrónico con la información de la solicitud y los trabajadores.

    -   Elimina los trabajadores temporales de la base de datos.

    -   Redirige a la página principal.

-   **POST `/upload_image` (Opcional)**: Sube imágenes mediante una solicitud JSON. Las guarda en `uploads/`.

-   **GET `/uploads/<nombre_archivo>`**: Sirve las imágenes desde el directorio `uploads/`.

-   **GET `/admin`**: Protegido por autenticación básica (`admin/password`). Muestra listas de trabajadores, solicitudes e imágenes.

### Envío de Correos Electrónicos

Cuando se envía una solicitud (`/send_request`), la aplicación llama a una función para enviar un correo electrónico (`send_email_notification`):

-   Lee las credenciales SMTP desde `.env`.

-   Envía un correo electrónico con:

    -   Folio

    -   Descripción del trabajo

    -   Proveedor

    -   RFC

    -   Lista de trabajadores (nombre, teléfono, correo electrónico, etc.)

    -   Nombre del archivo de la imagen subida (si existe).

### Despliegue

Puedes desplegar en Heroku, Railway o cualquier otra plataforma que soporte Python/Flask.

1.  Configura las variables de entorno (`MONGO_URI`, `SMTP`, etc.) en tu proveedor de hosting.

2.  Un `Procfile` podría verse así:

    web: gunicorn app:app