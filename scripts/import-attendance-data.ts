import { prisma } from '../lib/prisma';
import { hash } from 'bcryptjs';

// Attendance data from the user's report
const attendanceData = [
  { index: 1, personId: "1", name: "FAIZAN FARRUKH", department: "Mize Technologies", position: "-", gender: "Male", date: "2025-06-01", dayOfWeek: "Sun.", timetable: "(16:00:00-02:00:00)", firstIn: "-", lastOut: "02:42:43" },
  { index: 2, personId: "1", name: "FAIZAN FARRUKH", department: "Mize Technologies", position: "-", gender: "Male", date: "2025-06-02", dayOfWeek: "Mon.", timetable: "(16:00:00-02:00:00)", firstIn: "19:44:39", lastOut: "-" },
  { index: 3, personId: "1", name: "FAIZAN FARRUKH", department: "Mize Technologies", position: "-", gender: "Male", date: "2025-06-03", dayOfWeek: "Tue.", timetable: "(16:00:00-02:00:00)", firstIn: "15:34:03", lastOut: "00:28:49" },
  { index: 4, personId: "1", name: "FAIZAN FARRUKH", department: "Mize Technologies", position: "-", gender: "Male", date: "2025-06-04", dayOfWeek: "Wed.", timetable: "(16:00:00-02:00:00)", firstIn: "19:26:27", lastOut: "22:36:54" },
  { index: 5, personId: "1", name: "FAIZAN FARRUKH", department: "Mize Technologies", position: "-", gender: "Male", date: "2025-06-05", dayOfWeek: "Thu.", timetable: "(16:00:00-02:00:00)", firstIn: "19:43:45", lastOut: "22:40:46" },
  { index: 6, personId: "1", name: "FAIZAN FARRUKH", department: "Mize Technologies", position: "-", gender: "Male", date: "2025-06-06", dayOfWeek: "Fri.", timetable: "(16:00:00-02:00:00)", firstIn: "-", lastOut: "20:38:33" },
  { index: 7, personId: "1", name: "FAIZAN FARRUKH", department: "Mize Technologies", position: "-", gender: "Male", date: "2025-06-07", dayOfWeek: "Sat.", timetable: "(16:00:00-02:00:00)", firstIn: "-", lastOut: "-" },
  { index: 8, personId: "1", name: "FAIZAN FARRUKH", department: "Mize Technologies", position: "-", gender: "Male", date: "2025-06-08", dayOfWeek: "Sun.", timetable: "(16:00:00-02:00:00)", firstIn: "-", lastOut: "-" },
  { index: 9, personId: "1", name: "FAIZAN FARRUKH", department: "Mize Technologies", position: "-", gender: "Male", date: "2025-06-09", dayOfWeek: "Mon.", timetable: "(16:00:00-02:00:00)", firstIn: "17:47:28", lastOut: "23:58:06" },
  { index: 10, personId: "1", name: "FAIZAN FARRUKH", department: "Mize Technologies", position: "-", gender: "Male", date: "2025-06-10", dayOfWeek: "Tue.", timetable: "(16:00:00-02:00:00)", firstIn: "19:00:53", lastOut: "02:28:38" },
  { index: 11, personId: "1", name: "FAIZAN FARRUKH", department: "Mize Technologies", position: "-", gender: "Male", date: "2025-06-11", dayOfWeek: "Wed.", timetable: "(16:00:00-02:00:00)", firstIn: "17:53:43", lastOut: "01:55:02" },
  { index: 12, personId: "1", name: "FAIZAN FARRUKH", department: "Mize Technologies", position: "-", gender: "Male", date: "2025-06-12", dayOfWeek: "Thu.", timetable: "(16:00:00-02:00:00)", firstIn: "19:28:46", lastOut: "01:43:02" },
  { index: 13, personId: "1", name: "FAIZAN FARRUKH", department: "Mize Technologies", position: "-", gender: "Male", date: "2025-06-13", dayOfWeek: "Fri.", timetable: "(16:00:00-02:00:00)", firstIn: "14:50:07", lastOut: "01:40:36" },
  { index: 14, personId: "1", name: "FAIZAN FARRUKH", department: "Mize Technologies", position: "-", gender: "Male", date: "2025-06-14", dayOfWeek: "Sat.", timetable: "(16:00:00-02:00:00)", firstIn: "18:50:32", lastOut: "01:37:39" },
  { index: 15, personId: "1", name: "FAIZAN FARRUKH", department: "Mize Technologies", position: "-", gender: "Male", date: "2025-06-15", dayOfWeek: "Sun.", timetable: "(16:00:00-02:00:00)", firstIn: "-", lastOut: "-" },
  { index: 16, personId: "1", name: "FAIZAN FARRUKH", department: "Mize Technologies", position: "-", gender: "Male", date: "2025-06-16", dayOfWeek: "Mon.", timetable: "(16:00:00-02:00:00)", firstIn: "17:51:57", lastOut: "01:52:13" },
  { index: 17, personId: "1", name: "FAIZAN FARRUKH", department: "Mize Technologies", position: "-", gender: "Male", date: "2025-06-17", dayOfWeek: "Tue.", timetable: "(16:00:00-02:00:00)", firstIn: "17:41:24", lastOut: "-" },
  { index: 18, personId: "1", name: "FAIZAN FARRUKH", department: "Mize Technologies", position: "-", gender: "Male", date: "2025-06-18", dayOfWeek: "Wed.", timetable: "(16:00:00-02:00:00)", firstIn: "17:35:46", lastOut: "01:14:50" },
  { index: 19, personId: "1", name: "FAIZAN FARRUKH", department: "Mize Technologies", position: "-", gender: "Male", date: "2025-06-19", dayOfWeek: "Thu.", timetable: "(16:00:00-02:00:00)", firstIn: "18:35:14", lastOut: "04:45:04" },
  { index: 20, personId: "1", name: "FAIZAN FARRUKH", department: "Mize Technologies", position: "-", gender: "Male", date: "2025-06-20", dayOfWeek: "Fri.", timetable: "(16:00:00-02:00:00)", firstIn: "17:26:32", lastOut: "00:49:42" },
  { index: 21, personId: "1", name: "FAIZAN FARRUKH", department: "Mize Technologies", position: "-", gender: "Male", date: "2025-06-21", dayOfWeek: "Sat.", timetable: "(16:00:00-02:00:00)", firstIn: "17:59:50", lastOut: "-" },
  { index: 22, personId: "1", name: "FAIZAN FARRUKH", department: "Mize Technologies", position: "-", gender: "Male", date: "2025-06-22", dayOfWeek: "Sun.", timetable: "(16:00:00-02:00:00)", firstIn: "-", lastOut: "-" },
  { index: 23, personId: "1", name: "FAIZAN FARRUKH", department: "Mize Technologies", position: "-", gender: "Male", date: "2025-06-23", dayOfWeek: "Mon.", timetable: "(16:00:00-02:00:00)", firstIn: "17:20:22", lastOut: "03:35:57" },
  { index: 24, personId: "1", name: "FAIZAN FARRUKH", department: "Mize Technologies", position: "-", gender: "Male", date: "2025-06-24", dayOfWeek: "Tue.", timetable: "(16:00:00-02:00:00)", firstIn: "18:28:47", lastOut: "21:35:49" },
  { index: 25, personId: "1", name: "FAIZAN FARRUKH", department: "Mize Technologies", position: "-", gender: "Male", date: "2025-06-25", dayOfWeek: "Wed.", timetable: "(16:00:00-02:00:00)", firstIn: "17:34:00", lastOut: "01:38:07" },
  { index: 26, personId: "1", name: "FAIZAN FARRUKH", department: "Mize Technologies", position: "-", gender: "Male", date: "2025-06-26", dayOfWeek: "Thu.", timetable: "(16:00:00-02:00:00)", firstIn: "17:27:01", lastOut: "01:17:41" },
  { index: 27, personId: "1", name: "FAIZAN FARRUKH", department: "Mize Technologies", position: "-", gender: "Male", date: "2025-06-27", dayOfWeek: "Fri.", timetable: "(16:00:00-02:00:00)", firstIn: "16:25:53", lastOut: "03:37:49" },
  { index: 28, personId: "1", name: "FAIZAN FARRUKH", department: "Mize Technologies", position: "-", gender: "Male", date: "2025-06-28", dayOfWeek: "Sat.", timetable: "(16:00:00-02:00:00)", firstIn: "19:11:43", lastOut: "00:58:27" },
  { index: 29, personId: "1", name: "FAIZAN FARRUKH", department: "Mize Technologies", position: "-", gender: "Male", date: "2025-06-29", dayOfWeek: "Sun.", timetable: "(16:00:00-02:00:00)", firstIn: "-", lastOut: "-" },
  { index: 30, personId: "1", name: "FAIZAN FARRUKH", department: "Mize Technologies", position: "-", gender: "Male", date: "2025-06-30", dayOfWeek: "Mon.", timetable: "(16:00:00-02:00:00)", firstIn: "18:38:50", lastOut: "23:36:38" },
  { index: 31, personId: "1", name: "FAIZAN FARRUKH", department: "Mize Technologies", position: "-", gender: "Male", date: "2025-07-01", dayOfWeek: "Tue.", timetable: "(16:00:00-02:00:00)", firstIn: "19:49:46", lastOut: "20:23:30" },
  
  // Hamza Qureshi's attendance data
  { index: 32, personId: "2", name: "Hamza Qureshi", department: "Mize Technologies/Production", position: "-", gender: "Male", date: "2025-06-01", dayOfWeek: "Sun.", timetable: "(16:00:00-02:00:00)", firstIn: "-", lastOut: "-" },
  { index: 33, personId: "2", name: "Hamza Qureshi", department: "Mize Technologies/Production", position: "-", gender: "Male", date: "2025-06-02", dayOfWeek: "Mon.", timetable: "(16:00:00-02:00:00)", firstIn: "18:23:07", lastOut: "03:04:26" },
  { index: 34, personId: "2", name: "Hamza Qureshi", department: "Mize Technologies/Production", position: "-", gender: "Male", date: "2025-06-03", dayOfWeek: "Tue.", timetable: "(16:00:00-02:00:00)", firstIn: "18:14:45", lastOut: "02:47:13" },
  { index: 35, personId: "2", name: "Hamza Qureshi", department: "Mize Technologies/Production", position: "-", gender: "Male", date: "2025-06-04", dayOfWeek: "Wed.", timetable: "(16:00:00-02:00:00)", firstIn: "18:26:55", lastOut: "03:12:18" },
  { index: 36, personId: "2", name: "Hamza Qureshi", department: "Mize Technologies/Production", position: "-", gender: "Male", date: "2025-06-05", dayOfWeek: "Thu.", timetable: "(16:00:00-02:00:00)", firstIn: "19:41:12", lastOut: "03:28:41" },
  { index: 37, personId: "2", name: "Hamza Qureshi", department: "Mize Technologies/Production", position: "-", gender: "Male", date: "2025-06-06", dayOfWeek: "Fri.", timetable: "(16:00:00-02:00:00)", firstIn: "17:07:36", lastOut: "21:37:32" },
  { index: 38, personId: "2", name: "Hamza Qureshi", department: "Mize Technologies/Production", position: "-", gender: "Male", date: "2025-06-07", dayOfWeek: "Sat.", timetable: "(16:00:00-02:00:00)", firstIn: "-", lastOut: "-" },
  { index: 39, personId: "2", name: "Hamza Qureshi", department: "Mize Technologies/Production", position: "-", gender: "Male", date: "2025-06-08", dayOfWeek: "Sun.", timetable: "(16:00:00-02:00:00)", firstIn: "-", lastOut: "-" },
  { index: 40, personId: "2", name: "Hamza Qureshi", department: "Mize Technologies/Production", position: "-", gender: "Male", date: "2025-06-09", dayOfWeek: "Mon.", timetable: "(16:00:00-02:00:00)", firstIn: "-", lastOut: "-" },
  { index: 41, personId: "2", name: "Hamza Qureshi", department: "Mize Technologies/Production", position: "-", gender: "Male", date: "2025-06-10", dayOfWeek: "Tue.", timetable: "(16:00:00-02:00:00)", firstIn: "17:27:35", lastOut: "02:14:13" },
  { index: 42, personId: "2", name: "Hamza Qureshi", department: "Mize Technologies/Production", position: "-", gender: "Male", date: "2025-06-11", dayOfWeek: "Wed.", timetable: "(16:00:00-02:00:00)", firstIn: "17:48:57", lastOut: "02:29:21" },
  { index: 43, personId: "2", name: "Hamza Qureshi", department: "Mize Technologies/Production", position: "-", gender: "Male", date: "2025-06-12", dayOfWeek: "Thu.", timetable: "(16:00:00-02:00:00)", firstIn: "18:43:44", lastOut: "03:46:07" },
  { index: 44, personId: "2", name: "Hamza Qureshi", department: "Mize Technologies/Production", position: "-", gender: "Male", date: "2025-06-13", dayOfWeek: "Fri.", timetable: "(16:00:00-02:00:00)", firstIn: "18:52:49", lastOut: "03:31:57" },
  { index: 45, personId: "2", name: "Hamza Qureshi", department: "Mize Technologies/Production", position: "-", gender: "Male", date: "2025-06-14", dayOfWeek: "Sat.", timetable: "(16:00:00-02:00:00)", firstIn: "-", lastOut: "-" },
  { index: 46, personId: "2", name: "Hamza Qureshi", department: "Mize Technologies/Production", position: "-", gender: "Male", date: "2025-06-15", dayOfWeek: "Sun.", timetable: "(16:00:00-02:00:00)", firstIn: "-", lastOut: "-" },
  { index: 47, personId: "2", name: "Hamza Qureshi", department: "Mize Technologies/Production", position: "-", gender: "Male", date: "2025-06-16", dayOfWeek: "Mon.", timetable: "(16:00:00-02:00:00)", firstIn: "17:57:41", lastOut: "02:37:32" },
  { index: 48, personId: "2", name: "Hamza Qureshi", department: "Mize Technologies/Production", position: "-", gender: "Male", date: "2025-06-17", dayOfWeek: "Tue.", timetable: "(16:00:00-02:00:00)", firstIn: "18:29:34", lastOut: "03:02:20" },
  { index: 49, personId: "2", name: "Hamza Qureshi", department: "Mize Technologies/Production", position: "-", gender: "Male", date: "2025-06-18", dayOfWeek: "Wed.", timetable: "(16:00:00-02:00:00)", firstIn: "18:10:39", lastOut: "02:47:31" },
  { index: 50, personId: "2", name: "Hamza Qureshi", department: "Mize Technologies/Production", position: "-", gender: "Male", date: "2025-06-19", dayOfWeek: "Thu.", timetable: "(16:00:00-02:00:00)", firstIn: "18:16:01", lastOut: "02:59:43" },
  { index: 51, personId: "2", name: "Hamza Qureshi", department: "Mize Technologies/Production", position: "-", gender: "Male", date: "2025-06-20", dayOfWeek: "Fri.", timetable: "(16:00:00-02:00:00)", firstIn: "17:57:11", lastOut: "02:43:32" },
  { index: 52, personId: "2", name: "Hamza Qureshi", department: "Mize Technologies/Production", position: "-", gender: "Male", date: "2025-06-21", dayOfWeek: "Sat.", timetable: "(16:00:00-02:00:00)", firstIn: "-", lastOut: "-" },
  { index: 53, personId: "2", name: "Hamza Qureshi", department: "Mize Technologies/Production", position: "-", gender: "Male", date: "2025-06-22", dayOfWeek: "Sun.", timetable: "(16:00:00-02:00:00)", firstIn: "-", lastOut: "-" },
  { index: 54, personId: "2", name: "Hamza Qureshi", department: "Mize Technologies/Production", position: "-", gender: "Male", date: "2025-06-23", dayOfWeek: "Mon.", timetable: "(16:00:00-02:00:00)", firstIn: "18:01:23", lastOut: "03:00:21" },
  { index: 55, personId: "2", name: "Hamza Qureshi", department: "Mize Technologies/Production", position: "-", gender: "Male", date: "2025-06-24", dayOfWeek: "Tue.", timetable: "(16:00:00-02:00:00)", firstIn: "18:04:32", lastOut: "02:39:56" },
  { index: 56, personId: "2", name: "Hamza Qureshi", department: "Mize Technologies/Production", position: "-", gender: "Male", date: "2025-06-25", dayOfWeek: "Wed.", timetable: "(16:00:00-02:00:00)", firstIn: "18:31:09", lastOut: "03:05:57" },
  { index: 57, personId: "2", name: "Hamza Qureshi", department: "Mize Technologies/Production", position: "-", gender: "Male", date: "2025-06-26", dayOfWeek: "Thu.", timetable: "(16:00:00-02:00:00)", firstIn: "18:39:03", lastOut: "03:14:06" },
  { index: 58, personId: "2", name: "Hamza Qureshi", department: "Mize Technologies/Production", position: "-", gender: "Male", date: "2025-06-27", dayOfWeek: "Fri.", timetable: "(16:00:00-02:00:00)", firstIn: "18:01:17", lastOut: "03:00:12" },
  { index: 59, personId: "2", name: "Hamza Qureshi", department: "Mize Technologies/Production", position: "-", gender: "Male", date: "2025-06-28", dayOfWeek: "Sat.", timetable: "(16:00:00-02:00:00)", firstIn: "20:54:26", lastOut: "00:58:12" },
  { index: 60, personId: "2", name: "Hamza Qureshi", department: "Mize Technologies/Production", position: "-", gender: "Male", date: "2025-06-29", dayOfWeek: "Sun.", timetable: "(16:00:00-02:00:00)", firstIn: "-", lastOut: "-" },
  { index: 61, personId: "2", name: "Hamza Qureshi", department: "Mize Technologies/Production", position: "-", gender: "Male", date: "2025-06-30", dayOfWeek: "Mon.", timetable: "(16:00:00-02:00:00)", firstIn: "18:26:49", lastOut: "03:04:45" },
  { index: 62, personId: "2", name: "Hamza Qureshi", department: "Mize Technologies/Production", position: "-", gender: "Male", date: "2025-07-01", dayOfWeek: "Tue.", timetable: "(16:00:00-02:00:00)", firstIn: "17:31:04", lastOut: "22:17:47" },
  
  // Muhammad Sharique's attendance data
  { index: 63, personId: "6", name: "Muhammad Sharique", department: "Mize Technologies/Production", position: "-", gender: "Male", date: "2025-06-01", dayOfWeek: "Sun.", timetable: "(16:00:00-02:00:00)", firstIn: "-", lastOut: "-" },
  { index: 64, personId: "6", name: "Muhammad Sharique", department: "Mize Technologies/Production", position: "-", gender: "Male", date: "2025-06-02", dayOfWeek: "Mon.", timetable: "(16:00:00-02:00:00)", firstIn: "18:23:02", lastOut: "03:04:30" },
  { index: 65, personId: "6", name: "Muhammad Sharique", department: "Mize Technologies/Production", position: "-", gender: "Male", date: "2025-06-03", dayOfWeek: "Tue.", timetable: "(16:00:00-02:00:00)", firstIn: "18:14:58", lastOut: "02:47:10" },
  { index: 66, personId: "6", name: "Muhammad Sharique", department: "Mize Technologies/Production", position: "-", gender: "Male", date: "2025-06-04", dayOfWeek: "Wed.", timetable: "(16:00:00-02:00:00)", firstIn: "18:27:03", lastOut: "03:12:16" },
  { index: 67, personId: "6", name: "Muhammad Sharique", department: "Mize Technologies/Production", position: "-", gender: "Male", date: "2025-06-05", dayOfWeek: "Thu.", timetable: "(16:00:00-02:00:00)", firstIn: "18:55:18", lastOut: "03:28:45" },
  { index: 68, personId: "6", name: "Muhammad Sharique", department: "Mize Technologies/Production", position: "-", gender: "Male", date: "2025-06-06", dayOfWeek: "Fri.", timetable: "(16:00:00-02:00:00)", firstIn: "16:50:10", lastOut: "21:30:19" },
  { index: 69, personId: "6", name: "Muhammad Sharique", department: "Mize Technologies/Production", position: "-", gender: "Male", date: "2025-06-07", dayOfWeek: "Sat.", timetable: "(16:00:00-02:00:00)", firstIn: "-", lastOut: "-" },
  { index: 70, personId: "6", name: "Muhammad Sharique", department: "Mize Technologies/Production", position: "-", gender: "Male", date: "2025-06-08", dayOfWeek: "Sun.", timetable: "(16:00:00-02:00:00)", firstIn: "-", lastOut: "-" },
  { index: 71, personId: "6", name: "Muhammad Sharique", department: "Mize Technologies/Production", position: "-", gender: "Male", date: "2025-06-09", dayOfWeek: "Mon.", timetable: "(16:00:00-02:00:00)", firstIn: "17:56:09", lastOut: "02:41:51" },
  { index: 72, personId: "6", name: "Muhammad Sharique", department: "Mize Technologies/Production", position: "-", gender: "Male", date: "2025-06-10", dayOfWeek: "Tue.", timetable: "(16:00:00-02:00:00)", firstIn: "18:13:55", lastOut: "02:50:20" },
  { index: 73, personId: "6", name: "Muhammad Sharique", department: "Mize Technologies/Production", position: "-", gender: "Male", date: "2025-06-11", dayOfWeek: "Wed.", timetable: "(16:00:00-02:00:00)", firstIn: "17:48:59", lastOut: "02:29:17" },
  { index: 74, personId: "6", name: "Muhammad Sharique", department: "Mize Technologies/Production", position: "-", gender: "Male", date: "2025-06-12", dayOfWeek: "Thu.", timetable: "(16:00:00-02:00:00)", firstIn: "18:12:42", lastOut: "02:45:20" },
  { index: 75, personId: "6", name: "Muhammad Sharique", department: "Mize Technologies/Production", position: "-", gender: "Male", date: "2025-06-13", dayOfWeek: "Fri.", timetable: "(16:00:00-02:00:00)", firstIn: "17:59:50", lastOut: "02:46:16" },
  { index: 76, personId: "6", name: "Muhammad Sharique", department: "Mize Technologies/Production", position: "-", gender: "Male", date: "2025-06-14", dayOfWeek: "Sat.", timetable: "(16:00:00-02:00:00)", firstIn: "-", lastOut: "-" },
  { index: 77, personId: "6", name: "Muhammad Sharique", department: "Mize Technologies/Production", position: "-", gender: "Male", date: "2025-06-15", dayOfWeek: "Sun.", timetable: "(16:00:00-02:00:00)", firstIn: "-", lastOut: "-" },
  { index: 78, personId: "6", name: "Muhammad Sharique", department: "Mize Technologies/Production", position: "-", gender: "Male", date: "2025-06-16", dayOfWeek: "Mon.", timetable: "(16:00:00-02:00:00)", firstIn: "17:56:59", lastOut: "02:37:35" },
  { index: 79, personId: "6", name: "Muhammad Sharique", department: "Mize Technologies/Production", position: "-", gender: "Male", date: "2025-06-17", dayOfWeek: "Tue.", timetable: "(16:00:00-02:00:00)", firstIn: "18:29:27", lastOut: "03:01:52" },
  { index: 80, personId: "6", name: "Muhammad Sharique", department: "Mize Technologies/Production", position: "-", gender: "Male", date: "2025-06-18", dayOfWeek: "Wed.", timetable: "(16:00:00-02:00:00)", firstIn: "18:10:30", lastOut: "02:47:35" },
  { index: 81, personId: "6", name: "Muhammad Sharique", department: "Mize Technologies/Production", position: "-", gender: "Male", date: "2025-06-19", dayOfWeek: "Thu.", timetable: "(16:00:00-02:00:00)", firstIn: "18:15:55", lastOut: "02:58:43" },
  { index: 82, personId: "6", name: "Muhammad Sharique", department: "Mize Technologies/Production", position: "-", gender: "Male", date: "2025-06-20", dayOfWeek: "Fri.", timetable: "(16:00:00-02:00:00)", firstIn: "17:57:08", lastOut: "02:43:30" },
  { index: 83, personId: "6", name: "Muhammad Sharique", department: "Mize Technologies/Production", position: "-", gender: "Male", date: "2025-06-21", dayOfWeek: "Sat.", timetable: "(16:00:00-02:00:00)", firstIn: "-", lastOut: "-" },
  { index: 84, personId: "6", name: "Muhammad Sharique", department: "Mize Technologies/Production", position: "-", gender: "Male", date: "2025-06-22", dayOfWeek: "Sun.", timetable: "(16:00:00-02:00:00)", firstIn: "-", lastOut: "-" },
  { index: 85, personId: "6", name: "Muhammad Sharique", department: "Mize Technologies/Production", position: "-", gender: "Male", date: "2025-06-23", dayOfWeek: "Mon.", timetable: "(16:00:00-02:00:00)", firstIn: "18:01:16", lastOut: "02:59:30" },
  { index: 86, personId: "6", name: "Muhammad Sharique", department: "Mize Technologies/Production", position: "-", gender: "Male", date: "2025-06-24", dayOfWeek: "Tue.", timetable: "(16:00:00-02:00:00)", firstIn: "20:54:45", lastOut: "02:39:47" },
  { index: 87, personId: "6", name: "Muhammad Sharique", department: "Mize Technologies/Production", position: "-", gender: "Male", date: "2025-06-25", dayOfWeek: "Wed.", timetable: "(16:00:00-02:00:00)", firstIn: "18:30:06", lastOut: "03:03:20" },
  { index: 88, personId: "6", name: "Muhammad Sharique", department: "Mize Technologies/Production", position: "-", gender: "Male", date: "2025-06-26", dayOfWeek: "Thu.", timetable: "(16:00:00-02:00:00)", firstIn: "18:38:59", lastOut: "03:14:09" },
  { index: 89, personId: "6", name: "Muhammad Sharique", department: "Mize Technologies/Production", position: "-", gender: "Male", date: "2025-06-27", dayOfWeek: "Fri.", timetable: "(16:00:00-02:00:00)", firstIn: "18:00:22", lastOut: "03:00:03" },
  { index: 90, personId: "6", name: "Muhammad Sharique", department: "Mize Technologies/Production", position: "-", gender: "Male", date: "2025-06-28", dayOfWeek: "Sat.", timetable: "(16:00:00-02:00:00)", firstIn: "-", lastOut: "-" },
  { index: 91, personId: "6", name: "Muhammad Sharique", department: "Mize Technologies/Production", position: "-", gender: "Male", date: "2025-06-29", dayOfWeek: "Sun.", timetable: "(16:00:00-02:00:00)", firstIn: "-", lastOut: "-" },
  { index: 92, personId: "6", name: "Muhammad Sharique", department: "Mize Technologies/Production", position: "-", gender: "Male", date: "2025-06-30", dayOfWeek: "Mon.", timetable: "(16:00:00-02:00:00)", firstIn: "17:39:28", lastOut: "02:26:12" },
  { index: 93, personId: "6", name: "Muhammad Sharique", department: "Mize Technologies/Production", position: "-", gender: "Male", date: "2025-07-01", dayOfWeek: "Tue.", timetable: "(16:00:00-02:00:00)", firstIn: "18:06:38", lastOut: "23:50:32" },
  
  // Rahat Jawaid's attendance data
  { index: 94, personId: "7", name: "Rahat Jawaid", department: "Mize Technologies/Production", position: "-", gender: "Male", date: "2025-06-01", dayOfWeek: "Sun.", timetable: "(16:00:00-02:00:00)", firstIn: "-", lastOut: "-" },
  { index: 95, personId: "7", name: "Rahat Jawaid", department: "Mize Technologies/Production", position: "-", gender: "Male", date: "2025-06-02", dayOfWeek: "Mon.", timetable: "(16:00:00-02:00:00)", firstIn: "-", lastOut: "-" },
  { index: 96, personId: "7", name: "Rahat Jawaid", department: "Mize Technologies/Production", position: "-", gender: "Male", date: "2025-06-03", dayOfWeek: "Tue.", timetable: "(16:00:00-02:00:00)", firstIn: "22:45:59", lastOut: "03:11:03" },
  { index: 97, personId: "7", name: "Rahat Jawaid", department: "Mize Technologies/Production", position: "-", gender: "Male", date: "2025-06-04", dayOfWeek: "Wed.", timetable: "(16:00:00-02:00:00)", firstIn: "-", lastOut: "-" },
  { index: 98, personId: "7", name: "Rahat Jawaid", department: "Mize Technologies/Production", position: "-", gender: "Male", date: "2025-06-05", dayOfWeek: "Thu.", timetable: "(16:00:00-02:00:00)", firstIn: "21:54:19", lastOut: "03:09:08" },
  { index: 99, personId: "7", name: "Rahat Jawaid", department: "Mize Technologies/Production", position: "-", gender: "Male", date: "2025-06-06", dayOfWeek: "Fri.", timetable: "(16:00:00-02:00:00)", firstIn: "-", lastOut: "-" },
  { index: 100, personId: "7", name: "Rahat Jawaid", department: "Mize Technologies/Production", position: "-", gender: "Male", date: "2025-06-07", dayOfWeek: "Sat.", timetable: "(16:00:00-02:00:00)", firstIn: "-", lastOut: "-" },
  { index: 101, personId: "7", name: "Rahat Jawaid", department: "Mize Technologies/Production", position: "-", gender: "Male", date: "2025-06-08", dayOfWeek: "Sun.", timetable: "(16:00:00-02:00:00)", firstIn: "-", lastOut: "-" },
  { index: 102, personId: "7", name: "Rahat Jawaid", department: "Mize Technologies/Production", position: "-", gender: "Male", date: "2025-06-09", dayOfWeek: "Mon.", timetable: "(16:00:00-02:00:00)", firstIn: "-", lastOut: "-" },
  { index: 103, personId: "7", name: "Rahat Jawaid", department: "Mize Technologies/Production", position: "-", gender: "Male", date: "2025-06-10", dayOfWeek: "Tue.", timetable: "(16:00:00-02:00:00)", firstIn: "-", lastOut: "-" },
  { index: 104, personId: "7", name: "Rahat Jawaid", department: "Mize Technologies/Production", position: "-", gender: "Male", date: "2025-06-11", dayOfWeek: "Wed.", timetable: "(16:00:00-02:00:00)", firstIn: "-", lastOut: "-" },
  { index: 105, personId: "7", name: "Rahat Jawaid", department: "Mize Technologies/Production", position: "-", gender: "Male", date: "2025-06-12", dayOfWeek: "Thu.", timetable: "(16:00:00-02:00:00)", firstIn: "22:04:05", lastOut: "02:46:50" },
  { index: 106, personId: "7", name: "Rahat Jawaid", department: "Mize Technologies/Production", position: "-", gender: "Male", date: "2025-06-13", dayOfWeek: "Fri.", timetable: "(16:00:00-02:00:00)", firstIn: "-", lastOut: "-" },
  { index: 107, personId: "7", name: "Rahat Jawaid", department: "Mize Technologies/Production", position: "-", gender: "Male", date: "2025-06-14", dayOfWeek: "Sat.", timetable: "(16:00:00-02:00:00)", firstIn: "-", lastOut: "-" },
  { index: 108, personId: "7", name: "Rahat Jawaid", department: "Mize Technologies/Production", position: "-", gender: "Male", date: "2025-06-15", dayOfWeek: "Sun.", timetable: "(16:00:00-02:00:00)", firstIn: "-", lastOut: "-" },
  { index: 109, personId: "7", name: "Rahat Jawaid", department: "Mize Technologies/Production", position: "-", gender: "Male", date: "2025-06-16", dayOfWeek: "Mon.", timetable: "(16:00:00-02:00:00)", firstIn: "-", lastOut: "-" },
  { index: 110, personId: "7", name: "Rahat Jawaid", department: "Mize Technologies/Production", position: "-", gender: "Male", date: "2025-06-17", dayOfWeek: "Tue.", timetable: "(16:00:00-02:00:00)", firstIn: "20:53:31", lastOut: "02:10:03" },
  { index: 111, personId: "7", name: "Rahat Jawaid", department: "Mize Technologies/Production", position: "-", gender: "Male", date: "2025-06-18", dayOfWeek: "Wed.", timetable: "(16:00:00-02:00:00)", firstIn: "-", lastOut: "-" },
  { index: 112, personId: "7", name: "Rahat Jawaid", department: "Mize Technologies/Production", position: "-", gender: "Male", date: "2025-06-19", dayOfWeek: "Thu.", timetable: "(16:00:00-02:00:00)", firstIn: "-", lastOut: "-" },
  { index: 113, personId: "7", name: "Rahat Jawaid", department: "Mize Technologies/Production", position: "-", gender: "Male", date: "2025-06-20", dayOfWeek: "Fri.", timetable: "(16:00:00-02:00:00)", firstIn: "23:14:41", lastOut: "03:00:58" },
  { index: 114, personId: "7", name: "Rahat Jawaid", department: "Mize Technologies/Production", position: "-", gender: "Male", date: "2025-06-21", dayOfWeek: "Sat.", timetable: "(16:00:00-02:00:00)", firstIn: "-", lastOut: "-" },
  { index: 115, personId: "7", name: "Rahat Jawaid", department: "Mize Technologies/Production", position: "-", gender: "Male", date: "2025-06-22", dayOfWeek: "Sun.", timetable: "(16:00:00-02:00:00)", firstIn: "-", lastOut: "-" },
  { index: 116, personId: "7", name: "Rahat Jawaid", department: "Mize Technologies/Production", position: "-", gender: "Male", date: "2025-06-23", dayOfWeek: "Mon.", timetable: "(16:00:00-02:00:00)", firstIn: "21:46:12", lastOut: "03:28:12" },
  { index: 117, personId: "7", name: "Rahat Jawaid", department: "Mize Technologies/Production", position: "-", gender: "Male", date: "2025-06-24", dayOfWeek: "Tue.", timetable: "(16:00:00-02:00:00)", firstIn: "-", lastOut: "-" },
  { index: 118, personId: "7", name: "Rahat Jawaid", department: "Mize Technologies/Production", position: "-", gender: "Male", date: "2025-06-25", dayOfWeek: "Wed.", timetable: "(16:00:00-02:00:00)", firstIn: "-", lastOut: "-" },
  { index: 119, personId: "7", name: "Rahat Jawaid", department: "Mize Technologies/Production", position: "-", gender: "Male", date: "2025-06-26", dayOfWeek: "Thu.", timetable: "(16:00:00-02:00:00)", firstIn: "-", lastOut: "-" },
  { index: 120, personId: "7", name: "Rahat Jawaid", department: "Mize Technologies/Production", position: "-", gender: "Male", date: "2025-06-27", dayOfWeek: "Fri.", timetable: "(16:00:00-02:00:00)", firstIn: "21:50:54", lastOut: "23:40:47" },
  { index: 121, personId: "7", name: "Rahat Jawaid", department: "Mize Technologies/Production", position: "-", gender: "Male", date: "2025-06-28", dayOfWeek: "Sat.", timetable: "(16:00:00-02:00:00)", firstIn: "-", lastOut: "-" },
  { index: 122, personId: "7", name: "Rahat Jawaid", department: "Mize Technologies/Production", position: "-", gender: "Male", date: "2025-06-29", dayOfWeek: "Sun.", timetable: "(16:00:00-02:00:00)", firstIn: "-", lastOut: "-" },
  { index: 123, personId: "7", name: "Rahat Jawaid", department: "Mize Technologies/Production", position: "-", gender: "Male", date: "2025-06-30", dayOfWeek: "Mon.", timetable: "(16:00:00-02:00:00)", firstIn: "-", lastOut: "-" },
  { index: 124, personId: "7", name: "Rahat Jawaid", department: "Mize Technologies/Production", position: "-", gender: "Male", date: "2025-07-01", dayOfWeek: "Tue.", timetable: "(16:00:00-02:00:00)", firstIn: "-", lastOut: "-" },
  
  // Zohaib Hussain's attendance data
  { index: 125, personId: "9", name: "Zohaib Hussain", department: "Mize Technologies/Production", position: "-", gender: "Male", date: "2025-06-01", dayOfWeek: "Sun.", timetable: "(16:00:00-02:00:00)", firstIn: "-", lastOut: "-" },
  { index: 126, personId: "9", name: "Zohaib Hussain", department: "Mize Technologies/Production", position: "-", gender: "Male", date: "2025-06-02", dayOfWeek: "Mon.", timetable: "(16:00:00-02:00:00)", firstIn: "17:54:26", lastOut: "22:33:58" },
  { index: 127, personId: "9", name: "Zohaib Hussain", department: "Mize Technologies/Production", position: "-", gender: "Male", date: "2025-06-03", dayOfWeek: "Tue.", timetable: "(16:00:00-02:00:00)", firstIn: "18:12:12", lastOut: "22:49:13" },
  { index: 128, personId: "9", name: "Zohaib Hussain", department: "Mize Technologies/Production", position: "-", gender: "Male", date: "2025-06-04", dayOfWeek: "Wed.", timetable: "(16:00:00-02:00:00)", firstIn: "17:47:34", lastOut: "22:33:56" },
  { index: 129, personId: "9", name: "Zohaib Hussain", department: "Mize Technologies/Production", position: "-", gender: "Male", date: "2025-06-05", dayOfWeek: "Thu.", timetable: "(16:00:00-02:00:00)", firstIn: "17:08:05", lastOut: "21:35:20" },
  { index: 130, personId: "9", name: "Zohaib Hussain", department: "Mize Technologies/Production", position: "-", gender: "Male", date: "2025-06-06", dayOfWeek: "Fri.", timetable: "(16:00:00-02:00:00)", firstIn: "17:36:30", lastOut: "22:11:40" },
  { index: 131, personId: "9", name: "Zohaib Hussain", department: "Mize Technologies/Production", position: "-", gender: "Male", date: "2025-06-07", dayOfWeek: "Sat.", timetable: "(16:00:00-02:00:00)", firstIn: "-", lastOut: "-" },
  { index: 132, personId: "9", name: "Zohaib Hussain", department: "Mize Technologies/Production", position: "-", gender: "Male", date: "2025-06-08", dayOfWeek: "Sun.", timetable: "(16:00:00-02:00:00)", firstIn: "-", lastOut: "-" },
  { index: 133, personId: "9", name: "Zohaib Hussain", department: "Mize Technologies/Production", position: "-", gender: "Male", date: "2025-06-09", dayOfWeek: "Mon.", timetable: "(16:00:00-02:00:00)", firstIn: "16:15:37", lastOut: "21:29:32" },
  { index: 134, personId: "9", name: "Zohaib Hussain", department: "Mize Technologies/Production", position: "-", gender: "Male", date: "2025-06-10", dayOfWeek: "Tue.", timetable: "(16:00:00-02:00:00)", firstIn: "16:41:23", lastOut: "21:16:42" },
  { index: 135, personId: "9", name: "Zohaib Hussain", department: "Mize Technologies/Production", position: "-", gender: "Male", date: "2025-06-11", dayOfWeek: "Wed.", timetable: "(16:00:00-02:00:00)", firstIn: "16:56:17", lastOut: "22:48:50" },
  { index: 136, personId: "9", name: "Zohaib Hussain", department: "Mize Technologies/Production", position: "-", gender: "Male", date: "2025-06-12", dayOfWeek: "Thu.", timetable: "(16:00:00-02:00:00)", firstIn: "16:28:53", lastOut: "21:12:21" },
  { index: 137, personId: "9", name: "Zohaib Hussain", department: "Mize Technologies/Production", position: "-", gender: "Male", date: "2025-06-13", dayOfWeek: "Fri.", timetable: "(16:00:00-02:00:00)", firstIn: "19:40:20", lastOut: "21:00:43" },
  { index: 138, personId: "9", name: "Zohaib Hussain", department: "Mize Technologies/Production", position: "-", gender: "Male", date: "2025-06-14", dayOfWeek: "Sat.", timetable: "(16:00:00-02:00:00)", firstIn: "-", lastOut: "-" },
  { index: 139, personId: "9", name: "Zohaib Hussain", department: "Mize Technologies/Production", position: "-", gender: "Male", date: "2025-06-15", dayOfWeek: "Sun.", timetable: "(16:00:00-02:00:00)", firstIn: "-", lastOut: "-" },
  { index: 140, personId: "9", name: "Zohaib Hussain", department: "Mize Technologies/Production", position: "-", gender: "Male", date: "2025-06-16", dayOfWeek: "Mon.", timetable: "(16:00:00-02:00:00)", firstIn: "15:57:04", lastOut: "20:54:51" },
  { index: 141, personId: "9", name: "Zohaib Hussain", department: "Mize Technologies/Production", position: "-", gender: "Male", date: "2025-06-17", dayOfWeek: "Tue.", timetable: "(16:00:00-02:00:00)", firstIn: "17:21:01", lastOut: "21:00:30" },
  { index: 142, personId: "9", name: "Zohaib Hussain", department: "Mize Technologies/Production", position: "-", gender: "Male", date: "2025-06-18", dayOfWeek: "Wed.", timetable: "(16:00:00-02:00:00)", firstIn: "17:12:10", lastOut: "21:28:23" },
  { index: 143, personId: "9", name: "Zohaib Hussain", department: "Mize Technologies/Production", position: "-", gender: "Male", date: "2025-06-19", dayOfWeek: "Thu.", timetable: "(16:00:00-02:00:00)", firstIn: "16:52:41", lastOut: "21:24:53" },
  { index: 144, personId: "9", name: "Zohaib Hussain", department: "Mize Technologies/Production", position: "-", gender: "Male", date: "2025-06-20", dayOfWeek: "Fri.", timetable: "(16:00:00-02:00:00)", firstIn: "16:53:25", lastOut: "21:23:04" },
  { index: 145, personId: "9", name: "Zohaib Hussain", department: "Mize Technologies/Production", position: "-", gender: "Male", date: "2025-06-21", dayOfWeek: "Sat.", timetable: "(16:00:00-02:00:00)", firstIn: "-", lastOut: "-" },
  { index: 146, personId: "9", name: "Zohaib Hussain", department: "Mize Technologies/Production", position: "-", gender: "Male", date: "2025-06-22", dayOfWeek: "Sun.", timetable: "(16:00:00-02:00:00)", firstIn: "-", lastOut: "-" },
  { index: 147, personId: "9", name: "Zohaib Hussain", department: "Mize Technologies/Production", position: "-", gender: "Male", date: "2025-06-23", dayOfWeek: "Mon.", timetable: "(16:00:00-02:00:00)", firstIn: "16:39:58", lastOut: "21:10:47" },
  { index: 148, personId: "9", name: "Zohaib Hussain", department: "Mize Technologies/Production", position: "-", gender: "Male", date: "2025-06-24", dayOfWeek: "Tue.", timetable: "(16:00:00-02:00:00)", firstIn: "17:12:31", lastOut: "22:15:41" },
  { index: 149, personId: "9", name: "Zohaib Hussain", department: "Mize Technologies/Production", position: "-", gender: "Male", date: "2025-06-25", dayOfWeek: "Wed.", timetable: "(16:00:00-02:00:00)", firstIn: "17:11:41", lastOut: "21:57:29" },
  { index: 150, personId: "9", name: "Zohaib Hussain", department: "Mize Technologies/Production", position: "-", gender: "Male", date: "2025-06-26", dayOfWeek: "Thu.", timetable: "(16:00:00-02:00:00)", firstIn: "16:20:31", lastOut: "20:55:46" },
  { index: 151, personId: "9", name: "Zohaib Hussain", department: "Mize Technologies/Production", position: "-", gender: "Male", date: "2025-06-27", dayOfWeek: "Fri.", timetable: "(16:00:00-02:00:00)", firstIn: "17:07:50", lastOut: "22:25:30" },
  { index: 152, personId: "9", name: "Zohaib Hussain", department: "Mize Technologies/Production", position: "-", gender: "Male", date: "2025-06-28", dayOfWeek: "Sat.", timetable: "(16:00:00-02:00:00)", firstIn: "-", lastOut: "-" },
  { index: 153, personId: "9", name: "Zohaib Hussain", department: "Mize Technologies/Production", position: "-", gender: "Male", date: "2025-06-29", dayOfWeek: "Sun.", timetable: "(16:00:00-02:00:00)", firstIn: "-", lastOut: "-" },
  { index: 154, personId: "9", name: "Zohaib Hussain", department: "Mize Technologies/Production", position: "-", gender: "Male", date: "2025-06-30", dayOfWeek: "Mon.", timetable: "(16:00:00-02:00:00)", firstIn: "16:21:19", lastOut: "21:43:56" },
  { index: 155, personId: "9", name: "Zohaib Hussain", department: "Mize Technologies/Production", position: "-", gender: "Male", date: "2025-07-01", dayOfWeek: "Tue.", timetable: "(16:00:00-02:00:00)", firstIn: "17:15:09", lastOut: "22:12:15" },
  
  // kavish asif's attendance data
  { index: 156, personId: "12", name: "kavish asif", department: "Mize Technologies/Production", position: "-", gender: "Male", date: "2025-06-01", dayOfWeek: "Sun.", timetable: "(16:00:00-02:00:00)", firstIn: "-", lastOut: "-" },
  { index: 157, personId: "12", name: "kavish asif", department: "Mize Technologies/Production", position: "-", gender: "Male", date: "2025-06-02", dayOfWeek: "Mon.", timetable: "(16:00:00-02:00:00)", firstIn: "18:30:09", lastOut: "03:07:35" },
  { index: 158, personId: "12", name: "kavish asif", department: "Mize Technologies/Production", position: "-", gender: "Male", date: "2025-06-03", dayOfWeek: "Tue.", timetable: "(16:00:00-02:00:00)", firstIn: "17:20:22", lastOut: "21:49:52" },
  { index: 159, personId: "12", name: "kavish asif", department: "Mize Technologies/Production", position: "-", gender: "Male", date: "2025-06-04", dayOfWeek: "Wed.", timetable: "(16:00:00-02:00:00)", firstIn: "18:34:37", lastOut: "03:11:13" },
  { index: 160, personId: "12", name: "kavish asif", department: "Mize Technologies/Production", position: "-", gender: "Male", date: "2025-06-05", dayOfWeek: "Thu.", timetable: "(16:00:00-02:00:00)", firstIn: "18:13:41", lastOut: "02:56:53" },
  { index: 161, personId: "12", name: "kavish asif", department: "Mize Technologies/Production", position: "-", gender: "Male", date: "2025-06-06", dayOfWeek: "Fri.", timetable: "(16:00:00-02:00:00)", firstIn: "18:11:01", lastOut: "02:44:13" },
  { index: 162, personId: "12", name: "kavish asif", department: "Mize Technologies/Production", position: "-", gender: "Male", date: "2025-06-07", dayOfWeek: "Sat.", timetable: "(16:00:00-02:00:00)", firstIn: "-", lastOut: "-" },
  { index: 163, personId: "12", name: "kavish asif", department: "Mize Technologies/Production", position: "-", gender: "Male", date: "2025-06-08", dayOfWeek: "Sun.", timetable: "(16:00:00-02:00:00)", firstIn: "-", lastOut: "-" },
  { index: 164, personId: "12", name: "kavish asif", department: "Mize Technologies/Production", position: "-", gender: "Male", date: "2025-06-09", dayOfWeek: "Mon.", timetable: "(16:00:00-02:00:00)", firstIn: "18:34:34", lastOut: "03:10:32" },
  { index: 165, personId: "12", name: "kavish asif", department: "Mize Technologies/Production", position: "-", gender: "Male", date: "2025-06-10", dayOfWeek: "Tue.", timetable: "(16:00:00-02:00:00)", firstIn: "18:09:35", lastOut: "02:46:59" },
  { index: 166, personId: "12", name: "kavish asif", department: "Mize Technologies/Production", position: "-", gender: "Male", date: "2025-06-11", dayOfWeek: "Wed.", timetable: "(16:00:00-02:00:00)", firstIn: "18:05:10", lastOut: "02:45:23" },
  { index: 167, personId: "12", name: "kavish asif", department: "Mize Technologies/Production", position: "-", gender: "Male", date: "2025-06-12", dayOfWeek: "Thu.", timetable: "(16:00:00-02:00:00)", firstIn: "18:14:56", lastOut: "02:54:45" },
  { index: 168, personId: "12", name: "kavish asif", department: "Mize Technologies/Production", position: "-", gender: "Male", date: "2025-06-13", dayOfWeek: "Fri.", timetable: "(16:00:00-02:00:00)", firstIn: "18:10:08", lastOut: "02:57:38" },
  { index: 169, personId: "12", name: "kavish asif", department: "Mize Technologies/Production", position: "-", gender: "Male", date: "2025-06-14", dayOfWeek: "Sat.", timetable: "(16:00:00-02:00:00)", firstIn: "-", lastOut: "-" },
  { index: 170, personId: "12", name: "kavish asif", department: "Mize Technologies/Production", position: "-", gender: "Male", date: "2025-06-15", dayOfWeek: "Sun.", timetable: "(16:00:00-02:00:00)", firstIn: "-", lastOut: "-" },
  { index: 171, personId: "12", name: "kavish asif", department: "Mize Technologies/Production", position: "-", gender: "Male", date: "2025-06-16", dayOfWeek: "Mon.", timetable: "(16:00:00-02:00:00)", firstIn: "18:09:58", lastOut: "02:48:13" },
  { index: 172, personId: "12", name: "kavish asif", department: "Mize Technologies/Production", position: "-", gender: "Male", date: "2025-06-17", dayOfWeek: "Tue.", timetable: "(16:00:00-02:00:00)", firstIn: "17:58:56", lastOut: "02:44:01" },
  { index: 173, personId: "12", name: "kavish asif", department: "Mize Technologies/Production", position: "-", gender: "Male", date: "2025-06-18", dayOfWeek: "Wed.", timetable: "(16:00:00-02:00:00)", firstIn: "18:05:29", lastOut: "02:47:42" },
  { index: 174, personId: "12", name: "kavish asif", department: "Mize Technologies/Production", position: "-", gender: "Male", date: "2025-06-19", dayOfWeek: "Thu.", timetable: "(16:00:00-02:00:00)", firstIn: "18:09:25", lastOut: "02:50:26" },
  { index: 175, personId: "12", name: "kavish asif", department: "Mize Technologies/Production", position: "-", gender: "Male", date: "2025-06-20", dayOfWeek: "Fri.", timetable: "(16:00:00-02:00:00)", firstIn: "18:06:29", lastOut: "02:47:08" },
  { index: 176, personId: "12", name: "kavish asif", department: "Mize Technologies/Production", position: "-", gender: "Male", date: "2025-06-21", dayOfWeek: "Sat.", timetable: "(16:00:00-02:00:00)", firstIn: "-", lastOut: "-" },
  { index: 177, personId: "12", name: "kavish asif", department: "Mize Technologies/Production", position: "-", gender: "Male", date: "2025-06-22", dayOfWeek: "Sun.", timetable: "(16:00:00-02:00:00)", firstIn: "-", lastOut: "-" },
  { index: 178, personId: "12", name: "kavish asif", department: "Mize Technologies/Production", position: "-", gender: "Male", date: "2025-06-23", dayOfWeek: "Mon.", timetable: "(16:00:00-02:00:00)", firstIn: "18:07:20", lastOut: "02:59:48" },
  { index: 179, personId: "12", name: "kavish asif", department: "Mize Technologies/Production", position: "-", gender: "Male", date: "2025-06-24", dayOfWeek: "Tue.", timetable: "(16:00:00-02:00:00)", firstIn: "18:03:37", lastOut: "02:41:51" },
  { index: 180, personId: "12", name: "kavish asif", department: "Mize Technologies/Production", position: "-", gender: "Male", date: "2025-06-25", dayOfWeek: "Wed.", timetable: "(16:00:00-02:00:00)", firstIn: "18:22:28", lastOut: "03:01:30" },
  { index: 181, personId: "12", name: "kavish asif", department: "Mize Technologies/Production", position: "-", gender: "Male", date: "2025-06-26", dayOfWeek: "Thu.", timetable: "(16:00:00-02:00:00)", firstIn: "18:08:02", lastOut: "02:48:34" },
  { index: 182, personId: "12", name: "kavish asif", department: "Mize Technologies/Production", position: "-", gender: "Male", date: "2025-06-27", dayOfWeek: "Fri.", timetable: "(16:00:00-02:00:00)", firstIn: "18:11:12", lastOut: "03:03:50" },
  { index: 183, personId: "12", name: "kavish asif", department: "Mize Technologies/Production", position: "-", gender: "Male", date: "2025-06-28", dayOfWeek: "Sat.", timetable: "(16:00:00-02:00:00)", firstIn: "-", lastOut: "-" },
  { index: 184, personId: "12", name: "kavish asif", department: "Mize Technologies/Production", position: "-", gender: "Male", date: "2025-06-29", dayOfWeek: "Sun.", timetable: "(16:00:00-02:00:00)", firstIn: "-", lastOut: "-" },
  { index: 185, personId: "12", name: "kavish asif", department: "Mize Technologies/Production", position: "-", gender: "Male", date: "2025-06-30", dayOfWeek: "Mon.", timetable: "(16:00:00-02:00:00)", firstIn: "18:30:29", lastOut: "03:07:02" },
  { index: 186, personId: "12", name: "kavish asif", department: "Mize Technologies/Production", position: "-", gender: "Male", date: "2025-07-01", dayOfWeek: "Tue.", timetable: "(16:00:00-02:00:00)", firstIn: "18:00:44", lastOut: "22:18:31" },
  
  // Kamran Shahid's attendance data
  { index: 187, personId: "13", name: "Kamran Shahid", department: "Mize Technologies/Production", position: "-", gender: "Male", date: "2025-06-01", dayOfWeek: "Sun.", timetable: "(16:00:00-02:00:00)", firstIn: "-", lastOut: "-" },
  { index: 188, personId: "13", name: "Kamran Shahid", department: "Mize Technologies/Production", position: "-", gender: "Male", date: "2025-06-02", dayOfWeek: "Mon.", timetable: "(16:00:00-02:00:00)", firstIn: "19:35:17", lastOut: "03:07:31" },
  { index: 189, personId: "13", name: "Kamran Shahid", department: "Mize Technologies/Production", position: "-", gender: "Male", date: "2025-06-03", dayOfWeek: "Tue.", timetable: "(16:00:00-02:00:00)", firstIn: "21:11:54", lastOut: "03:09:56" },
  { index: 190, personId: "13", name: "Kamran Shahid", department: "Mize Technologies/Production", position: "-", gender: "Male", date: "2025-06-04", dayOfWeek: "Wed.", timetable: "(16:00:00-02:00:00)", firstIn: "19:24:37", lastOut: "03:58:24" },
  { index: 191, personId: "13", name: "Kamran Shahid", department: "Mize Technologies/Production", position: "-", gender: "Male", date: "2025-06-05", dayOfWeek: "Thu.", timetable: "(16:00:00-02:00:00)", firstIn: "19:32:21", lastOut: "03:41:46" },
  { index: 192, personId: "13", name: "Kamran Shahid", department: "Mize Technologies/Production", position: "-", gender: "Male", date: "2025-06-06", dayOfWeek: "Fri.", timetable: "(16:00:00-02:00:00)", firstIn: "17:59:29", lastOut: "00:43:30" },
  { index: 193, personId: "13", name: "Kamran Shahid", department: "Mize Technologies/Production", position: "-", gender: "Male", date: "2025-06-07", dayOfWeek: "Sat.", timetable: "(16:00:00-02:00:00)", firstIn: "-", lastOut: "-" },
  { index: 194, personId: "13", name: "Kamran Shahid", department: "Mize Technologies/Production", position: "-", gender: "Male", date: "2025-06-08", dayOfWeek: "Sun.", timetable: "(16:00:00-02:00:00)", firstIn: "-", lastOut: "-" },
  { index: 195, personId: "13", name: "Kamran Shahid", department: "Mize Technologies/Production", position: "-", gender: "Male", date: "2025-06-09", dayOfWeek: "Mon.", timetable: "(16:00:00-02:00:00)", firstIn: "-", lastOut: "-" },
  { index: 196, personId: "13", name: "Kamran Shahid", department: "Mize Technologies/Production", position: "-", gender: "Male", date: "2025-06-10", dayOfWeek: "Tue.", timetable: "(16:00:00-02:00:00)", firstIn: "18:58:29", lastOut: "03:30:37" },
  { index: 197, personId: "13", name: "Kamran Shahid", department: "Mize Technologies/Production", position: "-", gender: "Male", date: "2025-06-11", dayOfWeek: "Wed.", timetable: "(16:00:00-02:00:00)", firstIn: "19:02:19", lastOut: "03:35:35" },
  { index: 198, personId: "13", name: "Kamran Shahid", department: "Mize Technologies/Production", position: "-", gender: "Male", date: "2025-06-12", dayOfWeek: "Thu.", timetable: "(16:00:00-02:00:00)", firstIn: "19:07:19", lastOut: "03:43:16" },
  { index: 199, personId: "13", name: "Kamran Shahid", department: "Mize Technologies/Production", position: "-", gender: "Male", date: "2025-06-13", dayOfWeek: "Fri.", timetable: "(16:00:00-02:00:00)", firstIn: "19:16:51", lastOut: "03:47:38" },
  { index: 200, personId: "13", name: "Kamran Shahid", department: "Mize Technologies/Production", position: "-", gender: "Male", date: "2025-06-14", dayOfWeek: "Sat.", timetable: "(16:00:00-02:00:00)", firstIn: "-", lastOut: "-" },
  { index: 201, personId: "13", name: "Kamran Shahid", department: "Mize Technologies/Production", position: "-", gender: "Male", date: "2025-06-15", dayOfWeek: "Sun.", timetable: "(16:00:00-02:00:00)", firstIn: "-", lastOut: "-" },
  { index: 202, personId: "13", name: "Kamran Shahid", department: "Mize Technologies/Production", position: "-", gender: "Male", date: "2025-06-16", dayOfWeek: "Mon.", timetable: "(16:00:00-02:00:00)", firstIn: "18:42:07", lastOut: "03:14:40" },
  { index: 203, personId: "13", name: "Kamran Shahid", department: "Mize Technologies/Production", position: "-", gender: "Male", date: "2025-06-17", dayOfWeek: "Tue.", timetable: "(16:00:00-02:00:00)", firstIn: "18:26:46", lastOut: "03:01:27" },
  { index: 204, personId: "13", name: "Kamran Shahid", department: "Mize Technologies/Production", position: "-", gender: "Male", date: "2025-06-18", dayOfWeek: "Wed.", timetable: "(16:00:00-02:00:00)", firstIn: "18:30:58", lastOut: "03:03:01" },
  { index: 205, personId: "13", name: "Kamran Shahid", department: "Mize Technologies/Production", position: "-", gender: "Male", date: "2025-06-19", dayOfWeek: "Thu.", timetable: "(16:00:00-02:00:00)", firstIn: "17:51:14", lastOut: "00:46:05" },
  { index: 206, personId: "13", name: "Kamran Shahid", department: "Mize Technologies/Production", position: "-", gender: "Male", date: "2025-06-20", dayOfWeek: "Fri.", timetable: "(16:00:00-02:00:00)", firstIn: "18:18:34", lastOut: "02:58:14" },
  { index: 207, personId: "13", name: "Kamran Shahid", department: "Mize Technologies/Production", position: "-", gender: "Male", date: "2025-06-21", dayOfWeek: "Sat.", timetable: "(16:00:00-02:00:00)", firstIn: "-", lastOut: "-" },
  { index: 208, personId: "13", name: "Kamran Shahid", department: "Mize Technologies/Production", position: "-", gender: "Male", date: "2025-06-22", dayOfWeek: "Sun.", timetable: "(16:00:00-02:00:00)", firstIn: "-", lastOut: "-" },
  { index: 209, personId: "13", name: "Kamran Shahid", department: "Mize Technologies/Production", position: "-", gender: "Male", date: "2025-06-23", dayOfWeek: "Mon.", timetable: "(16:00:00-02:00:00)", firstIn: "18:56:44", lastOut: "03:34:57" },
  { index: 210, personId: "13", name: "Kamran Shahid", department: "Mize Technologies/Production", position: "-", gender: "Male", date: "2025-06-24", dayOfWeek: "Tue.", timetable: "(16:00:00-02:00:00)", firstIn: "18:23:07", lastOut: "03:00:42" },
  { index: 211, personId: "13", name: "Kamran Shahid", department: "Mize Technologies/Production", position: "-", gender: "Male", date: "2025-06-25", dayOfWeek: "Wed.", timetable: "(16:00:00-02:00:00)", firstIn: "18:02:58", lastOut: "02:36:38" },
  { index: 212, personId: "13", name: "Kamran Shahid", department: "Mize Technologies/Production", position: "-", gender: "Male", date: "2025-06-26", dayOfWeek: "Thu.", timetable: "(16:00:00-02:00:00)", firstIn: "18:39:09", lastOut: "03:13:01" },
  { index: 213, personId: "13", name: "Kamran Shahid", department: "Mize Technologies/Production", position: "-", gender: "Male", date: "2025-06-27", dayOfWeek: "Fri.", timetable: "(16:00:00-02:00:00)", firstIn: "19:54:11", lastOut: "03:39:33" },
  { index: 214, personId: "13", name: "Kamran Shahid", department: "Mize Technologies/Production", position: "-", gender: "Male", date: "2025-06-28", dayOfWeek: "Sat.", timetable: "(16:00:00-02:00:00)", firstIn: "-", lastOut: "-" },
  { index: 215, personId: "13", name: "Kamran Shahid", department: "Mize Technologies/Production", position: "-", gender: "Male", date: "2025-06-29", dayOfWeek: "Sun.", timetable: "(16:00:00-02:00:00)", firstIn: "-", lastOut: "-" },
  { index: 216, personId: "13", name: "Kamran Shahid", department: "Mize Technologies/Production", position: "-", gender: "Male", date: "2025-06-30", dayOfWeek: "Mon.", timetable: "(16:00:00-02:00:00)", firstIn: "-", lastOut: "-" },
  { index: 217, personId: "13", name: "Kamran Shahid", department: "Mize Technologies/Production", position: "-", gender: "Male", date: "2025-07-01", dayOfWeek: "Tue.", timetable: "(16:00:00-02:00:00)", firstIn: "17:45:31", lastOut: "17:47:42" },
  
  // MUHAMMAD AZAN's attendance data
  { index: 218, personId: "15", name: "MUHAMMAD AZAN", department: "Mize Technologies/Sales", position: "-", gender: "Male", date: "2025-06-01", dayOfWeek: "Sun.", timetable: "(16:00:00-02:00:00)", firstIn: "-", lastOut: "-" },
  { index: 219, personId: "15", name: "MUHAMMAD AZAN", department: "Mize Technologies/Sales", position: "-", gender: "Male", date: "2025-06-02", dayOfWeek: "Mon.", timetable: "(16:00:00-02:00:00)", firstIn: "16:53:12", lastOut: "01:23:41" },
  { index: 220, personId: "15", name: "MUHAMMAD AZAN", department: "Mize Technologies/Sales", position: "-", gender: "Male", date: "2025-06-03", dayOfWeek: "Tue.", timetable: "(16:00:00-02:00:00)", firstIn: "16:54:14", lastOut: "01:30:11" },
  { index: 221, personId: "15", name: "MUHAMMAD AZAN", department: "Mize Technologies/Sales", position: "-", gender: "Male", date: "2025-06-04", dayOfWeek: "Wed.", timetable: "(16:00:00-02:00:00)", firstIn: "17:07:54", lastOut: "02:28:28" },
  { index: 222, personId: "15", name: "MUHAMMAD AZAN", department: "Mize Technologies/Sales", position: "-", gender: "Male", date: "2025-06-05", dayOfWeek: "Thu.", timetable: "(16:00:00-02:00:00)", firstIn: "16:50:30", lastOut: "01:50:16" },
  { index: 223, personId: "15", name: "MUHAMMAD AZAN", department: "Mize Technologies/Sales", position: "-", gender: "Male", date: "2025-06-06", dayOfWeek: "Fri.", timetable: "(16:00:00-02:00:00)", firstIn: "23:34:02", lastOut: "02:43:39" },
  { index: 224, personId: "15", name: "MUHAMMAD AZAN", department: "Mize Technologies/Sales", position: "-", gender: "Male", date: "2025-06-07", dayOfWeek: "Sat.", timetable: "(16:00:00-02:00:00)", firstIn: "-", lastOut: "-" },
  { index: 225, personId: "15", name: "MUHAMMAD AZAN", department: "Mize Technologies/Sales", position: "-", gender: "Male", date: "2025-06-08", dayOfWeek: "Sun.", timetable: "(16:00:00-02:00:00)", firstIn: "-", lastOut: "-" },
  { index: 226, personId: "15", name: "MUHAMMAD AZAN", department: "Mize Technologies/Sales", position: "-", gender: "Male", date: "2025-06-09", dayOfWeek: "Mon.", timetable: "(16:00:00-02:00:00)", firstIn: "16:58:07", lastOut: "00:01:25" },
  { index: 227, personId: "15", name: "MUHAMMAD AZAN", department: "Mize Technologies/Sales", position: "-", gender: "Male", date: "2025-06-10", dayOfWeek: "Tue.", timetable: "(16:00:00-02:00:00)", firstIn: "17:06:20", lastOut: "01:29:54" },
  { index: 228, personId: "15", name: "MUHAMMAD AZAN", department: "Mize Technologies/Sales", position: "-", gender: "Male", date: "2025-06-11", dayOfWeek: "Wed.", timetable: "(16:00:00-02:00:00)", firstIn: "16:56:48", lastOut: "02:43:00" },
  { index: 229, personId: "15", name: "MUHAMMAD AZAN", department: "Mize Technologies/Sales", position: "-", gender: "Male", date: "2025-06-12", dayOfWeek: "Thu.", timetable: "(16:00:00-02:00:00)", firstIn: "17:08:04", lastOut: "02:00:25" },
  { index: 230, personId: "15", name: "MUHAMMAD AZAN", department: "Mize Technologies/Sales", position: "-", gender: "Male", date: "2025-06-13", dayOfWeek: "Fri.", timetable: "(16:00:00-02:00:00)", firstIn: "17:08:17", lastOut: "02:17:00" },
  { index: 231, personId: "15", name: "MUHAMMAD AZAN", department: "Mize Technologies/Sales", position: "-", gender: "Male", date: "2025-06-14", dayOfWeek: "Sat.", timetable: "(16:00:00-02:00:00)", firstIn: "18:36:32", lastOut: "22:37:12" },
  { index: 232, personId: "15", name: "MUHAMMAD AZAN", department: "Mize Technologies/Sales", position: "-", gender: "Male", date: "2025-06-15", dayOfWeek: "Sun.", timetable: "(16:00:00-02:00:00)", firstIn: "-", lastOut: "-" },
  { index: 233, personId: "15", name: "MUHAMMAD AZAN", department: "Mize Technologies/Sales", position: "-", gender: "Male", date: "2025-06-16", dayOfWeek: "Mon.", timetable: "(16:00:00-02:00:00)", firstIn: "17:02:12", lastOut: "01:51:42" },
  { index: 234, personId: "15", name: "MUHAMMAD AZAN", department: "Mize Technologies/Sales", position: "-", gender: "Male", date: "2025-06-17", dayOfWeek: "Tue.", timetable: "(16:00:00-02:00:00)", firstIn: "17:02:01", lastOut: "01:38:29" },
  { index: 235, personId: "15", name: "MUHAMMAD AZAN", department: "Mize Technologies/Sales", position: "-", gender: "Male", date: "2025-06-18", dayOfWeek: "Wed.", timetable: "(16:00:00-02:00:00)", firstIn: "17:12:14", lastOut: "01:46:32" },
  { index: 236, personId: "15", name: "MUHAMMAD AZAN", department: "Mize Technologies/Sales", position: "-", gender: "Male", date: "2025-06-19", dayOfWeek: "Thu.", timetable: "(16:00:00-02:00:00)", firstIn: "16:59:14", lastOut: "01:45:15" },
  { index: 237, personId: "15", name: "MUHAMMAD AZAN", department: "Mize Technologies/Sales", position: "-", gender: "Male", date: "2025-06-20", dayOfWeek: "Fri.", timetable: "(16:00:00-02:00:00)", firstIn: "17:05:14", lastOut: "02:03:33" },
  { index: 238, personId: "15", name: "MUHAMMAD AZAN", department: "Mize Technologies/Sales", position: "-", gender: "Male", date: "2025-06-21", dayOfWeek: "Sat.", timetable: "(16:00:00-02:00:00)", firstIn: "-", lastOut: "-" },
  { index: 239, personId: "15", name: "MUHAMMAD AZAN", department: "Mize Technologies/Sales", position: "-", gender: "Male", date: "2025-06-22", dayOfWeek: "Sun.", timetable: "(16:00:00-02:00:00)", firstIn: "-", lastOut: "-" },
  { index: 240, personId: "15", name: "MUHAMMAD AZAN", department: "Mize Technologies/Sales", position: "-", gender: "Male", date: "2025-06-23", dayOfWeek: "Mon.", timetable: "(16:00:00-02:00:00)", firstIn: "17:11:40", lastOut: "03:44:37" },
  { index: 241, personId: "15", name: "MUHAMMAD AZAN", department: "Mize Technologies/Sales", position: "-", gender: "Male", date: "2025-06-24", dayOfWeek: "Tue.", timetable: "(16:00:00-02:00:00)", firstIn: "17:12:46", lastOut: "01:57:29" },
  { index: 242, personId: "15", name: "MUHAMMAD AZAN", department: "Mize Technologies/Sales", position: "-", gender: "Male", date: "2025-06-25", dayOfWeek: "Wed.", timetable: "(16:00:00-02:00:00)", firstIn: "17:06:19", lastOut: "02:04:08" },
  { index: 243, personId: "15", name: "MUHAMMAD AZAN", department: "Mize Technologies/Sales", position: "-", gender: "Male", date: "2025-06-26", dayOfWeek: "Thu.", timetable: "(16:00:00-02:00:00)", firstIn: "17:02:44", lastOut: "01:50:23" },
  { index: 244, personId: "15", name: "MUHAMMAD AZAN", department: "Mize Technologies/Sales", position: "-", gender: "Male", date: "2025-06-27", dayOfWeek: "Fri.", timetable: "(16:00:00-02:00:00)", firstIn: "18:00:59", lastOut: "03:04:47" },
  { index: 245, personId: "15", name: "MUHAMMAD AZAN", department: "Mize Technologies/Sales", position: "-", gender: "Male", date: "2025-06-28", dayOfWeek: "Sat.", timetable: "(16:00:00-02:00:00)", firstIn: "-", lastOut: "-" },
  { index: 246, personId: "15", name: "MUHAMMAD AZAN", department: "Mize Technologies/Sales", position: "-", gender: "Male", date: "2025-06-29", dayOfWeek: "Sun.", timetable: "(16:00:00-02:00:00)", firstIn: "-", lastOut: "-" },
  { index: 247, personId: "15", name: "MUHAMMAD AZAN", department: "Mize Technologies/Sales", position: "-", gender: "Male", date: "2025-06-30", dayOfWeek: "Mon.", timetable: "(16:00:00-02:00:00)", firstIn: "17:44:53", lastOut: "01:58:02" },
  { index: 248, personId: "15", name: "MUHAMMAD AZAN", department: "Mize Technologies/Sales", position: "-", gender: "Male", date: "2025-07-01", dayOfWeek: "Tue.", timetable: "(16:00:00-02:00:00)", firstIn: "17:10:55", lastOut: "21:00:53" },
  
  // MUHAMMAD UZAIR's attendance data
  { index: 249, personId: "16", name: "MUHAMMAD UZAIR", department: "Mize Technologies/Sales", position: "-", gender: "Male", date: "2025-06-01", dayOfWeek: "Sun.", timetable: "(16:00:00-02:00:00)", firstIn: "-", lastOut: "-" },
  { index: 250, personId: "16", name: "MUHAMMAD UZAIR", department: "Mize Technologies/Sales", position: "-", gender: "Male", date: "2025-06-02", dayOfWeek: "Mon.", timetable: "(16:00:00-02:00:00)", firstIn: "17:54:32", lastOut: "02:37:44" },
  { index: 251, personId: "16", name: "MUHAMMAD UZAIR", department: "Mize Technologies/Sales", position: "-", gender: "Male", date: "2025-06-03", dayOfWeek: "Tue.", timetable: "(16:00:00-02:00:00)", firstIn: "19:35:28", lastOut: "03:42:07" },
  { index: 252, personId: "16", name: "MUHAMMAD UZAIR", department: "Mize Technologies/Sales", position: "-", gender: "Male", date: "2025-06-04", dayOfWeek: "Wed.", timetable: "(16:00:00-02:00:00)", firstIn: "18:54:10", lastOut: "03:29:39" },
  { index: 253, personId: "16", name: "MUHAMMAD UZAIR", department: "Mize Technologies/Sales", position: "-", gender: "Male", date: "2025-06-05", dayOfWeek: "Thu.", timetable: "(16:00:00-02:00:00)", firstIn: "19:34:32", lastOut: "03:35:44" },
  { index: 254, personId: "16", name: "MUHAMMAD UZAIR", department: "Mize Technologies/Sales", position: "-", gender: "Male", date: "2025-06-06", dayOfWeek: "Fri.", timetable: "(16:00:00-02:00:00)", firstIn: "19:14:02", lastOut: "02:45:52" },
  { index: 255, personId: "16", name: "MUHAMMAD UZAIR", department: "Mize Technologies/Sales", position: "-", gender: "Male", date: "2025-06-07", dayOfWeek: "Sat.", timetable: "(16:00:00-02:00:00)", firstIn: "-", lastOut: "-" },
  { index: 256, personId: "16", name: "MUHAMMAD UZAIR", department: "Mize Technologies/Sales", position: "-", gender: "Male", date: "2025-06-08", dayOfWeek: "Sun.", timetable: "(16:00:00-02:00:00)", firstIn: "-", lastOut: "-" },
  { index: 257, personId: "16", name: "MUHAMMAD UZAIR", department: "Mize Technologies/Sales", position: "-", gender: "Male", date: "2025-06-09", dayOfWeek: "Mon.", timetable: "(16:00:00-02:00:00)", firstIn: "19:11:31", lastOut: "03:51:03" },
  { index: 258, personId: "16", name: "MUHAMMAD UZAIR", department: "Mize Technologies/Sales", position: "-", gender: "Male", date: "2025-06-10", dayOfWeek: "Tue.", timetable: "(16:00:00-02:00:00)", firstIn: "18:36:49", lastOut: "03:52:32" },
  { index: 259, personId: "16", name: "MUHAMMAD UZAIR", department: "Mize Technologies/Sales", position: "-", gender: "Male", date: "2025-06-11", dayOfWeek: "Wed.", timetable: "(16:00:00-02:00:00)", firstIn: "18:09:42", lastOut: "02:43:17" },
  { index: 260, personId: "16", name: "MUHAMMAD UZAIR", department: "Mize Technologies/Sales", position: "-", gender: "Male", date: "2025-06-12", dayOfWeek: "Thu.", timetable: "(16:00:00-02:00:00)", firstIn: "19:35:26", lastOut: "04:08:21" },
  { index: 261, personId: "16", name: "MUHAMMAD UZAIR", department: "Mize Technologies/Sales", position: "-", gender: "Male", date: "2025-06-13", dayOfWeek: "Fri.", timetable: "(16:00:00-02:00:00)", firstIn: "18:35:03", lastOut: "03:44:53" },
  { index: 262, personId: "16", name: "MUHAMMAD UZAIR", department: "Mize Technologies/Sales", position: "-", gender: "Male", date: "2025-06-14", dayOfWeek: "Sat.", timetable: "(16:00:00-02:00:00)", firstIn: "19:24:18", lastOut: "01:37:41" },
  { index: 263, personId: "16", name: "MUHAMMAD UZAIR", department: "Mize Technologies/Sales", position: "-", gender: "Male", date: "2025-06-15", dayOfWeek: "Sun.", timetable: "(16:00:00-02:00:00)", firstIn: "-", lastOut: "-" },
  { index: 264, personId: "16", name: "MUHAMMAD UZAIR", department: "Mize Technologies/Sales", position: "-", gender: "Male", date: "2025-06-16", dayOfWeek: "Mon.", timetable: "(16:00:00-02:00:00)", firstIn: "18:52:46", lastOut: "03:30:22" },
  { index: 265, personId: "16", name: "MUHAMMAD UZAIR", department: "Mize Technologies/Sales", position: "-", gender: "Male", date: "2025-06-17", dayOfWeek: "Tue.", timetable: "(16:00:00-02:00:00)", firstIn: "19:16:09", lastOut: "03:39:08" },
  { index: 266, personId: "16", name: "MUHAMMAD UZAIR", department: "Mize Technologies/Sales", position: "-", gender: "Male", date: "2025-06-18", dayOfWeek: "Wed.", timetable: "(16:00:00-02:00:00)", firstIn: "17:47:23", lastOut: "02:27:09" },
  { index: 267, personId: "16", name: "MUHAMMAD UZAIR", department: "Mize Technologies/Sales", position: "-", gender: "Male", date: "2025-06-19", dayOfWeek: "Thu.", timetable: "(16:00:00-02:00:00)", firstIn: "19:01:43", lastOut: "03:42:16" },
  { index: 268, personId: "16", name: "MUHAMMAD UZAIR", department: "Mize Technologies/Sales", position: "-", gender: "Male", date: "2025-06-20", dayOfWeek: "Fri.", timetable: "(16:00:00-02:00:00)", firstIn: "19:25:28", lastOut: "05:11:19" },
  { index: 269, personId: "16", name: "MUHAMMAD UZAIR", department: "Mize Technologies/Sales", position: "-", gender: "Male", date: "2025-06-21", dayOfWeek: "Sat.", timetable: "(16:00:00-02:00:00)", firstIn: "-", lastOut: "-" },
  { index: 270, personId: "16", name: "MUHAMMAD UZAIR", department: "Mize Technologies/Sales", position: "-", gender: "Male", date: "2025-06-22", dayOfWeek: "Sun.", timetable: "(16:00:00-02:00:00)", firstIn: "-", lastOut: "-" },
  { index: 271, personId: "16", name: "MUHAMMAD UZAIR", department: "Mize Technologies/Sales", position: "-", gender: "Male", date: "2025-06-23", dayOfWeek: "Mon.", timetable: "(16:00:00-02:00:00)", firstIn: "20:11:07", lastOut: "04:54:11" },
  { index: 272, personId: "16", name: "MUHAMMAD UZAIR", department: "Mize Technologies/Sales", position: "-", gender: "Male", date: "2025-06-24", dayOfWeek: "Tue.", timetable: "(16:00:00-02:00:00)", firstIn: "19:38:18", lastOut: "03:03:28" },
  { index: 273, personId: "16", name: "MUHAMMAD UZAIR", department: "Mize Technologies/Sales", position: "-", gender: "Male", date: "2025-06-25", dayOfWeek: "Wed.", timetable: "(16:00:00-02:00:00)", firstIn: "18:30:15", lastOut: "04:05:40" },
  { index: 274, personId: "16", name: "MUHAMMAD UZAIR", department: "Mize Technologies/Sales", position: "-", gender: "Male", date: "2025-06-26", dayOfWeek: "Thu.", timetable: "(16:00:00-02:00:00)", firstIn: "19:59:37", lastOut: "04:00:33" },
  { index: 275, personId: "16", name: "MUHAMMAD UZAIR", department: "Mize Technologies/Sales", position: "-", gender: "Male", date: "2025-06-27", dayOfWeek: "Fri.", timetable: "(16:00:00-02:00:00)", firstIn: "18:37:22", lastOut: "04:53:30" },
  { index: 276, personId: "16", name: "MUHAMMAD UZAIR", department: "Mize Technologies/Sales", position: "-", gender: "Male", date: "2025-06-28", dayOfWeek: "Sat.", timetable: "(16:00:00-02:00:00)", firstIn: "20:34:01", lastOut: "00:58:43" },
  { index: 277, personId: "16", name: "MUHAMMAD UZAIR", department: "Mize Technologies/Sales", position: "-", gender: "Male", date: "2025-06-29", dayOfWeek: "Sun.", timetable: "(16:00:00-02:00:00)", firstIn: "-", lastOut: "-" },
  { index: 278, personId: "16", name: "MUHAMMAD UZAIR", department: "Mize Technologies/Sales", position: "-", gender: "Male", date: "2025-06-30", dayOfWeek: "Mon.", timetable: "(16:00:00-02:00:00)", firstIn: "20:24:09", lastOut: "05:14:18" },
  { index: 279, personId: "16", name: "MUHAMMAD UZAIR", department: "Mize Technologies/Sales", position: "-", gender: "Male", date: "2025-07-01", dayOfWeek: "Tue.", timetable: "(16:00:00-02:00:00)", firstIn: "19:48:53", lastOut: "21:01:13" },
];

