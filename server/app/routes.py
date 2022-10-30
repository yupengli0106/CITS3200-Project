from app import app, neo4jDB, sqliteDB, mail
from app.models import UserModel
from flask import render_template, request, jsonify, Response
from flask_login import current_user
from flask_mail import Message
from config import MAIL_USERNAME,RECIPIENT
    
# register user
@app.route('/register', methods=['POST', 'GET'])
def register():
    if request.method == 'POST':
        data = request.get_json()
        result = sqliteDB.register(data['username'],data['email'], data['password'])
        return result
    else:
        return {'status': 'request_error'}

# login user
@app.route('/login', methods=['POST', 'GET'])
def login():
    if request.method == 'POST':
        data = request.get_json()
        result = sqliteDB.login(data['email'], data['password'])
        return result
    else:
        return {'status': 'request_error'}

@app.route('/logout', methods=['POST', 'GET'])
def logout():
    return sqliteDB.logout()

# check current user status
@app.route("/@me")
def get_current_user():
    if current_user.is_authenticated:
        return jsonify({
            "loggedIn": True,
            "id": current_user.id,
            "email": current_user.email,
            "isCoordinator": current_user.UnitCoordinator,
            'isAdmin': current_user.admin,
            'username': current_user.username
        })
    else:
        return jsonify({"loggedIn": False, "isCoordinator": False})

# query the database(Neo4j) by user input and return json data to frontend
@app.route('/query', methods=['POST', 'GET'])
def query_by_user():
    if request.method == 'POST':
        data = request.get_json()
        result = neo4jDB.search_by_query(data['query'])
        return result
    else:
        return {'status': 'request_error'}

# create new nodes and new relationships by user
@app.route('/user_create', methods=['POST', 'GET'])
def create_by_user():
    if request.method == 'POST':
        data = request.get_json()
        result = neo4jDB.create_by_user(data['inputs'])
        return result
    else:
        return {'status': 'request_error'}

# delete nodes and relationships by user
@app.route('/delete_entity', methods=['POST', 'GET'])
def delete_entity():
    if request.method == 'POST':
        data = request.get_json()
        result = neo4jDB.delete_entity(data['id'], data['type'])
        return result
    else:
        return {'status': 'request_error'}

# create single node by user
@app.route('/create_node', methods=['POST', 'GET'])
def create_node():
    if request.method == 'POST':
        data = request.get_json()
        result = neo4jDB.create_node(data['inputs'])
        return result
    else:
        return {'status': 'request_error'}

# create relationship by selecting nodes and relationships
@app.route('/linkCreate', methods=['POST', 'GET'])
def create_relationship():
    if request.method == 'POST':
        data = request.get_json()
        result = neo4jDB.create_relationship(data['inputs'])
        return result
    else:
        return {'status': 'request_error'}

# update link direction and delete the link was selected
@app.route('/relationshisp_update', methods=['POST', 'GET'])
def create_relationship2():
    if request.method == 'POST':
        data = request.get_json()
        result = neo4jDB.delete_entity(data['id'], 'relationship')
        if result['status'] == 'delete_success':
            result2 = neo4jDB.create_relationship(data['inputs'])
            return result2
        else:
            return result
    else:
        return {'status': 'request_error'}

# update node attributes
@app.route('/nodeUpdate', methods=['POST', 'GET'])
def Update_node():
    if request.method == 'POST':
        data = request.get_json()
        result = neo4jDB.update_node(data['id'], data['inputs'])
        return result
    else:
        return {'status': 'request_error'}

# update relationship attributes(we haven't used this route)
@app.route('/linkUpdate', methods=['POST', 'GET'])
def Update_link():
    if request.method == 'POST':
        data = request.get_json()
        result = neo4jDB.update_relationship(data['id'], data['link'])
        return result
    else:
        return {'status': 'request_error'}

# get all labels and properties of the labels
@app.route('/get_label', methods=['POST', 'GET'])
def get_label():
    if request.method == 'GET':
        data = neo4jDB.get_labels()
        return data
    else:
        return {'status': 'request_error'}

# get all relationship types
@app.route('/get_relationship', methods=['POST', 'GET'])
def get_relationship():
    if request.method == 'GET':
        data = neo4jDB.get_relationships()
        return data
    else:
        return {'status': 'request_error'}

# download a csv file according to the query
@app.route('/csv', methods=['POST', 'GET'])
def csv():
    if request.method == 'POST':
        data = request.get_json()
        csvFile = neo4jDB.downloadCsv(data['query'])
        return Response(
            csvFile,
            mimetype="text/csv",
            headers={"Content-disposition":
                        "attachment; filename=curriculum_mapper.csv"},
            status=200
            )
    else:
        return {'status': 'request_error'}

# upgrade user to unit coordinator
@app.route('/upgrade', methods=['POST', 'GET'])
def upgrade_user():
    if request.method == 'POST':
        data = request.get_json()
        result = sqliteDB.upgrade_to_coordinator(data['email'], data['whitelist'])
        print("----------result")
        print(result)
        return result
    else:
        return {'status': 'request_error'}

# send email to admin
@app.route("/send_mail", methods=['POST', 'GET'])
def send_mail():
    if request.method == 'POST':
        data = request.get_json()
        message = data['message']
        title = 'CITS3200 Notification'
        msg = Message(title, sender=MAIL_USERNAME, recipients=[RECIPIENT])
        msg.body = "Hi Admin,\n\na new user just registered here is the email address of the user: " + message+"\n\nBest regards,\nCurriculum Mapper"
        try:
            mail.send(msg)
            return {'status': 'send_success'}
        except:
            return {'status': 'send_failed'}
    else:
        return {'status': 'request_error'}

# add an email address to the whitelist(we haven't used this route cuz we automatically send an email when a new user register)
@app.route("/add_whitelist", methods=['POST', 'GET'])
def add_whitelist():
    if request.method == 'POST':
        data = request.get_json()
        result = sqliteDB.add_whiteList(data['email'])
        return result
    else:
        return {'status': 'request_error'}