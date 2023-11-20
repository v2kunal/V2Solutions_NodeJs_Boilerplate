const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const auth = require("../services/authentication");
const Employee = require("../model/Employee");

/**
 * @swagger
 * components:
 *   schemas:
 *     GetEmployee:
 *       type: object
 *       required:
 *         - sortedColumn
 *         - limit
 *         - page
 *         - sort
 *         - filter
 *
 *       properties:
 *         sortedColumn:
 *           type: string
 *           description: Require column name on which sorting will be performed.
 *         limit:
 *           type: number
 *           description: limit the data
 *         page:
 *           type: number
 *           description: page number
 *         sort:
 *           type: string
 *           description: Provide 'asc' and 'desc'
 *         filter:
 *           type: string
 *           description: It will filter the data i.e search
 *       example:
 *           sortedColumn: name,
 *           limit: 5,
 *           page: 1,
 *           dob: 16/05/1981,
 *           sort: desc,
 *           filter: afsar,
 *
 *
 *
 */

// /**
//  * @swagger
//  * tags:
//  *   name: Employees
//  *   description: CRUD Operation on Employees documents
 //*/

/**
 * @swagger
//  * /employee/get:
//  *   get:
//  *     security:
//  *       - Authorization: []
//  *     summary: Fetch all the employees list
//  *     tags: [Employees]
//  *     parameters:
//  *       - in: query
//  *         name: limit
//  *         required: true
//  *         schema:
//  *           type: integer
//  *           required: true
//  *           description: limit the docs
//  *       - in: query
//  *         name: page
//  *         required: true
//  *         schema:
//  *           type: integer
//  *           required: true
//  *           description: Number of pages
//  *       - in: query
//  *         name: filter
//  *
//  *         schema:
//  *           type: string
//  *
//  *           description: It will filter bases on the name column.
//  *       - in: query
//  *         name: sort
//  *         required: true
//  *         schema:
//  *           type: string
//  *           required: true
//  *           description: Sorting - 'asc' or 'desc'
//  *       - in: query
//  *         name: sortedColumn
//  *         required: true
//  *         schema:
//  *           type: string
//  *           required: true
//  *           description: Column name i.e email, dob, desgination...
//  *     responses:
//  *       200:
//  *         description: It will display record based on the filter applied
//  *         content:
//  *           application/json:
//  *             schema:
//  *               $ref: '#/components/schemas/GetEmployee'
//  *       500:
//  *         description: Some server error
 */

router.get("/get", auth, async (req, res) => {
  try {
    let { page = 1, limit = 10, sort, filter, sortedColumn } = req.query;
    page = parseInt(page);
    limit = parseInt(limit);
    let query = {};
    let sortOption = {};

    // Implement the filter based on the 'filter' query parameter
    if (filter) {
      query.name = { $regex: new RegExp(filter, "i") };
      // You can extend this based on your specific filter criteria
    }

    if (!sortedColumn) {
      sortedColumn = "name"; // Default column to sort
    }

    let sortDirection = 1; // Default sort direction (ascending)

    if (sort) {
      // sortedColumn = sort.replace(/^-/, ''); // Remove '-' from the column name
      sortDirection = sort == "desc" ? -1 : 1;
    }

    sortOption[sortedColumn] = sortDirection;

    const totalEmployees = await Employee.countDocuments(query);
    const totalPages = Math.ceil(totalEmployees / limit);

    const employees = await Employee.find(query)
      .sort(sortOption)
      .limit(limit)
      .skip((page - 1) * limit);

    res.status(200).json({
      employees,
      page,
      totalPages,
      totalEmployees,
      sortedColumn,
      sortDirection, // Include the sort direction in the response
    });
  } catch (error) {
    console.error("Error fetching employees :", error);
    res.status(500).json({ error: "Failed to fetch employees " });
  }
});

router.post("/add", auth, async (req, res) => {
  try {
    const newEmployee = new Employee(req.body);
    console.log(req.body);
    await newEmployee.save();
    res.status(200).json({ message: "Employee added successfully" });
  } catch (error) {
    console.error("Error creating a new employee:", error);
    res.status(500).json({ error: "Failed to create a new employee" });
  }
});

router.put("/update/:id", auth, async (req, res) => {
  try {
    const employeeId = req.params.id;
    const updatedData = req.body;
    const updatedEmployee = await Employee.findByIdAndUpdate(
      employeeId,
      updatedData,
      {
        new: true,
      }
    );
    if (updatedEmployee) {
      res.status(200).json({
        message: "Updated Successfully",
        updated: updatedEmployee,
      });
    } else {
      res.status(404).json({ error: "Employee not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Something went Wrong" });
  }
});

router.delete("/delete/:id", auth, async (req, res) => {
  try {
    const employeeId = req.params.id;
    const result = await Employee.findByIdAndDelete(employeeId);
    if (result) {
      res.status(200).json({ message: "Employee deleted successfully" });
    } else {
      res.status(404).json({ error: "Employee not found" });
    }
  } catch (error) {
    console.error("Error deleting a employee:", error);
    res.status(500).json({ error: "Failed to delete a employee" });
  }
});

module.exports = router;