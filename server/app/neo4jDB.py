from py2neo import Graph,NodeMatcher,cypher,Node,Relationship,RelationshipMatcher
from app import api
from config import NEO4j_URI, NEO4j_USER, NEO4j_PASSWORD
import pandas as pd

# connect to the Neo4j database
try:
    graphDB = Graph(NEO4j_URI, auth=(NEO4j_USER, NEO4j_PASSWORD))
except:
    print("\n****** Neo4j connect failed in neo4jDB.py, please check the neo4j service ******\n")

def search_by_query(query):
    try:
        #using jolt API to get the data to the frontend
        data = api.joltAPI(query) 
        # data = {'links':'[{},{}]','nodes':'[{},{}]'} or data = {'status':'empty_data'}
        return data
    except:
        # return error message if the api call fails
        return {'status': 'joltAPI_error'}

#create two new nodes and a relationship between them(but we don't have this function in the frontend yet)) 
'''
data = [{
        'source':{
            'label':'Test_Start_Node',
            'name':'start_node'
            ...
        },
        'target':{
            'label':'Test_End_Node',
            'name':'end_node'
            ...
        },
        'relationship':{
            'label':'Test_Relationship',
            'name':'is_friend_of'
            ...
        }
        }]
'''
def create_by_user(data):
    try:
        for item in data:
            #create a empty node object（source_node）
            source_node = Node()
            #get the data from the frontend (label,name)
            for (key,value) in zip(item['source'].keys(),item['source'].values()):
                if key == 'label':
                    #assign a name to the previously created node object
                    source_node.add_label(value)
                else:
                    #add properties other than label(name, age, height, weight ...)
                    source_node[key] = value
            #query whether the current node already exists in the database (check both label and name)
            source_match = NodeMatcher(graphDB).match(item['source']['label'],name=item['source']['name'])
            if source_match.__len__() == 0:
                #not exist: add the currently created node(source_node) to the database
                graphDB.create(source_node)
            else:
                #exist: directly copy the queried node to source_node
                source_node = source_match.first()

            #same as above, just processing the target node
            target_node = Node()
            for (key,value) in zip(item['target'].keys(),item['target'].values()):
                if key == 'label':
                    target_node.add_label(value)
                else:
                    target_node[key] = value
            target_match = NodeMatcher(graphDB).match(item['target']['label'], name=item['target']['name'])
            if target_match.__len__() == 0:
                graphDB.create(target_node)
            else:
                target_node = target_match.first()

            #handling the relationship
            rel_match = RelationshipMatcher(graphDB) #create a query object
            for (key,value) in zip(item['relationship'].keys(),item['relationship'].values()):
                if key == 'label':
                    #relationship object :（‘startNode’, 'knows', 'endNode'）
                    rel = Relationship(source_node,value,target_node)
                    #any properties except label are added to the relationship object
                    for (key1, value1) in zip(item['relationship'].keys(), item['relationship'].values()):
                        if key1 != 'label':
                            rel[key1] = value1
                    #Use the previously created query object
                    #query whether the current relationship already exists in the database(relationship between source_node and target_node)
                    if len(rel_match.match([source_node,target_node],r_type=value)) == 0:
                        graphDB.create(rel)
        return {'status':'create_success'}
    except:
        return {'status':'create_failed'}

# delete nodes and relationships by user
def delete_entity(id, item):
    try:
        if item == 'node':
            # match the node by id
            node = graphDB.evaluate("MATCH (n) WHERE id(n) = {} RETURN n".format(id))
            graphDB.delete(node)
            return {'status':'delete_success'}
        elif item == 'relationship':
            # match the relationship by id
            relationship = graphDB.evaluate("MATCH ()-[r]-() WHERE id(r) = {} DELETE r".format(id))
            return {'status':'delete_success'}
    except:
        return {'status':'error'}

