import asyncHandler from 'express-async-handler';
import Teacher from '../Models/Teacher.js';
import Syllabus from '../Models/Syllabus.js';
import Topic from '../Models/Topic.js';
import Homework from '../Models/Homework.js';
import Attendance from '../Models/Attendance.js';
import Student from '../Models/Student.js';
import Marks from '../Models/Mark.js';
import Exam from '../Models/ExamShedule.js';
import Meeting from '../Models/Meeting.js';
import Leave from '../Models/Leave.js';
import Routine from '../Models/Routine.js';
import ComplaintModel from '../Models/Complaint.js';
import generateRefreshToken from '../config/refreshtoken.js';
import Assignment from '../Models/Assignment.js';
import generateToken from '../config/jwtToken.js';
import multer from 'multer'

const getTeachers = asyncHandler(async (req, res) => {
  const teachers = await Teacher.find();
  res.json(teachers);
});

const getTeacherById = asyncHandler(async (req, res) => {
  const teacher = await Teacher.findById(req.params.id);
  if (!teacher) {
    res.status(404);
    throw new Error('Teacher not found');
  }
  res.json(teacher);
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

// POST Controller to create syllabus
const postSyllabus = async (req, res) => {
  try {
    const {
      syllabusTitle,
      syllabusType,
      availableFor,
      class: className,
      section,
      date,
      description,
    } = req.body;

    const newSyllabus = new Syllabus({
      syllabusTitle,
      syllabusType,
      availableFor,
      class: className,
      section,
      date,
      description,
      documentFile: req.file ? req.file.path : undefined,
    });
    await newSyllabus.save();

    res.status(201).json({ message: 'Syllabus created successfully.', data: newSyllabus });
  } catch (error) {
    res.status(500).json({ message: 'Error creating syllabus.', error: error.message });
  }
};

// GET Controller to retrieve syllabus
const getSyllabus = async (req, res) => {
  try {
    const syllabus = await Syllabus.find();

    res.status(200).json({ message: 'Syllabus retrieved successfully.', data: syllabus });
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving syllabus.', error: error.message });
  }
};

// Controller function to add a new topic (POST)
const addTopic = async (req, res) => {
  const { class: lessonClass, section, subject, lesson, topicName } = req.body;

  // Check if all required fields are provided
  if (!lessonClass || !section || !subject || !lesson || !topicName) {
    return res.status(400).json({ message: 'All fields (class, section, subject, lesson, topicName) are required' });
  }

  try {
    // Create a new topic
    const newTopic = new Topic({
      class: lessonClass,
      section: section,
      subject: subject,
      lesson: lesson,
      topicName: topicName
    });

    // Save the topic to the database
    await newTopic.save();

    // Return success response
    res.status(201).json({ message: 'Topic added successfully', topic: newTopic });
  } catch (error) {
    // Handle errors during save
    res.status(500).json({ message: 'Error adding topic', error: error.message });
  }
};

// Controller function to get all topics (GET)
const getTopics = async (req, res) => {
  try {
    // Fetch all topics from the database
    const topics = await Topic.find().populate('lesson');  // Populate lesson details if needed

    // Return the topics
    res.status(200).json({ message: 'Topics retrieved successfully', topics });
  } catch (error) {
    // Handle errors during fetch
    res.status(500).json({ message: 'Error fetching topics', error: error.message });
  }
};

// Controller function to add attendance record
const addAttendance = async (req, res) => {
  const { admissionNumber, firstName, lastName, dateOfBirth, gender, attendanceStatus } = req.body;

  // Check if all required fields are provided
  if (!admissionNumber || !firstName || !lastName || !dateOfBirth || !gender || !attendanceStatus) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    // Create a new attendance record
    const newAttendance = new Attendance({
      admissionNumber,
      firstName,
      lastName,
      dateOfBirth,
      gender,
      attendanceStatus
    });

    // Save the attendance record to the database
    await newAttendance.save();

    // Return success response
    res.status(201).json({ message: 'Attendance record added successfully', attendance: newAttendance });
  } catch (error) {
    // Handle errors during save
    res.status(500).json({ message: 'Error adding attendance record', error: error.message });
  }
};

// Controller function to add homework
const addHomework = async (req, res) => {
  const { class: homeworkClass, subject, section, homeworkDate, submissionDate, marks, attachment, description } = req.body;

  // Check if all required fields are provided
  if (!homeworkClass || !subject || !section || !homeworkDate || !submissionDate || !marks || !description) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    // Create a new homework entry
    const newHomework = new Homework({
      class: homeworkClass,
      subject: subject,
      section: section,
      homeworkDate: homeworkDate,
      submissionDate: submissionDate,
      marks: marks,
      attachment: attachment,  // File URL or path
      description: description
    });

    // Save the homework to the database
    await newHomework.save();

    // Return success response
    res.status(201).json({ message: 'Homework added successfully', homework: newHomework });
  } catch (error) {
    // Handle errors during save
    res.status(500).json({ message: 'Error adding homework', error: error.message });
  }
};

