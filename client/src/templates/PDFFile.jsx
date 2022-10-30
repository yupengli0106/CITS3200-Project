import React from "react";
import {
  Page,
  Text,
  Image,
  Document,
  StyleSheet,
  View,
} from "@react-pdf/renderer";

import {
  Table,
  TableHeader,
  TableCell,
  TableBody,
  DataTableCell,
} from "@david.kucsai/react-pdf-table";

import logo from "./images/uwa.png";

var course = {
  courseTitle: "Master of Information Technology",
  courseCode: "62510",
};

const styles = StyleSheet.create({
  body: {
    paddingTop: 35,
    paddingBottom: 65,
    paddingHorizontal: 35,
  },
  title: {
    fontSize: 24,
    textAlign: "center",
  },
  text: {
    margin: 12,
    fontSize: 14,
    textAlign: "justify",
    fontFamily: "Times-Roman",
  },
  image: {
    marginVertical: 5,
    marginHorizontal: 5,
    width: 50,
    height: 50,
  },
  header: {
    textAlign: "center",
    lineHeight: 1.2,
    fontSize: 24,
    fontWeight: 600,
    color: "black",
  },
  subheader: {
    textAlign: "center",
    lineHeight: 1.2,
    fontSize: 16,
    fontWeight: 600,

    color: "black",
  },

  pageNumber: {
    position: "absolute",
    fontSize: 12,
    bottom: 20,
    left: 0,
    right: 0,
    textAlign: "center",
    color: "grey",
  },
});