# create single node by user
def create_node(data):
    try:
        # create a empty node object
        node = Node()
        for (key, value) in zip(data.keys(), data.values()):
            if key == 'label':
                # add label to the node
                node.add_label(value)
            else:
                # add properties to the node
                node[key] = value
        # query whether the current node already exists in the database (check both label and name)
        if 'CBoK' == data['label']:
            node_match = NodeMatcher(graphDB).match(data['label'], area=data['area'])
        elif 'Outcome' == data['label']:
            node_match = NodeMatcher(graphDB).match(data['label'], level=data['level'])
        elif 'Unit' == data['label']:
            node_match = NodeMatcher(graphDB).match(data['label'], title=data['title'])
        elif 'Course' == data['label']:
            node_match = NodeMatcher(graphDB).match(data['label'], title=data['title'])
        elif 'AQFcategory' == data['label']:
            node_match = NodeMatcher(graphDB).match(data['label'], description=data['description'])
        elif 'AQFoutcome' == data['label']:
            node_match = NodeMatcher(graphDB).match(data['label'], description=data['description'])
        elif 'Activity' == data['label']:
            node_match = NodeMatcher(graphDB).match(data['label'], activity=data['activity'])
        elif data['name'] != None:
            node_match = NodeMatcher(graphDB).match(data['label'], name=data['name'])
            
        if node_match.__len__() == 0:
            graphDB.create(node)
            return {'status':'create_success'}
        else:
            return {'status':'node_exist'}
    except:
        return {'status':'create_failed'}

# update node attributes
def update_node(id, data):
    try:
        # match the node by id
        node = graphDB.evaluate("MATCH (n) WHERE id(n) = {} RETURN n".format(id))
        for (key, value) in zip(data.keys(), data.values()):
            # update attributes
            node[key] = value
        graphDB.push(node)
        return {'status':'update_success'}
    except:
        return {'status':'update_failed'}

# update relationship attributes
def update_relationship(id, data):
    try:
        # match the relationship by id
        relationship = graphDB.evaluate("MATCH ()-[r]-() WHERE id(r) = {} RETURN r".format(id))
        for (key, value) in zip(data.keys(), data.values()):
            # update attributes
            relationship[key] = value
        graphDB.push(relationship)
        return {'status':'update_success'}
    except:
        return {'status':'update_failed'}

# create a new relationship by selecting two existing nodes and a relationship type given by the user
def create_relationship(data):
    try:
        # match the source node by id
        source_node = graphDB.evaluate("MATCH (n) WHERE id(n) = {} RETURN n".format(data['sourceId']))
        # match the target node by id
        target_node = graphDB.evaluate("MATCH (n) WHERE id(n) = {} RETURN n".format(data['targetId']))
        # create a relationship object
        rel = Relationship(source_node, data['label'], target_node)
        # add properties to the relationship object
        for (key, value) in zip(data.keys(), data.values()):
            if key != 'sourceId' and key != 'targetId' and key != 'label':
                rel[key] = value
        # query whether the current relationship already exists in the database
        rel_match = RelationshipMatcher(graphDB)
        if len(rel_match.match([source_node, target_node], r_type=data['label'])) == 0:
            graphDB.create(rel)
            return {'status':'create_success'}
        else:
            return {'status':'relationship_exist'}
    except:
        return {'status':'create_failed'}

# get all labels in the database
def get_labels(): 
    try:
        # get all labels
        labels = graphDB.run("CALL db.labels() YIELD label RETURN label")
        #get attributes of each label and store them in a dictionary (key: label, value: attributes)
        label_dict = {}
        for label in labels:
            data = graphDB.run("MATCH (n:{}) RETURN n LIMIT 25".format(label['label'])).data()[0]['n']
            label_dict[label['label']] = list(data.keys())
        return {'status':'success', 'data':label_dict}
    except:
        return {'status':'error'}

# get all relationship types in the database
def get_relationships():
    try:
        # get all relationship types
        relationships = graphDB.run("CALL db.relationshipTypes() YIELD relationshipType RETURN relationshipType")
        # convert the result to a list
        relationships = [relationship['relationshipType'] for relationship in relationships]
        # return relationships
        return {'status':'success', 'data':relationships}

    except:
        return {'status':'error'}

# download a csv file according to the query result
def downloadCsv(query):
    try:
        output = search_by_query(query)
        data = output['data']
        node_len = len(data['nodes'])
        rel_len = len(data['links'])
        if node_len > rel_len:
            for i in range(node_len - rel_len):
                data['links'].append('')
        else:
            for i in range(rel_len - node_len):
                data['nodes'].append('')
        df = pd.DataFrame(data, columns=list(data.keys()), index=None) # dataframe
        csv_bin_data = df.to_csv(index=True, encoding="utf-8") # CSV file
        return csv_bin_data
    except:
        return {'status':'download_failed'}