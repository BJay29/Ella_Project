const BASE_URL = 'https://ellaquest-backend.onrender.com';

const fetchWithTimeout = (url, options = {}, timeout = 15000) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);
  return fetch(url, { ...options, signal: controller.signal })
    .finally(() => clearTimeout(timer));
};

const validateParams = (params) => {
    Object.entries(params).forEach(([key, value]) => {
        if (value === undefined || value === null || value === '') {
            console.error(`Missing param: ${key}`);
            throw new Error(`Missing required parameter: ${key}`);
        }
    });
};

export const authAPI = {
  // --- SERVER STATUS ---
  ping: async () => {
    try {
      await fetchWithTimeout(`${BASE_URL}/`, { method: 'GET', mode: 'no-cors' }, 30000);
    } catch { /* Silently ignore */ }
  },  

  // --- AUTHENTICATION & REGISTRATION ---
  sendVerificationCode: async (email) => {
    return await fetchWithTimeout(`${BASE_URL}/api/user/send-verification-code`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.trim().toLowerCase() }),
    });
  },

  register: async (formData) => {
    return await fetchWithTimeout(`${BASE_URL}/api/user/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        first_name: formData.firstName,
        last_name: formData.lastName,
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        code: formData.code
      }),
    });
  },

  login: async (email, password) => {
    return await fetchWithTimeout(`${BASE_URL}/api/user/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: email.trim().toLowerCase(),
        password,
      }),
    });
  },

  // --- INSTRUCTOR PROFILE & SECURITY ---
  getInstructorProfile: async (token) => {
    return await fetchWithTimeout(`${BASE_URL}/api/instructor/instructor/profile`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` },
    });
  },

  updateInstructorProfile: async (profileData, token) => {
    return await fetchWithTimeout(`${BASE_URL}/api/instructor/instructor/profile`, {
      method: 'PUT',
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(profileData),
    });
  },

  changePassword: async (passwordData, token) => {
    return await fetchWithTimeout(`${BASE_URL}/api/instructor/instructor/change-password`, {
      method: 'PUT',
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(passwordData),
    });
  },

  // --- COURSE LOGIC (Instructor) ---
  getMyCourses: async (token) => {
    return await fetchWithTimeout(`${BASE_URL}/api/courses/my-courses`, {
      method: 'GET',
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
    });
  },

  getOldMyCourses: async (token) => { 
    return await fetchWithTimeout(`${BASE_URL}/api/courses/my-courses`, {
      method: 'GET',
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
    });
  },

  createCourse: async (payload, token) => {
    return await fetchWithTimeout(`${BASE_URL}/api/courses`, {
        method: 'POST',
        headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json' 
        },
        body: JSON.stringify(payload),
    });
  },

  updateCourse: async (courseId, data, token) => {
    return await fetchWithTimeout(`${BASE_URL}/api/courses/${courseId}`, {
        method: 'PUT',
        headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json' 
        },
        body: JSON.stringify(data),
    });
  },

  deleteCourse: async (courseId, token) => {
    return await fetchWithTimeout(`${BASE_URL}/api/courses/${courseId}`, {
      method: 'DELETE',
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json' 
      },
    });
  },

  // --- SECTION LOGIC ---
  getInstructorSections: async (token) => {
    return await fetchWithTimeout(`${BASE_URL}/api/instructor/instructor/my-sections`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` },
    });
  },

  getStudentsBySection: async (sectionId, token) => {
    return await fetchWithTimeout(`${BASE_URL}/api/instructor/instructor/my-sections/${sectionId}`, {
      method: 'GET',
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
    });
  },

  getSections: async (courseId, token) => {
    if (!courseId) throw new Error("Course ID is required to fetch sections");
    return await fetchWithTimeout(`${BASE_URL}/api/courses/${courseId}/sections`, {
      method: 'GET',
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
    });
  },

  createSection: async (courseId, sectionData, token) => {
    return await fetchWithTimeout(`${BASE_URL}/api/courses/${courseId}/sections`, {
        method: 'POST',
        headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json' 
        },
        body: JSON.stringify({
            section_name: sectionData.section_name,
            school_year: sectionData.school_year,
            semester: sectionData.semester
        }),
    });
  },

  getSectionById: async (courseId, sectionId, token) => {
    return await fetchWithTimeout(`${BASE_URL}/api/courses/${courseId}/sections/${sectionId}`, {
      method: 'GET',
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json' 
      },
    });
  },

  updateSection: async (courseId, sectionId, sectionData, token) => {
    return await fetchWithTimeout(`${BASE_URL}/api/courses/${courseId}/sections/${sectionId}`, {
        method: 'PUT',
        headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json' 
        },
        body: JSON.stringify({
            section_name: sectionData.section_name,
            school_year: sectionData.school_year,
            semester: sectionData.semester
        }),
    });
  },

  deleteSection: async (courseId, sectionId, token) => {
    return await fetchWithTimeout(`${BASE_URL}/api/courses/${courseId}/sections/${sectionId}`, {
      method: 'DELETE',
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json' 
      },
    });
  },

  // --- STUDENT MANAGEMENT ---
  getCourseStudentsVerified: async (courseId, token) => {
    return await fetchWithTimeout(`${BASE_URL}/api/instructor/instructor/courses/${courseId}/students`, {
      method: 'GET',
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
    });
  },

  getPendingStudents: async (courseId, sectionId, token) => {
    return await fetchWithTimeout(`${BASE_URL}/api/courses/${courseId}/sections/${sectionId}/pending`, {
      method: 'GET',
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
    });
  },

  approveRejectStudent: async (courseId, sectionId, ssId, status, token) => {
    return await fetchWithTimeout(`${BASE_URL}/api/courses/${courseId}/sections/${sectionId}/students/${ssId}`, {
      method: 'PUT',
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json' 
      },
      body: JSON.stringify({ status: status }), 
    });
  },

  getSectionStudents: async (courseId, sectionId, token) => { 
    return await fetchWithTimeout(`${BASE_URL}/api/courses/${courseId}/sections/${sectionId}`, {
      method: 'GET',
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
    });
  },

  // --- QUEST & CURRICULUM LOGIC ---
  getQuests: async (token) => {
    return await fetchWithTimeout(`${BASE_URL}/api/quests`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
  },

  updateQuest: async (questId, data, token) => {
    return await fetchWithTimeout(`${BASE_URL}/api/quests/${questId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });
  },

  deleteQuest: async (questId, token) => {
    return await fetchWithTimeout(`${BASE_URL}/api/quests/${questId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
  },

  createQuest: async (questData, token) => {
    return await fetchWithTimeout(`${BASE_URL}/api/quests`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(questData)
    });
  },

  toggleQuestPublish: async (questId, token) => {
    return await fetchWithTimeout(`${BASE_URL}/api/quests/${questId}/publish`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
  },

  // --- LEVEL LOGIC (Consolidated with /api prefix) ---
  getLevelsByQuest: async (questId, token) => {
    return await fetchWithTimeout(`${BASE_URL}/api/quests/${questId}/levels`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
  },

  createLevel: async (questId, payload, token) => {
    return await fetchWithTimeout(`${BASE_URL}/api/quests/${questId}/levels`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
  },

  // --- REVIEWS ---
  getSpeakingReviews: async (token) => {
    return await fetchWithTimeout(`${BASE_URL}/api/instructor/speaking-reviews`, {
      method: 'GET',
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
    });
    
  },
  updateLevel: async (questId, levelId, payload, token) => {
  return await fetchWithTimeout(`${BASE_URL}/api/quests/${questId}/levels/${levelId}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });
},

deleteLevel: async (questId, levelId, token) => {
  return await fetchWithTimeout(`${BASE_URL}/api/quests/${questId}/levels/${levelId}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` }
  });
},

// --- ACTIVITY LOGIC ---
  getActivities: async (questId, levelId, token) => {
    return await fetchWithTimeout(`${BASE_URL}/api/quests/${questId}/levels/${levelId}/activities`, {
      method: 'GET',
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json' 
      },
    });
  },

  createActivity: async (questId, levelId, data, token) => {
console.log("Creating Activity with:", { questId, levelId, data }); 
    
    return await fetchWithTimeout(`${BASE_URL}/api/quests/${questId}/levels/${levelId}/activities`, {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json' 
      },
      body: JSON.stringify(data)
    });
},

  updateActivity: async (questId, levelId, activityId, data, token) => {
    return await fetchWithTimeout(`${BASE_URL}/api/quests/${questId}/levels/${levelId}/activities/${activityId}`, {
      method: 'PUT',
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json' 
      },
      body: JSON.stringify(data)
    });
  },

  deleteActivity: async (questId, levelId, activityId, token) => {
    return await fetchWithTimeout(`${BASE_URL}/api/quests/${questId}/levels/${levelId}/activities/${activityId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
  },

  // --- QUIZ LOGIC ---
getQuizzes: async (questId, levelId, token) => {
    return await fetchWithTimeout(`${BASE_URL}/api/quests/${questId}/levels/${levelId}/quizzes`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
    });
  },

  createQuiz: async (questId, levelId, data, token) => {
    return await fetchWithTimeout(`${BASE_URL}/api/quests/${questId}/levels/${levelId}/quizzes`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(data) // { title, difficulty, passing_score }
    });
  },  
  updateQuiz: async (questId, levelId, quizId, data, token) => {
    return await fetchWithTimeout(`${BASE_URL}/api/quests/${questId}/levels/${levelId}/quizzes/${quizId}`, {
      method: 'PUT',
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json' 
      },
      body: JSON.stringify(data)
    });
  },

  deleteQuiz: async (questId, levelId, quizId, token) => {
    return await fetchWithTimeout(`${BASE_URL}/api/quests/${questId}/levels/${levelId}/quizzes/${quizId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
  },

addActivityQuestion: async (questId, levelId, activityId, data, token) => {
    validateParams({ questId, levelId, activityId });
    return await fetchWithTimeout(`${BASE_URL}/api/quests/${questId}/levels/${levelId}/activities/${activityId}/questions`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
  },

  addQuizQuestion: async (questId, levelId, quizId, data, token) => {
    validateParams({ questId, levelId, quizId });
    return await fetchWithTimeout(`${BASE_URL}/api/quests/${questId}/levels/${levelId}/quizzes/${quizId}/questions`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
  },
  
};