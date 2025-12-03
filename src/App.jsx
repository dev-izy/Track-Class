import React, { useState } from 'react';
import { Search, Home, Users, Calendar, FileText, BarChart3, Plus, Edit2, Trash2, Award } from 'lucide-react';

export default function StudentManagementSystem() {
  const [activeTab, setActiveTab] = useState('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [students, setStudents] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    class: '',
    email: '',
    phone: ''
  });

  const [attendance, setAttendance] = useState([]);
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);
  const [todayDate] = useState(new Date().toISOString().split('T')[0]);

  const [exams, setExams] = useState([]);
  const [showRecordExamModal, setShowRecordExamModal] = useState(false);
  const [examFormData, setExamFormData] = useState({
    studentId: '',
    studentName: '',
    examName: '',
    subject: '',
    date: '',
    score: '',
    maxScore: '',
    grade: '',
    notes: ''
  });

  // Get unique classes for filtering
  const uniqueClasses = [...new Set(students.map(student => student.class))];

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.class.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddStudent = () => {
    if (formData.name && formData.class && formData.email && formData.phone) {
      const newStudent = {
        id: Date.now(),
        ...formData
      };
      setStudents([...students, newStudent]);
      setFormData({ name: '', class: '', email: '', phone: '' });
      setShowAddModal(false);
    }
  };

  const handleEditStudent = () => {
    if (formData.name && formData.class && formData.email && formData.phone) {
      setStudents(students.map(student => 
        student.id === editingStudent.id ? { ...student, ...formData } : student
      ));
      setFormData({ name: '', class: '', email: '', phone: '' });
      setEditingStudent(null);
      setShowEditModal(false);
    }
  };

  const handleDeleteStudent = (id) => {
    if (confirm('Are you sure you want to delete this student?')) {
      setStudents(students.filter(student => student.id !== id));
      setExams(exams.filter(exam => exam.studentId !== id));
    }
  };

  const openEditModal = (student) => {
    setEditingStudent(student);
    setFormData({
      name: student.name,
      class: student.class,
      email: student.email,
      phone: student.phone
    });
    setShowEditModal(true);
  };

  const closeModals = () => {
    setShowAddModal(false);
    setShowEditModal(false);
    setShowAttendanceModal(false);
    setShowRecordExamModal(false); // Fixed: Changed from setShowExamModal to setShowRecordExamModal
    setEditingStudent(null);
    setFormData({ name: '', class: '', email: '', phone: '' });
    setExamFormData({
      studentId: '',
      studentName: '',
      examName: '',
      subject: '',
      date: '',
      score: '',
      maxScore: '',
      grade: '',
      notes: ''
    });
  };

  const markAttendance = (studentId, status) => {
    const student = students.find(s => s.id === studentId);
    const existingRecord = attendance.find(
      a => a.studentId === studentId && a.date === todayDate
    );

    if (existingRecord) {
      setAttendance(attendance.map(a => 
        a.studentId === studentId && a.date === todayDate
          ? { ...a, status }
          : a
      ));
    } else {
      const newRecord = {
        id: Date.now(),
        studentId: student.id,
        name: student.name,
        class: student.class,
        date: todayDate,
        status
      };
      setAttendance([...attendance, newRecord]);
    }
  };

  const getTodayAttendance = (studentId) => {
    const record = attendance.find(
      a => a.studentId === studentId && a.date === todayDate
    );
    return record?.status || null;
  };

  // Record Exam Functions
  const openRecordExamModal = (student = null) => {
    if (student) {
      setExamFormData({
        ...examFormData,
        studentId: student.id,
        studentName: student.name,
        date: todayDate
      });
    } else {
      setExamFormData({
        ...examFormData,
        date: todayDate
      });
    }
    setShowRecordExamModal(true);
  };

  const calculateGrade = (score, maxScore) => {
    if (!score || !maxScore || maxScore === 0) return '';
    const percentage = (parseFloat(score) / parseFloat(maxScore)) * 100;
    
    if (percentage >= 90) return 'A';
    if (percentage >= 80) return 'B';
    if (percentage >= 70) return 'C';
    if (percentage >= 60) return 'D';
    return 'F';
  };

  const handleRecordExam = () => {
    if (examFormData.studentId && examFormData.examName && examFormData.subject && examFormData.score && examFormData.maxScore) {
      const grade = calculateGrade(examFormData.score, examFormData.maxScore);
      const newExam = {
        id: Date.now(),
        ...examFormData,
        grade,
        percentage: examFormData.maxScore ? Math.round((parseFloat(examFormData.score) / parseFloat(examFormData.maxScore)) * 100) : 0
      };
      setExams([...exams, newExam]);
      setExamFormData({
        studentId: '',
        studentName: '',
        examName: '',
        subject: '',
        date: '',
        score: '',
        maxScore: '',
        grade: '',
        notes: ''
      });
      setShowRecordExamModal(false);
    }
  };

  const handleDeleteExam = (id) => {
    if (confirm('Are you sure you want to delete this exam result?')) {
      setExams(exams.filter(exam => exam.id !== id));
    }
  };

  // Get exams for a specific student
  const getStudentExams = (studentId) => {
    return exams.filter(exam => exam.studentId === studentId);
  };

  // Get average score for a student
  const getStudentAverage = (studentId) => {
    const studentExams = getStudentExams(studentId);
    if (studentExams.length === 0) return 0;
    
    const totalPercentage = studentExams.reduce((sum, exam) => sum + exam.percentage, 0);
    return Math.round(totalPercentage / studentExams.length);
  };

  const navItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'students', label: 'Students', icon: Users },
    { id: 'attendance', label: 'Attendance', icon: Calendar },
    { id: 'exams', label: 'Test/Exams', icon: FileText },
    { id: 'report', label: 'Report', icon: BarChart3 },
  ];

  // Update Home dashboard to show exam stats
  const renderHome = () => {
    const totalExams = exams.length;
    const averageScoreAll = students.length > 0 && totalExams > 0
      ? Math.round(exams.reduce((sum, exam) => sum + exam.percentage, 0) / totalExams)
      : 0;
    const topStudents = [...students]
      .map(student => ({
        ...student,
        average: getStudentAverage(student.id)
      }))
      .sort((a, b) => b.average - a.average)
      .slice(0, 3);

    return (
      <div className="space-y-6">
        <h2 className="text-3xl font-bold text-purple-900">Dashboard Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-600">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Students</p>
                <p className="text-3xl font-bold text-purple-900">{students.length}</p>
              </div>
              <Users className="w-12 h-12 text-purple-600" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Present Today</p>
                <p className="text-3xl font-bold text-purple-900">
                  {attendance.filter(a => a.status === 'Present').length}
                </p>
              </div>
              <Calendar className="w-12 h-12 text-purple-500" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-400">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Exams Recorded</p>
                <p className="text-3xl font-bold text-purple-900">{totalExams}</p>
              </div>
              <FileText className="w-12 h-12 text-purple-400" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Average Score</p>
                <p className="text-3xl font-bold text-purple-900">{averageScoreAll}%</p>
              </div>
              <Award className="w-12 h-12 text-purple-700" />
            </div>
          </div>
        </div>

        {/* Top Performers */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold text-purple-900 mb-4">Top Performers</h3>
            {topStudents.filter(s => s.average > 0).length === 0 ? (
              <p className="text-gray-500 text-center py-4">No exam results recorded yet</p>
            ) : (
              <div className="space-y-4">
                {topStudents.map((student, index) => (
                  <div key={student.id} className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 flex items-center justify-center rounded-full ${
                        index === 0 ? 'bg-yellow-100 text-yellow-800' :
                        index === 1 ? 'bg-gray-100 text-gray-800' :
                        'bg-orange-100 text-orange-800'
                      }`}>
                        <span className="font-bold">{index + 1}</span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{student.name}</p>
                        <p className="text-sm text-gray-600">Class {student.class}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-purple-700">{student.average}%</p>
                      <p className="text-xs text-gray-500">Average Score</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderStudents = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-purple-900">Students</h2>
        <button 
          onClick={() => setShowAddModal(true)}
          className="bg-purple-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-purple-700 transition"
        >
          <Plus className="w-5 h-5" />
          Add Student
        </button>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search students by name, class, or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
          />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {filteredStudents.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No students found</p>
            <p className="text-gray-400 text-sm mt-2">
              {students.length === 0 ? 'Click "Add Student" to get started' : 'Try adjusting your search'}
            </p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-purple-600 text-white">
              <tr>
                <th className="px-6 py-3 text-left">Name</th>
                <th className="px-6 py-3 text-left">Class</th>
                <th className="px-6 py-3 text-left">Email</th>
                <th className="px-6 py-3 text-left">Phone</th>
                <th className="px-6 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map((student, index) => (
                <tr key={student.id} className={index % 2 === 0 ? 'bg-purple-50' : 'bg-white'}>
                  <td className="px-6 py-4 text-gray-900">{student.name}</td>
                  <td className="px-6 py-4 text-gray-700">{student.class}</td>
                  <td className="px-6 py-4 text-gray-700">{student.email}</td>
                  <td className="px-6 py-4 text-gray-700">{student.phone}</td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button 
                        onClick={() => openEditModal(student)}
                        className="text-purple-600 hover:text-purple-800"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDeleteStudent(student.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );

  const renderAttendance = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-purple-900">Attendance</h2>
        <button 
          onClick={() => setShowAttendanceModal(true)}
          className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition"
        >
          Mark Attendance
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {attendance.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No attendance records yet</p>
            <p className="text-gray-400 text-sm mt-2">Start marking attendance to see records here</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-purple-600 text-white">
              <tr>
                <th className="px-6 py-3 text-left">Student Name</th>
                <th className="px-6 py-3 text-left">Class</th>
                <th className="px-6 py-3 text-left">Date</th>
                <th className="px-6 py-3 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {attendance.map((record, index) => (
                <tr key={record.id} className={index % 2 === 0 ? 'bg-purple-50' : 'bg-white'}>
                  <td className="px-6 py-4 text-gray-900">{record.name}</td>
                  <td className="px-6 py-4 text-gray-700">{record.class}</td>
                  <td className="px-6 py-4 text-gray-700">{record.date}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      record.status === 'Present' ? 'bg-green-100 text-green-800' :
                      record.status === 'Absent' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {record.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );

  // Updated renderExams function
  const renderExams = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-purple-900">Tests & Exams</h2>
        <button 
          onClick={() => openRecordExamModal()}
          className="bg-purple-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-purple-700 transition"
        >
          <Plus className="w-5 h-5" />
          Record Test/Exam
        </button>
      </div>

      {/* Filter Options */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-gray-700 mb-2">Filter by Class</label>
            <select 
              className="w-full px-4 py-2 border border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
              onChange={(e) => {
                if (e.target.value) {
                  setSearchQuery(e.target.value);
                }
              }}
            >
              <option value="">All Classes</option>
              {uniqueClasses.map(cls => (
                <option key={cls} value={cls}>{cls}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-gray-700 mb-2">Filter by Subject</label>
            <select 
              className="w-full px-4 py-2 border border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
            >
              <option value="">All Subjects</option>
              <option value="Mathematics">Mathematics</option>
              <option value="Science">Science</option>
              <option value="English">English</option>
              <option value="History">History</option>
              <option value="Physics">Physics</option>
              <option value="Chemistry">Chemistry</option>
            </select>
          </div>
          <div>
            <label className="block text-gray-700 mb-2">Search Student</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search students..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Students List with Exam Results */}
      <div className="space-y-6">
        {students.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No students found</p>
            <p className="text-gray-400 text-sm mt-2">Add students first to record exam results</p>
          </div>
        ) : (
          filteredStudents.map((student) => {
            const studentExams = getStudentExams(student.id);
            const averageScore = getStudentAverage(student.id);
            
            return (
              <div key={student.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                {/* Student Header */}
                <div className="bg-purple-50 p-4 border-b border-purple-100">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-xl font-semibold text-purple-900">{student.name}</h3>
                      <p className="text-gray-600">Class: {student.class} | Email: {student.email}</p>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => openRecordExamModal(student)}
                        className="bg-purple-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-purple-700 transition text-sm"
                      >
                        <Plus className="w-4 h-4" />
                        Add Exam Result
                      </button>
                      <div className="bg-white border border-purple-200 rounded-lg px-4 py-2">
                        <p className="text-sm text-gray-600">Average Score</p>
                        <p className="text-lg font-bold text-purple-700">{averageScore}%</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Exam Results Table */}
                <div className="p-4">
                  {studentExams.length === 0 ? (
                    <div className="text-center py-8">
                      <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">No exam results recorded for {student.name}</p>
                      <button 
                        onClick={() => openRecordExamModal(student)}
                        className="mt-4 text-purple-600 hover:text-purple-800 font-medium"
                      >
                        + Record first exam result
                      </button>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-3 text-left text-gray-700">Exam Name</th>
                            <th className="px-4 py-3 text-left text-gray-700">Subject</th>
                            <th className="px-4 py-3 text-left text-gray-700">Date</th>
                            <th className="px-4 py-3 text-left text-gray-700">Score</th>
                            <th className="px-4 py-3 text-left text-gray-700">Grade</th>
                            <th className="px-4 py-3 text-left text-gray-700">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {studentExams.map((exam) => (
                            <tr key={exam.id} className="border-b border-gray-100 hover:bg-purple-50">
                              <td className="px-4 py-3">
                                <div>
                                  <p className="font-medium text-gray-900">{exam.examName}</p>
                                  {exam.notes && (
                                    <p className="text-xs text-gray-500 mt-1">{exam.notes}</p>
                                  )}
                                </div>
                              </td>
                              <td className="px-4 py-3 text-gray-700">{exam.subject}</td>
                              <td className="px-4 py-3 text-gray-700">{exam.date}</td>
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-purple-700">
                                    {exam.score}/{exam.maxScore}
                                  </span>
                                  <span className="text-sm text-gray-600">
                                    ({exam.percentage}%)
                                  </span>
                                </div>
                              </td>
                              <td className="px-4 py-3">
                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                  exam.grade === 'A' ? 'bg-green-100 text-green-800' :
                                  exam.grade === 'B' ? 'bg-blue-100 text-blue-800' :
                                  exam.grade === 'C' ? 'bg-yellow-100 text-yellow-800' :
                                  exam.grade === 'D' ? 'bg-orange-100 text-orange-800' :
                                  'bg-red-100 text-red-800'
                                }`}>
                                  {exam.grade}
                                </span>
                              </td>
                              <td className="px-4 py-3">
                                <button 
                                  onClick={() => handleDeleteExam(exam.id)}
                                  className="text-red-600 hover:text-red-800"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );

  const renderReport = () => (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-purple-900">Reports</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition cursor-pointer">
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-purple-100 p-3 rounded-lg">
              <Users className="w-8 h-8 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold text-purple-900">Student Report</h3>
          </div>
          <p className="text-gray-600">View detailed student performance and records</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition cursor-pointer">
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-purple-100 p-3 rounded-lg">
              <Calendar className="w-8 h-8 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold text-purple-900">Attendance Report</h3>
          </div>
          <p className="text-gray-600">Generate attendance statistics and trends</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition cursor-pointer">
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-purple-100 p-3 rounded-lg">
              <FileText className="w-8 h-8 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold text-purple-900">Exam Report</h3>
          </div>
          <p className="text-gray-600">View exam results and analysis</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-semibold text-purple-900 mb-4">Generate Custom Report</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-700 mb-2">Report Type</label>
            <select className="w-full px-4 py-2 border border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600">
              <option>Student Performance</option>
              <option>Attendance Summary</option>
              <option>Exam Results</option>
              <option>Class Overview</option>
            </select>
          </div>
          <div>
            <label className="block text-gray-700 mb-2">Date Range</label>
            <select className="w-full px-4 py-2 border border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600">
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
              <option>Last Quarter</option>
              <option>Custom Range</option>
            </select>
          </div>
        </div>
        <button className="mt-4 bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition">
          Generate Report
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-white">
      {/* Navbar */}
      <nav className="bg-purple-600 shadow-lg">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-white text-2xl font-bold">Track Class</h1>
            </div>
            <div className="flex space-x-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
                      activeTab === item.id
                        ? 'bg-white text-purple-600'
                        : 'text-white hover:bg-purple-700'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {activeTab === 'home' && renderHome()}
        {activeTab === 'students' && renderStudents()}
        {activeTab === 'attendance' && renderAttendance()}
        {activeTab === 'exams' && renderExams()}
        {activeTab === 'report' && renderReport()}
      </main>

      {/* Add Student Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold text-purple-900 mb-6">Add New Student</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-gray-700 mb-2">Full Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-4 py-2 border border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                  placeholder="Enter student name"
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-2">Class</label>
                <input
                  type="text"
                  value={formData.class}
                  onChange={(e) => setFormData({...formData, class: e.target.value})}
                  className="w-full px-4 py-2 border border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                  placeholder="e.g., 10A"
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full px-4 py-2 border border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                  placeholder="student@school.com"
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-2">Phone</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="w-full px-4 py-2 border border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                  placeholder="123-456-7890"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={closeModals}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleAddStudent}
                className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
              >
                Add Student
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Student Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold text-purple-900 mb-6">Edit Student</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-gray-700 mb-2">Full Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-4 py-2 border border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                  placeholder="Enter student name"
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-2">Class</label>
                <input
                  type="text"
                  value={formData.class}
                  onChange={(e) => setFormData({...formData, class: e.target.value})}
                  className="w-full px-4 py-2 border border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                  placeholder="e.g., 10A"
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full px-4 py-2 border border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                  placeholder="student@school.com"
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-2">Phone</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="w-full px-4 py-2 border border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                  placeholder="123-456-7890"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={closeModals}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleEditStudent}
                className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Record Exam Modal */}
      {showRecordExamModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-purple-900 mb-6">Record Test/Exam Result</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-gray-700 mb-2">Student</label>
                <select
                  value={examFormData.studentId}
                  onChange={(e) => {
                    const selectedStudent = students.find(s => s.id === parseInt(e.target.value));
                    setExamFormData({
                      ...examFormData,
                      studentId: e.target.value,
                      studentName: selectedStudent ? selectedStudent.name : ''
                    });
                  }}
                  className="w-full px-4 py-2 border border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                  required
                >
                  <option value="">Select Student</option>
                  {students.map(student => (
                    <option key={student.id} value={student.id}>
                      {student.name} - Class {student.class}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 mb-2">Exam Name</label>
                  <input
                    type="text"
                    value={examFormData.examName}
                    onChange={(e) => setExamFormData({...examFormData, examName: e.target.value})}
                    className="w-full px-4 py-2 border border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                    placeholder="e.g., Mid-Term, Final"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-700 mb-2">Subject</label>
                  <select
                    value={examFormData.subject}
                    onChange={(e) => setExamFormData({...examFormData, subject: e.target.value})}
                    className="w-full px-4 py-2 border border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                    required
                  >
                    <option value="">Select Subject</option>
                    <option value="Mathematics">Mathematics</option>
                    <option value="Science">Science</option>
                    <option value="English">English</option>
                    <option value="History">History</option>
                    <option value="Physics">Physics</option>
                    <option value="Chemistry">Chemistry</option>
                    <option value="Biology">Biology</option>
                    <option value="Geography">Geography</option>
                    <option value="Computer Science">Computer Science</option>
                    <option value="Art">Art</option>
                    <option value="Music">Music</option>
                    <option value="Physical Education">Physical Education</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-gray-700 mb-2">Date</label>
                <input
                  type="date"
                  value={examFormData.date}
                  onChange={(e) => setExamFormData({...examFormData, date: e.target.value})}
                  className="w-full px-4 py-2 border border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 mb-2">Score Obtained</label>
                  <input
                    type="number"
                    value={examFormData.score}
                    onChange={(e) => {
                      const score = e.target.value;
                      setExamFormData({...examFormData, score});
                      // Auto-calculate grade if max score is set
                      if (examFormData.maxScore) {
                        const grade = calculateGrade(score, examFormData.maxScore);
                        setExamFormData(prev => ({...prev, grade}));
                      }
                    }}
                    className="w-full px-4 py-2 border border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                    placeholder="e.g., 85"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-700 mb-2">Maximum Score</label>
                  <input
                    type="number"
                    value={examFormData.maxScore}
                    onChange={(e) => {
                      const maxScore = e.target.value;
                      setExamFormData({...examFormData, maxScore});
                      // Auto-calculate grade if score is set
                      if (examFormData.score) {
                        const grade = calculateGrade(examFormData.score, maxScore);
                        setExamFormData(prev => ({...prev, grade}));
                      }
                    }}
                    className="w-full px-4 py-2 border border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                    placeholder="e.g., 100"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-700 mb-2">Grade</label>
                <input
                  type="text"
                  value={examFormData.grade}
                  readOnly
                  className="w-full px-4 py-2 border border-purple-200 rounded-lg bg-gray-50"
                  placeholder="Auto-calculated"
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-2">Notes (Optional)</label>
                <textarea
                  value={examFormData.notes}
                  onChange={(e) => setExamFormData({...examFormData, notes: e.target.value})}
                  className="w-full px-4 py-2 border border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                  placeholder="Add any additional notes or comments"
                  rows="3"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={closeModals}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleRecordExam}
                className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
              >
                Record Result
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mark Attendance Modal */}
      {showAttendanceModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold text-purple-900">Mark Attendance</h2>
                <p className="text-gray-600 text-sm mt-1">Date: {todayDate}</p>
              </div>
              <button
                onClick={closeModals}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {students.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">No students available</p>
                <p className="text-gray-400 text-sm mt-2">Add students first to mark attendance</p>
              </div>
            ) : (
              <div className="space-y-3">
                {students.map((student) => {
                  const currentStatus = getTodayAttendance(student.id);
                  return (
                    <div key={student.id} className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
                      <div>
                        <p className="font-semibold text-gray-900">{student.name}</p>
                        <p className="text-sm text-gray-600">Class: {student.class}</p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => markAttendance(student.id, 'Present')}
                          className={`px-4 py-2 rounded-lg font-medium transition ${
                            currentStatus === 'Present'
                              ? 'bg-green-600 text-white'
                              : 'bg-white text-green-600 border border-green-600 hover:bg-green-50'
                          }`}
                        >
                          Present
                        </button>
                        <button
                          onClick={() => markAttendance(student.id, 'Absent')}
                          className={`px-4 py-2 rounded-lg font-medium transition ${
                            currentStatus === 'Absent'
                              ? 'bg-red-600 text-white'
                              : 'bg-white text-red-600 border border-red-600 hover:bg-red-50'
                          }`}
                        >
                          Absent
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            
            <div className="mt-6">
              <button
                onClick={closeModals}
                className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}