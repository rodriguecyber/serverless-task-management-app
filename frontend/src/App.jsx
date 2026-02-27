import { useMemo, useState, useEffect } from "react";
import { api } from "./api";
import { isAdmin } from "./auth";
import { useAuth } from "./context/AuthContext";
import { isCognitoConfigured } from "./config/amplify";
import Login from "./components/Login";
import Register from "./components/Register";
import VerifyAccount from "./components/VerifyAccount";

const AUTH_SCREEN = { LOGIN: "login", REGISTER: "register", VERIFY: "verify" };

const initialResult = { action: "None", ok: true, payload: null, error: "" };
const baseUrl = () => (import.meta.env.VITE_API_BASE_URL || "").trim().replace(/\/+$/, "");

function taskIdFromItem(item) {
  return item?.PK?.replace(/^TASK#/, "") ?? item?.PK ?? "";
}

function AuthenticatedApp() {
  const { token, logout } = useAuth();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [taskId, setTaskId] = useState("");
  const [status, setStatus] = useState("PENDING");
  const [assignedTo, setAssignedTo] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(initialResult);
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [myTasks, setMyTasks] = useState([]);

  const normalizedBaseUrl = useMemo(() => baseUrl(), []);
  const admin = useMemo(() => isAdmin(token), [token]);

  const runAction = async (action, fn) => {
    if (!normalizedBaseUrl) {
      setResult({ action, ok: false, payload: null, error: "VITE_API_BASE_URL is not set." });
      return;
    }
    setLoading(true);
    try {
      const payload = await fn();
      setResult({ action, ok: true, payload, error: "" });
      return payload;
    } catch (error) {
      setResult({ action, ok: false, payload: null, error: error.message });
    } finally {
      setLoading(false);
    }
  };

  const fetchTasks = () => {
    if (!normalizedBaseUrl || !token || !admin) return;
    api.listTasks({ baseUrl: normalizedBaseUrl, token })
      .then((data) => setTasks(Array.isArray(data) ? data : []))
      .catch(() => setTasks([]));
  };

  const fetchUsers = () => {
    if (!normalizedBaseUrl || !token || !admin) return;
    api.listUsers({ baseUrl: normalizedBaseUrl, token })
      .then((data) => setUsers(Array.isArray(data) ? data : []))
      .catch(() => setUsers([]));
  };

  const fetchMyTasks = () => {
    if (!normalizedBaseUrl || !token || admin) return;
    api.listMyTasks({ baseUrl: normalizedBaseUrl, token })
      .then((data) => setMyTasks(Array.isArray(data) ? data : []))
      .catch(() => setMyTasks([]));
  };

  useEffect(() => {
    if (admin) {
      fetchTasks();
      fetchUsers();
    } else if (token && normalizedBaseUrl) {
      fetchMyTasks();
    }
  }, [admin, token, normalizedBaseUrl]);

  return (
    <main className="page">
      <header className="app-header">
        <div>
          <h1>Task Management</h1>
          <p className="hero-role">{admin ? "Admin" : "User"}: {admin ? "create, assign, update, delete tasks, view users." : "view assigned tasks and update status."}</p>
        </div>
        <button type="button" className="logout-btn" onClick={logout}>
          Sign out
        </button>
      </header>

      {admin ? (
        <section className="grid">
          <article className="panel">
            <h2>Create Task</h2>
            <label>Title <input value={title} onChange={(e) => setTitle(e.target.value)} /></label>
            <label>Description <textarea rows={2} value={description} onChange={(e) => setDescription(e.target.value)} /></label>
            <button
              disabled={loading}
              onClick={() =>
                runAction("Create Task", () => api.createTask({ baseUrl: normalizedBaseUrl, token, title, description })).then(() => {
                  setTitle("");
                  setDescription("");
                  fetchTasks();
                })
              }
            >
              Create
            </button>
          </article>

          <article className="panel">
            <h2>All Tasks</h2>
            <button disabled={loading} onClick={fetchTasks}>Refresh</button>
            <ul className="task-list">
              {tasks.map((t) => (
                <li key={taskIdFromItem(t) || t.PK}>
                  <strong>{t.title}</strong> — {t.status}
                  {t.assignedTo != null && ` (→ ${typeof t.assignedTo === "string" ? t.assignedTo : t.assignedTo?.[0] ?? ""})`}
                  <br />
                  <small>ID: {taskIdFromItem(t)}</small>
                </li>
              ))}
            </ul>
          </article>

          <article className="panel">
            <h2>Users</h2>
            <button disabled={loading} onClick={fetchUsers}>Refresh</button>
            <ul className="task-list">
              {users.map((u) => (
                <li key={u.sub}><strong>{u.email ?? u.sub}</strong> <small>({u.sub})</small></li>
              ))}
            </ul>
          </article>

          <article className="panel">
            <h2>Assign Task</h2>
            <label>Task
              <select value={taskId} onChange={(e) => setTaskId(e.target.value)}>
                <option value="">Select task</option>
                {tasks.map((t) => (
                  <option key={taskIdFromItem(t)} value={taskIdFromItem(t)}>
                    {t.title} — {t.status}
                  </option>
                ))}
              </select>
            </label>
            <label>Assign to
              <select value={assignedTo} onChange={(e) => setAssignedTo(e.target.value)}>
                <option value="">Select user</option>
                {users.map((u) => (
                  <option key={u.sub} value={u.sub}>{u.email ?? u.sub}</option>
                ))}
              </select>
            </label>
            <button
              disabled={loading || !taskId || !assignedTo}
              onClick={() =>
                runAction("Assign Task", () => api.assignTask({ baseUrl: normalizedBaseUrl, token, taskId, assignedTo })).then(() => {
                  setTaskId("");
                  setAssignedTo("");
                  fetchTasks();
                })
              }
            >
              Assign
            </button>
          </article>

          <article className="panel">
            <h2>Update Task Status</h2>
            <label>Task
              <select value={taskId} onChange={(e) => setTaskId(e.target.value)}>
                <option value="">Select task</option>
                {tasks.map((t) => (
                  <option key={taskIdFromItem(t)} value={taskIdFromItem(t)}>
                    {t.title} — {t.status}
                  </option>
                ))}
              </select>
            </label>
            <label>Status
              <select value={status} onChange={(e) => setStatus(e.target.value)}>
                <option value="PENDING">PENDING</option>
                <option value="IN_PROGRESS">IN_PROGRESS</option>
                <option value="COMPLETED">COMPLETED</option>
              </select>
            </label>
            <button
              disabled={loading || !taskId}
              onClick={() => runAction("Update Status", () => api.updateTask({ baseUrl: normalizedBaseUrl, token, taskId, status })).then(fetchTasks)}
            >
              Update
            </button>
          </article>

          <article className="panel">
            <h2>Delete Task</h2>
            <label>Task
              <select value={taskId} onChange={(e) => setTaskId(e.target.value)}>
                <option value="">Select task</option>
                {tasks.map((t) => (
                  <option key={taskIdFromItem(t)} value={taskIdFromItem(t)}>
                    {t.title} — {t.status}
                  </option>
                ))}
              </select>
            </label>
            <button
              className="danger"
              disabled={loading || !taskId}
              onClick={() => runAction("Delete Task", () => api.deleteTask({ baseUrl: normalizedBaseUrl, token, taskId })).then(() => {
                setTaskId("");
                fetchTasks();
              })}
            >
              Delete
            </button>
          </article>
        </section>
      ) : (
        <section className="grid">
          <article className="panel">
            <h2>My Assigned Tasks</h2>
            <button disabled={loading} onClick={fetchMyTasks}>Refresh</button>
            <ul className="task-list">
              {myTasks.map((t) => (
                <li key={taskIdFromItem(t) || t.PK}>
                  <strong>{t.title}</strong> — {t.status}
                  <br />
                  <small>ID: {taskIdFromItem(t)}</small>
                </li>
              ))}
            </ul>
          </article>
          <article className="panel">
            <h2>Update Status</h2>
            <label>Task
              <select value={taskId} onChange={(e) => setTaskId(e.target.value)}>
                <option value="">Select task</option>
                {myTasks.map((t) => (
                  <option key={taskIdFromItem(t)} value={taskIdFromItem(t)}>
                    {t.title} — {t.status}
                  </option>
                ))}
              </select>
            </label>
            <label>Status
              <select value={status} onChange={(e) => setStatus(e.target.value)}>
                <option value="PENDING">PENDING</option>
                <option value="IN_PROGRESS">IN_PROGRESS</option>
                <option value="COMPLETED">COMPLETED</option>
              </select>
            </label>
            <button
              disabled={loading || !taskId}
              onClick={() => runAction("Update Status", () => api.updateTask({ baseUrl: normalizedBaseUrl, token, taskId, status })).then(fetchMyTasks)}
            >
              Update
            </button>
          </article>
        </section>
      )}

      <section className="panel result">
        <h2>Result</h2>
        <p>Action: <strong>{result.action}</strong></p>
        {!result.ok && <p className="error">Error: {result.error}</p>}
        <pre>{JSON.stringify(result.payload, null, 2) || "No response yet."}</pre>
      </section>
    </main>
  );
}

export default function App() {
  const { user, loading } = useAuth();
  const [authScreen, setAuthScreen] = useState(AUTH_SCREEN.LOGIN);
  const [verifyUsername, setVerifyUsername] = useState("");

  if (!isCognitoConfigured) {
    return (
      <main className="page">
        <section className="panel">
          <h1>Task Management</h1>
          <p className="error">Cognito is not configured. Set <code>VITE_USER_POOL_ID</code> and <code>VITE_APP_CLIENT_ID</code> in <code>.env</code> (see <code>.env.example</code>).</p>
        </section>
      </main>
    );
  }

  if (loading) {
    return (
      <main className="page">
        <section className="panel">
          <p>Loading…</p>
        </section>
      </main>
    );
  }

  if (!user) {
    return (
      <>
        {authScreen === AUTH_SCREEN.LOGIN && (
          <Login
            onRegisterClick={() => setAuthScreen(AUTH_SCREEN.REGISTER)}
          />
        )}
        {authScreen === AUTH_SCREEN.REGISTER && (
          <Register
            onSuccess={(username) => {
              setVerifyUsername(username);
              setAuthScreen(AUTH_SCREEN.VERIFY);
            }}
            onSignInClick={() => setAuthScreen(AUTH_SCREEN.LOGIN)}
          />
        )}
        {authScreen === AUTH_SCREEN.VERIFY && (
          <VerifyAccount
            username={verifyUsername}
            onSuccess={() => setAuthScreen(AUTH_SCREEN.LOGIN)}
            onSignInClick={() => setAuthScreen(AUTH_SCREEN.LOGIN)}
          />
        )}
      </>
    );
  }

  return <AuthenticatedApp />;
}
