import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API_BASE = `${BACKEND_URL}/api`;

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Auth APIs
export const authAPI = {
  register: async (name, email, password, role) => {
    const response = await api.post('/auth/register', { name, email, password, role });
    return response.data;
  },
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },
  getMe: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },
};

// Course APIs
export const courseAPI = {
  getCourses: async (params = {}) => {
    const response = await api.get('/courses', { params });
    return response.data;
  },
  getCourse: async (id) => {
    const response = await api.get(`/courses/${id}`);
    return response.data;
  },
  createCourse: async (courseData) => {
    const response = await api.post('/courses', courseData);
    return response.data;
  },
  getInstructorCourses: async () => {
    const response = await api.get('/courses/instructor/my-courses');
    return response.data;
  },
  updateCourse: async (id, courseData) => {
    const response = await api.put(`/courses/${id}`, courseData);
    return response.data;
  },
  deleteCourse: async (id) => {
    const response = await api.delete(`/courses/${id}`);
    return response.data;
  },
};

// Enrollment APIs
export const enrollmentAPI = {
  enroll: async (courseId) => {
    const response = await api.post('/enrollments', { course_id: courseId });
    return response.data;
  },
  getEnrollments: async () => {
    const response = await api.get('/enrollments');
    return response.data;
  },
  checkEnrollment: async (courseId) => {
    const response = await api.get(`/enrollments/course/${courseId}/check`);
    return response.data;
  },
  updateProgress: async (enrollmentId, lessonId, completed) => {
    const response = await api.put(`/enrollments/${enrollmentId}/progress`, {
      lesson_id: lessonId,
      completed,
    });
    return response.data;
  },
};

// Quiz APIs
export const quizAPI = {
  getQuizByLesson: async (lessonId) => {
    const response = await api.get(`/quizzes/lesson/${lessonId}`);
    return response.data;
  },
  submitQuiz: async (quizId, answers) => {
    const response = await api.post(`/quizzes/${quizId}/submit`, { answers });
    return response.data;
  },
};

// Discussion APIs
export const discussionAPI = {
  getDiscussions: async (courseId) => {
    const response = await api.get(`/discussions/course/${courseId}`);
    return response.data;
  },
  createDiscussion: async (courseId, title, content, category) => {
    const response = await api.post('/discussions', {
      course_id: courseId,
      title,
      content,
      category,
    });
    return response.data;
  },
  likeDiscussion: async (discussionId) => {
    const response = await api.put(`/discussions/${discussionId}/like`);
    return response.data;
  },
};

// Certificate APIs
export const certificateAPI = {
  getCertificates: async () => {
    const response = await api.get('/certificates');
    return response.data;
  },
  generateCertificate: async (courseId) => {
    const response = await api.post('/certificates/generate', { course_id: courseId });
    return response.data;
  },
  getCertificate: async (certificateId) => {
    const response = await api.get(`/certificates/${certificateId}`);
    return response.data;
  },
};

// User APIs
export const userAPI = {
  getProfile: async () => {
    const response = await api.get('/users/profile');
    return response.data;
  },
  updateProfile: async (profileData) => {
    const response = await api.put('/users/profile', profileData);
    return response.data;
  },
  getUser: async (userId) => {
    const response = await api.get(`/users/${userId}`);
    return response.data;
  },
};

// Settings APIs
export const settingsAPI = {
  getSettings: async () => {
    const response = await api.get('/settings');
    return response.data;
  },
  updateSettings: async (settings) => {
    const response = await api.put('/settings', settings);
    return response.data;
  },
};

// Admin APIs
export const adminAPI = {
  getUsers: async (params = {}) => {
    const response = await api.get('/admin/users', { params });
    return response.data;
  },
  getUserDetails: async (userId) => {
    const response = await api.get(`/admin/users/${userId}`);
    return response.data;
  },
  updateUserRole: async (userId, newRole) => {
    const response = await api.put(`/admin/users/${userId}/role?new_role=${newRole}`);
    return response.data;
  },
  deleteUser: async (userId) => {
    const response = await api.delete(`/admin/users/${userId}`);
    return response.data;
  },
  createUser: async (userData) => {
    const response = await api.post('/admin/users', null, {
      params: userData
    });
    return response.data;
  },
  getStats: async () => {
    const response = await api.get('/admin/stats');
    return response.data;
  },
};

export default api;
