import React, { useEffect, useMemo, useState } from "react";

type Course = "Starter" | "Main" | "Dessert";
type Dish = {
    id: string;
    name: string;
    description: string;
    course: Course;
    price: number;
    createdAt: string;
};

const STORAGE_KEY = "chef_christoffel_menu_v1";
const COURSES: Course[] = ["Starter", "Main", "Dessert"];

function uid() {
    return Math.random().toString(36).slice(2, 9);
}

export default function App(): React.ReactElement {
    const [dishes, setDishes] = useState<Dish[]>([]);
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [course, setCourse] = useState<Course>("Starter");
    const [price, setPrice] = useState<number | "">("");
    const [filter, setFilter] = useState<"All" | Course | "">("All");

    useEffect(() => {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (raw) setDishes(JSON.parse(raw) as Dish[]);
        } catch {
            // ignore parse errors
        }
    }, []);

    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(dishes));
    }, [dishes]);

    const total = dishes.length;

    const visible = useMemo(() => {
        if (filter === "All" || filter === "") return dishes;
        return dishes.filter((d) => d.course === filter);
    }, [dishes, filter]);

    function resetForm() {
        setName("");
        setDescription("");
        setCourse("Starter");
        setPrice("");
    }

    function handleAdd(e?: React.FormEvent) {
        e?.preventDefault();
        if (!name.trim()) return alert("Enter dish name.");
        if (price === "" || Number.isNaN(Number(price))) return alert("Enter valid price.");
        const newDish: Dish = {
            id: uid(),
            name: name.trim(),
            description: description.trim(),
            course,
            price: Number(price),
            createdAt: new Date().toISOString(),
        };
        setDishes((s) => [newDish, ...s]);
        resetForm();
    }

    function handleDelete(id: string) {
        if (!confirm("Remove this dish?")) return;
        setDishes((s) => s.filter((d) => d.id !== id));
    }

    function formatPrice(n: number) {
        return n.toLocaleString(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 2 });
    }

    return (
        <div style={{ fontFamily: "system-ui, sans-serif", padding: 20, maxWidth: 900, margin: "0 auto" }}>
            <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                <div>
                    <h1 style={{ margin: 0 }}>Chef Christoffel — Menu Manager</h1>
                    <p style={{ margin: "4px 0 0 0", color: "#555" }}>Total menu items: {total}</p>
                </div>
                <div>
                    <label style={{ marginRight: 8, color: "#333" }}>Filter:</label>
                    <select value={filter} onChange={(e) => setFilter(e.target.value as any)}>
                        <option value="All">All</option>
                        {COURSES.map((c) => (
                            <option key={c} value={c}>
                                {c}s
                            </option>
                        ))}
                    </select>
                </div>
            </header>

            <main style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: 20 }}>
                <section>
                    <h2 style={{ marginTop: 0 }}>Prepared Menu ({visible.length})</h2>
                    {visible.length === 0 ? (
                        <p style={{ color: "#666" }}>No dishes yet. Use the form to add items.</p>
                    ) : (
                        <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                            {visible.map((d) => (
                                <li
                                    key={d.id}
                                    style={{
                                        border: "1px solid #e0e0e0",
                                        borderRadius: 8,
                                        padding: 12,
                                        marginBottom: 12,
                                        display: "flex",
                                        justifyContent: "space-between",
                                        gap: 12,
                                    }}
                                >
                                    <div>
                                        <div style={{ display: "flex", gap: 8, alignItems: "baseline" }}>
                                            <strong style={{ fontSize: 16 }}>{d.name}</strong>
                                            <small style={{ color: "#888" }}>{d.course}</small>
                                            <small style={{ color: "#aaa" }}>{new Date(d.createdAt).toLocaleString()}</small>
                                        </div>
                                        <p style={{ margin: "6px 0 0 0", color: "#444" }}>{d.description || <em>No description</em>}</p>
                                    </div>
                                    <div style={{ textAlign: "right" }}>
                                        <div style={{ fontWeight: 600 }}>{formatPrice(d.price)}</div>
                                        <div style={{ marginTop: 8 }}>
                                            <button
                                                onClick={() => handleDelete(d.id)}
                                                style={{
                                                    background: "#ff4d4f",
                                                    color: "white",
                                                    border: "none",
                                                    padding: "6px 10px",
                                                    borderRadius: 6,
                                                    cursor: "pointer",
                                                }}
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </section>

                <aside style={{ border: "1px solid #f0f0f0", padding: 12, borderRadius: 8 }}>
                    <h3 style={{ marginTop: 0 }}>Add / Update Dish</h3>
                    <form onSubmit={handleAdd} style={{ display: "grid", gap: 8 }}>
                        <label>
                            Dish name
                            <input
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="e.g., Seared Scallops"
                                style={{ width: "100%", padding: 8, marginTop: 6 }}
                            />
                        </label>

                        <label>
                            Description
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Short description for clients"
                                rows={3}
                                style={{ width: "100%", padding: 8, marginTop: 6 }}
                            />
                        </label>

                        <label>
                            Course
                            <select value={course} onChange={(e) => setCourse(e.target.value as Course)} style={{ width: "100%", padding: 8, marginTop: 6 }}>
                                {COURSES.map((c) => (
                                    <option key={c} value={c}>
                                        {c}
                                    </option>
                                ))}
                            </select>
                        </label>

                        <label>
                            Price (numbers only)
                            <input
                                type="number"
                                value={price === "" ? "" : price}
                                onChange={(e) => setPrice(e.target.value === "" ? "" : Number(e.target.value))}
                                placeholder="e.g., 12.50"
                                style={{ width: "100%", padding: 8, marginTop: 6 }}
                                step="0.01"
                                min="0"
                            />
                        </label>

                        <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
                            <button type="submit" style={{ flex: 1, padding: "8px 12px", cursor: "pointer" }}>
                                Save Dish
                            </button>
                            <button
                                type="button"
                                onClick={resetForm}
                                style={{ flex: 1, padding: "8px 12px", background: "#f5f5f5", cursor: "pointer" }}
                            >
                                Reset
                            </button>
                        </div>
                    </form>

                    <footer style={{ marginTop: 12, fontSize: 13, color: "#666" }}>
                        Menus are saved locally. Clients who access the app will always see the latest saved menu.
                    </footer>
                </aside>
            </main>
        </div>
    );
}