interface AttendanceRecord {
  index: number;
  personId: string;
  name: string;
  department: string;
  position: string;
  gender: string;
  date: string;
  dayOfWeek: string;
  timetable: string;
  firstIn: string;
  lastOut: string;
}

// Helper function to check if a value is missing/empty
function isEmpty(value: string): boolean {
  return !value || value === '-' || value.trim() === '';
}

// Helper function to parse time string and create a date
function parseTimeToDate(dateStr: string, timeStr: string): Date | null {
  if (isEmpty(timeStr)) {
    return null;
  }
  
  // Handle next day times (times like 02:42:43 which are past midnight)
  const date = new Date(dateStr);
  const [hours, minutes, seconds] = timeStr.split(':').map(Number);
  
  // If hour is less than 12, it's likely next day (considering night shifts)
  if (hours < 12) {
    date.setDate(date.getDate() + 1);
  }
  
  date.setHours(hours, minutes, seconds || 0, 0);
  return date;
}

// Helper function to calculate total hours
function calculateTotalHours(checkIn: Date | null, checkOut: Date | null): number | null {
  if (!checkIn || !checkOut) {
    return null;
  }
  
  const diffMs = checkOut.getTime() - checkIn.getTime();
  return Math.round((diffMs / (1000 * 60 * 60)) * 100) / 100; // Round to 2 decimal places
}

