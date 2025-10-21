import React, { JSX, useEffect, useMemo, useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

/* --- types --- */
type Course = "Starters" | "Mains" | "Desserts";
type Dish = {
  id: string;
  name: string;
  description?: string;
  course: Course;
  price: number;
  createdAt: number;
};

/* --- constants --- */
const STORAGE_KEY = "@chef_menu_items_v2";
const COURSES: Course[] = ["Starters", "Mains", "Desserts"];
const COLORS = {
  primary: "#246BFD",
  accent: "#FF6B6B",
  bg: "#F6F8FB",
  card: "#FFFFFF",
  text: "#1F2937",
  muted: "#6B7280",
};

/* --- App --- */
export default function App(): JSX.Element {
  const [menu, setMenu] = useState<Dish[]>([]);
  const [screen, setScreen] = useState<"customer" | "chef">("customer");

  // load persisted menu
  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((r) => {
        if (r) {
          try {
            const parsed = JSON.parse(r) as Dish[];
            setMenu(parsed);
          } catch {
            // ignore parse error
          }
        }
      })
      .catch(() => {});
  }, []);

  const persist = async (items: Dish[]) => {
    setMenu(items);
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // ignore
    }
  };

  const addDish = (d: Omit<Dish, "id" | "createdAt">) => {
    const newDish: Dish = { ...d, id: String(Date.now()), createdAt: Date.now() };
    persist([newDish, ...menu]);
    setScreen("customer");
  };

  const removeDish = (id: string) => {
    const doDelete = () => {
      const next = menu.filter((m) => m.id !== id);
      persist(next);
    };
    if (Platform.OS === "web" && typeof window !== "undefined") {
      if (window.confirm("Delete this dish?")) doDelete();
      return;
    }
    Alert.alert("Delete", "Remove this dish?", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: doDelete },
    ]);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar backgroundColor={COLORS.primary} barStyle="light-content" />
      <View style={styles.appHeader}>
        <Text style={styles.appTitle}>Chef Christoffel</Text>
        <Text style={styles.appSubtitle}>Fresh menu — always up to date</Text>
        {/* total number of dishes shown on home screen */}
        <Text style={styles.appCount}>{menu.length} dishes</Text>
      </View>

      <View style={styles.screenWrap}>
        {screen === "customer" ? (
          <CustomerScreen menu={menu} onOpenChef={() => setScreen("chef")} />
        ) : (
          <ChefScreen menu={menu} onAdd={addDish} onRemove={removeDish} onBack={() => setScreen("customer")} />
        )}
      </View>

      <View style={styles.bottomNav}>
        <TouchableOpacity style={[styles.tab, screen === "customer" && styles.tabActive]} onPress={() => setScreen("customer")}>
          <Text style={[styles.tabText, screen === "customer" && styles.tabTextActive]}>Customer</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tab, screen === "chef" && styles.tabActive]} onPress={() => setScreen("chef")}>
          <Text style={[styles.tabText, screen === "chef" && styles.tabTextActive]}>Manager</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

