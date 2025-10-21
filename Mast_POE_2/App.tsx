import React, { JSX, useEffect, useMemo, useState } from "react";
import {
  SafeAreaView, View, Text, TextInput, TouchableOpacity, FlatList,
  StyleSheet, Alert, KeyboardAvoidingView, Platform, StatusBar,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

type Course = "Starters" | "Mains" | "Desserts";
type Dish = { id: string; name: string; description?: string; course: Course; price: number; createdAt: number; };

const STORAGE_KEY = "@chef_menu_items_v2";
const COURSES: Course[] = ["Starters", "Mains", "Desserts"];
const THEME = { primary: "#246BFD", accent: "#FF6B6B", bg: "#F6F8FB", card: "#FFF", text: "#1F2937", muted: "#6B7280" };

const load = async () => { try { const r = await AsyncStorage.getItem(STORAGE_KEY); return r ? (JSON.parse(r) as Dish[]) : []; } catch { return []; } };
const save = async (items: Dish[]) => { try { await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(items)); } catch {} };
const courseColor = (c: Course) => (c === "Starters" ? "#FFB86B" : c === "Mains" ? "#6BB0FF" : "#FF8ACB");

function Header({ title, sub, count }: { title: string; sub?: string; count?: number }) {
  return (
    <View style={s.h}>
      <Text style={s.ht}>{title}</Text>
      {sub ? <Text style={s.hs}>{sub}</Text> : null}
      {typeof count === "number" ? <Text style={s.hc}>{count} dishes</Text> : null}
    </View>
  );
}

function Nav({ screen, setScreen }: { screen: "customer" | "chef"; setScreen: (s: any) => void }) {
  return (
    <View style={s.nav}>
      <TouchableOpacity style={[s.tab, screen === "customer" && s.ta]} onPress={() => setScreen("customer")}><Text style={[s.tt, screen === "customer" && s.tta]}>Customer</Text></TouchableOpacity>
      <TouchableOpacity style={[s.tab, screen === "chef" && s.ta]} onPress={() => setScreen("chef")}><Text style={[s.tt, screen === "chef" && s.tta]}>Manager</Text></TouchableOpacity>
    </View>
  );
}

const Card = ({ item, onQty, onRemove }: { item: Dish; onQty?: (id: string, d: number) => void; onRemove?: (id: string) => void }) => (
  <View style={s.card}>
    <View style={[s.strip, { backgroundColor: courseColor(item.course) }]} />
    <Text style={s.ct}>{item.name}</Text>
    <Text style={s.cc}>{item.course}</Text>
    {item.description ? <Text style={s.cd}>{item.description}</Text> : null}
    <View style={s.cf}>
      <Text style={s.cp}>R{item.price.toFixed(2)}</Text>
      <View style={s.row}>
        {onQty ? <>
          <TouchableOpacity onPress={() => onQty(item.id, -1)} style={s.q}><Text style={s.qt}>−</Text></TouchableOpacity>
          <TouchableOpacity onPress={() => onQty(item.id, +1)} style={s.q}><Text style={s.qt}>+</Text></TouchableOpacity>
        </> : null}
        {onRemove ? <TouchableOpacity onPress={() => onRemove(item.id)} style={s.rm}><Text style={s.rmt}>Remove</Text></TouchableOpacity> : null}
      </View>
    </View>
  </View>
);

function Customer({ menu, openManager }: { menu: Dish[]; openManager: () => void }) {
  const [filter, setFilter] = useState<"All" | Course>("All");
  const [q, setQ] = useState("");
  const [cart, setCart] = useState<Record<string, number>>({});
  const visible = useMemo(() => {
    let items = filter === "All" ? menu : menu.filter(m => m.course === filter);
    if (q.trim()) { const Q = q.toLowerCase(); items = items.filter(i => i.name.toLowerCase().includes(Q) || (i.description || "").toLowerCase().includes(Q)); }
    return items;
  }, [menu, filter, q]);

  const changeQty = (id: string, d: number) => setCart(s => { const c = { ...s }; const n = Math.max(0, (c[id]||0)+d); if (n) c[id]=n; else delete c[id]; return c; });
  const totalItems = Object.values(cart).reduce((a,b)=>a+b,0);
  const totalPrice = menu.reduce((sum,m)=> sum + (cart[m.id]||0)*m.price, 0);

  return (
    <View style={s.body}>
      <View style={s.controls}>
        <View style={s.filters}>
          <TouchableOpacity onPress={() => setFilter("All")} style={[s.pill, filter==="All"&&s.pilla]}><Text style={[s.pt, filter==="All"&&s.pta]}>All</Text></TouchableOpacity>
          {COURSES.map(c=> <TouchableOpacity key={c} onPress={()=>setFilter(c)} style={[s.pill, filter===c&&s.pilla]}><Text style={[s.pt, filter===c&&s.pta]}>{c}</Text></TouchableOpacity>)}
        </View>
        <View style={s.search}>
          <TextInput placeholder="Search..." value={q} onChangeText={setQ} style={s.input} />
          <TouchableOpacity onPress={openManager} style={s.mbtn}><Text style={s.mbtxt}>Manager</Text></TouchableOpacity>
        </View>
      </View>

      <FlatList data={visible} keyExtractor={i=>i.id} numColumns={2} columnWrapperStyle={s.rowWrap}
        renderItem={({item})=> <Card item={item} onQty={changeQty} />} ListEmptyComponent={<View style={s.empty}><Text style={s.emptyTxt}>No dishes.</Text></View>} />

      <View style={s.cart}>
        <Text style={s.cartTxt}>{totalItems} items • R{totalPrice.toFixed(2)}</Text>
        <TouchableOpacity onPress={()=>Alert.alert("Request","Request sent to Chef")} style={s.primary}><Text style={s.pTxt}>Request Experience</Text></TouchableOpacity>
      </View>
    </View>
  );
}

