import React, { useState, useEffect } from "react";

import httpClient from "./httpClient.js";
import logo from "./images/uwa.png";

import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";

import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";

import { IconContext } from "react-icons";
import { IoLogInSharp } from "react-icons/io5";
import { BsPersonCircle } from "react-icons/bs";
import { AiFillPlusCircle } from "react-icons/ai";

import * as yup from "yup";
import { setNestedObjectValues, useFormik } from "formik";

const Navigation = () => {
  const [userType, setUserType] = useState("BasicUser");
  const [userAdmin, setUserAdmin] = useState(false);
  const [userLoggedIn, setUserLoggedIn] = useState(false);
  const [userName, setUserName] = useState("");

  const [showLogin, setLoginShow] = useState(false);
  const [showRegister, setRegisterShow] = useState(false);

  const [showAdmin, setAdminShow] = useState(false);
  const [changeUser, setChangeUser] = useState({ email: "", whiteList: false });
  const [makeCoordinatorEmail, setMakeCoordinatorEmail] = useState("");
  const [whiteList, setWhiteList] = useState(false);

  const handleLoginClose = () => {
    setLoginShow(false);
    setRegisterShow(false);
  };
  const handleLoginShow = () => {
    setLoginShow(true);
    setRegisterShow(false);
  };

  const handleAdminClose = () => {
    setAdminShow(false);
  };
  const handleAdminShow = () => {
    setAdminShow(true);
  };

  const handleRegisterClose = () => {
    setLoginShow(false);
    setRegisterShow(false);
  };
  const handleRegisterShow = () => {
    setLoginShow(false);
    setRegisterShow(true);
  };

  // ERROR MODAL
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleErrorClose = () => {
    setErrorMessage("");
    setShowErrorModal(false);
  };
  const handleErrorShow = () => {
    setShowErrorModal(true);
  };

  useEffect(() => {
    (async () => {
      try {
        const resp = await httpClient.get("//localhost:5000/@me");
        //    setUser(resp.data);

        if (resp.data.isCoordinator === true) {
          setUserType("UnitCoordinator");
        }

        if (resp.data.isAdmin === true) {
          setUserAdmin(true);
        }

        if (resp.data.loggedIn === true) {
          setUserLoggedIn(true);
          setUserName(resp.data.username);
        }
      } catch (error) {
        console.log("No Current User Logged In");
      }
    })();
  }, []);

  const logoutUser = async () => {
    try {
      const dbData = await httpClient.post("//localhost:5000/logout", {});
      console.log("   --STATUS [Logout]: " + dbData.data.status);

      if (dbData.data.status === "lougout_success") {
        window.location.href = "/home";
      }
      if (dbData.data.status === "logout_error") {
        setErrorMessage(
          "[logout_error]: Error Logging Out Users (sqliteDB.py - /logout) "
        );
        handleErrorShow();
      }
    } catch (error) {
      setErrorMessage("Error [Logout Componenet]");
      handleErrorShow();
    }
  };

  const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    /*
    const logInUser = async () => {
      console.log(email, password);

      try {
        const resp = await httpClient.post("//localhost:5000/login", {
          email,
          password,
        });
        console.log(resp.data);

        window.location.href = "/home";
      } catch (error) {
        if (error.response.status === 401) {
          alert("Invalid credentials");
        }
      }
    };
*/

    const logInUser = async (email, password) => {
      console.log("-----SENDING [logInUser]: " + email + password);
      try {
        const dbData = await httpClient.post("//localhost:5000/login", {
          email,
          password,
        });
        console.log("   --STATUS [Login]: " + dbData.data.status);

        if (
          dbData.data.status === "basic_user" ||
          "admin_user" ||
          "coordinator_user"
        ) {
          handleLoginClose();
          window.location.href = "/home";
        }
        if (dbData.data.status === "request_error") {
          handleLoginClose();
          setErrorMessage(
            "[request_error]: Error Receiving POST Request (routes.py - /login) "
          );
          handleErrorShow();
        }
        if (dbData.data.status === "password_error") {
          handleLoginClose();
          setErrorMessage(
            "[password_error]: Password Error (sqliteDB.py - /login) "
          );
          handleErrorShow();
        }
        if (dbData.data.status === "user_not_exist") {
          handleLoginClose();
          setErrorMessage(
            "[user_not_exist]: User does not exist (sqliteDB.py - /login) "
          );
          handleErrorShow();
        }
        if (dbData.data.status === "login_error") {
          handleLoginClose();
          setErrorMessage(
            "[login_error]: Log in error (sqliteDB.py - /login) "
          );
          handleErrorShow();
        }
      } catch (error) {
        setErrorMessage("Error [Login Componenet]");
        handleErrorShow();
      }
    };

    return (
      <Container>
        <Row>
          <Form>
            <Form.Group as={Row} className="mb-3">
              <Form.Label column sm={6} lg={{ span: 4, offset: 1 }}>
                Email Address:{" "}
              </Form.Label>

              <Col sm={6} lg={{ span: 5, offset: 1 }}>
                <Form.Control
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </Col>
            </Form.Group>

            <Form.Group as={Row} className="mb-3" controlID="formBasicPassword">
              <Form.Label column sm={6} lg={{ span: 4, offset: 1 }}>
                Password:{" "}
              </Form.Label>

              <Col sm={6} lg={{ span: 5, offset: 1 }}>
                <Form.Control
                  placeholder="Password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </Col>
            </Form.Group>

            <Row>
              <Button variant="uwa" onClick={() => logInUser(email, password)}>
                Login
              </Button>
              <Button variant="uwa" onClick={handleRegisterShow}>
                Register
              </Button>
            </Row>
          </Form>
        </Row>
      </Container>
    );
  };

  const sendEmail = async (email) => {
    try {
      const dbData = await httpClient.post("//localhost:5000/send_mail", {
        message: email,
      });

      console.log("   --STATUS [MakeAdmin]: " + dbData.data.status);

      if (dbData.data.status === "send_success") {
        handleRegisterClose();
      }
      if (dbData.data.status === "send_failed") {
        handleRegisterClose();
        setErrorMessage(
          "[send_failed]: Email send to admin failed (routes.py - ) /send_mail"
        );
        handleErrorShow();
      }
      if (dbData.data.status === "request_error") {
        setErrorMessage(
          "[request_error]: Error receiving POST request (routes.py - /send_mail) "
        );
        handleErrorShow();
      }
    } catch (error) {
      setErrorMessage("Error [Send Email Componenet]");
      handleErrorShow();
    }
  };

  function Register() {
    const formik = useFormik({
      initialValues: {
        username: "",
        email: "",
        isCoordinator: false,
        password: "",
        passwordConfirmation: "",
      },
      validationSchema: yup.object({
        username: yup.string().required("User Name is required"),
        email: yup.string().email("Invalid email").required("Required"),
        isCoordinator: yup.boolean().notRequired(),
        password: yup
          .string()
          .required("Password is required")
          .min(8, "Password must contain 8 or more characters")
          .matches(/^(?=.*[A-Z])/, "Must contain one uppercase letter")
          .matches(/^(?=.*[0-9])/, "Must contain one number")
          .matches(/^(?=.*[!@#$%^&*])/, "Must contain one special character"),
        passwordConfirmation: yup
          .string()
          .oneOf([yup.ref("password"), null], "Passwords must match"),
      }),
      onSubmit: function (values) {
        const registerUser = async () => {
          console.log("-----SENDING [register]");
          try {
            const dbData = await httpClient.post("//localhost:5000/register", {
              username: values.username,
              email: values.email,
              password: values.password,
              isCoordinator: Boolean(values.isCoordinator),
            });
            console.log("   --STATUS [Login]: " + dbData.data.status);

            if (dbData.data.status === "user_exist") {
              handleRegisterClose();
              //logInUser(email, password);
              window.location.href = "/home";
            }
            if (dbData.data.status === "register_success") {
              //handleRegisterClose();
              var emailAddress = values.email;
              sendEmail(emailAddress);
            }
            if (dbData.data.status === "register_WHITELIST_success") {
              handleRegisterClose();
              //var emailAddress = values.email;
              //sendEmail(emailAddress);
            }

            if (dbData.data.status === "request_error") {
              handleRegisterClose();
              setErrorMessage(
                "[request_error]: Error Receiving POST Request (routes.py - /register) "
              );
              handleErrorShow();
            }
            if (dbData.data.status === "register_failed") {
              handleRegisterClose();
              setErrorMessage(
                "[register_failed]: Password Error (sqliteDB.py - /register) "
              );
              handleErrorShow();
            }
          } catch (error) {
            setErrorMessage("Error [Register Componenet]");
            handleErrorShow();
          }
        };

        registerUser();
      },
    });

    return (
      <div>
        <Container className="register">
          <form onSubmit={formik.handleSubmit}>
            <Row className="mb-2">
              <Col sm={6} lg={{ span: 4, offset: 1 }}>
                <label>User Name:</label>
              </Col>
              <Col sm={6} lg={{ span: 5, offset: 1 }}>
                <input
                  id="username"
                  name="username"
                  placeholder="User name"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.username}
                />
              </Col>
            </Row>
            <Row className="mb-2">
              {formik.errors.username && formik.touched.username ? (
                <div className="error_message">{formik.errors.username}</div>
              ) : null}
            </Row>
            <Row className="mb-2">
              <Col sm={6} lg={{ span: 4, offset: 1 }}>
                <label>Email:</label>
              </Col>
              <Col sm={6} lg={{ span: 5, offset: 1 }}>
                <input
                  type="email"
                  id="email"
                  name="email"
                  placeholder="Email Address"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.email}
                />
              </Col>
            </Row>
            <Row className="mb-2">
              {formik.errors.email && formik.touched.email ? (
                <div className="error_message">{formik.errors.email}</div>
              ) : null}
            </Row>
            <Row className="mb-2">
              <Col sm={6} lg={{ span: 4, offset: 1 }}>
                <label>Password:</label>
              </Col>
              <Col sm={6} lg={{ span: 5, offset: 1 }}>
                <input
                  type="password"
                  id="password"
                  name="password"
                  placeholder="Password"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.password}
                />
              </Col>
            </Row>
            <Row className="mb-2">
              {formik.errors.password && formik.touched.password ? (
                <div className="error_message">{formik.errors.password}</div>
              ) : null}
            </Row>
            <Row className="mb-2">
              <Col sm={6} lg={{ span: 4, offset: 1 }}>
                <label>Confirm Password:</label>
              </Col>
              <Col sm={6} lg={{ span: 5, offset: 1 }}>
                <input
                  type="password"
                  id="passwordConfirmation"
                  name="passwordConfirmation"
                  placeholder="Confirm Password"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.passwordConfirmation}
                />
              </Col>
            </Row>
            <Row className="mb-2">
              {formik.errors.passwordConfirmation &&
              formik.touched.passwordConfirmation ? (
                <div className="error_message">
                  {formik.errors.passwordConfirmation}
                </div>
              ) : null}
            </Row>
            <Row className="mb-2">
              <Button variant="uwa" type="submit">
                Submit
              </Button>
            </Row>
          </form>
        </Container>
      </div>
    );
  }

  const sendAdminEmail = async () => {
    console.log("makeCoordinatorEmail");
    console.log(makeCoordinatorEmail, whiteList);

    try {
      const dbData = await httpClient.post("//localhost:5000/upgrade", {
        email: makeCoordinatorEmail,
        whitelist: whiteList,
      });

      console.log("   --STATUS [MakeAdmin]: " + dbData.data.status);

      if (dbData.data.status === "upgrade_success") {
        setMakeCoordinatorEmail("");
        setAdminShow(false);
      }
      if (dbData.data.status === "add_success") {
        setMakeCoordinatorEmail("");
        setAdminShow(false);
      }
      if (dbData.data.status === "request_error") {
        setErrorMessage(
          "[request_error]: Error Receiving POST Request (routes.py - /upgrade) "
        );
        handleErrorShow();
        setAdminShow(false);
      }
      if (dbData.data.status === "upgrade_failed") {
        setErrorMessage(
          "[upgrade_failed]: User upgrade failed (sqliteDB.py - /upgrade_to_coordinator) "
        );
        handleErrorShow();
        setAdminShow(false);
      }
      if (dbData.data.status === "email_exist") {
        setErrorMessage(
          "[email_exist]: Email exists in whiteList (sqliteDB.py - /add_whitelist) "
        );
        handleErrorShow();
        setAdminShow(false);
      }
      if (dbData.data.status === "file_not_found") {
        setErrorMessage(
          "[file_not_found]: File not found (sqliteDB.py - /add_whitelist) "
        );
        handleErrorShow();
        setAdminShow(false);
      }
      if (dbData.data.status === "no_whiteList") {
        setErrorMessage(
          "[no_whiteList]: User not given whiteList permissions (sqliteDB.py - /upgrade_to_coordinator) "
        );
        handleErrorShow();
        setAdminShow(false);
      }
    } catch (error) {
      setErrorMessage("Error [Make Coordinator Email Componenet]");
      handleErrorShow();
    }
  };

  return (
    <div>
      <Navbar sticky="top" className="uwa-nav" variant="dark">
        <Container>
          <Navbar.Brand href="/home">
            <img src={logo} alt="UWA Logo" width="50" height="50" />
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />

          <Navbar.Collapse id="basic-navbar-nav">
            <Nav variant="pills">
              <Nav.Item>
                <Nav.Link href="/home">Home</Nav.Link>
              </Nav.Item>
              {userType === "UnitCoordinator" ? (
                <>
                  <Nav.Item>
                    <Nav.Link href="/query">Query</Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link href="/reportGen">Report Generation</Nav.Link>
                  </Nav.Item>
                </>
              ) : null}
            </Nav>
          </Navbar.Collapse>
          {userAdmin === true ? (
            <div className="d-flex flex-row-reverse">
              <Button variant="uwa-circle" onClick={handleAdminShow}>
                <IconContext.Provider
                  value={{ color: "#27348b", size: "30px" }}
                >
                  <AiFillPlusCircle />
                </IconContext.Provider>
              </Button>
            </div>
          ) : null}

          {userLoggedIn === false ? (
            <div className="d-flex flex-row-reverse">
              <Button variant="uwa-circle" onClick={handleLoginShow}>
                <IconContext.Provider
                  value={{ color: "#27348b", size: "30px" }}
                >
                  <IoLogInSharp />
                </IconContext.Provider>{" "}
              </Button>
            </div>
          ) : (
            <div className="d-flex flex-row-reverse">
              <div className="p-2">
                <h4>Welcome {userName}!</h4>
              </div>
              <Button variant="uwa-circle" onClick={logoutUser}>
                <IconContext.Provider
                  value={{ color: "#27348b", size: "30px" }}
                >
                  <BsPersonCircle />
                </IconContext.Provider>{" "}
              </Button>
            </div>
          )}
        </Container>
      </Navbar>

      <Modal
        show={showLogin}
        onHide={handleLoginClose}
        animation={true}
        size="md"
        aria-labelledby="contained-modal-title-vcenter"
        centered
      >
        <Modal.Header closeButton centered>
          <Modal.Title>
            <h2>Login</h2>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Login />
        </Modal.Body>
      </Modal>

      <Modal
        show={showRegister}
        onHide={handleRegisterClose}
        animation={true}
        size="md"
        aria-labelledby="contained-modal-title-vcenter"
        centered
      >
        <Modal.Header closeButton centered>
          <Modal.Title>
            <h2>Register</h2>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Register />
        </Modal.Body>
      </Modal>

      {/* <Modal
        show={showAdmin}
        onHide={handleAdminClose}
        animation={true}
        size="md"
        aria-labelledby="contained-modal-title-vcenter"
        centered
      >
        <Modal.Header closeButton centered>
          <Modal.Title>Make Unit Coordinator: </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3" controlId="exampleForm.ControlInput1">
              <Row>
                <Col sm={6} lg={{ span: 4, offset: 1 }}>
                  <label>Email:</label>
                </Col>
                <Col sm={6} lg={{ span: 5, offset: 1 }}>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    placeholder="Email Address"
                    onChange={(e) =>
                      setChangeUser({
                        ...changeUser,
                        ["email"]: e.target.value,
                      })
                    }
                    value={changeUser["email"]}
                  />
                </Col>
              </Row>
              <Button>Submit</Button>
            </Form.Group>
          </Form>
        </Modal.Body>
      </Modal> */}

      {/* <Modal
        show={showAdmin}
        onHide={handleAdminClose}
        animation={true}
        size="md"
        aria-labelledby="contained-modal-title-vcenter"
        centered
      >
        <Modal.Header closeButton centered>
          <Modal.Title>
            Enter email address to give user Unit Coordinater Permissions
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Container>
            <form>
              <Row>
                <Col sm={6} lg={{ span: 4, offset: 1 }}>
                  <label>Email:</label>
                </Col>
                <Col sm={6}
                  lg={{ span: 5, offset: 1 }}>
                  <input
                    id="email"
                    placeholder="Email Address"
                    onChange={(e) => setMakeCoordinatorEmail(e.target.value)}
                    value={makeCoordinatorEmail}
                  />
                </Col>
              </Row>
              <Row>
                <Col sm={6} lg={{ span: 5, offset: 1 }}>
                  <input
                    id="email"
                    checked={setWhiteList(true)}
                    value={whiteList}
                  />
                </Col>
              </Row>

              <Row>
                <Button
                  variant="uwa"
                  type="submit"
                  onClick={(e) => console.log("sending" + makeCoordinatorEmail)}
                >
                  Submit
                </Button>
              </Row>
            </form>
          </Container>
        </Modal.Body>
      </Modal>
      const [changeUser, setChangeUser] = useState({ email: "", whiteList: false }); */}

      <Modal show={showAdmin} onHide={handleAdminClose}>
        <Modal.Header closeButton>
          <Modal.Title>Make Unit Coordinator</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Container>
            <form>
              <Row>
                <Col sm={6} lg={{ span: 4, offset: 1 }}>
                  <label>Email:</label>
                </Col>
                <Col sm={6} lg={{ span: 5, offset: 1 }}>
                  <input
                    id="email"
                    placeholder="Email Address"
                    onChange={(e) => setMakeCoordinatorEmail(e.target.value)}
                    value={makeCoordinatorEmail}
                  />
                </Col>
              </Row>
              <Row>
                <label>White List?</label>
                <input
                  type="radio"
                  checked={whiteList}
                  onClick={() => {
                    setWhiteList((s) => !s);
                    console.log(whiteList);
                  }}
                ></input>
              </Row>
            </form>
          </Container>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="uwa" onClick={sendAdminEmail}>
            Submit
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal
        show={showErrorModal}
        onHide={handleErrorClose}
        animation={true}
        size="md"
        aria-labelledby="contained-modal-title-vcenter"
        centered
      >
        <Modal.Header closeButton centered>
          <Modal.Title>Error</Modal.Title>
        </Modal.Header>
        <Modal.Body>{errorMessage}</Modal.Body>
      </Modal>
    </div>
  );
};

export default Navigation;
