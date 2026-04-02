import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../../services/APIservice';
import InterventionView from './InterventionView';

const InstructorDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('My Courses');
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Section States
  const [viewMode, setViewMode] = useState('courses'); 
  const [sections, setSections] = useState([]);
  const [showSectionModal, setShowSectionModal] = useState(false);
  const [showEditSectionModal, setShowEditSectionModal] = useState(false);
  const [showDeleteSectionModal, setShowDeleteSectionModal] = useState(false);
  const [showSectionCodeModal, setShowSectionCodeModal] = useState(false); 
  const [selectedSection, setSelectedSection] = useState(null); 
  
  // Student List States
  const [students, setStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [newSection, setNewSection] = useState({ 
    section_name: '', 
    school_year: '2025-2026', 
    semester: '1st Semester' 
  });

  // Modals & States
  
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [newCourseName, setNewCourseName] = useState('');
  const dropdownRef = useRef(null);
const handleEditCourse = (course) => {
    setEditCourseData({
        id: course.id || course.course_id, // LOGIC: Ito ang pinaka-importante!
        course_name: course.course_name || '',
        course_code: course.course_code || '',
        description: course.description || ''
    });
    setShowEditModal(true);
};
// Para sa Section Edit Button
const handleEditSection = (section) => {
    // Siguraduhin na ang 'id' o 'section_id' ay nase-set nang tama
    const sId = section.id || section.section_id;
    
    setNewSection({
        id: sId,  
        section_name: section.section_name || '',
        school_year: section.school_year || '2025-2026',
        semester: section.semester || '1st Semester'
    });
    setShowEditSectionModal(true);
};
 // --- CLEAN STATE DECLARATIONS ---
  const [showPending, setShowPending] = useState(false);
  const [pendingStudents, setPendingStudents] = useState([]);
  
  // Para sa paggawa ng bagong Course
  const [newCourse, setNewCourse] = useState({ 
    course_name: '', 
    description: '', 
    course_code: '', 
    school_year: '2025-2026', 
    semester: '1st Semester' 
  });

  // Para sa pag-edit ng existing Course (Dito nagkaka-ReferenceError dati)
  const [editCourseData, setEditCourseData] = useState({ 
    id: '', 
    course_name: '', 
    description: '', 
    course_code: '', 
    school_year: '', 
    semester: '' 
  });

  const [dashboardStats, setDashboardStats] = useState({
  pendingAlerts: 0,
  resolved: 0,
  totalStudents: 0,
  speakingPending: 0
});

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchCourses = async () => {
  const token = localStorage.getItem('token');
  try {
    const res = await authAPI.getMyCourses(token);
    if (res.ok) {
      const data = await res.json();
      setCourses(Array.isArray(data) ? data : (data.courses || []));
    }
  } catch (err) {
    console.error("Error fetching courses:", err);
  }
};

const fetchStudents = async (courseId, sectionId) => {
    setLoading(true);
    const token = localStorage.getItem('token');
    try {
        const res = await authAPI.getStudentsBySection(courseId, sectionId, token);
        if (res.ok) {
            const data = await res.json();
            
            // I-filter ang listahan para tanging approved students lang ang lalabas sa main table.
            // Baka ang backend mo ay nagbabalik na ng filtered list, pero maganda ring may safety check dito.
            const enrolledStudents = data.students?.filter(s => s.status === 'enrolled' || s.status === 'approved') || [];
            
            setStudents(enrolledStudents); // I-set ang main table data
        }
    } catch (err) {
        console.error("Error fetching students:", err);
    } finally {
        setLoading(false);
    }
};

  // Function Fix
const handleConfirmCreate = async () => {
    if (!newCourse.title) return alert("Course Title is required!");
    
    setActionLoading(true);
    try {
       const token = localStorage.getItem('token');
        
        // DAPAT GANITO ANG PAYLOAD (Base sa image_492ea1)
        const payload = {
            course_name: newCourse.title, // I-map ang title sa course_name
            description: newCourse.description,
            course_code: newCourse.course_code,
            school_year: newCourse.school_year || "2025-2026",
            semester: newCourse.semester || "1st Semester"
        };

        const response = await authAPI.createCourse(payload, token); 
        
        if (response.ok) {
            setShowCreateModal(false);
            setNewCourse({ title: '', description: '', course_code: '', school_year: '2025-2026', semester: '1st Semester' });
            fetchCourses(); 
        } else {
            const errorData = await response.json();
            alert(errorData.message || "Failed to create course");
        }
    } catch (error) {
        console.error("Connection Error:", error);
        alert("Server connection failed. Check if backend is running.");
    } finally {
        setActionLoading(false);
    }
};
  // Restore state after refresh
useEffect(() => {
  const savedCourse = localStorage.getItem('selectedCourse');
  const savedView = localStorage.getItem('viewMode');

  if (savedCourse) {
    setSelectedCourse(JSON.parse(savedCourse));
  }

  if (savedView) {
    setViewMode(savedView);
  }
}, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
  setDashboardStats({
    pendingAlerts: 0,
    resolved: 0,
    totalStudents: students.length, // or global kung meron ka
    speakingPending: 0
  });
}, [students]);
  // Initial Load of Courses
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { navigate('/login'); return; }

    const loadData = async () => {
      try {
        setLoading(true);
        const res = await authAPI.getMyCourses(token);
        if (res.ok) {
          const data = await res.json();
          setCourses(Array.isArray(data) ? data : (data.courses || []));
        } else if (res.status === 401) { handleLogout(); }
      } catch (err) { 
        console.error("Load Error:", err); 
      } finally { 
        setLoading(false); 
      }
    };
    loadData();
  }, [navigate]);

  const handleLogout = () => { localStorage.clear(); navigate('/login'); };

  useEffect(() => {
  const savedSection = localStorage.getItem('selectedSection');
  if (savedSection) {
    setSelectedSection(JSON.parse(savedSection));
  }
}, []);

  // Reload sections if refresh happened while viewing sections
