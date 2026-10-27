import { useState, useEffect } from "react";

/* =====================================================================
   HR DASHBOARD - frontend only (no backend)
   Data lives in React state and is saved in the browser (localStorage),
   so it is still there after you refresh the page.
   ===================================================================== */

/* ---------- 1. DATA ---------- */

const menu = [
  "Dashboard", "Employee Directory", "Attendance", "Employee Performance",
  "Leave Management", "Payroll", "Recruitment", "Onboarding", "Development",
];

const startEmployees = [
  { id: "#FR01890", name: "Cooper Herwitz", email: "cooper@mail.com", role: "Jr. Developer", dept: "IT", status: "Active" },
  { id: "#FR01728", name: "Kierra Gouse", email: "kierra@mail.com", role: "UI Designer", dept: "Creative", status: "Active" },
  { id: "#FR01653", name: "Cheyenne Franci", email: "cheyennefci@mail.com", role: "Development", dept: "HR", status: "Active" },
  { id: "#FR01832", name: "Charlie Saris", email: "charliesar@mail.com", role: "Media Social", dept: "Marketing", status: "Active" },
  { id: "#FR01729", name: "Lindsey Mango", email: "lindseymango@mail.com", role: "Product Designer", dept: "Creative", status: "Active" },
];

const chartData = {
  Yearly: {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
    project: [25, 28, 24, 33, 35, 28, 36, 33, 38, 34, 36, 46],
    product: [16, 14, 12, 14, 24, 28, 20, 24, 24, 30, 18, 32],
  },
  Monthly: {
    labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
    project: [30, 36, 33, 41],
    product: [20, 26, 22, 29],
  },
};

const times = ["11:00", "10:30", "10:00", "09:30", "09:00", "08:30"];
const days = ["Mon", "Tue", "Wed", "Thu", "Fri"];
const heat = [
  [0, 0, 0, 0, 0],
  [1, 1, 1, 1, 1],
  [1, 2, 2, 2, 2],
  [2, 2, 3, 2, 2],
  [3, 4, 4, 4, 3],
  [4, 5, 5, 5, 5],
];
const heatColors = ["bg-violet-50", "bg-violet-100", "bg-violet-200", "bg-violet-300", "bg-violet-400", "bg-violet-500"];

const emptyForm = { name: "", email: "", role: "", dept: "IT", status: "Active" };
const departments = ["IT", "Creative", "HR", "Marketing", "Finance", "Sales"];

/* ---------- 2. SMALL REUSABLE PIECES ---------- */

// Every button uses this, so the pointer cursor is set in ONE place.
function Btn({ primary, className = "", ...props }) {
  return (
    <button
      {...props}
      className={`cursor-pointer rounded-lg px-3 py-1.5 transition ${
        primary
          ? "bg-violet-600 text-white hover:bg-violet-700"
          : "border border-gray-200 bg-white hover:bg-gray-50"
      } ${className}`}
    />
  );
}

function Card({ title, children, className = "" }) {
  return (
    <div className={`rounded-xl border border-gray-200 bg-white p-4 shadow-sm ${className}`}>
      {title && (
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-semibold text-gray-800">{title}</h3>
          <span className="text-gray-400">•••</span>
        </div>
      )}
      {children}
    </div>
  );
}

function StatCard({ title, value, change }) {
  return (
    <Card title={title}>
      <div className="flex items-end justify-between">
        <span className="text-2xl font-semibold">{value}</span>
        <span className="text-xs text-gray-500">
          <b className="text-green-600">{change}</b> last month
        </span>
      </div>
    </Card>
  );
}

// Popup window. "onClose" runs when you click the dark background or X.
function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div className="w-full max-w-md rounded-xl bg-white p-5 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
          <button onClick={onClose} className="cursor-pointer text-xl text-gray-400 hover:text-gray-700">×</button>
        </div>
        {children}
      </div>
    </div>
  );
}

const inputClass = "w-full rounded-lg border border-gray-200 px-3 py-2 outline-none focus:border-violet-500";

/* ---------- 3. CHARTS (plain SVG) ---------- */

