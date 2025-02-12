import express from 'express'
const router = express.Router();
import multer from 'multer';
import {
  adminRegistration,
  adminLogin,
  adminLogout,
  addComplaint,
  getComplaints,
  addPhoneCall,
  getPhoneCalls,
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
  getAttendance,
  addFeesGroup,
  getFeesGroups,
  addFeesType,
  getFeesTypes,
  addTransportRoute,
  getTransportRoutes,
  addVehicle,
  getVehicles,
  addVisitor,
  addClass,
  getClasses,
  addTopic,
  getSubjectWiseAttendance,
  exportStudentsData,
  addHomework,
  getAllHomework,
  assignVehicle,
  addExamType,
  addExamSchedule,
  getExamSchedule,
  createSeatPlan,
  getSeatPlan,
  getStudentById,
  createOrUpdateClassRoutine,
  getClassRoutine,
  addAssignment,
  getAssignments,
  postSyllabus,
  getSyllabus,
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
  generateAdmitCard,
  addVisit,
  getVisits,
  getNotices,
  getAllTeachers,
  createTeacher,
  addDriver,
  getDrivers,
  getAllMarks,
  addStaff,
  getAllStaff,
  updateSchoolDetails,
  createSchool,
  addFee,
  getStudentByFilter,
  getFeeDetails,
  promoteStudent,
  getClassSectionTopper,
  addHoliday,
  getHolidays,
  getAllParents,
  getExamTypes,
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

} from '../Controller/AdminController.js'

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './uploads/'); // Define the destination for file uploads
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname); // Set a unique filename
  }
});

const upload = multer({ storage }); // Initialize multer with the storage configuration




router.post('/admin-register', adminRegistration)
router.post('/admin-login', adminLogin)
router.post('/admin-logout', adminLogout)
router.post('/complaints', upload.single('file'), addComplaint);
router.get('/get-complaints', getComplaints);
router.post('/add-phones', addPhoneCall);
router.get('/get-phones', getPhoneCalls);
router.post('/add-section', addSection);
router.delete('/delete-section/:id', deleteSection); // Delete section
router.put('/update-section/:id', updateSection); // Update section
router.get('/get-section', getSections);
router.post('/assign-teacher', assignClassTeacher);
router.get('/get-assign-teacher', getClassTeachers);
router.post('/assign-subject', assignSubjectTeacher);
router.get('/get-assign-subject', getSubjectAssignments);
router.post('/add-classroom', addClassroom);
router.get('/get-classroom', getClassrooms);
router.post('/upload-content', uploadContent);
router.get('/get-content', getContent);
router.post('/post-assignment', postAssignment);
router.post('/add-lesson', addLesson);
router.get('/get-lesson', getLessons);
router.post('/add-category', addStudentCategory);
router.get('/get-category', getStudentCategories);
router.post('/add-student', addStudent);
router.get('/get-student', getStudentsAdmission);
router.get('/get-studentdetails/:studentId', getStudentDetails);
router.get('/get-attendance', getAttendance);
router.post('/add-fees-group', addFeesGroup);
router.get('/get-fees-group', getFeesGroups);
router.post('/add-fees-type', addFeesType);
router.get('/get-fees-type', getFeesTypes);
router.post('/add-transport-route', addTransportRoute);
router.get('/get-transport-route', getTransportRoutes);
router.post('/add-vehicle', addVehicle);
router.get('/get-vehicle', getVehicles);
router.post('/add-visitor', addVisitor);
router.post('/add-class', addClass);
router.get('/get-classes', getClasses);
router.post('/add-topic', addTopic);
router.get('/get-topic', getTopics);
router.get('/subject-wise-attend', getSubjectWiseAttendance);
router.get('/export-students', exportStudentsData);
router.post('/add-homework',upload.single('file'), addHomework); // Middleware for handling single file uploadaddHomework
router.get('/homeworks', getAllHomework);
router.post('/assign-vehicle', assignVehicle);
router.post('/examtype', addExamType);
router.get('/get-examtype', getExamTypes);
router.post('/add-exam-schedule', addExamSchedule);
router.get('/get-exam-schedule', getExamSchedule);
router.post("/create-seat", createSeatPlan); // Create seat plan
router.get("/get-seat", getSeatPlan); // Create seat plan
router.get("/single-student/:id", getStudentById); // Create seat plan
router.post("/create-routine", createOrUpdateClassRoutine); // Create seat plan
router.get("/get-routine", getClassRoutine); // Create seat plan
router.post('/add-assignment',upload.single('file'), addAssignment); // Middleware for handling single file uploadaddHomework
router.get('/get-assignment',getAssignments); // Middleware for handling single file uploadaddHomework
router.post('/add-syllabus',upload.single('file'), postSyllabus); // Middleware for handling single file uploadaddHomework
router.get('/get-syllabus',getSyllabus); // Middleware for handling single file uploadaddHomework
router.post('/notices', createNotice);
router.get('/get-notices', getNotices)
router.post('/create-assign-transport', createTransportAndAssignToStudent);
router.put('/update-class/:classId', updateClass);
router.delete('/remove-class/:classId', removeClass);
router.post('/add-subject', createSubjectByAdmin);
router.get('/get-subjects', getSubjects);
router.get('/get-subjects-names', getSubjectNames);
router.post('/generate-admit-cards/:scheduleId', generateAdmitCard);
router.post("/add-visit", addVisit);
router.get("/get-visits", getVisits);
router.post('/add-teacher', createTeacher);
router.get('/teachers', getAllTeachers);
router.post('/add-driver', addDriver);
router.get('/drivers', getDrivers);
router.get('/marks', getAllMarks);
router.post('/add-staff', addStaff);
router.get('/staffs', getAllStaff);
router.post('/schools', createSchool);
router.post('/add-fees', addFee);
router.get('/fees', getFeeDetails);
router.put('/update-fee', updateFeeStatus);
router.get('/get-students', getStudentByFilter);
router.put("/promote", promoteStudent);
router.get("/topper", getClassSectionTopper);
router.post('/add-holidays', addHoliday);
router.get('/holidays', getHolidays);
router.get('/parents', getAllParents);
router.get('/leaves', getAllLeaves);
router.get('/totalamount', getPaidAndPendingAmount);
router.get('/complaint', getAllComplaints);
router.put('/approve-leave/:leaveId', updateLeaveStatus);
router.post('/create-meeting', createMeeting);
router.get('/meetings', getAllMeetings);
router.get('/student-leaves', getAllStudentLeaves);
router.get('/teacher-leaves', getAllTeachersWithLeaves);
router.put('/student-leaveupdate/:studentId/:leaveId', updateStudentLeaveStatus);
router.put('/teacher-leaveupdate/:teacherId/:leaveId', updateTeacherLeaveStatus);
router.post('/teacher-meeting', scheduleMeetingWithTeacher);
router.get('/teacher-meeting', getAllTeachersMeetings);
router.get('/teacher-student', getAllStudentsMeetings);
router.get('/get-alldashboard', getDashboardCounts);
router.post('/create-lecture', createLecture);
router.get('/create-lecture', getAllLectures);
router.get('/create-lecture', deleteLecture);
router.post('/settings', upload.fields([{ name: 'logo', maxCount: 1 }, { name: 'schoolImage', maxCount: 1 }]), updateSchoolDetails);






















































export default router