// Controller function to get all homework
const getHomework = async (req, res) => {
  try {
    // Fetch all homework records from the database
    const homeworkRecords = await Homework.find();

    // Return the fetched homework data
    res.status(200).json({
      message: 'Homework records fetched successfully',
      homework: homeworkRecords
    });
  } catch (error) {
    // Handle errors during fetch
    res.status(500).json({ message: 'Error fetching homework records', error: error.message });
  }
};

const markAttendanceForStudent = asyncHandler(async (req, res) => {
  const { studentId } = req.params; // Extract studentId from params
  const { date, subject, attendanceStatus } = req.body; // Extract fields from body

  // Step 1: Find the student by ID
  const student = await Student.findById(studentId);

  if (!student) {
    return res.status(404).json({ message: "Student not found" });
  }

  // Step 2: Check if attendance for the specific date and subject already exists
  const existingAttendance = student.attendance.find(
    (att) =>
      att.date.toISOString().split("T")[0] === new Date(date).toISOString().split("T")[0] &&
      att.subject === subject // Match by subject
  );

  if (existingAttendance) {
    // Update existing attendance for this subject and date
    existingAttendance.attendanceStatus = attendanceStatus;
  } else {
    // Add new attendance record with subject
    student.attendance.push({
      date,
      subject, // Add subject to the attendance
      attendanceStatus,
    });

    // Step 3: Create and save a new Attendance record
    const newAttendance = new Attendance({
      studentId, // Reference to the student
      date,
      subject,
      attendanceStatus,
    });

    await newAttendance.save();
  }

  // Step 4: Save the updated student record
  await student.save();

  res.status(200).json({
    message: "Attendance updated successfully",
    student,
  });
});



const postMarksForStudent = asyncHandler(async (req, res) => {
  const { studentId } = req.params;
  const { subject, marksObtained, totalMarks, examDate, examType, examName } = req.body;

  const student = await Student.findById(studentId);

  if (!student) {
    return res.status(404).json({ message: "Student not found" });
  }

  const newMark = await Marks.create({
    studentId: studentId, // Ensure correct field name
    subject,
    marksObtained,
    totalMarks,
    examDate,
    examType,
    examName,
  });

  student.marks.push(newMark);
  await student.save();

  res.status(201).json({
    message: "Marks added successfully",
    marks: newMark,
  });
});



const addExamSchedule = asyncHandler(async (req, res) => {
  const { class: className, section, subject, examDate, examTime, examType } = req.body;  // Get className, section, and other details from the request body

  // Step 1: Create a new exam schedule object for the Exam model
  const newExamSchedule = new Exam({
    class: className,
    section,
    subject,
    examDate,
    examTime,
    examType
  });

  // Step 2: Save the exam schedule to the database
  const createdExam = await newExamSchedule.save();

  // Step 3: Find all students in the specified class and section
  const students = await Student.find({ class: className, section: section });

  // Step 4: Push the exam schedule to each student's examSchedule array
  for (let student of students) {
    student.examSchedule.push({
      subject,
      examDate,
      examTime,
      examType
    });

    // Save the updated student document
    await student.save();
  }

  // Step 5: Respond with the newly created exam schedule
  res.status(201).json({
    message: "Exam schedule added successfully, and all students' schedules updated",
    exam: createdExam
  });
});


const getStudentsAttendance = async (req, res) => {
  try {
    const { class: studentClass, section, date, subject } = req.query;

    const students = await Student.find({ class: studentClass, section });
    const attendanceData = students.map((student) => {
      const todayRecord = student.attendance.find(
        (record) => record.date === date && record.subject === subject
      ) || { date, subject, attendanceStatus: 'Absent' };  // Use 'attendanceStatus' instead of 'status'

      return {
        id: student._id,
        name: student.firstName,
        class: student.class,
        section: student.section,
        attendance: todayRecord,
      };
    });

    res.status(200).json(attendanceData);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching attendance data', error });
  }
};