/* --- Customer screen --- */
function CustomerScreen({ menu, onOpenChef }: { menu: Dish[]; onOpenChef: () => void }) {
  const [filter, setFilter] = useState<"All" | Course | "Search">("All");
  const [query, setQuery] = useState("");
  const [cart, setCart] = useState<Record<string, number>>({});

  const visible = useMemo(() => {
    let items = filter === "All" ? menu : menu.filter((m) => m.course === filter);
    if (query.trim()) {
      const q = query.toLowerCase();
      items = items.filter((i) => i.name.toLowerCase().includes(q) || (i.description || "").toLowerCase().includes(q));
    }
    return items;
  }, [menu, filter, query]);

  const changeQty = (id: string, delta: number) =>
    setCart((s) => {
      const copy = { ...s };
      const cur = copy[id] || 0;
      const next = Math.max(0, cur + delta);
      if (next === 0) delete copy[id];
      else copy[id] = next;
      return copy;
    });

  const totalItems = Object.values(cart).reduce((a, b) => a + b, 0);
  const totalPrice = menu.reduce((sum, d) => sum + (cart[d.id] || 0) * d.price, 0);

  return (
    <View style={styles.customerWrap}>
      <View style={styles.customerHeader}>
        <View style={styles.filterRow}>
          <TouchableOpacity onPress={() => setFilter("All")} style={[styles.filterPill, filter === "All" && styles.filterActive]}>
            <Text style={[styles.filterText, filter === "All" && styles.filterTextActive]}>All</Text>
          </TouchableOpacity>
          {COURSES.map((c) => (
            <TouchableOpacity key={c} onPress={() => setFilter(c)} style={[styles.filterPill, filter === c && styles.filterActive]}>
              <Text style={[styles.filterText, filter === c && styles.filterTextActive]}>{c}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.searchRow}>
          <TextInput placeholder="Search dishes..." style={styles.searchInput} value={query} onChangeText={setQuery} />
          <TouchableOpacity onPress={onOpenChef} style={styles.smallBtn}>
            <Text style={styles.smallBtnText}>Manager</Text>
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={visible}
        keyExtractor={(i) => i.id}
        numColumns={2}
        columnWrapperStyle={styles.gridRow}
        contentContainerStyle={{ padding: 12, paddingBottom: 120 }}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No dishes available.</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={[styles.cardStrip, { backgroundColor: courseColor(item.course) }]} />
            <Text style={styles.cardTitle}>{item.name}</Text>
            <Text style={styles.cardCourse}>{item.course}</Text>
            <Text style={styles.cardDesc}>{item.description}</Text>
            <View style={styles.cardFooter}>
              <Text style={styles.cardPrice}>R{item.price.toFixed(2)}</Text>
              <View style={styles.qtyRow}>
                <TouchableOpacity onPress={() => changeQty(item.id, -1)} style={styles.qtyBtn}>
                  <Text style={styles.qtyTxt}>−</Text>
                </TouchableOpacity>
                <Text style={styles.qtyNumber}>{cart[item.id] || 0}</Text>
                <TouchableOpacity onPress={() => changeQty(item.id, 1)} style={styles.qtyBtn}>
                  <Text style={styles.qtyTxt}>+</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      />

      <View style={styles.cartBar}>
        <Text style={styles.cartText}>{totalItems} items • R{totalPrice.toFixed(2)}</Text>
        <TouchableOpacity onPress={() => Alert.alert("Request", "Request sent to Chef for selected items.")} style={styles.primaryBtn}>
          <Text style={styles.primaryBtnText}>Request Experience</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

/* --- Chef screen --- */
function ChefScreen({ menu, onAdd, onRemove, onBack }: { menu: Dish[]; onAdd: (d: Omit<Dish, "id" | "createdAt">) => void; onRemove: (id: string) => void; onBack: () => void }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [course, setCourse] = useState<Course>("Mains");
  const [priceText, setPriceText] = useState("");

  const handleAdd = () => {
    if (!name.trim()) return Alert.alert("Validation", "Enter dish name.");
    const price = parseFloat(priceText);
    if (Number.isNaN(price) || price < 0) return Alert.alert("Validation", "Enter valid price.");
    onAdd({ name: name.trim(), description: description.trim(), course, price });
    setName("");
    setDescription("");
    setCourse("Mains");
    setPriceText("");
  };

  return (
    <KeyboardAvoidingView style={styles.chefWrap} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <View style={styles.chefTop}>
        <TouchableOpacity onPress={onBack} style={styles.linkBack}>
          <Text style={styles.linkBackText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.chefTitle}>Manager — Add / Remove</Text>
        <Text style={styles.chefSubtitle}>Total {menu.length} • Starters {menu.filter((m) => m.course === "Starters").length}</Text>
      </View>

      <View style={styles.form}>
        <TextInput placeholder="Name" value={name} onChangeText={setName} style={styles.input} />
        <TextInput placeholder="Description" value={description} onChangeText={setDescription} style={[styles.input, { height: 80 }]} multiline />
        <View style={styles.courseSelect}>
          {COURSES.map((c) => (
            <TouchableOpacity key={c} onPress={() => setCourse(c)} style={[styles.courseOption, course === c && styles.courseOptionActive]}>
              <Text style={[styles.courseText, course === c && styles.courseTextActive]}>{c}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <TextInput placeholder="Price e.g. 120.00" value={priceText} onChangeText={setPriceText} keyboardType="decimal-pad" style={styles.input} />
        <View style={styles.formActions}>
          <TouchableOpacity onPress={() => { setName(""); setDescription(""); setCourse("Mains"); setPriceText(""); }} style={styles.ghostBtn}>
            <Text style={styles.ghostTxt}>Reset</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleAdd} style={styles.addBtn}>
            <Text style={styles.addBtnText}>Add Dish</Text>
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={menu}
        keyExtractor={(i) => i.id}
        contentContainerStyle={{ padding: 12, paddingBottom: 120 }}
        ListEmptyComponent={<View style={styles.empty}><Text style={styles.emptyText}>No dishes yet.</Text></View>}
        renderItem={({ item }) => (
          <View style={styles.listRow}>
            <View>
              <Text style={styles.listTitle}>{item.name}</Text>
              <Text style={styles.listMeta}>{item.course} • R{item.price.toFixed(2)}</Text>
            </View>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <TouchableOpacity onPress={() => onRemove(item.id)} style={styles.removeBtn}>
                <Text style={styles.removeTxt}>Remove</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </KeyboardAvoidingView>
  );
}

/* --- helpers & styles --- */
function courseColor(c: Course) {
  if (c === "Starters") return "#FFB86B";
  if (c === "Mains") return "#6BB0FF";
  return "#FF8ACB";
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  appHeader: { padding: 16, paddingTop: 20, backgroundColor: COLORS.primary },
  appTitle: { color: "#fff", fontSize: 22, fontWeight: "800" },
  appSubtitle: { color: "#D6E4FF", marginTop: 4 },
  appCount: { color: "#fff", marginTop: 6, fontWeight: "700" },

  screenWrap: { flex: 1 },

  /* customer */
  customerWrap: { flex: 1 },
  customerHeader: { paddingHorizontal: 12, paddingTop: 12 },
  filterRow: { flexDirection: "row", marginBottom: 8 },
  filterPill: { paddingVertical: 6, paddingHorizontal: 10, borderRadius: 20, backgroundColor: "#fff", marginRight: 8, borderWidth: 1, borderColor: "#eee" },
  filterActive: { backgroundColor: "#fff", borderColor: COLORS.primary, shadowColor: "#000", elevation: 2 },
  filterText: { color: COLORS.muted, fontWeight: "700" },
  filterTextActive: { color: COLORS.primary },

  searchRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  searchInput: { flex: 1, backgroundColor: "#fff", borderRadius: 8, padding: 10, borderWidth: 1, borderColor: "#eee" },
  smallBtn: { marginLeft: 8, backgroundColor: COLORS.accent, paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8 },
  smallBtnText: { color: "#fff", fontWeight: "800" },

  gridRow: { justifyContent: "space-between" },
  card: { flex: 1, backgroundColor: COLORS.card, borderRadius: 10, padding: 12, marginBottom: 12, marginHorizontal: 6, minWidth: 140, maxWidth: "48%" },
  cardStrip: { height: 6, borderRadius: 4, marginBottom: 8 },
  cardTitle: { fontWeight: "800", color: COLORS.text },
  cardCourse: { color: COLORS.muted, fontSize: 12, marginTop: 4 },
  cardDesc: { color: COLORS.muted, fontSize: 13, marginTop: 8, minHeight: 36 },
  cardFooter: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 10 },
  cardPrice: { fontWeight: "900", color: COLORS.text },
  qtyRow: { flexDirection: "row", alignItems: "center" },
  qtyBtn: { padding: 6, borderRadius: 6, backgroundColor: "#F3F4F6", marginHorizontal: 6 },
  qtyTxt: { fontWeight: "900" },
  qtyNumber: { minWidth: 18, textAlign: "center", fontWeight: "800" },

  cartBar: { position: "absolute", left: 12, right: 12, bottom: 12, backgroundColor: COLORS.card, borderRadius: 12, padding: 12, flexDirection: "row", justifyContent: "space-between", alignItems: "center", shadowColor: "#000", elevation: 3 },
  cartText: { color: COLORS.text, fontWeight: "700" },
  primaryBtn: { backgroundColor: COLORS.primary, paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8 },
  primaryBtnText: { color: "#fff", fontWeight: "800" },

  empty: { padding: 24, alignItems: "center" },
  emptyText: { color: COLORS.muted },

  /* bottom nav */
  bottomNav: { flexDirection: "row", borderTopWidth: 1, borderTopColor: "#eee", backgroundColor: "#fff" },
  tab: { flex: 1, padding: 12, alignItems: "center" },
  tabActive: { backgroundColor: "#F0F6FF" },
  tabText: { color: COLORS.muted, fontWeight: "800" },
  tabTextActive: { color: COLORS.primary },

  /* chef */
  chefWrap: { flex: 1 },
  chefTop: { padding: 12, backgroundColor: "#fff", borderBottomWidth: 1, borderBottomColor: "#eee" },
  linkBack: { marginBottom: 6 },
  linkBackText: { color: COLORS.primary, fontWeight: "800" },
  chefTitle: { fontSize: 18, fontWeight: "900", color: COLORS.text },
  chefSubtitle: { color: COLORS.muted, marginTop: 4 },

  form: { padding: 12, backgroundColor: "#fff", marginTop: 8 },
  input: { backgroundColor: "#fff", borderWidth: 1, borderColor: "#eee", padding: 10, borderRadius: 8, marginTop: 8 },
  courseSelect: { flexDirection: "row", marginTop: 8 },
  courseOption: { flex: 1, paddingVertical: 10, alignItems: "center", borderRadius: 8, borderWidth: 1, borderColor: "#eee", backgroundColor: "#fff", marginRight: 8 },
  courseOptionActive: { backgroundColor: COLORS.primary },
  courseText: { color: COLORS.text, fontWeight: "700" },
  courseTextActive: { color: "#fff" },
  formActions: { flexDirection: "row", marginTop: 12 },
  ghostBtn: { flex: 1, borderWidth: 1, borderColor: "#eee", padding: 12, borderRadius: 8, alignItems: "center", marginRight: 8 },
  ghostTxt: { fontWeight: "800", color: COLORS.muted },
  addBtn: { flex: 1, backgroundColor: COLORS.primary, padding: 12, borderRadius: 8, alignItems: "center" },
  addBtnText: { color: "#fff", fontWeight: "900" },

  listRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 12, backgroundColor: COLORS.card, marginBottom: 8, borderRadius: 8 },
  listTitle: { fontWeight: "800", color: COLORS.text },
  listMeta: { color: COLORS.muted, marginTop: 4 },

  removeBtn: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8, backgroundColor: COLORS.accent },
  removeTxt: { color: "#fff", fontWeight: "800" },
});