import React, { useState, useEffect } from "react";
import httpClient from "./httpClient";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";

const Home = () => {
  // const [user, setUser] = useState(null);
  const [userType, setUserType] = useState("BasicUser");
  const [userLoggedIn, setUserLoggedIn] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const resp = await httpClient.get("//localhost:5000/@me");
        //   setUser(resp.data);

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

  return (
    <Container>
      <Row>
        <h1 className="txt-ctr">Welcome to the Curriculum Mapper</h1>
        <h5 className="txt-ctr">
          This is an online graph database that provides an interactive
          visualisation of an academic program and its accreditation material{" "}
        </h5>
      </Row>
      {userLoggedIn === true ? (
        // LOGGED IN

        <Container>
          <Row>
            <h2 className="txt-ctr txt-uwab">Logged in</h2>
          </Row>
        </Container>
      ) : (
        // NOT LOGGED IN
        <Container>
          <Row>
            <h2 className="txt-ctr txt-uwab">You are not logged in</h2>
          </Row>
        </Container>
      )}
    </Container>
  );
};

export default Home;