// Function to find or create user
async function findOrCreateUser(record: AttendanceRecord) {
  // First try to find by name
  const nameParts = record.name.trim().split(/\s+/);
  let user = null;
  
  if (nameParts.length >= 2) {
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(' ');
    
    user = await prisma.user.findFirst({
      where: {
        OR: [
          {
            AND: [
              { firstName: { contains: firstName, mode: 'insensitive' } },
              { lastName: { contains: lastName, mode: 'insensitive' } }
            ]
          },
          {
            OR: [
              { firstName: { equals: record.name, mode: 'insensitive' } },
              { lastName: { equals: record.name, mode: 'insensitive' } },
              { username: { equals: record.name.replace(/\s+/g, '').toLowerCase(), mode: 'insensitive' } }
            ]
          }
        ]
      }
    });
  }
  
  // If user not found, create them
  if (!user) {
    console.log(`Creating new user: ${record.name}`);
    
    const nameParts = record.name.trim().split(/\s+/);
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(' ') || firstName;
    const username = record.name.replace(/\s+/g, '').toLowerCase();
    const email = `${username}@mizetechnologies.com`;
    const defaultPassword = await hash('password123', 12);
    
    // Determine if this is Faizan Farrukh (should be admin)
    const isAdmin = record.name.toUpperCase().includes('FAIZAN') && record.name.toUpperCase().includes('FARRUKH');
    
    try {
      user = await prisma.user.create({
        data: {
          username,
          firstName,
          lastName,
          email,
          cnic: `${record.personId.padStart(5, '0')}-${Math.random().toString().substr(2, 7)}-${Math.floor(Math.random() * 10)}`,
          password: defaultPassword,
          salary: 50000,
          address: 'Default Address',
          department: record.department || 'Mize Technologies',
          position: record.position === '-' ? 'Employee' : record.position,
          joinDate: new Date('2025-01-01'),
          phone: null,
          legacyRole: isAdmin ? 'ADMIN' : 'EMPLOYEE',
          status: 'ACTIVE',
          gender: record.gender.toUpperCase() as any,
        }
      });
      
      if (isAdmin) {
        console.log(`✅ Created admin user: ${record.name}`);
        
        // Also assign admin role in new role system
        const adminRole = await prisma.role.findFirst({
          where: { name: 'Admin' }
        });
        
        if (adminRole) {
          await prisma.userRole.upsert({
            where: {
              userId_roleId: {
                userId: user.id,
                roleId: adminRole.id
              }
            },
            update: {},
            create: {
              userId: user.id,
              roleId: adminRole.id
            }
          });
          console.log(`✅ Assigned Admin role to ${record.name}`);
        }
      }
      
    } catch (error: any) {
      if (error.code === 'P2002') {
        // Unique constraint failed, try to find the user again with different criteria
        user = await prisma.user.findFirst({
          where: {
            OR: [
              { username: { contains: firstName.toLowerCase(), mode: 'insensitive' } },
              { email: { contains: firstName.toLowerCase(), mode: 'insensitive' } },
              { firstName: { equals: firstName, mode: 'insensitive' } }
            ]
          }
        });
        
        if (!user) {
          console.error(`❌ Failed to create user ${record.name}:`, error.message);
          return null;
        }
      } else {
        console.error(`❌ Failed to create user ${record.name}:`, error);
        return null;
      }
    }
  }
  
  return user;
}

