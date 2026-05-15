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
    // STUDENT ACTIONS
 /**
 * Updated joinSection
 * Focus: Ensures the token is passed exactly how the backend expects it.
 */
joinSection: async (sectionCode, token) => {
    // 1. Clean the token to be absolutely sure
    const cleanToken = token ? token.replace(/['"]+/g, '').trim() : null;

    if (!cleanToken) {
        console.error("DEBUG: Token is missing before calling joinSection");
        return;
    }

    // 2. Log the Authorization header for debugging (Delete this after fixing)
    console.log("DEBUG: Sending Header ->", `Bearer ${cleanToken.substring(0, 20)}...`);

    try {
        const response = await fetch(`${BASE_URL}/api/student/join-section`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${cleanToken}`
            },
            body: JSON.stringify({ section_code: sectionCode })
        });

        return response;
    } catch (error) {
        console.error("Network Error:", error);
        throw error;
    }
},
    getMySection: async (token) => {
        return await fetch(`${BASE_URL}/api/student/my-section`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
    },

    getMySectionById: async (sectionId, token) => {
        return await fetch(`${BASE_URL}/api/student/my-section/${sectionId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
    },

unenrollSection: async (sectionId, token) => {
    try {
      const response = await fetch(`${BASE_URL}/api/student/my-section/${sectionId}/unenroll`, {
        method: 'DELETE', 
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      return response;
    } catch (error) {
      console.error("Unenroll API Error:", error);
      throw error;
    }
  },
   
  
  /**
 * INSTRUCTOR PROGRESSIVE SELECTION APIS
 * Use these for populating dropdowns step-by-step.
 */

// 1. Get all Departments assigned to the instructor
getInstructorDepartments: async (token) => {
    return await fetchWithTimeout(`${BASE_URL}/api/instructor/departments`, {
        method: 'GET',
        headers: { 
            'Authorization': `Bearer ${token}`, 
            'Content-Type': 'application/json' 
        },
    });
},

// 2. Get Programs under a specific Department
getInstructorPrograms: async (deptId, token) => {
    return await fetchWithTimeout(`${BASE_URL}/api/instructor/departments/${deptId}/programs`, {
        method: 'GET',
        headers: { 
            'Authorization': `Bearer ${token}`, 
            'Content-Type': 'application/json' 
        },
    });
},

// 3. Get Year Levels under a specific Program
getInstructorYearLevels: async (deptId, programId, token) => {
    return await fetchWithTimeout(`${BASE_URL}/api/instructor/departments/${deptId}/programs/${programId}/year-levels`, {
        method: 'GET',
        headers: { 
            'Authorization': `Bearer ${token}`, 
            'Content-Type': 'application/json' 
        },
    });
},

// 4. Get Sections based on Dept, Program, and Year Level
getInstructorSections: async (deptId, programId, yearLevelId, token) => {
    return await fetchWithTimeout(`${BASE_URL}/api/instructor/departments/${deptId}/programs/${programId}/year-levels/${yearLevelId}/sections`, {
        method: 'GET',
        headers: { 
            'Authorization': `Bearer ${token}`, 
            'Content-Type': 'application/json' 
        },
    });
},
getInstructorCourses: async (sectionId, token) => {
    return await fetchWithTimeout(`${BASE_URL}/api/instructor/sections/${sectionId}/courses`, {
        method: 'GET',
        headers: { 
            'Authorization': `Bearer ${token}`, 
            'Content-Type': 'application/json' 
        },
    });
},

    // ─────────────────────────────────────────────────────────────────────────
    // INSTRUCTOR DASHBOARD & SECTION MANAGEMENT
    // ─────────────────────────────────────────────────────────────────────────

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

  // PATCH /api/instructor/sections/:section_id/students/:ss_id/approve
// Approves a student's request to join the section
approveStudent: async (sectionId, ssId, token) => {
    return await fetch(`${BASE_URL}/api/instructor/sections/${sectionId}/students/${ssId}/approve`, {
        method: 'PATCH',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
},

// PATCH /api/instructor/sections/:section_id/students/:ss_id/reject
// Rejects or removes a student's request/status in the section
rejectStudent: async (sectionId, ssId, token) => {
    return await fetch(`${BASE_URL}/api/instructor/sections/${sectionId}/students/${ssId}/reject`, {
        method: 'PATCH',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
},


    getSectionStudents: async (sectionId, token) => {
        return await fetchWithTimeout(
            `${BASE_URL}/api/instructor/sections/${sectionId}/students`,
            {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
            }
        );
    },

// upload materials 

    uploadMaterial: async (sectionId, formData, token) => {
        try {
            const response = await fetch(`${BASE_URL}/api/instructor/sections/${sectionId}/materials`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
                body: formData,
            });
            return response;
        } catch (error) {
            console.error("API Upload Error:", error);
            throw error;
        }
    },
getMaterials: async (sectionId, token) => {
    return await fetch(`${BASE_URL}/api/instructor/sections/${sectionId}/materials`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
    });
},

getSpecificMaterial: async (sectionId, materialId, token) => {
    try {
        const response = await fetch(`${BASE_URL}/instructor/sections/${sectionId}/materials/${materialId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });
        return response;
    } catch (error) {
        console.error("Error fetching specific material:", error);
        throw error;
    }
},

saveCourseCard: async (token, sectionId, courseId) => {
        try {
            const url = `${BASE_URL}/api/instructor/sections/${sectionId}/courses/${courseId}/card`;

            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token.replace(/"/g, '')}`, // Clean token quotes
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                // Kung may kailangang body ang backend, dito ilalagay. 
                // Pero base sa URL, mukhang path parameters lang ang gamit.
                body: JSON.stringify({ 
                    timestamp: new Date().toISOString() 
                })
            });

            return response;
        } catch (error) {
            console.error("API Error [saveCourseCard]:", error);
            throw error;
        }
    },
    // ... (existing codes)

  

    /**
     * GET: FETCH SAVED COURSE CARDS
     * Kinukuha ang lahat ng permanenteng cards mula sa database.
     */
    getSavedCourseCards: async (token) => {
        try {
            const url = `${BASE_URL}/api/instructor/course-card`;
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token.replace(/"/g, '')}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            });
            return response;
        } catch (error) {
            console.error("API Error [getSavedCourseCards]:", error);
            throw error;
        }
    },
    
    // ─────────────────────────────────────────────────────────────────────────
    // CM ASSIGN QUEST MODAL
    // ─────────────────────────────────────────────────────────────────────────
getAllDepartments: async (token) => {
        try {
            const response = await fetch(`${BASE_URL}/api/curriculum-manager/departments`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            return response;
        } catch (error) {
            console.error("API Error (getAllDepartments):", error);
            throw error;
        }
    },

    // 2. Get Programs by Department ID
    getProgramsByDept: async (deptId, token) => {
        try {
            const response = await fetch(`${BASE_URL}/api/curriculum-manager/departments/${deptId}/programs`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            return response;
        } catch (error) {
            console.error("API Error (getProgramsByDept):", error);
            throw error;
        }
    },

    // 3. Get Year Levels by Program
    getYearLevelsByProgram: async (deptId, programId, token) => {
        try {
            const response = await fetch(`${BASE_URL}/api/curriculum-manager/departments/${deptId}/programs/${programId}/year-levels`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            return response;
        } catch (error) {
            console.error("API Error (getYearLevelsByProgram):", error);
            throw error;
        }
    },

    // 4. Get Sections by Year Level
    getSectionsByYear: async (deptId, programId, yearLevelId, token) => {
        try {
            const response = await fetch(`${BASE_URL}/api/curriculum-manager/departments/${deptId}/programs/${programId}/year-levels/${yearLevelId}/sections`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            return response;
        } catch (error) {
            console.error("API Error (getSectionsByYear):", error);
            throw error;
        }
    },

    // 5. Get Courses by Section
    // Note: If you need to fetch multiple sections, you might need to loop this in your component 
    // or adjust based on if your backend supports multiple IDs.
    getCoursesBySection: async (deptId, programId, yearLevelId, sectionId, token) => {
        try {
            const response = await fetch(`${BASE_URL}/api/curriculum-manager/departments/${deptId}/programs/${programId}/year-levels/${yearLevelId}/sections/${sectionId}/courses`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            return response;
        } catch (error) {
            console.error("API Error (getCoursesBySection):", error);
            throw error;
        }
    },

    // 6. Assign Quest to Courses (Body format: { "course_ids": [1, 2, 3] })
    assignQuestToCourses: async (questId, courseIds, token) => {
        try {
            const response = await fetch(`${BASE_URL}/api/quests/${questId}/assign`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    course_ids: courseIds 
                })
            });
            return response;
        } catch (error) {
            console.error("API Error (assignQuestToCourses):", error);
            throw error;
        }
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
getCourses: async (deptId, programId, yearLevelId, sectionId, token) => {
        validateParams({ deptId, programId, yearLevelId, sectionId });
        return await fetchWithTimeout(
            `${BASE_URL}/api/curriculum-manager/departments/${deptId}/programs/${programId}/year-levels/${yearLevelId}/sections/${sectionId}/courses`, 
            {
                method: 'GET',
                headers: { 
                    'Authorization': `Bearer ${token}`, 
                    'Content-Type': 'application/json' 
                }
            }
        );
    },

    /**
     * Alias for fetching courses by section (Standardized with the rest of the module).
     */
    getCoursesBySection: async (deptId, programId, yearLevelId, sectionId, token) => {
        validateParams({ deptId, programId, yearLevelId, sectionId });
        return await fetchWithTimeout(
            `${BASE_URL}/api/curriculum-manager/departments/${deptId}/programs/${programId}/year-levels/${yearLevelId}/sections/${sectionId}/courses`, 
            {
                method: 'GET',
                headers: { 
                    'Authorization': `Bearer ${token}`, 
                    'Content-Type': 'application/json' 
                }
            }
        );
    },

    /**
     * Creates a new course record within the specified Section.
     * Path: departments/:deptId/programs/:programId/year-levels/:yearLevelId/sections/:sectionId/courses
     */
    createCourse: async (deptId, programId, yearLevelId, sectionId, courseData, token) => {
        validateParams({ deptId, programId, yearLevelId, sectionId });
        return await fetchWithTimeout(
            `${BASE_URL}/api/curriculum-manager/departments/${deptId}/programs/${programId}/year-levels/${yearLevelId}/sections/${sectionId}/courses`, 
            {
                method: 'POST',
                headers: { 
                    'Authorization': `Bearer ${token}`, 
                    'Content-Type': 'application/json' 
                },
                body: JSON.stringify(courseData),
            }
        );
    },

    /**
     * Deletes a course by its unique ID.
     * Note: If your backend requires full hierarchy for delete, 
     * the path would follow the same pattern as GET/POST.
     */
    deleteCourse: async (courseId, token) => {
        if (!courseId) throw new Error("Course ID is required for deletion.");
        return await fetchWithTimeout(
            `${BASE_URL}/api/curriculum-manager/courses/${courseId}`, 
            {
                method: 'DELETE',
                headers: { 
                    'Authorization': `Bearer ${token}`, 
                    'Content-Type': 'application/json' 
                }
            }
        );
    },
   // ─────────────────────────────────────────────────────────────────────────
    // DEPARTMENTS
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Fetch all departments
     */
    getDepartments: async (token) => {
        return await fetchWithTimeout(`${BASE_URL}/api/curriculum-manager/departments`, {
            method: 'GET',
            headers: { 
                'Authorization': `Bearer ${token}`, 
                'Content-Type': 'application/json' 
            },
        });
    },

    /**
     * Create a new department
     */
    createDepartment: async (deptData, token) => {
        return await fetchWithTimeout(`${BASE_URL}/api/curriculum-manager/departments`, {
            method: 'POST',
            headers: { 
                'Authorization': `Bearer ${token}`, 
                'Content-Type': 'application/json' 
            },
            body: JSON.stringify(deptData),
        });
    },

    /**
     * Update an existing department
     */
    updateDepartment: async (deptId, deptData, token) => {
        validateParams({ deptId }); 
        return await fetchWithTimeout(`${BASE_URL}/api/curriculum-manager/departments/${deptId}`, {
            method: 'PUT',
            headers: { 
                'Authorization': `Bearer ${token}`, 
                'Content-Type': 'application/json' 
            },
            body: JSON.stringify(deptData),
        });
    },

    /**
     * Delete a department
     */
    deleteDepartment: async (deptId, token) => {
        validateParams({ deptId });
        return await fetchWithTimeout(`${BASE_URL}/api/curriculum-manager/departments/${deptId}`, {
            method: 'DELETE',
            headers: { 
                'Authorization': `Bearer ${token}`, 
                'Content-Type': 'application/json' 
            },
        });
    },

    // ─────────────────────────────────────────────────────────────────────────
    // PROGRAMS
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Fetch all programs under a specific department
     */
    getPrograms: async (deptId, token) => {
        validateParams({ deptId });
        return await fetchWithTimeout(`${BASE_URL}/api/curriculum-manager/departments/${deptId}/programs`, {
            method: 'GET',
            headers: { 
                'Authorization': `Bearer ${token}`, 
                'Content-Type': 'application/json' 
            },
        });
    },

    /**
     * Create a new program under a department
     */
    createProgram: async (deptId, programData, token) => {
        validateParams({ deptId });
        return await fetchWithTimeout(`${BASE_URL}/api/curriculum-manager/departments/${deptId}/programs`, {
            method: 'POST',
            headers: { 
                'Authorization': `Bearer ${token}`, 
                'Content-Type': 'application/json' 
            },
            body: JSON.stringify(programData),
        });
    },

    /**
     * Update a program within a department
     */
    updateProgram: async (deptId, programId, programData, token) => {
        validateParams({ deptId, programId });
        return await fetchWithTimeout(`${BASE_URL}/api/curriculum-manager/departments/${deptId}/programs/${programId}`, {
            method: 'PUT',
            headers: { 
                'Authorization': `Bearer ${token}`, 
                'Content-Type': 'application/json' 
            },
            body: JSON.stringify(programData),
        });
    },

    /**
     * Delete a program
     */
    deleteProgram: async (deptId, programId, token) => {
        validateParams({ deptId, programId });
        return await fetchWithTimeout(`${BASE_URL}/api/curriculum-manager/departments/${deptId}/programs/${programId}`, {
            method: 'DELETE',
            headers: { 
                'Authorization': `Bearer ${token}`, 
                'Content-Type': 'application/json' 
            },
        });
    },

    // ─────────────────────────────────────────────────────────────────────────
    // YEAR LEVELS
    // ─────────────────────────────────────────────────────────────────────────

getYearLevels: async (deptId, programId, token) => {
    // Check if required IDs are present before fetching
    if (!deptId || !programId) throw new Error("Missing Department or Program ID");
    
    return await fetch(`${BASE_URL}/api/curriculum-manager/departments/${deptId}/programs/${programId}/year-levels`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    });
},

/**
 * Create a new Year Level
 * Signature: (deptId, programId, payload, token)
 */
createYearLevel: async (deptId, programId, payload, token) => {
    if (!deptId || !programId) throw new Error("Missing Department or Program ID");
    
    return await fetch(`${BASE_URL}/api/curriculum-manager/departments/${deptId}/programs/${programId}/year-levels`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
    });
},

/**
 * Update an existing Year Level
 * Signature: (deptId, programId, yearLevelId, payload, token)
 */
updateYearLevel: async (deptId, programId, yearLevelId, payload, token) => {
    if (!deptId || !programId || !yearLevelId) throw new Error("Missing required IDs");
    
    return await fetch(`${BASE_URL}/api/curriculum-manager/departments/${deptId}/programs/${programId}/year-levels/${yearLevelId}`, {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
    });
},

/**
 * Delete a Year Level
 * Signature: (deptId, programId, yearLevelId, token)
 */
deleteYearLevel: async (deptId, programId, yearLevelId, token) => {
    if (!deptId || !programId || !yearLevelId) throw new Error("Missing required IDs");
    
    return await fetch(`${BASE_URL}/api/curriculum-manager/departments/${deptId}/programs/${programId}/year-levels/${yearLevelId}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    });
},

    // ─────────────────────────────────────────────────────────────────────────
    // SECTIONS
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Fetch all sections for a specific year level
     */
    getSections: async (deptId, programId, yearLevelId, token) => {
        validateParams({ deptId, programId, yearLevelId });
        return await fetchWithTimeout(`${BASE_URL}/api/curriculum-manager/departments/${deptId}/programs/${programId}/year-levels/${yearLevelId}/sections`, {
            method: 'GET',
            headers: { 
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json' 
            }
        });
    },

    /**
     * Create a new section
     */
    createSection: async (deptId, programId, yearLevelId, sectionData, token) => {
        validateParams({ deptId, programId, yearLevelId });
        return await fetchWithTimeout(`${BASE_URL}/api/curriculum-manager/departments/${deptId}/programs/${programId}/year-levels/${yearLevelId}/sections`, {
            method: 'POST',
            headers: { 
                'Authorization': `Bearer ${token}`, 
                'Content-Type': 'application/json' 
            },
            body: JSON.stringify(sectionData),
        });
    },

    /**
     * Update an existing section
     */
    updateSection: async (deptId, programId, yearLevelId, sectionId, sectionData, token) => {
        validateParams({ deptId, programId, yearLevelId, sectionId });
        return await fetchWithTimeout(`${BASE_URL}/api/curriculum-manager/departments/${deptId}/programs/${programId}/year-levels/${yearLevelId}/sections/${sectionId}`, {
            method: 'PUT',
            headers: { 
                'Authorization': `Bearer ${token}`, 
                'Content-Type': 'application/json' 
            },
            body: JSON.stringify(sectionData),
        });
    },

    /**
     * Delete a section
     */
    deleteSection: async (deptId, programId, yearLevelId, sectionId, token) => {
        validateParams({ deptId, programId, yearLevelId, sectionId });
        return await fetchWithTimeout(`${BASE_URL}/api/curriculum-manager/departments/${deptId}/programs/${programId}/year-levels/${yearLevelId}/sections/${sectionId}`, {
            method: 'DELETE',
            headers: { 
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json' 
            }
        });
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
            method: 'PATCH',
            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
        });
    },

assignQuestToCourses: async (questId, courseIds, token) => {
        try {
            const response = await fetch(`${BASE_URL}/api/quests/${questId}/assign`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                // Matches the requested body structure: {"course_ids": [1]}
                body: JSON.stringify({
                    course_ids: courseIds 
                })
            });
            return response;
        } catch (error) {
            console.error("API Error (assignQuestToCourses):", error);
            throw error;
        }
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

    updateLevel: async (questId, quest_level_id, payload, token) => {
        validateParams({ questId, quest_level_id });
        return await fetchWithTimeout(`${BASE_URL}/api/quests/${questId}/levels/${quest_level_id}`, {
            method: 'PUT',
            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
    },

    deleteLevel: async (questId, quest_level_id, token) => {
        validateParams({ questId, quest_level_id });
        return await fetchWithTimeout(`${BASE_URL}/api/quests/${questId}/levels/${quest_level_id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
    },

    // CM Activity CRUD
    getActivitiesCM: async (questId, quest_level_id, token) => {
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

    // Activity Add Question //____________________________________________________________________________________________

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

    // CM Quiz CRUD
    getQuizzesCM: async (questId, quest_level_id, token) => {
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

        // Quiz Add Question // ______________________________________________________________________________________________________


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

    
    getQuizQuestions: async (questId, quest_level_id, quizId, token) => {
        validateParams({ questId, quest_level_id, quizId });
        return await fetchWithTimeout(
            `${BASE_URL}/api/quests/${questId}/levels/${quest_level_id}/quizzes/${quizId}/questions`,
            { method: 'GET', headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' } }
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

    // ─────────────────────────────────────────────────────────────────────────
    // STUDENT QUEST PAGES
    // ─────────────────────────────────────────────────────────────────────────

    getMyQuests: async (token) => {
        try {
            return await fetch(`${BASE_URL}/api/student/my-quests`, {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
            });
        } catch (error) {
            console.error('Error in getMyQuests:', error);
            throw error;
        }
    },

    getQuestDetails: async (questId, token) => {
        try {
            return await fetch(`${BASE_URL}/api/student/my-quests/${questId}`, {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
            });
        } catch (error) {
            console.error('Error in getQuestDetails:', error);
            throw error;
        }
    },

  getQuestLevels: async (questId, token) => {
        try {
            // Siguraduhing backticks (`) ang gamit at hindi single quotes (')
            return await fetch(`${BASE_URL}/api/student/my-quests/${questId}/levels`, {
                method: 'GET',
                headers: { 
                    'Authorization': `Bearer ${token}`, 
                    'Content-Type': 'application/json' 
                },
            });
        } catch (error) {
            console.error('Error in getQuestLevels:', error);
            throw error;
        }
    },
    // ─────────────────────────────────────────────────────────────────────────
    // STUDENT GAME — ACTIVITY

    // Get activity info for a level (used by QuestLevels modal)
    getActivities: async (quest_level_id, token) => {
        validateParams({ quest_level_id });
        return await fetch(
            `${BASE_URL}/api/student/levels/${quest_level_id}/activity`,
            { method: 'GET', headers: { 'Authorization': `Bearer ${token}` } }
        );
    },

    // Get next question for an activity session
    getNextActivityQuestion: async (activityId, token) => {
        validateParams({ activityId });
        return await fetch(
            `${BASE_URL}/api/student/activity/${activityId}/next-question`,
            { method: 'GET', headers: { 'Authorization': `Bearer ${token}` } }
        );
    },

    // Submit answer for an activity question
    submitActivityAnswer: async (activityId, questionId, answerData, token) => {
        validateParams({ activityId, questionId });
        return await fetch(
            `${BASE_URL}/api/student/activity/${activityId}/questions/${questionId}/answer`,
            {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify(answerData)
            }
        );
    },

    // Finish activity session
    finishActivity: async (activityId, token) => {
        validateParams({ activityId });
        return await fetch(
            `${BASE_URL}/api/student/activity/${activityId}/finish`,
            {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            }
        );
    },

   //Retake Activity session
    retakeActivity: async (activityId, token) => {
        try {
            const response = await fetch(`${BASE_URL}/api/student/activity/${activityId}/retake`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                }
            });
            return response;
        } catch (error) {
            console.error("API Error (Retake Activity):", error);
            throw error;
        }
    },

    // ─────────────────────────────────────────────────────────────────────────
    // STUDENT GAME — QUIZ

    // Get quiz info for a level (used by QuestLevels modal)
    getQuizzes: async (quest_level_id, token) => {
        validateParams({ quest_level_id });
        return await fetch(
            `${BASE_URL}/api/student/levels/${quest_level_id}/quiz`,
            { method: 'GET', headers: { 'Authorization': `Bearer ${token}` } }
        );
    },

    // Get next question for a quiz session
    getNextQuizQuestion: async (quizId, token) => {
        validateParams({ quizId });
        return await fetch(
            `${BASE_URL}/api/student/quiz/${quizId}/next-question`,
            { method: 'GET', headers: { 'Authorization': `Bearer ${token}` } }
        );
    },

    // Submit answer for a quiz question
    submitQuizAnswer: async (quizId, questionId, answerData, token) => {
        validateParams({ quizId, questionId });
        return await fetch(
            `${BASE_URL}/api/student/quiz/${quizId}/questions/${questionId}/answer`,
            {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify(answerData)
            }
        );
    },

    // Finish quiz session
    finishQuiz: async (quizId, token) => {
        validateParams({ quizId });
        return await fetch(
            `${BASE_URL}/api/student/quiz/${quizId}/finish`,
            {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            }
        );
    },
    
    //Retake Quiz session
    retakeQuiz: async (quizId, token) => {
        try {
            const response = await fetch(`${BASE_URL}/api/student/quiz/${quizId}/retake`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                }
            });
            return response;
        } catch (error) {
            console.error("API Error (Retake Quiz):", error);
            throw error;
        }
    },

 // Get Total Points and Coins // >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

 getPoints: async (token) => {
    try {
      const response = await fetch(`${BASE_URL}/api/student/points`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      return response;
    } catch (error) {
      console.error("Get Points API Error:", error);
      throw error;
    }
  },

  getCoins: async (token) => {
    try {
      const response = await fetch(`${BASE_URL}/api/student/coins`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      return response;
    } catch (error) {
      console.error("Get Coins API Error:", error);
      throw error;
    }
  },

  // Student get material from instructor //
  getSectionMaterials: async (sectionId, token) => {
        try {
            const response = await fetch(`${BASE_URL}/api/student/sections/${sectionId}/materials`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            return response;
        } catch (error) {
            console.error("Error fetching section materials:", error);
            throw error;
        }
    },

    getMaterialById: async (sectionId, materialId, token) => {
        try {
            const response = await fetch(`${BASE_URL}/api/student/sections/${sectionId}/materials/${materialId}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            return response;
        } catch (error) {
            console.error("Error fetching material details:", error);
            throw error;
        }
    },
  
    getStudentProgress: async (token, sectionId = null) => {
        try {
            // Gumawa ng URL, magdagdag ng query param kung may sectionId
            let url = `${BASE_URL}/api/student/progress`;
            if (sectionId) {
                url += `?section_id=${sectionId}`;
            }

            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token.replace(/"/g, '')}`, // Nililinis ang token
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            });

            return response;
        } catch (error) {
            console.error("API Error [getStudentProgress]:", error);
            throw error;
        }
    },
    getStudentLeaderboard: async (token, sectionId = null) => {
        try {
            // Gumawa ng URL, magdagdag ng filter para sa section kung meron
            let url = `${BASE_URL}/api/student/leaderboard`;
            if (sectionId) {
                url += `?section_id=${sectionId}`;
            }

            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token.replace(/"/g, '')}`, // Nililinis ang extra quotes
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            });

            return response;
        } catch (error) {
            console.error("API Error [getStudentLeaderboard]:", error);
            throw error;
        }
    },

 
};