// Update attendance for a student
const updateAttendance = async (req, res) => {
  try {
    const { studentId, date, attendanceStatus } = req.body;

    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    const formattedDate = new Date(date).toISOString().split('T')[0];

    const existingRecord = student.attendance.find(
      (att) => att.date.toISOString().split('T')[0] === formattedDate
    );

    if (existingRecord) {
      existingRecord.attendanceStatus = attendanceStatus;
    } else {
      student.attendance.push({ date: new Date(date), attendanceStatus });
    }

    await student.save();
    res.status(200).json({ message: 'Attendance updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error updating attendance' });
  }
};

const updateStudentAttendance = async (req, res) => {
  try {
    const { studentId, attendanceId } = req.params; // Getting both studentId and attendanceId from params
    const { date, subject, attendanceStatus } = req.body;  // Changed 'status' to 'attendanceStatus'

    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Find the specific attendance record by attendanceId
    const attendanceRecordIndex = student.attendance.findIndex(
      (record) => record._id.toString() === attendanceId
    );

    if (attendanceRecordIndex === -1) {
      return res.status(404).json({ message: 'Attendance record not found' });
    }

    // Update the attendance record
    student.attendance[attendanceRecordIndex].attendanceStatus = attendanceStatus;

    await student.save();
    res.status(200).json({ message: 'Attendance updated successfully', student });
  } catch (error) {
    res.status(500).json({ message: 'Error updating attendance', error });
  }
};


const createHomework = async (req, res) => {
  try {
    // Destructure data from request body
    const { class: studentClass, section, subject, homeworkDate, submissionDate, description, homeworkTitle, homeworkBy } = req.body;

    // Create a new homework entry with homeworkTitle and other details
    const newHomework = new Homework({
      class: studentClass,
      section,
      subject,
      homeworkDate,
      submissionDate,
      description,
      homeworkTitle,
      homeworkBy,  // Assign the teacher's name
    });

    // Save the new homework entry to the database
    const savedHomework = await newHomework.save();

    // Find the teacher by name
    const teacher = await Teacher.findOne({ name: homeworkBy });

    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }

    // Add the newly created homework to the teacher's assignedHomework array
    teacher.assignedHomework.push(savedHomework._id);
    await teacher.save();

    // Find all students in the given class and section
    const students = await Student.find({ class: studentClass, section: section });

    // Update each student's homework array with the new homework
    for (const student of students) {
      student.homework.push({
        homeworkId: savedHomework._id,
        status: "Assigned",
        submissionDate: null,  // No submission yet
      });

      await student.save();
    }

    // Send a success response
    res.status(201).json({
      message: 'Homework created successfully, assigned to teacher, and students updated!',
      homework: savedHomework,
    });
  } catch (error) {
    // Handle any errors that occur during the process
    res.status(500).json({
      message: 'Error creating homework',
      error: error.message,
    });
  }
};


const getHomeworkForClassSection = async (req, res) => {
  try {
    // Destructure the class and section from request query parameters
    const { class: studentClass, section } = req.query;

    if (!studentClass || !section) {
      return res.status(400).json({ message: 'Class and section are required' });
    }

    // Find all students in the given class and section
    const students = await Student.find({ class: studentClass, section: section });

    if (!students || students.length === 0) {
      return res.status(404).json({ message: 'No students found in this class and section' });
    }

    // Map through students and fetch their homework along with firstName and lastName
    const homeworkAssignments = await Promise.all(
      students.map(async (student) => {
        // Fetch the homework assigned to the student
        const studentHomework = await Homework.find({
          _id: { $in: student.homework.map(hw => hw.homeworkId) }
        });

        return {
          studentId: student._id,
          firstName: student.firstName,
          lastName: student.lastName,
          homework: studentHomework.map(hw => ({
            homeworkId: hw._id,
            homeworkTitle: hw.homeworkTitle,
            homeworkDate: hw.homeworkDate,
            status: student.homework.find(hwData => hwData.homeworkId.toString() === hw._id.toString()).status,
            submissionDate: student.homework.find(hwData => hwData.homeworkId.toString() === hw._id.toString()).submissionDate,
          })),
        };
      })
    );

    // Send a success response
    res.status(200).json({
      message: 'Homework retrieved successfully',
      data: homeworkAssignments,
    });
  } catch (error) {
    // Handle any errors that occur during the process
    res.status(500).json({
      message: 'Error retrieving homework',
      error: error.message,
    });
  }
};


const updateHomeworkStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const { studentId, homeworkId } = req.params;

    // Find the student
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Find the homework entry for the student
    const homeworkEntry = student.homework.find(hw => hw.homeworkId.toString() === homeworkId);
    if (!homeworkEntry) {
      return res.status(404).json({ message: 'Homework not found for this student' });
    }

    // Update the status
    homeworkEntry.status = status;

    // If status is changed to "submitted," update submission date
    if (status.toLowerCase() === 'submitted') {
      homeworkEntry.submissionDate = new Date();
    }

    // Save the updated student document
    await student.save();

    res.status(200).json({
      message: 'Homework status updated successfully',
      data: {
        studentId: student._id,
        homeworkId: homeworkEntry.homeworkId,
        status: homeworkEntry.status,
        submissionDate: homeworkEntry.submissionDate,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error updating homework status',
      error: error.message,
    });
  }
};



// Controller to handle GET request for fetching all homework entries
const getHomeworks = async (req, res) => {
  try {
    // Fetch all homework entries from the database
    const homeworks = await Homework.find();

    // If no homework entries found, return a message
    if (homeworks.length === 0) {
      return res.status(404).json({
        message: 'No homework found.',
      });
    }

    // Send the homeworks as response
    res.status(200).json({
      message: 'Homeworks retrieved successfully!',
      homeworks,
    });
  } catch (error) {
    // Handle any errors that occur during the process
    res.status(500).json({
      message: 'Error retrieving homeworks',
      error: error.message,
    });
  }
};

// Update homework status
const updateHomeworkStatuss = async (req, res) => {
  const { homeworkId } = req.params; // homeworkId from the URL params
  const { status } = req.body; // status from the request body

  try {
    // Find the homework by its ID
    const homework = await Homework.findById(homeworkId);

    if (!homework) {
      return res.status(404).json({ message: 'Homework not found' });
    }

    // Update the status
    homework.status = status;

    // Save the updated homework
    await homework.save();

    return res.status(200).json({ message: 'Status updated successfully!', homework });
  } catch (error) {
    return res.status(500).json({ message: 'Error updating status', error });
  }
};

const getAllMarks = asyncHandler(async (req, res) => {
  // Step 1: Find all marks and populate the studentId field with selected fields
  const marks = await Marks.find()
    .populate('studentId', 'firstName lastName class section roll'); // Select specific fields

  if (!marks || marks.length === 0) {
    return res.status(404).json({ message: "No marks found" });
  }

  // Step 2: Respond with the marks data
  res.status(200).json({
    message: "Marks retrieved successfully",
    marks,
  });
});


