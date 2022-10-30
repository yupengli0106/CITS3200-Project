import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { Home, Query, ReportGen, Navigation, Footer } from "./templates";

import "./style.css";

const rootElement = document.getElementById("root");
const root = createRoot(rootElement);
root.render(
  <Router>
    <Navigation />
    <Routes>
      <Route path="/home" element={<Home />} />
      <Route path="/" element={<Home />} />
      <Route path="/query" element={<Query />} />
      <Route path="/reportGen" element={<ReportGen />} />
    </Routes>

    <Footer />
  </Router>
);
