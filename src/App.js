import React, { useState, useEffect } from "react";
import { AlertCircle, Trash2, Edit, Plus, X, Save, LogOut } from "lucide-react";

// Cookie utilities
const setCookie = (name, value, days = 7) => {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(
    value
  )}; expires=${expires}; path=/`;
};

const getCookie = (name) => {
  return document.cookie.split("; ").reduce((r, v) => {
    const parts = v.split("=");
    return parts[0] === name ? decodeURIComponent(parts[1]) : r;
  }, "");
};

const deleteCookie = (name) => {
  setCookie(name, "", -1);
};

// JWT utilities
const createToken = (username) => {
  const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const payload = btoa(
    JSON.stringify({ username, exp: Date.now() + 86400000 })
  );
  const signature = btoa("secret-signature");
  return `${header}.${payload}.${signature}`;
};

const verifyToken = (token) => {
  if (!token) return false;
  try {
    const parts = token.split(".");
    const payload = JSON.parse(atob(parts[1]));
    return payload.exp > Date.now();
  } catch (e) {
    return false;
  }
};

// Image compression
const compressImage = (file) => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;
        const maxSize = 100;

        if (width > height && width > maxSize) {
          height *= maxSize / width;
          width = maxSize;
        } else if (height > maxSize) {
          width *= maxSize / height;
          height = maxSize;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);

        const compressed = canvas.toDataURL("image/jpeg", 0.3);
        resolve(compressed);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
};

// Sweet Alert component
const SweetAlert = ({
  type,
  message,
  onConfirm,
  onCancel,
  showCancel = false,
}) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
      <div className="flex flex-col items-center">
        <div
          className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${
            type === "error"
              ? "bg-red-100"
              : type === "warning"
              ? "bg-yellow-100"
              : "bg-green-100"
          }`}
        >
          <AlertCircle
            className={`w-8 h-8 ${
              type === "error"
                ? "text-red-600"
                : type === "warning"
                ? "text-yellow-600"
                : "text-green-600"
            }`}
          />
        </div>
        <p className="text-gray-800 text-center mb-6">{message}</p>
        <div className="flex gap-3">
          {showCancel && (
            <button
              onClick={onCancel}
              className="px-6 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
            >
              Cancel
            </button>
          )}
          <button
            onClick={onConfirm}
            className={`px-6 py-2 rounded text-white ${
              type === "error"
                ? "bg-red-600 hover:bg-red-700"
                : type === "warning"
                ? "bg-yellow-600 hover:bg-yellow-700"
                : "bg-green-600 hover:bg-green-700"
            }`}
          >
            OK
          </button>
        </div>
      </div>
    </div>
  </div>
);

// Password Modal
const PasswordModal = ({ onSubmit, onCancel }) => {
  const [pwd, setPwd] = useState("");

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h3 className="text-lg font-semibold mb-4">Enter Password to Update</h3>
        <input
          type="password"
          value={pwd}
          onChange={(e) => setPwd(e.target.value)}
          className="w-full px-4 py-2 border rounded mb-4"
          placeholder="Enter password"
        />
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
            onClick={() => onSubmit(pwd)}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
};

// State Modal
const StateModal = ({ onSave, onClose }) => {
  const [stateName, setStateName] = useState("");

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h3 className="text-lg font-semibold mb-4">Add New State</h3>
        <input
          type="text"
          value={stateName}
          onChange={(e) => setStateName(e.target.value)}
          className="w-full px-4 py-2 border rounded mb-4"
          placeholder="Enter state name"
        />
        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
            onClick={() => onSave(stateName)}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Save State
          </button>
        </div>
      </div>
    </div>
  );
};

