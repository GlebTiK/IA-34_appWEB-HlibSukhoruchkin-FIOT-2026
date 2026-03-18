const express = require("express");

const app = express();
app.use(express.json());

// demo storage
let students = [
  { id: 1, name: "Hlib", group: "IA-34", course: 1 },
  { id: 2, name: "Andrii", group: "IA-34", course: 1 }
];

// root
app.get("/", (req, res) => {
  res.json({
    message: "Students API is running on Vercel",
    endpoints: {
      all: "GET /students",
      one: "GET /students/:id",
      create: "POST /students",
      update: "PUT /students/:id",
      delete: "DELETE /students/:id"
    }
  });
});

// get all
app.get("/students", (req, res) => {
  res.json(students);
});

// get one
app.get("/students/:id", (req, res) => {
  const id = Number(req.params.id);
  const student = students.find((s) => s.id === id);

  if (!student) {
    return res.status(404).json({ error: "Student not found" });
  }

  res.json(student);
});

// create
app.post("/students", (req, res) => {
  const { name, group, course } = req.body;

  if (!name || !group || course === undefined) {
    return res.status(400).json({
      error: "Fields name, group and course are required"
    });
  }

  const newStudent = {
    id: students.length ? Math.max(...students.map((s) => s.id)) + 1 : 1,
    name,
    group,
    course
  };

  students.push(newStudent);
  res.status(201).json(newStudent);
});

// update
app.put("/students/:id", (req, res) => {
  const id = Number(req.params.id);
  const index = students.findIndex((s) => s.id === id);

  if (index === -1) {
    return res.status(404).json({ error: "Student not found" });
  }

  const { name, group, course } = req.body;

  students[index] = {
    ...students[index],
    ...(name !== undefined ? { name } : {}),
    ...(group !== undefined ? { group } : {}),
    ...(course !== undefined ? { course } : {})
  };

  res.json(students[index]);
});

// delete
app.delete("/students/:id", (req, res) => {
  const id = Number(req.params.id);
  const index = students.findIndex((s) => s.id === id);

  if (index === -1) {
    return res.status(404).json({ error: "Student not found" });
  }

  const deleted = students[index];
  students.splice(index, 1);

  res.json({
    message: "Student deleted",
    student: deleted
  });
});

// export for Vercel
module.exports = app;