import os
from app import app

# Neo4j database configuration
NEO4j_URI = "bolt://localhost:7687"
NEO4j_USER = "neo4j"
NEO4j_PASSWORD = "test"

# Jolt API configuration
JOLT_URL = "http://localhost:7474/db/data/transaction/commit"

# set secret key
SECRET_KEY = os.environ.get('SECRET_KEY') or 'sshh!'

# get absolute path
basedir = os.path.abspath(os.path.dirname(__file__))

# create database
SQLALCHEMY_DATABASE_URI = 'sqlite:///' + os.path.join(basedir, 'sqlite.db')
SQLALCHEMY_TRACK_MODIFICATIONS = False

# using gmail smtp server
app.config['MAIL_SERVER'] = 'smtp.gmail.com'
app.config['MAIL_PORT'] = 465
# your gmail account 
MAIL_USERNAME = 'cits3200Test@gmail.com'
app.config['MAIL_USERNAME'] = MAIL_USERNAME
# App Password from google not the real password for the email account
app.config['MAIL_PASSWORD'] = 'ldxtodldbtfcvezl'
app.config['MAIL_USE_SSL'] = True
RECIPIENT = 'lypa520@gmail.com'