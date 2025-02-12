import Admin from '../Models/Admin.js'
import asyncHandler from 'express-async-handler'
import Student from '../Models/Student.js';
import Teacher from '../Models/Teacher.js';
import Attendance from '../Models/Attendance.js';
import Class from '../Models/Classroom.js';
import ClassModel from '../Models/ClassModel.js';
import Notice from '../Models/Notice.js';
import Subject from '../Models/Subject.js';
import Leave from '../Models/Leave.js';
import PhoneCallModel from '../Models/PhoneCall.js';
import ComplaintModel from '../Models/Complaint.js';
import CertificateModel from '../Models/Certificate.js';
import Meeting from '../Models/Meeting.js';
import cloudinary from '../config/cloudinary.js';
import SectionModel from '../Models/Section.js';
import Content from '../Models/Content.js';
import Assignment from '../Models/Assignment.js';
import Driver from '../Models/Driver.js';
import VisitorModel from '../Models/Visitor.js';
import Syllabus from '../Models/Syllabus.js';
import Lesson from '../Models/Lesson.js';
import Homework from '../Models/Homework.js';
import Invoice from '../Models/Invoice.js';
import Routine from '../Models/Routine.js';
import Transport from '../Models/Transport.js';
import Vehicle from '../Models/Vehicle.js';
import ExamType from '../Models/ExamType.js';
import Holiday from '../Models/Holiday.js';
import Exam from '../Models/ExamShedule.js';
import Topic from '../Models/Topic.js';
import Fee from '../Models/Fee.js';
import SeatPlan from '../Models/SeatPlan.js';
import Marks from '../Models/Mark.js';
import Staff from '../Models/Staff.js';
import Parent from '../Models/Parent.js'
import ExcelJS from 'exceljs';
import PDFDocument from 'pdfkit';
import generateRefreshToken from '../config/refreshtoken.js';
import generateToken from '../config/jwtToken.js';
import multer from 'multer'
import crypto from 'crypto'



const adminRegistration = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  // Check if admin with the same email already exists
  const admin = await Admin.findOne({ email: email });
  if (admin) {
    return res.status(409).json({ status: "failed", message: "Email already exists" });
  }

  // Ensure all fields are filled
  if (name && email && password) {
    try {
      // Create new Admin document
      const doc = new Admin({
        name: name,
        email: email,
        password: password,
      });

      await doc.save();

      // Retrieve the saved admin without the password field
      const saved_admin = await Admin.findOne({ email: email }).select("-password");

      // Generate refresh token
      const refreshToken = generateRefreshToken(saved_admin._id);

      // Save refresh token in the database
      saved_admin.refreshToken = refreshToken;
      await saved_admin.save();

      // Set the refresh token in an HTTP-only cookie
      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 72 * 60 * 60 * 1000, // 3 days expiration
        sameSite: 'Strict',
      });

      // Generate access token
      const accessToken = generateToken(saved_admin._id);

      return res.status(201).json({
        message: "Registration Successful",
        data: saved_admin,
        accessToken,
        refreshToken,
      });
    } catch (error) {
      return res.status(500).json({
        status: "failed",
        message: "Unable to register",
        error: error.message,
      });
    }
  } else {
    return res.status(400).json({ message: "Please fill all the fields" });
  }
});


const adminLogin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;  // Only use email

  // Check if admin with the provided email exists
  const findAdmin = await Admin.findOne({ email });

  if (!findAdmin) {
    return res.status(401).json({ message: "Invalid Credentials" });  // Admin not found
  }

  const refreshToken = await generateRefreshToken(findAdmin._id);

  // Update the refresh token in the database
  await Admin.findByIdAndUpdate(
    findAdmin.id,
    { refreshToken },
    { new: true }
  );

  // Set the refresh token as an HTTP-only cookie
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    maxAge: 72 * 60 * 60 * 1000, // 3 days expiration
  });

  return res.json({
    _id: findAdmin._id,
    firstName: findAdmin.name,
    email: findAdmin.email,
    token: generateToken(findAdmin._id),
  });
});


const adminLogout = asyncHandler(async (req, res) => {
  try {
    res.clearCookie("token").status(200).json({ message: "Logout Successful" })
  } catch (error) {
    return res.status(500).json({ status: "failed", message: "Unable to logout", error: error.message });
  }
})


// Student Management
const getStudents = asyncHandler(async (req, res) => {
  const students = await Student.find();
  res.json(students);
});

const createStudent = asyncHandler(async (req, res) => {
  const { name, age, classId } = req.body;
  const student = new Student({ name, age, classId });
  const createdStudent = await student.save();
  res.status(201).json(createdStudent);
});

const updateStudent = asyncHandler(async (req, res) => {
  const student = await Student.findById(req.params.id);
  if (!student) {
    res.status(404);
    throw new Error('Student not found');
  }
  Object.assign(student, req.body);
  const updatedStudent = await student.save();
  res.json(updatedStudent);
});

const deleteStudent = asyncHandler(async (req, res) => {
  const student = await Student.findById(req.params.id);
  if (!student) {
    res.status(404);
    throw new Error('Student not found');
  }
  await student.remove();
  res.json({ message: 'Student removed' });
});

// Teacher Management
const getTeachers = asyncHandler(async (req, res) => {
  const teachers = await Teacher.find();
  res.json(teachers);
});

const updateTeacher = asyncHandler(async (req, res) => {
  const teacher = await Teacher.findById(req.params.id);
  if (!teacher) {
    res.status(404);
    throw new Error('Teacher not found');
  }
  Object.assign(teacher, req.body);
  const updatedTeacher = await teacher.save();
  res.json(updatedTeacher);
});

const deleteTeacher = asyncHandler(async (req, res) => {
  const teacher = await Teacher.findById(req.params.id);
  if (!teacher) {
    res.status(404);
    throw new Error('Teacher not found');
  }
  await teacher.remove();
  res.json({ message: 'Teacher removed' });
});


const createClass = asyncHandler(async (req, res) => {
  const { name, teacherId } = req.body;
  const newClass = new Class({ name, teacherId });
  const createdClass = await newClass.save();
  res.status(201).json(createdClass);
});

// Attendance Management
const markAttendance = asyncHandler(async (req, res) => {
  const { studentId, date, status } = req.body;
  const attendance = new Attendance({ studentId, date, status });
  const createdAttendance = await attendance.save();
  res.status(201).json(createdAttendance);
});


// Add a new complaint
const addComplaint = async (req, res) => {
  try {
    const {
      complaintBy,
      complaintType,
      complaintSource,
      phone,
      date,
      actionsTaken,
      assigned,
      description,
    } = req.body;

    // Validate required fields
    if (!complaintBy || !complaintType || !complaintSource || !description) {
      return res.status(400).json({ message: 'All required fields must be filled.' });
    }

    // Create a new complaint entry
    const complaint = new ComplaintModel({
      complaintBy,
      complaintType,
      complaintSource,
      phone,
      date,
      actionsTaken,
      assigned,
      description,
    });

    await complaint.save();

    res.status(201).json({ message: 'Complaint added successfully!', complaint });
  } catch (error) {
    res.status(500).json({ message: 'Error adding complaint.', error: error.message });
  }
};

// Get complaints
const getComplaints = async (req, res) => {
  try {
    // Fetch all complaints without filtering
    const complaints = await ComplaintModel.find();

    res.status(200).json({ message: 'Complaints fetched successfully!', complaints });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching complaints.', error: error.message });
  }
};


// Add a new visit
const addVisit = async (req, res) => {
  try {
    const { purpose, name, phone, id, no_of_persons, date, in_time, out_time } = req.body;

    const newVisit = new VisitorModel({
      purpose,
      name,
      phone,
      id,
      no_of_persons,
      date,
      in_time,
      out_time,
    });

    const savedVisit = await newVisit.save();
    res.status(201).json({
      message: "Visit added successfully",
      visit: savedVisit,
    });
  } catch (error) {
    console.error("Error adding visit:", error);
    res.status(500).json({
      message: "Failed to add visit",
      error: error.message,
    });
  }
};

// Fetch all visits
const getVisits = async (req, res) => {
  try {
    const visits = await VisitorModel.find();
    res.status(200).json({
      message: "Visits fetched successfully",
      visits,
    });
  } catch (error) {
    console.error("Error fetching visits:", error);
    res.status(500).json({
      message: "Failed to fetch visits",
      error: error.message,
    });
  }
};



// Add a new phone call
const addPhoneCall = async (req, res) => {
  try {
    const { name, phone, date, followUpDate, callDuration, description, type } = req.body;

    // Validate required fields
    if (!phone) {
      return res.status(400).json({ message: 'Phone number is required.' });
    }

    // Create a new phone call entry
    const phoneCall = new PhoneCallModel({
      name,
      phone,
      date,
      followUpDate,
      callDuration,
      description,
      type,
    });

    await phoneCall.save();

    res.status(201).json({ message: 'Phone call added successfully!', phoneCall });
  } catch (error) {
    res.status(500).json({ message: 'Error adding phone call.', error: error.message });
  }
};

// Get phone calls
const getPhoneCalls = async (req, res) => {
  try {
    // Fetch all phone calls without filtering
    const phoneCalls = await PhoneCallModel.find();

    res.status(200).json({ message: 'Phone calls fetched successfully!', phoneCalls });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching phone calls.', error: error.message });
  }
};


// Add a new certificate
const addCertificate = async (req, res) => {
  try {
    const {
      certificateName,
      headerLeftText,
      date,
      body,
      bodyFont,
      fontSize,
      footerLeftText,
      footerCenterText,
      footerRightText,
      pageLayout,
      height,
      width,
      studentPhoto,
    } = req.body;

    // Validate required fields
    if (!certificateName) {
      return res.status(400).json({ message: 'Certificate name is required.' });
    }

    // Create a new certificate entry
    const certificate = new CertificateModel({
      certificateName,
      headerLeftText,
      date,
      body,
      bodyFont,
      fontSize,
      footerLeftText,
      footerCenterText,
      footerRightText,
      pageLayout,
      height,
      width,
      studentPhoto,
    });

    await certificate.save();

    res.status(201).json({ message: 'Certificate added successfully!', certificate });
  } catch (error) {
    res.status(500).json({ message: 'Error adding certificate.', error: error.message });
  }
};

// Get certificates
const getCertificates = async (req, res) => {
  try {
    const { certificateName, date } = req.query;

    // Filter by certificate name and/or date if provided
    const filter = {};
    if (certificateName) filter.certificateName = certificateName;
    if (date) filter.date = new Date(date);

    const certificates = await CertificateModel.find(filter);

    res.status(200).json({ message: 'Certificates fetched successfully!', certificates });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching certificates.', error: error.message });
  }
};

const addVisitor = async (req, res) => {
  try {
    const { purpose, name, phone, id, no_of_persons, date, in_time, out_time } = req.body;

    // Log incoming data to ensure it's correctly passed
    console.log('Incoming request data:', req.body);

    // Handle file upload if provided
    const file = req.file ? req.file.path : null;

    // Log the file to ensure it's being handled
    console.log('Uploaded file:', file);

    // Create a new visitor entry
    const newVisitor = new VisitorModel({
      purpose,
      name,
      phone,
      id,
      no_of_persons,
      date,
      in_time,
      out_time,
      file,
    });

    await newVisitor.save();

    return res.status(201).json({ message: 'Visitor added successfully', visitor: newVisitor });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error adding visitor', error: error.message });
  }
};


// Add a new section
const addSection = async (req, res) => {
  try {
    const { name } = req.body;

    // Validate required field
    if (!name) {
      return res.status(400).json({ message: 'Section name is required.' });
    }

    // Create a new section entry
    const section = new SectionModel({ name });

    await section.save();

    res.status(201).json({ message: 'Section added successfully!', section });
  } catch (error) {
    res.status(500).json({ message: 'Error adding section.', error: error.message });
  }
};

// Get sections
const getSections = async (req, res) => {
  try {
    const { name } = req.query;

    // Filter by name if provided
    const filter = name ? { name } : {};

    const sections = await SectionModel.find(filter);

    res.status(200).json({ message: 'Sections fetched successfully!', sections });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching sections.', error: error.message });
  }
};