const PDFFile = () => {
  const conversionUnits = [
    {
      unitCode: "CITS1401",
      title: "Computational Thinking with Python",
      programmeBased: true,
      credit: 6,
      availabilities:
        "Semester 1 2021, Crawley (Face to face); Semester 1 2021, Crawley (Online-TT) [Contact hours: n/a]; Semester 2 2021, Crawley (Online-TT) [Contact hours: n/a]; Semester 2 2021, Crawley (Face to face);",
    },
    {
      unitCode: "CITS1402",
      title: "Relational Database Management Systems",
      programmeBased: false,
      credit: 6,
      availabilities:
        "Semester 2 2021, Crawley (Face to face); Semester 2 2021, Crawley (Online-TT);",
    },

    {
      unitCode: "CITS1003",
      title: "Introduction to Cybersecurity",
      programmeBased: false,
      credit: 6,
      availabilities:
        "Semester 2 2021, Crawley (Multi-mode) [Expected class size: 100-200] [Contact hours: 4]; Semester 2 2021, Crawley (Online-TT) [Contact hours: n/a];",
    },

    {
      unitCode: "CITS1001",
      title: "Software Engineering with Java",
      programmeBased: true,
      credit: 6,
      availabilities:
        "Semester 1 2021, Crawley (Face to face); Semester 1 2021, Crawley (Online-TT) [Contact hours: n/a]; Semester 2 2021, Crawley (Online-TT) [Contact hours: n/a]; Semester 2 2021, Crawley (Face to face);",
    },
  ];

  const coreUnits = [
    {
      unitCode: "CITS4401",
      title: "Software Requirements and Design",
      programmeBased: false,
      credit: 6,
      availabilities:
        "Semester 1 2021, Crawley (Face to face); Semester 1 2021, Crawley (Online-TT) [Contact hours: n/a];}",
    },
    {
      unitCode: "CITS4404",
      title: "Artificial Intelligence and Adaptive Systems",
      programmeBased: false,
      credit: 6,
      availabilities: "Not available 2021",
    },
    {
      unitCode: "GENG5507",
      title: "Risk, Reliability and Safety",
      programmeBased: false,
      credit: 6,
      availabilities:
        "Semester 1 2021, Crawley (Online-TT) [Contact hours: n/a]; Semester 1 2021, Crawley (Face to face); Semester 2 2021, Crawley (Online-TT) [Contact hours: n/a]; Semester 2 2021, Crawley (Face to face);",
    },
    {
      unitCode: "CITS5508",
      title: "Machine Learning",
      programmeBased: true,
      credit: 6,
      availabilities:
        "Semester 1 2021, Crawley (Face to face); Semester 1 2021, Crawley (Online-TT) [Contact hours: n/a];",
    },
    {
      unitCode: "CITS5505",
      title: "Agile Web Development",
      programmeBased: true,
      credit: 6,
      availabilities: "Semester 1 2021, Crawley (Face to face),",
    },
    {
      unitCode: "CITS4407",
      title: "Open Source Tools and Scripting",
      programmeBased: true,
      credit: 6,
      availabilities:
        "Semester 1 2021, Crawley (Face to face); Semester 1 2021, Crawley (Online-TT) [Contact hours: n/a];",
    },
    {
      unitCode: "CITS4009",
      title: "Computational Data Analysis",
      programmeBased: true,
      credit: 6,
      availabilities:
        "Semester 2 2021, Crawley (Face to face); Semester 2 2021, Crawley (Online-TT) [Contact hours: n/a];",
    },
    {
      unitCode: "CITS4403",
      title: "Computational Modelling",
      programmeBased: false,
      credit: 6,
      availabilities: "Not available 2021;",
    },
    {
      unitCode: "CITS5504",
      title: "Data Warehousing",
      programmeBased: false,
      credit: 6,
      availabilities:
        "Semester 1 2021, Crawley (Face to face); Semester 1 2021, Crawley (Online-TT) [Contact hours: n/a];",
    },
    {
      unitCode: "CITS5501",
      title: "Software Testing and Quality Assurance",
      programmeBased: false,
      credit: 6,
      availabilities:
        "Semester 1 2021, Crawley (Face to face); Semester 1 2021, Crawley (Online-TT) [Contact hours: n/a];",
    },
    {
      unitCode: "GENG5508",
      title: "Robotics",
      programmeBased: false,
      credit: 6,
      availabilities: "Semester 1 2021, Crawley (Face to face);",
    },
    {
      unitCode: "GENG5505",
      title: "Project Management and Engineering Practice",
      programmeBased: true,
      credit: 6,
      availabilities:
        "Semester 1 2021, Crawley (Online-TT) [Contact hours: n/a]; Semester 2 2021, Crawley (Online-TT) [Contact hours: n/a];",
    },
    {
      unitCode: "CITS5507",
      title: "High Performance Computing",
      programmeBased: false,
      credit: 6,
      availabilities:
        "Semester 2 2021, Crawley (Face to face); Semester 2 2021, Crawley (Online-TT) [Contact hours: n/a];",
    },
    {
      unitCode: "CITS5503",
      title: "Cloud Computing",
      programmeBased: false,
      credit: 6,
      availabilities:
        "Semester 2 2021, Crawley (Face to face); Semester 2 2021, Crawley (Online-TT) [Contact hours: n/a];",
    },
  ];

  return (
    <Document>
      <Page style={styles.body}>
        <Image style={styles.image} src={logo} width={15} />

        <View style={styles.text}>
          <Text style={styles.header}>Course:{course.courseTitle}</Text>
          <Text style={styles.header}>Course Code: {course.courseCode}</Text>
        </View>
        <Text
          style={styles.pageNumber}
          render={({ pageNumber }) => `${pageNumber}`}
          fixed
        />

        <Text style={styles.subheader}>Core Units</Text>
        <Table data={coreUnits}>
          <TableHeader textAlign={"center"}>
            <TableCell>Unit Code</TableCell>
            <TableCell>Unit</TableCell>
            <TableCell>Availabilities</TableCell>
            <TableCell width={10}>Credit</TableCell>
          </TableHeader>
          <TableBody textAlign={"center"}>
            <DataTableCell getContent={(r) => r.unitCode} />
            <DataTableCell getContent={(r) => r.title} />
            <DataTableCell getContent={(r) => r.availabilities} />
            <DataTableCell width={10} getContent={(r) => r.credit} />
          </TableBody>
        </Table>

        <Text style={styles.subheader}>Coversion Units</Text>
        <Table data={conversionUnits}>
          <TableHeader textAlign={"center"}>
            <TableCell>Unit Code</TableCell>
            <TableCell>Unit</TableCell>
            <TableCell>Availabilities</TableCell>
            <TableCell width={10}>Credit</TableCell>
          </TableHeader>
          <TableBody textAlign={"center"}>
            <DataTableCell getContent={(r) => r.unitCode} />
            <DataTableCell getContent={(r) => r.title} />
            <DataTableCell getContent={(r) => r.availabilities} />
            <DataTableCell width={10} getContent={(r) => r.credit} />
          </TableBody>
        </Table>
      </Page>
    </Document>
  );
};

export default PDFFile;

//Document is the whole
