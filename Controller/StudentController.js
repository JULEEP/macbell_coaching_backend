import Student from '../Models/Student.js' 
import asyncHandler from 'express-async-handler'
import Exam from '../Models/ExamShedule.js';
import Routine from '../Models/Routine.js';
import Lesson from '../Models/Lesson.js';
import Homework from '../Models/Homework.js';
import Assignment from '../Models/Assignment.js';
import ComplaintModel from '../Models/Complaint.js';
import Syllabus from '../Models/Syllabus.js';
import Marks from '../Models/Mark.js';
import Notice from '../Models/Notice.js';
import Leave from '../Models/Leave.js';
import jwt from 'jsonwebtoken'
import PDFDocument from 'pdfkit';
import dotenv from 'dotenv';
import Transport from '../Models/Transport.js';
import generateRefreshToken from '../config/refreshtoken.js';
import generateToken from '../config/jwtToken.js';

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

const getExamScheduleByStudent = async (req, res) => {
  const { studentId } = req.params; // Extract studentId from params

  try {
      // Fetch the student along with their exam schedule
      const student = await Student.findById(studentId).select('examSchedule');

      if (!student) {
          return res.status(404).json({ message: 'Student not found' });
      }

      // Check if the student has an exam schedule
      if (!student.examSchedule || student.examSchedule.length === 0) {
          return res.status(404).json({ message: 'No exam schedules found for the student' });
      }

      // Return the student's exam schedule
      res.status(200).json({ message: 'Exam schedules fetched successfully', examSchedule: student.examSchedule });
  } catch (error) {
      // Handle errors
      res.status(500).json({ message: 'Error fetching exam schedules', error: error.message });
  }
};


const getAdmitCard = async (req, res) => {
  const { studentId } = req.params; // Extract studentId from params

  try {
      // Fetch the student along with their exam schedule
      const student = await Student.findById(studentId).select('firstName lastName class section roll examSchedule');

      if (!student) {
          return res.status(404).json({ message: 'Student not found' });
      }

      // Check if the student has an exam schedule
      if (!student.examSchedule || student.examSchedule.length === 0) {
          return res.status(404).json({ message: 'No exam schedules found for the student' });
      }

      // Prepare the JSON response
      const admitCardData = {
          studentDetails: {
              name: `${student.firstName} ${student.lastName}`,
              class: student.class,
              section: student.section,
              rollNumber: student.roll,
          },
          examSchedules: student.examSchedule.map((exam, index) => ({
              serialNo: index + 1,
              subject: exam.subject,
              date: new Date(exam.examDate).toLocaleDateString(),
              time: exam.startTime && exam.endTime ? `${exam.startTime} - ${exam.endTime}` : 'N/A',
              type: exam.examType || 'N/A',
          })),
      };

      // Send the response in JSON format
      res.status(200).json({ message: 'Admit card generated successfully', admitCard: admitCardData });
  } catch (error) {
      // Handle errors
      res.status(500).json({ message: 'Error generating admit card', error: error.message });
  }
};

  

