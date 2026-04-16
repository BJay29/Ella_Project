const BASE_URL = import.meta.env.VITE_BACKEND_URL || 'https://ellaquest-backend.onrender.com';

const fetchWithTimeout = (url, options = {}, timeout = 30000) => {
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
    ping: async () => {
        try {
            await fetchWithTimeout(`${BASE_URL}/`, { method: 'GET', mode: 'no-cors' }, 30000);
        } catch { }
    },

    initiateGoogleLogin: () => { window.location.href = `${BASE_URL}/api/user/google`; },

    googleCallback: async () => {
        return await fetchWithTimeout(`${BASE_URL}/api/user/google/callback`, { method: 'GET' });
    },

    register: async (formData) => {
        return await fetchWithTimeout(`${BASE_URL}/api/user/register-sso`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                first_name: formData.firstName,
                last_name: formData.lastName,
                email: formData.email.trim().toLowerCase(),
                password: formData.password
            }),
        });
    },

    login: async (email, password) => {
        return await fetchWithTimeout(`${BASE_URL}/api/user/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
        });
    },

    getInstructorProfile: async (token) => {
        return await fetchWithTimeout(`${BASE_URL}/api/instructor/instructor/profile`, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` },
        });
    },

    updateInstructorProfile: async (profileData, token) => {
        return await fetchWithTimeout(`${BASE_URL}/api/instructor/instructor/profile`, {
            method: 'PUT',
            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify(profileData),
        });
    },

    changePassword: async (passwordData, token) => {
        return await fetchWithTimeout(`${BASE_URL}/api/instructor/instructor/change-password`, {
            method: 'PUT',
            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify(passwordData),
        });
    },

    // ─────────────────────────────────────────────────────────────────────────
    // STUDENT ACTIONS (Join Section & Dashboard)
    // ─────────────────────────────────────────────────────────────────────────
    joinSection: async (token, { section_code }) => {
       validateParams({ section_code });
    return await fetchWithTimeout(
        `${BASE_URL}/api/student/student/join-section`,
        {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ section_code }),
        }
    );
},

    // Kunin lahat ng section na sinalihan ng student
  getMySection: async (token) => {
        return await fetch(`${BASE_URL}/api/student/student/my-section`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        }); 
    },

    getMySectionById: async (sectionId, token) => {
        return await fetch(`${BASE_URL}/api/student/student/my-section/${sectionId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
    },


    // ─────────────────────────────────────────────────────────────────────────
    // INSTRUCTOR SECTION SELECTION (Modal: Course → Dept → Program → Section)
    // ─────────────────────────────────────────────────────────────────────────

    getInstructorCourses: async (token) => {
        return await fetchWithTimeout(`${BASE_URL}/api/instructor/courses`, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        });
    },

    getInstructorDepartments: async (courseId, token) => {
        validateParams({ courseId });
        return await fetchWithTimeout(`${BASE_URL}/api/instructor/courses/${courseId}/departments`, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        });
    },

    getInstructorPrograms: async (courseId, deptId, token) => {
        validateParams({ courseId, deptId });
        return await fetchWithTimeout(`${BASE_URL}/api/instructor/courses/${courseId}/departments/${deptId}/programs`, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        });
    },

    getInstructorSectionsByProgram: async (courseId, deptId, programId, token) => {
        validateParams({ courseId, deptId, programId });
        return await fetchWithTimeout(
            `${BASE_URL}/api/instructor/courses/${courseId}/departments/${deptId}/programs/${programId}/sections`,
            {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
            }
        );
    },

    // ─────────────────────────────────────────────────────────────────────────
    // INSTRUCTOR DASHBOARD & SECTION MANAGEMENT
    // ─────────────────────────────────────────────────────────────────────────

    assignSectionToInstructor: async (sectionId, token) => {
        validateParams({ sectionId });
        return await fetchWithTimeout(`${BASE_URL}/api/instructor/sections/assign`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ sectionId }),
        });
    },

    unassignSection: async (sectionId, token) => {
        validateParams({ sectionId });
        return await fetchWithTimeout(`${BASE_URL}/api/instructor/sections/${sectionId}/unassign`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        });
    },

    getInstructorSections: async (token) => {
        return await fetchWithTimeout(`${BASE_URL}/api/instructor/instructor/my-sections`, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` },
        });
    },

    // Get Section Details / Approved Students
