const workouts={
"Back & Traps":["Lat Pulldown","Seated Cable Row","Shrugs","Face Pulls"],
"Chest & Triceps":["Bench Press","Incline DB Press","Cable Fly","Tricep Pushdown"],
"Legs":["Squat","Leg Press","Romanian Deadlift","Walking Lunges","Calf Raises"],
"Push Day":["Bench Press","Overhead Press","Lateral Raises","Tricep Pushdowns"],
"Pull Day":["Deadlift","Pull-Ups","Barbell Row","Hammer Curl"],
"Power & Strength":["Heavy Squat","Heavy Bench","Deadlift","Farmer Carries"],
"HIIT Conditioning":["Battle Ropes","Burpees","Assault Bike","Box Jumps"]
};
const abs=["Hanging Knee Raises","Cable Crunches","Plank","Russian Twists","Bicycle Crunches","Ab Wheel Rollouts","Reverse Crunches","Toe Touches"];
const starterTasks=[
{text:"Plan tomorrow before bed",cat:"work",done:false},
{text:"Review top goals",cat:"development",done:false},
{text:"Read/listen to personal development 20 min",cat:"development",done:false},
{text:"Journal / daily reflection",cat:"development",done:false}
];

let state=JSON.parse(localStorage.getItem("ironTherapyCleanResetV1")||"{}");
let now=new Date(), year=now.getFullYear(), month=now.getMonth(), selected=fmt(now);

function fmt(d){return d.toISOString().slice(0,10)}
function key(y,m,d){return `${y}-${String(m+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`}
function data(){if(!state[selected])state[selected]={workout:"",fitnessPhoto:"",exercises:[],absOn:false,cardio:{on:false},meals:[],goals:{calories:2200,protein:180,carbs:180,fat:70},tasks:JSON.parse(JSON.stringify(starterTasks)),reflection:{}};return state[selected]}
function save(){localStorage.setItem("ironTherapyCleanResetV1",JSON.stringify(state));renderAll()}

function renderCalendar(){const cal=document.getElementById("calendar");cal.innerHTML="";document.getElementById("monthTitle").textContent=new Date(year,month,1).toLocaleString(undefined,{month:"long",year:"numeric"});let first=new Date(year,month,1).getDay(), days=new Date(year,month+1,0).getDate();for(let i=0;i<first;i++){let b=document.createElement("div");b.className="day muted";cal.appendChild(b)}for(let d=1;d<=days;d++){let k=key(year,month,d), el=document.createElement("div");el.className="day"+(k===selected?" selected":"");el.innerHTML=`<strong>${d}</strong>`;el.onclick=()=>{selected=k;renderAll()};cal.appendChild(el)}}
function renderHeader(){let d=data();document.getElementById("dateTitle").textContent=new Date(selected+"T00:00:00").toLocaleDateString(undefined,{weekday:"long",month:"long",day:"numeric",year:"numeric"});document.getElementById("summary").textContent=`Workout: ${d.workout||"Not selected"} • Meals: ${d.meals.length} • Tasks: ${d.tasks.filter(t=>t.done).length}/${d.tasks.length}`}
function setupWorkoutSelect(){let s=document.getElementById("workoutSelect");s.innerHTML='<option value="">Select workout...</option>'+Object.keys(workouts).map(w=>`<option value="${w}">${w}</option>`).join("");s.value=data().workout||""}