// Delete a section
const deleteSection = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ID
    if (!id) {
      return res.status(400).json({ message: 'Section ID is required.' });
    }

    // Find and delete the section
    const deletedSection = await SectionModel.findByIdAndDelete(id);

    if (!deletedSection) {
      return res.status(404).json({ message: 'Section not found.' });
    }

    res.status(200).json({ message: 'Section deleted successfully!', section: deletedSection });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting section.', error: error.message });
  }
};


const updateSection = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    // Validate required fields
    if (!id) {
      return res.status(400).json({ message: 'Section ID is required.' });
    }
    if (!name) {
      return res.status(400).json({ message: 'Section name is required.' });
    }

    // Log the ID and input
    console.log('Update request ID:', id);
    console.log('Update request body:', req.body);

    // Find and update the section
    const updatedSection = await SectionModel.findByIdAndUpdate(
      id,
      { name },
      { new: true, runValidators: true } // Return the updated document and run validation
    );

    if (!updatedSection) {
      return res.status(404).json({ message: 'Section not found.' });
    }

    res.status(200).json({ message: 'Section updated successfully!', section: updatedSection });
  } catch (error) {
    console.error('Error updating section:', error);
    res.status(500).json({ message: 'Error updating section.', error: error.message });
  }
};


const assignClassTeacher = async (req, res) => {
  try {
    const { class: className, section, name, subject } = req.body;

    // Check if teacher already exists using name, class, and section
    let teacher = await Teacher.findOne({ name, class: className, section });

    if (!teacher) {
      return res.status(404).json({ message: "Teacher not found. Please add the teacher first." });
    }

    // Create teacher object with ID, name, and subject to push into students' teachers array
    const teacherData = {
      teacherId: teacher._id,
      name: teacher.name,
      subject
    };

    // Directly push the teacher object into the teachers array for all students in the class and section
    await Student.updateMany(
      { class: className, section },
      { $push: { teachers: teacherData } } // Directly push teacher data into students' teachers array
    );

    res.status(201).json({ message: "Class teacher assigned successfully and updated for students.", data: teacher });
  } catch (error) {
    res.status(500).json({ message: "Error assigning class teacher.", error: error.message });
  }
};




// GET Controller to retrieve all class teacher assignments
const getClassTeachers = async (req, res) => {
  try {
    // Fetch only the required fields: class, section, teacher (name), and subject
    const assignments = await Teacher.find().select('class section name subject');

    // Return the filtered assignments with the class, section, teacher, and subject fields
    res.status(200).json({ message: 'Class teacher assignments fetched successfully.', assignments });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching class teacher assignments.', error: error.message });
  }
};

const assignSubjectTeacher = async (req, res) => {
  try {
    const { class: className, section, subject, teacher } = req.body;

    // Check if the teacher exists in the Teacher model using the "teacher" field
    const existingTeacher = await Teacher.findOne({ teacher });
    if (!existingTeacher) {
      return res.status(404).json({ message: `Teacher '${teacher}' does not exist.` });
    }

    // If the teacher exists, create a new subject assignment
    const newAssignment = new Subject({
      class: className,
      section,
      subject,
      teacher,
    });

    // Save the new assignment
    await newAssignment.save();

    // Optionally, add this assignment to the teacher's record (if needed)
    existingTeacher.subjects = existingTeacher.subjects || [];
    existingTeacher.subjects.push({
      class: className,
      section,
      subject,
    });
    await existingTeacher.save();

    res.status(201).json({
      message: 'Subject teacher assigned successfully.',
      data: newAssignment,
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error assigning subject teacher.',
      error: error.message,
    });
  }
};


// GET Controller to retrieve subject assignments
const getSubjectAssignments = async (req, res) => {
  try {
    const { class: className, section, subject } = req.query;

    // Query based on class, section, and subject (optional filters)
    const filters = {};
    if (className) filters.class = className;
    if (section) filters.section = section;
    if (subject) filters.subject = subject;

    const assignments = await Subject.find(filters);

    res.status(200).json({ message: 'Subject teacher assignments retrieved successfully.', data: assignments });
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving subject teacher assignments.', error: error.message });
  }
};

// POST Controller to add a classroom
const addClassroom = async (req, res) => {
  try {
    const { roomNumber, capacity } = req.body;

    // Check if the room number already exists
    const existingClassroom = await Class.findOne({ roomNumber });
    if (existingClassroom) {
      return res.status(400).json({ message: 'Classroom with this room number already exists.' });
    }

    // Create a new classroom
    const newClassroom = new Class({ roomNumber, capacity });
    await newClassroom.save();

    res.status(201).json({ message: 'Classroom added successfully.', data: newClassroom });
  } catch (error) {
    res.status(500).json({ message: 'Error adding classroom.', error: error.message });
  }
};

// Add a new class
const addClass = async (req, res) => {
  try {
    const { className, sections } = req.body;

    // Validate if all sections exist
    const foundSections = await SectionModel.find({ name: { $in: sections } });
    if (foundSections.length !== sections.length) {
      return res.status(400).json({ message: 'One or more sections not found.' });
    }

    // Get the section IDs
    const sectionIds = foundSections.map(section => section._id);

    // Create a new class entry
    const newClass = new ClassModel({
      className,
      sections: sectionIds, // Save array of section IDs
    });

    await newClass.save();

    return res.status(201).json({ message: 'Class added successfully', class: newClass });
  } catch (error) {
    return res.status(500).json({ message: 'Error adding class', error: error.message });
  }
};

const getClasses = async (req, res) => {
  try {
    // Find classes and populate the 'sections' field with actual section data
    const classes = await ClassModel.find()

    if (!classes || classes.length === 0) {
      return res.status(404).json({ message: 'No classes found.' });
    }

    // Map through each class and transform section IDs into section names
    const transformedClasses = classes.map(classItem => ({
      ...classItem.toObject(),
      sections: classItem.sections.map(section => section.name) // Replace section IDs with names
    }));

    return res.status(200).json({ message: 'Classes retrieved successfully', classes: transformedClasses });
  } catch (error) {
    return res.status(500).json({ message: 'Error retrieving classes', error: error.message });
  }
};

// Update a class with sections
const updateClass = async (req, res) => {
  try {
    const { className, sections } = req.body; // Destructure input data
    const { classId } = req.params; // Extract classId from URL parameters

    // Find the class by ID
    const classToUpdate = await Class.findById(classId);
    if (!classToUpdate) {
      return res.status(404).json({ message: 'Class not found.' });
    }

    // If sections are provided, update the sections (sections can be names or ObjectIds, depends on your logic)
    let sectionIds = [];

    // If sections are passed as names, we need to get the ObjectIds for those
    if (sections.length > 0) {
      // Find sections by their names and map them to ObjectIds
      const foundSections = await SectionModel.find({ name: { $in: sections } });

      // Check if all section names are valid and get their ObjectIds
      sectionIds = foundSections.map(section => section._id);

      // If some sections don't match, return an error
      if (foundSections.length !== sections.length) {
        return res.status(400).json({ message: 'One or more sections not found.' });
      }
    }

    // Update the class with the new className and sectionIds
    classToUpdate.className = className;
    classToUpdate.sections = sectionIds; // Update sections with the ObjectIds

    // Save the updated class
    await classToUpdate.save();

    return res.status(200).json({ message: 'Class updated successfully', class: classToUpdate });
  } catch (error) {
    return res.status(500).json({ message: 'Error updating class', error: error.message });
  }
};



// Remove a class
const removeClass = async (req, res) => {
  try {
    const { classId } = req.params; // Extract classId from the URL parameters

    // Find the class by ID and delete it
    const classToDelete = await Class.findByIdAndDelete(classId);
    if (!classToDelete) {
      return res.status(404).json({ message: 'Class not found.' });
    }

    return res.status(200).json({ message: 'Class removed successfully' });
  } catch (error) {
    return res.status(500).json({ message: 'Error removing class', error: error.message });
  }
};





const getClassrooms = async (req, res) => {
  try {
    // Fetch classrooms with only the roomNumber and capacity fields, excluding the _id
    const classrooms = await Class.find({})
      .select('roomNumber capacity');

    res.status(200).json({ message: 'Classrooms retrieved successfully.', data: classrooms });
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving classrooms.', error: error.message });
  }
};


// File upload configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Upload directory
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});
const upload = multer({ storage });

// POST Controller to upload content without document file handling
const uploadContent = async (req, res) => {
  try {
    const {
      contentTitle,
      contentType,
      availableFor,
      class: className,
      section,
      date,
      description,
      sourceURL,
    } = req.body;

    // Create a new content entry without document file
    const newContent = new Content({
      contentTitle,
      contentType,
      availableFor,
      class: className,
      section,
      date,
      description,
      sourceURL,
    });

    // Save the content to the database
    await newContent.save();

    res.status(201).json({ message: 'Content uploaded successfully.', data: newContent });
  } catch (error) {
    res.status(500).json({ message: 'Error uploading content.', error: error.message });
  }
};


// GET Controller to retrieve uploaded content
const getContent = async (req, res) => {
  try {
    const contents = await Content.find();

    res.status(200).json({ message: 'Content retrieved successfully.', data: contents });
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving content.', error: error.message });
  }
};

// POST Controller to create assignment
const postAssignment = async (req, res) => {
  try {
    const {
      assignmentTitle,
      subject,
      availableFor,
      class: className,
      section,
      dueDate,
      description,
    } = req.body;

    const newAssignment = new Assignment({
      assignmentTitle,
      subject,
      availableFor,
      class: className,
      section,
      dueDate,
      description,
      documentFile: req.file ? req.file.path : undefined,
    });
    await newAssignment.save();

    res.status(201).json({ message: 'Assignment created successfully.', data: newAssignment });
  } catch (error) {
    res.status(500).json({ message: 'Error creating assignment.', error: error.message });
  }
};

// Controller function to add a new lesson (POST)
const addLesson = async (req, res) => {
  const { class: lessonClass, subject, section, lessonName, title, postedBy } = req.body;


  try {
    // Create a new lesson
    const newLesson = new Lesson({
      class: lessonClass,
      subject: subject,
      lessonName: lessonName,
      title: title,  // Include title here
      postedBy: postedBy, // Include postedBy here
      section: section,
    });

    // Save the lesson to the database
    await newLesson.save();

    // Return success response
    res.status(201).json({ message: 'Lesson added successfully', lesson: newLesson });
  } catch (error) {
    // Handle errors during save
    res.status(500).json({ message: 'Error adding lesson', error: error.message });
  }
};

// Controller function to get all lessons (GET) without filters
const getLessons = async (req, res) => {
  try {
    // Fetch all lessons from the database (no filter applied)
    const lessons = await Lesson.find();

    // Return the lessons
    res.status(200).json({ message: 'Lessons retrieved successfully', lessons });
  } catch (error) {
    // Handle errors during fetch
    res.status(500).json({ message: 'Error fetching lessons', error: error.message });
  }
};

// Controller function to add a new student category (POST)
const addStudentCategory = async (req, res) => {
  const { type } = req.body;

  // Check if type is provided
  if (!type) {
    return res.status(400).json({ message: 'Type is required' });
  }

  try {
    // Create a new student category
    const newCategory = new Student({
      type
    });

    // Save the category to the database
    await newCategory.save();

    // Return success response
    res.status(201).json({ message: 'Student category added successfully', category: newCategory });
  } catch (error) {
    // Handle errors during save
    res.status(500).json({ message: 'Error adding student category', error: error.message });
  }
};

// Controller function to get all student categories (GET)
const getStudentCategories = async (req, res) => {
  try {
    // Fetch all student categories from the database
    const categories = await Student.find();

    // Return the categories
    res.status(200).json({ message: 'Student categories retrieved successfully', categories });
  } catch (error) {
    // Handle errors during fetch
    res.status(500).json({ message: 'Error fetching student categories', error: error.message });
  }
};