function Chef({ menu, add, remove, back }: { menu: Dish[]; add: (d: Omit<Dish,"id"|"createdAt">)=>void; remove: (id:string)=>void; back: ()=>void }) {
  const [name, setName] = useState(""); const [desc,setDesc]=useState(""); const [course,setCourse]=useState<Course>("Mains"); const [price,setPrice]=useState("");
  const submit = ()=> { if(!name.trim()) return Alert.alert("Validation","Enter dish name."); const p = parseFloat(price); if(Number.isNaN(p)||p<0) return Alert.alert("Validation","Enter valid price."); add({name:name.trim(),description:desc.trim(),course,price:p}); setName(""); setDesc(""); setCourse("Mains"); setPrice(""); };

  return (
    <KeyboardAvoidingView style={s.body} behavior={Platform.OS==="ios"?"padding":undefined}>
      <View style={s.chefTop}><TouchableOpacity onPress={back}><Text style={s.back}>← Back</Text></TouchableOpacity>
        <Text style={s.ctitle}>Manager — Add / Remove</Text>
        <Text style={s.csub}>Total {menu.length} • Starters {menu.filter(m=>m.course==="Starters").length}</Text>
      </View>

      <View style={s.form}>
        <TextInput placeholder="Name" value={name} onChangeText={setName} style={s.input} />
        <TextInput placeholder="Description" value={desc} onChangeText={setDesc} style={[s.input,{height:80}]} multiline />
        <View style={s.courseRow}>{COURSES.map(c=> <TouchableOpacity key={c} onPress={()=>setCourse(c)} style={[s.courseOpt, course===c&&s.courseOptA]}><Text style={[s.courseTxt, course===c&&s.courseTxtA]}>{c}</Text></TouchableOpacity>)}</View>
        <TextInput placeholder="Price e.g. 120.00" value={price} onChangeText={setPrice} keyboardType="decimal-pad" style={s.input} />
        <View style={s.formActions}><TouchableOpacity onPress={()=>{setName("");setDesc("");setCourse("Mains");setPrice("");}} style={s.ghost}><Text style={s.ghostTxt}>Reset</Text></TouchableOpacity>
        <TouchableOpacity onPress={submit} style={s.add}><Text style={s.addTxt}>Add Dish</Text></TouchableOpacity></View>
      </View>

      <FlatList data={menu} keyExtractor={i=>i.id} contentContainerStyle={{padding:12}} renderItem={({item})=>
        <View style={s.list}><View><Text style={s.lt}>{item.name}</Text><Text style={s.lm}>{item.course} • R{item.price.toFixed(2)}</Text></View>
        <TouchableOpacity onPress={()=>remove(item.id)} style={s.rmBtn}><Text style={s.rmBtnTxt}>Remove</Text></TouchableOpacity></View>
      } ListEmptyComponent={<View style={s.empty}><Text style={s.emptyTxt}>No dishes yet.</Text></View>} />
    </KeyboardAvoidingView>
  );
}

export default function App(): JSX.Element {
  const [menu, setMenu] = useState<Dish[]>([]);
  const [screen, setScreen] = useState<"customer" | "chef">("customer");

  useEffect(()=>{ (async()=>{ const m = await load(); setMenu(m); })(); },[]);
  const persist = async (items: Dish[])=>{ setMenu(items); await save(items); };

  const add = (d: Omit<Dish,"id"|"createdAt">)=> persist([{ ...d, id: String(Date.now()), createdAt: Date.now() }, ...menu]);
  const remove = (id: string)=> {
    const del = ()=> persist(menu.filter(m=>m.id!==id));
    if (Platform.OS==="web" && typeof window!=="undefined") { if (window.confirm("Delete this dish?")) del(); return; }
    Alert.alert("Delete","Remove this dish?",[{text:"Cancel",style:"cancel"},{text:"Delete",style:"destructive",onPress:del}]);
  };

  return (
    <SafeAreaView style={st.safe}>
      <StatusBar backgroundColor={THEME.primary} barStyle="light-content" />
      <Header title="Chef Christoffel" sub="Fresh menu — always up to date" count={menu.length} />
      <View style={{flex:1}}>{screen==="customer" ? <Customer menu={menu} openManager={()=>setScreen("chef")} /> : <Chef menu={menu} add={add} remove={remove} back={()=>setScreen("customer")} />}</View>
      <Nav screen={screen} setScreen={setScreen} />
    </SafeAreaView>
  );
}

