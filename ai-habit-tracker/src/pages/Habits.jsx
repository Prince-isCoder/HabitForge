import React, { useEffect, useState } from "react";

const Habits = () => {
    const [habits, setHabits] = useState([]);
    const [title, setTitle] = useState("");

    const fetchHabits = async () => {
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
    };

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
        <div className="p-6 text-white">
            <h2 className="text-xl mb-4">📋 Habits</h2>

            <div className="flex gap-2 mb-4">
                <input
                    className="p-2 rounded bg-slate-700"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Add habit..."
                />
                <button
                    onClick={addHabit}
                    className="bg-green-600 px-4 rounded"
                >
                    Add
                </button>
            </div>

            <ul>
                {Array.isArray(habits) &&
                    habits.map((habit) => (
                        <li
                            key={habit._id}
                            className={`flex justify-between bg-slate-800 p-2 mb-2 rounded ${habit.completed ? "line-through text-gray-400" : ""
                                }`}
                        >
                            <div>
                                <div>{habit.title}</div>
                                <div className="text-sm text-orange-400">
                                    🔥 {habit.streak || 0} day streak
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <button
                                    onClick={() => markComplete(habit._id)}
                                    className={`px-2 rounded ${habit.completed ? "btn btn-success" : "btn btn-primary"
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