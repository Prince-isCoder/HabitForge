// ✅ Central auth fetch — handles 401 automatically
const authFetch = async (url, options = {}) => {
    const token = localStorage.getItem("token");

    const res = await fetch(url, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
            ...options.headers,
        }
    });

    // ✅ If token expired or invalid — auto logout
    if (res.status === 401) {
        console.warn("Token expired — logging out");
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/login";
        return null;
    }

    return res;
};

export const getDashboardData = async () => {
    const res = await authFetch("http://localhost:5000/api/dashboard");
    return res ? await res.json() : null;
};

export const getHabits = async () => {
    const res = await authFetch("http://localhost:5000/api/habits");
    return res ? await res.json() : [];
};

export const createHabit = async (title) => {
    const res = await authFetch("http://localhost:5000/api/habits", {
        method: "POST",
        body: JSON.stringify({ title })
    });
    return res ? await res.json() : null;
};

export const deleteHabit = async (id) => {
    const res = await authFetch(`http://localhost:5000/api/habits/${id}`, {
        method: "DELETE"
    });
    return res ? await res.json() : null;
};

export const markComplete = async (habitId) => {
    const res = await authFetch("http://localhost:5000/api/habits/complete", {
        method: "POST",
        body: JSON.stringify({ habitId })
    });
    if (!res) return null;
    const data = await res.json();

    // ✅ Update user XP in localStorage automatically
    if (data?.xpUpdate) {
        const user = JSON.parse(localStorage.getItem("user")) || {};
        localStorage.setItem("user", JSON.stringify({
            ...user,
            xp:        data.xpUpdate.xp,
            level:     data.xpUpdate.level,
            levelName: data.xpUpdate.levelName,
            xpForNext: data.xpUpdate.xpForNext
        }));

        // ✅ Fire event so Sidebar/Navbar re-render immediately
        window.dispatchEvent(new Event("xpUpdated"));
    }
    return data;
};

export const getCalendar = async () => {
    const res = await authFetch("http://localhost:5000/api/analytics/calendar");
    return res ? await res.json() : null;
};

export const getAnalytics = async () => {
    const res = await authFetch("http://localhost:5000/api/analytics");
    return res ? await res.json() : null;
};