const st = StyleSheet.create({
  safe:{flex:1,backgroundColor:THEME.bg}
});

const s = StyleSheet.create({
  h:{padding:16,paddingTop:20,backgroundColor:THEME.primary},
  ht:{color:"#fff",fontSize:22,fontWeight:"800"},
  hs:{color:"#D6E4FF",marginTop:4},
  hc:{color:"#fff",marginTop:6,fontWeight:"700"},
  nav:{flexDirection:"row",borderTopWidth:1,borderTopColor:"#eee",backgroundColor:"#fff"},
  tab:{flex:1,padding:12,alignItems:"center"},
  ta:{backgroundColor:"#F0F6FF"},
  tt:{color:THEME.muted,fontWeight:"800"},
  tta:{color:THEME.primary},
  body:{flex:1},
  controls:{padding:12},
  filters:{flexDirection:"row",marginBottom:8},
  pill:{paddingVertical:6,paddingHorizontal:10,borderRadius:20,backgroundColor:"#fff",marginRight:8,borderWidth:1,borderColor:"#eee"},
  pilla:{borderColor:THEME.primary},
  pt:{color:THEME.muted,fontWeight:"700"},
  pta:{color:THEME.primary},
  search:{flexDirection:"row",alignItems:"center"},
  input:{flex:1,backgroundColor:"#fff",borderRadius:8,padding:10,borderWidth:1,borderColor:"#eee"},
  mbtn:{marginLeft:8,backgroundColor:THEME.accent,paddingVertical:8,paddingHorizontal:12,borderRadius:8},
  mbtxt:{color:"#fff",fontWeight:"800"},
  rowWrap:{justifyContent:"space-between"},
  card:{flex:1,backgroundColor:THEME.card,borderRadius:10,padding:12,marginBottom:12,marginHorizontal:6,minWidth:140,maxWidth:"48%"},
  strip:{height:6,borderRadius:4,marginBottom:8},
  ct:{fontWeight:"800",color:THEME.text},
  cc:{color:THEME.muted,fontSize:12,marginTop:4},
  cd:{color:THEME.muted,fontSize:13,marginTop:8,minHeight:36},
  cf:{flexDirection:"row",justifyContent:"space-between",alignItems:"center",marginTop:10},
  cp:{fontWeight:"900",color:THEME.text},
  row:{flexDirection:"row",alignItems:"center"},
  q:{padding:6,borderRadius:6,backgroundColor:"#F3F4F6",marginHorizontal:6},
  qt:{fontWeight:"900"},
  rm:{marginLeft:8,paddingVertical:6,paddingHorizontal:8,borderRadius:8,backgroundColor:"#FDE8E8"},
  rmt:{color:"#D04545",fontWeight:"800"},
  cart:{position:"absolute",left:12,right:12,bottom:12,backgroundColor:THEME.card,borderRadius:12,padding:12,flexDirection:"row",justifyContent:"space-between",alignItems:"center",elevation:3},
  cartTxt:{color:THEME.text,fontWeight:"700"},
  primary:{backgroundColor:THEME.primary,paddingVertical:8,paddingHorizontal:12,borderRadius:8},
  pTxt:{color:"#fff",fontWeight:"800"},
  empty:{padding:24,alignItems:"center"},
  emptyTxt:{color:THEME.muted},
  chefTop:{padding:12,backgroundColor:"#fff",borderBottomWidth:1,borderBottomColor:"#eee"},
  back:{color:THEME.primary,fontWeight:"800",marginBottom:6},
  ctitle:{fontSize:18,fontWeight:"900",color:THEME.text},
  csub:{color:THEME.muted,marginTop:4},
  form:{padding:12,backgroundColor:"#fff",marginTop:8},
  courseRow:{flexDirection:"row",marginTop:8},
  courseOpt:{flex:1,paddingVertical:10,alignItems:"center",borderRadius:8,borderWidth:1,borderColor:"#eee",backgroundColor:"#fff",marginRight:8},
  courseOptA:{backgroundColor:THEME.primary},
  courseTxt:{color:THEME.text,fontWeight:"700"},
  courseTxtA:{color:"#fff"},
  formActions:{flexDirection:"row",marginTop:12},
  ghost:{flex:1,borderWidth:1,borderColor:"#eee",padding:12,borderRadius:8,alignItems:"center",marginRight:8},
  ghostTxt:{fontWeight:"800",color:THEME.muted},
  add:{flex:1,backgroundColor:THEME.primary,padding:12,borderRadius:8,alignItems:"center"},
  addTxt:{color:"#fff",fontWeight:"900"},
  list:{flexDirection:"row",justifyContent:"space-between",alignItems:"center",padding:12,backgroundColor:THEME.card,marginBottom:8,borderRadius:8},
  lt:{fontWeight:"800",color:THEME.text},
  lm:{color:THEME.muted,marginTop:4},
  rmBtn:{paddingVertical:8,paddingHorizontal:12,borderRadius:8,backgroundColor:THEME.accent},
  rmBtnTxt:{color:"#fff",fontWeight:"800"},
});