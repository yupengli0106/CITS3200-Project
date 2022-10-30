import React, { useState, useEffect } from "react";
import httpClient from "./httpClient.js";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Dropdown from "react-bootstrap/Dropdown";
import { QueryDisplay } from "./index.js";
import Modal from "react-bootstrap/Modal";


var response = {};

const basicQueries = [
  {
    Name: "All CBoK levels",
    Query:
      "MATCH (e:CBoK:End)<-[r:INCLUDES]-(s:CBoK:Sub {area:'ICT Management'}) RETURN e,r,s",
  },
  {
    Name: "ICT Management",
    Query:
      "MATCH (e:CBoK:End)<-[r1:INCLUDES]-(s:CBoK:Sub)<-[r2:INCLUDES]-(t:CBoK:Top {area:'General ICT Knowledge'}) RETURN e,r1,s,r2,t",
  },
  {
    Name: "General ICT Knowledge",
    Query:
      "MATCH (e:CBoK:End)<-[r1:INCLUDES]-(s:CBoK:Sub)<-[r2:INCLUDES]-(t:CBoK:Top {area:'General ICT Knowledge'}) RETURN e,r1,s,r2,t",
  },
  {
    Name: "Essential Core ICT Knwoledge",
    Query:
      "MATCH (s:CBoK:Sub)<-[r:INCLUDES]-(t:CBoK:Top {area:'Essential Core ICT Knowledge'}) RETURN s,r,t",
  },
  {
    Name: "CITS5206 Activities",
    Query:
      "MATCH (u:Unit {unitCode: 'CITS5206'})<-[r:ACTIVITY_OF]-(a:Activity) RETURN u,r,a",
  },
  {
    Name: "CITS5206 Activites + Mapping to end levels",
    Query:
      "MATCH (u:Unit {unitCode: 'CITS5206'})<-[r1:ACTIVITY_OF]-(a:Activity)<-[r2:MAPS_TO]-(c:CBoK:End) RETURN u,r1,a,r2,c",
  },
  {
    Name: "CITS5206 Activites + Mapping to sub levels",
    Query:
      "MATCH (u:Unit {unitCode: 'CITS5206'})<-[r1:ACTIVITY_OF]-(a:Activity)<-[r2:MAPS_TO]-(e:CBoK:End)<-[r3:INCLUDES]-(s:CBoK:Sub) RETURN u,r1,a,r2,e,r3,s",
  },
  {
    Name: "CITS1001 mapping to Systems Acquisition",
    Query:
      "MATCH (u:Unit {unitCode: 'CITS1001'})<-[r1:ACTIVITY_OF]-(a:Activity)<-[r2:MAPS_TO]-(c:CBoK:End {area: 'Systems acquisition'}) RETURN u,r1,a,r2,c",
  },
  {
    Name: "CITS1001 Activites mapping to Technology Resource",
    Query:
      "MATCH (u:Unit {unitCode: 'CITS1001'})<-[r1:ACTIVITY_OF]-(a:Activity)<-[r2:MAPS_TO]-(e:CBoK:End)<-[r3:INCLUDES]-(s:CBoK:Sub {area:'Technology Resource'}) RETURN u,r1,a,r2,e,r3,s",
  },
  {
    Name: "Units with Cybersecurity Activities",
    Query:
      "MATCH (u:Unit)<-[r1:ACTIVITY_OF]-(a:Activity)<-[r2:MAPS_TO]-(c:CBoK:End {area:'Cyber security'}) RETURN u",
  },
  {
    Name: "Units that map to ICT Management",
    Query:
      "MATCH (u:Unit)<-[r1:ACTIVITY_OF]-(a:Activity)<-[r2:MAPS_TO]-(e:CBoK:End)<-[r3:INCLUDES]-(s:CBoK:Sub {area:'ICT Management'}) RETURN u",
  },
  {
    Name: "Units that map to General ICT Knowledge",
    Query:
      "MATCH (u:Unit)<-[r1:ACTIVITY_OF]-(a:Activity)<-[r2:MAPS_TO]-(e:CBoK:End)<-[r3:INCLUDES]-(s:CBoK:Sub)<-[r4:INCLUDES]-(t:CBoK:Top {area:'General ICT Knowledge'}) RETURN u",
  },
  {
    Name: "Units and Activities that map to Cybersecurity",
    Query:
      "MATCH (u:Unit)<-[r1:ACTIVITY_OF]-(a:Activity)<-[r2:MAPS_TO]-(c:CBoK:End {area:'Cyber security'}) RETURN u,r1,a LIMIT 5",
  },
  {
    Name: "CITS4009 Unit Outcomes",
    Query:
      "MATCH (u:Unit{unitCode:'CITS4009'}), OPTIONAL MATCH r=(u)-[:Unit_Outcome]-(:Outcome), RETURN r",
  },
  {
    Name: "CITS4009 Activity and Outcome Relationships",
    Query:
      "MATCH (u:Unit{unitCode:'CITS4009'}),(a:Activity), OPTIONAL MATCH r=(a)-[:How_outcome_will_be_assessed]-(:Outcome), RETURN r",
  },
  {
    Name: "MIT AQF relationships",
    Query:
      "MATCH (p:Program),(c:AQFcategory),(o:AQFoutcome), WHERE p.abbreviation='MIT' , RETURN p,c,o;",
  },
];