useEffect(() => {
  const loadSectionsAfterRefresh = async () => {
    const token = localStorage.getItem('token');
    const savedCourse = localStorage.getItem('selectedCourse');
    const savedView = localStorage.getItem('viewMode');

    if (!token || !savedCourse) return;

    const course = JSON.parse(savedCourse);
    const courseId = course?.id || course?.course_id;

    if (savedView === 'sections' && courseId) {
      setSelectedCourse(course);
      setViewMode('sections');

      try {
        setLoading(true);

        const res = await authAPI.getSections(courseId, token);

        if (res.ok) {
          const data = await res.json();

          console.log("REFRESH RESPONSE:", data);

          // ✅ SAME FIX
          const sectionsData = Array.isArray(data)
            ? data
            : data.sections || data.data || [];

          setSections(sectionsData);
        }

      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
  };

  loadSectionsAfterRefresh();
}, []);
  // --- COURSE ACTIONS ---
  
const handleCourseClick = async (course) => {
  // 1. I-set ang selected course
  setSelectedCourse(course);
  const token = localStorage.getItem('token');

  try {
    const res = await authAPI.getInstructorSections(token);
    
    if (res.ok) {
      const data = await res.json();
      
      // ERROR FIX: Ang 'data' ay { message, sections: [] }. 
      // Kunin natin yung array sa loob ng .sections
      const allSections = data.sections || []; 
      
      const courseId = course.id || course.course_id;
      
      // I-filter ang sections para sa pinindot na course
      const filtered = allSections.filter(sec => 
        Number(sec.course_id) === Number(courseId)
      );
      
      setSections(filtered);

      // 2. ITO ANG KULANG: Kailangan nating sabihan ang UI na lumipat ng view
      setViewMode('sections'); 
      
    } else {
      console.error("Failed to fetch sections:", res.status);
    }
  } catch (err) {
    console.error("Error loading sections:", err);
  }
};
const handleCreateSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    setActionLoading(true);
    try {
      const res = await authAPI.createCourse({ course_name: newCourseName }, token);
      if (res.ok) {
        const data = await res.json();
        
        // Kinukuha ang 'course' object para lilitaw ang pangalan sa card
        const newCourseData = data.course || data.data || data; 
        
        setCourses(prev => [newCourseData, ...prev]);
        setShowCreateModal(false);
        setNewCourseName('');
      }
    } catch (err) { 
      console.error("CREATE COURSE ERROR:", err); 
    } finally { 
      setActionLoading(false); 
    }
  };
const handleUpdateSubmit = async (e) => {
    if (e) e.preventDefault();
    
    // Kunin ang ID nang tahimik (no alert)
    const courseId = selectedCourse?.id || selectedCourse?.course_id || editCourseData?.id; 

    // Kung walang ID, i-log lang sa console para sa dev, wag ipakita sa user
    if (!courseId) {
        console.warn("Update blocked: Course ID not found in state.");
        return;
    }

    try {
        const token = localStorage.getItem('token');
        const payload = {
            course_name: editCourseData?.course_name || newCourseName, // Gamitin kung alin ang may laman
            course_code: editCourseData?.course_code,
            description: editCourseData?.description
        };

        const res = await authAPI.updateCourse(courseId, payload, token);

        if (res.ok) {
            // Success! Isara ang modal at i-refresh ang listahan
            setShowEditModal(false);
            if (typeof fetchCourses === 'function') {
                await fetchCourses(); 
            }
            // Optional: Isang mabilis na notification na lang imbes na alert
            console.log("Course updated successfully.");
        }
    } catch (err) {
        console.error("Silent Error during update:", err);
    }
};

const handleUpdateCourse = async (courseId, newCourseData) => {
    const token = localStorage.getItem('token');
    
    try {
        const res = await authAPI.updateCourse(courseId, newCourseData, token);
        
        if (res.ok) {
            // 1. REFRESH DATA: Tawagin ang function na nag-fefetch ng lahat ng courses
            // Ito yung function na nagse-set sa 'setCourses' state mo.
            fetchCourses(); 

            // 2. OPTIONAL: I-update ang kasalukuyang selected course kung ito ang binago
            if (selectedCourse?.id === courseId) {
                setSelectedCourse(prev => ({
                    ...prev,
                    ...newCourseData
                }));
            }

            alert("Course updated successfully!");
        } else {
            console.error("Failed to update course");
        }
    } catch (err) {
        console.error("Course Update Error:", err);
    }
};

  const confirmDeleteCourse = async () => {
    if (!selectedCourse) return;
    const token = localStorage.getItem('token');
    const courseId = selectedCourse.id || selectedCourse.course_id;
    setActionLoading(true);
    try {
      const res = await authAPI.deleteCourse(courseId, token);
      if (res.ok) {
        setCourses(prev => prev.filter(c => (c.id !== courseId && c.course_id !== courseId)));
        setShowDeleteModal(false);
        setSelectedCourse(null);
        setViewMode('courses'); // Force back to courses if selected one is deleted
      }
    } catch (err) { console.error(err); } finally { setActionLoading(false); }
  };
// ILAGAY ITO BAGO ANG handleSectionSubmit
 
const fetchSections = async (courseId) => {
    const token = localStorage.getItem('token');
    try {
        const res = await authAPI.getInstructorSections(token);
        if (res.ok) {
            const data = await res.json();
            
            // FIX: Kunin ang array mula sa data.sections
            const allSections = data.sections || []; 
            
            // I-filter para sa kasalukuyang course
            const filtered = allSections.filter(sec => 
                Number(sec.course_id) === Number(courseId)
            );
            
            setSections(filtered);
        }
    } catch (err) {
        console.error("Error in fetchSections:", err);
    }
};

const fetchSectionStudents = async (sectionId) => {
    const token = localStorage.getItem('token');
    try {
        // Dapat may endpoint ka sa authAPI na kumukuha ng students per section
        const res = await authAPI.getStudentsBySection(sectionId, token); 
        
        if (res.ok) {
            const data = await res.json();
            // Siguraduhin na ang status filter ay tama (e.g. 'approved' or 'active')
            setStudents(data.students || []); 
        }
    } catch (err) {
        console.error("Error fetching students:", err);
    }
};
  // --- SECTION ACTIONS ---

  const handleSectionSubmit = async (e) => {
  if (e) e.preventDefault();
  
  // 1. Validation
  if (!newSection.section_name) {
    return alert("Section Name is required");
  }

  setActionLoading(true);
  try {
    const token = localStorage.getItem('token'); 
    const courseId = selectedCourse?.id || selectedCourse?.course_id;

    if (!courseId) {
        alert("Course ID is missing. Please select a course again.");
        return;
    }

    // 2. Payload Mapping
    const sectionData = {
      section_name: newSection.section_name,
      school_year: newSection.school_year || '2025-2026',
      semester: newSection.semester || '1st Semester'
    };
    
    const res = await authAPI.createSection(courseId, sectionData, token);
    
    if (res.ok) {
      // 3. UI Cleanup
      setShowSectionModal(false);
      setNewSection({ 
        section_name: '', 
        school_year: '2025-2026', 
        semester: '1st Semester' 
      });
      
      // 4. AUTOMATIC UPDATE: I-pass ang courseId para alam ng fetchSections kung ano ang i-fi-filter
      await fetchSections(courseId); 

      console.log("Section created successfully!"); 
    } else {
      const errorData = await res.json();
      alert(errorData.message || "Failed to create section");
    }
  } catch (err) {
    console.error("Submission error:", err);
    alert("An error occurred while creating the section.");
  } finally {
    setActionLoading(false);
  }
};

// --- STUDENT ENROLLMENT ACTIONS (DITO MO ILAGAY) ---

// Function para kuhanin ang listahan ng pending students mula sa authAPI
const fetchPendingStudents = async () => {
  try {
    const token = localStorage.getItem('token');

    // ✅ GET FROM STATE OR LOCAL STORAGE
    let course = selectedCourse;
    if (!course) {
      const saved = localStorage.getItem('selectedCourse');
      if (saved) {
        course = JSON.parse(saved);
        setSelectedCourse(course);
      }
    }

    let section = selectedSection;
    if (!section) {
      const savedSec = localStorage.getItem('selectedSection');
      if (savedSec) {
        section = JSON.parse(savedSec);
        setSelectedSection(section);
      }
    }

    const courseId = course?.id || course?.course_id;
    const sectionId = section?.id || section?.section_id;

    // ❌ STOP kung wala
    if (!courseId || !sectionId) {
      console.log("Missing IDs:", { courseId, sectionId });
      return;
    }

    const res = await authAPI.getPendingStudents(courseId, sectionId, token);

    if (res.ok) {
      const data = await res.json();
      console.log("PENDING:", data); // 🔥 CHECK THIS
      setPendingStudents(Array.isArray(data) ? data : []);
    } else {
      console.error("Failed fetch pending");
    }

  } catch (err) {
    console.error(err);
  }
};
const fetchPendingRequests = async (courseId, sectionId) => {
    const token = localStorage.getItem('token');
    try {
        const res = await authAPI.getPendingStudents(courseId, sectionId, token);
        if (res.ok) {
            const data = await res.json();
            console.log("REFRSH RESPONSE:", data);

            // FIX: Kunin ang 'pending_students' base sa nakita natin sa console
            const list = data.pending_students || []; 
            setPendingStudents(list);
        }
    } catch (err) {
        console.error("Error fetching pending:", err);
    }
};

// 1. Gawa muna tayo ng reusable na function para sa pag-fetch ng students
// para hindi paulit-ulit ang code sa loob ng approval.
const fetchInitialStudents = async (cId, sId) => {
    const token = localStorage.getItem('token');
    if (!cId || !sId || !token) return;

    try {
        // TAMA NA ORDER: courseId, sectionId, token
        const res = await authAPI.getSectionStudents(cId, sId, token);
        if (res.ok) {
            const data = await res.json();
            console.log("DEBUG: Refreshing Main Table...", data);

            let newList = [];
            if (Array.isArray(data)) {
                newList = data;
            } else if (data.students) {
                newList = data.students;
            } else if (data.data) {
                newList = data.data;
            }

            // I-filter ang mga approved o active students lang
            const approvedOnly = newList.filter(s => 
                s.status?.toLowerCase() === 'approved' || 
                s.status?.toLowerCase() === 'active'
            );

            setStudents(approvedOnly);
            if (typeof setFilteredStudents === 'function') {
                setFilteredStudents(approvedOnly);
            }
        }
    } catch (err) {
        console.error("Fetch students error:", err);
    }
};

// 2. Ang iyong handleApproval function
const handleApproval = async (ssId, status) => {
    const token = localStorage.getItem('token');
    const cId = selectedCourse?.id || selectedCourse?.course_id;
    const sId = selectedSection?.id || selectedSection?.section_id;

    if (!cId || !sId || !ssId || !token) {
        console.error("Missing required data for approval");
        return;
    }

    try {
        // STEP 1: I-send ang approval request sa server
        const res = await authAPI.approveRejectStudent(cId, sId, ssId, status, token);
        
        if (res.ok) {
            console.log(`Student ${status} successfully!`);

            // STEP 2: Refresh the Pending List (para mawala yung student sa modal)
            if (typeof fetchPendingRequests === 'function') {
                fetchPendingRequests(cId, sId);
            }
            
            // STEP 3: Refresh the Main Table (kung 'approved' ang status)
            if (status === 'approved') {
                // Tinatawag natin yung function sa itaas
                await fetchInitialStudents(cId, sId);
            }
        } else {
            const errorData = await res.json();
            console.error("Approval failed:", errorData.message);
        }
    } catch (err) {
        console.error("Approval Error:", err);
    }
};
// --- DITO NA MAGSISIMULA YUNG FILTER LOGIC MO ---
const filteredStudents = students.filter(student =>
  student.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
  student.email?.toLowerCase().includes(searchTerm.toLowerCase())
);

// --- DITO MO ILAGAY PAGKATAPOS NG handleSectionSubmit ---

const handleSectionUpdate = async (e) => {
    if (e) e.preventDefault();
    
    // Kunin ang ID mula sa state
    const sectionId = newSection.id; 
    
    // Error handling kung undefined ang ID
    if (!sectionId) {
        console.error("Section ID is missing!");
        return alert("Error: Could not find Section ID.");
    }

    setActionLoading(true);
    try {
        const token = localStorage.getItem('token');
        const payload = {
            section_name: newSection.section_name,
            school_year: newSection.school_year,
            semester: newSection.semester
        };

        // Siguraduhin na ang selectedCourse.id at sectionId ay may laman
        const res = await authAPI.updateSection(selectedCourse.id, sectionId, payload, token);

        if (res.ok) {
            setShowEditSectionModal(false);
            await fetchCourses(); // Refresh ang data
            alert("Section updated successfully!");
        } else {
            alert("Error updating section");
        }
    } catch (err) {
        console.error("Update error:", err);
    } finally {
        setActionLoading(false);
    }
};
  const confirmDeleteSection = async () => {
    const token = localStorage.getItem('token');
    const courseId = selectedCourse?.id || selectedCourse?.course_id;
    const sectionId = selectedSection?.id || selectedSection?.section_id;
    setActionLoading(true);
    try {
      const res = await authAPI.deleteSection(courseId, sectionId, token);
      if (res.ok) {
        setSections(prev => prev.filter(s => (s.id !== sectionId && s.section_id !== sectionId)));
        setShowDeleteSectionModal(false);
      }
    } catch (err) { console.error(err); } finally { setActionLoading(false); }
  };

 const handleSectionClick = async (sec) => {
  setSelectedSection(sec);
  setViewMode('students');
  setLoading(true);

  const token = localStorage.getItem('token');
  const sectionId = sec.id || sec.section_id;
  const courseId = selectedCourse?.id || selectedCourse?.course_id;

  if (!courseId || !sectionId) {
    console.error("Missing IDs:", { courseId, sectionId });
    setLoading(false);
    return;
  }

  try {
    const res = await authAPI.getSectionStudents(courseId, sectionId, token);

    if (res.ok) {
      const data = await res.json();

      let studentList = [];

      if (Array.isArray(data)) {
        studentList = data;
      } else if (data.students) {
        studentList = data.students;
      } else if (data.data) {
        studentList = data.data;
      }

      const approved = studentList.filter(s =>
        s.status?.toLowerCase() === 'approved' ||
        s.status?.toLowerCase() === 'active'
      );

      setStudents(approved);
    } else {
      setStudents([]);
    }

  } catch (err) {
    console.error("FETCH ERROR:", err);
    setStudents([]);
  } finally {
    setLoading(false);
  }
};
const totalStudents = students.length;  


//RENDER///

return (
  <>
    <div className="min-h-screen bg-[#DBE2E5] font-sans text-gray-600 pb-20">
      {/* Navigation */}
      <nav className="bg-white px-8 py-3 flex justify-between items-center shadow-sm mb-6 relative z-50">
        <h1 className="text-sm font-black tracking-tighter text-gray-800 uppercase italic cursor-pointer" onClick={() => setViewMode('courses')}>Ella Quest</h1>
        <div className="flex items-center gap-3 relative" ref={dropdownRef}>
          <div className="text-right cursor-pointer" onClick={() => setShowProfileMenu(!showProfileMenu)}>
            <p className="text-[10px] font-bold text-gray-800 leading-none">Prof. Garcia</p>
            <p className="text-[9px] text-gray-400 font-bold uppercase tracking-tighter">Instructor ▾</p>
          </div>
          <div className="w-9 h-9 bg-orange-500 rounded-full flex items-center justify-center text-white font-black text-xs cursor-pointer shadow-md" onClick={() => setShowProfileMenu(!showProfileMenu)}>PG</div>
          
          {showProfileMenu && (
            <div className="absolute right-0 top-12 w-44 bg-white rounded-2xl shadow-2xl border border-gray-100 py-2">
              <button className="w-full text-left px-5 py-3 text-[10px] font-bold text-gray-600 hover:bg-gray-50 uppercase tracking-widest transition-colors">Settings</button>
              <button onClick={() => { setShowLogoutModal(true); setShowProfileMenu(false); }} className="w-full text-left px-5 py-3 text-[10px] font-black text-red-500 hover:bg-red-50 uppercase tracking-widest">Logout Account</button>
            </div>
          )}
        </div>
      </nav>
      

      <div className="max-w-6xl mx-auto px-6">
        {/* Banner */}
        <div className="bg-[#F39C12] text-white p-6 rounded-xl mb-6 shadow-md flex items-center gap-4">
          <div className="text-2xl drop-shadow-sm">📋</div>
          <div>
            <h2 className="text-sm font-black uppercase tracking-tight italic">Instructor Dashboard</h2>
            <p className="text-[10px] font-bold opacity-90 uppercase">Review student interventions and monitor performance</p>
          </div>
        </div>

        {/* Tabs */}
       <div className="border-b border-gray-300 mb-6 flex items-center gap-8 overflow-x-auto scrollbar-hide">
            {/* ===== 1. DASHBOARD STATS (SINGIT SA TAAS NG TABS) ===== */}
<div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 w-full">
    <div className="bg-white rounded-[2rem] p-5 shadow-sm border border-gray-100 flex flex-col items-center justify-center h-[130px]">
      <span className="text-xl mb-1">⚠️</span>
      <span className="text-lg font-black text-gray-800">{dashboardStats.pendingAlerts}</span>
      <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest italic text-center leading-tight mt-2">Pending Alerts</span>
    </div>
    
    <div className="bg-white rounded-[2rem] p-5 shadow-sm border-b-4 border-b-green-500 border border-gray-100 flex flex-col items-center justify-center h-[130px]">
      <span className="text-xl mb-1">✅</span>
      <span className="text-lg font-black text-gray-800">{dashboardStats.resolved}</span>
      <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest italic text-center leading-tight mt-2">Resolved</span>
    </div>

    <div className="bg-white rounded-[2rem] p-5 shadow-sm border border-gray-100 flex flex-col items-center justify-center h-[130px]">
      <span className="text-xl mb-1">👥</span>
      <span className="text-lg font-black text-gray-800">{dashboardStats.totalStudents}</span>
      <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest italic text-center leading-tight mt-2">Total Students</span>
    </div>

    <div className="bg-white rounded-[2rem] p-5 shadow-sm border border-gray-100 flex flex-col items-center justify-center h-[130px]">
      <span className="text-xl mb-1">🎤</span>
      <span className="text-lg font-black text-gray-800">{dashboardStats.speakingPending}</span>
      <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest italic text-center leading-tight mt-2">Speaking Pending</span>
    </div>
  </div>

  {/* ===== SECTION B: NAVIGATION TABS (NASA ILALIM NA NG MGA CARDS) ===== */}
  <div className="border-b border-gray-200 mt-2 mb-10 flex items-center gap-10 overflow-x-auto scrollbar-hide px-4 w-full">
    {['My Courses', 'Interventions', 'Speaking Review', 'Messages'].map((tab) => (
      <button 
        key={tab} 
        onClick={() => { setActiveTab(tab); setViewMode('courses'); }} 
        className={`pb-4 text-[10px] font-black uppercase tracking-widest transition-all relative whitespace-nowrap ${ 
          activeTab === tab ? 'text-green-700' : 'text-gray-400 hover:text-gray-600'
        }`}
      >
        {tab}
        {activeTab === tab && (
          <div className="absolute bottom-0 left-0 w-full h-[4px] bg-green-600 rounded-full animate-in fade-in zoom-in duration-300" />
        )}
      </button>
    ))}
</div>
        </div>

        {activeTab === 'My Courses' ? (
          <div className="animate-in fade-in">
            {viewMode === 'courses' ? (
              <>
                <div className="flex justify-between items-end mb-6">
                  <div>
                    <h3 className="text-xs font-black uppercase text-gray-800 italic tracking-widest">My Courses</h3>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">Select a course to view sections</p>
                  </div>
                  <button onClick={() => { setNewCourseName(''); setShowCreateModal(true); }} className="bg-[#27AE60] text-white px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg hover:bg-[#219150] transition-all">+ Create New Course</button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 
                  {courses.map((course) => (
                    <div 
                      key={course.id || course.course_id} 
                      onClick={() => handleCourseClick(course)}
                      className="bg-white p-6 rounded-3xl shadow-sm border border-gray-50 relative group hover:shadow-xl transition-all cursor-pointer flex flex-col min-h-[180px]"
                    >
                      <div className="bg-blue-600 w-11 h-11 rounded-xl mb-4 flex items-center justify-center text-xl shadow-inner">📘</div>
                      <span className="absolute top-6 right-6 bg-green-50 text-green-600 text-[9px] px-3 py-1 rounded-full font-black uppercase">Active</span>
                      <h4 className="font-black text-gray-800 uppercase italic text-xs leading-tight mb-1 pr-10">{course.course_name}</h4>
                      <p className="text-[10px] text-gray-400 font-bold mb-6 uppercase tracking-widest">{course.course_code}</p>
                      
                      <div className="flex justify-between items-center border-t border-gray-50 pt-5 mt-auto">
                        <div className="flex gap-4 text-[9px] font-black uppercase text-gray-400">
                         <span>📊 {course.section_count || course.sections_count || 0} Sections</span>
                        </div>
                        <div className="flex gap-2 relative z-20">
                         <button 
  onClick={(e) => { 
    e.stopPropagation(); 
    
    
    setEditCourseData({
      ...course,
      id: course.id || course.course_id // Siguradong may ID
    });
    

    setSelectedCourse(course); 

    setNewCourseName(course.course_name); 
    setShowEditModal(true); 
  }} 
  className="p-2 bg-gray-50 hover:bg-blue-50 text-gray-400 hover:text-blue-500 rounded-lg transition-colors cursor-pointer"
>
  ✏️
</button>
                          <button 
                            onClick={(e) => { 
                              e.stopPropagation(); 
                              setSelectedCourse(course); 
                              setShowDeleteModal(true); 
                            }} 
                            className="p-2 bg-gray-50 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-lg transition-colors cursor-pointer"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : viewMode === 'sections' ? (
              <div className="animate-in slide-in-from-right duration-300">
                <button onClick={() => setViewMode('courses')} className="mb-4 text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-gray-600 flex items-center gap-1">
                  ← Back to Courses
                </button>
                
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-sm font-black text-gray-800 uppercase italic">{selectedCourse?.course_name}</h2>
                  <button 
                    onClick={(e) => { 
                        e.stopPropagation();
                        setNewSection({section_name:'', schedule:'', room:'', capacity:35}); 
                        setShowSectionModal(true); 
                    }} 
                    className="relative z-10 bg-[#27AE60] text-white px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg hover:scale-105 active:scale-95 transition-all"
                  >
                    + Create New Section
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {sections.length > 0 ? sections.map((sec) => (
                    <div 
                      key={sec.id || sec.section_id} 
                      onClick={() => handleSectionClick(sec)}
                      className="bg-white p-5 rounded-[2.5rem] shadow-sm border border-gray-50 flex flex-col group hover:shadow-md transition-all cursor-pointer"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <h5 className="font-black text-gray-800 uppercase italic text-[11px] leading-tight">{sec.section_name}</h5>
                        <div className="flex gap-2 relative z-20">
                            <button 
                              onClick={(e) => { 
                                e.stopPropagation();
                                setSelectedSection(sec); 
                                setNewSection({id: sec.id || sec.section_id, section_name: sec.section_name, schedule: sec.schedule, room: sec.room, capacity: sec.capacity}); 
                                setShowEditSectionModal(true); 
                              }} 
                              className="text-[10px] hover:scale-110 transition-transform cursor-pointer"
                            >
                              ✏️
                            </button>
                            <button 
                              onClick={(e) => { 
                                e.stopPropagation();
                                setSelectedSection(sec); 
                                setShowDeleteSectionModal(true); 
                              }} 
                              className="text-[10px] hover:scale-110 transition-transform cursor-pointer"
                            >
                              🗑️
                            </button>
                        </div>
                      </div>
                      <p className="text-[10px] text-gray-400 font-bold mb-1 uppercase tracking-tighter">🕒 {sec.schedule}</p>
                      <p className="text-[10px] text-gray-400 font-bold mb-5 uppercase tracking-tighter">📍 Room {sec.room} <span className="ml-2 text-blue-500">👥 {sec.capacity} Cap</span></p>
                      
                      <div className="border-t border-gray-50 pt-4 mt-auto flex justify-between items-center">
                         <span className="text-[9px] font-black text-gray-300 uppercase">Code: {sec.section_code}</span>
                         <button onClick={(e) => { e.stopPropagation(); setSelectedSection(sec); setShowSectionCodeModal(true); }} className="bg-gray-100 text-[8px] font-black px-3 py-1.5 rounded-lg uppercase hover:bg-gray-200">View Code</button>
                      </div>
                    </div>
                  )) : (
                    <div className="col-span-3 py-20 bg-white/50 border-2 border-dashed border-gray-200 rounded-[3rem] text-center">
                      <p className="text-[10px] font-black text-gray-300 uppercase italic">No sections found for this course.</p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* STUDENT LIST VIEW */
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
               {/* ===== SUMMARY HEADER ===== */}
<div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-6">
  
  {/* TITLE */}
  <div className="mb-4">
    <h2 className="text-sm font-black text-gray-800 uppercase italic">
      {selectedSection?.section_name}
    </h2>
    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">
      {selectedCourse?.course_name}
    </p>
  </div>

  {/* STATS */}
  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
    
    <div className="bg-gray-50 rounded-xl px-4 py-3 flex justify-between items-center">
      <span className="text-[10px] font-bold text-gray-400 uppercase">Students</span>
      <span className="text-[12px] font-black text-gray-700">👥 {totalStudents}</span>
    </div>

    <div className="bg-gray-50 rounded-xl px-4 py-3 flex justify-between items-center">
      <span className="text-[10px] font-bold text-gray-400 uppercase">Avg Progress</span>
      <span className="text-[12px] font-black text-gray-700">📊 0%</span>
    </div>

    <div className="bg-gray-50 rounded-xl px-4 py-3 flex justify-between items-center">
      <span className="text-[10px] font-bold text-gray-400 uppercase">Schedule</span>
      <span className="text-[12px] font-black text-gray-700">
        🕒 {selectedSection?.schedule || 'N/A'}
      </span>
    </div>

    <div className="bg-gray-50 rounded-xl px-4 py-3 flex justify-between items-center">
      <span className="text-[10px] font-bold text-gray-400 uppercase">Room</span>
      <span className="text-[12px] font-black text-gray-700">
        📍 {selectedSection?.room || 'N/A'}
      </span>
    </div>

  </div>
</div>
                <button 
                  onClick={() => setViewMode('sections')} 
                  className="mb-4 text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-gray-600 flex items-center gap-1 transition-colors"
                >
                  ← Back to Sections
                </button>

                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                  <div>
                    <h2 className="text-sm font-black text-gray-800 uppercase italic">
                      {selectedSection?.section_name}
                    </h2>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">
                      Class List & Student Overview
                    </p>
                  </div>

                  <div className="flex items-center gap-3 w-full md:w-auto">
                    {/* NOTIFICATION BUTTON */}
                    <div className="relative">
                      <button 
                        onClick={() => {
                          const isOpening = !showPending;
                          setShowPending(isOpening);
                          if (isOpening) {
                            const cId = selectedCourse?.id || selectedCourse?.course_id;
                            const sId = selectedSection?.id || selectedSection?.section_id;
                            if (cId && sId) fetchPendingRequests(cId, sId);
                          }
                        }}
                        className={`p-3 rounded-xl transition-all border shadow-sm flex items-center justify-center ${
                          pendingStudents.length > 0 
                            ? 'bg-orange-50 border-orange-100 text-orange-600' 
                            : 'bg-white border-gray-100 text-gray-400 hover:bg-gray-50'
                        }`}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                        </svg>
                        {pendingStudents.length > 0 && (
                          <span className="absolute -top-1 -right-1 flex h-4 w-4">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-4 w-4 bg-orange-600 text-[8px] text-white font-black items-center justify-center">
                              {pendingStudents.length}
                            </span>
                          </span>
                        )}
                      </button>

                      
{/* PENDING DROPDOWN */}
{showPending && (
  <div className="absolute right-0 mt-3 w-72 bg-white rounded-2xl shadow-xl border border-gray-100 z-[9999] overflow-hidden">
    <div className="p-4 bg-orange-50/50 border-b border-orange-100 flex justify-between items-center">
      <h4 className="text-[9px] font-black text-orange-800 uppercase tracking-widest">Pending Requests</h4>
      <button onClick={() => setShowPending(false)} className="text-gray-400 hover:text-gray-600 text-lg">&times;</button>
    </div>

    <div className="max-h-64 overflow-y-auto p-2 space-y-2">
      {(!pendingStudents || pendingStudents.length === 0) ? (
        <div className="py-8 text-center">
          <p className="text-[9px] text-gray-300 font-bold uppercase italic tracking-tighter">No pending students</p>
        </div>
      ) : (
        pendingStudents.map((student) => (
          <div key={student.ss_id || student.id} className="p-3 bg-gray-50 rounded-xl border border-gray-100 group transition-all hover:bg-white">
            <p className="text-[10px] font-black text-gray-800 uppercase truncate">
              {/* Gamit ang data structure mula sa console mo */}
              {student.full_name || `${student.first_name || ''} ${student.last_name || ''}`}
            </p>
            <p className="text-[8px] text-gray-400 font-bold truncate mb-2">{student.email}</p>
            <div className="flex gap-2">
              <button onClick={() => handleApproval(student.ss_id, 'approved')} className="flex-1 py-1.5 bg-green-500 text-white text-[8px] font-black uppercase rounded-lg hover:bg-green-600">Approve</button>
              <button onClick={() => handleApproval(student.ss_id, 'rejected')} className="flex-1 py-1.5 bg-white text-gray-400 text-[8px] font-black uppercase rounded-lg border border-gray-200 hover:bg-red-50">Reject</button>
            </div>
          </div>
        ))
      )}
    </div>
  </div>
)}
</div> {/*
                    

                    {/* SEARCH BAR */}
                    <div className="relative w-full md:w-64 group">
                      <input 
                        type="text" 
                        placeholder="Search Student..." 
                        className="w-full bg-white border-none rounded-xl px-4 py-3 text-[10px] font-bold outline-none shadow-sm group-hover:shadow-md transition-shadow"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                      <span className="absolute right-4 top-3 text-gray-300">🔍</span>
                    </div>
                  </div>
                </div>

                {/* MAIN STUDENT TABLE */}
                <div className="bg-white rounded-[2.5rem] shadow-sm overflow-hidden border border-gray-50">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-100">
                        <th className="px-8 py-5 text-[9px] font-black text-gray-400 uppercase tracking-widest">Student Name</th>
                        <th className="px-8 py-5 text-[9px] font-black text-gray-400 uppercase tracking-widest">Email Address</th>
                        <th className="px-8 py-5 text-[9px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                        <th className="px-8 py-5 text-[9px] font-black text-gray-400 uppercase tracking-widest">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {filteredStudents.length > 0 ? filteredStudents.map((student, idx) => (
                        <tr key={student.id || idx} className="hover:bg-gray-50/50 transition-colors">
                          <td className="px-8 py-5">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-[10px] font-black text-blue-600 border border-blue-50">
                                {student.full_name?.charAt(0)}
                              </div>
                              <span className="text-[11px] font-black text-gray-700 uppercase italic tracking-tight">{student.full_name}</span>
                            </div>
                          </td>
                          <td className="px-8 py-5 text-[10px] font-bold text-gray-400">{student.email}</td>
                          <td className="px-8 py-5">
                            <span className="bg-green-50 text-green-600 text-[8px] font-black px-3 py-1 rounded-full uppercase border border-green-100">Enrolled</span>
                          </td>
                          <td className="px-8 py-5">
                            <button className="text-[10px] font-black text-blue-500 uppercase tracking-tighter hover:underline">View Profile</button>
                          </td>
                        </tr>
                      )) : (
                        <tr>
                          <td colSpan="4" className="px-8 py-20 text-center">
                            <p className="text-[10px] font-black text-gray-300 uppercase italic tracking-widest">
                              {loading ? "Fetching Students..." : "No students found in this section."}
                            </p>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="animate-in fade-in duration-500">
            {activeTab === 'Interventions' && (
              <InterventionView students={allStudentsData || []} />
            )}
            {activeTab === 'Speaking Review' && (
              <SpeakingReview />
            )}
            {['Students', 'Messages'].includes(activeTab) && (
              <div className="bg-white/50 border-2 border-dashed border-gray-200 rounded-[3rem] py-32 text-center uppercase text-[10px] font-black text-gray-300 tracking-[0.4em]">
                {activeTab} Section Ready
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  
{/* --- ALL MODALS --- */}

      {/* --- COURSE MODALS --- */}
      
      {/* Setup New Course Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-6">
          <div className="bg-white w-full max-w-[450px] rounded-[2.5rem] shadow-2xl p-10">
            <h2 className="text-sm font-black text-gray-800 uppercase italic mb-8">Setup New Course</h2>
            <div className="space-y-4">
              <div>
                <label className="text-[9px] font-black text-gray-400 uppercase ml-2 mb-1 block">Course Title *</label>
                <input 
                  type="text" 
                  value={newCourse.title || ''} 
                  onChange={(e) => setNewCourse({...newCourse, title: e.target.value})} 
                  placeholder="e.g. Programming 2" 
                  className="w-full bg-[#F3F4F6] border-none rounded-2xl p-4 text-[11px] font-bold outline-none" 
                  required 
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[9px] font-black text-gray-400 uppercase ml-2 mb-1 block">School Year</label>
                  <input 
                    type="text" 
                    value={newCourse.school_year || ''} 
                    onChange={(e) => setNewCourse({...newCourse, school_year: e.target.value})} 
                    placeholder="2025-2026" 
                    className="w-full bg-[#F3F4F6] border-none rounded-2xl p-4 text-[11px] font-bold outline-none" 
                  />
                </div>
                <div>
                  <label className="text-[9px] font-black text-gray-400 uppercase ml-2 mb-1 block">Semester</label>
                  <select 
                    value={newCourse.semester || '1st Semester'} 
                    onChange={(e) => setNewCourse({...newCourse, semester: e.target.value})} 
                    className="w-full bg-[#F3F4F6] border-none rounded-2xl p-4 text-[11px] font-bold outline-none"
                  >
                    <option value="1st Semester">1st Semester</option>
                    <option value="2nd Semester">2nd Semester</option>
                    <option value="Summer">Summer</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[9px] font-black text-gray-400 uppercase ml-2 mb-1 block">Course Code</label>
                <input 
                  type="text" 
                  value={newCourse.course_code || ''} 
                  onChange={(e) => setNewCourse({...newCourse, course_code: e.target.value})} 
                  placeholder="e.g. CS101" 
                  className="w-full bg-[#F3F4F6] border-none rounded-2xl p-4 text-[11px] font-bold outline-none" 
                />
              </div>

              <div>
                <label className="text-[9px] font-black text-gray-400 uppercase ml-2 mb-1 block">Description</label>
                <textarea 
                  value={newCourse.description || ''} 
                  onChange={(e) => setNewCourse({...newCourse, description: e.target.value})} 
                  placeholder="Course description..." 
                  className="w-full bg-[#F3F4F6] border-none rounded-2xl p-4 text-[11px] font-bold outline-none h-24 resize-none" 
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowCreateModal(false)} className="flex-1 py-4 bg-gray-100 text-gray-400 rounded-2xl font-black text-[9px] uppercase">Cancel</button>
                <button 
                  onClick={handleConfirmCreate} 
                  disabled={actionLoading} 
                  className="flex-1 py-4 bg-green-600 text-white rounded-2xl font-black text-[9px] uppercase shadow-xl"
                >
                  {actionLoading ? 'Saving...' : 'Confirm'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Course Modal - UPDATED para sa Automatic Refresh */}
    {showEditModal && (
  <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-6">
    <div className="bg-white w-full max-w-[400px] rounded-[2.5rem] shadow-2xl p-10">
      <h2 className="text-sm font-black text-gray-800 uppercase italic mb-8 tracking-widest text-center">Update Course</h2>
      <div className="space-y-4">
        <div>
          <label className="text-[9px] font-black text-gray-400 uppercase ml-2 mb-1 block">Course Name</label>
          <input 
            type="text" 
            value={editCourseData.course_name || ''} 
            onChange={(e) => setEditCourseData({...editCourseData, course_name: e.target.value})} 
            className="w-full bg-[#F3F4F6] border-none rounded-2xl p-4 text-[11px] font-bold outline-none" 
            placeholder="Course Name"
          />
        </div>
        <div>
          <label className="text-[9px] font-black text-gray-400 uppercase ml-2 mb-1 block">Course Code</label>
          <input 
            type="text" 
            value={editCourseData.course_code || ''} 
            onChange={(e) => setEditCourseData({...editCourseData, course_code: e.target.value})} 
            className="w-full bg-[#F3F4F6] border-none rounded-2xl p-4 text-[11px] font-bold outline-none" 
            placeholder="Course Code"
          />
        </div>
        <div>
          <label className="text-[9px] font-black text-gray-400 uppercase ml-2 mb-1 block">Description</label>
          <textarea 
            value={editCourseData.description || ''} 
            onChange={(e) => setEditCourseData({...editCourseData, description: e.target.value})} 
            className="w-full bg-[#F3F4F6] border-none rounded-2xl p-4 text-[11px] font-bold outline-none h-24 resize-none" 
            placeholder="Description"
          />
        </div>
        <div className="flex gap-3 pt-4">
          <button type="button" onClick={() => setShowEditModal(false)} className="flex-1 py-4 bg-gray-100 text-gray-400 rounded-2xl font-black text-[9px] uppercase">Cancel</button>
          <button 
            onClick={handleUpdateSubmit} 
            disabled={actionLoading} 
            className="flex-1 py-4 bg-blue-600 text-white rounded-2xl font-black text-[9px] uppercase shadow-xl"
          >
            {actionLoading ? 'Updating...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  </div>
)}
      {/* --- SECTION MODALS --- */}
      
      {/* Create Section Modal */}
      {showSectionModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-6">
          <div className="bg-white w-full max-w-[450px] rounded-[2.5rem] shadow-2xl p-10">
            <h2 className="text-sm font-black text-gray-800 uppercase italic mb-8 tracking-widest">Create New Section</h2>
            <form onSubmit={handleSectionSubmit} className="space-y-4">
              <div>
                <label className="text-[9px] font-black text-gray-400 uppercase ml-2 mb-1 block">Section Name *</label>
                <input 
                  type="text" 
                  placeholder="e.g. BSCS 1A" 
                  className="w-full bg-[#F3F4F6] border-none rounded-2xl p-4 text-[11px] font-bold outline-none" 
                  value={newSection.section_name || ''} 
                  onChange={(e) => setNewSection({...newSection, section_name: e.target.value})} 
                  required 
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[9px] font-black text-gray-400 uppercase ml-2 mb-1 block">School Year *</label>
                  <input 
                    type="text" 
                    placeholder="2025-2026" 
                    className="w-full bg-[#F3F4F6] border-none rounded-2xl p-4 text-[11px] font-bold outline-none" 
                    value={newSection.school_year || ''} 
                    onChange={(e) => setNewSection({...newSection, school_year: e.target.value})} 
                    required 
                  />
                </div>
                <div>
                  <label className="text-[9px] font-black text-gray-400 uppercase ml-2 mb-1 block">Semester *</label>
                  <select 
                    className="w-full bg-[#F3F4F6] border-none rounded-2xl p-4 text-[11px] font-bold outline-none"
                    value={newSection.semester || '1st Semester'}
                    onChange={(e) => setNewSection({...newSection, semester: e.target.value})}
                    required
                  >
                    <option value="1st Semester">1st Semester</option>
                    <option value="2nd Semester">2nd Semester</option>
                    <option value="Summer">Summer</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowSectionModal(false)} className="flex-1 py-4 bg-gray-100 text-gray-400 rounded-2xl font-black text-[9px] uppercase">Cancel</button>
                <button type="submit" disabled={actionLoading} className="flex-1 py-4 bg-green-600 text-white rounded-2xl font-black text-[9px] uppercase shadow-lg">
                  {actionLoading ? 'Creating...' : 'Create Section'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Section Modal - ADDED para hindi mag-white screen */}
      {showEditSectionModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-6">
          <div className="bg-white w-full max-w-[450px] rounded-[2.5rem] shadow-2xl p-10">
            <h2 className="text-sm font-black text-gray-800 uppercase italic mb-8">Edit Section Details</h2>
            <div className="space-y-4">
              <div>
                <label className="text-[9px] font-black text-gray-400 uppercase ml-2 mb-1 block">Section Name</label>
                <input 
                  type="text" 
                  value={newSection.section_name || ''} 
                  onChange={(e) => setNewSection({...newSection, section_name: e.target.value})} 
                  className="w-full bg-[#F3F4F6] border-none rounded-2xl p-4 text-[11px] font-bold outline-none" 
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[9px] font-black text-gray-400 uppercase ml-2 mb-1 block">School Year</label>
                  <input 
                    type="text" 
                    value={newSection.school_year || ''} 
                    onChange={(e) => setNewSection({...newSection, school_year: e.target.value})} 
                    className="w-full bg-[#F3F4F6] border-none rounded-2xl p-4 text-[11px] font-bold outline-none" 
                  />
                </div>
                <div>
                  <label className="text-[9px] font-black text-gray-400 uppercase ml-2 mb-1 block">Semester</label>
                  <select 
                    value={newSection.semester || '1st Semester'} 
                    onChange={(e) => setNewSection({...newSection, semester: e.target.value})} 
                    className="w-full bg-[#F3F4F6] border-none rounded-2xl p-4 text-[11px] font-bold outline-none"
                  >
                    <option value="1st Semester">1st Semester</option>
                    <option value="2nd Semester">2nd Semester</option>
                    <option value="Summer">Summer</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowEditSectionModal(false)} className="flex-1 py-4 bg-gray-100 text-gray-400 rounded-2xl font-black text-[9px] uppercase">Cancel</button>
                <button 
                  onClick={handleSectionUpdate} 
                  disabled={actionLoading} 
                  className="flex-1 py-4 bg-blue-600 text-white rounded-2xl font-black text-[9px] uppercase shadow-xl"
                >
                  {actionLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Section Modal */}
      {showDeleteSectionModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[9999] p-6">
          <div className="bg-white w-full max-w-[380px] rounded-[2.5rem] shadow-2xl p-10 text-center border-t-8 border-red-500">
            <h2 className="text-lg font-black text-gray-800 uppercase italic mb-2">Delete Section?</h2>
            <p className="text-[10px] font-bold text-gray-400 uppercase mb-8">This action cannot be undone.</p>
            <div className="flex flex-col gap-2">
              <button onClick={confirmDeleteSection} disabled={actionLoading} className="w-full py-4 bg-red-500 text-white rounded-2xl font-black text-[10px] uppercase shadow-lg">{actionLoading ? 'Deleting...' : 'Yes, Delete'}</button>
              <button onClick={() => setShowDeleteSectionModal(false)} className="w-full py-4 bg-gray-50 text-gray-400 rounded-2xl font-black text-[10px] uppercase">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Course Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[9999] p-6">
          <div className="bg-white w-full max-w-[380px] rounded-[2.5rem] shadow-2xl p-10 text-center border-t-8 border-red-500">
            <h2 className="text-lg font-black text-gray-800 uppercase italic mb-2">Delete Course?</h2>
            <p className="text-[10px] font-bold text-gray-400 uppercase mb-8">Remove <span className="text-red-500">"{selectedCourse?.course_name || selectedCourse?.title}"</span>?</p>
            <div className="flex flex-col gap-2">
              <button onClick={confirmDeleteCourse} disabled={actionLoading} className="w-full py-4 bg-red-500 text-white rounded-2xl font-black text-[10px] uppercase shadow-lg">Yes, Delete</button>
              <button onClick={() => setShowDeleteModal(false)} className="w-full py-4 bg-gray-50 text-gray-400 rounded-2xl font-black text-[10px] uppercase">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Section Code Modal */}
      {showSectionCodeModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[9999] p-6">
          <div className="bg-white w-full max-w-[350px] rounded-[2.5rem] shadow-2xl p-10 text-center">
            <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Section Code for</h2>
            <h3 className="text-sm font-black text-gray-800 uppercase italic mb-8">{selectedSection?.section_name}</h3>
            <div className="bg-[#F8F9FA] border-2 border-dashed border-gray-200 p-8 rounded-3xl mb-8">
              <span className="text-4xl font-black text-gray-800 tracking-[0.2em]">{selectedSection?.section_code}</span>
            </div>
            <button onClick={() => { navigator.clipboard.writeText(selectedSection?.section_code); setShowSectionCodeModal(false); }} className="w-full py-4 bg-green-600 text-white rounded-2xl font-black text-[10px] uppercase shadow-lg">Copy & Close</button>
          </div>
        </div>
      )}

      {/* Logout Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[9999] p-6">
          <div className="bg-white w-full max-w-[350px] rounded-[2.5rem] shadow-2xl p-10 text-center">
            <h2 className="text-lg font-black text-gray-800 uppercase italic mb-2">Exit Ella Quest?</h2>
            <div className="flex flex-col gap-2 mt-8">
              <button onClick={handleLogout} className="w-full py-4 bg-red-500 text-white rounded-2xl font-black text-[10px] uppercase shadow-lg">Yes, Logout</button>
              <button onClick={() => setShowLogoutModal(false)} className="w-full py-4 bg-gray-50 text-gray-400 rounded-2xl font-black text-[10px] uppercase">No, Stay</button>
            </div>
          </div>
        </div>
      )}
  
 </>
);
};

export default InstructorDashboard;