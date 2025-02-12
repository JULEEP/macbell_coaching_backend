import Student from '../Models/Student.js'
import Parent from '../Models/Parent.js'
import Lesson from '../Models/Lesson.js'
import Homework from '../Models/Homework.js'
import Syllabus from '../Models/Syllabus.js'
import Assignment from '../Models/Assignment.js'
import Notice from '../Models/Notice.js'
import Routine from '../Models/Routine.js'
import Leave from '../Models/Leave.js'
import Marks from '../Models/Mark.js'
import generateRefreshToken from '../config/refreshtoken.js';
import generateToken from '../config/jwtToken.js';
import asyncHandler from 'express-async-handler'
import dotenv from 'dotenv'
import jwt from 'jsonwebtoken'
dotenv.config()

// Secret Key
const SECRET_KEY = process.env.JWT_SECRET_KEY;

const parentLogin = async (req, res) => {
  const { username, password } = req.body; // Extract username and password (relationship)

  try {
    // Find the student whose parent has the given name (username)
    const student = await Student.findOne({ "myParents.name": username });

    if (!student) {
      return res.status(404).json({ message: 'Parent not found' });
    }

    // Check if the parent's relationship matches the given password
    const parent = student.myParents.find(
      (parent) => parent.name === username && parent.relationship === password
    );

    if (!parent) {
      return res.status(401).json({ message: 'Invalid credentials: Do not be over smart enter correct credentials!' });
    }

    // Initialize myStudents if it doesn't exist
    if (!parent.myStudents) {
      parent.myStudents = [];
    }

    // Check if the student ID is already stored in the parent's myStudents array
    const isStudentLinked = parent.myStudents.some(
      (s) => s.studentId.toString() === student._id.toString()
    );

    let newStudentAdded = null;

    if (!isStudentLinked) {
      // Add the current student's ID to the parent's myStudents array
      newStudentAdded = { studentId: student._id };
      parent.myStudents.push(newStudentAdded);
      await student.save(); // Save the changes to the database
    }

    // Generate refresh token
    const refreshToken = generateRefreshToken(parent._id);

    // Save the refresh token in the database
    parent.refreshToken = refreshToken;
    await student.save(); // Save the updated parent details

    // Set the refresh token in an HTTP-only cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 72 * 60 * 60 * 1000, // 3 days expiration
      sameSite: 'Strict',
    });

    // Generate access token
    const accessToken = generateToken(parent._id);

    // Respond with the parent ID, name, tokens, and the associated students
    res.status(200).json({
      message: 'Login successful',
      parentId: parent._id, // Parent's unique ID from `myParents`
      parentName: parent.name, // Parent's name
      newStudentAdded: newStudentAdded || null, // Show the newly added student ID if applicable
      myStudents: parent.myStudents, // List all associated students
      token: accessToken, // Access token for further authorization
      refreshToken, // Refresh token
    });
  } catch (error) {
    console.error('Login error:', error.message);
    res.status(500).json({ message: 'Error logging in', error: error.message });
  }
};


const parentLogout = async (req, res) => {
  try {
    // Clear the refresh token cookie
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // Ensure the flag is set for production
      sameSite: 'Strict',
    });

    // Optionally, you can clear the access token from client-side storage if it's stored there.
    // This would typically be done on the client side, but if you need to handle it here, you can respond with a status.

    res.status(200).json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error.message);
    res.status(500).json({ message: 'Error logging out', error: error.message });
  }
};