const addStudent = async (req, res) => {
  const {
    academicYear,
    studentClass,
    section,
    admissionNumber,
    admissionDate,
    roll,
    group,
    firstName,
    lastName,
    gender,
    dateOfBirth,
    religion,
    caste,
    studentPhoto,
    email,
    phone,
    address,
    fatherName,
    motherName,
    guardianName,
    fatherOccupation,
    motherOccupation,
    guardianPhone,
    documentType,
    documentNumber,
    issueDate,
    expirationDate,
    previousSchoolName,
    gradeCompleted,
    schoolAddress,
    schoolContact,
    additionalInfo,
    customField1,
    category, // Include category field here
  } = req.body;

  try {
    // Generate a random password for the student
    const randomPassword = crypto.randomBytes(8).toString('hex');
    console.log("Generated Random Password:", randomPassword);

    // Create the student object
    const newStudent = new Student({
      academicYear,
      class: studentClass,
      section,
      admissionNumber,
      admissionDate,
      roll,
      group,
      firstName,
      lastName,
      gender,
      category,
      dateOfBirth,
      religion,
      caste,
      studentPhoto,
      email,
      phone,
      address,
      documentType,
      documentNumber,
      issueDate,
      expirationDate,
      previousSchoolName,
      gradeCompleted,
      schoolAddress,
      schoolContact,
      additionalInfo,
      customField1,
      randomPassword,

      // Directly store parent details in the myParents array
      myParents: [
        { name: fatherName, occupation: fatherOccupation, phone: guardianPhone, relationship: 'Father' },
        { name: motherName, occupation: motherOccupation, phone: guardianPhone, relationship: 'Mother' },
        { name: guardianName, phone: guardianPhone, relationship: 'Guardian' }
      ]
    });

    console.log("New Student Object Before Save:", newStudent);

    // Save the student record
    const savedStudent = await newStudent.save();
    console.log("Saved Student Record:", savedStudent);

    // Generate refresh token
    const refreshToken = generateRefreshToken(savedStudent._id);
    console.log("Generated Refresh Token:", refreshToken);

    // Save refresh token in the database
    savedStudent.refreshToken = refreshToken;
    await savedStudent.save();
    console.log("Updated Student with Refresh Token:", savedStudent);

    // Set the refresh token in an HTTP-only cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 72 * 60 * 60 * 1000, // 3 days expiration
      sameSite: 'Strict',
    });

    // Generate access token
    const accessToken = generateToken(savedStudent._id);
    console.log("Generated Access Token:", accessToken);

    // Respond with the saved student, tokens, and password
    res.status(201).json({
      message: 'Student added successfully',
      student: savedStudent,
      accessToken,
      refreshToken,
    });
  } catch (error) {
    console.error("Error Adding Student:", error.message);
    res.status(500).json({ message: 'Error adding student', error: error.message });
  }
};



const getStudentsAdmission = async (req, res) => {
  try {
    // Fetch students with selected fields only, sorted by creation date (newest first)
    const students = await Student.find()
      .sort({ createdAt: -1 })  // Sort by createdAt in descending order (newest first)

    // Return success response with the list of students
    res.status(200).json({ message: 'Students fetched successfully', students });
  } catch (error) {
    // Handle errors during the fetch operation
    res.status(500).json({ message: 'Error fetching students', error: error.message });
  }
};

const getStudentDetails = async (req, res) => {
  try {
    const { studentId } = req.params;

    // Fetch the student details by ID
    const student = await Student.findById(studentId);

    // Check if the student exists
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Return success response with student details
    res.status(200).json({ message: 'Student details fetched successfully', student });
  } catch (error) {
    // Handle errors during the fetch operation
    res.status(500).json({ message: 'Error fetching student details', error: error.message });
  }
};



// POST: Add a new holiday
const addHoliday = async (req, res) => {
  const { fromDate, toDate, holidayName, holidayMessage } = req.body;

  try {
    const newHoliday = new Holiday({ fromDate, toDate, holidayName, holidayMessage });
    await newHoliday.save();
    res.status(201).json({ message: 'Holiday added successfully!', holiday: newHoliday });
  } catch (error) {
    res.status(500).json({ message: 'Error adding holiday', error: error.message });
  }
};




// Controller function to get a single student's data by ID
const getStudentById = async (req, res) => {
  try {
    const { id } = req.params; // Extract student ID from request parameters

    // Fetch the student using the provided ID, only return selected fields
    const student = await Student.findById(id, 'admissionNumber firstName lastName fatherName dateOfBirth class gender category attendanceStatus section');

    if (!student) {
      // If student is not found, return a 404 response
      return res.status(404).json({ message: 'Student not found' });
    }

    // Return the student data as a success response
    res.status(200).json({ message: 'Student fetched successfully', student });
  } catch (error) {
    // Handle errors during the fetch operation
    res.status(500).json({ message: 'Error fetching student', error: error.message });
  }
};



// Controller to fetch students and export as Excel or PDF
const exportStudentsData = async (req, res) => {
  try {
    // Fetch students with selected fields only
    const students = await Student.find({}, 'admissionNumber firstName lastName fatherName dateOfBirth class gender category attendanceStatus');

    if (!students || students.length === 0) {
      return res.status(404).json({ message: 'No students data found.' });
    }

    const format = req.query.format || 'excel'; // Format can be either 'excel' or 'pdf'

    // Export to Excel
    if (format === 'excel') {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Students Data');

      // Add headers
      worksheet.columns = [
        { header: 'Admission No', key: 'admissionNumber', width: 20 },
        { header: 'First Name', key: 'firstName', width: 20 },
        { header: 'Last Name', key: 'lastName', width: 20 },
        { header: 'Father Name', key: 'fatherName', width: 20 },
        { header: 'Date of Birth', key: 'dateOfBirth', width: 20 },
        { header: 'Class', key: 'class', width: 10 },
        { header: 'Gender', key: 'gender', width: 10 },
        { header: 'Category', key: 'category', width: 15 },
        { header: 'Attendance Status', key: 'attendanceStatus', width: 20 }
      ];

      // Add rows
      students.forEach((student) => {
        worksheet.addRow(student);
      });

      // Set response headers for Excel file
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename=students_data.xlsx');

      // Send Excel file to the client
      await workbook.xlsx.write(res);
      res.end();
    }

    // Export to PDF
    else if (format === 'pdf') {
      const doc = new PDFDocument();
      let fileName = 'students_data.pdf';

      // Set response headers for PDF file
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);

      // Pipe the document to the response
      doc.pipe(res);

      // Set title for the PDF
      doc.fontSize(18).text('Students Data', { align: 'center' });
      doc.moveDown();

      // Add table headers
      const tableHeaders = [
        'Admission No', 'First Name', 'Last Name', 'Father Name', 'Date of Birth',
        'Class', 'Gender', 'Category', 'Attendance Status'
      ];

      tableHeaders.forEach(header => {
        doc.fontSize(12).text(header, { continued: true });
        doc.moveUp(1);
      });

      // Add rows for each student
      students.forEach(student => {
        doc.fontSize(10).text(`
          ${student.admissionNumber || 'N/A'} | 
          ${student.firstName || 'N/A'} | 
          ${student.lastName || 'N/A'} | 
          ${student.fatherName || 'N/A'} | 
          ${student.dateOfBirth ? student.dateOfBirth.toISOString().split('T')[0] : 'N/A'} | 
          ${student.class || 'N/A'} | 
          ${student.gender || 'N/A'} | 
          ${student.category || 'N/A'} | 
          ${student.attendanceStatus || 'N/A'}
        `);
        doc.moveDown(1);
      });

      // Finalize the PDF file
      doc.end();
    }

    else {
      return res.status(400).json({ message: 'Invalid format. Please choose "excel" or "pdf".' });
    }

  } catch (error) {
    console.error('Error exporting students data:', error);
    res.status(500).json({ message: 'Error exporting students data', error: error.message });
  }
};
// Controller function to get all attendance records
const getAttendance = async (req, res) => {
  try {
    // Fetch all attendance records from the database
    const attendanceRecords = await Attendance.find();

    // Return success response with the list of attendance records
    res.status(200).json({ message: 'Attendance records fetched successfully', attendance: attendanceRecords });
  } catch (error) {
    // Handle errors during the fetch operation
    res.status(500).json({ message: 'Error fetching attendance records', error: error.message });
  }
};

// Controller function to add a new student group
const addStudentGroup = async (req, res) => {
  const { groupName, students } = req.body;

  // Check if required fields are provided
  if (!groupName || !students || students.length === 0) {
    return res.status(400).json({ message: 'Group name and student list are required' });
  }

  try {
    // Create a new student group
    const newStudentGroup = new StudentGroup({
      groupName,
      students
    });

    // Save the student group to the database
    await newStudentGroup.save();

    // Return success response
    res.status(201).json({ message: 'Student group added successfully', studentGroup: newStudentGroup });
  } catch (error) {
    // Handle errors during save
    res.status(500).json({ message: 'Error adding student group', error: error.message });
  }
};

// Controller function to get all student groups
const getStudentGroups = async (req, res) => {
  try {
    // Fetch all student groups from the database, including populated student data
    const studentGroups = await StudentGroup.find().populate('students', 'firstName lastName admissionNumber');  // Populating student details

    // Return success response with the list of student groups
    res.status(200).json({ message: 'Student groups fetched successfully', studentGroups });
  } catch (error) {
    // Handle errors during the fetch operation
    res.status(500).json({ message: 'Error fetching student groups', error: error.message });
  }
};


// Controller function to add a new fees group
const addFeesGroup = async (req, res) => {
  const { name, description } = req.body;

  // Check if required fields are provided
  if (!name || !description) {
    return res.status(400).json({ message: 'Name and description are required' });
  }

  try {
    // Create a new fees group
    const newFeesGroup = new Fee({
      name,
      description
    });

    // Save the fees group to the database
    await newFeesGroup.save();

    // Return success response
    res.status(201).json({ message: 'Fees group added successfully', feesGroup: newFeesGroup });
  } catch (error) {
    // Handle errors during save
    res.status(500).json({ message: 'Error adding fees group', error: error.message });
  }
};

// Controller function to get all fees groups
const getFeesGroups = async (req, res) => {
  try {
    // Fetch all fees groups from the database
    const feesGroups = await Fee.find();

    // Return success response with the list of fees groups
    res.status(200).json({ message: 'Fees groups fetched successfully', feesGroups });
  } catch (error) {
    // Handle errors during the fetch operation
    res.status(500).json({ message: 'Error fetching fees groups', error: error.message });
  }
};

// Controller function to add a new fees type
const addFeesType = async (req, res) => {
  const { name, feesGroup, description } = req.body;

  // Check if required fields are provided
  if (!name || !feesGroup || !description) {
    return res.status(400).json({ message: 'Name, Fees Group, and Description are required' });
  }

  try {
    // Create a new fees type
    const newFeesType = new Fee({
      name,
      feesGroup,
      description
    });

    // Save the fees type to the database
    await newFeesType.save();

    // Return success response
    res.status(201).json({ message: 'Fees type added successfully', feesType: newFeesType });
  } catch (error) {
    // Handle errors during save
    res.status(500).json({ message: 'Error adding fees type', error: error.message });
  }
};

// Controller function to get all fees types
const getFeesTypes = async (req, res) => {
  try {
    // Fetch all fees types from the database
    const feesTypes = await Fee.find();

    // Return success response with the list of fees types
    res.status(200).json({ message: 'Fees types fetched successfully', feesTypes });
  } catch (error) {
    // Handle errors during the fetch operation
    res.status(500).json({ message: 'Error fetching fees types', error: error.message });
  }
};

// Controller function to get all invoices
export const getInvoices = async (req, res) => {
  try {
    // Fetch all invoices, populating student details
    const invoices = await Invoice.find().populate('student');

    // Return the list of invoices with necessary fields
    const invoiceDetails = invoices.map(invoice => ({
      SL: invoice._id,
      Student: `${invoice.student.firstName} ${invoice.student.lastName}`,  // Assuming Student model has firstName and lastName
      Amount: invoice.amount,
      Waiver: invoice.waiver,
      Fine: invoice.fine,
      Paid: invoice.paid,
      Balance: invoice.balance,
      Status: invoice.status,
      Date: invoice.date
    }));

    // Send the response
    res.status(200).json({
      message: 'Invoices fetched successfully',
      invoices: invoiceDetails
    });
  } catch (error) {
    // Handle errors during the fetch operation
    res.status(500).json({
      message: 'Error fetching invoices',
      error: error.message
    });
  }
};