const Query = () => {
  //-----------------------------------------------------------------------------------GLOBAL VARIABLES

  // const navigate = useNavigate();
  const [userType, setUserType] = useState("BasicUser");
  const [query, setQuery] = useState("");
  const [graphActive, setGraphActive] = useState("noGraph");

  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleErrorClose = () => {
    setErrorMessage("");
    setShowErrorModal(false);
  };
  const handleErrorShow = () => setShowErrorModal(true);

  useEffect(() => {
    (async () => {
      try {
        const resp = await httpClient.get("//localhost:5000/@me");

        if (resp.data.isCoordinator === true) {
          setUserType("UnitCoordinator");
        }
      } catch (error) {
        console.log("No Current User Logged In");
      }
    })();
  }, []);

  //-----------------------------------------------------------------------------------FUNCTIONS
  // EXECUTE & QUERY AND GET THE RETURN DATA
  const executeQuery = async (query) => {
    setQuery(query);
    try {
      const dbData = await httpClient.post("//localhost:5000/query", {
        query,
      });

      if (dbData.data.status === "success") {
        response = JSON.parse(JSON.stringify(dbData.data.data));
        Object.freeze(response);
        setGraphActive("haveData");
      }
      if (dbData.data.status === "request_error") {
        setErrorMessage(
          "[request_error]: Error Receiving Query Request (routes.py) "
        );
        handleErrorShow();
      }
      if (dbData.data.status === "joltAPI_error") {
        setErrorMessage(
          "[joltAPI_error]: Error Accessing Neo4jDB (neo4jDB.py) "
        );
        handleErrorShow();
      }
      if (dbData.data.status === "empty_data") {
        setErrorMessage("[empty_data]: Error Executing Query (api.py) ");
        handleErrorShow();
      }
    } catch (e) {
      setErrorMessage("Error");
      handleErrorShow();
    }
  };

  if (graphActive === "haveData") {
    console.log(response);
    setGraphActive("showGraph");
    console.log(query);
  }
  //-----------------------------------------------------------------------------------RETURN
  return (
    <div>
      {userType === "UnitCoordinator" ? (
        <>
          <Container>
            <Row>
              <Col>
                <h3 className="font-weight-light">QUERY </h3>
              </Col>
            </Row>
            <Row>
              <Col sm={8} lg={8}>
                {graphActive !== "showGraph" && (
                  <Form.Control
                    className="mb-3"
                    placeholder="Enter query"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                  />
                )}
              </Col>
              <Col>
                {graphActive !== "showGraph" && (
                  <Dropdown>
                    <Dropdown.Toggle variant="uwa" id="dropdown-basic">
                      Basic Query{" "}
                    </Dropdown.Toggle>

                    <Dropdown.Menu>
                      {basicQueries.map((q) => (
                        <Dropdown.Item
                          className="dd-uwa"
                          onClick={() => setQuery(q.Query)}
                        >
                          {q.Name}
                        </Dropdown.Item>
                      ))}
                    </Dropdown.Menu>
                  </Dropdown>
                )}
              </Col>
              <Col>
                {graphActive !== "showGraph" && (
                  <Button variant="uwa" onClick={() => executeQuery(query)}>
                    Submit
                  </Button>
                )}
              </Col>
            </Row>

            <Row>
              <Col>
                {graphActive === "showGraph" && (
                  <QueryDisplay inputData={response} query={query} />
                )}
              </Col>
            </Row>
          </Container>

          <Modal show={showErrorModal} onHide={handleErrorClose}>
            <Modal.Header closeButton>
              <Modal.Title>Error</Modal.Title>
            </Modal.Header>
            <Modal.Body>{errorMessage}</Modal.Body>
            <Modal.Footer></Modal.Footer>
          </Modal>
        </>
      ) : (
        <>
          <h1 className="txt-ctr">
            You are not a unitCoordinator, please contact an administrator for
            assistance!
          </h1>
        </>
      )}
    </div>
  );
};

export default Query;
