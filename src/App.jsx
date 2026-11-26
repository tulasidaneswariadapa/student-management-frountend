import { useEffect, useState } from 'react';
import './App.css';

const API_URL = 'http://localhost:8080/api/students';

const initialForm = {
  name: '',
  email: '',
  phone: '',
  course: ''
};

const courses = [
  'Java Full Stack',
  'Python Full Stack',
  'Data Science',
  'Web Development',
  'Cloud Computing',
  'React JS',
  'Java',
  'Other'
];

function App() {
  const [students, setStudents] = useState([]);
  const [formData, setFormData] = useState(initialForm);
  const [editId, setEditId] = useState(null);
  const [search, setSearch] = useState('');
  const [pageSize, setPageSize] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [activePage, setActivePage] = useState('students');

  // GET: Fetch students from Spring Boot
  async function fetchStudents() {
    try {
      setLoading(true);

      const response = await fetch(API_URL);

      if (!response.ok) {
        throw new Error('Unable to fetch students');
      }

      const data = await response.json();
      setStudents(data);
    } catch (error) {
      setMessage('Backend connection failed. Please check Spring Boot.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchStudents();
  }, []);

  // Handle input changes
  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value
    }));
  }

  // Reset form
  
function resetForm() {
  setFormData(initialForm);
  setEditId(null);
}


  // POST / PUT: Save or update student
  async function handleSubmit(event) {
    event.preventDefault();

    const method = editId ? 'PUT' : 'POST';
    const url = editId ? `${API_URL}/${editId}` : API_URL;

    try {
      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Unable to save student');
      }

      setMessage(
        editId
          ? 'Student updated successfully!'
          : 'Student added successfully!'
      );

      resetForm();
      await fetchStudents();
      setActivePage('students');
    } catch (error) {
      setMessage(error.message || 'Something went wrong.');
    }
  }

  // Load student details into form for editing
  function handleEdit(student) {
    setFormData({
      name: student.name || '',
      email: student.email || '',
      phone: student.phone || '',
      course: student.course || ''
    });

    setEditId(student.id);
    setActivePage('add');
    setMessage('');

    document.getElementById('student-form')?.scrollIntoView({
      behavior: 'smooth'
    });
  }

  // DELETE: Remove student
  async function handleDelete(id) {
    const confirmed = window.confirm(
      'Are you sure you want to delete this student?'
    );

    if (!confirmed) return;

    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Unable to delete student');
      }

      setMessage('Student deleted successfully!');
      await fetchStudents();
    } catch (error) {
      setMessage(error.message || 'Delete failed.');
    }
  }

  // Search by name or email
  const filteredStudents = students.filter((student) => {
    const searchText = search.toLowerCase();

    return (
      student.name?.toLowerCase().includes(searchText) ||
      student.email?.toLowerCase().includes(searchText)
    );
  });

  // Pagination
  const totalPages = Math.max(
    1,
    Math.ceil(filteredStudents.length / pageSize)
  );

  const startIndex = (currentPage - 1) * pageSize;

  const displayedStudents = filteredStudents.slice(
    startIndex,
    startIndex + pageSize
  );

  function handleSearch(event) {
    setSearch(event.target.value);
    setCurrentPage(1);
  }

  function handlePageSize(event) {
    setPageSize(Number(event.target.value));
    setCurrentPage(1);
  }

  function changePage(page) {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  }

  function openAddForm() {
    resetForm();
    setActivePage('add');

    document.getElementById('student-form')?.scrollIntoView({
      behavior: 'smooth'
    });
  }

  return (
    <div className="app-layout">

      {/* LEFT SIDEBAR */}
      <aside className="sidebar">

        <div className="sidebar-brand">
          <div className="brand-icon">🎓</div>

          <div>
            <h2>Student Management</h2>
            <span>System</span>
          </div>
        </div>

        <nav className="sidebar-menu">

          <button
            className={`menu-link ${activePage === 'students' ? 'active' : ''}`}
            onClick={() => setActivePage('students')}
          >
            <span>⌂</span>
            Students
          </button>

          <button
            className={`menu-link ${activePage === 'add' ? 'active' : ''}`}
            onClick={openAddForm}
          >
            <span>＋</span>
            Add Student
          </button>

          <button
            className={`menu-link ${activePage === 'about' ? 'active' : ''}`}
            onClick={() => setActivePage('about')}
          >
            <span>ⓘ</span>
            About
          </button>

        </nav>
      </aside>

      {/* RIGHT CONTENT */}
      <div className="main-area">

        {/* TOP HEADER */}
        <header className="top-header">
          <div></div>

          <div className="admin-info">
            <span>Hello, Admin</span>
            <div className="admin-avatar">♟</div>
          </div>
        </header>

        <main className="page-content">

          {/* PAGE TITLE */}
          <section className="page-heading">
            <div>
              <h1>Student Management</h1>
              <p>Manage your students easily and efficiently</p>
            </div>

            <div className="education-illustration">
              🎓
              <span>📚</span>
            </div>
          </section>

          {/* STATUS MESSAGE */}
          {message && (
            <div className="status-message" role="status">
              {message}
              <button onClick={() => setMessage('')}>×</button>
            </div>
          )}

          {/* ADD / EDIT STUDENT FORM */}
          <section className="form-card" id="student-form">

            <h2>Add / Edit Student</h2>

            <form onSubmit={handleSubmit}>

              <div className="form-fields">

                <div className="form-group">
                  <label htmlFor="name">
                    Name <span>*</span>
                  </label>

                  <input
                    id="name"
                    type="text"
                    name="name"
                    placeholder="Enter student name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="email">
                    Email <span>*</span>
                  </label>

                  <input
                    id="email"
                    type="email"
                    name="email"
                    placeholder="Enter email address"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="phone">
                    Phone <span>*</span>
                  </label>

                  <input
                    id="phone"
                    type="tel"
                    name="phone"
                    placeholder="Enter phone number"
                    value={formData.phone}
                    onChange={handleChange}
                    pattern="[0-9]{10}"
                    maxLength="10"
                    title="Enter a valid 10-digit phone number"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="course">
                    Course <span>*</span>
                  </label>

                  <select
                    id="course"
                    name="course"
                    value={formData.course}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select course</option>

                    {courses.map((course) => (
                      <option key={course} value={course}>
                        {course}
                      </option>
                    ))}
                  </select>
                </div>

              </div>

              <div className="form-actions">

                <button type="submit" className="save-button">
                  ▣ {editId ? 'Update' : 'Save'}
                </button>

                <button
                  type="button"
                  className="reset-button"
                  onClick={resetForm}
                >
                  ⟳ Reset
                </button>

              </div>

            </form>
          </section>

          {/* ABOUT SECTION */}
          {activePage === 'about' && (
            <section className="about-card">
              <h2>About Student Management System</h2>
              <p>
                This application helps manage student records, including
                student names, email addresses, phone numbers and courses.
              </p>
              <p>
                Built using React, Bootstrap, Spring Boot and MySQL.
              </p>
            </section>
          )}

          {/* STUDENT TABLE */}
          <section className="table-card" id="students">

            <div className="table-toolbar">

              <div className="search-box">
                <span>⌕</span>

                <input
                  type="search"
                  placeholder="Search by name or email..."
                  value={search}
                  onChange={handleSearch}
                />
              </div>

              <div className="total-count">
                Total Students: {filteredStudents.length}
              </div>

            </div>

            <div className="table-wrapper">

              <table className="students-table">

                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Course</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>

                  {loading ? (
                    <tr>
                      <td colSpan="6" className="empty-row">
                        Loading students...
                      </td>
                    </tr>
                  ) : displayedStudents.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="empty-row">
                        No students found.
                      </td>
                    </tr>
                  ) : (
                    displayedStudents.map((student) => (
                      <tr key={student.id}>

                        <td>{student.id}</td>
                        <td className="student-name">{student.name}</td>
                        <td>{student.email}</td>
                        <td>{student.phone}</td>
                        <td>{student.course}</td>

                        <td className="action-cell">

                          <button
                            className="edit-button"
                            onClick={() => handleEdit(student)}
                          >
                            ✎ Edit
                          </button>

                          <button
                            className="delete-button"
                            onClick={() => handleDelete(student.id)}
                          >
                            ▣ Delete
                          </button>

                        </td>

                      </tr>
                    ))
                  )}

                </tbody>

              </table>

            </div>

            {/* PAGINATION */}
            <div className="pagination-area">

              <div className="entries-control">
                <span>Show</span>

                <select
                  value={pageSize}
                  onChange={handlePageSize}
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                </select>

                <span>entries</span>
              </div>

              <div className="pagination-buttons">

                <button
                  onClick={() => changePage(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  ‹
                </button>

                {Array.from(
                  { length: totalPages },
                  (_, index) => index + 1
                ).map((page) => (
                  <button
                    key={page}
                    className={currentPage === page ? 'current-page' : ''}
                    onClick={() => changePage(page)}
                  >
                    {page}
                  </button>
                ))}

                <button
                  onClick={() => changePage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  ›
                </button>

              </div>

            </div>

          </section>

          {/* FOOTER */}
          <footer className="app-footer">
            © 2025 Student Management System. Built with React & Spring Boot.
          </footer>

        </main>
      </div>
    </div>
  );
}

export default App;