const addTransportRoute = async (req, res) => {
  const { routeTitle, driver, stops, date } = req.body;

  try {
    const newRoute = new Transport({
      routeTitle,
      driver,
      stops,
      date
    });

    await newRoute.save();
    res.status(201).json({ message: 'Transport route added successfully', route: newRoute });
  } catch (error) {
    res.status(500).json({ message: 'Error adding transport route', error: error.message });
  }
};

// Controller function to get all transport routes
const getTransportRoutes = async (req, res) => {
  try {
    // Fetch all transport route records from the database
    const routes = await Transport.find();

    // Return the fetched transport routes
    res.status(200).json({
      message: 'Transport routes fetched successfully',
      routes: routes
    });
  } catch (error) {
    // Handle errors during fetch
    res.status(500).json({ message: 'Error fetching transport routes', error: error.message });
  }
};

// Controller function to add a vehicle
const addVehicle = async (req, res) => {
  const { vehicleNumber, vehicleModel, yearMade, driver, note } = req.body;


  try {
    // Create a new vehicle entry
    const newVehicle = new Vehicle({
      vehicleNumber: vehicleNumber,
      vehicleModel: vehicleModel,
      yearMade: yearMade,
      driver: driver,
      note: note
    });

    // Save the vehicle to the database
    await newVehicle.save();

    // Return success response
    res.status(201).json({ message: 'Vehicle added successfully', vehicle: newVehicle });
  } catch (error) {
    // Handle errors during save
    res.status(500).json({ message: 'Error adding vehicle', error: error.message });
  }
};

// Controller function to get all vehicles
const getVehicles = async (req, res) => {
  try {
    // Fetch all vehicle records from the database
    const vehicles = await Vehicle.find();

    // Return the fetched vehicles
    res.status(200).json({
      message: 'Vehicles fetched successfully',
      vehicles: vehicles
    });
  } catch (error) {
    // Handle errors during fetch
    res.status(500).json({ message: 'Error fetching vehicles', error: error.message });
  }
};

// Controller function to assign a vehicle to a route
const assignVehicle = async (req, res) => {
  const { route, vehicle } = req.body;


  try {
    // Create an assignment entry
    const newAssignment = new Vehicle({
      route: route,
      vehicle: vehicle
    });

    // Save the assignment to the database
    await newAssignment.save();

    // Return success response
    res.status(201).json({ message: 'Vehicle assigned to route successfully', assignment: newAssignment });
  } catch (error) {
    res.status(500).json({ message: 'Error assigning vehicle to route', error: error.message });
  }
};