const getClassRoutine = async (req, res) => {
  try {
    // Fetch all class routines from the database
    const routines = await Routine.find();

    // If no routines found
    if (routines.length === 0) {
      return res.status(404).json({ message: "No class routines found" });
    }

    // Return the fetched routines
    return res.status(200).json(routines);
  } catch (error) {
    console.error("Error fetching class routines:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};


const applyForLeave = asyncHandler(async (req, res) => {
  const { teacherId } = req.params;
  const { startDate, endDate, reason, leaveType } = req.body;

  try {
    // Create a new leave entry
    const newLeave = new Leave({
      teacherId,
      startDate,
      endDate,
      leaveType,
      reason,
    });

    // Save the new leave entry
    await newLeave.save();

    // Find the teacher and update the leaves array
    const teacher = await Teacher.findById(teacherId);

    if (!teacher) {
      return res.status(404).json({ message: "Teacher not found" });
    }

    // Push the new leave ID into the teacher's leaves array
    teacher.leaves.push(newLeave._id);

    // Save the updated teacher document
    await teacher.save();

    res.status(201).json({
      message: "Leave applied successfully for teacher",
      leave: newLeave,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

const getTeacherLeaves = asyncHandler(async (req, res) => {
  const { teacherId } = req.params;

  try {
    // Find the teacher by teacherId
    const teacher = await Teacher.findById(teacherId);

    if (!teacher) {
      return res.status(404).json({ message: "Teacher not found" });
    }

    // Fetch all leave details using leaveId references in teacher's leaves array
    const leaveIds = teacher.leaves.map(leave => leave._id);
    const leaves = await Leave.find({ _id: { $in: leaveIds } });

    // If no leaves found for the teacher
    if (!leaves.length) {
      return res.status(404).json({ message: "No leaves found for this teacher" });
    }

    // Format the leave data
    const leaveData = leaves.map((leave) => ({
      leaveId: leave._id,
      startDate: leave.startDate,
      endDate: leave.endDate,
      reason: leave.reason,
      leaveType: leave.leaveType, // Assuming leaveType exists in the Leave model
      status: leave.status
    }));

    // Send the leave data as response
    res.status(200).json({
      message: "Leaves fetched successfully",
      myLeaves: leaveData,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});




// Get all leaves controller
const getAllLeaves = asyncHandler(async (req, res) => {
  // Step 1: Fetch all leave requests from the Leave model
  const allLeaves = await Leave.find();

  // Step 2: If no leaves are found, return a 404 error
  if (!allLeaves || allLeaves.length === 0) {
    return res.status(404).json({
      message: "No leave requests found.",
    });
  }

  // Step 3: Return all leaves
  res.status(200).json({
    message: "All leaves retrieved successfully.",
    leaves: allLeaves,
  });
});


// Controller function to get selected fields of students
const getStudentsAdmission = async (req, res) => {
  try {
    // Fetch students with selected fields only
    const students = await Student.find();

    // Return success response with the list of students
    res.status(200).json({ message: 'Students fetched successfully', students });
  } catch (error) {
    // Handle errors during the fetch operation
    res.status(500).json({ message: 'Error fetching students', error: error.message });
  }
};

const fileComplaint = async (req, res) => {
  const { studentId } = req.params
  try {
    const { title, description, complaintBy } = req.body;



    const student = await Student.findById(studentId);

    if (!student) return res.status(404).json({ message: "Student not found." });

    const complaint = new ComplaintModel({
      studentId,
      title,
      description,
      complaintBy
    });

    await complaint.save();

    // Update student's complaints array
    student.complaints.push(complaint._id);
    await student.save();

    res.status(201).json({
      message: "Complaint filed successfully.",
      complaint,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
};


// Create a new teacher with a photo
const createTeacher = async (req, res) => {
  try {
    const { name, email, phone, address, lastExperience, age, gender, education } = req.body;
    const photo = req.file ? req.file.path : null; // Handle photo file

    // Create a new Teacher instance
    const newTeacher = new Teacher({
      name,
      email,
      phone,
      address,
      lastExperience,
      age,
      gender,
      education,
      photo  // Save the photo path
    });

    // Save the teacher to the database
    await newTeacher.save();

    // Send response back to the client
    res.status(201).json({
      message: 'Teacher created successfully!',
      teacher: newTeacher
    });
  } catch (err) {
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

const teacherLogin = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find the teacher by email
    const teacher = await Teacher.findOne({ email });

    if (!teacher) {
      return res.status(401).json({ message: 'Invalid Credentials' }); // Teacher not found
    }

    // Check if the provided password matches the stored one (if you're storing it hashed, compare with hashed password)
    const passwordMatches = password === teacher.password; // If you're hashing passwords, use bcrypt.compare(password, teacher.password)

    if (!passwordMatches) {
      return res.status(401).json({ message: 'Invalid Credentials' }); // Incorrect password
    }

    // Generate refresh token
    const refreshToken = generateRefreshToken(teacher._id);

    // Save the refresh token in the database
    teacher.refreshToken = refreshToken;
    await teacher.save();

    // Set the refresh token in an HTTP-only cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 72 * 60 * 60 * 1000, // 3 days expiration
      sameSite: 'Strict',
    });

    // Generate access token
    const accessToken = generateToken(teacher._id);

    // Send response with teacher details, tokens, and message
    res.status(200).json({
      _id: teacher._id,
      name: teacher.name,
      email: teacher.email,
      token: accessToken,
      refreshToken,
    });

  } catch (err) {
    console.error("Error Logging in Teacher:", err.message);
    res.status(500).json({
      message: 'Error logging in teacher',
      error: err.message,
    });
  }
};

const logoutTeacher = async (req, res) => {
  try {
    // Clear the refresh token cookie
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // Ensure it's only sent over HTTPS in production
      sameSite: 'Strict', // For added security
    });

    res.status(200).json({ message: 'Logged out successfully' });
  } catch (err) {
    console.error("Error Logging out Teacher:", err.message);
    res.status(500).json({
      message: 'Error logging out teacher',
      error: err.message,
    });
  }
};


// Controller to get teacher's subjects by teacherId
const getTeacherSubject = async (req, res) => {
  const teacherId = req.params.teacherId;

  try {
    // Find teacher by ID and populate the subjects field (assuming subjects are stored in a teacher's model)
    const teacher = await Teacher.findById(teacherId).populate("subject");

    // If teacher is not found, return a 404 error
    if (!teacher) {
      return res.status(404).json({ error: "Teacher not found" });
    }

    // Send the subjects back in the response
    res.status(200).json({
      success: true,
      subjects: teacher.subject,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};

// Fetch teacher's meetings by teacherId
const getTeacherMeetings = async (req, res) => {
  const { teacherId } = req.params;

  try {
    // Fetch the teacher based on teacherId
    const teacher = await Teacher.findById(teacherId);

    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }

    // Fetch all the meeting details based on the meeting IDs stored in teacher's 'meetings' array
    const meetingIds = teacher.meetings;
    const meetings = await Meeting.find({ '_id': { $in: meetingIds } });

    if (meetings.length === 0) {
      return res.status(404).json({ message: 'No meetings found for this teacher' });
    }

    return res.status(200).json({ message: 'Meetings fetched successfully', meetings });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error fetching meetings' });
  }
};

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

    // Assignment create karna
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

    // Jis class aur section ka assignment hai, unke students ke assignment[] array me add karna
    await Student.updateMany(
      { class: className, section: section },
      { $push: { assignments: newAssignment._id } }
    );

    res.status(201).json({ message: 'Assignment created successfully.', data: newAssignment });
  } catch (error) {
    res.status(500).json({ message: 'Error creating assignment.', error: error.message });
  }
};


const createMeeting = async (req, res) => {
  try {
    const { meetingLink, class: className, section, meetingTime, subject } = req.body;

    const newMeeting = new Meeting({ meetingLink, class: className, section, meetingTime, subject });
    await newMeeting.save();

    // Find all students in the specified class and section
    await Student.updateMany(
      { class: className, section },
      { $push: { meetings: newMeeting._id } }
    );

    res.status(201).json({ message: "Meeting created successfully!", meeting: newMeeting });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getMeetings = async (req, res) => {
  try {
    const meetings = await Meeting.find();
    res.status(200).json(meetings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getMeetingById = async (req, res) => {
  try {
    const meeting = await Meeting.findById(req.params.id);
    if (!meeting) return res.status(404).json({ error: "Meeting not found!" });

    res.status(200).json(meeting);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


const getTeacherMeetingsWithAdmin = async (req, res) => {
  try {
    const { teacherId } = req.params;

    // Teacher ko ID se find karo aur meetings expand karo
    const teacher = await Teacher.findById(teacherId).populate("mymeeting");

    if (!teacher) {
      return res.status(404).json({ message: "Teacher not found" });
    }

    return res.status(200).json({ meetings: teacher.mymeeting });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};


export {
  getTeachers,
  getTeacherById,
  updateTeacher,
  deleteTeacher,
  postSyllabus,
  getSyllabus,
  addTopic,
  getTopics,
  addAttendance,
  addHomework,
  getHomework,
  markAttendanceForStudent,
  postMarksForStudent,
  addExamSchedule,
  updateAttendance,
  getStudentsAttendance,
  updateStudentAttendance,
  createHomework,
  getHomeworks,
  updateHomeworkStatuss,
  getAllMarks,
  getClassRoutine,
  applyForLeave,
  getAllLeaves,
  getStudentsAdmission,
  fileComplaint,
  createTeacher,
  getAllTeachers,
  teacherLogin,
  logoutTeacher,
  getTeacherSubject,
  getTeacherMeetings,
  postAssignment,
  getHomeworkForClassSection,
  updateHomeworkStatus,
  getTeacherLeaves,
  createMeeting,
  getMeetings,
  getMeetingById,
  getTeacherMeetingsWithAdmin

};
