import React, { useRef, useEffect, useState } from "react";
import Offcanvas from "react-bootstrap/Offcanvas";

import PropTypes from "prop-types";

import ForceGraph2D from "react-force-graph-2d";
import httpClient from "./httpClient.js";
import Table from "react-bootstrap/Table";
import Button from "react-bootstrap/Button";

import Form from "react-bootstrap/Form";
import Dropdown from "react-bootstrap/Dropdown";
import Modal from "react-bootstrap/Modal";

import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import AllDataTable from "./allDataTable.jsx";
import Col from "react-bootstrap/Col";
import { IconContext } from "react-icons";

import { ImTable } from "react-icons/im";
import { FaFileCsv } from "react-icons/fa";

var unnecessaryHeadings = [
  "availabilities",
  "__indexColor",
  "index",
  "color",
  "displayName",
  "x",
  "y",
  "vx",
  "vy",
  "fx",
  "fz",
  "displayName",
  "deleted",
  "labels",
  "fy",
  "type",
];

const queryDisplay = ({ inputData, query }) => {
  //-----------------------------------------------------------------------------------HANDLING PARAMETERS
  var baseData = [];
  var dataIndex = 0;
  baseData.push(inputData);

  const [data, setData] = useState({
    ["nodes"]: baseData[dataIndex].nodes,
    ["links"]: baseData[dataIndex].links,
  });

  console.log("-----DATA-----");
  console.log(data);

  const [showDelNode, setDelNodeShow] = useState(false);
  const [showDelLink, setDelLinkShow] = useState(false);

  const handleDelNodeClose = () => {
    setDelNodeShow(false);
  };

  const handleDelNodeShow = (id) => {
    setDelNodeShow(true);
    console.log("CHECK HERE_______________________\n\n\n");
    console.log(id);
  };

  const handleDelLinkClose = () => {
    setDelLinkShow(false);
  };
  const handleDelLinkShow = (id) => {
    setDelLinkShow(true);
  };

  //-----------------------------------------------------------------------------------GET USER TYPE

  const [userType, setUserType] = useState("BasicUser");
  const [userLoggedIn, setUserLoggedIn] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const resp = await httpClient.get("//localhost:5000/@me");

        if (resp.data.isCoordinator === true) {
          setUserType("UnitCoordinator");
        }

        if (resp.data.loggedIn === true) {
          setUserLoggedIn(true);
        }
      } catch (error) {
        console.log("No Current User Logged In");
      }
    })();
  }, []);

  //-----------------------------------------------------------------------------------GLOBAL VARIABLES
  // WHICH CRUD COMMAND TO HAVE ON

  const [currentId, setCurrentId] = useState(0);
  const [searchSourceId, setSearchSourceId] = useState(0);
  const [searchTargetId, setSearchTargetId] = useState(0);

  const [chosenType, setChosenType] = useState([]);
  const [itemType, setItemType] = useState("");
  const [filterActive, setFilterActive] = useState("none");

  const [searchActive, setSearchActive] = useState("no");

  // WHICH DISPLAYS TO HAVE ON
  const [tableActive, setTableActive] = useState(false);
  const [crudActive, setCrudActive] = useState(false);

  const closeTable = () => {
    setTableActive(false);
  };
  const toggleTable = () => {
    setTableActive((s) => !s);
    setCrudActive(false);
  };

  const closeCrudTable = () => {
    setCrudActive(false);
    setFilterActive("none");
    setSearchActive("no");
  };

  // ERROR MODAL
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleErrorClose = () => {
    setErrorMessage("");
    setShowErrorModal(false);
  };
  const handleErrorShow = () => setShowErrorModal(true);

  //-----------------------------------------------------------------------------------RELOAD
  // AFTER A CRUD COMMAND RELOAD THE DATA
  const reload_data = async (query) => {
    console.log("-----SENDING-----");
    console.log(query);
    try {
      const reQueryData = await httpClient.post("//localhost:5000/query", {
        query,
      });
      console.log("   --STATUS [reload_data]: " + reQueryData.data.status);
      if (reQueryData.data.status === "success") {
        baseData.push(reQueryData.data.data);
        dataIndex++;
        Object.freeze(baseData[dataIndex]);
        setData({
          ...data,
          ["nodes"]: baseData[dataIndex].nodes,
          ["links"]: baseData[dataIndex].links,
        });
      }
      if (reQueryData.data.status === "request_error") {
        setErrorMessage(
          "[request_error]: Error Receiving Query Request (routes.py) "
        );
        handleErrorShow();
      }
      if (reQueryData.data.status === "joltAPI_error") {
        setErrorMessage(
          "[joltAPI_error]: Error Accessing Neo4jDB (neo4jDB.py) "
        );
        handleErrorShow();
      }
      if (reQueryData.data.status === "empty_data") {
        setErrorMessage("[empty_data]: Error Executing Query (api.py) ");
        handleErrorShow();
      }
    } catch (e) {
      setErrorMessage("Error");
      handleErrorShow();
    }
  };

  //-----------------------------------------------------------------------------------FORCEGRAPH2D ELEMENT

  // FOR THE FORCEGRAPH2D ELEMENT
  const forceRef = useRef(null);
  useEffect(() => {
    forceRef.current.d3Force("charge").strength(-400);
  });

  //-----------------------------------------------------------------------------------SEARCH FUNCTIONS
  // FIND THE NODE CORRESPONDING WITH THAT ID

  function searchforNode(searchId) {
    for (var i = 0; i < data.nodes.length; i++) {
      if (data.nodes[i].id === searchId) {
        console.log(
          "-----OUTPUT [searchforNode]: " + data.nodes[i].displayName
        );
        return data.nodes[i];
      }
    }
    console.log("-----OUTPUT [searchforNode]: " + "not found");
    return "not found";
  }

  // FIND THE LINK CORRESPONDING WITH THAT ID
  function searchforLink(searchId) {
    for (var j = 0; j < data.links.length; j++) {
      if (data.links[j].property.id === searchId) {
        console.log(
          "-----OUTPUT [searchforLink]: " + data.links[j].displayName
        );
        return data.links[j];
      }
    }
    console.log("-----OUTPUT [searchforLink]: " + "not found");
    return "not found";
  }
  //-----------------------------------------------------------------------------------HELPER FUNCTIONS
  // SETTING THE INPUT TYPES
  function getInputs(sType, type, item) {
    setChosenType(sType);
    setItemType(item);
    if (type === "NODE") {
      setFilterActive("NodeInputs");
    }
    if (type === "LINK") {
      setFilterActive("LinkInputs");
    }
  }
  //-----------------------------------------------------------------------------------REQUEST FUNCTIONS
  // CREATE NODE CRUD COMMAND POST
  const sendCreateNode = async (inputs) => {
    console.log("-----SENDING [sendCreateNode]: " + inputs);
    try {
      const dbData = await httpClient.post("//localhost:5000/create_node", {
        inputs,
      });
      console.log("   --STATUS [sendCreateNode]: " + dbData.data.status);

      if (dbData.data.status === "create_success") {
        closeCrudTable();
        reload_data(query);
      }
      if (dbData.data.status === "request_error") {
        closeCrudTable();
        setErrorMessage(
          "[request_error]: Error Receiving POST Request (routes.py - /create_node) "
        );
        handleErrorShow();
      }
      if (dbData.data.status === "node_exist") {
        closeCrudTable();
        setErrorMessage(
          "[node_exist]: Node Already Exists (neo4jDB.py - /create_node) "
        );
        handleErrorShow();
      }
      if (dbData.data.status === "create_failed") {
        closeCrudTable();
        setErrorMessage(
          "[create_failed]: Node Create Failed (neo4jDB.py - /create_node) "
        );
        handleErrorShow();
      }
    } catch (error) {
      setErrorMessage("Error [sendCreateNode]");
      handleErrorShow();
    }
  };

  // CREATE LINK CRUD COMMAND POST
  const sendCreateLink = async (label, sId, tId) => {
    const inputs = { label: label, sourceId: sId, targetId: tId };

    console.log("-----SENDING [sendCreateLink]: ");
    console.log(inputs);

    try {
      const dbData = await httpClient.post("//localhost:5000/linkCreate", {
        inputs,
      });
      console.log("   --STATUS [sendCreateLink]: " + dbData.data.status);

      if (dbData.data.status === "create_success") {
        closeCrudTable();
        reload_data(query);
      }
      if (dbData.data.status === "request_error") {
        closeCrudTable();
        setErrorMessage(
          "[request_error]: Error Receiving POST Request (routes.py - /linkCreate) "
        );
        handleErrorShow();
      }
      if (dbData.data.status === "relationship_exist") {
        closeCrudTable();
        setErrorMessage(
          "[relationship_exist]: Link/Relationship Already Exists (neo4jDB.py - /create_relationship) "
        );
        handleErrorShow();
      }
      if (dbData.data.status === "create_failed") {
        closeCrudTable();
        setErrorMessage(
          "[create_failed]: Link/Relationship Create Failed Exists (neo4jDB.py - /create_relationship) "
        );
        handleErrorShow();
      }
    } catch (error) {
      setErrorMessage("Error [sendCreateLink]");
      handleErrorShow();
    }
  };

  // DELETE NODE CRUD COMMAND POST
  const sendDeleteNode = async (id) => {
    console.log(
      "-----SENDING [sendDeleteNode]: " + "id:" + id + ", type: 'node'"
    );
    try {
      const dbData = await httpClient.post("//localhost:5000/delete_entity", {
        id,
        type: "node",
      });
      console.log("   --STATUS [sendDeleteNode]: " + dbData.data.status);
      if (dbData.data.status === "delete_success") {
        closeCrudTable();
        reload_data(query);
      }
      if (dbData.data.status === "request_error") {
        closeCrudTable();
        setErrorMessage(
          "[request_error]: Error Receiving POST Request (routes.py - /delete_entity) "
        );
        handleErrorShow();
      }
      if (dbData.data.status === "error") {
        closeCrudTable();
        setErrorMessage("[error]: Error (neo4jDB.py - /delete_entity) ");
        handleErrorShow();
      }
    } catch (error) {
      setErrorMessage("Error [sendDeleteNode]");
      handleErrorShow();
    }
  };

  // DELETE LINK CRUD COMMAND POST
  const sendDeleteLink = async (id) => {
    console.log(
      "-----SENDING [sendDeleteLink]: " + "id:" + id + ", type: 'relationship'"
    );
    try {
      const dbData = await httpClient.post("//localhost:5000/delete_entity", {
        id,
        type: "relationship",
      });
      console.log("   --STATUS [sendDeleteLink]: " + dbData.data.status);
      if (dbData.data.status === "delete_success") {
        closeCrudTable();
        reload_data(query);
      }
      if (dbData.data.status === "request_error") {
        closeCrudTable();
        setErrorMessage(
          "[request_error]: Error Receiving POST Request (routes.py - /delete_entity) "
        );
        handleErrorShow();
      }
      if (dbData.data.status === "error") {
        closeCrudTable();
        setErrorMessage("[error]: Error (neo4jDB.py - /delete_entity) ");
        handleErrorShow();
      }
    } catch (error) {
      setErrorMessage("Error [sendDeleteLink]");
      handleErrorShow();
    }
  };

  // UPDATE NODE CRUD COMMAND POST
  const sendNodeUpdate = async (inputs, id) => {
    console.log(
      "-----SENDING [sendNodeUpdate]: " + "id: " + id + ", inputs: " + inputs
    );
    try {
      const dbData = await httpClient.post("//localhost:5000/nodeUpdate", {
        id,
        inputs, // {"avaliability":"fssfds", "unitCode":32454}
      });

      console.log("   --STATUS [sendNodeUpdate]: " + dbData.data.status);

      if (dbData.data.status === "update_success") {
        closeCrudTable();
        reload_data(query);
      }
      if (dbData.data.status === "update_failed") {
        closeCrudTable();
        setErrorMessage(
          "[update_failed]: Node Update Failed (neo4jDB.py - /update_node) "
        );
        handleErrorShow();
      }
      if (dbData.data.status === "request_error") {
        closeCrudTable();
        setErrorMessage(
          "[request_error]: Error Receiving POST Request (routes.py - /nodeUpdate) "
        );
        handleErrorShow();
      }
    } catch (error) {
      setErrorMessage("Error [sendNodeUpdate]");
      handleErrorShow();
    }
  };

  // UPDATE LINK CRUD COMMAND POST
  const sendLinkUpdate = async (label, sId, tId, id) => {
    const inputs = { label: label, sourceId: sId, targetId: tId };
    console.log("-----SENDING [sendLinkUpdate]: " + inputs);
    console.log(inputs);

    try {
      const dbData = await httpClient.post(
        "//localhost:5000/relationshisp_update",
        {
          inputs,
          id,
        }
      );
      console.log("   --STATUS [sendLinkUpdate]: " + dbData.data.status);
      if (dbData.data.status === "create_success") {
        closeCrudTable();
        reload_data(query);
      }
      if (dbData.data.status === "request_error") {
        closeCrudTable();
        setErrorMessage(
          "[request_error]: Error Receiving POST Request (routes.py - /linkCreate) "
        );
        handleErrorShow();
      }
      if (dbData.data.status === "relationship_exist") {
        closeCrudTable();
        setErrorMessage(
          "[relationship_exist]: Link/Relationship Already Exists (neo4jDB.py - /create_relationship) "
        );
        handleErrorShow();
      }
      if (dbData.data.status === "create_failed") {
        closeCrudTable();
        setErrorMessage(
          "[create_failed]: Link/Relationship Create Failed Exists (neo4jDB.py - /create_relationship) "
        );
        handleErrorShow();
      }
    } catch (error) {
      setErrorMessage("Error [sendLinkUpdate]");
      handleErrorShow();
    }
  };

  //-----------------------------------------------------------------------------------MOUSE EVENT FUNCTIONS
  // NODE MOUSE EVENT
  function handleNodeClick(node) {
    if (searchActive === "no") {
      setCurrentId(node.id);
      setFilterActive("none");
      setFilterActive("NodeRead");
      setCrudActive(true);
      setTableActive(false);
      console.log(
        "-----handleNodeClick -> searchActive: 'no' | currentId: " +
          currentId +
          " node: " +
          node.displayName +
          "-----"
      );
      // MAKE MOUSE EVENTS SEARCH FOR SOURCE NODE
    } else if (searchActive === "source") {
      setSearchSourceId(node.id);
      console.log(
        "-----handleNodeClick -> searchActive: 'source' | searchSourceId: " +
          searchSourceId +
          " node: " +
          node.displayName +
          "-----"
      );
      // MAKE MOUSE EVENTS SEARCH FOR TARGET NODE
    } else if (searchActive === "target") {
      setSearchTargetId(node.id);
      console.log(
        "-----handleNodeClick -> searchActive: 'target' | searchTargetId: " +
          searchTargetId +
          " node: " +
          node.displayName +
          "-----"
      );
    }
  }

  // LINK MOUSE EVENT
  function handleLinkClick(link) {
    setCurrentId(link.property.id);
    setCrudActive(true);
    setTableActive(false);
    setFilterActive("LinkRead");
    console.log("-----handleLinkClick -> currentId: " + currentId + "-----");
  }

  // BACKGROUND MOUSE EVENT
  function handleBackgroundClick(item) {
    setFilterActive("Create");
    setCrudActive(true);
    setTableActive(false);
    console.log(
      "-----handleBackgroundClick -> filterActive: " + filterActive + "-----"
    );
  }

  //-----------------------------------------------------------------------------------COMPONENTS

  // DELETE NODE MODAL
  const DelNode = (id) => {
    return (
      <Modal
        show={showDelNode}
        onHide={handleDelNodeClose}
        animation={true}
        size="md"
        aria-labelledby="contained-modal-title-vcenter"
        backdrop="static"
        keyboard={false}
        centered
      >
        <Modal.Header closeButton centered>
          <Modal.Title>
            <h2>Delete Node?</h2>
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Container>
            <Row>
              <Col></Col>
              <Col>
                <Button variant="uwa" onClick={handleDelNodeClose}>
                  Cancel
                </Button>
              </Col>

              <Col>
                <Button variant="uwa" onClick={() => sendDeleteNode(id.id)}>
                  Delete
                </Button>
              </Col>
              <Col></Col>
            </Row>
          </Container>
        </Modal.Body>
      </Modal>
    );
  };

  //DELETE LINK MODAL
  const DelLink = (id) => {
    return (
      <Modal
        show={showDelLink}
        onHide={handleDelLinkClose}
        animation={true}
        size="md"
        aria-labelledby="contained-modal-title-vcenter"
        backdrop="static"
        keyboard={false}
        centered
      >
        <Modal.Header closeButton centered>
          <Modal.Title>
            <h2>Delete Link?</h2>
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Container>
            <Row>
              <Col></Col>
              <Col>
                <Button variant="uwa" onClick={handleDelLinkClose}>
                  Cancel
                </Button>
              </Col>

              <Col>
                <Button variant="uwa" onClick={() => sendDeleteLink(id.id)}>
                  Delete
                </Button>
              </Col>
              <Col></Col>
            </Row>
          </Container>
        </Modal.Body>
      </Modal>
    );
  };

  // READ NODE COMPONENT
  const NodeRead = () => {
    var unitnode = searchforNode(currentId);
    // console.log(unitnode);
    var attributes = Object.keys(unitnode);
    console.log(
      "-----NodeRead Component -> Node: " + unitnode.displayName + "-----"
    );

    for (let i = 0; i < unnecessaryHeadings.length; i++) {
      const index = attributes.indexOf(unnecessaryHeadings[i]);
      if (index > -1) {
        attributes.splice(index, 1);
      }
    }

    return (
      <Container>
        <h2>NODE READ</h2>
        <Table responsive striped hover>
          <thead>
            <tr>
              {attributes.map((attribute) => (
                <th>{attribute}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              {attributes.map((attribute) => (
                <th>{unitnode[attribute]}</th>
              ))}
            </tr>
          </tbody>
        </Table>

        {userType === "UnitCoordinator" ? (
          <Row>
            <Col></Col>
            <Col sm="auto" md="auto" lg="auto">
              <Button
                variant="uwa"
                onClick={(n) => setFilterActive("NodeUpdate")}
              >
                Update
              </Button>
            </Col>

            <Col sm="auto" md="auto" lg="auto">
              <Button
                variant="uwa"
                onClick={handleDelNodeShow.bind(this, unitnode.id)}
              >
                Delete
              </Button>
            </Col>
            <Col></Col>

            <DelNode id={unitnode.id} />
          </Row>
        ) : (
          <div></div>
        )}
      </Container>
    );
  };

  // UPDATE NODE COMPONENT
  const NodeUpdate = () => {
    var unitNode = searchforNode(currentId);
    var attributes = Object.keys(unitNode);
    console.log(
      "-----NodeUpdate Component -> Node: " + unitNode.displayName + "-----"
    );

    // const [nodeTypes, setNodeTypes] = useState([]);

    // console.log("-----SENDING [NodeUpdate - Get Node Labels]----- ");
    // useEffect(() => {
    //   httpClient
    //     .get("//localhost:5000/get_label", {})
    //     .then((dbData) => {
    //       console.log("   --STATUS [reload_data]: " + dbData.data.status);
    //       //setNodeTypes(dbData.data);
    //       if (dbData.data.status === "success") {
    //         setNodeTypes(dbData.data.data);
    //       }
    //       if (dbData.data.status === "error") {
    //         setErrorMessage(
    //           "[error]: Error getting Node Labels (neo4jDB.py/get_labels) "
    //         );
    //         handleErrorShow();
    //       }
    //       if (dbData.data.status === "request_error") {
    //         setErrorMessage(
    //           "[request_error]: Error getting GET Request (routes.py/get_label) "
    //         );
    //         handleErrorShow();
    //       }
    //     })
    //     .catch((error) => {
    //       setErrorMessage("Error");
    //       handleErrorShow();
    //     });
    // }, []);

    // var nodeTypeInputs = Object.keys(nodeTypes);

    // //const [selectedType, setSelectedType] = useState("default");
    const [nodeDetails, setNodeDetails] = useState(unitNode);

    // function listCheck(item) {
    //   for (var j = 0; j < data.nodes.length; j++) {
    //     for (var k = 0; k < data.nodes[j].labels.length; k++) {
    //       if (item === data.nodes[j].labels[k]) {
    //         return true;
    //       }
    //     }
    //   }
    //   return false;
    // }

    // const matchingTypes = nodeTypeInputs.filter(listCheck);

    for (let i = 0; i < unnecessaryHeadings.length; i++) {
      const index = attributes.indexOf(unnecessaryHeadings[i]);
      if (index > -1) {
        attributes.splice(index, 1);
      }
    }

    const index = attributes.indexOf("id");
    if (index > -1) {
      attributes.splice(index, 1);
    }

    return (
      <Container>
        <h2>NODE UPDATE</h2>

        <p className="txt-ctr">
          <b>Node ID:</b> {nodeDetails.id}
        </p>

        <p className="txt-ctr">
          <b>Node Label:</b> {nodeDetails.labels}
        </p>
        {/* <label>
          Label:
          <select
            value={nodeDetails["labels"]}
            onChange={(e) =>
              setNodeDetails({ ...nodeDetails, ["labels"]: e.target.value })
            }
          >
            {matchingTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </label> */}

        <Form>
          <Form.Group as={Row} className="mb-3">
            {attributes.map((attribute) => (
              <Row>
                <Col sm="auto" md={4} lg={4}>
                  <Form.Label>
                    <b>{attribute}:</b>
                  </Form.Label>
                </Col>

                <Col>
                  <Form.Control
                    // className = "mb-3"
                    value={nodeDetails[attribute]}
                    onChange={(e) =>
                      setNodeDetails({
                        ...nodeDetails,
                        [attribute]: e.target.value,
                      })
                    }
                  />
                </Col>
              </Row>
            ))}
          </Form.Group>
        </Form>

        <Row>
          <Col></Col>
          <Col sm="auto" md="auto" lg="auto">
            <Button
              variant="uwa"
              value="Submit"
              onClick={(e) => sendNodeUpdate(nodeDetails, unitNode.id)}
            >
              Submit
            </Button>
          </Col>

          <Col sm="auto" md="auto" lg="auto">
            <Button
              variant="uwa"
              onClick={handleDelNodeShow.bind(this, unitNode.id)}
            >
              Delete
            </Button>
          </Col>
          <Col></Col>
        </Row>

        <DelNode id={unitNode.id} />
      </Container>
    );
  };

  // READ LINK COMPONENT
  const LinkRead = () => {
    var unitlink = searchforLink(currentId);

    console.log(
      "-----LinkRead Component -> Link: " + unitlink.displayName + "-----"
    );

    var linkBodyData = {
      id: unitlink.property.id,
      labels: unitlink.labels,
      source: unitlink.source.id,
      target: unitlink.target.id,
    };
    var sourceBodyData = {
      id: unitlink.source.id,
      labels: unitlink.source.labels,
      displayName: unitlink.source.displayName,
    };
    var targetBodyData = {
      id: unitlink.target.id,
      labels: unitlink.target.labels,
      displayName: unitlink.target.displayName,
    };

    function handleUpdateLink() {
      setFilterActive("LinkUpdate");
      setSearchSourceId(unitlink.source.id);
      setSearchTargetId(unitlink.target.id);
    }
    return (
      <Container>
        <h2>LINK READ</h2>
        <Row>
          <Col>
            <b>Id:</b>
          </Col>
          <Col>{linkBodyData["id"]}</Col>
        </Row>
        <Row>
          <Col>
            <b>Label:</b>
          </Col>
          <Col>{linkBodyData["labels"]}</Col>
        </Row>

        <Row>
          <Col>
            <h2>SOURCE</h2>
          </Col>
        </Row>
        <Row>
          <Col>
            <b>Name:</b>
          </Col>{" "}
          <Col>{sourceBodyData["displayName"]}</Col>
        </Row>
        <Row>
          <Col>
            <b>Label:</b>
          </Col>{" "}
          <Col>{sourceBodyData["labels"]}</Col>
        </Row>
        <Row>
          <Col>
            <h2>TARGET</h2>
          </Col>
        </Row>
        <Row>
          <Col>
            <b>Name:</b>
          </Col>
          <Col>{targetBodyData["displayName"]}</Col>
        </Row>
        <Row>
          <Col>
            <b>Label:</b>
          </Col>{" "}
          <Col>{targetBodyData["labels"]}</Col>
        </Row>

        {userType === "UnitCoordinator" ? (
          <Row>
            <Col></Col>
            <Col sm="auto" md="auto" lg="auto">
              <Button variant="uwa" onClick={(n) => handleUpdateLink()}>
                Update
              </Button>
            </Col>

            <Col sm="auto" md="auto" lg="auto">
              <Button
                variant="uwa"
                onClick={handleDelLinkShow.bind(this, unitlink.property.id)}
              >
                Delete
              </Button>
            </Col>
            <Col></Col>
          </Row>
        ) : (
          <Row></Row>
        )}

        <DelLink id={unitlink.property.id} />
      </Container>
    );
  };

  // CREATE NODE INPUTS COMPONENT
  const NodeInputs = () => {
    console.log("-----NodeInputs Component [Node Create Inputs]-----");

    const [nodeDetails, setNodeDetails] = useState({ label: itemType });

    return (
      <Container>
        <h2>NODE CREATE INPUTS</h2>
        <p className="txt-ctr">
          <b>Chosen Type:</b> {nodeDetails["type"]}
        </p>

        <Form>
          <Form.Group as={Row} className="mb-3">
            {chosenType.map((input) => (
              <Row>
                <Col sm="auto" md={4} lg={4}>
                  <Form.Label>
                    <b>{input}:</b>
                  </Form.Label>
                </Col>

                <Col>
                  <Form.Control
                    value={nodeDetails[input]}
                    onChange={(e) =>
                      setNodeDetails({
                        ...nodeDetails,
                        [input]: e.target.value,
                      })
                    }
                  />
                </Col>
              </Row>
            ))}
          </Form.Group>
        </Form>

        <Row>
          <Col></Col>
          <Col>
            <Button variant="uwa" onClick={(e) => sendCreateNode(nodeDetails)}>
              Submit
            </Button>
          </Col>
          <Col></Col>
        </Row>
      </Container>
    );
  };

  // CREATE NODE COMPONENT
  const NodeCreate = () => {
    const [nodeTypes, setNodeTypes] = useState({});

    console.log("-----NodeCreate Component-----");

    console.log("-----SENDING [NodeUpdate - Get Node Labels]----- ");
    useEffect(() => {
      httpClient
        .get("//localhost:5000/get_label", {})
        .then((dbData) => {
          console.log("   --STATUS [reload_data]: " + dbData.data.status);
          //setNodeTypes(dbData.data);
          if (dbData.data.status === "success") {
            setNodeTypes(dbData.data.data);
          }
          if (dbData.data.status === "error") {
            setErrorMessage(
              "[error]: Error getting Node Labels (neo4jDB.py/get_labels) "
            );
            handleErrorShow();
          }
          if (dbData.data.status === "request_error") {
            setErrorMessage(
              "[request_error]: Error getting GET Request (routes.py/get_label) "
            );
            handleErrorShow();
          }
        })
        .catch((error) => {
          setErrorMessage("Error");
          handleErrorShow();
        });
    }, []);

    var nodeTypeInputs = Object.keys(nodeTypes);
    // console.log(nodeTypeInputs);
    // console.log(nodeTypes);

    const [selectedType, setSelectedType] = useState("Please choose a type...");

    function listCheck(item) {
      for (var j = 0; j < data.nodes.length; j++) {
        for (var k = 0; k < data.nodes[j].labels.length; k++) {
          if (item === data.nodes[j].labels[k]) {
            return true;
          }
        }
      }
      return false;
    }

    const matchingTypes = nodeTypeInputs.filter(listCheck);
    // console.log(matchingTypes);

    return (
      <Container>
        <h2>NODE CREATE</h2>
        <Row>
          <Col sm="auto" md="auto" lg="auto">
            <p>
              <b>Select Type:</b>
            </p>
          </Col>

          <Col sm={5} md={5} lg={5}>
            <Dropdown>
              <Dropdown.Toggle variant="uwa" id="dropdown-basic">
                {selectedType}
              </Dropdown.Toggle>
              <Dropdown.Menu>
                <Dropdown.Item
                  value="Please choose a type..."
                  disabled={true}
                  className="dd-uwa"
                ></Dropdown.Item>
                {matchingTypes.map((type) => (
                  <Dropdown.Item
                    className="dd-uwa"
                    key={type}
                    value={type}
                    onClick={(e) => setSelectedType(type)}
                  >
                    {type}
                  </Dropdown.Item>
                ))}
              </Dropdown.Menu>
            </Dropdown>
          </Col>
        </Row>
        <Row>
          <Col></Col>
          <Col sm="auto" md="auto" lg="auto">
            <Button
              variant="uwa"
              onClick={(e) => {
                if (selectedType !== "Please choose a type...") {
                  getInputs(nodeTypes[selectedType], "NODE", selectedType);
                }
              }}
            >
              Submit
            </Button>
          </Col>
          <Col></Col>
        </Row>
      </Container>
    );
  };

  // CREATE LINK INPUTS COMPONENT
  const LinkInputs = () => {
    console.log("-----NodeInputs Component [Node Create Inputs]-----");

    function getSource(id) {
      var node = searchforNode(id);
      if (node == "not found") {
        return "";
      } else {
        return node.displayName;
      }
    }

    return (
      <Container>
        <p className="txt-ctr">
          <b>Chosen Type:</b> {itemType}
        </p>

        <Form>
          <Form.Group as={Row} className="mb-3">
            <Row>
              <Col>
                <Form.Label>
                  <b>Source ID:</b> {searchforNode(searchSourceId).displayName}
                </Form.Label>
              </Col>
            </Row>
            <Row>
              <Col></Col>
              <Col>
                <Button
                  variant="uwa"
                  onClick={(e) => setSearchActive("source")}
                >
                  Select Source
                </Button>
              </Col>
              <Col></Col>
            </Row>
          </Form.Group>
        </Form>

        <h3 className="txt-ctr">TARGET UPDATE</h3>

        <Form>
          <Form.Group as={Row} className="mb-3">
            <Row>
              <Col>
                <Form.Label>
                  <b>Target ID:</b> {searchforNode(searchTargetId).displayName}
                </Form.Label>
              </Col>
            </Row>
            <Row>
              <Col></Col>
              <Col>
                <Button
                  variant="uwa"
                  onClick={(e) => setSearchActive("target")}
                >
                  Select Destination
                </Button>
              </Col>
              <Col></Col>
            </Row>
          </Form.Group>
        </Form>

        <Row>
          <Col></Col>
          <Col sm="auto" md="auto" lg="auto">
            <Button
              variant="uwa"
              onClick={(e) => {
                sendCreateLink(itemType, searchSourceId, searchTargetId);
              }}
            >
              Submit
            </Button>
          </Col>
          <Col></Col>
        </Row>
      </Container>
    );
  };

  // CREATE LINK COMPONENT
  const LinkCreate = () => {
    const [linkTypes, setLinkTypes] = useState([]);

    console.log("-----LinkCreate Component-----");
    console.log("-----SENDING [LinkCreate - Get Link Labels]----- ");

    useEffect(() => {
      httpClient
        .get("//localhost:5000/get_relationship", {})
        .then((dbData) => {
          console.log("   --STATUS [reload_data]: " + dbData.data.status);
          //setNodeTypes(dbData.data);
          if (dbData.data.status === "success") {
            setLinkTypes(dbData.data.data);
          }
          if (dbData.data.status === "error") {
            setErrorMessage(
              "[error]: Error getting Node Labels (neo4jDB.py/get_relationship) "
            );
            handleErrorShow();
          }
          if (dbData.data.status === "request_error") {
            setErrorMessage(
              "[request_error]: Error getting GET Request (routes.py/get_relationship) "
            );
            handleErrorShow();
          }
        })
        .catch((error) => {
          setErrorMessage("Error");
          handleErrorShow();
        });
    }, []);

    const [selectedType, setSelectedType] = useState("Please choose a type...");

    // console.log(linkTypes);
    // console.log(selectedType);

    function listCheck(item) {
      for (var j = 0; j < data.links.length; j++) {
        if (item === data.links[j].labels) {
          return true;
        }
      }
      return false;
    }

    const matchingTypes = linkTypes.filter(listCheck);

    //setLinkTypes(matchingTypes);

    return (
      <Container>
        <h2>LINK CREATE</h2>

        <Row>
          <Col sm="auto" md="auto" lg="auto">
            <p>
              <b>Select Type:</b>
            </p>
          </Col>

          <Col sm={5} md={5} lg={5}>
            <Dropdown>
              <Dropdown.Toggle variant="uwa" id="dropdown-basic">
                {selectedType}
              </Dropdown.Toggle>
              <Dropdown.Menu>
                <Dropdown.Item
                  value="Please choose a type..."
                  className="dd-uwa"
                  disabled={true}
                ></Dropdown.Item>
                {matchingTypes.map((type) => (
                  <Dropdown.Item
                    className="dd-uwa"
                    key={type}
                    value={type}
                    onClick={(e) => setSelectedType(type)}
                  >
                    {type}
                  </Dropdown.Item>
                ))}
              </Dropdown.Menu>
            </Dropdown>
          </Col>
        </Row>
        <Row>
          <Col></Col>
          <Col sm="auto" md="auto" lg="auto">
            <Button
              variant="uwa"
              onClick={(e) => {
                if (selectedType !== "Please choose a type...") {
                  getInputs("", "LINK", selectedType);
                }
              }}
            >
              Submit
            </Button>
          </Col>
          <Col></Col>
        </Row>
      </Container>
    );
  };

  const LinkUpdate = () => {
    var unitLink = searchforLink(currentId);

    console.log(
      "-----LinkUpdate Component => Link: " + unitLink.displayName + "-----"
    );

    // const [sourceDetails, setSourceDetails] = useState(unitLink.source);
    // const [targetDetails, setTargetDetails] = useState(unitLink.target);
    const [linkDetails, setLinkDetails] = useState(unitLink);

    var properties = Object.keys(unitLink);
    var sourceProp = Object.keys(unitLink.source);
    var targetProp = Object.keys(unitLink.target);

    for (let i = 0; i < unnecessaryHeadings.length; i++) {
      const index = sourceProp.indexOf(unnecessaryHeadings[i]);
      if (index > -1) {
        sourceProp.splice(index, 1);
      }
    }

    for (let i = 0; i < unnecessaryHeadings.length; i++) {
      const index = targetProp.indexOf(unnecessaryHeadings[i]);
      if (index > -1) {
        targetProp.splice(index, 1);
      }
    }

    //console.log(linkTypes);

    const index = properties.indexOf("id");
    if (index > -1) {
      // only splice array when item is found
      properties.splice(index, 1); // 2nd parameter means remove one item only
    }

    return (
      <Container>
        <h2>LINK UPDATE</h2>

        <Row>
          <Col sm={6} md={6} lg={3}>
            <b>Link ID:</b>
          </Col>
          <Col> {unitLink.property.id}</Col>
        </Row>
        <Row>
          <Col sm={6} md={6} lg={3}>
            <b>Link Labels:</b>{" "}
          </Col>
          <Col>{unitLink.labels}</Col>
        </Row>

        <h3 className="txt-ctr">SOURCE UPDATE</h3>

        <Form>
          <Form.Group as={Row} className="mb-3">
            <Row>
              <Col>
                <Form.Label>
                  <b>Source ID:</b> {searchforNode(searchSourceId).displayName}
                </Form.Label>
              </Col>
            </Row>
            <Row>
              <Col></Col>
              <Col>
                <Button
                  variant="uwa"
                  onClick={(e) => setSearchActive("source")}
                >
                  Select Source
                </Button>
              </Col>
              <Col></Col>
            </Row>
          </Form.Group>
        </Form>

        <h3 className="txt-ctr">TARGET UPDATE</h3>

        <Form>
          <Form.Group as={Row} className="mb-3">
            <Row>
              <Col>
                <Form.Label>
                  <b>Target ID:</b> {searchforNode(searchTargetId).displayName}
                </Form.Label>
              </Col>
            </Row>
            <Row>
              <Col></Col>
              <Col>
                <Button
                  variant="uwa"
                  onClick={(e) => setSearchActive("target")}
                >
                  Select Destination
                </Button>
              </Col>
              <Col></Col>
            </Row>
          </Form.Group>
        </Form>

        <Row>
          <Col></Col>
          <Col sm="auto" md="auto" lg="auto">
            <Button
              variant="uwa"
              onClick={(e) =>
                sendLinkUpdate(
                  unitLink.labels,
                  searchSourceId,
                  searchTargetId,
                  unitLink.property.id
                )
              }
            >
              Submit
            </Button>
          </Col>

          <Col sm="auto" md="auto" lg="auto">
            <Button
              variant="uwa"
              onClick={handleDelLinkShow.bind(this, unitLink.property.id)}
            >
              Delete
            </Button>
          </Col>
          <Col></Col>
        </Row>

        <DelLink id={unitLink.property.id} />
      </Container>
    );
  };

  // CREATE NODE & LINK COMPONENT
  const Create = () => {
    console.log("-----Create Component-----");

    return (
      <Container>
        {userType === "UnitCoordinator" ? (
          <Row>
            <h2>CREATE</h2>
            <Col></Col>
            <Col sm="auto" md="auto" lg="auto">
              <Button
                variant="uwa"
                onClick={(n) => setFilterActive("NodeCreate")}
              >
                Create Node
              </Button>
            </Col>

            <Col sm="auto" md="auto" lg="auto">
              <Button
                variant="uwa"
                onClick={(n) => {
                  setSearchSourceId(-1);
                  setSearchTargetId(-1);
                  setFilterActive("LinkCreate");
                }}
              >
                Create Link
              </Button>
            </Col>
            <Col></Col>
          </Row>
        ) : (
          <Row></Row>
        )}
      </Container>
    );
  };

  function getWidth() {
    if (crudActive === false && tableActive === false) {
      return window.innerWidth * 0.85;
    }
    return window.innerWidth * 0.6;
  }

  function getHeight() {
    return window.innerHeight * 0.7;
  }

  const [dataInCSV, setDataInCSV] = useState("");
  useEffect(() => {
    httpClient
      .post("//localhost:5000/csv", { query: query })
      .then((res) => setDataInCSV(res.data));
  }, []);

  const longestDisplayNameWord = getLongestLabel();
  function getLongestLabel() {
    var longestLength = 0;
    for (var i = 0; i < data.nodes.length; i++) {
      var currentNodeWords = data.nodes[i].displayName.split(" ");
      var longestWord = 0;
      for (var j = 0; j < currentNodeWords.length; j++) {
        if (currentNodeWords[j].length > longestWord) {
          longestWord = currentNodeWords[j].length;
        }
      }
      if (longestWord > longestLength) {
        longestLength = longestWord;
      }
    }
    return longestLength;
  }

  // LEGEND COMPONENT
  const Canvas = ({ draw, height, width }) => {
    const canvas = React.useRef();

    React.useEffect(() => {
      const context = canvas.current.getContext("2d");
      draw(context);
    });

    return <canvas ref={canvas} height={height} width={width} />;
  };

  Canvas.propTypes = {
    draw: PropTypes.func.isRequired,
    height: PropTypes.number.isRequired,
    width: PropTypes.number.isRequired,
  };

  const legend = (ctx) => {
    ctx.beginPath();
    ctx.fillStyle = "brown";
    ctx.arc(10, 30, 10, 0, 2 * Math.PI);
    ctx.fill();
    ctx.font = "15px Helvetica Neue";
    ctx.fillStyle = "black";
    ctx.fillText("Unit", 25, 35);
    ctx.closePath();

    ctx.beginPath();
    ctx.fillStyle = "orange";
    ctx.arc(70, 30, 10, 0, 2 * Math.PI);
    ctx.fill();
    ctx.font = "15px Helvetica Neue";
    ctx.fillStyle = "black";
    ctx.fillText("CBoK - End", 85, 35);
    ctx.closePath();

    ctx.beginPath();
    ctx.fillStyle = "green";
    ctx.arc(180, 30, 10, 0, 2 * Math.PI);
    ctx.fill();
    ctx.font = "15px Helvetica Neue";
    ctx.fillStyle = "black";
    ctx.fillText("Outcome", 195, 35);
    ctx.closePath();

    ctx.beginPath();
    ctx.fillStyle = "blue";
    ctx.arc(280, 30, 10, 0, 2 * Math.PI);
    ctx.fill();
    ctx.font = "15px Helvetica Neue";
    ctx.fillStyle = "black";
    ctx.fillText("AQF Category", 295, 35);
    ctx.closePath();

    ctx.beginPath();
    ctx.fillStyle = "pink";
    ctx.arc(410, 30, 10, 0, 2 * Math.PI);
    ctx.fill();
    ctx.font = "15px Helvetica Neue";
    ctx.fillStyle = "black";
    ctx.fillText("AQF Outcome", 425, 35);
    ctx.closePath();

    ctx.beginPath();
    ctx.fillStyle = "purple";
    ctx.arc(540, 30, 10, 0, 2 * Math.PI);
    ctx.fill();
    ctx.font = "15px Helvetica Neue";
    ctx.fillStyle = "black";
    ctx.fillText("Sub", 555, 35);
    ctx.closePath();

    ctx.beginPath();
    ctx.fillStyle = "red";
    ctx.arc(600, 30, 10, 0, 2 * Math.PI);
    ctx.fill();
    ctx.font = "15px Helvetica Neue";
    ctx.fillStyle = "black";
    ctx.fillText("CBOK - Top", 615, 35);
    ctx.closePath();
  };

  let hoverNode = null;
  let hoverLink = null;

  //-----------------------------------------------------------------------------------RETURN
  return (
    <div>
      <div className="color-block">
        <Container>
          <Col>
            <Button variant="uwa" onClick={toggleTable}>
              <IconContext.Provider value={{ size: 42 }}>
                <ImTable />
              </IconContext.Provider>{" "}
            </Button>

            {/* ={n => setFilterActive("NodeUpdate")} */}
            {dataInCSV && (
              <a
                href={`data:text/csv;charset=utf-8,${escape(dataInCSV)}`}
                download="filename.csv"
              >
                <Button variant="uwa">
                  <IconContext.Provider value={{ size: 42 }}>
                    <FaFileCsv />
                  </IconContext.Provider>
                </Button>
              </a>
            )}
            <Canvas draw={legend} height={50} width={800} />
          </Col>

          <Row>
            <Offcanvas
              show={tableActive}
              onHide={closeTable}
              placement={"end"}
              backdrop={false}
              scrol={true}
            >
              <Offcanvas.Header closeButton>
                <Offcanvas.Title>Tabular View</Offcanvas.Title>
              </Offcanvas.Header>
              <Offcanvas.Body>
                <AllDataTable data={data} />
              </Offcanvas.Body>
            </Offcanvas>

            <Offcanvas
              show={crudActive}
              onHide={closeCrudTable}
              placement={"end"}
              backdrop={false}
              scrol={true}
            >
              <Offcanvas.Header closeButton>
                <Offcanvas.Title>CRUD Commands</Offcanvas.Title>
              </Offcanvas.Header>
              <Offcanvas.Body>
                {filterActive === "NodeRead" && <NodeRead />}
                {filterActive === "LinkRead" && <LinkRead />}
                {filterActive === "Create" && <Create />}

                {filterActive === "NodeUpdate" && <NodeUpdate />}
                {filterActive === "NodeCreate" && <NodeCreate />}
                {filterActive === "NodeInputs" && <NodeInputs />}
                {filterActive === "LinkUpdate" && <LinkUpdate />}
                {filterActive === "LinkCreate" && <LinkCreate />}
                {filterActive === "LinkInputs" && <LinkInputs />}
              </Offcanvas.Body>
            </Offcanvas>
          </Row>

          <div className="container-fluid row xs=2 md=2 lg=2">
            <div className="col">
              <ForceGraph2D
                graphData={data}
                width={getWidth()}
                height={getHeight()}
                autoPauseRedraw={false}
                nodeVal={12}
                nodeLabel={"displayName"}
                nodeCanvasObjectMode={() => "after"}
                onNodeHover={(node) => {
                  hoverNode = node || null;
                }}
                onLinkHover={(link) => {
                  hoverLink = link || null;
                }}
                linkWidth={(link) => {
                  if (link == hoverLink) {
                    return 6;
                  } else {
                    return 3;
                  }
                }}
                nodeCanvasObject={(node, ctx) => {
                  if (node == hoverNode) {
                    ctx.beginPath();
                    ctx.arc(node.x, node.y, 12 * 1.4, 0, 2 * Math.PI, false);
                    ctx.strokeStyle = "#E37383";
                    ctx.lineWidth = 5;
                    ctx.stroke();
                    ctx.fill();
                  }
                  const label = node.displayName;

                  const OFFSET = 1.5;

                  const labelWords = label.split(" ");
                  var longestWordIndex = 0;
                  for (var i = 0; i < labelWords.length; i++) {
                    if (
                      labelWords[i].length > labelWords[longestWordIndex].length
                    ) {
                      longestWordIndex = i;
                    }
                  }
                  const fontSize = (4 * (12 - OFFSET)) / longestDisplayNameWord;
                  ctx.font = `${fontSize}px Sans-Serif`;

                  const yIncrements = 12 / (labelWords.length - 1);

                  const startingY =
                    node.y - yIncrements * ((labelWords.length - 1) / 2);

                  if (labelWords.length === 1) {
                    ctx.textAlign = "center";
                    ctx.textBaseline = "middle";
                    ctx.fillStyle = "black"; //node.color;
                    ctx.fillText(label, node.x, node.y);
                  } else {
                    for (var k = 0; k < labelWords.length; k++) {
                      ctx.textAlign = "center";
                      ctx.textBaseline = "middle";
                      ctx.fillStyle = "black"; //node.color;
                      ctx.fillText(
                        labelWords[k],
                        node.x,
                        startingY + k * yIncrements
                      );
                    }
                  }
                }}
                // PUT AN ATTRIBUTE FOR LINK COLOR
                //linkColor={"black"}
                linkDirectionalArrowLength={6}
                linkDirectionalArrowRelPos={1}
                //linkDirectionalArrowColor={"black"}
                //linkCanvasObjectMode={(() => 'after')}
                linkCanvasObjectMode={() => "after"}
                linkCanvasObject={(link, ctx) => {
                  const MAX_FONT_SIZE = 4;
                  const LABEL_NODE_MARGIN = 1.5;

                  const start = link.source;
                  const end = link.target;

                  // ignore unbound links
                  if (typeof start !== "object" || typeof end !== "object")
                    return;

                  // calculate label positioning
                  const textPos = Object.assign(
                    ...["x", "y"].map((c) => ({
                      [c]: start[c] + (end[c] - start[c]) / 2, // calc middle point
                    }))
                  );

                  const relLink = { x: end.x - start.x, y: end.y - start.y };

                  const maxTextLength =
                    Math.sqrt(Math.pow(relLink.x, 2) + Math.pow(relLink.y, 2)) -
                    LABEL_NODE_MARGIN * 2;

                  let textAngle = Math.atan2(relLink.y, relLink.x);
                  // maintain label vertical orientation for legibility
                  if (textAngle > Math.PI / 2)
                    textAngle = -(Math.PI - textAngle);
                  if (textAngle < -Math.PI / 2)
                    textAngle = -(-Math.PI - textAngle);

                  const label = link.displayName;

                  // estimate fontSize to fit in link length
                  const fontSize = Math.min(
                    MAX_FONT_SIZE,
                    maxTextLength / ctx.measureText(label).width
                  );
                  ctx.font = `${fontSize}px Sans-Serif`;

                  ctx.save();
                  ctx.translate(textPos.x, textPos.y);
                  ctx.rotate(textAngle);

                  ctx.textAlign = "center";
                  ctx.textBaseline = "middle";
                  ctx.fillStyle = "black";
                  ctx.fillText(label, 0, 0);
                  ctx.restore();
                }}
                onNodeDragEnd={(node) => {
                  node.fx = node.x;
                  node.fy = node.y;
                  node.fz = node.z;
                }}
                cooldownTicks={100}
                onEngineStop={() => forceRef.current.zoomToFit(400)}
                onNodeClick={(node) => handleNodeClick(node)}
                onLinkClick={(link) => handleLinkClick(link)}
                onBackgroundClick={(i) => handleBackgroundClick(i)}
                linkCurvature="curvature"
                enablePointerInteraction={true}
                linkDirectionalParticleWidth={1}
                ref={forceRef}
              />
            </div>
          </div>
        </Container>
        <Modal show={showErrorModal} onHide={handleErrorClose}>
          <Modal.Header closeButton>
            <Modal.Title>Error</Modal.Title>
          </Modal.Header>
          <Modal.Body>{errorMessage}</Modal.Body>
          <Modal.Footer></Modal.Footer>
        </Modal>
      </div>
    </div>
  );
};

export default queryDisplay;
