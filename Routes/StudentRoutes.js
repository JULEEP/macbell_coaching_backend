import express from 'express'
const router = express.Router();

import {  
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
    getAdmitCard,
    getStudentDetails,
    loginStudent,
    getFeeDetailsByUserId
} from '../Controller/StudentController.js'

router.get('/get-exam-schedule/:studentId', getExamScheduleByStudent)
router.get('/get-admit-card/:studentId', getAdmitCard)
router.get('/get-routine/:studentId', getClassRoutine)
router.get('/get-lesson/:studentId', getLessonsByStudent)
router.get('/get-homework/:studentId', getHomeworkByStudent);
router.get('/get-assignment/:studentId', getAssignmentsForStudent);
router.get('/get-syllabus/:studentId', getSyllabusForStudent);
router.get('/get-attendance/:studentId', getAttendanceByStudent);
router.post('/apply-leave/:studentId', applyForLeave);
router.get('/leave/:studentId', getLeavesByStudent);
router.get('/marks/:studentId', getMarksByStudent);
router.get('/exam-schedule/:studentId', getStudentExamSchedule);
router.get('/notices/:studentId', getStudentNotices);
router.get('/subjects/:studentId', getStudentSubjects);
router.get('/teachers/:studentId', getStudentSubjectsTeachers);
router.get('/get-transport/:studentId', getStudentTransport);
router.get('/get-details/:studentId', getStudentDetails);
router.post('/login', loginStudent)
router.get('/fees/:userId', getFeeDetailsByUserId);


















export default router