function exerciseCard(ex,i,arr){return `<div class="exercise"><div class="row"><strong>${ex.name}</strong><button data-remove-ex="${i}">×</button></div><div class="set-row"><input placeholder="Set 1 reps" value="${ex.r1||""}" data-ex="${i}" data-field="r1"><input placeholder="Set 1 weight" value="${ex.w1||""}" data-ex="${i}" data-field="w1"><input placeholder="Set 2 reps" value="${ex.r2||""}" data-ex="${i}" data-field="r2"><input placeholder="Set 2 weight" value="${ex.w2||""}" data-ex="${i}" data-field="w2"><input placeholder="Set 3 reps" value="${ex.r3||""}" data-ex="${i}" data-field="r3"><input placeholder="Set 3 weight" value="${ex.w3||""}" data-ex="${i}" data-field="w3"></div></div>`}
function renderFitness(){let d=data();let img=document.getElementById("fitnessPreview");if(d.fitnessPhoto){img.src=d.fitnessPhoto;img.style.display="block"}else img.style.display="none";document.getElementById("exerciseList").innerHTML=d.exercises.map(exerciseCard).join("");document.getElementById("absToggle").checked=d.absOn;document.getElementById("absList").innerHTML=d.absOn?abs.map((a,i)=>`<div class="exercise"><strong>${a}</strong><div class="set-row"><input placeholder="Reps"><input placeholder="Weight/time"></div></div>`).join(""):"";document.getElementById("cardioToggle").checked=d.cardio.on;document.getElementById("cardioFields").style.display=d.cardio.on?"grid":"none";["cardioType","cardioDuration","cardioDistance","cardioCalories"].forEach(id=>document.getElementById(id).value=d.cardio[id]||"")}
function renderNutrition(){let d=data(),g=d.goals;["goalCalories","goalProtein","goalCarbs","goalFat"].forEach(id=>{let k=id.replace("goal","").toLowerCase();document.getElementById(id).value=g[k]||""});let t=d.meals.reduce((a,m)=>({cal:a.cal+(+m.calories||0),p:a.p+(+m.protein||0),c:a.c+(+m.carbs||0),f:a.f+(+m.fat||0)}),{cal:0,p:0,c:0,f:0});document.getElementById("macroTotals").innerHTML=`<strong>Daily Total:</strong> ${t.cal}/${g.calories} cal • ${t.p}/${g.protein}g protein • ${t.c}/${g.carbs}g carbs • ${t.f}/${g.fat}g fat`;document.getElementById("mealList").innerHTML=d.meals.map((m,i)=>`<div class="meal"><input placeholder="Meal name" value="${m.name||""}" data-meal="${i}" data-field="name"><input type="file" accept="image/*" data-photo="${i}">${m.photo?`<img class="meal-preview" style="display:block" src="${m.photo}">`:""}<button class="success" data-ai="${i}">Estimate Macros</button><button data-remove-meal="${i}">×</button><div class="status" id="status-${i}">AI ready. Tap Estimate Macros after the photo preview appears.</div><div class="grid"><input placeholder="Calories" value="${m.calories||""}" data-meal="${i}" data-field="calories"><input placeholder="Protein" value="${m.protein||""}" data-meal="${i}" data-field="protein"><input placeholder="Carbs" value="${m.carbs||""}" data-meal="${i}" data-field="carbs"><input placeholder="Fat" value="${m.fat||""}" data-meal="${i}" data-field="fat"></div><textarea placeholder="Notes" data-meal="${i}" data-field="notes">${m.notes||""}</textarea></div>`).join("")}
function renderTasks(){let d=data();document.getElementById("workTasks").innerHTML=d.tasks.map((t,i)=>t.cat==="work"?taskHtml(t,i):"").join("");document.getElementById("devTasks").innerHTML=d.tasks.map((t,i)=>t.cat==="development"?taskHtml(t,i):"").join("");document.getElementById("wentWell").value=d.reflection.wentWell||"";document.getElementById("needsWork").value=d.reflection.needsWork||"";document.getElementById("tomorrowFocus").value=d.reflection.tomorrowFocus||""}
function taskHtml(t,i){return `<div class="task"><input type="checkbox" ${t.done?"checked":""} data-task-done="${i}"><input value="${t.text||""}" data-task="${i}"><button data-remove-task="${i}">×</button></div>`}
function renderAll(){renderCalendar();renderHeader();setupWorkoutSelect();renderFitness();renderNutrition();renderTasks()}