// Login Component
const LoginPage = ({ onLogin, alert, setAlert }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const submitLogin = () => {
    if (username === "admin" && password === "admin") {
      const token = createToken(username);
      setCookie("authToken", token);
      onLogin();
    } else {
      setAlert({ type: "error", message: "Invalid Username or Password" });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
      {alert && (
        <SweetAlert
          type={alert.type}
          message={alert.message}
          onConfirm={() => setAlert(null)}
        />
      )}
      <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-md">
        <h2 className="text-3xl font-bold text-center mb-6 text-gray-800">
          Student Management System
        </h2>
        <div>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              onKeyPress={(e) => e.key === "Enter" && submitLogin()}
            />
          </div>
          <div className="mb-6">
            <label className="block text-gray-700 mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              onKeyPress={(e) => e.key === "Enter" && submitLogin()}
            />
          </div>
          <button
            onClick={submitLogin}
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
          >
            Login
          </button>
        </div>
        <p className="text-sm text-gray-600 text-center mt-4">
          Demo: admin / admin
        </p>
      </div>
    </div>
  );
};

// Index Component
const IndexPage = ({
  students,
  states,
  onEdit,
  onDelete,
  onLogout,
  onCreateNew,
  alert,
  setAlert,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentStudents = students.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(students.length / itemsPerPage);

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      {alert && (
        <SweetAlert
          type={alert.type}
          message={alert.message}
          onConfirm={() =>
            alert.onConfirm ? alert.onConfirm() : setAlert(null)
          }
          onCancel={() => setAlert(null)}
          showCancel={alert.showCancel}
        />
      )}
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Student List</h1>
          <div className="flex gap-3">
            <button
              onClick={onCreateNew}
              className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 flex items-center gap-2"
            >
              <Plus className="w-5 h-5" /> Add Student
            </button>
            <button
              onClick={onLogout}
              className="bg-red-600 text-white px-6 py-2 rounded hover:bg-red-700 flex items-center gap-2"
            >
              <LogOut className="w-5 h-5" /> Logout
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Age
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Address
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    State
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Phone
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Photo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Subjects
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {currentStudents.map((student) => (
                  <tr key={student.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {student.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {student.age}
                    </td>
                    <td className="px-6 py-4">{student.address || "N/A"}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {states.find((s) => s.id === parseInt(student.state))
                        ?.name || "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {student.phone || "N/A"}
                    </td>
                    <td className="px-6 py-4">
                      {student.photos && student.photos.length > 0 && (
                        <img
                          src={student.photos[0]}
                          alt="Student"
                          className="w-12 h-12 rounded object-cover"
                        />
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {student.subjects && student.subjects.length > 0 ? (
                        <div className="text-sm">
                          {student.subjects.slice(0, 2).map((s, i) => (
                            <div key={i}>
                              {s.name} ({s.marks})
                            </div>
                          ))}
                        </div>
                      ) : (
                        "N/A"
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex gap-2">
                        <button
                          onClick={() => onEdit(student)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <Edit className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => onDelete(student.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="bg-gray-50 px-6 py-3 flex justify-between items-center">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-blue-600 text-white rounded disabled:bg-gray-300"
              >
                Previous
              </button>
              <span className="text-gray-700">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={currentPage === totalPages}
                className="px-4 py-2 bg-blue-600 text-white rounded disabled:bg-gray-300"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Form Component
const FormPage = ({
  isEdit,
  formData,
  setFormData,
  states,
  onSave,
  onBack,
  onAddState,
}) => {
  const handlePhotoUpload = async (e) => {
    const files = Array.from(e.target.files);
    const compressed = await Promise.all(files.map((f) => compressImage(f)));
    setFormData({ ...formData, photos: [...formData.photos, ...compressed] });
  };

  const addSubject = () => {
    setFormData({
      ...formData,
      subjects: [...formData.subjects, { name: "", marks: "" }],
    });
  };

  const removeSubject = (idx) => {
    setFormData({
      ...formData,
      subjects: formData.subjects.filter((_, i) => i !== idx),
    });
  };

  const updateSubject = (idx, field, value) => {
    const newSubjects = [...formData.subjects];
    newSubjects[idx][field] = value;
    setFormData({ ...formData, subjects: newSubjects });
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl border-4 border-red-500">
        <div className="bg-gray-600 text-white px-6 py-3 rounded-t-lg">
          <h2 className="text-lg font-semibold">
            {isEdit ? "Edit Student" : "Create Student"}
          </h2>
        </div>

        <div className="p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-gray-700 text-sm mb-1">Name*</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-gray-700 text-sm mb-1">Age*</label>
              <input
                type="number"
                value={formData.age}
                onChange={(e) =>
                  setFormData({ ...formData, age: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-gray-700 text-sm mb-1">
                Date of Birth*
              </label>
              <input
                type="date"
                value={formData.dob}
                onChange={(e) =>
                  setFormData({ ...formData, dob: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-gray-700 text-sm mb-1">
                Address*
              </label>
              <textarea
                value={formData.address}
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                rows="3"
              />
            </div>

            <div>
              <label className="block text-gray-700 text-sm mb-1">State*</label>
              <div className="flex gap-2">
                <select
                  value={formData.state}
                  onChange={(e) =>
                    setFormData({ ...formData, state: e.target.value })
                  }
                  className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="">-- Select State --</option>
                  {states.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={onAddState}
                  className="px-3 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700 whitespace-nowrap"
                >
                  Save State Name
                </button>
              </div>
            </div>

            <div>
              <label className="block text-gray-700 text-sm mb-1">
                Phone Number*
              </label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="10 digit number"
              />
            </div>

            <div>
              <label className="block text-gray-700 text-sm mb-1">Photo</label>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handlePhotoUpload}
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
              />
              {formData.photos.length > 0 && (
                <div className="flex gap-2 mt-2 flex-wrap">
                  {formData.photos.map((photo, i) => (
                    <img
                      key={i}
                      src={photo}
                      alt={`Photo ${i + 1}`}
                      className="w-16 h-16 object-cover rounded border"
                    />
                  ))}
                </div>
              )}
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-gray-700 text-sm font-semibold">
                  Subjects
                </label>
                <button
                  type="button"
                  onClick={addSubject}
                  className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
                >
                  Add
                </button>
              </div>

              <div className="border border-gray-300 rounded">
                <div className="grid grid-cols-2 bg-gray-100 border-b border-gray-300">
                  <div className="px-3 py-2 text-sm font-semibold text-gray-700 border-r border-gray-300">
                    Subject Name
                  </div>
                  <div className="px-3 py-2 text-sm font-semibold text-gray-700">
                    Action
                  </div>
                </div>

                {formData.subjects.map((subject, idx) => (
                  <div
                    key={idx}
                    className="grid grid-cols-2 border-b border-gray-300 last:border-b-0"
                  >
                    <div className="px-3 py-2 border-r border-gray-300">
                      <input
                        type="text"
                        placeholder="Subject Name"
                        value={subject.name}
                        onChange={(e) =>
                          updateSubject(idx, "name", e.target.value)
                        }
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                    <div className="px-3 py-2 flex gap-2">
                      <input
                        type="number"
                        placeholder="Marks"
                        value={subject.marks}
                        onChange={(e) =>
                          updateSubject(idx, "marks", e.target.value)
                        }
                        className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                      <button
                        type="button"
                        onClick={() => removeSubject(idx)}
                        className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-center pt-4">
              <button
                onClick={onSave}
                className="px-8 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Submit
              </button>
            </div>
          </div>
        </div>

        <div className="flex justify-end px-6 pb-4">
          <button
            onClick={onBack}
            className="text-blue-500 hover:text-blue-700 text-sm underline"
          >
            Back to List
          </button>
        </div>
      </div>
    </div>
  );
};

const App = () => {
  const [page, setPage] = useState("login");
  const [alert, setAlert] = useState(null);
  const [students, setStudents] = useState([]);
  const [states, setStates] = useState([]);
  const [editingStudent, setEditingStudent] = useState(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showStateModal, setShowStateModal] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    age: "",
    dob: "",
    address: "",
    state: "",
    phone: "",
    photos: [],
    subjects: [{ name: "", marks: "" }],
  });

  useEffect(() => {
    const token = getCookie("authToken");
    if (token && verifyToken(token)) {
      loadData();
      setPage("index");
    }
  }, []);

  const loadData = () => {
    const studentsData = getCookie("students");
    const statesData = getCookie("states");

    if (!statesData) {
      const defaultStates = [
        { id: 1, name: "Uttar Pradesh" },
        { id: 2, name: "Maharashtra" },
        { id: 3, name: "Karnataka" },
      ];
      setCookie("states", JSON.stringify(defaultStates));
      setStates(defaultStates);
    } else {
      setStates(JSON.parse(statesData));
    }

    setStudents(studentsData ? JSON.parse(studentsData) : []);
  };

  const saveData = (newStudents) => {
    setCookie("students", JSON.stringify(newStudents));
    setStudents(newStudents);
  };

  const saveStates = (newStates) => {
    setCookie("states", JSON.stringify(newStates));
    setStates(newStates);
  };

  const handleLogin = () => {
    loadData();
    setPage("index");
  };

  const handleLogout = () => {
    deleteCookie("authToken");
    setPage("login");
  };

  const handleDelete = (id) => {
    setAlert({
      type: "warning",
      message: "Are you sure you want to delete this record?",
      showCancel: true,
      onConfirm: () => {
        const newStudents = students.filter((s) => s.id !== id);
        saveData(newStudents);
        setAlert(null);
      },
    });
  };

  const handleEdit = (student) => {
    setEditingStudent(student);
    setFormData({
      name: student.name,
      age: student.age,
      dob: student.dob,
      address: student.address,
      state: student.state,
      phone: student.phone,
      photos: student.photos || [],
      subjects: student.subjects || [{ name: "", marks: "" }],
    });
    setPage("edit");
  };

  const handleSave = async () => {
    if (!formData.name || !formData.age || !formData.dob || !formData.state) {
      setAlert({ type: "error", message: "Please fill all required fields" });
      return;
    }

    const phoneRegex = /^[0-9]{10}$/;
    if (formData.phone && !phoneRegex.test(formData.phone)) {
      setAlert({ type: "error", message: "Phone number must be 10 digits" });
      return;
    }

    if (page === "create") {
      const newStudent = {
        id: Date.now(),
        ...formData,
      };
      saveData([...students, newStudent]);
      setAlert({ type: "success", message: "Student added successfully!" });
      setTimeout(() => {
        setPage("index");
        resetForm();
        setAlert(null);
      }, 1500);
    } else {
      setShowPasswordModal(true);
    }
  };

  const handleUpdate = (password) => {
    if (password === "72991") {
      const newStudents = students.map((s) =>
        s.id === editingStudent.id ? { ...editingStudent, ...formData } : s
      );
      saveData(newStudents);
      setShowPasswordModal(false);
      setAlert({ type: "success", message: "Student updated successfully!" });
      setTimeout(() => {
        setPage("index");
        resetForm();
        setAlert(null);
      }, 1500);
    } else {
      setShowPasswordModal(false);
      setAlert({ type: "error", message: "Wrong Password" });
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      age: "",
      dob: "",
      address: "",
      state: "",
      phone: "",
      photos: [],
      subjects: [{ name: "", marks: "" }],
    });
    setEditingStudent(null);
  };

  const addState = (stateName) => {
    if (stateName.trim()) {
      const newState = { id: Date.now(), name: stateName };
      const newStates = [...states, newState];
      saveStates(newStates);
      setShowStateModal(false);
    }
  };

  if (page === "login") {
    return (
      <LoginPage onLogin={handleLogin} alert={alert} setAlert={setAlert} />
    );
  }

  if (page === "index") {
    return (
      <IndexPage
        students={students}
        states={states}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onLogout={handleLogout}
        onCreateNew={() => setPage("create")}
        alert={alert}
        setAlert={setAlert}
      />
    );
  }

  return (
    <>
      {alert && (
        <SweetAlert
          type={alert.type}
          message={alert.message}
          onConfirm={() => setAlert(null)}
        />
      )}
      {showPasswordModal && (
        <PasswordModal
          onSubmit={handleUpdate}
          onCancel={() => setShowPasswordModal(false)}
        />
      )}
      {showStateModal && (
        <StateModal
          onSave={addState}
          onClose={() => setShowStateModal(false)}
        />
      )}
      <FormPage
        isEdit={page === "edit"}
        formData={formData}
        setFormData={setFormData}
        states={states}
        onSave={handleSave}
        onBack={() => {
          setPage("index");
          resetForm();
        }}
        onAddState={() => setShowStateModal(true)}
      />
    </>
  );
};

export default App;
