from flask import Flask
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_login import  LoginManager
from flask_migrate import Migrate
from flask_mail import Mail

# create the application object
app = Flask(__name__)
app.config.from_object('config')
# enable CORS
CORS(app,supports_credentials=True)

# create eamil object
mail = Mail(app)

# create database object
db = SQLAlchemy(app)
# Configure migrate
db.init_app(app)
migrate = Migrate(app, db)

# Configure login manager
login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = 'login'
login_manager.session_protection = "strong"

from app import routes, neo4jDB, api, models, sqliteDB