function LineChart({ labels, project, product }) {
  const [hover, setHover] = useState(null); // index of the hovered column
  const W = 600, H = 200;
  const n = labels.length;
  const x = (i) => (i / (n - 1)) * W;
  const y = (v) => H - ((v - 10) / 40) * H; // scale 10K..50K to chart height
  const points = (data) => data.map((v, i) => `${x(i)},${y(v)}`).join(" ");

  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} className="h-52 w-full overflow-visible">
        {[0, 1, 2, 3, 4].map((i) => (
          <line key={i} x1="0" x2={W} y1={(i * H) / 4} y2={(i * H) / 4} stroke="#eee" />
        ))}
        <polyline points={points(project)} fill="none" stroke="#6d4ae0" strokeWidth="2" />
        <polyline points={points(product)} fill="none" stroke="#f08a3c" strokeWidth="2" />

        {/* hover marker + tooltip */}
        {hover !== null && (
          <g>
            <line x1={x(hover)} x2={x(hover)} y1="0" y2={H} stroke="#ccc" />
            <circle cx={x(hover)} cy={y(project[hover])} r="4" fill="#6d4ae0" />
            <circle cx={x(hover)} cy={y(product[hover])} r="4" fill="#f08a3c" />
            <g transform={`translate(${Math.min(Math.max(x(hover) - 50, 0), W - 100)}, 4)`}>
              <rect width="100" height="48" rx="6" fill="white" stroke="#ddd" />
              <text x="8" y="14" fontSize="10" fontWeight="600">{labels[hover]}</text>
              <text x="8" y="28" fontSize="10" fill="#6d4ae0">Project: {project[hover]}K</text>
              <text x="8" y="41" fontSize="10" fill="#f08a3c">Product: {product[hover]}K</text>
            </g>
          </g>
        )}

        {/* invisible strips that detect the mouse */}
        {labels.map((_, i) => (
          <rect
            key={i}
            x={x(i) - W / n / 2}
            width={W / n}
            height={H}
            fill="transparent"
            onMouseEnter={() => setHover(i)}
            onMouseLeave={() => setHover(null)}
          />
        ))}
      </svg>
      <div className="mt-1 flex justify-between text-xs text-gray-400">
        {labels.map((l) => <span key={l}>{l}</span>)}
      </div>
    </div>
  );
}

function Gauge({ jobs }) {
  const total = jobs.active + jobs.review + jobs.finish;
  const LEN = 251.3; // length of the half circle (pi * 80)
  const a = (jobs.active / total) * LEN;
  const r = (jobs.review / total) * LEN;
  const f = (jobs.finish / total) * LEN;
  const arc = "M20 100 A80 80 0 0 1 180 100";
  return (
    <svg viewBox="0 0 200 110" className="mx-auto w-48">
      <path d={arc} fill="none" stroke="#7c5ce6" strokeWidth="16" strokeDasharray={`${a} ${LEN}`} />
      <path d={arc} fill="none" stroke="#f5a05a" strokeWidth="16" strokeDasharray={`0 ${a} ${r} ${LEN}`} />
      <path d={arc} fill="none" stroke="#5fd98a" strokeWidth="16" strokeDasharray={`0 ${a + r} ${f} ${LEN}`} />
      <text x="100" y="90" textAnchor="middle" fontSize="28" fontWeight="600">{total}</text>
      <text x="100" y="105" textAnchor="middle" fontSize="8" fill="#888">Total Jobs</text>
    </svg>
  );
}

/* ---------- 4. MAIN PAGE ---------- */