// Controller function to get all vehicle assignments
const getVehicleAssignments = async (req, res) => {
  try {
    // Fetch all assignments from the database
    const assignments = await Vehicle.find()
      .populate('route', 'routeTitle')  // Populate route details
      .populate('vehicle', 'vehicleNumber vehicleModel');  // Populate vehicle details

    // Return the fetched assignments
    res.status(200).json({
      message: 'Vehicle assignments fetched successfully',
      assignments: assignments
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching vehicle assignments', error: error.message });
  }
};

// Controller function to add a new exam type
const addExamType = async (req, res) => {
  const { examName } = req.body;

  if (!examName) {
    return res.status(400).json({ message: 'Exam name is required' });
  }

  try {
    // Create a new exam type entry
    const newExamType = new ExamType({
      examName: examName
    });

    // Save the new exam type to the database
    await newExamType.save();

    // Return success response
    res.status(201).json({ message: 'Exam type added successfully', examType: newExamType });
  } catch (error) {
    res.status(500).json({ message: 'Error adding exam type', error: error.message });
  }
};

// Controller function to get all exam types
const getExamTypes = async (req, res) => {
  try {
    // Fetch all exam types from the database
    const examTypes = await ExamType.find();

    // Return the fetched exam types
    res.status(200).json({
      message: 'Exam types fetched successfully',
      examTypes: examTypes
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching exam types', error: error.message });
  }
};


const addExamSchedule = async (req, res) => {
  const {
    examTitle,
    class: examClass,
    section,
    examCenter,
    examDays, // Array of exam days with multiple exams (e.g. before and after lunch)
    examType, // The exam type (e.g., 'Mid-Term', 'Final')
  } = req.body;

  try {
    if (!examDays || examDays.length === 0) {
      return res.status(400).json({
        message: 'No exam days provided',
      });
    }

    const examSchedules = [];

    // Loop through each day in the examDays array
    for (let day of examDays) {
      const { date, exams } = day; // Each day has a date and an array of exams (before and after lunch)

      if (!exams || exams.length === 0) {
        return res.status(400).json({
          message: `No exams provided for the day ${date}`,
        });
      }

      // Loop through each exam for the day
      for (let exam of exams) {
        const { subject, startTime, endTime, examTime } = exam;

        const examSchedule = new Exam({
          examTitle,
          class: examClass,
          section,
          subject,
          examDate: new Date(date), // Set the exam date for each specific exam
          startTime,
          endTime,
          examTime,
          examType, // Using the examType passed in the body
          examCenter,
          isAdmitCardGenerated: false, // Default value for isAdmitCardGenerated
        });

        // Save the exam schedule to the database
        await examSchedule.save();

        // Add the saved exam schedule to the list
        examSchedules.push(examSchedule);
      }
    }

    // Now, update all students of the specified class and section
    const students = await Student.find({
      class: examClass,
      section: section,
    });

    // Create an array of exam schedules to push to students
    const examScheduleData = examSchedules.map((schedule) => ({
      examDate: schedule.examDate,
      subject: schedule.subject,
      startTime: schedule.startTime,
      endTime: schedule.endTime,
      examTime: schedule.examTime,
      examType: schedule.examType,
      isAdmitCardGenerated: schedule.isAdmitCardGenerated,
    }));

    // Push the exam schedule data to each student
    for (let student of students) {
      student.examSchedule = [...student.examSchedule, ...examScheduleData];
      await student.save();
    }

    // Return success response
    res.status(201).json({
      message: 'Exam schedules added and updated for students successfully',
      examSchedules: examSchedules.map(schedule => ({
        examTitle,
        class: examClass,
        section,
        examCenter,
        examType,
        exams: examSchedules
          .filter(s => s.examDate.toISOString().split('T')[0] === schedule.examDate.toISOString().split('T')[0])
          .map(s => ({
            examDate: s.examDate,
            subject: s.subject,
            startTime: s.startTime,
            endTime: s.endTime,
            examTime: s.examTime,
            isAdmitCardGenerated: s.isAdmitCardGenerated,
          })),
      })),
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error adding exam schedules and updating students',
      error: error.message,
    });
  }
};


// Controller function to get all exam schedules
const getExamSchedule = async (req, res) => {
  try {
    const { class: classParam, section } = req.query;

    // Log incoming query parameters
    console.log('Query Parameters:', { class: classParam, section });

    // Fetch all exam schedules for a specific class and section
    const examSchedules = await Exam.aggregate([
      { $match: { class: classParam, section: section } }, // Filter by class and section
      {
        $group: {
          _id: { class: "$class", section: "$section", examTitle: "$examTitle", examCenter: "$examCenter", examType: "$examType" },
          exams: {
            $push: {
              examDate: "$examDate",
              subject: "$subject",
              startTime: "$startTime",
              endTime: "$endTime",
              examTime: "$examTime",
              isAdmitCardGenerated: "$isAdmitCardGenerated"
            }
          }
        }
      },
      {
        $project: {
          _id: 1, // Include _id in the result
          examTitle: "$_id.examTitle",
          class: "$_id.class",
          section: "$_id.section",
          examCenter: "$_id.examCenter",
          examType: "$_id.examType",
          exams: 1
        }
      }
    ]);

    // Log the result from the database query
    console.log('Exam Schedules:', examSchedules);

    // Return the exam schedules in the desired format
    res.status(200).json({
      message: 'Exam schedules fetched successfully',
      examSchedules: examSchedules
    });
  } catch (error) {
    console.error('Error fetching exam schedules:', error.message);
    res.status(500).json({
      message: 'Error fetching exam schedules',
      error: error.message
    });
  }
};

const generateAdmitCard = async (req, res) => {
  const { scheduleId } = req.params;

  try {
    // Find the exam schedule by ID and update the isAdmitCardGenerated field to true
    const examSchedule = await Exam.findByIdAndUpdate(
      scheduleId,
      { isAdmitCardGenerated: true },
      { new: true } // Return the updated document
    );

    if (!examSchedule) {
      return res.status(404).json({ message: 'Exam schedule not found' });
    }

    // Return success response
    res.status(200).json({
      message: 'Admit card generated successfully',
      examSchedule
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error generating admit card',
      error: error.message
    });
  }
};



// Controller function to get all exam schedules
const getExamSchedules = async (req, res) => {
  try {
    // Fetch all exam schedules from the database
    const examSchedules = await ExamSchedule.find();

    // Return the fetched exam schedules
    res.status(200).json({
      message: 'Exam schedules fetched successfully',
      examSchedules: examSchedules
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching exam schedules', error: error.message });
  }
};

const createSeatPlan = async (req, res) => {
  try {
    const { roomNumber, seatRules, class: studentClass, section, exam } = req.body;

    // Check if seat rules are provided
    if (!seatRules || seatRules.length === 0) {
      return res.status(400).json({ message: "Seat rule data is required." });
    }

    // Validate the class, section, and exam data (optional validation)
    if (!studentClass || !section || !exam) {
      return res.status(400).json({ message: "Class, Section, and Exam data are required." });
    }

    // Get all students based on the class and section, sorted by roll number
    const students = await Student.find({
      class: studentClass,
      section: section,
    }).sort("rollNumber");

    // Check if no students found
    if (students.length === 0) {
      return res.status(404).json({ message: "No students found for the provided class and section." });
    }

    // Create seat plan data based on roll number ranges
    const seatPlanData = [];

    // Iterate over each seat rule (like 1-50, 51-100)
    seatRules.forEach((rule) => {
      let seatNumber = seatPlanData.length + 1;  // Start from the current seat number

      // For each rule, check if a student falls in the roll number range
      students.forEach((student) => {
        if (student.rollNumber >= rule.startRoll && student.rollNumber <= rule.endRoll) {
          seatPlanData.push({
            seatNumber: seatNumber++, // Increment seat number for each student
            studentId: student._id, // Student data
            name: student.name, // Student name
            roomNumber,
            row: rule.row,
            class: studentClass,  // Add class to seat plan
            section,  // Add section to seat plan
            exam,  // Add exam to seat plan
          });
        }
      });

      // If no students are found in the range, add a seat with null for studentId and name
      const studentsInRange = seatPlanData.filter(seat => seat.row === rule.row);
      if (studentsInRange.length === 0) {
        seatPlanData.push({
          seatNumber: seatNumber, // Seat number continues from where it left off
          studentId: null, // No student matched the range
          name: null, // No student matched the range
          roomNumber,
          row: rule.row,
          class: studentClass,  // Add class to the row
          section,  // Add section to the row
          exam,  // Add exam to the row
        });
      }
    });

    // Save seat plan data (without duplicates)
    const createdSeatPlan = await SeatPlan.insertMany(seatPlanData);

    return res.status(201).json({
      message: "Seat plan created successfully",
      seatPlan: seatPlanData,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};




// Get all seat plans
const getSeatPlan = async (req, res) => {
  try {
    // Get all seat plans
    const seatPlan = await SeatPlan.find()

    if (!seatPlan || seatPlan.length === 0) {
      return res.status(404).json({ message: "No seat plans found." });
    }

    return res.status(200).json({ seatPlan });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};


// // Controller function to generate an admit card
//  const generateAdmitCard = async (req, res) => {
//   const { studentId, examId } = req.body;

//   // Validate the request
//   if (!studentId || !examId) {
//     return res.status(400).json({ message: 'Student ID and Exam ID are required' });
//   }

//   try {
//     // Fetch student details
//     const student = await Student.findById(studentId);
//     if (!student) {
//       return res.status(404).json({ message: 'Student not found' });
//     }

//     // Fetch exam details
//     const exam = await ExamSchedule.findById(examId);
//     if (!exam) {
//       return res.status(404).json({ message: 'Exam not found' });
//     }

//     // Create a new admit card entry in the database (Optional)
//     const admitCard = new AdmitCard({
//       studentId: student._id,
//       examTitle: exam.examTitle,
//       examDate: exam.examDate,
//       startTime: exam.startTime,
//       endTime: exam.endTime,
//       class: student.class,
//       section: student.section,
//       subject: exam.subject,
//       admitCardGenerated: true
//     });

//     await admitCard.save();  // Save admit card in the database

//     // Generate the Admit Card PDF using PDFKit
//     const doc = new PDFDocument();
//     doc.fontSize(20).text('Admit Card', { align: 'center' });
//     doc.moveDown(2);

//     // Student Details
//     doc.fontSize(14).text(`Name: ${student.firstName} ${student.lastName}`);
//     doc.text(`Admission Number: ${student.admissionNumber}`);
//     doc.text(`Class: ${student.class} - Section: ${student.section}`);
//     doc.text(`Date of Birth: ${student.dateOfBirth.toDateString()}`);
//     doc.moveDown(1);

//     // Exam Details
//     doc.text(`Exam Title: ${exam.examTitle}`);
//     doc.text(`Subject: ${exam.subject}`);
//     doc.text(`Exam Date: ${new Date(exam.examDate).toDateString()}`);
//     doc.text(`Start Time: ${exam.startTime}`);
//     doc.text(`End Time: ${exam.endTime}`);

//     // End of Document
//     doc.end();

//     // Send the PDF file as the response
//     res.setHeader('Content-Type', 'application/pdf');
//     res.setHeader('Content-Disposition', 'attachment; filename=admit_card.pdf');
//     doc.pipe(res);  // Pipe the generated PDF to the response

//   } catch (error) {
//     res.status(500).json({ message: 'Error generating admit card', error: error.message });
//   }
// };

const addTopic = async (req, res) => {
  try {
    const { className, section, subject, lesson, topic } = req.body;

    // Validate input fields
    if (!className || !section || !subject || !lesson || !topic) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    // Check if the topic already exists for the given lesson
    const existingTopic = await Topic.findOne({ lesson, topic });
    if (existingTopic) {
      return res.status(400).json({ message: 'Topic already exists for this lesson.' });
    }

    // Create a new topic entry
    const newTopic = new Topic({
      className,
      section,
      subject,
      lesson,
      topic,
    });

    // Save the topic in the database
    await newTopic.save();

    res.status(201).json({ message: 'Topic added successfully.', data: newTopic });
  } catch (error) {
    res.status(500).json({ message: 'Error adding topic.', error: error.message });
  }
};

const getTopics = async (req, res) => {
  try {
    // Fetch all topics from the database
    const topics = await Topic.find();

    // If no topics are found, send a 404 response
    if (topics.length === 0) {
      return res.status(404).json({ message: 'No topics found.' });
    }

    // Send the found topics as a response
    res.status(200).json({ message: 'Topics retrieved successfully.', data: topics });
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving topics.', error: error.message });
  }
};


const getSubjectWiseAttendance = async (req, res) => {
  const { class: classFilter, section, subject, attendanceDate } = req.query;

  try {
    // Build the filter query dynamically based on provided filters
    const filter = {};

    // Check if 'class' filter is provided
    if (classFilter) {
      filter.class = classFilter;
    }

    // Check if 'section' filter is provided
    if (section) {
      filter.section = section;
    }

    // Check if 'subject' filter is provided
    if (subject) {
      filter.subject = subject;
    }

    // Check if 'attendanceDate' filter is provided
    if (attendanceDate) {
      filter.attendanceDate = new Date(attendanceDate); // Convert to Date object if necessary
    }

    // Fetch attendance data from the database based on the dynamic filter
    const attendanceData = await Attendance.find(filter);

    // If no records are found based on the provided filters
    if (attendanceData.length === 0) {
      return res.status(404).json({ message: "No attendance records found for the given criteria." });
    }

    // If data is found, return the attendance records
    return res.status(200).json({
      message: "Attendance records fetched successfully",
      attendanceData,
    });

  } catch (error) {
    console.error("Error fetching attendance:", error);
    return res.status(500).json({ message: "An error occurred while fetching the attendance data." });
  }
};

// Controller for adding homework
const addHomework = async (req, res) => {
  try {
    // Handle file upload
    let file = '';
    if (req.file) {
      file = req.file.path; // Get the path of the uploaded file
    }

    // Create a new homework entry
    const newHomework = new Homework({
      class: req.body.class,
      subject: req.body.subject,
      section: req.body.section,
      homeworkDate: req.body.homeworkDate,
      submissionDate: req.body.submissionDate,
      marks: req.body.marks,
      file: file, // Save the uploaded file path
      description: req.body.description,
    });

    // Save the homework entry to the database
    await newHomework.save();

    // Respond with success
    res.status(201).json({
      message: 'Homework added successfully',
      homework: newHomework,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error adding homework' });
  }
};



// Controller to get all homework
const getAllHomework = async (req, res) => {
  try {
    const homework = await Homework.find();  // Fetch all homework entries
    res.status(200).json(homework);  // Send homework data as JSON response
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching homework' });
  }
};


const createOrUpdateClassRoutine = async (req, res) => {
  const { class: className, section, routine } = req.body;

  try {
    // Manually create a new routine or update the existing one based on className and section
    const newRoutine = new Routine({ class: className, section, routine });

    // Save the routine to the database
    await newRoutine.save();

    // Fetch all students in the specific class and section
    const students = await Student.find({ class: className, section: section });

    // For each student, push the new routine data into the routine[] array
    const routineData = {
      class: newRoutine.class,
      section: newRoutine.section,
      routine: newRoutine.routine,
      _id: newRoutine._id, // Adding routine ID to the pushed data
    };

    for (const student of students) {
      student.routine.push(routineData); // Push the entire routine data, not just the ID
      await student.save(); // Save the student with the updated routine array
    }

    // Return the created routine data in the required response format
    return res.status(201).json([{
      class: newRoutine.class,
      section: newRoutine.section,
      routine: newRoutine.routine,
      _id: newRoutine._id, // Include the ID in the response as well
    }]);
  } catch (error) {
    console.error("Error creating or updating class routine:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

const getClassRoutine = async (req, res) => {
  try {
    // Fetch all class routines from the database
    const routines = await Routine.find();

    // If no routines found
    if (routines.length === 0) {
      return res.status(404).json({ success: false, message: "No class routines found" });
    }

    // Return the fetched routines with a well-structured response
    return res.status(200).json({
      success: true,
      message: "Class routines retrieved successfully",
      routines: routines
    });
  } catch (error) {
    console.error("Error fetching class routines:", error);
    return res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
  }
};


// Controller to add a new assignment
const addAssignment = async (req, res) => {
  try {
    // Handle file upload
    let file = '';
    if (req.file) {
      file = req.file.path; // Get the path of the uploaded file
    }

    // Create a new homework entry
    const newHomework = new Assignment({
      class: req.body.class,
      subject: req.body.subject,
      section: req.body.section,
      assignmentTitle: req.body.assignmentTitle,
      availableFor: req.body.availableFor,
      dueDate: req.body.dueDate,
      file: file, // Save the uploaded file path
      description: req.body.description,
    });

    // Save the homework entry to the database
    await newHomework.save();

    // Respond with success
    res.status(201).json({
      message: 'Homework added successfully',
      homework: newHomework,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error adding homework' });
  }
};

// Controller to get assignments (with optional filters)
const getAssignments = async (req, res) => {
  try {
    const { class: className, section } = req.query;

    // Build the filters dynamically if provided
    const filters = {};
    if (className) filters.class = className;
    if (section) filters.section = section;

    // Fetch assignments based on filters (or all if filters are empty)
    const assignments = await Assignment.find(filters);

    if (assignments.length === 0) {
      return res.status(404).json({ message: 'No assignments found' });
    }

    res.status(200).json(assignments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching assignments' });
  }
};

// Controller to post a new syllabus
const postSyllabus = async (req, res) => {
  try {
    let file = '';
    if (req.file) {
      file = req.file.path; // Get the path of the uploaded file
    }

    const newSyllabus = new Syllabus({
      syllabusTitle: req.body.syllabusTitle,
      syllabusType: req.body.syllabusType,
      availableFor: req.body.availableFor,
      class: req.body.class,
      section: req.body.section,
      date: req.body.date,
      description: req.body.description,
      file: file,
    });

    await newSyllabus.save();
    res.status(201).json({ message: "Syllabus posted successfully", syllabus: newSyllabus });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error posting syllabus" });
  }
};

// Controller to get syllabus data
const getSyllabus = async (req, res) => {
  try {
    const { class: className, section } = req.query;

    // Build filters dynamically if provided
    const filters = {};
    if (className) filters.class = className;
    if (section) filters.section = section;

    // Fetch syllabus based on filters (or all if filters are empty)
    const syllabus = await Syllabus.find(filters);

    if (syllabus.length === 0) {
      return res.status(404).json({ message: "No syllabus found" });
    }

    res.status(200).json(syllabus);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching syllabus" });
  }
};

const addAttendance = async (req, res) => {
  try {
    const { studentId, class: className, section, date, status } = req.body;

    // Extract the month and year from the provided date
    const month = new Date(date).getMonth() + 1; // getMonth() is 0-indexed, so add 1
    const year = new Date(date).getFullYear();   // Extract the year

    // Create a new attendance entry
    const newAttendance = new Attendance({
      studentId,
      class: className,
      section,
      date,
      status,
      month: month.toString().padStart(2, '0'), // Ensure month is in 2-digit format
      year: year.toString(),                    // Ensure year is in 4-digit format
    });

    // Save the attendance entry to the database
    await newAttendance.save();

    res.status(201).json({
      message: 'Attendance added successfully',
      attendance: newAttendance,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error adding attendance' });
  }
};


const createNotice = asyncHandler(async (req, res) => {
  const { title, description, date, className, section, targetAudience, postedBy } = req.body;

  // Step 1: Create a new notice document
  const newNotice = new Notice({
    title,
    description,
    date,
    class: className,
    section,
    targetAudience,
    postedBy
  });

  // Step 2: Save the new notice to the database
  const createdNotice = await newNotice.save();

  // Step 3: Respond with the created notice
  res.status(201).json({
    message: "Notice created successfully",
    notice: createdNotice
  });
});


// Get all notices
const getNotices = asyncHandler(async (req, res) => {
  // Step 1: Retrieve all notices from the database
  const notices = await Notice.find();

  // Step 2: Respond with the list of notices
  if (notices.length === 0) {
    return res.status(404).json({
      message: "No notices found"
    });
  }

  res.status(200).json({
    message: "Notices fetched successfully",
    notices: notices
  });
});

// Controller to add a subject
const createSubjectByAdmin = asyncHandler(async (req, res) => {
  const { subjectName, subjectType, subjectCode } = req.body;

  // Check if all fields are provided
  if (!subjectName || !subjectType || !subjectCode) {
    return res.status(400).json({ message: 'All fields (subjectName, subjectType, subjectCode) are required.' });
  }

  // Step 1: Create a new subject object
  const newSubject = new Subject({
    subjectName,
    subjectType,
    subjectCode,
  });

  // Save the subject to the database
  const createdSubject = await newSubject.save();

  // Step 2: Respond with the created subject
  res.status(201).json({
    message: 'Subject added successfully',
    subject: createdSubject,
  });
});

// Controller to get all subjects
const getSubjects = asyncHandler(async (req, res) => {
  try {
    // Fetch all subjects from the database
    const subjects = await Subject.find();

    if (!subjects || subjects.length === 0) {
      return res.status(404).json({ message: 'No subjects found.' });
    }

    // Step 2: Respond with the list of subjects
    res.status(200).json({
      message: 'Subjects retrieved successfully',
      subjects,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching subjects', error: error.message });
  }
});

// Controller to get only subject names
const getSubjectNames = asyncHandler(async (req, res) => {
  try {
    // Fetch all subjects from the database, but only select the subjectName field
    const subjectNames = await Subject.find({}, 'subjectName'); // 'subjectName' ensures only this field is returned

    if (!subjectNames || subjectNames.length === 0) {
      return res.status(404).json({ message: 'No subjects found.' });
    }

    // Extract subjectName from the documents and respond with an array of names
    const names = subjectNames.map((subject) => subject.subjectName);

    res.status(200).json({
      message: 'Subject names retrieved successfully',
      subjectNames: names,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching subject names', error: error.message });
  }
});


// Controller to create transport and assign it to a student
const createTransportAndAssignToStudent = asyncHandler(async (req, res) => {
  const { studentId, transportData } = req.body;  // Get studentId and transport data from the request body

  // Step 1: Create a new transport object
  const { transportType, route, pickupTime, dropTime, vehicle, driver } = transportData;

  const newTransport = new Transport({
    transportType,
    route,
    pickupTime,
    dropTime,
    vehicle,
    driver,
  });

  // Step 2: Save the transport to the database
  const createdTransport = await newTransport.save();

  // Step 3: Find the student by their studentId
  const student = await Student.findById(studentId);
  if (!student) {
    return res.status(404).json({ message: "Student not found" });
  }

  // Step 4: Assign the created transport to the student
  student.transport = createdTransport._id;

  // Step 5: Save the student with the assigned transport
  await student.save();

  // Step 6: Respond with success message and student details
  res.status(200).json({
    message: "Transport created and assigned to student successfully",
    student: {
      name: student.name,
      rollNumber: student.rollNumber,
      class: student.class,
      section: student.section,
      transport: createdTransport, // Include transport details
    },
  });
});


// Controller to generate admit cards for students based on scheduleId
const generateAdmitCards = async (req, res) => {
  try {
    const { scheduleId } = req.body; // Only get scheduleId from the request

    // Find all students who have the given scheduleId in their examSchedule array
    const students = await Student.updateMany(
      { 'examSchedule._id': scheduleId }, // Match students with the specific examSchedule _id
      {
        $set: {
          'admitCard.admitGenerated': true, // Mark admit card as generated
          'admitCard.issueDate': new Date(), // Set the issue date
        },
      }
    );

    // Send response based on modifiedCount
    if (students.modifiedCount > 0) {
      res.status(200).json({ message: 'Admit cards generated successfully.' });
    } else {
      res.status(404).json({ message: 'No students found for the given scheduleId.' });
    }
  } catch (error) {
    console.error('Error generating admit cards:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};


const createTeacher = async (req, res) => {
  const { name, email, phone, address, lastExperience, age, gender, education } = req.body;

  // Set the joining date to the current date
  const joiningDate = new Date(); // Current date and time

  try {
    // Generate a random password
    const randomPassword = crypto.randomBytes(8).toString('hex');
    console.log("Generated Random Password:", randomPassword);

    // Create a new Teacher instance (no photo)
    const newTeacher = new Teacher({
      name,
      email,
      phone,
      address,
      lastExperience,
      age,
      gender,
      education,
      joiningDate, // Add joining date to the teacher details
      password: randomPassword  // Save the generated password (ideally hash it before saving)
    });

    // Save the teacher to the database
    const savedTeacher = await newTeacher.save();

    // Generate refresh token
    const refreshToken = generateRefreshToken(savedTeacher._id);
    console.log("Generated Refresh Token:", refreshToken);

    // Save refresh token in the database (optional step, only if you want to store the refresh token)
    savedTeacher.refreshToken = refreshToken;
    await savedTeacher.save();
    console.log("Updated Teacher with Refresh Token:", savedTeacher);

    // Set the refresh token in an HTTP-only cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 72 * 60 * 60 * 1000, // 3 days expiration
      sameSite: 'Strict',
    });

    // Generate access token
    const accessToken = generateToken(savedTeacher._id);
    console.log("Generated Access Token:", accessToken);

    // Respond with the saved teacher, tokens, and password
    res.status(201).json({
      message: 'Teacher created successfully!',
      teacher: savedTeacher,
      accessToken,
      refreshToken,
      password: randomPassword, // Return the password (ideally never send in production)
    });
  } catch (err) {
    console.error("Error Creating Teacher:", err.message);
    res.status(500).json({
      message: 'Error creating teacher',
      error: err.message
    });
  }
};

// Get all teachers
const getAllTeachers = async (req, res) => {
  try {
    const teachers = await Teacher.find();
    res.status(200).json(teachers);
  } catch (err) {
    res.status(500).json({
      message: 'Error retrieving teachers',
      error: err.message
    });
  }
};

// Controller to add a new driver
const addDriver = async (req, res) => {
  const { name, email, age, gender, mobileNumber, joiningDate } = req.body;


  try {
    // Save driver to database
    const newDriver = new Driver({ name, email, age, gender, mobileNumber, joiningDate });
    await newDriver.save();
    res.status(201).json({ message: "Driver added successfully", driver: newDriver });
  } catch (error) {
    console.error("Error adding driver:", error);
    res.status(500).json({ message: "Error adding driver", error: error.message });
  }
};

// Controller to fetch all drivers
const getDrivers = async (req, res) => {
  try {
    const drivers = await Driver.find();
    res.status(200).json(drivers);
  } catch (error) {
    console.error("Error fetching drivers:", error);
    res.status(500).json({ message: "Error fetching drivers", error: error.message });
  }
};

const getAllMarks = asyncHandler(async (req, res) => {
  try {
    // Step 1: Retrieve all marks and populate student details
    const marks = await Marks.find().populate(
      "studentId",
      "firstName lastName class roll section fatherName motherName"
    );

    if (!marks || marks.length === 0) {
      return res.status(404).json({ message: "No marks found" });
    }

    // Step 2: Group marks by students and calculate totals
    const studentMarks = {};

    marks.forEach((mark) => {
      const studentId = mark.studentId?._id?.toString() || mark.studentId || "Unknown";

      if (!studentMarks[studentId]) {
        studentMarks[studentId] = {
          student: mark.studentId || { firstName: "N/A", lastName: "N/A" },
          subjects: [],
          totalObtainedMarks: 0,
          totalMarks: 0,
        };
      }

      const percentage = (mark.marksObtained / mark.totalMarks) * 100;

      // Determine grade based on percentage
      let grade = "F";
      if (percentage >= 90) grade = "A+";
      else if (percentage >= 80) grade = "A";
      else if (percentage >= 70) grade = "B";
      else if (percentage >= 60) grade = "C";
      else if (percentage >= 50) grade = "D";

      // Determine pass/fail status
      const status = percentage >= 40 ? "Pass" : "Fail";

      // Add subject details including examType
      studentMarks[studentId].subjects.push({
        subject: mark.subject,
        marksObtained: mark.marksObtained,
        totalMarks: mark.totalMarks,
        percentage: percentage.toFixed(2),
        grade,
        status,
        examType: mark.examType, // ✅ Exam Type Added Here
      });

      // Update total obtained marks and total marks
      studentMarks[studentId].totalObtainedMarks += mark.marksObtained;
      studentMarks[studentId].totalMarks += mark.totalMarks;
    });

    // Step 3: Process grouped data and calculate overall percentage/status
    const processedMarks = Object.values(studentMarks).map((student) => {
      const overallPercentage =
        (student.totalObtainedMarks / student.totalMarks) * 100;
      const overallStatus = overallPercentage >= 40 ? "Pass" : "Fail";

      return {
        ...student,
        overallPercentage: overallPercentage.toFixed(2),
        overallStatus,
      };
    });

    // Step 4: Respond with the processed marks
    res.status(200).json({
      message: "All marks retrieved successfully",
      marks: processedMarks,
    });
  } catch (error) {
    console.error("Error retrieving marks:", error);
    res.status(500).json({ message: "Failed to retrieve marks" });
  }
});

const getClassSectionTopper = asyncHandler(async (req, res) => {
  const { class: classFilter, section } = req.query; // Extract class and section from query params

  try {
    // Step 1: Retrieve all marks and populate student details
    const marks = await Marks.find().populate(
      "studentId",
      "firstName lastName class roll section fatherName motherName"
    );

    // Filter marks based on class and section
    const filteredMarks = marks.filter(
      (mark) =>
        mark.studentId?.class === classFilter &&
        mark.studentId?.section === section
    );

    if (!filteredMarks || filteredMarks.length === 0) {
      return res
        .status(404)
        .json({ message: "No marks found for this class and section" });
    }

    // Step 2: Group marks by students and calculate totals
    const studentMarks = {};

    filteredMarks.forEach((mark) => {
      const studentId = mark.studentId?._id?.toString() || mark.studentId || "Unknown";

      if (!studentMarks[studentId]) {
        studentMarks[studentId] = {
          student: mark.studentId || { firstName: "N/A", lastName: "N/A" },
          totalObtainedMarks: 0,
          totalMarks: 0,
        };
      }

      // Update total obtained marks and total marks
      studentMarks[studentId].totalObtainedMarks += mark.marksObtained;
      studentMarks[studentId].totalMarks += mark.totalMarks;
    });

    // Step 3: Find the student with the highest total obtained marks
    let topper = null;

    Object.values(studentMarks).forEach((student) => {
      if (
        !topper ||
        student.totalObtainedMarks > topper.totalObtainedMarks
      ) {
        topper = student;
      }
    });

    // Step 4: Calculate the topper's overall percentage
    if (topper) {
      topper.overallPercentage = (
        (topper.totalObtainedMarks / topper.totalMarks) *
        100
      ).toFixed(2);
    }

    // Step 5: Respond with the topper's details
    res.status(200).json({
      message: `Topper for Class ${classFilter} Section ${section} retrieved successfully`,
      topper,
    });
  } catch (error) {
    console.error("Error retrieving topper:", error);
    res.status(500).json({ message: "Failed to retrieve topper" });
  }
});




// Controller to add a new staff member
const addStaff = async (req, res) => {
  try {
    const { firstName, lastName, email, phone, position, department, gender, dateOfBirth, address, joiningDate, salary, employeeId, emergencyContact, profilePicture, qualifications } = req.body;

    const newStaff = new Staff({
      firstName,
      lastName,
      email,
      phone,
      position,
      department,
      gender,
      dateOfBirth,
      address,
      joiningDate,
      salary,
      employeeId,
      emergencyContact,
      profilePicture,
      qualifications
    });

    const savedStaff = await newStaff.save(); // Save the staff in the database

    res.status(201).json({
      message: 'Staff added successfully!',
      staff: savedStaff
    });
  } catch (error) {
    console.error('Error adding staff:', error);
    res.status(500).json({ message: 'Failed to add staff' });
  }
};

// Controller to get all staff members
const getAllStaff = async (req, res) => {
  try {
    const staff = await Staff.find(); // Get all staff from the database

    if (!staff || staff.length === 0) {
      return res.status(404).json({ message: 'No staff found' });
    }

    res.status(200).json({
      message: 'Staff retrieved successfully',
      staff
    });
  } catch (error) {
    console.error('Error retrieving staff:', error);
    res.status(500).json({ message: 'Failed to retrieve staff' });
  }
};


// Controller function to handle file uploads and saving school details
const updateSchoolDetails = async (req, res) => {
  try {
    const { schoolName, address, contact, email, description } = req.body;

    // Prepare file upload to Cloudinary
    let logoUrl = null;
    let schoolImageUrl = null;

    // Handle logo image upload
    if (req.files['logo']) {
      const logoUpload = await cloudinary.uploader.upload(req.files['logo'][0].path, {
        folder: 'school',  // Cloudinary folder to store images
      });
      logoUrl = logoUpload.secure_url;  // Get the URL of the uploaded logo
    }

    // Handle school image upload
    if (req.files['schoolImage']) {
      const schoolImageUpload = await cloudinary.uploader.upload(req.files['schoolImage'][0].path, {
        folder: 'school',  // Cloudinary folder to store images
      });
      schoolImageUrl = schoolImageUpload.secure_url;  // Get the URL of the uploaded school image
    }

    // Update school details in the database
    const admin = await Admin.findOneAndUpdate(
      {}, // Specify criteria to find the school or admin, e.g., admin ID
      {
        schoolName,
        address,
        contact,
        email,
        description,
        logo: logoUrl,  // Save the Cloudinary URL for the logo
        schoolImage: schoolImageUrl,  // Save the Cloudinary URL for the school image
      },
      { new: true } // Return the updated document
    );

    res.status(200).json({ message: 'School details updated successfully!', admin });
  } catch (error) {
    console.error('Error updating school details:', error);
    res.status(500).json({ error: 'Failed to update school details.' });
  }
};

// Controller to create a new school
const createSchool = async (req, res) => {
  try {
    const {
      schoolName,
      studentsCount,
      contactPersonName,
      contactPersonDesignation,
      contactPersonEmail,
      contactPersonMobileNumber,
      fullAddress,
    } = req.body;

    // Create a new school document
    const school = new Admin({
      schoolName,
      studentsCount,
      contactPersonName,
      contactPersonDesignation,
      contactPersonEmail,
      contactPersonMobileNumber,
      fullAddress,
    });

    // Save the school document to the database
    const savedSchool = await school.save();

    res.status(201).json({ message: 'School created successfully.', data: savedSchool });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'An error occurred while creating the school.', error: error.message });
  }
};


const addFee = async (req, res) => {
  try {
    const { studentId, feesType, invoiceNumber, status, amount, paidAmount, paymentMethod, paidDate, pendingPayment } = req.body;

    // Check if the student exists
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // Create a new fee entry
    const fee = new Fee({
      studentId,
      feesType,
      invoiceNumber,
      status,
      amount,
      paidAmount,
      paymentMethod,
      paidDate,
      pendingPayment,
    });

    // Save the fee entry
    const savedFee = await fee.save();

    // Add the full fee details to the student's fees array
    student.fees.push({
      feesType: savedFee.feesType,
      invoiceNumber: savedFee.invoiceNumber,
      status: savedFee.status,
      amount: savedFee.amount,
      paidAmount: savedFee.paidAmount,
      paymentMethod: savedFee.paymentMethod,
      paidDate: savedFee.paidDate,
      pendingPayment: savedFee.pendingPayment,
      // Include other fields as needed
    });

    // Save the updated student document
    await student.save();

    // Return the response with the added fee
    res.status(201).json({ message: "Fee added successfully", fee: savedFee });
  } catch (error) {
    res.status(500).json({ message: "Error adding fee", error: error.message });
  }
};

const updateFeeStatus = async (req, res) => {
  try {
    const { feeId, newStatus, paidAmount } = req.body;

    // Check if the new status is valid
    if (!['Paid', 'Pending', 'Overdue'].includes(newStatus)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    // Find the fee entry by its ID
    const fee = await Fee.findById(feeId);
    if (!fee) {
      return res.status(404).json({ message: "Fee not found" });
    }

    // If the status is being changed from 'Pending' to 'Paid'
    if (fee.status === 'Pending' && newStatus === 'Paid') {
      fee.status = 'Paid';
      fee.paidAmount = fee.amount; // Mark the full amount as paid
      fee.pendingPayment = 0; // Set pendingPayment to 0
    }
    // If the new status is 'Pending' and partial payment is being made
    else if (newStatus === 'Pending' && paidAmount) {
      if (paidAmount > fee.pendingPayment) {
        return res.status(400).json({ message: "Paid amount cannot exceed pending amount" });
      }
      fee.pendingPayment -= paidAmount; // Subtract paid amount from pending payment
      fee.paidAmount += paidAmount; // Add paid amount to paidAmount

      // If all pending payment is paid, set status to 'Paid'
      if (fee.pendingPayment === 0) {
        fee.status = 'Paid';
      } else {
        fee.status = 'Pending';
      }
    }
    // If the status is not 'Paid' and partial payment is being made, keep the status as Pending
    else if (newStatus === 'Pending') {
      fee.status = 'Pending';
    }
    else {
      fee.status = newStatus;
    }

    // Save the updated fee entry
    const updatedFee = await fee.save();

    // Update the student’s fees array (if needed)
    const student = await Student.findById(fee.studentId);
    if (student) {
      // Update the student’s fee entry with the new status and pendingPayment
      const feeIndex = student.fees.findIndex(f => f._id.toString() === feeId);
      if (feeIndex !== -1) {
        student.fees[feeIndex] = {
          ...student.fees[feeIndex],
          status: updatedFee.status,
          pendingPayment: updatedFee.pendingPayment,
          paidAmount: updatedFee.paidAmount,
        };
        await student.save();
      }
    }

    // Return the updated fee details
    res.status(200).json({ message: "Fee status updated successfully", fee: updatedFee });
  } catch (error) {
    res.status(500).json({ message: "Error updating fee status", error: error.message });
  }
};




const getFeeDetails = async (req, res) => {
  try {
    // Find all fee entries and populate the studentId field with student details
    const fees = await Fee.find()
      .populate('studentId', 'firstName lastName roll class section'); // Populating student details (only necessary fields)

    if (!fees || fees.length === 0) {
      return res.status(404).json({ message: "No fee records found" });
    }

    // Send the fee details along with student details
    res.status(200).json({ message: "Fee details fetched successfully", fees });
  } catch (error) {
    res.status(500).json({ message: "Error fetching fee details", error: error.message });
  }
};


// Controller to get fee details and calculate total paid and pending amount
const getPaidAndPendingAmount = async (req, res) => {
  try {
    // Fetch fee details from the database
    const fees = await Fee.find({}); // You can add filters like studentId or class if needed

    // Initialize totals
    let totalPaid = 0;
    let totalPending = 0;

    // Iterate over the fees to calculate total paid and pending
    fees.forEach(fee => {
      totalPaid += fee.paidAmount;
      totalPending += fee.pendingPayment;
    });

    // Send the response with total amounts and the fee details
    res.status(200).json({
      message: 'Fee details fetched successfully',
      totalPaid,
      totalPending
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: 'An error occurred while fetching fee details',
      error: error.message
    });
  }
};


// Controller to get unique classes
const getStudentClasses = async (req, res) => {
  try {
    // Fetch distinct classes from the Student model
    const classes = await Student.distinct('class');  // 'class' is the field we want distinct values for

    if (!classes.length) {
      return res.status(404).json({ message: "No classes found." });
    }

    return res.status(200).json({ classes });
  } catch (error) {
    console.error("Error fetching classes:", error);
    return res.status(500).json({ message: "Server error" });
  }
};


const getStudentByFilter = async (req, res) => {
  try {
    // Destructure 'class' (from query params) and 'section' (from query params)
    const { class: className, section } = req.query;

    // Check if the className and section are valid and sanitize input (optional)
    const query = {};
    if (className) query.class = className.trim();  // Use .trim() to remove any extra spaces
    if (section) query.section = section.trim();  // Use .trim() to remove any extra spaces

    // Fetch students based on class and section filter
    const students = await Student.find(query).select('firstName lastName roll gender class section');

    // Modify each student to include fullName by concatenating firstName and lastName
    const modifiedStudents = students.map(student => ({
      ...student.toObject(),
      fullName: `${student.firstName} ${student.lastName}`,
    }));

    // Return success response with the list of students
    if (modifiedStudents.length > 0) {
      res.status(200).json({ message: 'Students fetched successfully', students: modifiedStudents });
    } else {
      res.status(404).json({ message: 'No students found for the given class and section.' });
    }
  } catch (error) {
    // Handle errors during the fetch operation
    res.status(500).json({ message: 'Error fetching students', error: error.message });
  }
};


const promoteStudent = async (req, res) => {
  const { studentId, newClass, section, overallPercentage, message } = req.body; // Extract fields from request body

  try {
    if (studentId) {
      // Promote a single student by studentId
      const updatedStudent = await Student.findByIdAndUpdate(
        studentId,
        {
          class: newClass,
          section,
        },
        { new: true } // Return the updated document
      );

      if (!updatedStudent) {
        return res.status(404).json({
          success: false,
          message: "Student not found",
        });
      }

      return res.status(200).json({
        success: true,
        message: message || "Student promoted successfully",
        updatedStudent,
      });
    } else if (overallPercentage) {
      // Bulk promote students based on overallPercentage
      const studentsToPromote = await Student.find({
        overallPercentage: { $gte: overallPercentage }, // Find students with percentage greater than or equal to the specified value
      });

      if (studentsToPromote.length === 0) {
        return res.status(404).json({
          success: false,
          message: "No students found with the specified percentage",
        });
      }

      // Step 2: Bulk promote students by updating their class and section
      const updatedStudents = await Student.updateMany(
        { _id: { $in: studentsToPromote.map(student => student._id) } }, // Update the found students
        {
          $set: {
            class: newClass,
            section,
          },
        }
      );

      return res.status(200).json({
        success: true,
        message: message || "Students promoted successfully in bulk",
        updatedStudents,
      });
    } else {
      return res.status(400).json({
        success: false,
        message: "Please provide either studentId or overallPercentage for promotion.",
      });
    }
  } catch (error) {
    console.error("Error promoting student:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error. Please try again later.",
    });
  }
};


// GET: Get all holidays
const getHolidays = async (req, res) => {
  try {
    const holidays = await Holiday.find();
    res.status(200).json({ holidays });
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving holidays', error: error.message });
  }
};

const getAllParents = async (req, res) => {
  try {
    // Database se saare parents fetch karna
    const parents = await Parent.find();

    // Agar parents na mile toh empty array bhejna
    if (!parents || parents.length === 0) {
      return res.status(404).json({ success: false, message: "No parents found" });
    }

    // Success response with data
    res.status(200).json({ success: true, parents });
  } catch (error) {
    // Error handling
    console.error("Error fetching parents:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const getAllLeaves = asyncHandler(async (req, res) => {
  try {
    // Fetching all leaves and populating student, teacher, and parent details
    const leaves = await Leave.find()
      .populate('studentId', 'firstName lastName class section') // Populate studentId with selected fields
      .populate('teacherId', 'firstName lastName') // Populate teacherId with selected fields
      .populate('parentId', 'firstName lastName contact') // Populate parentId with selected fields
      .exec();

    if (!leaves || leaves.length === 0) {
      return res.status(404).json({ message: "No leaves found" });
    }

    // Respond with the fetched leaves
    return res.status(200).json({
      message: "All leaves retrieved successfully.",
      leaves,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: "Error fetching leaves",
    });
  }
});

const updateLeaveStatus = asyncHandler(async (req, res) => {
  const { leaveId } = req.params; // Leave ID to identify which leave to update
  const { status } = req.body;   // Status to update (approved, rejected, etc.)

  // Step 1: Validate the status value
  const validStatuses = ['Approved', 'Rejected', 'Pending']; // You can add other status values here
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ message: "Invalid status value" });
  }

  // Step 2: Find the leave by ID
  const leave = await Leave.findById(leaveId);

  if (!leave) {
    return res.status(404).json({ message: "Leave not found" });
  }

  // Step 3: Update the leave status
  leave.status = status;

  // Step 4: Save the updated leave
  await leave.save();

  // Step 5: Return the updated leave information
  return res.status(200).json({
    message: `Leave status updated to ${status}`,
    leave,
  });
});


// Controller to get all complaints and expand student details
const getAllComplaints = async (req, res) => {
  try {
    // Fetching all complaints and populating student details
    const complaints = await ComplaintModel.find()
      .populate('studentId', 'firstName lastName class section roll') // Populate studentId with selected fields
      .exec();

    // Respond with the fetched complaints
    res.status(200).json({
      success: true,
      complaints,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch complaints. Please try again later.",
    });
  }
};


const createMeeting = async (req, res) => {
  try {
    const { date, time, agenda, location } = req.body;

    // Create a new meeting with no teacher-specific IDs
    const meeting = new Meeting({
      date,
      time,
      agenda,
      location,
    });

    await meeting.save();

    // Push the meeting ID to the meetings[] array of all teachers
    await Teacher.updateMany(
      {}, // Apply the update to all teachers
      { $push: { meetings: meeting._id } } // Push the meeting ID into each teacher's meetings array
    );

    return res.status(201).json({
      message: "Meeting created successfully",
      meeting
    });

  } catch (error) {
    console.error("Error creating meeting:", error);
    return res.status(500).json({ message: "Server Error" });
  }
};


const getAllMeetings = async (req, res) => {
  try {
    // Fetch all meetings from the database
    const meetings = await Meeting.find();

    if (meetings.length === 0) {
      return res.status(404).json({ message: "No meetings found" });
    }

    return res.status(200).json({
      message: "Meetings fetched successfully",
      meetings
    });
  } catch (error) {
    console.error("Error fetching meetings:", error);
    return res.status(500).json({ message: "Server Error" });
  }
};

const getAllStudentLeaves = asyncHandler(async (req, res) => {
  // Step 1: Retrieve all students
  const students = await Student.find();

  if (!students || students.length === 0) {
    return res.status(404).json({ message: "No students found" });
  }

  // Step 2: Extract the leave data, class, and section from each student
  const allLeaves = students.map(student => ({
    studentId: student._id,
    studentName: `${student.firstName} ${student.lastName}`,
    class: student.class,        // Assuming class is stored as 'class'
    section: student.section,    // Assuming section is stored as 'section'
    leaves: student.leaves,      // Extracting leave data
  }));

  // Step 3: Respond with the leave data including class and section
  res.status(200).json({
    message: "All leaves retrieved successfully",
    allLeaves,
  });
});

const updateStudentLeaveStatus = asyncHandler(async (req, res) => {
  const { studentId, leaveId } = req.params;
  const { status } = req.body;  // Only expecting 'status' in the request body

  // Step 1: Find the student by ID
  const student = await Student.findById(studentId);

  if (!student) {
    return res.status(404).json({ message: "Student not found" });
  }

  // Step 2: Find the leave by leaveId
  const leave = student.leaves.id(leaveId);

  if (!leave) {
    return res.status(404).json({ message: "Leave not found" });
  }

  // Step 3: Update the leave status
  if (status) {
    leave.status = status;
  }

  // Save the updated student document
  await student.save();

  // Step 4: Respond with the updated leave data
  res.status(200).json({
    message: "Leave status updated successfully",
    leave: {
      leaveId: leave._id,  // Include leaveId
      studentId: student._id, // Include studentId
      status: leave.status,
    },
  });
});

const updateTeacherLeaveStatus = asyncHandler(async (req, res) => {
  const { teacherId, leaveId } = req.params;
  const { status } = req.body;  // Only expecting 'status' in the request body

  // Step 1: Find the student by ID
  const student = await Teacher.findById(teacherId);

  if (!student) {
    return res.status(404).json({ message: "Student not found" });
  }

  // Step 2: Find the leave by leaveId
  const leave = student.leaves.id(leaveId);

  if (!leave) {
    return res.status(404).json({ message: "Leave not found" });
  }

  // Step 3: Update the leave status
  if (status) {
    leave.status = status;
  }

  // Save the updated student document
  await student.save();

  // Step 4: Respond with the updated leave data
  res.status(200).json({
    message: "Leave status updated successfully",
    leave: {
      leaveId: leave._id,  // Include leaveId
      teacherId: student._id, // Include studentId
      status: leave.status,
    },
  });
});




const getAllTeachersWithLeaves = asyncHandler(async (req, res) => {
  try {
    // Find all teachers where the 'leaves' array is not empty
    const teachers = await Teacher.find({ "leaves.0": { $exists: true } });

    if (!teachers.length) {
      return res.status(404).json({ message: "No teachers found with leaves" });
    }

    // For each teacher, populate the leave details
    const teacherLeaves = [];

    for (const teacher of teachers) {
      const leaveIds = teacher.leaves.map(leave => leave._id);
      const leaves = await Leave.find({ _id: { $in: leaveIds } });

      // Format the leave data for each teacher
      const leaveData = leaves.map((leave) => ({
        leaveId: leave._id,
        startDate: leave.startDate,
        endDate: leave.endDate,
        reason: leave.reason,
        leaveType: leave.leaveType, // Assuming leaveType exists in the Leave model
        status: leave.status
      }));

      teacherLeaves.push({
        teacherName: teacher.name,  // Assuming teacher has 'name' field
        teacherId: teacher._id,
        leaves: leaveData
      });
    }

    // Send the teacher and leave data as response
    res.status(200).json({
      message: "Teachers with leaves fetched successfully",
      teachers: teacherLeaves,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});


 const scheduleMeetingWithTeacher = async (req, res) => {
  try {
    const { teacherName, date, time, link } = req.body;

    if (!date || !time || !link) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    let meetingDetails = { date, time, link };

    // 1️⃣ Single Teacher ke sath meeting (agar `teacherName` diya ho)
    if (teacherName) {
      const teacher = await Teacher.findOne({ name: teacherName });

      if (!teacher) {
        return res.status(404).json({ message: "Teacher not found" });
      }

      const meeting = new Meeting(meetingDetails);
      await meeting.save();

      // Teacher ke `mymeeting[]` array me push karna
      teacher.mymeeting.push(meeting._id);
      await teacher.save();

      return res.status(201).json({ message: `Meeting scheduled with ${teacherName}`, meeting });
    }

    // 2️⃣ Sabhi Teachers ke sath meeting
    const teachers = await Teacher.find();
    
    if (!teachers.length) {
      return res.status(404).json({ message: "No teachers found" });
    }

    const meeting = new Meeting(meetingDetails);
    await meeting.save();

    // Sabhi teachers ke `mymeeting[]` array me push karna
    await Promise.all(
      teachers.map(async (teacher) => {
        teacher.mymeeting.push(meeting._id);
        await teacher.save();
      })
    );

    return res.status(201).json({ message: "Meeting scheduled with all teachers", meeting });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

 const getAllTeachersMeetings = async (req, res) => {
  try {
    // Sabhi teachers ki `name` aur `mymeeting[]` ko fetch karenge aur meetings ko populate karenge
    const teachers = await Teacher.find()
      .select("name mymeeting")  // `name` aur `mymeeting[]` ko select karenge
      .populate("mymeeting");    // Meetings ki details expand karenge

    if (!teachers.length) {
      return res.status(404).json({ message: "No teachers found" });
    }

    // Sabhi teachers ki `name` aur unke `mymeeting[]` ko return karenge
    const meetings = teachers.map(teacher => ({
      name: teacher.name,
      mymeeting: teacher.mymeeting
    }));

    return res.status(200).json({ meetings });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

 const getAllStudentsMeetings = async (req, res) => {
  try {
    // Sabhi students ki meetings fetch karo aur meetings ko populate karo
    const students = await Student.find()
      .populate("meetings");  // Meetings ki details expand karenge

    if (!students.length) {
      return res.status(404).json({ message: "No students found" });
    }

    // Sabhi students ke meetings ko return karenge
    const studentsMeetings = students.map(student => ({
      name: student.name,
      class: student.class,
      section: student.section,
      meetings: student.meetings
    }));

    return res.status(200).json({ studentsMeetings });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};


const getDashboardCounts = async (req, res) => {
  try {
    // Fetch counts for total students, parents, teachers, subjects, classes, holidays, meetings
    const totalStudents = await Student.countDocuments();
    const totalParents = await Parent.countDocuments();
    const totalTeachers = await Teacher.countDocuments();
    const totalStaffs = await Staff.countDocuments();
    const totalSubjects = await Subject.countDocuments();
    const totalClasses = await Class.countDocuments();
    const totalHolidays = await Holiday.countDocuments();
    const totalMeetings = await Meeting.countDocuments();
    const totalRoutines = await Routine.countDocuments();


    // Fetch fee details from the database
    const fees = await Fee.find({}); // You can add filters like studentId or class if needed

    // Initialize totals for paid, pending, and total fee amounts
    let totalPaid = 0;
    let totalPending = 0;
    let totalAmount = 0;

    // Iterate over the fees to calculate total paid, pending, and total fee amounts
    fees.forEach(fee => {
      totalPaid += fee.paidAmount;
      totalPending += fee.pendingPayment;
      totalAmount += fee.paidAmount + fee.pendingPayment; // Sum of paid and pending to get total amount
    });

    // Format numbers with commas before returning them
    const formatNumber = (number) => {
      return number.toLocaleString();
    };

    // Return all the totals and fee details in a single response
    res.status(200).json({
      totalStudents,
      totalParents,
      totalTeachers,
      totalStaffs,
      totalSubjects,
      totalClasses,
      totalHolidays,
      totalMeetings,
      totalRoutines,
      totalPaid: formatNumber(totalPaid),
      totalPending: formatNumber(totalPending),
      totalAmount: formatNumber(totalAmount) // Total amount including both paid and pending
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error retrieving dashboard data', error: error.message });
  }
};

const createLecture = async (req, res) => {
  try {
      const { title, description, subject, category, class: className, section } = req.body;
      
      const newLecture = new Lecture({
          title,
          description,
          subject,
          category,
          className,
          section
      });

      const savedLecture = await newLecture.save();
      res.status(201).json(savedLecture);
  } catch (error) {
      res.status(500).json({ message: "Server Error", error: error.message });
  }

};

const getAllLectures = async (req, res) => {
  try {
    const lectures = await Lecture.find();
    res.status(200).json(lectures);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

const deleteLecture = async (req, res) => {
  try {
    const { lectureId } = req.params;
    
    const deletedLecture = await Lecture.findByIdAndDelete(lectureId);
    
    if (!deletedLecture) {
      return res.status(404).json({ message: "Lecture not found" });
    }

    res.status(200).json({ message: "Lecture deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};


export {
  adminRegistration,
  adminLogin,
  adminLogout,
  getStudents,
  createStudent,
  updateStudent,
  deleteStudent,
  getTeachers,
  updateTeacher,
  deleteTeacher,
  getClasses,
  createClass,
  markAttendance,
  getAttendance,
  addComplaint,
  getComplaints,
  addPhoneCall,
  getPhoneCalls,
  addCertificate,
  getCertificates,
  addSection,
  getSections,
  assignClassTeacher,
  getClassTeachers,
  assignSubjectTeacher,
  getSubjectAssignments,
  addClassroom,
  getClassrooms,
  uploadContent,
  getContent,
  postAssignment,
  addLesson,
  getLessons,
  addStudentCategory,
  getStudentCategories,
  addStudent,
  getStudentsAdmission,
  addStudentGroup,
  getStudentGroups,
  addFeesGroup,
  getFeesGroups,
  addFeesType,
  getFeesTypes,
  addTransportRoute,
  getTransportRoutes,
  addVehicle,
  getVehicles,
  assignVehicle,
  getVehicleAssignments,
  addExamType,
  getExamTypes,
  addExamSchedule,
  getExamSchedules,
  generateAdmitCard,
  addVisitor,
  addClass,
  addTopic,
  getSubjectWiseAttendance,
  exportStudentsData,
  addHomework,
  getAllHomework,
  createSeatPlan,
  getSeatPlan,
  getStudentById,
  getExamSchedule,
  createOrUpdateClassRoutine,
  getClassRoutine,
  addAssignment,
  getAssignments,
  postSyllabus,
  getSyllabus,
  addAttendance,
  createNotice,
  createTransportAndAssignToStudent,
  deleteSection,
  updateSection,
  updateClass,
  removeClass,
  createSubjectByAdmin,
  getSubjects,
  getSubjectNames,
  getTopics,
  generateAdmitCards,
  addVisit,
  getVisits,
  getNotices,
  createTeacher,
  getAllTeachers,
  addDriver,
  getDrivers,
  getAllMarks,
  addStaff,
  getAllStaff,
  updateSchoolDetails,
  createSchool,
  addFee,
  getFeeDetails,
  getStudentByFilter,
  getStudentClasses,
  promoteStudent,
  getClassSectionTopper,
  addHoliday,
  getHolidays,
  getAllParents,
  getAllLeaves,
  updateLeaveStatus,
  updateFeeStatus,
  getPaidAndPendingAmount,
  getAllComplaints,
  createMeeting,
  getAllMeetings,
  getAllStudentLeaves,
  updateStudentLeaveStatus,
  getAllTeachersWithLeaves,
  updateTeacherLeaveStatus,
  getStudentDetails,
  scheduleMeetingWithTeacher,
  getAllTeachersMeetings,
  getAllStudentsMeetings,
  getDashboardCounts,
  createLecture,
  getAllLectures,
  deleteLecture
}