document.addEventListener("click",async e=>{let d=data();
if(e.target.classList.contains("tab")){document.querySelectorAll(".tab,.tab-content").forEach(x=>x.classList.remove("active"));e.target.classList.add("active");document.getElementById(e.target.dataset.tab).classList.add("active")}
if(e.target.id==="loadWorkout"){let w=document.getElementById("workoutSelect").value;if(!w)return alert("Select a workout first.");d.workout=w;d.exercises=workouts[w].map(name=>({name}));save()}
if(e.target.id==="addExercise"){d.exercises.push({name:"Custom Exercise"});save()}
if(e.target.id==="addMeal"){d.meals.push({});save()}
if(e.target.dataset.addTask){d.tasks.push({text:"",cat:e.target.dataset.addTask,done:false});save()}
if(e.target.dataset.removeMeal){d.meals.splice(+e.target.dataset.removeMeal,1);save()}
if(e.target.dataset.removeTask){d.tasks.splice(+e.target.dataset.removeTask,1);save()}
if(e.target.dataset.removeEx){d.exercises.splice(+e.target.dataset.removeEx,1);save()}
if(e.target.dataset.ai){let i=+e.target.dataset.ai,m=d.meals[i],status=document.getElementById(`status-${i}`);status.textContent="Button clicked.";if(!m.photo){status.textContent="No photo saved on this meal card.";alert("Upload/select a photo first and wait for the preview to show.");return}status.textContent="Photo found. Sending to AI...";try{let r=await fetch("/api/analyze-meal",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({image:m.photo,mealName:m.name||""})});let result=await r.json();if(!r.ok)throw new Error(result.error||"AI failed");m.name=result.mealName||m.name||"Meal";m.calories=result.calories||0;m.protein=result.protein||0;m.carbs=result.carbs||0;m.fat=result.fat||0;m.notes=result.notes||"AI estimate.";save();alert("Meal macros estimated.")}catch(err){status.textContent="AI failed: "+err.message;alert("AI failed: "+err.message)}}});
document.addEventListener("change",e=>{let d=data();
if(e.target.id==="fitnessPhoto"){let f=e.target.files[0];if(!f)return;let r=new FileReader();r.onload=()=>{d.fitnessPhoto=r.result;save()};r.readAsDataURL(f)}
if(e.target.id==="absToggle"){d.absOn=e.target.checked;save()}
if(e.target.id==="cardioToggle"){d.cardio.on=e.target.checked;save()}
if(e.target.dataset.photo){let i=+e.target.dataset.photo,f=e.target.files[0];if(!f)return;let r=new FileReader();r.onload=()=>{d.meals[i].photo=r.result;save()};r.readAsDataURL(f)}
if(e.target.dataset.taskDone){d.tasks[+e.target.dataset.taskDone].done=e.target.checked;save()}});
document.addEventListener("input",e=>{let d=data();
if(e.target.dataset.meal){d.meals[+e.target.dataset.meal][e.target.dataset.field]=e.target.value;localStorage.setItem("ironTherapyCleanResetV1",JSON.stringify(state))}
if(e.target.dataset.ex){d.exercises[+e.target.dataset.ex][e.target.dataset.field]=e.target.value;localStorage.setItem("ironTherapyCleanResetV1",JSON.stringify(state))}
if(e.target.dataset.task){d.tasks[+e.target.dataset.task].text=e.target.value;localStorage.setItem("ironTherapyCleanResetV1",JSON.stringify(state))}
if(["goalCalories","goalProtein","goalCarbs","goalFat"].includes(e.target.id)){d.goals[e.target.id.replace("goal","").toLowerCase()]=+e.target.value;localStorage.setItem("ironTherapyCleanResetV1",JSON.stringify(state));renderNutrition()}
if(["cardioType","cardioDuration","cardioDistance","cardioCalories"].includes(e.target.id)){d.cardio[e.target.id]=e.target.value;localStorage.setItem("ironTherapyCleanResetV1",JSON.stringify(state))}
if(["wentWell","needsWork","tomorrowFocus"].includes(e.target.id)){d.reflection[e.target.id]=e.target.value;localStorage.setItem("ironTherapyCleanResetV1",JSON.stringify(state))}});
document.getElementById("prevMonth").onclick=()=>{month--;if(month<0){month=11;year--}renderAll()};
document.getElementById("nextMonth").onclick=()=>{month++;if(month>11){month=0;year++}renderAll()};
document.getElementById("exportBtn").onclick=()=>{let blob=new Blob([JSON.stringify(state,null,2)],{type:"application/json"});let a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="iron-therapy-backup.json";a.click()};
setupWorkoutSelect();renderAll();