// Get student transport details
const getStudentTransport = async (req, res) => {
    const { parentId, studentId } = req.params; // Extract parentId and studentId from params

    try {
        // Step 1: Verify if the parent exists
        const parent = await Parent.findById(parentId);
        if (!parent) {
            return res.status(404).json({ message: 'Parent not found' });
        }

        // Step 2: Verify if the student is linked to the parent
        if (!parent.myStudents.includes(studentId)) {
            return res
                .status(403)
                .json({ message: 'Unauthorized: Student not linked to this parent' });
        }

        // Step 3: Fetch the student's specific details and transport information
        const student = await Student.findById(studentId).select('firstName class section roll gender transport');
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        // Step 4: Return the selected student details along with transport
        res.status(200).json({
            message: 'Student details fetched successfully',
            student, // Contains firstName, class, section, roll, gender, transport
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Get student attendance details
const getStudentAttendance = async (req, res) => {
    const { parentId, studentId } = req.params; // Extract parentId and studentId from params

    try {
        // Step 1: Verify if the parent exists
        const parent = await Parent.findById(parentId);
        if (!parent) {
            return res.status(404).json({ message: 'Parent not found' });
        }

        // Step 2: Verify if the student is linked to the parent
        if (!parent.myStudents.includes(studentId)) {
            return res
                .status(403)
                .json({ message: 'Unauthorized: Student not linked to this parent' });
        }

        // Step 3: Fetch the student's details along with attendance
        const student = await Student.findById(studentId).select('firstName class section roll attendance');
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        // Step 4: Return the student details along with attendance
        res.status(200).json({
            message: 'Attendance details fetched successfully',
            studentDetails: {
                firstName: student.firstName,
                class: student.class,
                section: student.section,
                roll: student.roll,
                attendance: student.attendance,
            },
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};


// Get student leaves
const getStudentLeaves = async (req, res) => {
    const { parentId, studentId } = req.params;

    try {
        // Verify parent and student relationship
        const parent = await Parent.findById(parentId);
        if (!parent || !parent.myStudents.includes(studentId)) {
            return res.status(403).json({ message: 'Unauthorized access' });
        }

        const student = await Student.findById(studentId).select('leaves');
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        res.status(200).json({
            message: 'Leaves details fetched successfully',
            leaves: student.leaves,
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const getStudentMarks = async (req, res) => {
  const { studentId } = req.params;

  try {
    // Step 1: Fetch student marks and profile information based on studentId
    const studentMarks = await Marks.find({ studentId }).populate(
      "studentId",
      "firstName lastName class roll section fatherName motherName"
    );

    if (!studentMarks || studentMarks.length === 0) {
      return res.status(404).json({ message: "Marks not found for this student" });
    }

    const student = studentMarks[0].studentId;
    const studentClass = student.class;
    const studentSection = student.section;

    // Step 2: Retrieve all marks for the same class and section
    const allMarks = await Marks.find().populate(
      "studentId",
      "firstName lastName class roll section fatherName motherName"
    );

    const filteredMarks = allMarks.filter(
      (mark) =>
        mark.studentId?.class === studentClass && mark.studentId?.section === studentSection
    );

    if (!filteredMarks || filteredMarks.length === 0) {
      return res.status(404).json({ message: "No marks found for this class and section" });
    }

    // Step 3: Prepare subject-wise comparison data
    const subjectComparison = {};
    filteredMarks.forEach((mark) => {
      if (!subjectComparison[mark.subject]) {
        subjectComparison[mark.subject] = [];
      }
      subjectComparison[mark.subject].push({
        studentId: mark.studentId._id.toString(),
        student: mark.studentId,
        marksObtained: mark.marksObtained,
        totalMarks: mark.totalMarks,
      });
    });

    const subjectResults = [];
    let studentTotalObtainedMarks = 0;
    let studentTotalMarks = 0;

    for (const subject in subjectComparison) {
      const subjectMarks = subjectComparison[subject];

      // Find the topper for the subject
      let subjectTopper = null;
      subjectMarks.forEach((entry) => {
        if (!subjectTopper || entry.marksObtained > subjectTopper.marksObtained) {
          subjectTopper = entry;
        }
      });

      // Get the student's marks for the subject
      const studentSubjectMarks = subjectMarks.find(
        (entry) => entry.studentId === student._id.toString()
      );

      if (studentSubjectMarks) {
        studentTotalObtainedMarks += studentSubjectMarks.marksObtained;
        studentTotalMarks += studentSubjectMarks.totalMarks;

        const studentPercentage = (
          (studentSubjectMarks.marksObtained / studentSubjectMarks.totalMarks) *
          100
        ).toFixed(2);
        const topperPercentage = (
          (subjectTopper.marksObtained / subjectTopper.totalMarks) *
          100
        ).toFixed(2);

        subjectResults.push({
          subject,
          studentMarks: studentSubjectMarks.marksObtained,
          studentPercentage,
          topperMarks: subjectTopper.marksObtained,
          topperPercentage,
          comparison:
            studentPercentage >= topperPercentage
              ? "Your child is above or equal to the topper in this subject"
              : "Your child is below the topper in this subject",
        });
      }
    }

    // Step 4: Calculate overall comparison
    const studentPercentage = (
      (studentTotalObtainedMarks / studentTotalMarks) *
      100
    ).toFixed(2);

    const topperOverallMarks = subjectResults.reduce(
      (acc, subject) => acc + subject.topperMarks,
      0
    );
    const topperTotalMarks = subjectResults.reduce(
      (acc, subject) => acc + subject.topperMarks * (100 / subject.topperPercentage),
      0
    );
    const topperOverallPercentage = ((topperOverallMarks / topperTotalMarks) * 100).toFixed(2);

    const comparisonResult = {
      student,
      studentPercentage,
      topper: subjectResults[0]?.topper,
      topperPercentage: topperOverallPercentage,
      overallComparison:
        studentPercentage >= topperOverallPercentage
          ? "Your children are above or equal to the topper overall"
          : "Your children are below the topper overall",
      subjectWiseComparison: subjectResults,
      suggestion:
        studentPercentage >= topperOverallPercentage
          ? "Encourage your child to maintain their excellent performance by engaging in advanced learning resources and extracurricular activities."
          : "Support your child by identifying areas for improvement. Regular study schedules, engaging a tutor, or providing additional resources could help them achieve better results.",
    };

    res.status(200).json({
      message: "Subject-wise comparison with topper retrieved successfully",
      comparisonResult,
    });
  } catch (error) {
    console.error("Error comparing topper:", error);
    res.status(500).json({ message: "Failed to compare with topper" });
  }
};


const getStudentMark = async (req, res) => {
  const { studentId } = req.params;

  try {
    // Step 1: Fetch student marks and profile information based on studentId
    const studentMarks = await Marks.find({ studentId }).populate(
      "studentId",
      "firstName lastName class roll section fatherName motherName"
    );

    if (!studentMarks || studentMarks.length === 0) {
      return res.status(404).json({ message: "Marks not found for this student" });
    }

    const student = studentMarks[0].studentId;
    const studentClass = student.class;
    const studentSection = student.section;

    // Step 2: Retrieve all marks for the same class and section
    const allMarks = await Marks.find().populate(
      "studentId",
      "firstName lastName class roll section fatherName motherName"
    );

    const filteredMarks = allMarks.filter(
      (mark) =>
        mark.studentId?.class === studentClass && mark.studentId?.section === studentSection
    );

    if (!filteredMarks || filteredMarks.length === 0) {
      return res.status(404).json({ message: "No marks found for this class and section" });
    }

    // Step 3: Prepare subject-wise comparison data
    const subjectComparison = {};
    filteredMarks.forEach((mark) => {
      if (!subjectComparison[mark.subject]) {
        subjectComparison[mark.subject] = [];
      }
      subjectComparison[mark.subject].push({
        studentId: mark.studentId._id.toString(),
        student: mark.studentId,
        marksObtained: mark.marksObtained,
        totalMarks: mark.totalMarks,
      });
    });

    const subjectResults = [];

    for (const subject in subjectComparison) {
      const subjectMarks = subjectComparison[subject];

      // Find the topper for the subject
      let subjectTopper = null;
      subjectMarks.forEach((entry) => {
        if (!subjectTopper || entry.marksObtained > subjectTopper.marksObtained) {
          subjectTopper = entry;
        }
      });

      // Get the student's marks for the subject
      const studentSubjectMarks = subjectMarks.find(
        (entry) => entry.studentId === student._id.toString()
      );

      if (studentSubjectMarks) {
        subjectResults.push({
          subject,
          studentMarks: studentSubjectMarks.marksObtained,
          topperMarks: subjectTopper.marksObtained,
          topperId: subjectTopper.studentId, // Adding topper's ID
        });
      }
    }

    res.status(200).json({
      message: "Subject-wise marks comparison retrieved successfully",
      comparisonResult: subjectResults,
    });
  } catch (error) {
    console.error("Error comparing subject-wise marks:", error);
    res.status(500).json({ message: "Failed to compare subject-wise marks" });
  }
};



// Get student exam schedule
const getStudentExamSchedule = async (req, res) => {
    const { parentId, studentId } = req.params;

    try {
        // Verify parent and student relationship
        const parent = await Parent.findById(parentId);
        if (!parent || !parent.myStudents.includes(studentId)) {
            return res.status(403).json({ message: 'Unauthorized access' });
        }

        const student = await Student.findById(studentId).select('examSchedule');
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        res.status(200).json({
            message: 'Exam schedule fetched successfully',
            examSchedule: student.examSchedule,
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Get student subjects
const getStudentSubjects = async (req, res) => {
    const { parentId, studentId } = req.params;

    try {
        // Verify parent and student relationship
        const parent = await Parent.findById(parentId);
        if (!parent || !parent.myStudents.includes(studentId)) {
            return res.status(403).json({ message: 'Unauthorized access' });
        }

        const student = await Student.findById(studentId).populate('subjects');
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        res.status(200).json({
            message: 'Subjects fetched successfully',
            subjects: student.subjects,
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const getLessonsForParent = async (req, res) => {
    const { parentId, studentId } = req.params; // Get parentId and studentId from request parameters
  
    try {
      // Step 1: Verify parent and student relationship
      const parent = await Parent.findById(parentId);
      if (!parent || !parent.myStudents.includes(studentId)) {
        return res.status(403).json({ message: 'Unauthorized access' });
      }
  
      // Step 2: Fetch the student based on studentId
      const student = await Student.findById(studentId);
      if (!student) {
        return res.status(404).json({ message: 'Student not found' });
      }
  
      // Step 3: Extract the class and section of the student
      const { class: studentClass } = student;
  
      // Step 4: Fetch lessons for the student's class
      const lessons = await Lesson.find({ class: studentClass });
  
      if (lessons.length === 0) {
        return res.status(404).json({ message: 'No lessons found for the student\'s class' });
      }
  
      // Step 5: Return the fetched lessons
      return res.status(200).json({
        message: 'Lessons retrieved successfully',
        lessons,
      });
    } catch (error) {
      // Handle any errors during fetch
      console.error('Error fetching lessons:', error);
      return res.status(500).json({
        message: 'Error fetching lessons',
        error: error.message,
      });
    }
  };
  

  const getHomeworkForParent = async (req, res) => {
    const { parentId, studentId } = req.params; // Get parentId and studentId from URL parameters
  
    try {
      // Step 1: Verify parent and student relationship
      const parent = await Parent.findById(parentId);
      if (!parent || !parent.myStudents.includes(studentId)) {
        return res.status(403).json({ message: 'Unauthorized access' });
      }
  
      // Step 2: Fetch student details to get class and section
      const student = await Student.findById(studentId);
      if (!student) {
        return res.status(404).json({ message: 'Student not found' });
      }
  
      // Step 3: Fetch homework based on the student's class and section
      const homework = await Homework.find({
        class: student.class,
        section: student.section,
      });
  
      if (homework.length === 0) {
        return res.status(404).json({ message: 'No homework found for the student\'s class and section' });
      }
  
      // Step 4: Return homework data
      res.status(200).json({
        message: 'Homework retrieved successfully',
        homework,
      });
    } catch (error) {
      console.error('Error fetching homework:', error);
      res.status(500).json({
        message: 'Error fetching homework',
        error: error.message,
      });
    }
  };

  const getAssignmentsForParent = async (req, res) => {
    const { parentId, studentId } = req.params;
  
    try {
      // Step 1: Verify parent and student relationship
      const parent = await Parent.findById(parentId);
      if (!parent || !parent.myStudents.includes(studentId)) {
        return res.status(403).json({ message: "Unauthorized access" });
      }
  
      // Step 2: Fetch student details
      const student = await Student.findById(studentId);
      if (!student) {
        return res.status(404).json({ message: "Student not found" });
      }
  
      // Step 3: Fetch assignments based on class and section
      const assignments = await Assignment.find({
        class: student.class,
        section: student.section,
      });
  
      if (!assignments.length) {
        return res.status(404).json({ message: "No assignments found" });
      }
  
      // Step 4: Return assignments
      res.status(200).json({
        message: "Assignments fetched successfully",
        assignments,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error fetching assignments", error });
    }
  };
  

  const getSyllabusForParent = async (req, res) => {
    const { parentId, studentId } = req.params;
  
    try {
      // Step 1: Verify parent and student relationship
      const parent = await Parent.findById(parentId);
      if (!parent || !parent.myStudents.includes(studentId)) {
        return res.status(403).json({ message: "Unauthorized access" });
      }
  
      // Step 2: Fetch student details
      const student = await Student.findById(studentId);
      if (!student) {
        return res.status(404).json({ message: "Student not found" });
      }
  
      // Step 3: Fetch syllabus
      const syllabus = await Syllabus.find({
        class: student.class,
        section: student.section,
      });
  
      if (!syllabus.length) {
        return res.status(404).json({ message: "No syllabus found" });
      }
  
      // Step 4: Return syllabus
      res.status(200).json({
        message: "Syllabus fetched successfully",
        syllabus,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error fetching syllabus", error });
    }
  };

  const applyForLeaveByParent = async (req, res) => {
    const { parentId, studentId } = req.params;
    const { startDate, endDate, reason } = req.body;
  
    try {
      // Step 1: Verify parent and student relationship
      const parent = await Parent.findById(parentId);
      if (!parent || !parent.myStudents.includes(studentId)) {
        return res.status(403).json({ message: "Unauthorized access" });
      }
  
      // Step 2: Fetch student
      const student = await Student.findById(studentId);
      if (!student) {
        return res.status(404).json({ message: "Student not found" });
      }
  
      // Step 3: Add leave request
      const newLeave = {
        startDate,
        endDate,
        reason,
        status: "Pending",
      };
  
      student.leaves.push(newLeave);
      await student.save();
  
      res.status(201).json({
        message: "Leave applied successfully",
        leave: newLeave,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error applying leave", error });
    }
  };
  
  
  const getMarksForParent = async (req, res) => {
    const { parentId, studentId } = req.params;
  
    try {
      // Step 1: Verify parent and student relationship
      const parent = await Parent.findById(parentId);
      if (!parent || !parent.myStudents.includes(studentId)) {
        return res.status(403).json({ message: "Unauthorized access" });
      }
  
      // Step 2: Fetch marks
      const marks = await Marks.find({ studentId });
      if (!marks.length) {
        return res.status(404).json({ message: "Marks not found for this student" });
      }
  
      res.status(200).json({
        message: "Marks retrieved successfully",
        marks,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error fetching marks", error });
    }
  };
  

  const getNoticesForParent = async (req, res) => {
    const { parentId, studentId } = req.params;
  
    try {
      // Step 1: Verify parent and student relationship
      const parent = await Parent.findById(parentId);
      if (!parent || !parent.myStudents.includes(studentId)) {
        return res.status(403).json({ message: "Unauthorized access" });
      }
  
      // Step 2: Fetch student
      const student = await Student.findById(studentId);
      if (!student) {
        return res.status(404).json({ message: "Student not found" });
      }
  
      // Step 3: Fetch notices
      const notices = await Notice.find({
        $or: [
          { targetAudience: { $in: ["All"] } },
          { class: student.class, section: student.section },
        ],
      }).sort({ date: -1 });
  
      if (!notices.length) {
        return res.status(404).json({ message: "No notices found" });
      }
  
      res.status(200).json({
        message: "Notices fetched successfully",
        notices,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error fetching notices", error });
    }
  };
  
  const getSubjectsAndTeachersForParent = async (req, res) => {
    const { parentId, studentId } = req.params;
  
    try {
      // Step 1: Verify parent and student relationship
      const parent = await Parent.findById(parentId);
      if (!parent || !parent.myStudents.includes(studentId)) {
        return res.status(403).json({ message: "Unauthorized access" });
      }
  
      // Step 2: Fetch student and populate subjects
      const student = await Student.findById(studentId).populate({
        path: "subjects",
        select: "teacher",
      });
  
      if (!student) {
        return res.status(404).json({ message: "Student not found" });
      }
  
      res.status(200).json({
        message: "Subjects and teachers fetched successfully",
        subjects: student.subjects.map((subject) => ({
          teacher: subject.teacher,
        })),
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error fetching subjects and teachers", error });
    }
  };
  

  const getClassRoutineForParent = async (req, res) => {
    const { parentId, studentId } = req.params; // Get parentId and studentId from request params

    try {
        // Step 1: Fetch the parent and check if the student is linked to this parent
        const parent = await Parent.findById(parentId);  // Fetch the parent data

        if (!parent) {
            return res.status(404).json({ message: "Parent not found" });
        }

        // Check if the studentId is in the parent's list of linked students
        if (!parent.myStudents.includes(studentId)) {
            return res.status(403).json({ message: "Unauthorized: Student not linked to this parent" });
        }

        // Step 2: Fetch the student data based on studentId
        const student = await Student.findById(studentId);  // Fetch the student's details

        if (!student) {
            return res.status(404).json({ message: "Student not found" });
        }

        // Step 3: Get class and section from student and fetch routine
        const { class: studentClass, section } = student;  // Get class and section

        // Step 4: Fetch the routine for the class and section
        const routine = await Routine.findOne({ class: studentClass, section });

        if (!routine) {
            return res.status(404).json({ message: "No routine found for the student's class" });
        }

        // Step 5: Return the fetched routine
        return res.status(200).json(routine);
    } catch (error) {
        console.error("Error fetching class routine for parent:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};

const applyLeave = async (req, res) => {
    const { parentId, studentId } = req.params;
    const { leaveType, startDate, endDate, reason } = req.body;
  
    try {
      // Step 1: Verify parent and student relationship
      const parent = await Parent.findById(parentId);
      if (!parent || !parent.myStudents.includes(studentId)) {
        return res.status(403).json({ message: "Unauthorized access" });
      }
  
      // Step 2: Verify student exists
      const student = await Student.findById(studentId);
      if (!student) {
        return res.status(404).json({ message: "Student not found" });
      }
  
      // Step 3: Create the leave request, status will default to 'Pending'
      const newLeave = new Leave({
        parentId,
        studentId,
        leaveType,
        startDate,  // changed from leaveFrom to startDate
        endDate,    // changed from leaveTo to endDate
        reason,
      });
  
      // Step 4: Push the new leave into the student's 'leaves' array
      student.leaves.push(newLeave);
  
      // Step 5: Save the updated student document with the new leave
      await student.save();
  
      // Step 6: Save the leave request to the leave collection (optional)
      await newLeave.save();
  
      // Step 7: Return a success response
      res.status(200).json({
        message: "Leave applied successfully and added to student's leave records",
        leave: newLeave,
      });
    } catch (error) {
      console.error("Error applying leave:", error);
      res.status(500).json({ message: "Error applying leave", error: error.message });
    }
  };

  // Controller to get student details by parent
const getStudentDetails = async (req, res) => {
    const { parentId, studentId } = req.params;
  
    try {
      // Step 1: Verify the parent-student relationship
      const parent = await Parent.findById(parentId);
      if (!parent || !parent.myStudents.includes(studentId)) {
        return res.status(403).json({ message: "Unauthorized access. Parent-Student relationship not found." });
      }
  
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
  
export {
    parentLogin,
    parentLogout,
    getStudentTransport,
    getStudentAttendance,
    getStudentLeaves,
    getStudentMarks,
    getStudentExamSchedule,
    getStudentSubjects,
    getLessonsForParent,
    getHomeworkForParent,
    getAssignmentsForParent,
    getSyllabusForParent,
    applyForLeaveByParent,
    getMarksForParent,
    getNoticesForParent,
    getSubjectsAndTeachersForParent,
    getClassRoutineForParent,
    applyLeave,
    getStudentDetails,
    getStudentMark
}