export default function HRDashboard() {
  /* --- state: things that change on screen --- */
  const [employees, setEmployees] = useState(() => {
    try {
      const saved = localStorage.getItem("hr-employees");
      return saved ? JSON.parse(saved) : startEmployees;
    } catch {
      return startEmployees;
    }
  });
  const [page, setPage] = useState("Dashboard");
  const [range, setRange] = useState("Yearly");
  const [search, setSearch] = useState("");
  const [newCount, setNewCount] = useState(0);       // employees added this session
  const [applicants, setApplicants] = useState(329);
  const [jobs, setJobs] = useState({ active: 46, review: 18, finish: 8 });
  const [modal, setModal] = useState(null);          // null | "employee" | "invite"
  const [editingId, setEditingId] = useState(null);  // null = adding, otherwise editing
  const [form, setForm] = useState(emptyForm);
  const [inviteEmail, setInviteEmail] = useState("");
  const [toast, setToast] = useState("");

  // Save employees in the browser whenever they change
  useEffect(() => {
    try {
      localStorage.setItem("hr-employees", JSON.stringify(employees));
    } catch {}
  }, [employees]);

  // Hide the toast message after 2.5 seconds
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 2500);
    return () => clearTimeout(t);
  }, [toast]);

  /* --- numbers shown in the 4 top cards (derived from state) --- */
  const inactive = employees.filter((e) => e.status === "Inactive").length;
  const stats = [
    { title: "Total Employee", value: 267 + employees.length, change: "+6%" },
    { title: "New Employee", value: 72 + newCount, change: "+4%" },
    { title: "Resign Employee", value: 16 + inactive, change: "+2%" },
    { title: "Job Applicants", value: applicants, change: "+8%" },
  ];

  /* --- search filter --- */
  const q = search.toLowerCase();
  const filtered = employees.filter((e) =>
    [e.name, e.email, e.role, e.dept, e.id].some((v) => v.toLowerCase().includes(q))
  );
  const visible = page === "Dashboard" ? filtered.slice(0, 5) : filtered;

  /* --- actions --- */
  const openAdd = () => {
    setEditingId(null);
    setForm(emptyForm);
    setModal("employee");
  };

  const openEdit = (emp) => {
    setEditingId(emp.id + emp.email); // id + email = unique key
    setForm({ name: emp.name, email: emp.email, role: emp.role, dept: emp.dept, status: emp.status });
    setModal("employee");
  };

  const saveEmployee = (e) => {
    e.preventDefault();
    if (editingId) {
      setEmployees(employees.map((emp) => (emp.id + emp.email === editingId ? { ...emp, ...form } : emp)));
      setToast("Employee updated");
    } else {
      const id = "#FR0" + Math.floor(1000 + Math.random() * 9000);
      setEmployees([{ id, ...form }, ...employees]);
      setNewCount(newCount + 1);
      setToast("Employee added");
    }
    setModal(null);
  };

  const deleteEmployee = (emp) => {
    if (!window.confirm(`Delete ${emp.name}?`)) return;
    setEmployees(employees.filter((x) => x !== emp));
    setToast("Employee deleted");
  };

  const toggleStatus = (emp) => {
    setEmployees(employees.map((x) => (x === emp ? { ...x, status: x.status === "Active" ? "Inactive" : "Active" } : x)));
  };

  const sendInvite = (e) => {
    e.preventDefault();
    setToast(`Invitation sent to ${inviteEmail}`);
    setInviteEmail("");
    setModal(null);
  };

  // Download the employee list as a CSV file (opens in Excel)
  const exportData = () => {
    const header = "ID,Name,Email,Role,Department,Status";
    const rows = employees.map((e) => [e.id, e.name, e.email, e.role, e.dept, e.status].join(","));
    const blob = new Blob([[header, ...rows].join("\n")], { type: "text/csv" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "employees.csv";
    link.click();
    setToast("Data exported");
  };

  const chart = chartData[range];

  /* ---------- JSX (what appears on screen) ---------- */
  return (
    <div className="flex min-h-screen gap-4 bg-gray-100 p-4 text-sm text-gray-700">
      {/* ===== Sidebar ===== */}
      <aside className="flex w-56 shrink-0 flex-col rounded-xl bg-white p-3">
        <div className="mb-4 rounded-lg border border-gray-200 p-2">
          <p className="font-semibold">Nonsense Studio</p>
          <p className="text-xs text-gray-400">hello@nonsense.studio</p>
        </div>

        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search employees"
          className={`${inputClass} mb-4`}
        />

        <nav className="flex flex-col gap-1">
          {menu.map((item) => (
            <button
              key={item}
              onClick={() => setPage(item)}
              className={`cursor-pointer rounded-lg px-3 py-2 text-left transition ${
                page === item ? "bg-violet-600 text-white" : "text-gray-500 hover:bg-gray-100"
              }`}
            >
              {item}
            </button>
          ))}
        </nav>

        <div className="mt-auto flex flex-col gap-1 pt-6">
          <button onClick={() => setToast("Help Center coming soon")} className="cursor-pointer rounded-lg px-3 py-2 text-left text-gray-500 hover:bg-gray-100">Help Center</button>
          <button onClick={() => setToast("Settings coming soon")} className="cursor-pointer rounded-lg px-3 py-2 text-left text-gray-500 hover:bg-gray-100">Settings</button>
          <button onClick={() => setToast("Signed out (demo)")} className="cursor-pointer rounded-lg px-3 py-2 text-left text-red-500 hover:bg-red-50">Sign Out</button>
        </div>
      </aside>

      {/* ===== Main area ===== */}
      <main className="flex-1 rounded-xl bg-white p-4">
        {/* top bar */}
        <div className="mb-4 flex items-center justify-between border-b border-gray-100 pb-3">
          <p>Dashboard / {page === "Dashboard" ? "Overview" : page}</p>
          <div className="flex gap-2">
            <Btn onClick={() => setModal("invite")}>+ Invite People</Btn>
            <Btn primary onClick={() => setToast("Plan generated")}>Generate Plan</Btn>
          </div>
        </div>

        {/* title */}
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              {page === "Dashboard" ? "HR Insight Dashboard" : page}
            </h1>
            <p className="text-xs text-gray-500">Smart HR insights that drive better decisions</p>
          </div>
          <div className="flex gap-2">
            <Btn onClick={exportData}>Export Data</Btn>
            <Btn primary onClick={openAdd}>+ New Entry</Btn>
          </div>
        </div>

        {/* stat cards + charts: only on the Dashboard page */}
        {page === "Dashboard" && (
          <>
            <div className="mb-4 grid grid-cols-4 gap-4">
              {stats.map((s) => (
                <StatCard key={s.title} {...s} />
              ))}
            </div>

            <div className="mb-4 grid grid-cols-3 gap-4">
              <Card title="Team Performance" className="col-span-2">
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex gap-4 text-xs">
                    <span className="text-violet-600">● Project Team</span>
                    <span className="text-orange-500">● Product Team</span>
                  </div>
                  <div className="flex rounded-lg bg-gray-100 p-1 text-xs">
                    {["Monthly", "Yearly"].map((r) => (
                      <button
                        key={r}
                        onClick={() => setRange(r)}
                        className={`cursor-pointer rounded-md px-3 py-1 ${
                          range === r ? "bg-white shadow-sm" : "text-gray-400"
                        }`}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>
                <LineChart {...chart} />
              </Card>

              <Card title="Attendance Report">
                <div className="grid grid-cols-[auto_1fr] gap-x-2 gap-y-1">
                  {times.map((time, row) => (
                    <div key={time} className="contents">
                      <span className="pt-2 text-xs text-gray-400">{time}</span>
                      <div className="grid grid-cols-5 gap-1">
                        {heat[row].map((level, col) => (
                          <div key={col} className={`h-7 rounded-md ${heatColors[level]}`} />
                        ))}
                      </div>
                    </div>
                  ))}
                  <span />
                  <div className="grid grid-cols-5 text-center text-xs text-gray-400">
                    {days.map((d) => <span key={d}>{d}</span>)}
                  </div>
                </div>
              </Card>
            </div>
          </>
        )}

        {/* Other sidebar pages (not built yet) */}
        {page !== "Dashboard" && page !== "Employee Directory" && (
          <Card className="py-16 text-center text-gray-400">{page} page is not built yet.</Card>
        )}

        {/* table + jobs: Dashboard and Employee Directory */}
        {(page === "Dashboard" || page === "Employee Directory") && (
          <div className={`grid gap-4 ${page === "Dashboard" ? "grid-cols-3" : "grid-cols-1"}`}>
            <Card title={`Employees (${filtered.length})`} className={page === "Dashboard" ? "col-span-2" : ""}>
              <table className="w-full text-left text-xs">
                <thead className="text-gray-400">
                  <tr>
                    <th className="py-2">Employee ID</th>
                    <th>Full Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Department</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {visible.map((emp) => (
                    <tr key={emp.id + emp.email} className="border-t border-gray-100">
                      <td className="py-3 text-gray-500">{emp.id}</td>
                      <td className="font-medium text-gray-900">{emp.name}</td>
                      <td>{emp.email}</td>
                      <td>{emp.role}</td>
                      <td>{emp.dept}</td>
                      <td>
                        {/* click to switch Active / Inactive */}
                        <button
                          onClick={() => toggleStatus(emp)}
                          className={`cursor-pointer font-medium ${
                            emp.status === "Active" ? "text-green-600" : "text-red-500"
                          }`}
                        >
                          {emp.status}
                        </button>
                      </td>
                      <td className="space-x-2">
                        <button onClick={() => openEdit(emp)} className="cursor-pointer text-violet-600 hover:underline">Edit</button>
                        <button onClick={() => deleteEmployee(emp)} className="cursor-pointer text-red-500 hover:underline">Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {visible.length === 0 && (
                <p className="py-6 text-center text-gray-400">No employees found.</p>
              )}
            </Card>

            {page === "Dashboard" && (
              <Card title="Jobs Overview">
                <Gauge jobs={jobs} />
                <ul className="mt-3 space-y-2 text-xs">
                  {[
                    ["active", "Active Jobs"],
                    ["review", "In Reviews Jobs"],
                    ["finish", "Finish Jobs"],
                  ].map(([key, label]) => (
                    <li key={key} className="flex items-center justify-between">
                      <b className="text-base text-gray-900">{jobs[key]}</b>
                      <span className="flex items-center gap-2 text-gray-400">
                        {label}
                        {/* - and + change the number */}
                        <button
                          onClick={() => setJobs({ ...jobs, [key]: Math.max(1, jobs[key] - 1) })}
                          className="cursor-pointer rounded border border-gray-200 px-1.5 hover:bg-gray-100"
                        >−</button>
                        <button
                          onClick={() => setJobs({ ...jobs, [key]: jobs[key] + 1 })}
                          className="cursor-pointer rounded border border-gray-200 px-1.5 hover:bg-gray-100"
                        >+</button>
                      </span>
                    </li>
                  ))}
                </ul>
              </Card>
            )}
          </div>
        )}
      </main>

      {/* ===== Add / Edit employee popup ===== */}
      {modal === "employee" && (
        <Modal title={editingId ? "Edit Employee" : "New Employee"} onClose={() => setModal(null)}>
          <form onSubmit={saveEmployee} className="space-y-3">
            <input required placeholder="Full name" className={inputClass}
              value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <input required type="email" placeholder="Email" className={inputClass}
              value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            <input required placeholder="Role (e.g. UI Designer)" className={inputClass}
              value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} />
            <select className={`${inputClass} cursor-pointer`}
              value={form.dept} onChange={(e) => setForm({ ...form, dept: e.target.value })}>
              {departments.map((d) => <option key={d}>{d}</option>)}
            </select>
            <select className={`${inputClass} cursor-pointer`}
              value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
              <option>Active</option>
              <option>Inactive</option>
            </select>
            <div className="flex justify-end gap-2 pt-2">
              <Btn type="button" onClick={() => setModal(null)}>Cancel</Btn>
              <Btn type="submit" primary>{editingId ? "Save changes" : "Add employee"}</Btn>
            </div>
          </form>
        </Modal>
      )}

      {/* ===== Invite popup ===== */}
      {modal === "invite" && (
        <Modal title="Invite People" onClose={() => setModal(null)}>
          <form onSubmit={sendInvite} className="space-y-3">
            <input required type="email" placeholder="Email address" className={inputClass}
              value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} />
            <div className="flex justify-end gap-2 pt-2">
              <Btn type="button" onClick={() => setModal(null)}>Cancel</Btn>
              <Btn type="submit" primary>Send invite</Btn>
            </div>
          </form>
        </Modal>
      )}

      {/* ===== Toast message (bottom right) ===== */}
      {toast && (
        <div className="fixed bottom-4 right-4 z-50 rounded-lg bg-gray-900 px-4 py-2 text-white shadow-lg">
          {toast}
        </div>
      )}
    </div>
  );
}