// Works for both Instructor (to see students) and Student (to see section info)
getSectionDetails: async (sectionId, token) => {
    return await fetchWithTimeout(
        `${BASE_URL}/api/instructor/sections/${sectionId}`,
        {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
        }
    );
},

    // Get Pending Students for a Specific Section
  getPendingStudents: async (sectionId, token) => {
    return await fetchWithTimeout(
        `${BASE_URL}/api/instructor/sections/${sectionId}/students/pending`,
        {
            method: 'GET',
            headers: { 
                'Authorization': `Bearer ${token}`, 
                'Content-Type': 'application/json' 
            },  
        }
    );
},
    
// Approve or Reject Student Admission
approveRejectStudent: async (sectionId, ssId, status, token) => {
  return await fetchWithTimeout(
        `${BASE_URL}/api/instructor/sections/${sectionId}/students/${ssId}`,
        {
            method: 'PATCH',
            headers: { 
                'Authorization': `Bearer ${token}`, 
                'Content-Type': 'application/json' 
            },
            body: JSON.stringify({ status }),
        }
    );
},

    // ─────────────────────────────────────────────────────────────────────────
    // QUESTS (Instructor)
    // ─────────────────────────────────────────────────────────────────────────

    getInstructorQuestLevels: async (questId, token) => {
        validateParams({ questId });
        return await fetchWithTimeout(`${BASE_URL}/api/instructor/quests/${questId}/levels`, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        });
    },

    // ─────────────────────────────────────────────────────────────────────────
    // COURSES (CM)
    // ─────────────────────────────────────────────────────────────────────────

    getMyCourses: async (token) => {
        return await fetchWithTimeout(`${BASE_URL}/api/courses/my-courses`, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        });
    },

    createCourse: async (payload, token) => {
        return await fetchWithTimeout(`${BASE_URL}/api/courses`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });
    },

    updateCourse: async (courseId, data, token) => {
        validateParams({ courseId });
        return await fetchWithTimeout(`${BASE_URL}/api/courses/${courseId}`, {
            method: 'PUT',
            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
    },

    deleteCourse: async (courseId, token) => {
        validateParams({ courseId });
        return await fetchWithTimeout(`${BASE_URL}/api/courses/${courseId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        });
    },

    // ─────────────────────────────────────────────────────────────────────────
    // DEPARTMENTS
    // ─────────────────────────────────────────────────────────────────────────

    getDepartmentsForAssign: async (token) => {
        return await fetchWithTimeout(`${BASE_URL}/api/curriculum-manager/departments`, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        });
    },

    getDepartments: async (courseId, token) => {
        validateParams({ courseId });
        return await fetchWithTimeout(`${BASE_URL}/api/courses/${courseId}/departments`, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        });
    },

    createDepartment: async (courseId, deptData, token) => {
        validateParams({ courseId });
        return await fetchWithTimeout(`${BASE_URL}/api/courses/${courseId}/departments`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify(deptData),
        });
    },

    updateDepartment: async (courseId, deptId, deptData, token) => {
        validateParams({ courseId, deptId });
        return await fetchWithTimeout(`${BASE_URL}/api/courses/${courseId}/departments/${deptId}`, {
            method: 'PUT',
            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify(deptData),
        });
    },

    deleteDepartment: async (courseId, deptId, token) => {
        validateParams({ courseId, deptId });
        return await fetchWithTimeout(`${BASE_URL}/api/courses/${courseId}/departments/${deptId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        });
    },

    // ─────────────────────────────────────────────────────────────────────────
    // PROGRAMS
    // ─────────────────────────────────────────────────────────────────────────

    getProgramsByDept: async (deptId, token) => {
        validateParams({ deptId });
        return await fetchWithTimeout(`${BASE_URL}/api/curriculum-manager/departments/${deptId}/programs`, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        });
    },

    getPrograms: async (courseId, deptId, token) => {
        validateParams({ courseId, deptId });
        return await fetchWithTimeout(`${BASE_URL}/api/courses/${courseId}/departments/${deptId}/programs`, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        });
    },

    createProgram: async (courseId, deptId, programData, token) => {
        validateParams({ courseId, deptId });
        return await fetchWithTimeout(
            `${BASE_URL}/api/courses/${courseId}/departments/${deptId}/programs`,
            {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify(programData),
            }
        );
    },

    updateProgram: async (courseId, deptId, programId, programData, token) => {
        validateParams({ courseId, deptId, programId });
        return await fetchWithTimeout(
            `${BASE_URL}/api/courses/${courseId}/departments/${deptId}/programs/${programId}`,
            {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify(programData),
            }
        );
    },

    deleteProgram: async (courseId, deptId, programId, token) => {
        validateParams({ courseId, deptId, programId });
        return await fetchWithTimeout(
            `${BASE_URL}/api/courses/${courseId}/departments/${deptId}/programs/${programId}`,
            {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
            }
        );
    },

    // ─────────────────────────────────────────────────────────────────────────
    // SECTIONS
    // ─────────────────────────────────────────────────────────────────────────

    getSectionsByProgramId: async (programId, token) => {
        validateParams({ programId });
        return await fetchWithTimeout(`${BASE_URL}/api/curriculum-manager/programs/${programId}/sections`, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        });
    },

    getSectionsByProgram: async (courseId, deptId, programId, token) => {
        validateParams({ courseId, deptId, programId });
        return await fetchWithTimeout(
            `${BASE_URL}/api/courses/${courseId}/departments/${deptId}/programs/${programId}/sections`,
            {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
            }
        );
    },

      getSections: async (courseId, deptId, programId, token) => {
        validateParams({ courseId, deptId, programId });
        return await fetchWithTimeout(
            `${BASE_URL}/api/courses/${courseId}/departments/${deptId}/programs/${programId}/sections`,

            {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },

            }
        );
 },

    createSection: async (courseId, deptId, programId, sectionData, token) => {
        validateParams({ courseId, deptId, programId });
        return await fetchWithTimeout(
            `${BASE_URL}/api/courses/${courseId}/departments/${deptId}/programs/${programId}/sections`,
            {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    section_name: sectionData.section_name,
                    school_year:  sectionData.school_year,
                    semester:     sectionData.semester,
                }),
            }
        );
    },

    updateSection: async (courseId, deptId, programId, sectionId, sectionData, token) => {
        validateParams({ courseId, deptId, programId, sectionId });
        return await fetchWithTimeout(
            `${BASE_URL}/api/courses/${courseId}/departments/${deptId}/programs/${programId}/sections/${sectionId}`,
            {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify(sectionData),
            }
        );
    },

    deleteSection: async (courseId, deptId, programId, sectionId, token) => {
        validateParams({ courseId, deptId, programId, sectionId });
        return await fetchWithTimeout(
            `${BASE_URL}/api/courses/${courseId}/departments/${deptId}/programs/${programId}/sections/${sectionId}`,
            {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
            }
        );
    },

    // ─────────────────────────────────────────────────────────────────────────
    // QUESTS & ACTIVITIES (CM)
    // ─────────────────────────────────────────────────────────────────────────

    getQuests: async (token) => {
        return await fetchWithTimeout(`${BASE_URL}/api/quests`, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
        });
    },

    createQuest: async (questData, token) => {
        return await fetchWithTimeout(`${BASE_URL}/api/quests`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify(questData)
        });
    },

    updateQuest: async (questId, data, token) => {
        validateParams({ questId });
        return await fetchWithTimeout(`${BASE_URL}/api/quests/${questId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify(data)
        });
    },

    deleteQuest: async (questId, token) => {
        validateParams({ questId });
        return await fetchWithTimeout(`${BASE_URL}/api/quests/${questId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
    },

    toggleQuestPublish: async (questId, token) => {
        validateParams({ questId });
        return await fetchWithTimeout(`${BASE_URL}/api/quests/${questId}/publish`, {
            method: 'PUT',
            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
        });
    },

    assignQuestToSections: async (questId, sectionIds, token) => {
        validateParams({ questId });
        return await fetchWithTimeout(`${BASE_URL}/api/quests/${questId}/assign`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ sectionIds })
        });
    },

    getLevelsByQuest: async (questId, token) => {
        validateParams({ questId });
        return await fetchWithTimeout(`${BASE_URL}/api/quests/${questId}/levels`, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
        });
    },

    createLevel: async (questId, payload, token) => {
        validateParams({ questId });
        return await fetchWithTimeout(`${BASE_URL}/api/quests/${questId}/levels`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
    },

    updateLevel: async (questId, levelId, payload, token) => {
        validateParams({ questId, levelId });
        return await fetchWithTimeout(`${BASE_URL}/api/quests/${questId}/levels/${levelId}`, {
            method: 'PUT',
            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
    },

    deleteLevel: async (questId, levelId, token) => {
        validateParams({ questId, levelId });
        return await fetchWithTimeout(`${BASE_URL}/api/quests/${questId}/levels/${levelId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
    },

    getActivities: async (questId, quest_level_id, token) => {
        validateParams({ questId, quest_level_id });
        return await fetchWithTimeout(
            `${BASE_URL}/api/quests/${questId}/levels/${quest_level_id}/activities`,
            { method: 'GET', headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' } }
        );
    },

    createActivity: async (questId, quest_level_id, payload, token) => {
        validateParams({ questId, quest_level_id });
        return await fetchWithTimeout(
            `${BASE_URL}/api/quests/${questId}/levels/${quest_level_id}/activities`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(payload)
            }
        );
    },

    updateActivity: async (questId, quest_level_id, activityId, data, token) => {
        validateParams({ questId, quest_level_id, activityId });
        return await fetchWithTimeout(
            `${BASE_URL}/api/quests/${questId}/levels/${quest_level_id}/activities/${activityId}`,
            {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            }
        );
    },

    deleteActivity: async (questId, quest_level_id, activityId, token) => {
        validateParams({ questId, quest_level_id, activityId });
        return await fetchWithTimeout(
            `${BASE_URL}/api/quests/${questId}/levels/${quest_level_id}/activities/${activityId}`,
            { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } }
        );
    },

    getActivityQuestions: async (questId, quest_level_id, activityId, token) => {
        validateParams({ questId, quest_level_id, activityId });
        return await fetchWithTimeout(
            `${BASE_URL}/api/quests/${questId}/levels/${quest_level_id}/activities/${activityId}/questions`,
            { method: 'GET', headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' } }
        );
    },

    addActivityQuestion: async (questId, quest_level_id, activityId, data, token) => {
        validateParams({ questId, quest_level_id, activityId });
        return await fetchWithTimeout(
            `${BASE_URL}/api/quests/${questId}/levels/${quest_level_id}/activities/${activityId}/questions`,
            {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            }
        );
    },

    updateActivityQuestion: async (questId, quest_level_id, activityId, questionId, data, token) => {
        validateParams({ questId, quest_level_id, activityId, questionId });
        return await fetchWithTimeout(
            `${BASE_URL}/api/quests/${questId}/levels/${quest_level_id}/activities/${activityId}/questions/${questionId}`,
            {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            }
        );
    },

    deleteActivityQuestion: async (questId, quest_level_id, activityId, questionId, token) => {
        validateParams({ questId, quest_level_id, activityId, questionId });
        return await fetchWithTimeout(
            `${BASE_URL}/api/quests/${questId}/levels/${quest_level_id}/activities/${activityId}/questions/${questionId}`,
            { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } }
        );
    },

    getQuizzes: async (questId, quest_level_id, token) => {
        validateParams({ questId, quest_level_id });
        return await fetchWithTimeout(
            `${BASE_URL}/api/quests/${questId}/levels/${quest_level_id}/quizzes`,
            { method: 'GET', headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' } }
        );
    },

    createQuiz: async (questId, quest_level_id, data, token) => {
        validateParams({ questId, quest_level_id });
        return await fetchWithTimeout(
            `${BASE_URL}/api/quests/${questId}/levels/${quest_level_id}/quizzes`,
            {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            }
        );
    },

    updateQuiz: async (questId, quest_level_id, quizId, data, token) => {
        validateParams({ questId, quest_level_id, quizId });
        return await fetchWithTimeout(
            `${BASE_URL}/api/quests/${questId}/levels/${quest_level_id}/quizzes/${quizId}`,
            {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            }
        );
    },

    deleteQuiz: async (questId, quest_level_id, quizId, token) => {
        validateParams({ questId, quest_level_id, quizId });
        return await fetchWithTimeout(
            `${BASE_URL}/api/quests/${questId}/levels/${quest_level_id}/quizzes/${quizId}`,
            { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } }
        );
    },

    getQuizQuestions: async (questId, quest_level_id, quizId, token) => {
        validateParams({ questId, quest_level_id, quizId });
        return await fetchWithTimeout(
            `${BASE_URL}/api/quests/${questId}/levels/${quest_level_id}/quizzes/${quizId}/questions`,
            { method: 'GET', headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' } }
        );
    },

    addQuizQuestion: async (questId, quest_level_id, quizId, data, token) => {
        validateParams({ questId, quest_level_id, quizId });
        return await fetchWithTimeout(
            `${BASE_URL}/api/quests/${questId}/levels/${quest_level_id}/quizzes/${quizId}/questions`,
            {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            }
        );
    },

    updateQuizQuestion: async (questId, quest_level_id, quizId, questionId, data, token) => {
        validateParams({ questId, quest_level_id, quizId, questionId });
        return await fetchWithTimeout(
            `${BASE_URL}/api/quests/${questId}/levels/${quest_level_id}/quizzes/${quizId}/questions/${questionId}`,
            {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            }
        );
    },

    deleteQuizQuestion: async (questId, quest_level_id, quizId, questionId, token) => {
        validateParams({ questId, quest_level_id, quizId, questionId });
        return await fetchWithTimeout(
            `${BASE_URL}/api/quests/${questId}/levels/${quest_level_id}/quizzes/${quizId}/questions/${questionId}`,
            { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } }
        );
    },
};