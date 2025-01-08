import Student from '../Models/Student.js' 
import asyncHandler from 'express-async-handler'
import Exam from '../Models/ExamShedule.js';
import Routine from '../Models/Routine.js';
import Lesson from '../Models/Lesson.js';
import Homework from '../Models/Homework.js';
import Assignment from '../Models/Assignment.js';
import Syllabus from '../Models/Syllabus.js';
import Marks from '../Models/Mark.js';
import Notice from '../Models/Notice.js';
import jwt from 'jsonwebtoken'
import PDFDocument from 'pdfkit';
import dotenv from 'dotenv';
import Transport from '../Models/Transport.js';
import generateRefreshToken from '../config/refreshtoken.js';
import generateToken from '../config/jwtToken.js';
import puppeteer from 'puppeteer'

dotenv.config()



const getStudents = asyncHandler(async (req, res) => {
    const students = await Student.find();
    res.json(students);
});

const getStudentById = asyncHandler(async (req, res) => {
    const student = await Student.findById(req.params.id);
    if (!student) {
        res.status(404);
        throw new Error('Student not found');
    }
    res.json(student);
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

// Controller function to get exam schedules by studentId (class and section based on student)
const getExamScheduleByStudent = async (req, res) => {
    const { studentId } = req.params; // Extract studentId from params
  
    try {
      // Fetch the student based on studentId
      const student = await Student.findById(studentId);
  
      if (!student) {
        return res.status(404).json({ message: 'Student not found' });
      }
  
      // Fetch the exam schedules based on student's class and section
      const examSchedules = await Exam.find({
        class: student.class,
        section: student.section
      });
  
      if (examSchedules.length === 0) {
        return res.status(404).json({ message: 'No exam schedules found for the student' });
      }
  
      // Return the filtered list of exam schedules
      res.status(200).json({ message: 'Exam schedules fetched successfully', examSchedules });
    } catch (error) {
      // Handle errors during the fetch operation
      res.status(500).json({ message: 'Error fetching exam schedules', error: error.message });
    }
  };

  const getAdmitCard = async (req, res) => {
    const { studentId } = req.params; // Extract studentId from params
  
    try {
      // Fetch the student based on studentId
      const student = await Student.findById(studentId);
  
      if (!student) {
        return res.status(404).json({ message: 'Student not found' });
      }
  
      // Fetch the exam schedules based on student's class and section and filter for isAdmitCardGenerated: true
      const examSchedules = await Exam.find({
        class: student.class,
        section: student.section,
        isAdmitCardGenerated: true, // Filter for schedules where admit card is generated
      });
  
      if (examSchedules.length === 0) {
        return res.status(404).json({ message: 'No exam schedules found for the student with admit cards generated' });
      }
  
      // Create the HTML template with embedded styles
      let examRows = examSchedules.map((exam, rowIndex) => {
        return `
          <tr>
            <td>${rowIndex + 1}</td>
            <td>${exam.examTitle}</td>
            <td>${exam.subject}</td>
            <td>${new Date(exam.examDate).toLocaleDateString()}</td>
            <td>${exam.startTime} - ${exam.endTime}</td>
            <td>${exam.examType || 'N/A'}</td>
          </tr>
        `;
      }).join('');
  
      const htmlContent = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Admit Card</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              background-color: #f4f4f4;
              margin: 0;
              padding: 20px;
            }
            .container {
              max-width: 800px;
              margin: 0 auto;
              background-color: #fff;
              padding: 20px;
              border-radius: 10px;
              box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
              color: #800080; /* Purple Color for "I Start School" */
              position: relative;
            }
            .header h1 {
              font-size: 36px;
              color: #800080; /* Purple Color */
            }
            .header h5 {
              color: #0000FF; /* Blue Color for "Admit Card" */
            }
            .student-info {
              margin-bottom: 20px;
            }
            .student-info p {
              font-size: 16px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 20px;
            }
            table, th, td {
              border: 1px solid #ddd;
              padding: 8px;
              text-align: center;
            }
            th {
              background-color: #4CAF50;
              color: white;
            }
            tr:nth-child(even) {
              background-color: #f2f2f2;
            }
            .logo {
              position: absolute;
              right: 10px;
              width: 100px;
              height: auto;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <img src="https://res.cloudinary.com/dokfnv3vy/image/upload/v1736084543/custom/yhbii0wbedftmpvlpnon.jpg" class="logo" alt="Logo" />
              <h1>I Start School</h1>
              <h5>Admit Card</h5>
            </div>
            <div class="student-info">
              <p><strong>Student Name:</strong> ${student.firstName} ${student.lastName}</p>
              <p><strong>Class:</strong> ${student.class}</p>
              <p><strong>Section:</strong> ${student.section}</p>
              <p><strong>Roll Number:</strong> ${student.roll}</p>
            </div>
            <table>
              <thead>
                <tr>
                  <th>S.No.</th>
                  <th>Exam Title</th>
                  <th>Subject</th>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Type</th>
                </tr>
              </thead>
              <tbody>
                ${examRows}
              </tbody>
            </table>
          </div>
        </body>
        </html>
      `;
  
      // Launch Puppeteer to convert HTML to PDF
      const browser = await puppeteer.launch({ headless: true });
      const page = await browser.newPage();
      await page.setContent(htmlContent);
  
      // Set headers for PDF download
      const filename = `AdmitCard_${student.firstName}_${student.lastName}.pdf`;
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Content-Type', 'application/pdf');
  
      // Generate PDF from the HTML content
      const pdfBuffer = await page.pdf({ format: 'A4' });
  
      // Send the PDF buffer as a response
      res.end(pdfBuffer);  // Make sure to use `res.end()` to properly finalize the response
  
      await browser.close();
    } catch (error) {
      // Handle errors during the fetch operation
      console.error('Error generating admit card:', error);
      res.status(500).json({ message: 'Error generating admit card', error: error.message });
    }
  };
  
  
  const getClassRoutine = async (req, res) => {
    const { studentId } = req.params;  // Get studentId from request params
  
    try {
      // Fetch the student data based on studentId
      const student = await Student.findById(studentId);  // Adjust this if you're using a different method to fetch student
  
      if (!student) {
        return res.status(404).json({ message: "Student not found" });
      }
  
      // Now, use the class and section of the student to fetch the routine
      const { class: studentClass, section } = student;  // Get class and section
  
      // Fetch the routine based on class and section
      const routine = await Routine.findOne({ class: studentClass, section });
  
      if (!routine) {
        return res.status(404).json({ message: "No routine found for the student's class" });
      }
  
      // Return the fetched routine
      return res.status(200).json(routine);
    } catch (error) {
      console.error("Error fetching class routine:", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  };
  
 const getLessonsByStudent = async (req, res) => {
    const { studentId } = req.params;  // Get studentId from request parameters
  
    try {
      // Fetch the student based on studentId
      const student = await Student.findById(studentId);
  
      if (!student) {
        return res.status(404).json({ message: "Student not found" });
      }
  
      // Extract the class and section of the student
      const { class: studentClass } = student;
  
      // Fetch lessons for the student's class and section
      const lessons = await Lesson.find({ class: studentClass });
  
      if (lessons.length === 0) {
        return res.status(404).json({ message: "No lessons found for the student's class" });
      }
  
      // Return the fetched lessons
      return res.status(200).json({ message: "Lessons retrieved successfully", lessons });
    } catch (error) {
      // Handle any errors during fetch
      console.error("Error fetching lessons:", error);
      return res.status(500).json({ message: "Error fetching lessons", error: error.message });
    }
  };


// Controller to get homework for a specific student
const getHomeworkByStudent = async (req, res) => {
    try {
      const { studentId } = req.params; // Get studentId from URL parameters
  
      // Fetch student details to get class and section
      const student = await Student.findById(studentId);
  
      if (!student) {
        return res.status(404).json({ message: 'Student not found' });
      }
  
      // Fetch homework based on class and section
      const homework = await Homework.find({
        class: student.class,
        section: student.section,
      });
  
      res.status(200).json(homework); // Send homework data as JSON response
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error fetching homework' });
    }
  };

// Controller to get assignments for a specific student based on their class and section
 const getAssignmentsForStudent = async (req, res) => {
    try {
      const { studentId } = req.params;
  
      // Fetch student details to get class and section
      const student = await Student.findById(studentId);
  
      if (!student) {
        return res.status(404).json({ message: "Student not found" });
      }
  
      const { class: className, section } = student;
  
      // Fetch assignments based on class and section
      const assignments = await Assignment.find({
        class: className,
        section: section,
      });
  
      if (assignments.length === 0) {
        return res.status(404).json({ message: "No assignments found" });
      }
  
      res.status(200).json(assignments);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error fetching assignments" });
    }
  };

  const getSyllabusForStudent = async (req, res) => {
    try {
      const { studentId } = req.params; // Extract studentId from request params
  
      // Fetch student details to get class and section
      const student = await Student.findById(studentId);
  
      if (!student) {
        return res.status(404).json({ message: "Student not found" });
      }
  
      const { class: className, section } = student;
  
      // Fetch syllabus data based on class and section
      const syllabus = await Syllabus.find({
        class: className,
        section: section,
      });
  
      if (syllabus.length === 0) {
        return res.status(404).json({ message: "No syllabus found" });
      }
  
      res.status(200).json(syllabus);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error fetching syllabus for the student" });
    }
  };
  
  const getAttendanceByStudent = asyncHandler(async (req, res) => {
    const { studentId } = req.params;

    // Step 1: Find the student by ID
    const student = await Student.findById(studentId);

    if (!student) {
        return res.status(404).json({ message: "Student not found" });
    }

    // Step 2: Retrieve the attendance array
    const attendance = student.attendance;

    // Step 3: Respond with the attendance data
    res.status(200).json({
        message: "Attendance retrieved successfully",
        attendance,
    });
});

const applyForLeave = asyncHandler(async (req, res) => {
  const { studentId } = req.params;
  const { startDate, endDate, reason } = req.body;

  // Step 1: Find the student by ID
  const student = await Student.findById(studentId);

  if (!student) {
      return res.status(404).json({ message: "Student not found" });
  }

  // Step 2: Add the leave request
  const newLeave = {
      startDate,
      endDate,
      reason,
      status: 'Pending', // Default status
  };

  student.leaves.push(newLeave);

  // Step 3: Save the updated student document
  await student.save();

  res.status(201).json({
      message: "Leave applied successfully",
      leave: newLeave,
  });
});

const getLeavesByStudent = asyncHandler(async (req, res) => {
  const { studentId } = req.params;

  // Step 1: Find the student by ID
  const student = await Student.findById(studentId);

  if (!student) {
      return res.status(404).json({ message: "Student not found" });
  }

  // Step 2: Retrieve the leave requests
  const leaves = student.leaves;

  // Step 3: Respond with the leave data
  res.status(200).json({
      message: "Leaves retrieved successfully",
      leaves,
  });
});


const getMarksByStudent = asyncHandler(async (req, res) => {
  const { studentId } = req.params;

  try {
    // Step 1: Retrieve marks for the given student ID and populate student details
    const marks = await Marks.find({ studentId }).populate(
      "studentId",
      "firstName lastName class roll section fatherName motherName"
    );

    if (!marks || marks.length === 0) {
      return res.status(404).json({ message: "Marks not found for this student" });
    }

    // Step 2: Group marks by student and calculate totals
    const studentMarks = {
      student: marks[0].studentId || { firstName: "N/A", lastName: "N/A" },
      subjects: [],
      totalObtainedMarks: 0,
      totalMarks: 0,
    };

    marks.forEach((mark) => {
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

      // Add subject details
      studentMarks.subjects.push({
        subject: mark.subject,
        marksObtained: mark.marksObtained,
        totalMarks: mark.totalMarks,
        percentage: percentage.toFixed(2),
        grade,
        status,
      });

      // Update total obtained marks and total marks
      studentMarks.totalObtainedMarks += mark.marksObtained;
      studentMarks.totalMarks += mark.totalMarks;
    });

    // Step 3: Calculate overall percentage and status
    const overallPercentage =
      (studentMarks.totalObtainedMarks / studentMarks.totalMarks) * 100;
    const overallStatus = overallPercentage >= 40 ? "Pass" : "Fail";

    const response = {
      ...studentMarks,
      overallPercentage: overallPercentage.toFixed(2),
      overallStatus,
    };

    // Step 4: Respond with the structured marks
    res.status(200).json({
      message: "Marks retrieved successfully",
      marks: response,
    });
  } catch (error) {
    console.error("Error retrieving marks:", error);
    res.status(500).json({ message: "Failed to retrieve marks" });
  }
});


const getStudentExamSchedule = asyncHandler(async (req, res) => {
  const { studentId } = req.params;  // Get studentId from params

  // Step 1: Find the student by studentId
  const student = await Student.findById(studentId);

  if (!student) {
      return res.status(404).json({ message: "Student not found" });
  }

  // Step 2: Get the student's examSchedule
  const examSchedule = student.examSchedule;

  if (!examSchedule || examSchedule.length === 0) {
      return res.status(404).json({ message: "No exam schedule found for this student" });
  }

  // Step 3: Return the exam schedule
  res.status(200).json({
      message: "Student exam schedule fetched successfully",
      examSchedule
  });
});

const getStudentNotices = asyncHandler(async (req, res) => {
  const { studentId } = req.params;  // Get studentId from request params

  // Step 1: Find the student by studentId to get their class and section
  const student = await Student.findById(studentId);

  if (!student) {
      return res.status(404).json({ message: "Student not found" });
  }

  // Step 2: Get the student's class and section
  const { className, section } = student;

  // Step 3: Find notices that are either general or specific to the student's class/section
  const notices = await Notice.find({
      $or: [
          { targetAudience: { $in: ["All"] } }, // General notices
          { class: className, section: section }, // Class and Section-specific notices
      ]
  }).sort({ date: -1 }); // Sort by date, most recent first

  if (!notices || notices.length === 0) {
      return res.status(404).json({ message: "No notices found for this student" });
  }

  // Step 4: Return the notices
  res.status(200).json({
      message: "Student notices fetched successfully",
      notices
  });
});


const getStudentSubjects = asyncHandler(async (req, res) => {
  const { studentId } = req.params;

  // Fetch student by ID and populate their subjects field
  const student = await Student.findById(studentId).populate('subjects');

  if (!student) {
      return res.status(404).json({ message: "Student not found" });
  }

  // Return student details with populated subjects
  res.status(200).json({
      message: "Student details fetched successfully",
      student: {
          name: student.name,
          rollNumber: student.rollNumber,
          class: student.class,
          section: student.section,
          subjects: student.subjects,  // This will now contain full subject data
      },
  });
});

const getStudentSubjectsTeachers = asyncHandler(async (req, res) => {
  const { studentId } = req.params;

  // Fetch student by ID and populate only the teacher field in subjects
  const student = await Student.findById(studentId).populate({
    path: 'subjects', // Populate the subjects field
    select: 'teacher', // Only select the 'teacher' field for each subject
  });

  if (!student) {
    return res.status(404).json({ message: "Student not found" });
  }

  // Return student details with populated subjects containing only the teacher info
  res.status(200).json({
    message: "Student details fetched successfully",
    student: {
      class: student.class,
      section: student.section,
      subjects: student.subjects.map(subject => ({
        teacher: subject.teacher, // Only include the teacher for each subject
      })),
    },
  });
});

// Controller to get student details along with their assigned transport
const getStudentTransport = asyncHandler(async (req, res) => {
  const { studentId } = req.params;  // Get studentId from the request params

  // Step 1: Find the student by ID and populate the transport field
  const student = await Student.findById(studentId).populate('transport');

  if (!student) {
    return res.status(404).json({ message: "Student not found" });
  }

  // Step 2: Check if the student has assigned transport
  if (!student.transport) {
    return res.status(404).json({ message: "No transport assigned to this student" });
  }

  // Step 3: Respond with the student details including transport
  res.status(200).json({
    message: "Student's transport details fetched successfully",
    student: {
      name: student.name,
      rollNumber: student.rollNumber,
      class: student.class,
      section: student.section,
      gender: student.gender,
      name: student.firstName,
      transport: student.transport,  // This will contain the transport details
    },
  });
});

const studentLogin = asyncHandler(async (req, res) => {
  const { firstName, class: className, section, roll, dateOfBirth } = req.body;

  // Convert provided dateOfBirth to a Date object to match the stored format
  const formattedDOB = new Date(dateOfBirth);

  // Step 1: Find the student by firstName, class, section, roll number, and formatted dateOfBirth
  const student = await Student.findOne({ 
    firstName, 
    class: className, 
    section, 
    roll, 
    dateOfBirth: formattedDOB // Compare with the Date object
  });

  if (!student) {
    return res.status(404).json({ message: "Invalid credentials" });
  }

  // Step 2: Generate a JWT token with role
  const token = jwt.sign(
    { studentId: student._id, rollNumber: student.rollNumber, role: student.role }, // Payload
    process.env.JWT_SECRET_KEY, // Secret key from environment variables
    { expiresIn: '1h' } // Expiration time
  );

  // Step 3: Send a successful response with the token and student ID
  res.status(200).json({
    message: "Login successful",
    token: token,
    student: {
      studentId: student._id, // Include student ID in the response
      firstName: student.firstName,
      name: student.name,
      roll: student.roll,
      class: student.class,
      section: student.section,
      role: student.role,
    },
  });
});


 // Controller to get student details by parent
 const getStudentDetails = async (req, res) => {
  const { studentId } = req.params;

  try {

    // Step 2: Fetch student details
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // Step 3: Return the student details
    res.status(200).json({
      message: "Student details fetched successfully",
      student: student,
    });
  } catch (error) {
    console.error("Error fetching student details:", error);
    res.status(500).json({ message: "Error fetching student details", error: error.message });
  }
};


const loginStudent = async (req, res) => {
  const { firstName, randomPassword } = req.body; // Get the first name and password from the request body

  try {
    // Find the student by firstName (make sure it's unique)
    const student = await Student.findOne({ firstName });
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Generate refresh token
    const refreshToken = generateRefreshToken(student._id);

    // Update student's refresh token in the database (optional)
    student.refreshToken = refreshToken;
    await student.save();

    // Set refresh token as an HTTP-only cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // Ensure it's only sent over HTTPS in production
      maxAge: 72 * 60 * 60 * 1000, // Set expiry for 3 days
      sameSite: 'Strict', // For added security
    });

    // Generate an access token
    const accessToken = generateToken(student._id);

    // Respond with student data and tokens
    res.json({
      _id: student._id,
      firstName: student.firstName,
      token: accessToken,
      refreshToken, // Optional to include refresh token in the response
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

export  {
    getStudents,
    getStudentById,
    createStudent,
    updateStudent,
    deleteStudent,
    getExamScheduleByStudent,
    getClassRoutine,
    getLessonsByStudent,
    getHomeworkByStudent,
    getAssignmentsForStudent,
    getSyllabusForStudent,
    getAttendanceByStudent,
    applyForLeave,
    getLeavesByStudent,
    getMarksByStudent,
    getStudentExamSchedule,
    getStudentNotices,
    getStudentSubjects,
    getStudentSubjectsTeachers,
    getStudentTransport,
    loginStudent,
    getAdmitCard,
    getStudentDetails
};
