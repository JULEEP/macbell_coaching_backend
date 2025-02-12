import express from 'express'
const router = express.Router();

import {
    markAttendanceForStudent,
    postMarksForStudent,
    addExamSchedule,
    getStudentsAttendance,
    updateStudentAttendance,
    createHomework,
    getHomeworks,
    updateHomeworkStatus,
    getAllMarks,
    getClassRoutine,
    getAllLeaves,
    applyForLeave,
    getStudentsAdmission,
    fileComplaint,
    teacherLogin,
    logoutTeacher,
    getTeacherSubject,
    getTeacherMeetings,
    postAssignment,
    getHomeworkForClassSection,
    getTeacherLeaves,
    createMeeting,
    getMeetings,
    getTeacherMeetingsWithAdmin, 
} from '../Controller/TeacherController.js';


router.post('/add-attendance/:studentId', markAttendanceForStudent);
router.post('/add-marks/:studentId', postMarksForStudent);
router.post('/exam-schedule', addExamSchedule);
router.get('/get-attendance', getStudentsAttendance);
router.put('/update-attendance/:studentId/:attendanceId', updateStudentAttendance);
router.post('/add-homework', createHomework);
router.get('/homeworks', getHomeworks);
router.get('/get-homeworks', getHomeworkForClassSection);
router.put('/update-status/:studentId/:homeworkId', updateHomeworkStatus);
router.get('/marks', getAllMarks);
router.get('/classroutine', getClassRoutine);
router.post('/apply-leave/:teacherId', applyForLeave);
router.get('/leaves', getAllLeaves);
router.get('/my-leaves/:teacherId', getTeacherLeaves);
router.get('/students', getStudentsAdmission);
router.post('/add-complaint/:studentId', fileComplaint);
router.post('/login', teacherLogin);
router.post('/logout', logoutTeacher);
router.get('/subjects/:teacherId', getTeacherSubject);
router.get('/meetings/:teacherId', getTeacherMeetings);
router.post('/post-assignment', postAssignment);
router.post("/meetings", createMeeting);
router.get("/meetings", getMeetings);
router.get("/admin-meetings/:teacherId", getTeacherMeetingsWithAdmin);























export default router