const getClassRoutine = async (req, res) => {
  const { studentId } = req.params;  // Get studentId from request params

  try {
    // Fetch the student data based on studentId and only select the class, section, and routine fields
    const student = await Student.findById(studentId).select('class section routine');  // Select class, section, and routine fields

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // Now, use the class and section of the student to find the routine in the routine array
    const { class: studentClass, section } = student;  // Get class and section

    // Find the routine from the student's routine array
    const studentRoutine = student.routine.find(
      (routine) => routine.class === studentClass && routine.section === section
    );

    if (!studentRoutine) {
      return res.status(404).json({ message: "No routine found for the student's class" });
    }

    // Return the found routine
    return res.status(200).json(studentRoutine);
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


  const getHomeworkByStudent = async (req, res) => {
    try {
        const { studentId } = req.params; // Get studentId from URL parameters

        // Fetch student details along with populated homework details
        const student = await Student.findById(studentId).populate({
            path: 'homework.homeworkId',
            select: 'homeworkDate submissionDate description homeworkTitle homeworkBy status'
        });

        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        // Extract expanded homework details
        const homeworkDetails = student.homework.map(hw => hw.homeworkId);

        res.status(200).json({ message: "Attendance retrieved successfully", homework: homeworkDetails }); // Send homework data as JSON response
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
    const attendance = student.attendance; // Example format: [{ date: "2023-01-01", status: "present" }, { date: "2023-01-02", status: "absent" }]

    if (!attendance || attendance.length === 0) {
        return res.status(200).json({
            message: "No attendance records found",
            attendance: [],
            percentage: 0,
        });
    }

    // Step 3: Calculate total classes and attended classes
    const totalClasses = attendance.length;
    const attendedClasses = attendance.filter(record => record.attendanceStatus === "Present").length;

    // Step 4: Calculate attendance percentage
    const percentage = ((attendedClasses / totalClasses) * 100).toFixed(2); // Rounded to 2 decimal places

    // Step 5: Respond with the attendance data and percentage
    res.status(200).json({
        message: "Attendance retrieved successfully",
        attendance,
        totalClasses,
        attendedClasses,
        percentage: `${percentage}%`,
    });
});

const applyForLeave = asyncHandler(async (req, res) => {
  const { studentId } = req.params;
  const { startDate, endDate, reason, leaveType } = req.body;

  // Step 1: Find the student by ID
  const student = await Student.findById(studentId);

  if (!student) {
    return res.status(404).json({ message: "Student not found" });
  }

  // Step 2: Create a new leave request object for the Leave model
  const newLeave = new Leave({
    startDate,
    endDate,
    reason,
    status: 'Pending',
    leaveType,
    studentId, // Associate leave with the student
  });

  // Step 3: Save the new leave request in the Leave model
  await newLeave.save();

  // Step 4: Push the leave details directly into the student's leaves array
  student.leaves.push({
    leaveId: newLeave._id,
    startDate,
    endDate,
    reason,
    status: 'Pending',
  });

  // Step 5: Save the updated student document
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


const updateLeaveStudentStatus = asyncHandler(async (req, res) => {
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
      leave
    },
  });
});


const getMarksByStudent = asyncHandler(async (req, res) => {
  const { studentId } = req.params;
  const { examType } = req.query; // Query parameter for filtering by exam type

  try {
    // Step 1: Retrieve marks for the given student ID and populate student details
    const marks = await Marks.find({ studentId }).populate(
      "studentId",
      "firstName lastName class roll section fatherName motherName"
    );

    if (!marks || marks.length === 0) {
      return res.status(404).json({ message: "Marks not found for this student" });
    }

    // Step 2: Filter marks by examType (if provided)
    const filteredMarks = examType
      ? marks.filter((mark) => mark.examType === examType)
      : marks;

    if (filteredMarks.length === 0) {
      return res.status(404).json({ message: `No marks found for exam type: ${examType}` });
    }

    // Step 3: Group marks and calculate totals
    const studentMarks = {
      student: filteredMarks[0].studentId || { firstName: "N/A", lastName: "N/A" },
      subjects: [],
      totalObtainedMarks: 0,
      totalMarks: 0,
      examType: examType || "All", // Show which exam type is used
    };

    filteredMarks.forEach((mark) => {
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

    // Step 4: Calculate overall percentage and status
    const overallPercentage =
      (studentMarks.totalObtainedMarks / studentMarks.totalMarks) * 100;
    const overallStatus = overallPercentage >= 40 ? "Pass" : "Fail";

    const response = {
      ...studentMarks,
      overallPercentage: overallPercentage.toFixed(2),
      overallStatus,
    };

    // Step 5: Respond with the structured marks
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

  // Fetch student by ID and populate the teachers array
  const student = await Student.findById(studentId).populate({
    path: 'teachers.teacherId', // Populate teacherId field to get teacher details
    select: 'name subject email phone', // Select name, subject, email, and phone from the Teacher model
  });

  if (!student) {
    return res.status(404).json({ message: "Student not found" });
  }

  // Return student details with populated teachers array
  res.status(200).json({
    message: "Student details fetched successfully",
    student: {
      class: student.class,
      section: student.section,
      teachers: student.teachers.map(teacher => ({
        name: teacher.teacherId.name, // Teacher's name
        subject: teacher.teacherId.subject, // Teacher's subject
        email: teacher.teacherId.email, // Teacher's email
        phone: teacher.teacherId.phone, // Teacher's phone
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


const logoutStudent = async (req, res) => {
  try {
    // Clear the refresh token cookie
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // Ensure it works only over HTTPS in production
      sameSite: 'Strict', // For added security
    });

    res.status(200).json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error.message);
    res.status(500).json({ message: 'Error logging out', error: error.message });
  }
};


// Controller to fetch fee details by userId
const getFeeDetailsByUserId = async (req, res) => {
  try {
    const { userId } = req.params;

    // Find the student and populate the fees array
    const student = await Student.findById(userId).populate('fees');
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    return res.status(200).json({ fees: student.fees });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
};


// Controller to fetch fee details by userId, including totalPaid and totalPending
const getFeeSummaryByUserId = async (req, res) => {
  try {
    const { userId } = req.params;

    // Find the student and populate the fees array
    const student = await Student.findById(userId).populate('fees');
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Calculate totalPaid and totalPending by summing the respective amounts
    const totalPaid = student.fees.reduce((acc, fee) => acc + fee.paidAmount, 0);
    const totalPending = student.fees.reduce((acc, fee) => acc + fee.pendingPayment, 0);

    return res.status(200).json({
      totalPaid,
      totalPending,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// Get complaints for a specific student
const getStudentComplaints = async (req, res) => {
  const { userId } = req.params;

  try {
    // Fetch the student by studentId
    const student = await Student.findById(userId).populate('complaints');
    
    if (!student) {
      return res.json({ message: 'Student not found' });
    }

    // Retrieve the complaints from the student model (populated with complaint details)
    const complaints = student.complaints.map((complaint) => ({
      title: complaint.title,
      description: complaint.description,
      complaintBy: complaint.complaintBy
    }));

    // Return the complaints in the response
    return res.status(200).json({
      studentId: student._id,
      complaints: complaints
    });
  } catch (error) {
    console.error("Error fetching student's complaints:", error);
    return res.status(500).json({ message: 'An error occurred' });
  }
};


// Student submits homework
const submitHomework = async (req, res) => {
  try {
    const { homeworkId, studentId } = req.params; // Homework ID aur Student ID params se lenge
    const { status } = req.body;
    const submissionDate = new Date(); // Current timestamp

    // Find Homework
    const homework = await Homework.findById(homeworkId);
    if (!homework) {
      return res.status(404).json({ message: "Homework not found" });
    }

    // Check if student already submitted
    const existingSubmission = homework.submissions.find(
      (submission) => submission.studentId.toString() === studentId
    );

    if (existingSubmission) {
      // Agar already submit kiya hai toh sirf status aur date update karna hai
      existingSubmission.status = status || "Submitted";
      existingSubmission.submissionDate = submissionDate;
    } else {
      // Naya submission add karna hai
      homework.submissions.push({ studentId, status: status || "Submitted", submissionDate });
    }

    await homework.save();

    // Student model me bhi update karein
    await Student.updateOne(
      { _id: studentId },
      { $push: { submissions: { homeworkId, status: status || "Submitted", submissionDate } } }
    );

    res.status(200).json({ message: "Homework submitted successfully!", homework });
  } catch (error) {
    console.error("Error submitting homework:", error);
    res.status(500).json({ message: "Server error" });
  }
};

 const getStudentMeetings = async (req, res) => {
  try {
      const { studentId } = req.params;

      // Find the student by ID and populate meeting details
      const student = await Student.findById(studentId).populate("meetings");

      if (!student) {
          return res.status(404).json({ error: "Student not found!" });
      }

      res.status(200).json({ meetings: student.meetings });
  } catch (error) {
      res.status(500).json({ error: error.message });
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
    logoutStudent,
    getAdmitCard,
    getStudentDetails,
    getFeeDetailsByUserId,
    getFeeSummaryByUserId,
    getStudentComplaints,
    submitHomework,
    updateLeaveStudentStatus,
    getStudentMeetings
};