// Main function to import attendance data
async function importAttendanceData() {
  console.log('🚀 Starting attendance data import...');
  
  let totalProcessed = 0;
  let totalCreated = 0;
  let totalSkipped = 0;
  let totalErrors = 0;
  
  // Group records by person to process efficiently
  const recordsByPerson = new Map<string, AttendanceRecord[]>();
  
  for (const record of attendanceData) {
    if (!recordsByPerson.has(record.name)) {
      recordsByPerson.set(record.name, []);
    }
    recordsByPerson.get(record.name)!.push(record);
  }
  
  console.log(`📊 Found ${recordsByPerson.size} unique people with ${attendanceData.length} total records`);
  
  // Process each person
  for (const [personName, records] of recordsByPerson) {
    console.log(`\n👤 Processing ${personName} (${records.length} records)...`);
    
    // Find or create user
    const user = await findOrCreateUser(records[0]);
    if (!user) {
      console.log(`❌ Failed to find/create user for ${personName}, skipping all records`);
      totalSkipped += records.length;
      continue;
    }
    
    // Process each attendance record for this user
    for (const record of records) {
      totalProcessed++;
      
      try {
        // Parse date
        const attendanceDate = new Date(record.date);
        attendanceDate.setHours(0, 0, 0, 0);
        
        // Parse times
        const checkInTime = parseTimeToDate(record.date, record.firstIn);
        const checkOutTime = parseTimeToDate(record.date, record.lastOut);
        
        // Skip if no meaningful data
        if (!checkInTime && !checkOutTime) {
          console.log(`⏭️  Skipping ${record.date} for ${personName} - no time data`);
          totalSkipped++;
          continue;
        }
        
        // Calculate total hours
        const totalHours = calculateTotalHours(checkInTime, checkOutTime);
        
        // Check if attendance already exists
        const existingAttendance = await prisma.attendance.findFirst({
          where: {
            userId: user.id,
            date: attendanceDate
          }
        });
        
        if (existingAttendance) {
          console.log(`⏭️  Attendance for ${record.date} already exists for ${personName}`);
          totalSkipped++;
          continue;
        }
        
        // Create attendance record
        await prisma.attendance.create({
          data: {
            userId: user.id,
            date: attendanceDate,
            checkInTime,
            checkOutTime,
            totalHours,
            status: 'PRESENT'
          }
        });
        
        totalCreated++;
        console.log(`✅ Created attendance for ${personName} on ${record.date}${checkInTime ? ` (In: ${record.firstIn})` : ''}${checkOutTime ? ` (Out: ${record.lastOut})` : ''}`);
        
      } catch (error: any) {
        totalErrors++;
        console.error(`❌ Error creating attendance for ${personName} on ${record.date}:`, error.message);
      }
    }
  }
  
  console.log('\n📈 Import Summary:');
  console.log(`📊 Total processed: ${totalProcessed}`);
  console.log(`✅ Total created: ${totalCreated}`);
  console.log(`⏭️  Total skipped: ${totalSkipped}`);
  console.log(`❌ Total errors: ${totalErrors}`);
  
  // Verify Faizan Farrukh is admin
  const faizanUser = await prisma.user.findFirst({
    where: {
      OR: [
        { firstName: { contains: 'FAIZAN', mode: 'insensitive' } },
        { lastName: { contains: 'FARRUKH', mode: 'insensitive' } }
      ]
    },
    include: {
      userRoles: {
        include: {
          role: true
        }
      }
    }
  });
  
  if (faizanUser) {
    const isLegacyAdmin = faizanUser.legacyRole === 'ADMIN';
    const hasAdminRole = faizanUser.userRoles.some((ur: any) => ur.role.name === 'Admin');
    
    console.log('\n👑 Admin Status Check:');
    console.log(`User: ${faizanUser.firstName} ${faizanUser.lastName}`);
    console.log(`Legacy Role: ${faizanUser.legacyRole}`);
    console.log(`Has Admin Role: ${hasAdminRole}`);
    console.log(`Is Admin: ${isLegacyAdmin || hasAdminRole ? '✅ YES' : '❌ NO'}`);
  } else {
    console.log('\n⚠️  Faizan Farrukh user not found!');
  }
}

// Run the import
importAttendanceData()
  .catch((error) => {
    console.error('💥 Import failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    console.log('\n🔌 Database connection closed');
  }); 