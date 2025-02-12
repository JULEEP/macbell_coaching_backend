import express from 'express'
const router = express.Router();

import {
  parentLogin,
  getStudentTransport,
  getStudentAttendance,
  getStudentLeaves,
  getStudentMarks,
  getStudentExamSchedule,
  getLessonsForParent,
  getHomeworkForParent,
  getAssignmentsForParent,
  getSyllabusForParent,
  applyForLeaveByParent,
  getMarksForParent,
  getNoticesForParent,
  getSubjectsAndTeachersForParent,
  getClassRoutineForParent,
  getStudentSubjects,
  applyLeave,
  getStudentMark,
  getStudentDetails,
  parentLogout
} from '../Controller/ParentController.js';


router.post('/parent-login', parentLogin)
router.post('/parent-logout', parentLogout)
router.get('/my-child-transport/:parentId/:studentId', getStudentTransport)
router.get('/my-child-attendance/:parentId/:studentId', getStudentAttendance)
router.get('/my-child-leaves/:parentId/:studentId', getStudentLeaves)
router.get('/my-child-marks/:studentId', getStudentMarks)
router.get('/my-child-mark/:studentId', getStudentMark)
router.get('/my-child-examshedule/:parentId/:studentId', getStudentExamSchedule)
router.get('/my-child-subjects/:parentId/:studentId', getStudentSubjects)
router.get('/my-child-lesson/:parentId/:studentId', getLessonsForParent)
router.get('/my-child-homework/:parentId/:studentId', getHomeworkForParent)
router.get('/my-child-syllabus/:parentId/:studentId', getSyllabusForParent)
router.post('/my-child-applyleave/:parentId/:studentId', applyLeave)
router.get('/my-child-notice/:parentId/:studentId', getNoticesForParent)
router.get('/my-child-teacher/:parentId/:studentId', getSubjectsAndTeachersForParent)
router.get('/my-child-routine/:parentId/:studentId', getClassRoutineForParent)
router.get('/my-child-details/:parentId/:studentId', getStudentDetails)












export default router