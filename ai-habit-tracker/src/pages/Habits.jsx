import React, { useEffect, useState, useCallback } from "react";

const Habits = () => {
    const [habits, setHabits] = useState([]);
    const [title, setTitle] = useState("");

    const fetchHabits = useCallback(async () => {
        try {
            const res = await fetch("http://localhost:5000/api/habits", {
                headers: {
                    "Authorization": `Bearer ${localStorage.getItem("token")}`
                }
            });
            const data = await res.json();
            console.log("Habits:", data);
            setHabits(data);
        } catch (err) {
            console.error("Fetch error:", err);
        }
    }, []);

    const addHabit = async () => {
        console.log("Clicked Add");

        if (!title) return alert("Enter habit");

        try {
            const res = await fetch("http://localhost:5000/api/habits", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${localStorage.getItem("token")}`
                },
                body: JSON.stringify({ title })
            });

            const data = await res.json();
            console.log("Added:", data);

            setTitle("");
            fetchHabits();
        } catch (err) {
            console.error("Add error:", err);
        }
    };

    const deleteHabit = async (id) => {
        console.log("Delete clicked", id);

        try {
            await fetch(`http://localhost:5000/api/habits/${id}`, {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${localStorage.getItem("token")}`
                }
            });

            fetchHabits();
        } catch (err) {
            console.error("Delete error:", err);
        }
    };

    const markComplete = async (id) => {
        const res = await fetch("http://localhost:5000/api/habits/complete", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem("token")}`
            },
            body: JSON.stringify({ habitId: id })
        });

        const updated = await res.json();

        // 🔥 update UI instantly
        setHabits(prev =>
            prev.map(h =>
                h._id === id ? updated : h
            )
        );
    };

    useEffect(() => {
        fetchHabits();
    }, []);


    return (
        <div className="p-6 bg-background text-text font-['Outfit']">
            <h2 className="text-xl mb-4 font-semibold">📋 Habits</h2>

            <div className="flex gap-2 mb-4">
                <input
                    className="p-2 rounded bg-surface border border-border text-text placeholder:text-textMuted outline-none focus:border-primary"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Add habit..."
                />
                <button
                    onClick={addHabit}
                    className="btn btn-primary"
                >
                    Add
                </button>
            </div>

            <ul className="space-y-2">
                {Array.isArray(habits) &&
                    habits.map((habit) => (
                        <li
                            key={habit._id}
                            className={`flex justify-between items-center bg-surface border border-border p-4 rounded-xl transition-all ${habit.completed ? "opacity-50 line-through grayscale" : ""
                                }`}
                        >
                            <div>
                                <div className="font-medium">{habit.title}</div>
                                <div className="text-sm text-orange-500 font-semibold">
                                    🔥 {habit.streak || 0} day streak
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <button
                                    onClick={() => markComplete(habit._id)}
                                    className={`btn ${habit.completed ? "btn-success" : "btn-primary"
                                        }`}
                                >
                                    {habit.completed ? "↺" : "✔"}
                                </button>

                                <button
                                    onClick={() => deleteHabit(habit._id)}
                                    className="btn btn-danger"
                                >
                                    Delete
                                </button>
                            </div>
                        </li>
                    ))
                }

            </ul>
        </div>
    );
};

export default Habits;
