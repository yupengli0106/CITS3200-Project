import React from "react";
import Table from "react-bootstrap/Table";

const AllDataTable = ({ data }) => {
  //change this to var nHeadData = ["id", "label", "displayName", "color"] when the backend workd
  // Practical Headings
  var nHeadData = ["displayName", "labels"];

  //Pretty Headings
  var pHeadData = ["Display Name", "Labels"];

  var nBodyData = data.nodes;
  //console.log("nHEADDATE")
  //console.log(nHeadData)

  var lHeadData = ["Label", "Source Node", "Target Node"];
  //var lBodyData = data.links

  function findName(index) {
    for (var i = 0; i < data.nodes.length; i++) {
      if (data.nodes[i].id === index) {
        return data.nodes[i].displayName;
      }
    }
    return "-";
  }
  var lBodyData = [];

  for (var i = 0; i < data.links.length; i++) {
    var sName = findName(data.links[i].source.id);
    var tName = findName(data.links[i].target.id);
    lBodyData.push({
      Label: data.links[i].labels,
      "Source Node": sName,
      "Target Node": tName,
    });
  }

  //   var nodesLen = false;
  //   if (data.nodes.lenth > 0) {
  //     nodesLen = true;
  //   }
  //   var linksLen = false;
  //   if (data.links.lenth > 0) {
  //     linksLen = true;
  //   }

  console.log("lBodyData");
  console.log(lBodyData);

  return (
    <div>
      {/* {nodesLen === true ? (
        <div> */}
      <h2> NODES </h2>
      <Table responsive striped hover>
        <thead>
          <tr>
            {pHeadData.map((heading) => {
              return <th key={heading}>{heading}</th>;
            })}
          </tr>
        </thead>

        <tbody>
          {nBodyData.map((row, index) => {
            return (
              <tr key={index}>
                {nHeadData.map((key) => {
                  return <td key={row[key]}>{row[key]}</td>;
                })}
              </tr>
            );
          })}
        </tbody>
      </Table>
      {/* </div>
      ) : null}
      {linksLen === true ? (
        <div> */}
      <h2>LINKS</h2>
      <Table responsive striped hover>
        <thead>
          <tr>
            {lHeadData.map((heading) => {
              return <th key={heading}>{heading}</th>;
            })}
          </tr>
        </thead>

        <tbody>
          {lBodyData.map((row, index) => {
            return (
              <tr key={index}>
                {lHeadData.map((key) => {
                  return <td key={row[key]}>{row[key]}</td>;
                })}
              </tr>
            );
          })}
        </tbody>
      </Table>
      {/* </div>
      ) : null} */}
    </div>
  );
};

export default AllDataTable;