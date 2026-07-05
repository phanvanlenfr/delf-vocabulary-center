/* DELF B1 Premium · KPI, streak và cột J được tính theo từng ngày */
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const KEY="delfB1Premium_v2",SHEET_ID="1YFaJsXJTqSx6uHM-JiE21w3QQ0O2eGNzHn74Jk4L0ME",GID="1047459457",SHEET_TABS=[{name:"T6",gid:"1047459457"},{name:"T7",gid:"20702423"}];
const START=new Date(2026,5,19),END=new Date(2026,6,31),TODAY=keyOf(new Date());
const seed={"2026-06-19":[{word:"s’expatrier",type:"động từ",meaning:"sống ở nước ngoài",example:"De nombreux jeunes s’expatrient pour étudier."},{word:"barrières linguistiques",type:"danh từ, số nhiều",meaning:"rào cản ngôn ngữ",example:"Les barrières linguistiques rendent l’intégration difficile."},{word:"s’intégrer",type:"động từ",meaning:"hòa nhập",example:"Il faut du temps pour s’intégrer dans une nouvelle culture."},{word:"autonomie",type:"danh từ",meaning:"tính tự lập, tự chủ",example:"Cette expérience lui a permis de développer son autonomie."}]};
const schedule=makeSchedule(),defaults={days:{},attempts:[],dark:false,collapsed:false,studySeconds:0,vocabByDate:seed,vocabOverrides:{}};
let state=load(),activeDate=schedule.some(x=>x.key===TODAY)?TODAY:schedule[0].key,mediaRecorder,audioChunks=[],audioUrl,pomo=1500,pomoTimer,speakSeconds=180,speakTimer,chart,currentPractice=null;
document.addEventListener("DOMContentLoaded",()=>{bind();applyPrefs();renderAll();loadSheet()});
function makeSchedule(){const a=[];for(let d=new Date(START),i=0;d<=END;d.setDate(d.getDate()+1),i++)a.push({key:keyOf(d),date:new Date(d),week:Math.floor(i/7)+1,day:i%7+1});return a}
function dayState(k){return state.days[k]||(state.days[k]={completed:[false,false,false,false,false],writing:"",ideas:"",newWords:"",summary:""})}
function bind(){$$(".tabs button").forEach(b=>b.onclick=()=>openTab(b.dataset.tab));$$('[data-tab-jump]').forEach(b=>b.onclick=()=>{openTab(b.dataset.tabJump);$(".learning").scrollIntoView({behavior:"smooth"});closeSidebar()});$("#mobileMenu").onclick=()=>{$("#sidebar").classList.add("open");$("#shade").classList.add("show")};$("#shade").onclick=closeSidebar;$("#collapseBtn").onclick=()=>{state.collapsed=!state.collapsed;applyPrefs();save()};$("#darkBtn").onclick=()=>{state.dark=!state.dark;applyPrefs();save()};$("#focusBtn").onclick=()=>document.body.classList.toggle("focus");$("#completeAll").onclick=()=>{dayState(activeDate).completed=[true,true,true,true,true];save();renderAll();notify("Đã hoàn thành ngày học 🎉")};$("#checkGrammar").onclick=checkGrammar;$("#writingEditor").oninput=e=>$("#wordCount").textContent=countWords(e.target.value)+" từ";$("#saveWriting").onclick=()=>{dayState(activeDate).writing=$("#writingEditor").value;save();notify("Đã lưu bài viết")};$("#exportTxt").onclick=()=>download(`bai-viet-${activeDate}.txt`,$("#writingEditor").value,"text/plain");$$("#keyIdeas,#newWords,#summary").forEach(x=>x.oninput=()=>{const d=dayState(activeDate);d.ideas=$("#keyIdeas").value;d.newWords=$("#newWords").value;d.summary=$("#summary").value;save()});$("#recordBtn").onclick=record;$("#playBtn").onclick=()=>audioUrl&&new Audio(audioUrl).play();$("#transcribeBtn").onclick=transcribe;$("#pomoBtn").onclick=togglePomo;$("#pomoReset").onclick=()=>{clearInterval(pomoTimer);pomoTimer=null;pomo=1500;renderPomo()};$("#exportJson").onclick=()=>download("delf-b1-progress.json",JSON.stringify(state,null,2),"application/json");$("#importJson").onchange=importJson;$("#statsNav").onclick=()=>$(".bottom-grid").scrollIntoView({behavior:"smooth"});$("#srsNav").onclick=()=>notify("Ôn lại từ của những ngày đã hoàn thành");$("#settingsBtn").onclick=()=>notify("Focus · Dark Mode · Import/Export");$$('[data-action="practice"]').forEach(x=>x.onclick=()=>practice("qcm"));const tool=$('.tools a');if(tool)tool.href=`https://docs.google.com/spreadsheets/d/${SHEET_ID}/edit?gid=${GID}`}
function renderAll(){renderDates();renderWords();renderPlan();renderWeek();renderKpis();renderFields();drawChart()}
function renderDates(){const now=new Date(),sel=schedule.find(x=>x.key===activeDate);$("#weekday").textContent=now.toLocaleDateString("vi-VN",{weekday:"long"}).toUpperCase();$("#dayNumber").textContent=String(now.getDate()).padStart(2,"0");$("#monthYear").textContent=now.toLocaleDateString("fr-FR",{month:"long",year:"numeric"}).toUpperCase();$("#heroDate").textContent=fmtDate(sel.date);$("#weekDay").textContent=`TUẦN ${sel.week} – NGÀY ${sel.day}`;$("#datePicker").innerHTML=schedule.map(d=>`<button data-date="${d.key}" class="${d.key===activeDate?"active":""} ${complete(d.key)?"complete":""}"><b>${String(d.date.getDate()).padStart(2,"0")}/${String(d.date.getMonth()+1).padStart(2,"0")}</b><small>T${d.week}·N${d.day}</small></button>`).join("");$$('[data-date]').forEach(b=>b.onclick=()=>{activeDate=b.dataset.date;renderAll()})}
function words(){return (state.vocabByDate[activeDate]||[]).map((w,i)=>({...w,...(state.vocabOverrides?.[activeDate]?.[i]||{})}))}
function renderWords(){const ws=words(),total=ws.length*2;$("#wordDaySummary").textContent=`${ws.length} từ mới · ${total} câu mỗi dạng`;$("#vocabGrid").innerHTML=ws.length?ws.map((w,i)=>`<article class="word-card tone-${i%6}"><button class="word-speak" data-speak="${i}" aria-label="Phát âm">🔊</button><h4>${esc(w.word)}</h4><p class="word-meaning">${esc(w.meaning||"")}</p>${w.example?`<em>Exemple: ${esc(w.example)}</em>`:""}<button class="word-detail" data-vocab-detail="${i}" aria-label="Xem toàn bộ nội dung">i</button></article>`).join(""):`<div class="vocab-empty">Chưa có từ vựng ở cột J cho ngày ${fmtDate(new Date(activeDate+"T00:00:00"))}.</div>`;$$('[data-speak]').forEach(b=>b.onclick=()=>speak(ws[+b.dataset.speak].word));$$('[data-vocab-detail]').forEach(b=>b.onclick=()=>showVocabDetail(+b.dataset.vocabDetail));$$('[data-mode]').forEach(b=>{const small=b.querySelector("small");if(small)small.innerHTML=`${small.textContent.replace(/ · \d+ câu$/,'')} <strong>· ${total} câu</strong>`;b.onclick=()=>practice(b.dataset.mode)});$("#vocabPractice").innerHTML="";currentPractice=null}
function showVocabDetail(index,edit=false){const w=words()[index];if(!w)return;let pop=$("#vocabDetailPop");if(!pop){pop=document.createElement("div");pop.id="vocabDetailPop";pop.className="vocab-detail-pop";document.body.appendChild(pop)}const rows=vocabDetailRows(w);pop.innerHTML=`<div class="vocab-detail-card ${edit?"is-editing":""}"><button class="vocab-detail-close" aria-label="Đóng">×</button><header><div><small>${edit?"Chỉnh sửa từ vựng":"Chi tiết từ vựng"}</small><h3>${esc(w.word||"")}</h3></div><button class="vocab-detail-speak" data-vocab-detail-speak="${esc(w.word||"")}" aria-label="Phát âm">🔊</button><button class="vocab-detail-edit" data-vocab-edit="${index}" aria-label="Chỉnh sửa">✎</button></header>${edit?vocabEditHtml(w,index):`<section>${rows.length?rows.map(r=>`<article class="vocab-detail-row ${r.tone}"><span>${r.icon}</span><div><small>${esc(r.label)}</small><b>${escLines(r.value)}</b></div></article>`).join(""):`<article class="vocab-detail-row"><span>＋</span><div><small>Nội dung</small><b>Chưa có dữ liệu chi tiết.</b></div></article>`}</section>`}</div>`;pop.classList.add("show");pop.onclick=e=>{if(e.target===pop||e.target.closest(".vocab-detail-close"))pop.classList.remove("show")};const sp=pop.querySelector("[data-vocab-detail-speak]");if(sp)sp.onclick=e=>{e.stopPropagation();speak(sp.dataset.vocabDetailSpeak)};const eb=pop.querySelector("[data-vocab-edit]");if(eb)eb.onclick=e=>{e.stopPropagation();showVocabDetail(index,true)};const cancel=pop.querySelector("[data-vocab-cancel]");if(cancel)cancel.onclick=e=>{e.preventDefault();showVocabDetail(index,false)};const form=pop.querySelector("[data-vocab-form]");if(form)form.onsubmit=e=>{e.preventDefault();saveVocabDetail(index,form)}}
function vocabDetailRows(w){const defs=[["type","Loại / Cấp độ","🏷","tone-level"],["meaning","Nghĩa tiếng Việt","💬","tone-meaning"],["example","Ví dụ","📘","tone-example"],["collocation","Collocation","🔗","tone-collocation"],["synonym","Synonyme","≈","tone-synonym"],["synonyme","Synonyme","≈","tone-synonym"],["antonym","Antonyme","↔","tone-antonym"],["antonyme","Antonyme","↔","tone-antonym"],["ipa","IPA","🔤","tone-ipa"],["note","Ghi chú thêm","✎","tone-note"]],used=new Set(["word"]);const rows=[];defs.forEach(([key,label,icon,tone])=>{used.add(key);const value=String(w[key]||"").trim();if(value)rows.push({key,label,icon,tone,value})});Object.entries(w).forEach(([key,value])=>{if(!used.has(key)&&String(value||"").trim())rows.push({key,label:key,icon:"＋",tone:"tone-note",value})});return rows}
function vocabEditHtml(w,index){const fields=[["type","Loại / Cấp độ"],["meaning","Nghĩa tiếng Việt"],["example","Ví dụ"],["collocation","Collocation"],["synonym","Synonyme"],["antonym","Antonyme"],["ipa","IPA"],["note","Ghi chú thêm"]];return`<form class="vocab-edit-form" data-vocab-form="${index}">${fields.map(([key,label])=>`<label><span>${esc(label)}</span><textarea name="${key}" rows="${key==="meaning"||key==="type"?2:4}" placeholder="Nhập hoặc xuống dòng tại đây...">${esc(w[key]||"")}</textarea></label>`).join("")}<div class="vocab-edit-actions"><button type="button" data-vocab-cancel>Hủy</button><button type="submit">Lưu chỉnh sửa</button></div></form>`}
function saveVocabDetail(index,form){state.vocabOverrides=state.vocabOverrides||{};state.vocabOverrides[activeDate]=state.vocabOverrides[activeDate]||{};const data={};Array.from(form.elements).forEach(el=>{if(el.name)data[el.name]=el.value.trim()});state.vocabOverrides[activeDate][index]=data;save();renderWords();showVocabDetail(index,false);notify("Đã lưu chỉnh sửa từ vựng")}
function escLines(v){return esc(v).replace(/\n/g,"<br>")}
function renderPlan(){const d=dayState(activeDate),labels=[`📗 Từ vựng (${words().length} từ)`,`🔵 Ngữ pháp`,`🎤 Nói`,`🩷 Viết`,`🎧 Nghe`];$("#dailyPlan").innerHTML=labels.map((x,i)=>`<div class="plan-row ${d.completed[i]?"done":""}"><span>${x.slice(0,2)}</span><b>${x.slice(3)}</b><button data-plan="${i}">${d.completed[i]?"✓":""}</button></div>`).join("");$$('[data-plan]').forEach(b=>b.onclick=()=>{d.completed[+b.dataset.plan]=!d.completed[+b.dataset.plan];save();renderAll()})}
function renderKpis(){const doneDays=schedule.filter(x=>complete(x.key)),learned=doneDays.reduce((n,x)=>n+(state.vocabByDate[x.key]||[]).length,0),questions=state.attempts.reduce((n,a)=>n+a.total,0),scores=state.attempts.map(a=>a.score),avg=scores.length?Math.round(scores.reduce((a,b)=>a+b,0)/scores.length):null,rank=avg==null?"—":avg>=90?"A+":avg>=80?"A":avg>=70?"B+":avg>=60?"B":"C",todayDone=dayState(activeDate).completed.filter(Boolean).length,pct=Math.round(doneDays.length/schedule.length*100),streak=streakCount();$("#wordsStat").textContent=learned;$("#questionsStat").textContent=questions.toLocaleString("vi-VN");$("#scoreStat").textContent=avg==null?"—":avg+"%";$("#rankStat").textContent=rank;const rl=$("#rankLabel");if(rl)rl.textContent=avg==null?"Bắt đầu học nhé!":avg>=80?"Très bien !":avg>=60?"Bien !":"Continuez !";$("#goalStat").textContent=todayDone+"/5";$("#phaseDone").textContent=`${doneDays.length} / ${schedule.length} ngày đã hoàn thành`;$("#phasePercent").textContent=pct+"%";$("#phaseBar").style.width=pct+"%";$("#streakCount").textContent=$("#streakQuick").textContent=streak;$("#correctQuick").textContent=state.attempts.at(-1)?.correct||0;$("#timeQuick").textContent=studyTime(state.studySeconds)}
function renderWeek(){const now=new Date(),offset=(now.getDay()+6)%7,monday=new Date(now);monday.setDate(now.getDate()-offset);const days=Array.from({length:7},(_,i)=>{const d=new Date(monday);d.setDate(monday.getDate()+i);return d});$("#weekDots").innerHTML=days.map((d,i)=>`<span>${["T2","T3","T4","T5","T6","T7","CN"][i]}<i>${complete(keyOf(d))?"✓":"○"}</i></span>`).join("")}
function renderFields(){const d=dayState(activeDate);$("#writingEditor").value=d.writing;$("#wordCount").textContent=countWords(d.writing)+" từ";$("#keyIdeas").value=d.ideas;$("#newWords").value=d.newWords;$("#summary").value=d.summary}
/* Tạo đúng 2 câu cho mỗi từ ở cả 4 chế độ. Dữ liệu: B=từ, D=nghĩa, E=ví dụ. */
function practice(mode){const ws=words(),box=$("#vocabPractice");if(!ws.length)return notify("Ngày này chưa có từ để luyện");const all=Object.values(state.vocabByDate).flat().filter(x=>x.word&&x.meaning),questions=[];ws.forEach(w=>{if(mode==="qcm"){questions.push(makeChoice(`“${w.word}” có nghĩa là gì?`,w.meaning,meaningPool(w,ws,all),w,"Pháp → Việt"));questions.push(makeChoice(`Từ/cụm từ tiếng Pháp nào có nghĩa “${w.meaning}”?`,w.word,wordPool(w,ws,all),w,"Việt → Pháp"))}else if(mode==="matching"){questions.push(makeChoice(`Ghép “${w.word}” với định nghĩa đúng.`,w.meaning,meaningPool(w,ws,all),w,"Từ → định nghĩa"));questions.push(makeChoice(`Ghép định nghĩa “${w.meaning}” với từ đúng.`,w.word,wordPool(w,ws,all),w,"Định nghĩa → từ"))}else if(mode==="typed"){questions.push({kind:"typed",label:"Nhập từ từ định nghĩa",prompt:`Viết từ tiếng Pháp có nghĩa: “${w.meaning}”`,answer:w.word,word:w});questions.push({kind:"typed",label:"Nhập từ từ ngữ cảnh",prompt:blankExample(w),answer:w.word,word:w})}else{questions.push(makeChoice(blankExample(w),w.word,wordPool(w,ws,all),w,"Điền từ vào câu"));questions.push(makeChoice(`Câu ví dụ nào phù hợp với “${w.word}”?`,w.example||`Le mot correct est ${w.word}.`,examplePool(w,ws,all),w,"Chọn ngữ cảnh"))}});currentPractice={mode,questions:shuffle(questions),index:0,correct:0,answered:false};renderPracticeQuestion();box.scrollIntoView({behavior:"smooth",block:"center"})}
function makeChoice(prompt,answer,pool,w,label){return{kind:"choice",prompt,answer,options:shuffle(unique([answer,...pool]).slice(0,4)),word:w,label}}
function wordPool(w,ws,all){return distract(w,ws,all,"word",["une expérience","un avantage","se développer"])}
function meaningPool(w,ws,all){return distract(w,ws,all,"meaning",["một trải nghiệm mới","một khó khăn tạm thời","phát triển bản thân"])}
function examplePool(w,ws,all){return distract(w,ws,all,"example",["Cette expérience est très enrichissante.","Il faut bien préparer son projet.","Les jeunes découvrent de nouveaux horizons."])}
function distract(w,ws,all,field,fallback){return unique([...ws,...all].filter(x=>x.word!==w.word).map(x=>x[field]).filter(Boolean).concat(fallback)).slice(0,3)}
function blankExample(w){const example=w.example||`Complétez avec le mot « ${w.word} ».`;return new RegExp(regEsc(w.word),"i").test(example)?example.replace(new RegExp(regEsc(w.word),"i"),"________"):`${example} — Mot manquant : ________`}
function renderPracticeQuestion(){const p=currentPractice,box=$("#vocabPractice");if(!p)return;if(p.index>=p.questions.length)return finishPractice();const q=p.questions[p.index],letters=["A","B","C","D"];box.innerHTML=`<section class="quiz-session"><header><div><span>${modeName(p.mode)}</span><b>Câu ${p.index+1}/${p.questions.length}</b></div><div class="quiz-track"><i style="width:${p.index/p.questions.length*100}%"></i></div></header><article class="practice-question"><small>${esc(q.label||"")}</small><h4>${esc(q.prompt)}</h4>${q.kind==="choice"?`<div class="answer-grid">${q.options.map((x,i)=>`<button class="quiz-answer" data-answer="${esc(x)}"><i>${letters[i]}</i><span>${esc(x)}</span></button>`).join("")}</div>`:`<div class="typed-row"><input id="typedVocab" autocomplete="off" placeholder="Nhập đáp án tiếng Pháp…"><button id="checkVocab">Kiểm tra</button></div>`}<div id="answerFeedback" class="answer-feedback"></div></article></section>`;if(q.kind==="choice")$$('.quiz-answer').forEach(b=>b.onclick=()=>checkPracticeAnswer(b,b.dataset.answer));else{$("#checkVocab").onclick=()=>checkPracticeAnswer(null,$("#typedVocab").value);$("#typedVocab").onkeydown=e=>{if(e.key==="Enter")$("#checkVocab").click()}}}
function checkPracticeAnswer(button,value){const p=currentPractice,q=p.questions[p.index];if(p.answered)return;p.answered=true;const ok=norm(value)===norm(q.answer);if(ok)p.correct++;const feedback=$("#answerFeedback");if(button)button.classList.add(ok?"is-correct":"is-wrong");if(!ok)$$('.quiz-answer').find(b=>norm(b.dataset.answer)===norm(q.answer))?.classList.add("is-correct");$$('.quiz-answer').forEach(b=>b.disabled=true);feedback.className=`answer-feedback show ${ok?"correct":"wrong"}`;feedback.innerHTML=ok?`<b>✓ Chính xác!</b><span>Giải thích (cột D – Sens en vietnamien): <strong>${esc(q.word.meaning)}</strong></span>`:`<b>✕ Chưa đúng</b><span>Đáp án đúng: <strong>${esc(q.answer)}</strong> · Nghĩa: ${esc(q.word.meaning)}</span>`;speak(q.kind==="choice"?String(value):q.answer);feedback.insertAdjacentHTML("beforeend",`<button id="nextPractice">${p.index+1===p.questions.length?"Xem kết quả":"Câu tiếp theo"} →</button>`);$("#nextPractice").onclick=()=>{p.index++;p.answered=false;renderPracticeQuestion()}}
function finishPractice(){const p=currentPractice,total=p.questions.length,score=Math.round(p.correct/total*100);state.attempts.push({date:activeDate,mode:p.mode,total,correct:p.correct,score});save();renderKpis();$("#vocabPractice").innerHTML=`<section class="quiz-result"><span>HOÀN THÀNH · ${modeName(p.mode)}</span><strong>${p.correct}/${total}</strong><p>${score}% · ${score>=80?"Très bien !":score>=60?"Bien, continuez !":"Ôn lại một vòng nữa nhé."}</p><button id="restartPractice">Làm lại dạng này</button></section>`;$("#restartPractice").onclick=()=>practice(p.mode)}
function modeName(m){return({qcm:"QCM · Chọn đáp án",matching:"Ghép nghĩa",typed:"Viết từ",context:"Ngữ cảnh"})[m]||m}function unique(a){return[...new Set(a)]}function shuffle(a){return[...a].sort(()=>Math.random()-.5)}
function loadSheet(){let pending=SHEET_TABS.length,failed=0;const mapped={};const finish=()=>{if(pending)return;state.vocabByDate={...state.vocabByDate,...mapped};save();$("#sheetStatus").textContent=Object.keys(mapped).length?`Đã đồng bộ ${Object.keys(mapped).length} ngày từ T6–T7 · lọc theo cột J`:"Không tìm thấy ngày hợp lệ trong cột J";renderAll()};SHEET_TABS.forEach((source,index)=>{const callback=`handleSheetVocabulary${index}`,script=document.createElement("script");window[callback]=res=>{try{(res.table.rows||[]).forEach(r=>{const c=(r.c||[]).map(x=>x?.f??x?.v??""),date=parseDate(c[9]),word=String(c[1]||"").trim();if(!date||!word||word==="Mot / Expression")return;(mapped[date]||(mapped[date]=[])).push({word,type:c[8]?`Niveau ${c[8]}`:"từ vựng",meaning:String(c[3]||"").trim(),example:String(c[4]||"").trim(),collocation:String(c[5]||"").trim(),synonym:String(c[6]||"").trim(),antonym:String(c[7]||"").trim()})})}catch{failed++}finally{pending--;delete window[callback];finish()}};script.src=`https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?gid=${source.gid}&headers=2&tqx=responseHandler:${callback}`;script.onerror=()=>{failed++;pending--;finish()};document.head.appendChild(script)})}
function parseDate(v){const s=String(v||"");let m=s.match(/Date\((\d+),(\d+),(\d+)/);if(m)return`${m[1]}-${String(+m[2]+1).padStart(2,"0")}-${String(+m[3]).padStart(2,"0")}`;m=s.match(/(\d{1,2})[\/.-](\d{1,2})(?:[\/.-](\d{4}))?/);return m?`${m[3]||2026}-${m[2].padStart(2,"0")}-${m[1].padStart(2,"0")}`:null}
function checkGrammar(){let ok=0,total=0;$$('[data-answer]').forEach(x=>{total++;const yes=norm(x.value)===norm(x.dataset.answer);x.style.borderColor=yes?"#22c55e":"#ef4444";if(yes)ok++});state.attempts.push({date:activeDate,total,correct:ok,score:Math.round(ok/total*100)});$("#grammarResult").textContent=`${ok}/${total} câu đúng`;save();renderKpis()}
function drawChart(){const canvas=$("#weekChart");if(!canvas)return;if(chart)chart.destroy();const s=schedule.find(x=>x.key===activeDate),days=schedule.slice((s.week-1)*7,(s.week-1)*7+7),data=days.map(d=>dayState(d.key).completed.filter(Boolean).length*20);if(window.Chart)chart=new Chart(canvas,{type:"line",data:{labels:days.map(d=>`${d.date.getDate()}/${d.date.getMonth()+1}`),datasets:[{data,borderColor:"#22c55e",backgroundColor:"#dff8e8",fill:true,tension:.35,pointRadius:4}]},options:{plugins:{legend:{display:false}},scales:{y:{display:false,min:0,max:100},x:{grid:{display:false}}}}})}
function complete(k){return dayState(k).completed.every(Boolean)}function streakCount(){let n=0,d=new Date(Math.min(new Date().setHours(0,0,0,0),END));while(d>=START&&complete(keyOf(d))){n++;d.setDate(d.getDate()-1)}return n}function frenchVoice(){const voices=speechSynthesis.getVoices();return voices.find(v=>/^fr[-_]?FR/i.test(v.lang))||voices.find(v=>/^fr/i.test(v.lang))||voices.find(v=>/fran|french/i.test(v.name))||voices[0]||null}function onlineFrenchAudio(text){const q=encodeURIComponent(String(text||"").slice(0,180));const a=new Audio(`https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=fr&q=${q}`);a.volume=1;return a.play()}function speak(t){const clean=String(t||"").trim();if(!clean)return;const samsung=/Android|SamsungBrowser/i.test(navigator.userAgent);if(samsung){onlineFrenchAudio(clean).catch(()=>notify("Hãy mở bằng Chrome và tăng âm lượng media"));return}if(!window.speechSynthesis){onlineFrenchAudio(clean).catch(()=>notify("Trình duyệt này không hỗ trợ phát âm"));return}let started=false;const say=()=>{speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(clean),voice=frenchVoice();if(voice){u.voice=voice;u.lang=voice.lang||"fr-FR"}else u.lang="fr-FR";u.volume=1;u.rate=.88;u.pitch=1;u.onstart=()=>started=true;u.onerror=()=>onlineFrenchAudio(clean).catch(()=>notify("Không phát được âm thanh"));speechSynthesis.speak(u);setTimeout(()=>{if(!started)onlineFrenchAudio(clean).catch(()=>notify("Hãy bấm lại 🔊 hoặc mở bằng Chrome"))},900)};if(speechSynthesis.getVoices().length)say();else{notify("Đang mở giọng đọc, bấm lại 🔊 nếu chưa nghe");setTimeout(say,350)}}if(window.speechSynthesis){speechSynthesis.onvoiceschanged=()=>speechSynthesis.getVoices();document.addEventListener("touchstart",()=>speechSynthesis.getVoices(),{once:true})}
async function record(){if(mediaRecorder?.state==="recording"){mediaRecorder.stop();return}try{const stream=await navigator.mediaDevices.getUserMedia({audio:true});audioChunks=[];mediaRecorder=new MediaRecorder(stream);mediaRecorder.ondataavailable=e=>audioChunks.push(e.data);mediaRecorder.onstop=()=>{audioUrl=URL.createObjectURL(new Blob(audioChunks,{type:"audio/webm"}));$("#playBtn").disabled=false;stream.getTracks().forEach(t=>t.stop());$("#recordBtn").textContent="🎤 Ghi âm";clearInterval(speakTimer)};mediaRecorder.start();$("#recordBtn").textContent="â¹ Dừng";speakSeconds=180;speakTimer=setInterval(()=>{$("#speakTimer").textContent=time(--speakSeconds);if(speakSeconds<=0)mediaRecorder.stop()},1000)}catch{notify("Hãy cấp quyền micro")}}function transcribe(){const SR=window.SpeechRecognition||window.webkitSpeechRecognition;if(!SR)return notify("Không hỗ trợ transcription");const r=new SR();r.lang="fr-FR";r.continuous=true;r.onresult=e=>$("#transcript").value=[...e.results].map(x=>x[0].transcript).join(" ");r.start()}
function togglePomo(){if(pomoTimer){clearInterval(pomoTimer);pomoTimer=null;return}pomoTimer=setInterval(()=>{pomo--;state.studySeconds++;renderPomo();if(pomo<=0){clearInterval(pomoTimer);pomoTimer=null;pomo=1500;notify("Hoàn thành Pomodoro 🍅")}},1000)}function renderPomo(){$("#pomoClock").textContent=time(pomo)}
function openTab(id){$$('.tabs button').forEach(b=>b.classList.toggle("active",b.dataset.tab===id));$$('.tab-panel').forEach(p=>p.classList.toggle("active",p.id===id))}function applyPrefs(){document.body.classList.toggle("dark",state.dark);$("#sidebar").classList.toggle("collapsed",state.collapsed)}function load(){try{return{...defaults,...JSON.parse(localStorage.getItem(KEY))}}catch{return structuredClone(defaults)}}function save(){localStorage.setItem(KEY,JSON.stringify(state))}function importJson(e){const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=()=>{try{state={...defaults,...JSON.parse(r.result)};save();location.reload()}catch{notify("JSON không hợp lệ")}};r.readAsText(f)}function closeSidebar(){$("#sidebar").classList.remove("open");$("#shade").classList.remove("show")}function keyOf(d){return`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`}function fmtDate(d){return`${String(d.getDate()).padStart(2,"0")}/${String(d.getMonth()+1).padStart(2,"0")}/${d.getFullYear()}`}function countWords(s){return s.trim()?s.trim().split(/\s+/).length:0}function norm(s){return String(s||"").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").trim()}function time(s){return`${String(Math.floor(s/60)).padStart(2,"0")}:${String(s%60).padStart(2,"0")}`}function studyTime(s){const h=Math.floor(s/3600),m=Math.floor(s%3600/60);return h?`${h}h ${m}m`:`${m}m`}function esc(s){return String(s||"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]))}function regEsc(s){return String(s).replace(/[.*+?^${}()|[\]\\]/g,"\\$&")}function download(n,d,t){const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([d],{type:t}));a.download=n;a.click();URL.revokeObjectURL(a.href)}function notify(m){const t=$("#toast");t.textContent=m;t.classList.add("show");setTimeout(()=>t.classList.remove("show"),2500)}

/* 6 chỉnh sửa logic 25/06: lịch tháng trong thẻ ngày + bàn phím ký tự Pháp */
const __renderDatesOriginal=renderDates;
renderDates=function(){
  __renderDatesOriginal();
  renderMonthCalendar();
};
const __bindOriginal=bind;
bind=function(){
  __bindOriginal();
  setupSixFixes();
};
function setupSixFixes(){
  setupDateCardCalendar();
  setupWritingFrenchTools();
}
function setupDateCardCalendar(){
  const card=$(".date-card"),picker=$(".date-picker");
  if(!card||!picker||card.dataset.calendarReady)return;
  card.dataset.calendarReady="1";
  card.setAttribute("role","button");
  card.setAttribute("tabindex","0");
  card.setAttribute("title","Bấm để mở lịch chọn ngày học");
  const toggle=e=>{e.stopPropagation();picker.classList.toggle("open")};
  card.addEventListener("click",toggle);
  card.addEventListener("keydown",e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();toggle(e)}});
  picker.addEventListener("click",e=>e.stopPropagation());
  document.addEventListener("click",()=>picker.classList.remove("open"));
  document.addEventListener("keydown",e=>{if(e.key==="Escape")picker.classList.remove("open")});
}
let calendarViewDate;
function renderMonthCalendar(){
  const nav=$("#datePicker"),status=$("#sheetStatus"),picker=$(".date-picker");
  if(!nav)return;
  const selected=schedule.find(x=>x.key===activeDate)||schedule[0];
  if(!calendarViewDate||!picker?.classList.contains("open"))calendarViewDate=new Date(selected.date);
  const minMonth=new Date(START.getFullYear(),START.getMonth(),1),maxMonth=new Date(END.getFullYear(),END.getMonth(),1);
  const viewMonth=new Date(calendarViewDate.getFullYear(),calendarViewDate.getMonth(),1);
  const year=viewMonth.getFullYear(),month=viewMonth.getMonth();
  const monthStart=new Date(year,month,1),monthEnd=new Date(year,month+1,0);
  const leading=(monthStart.getDay()+6)%7;
  const todayKey=keyOf(new Date());
  const months=[];
  for(let d=new Date(minMonth);d<=maxMonth;d.setMonth(d.getMonth()+1)){
    const value=`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`;
    months.push(`<option value="${value}" ${d.getFullYear()===year&&d.getMonth()===month?"selected":""}>${d.toLocaleDateString("vi-VN",{month:"long",year:"numeric"})}</option>`);
  }
  const prevDisabled=viewMonth<=minMonth?"disabled":"",nextDisabled=viewMonth>=maxMonth?"disabled":"";
  const controls=`<div class="calendar-month-tools"><button type="button" data-calendar-prev ${prevDisabled} aria-label="Tháng trước">‹</button><select id="calendarMonthSelect" aria-label="Chọn tháng">${months.join("")}</select><button type="button" data-calendar-next ${nextDisabled} aria-label="Tháng sau">›</button></div>`;
  const heads=["T2","T3","T4","T5","T6","T7","CN"].map(d=>`<span class="calendar-head">${d}</span>`).join("");
  const blanks=Array.from({length:leading},()=>`<button class="is-empty" tabindex="-1"></button>`).join("");
  const days=[];
  for(let n=1;n<=monthEnd.getDate();n++){
    const date=new Date(year,month,n),key=keyOf(date),item=schedule.find(x=>x.key===key),count=(state.vocabByDate[key]||[]).length;
    if(!item||count===0)continue;
    days.push(`<button data-date="${key}" class="${key===activeDate?"active":""} ${key===todayKey?"is-today":""} ${complete(key)?"complete":""}"><b>${String(n).padStart(2,"0")}/${String(month+1).padStart(2,"0")}</b><small>T${item.week}·N${item.day} · ${count} từ</small></button>`);
  }
  nav.innerHTML=controls+(days.length?days.join(""):`<div class="calendar-empty">Tháng này chưa có ngày có từ vựng.</div>`);
  if(status)status.textContent=`Lịch tháng ${String(month+1).padStart(2,"0")}/${year} · chỉ hiện ngày có từ vựng`;
  const select=$("#calendarMonthSelect");
  if(select)select.onchange=()=>{const [y,m]=select.value.split("-").map(Number);calendarViewDate=new Date(y,m-1,1);renderMonthCalendar()};
  const prev=$("[data-calendar-prev]"),next=$("[data-calendar-next]");
  if(prev)prev.onclick=()=>{calendarViewDate=new Date(year,month-1,1);renderMonthCalendar()};
  if(next)next.onclick=()=>{calendarViewDate=new Date(year,month+1,1);renderMonthCalendar()};
  $$("#datePicker [data-date]").forEach(btn=>btn.onclick=()=>{if(btn.disabled)return;activeDate=btn.dataset.date;calendarViewDate=new Date(activeDate+"T00:00:00");if(picker)picker.classList.remove("open");renderAll()});
}
function setupWritingFrenchTools(){
  const editor=$("#writingEditor"),details=$("#writing details"),counter=$("#wordCount");
  if(!editor)return;
  editor.setAttribute("spellcheck","false");
  editor.setAttribute("autocomplete","off");
  editor.setAttribute("autocorrect","off");
  editor.setAttribute("autocapitalize","off");
  if(counter&&!counter.classList.contains("writing-word-count")){
    counter.classList.add("writing-word-count");
    editor.insertAdjacentElement("afterend",counter);
  }
  if(details&&!$(".french-keyboard")){
    const chars=["ç","é","à","è","ù","â","ê","î","ô","ï","ü","û","œ","ë"];
    const bar=document.createElement("div");
    bar.className="french-keyboard";
    bar.setAttribute("aria-label","Bàn phím ký tự tiếng Pháp");
    bar.innerHTML=chars.map(ch=>`<button type="button" data-char="${ch}" title="Chèn ${ch}">${ch}</button>`).join("");
    details.insertAdjacentElement("afterend",bar);
    bar.querySelectorAll("[data-char]").forEach(btn=>btn.onclick=()=>insertAtCursor(editor,btn.dataset.char));
  }
}
function insertAtCursor(el,text){
  const start=el.selectionStart??el.value.length,end=el.selectionEnd??el.value.length;
  el.value=el.value.slice(0,start)+text+el.value.slice(end);
  el.focus();
  el.setSelectionRange(start+text.length,start+text.length);
  el.dispatchEvent(new Event("input",{bubbles:true}));
}

/* Đồng bộ kế hoạch NGHE DELF B1 tháng 7 từ Google Sheet LICH_HOC_GD1 */
const LISTENING_PLAN={
  "2026-07-01":{phase:"GIAI ĐOẠN 1",goal:"Quen tốc độ B1, nhận diện từ khóa",lesson:"Activité 2 + 3",topic:"Qi Gong • Arnaques"},
  "2026-07-02":{phase:"GIAI ĐOẠN 1",goal:"Quen tốc độ B1, nhận diện từ khóa",lesson:"Activité 4 + 5",topic:"Luminothérapie • AMAP"},
  "2026-07-03":{phase:"GIAI ĐOẠN 1",goal:"Quen tốc độ B1, nhận diện từ khóa",lesson:"Activité 6 + 7",topic:"Fruits au bureau • La bise"},
  "2026-07-04":{phase:"GIAI ĐOẠN 1",goal:"Quen tốc độ B1, nhận diện từ khóa",lesson:"Activité 8 + 9",topic:"Bénévolat • Vols"},
  "2026-07-05":{phase:"GIAI ĐOẠN 1",goal:"Quen tốc độ B1, nhận diện từ khóa",lesson:"Activité 10 + 11",topic:"Sécurité routière • Entretien d'embauche"},
  "2026-07-06":{phase:"GIAI ĐOẠN 1",goal:"Quen tốc độ B1, nhận diện từ khóa",lesson:"Activité 12 + 13",topic:"Tourisme France • Album photo"},
  "2026-07-07":{phase:"GIAI ĐOẠN 1",goal:"Quen tốc độ B1, nhận diện từ khóa",lesson:"Activité 14 + 15",topic:"Cuisine française • Coutellerie"},
  "2026-07-08":{phase:"GIAI ĐOẠN 1",goal:"Quen tốc độ B1, nhận diện từ khóa",lesson:"Activité 16 + 17",topic:"Canicule • Vêtements"},
  "2026-07-09":{phase:"GIAI ĐOẠN 1",goal:"Quen tốc độ B1, nhận diện từ khóa",lesson:"Activité 18",topic:"Pièces de 2 â‚¬"},
  "2026-07-10":{phase:"GIAI ĐOẠN 1",goal:"Quen tốc độ B1, nhận diện từ khóa",lesson:"Ôn tập Activités 2–18",topic:"Nghe lại không xem đáp án"},
  "2026-07-11":{phase:"GIAI ĐOẠN 2",goal:"Chuyển sang radio, podcast",lesson:"Radio 1 + 2",topic:"Gastronomie • Tourisme"},
  "2026-07-12":{phase:"GIAI ĐOẠN 2",goal:"Chuyển sang radio, podcast",lesson:"Radio 3 + 4",topic:"Étiquette verte • David Foenkinos"},
  "2026-07-13":{phase:"GIAI ĐOẠN 2",goal:"Chuyển sang radio, podcast",lesson:"Radio 5 + 6",topic:"Métiers verts • Insectes"},
  "2026-07-14":{phase:"GIAI ĐOẠN 2",goal:"Chuyển sang radio, podcast",lesson:"Radio 7 + 8",topic:"Gentillesse • Train Bleu"},
  "2026-07-15":{phase:"GIAI ĐOẠN 2",goal:"Chuyển sang radio, podcast",lesson:"Radio 9 + 10",topic:"Labels alimentaires • Pétanque"},
  "2026-07-16":{phase:"GIAI ĐOẠN 2",goal:"Chuyển sang radio, podcast",lesson:"Radio 11 + 12",topic:"Boîtes plastiques • Roman"},
  "2026-07-17":{phase:"GIAI ĐOẠN 2",goal:"Chuyển sang radio, podcast",lesson:"Radio 13 + 14",topic:"Greta Thunberg • Train"},
  "2026-07-18":{phase:"GIAI ĐOẠN 2",goal:"Chuyển sang radio, podcast",lesson:"Radio 15 + 16",topic:"Coiffure écologique • Chantilly"},
  "2026-07-19":{phase:"GIAI ĐOẠN 2",goal:"Chuyển sang radio, podcast",lesson:"Radio 17 + 18",topic:"Animaux • Escape Game"},
  "2026-07-20":{phase:"GIAI ĐOẠN 2",goal:"Chuyển sang radio, podcast",lesson:"Ôn tập Radio 1–18",topic:"Nghe lại không xem đáp án"},
  "2026-07-21":{phase:"GIAI ĐOẠN 3",goal:"Nouveau format DELF",lesson:"Radio 19 + 20",topic:"Nouveau format DELF"},
  "2026-07-22":{phase:"GIAI ĐOẠN 3",goal:"Nouveau format DELF",lesson:"Radio 21 + 22",topic:"Nouveau format DELF"},
  "2026-07-23":{phase:"GIAI ĐOẠN 3",goal:"Nouveau format DELF",lesson:"Radio 23 + 24",topic:"Nouveau format DELF"},
  "2026-07-24":{phase:"GIAI ĐOẠN 3",goal:"Nouveau format DELF",lesson:"Radio 25 + 26",topic:"Nouveau format DELF"},
  "2026-07-25":{phase:"GIAI ĐOẠN 3",goal:"Nouveau format DELF",lesson:"Radio 27 + 28",topic:"Nouveau format DELF"},
  "2026-07-26":{phase:"GIAI ĐOẠN 3",goal:"Nouveau format DELF",lesson:"Radio 29 + 30",topic:"Nouveau format DELF"},
  "2026-07-27":{phase:"GIAI ĐOẠN 3",goal:"Nouveau format DELF",lesson:"Radio 31 + 32",topic:"Nouveau format DELF"},
  "2026-07-28":{phase:"GIAI ĐOẠN 3",goal:"Nouveau format DELF",lesson:"Nghe lại các bài sai nhiều",topic:"Tập trung bài dưới 70%"},
  "2026-07-29":{phase:"GIAI ĐOẠN 3",goal:"Nouveau format DELF",lesson:"Làm đề Compréhension orale hoàn chỉnh (25')",topic:"Thi thử như thật"},
  "2026-07-30":{phase:"GIAI ĐOẠN 3",goal:"Nouveau format DELF",lesson:"Nghe lại toàn bộ những bài dưới 70%",topic:"Sửa lỗi chiến lược nghe"},
  "2026-07-31":{phase:"GIAI ĐOẠN 3",goal:"Nouveau format DELF",lesson:"Mini examen DELF B1",topic:"Không xem đáp án"}
};
const LISTENING_CHECKLIST=[
  "Nghe lần 1 không dừng",
  "Đánh dấu từ không nghe được",
  "Nghe lần 2 và hoàn thành đáp án",
  "Kiểm tra đáp án",
  "Ghi 10 từ mới · 3 collocations · 2 cấu trúc · 1 câu hay",
  "Shadowing 2 phút đoạn audio khó nhất"
];
const __listeningRenderAll=renderAll;
renderAll=function(){
  __listeningRenderAll();
  renderListeningPlan();
};
function listeningDisplayKey(){
  if(LISTENING_PLAN[activeDate])return activeDate;
  const today=keyOf(new Date());
  return Object.keys(LISTENING_PLAN).find(k=>k>=today)||Object.keys(LISTENING_PLAN)[0];
}
function renderListeningPlan(){
  const panel=$("#listening");
  if(!panel)return;
  let box=$("#listeningDailyPlan");
  if(!box){
    box=document.createElement("section");
    box.id="listeningDailyPlan";
    box.className="listening-plan";
    panel.querySelector(".section-title")?.insertAdjacentElement("afterend",box);
  }
  const key=listeningDisplayKey(),item=LISTENING_PLAN[key],activeMessage=LISTENING_PLAN[activeDate]?"Bài nghe của ngày đang chọn":"Ngày đang chọn chưa có bài nghe tháng 7 · đang hiển thị bài gần nhất";
  box.innerHTML=`<article class="listen-hero-card">
    <div class="listen-icon">🎧</div>
    <div>
      <span>${esc(item.phase)} · ${fmtDate(new Date(key+"T00:00:00"))}</span>
      <h4>${esc(item.lesson)}</h4>
      <p>${esc(item.topic)}</p>
      <small>${esc(item.goal)} · ${activeMessage}</small>
    </div>
  </article>
  <div class="audio-card">
    <div>
      <b>Audio bài nghe</b>
      <small>Đặt file trong thư mục <code>audio/${key}.mp3</code> hoặc bấm chọn file audio trên máy.</small>
    </div>
    <audio id="dailyAudio" controls preload="metadata" src="${audioSrcFor(key)}"></audio>
    <label class="audio-upload">â¬†️ Tải audio cho ngày này<input id="dailyAudioInput" type="file" accept="audio/*"></label>
  </div>
  <div class="listening-columns">
    <article>
      <h4>Checklist mỗi ngày</h4>
      <ul>${LISTENING_CHECKLIST.map(x=>`<li>✅ ${esc(x)}</li>`).join("")}</ul>
    </article>
    <article>
      <h4>Danh sách bài nghe tháng 7</h4>
      <div class="listening-list">${Object.entries(LISTENING_PLAN).map(([d,p])=>`<button data-listening-date="${d}" class="${d===key?"active":""}"><span>${fmtDate(new Date(d+"T00:00:00"))}</span><b>${esc(p.lesson)}</b><small>${esc(p.topic)}</small></button>`).join("")}</div>
    </article>
  </div>
  <article class="listening-outcome"><b>Kết quả sau tháng 7</b><p>Hoàn thành 49 bài luyện nghe · khoảng 700–900 câu hỏi DELF B1 · 350–500 từ vựng · quen cả ancien format và nouveau format.</p></article>`;
  const input=$("#dailyAudioInput"),audio=$("#dailyAudio");
  const saved=localStorage.getItem("listeningAudio:"+key);
  if(saved&&audio)audio.src=saved;
  if(input)input.onchange=()=>loadAudioFile(key,input.files?.[0]);
  $$("[data-listening-date]").forEach(btn=>btn.onclick=()=>{activeDate=btn.dataset.listeningDate;renderAll();openTab("listening")});
}
function audioSrcFor(key){
  return `audio/${key}.mp3`;
}
function loadAudioFile(key,file){
  if(!file)return;
  const audio=$("#dailyAudio");
  const url=URL.createObjectURL(file);
  if(audio)audio.src=url;
  const reader=new FileReader();
  reader.onload=()=>{try{localStorage.setItem("listeningAudio:"+key,reader.result);notify("Đã gắn audio cho bài nghe 🎧")}catch{notify("Audio đã phát trong phiên này; file quá lớn nên không lưu vào trình duyệt")}};
  reader.readAsDataURL(file);
}

/* READING CENTER · đọc hiểu DELF B1, highlight vocab Google Sheet */
const READING_KEY="delfB1ReadingCenter_v1",READING_SHEET_ID="1YFaJsXJTqSx6uHM-JiE21w3QQ0O2eGNzHn74Jk4L0ME",READING_GID="1047459457";
let readingDb=loadReadingDb(),readingVocab=new Map(),activeReadingId=null,readingFont=20,selectionText="";
document.addEventListener("DOMContentLoaded",()=>{initReadingCenter();loadReadingVocabulary()});
function loadReadingDb(){try{return JSON.parse(localStorage.getItem(READING_KEY))||{texts:[],stats:{minutes:0,words:0,lookups:0,listens:0}}}catch{return{texts:[],stats:{minutes:0,words:0,lookups:0,listens:0}}}}
function saveReadingDb(){localStorage.setItem(READING_KEY,JSON.stringify(readingDb))}
function initReadingCenter(){injectReadingNav();injectReadingView();bindReadingEvents();renderReadingDashboard()}
function injectReadingNav(){if($("#readingNav"))return;const srs=$("#srsNav");if(!srs)return;const b=document.createElement("button");b.id="readingNav";b.innerHTML="📖 <span>Đọc</span>";srs.insertAdjacentElement("beforebegin",b)}
function injectReadingView(){if($("#readingView"))return;const main=document.querySelector("main"),view=document.createElement("section");view.id="readingView";view.className="reading-view";view.innerHTML=`<div class="reading-shell"><header class="reading-top"><div><h2>📖 Reading Center</h2><p>Lire chaque jour pour progresser en compréhension écrite.</p></div><button id="backDashboard">← Dashboard</button></header><section class="reading-stats" id="readingStats"></section><section class="reading-add-card"><div><span>✨ Nouveau texte</span><h3>Crée ton espace de lecture DELF B1</h3><p>Colle un article, une transcription TV5/RFI ou un texte DELF. Les mots du Google Sheet seront reconnus automatiquement.</p></div><button id="openReadingDialog">â• Ajouter un texte</button></section><section class="reading-filters"><input id="readingSearch" placeholder="Rechercher par titre..."><select id="readingThemeFilter"><option value="">Tous les thèmes</option></select><select id="readingLevelFilter"><option value="">Tous niveaux</option><option>A2</option><option>B1</option><option>B2</option></select><input id="readingDateFilter" type="date"></section><section class="reading-grid" id="readingCards"></section><section class="reader" id="readerPane"></section></div><dialog id="readingDialog" class="reading-dialog"><form method="dialog"><h3>Ajouter un nouveau texte</h3><label>Titre<input id="readTitle" placeholder="Habiter à Montréal"></label><label>Thème<select id="readTheme">${readingThemes().map(x=>`<option>${x}</option>`).join("")}</select></label><label>Niveau<select id="readLevel"><option>A2</option><option selected>B1</option><option>B2</option></select></label><label>Date<input id="readDate" type="date"></label><label>Coller le texte<textarea id="readText" rows="12" placeholder="Collez ici votre texte en français..."></textarea></label><menu><button value="cancel">Annuler</button><button id="saveReadingText" value="default">Enregistrer</button></menu></form></dialog><div class="reading-word-pop" id="readingWordPop"></div><div class="reading-tip" id="readingTip"></div>`;main.appendChild(view);$("#readDate").value=keyOf(new Date());populateReadingThemes()}
function readingThemes(){return["Expatriation","Études","Travail","Médias","Tourisme","Environnement","Société","Santé","Culture","Libre"]}
function bindReadingEvents(){document.addEventListener("click",e=>{if(e.target.closest("#readingNav"))openReadingCenter();if(e.target.closest("#backDashboard"))closeReadingCenter();if(e.target.closest("#openReadingDialog"))openReadingDialog();if(e.target.closest("#saveReadingText"))saveReadingText(e);if(e.target.closest("[data-read-id]"))openReader(e.target.closest("[data-read-id]").dataset.readId);if(e.target.closest("[data-close-reader]"))closeReader();if(e.target.closest("[data-font]"))changeReaderFont(+e.target.closest("[data-font]").dataset.font);if(e.target.closest("[data-reading-speak]"))speakReadingWord(e.target.closest("[data-reading-speak]").dataset.readingSpeak);if(e.target.closest("[data-word-jump]"))jumpToWord(e.target.closest("[data-word-jump]").dataset.wordJump);if(e.target.closest(".reading-mark"))showWordPopup(e.target.closest(".reading-mark").dataset.word);if(e.target.closest("#saveSelectionNote"))saveSelectionNote();if(e.target.closest("[data-note-delete]"))deleteReadingNote(e.target.closest("[data-note-delete]").dataset.noteDelete)});["readingSearch","readingThemeFilter","readingLevelFilter","readingDateFilter"].forEach(id=>document.addEventListener("input",e=>{if(e.target.id===id)renderReadingCards()}));document.addEventListener("change",e=>{if(e.target.matches("[data-reading-check]"))toggleReadingCheck(e.target.dataset.readingCheck,e.target.checked);if(e.target.id==="unknownHighlight")renderReaderText()});document.addEventListener("mouseover",e=>{const m=e.target.closest(".reading-known");if(m)showReadingTip(m)});document.addEventListener("mouseout",e=>{if(e.target.closest(".reading-known"))$("#readingTip").classList.remove("show")});document.addEventListener("selectionchange",()=>{selectionText=String(getSelection()?.toString()||"").trim();const btn=$("#saveSelectionNote");if(btn)btn.disabled=selectionText.length<3})}
function openReadingCenter(){document.querySelector(".page")?.classList.add("hide-for-reading");$("#readingView").classList.add("show");renderReadingDashboard();renderReadingCards();closeSidebar()}
function closeReadingCenter(){$("#readingView").classList.remove("show");document.querySelector(".page")?.classList.remove("hide-for-reading")}
function openReadingDialog(){$("#readTitle").value="";$("#readText").value="";$("#readDate").value=keyOf(new Date());$("#readingDialog").showModal()}
function saveReadingText(e){e.preventDefault();const title=$("#readTitle").value.trim(),text=$("#readText").value.trim();if(!title||!text)return notify("Hãy nhập titre và texte");const words=countReadingWords(text),id="r"+Date.now();readingDb.texts.unshift({id,title,theme:$("#readTheme").value,level:$("#readLevel").value,date:$("#readDate").value,createdAt:new Date().toISOString(),text,words,minutes:Math.max(1,Math.ceil(words/180)),checks:{read:false,listen:false,lookup:false,note:false,review:false},notes:[],stats:{opens:0,reads:0,minutes:0,lookups:0,listens:0,lastRead:null}});saveReadingDb();$("#readingDialog").close();renderReadingDashboard();renderReadingCards();notify("Đã thêm bài đọc 📖")}
function renderReadingDashboard(){const texts=readingDb.texts,total=texts.length,read=texts.filter(t=>t.checks?.read).length,mins=texts.reduce((n,t)=>n+(t.stats?.minutes||0),0),words=readingDb.stats.words||0,streak=readingStreak();$("#readingStats").innerHTML=[["📚","Tổng số bài đã thêm",total],["✅","Số bài đã đọc",read],["â±️","Số phút đọc",mins],["🧠","Số từ đã học từ Reading",words],["🔥","Streak Reading",streak+" ngày"]].map(x=>`<article><span>${x[0]}</span><small>${x[1]}</small><b>${x[2]}</b></article>`).join("")}
function renderReadingCards(){populateReadingThemes();const q=norm($("#readingSearch")?.value||""),theme=$("#readingThemeFilter")?.value||"",level=$("#readingLevelFilter")?.value||"",date=$("#readingDateFilter")?.value||"";let list=readingDb.texts.filter(t=>(!q||norm(t.title).includes(q))&&(!theme||t.theme===theme)&&(!level||t.level===level)&&(!date||t.date===date));$("#readingCards").innerHTML=list.length?list.map(t=>`<article class="reading-card"><h3>📖 ${esc(t.title)}</h3><div><small>Thème</small><b>${esc(t.theme)}</b></div><div><small>Niveau</small><b>${esc(t.level)}</b></div><div><small>Date ajoutée</small><b>${fmtDate(new Date(t.date+"T00:00:00"))}</b></div><div><small>Temps estimé</small><b>${t.minutes} min</b></div><div><small>Nombre de mots</small><b>${t.words}</b></div><div><small>Progression</small><b>${readingProgress(t)}%</b></div><button data-read-id="${t.id}">Lire</button></article>`).join(""):`<div class="reading-empty">Chưa có bài đọc nào. Bấm “Ajouter un texte” để bắt đầu.</div>`}
function populateReadingThemes(){const sel=$("#readingThemeFilter");if(!sel||sel.dataset.ready)return;readingThemes().forEach(x=>sel.insertAdjacentHTML("beforeend",`<option>${x}</option>`));sel.dataset.ready="1"}
function loadReadingVocabulary(){const callback="handleReadingVocabulary"+Date.now(),script=document.createElement("script");window[callback]=json=>{try{readingVocab=new Map();(json.table.rows||[]).slice(1).forEach(r=>{const c=(r.c||[]).map(x=>x?.f??x?.v??"").map(v=>String(v).trim());const entry={mot:c[1]||c.find(Boolean)||"",type:c[8]||"",ipa:c[12]||"",meaning:c[3]||"",example:c[4]||"",collocation:c[5]||"",synonyme:c[6]||"",antonyme:c[7]||""};c.filter(Boolean).forEach(v=>readingVocab.set(normWord(v),entry))});renderReaderText()}catch{notify("Chưa tải được Google Sheet vocab; Reading vẫn dùng được")}finally{delete window[callback];script.remove()}};script.onerror=()=>notify("Chưa tải được Google Sheet vocab; Reading vẫn dùng được");script.src=`https://docs.google.com/spreadsheets/d/${READING_SHEET_ID}/gviz/tq?gid=${READING_GID}&range=A1:Z2000&tqx=responseHandler:${callback}`;document.head.appendChild(script)}
function openReader(id){activeReadingId=id;const t=readingDb.texts.find(x=>x.id===id);if(!t)return;t.stats.opens=(t.stats.opens||0)+1;t.stats.minutes=(t.stats.minutes||0)+t.minutes;t.stats.lastRead=new Date().toISOString();readingDb.stats.minutes=(readingDb.stats.minutes||0)+t.minutes;saveReadingDb();$("#readerPane").classList.add("show");$("#readerPane").innerHTML=`<div class="reader-layout"><main class="reader-main"><div class="reader-tools"><button data-close-reader>← Retour</button><button data-font="-2">Aâˆ’</button><button data-font="2">A+</button><button onclick="document.getElementById('readerPane').classList.toggle('reader-dark')">â— Dark</button><button id="saveSelectionNote" disabled>Ajouter une note</button><label><input id="unknownHighlight" type="checkbox"> 🟠 Từ mới</label></div><h2>${esc(t.title)}</h2><p class="reader-meta">${esc(t.theme)} · ${esc(t.level)} · ${fmtDate(new Date(t.date+"T00:00:00"))} · ${t.minutes} min · ${t.words} mots</p><article class="reader-text" id="readerText"></article><section class="reading-checklist">${Object.entries({read:"Đã đọc",listen:"Đã nghe",lookup:"Đã tra từ",note:"Đã ghi chú",review:"Đã ôn lại"}).map(([k,v])=>`<label><input type="checkbox" data-reading-check="${k}" ${t.checks?.[k]?"checked":""}> ${v}</label>`).join("")}</section><section class="reading-notes"><h3>Notes</h3><div id="readingNotes"></div></section></main><aside class="reader-side"><h3>📘 Từ mới trong bài</h3><b id="readerWordCount">0 mots</b><div id="readerWordList"></div></aside></div>`;renderReaderText();renderReadingNotes();renderReadingDashboard();renderReadingCards()}
function renderReaderText(){if(!activeReadingId)return;const t=readingDb.texts.find(x=>x.id===activeReadingId),box=$("#readerText");if(!t||!box)return;box.style.fontSize=readingFont+"px";const unknown=$("#unknownHighlight")?.checked;let known=new Set();box.innerHTML=tokenizeReading(t.text).map(tok=>{if(!isFrenchWord(tok))return esc(tok);const key=normWord(tok),entry=readingVocab.get(key);if(entry){known.add(key);return `<mark class="reading-mark reading-known" data-word="${esc(key)}" id="rw-${esc(key)}">${esc(tok)}</mark>`}if(unknown&&tok.length>3)return `<mark class="reading-mark reading-unknown">${esc(tok)}</mark>`;return esc(tok)}).join("");const words=[...known].sort();$("#readerWordCount").textContent=words.length+" mots";$("#readerWordList").innerHTML=words.map(w=>`<button data-word-jump="${esc(w)}">${esc(readingVocab.get(w)?.mot||w)}</button>`).join("");readingDb.stats.words=Math.max(readingDb.stats.words||0,words.length);saveReadingDb()}
function tokenizeReading(text){return String(text).match(/[\p{L}]+(?:[’'][\p{L}]+)?|[^\p{L}]+/gu)||[]}function isFrenchWord(s){return /^[\p{L}]+(?:[’'][\p{L}]+)?$/u.test(s)}function normWord(s){return String(s||"").toLowerCase().replace(/[’]/g,"'").normalize("NFC").trim()}function countReadingWords(s){return tokenizeReading(s).filter(isFrenchWord).length}function readingProgress(t){return Math.round(Object.values(t.checks||{}).filter(Boolean).length/5*100)}function changeReaderFont(d){readingFont=Math.min(30,Math.max(14,readingFont+d));renderReaderText()}
function toggleReadingCheck(k,val){const t=readingDb.texts.find(x=>x.id===activeReadingId);if(!t)return;t.checks[k]=val;if(k==="read"&&val){t.stats.reads=(t.stats.reads||0)+1;t.stats.lastRead=new Date().toISOString()}saveReadingDb();renderReadingDashboard();renderReadingCards()}
function showReadingTip(el){const e=readingVocab.get(el.dataset.word);if(!e)return;const tip=$("#readingTip");tip.innerHTML=`<b>📚 ${esc(e.mot||el.textContent)}</b><button data-reading-speak="${esc(e.mot||el.textContent)}">🎧</button>${e.meaning?`<p>${esc(e.meaning)}</p>`:""}${e.example?`<small>${esc(e.example)}</small>`:""}${e.collocation?`<em>${esc(e.collocation)}</em>`:""}`;const r=el.getBoundingClientRect();tip.style.left=Math.min(innerWidth-280,r.left)+"px";tip.style.top=(scrollY+r.bottom+8)+"px";setTimeout(()=>tip.classList.add("show"),20)}
function showWordPopup(key){const e=readingVocab.get(key);if(!e)return;readingDb.stats.lookups=(readingDb.stats.lookups||0)+1;const t=readingDb.texts.find(x=>x.id===activeReadingId);if(t)t.stats.lookups=(t.stats.lookups||0)+1;saveReadingDb();const pop=$("#readingWordPop");pop.innerHTML=`<div><button class="pop-close" onclick="document.getElementById('readingWordPop').classList.remove('show')">×</button><h3>${esc(e.mot||key)} <button data-reading-speak="${esc(e.mot||key)}">🔊</button></h3>${field("Loại từ",e.type)}${field("IPA",e.ipa)}${field("Nghĩa",e.meaning)}${field("Ví dụ",e.example)}${field("Collocation",e.collocation)}${field("Synonyme",e.synonyme)}${field("Antonyme",e.antonyme)}</div>`;pop.classList.add("show")}
function field(k,v){return v?`<p><small>${k}</small><b>${esc(v)}</b></p>`:""}function speakReadingWord(w){readingDb.stats.listens=(readingDb.stats.listens||0)+1;const t=readingDb.texts.find(x=>x.id===activeReadingId);if(t)t.stats.listens=(t.stats.listens||0)+1;saveReadingDb();speak(w)}function jumpToWord(w){document.getElementById("rw-"+w)?.scrollIntoView({behavior:"smooth",block:"center"})}
function saveSelectionNote(){const t=readingDb.texts.find(x=>x.id===activeReadingId);if(!t||selectionText.length<3)return;t.notes.push({id:"n"+Date.now(),text:selectionText,createdAt:new Date().toISOString()});t.checks.note=true;saveReadingDb();renderReadingNotes();renderReadingDashboard();notify("Đã lưu note")}function renderReadingNotes(){const t=readingDb.texts.find(x=>x.id===activeReadingId);$("#readingNotes").innerHTML=t?.notes?.length?t.notes.map(n=>`<div><p>${esc(n.text)}</p><button data-note-delete="${n.id}">Xóa</button></div>`).join(""):"<small>Chưa có note. Bôi đen đoạn văn rồi bấm Ajouter une note.</small>"}function deleteReadingNote(id){const t=readingDb.texts.find(x=>x.id===activeReadingId);if(!t)return;t.notes=t.notes.filter(n=>n.id!==id);saveReadingDb();renderReadingNotes()}function closeReader(){$("#readerPane").classList.remove("show");activeReadingId=null;renderReadingDashboard();renderReadingCards()}function readingStreak(){const days=[...new Set(readingDb.texts.filter(t=>t.checks?.read).map(t=>t.date))].sort();let n=0,d=new Date();for(;;){const k=keyOf(d);if(days.includes(k)){n++;d.setDate(d.getDate()-1)}else break}return n}

/* SMART READING MATCH v2 · chỉ lấy cột B, bắt cụm/từ thông minh trong văn bản */
let READING_PHRASES=[];
function readingSmartNormalize(s){return String(s||"").toLowerCase().replace(/[’`´]/g,"'").normalize("NFC").trim()}
function readingStripLeadingArticle(s){return readingSmartNormalize(s).replace(/^(l'|d'|s'|j'|qu'|le\s+|la\s+|les\s+|un\s+|une\s+|des\s+|du\s+|de\s+la\s+)/i,"").trim()}
function readingStopwords(){return new Set(["avec","afin","pour","dans","sur","sous","chez","entre","sans","être","avoir","faire","aller","venir","plus","moins","très","comme","parce","que","qui","dont","où","est","sont","les","des","une","dans","leur","leurs","notre","votre","cette","texte","infinitif"])}
function readingTermVariants(raw){const stop=readingStopwords(),out=new Set(),base=readingSmartNormalize(raw);if(!base)return[];const add=x=>{x=readingSmartNormalize(x).replace(/\s+/g," ").replace(/^[-–—•·]+|[-–—•·]+$/g,"").trim();if(x.length>=3&&!stop.has(x))out.add(x);const stripped=readingStripLeadingArticle(x);if(stripped.length>=3&&!stop.has(stripped))out.add(stripped)};add(base);base.split(/\s*[•·;,/]\s*|\s+\+\s+|\(|\)|:/).forEach(add);base.split(/\s+(?:afin de|pour|avec|sans|et|ou)\s+/).forEach(add);base.match(/[\p{L}]+(?:[’'][\p{L}]+)?/gu)?.forEach(w=>{const n=readingStripLeadingArticle(w);if(n.length>=5&&!stop.has(n))out.add(n)});return [...out].sort((a,b)=>b.length-a.length)}
function readingRegexForTerm(term){const escaped=term.replace(/[.*+?^${}()|[\]\\]/g,"\\$&").replace(/['’]/g,"['’]").replace(/\s+/g,"\\s+");return new RegExp(`(^|[^\\p{L}])(${escaped})(?=$|[^\\p{L}])`,"giu")}
function loadReadingVocabulary(){const callback="handleReadingVocabulary"+Date.now(),script=document.createElement("script");window[callback]=json=>{try{readingVocab=new Map();READING_PHRASES=[];(json.table.rows||[]).slice(1).forEach(r=>{const c=(r.c||[]).map(x=>x?.f??x?.v??"").map(v=>String(v).trim()),mot=c[1]||"";if(!mot||/^mot\s*\/\s*expression$/i.test(mot))return;const entry={mot,type:c[8]||"",ipa:c[12]||"",meaning:c[3]||"",example:c[4]||"",collocation:c[5]||"",synonyme:c[6]||"",antonyme:c[7]||""};readingTermVariants(mot).forEach(term=>{readingVocab.set(term,entry);READING_PHRASES.push({term,entry})})});READING_PHRASES=[...new Map(READING_PHRASES.sort((a,b)=>b.term.length-a.term.length).map(x=>[x.term,x])).values()];renderReaderText();notify(`Đã tải ${READING_PHRASES.length} cụm/từ đọc từ cột B`)}catch{notify("Chưa tải được Google Sheet vocab; Reading vẫn dùng được")}finally{delete window[callback];script.remove()}};script.onerror=()=>notify("Chưa tải được Google Sheet vocab; Reading vẫn dùng được");script.src=`https://docs.google.com/spreadsheets/d/${READING_SHEET_ID}/gviz/tq?gid=${READING_GID}&range=A1:Z2000&tqx=responseHandler:${callback}`;document.head.appendChild(script)}
function findReadingMatches(text){const ranges=[];for(const item of READING_PHRASES){const re=readingRegexForTerm(item.term);let m;while((m=re.exec(text))){const start=m.index+m[1].length,end=start+m[2].length;if(end<=start)continue;if(ranges.some(r=>start<r.end&&end>r.start))continue;ranges.push({start,end,key:item.term,entry:item.entry});}}return ranges.sort((a,b)=>a.start-b.start)}
function renderReaderText(){if(!activeReadingId)return;const t=readingDb.texts.find(x=>x.id===activeReadingId),box=$("#readerText");if(!t||!box)return;box.style.fontSize=readingFont+"px";const unknown=$("#unknownHighlight")?.checked,matches=findReadingMatches(t.text),known=new Map();let html="",pos=0;const orange=s=>unknown?tokenizeReading(s).map(tok=>isFrenchWord(tok)&&tok.length>3?`<mark class="reading-mark reading-unknown">${esc(tok)}</mark>`:esc(tok)).join(""):esc(s);for(const r of matches){html+=orange(t.text.slice(pos,r.start));const surface=t.text.slice(r.start,r.end);known.set(r.key,r.entry);html+=`<mark class="reading-mark reading-known" data-word="${esc(r.key)}" id="rw-${esc(r.key)}">${esc(surface)}</mark>`;pos=r.end}html+=orange(t.text.slice(pos));box.innerHTML=html;const words=[...known.entries()].sort((a,b)=>(a[1].mot||a[0]).localeCompare(b[1].mot||b[0]));$("#readerWordCount").textContent=words.length+" mots";$("#readerWordList").innerHTML=words.map(([k,e])=>`<button data-word-jump="${esc(k)}">${esc(e.mot||k)}</button>`).join("");readingDb.stats.words=Math.max(readingDb.stats.words||0,words.length);saveReadingDb()}

/* SMART READING MATCH v2.1 · thêm biến thể số nhiều/giống cái thường gặp */
function readingMorphVariants(term){const out=new Set(),t=readingSmartNormalize(term);if(!t||/\s/.test(t))return[];out.add(t);if(t.endsWith("s"))out.add(t.slice(0,-1));if(t.endsWith("es"))out.add(t.slice(0,-2));if(t.endsWith("e"))out.add(t.slice(0,-1));if(t.endsWith("ées"))out.add(t.slice(0,-1));if(t.endsWith("és"))out.add(t.slice(0,-1));if(t.endsWith("elles"))out.add(t.slice(0,-3));if(t.endsWith("aux"))out.add(t.slice(0,-3)+"al");return [...out].filter(x=>x.length>=4)}
function readingTermVariants(raw){const stop=readingStopwords(),out=new Set(),base=readingSmartNormalize(raw);if(!base)return[];const add=x=>{x=readingSmartNormalize(x).replace(/\s+/g," ").replace(/^[-–—•·]+|[-–—•·]+$/g,"").trim();if(x.length>=3&&!stop.has(x))out.add(x);const stripped=readingStripLeadingArticle(x);if(stripped.length>=3&&!stop.has(stripped))out.add(stripped);if(!/\s/.test(stripped))readingMorphVariants(stripped).forEach(v=>{if(!stop.has(v))out.add(v)})};add(base);base.split(/\s*[•·;,/]\s*|\s+\+\s+|\(|\)|:/).forEach(add);base.split(/\s+(?:afin de|pour|avec|sans|et|ou)\s+/).forEach(add);base.match(/[\p{L}]+(?:[’'][\p{L}]+)?/gu)?.forEach(w=>{const n=readingStripLeadingArticle(w);if(n.length>=5&&!stop.has(n)){out.add(n);readingMorphVariants(n).forEach(v=>!stop.has(v)&&out.add(v))}});return [...out].sort((a,b)=>b.length-a.length)}
function readingRegexForTerm(term){let escaped=term.replace(/[.*+?^${}()|[\]\\]/g,"\\$&").replace(/['’]/g,"['’]").replace(/\s+/g,"\\s+");if(!/[\s'’]/.test(term)&&term.length>=5)escaped+=`(?:s|es)?`;return new RegExp(`(^|[^\\p{L}])(${escaped})(?=$|[^\\p{L}])`,"giu")}
/* GRAMMAR ANALYSIS CENTER v1 · rule-based analyse grammaticale cho Reading */
const GRAMMAR_CATEGORIES=[
  ["general","Vue générale"],["temps","Temps verbaux"],["infinitif","Infinitif & structures"],["connecteurs","Connecteurs logiques"],["pronoms","Pronoms"],["negation","Négation"],["comparatif","Comparatif"],["pronominal","Verbes pronominaux"],["imperatif","Impératif"],["expressions","Expressions utiles DELF B1"]
];
const GRAMMAR_LABELS=Object.fromEntries(GRAMMAR_CATEGORIES);
const GRAMMAR_COLORS={temps:"grammar-temps",infinitif:"grammar-infinitif",connecteurs:"grammar-connecteurs",pronoms:"grammar-pronoms",negation:"grammar-negation",comparatif:"grammar-comparatif",pronominal:"grammar-pronominal",imperatif:"grammar-imperatif",expressions:"grammar-expressions"};
let grammarDelfMode=false;
function grammarEscapeReg(s){return String(s).replace(/[.*+?^${}()|[\]\\]/g,"\\$&").replace(/['’]/g,"['’]").replace(/\s+/g,"\\s+")}
function grammarFindRegex(text,re,category,name,meaning,newExample){const out=[];let m;while((m=re.exec(text))){const value=m[1]||m[0],offset=m[1]?m[0].indexOf(m[1]):0,start=m.index+offset,end=start+value.length;if(end>start)out.push({start,end,text:value,category,name,meaning,newExample})}return out}
function grammarFindTerms(text,terms,category,name,meaning,newExample){return terms.flatMap(term=>grammarFindRegex(text,new RegExp(`(^|[^\\p{L}])(${grammarEscapeReg(term)})(?=$|[^\\p{L}])`,"giu"),category,name||term,meaning,newExample))}
function analyzeGrammar(text){const t=String(text||""),items=[];const add=a=>items.push(...a);
  add(grammarFindTerms(t,["d'abord","ensuite","puis","après","enfin","en conclusion","cependant","pourtant","mais","donc","alors","c'est pourquoi","en réalité","aussi","de plus","avec","malgré"],"connecteurs","Connecteur logique","Từ nối giúp tổ chức ý, thêm ý, đối lập hoặc kết luận.","Cependant, il faut rester prudent."));
  add(grammarFindRegex(t,/(?:ne|n['’])\s+[\p{L}'’]+\s+(?:pas|jamais|rien|plus)/giu,"negation","Négation","Cấu trúc phủ định ne/n’ + verbe + pas/jamais/rien/plus.","Je ne comprends pas cette phrase."));
  add(grammarFindRegex(t,/\b(?:pour|sans|afin de|avant de|après avoir|après être|de|à)\s+(?:me |te |se |nous |vous |s['’])?[\p{L}]+(?:er|ir|re)\b/giu,"infinitif","Structure + infinitif","Dùng giới từ/cụm cố định trước động từ nguyên mẫu.","Je travaille pour réussir."));
  add(grammarFindRegex(t,/\b(?:capacité|manière|façon|envie|besoin|possibilité|difficulté)\s+d['’e]\s+(?:[\p{L}]+(?:er|ir|re))/giu,"infinitif","Nom + de + infinitif","Danh từ đi với de + infinitif để nêu khả năng/nhu cầu/cách làm.","J’ai besoin de progresser."));
  add(grammarFindRegex(t,/\b(?:plus|moins|aussi)\s+[\p{L}]+/giu,"comparatif","Comparatif","So sánh hơn/kém/bằng: plus/moins/aussi + adjectif/adverbe.","Ce texte est plus clair."));
  add(grammarFindRegex(t,/\b(?:me|te|se|nous|vous)\s+[\p{L}]+(?:e|es|ons|ez|ent|er|ir|re)?\b|s['’][\p{L}]+/giu,"pronominal","Verbe pronominal","Động từ phản thân dùng với me/te/se/nous/vous/s’.","Il se lève tôt."));
  add(grammarFindTerms(t,["je","tu","il","elle","nous","vous","ils","elles","me","te","le","la","les","lui","leur","y","en","qui","que","où","dont"],"pronoms","Pronom","Đại từ thay thế danh từ/người/vật hoặc nối mệnh đề.","Je lui parle souvent."));
  add(grammarFindTerms(t,["notez","classez","barrez","regardez","écoutez","lisez","écrivez","faites","prenez","laissez","n'oubliez pas","n’oubliez pas"],"imperatif","Impératif présent","Mệnh lệnh/hướng dẫn trực tiếp.","Lisez le texte attentivement."));
  add(grammarFindRegex(t,/\b(?:suis|es|est|sommes|êtes|sont|ai|as|a|avons|avez|ont|semble(?:nt)?|rend(?:ent)?|trouve(?:nt)?|joue(?:nt)?|aide(?:nt)?|dois|doit|doivent|peux|peut|peuvent|sais|sait|savent)\b/giu,"temps","Présent de l’indicatif","Thì hiện tại dùng để nêu sự thật, mô tả hoặc thói quen.","Cette méthode aide les étudiants."));
  add(grammarFindRegex(t,/\b(?:ai|as|a|avons|avez|ont|suis|es|est|sommes|êtes|sont)\s+[\p{L}]+(?:é|i|u|is|it)\b/giu,"temps","Passé composé","Thì quá khứ diễn tả hành động đã hoàn thành.","J’ai terminé l’exercice."));
  add(grammarFindRegex(t,/\b[\p{L}]+(?:ais|ait|ions|iez|aient)\b/giu,"temps","Imparfait","Thì quá khứ mô tả bối cảnh/thói quen.","Quand j’étais petit, je lisais beaucoup."));
  add(grammarFindRegex(t,/\b(?:vais|vas|va|allons|allez|vont)\s+[\p{L}]+(?:er|ir|re)\b/giu,"temps","Futur proche","Tương lai gần: aller + infinitif.","Je vais lire cet article."));
  add(grammarFindRegex(t,/\b[\p{L}]+(?:rai|ras|ra|rons|rez|ront)\b/giu,"temps","Futur simple","Tương lai đơn.","Je lirai demain."));
  add(grammarFindRegex(t,/\b[\p{L}]+(?:rais|rait|rions|riez|raient)\b/giu,"temps","Conditionnel présent","Dùng để diễn đạt giả định/lịch sự.","Je voudrais améliorer mon français."));
  add(grammarFindTerms(t,["il faut","avoir tendance à","être capable de","jouer un rôle","faire face à","mettre en place","prendre conscience","il est important de"],"expressions","Expression utile DELF B1","Cụm diễn đạt hữu ích cho nói/viết DELF B1.","Il est important de pratiquer chaque jour."));
  const filtered=items.sort((a,b)=>a.start-b.start).filter((x,i,arr)=>!arr.some((y,j)=>j<i&&x.start<y.end&&x.end>y.start));
  return {createdAt:new Date().toISOString(),updatedAt:new Date().toISOString(),items:filtered,summary:grammarSummary(t,filtered)}
}
function grammarSummary(text,items){const cats=[...new Set(items.map(x=>x.category))],topic=(text.match(/\b(?:gestion du temps|expatriation|environnement|travail|tourisme|médias|santé|culture)\b/i)||[])[0]||"thème du texte";return {level:"B1",topic,points:cats.map(c=>GRAMMAR_LABELS[c]||c)}}
function ensureGrammarAnalysis(t){if(!t.grammarAnalysis||!t.grammarAnalysis.items){t.grammarAnalysis=analyzeGrammar(t.text);t.selectedGrammarCategory=t.selectedGrammarCategory||"general";saveReadingDb()}return t.grammarAnalysis}
function grammarItemsFor(t){const a=ensureGrammarAnalysis(t);let items=a.items||[];if(grammarDelfMode){const keep=new Set(["temps","infinitif","connecteurs","pronoms","negation","comparatif","pronominal","imperatif"]);items=items.filter(x=>keep.has(x.category))}const cat=t.selectedGrammarCategory||"general";return cat==="general"?items:items.filter(x=>x.category===cat)}
function grammarAnalysisHtml(t){const a=ensureGrammarAnalysis(t),cat=t.selectedGrammarCategory||"general",items=grammarItemsFor(t);if(cat==="general")return `<div class="grammar-summary"><p><b>Niveau estimé:</b> ${a.summary.level}</p><p><b>Thème:</b> ${esc(a.summary.topic)}</p><p><b>Points principaux:</b> ${a.summary.points.map(esc).join(" · ")||"Aucun point détecté"}</p></div>`+grammarListHtml(items.slice(0,18));return grammarListHtml(items)}
function grammarListHtml(items){return items.length?`<div class="grammar-analysis-list">${items.map(x=>`<article><span>${esc(GRAMMAR_LABELS[x.category]||x.category)}</span><b>${esc(x.text)}</b><p>${esc(x.name)} — ${esc(x.meaning)}</p><small>Autre exemple: ${esc(x.newExample)}</small></article>`).join("")}</div>`:`<div class="grammar-empty">Không tìm thấy cấu trúc rõ ràng trong mục này.</div>`}
function renderGrammarPanel(t){return `<aside class="grammar-panel"><h3>🔍 Analyse grammaticale</h3><select id="grammarCategory">${GRAMMAR_CATEGORIES.map(([v,l])=>`<option value="${v}" ${v===(t.selectedGrammarCategory||"general")?"selected":""}>${l}</option>`).join("")}</select><div class="grammar-actions"><button id="copyGrammarAnalysis">📌 Copier l’analyse</button><button id="generateGrammarSheet">📝 Générer fiche de grammaire</button><button id="toggleDelfMode" class="${grammarDelfMode?"active":""}">🎯 Mode DELF B1</button></div><div id="grammarAnalysisBox">${grammarAnalysisHtml(t)}</div><div id="grammarSheetBox"></div></aside>`}
const __oldOpenReaderForGrammar=openReader;
openReader=function(id){activeReadingId=id;const t=readingDb.texts.find(x=>x.id===id);if(!t)return;ensureGrammarAnalysis(t);t.stats.opens=(t.stats.opens||0)+1;t.stats.minutes=(t.stats.minutes||0)+t.minutes;t.stats.lastRead=new Date().toISOString();readingDb.stats.minutes=(readingDb.stats.minutes||0)+t.minutes;saveReadingDb();$("#readerPane").classList.add("show");$("#readerPane").innerHTML=`<div class="reader-layout reader-layout-grammar"><main class="reader-main"><div class="reader-tools"><button data-close-reader>← Retour</button><button data-font="-2">Aâˆ’</button><button data-font="2">A+</button><button onclick="document.getElementById('readerPane').classList.toggle('reader-dark')">â— Dark</button><button id="saveSelectionNote" disabled>Ajouter une note</button><label><input id="unknownHighlight" type="checkbox"> 🟠 Từ mới</label></div><h2>${esc(t.title)}</h2><p class="reader-meta">${esc(t.theme)} · ${esc(t.level)} · ${fmtDate(new Date(t.date+"T00:00:00"))} · ${t.minutes} min · ${t.words} mots</p><article class="reader-text" id="readerText"></article><section class="reading-checklist">${Object.entries({read:"Đã đọc",listen:"Đã nghe",lookup:"Đã tra từ",note:"Đã ghi chú",review:"Đã ôn lại"}).map(([k,v])=>`<label><input type="checkbox" data-reading-check="${k}" ${t.checks?.[k]?"checked":""}> ${v}</label>`).join("")}</section><section class="reading-notes"><h3>Notes</h3><div id="readingNotes"></div></section></main>${renderGrammarPanel(t)}<aside class="reader-side"><h3>📘 Từ mới trong bài</h3><b id="readerWordCount">0 mots</b><div id="readerWordList"></div></aside></div>`;renderReaderText();renderReadingNotes();renderReadingDashboard();renderReadingCards()}
function grammarMatchesForText(t){const selected=grammarItemsFor(t);return selected.map(x=>({...x,kind:"grammar"}))}
const __oldRenderReaderTextForGrammar=renderReaderText;
renderReaderText=function(){if(!activeReadingId)return;const t=readingDb.texts.find(x=>x.id===activeReadingId),box=$("#readerText");if(!t||!box)return;ensureGrammarAnalysis(t);box.style.fontSize=readingFont+"px";const unknown=$("#unknownHighlight")?.checked,grammar=grammarMatchesForText(t),vocab=findReadingMatches(t.text).map(x=>({...x,kind:"vocab"})),ranges=[...grammar,...vocab].sort((a,b)=>(b.end-b.start)-(a.end-a.start));const accepted=[];for(const r of ranges){if(!accepted.some(a=>r.start<a.end&&r.end>a.start))accepted.push(r)}accepted.sort((a,b)=>a.start-b.start);const known=new Map();let html="",pos=0;const orange=s=>unknown?tokenizeReading(s).map(tok=>isFrenchWord(tok)&&tok.length>3?`<mark class="reading-mark reading-unknown">${esc(tok)}</mark>`:esc(tok)).join(""):esc(s);for(const r of accepted){html+=orange(t.text.slice(pos,r.start));const surface=t.text.slice(r.start,r.end);if(r.kind==="grammar"){const cls=GRAMMAR_COLORS[r.category]||"grammar-expressions";html+=`<mark class="grammar-mark ${cls}" data-grammar="${esc(r.name)}" data-grammar-meaning="${esc(r.meaning)}" data-grammar-text="${esc(surface)}" data-grammar-example="${esc(r.newExample)}">${esc(surface)}</mark>`}else{known.set(r.key,r.entry);html+=`<mark class="reading-mark reading-known" data-word="${esc(r.key)}" id="rw-${esc(r.key)}">${esc(surface)}</mark>`}pos=r.end}html+=orange(t.text.slice(pos));box.innerHTML=html;const words=[...known.entries()].sort((a,b)=>(a[1].mot||a[0]).localeCompare(b[1].mot||b[0]));$("#readerWordCount").textContent=words.length+" mots";$("#readerWordList").innerHTML=words.map(([k,e])=>`<button data-word-jump="${esc(k)}">${esc(e.mot||k)}</button>`).join("");readingDb.stats.words=Math.max(readingDb.stats.words||0,words.length);saveReadingDb()}
document.addEventListener("change",e=>{if(e.target.id==="grammarCategory"){const t=readingDb.texts.find(x=>x.id===activeReadingId);if(!t)return;t.selectedGrammarCategory=e.target.value;t.grammarAnalysis.updatedAt=new Date().toISOString();saveReadingDb();$("#grammarAnalysisBox").innerHTML=grammarAnalysisHtml(t);renderReaderText()}});
document.addEventListener("click",e=>{if(e.target.closest("#copyGrammarAnalysis"))copyGrammarAnalysis();if(e.target.closest("#generateGrammarSheet"))generateGrammarSheet();if(e.target.closest("#toggleDelfMode")){grammarDelfMode=!grammarDelfMode;e.target.closest("#toggleDelfMode").classList.toggle("active",grammarDelfMode);const t=readingDb.texts.find(x=>x.id===activeReadingId);if(t){$("#grammarAnalysisBox").innerHTML=grammarAnalysisHtml(t);renderReaderText()}}});
document.addEventListener("mouseover",e=>{const g=e.target.closest(".grammar-mark");if(!g)return;const tip=$("#readingTip");tip.innerHTML=`<b>Structure: ${g.dataset.grammar}</b><p>${g.dataset.grammarMeaning}</p><small>Dans le texte: ${g.dataset.grammarText}</small><em>Autre exemple: ${g.dataset.grammarExample}</em>`;const r=g.getBoundingClientRect();tip.style.left=Math.min(innerWidth-300,r.left)+"px";tip.style.top=(scrollY+r.bottom+8)+"px";setTimeout(()=>tip.classList.add("show"),20)});
document.addEventListener("mouseout",e=>{if(e.target.closest(".grammar-mark"))$("#readingTip").classList.remove("show")});
function currentGrammarText(){const t=readingDb.texts.find(x=>x.id===activeReadingId);if(!t)return"";return (grammarItemsFor(t)).map(x=>`${GRAMMAR_LABELS[x.category]}: ${x.text} — ${x.name}. ${x.meaning} Exemple: ${x.newExample}`).join("\n")}
function copyGrammarAnalysis(){const text=currentGrammarText();navigator.clipboard?.writeText(text);notify("Analyse copiée 📌")}
function generateGrammarSheet(){const t=readingDb.texts.find(x=>x.id===activeReadingId);if(!t)return;const items=grammarItemsFor(t).slice(0,10);const exercises=items.slice(0,5).map((x,i)=>`${i+1}. Réécrivez une phrase avec: ${x.name}`).join("<br>");$("#grammarSheetBox").innerHTML=`<article class="grammar-fiche"><h4>📝 Fiche de grammaire</h4><p><b>Texte:</b> ${esc(t.title)}</p><p><b>Date:</b> ${fmtDate(new Date(t.date+"T00:00:00"))}</p><p><b>Thème:</b> ${esc(t.theme)}</p><h5>10 structures importantes</h5>${items.map(x=>`<div><b>${esc(x.name)}</b><p>Texte: ${esc(x.text)}</p><small>Exemple: ${esc(x.newExample)}</small></div>`).join("")}<h5>5 exercices</h5><p>${exercises}</p></article>`}
/* READING UI CLEANUP v2 · khung đọc rộng, Analyse grammaticale chỉ mở khi cần */
function renderGrammarPanel(t){return `<aside class="grammar-panel grammar-panel-collapsed" id="grammarPanel" aria-hidden="true"><div class="grammar-panel-head"><h3>🔍 Analyse grammaticale</h3><button class="grammar-close" id="closeGrammarPanel" aria-label="Fermer">×</button></div><select id="grammarCategory">${GRAMMAR_CATEGORIES.map(([v,l])=>`<option value="${v}" ${v===(t.selectedGrammarCategory||"general")?"selected":""}>${l}</option>`).join("")}</select><div class="grammar-actions"><button id="copyGrammarAnalysis">📌 Copier l’analyse</button><button id="generateGrammarSheet">📝 Générer fiche de grammaire</button><button id="toggleDelfMode" class="${grammarDelfMode?"active":""}">🎯 Mode DELF B1</button></div><div id="grammarAnalysisBox">${grammarAnalysisHtml(t)}</div><div id="grammarSheetBox"></div></aside>`}
openReader=function(id){activeReadingId=id;const t=readingDb.texts.find(x=>x.id===id);if(!t)return;ensureGrammarAnalysis(t);t.stats.opens=(t.stats.opens||0)+1;t.stats.minutes=(t.stats.minutes||0)+t.minutes;t.stats.lastRead=new Date().toISOString();readingDb.stats.minutes=(readingDb.stats.minutes||0)+t.minutes;saveReadingDb();$("#readerPane").classList.add("show");$("#readerPane").innerHTML=`<div class="reader-layout reader-layout-clean"><main class="reader-main reader-main-wide"><div class="reader-tools reader-tools-clean"><button data-close-reader>← Retour</button><button data-font="-2">Aâˆ’</button><button data-font="2">A+</button><button onclick="document.getElementById('readerPane').classList.toggle('reader-dark')">â— Dark</button><button id="saveSelectionNote" disabled>Ajouter une note</button><button id="openGrammarPanel" class="grammar-toggle">🔍 Analyse grammaticale</button><label><input id="unknownHighlight" type="checkbox"> 🟠 Từ mới</label></div><h2>${esc(t.title)}</h2><p class="reader-meta">${esc(t.theme)} · ${esc(t.level)} · ${fmtDate(new Date(t.date+"T00:00:00"))} · ${t.minutes} min · ${t.words} mots</p><article class="reader-text" id="readerText"></article><section class="reading-checklist">${Object.entries({read:"Đã đọc",listen:"Đã nghe",lookup:"Đã tra từ",note:"Đã ghi chú",review:"Đã ôn lại"}).map(([k,v])=>`<label><input type="checkbox" data-reading-check="${k}" ${t.checks?.[k]?"checked":""}> ${v}</label>`).join("")}</section><section class="reading-notes"><h3>Notes</h3><div id="readingNotes"></div></section></main><aside class="reader-side reader-side-compact"><h3>📘 Từ mới trong bài</h3><b id="readerWordCount">0 mots</b><div id="readerWordList"></div></aside>${renderGrammarPanel(t)}<div class="grammar-scrim" id="grammarScrim"></div></div>`;renderReaderText();renderReadingNotes();renderReadingDashboard();renderReadingCards()}
document.addEventListener("click",e=>{if(e.target.closest("#openGrammarPanel")){const p=$("#grammarPanel"),s=$("#grammarScrim");p?.classList.add("show");p?.setAttribute("aria-hidden","false");s?.classList.add("show")}if(e.target.closest("#closeGrammarPanel")||e.target.closest("#grammarScrim")){const p=$("#grammarPanel"),s=$("#grammarScrim");p?.classList.remove("show");p?.setAttribute("aria-hidden","true");s?.classList.remove("show")}});
/* SpeakingTopicBank · Kho đề Nói DELF B1/B2 */
(() => {
  const BANK_KEY = "delfSpeakingTopicBank_v1";
  const TAGS = ["Société", "Travail", "Études", "Environnement", "Argent", "Famille", "Santé", "Culture", "Technologie", "Tourisme", "Libre"];
  const $one = (s, r = document) => r.querySelector(s);
  const $all = (s, r = document) => [...r.querySelectorAll(s)];
  const escapeHtml = value => String(value ?? "").replace(/[&<>"']/g, m => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[m]));
  const todayKey = () => new Date().toISOString().slice(0, 10);
  const fmtDateVi = value => {
    const d = value ? new Date(value + "T00:00:00") : new Date();
    return Number.isNaN(d.getTime()) ? value : d.toLocaleDateString("vi-VN");
  };
  const uid = () => "sp_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);

  let bank = loadBank();
  let activeId = bank.activeId || bank.topics[0]?.id || null;
  let editingId = null;
  let bankRecorder = null;
  let bankChunks = [];
  let bankTimer = null;
  let bankRemaining = 180;
  let bankDuration = 180;

  function loadBank() {
    try {
      const raw = JSON.parse(localStorage.getItem(BANK_KEY));
      if (raw && Array.isArray(raw.topics)) return { topics: raw.topics, activeId: raw.activeId || raw.topics[0]?.id || null };
    } catch {}
    return { topics: [], activeId: null };
  }

  function saveBank() {
    bank.activeId = activeId;
    localStorage.setItem(BANK_KEY, JSON.stringify(bank));
  }

  function activeTopic() {
    return bank.topics.find(t => t.id === activeId) || null;
  }

  function speakFr(text) {
    const clean = String(text || "").trim();
    if (!clean) return;
    speak(clean);
  }

  function installSpeakingBank() {
    const speaking = $one("#speaking");
    if (!speaking || $one("#speakingTopicBank")) return;
    const title = $one("#speaking .section-title");
    if (title && !$one("#openSpeakingTopicList")) {
      title.insertAdjacentHTML("beforeend", `<button class="topic-bank-open" id="openSpeakingTopicList" type="button">🗂️ Danh sách đề</button>`);
    }
    speaking.insertAdjacentHTML("beforeend", `
      <section class="speaking-bank" id="speakingTopicBank">
        <div class="speaking-bank-head">
          <div>
            <span>EXPRESSION ORALE DELF</span>
            <h3>Kho đề Nói DELF B1/B2</h3>
            <p>Lưu đề, dàn ý, bài mẫu, luyện đọc, ghi âm và bấm giờ ngay trong tab NÓI.</p>
          </div>
          <div class="speaking-bank-actions">
            <button id="addSpeakingTopic" type="button">+ Thêm đề mới</button>
            <button id="exportSpeakingBank" type="button">Xuất JSON</button>
            <label class="import-topic-btn">Nhập JSON<input id="importSpeakingBank" type="file" accept="application/json" hidden></label>
          </div>
        </div>
        <div class="speaking-bank-layout">
          <aside class="topic-list-panel" id="topicListPanel">
            <div class="topic-list-top">
              <b>📋 Danh sách đề</b>
              <button id="closeTopicList" type="button">×</button>
            </div>
            <input id="topicSearch" type="search" placeholder="Tìm đề nói...">
            <select id="topicFilter">${["Tất cả", ...TAGS].map(t => `<option value="${escapeHtml(t)}">${escapeHtml(t)}</option>`).join("")}</select>
            <div class="topic-list" id="topicList"></div>
          </aside>
          <main class="topic-display" id="topicDisplay"></main>
          <aside class="topic-sample" id="topicSample"></aside>
        </div>
        <div class="speaking-practice-dock">
          <div class="delf-timer-card">
            <div>
              <small>â±️ Đồng hồ DELF</small>
              <strong id="bankTimerText">03:00</strong>
            </div>
            <select id="bankTimerSelect">
              <option value="120">2 phút</option>
              <option value="180" selected>3 phút</option>
              <option value="300">5 phút</option>
            </select>
            <button id="bankTimerStart" type="button">Bắt đầu</button>
            <button id="bankTimerPause" type="button">Tạm dừng</button>
            <button id="bankTimerReset" type="button">Đặt lại</button>
          </div>
          <div class="record-card">
            <button id="bankRecordBtn" type="button">🎙️ Ghi âm</button>
            <audio id="bankAudioPlayer" controls></audio>
            <button id="deleteBankRecording" type="button">Xóa bản ghi</button>
          </div>
        </div>
      </section>
      <dialog class="speaking-topic-dialog" id="speakingTopicDialog">
        <form method="dialog" id="speakingTopicForm">
          <h3 id="topicDialogTitle">Thêm đề nói mới</h3>
          <div class="topic-form-grid">
            <label>Tiêu đề đề<input id="topicTitleInput" required placeholder="Ex: Les réseaux sociaux sont-ils dangereux ?"></label>
            <label>Ngày nhập<input id="topicDateInput" type="date"></label>
            <label>Chủ đề/tag<select id="topicTagInput">${TAGS.map(t => `<option value="${escapeHtml(t)}">${escapeHtml(t)}</option>`).join("")}</select></label>
          </div>
          <label>Nội dung đề<textarea id="topicSujetInput" rows="4" placeholder="Collez ici le sujet en français..."></textarea></label>
          <label>Dàn ý<textarea id="topicOutlineInput" rows="5" placeholder="Introduction · Argument 1 · Argument 2 · Exemple · Conclusion..."></textarea></label>
          <label>Bài mẫu<textarea id="topicSampleInput" rows="8" placeholder="Rédigez ou collez votre réponse modèle..."></textarea></label>
          <label>Ghi chú từ vựng/cấu trúc hay<textarea id="topicNotesInput" rows="4" placeholder="connecteurs, expressions utiles, vocabulaire..."></textarea></label>
          <menu>
            <button value="cancel" type="button" id="cancelTopicForm">Hủy</button>
            <button value="default" type="submit">Lưu đề</button>
          </menu>
        </form>
      </dialog>
    `);
    bindSpeakingBank();
    renderSpeakingBank();
    resetBankTimer();
  }

  function bindSpeakingBank() {
    document.addEventListener("click", e => {
      if (e.target.closest("#openSpeakingTopicList")) $one("#topicListPanel")?.classList.toggle("show");
      if (e.target.closest("#closeTopicList")) $one("#topicListPanel")?.classList.remove("show");
      if (e.target.closest("#addSpeakingTopic")) openTopicForm();
      const card = e.target.closest("[data-topic-id]");
      if (card && !e.target.closest("button")) {
        activeId = card.dataset.topicId;
        saveBank();
        renderSpeakingBank();
        if (innerWidth < 980) $one("#topicListPanel")?.classList.remove("show");
      }
      const edit = e.target.closest("[data-topic-edit]");
      if (edit) openTopicForm(edit.dataset.topicEdit);
      const del = e.target.closest("[data-topic-delete]");
      if (del) deleteTopic(del.dataset.topicDelete);
      const speak = e.target.closest("[data-speak-topic]");
      if (speak) speakFr(speak.dataset.speakTopic);
      if (e.target.closest("#speakFullSample")) speakFr(activeTopic()?.sample || "");
      if (e.target.closest("#exportSpeakingBank")) exportBank();
      if (e.target.closest("#bankTimerStart")) startBankTimer();
      if (e.target.closest("#bankTimerPause")) pauseBankTimer();
      if (e.target.closest("#bankTimerReset")) resetBankTimer();
      if (e.target.closest("#bankRecordBtn")) toggleBankRecording();
      if (e.target.closest("#deleteBankRecording")) deleteRecording();
      if (e.target.closest("#cancelTopicForm")) $one("#speakingTopicDialog")?.close();
    });
    document.addEventListener("input", e => {
      if (e.target.matches("#topicSearch")) renderTopicList();
    });
    document.addEventListener("change", e => {
      if (e.target.matches("#topicFilter")) renderTopicList();
      if (e.target.matches("#bankTimerSelect")) {
        bankDuration = Number(e.target.value || 180);
        resetBankTimer();
      }
      if (e.target.matches("#importSpeakingBank")) importBank(e.target.files?.[0]);
    });
    $one("#speakingTopicForm")?.addEventListener("submit", e => {
      e.preventDefault();
      saveTopicFromForm();
    });
  }

  function renderSpeakingBank() {
    renderTopicList();
    renderActiveTopic();
    renderRecording();
  }

  function filteredTopics() {
    const q = ($one("#topicSearch")?.value || "").trim().toLowerCase();
    const tag = $one("#topicFilter")?.value || "Tất cả";
    return bank.topics
      .filter(t => tag === "Tất cả" || t.tag === tag)
      .filter(t => !q || [t.title, t.sujet, t.outline, t.sample, t.notes, t.tag].join(" ").toLowerCase().includes(q))
      .sort((a, b) => (b.date || "").localeCompare(a.date || ""));
  }

  function renderTopicList() {
    const list = $one("#topicList");
    if (!list) return;
    const topics = filteredTopics();
    list.innerHTML = topics.length ? topics.map(t => `
      <article class="topic-card ${t.id === activeId ? "active" : ""}" data-topic-id="${escapeHtml(t.id)}">
        <div>
          <b>${escapeHtml(t.title || "Sans titre")}</b>
          <small>${fmtDateVi(t.date)} · ${escapeHtml(t.tag || "Libre")}</small>
        </div>
        <div class="topic-card-actions">
          <button data-topic-edit="${escapeHtml(t.id)}" type="button">Sửa</button>
          <button data-topic-delete="${escapeHtml(t.id)}" type="button">Xóa</button>
        </div>
      </article>
    `).join("") : `<div class="topic-empty">Bạn chưa có đề nói nào. Hãy thêm đề đầu tiên.</div>`;
  }

  function renderActiveTopic() {
    const topic = activeTopic();
    const display = $one("#topicDisplay");
    const sample = $one("#topicSample");
    if (!display || !sample) return;
    if (!topic) {
      display.innerHTML = `<div class="topic-empty topic-empty-large"><h4>📋 Bạn chưa có đề nói nào</h4><p>Hãy bấm “+ Thêm đề mới” để tạo kho luyện Expression orale DELF của riêng bạn.</p><button id="addSpeakingTopic" type="button">+ Thêm đề đầu tiên</button></div>`;
      sample.innerHTML = `<div class="topic-empty">Bài mẫu sẽ hiển thị ở đây sau khi bạn chọn hoặc thêm đề.</div>`;
      return;
    }
    display.innerHTML = `
      <section class="topic-section sujet">
        <div class="topic-section-title"><span>Sujet du jour</span><button data-speak-topic="${escapeHtml(topic.sujet || topic.title)}" type="button">🔊</button></div>
        <h4>${escapeHtml(topic.title)}</h4>
        <p>${nl(topic.sujet || "Chưa nhập nội dung đề.")}</p>
        <small>${fmtDateVi(topic.date)} · ${escapeHtml(topic.tag || "Libre")}</small>
      </section>
      <section class="topic-section">
        <div class="topic-section-title"><span>Dàn ý</span><button data-speak-topic="${escapeHtml(topic.outline)}" type="button">🔊</button></div>
        <p>${nl(topic.outline || "Chưa có dàn ý.")}</p>
      </section>
      <section class="topic-section topic-notes">
        <div class="topic-section-title"><span>Ghi chú từ vựng/cấu trúc hay</span><button data-speak-topic="${escapeHtml(topic.notes)}" type="button">🔊</button></div>
        <p>${nl(topic.notes || "Chưa có ghi chú.")}</p>
      </section>
    `;
    const paragraphs = String(topic.sample || "").split(/\n{2,}/).map(p => p.trim()).filter(Boolean);
    sample.innerHTML = `
      <div class="topic-sample-head">
        <div><span>Bài mẫu</span><h4>Réponse modèle</h4></div>
        <button id="speakFullSample" type="button">🔊 Phát toàn bộ bài mẫu</button>
      </div>
      ${paragraphs.length ? paragraphs.map((p, i) => `<article class="sample-paragraph"><button data-speak-topic="${escapeHtml(p)}" type="button">🔊</button><p><b>${String(i + 1).padStart(2, "0")}</b> ${nl(p)}</p></article>`).join("") : `<div class="topic-empty">Chưa nhập bài mẫu.</div>`}
    `;
  }

  function nl(text) {
    return escapeHtml(text).replace(/\n/g, "<br>");
  }

  function openTopicForm(id = null) {
    editingId = id;
    const topic = id ? bank.topics.find(t => t.id === id) : null;
    $one("#topicDialogTitle").textContent = topic ? "Sửa đề nói" : "Thêm đề nói mới";
    $one("#topicTitleInput").value = topic?.title || "";
    $one("#topicDateInput").value = topic?.date || todayKey();
    $one("#topicTagInput").value = topic?.tag || "Société";
    $one("#topicSujetInput").value = topic?.sujet || "";
    $one("#topicOutlineInput").value = topic?.outline || "";
    $one("#topicSampleInput").value = topic?.sample || "";
    $one("#topicNotesInput").value = topic?.notes || "";
    $one("#speakingTopicDialog").showModal();
  }

  function saveTopicFromForm() {
    const payload = {
      title: $one("#topicTitleInput").value.trim(),
      date: $one("#topicDateInput").value || todayKey(),
      tag: $one("#topicTagInput").value,
      sujet: $one("#topicSujetInput").value.trim(),
      outline: $one("#topicOutlineInput").value.trim(),
      sample: $one("#topicSampleInput").value.trim(),
      notes: $one("#topicNotesInput").value.trim(),
      updatedAt: new Date().toISOString()
    };
    if (!payload.title) return;
    if (editingId) {
      const i = bank.topics.findIndex(t => t.id === editingId);
      if (i >= 0) bank.topics[i] = { ...bank.topics[i], ...payload };
      activeId = editingId;
    } else {
      const topic = { id: uid(), createdAt: new Date().toISOString(), recording: null, ...payload };
      bank.topics.unshift(topic);
      activeId = topic.id;
    }
    saveBank();
    $one("#speakingTopicDialog").close();
    renderSpeakingBank();
  }

  function deleteTopic(id) {
    const topic = bank.topics.find(t => t.id === id);
    if (!topic || !confirm(`Xóa đề “${topic.title}”?`)) return;
    bank.topics = bank.topics.filter(t => t.id !== id);
    if (activeId === id) activeId = bank.topics[0]?.id || null;
    saveBank();
    renderSpeakingBank();
  }

  function exportBank() {
    const blob = new Blob([JSON.stringify(bank, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `kho-de-noi-delf-${todayKey()}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  async function importBank(file) {
    if (!file) return;
    try {
      const data = JSON.parse(await file.text());
      const topics = Array.isArray(data) ? data : data.topics;
      if (!Array.isArray(topics)) throw new Error("Invalid JSON");
      bank.topics = topics.map(t => ({ id: t.id || uid(), createdAt: t.createdAt || new Date().toISOString(), ...t }));
      activeId = data.activeId || bank.topics[0]?.id || null;
      saveBank();
      renderSpeakingBank();
    } catch {
      alert("File JSON không hợp lệ.");
    }
  }

  function setTimerText() {
    const m = Math.floor(bankRemaining / 60);
    const s = bankRemaining % 60;
    const el = $one("#bankTimerText");
    if (el) el.textContent = `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }

  function startBankTimer() {
    if (bankTimer) return;
    bankTimer = setInterval(() => {
      bankRemaining = Math.max(0, bankRemaining - 1);
      setTimerText();
      if (bankRemaining === 0) {
        pauseBankTimer();
        try {
          const ctx = new AudioContext();
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.frequency.value = 660;
          gain.gain.value = 0.05;
          osc.connect(gain).connect(ctx.destination);
          osc.start();
          setTimeout(() => { osc.stop(); ctx.close(); }, 350);
        } catch {}
        alert("Hết giờ");
      }
    }, 1000);
  }

  function pauseBankTimer() {
    clearInterval(bankTimer);
    bankTimer = null;
  }

  function resetBankTimer() {
    pauseBankTimer();
    bankDuration = Number($one("#bankTimerSelect")?.value || bankDuration || 180);
    bankRemaining = bankDuration;
    setTimerText();
  }

  async function toggleBankRecording() {
    const topic = activeTopic();
    if (!topic) return alert("Hãy thêm hoặc chọn một đề trước khi ghi âm.");
    if (bankRecorder?.state === "recording") {
      bankRecorder.stop();
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      bankChunks = [];
      bankRecorder = new MediaRecorder(stream);
      bankRecorder.ondataavailable = e => { if (e.data.size) bankChunks.push(e.data); };
      bankRecorder.onstop = () => {
        const blob = new Blob(bankChunks, { type: "audio/webm" });
        const reader = new FileReader();
        reader.onload = () => {
          topic.recording = { dataUrl: reader.result, createdAt: new Date().toISOString() };
          saveBank();
          renderRecording();
        };
        reader.readAsDataURL(blob);
        stream.getTracks().forEach(track => track.stop());
        $one("#bankRecordBtn").textContent = "🎙️ Ghi âm";
      };
      bankRecorder.start();
      $one("#bankRecordBtn").textContent = "â¹️ Dừng ghi";
    } catch {
      alert("Không truy cập được micro. Hãy cấp quyền microphone cho trình duyệt.");
    }
  }

  function renderRecording() {
    const topic = activeTopic();
    const player = $one("#bankAudioPlayer");
    const del = $one("#deleteBankRecording");
    if (!player || !del) return;
    if (topic?.recording?.dataUrl) {
      player.src = topic.recording.dataUrl;
      player.style.display = "block";
      del.style.display = "inline-flex";
    } else {
      player.removeAttribute("src");
      player.style.display = "none";
      del.style.display = "none";
    }
  }

  function deleteRecording() {
    const topic = activeTopic();
    if (!topic || !topic.recording) return;
    if (!confirm("Xóa bản ghi gần nhất của đề này?")) return;
    topic.recording = null;
    saveBank();
    renderRecording();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", installSpeakingBank);
  else installSpeakingBank();
})();

/* Reading polish v3 · compact actions + controllable grammar layer */
(() => {
  let grammarLayerOn = true;
  const $g = (s, root = document) => root.querySelector(s);
  const escSafe = value => typeof esc === "function" ? esc(value) : String(value ?? "").replace(/[&<>"']/g, m => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[m]));
  const grammarIcon = c => ({temps:"⏱",infinitif:"∞",connecteurs:"⇄",pronoms:"◎",negation:"−",comparatif:"≷",pronominal:"↺",imperatif:"!",expressions:"★",relatives:"🔗",condition:"Si",cause:"→",passif:"P",subjonctif:"S"})[c] || "•";

  const oldAnalyzeGrammarV3 = typeof analyzeGrammar === "function" ? analyzeGrammar : null;
  if (oldAnalyzeGrammarV3) {
    analyzeGrammar = function (text) {
      const result = oldAnalyzeGrammarV3(text);
      const t = String(text || "");
      const extra = [];
      const add = a => extra.push(...a);
      add(grammarFindRegex(t,/\b(?:qui|que|où|dont)\s+[\p{L}'’]+/giu,"relatives","Proposition relative","Mệnh đề quan hệ dùng qui/que/où/dont để bổ nghĩa cho danh từ hoặc nối hai ý.","C’est un sujet qui intéresse les jeunes."));
      add(grammarFindRegex(t,/\bsi\s+[\p{L}'’\s]{2,45},?\s+[\p{L}'’]+/giu,"condition","Hypothèse avec si","Cấu trúc si diễn đạt điều kiện hoặc giả thiết. Ở B1 thường gặp si + présent + futur/présent/impératif.","Si on lit chaque jour, on progresse."));
      add(grammarFindRegex(t,/\b(?:parce que|car|comme|grâce à|à cause de|donc|ainsi|c'est pourquoi|c’est pourquoi)\b[^.!?]*/giu,"cause","Cause / conséquence","Từ nối nguyên nhân-kết quả giúp lập luận rõ ràng trong bài đọc và bài viết DELF.","Il réussit parce qu’il s’entraîne régulièrement."));
      add(grammarFindRegex(t,/\b(?:est|sont|a été|ont été|sera|seront)\s+[\p{L}]+(?:é|ée|és|ées)\s+par\b[^.!?]*/giu,"passif","Voix passive","Bị động: être + participe passé, dùng để nhấn mạnh đối tượng chịu tác động.","Le projet est soutenu par la mairie."));
      add(grammarFindRegex(t,/\b(?:il faut que|bien que|pour que|afin que|avant que|sans que)\s+[\p{L}'’\s]{2,45}/giu,"subjonctif","Subjonctif après expression","Subjonctif xuất hiện sau một số cấu trúc chỉ mục đích, nhượng bộ, yêu cầu hoặc sự cần thiết.","Il faut que chacun fasse un effort."));
      result.items = [...(result.items || []), ...extra]
        .sort((a,b)=>a.start-b.start)
        .filter((x,i,arr)=>!arr.some((y,j)=>j<i&&x.start<y.end&&x.end>y.start));
      result.summary = grammarSummary(t, result.items);
      result.updatedAt = new Date().toISOString();
      return result;
    };
  }

  if (typeof ensureGrammarAnalysis === "function") {
    ensureGrammarAnalysis = function (t) {
      const fresh = analyzeGrammar(t.text);
      const oldCat = t.selectedGrammarCategory || "general";
      t.grammarAnalysis = fresh;
      t.selectedGrammarCategory = oldCat;
      if (typeof saveReadingDb === "function") saveReadingDb();
      return t.grammarAnalysis;
    };
  }

  if (typeof grammarAnalysisHtml === "function") {
    grammarAnalysisHtml = function (t) {
      const a = ensureGrammarAnalysis(t), cat = t.selectedGrammarCategory || "general", items = grammarItemsFor(t);
      const summary = `<div class="grammar-summary grammar-summary-polished"><p><b>Niveau:</b> ${escSafe(a.summary.level)} · <b>Thème:</b> ${escSafe(a.summary.topic)}</p><p><b>Priorité DELF:</b> temps, connecteurs, pronoms, relatives, cause/conséquence, condition.</p></div>`;
      return summary + grammarListHtml(cat === "general" ? items.slice(0,24) : items);
    };
  }

  if (typeof grammarListHtml === "function") {
    grammarListHtml = function (items) {
      return items.length ? `<div class="grammar-analysis-list grammar-analysis-polished">${items.map(x => `
        <article class="grammar-analysis-item grammar-item-${escSafe(x.category)}">
          <span>${grammarIcon(x.category)} ${escSafe(GRAMMAR_LABELS[x.category] || x.category)}</span>
          <b>${escSafe(x.text)}</b>
          <p><strong>${escSafe(x.name)}</strong></p>
          <p>${escSafe(x.meaning)}</p>
          <small>Exemple modèle: ${escSafe(x.newExample)}</small>
        </article>`).join("")}</div>` : `<div class="grammar-empty">Không tìm thấy cấu trúc ngữ pháp rõ ràng trong mục này.</div>`;
    };
  }

  if (typeof renderReaderText === "function") {
    renderReaderText = function () {
      if (!activeReadingId) return;
      const t = readingDb.texts.find(x => x.id === activeReadingId), box = $("#readerText");
      if (!t || !box) return;
      ensureGrammarAnalysis(t);
      box.style.fontSize = readingFont + "px";
      const unknown = $("#unknownHighlight")?.checked;
      const grammar = grammarLayerOn ? grammarItemsFor(t).map(x => ({...x, kind:"grammar"})) : [];
      const vocab = findReadingMatches(t.text).map(x => ({...x, kind:"vocab"}));
      const ranges = [...grammar, ...vocab].sort((a,b)=>(b.end-b.start)-(a.end-a.start));
      const accepted = [];
      for (const r of ranges) if (!accepted.some(a => r.start < a.end && r.end > a.start)) accepted.push(r);
      accepted.sort((a,b)=>a.start-b.start);
      const known = new Map();
      let html = "", pos = 0;
      const orange = s => unknown ? tokenizeReading(s).map(tok => isFrenchWord(tok) && tok.length > 3 ? `<mark class="reading-mark reading-unknown">${esc(tok)}</mark>` : esc(tok)).join("") : esc(s);
      for (const r of accepted) {
        html += orange(t.text.slice(pos, r.start));
        const surface = t.text.slice(r.start, r.end);
        if (r.kind === "grammar") {
          const cls = GRAMMAR_COLORS[r.category] || "grammar-expressions";
          html += `<mark class="grammar-mark ${cls}" data-grammar="${esc(r.name)}" data-grammar-meaning="${esc(r.meaning)}" data-grammar-text="${esc(surface)}" data-grammar-example="${esc(r.newExample)}">${esc(surface)}</mark>`;
        } else {
          known.set(r.key, r.entry);
          html += `<mark class="reading-mark reading-known" data-word="${esc(r.key)}" id="rw-${esc(r.key)}">${esc(surface)}</mark>`;
        }
        pos = r.end;
      }
      html += orange(t.text.slice(pos));
      box.innerHTML = html;
      const words = [...known.entries()].sort((a,b)=>(a[1].mot||a[0]).localeCompare(b[1].mot||b[0]));
      $("#readerWordCount").textContent = words.length + " mots";
      $("#readerWordList").innerHTML = words.map(([k,e]) => `<button data-word-jump="${esc(k)}">${esc(e.mot||k)}</button>`).join("");
      readingDb.stats.words = Math.max(readingDb.stats.words || 0, words.length);
      saveReadingDb();
    };
  }

  document.addEventListener("click", e => {
    const toggle = e.target.closest("#openGrammarPanel");
    if (!toggle) return;
    e.preventDefault();
    e.stopImmediatePropagation();
    grammarLayerOn = !grammarLayerOn;
    const p = $("#grammarPanel"), s = $("#grammarScrim");
    p?.classList.toggle("show", grammarLayerOn);
    p?.setAttribute("aria-hidden", grammarLayerOn ? "false" : "true");
    s?.classList.toggle("show", grammarLayerOn);
    toggle.classList.toggle("active", grammarLayerOn);
    toggle.innerHTML = grammarLayerOn ? "🔍 Tắt analyse" : "🔍 Bật analyse";
    renderReaderText();
  }, true);

  const oldOpenReaderV3 = typeof openReader === "function" ? openReader : null;
  if (oldOpenReaderV3) {
    openReader = function (id) {
      grammarLayerOn = false;
      oldOpenReaderV3(id);
      const toggle = $("#openGrammarPanel");
      if (toggle) {
        toggle.classList.remove("active");
        toggle.innerHTML = "🔍 Bật analyse";
      }
      const p = $("#grammarPanel"), s = $("#grammarScrim");
      p?.classList.remove("show");
      p?.setAttribute("aria-hidden","true");
      s?.classList.remove("show");
      renderReaderText();
    };
  }

  const oldRenderReadingDashboardV3 = typeof renderReadingDashboard === "function" ? renderReadingDashboard : null;
  if (oldRenderReadingDashboardV3) {
    renderReadingDashboard = function () {
      oldRenderReadingDashboardV3();
      const texts = readingDb?.texts || [], total = texts.length, read = texts.filter(t => t.checks?.read).length, words = readingDb?.stats?.words || 0;
      const stats = $g("#readingStats");
      if (stats) {
        stats.innerHTML = [
          ["📚","Tổng số bài trong kho",total],
          ["✅","Số bài đã đọc",read],
          ["🧠","Từ đã học từ Reading",words]
        ].map(x => `<article><span>${x[0]}</span><small>${x[1]}</small><b>${x[2]}</b></article>`).join("") +
        `<button class="reading-stat-action" id="openReadingBank" type="button" title="Kho bài đọc"><span>🗂️</span><b>Kho</b><small>${total} bài</small></button>
         <button class="reading-stat-action add" id="openReadingDialogQuick" type="button" title="Thêm bài đọc"><span>＋</span><b>Thêm</b><small>Bài đọc</small></button>`;
      }
      const count = $g("#readingBankCount");
      if (count) count.textContent = `${total} bài`;
    };
  }

  const oldRenderReadingCardsV3 = typeof renderReadingCards === "function" ? renderReadingCards : null;
  if (oldRenderReadingCardsV3) {
    renderReadingCards = function () {
      oldRenderReadingCardsV3();
      const cards = $g("#readingCards");
      if (cards) cards.innerHTML = "";
    };
  }

  function compactReadingHero() {
    $g(".reading-add-card")?.classList.add("reading-add-card-compact-hidden");
    $g(".reading-exam-hub")?.classList.add("reading-exam-hub-compact-hidden");
  }
  const oldOpenReadingCenterV3 = typeof openReadingCenter === "function" ? openReadingCenter : null;
  if (oldOpenReadingCenterV3) {
    openReadingCenter = function () {
      oldOpenReadingCenterV3();
      compactReadingHero();
      renderReadingDashboard();
      renderReadingCards();
    };
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", () => setTimeout(compactReadingHero, 120));
  else setTimeout(compactReadingHero, 120);
})();
/* Sidebar cleanup · đồng bộ tab kỹ năng qua navigation */
(() => {
  const $q = (s, r = document) => r.querySelector(s);
  const $qa = (s, r = document) => [...r.querySelectorAll(s)];

  function setNavActive(target) {
    const nav = $q(".main-nav");
    if (!nav) return;
    $qa("button,a", nav).forEach(item => item.classList.remove("active"));
    if (target) target.classList.add("active");
  }

  function syncNavIcons() {
    const nav = $q(".main-nav");
    if (!nav) return;
    const dashboard = $q('[data-view="dashboard"]', nav);
    const vocab = $q('[data-tab-jump="vocabulary"]', nav);
    const grammar = $q('a[href*="grammar-practice-center"]', nav);
    const speaking = $q('[data-tab-jump="speaking"]', nav);
    const writing = $q('[data-tab-jump="writing"]', nav);
    const listening = $q('[data-tab-jump="listening"]', nav);
    const reading = $q("#readingNav", nav);
    if (dashboard) dashboard.innerHTML = "🏠 <span>Dashboard</span>";
    if (vocab) vocab.innerHTML = "📗 <span>Từ vựng</span>";
    if (grammar) grammar.innerHTML = "📘 <span>Ngữ pháp</span>";
    if (speaking) speaking.innerHTML = "🎤 <span>Nói</span>";
    if (writing) writing.innerHTML = "âœ️ <span>Viết</span>";
    if (listening) listening.innerHTML = "🎧 <span>Nghe</span>";
    if (reading) reading.innerHTML = "📖 <span>Đọc</span>";
  }

  function moveKpisToSidebar() {
    const sidebar = $q(".sidebar");
    const stats = $q("#statsCards");
    if (!sidebar || !stats || $q("#sidebarStudyStats")) return;
    const words = $q("#wordsStat")?.closest("article");
    const goal = $q("#goalStat")?.closest("article");
    const box = document.createElement("section");
    box.id = "sidebarStudyStats";
    box.className = "sidebar-study-stats";
    box.innerHTML = `<p class="sidebar-study-title">TIẾN ĐỘ HỌC</p>`;
    if (words) box.appendChild(words);
    if (goal) box.appendChild(goal);
    sidebar.appendChild(box);
    $qa("article", stats).forEach(card => card.remove());
    stats.remove();
  }

  function cleanupDashboardUi() {
    const nav = $q(".main-nav");
    if (!nav) return;
    syncNavIcons();
    ["#srsNav", "#statsNav", "#settingsBtn"].forEach(sel => $q(sel)?.remove());
    $q(".tabs")?.remove();
    $q(".streak")?.remove();
    $q(".sidebar blockquote")?.remove();
    $q(".paris-silhouette")?.remove();
    const quickCard = $qa(".bottom-grid > article").find(article => /TH|THỐNG|THá/i.test(article.textContent || ""));
    quickCard?.remove();
    $q(".bottom-grid")?.classList.add("bottom-grid-clean");
    moveKpisToSidebar();
    syncNavIcons();
  }

  document.addEventListener("click", e => {
    const navItem = e.target.closest(".main-nav button,.main-nav a");
    if (!navItem) return;
    if (navItem.dataset.tabJump || navItem.dataset.view || navItem.id === "readingNav") setNavActive(navItem);
  });

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => setTimeout(cleanupDashboardUi, 0));
  } else {
    setTimeout(cleanupDashboardUi, 0);
  }
})();
/* Reading Center cleanup · kho bài đọc hiểu gọn hơn */
(() => {
  const $r = (s, root = document) => root.querySelector(s);
  const $ra = (s, root = document) => [...root.querySelectorAll(s)];

  function safeEsc(value) {
    if (typeof esc === "function") return esc(value);
    return String(value ?? "").replace(/[&<>"']/g, m => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[m]));
  }

  function safeNorm(value) {
    if (typeof norm === "function") return norm(value);
    return String(value || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  }

  function ensureReadingExamHub() {
    const shell = $r(".reading-shell");
    if (!shell || $r("#readingExamHub")) return;
    const addCard = $r(".reading-add-card");
    addCard?.insertAdjacentHTML("afterend", `
      <section class="reading-exam-hub" id="readingExamHub">
        <button class="reading-bank-launcher" id="openReadingBank" type="button">
          <span>🗂️</span>
          <div>
            <b>Kho bài đọc hiểu DELF</b>
            <small>Chọn bài đọc, article, transcription hoặc đề thi để luyện Compréhension écrite.</small>
          </div>
          <i id="readingBankCount">0 bài</i>
        </button>
        <button class="reading-exam-launcher" id="openReadingDialogQuick" type="button">
          <span>🧾</span>
          <div>
            <b>Thêm bài đọc hiểu trong đề thi</b>
            <small>Dán texte, câu hỏi hoặc extrait DELF để lưu vào kho.</small>
          </div>
          <i>Ajouter</i>
        </button>
      </section>
    `);
  }

  function ensureReadingBankPanel() {
    if ($r("#readingBankPanel")) return;
    const view = $r("#readingView");
    view?.insertAdjacentHTML("beforeend", `
      <div class="reading-bank-scrim" id="readingBankScrim"></div>
      <aside class="reading-bank-panel" id="readingBankPanel" aria-hidden="true">
        <header>
          <div>
            <small>COMPRÉHENSION ÉCRITE</small>
            <h3>📚 Danh sách bài đọc</h3>
          </div>
          <button id="closeReadingBank" type="button">×</button>
        </header>
        <div class="reading-bank-filters" id="readingBankFilters"></div>
        <div class="reading-bank-list" id="readingBankList"></div>
      </aside>
    `);
  }

  function openReadingBank() {
    ensureReadingBankPanel();
    renderReadingCards();
    $r("#readingBankPanel")?.classList.add("show");
    $r("#readingBankPanel")?.setAttribute("aria-hidden", "false");
    $r("#readingBankScrim")?.classList.add("show");
  }

  function closeReadingBank() {
    $r("#readingBankPanel")?.classList.remove("show");
    $r("#readingBankPanel")?.setAttribute("aria-hidden", "true");
    $r("#readingBankScrim")?.classList.remove("show");
  }

  function currentReadingList() {
    const q = safeNorm($r("#readingSearch")?.value || "");
    const theme = $r("#readingThemeFilter")?.value || "";
    const level = $r("#readingLevelFilter")?.value || "";
    const date = $r("#readingDateFilter")?.value || "";
    return (readingDb?.texts || []).filter(t =>
      (!q || safeNorm(t.title).includes(q) || safeNorm(t.text).includes(q)) &&
      (!theme || t.theme === theme) &&
      (!level || t.level === level) &&
      (!date || t.date === date)
    );
  }

  function metaPill(t) {
    return `${safeEsc(t.theme || "Libre")} · ${safeEsc(t.level || "B1")} · ${typeof fmtDate === "function" ? fmtDate(new Date(t.date + "T00:00:00")) : safeEsc(t.date)}`;
  }

  const oldOpenReadingCenter = typeof openReadingCenter === "function" ? openReadingCenter : null;
  if (oldOpenReadingCenter) {
    openReadingCenter = function () {
      oldOpenReadingCenter();
      ensureReadingExamHub();
      ensureReadingBankPanel();
      renderReadingDashboard();
      renderReadingCards();
    };
  }

  if (typeof renderReadingDashboard === "function") {
    renderReadingDashboard = function () {
      const texts = readingDb?.texts || [];
      const total = texts.length;
      const read = texts.filter(t => t.checks?.read).length;
      const words = readingDb?.stats?.words || 0;
      const stats = $r("#readingStats");
      if (stats) {
        stats.innerHTML = [
          ["📚", "Tổng số bài trong kho", total],
          ["✅", "Số bài đã đọc", read],
          ["🧠", "Từ đã học từ Reading", words]
        ].map(x => `<article><span>${x[0]}</span><small>${x[1]}</small><b>${x[2]}</b></article>`).join("");
      }
      ensureReadingExamHub();
      const count = $r("#readingBankCount");
      if (count) count.textContent = `${total} bài`;
    };
  }

  if (typeof renderReadingCards === "function") {
    renderReadingCards = function () {
      if (typeof populateReadingThemes === "function") populateReadingThemes();
      ensureReadingExamHub();
      ensureReadingBankPanel();
      const cards = $r("#readingCards");
      const list = currentReadingList();
      if (cards) {
        cards.innerHTML = `
          <button class="reading-library-icon" data-open-reading-bank="1" type="button">
            <span>📚</span>
            <b>Kho bài đọc hiểu</b>
            <small>${(readingDb?.texts || []).length} bài đã lưu · bấm để chọn bài</small>
          </button>
        `;
      }
      const filters = $r("#readingBankFilters");
      const originalFilters = $r(".reading-filters");
      if (filters && originalFilters && !filters.dataset.moved) {
        filters.append(...$ra("input,select", originalFilters));
        originalFilters.remove();
        filters.dataset.moved = "1";
      }
      const bankList = $r("#readingBankList");
      if (bankList) {
        bankList.innerHTML = list.length ? list.map(t => `
          <article class="reading-bank-item ${t.id === activeReadingId ? "active" : ""}" data-read-id="${safeEsc(t.id)}">
            <span>📖</span>
            <div>
              <b>${safeEsc(t.title)}</b>
              <small>${metaPill(t)}</small>
              <em>${t.minutes || 1} min · ${t.words || 0} mots · Progression ${typeof readingProgress === "function" ? readingProgress(t) : 0}%</em>
            </div>
            <button type="button">Lire</button>
          </article>
        `).join("") : `<div class="reading-empty">Bạn chưa có bài đọc nào. Hãy thêm bài đầu tiên.</div>`;
      }
      const count = $r("#readingBankCount");
      if (count) count.textContent = `${(readingDb?.texts || []).length} bài`;
    };
  }

  document.addEventListener("click", e => {
    if (e.target.closest("#openReadingBank") || e.target.closest("[data-open-reading-bank]")) openReadingBank();
    if (e.target.closest("#closeReadingBank") || e.target.closest("#readingBankScrim")) closeReadingBank();
    if (e.target.closest("#openReadingDialogQuick")) {
      if (typeof openReadingDialog === "function") openReadingDialog();
    }
    if (e.target.closest(".reading-bank-item[data-read-id]")) closeReadingBank();
  });

  ["readingSearch", "readingThemeFilter", "readingLevelFilter", "readingDateFilter"].forEach(id => {
    document.addEventListener("input", e => { if (e.target.id === id) renderReadingCards(); });
    document.addEventListener("change", e => { if (e.target.id === id) renderReadingCards(); });
  });
})();
/* Encoding hotfix · sửa chữ Việt/emoji bị mojibake trên Dashboard */
(() => {
  function fixMainNavText() {
    const nav = document.querySelector(".main-nav");
    if (!nav) return;
    const items = [
      ['[data-view="dashboard"]', "🏠", "Dashboard"],
      ['[data-tab-jump="vocabulary"]', "📗", "Từ vựng"],
      ['a[href*="grammar-practice-center"]', "📘", "Ngữ pháp"],
      ['[data-tab-jump="speaking"]', "🎤", "Nói"],
      ['[data-tab-jump="writing"]', "✍️", "Viết"],
      ['[data-tab-jump="listening"]', "🎧", "Nghe"],
      ["#readingNav", "📖", "Đọc"]
    ];
    items.forEach(([selector, icon, label]) => {
      const el = nav.querySelector(selector);
      if (el) el.innerHTML = `${icon} <span>${label}</span>`;
    });
  }

  renderDates = function () {
    const now = new Date();
    const sel = schedule.find(x => x.key === activeDate) || schedule[0];
    $("#weekday").textContent = now.toLocaleDateString("vi-VN", { weekday: "long" }).toUpperCase();
    $("#dayNumber").textContent = String(now.getDate()).padStart(2, "0");
    $("#monthYear").textContent = now.toLocaleDateString("fr-FR", { month: "long", year: "numeric" }).toUpperCase();
    $("#heroDate").textContent = fmtDate(sel.date);
    $("#weekDay").textContent = `TUẦN ${sel.week} – NGÀY ${sel.day}`;
    $("#datePicker").innerHTML = schedule.map(d => `<button data-date="${d.key}" class="${d.key === activeDate ? "active" : ""} ${complete(d.key) ? "complete" : ""}"><b>${String(d.date.getDate()).padStart(2, "0")}/${String(d.date.getMonth() + 1).padStart(2, "0")}</b><small>T${d.week}·N${d.day}</small></button>`).join("");
    $$("[data-date]").forEach(b => b.onclick = () => { activeDate = b.dataset.date; renderAll(); });
    if (typeof renderMonthCalendar === "function") renderMonthCalendar();
  };

  renderWords = function () {
    const ws = words();
    const total = ws.length * 2;
    $("#wordDaySummary").textContent = `${ws.length} từ mới · ${total} câu mỗi dạng`;
    const heroWordCount = $("#heroWordCount"); if (heroWordCount) heroWordCount.textContent = ws.length;
    $("#vocabGrid").innerHTML = ws.length ? ws.map((w, i) => `<article class="word-card tone-${i % 6}"><button class="word-speak" data-speak="${i}" aria-label="Phát âm">🔊</button><h4>${esc(w.word)}</h4><p class="word-meaning">${esc(w.meaning || "")}</p>${w.example ? `<em>Exemple: ${esc(w.example)}</em>` : ""}<button class="word-detail" data-vocab-detail="${i}" aria-label="Xem toàn bộ nội dung">i</button></article>`).join("") : `<div class="vocab-empty">Chưa có từ vựng ở cột J cho ngày ${fmtDate(new Date(activeDate + "T00:00:00"))}.</div>`;
    $$("[data-speak]").forEach(b => b.onclick = () => speak(ws[+b.dataset.speak].word));
    $$("[data-vocab-detail]").forEach(b => b.onclick = () => showVocabDetail(+b.dataset.vocabDetail));
    const practiceLabels = {
      qcm: ["ABCD", "QCM", "Chọn đáp án đúng"],
      matching: ["↔", "Ghép nghĩa", "Nối từ với định nghĩa"],
      typed: ["⌨", "Viết từ", "Gõ lại từ tiếng Pháp"],
      context: ["—", "Ngữ cảnh", "Điền từ vào câu"]
    };
    $$("[data-mode]").forEach(b => {
      const data = practiceLabels[b.dataset.mode];
      if (data) b.innerHTML = `<i>${data[0]}</i><b>${data[1]}</b><small>${data[2]} <strong>· ${total} câu</strong></small>`;
      b.onclick = () => practice(b.dataset.mode);
    });
    $("#vocabPractice").innerHTML = "";
    currentPractice = null;
  };

  renderPlan = function () {
    const d = dayState(activeDate);
    const labels = [
      ["📗", `Từ vựng (${words().length} từ)`],
      ["📘", "Ngữ pháp"],
      ["🎤", "Nói"],
      ["✍️", "Viết"],
      ["🎧", "Nghe"]
    ];
    $("#dailyPlan").innerHTML = labels.map(([icon, label], i) => `<div class="plan-row ${d.completed[i] ? "done" : ""}"><span>${icon}</span><b>${label}</b><button data-plan="${i}">${d.completed[i] ? "✓" : ""}</button></div>`).join("");
    $$("[data-plan]").forEach(b => b.onclick = () => { d.completed[+b.dataset.plan] = !d.completed[+b.dataset.plan]; save(); renderAll(); });
  };

  renderKpis = function () {
    const doneDays = schedule.filter(x => complete(x.key));
    const learned = doneDays.reduce((n, x) => n + (state.vocabByDate[x.key] || []).length, 0);
    const questions = state.attempts.reduce((n, a) => n + a.total, 0);
    const scores = state.attempts.map(a => a.score);
    const avg = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : null;
    const rank = avg == null ? "—" : avg >= 90 ? "A+" : avg >= 80 ? "A" : avg >= 70 ? "B+" : avg >= 60 ? "B" : "C";
    const todayDone = dayState(activeDate).completed.filter(Boolean).length;
    const pct = Math.round(doneDays.length / schedule.length * 100);
    const streak = streakCount();
    $("#wordsStat").textContent = learned;
    const q = $("#questionsStat"); if (q) q.textContent = questions.toLocaleString("vi-VN");
    const score = $("#scoreStat"); if (score) score.textContent = avg == null ? "—" : avg + "%";
    const rankEl = $("#rankStat"); if (rankEl) rankEl.textContent = rank;
    const rl = $("#rankLabel"); if (rl) rl.textContent = avg == null ? "Bắt đầu học nhé!" : avg >= 80 ? "Très bien !" : avg >= 60 ? "Bien !" : "Continuez !";
    $("#goalStat").textContent = todayDone + "/5";
    $("#phaseDone").textContent = `${doneDays.length} / ${schedule.length} ngày đã hoàn thành`;
    $("#phasePercent").textContent = pct + "%";
    $("#phaseBar").style.width = pct + "%";
    const streakCountEl = $("#streakCount"); if (streakCountEl) streakCountEl.textContent = streak;
    const streakQuick = $("#streakQuick"); if (streakQuick) streakQuick.textContent = streak;
    const correctQuick = $("#correctQuick"); if (correctQuick) correctQuick.textContent = state.attempts.at(-1)?.correct || 0;
    const timeQuick = $("#timeQuick"); if (timeQuick) timeQuick.textContent = studyTime(state.studySeconds);
  };

  const oldRenderAllForEncoding = renderAll;
  renderAll = function () {
    oldRenderAllForEncoding();
    fixMainNavText();
  };

  document.addEventListener("DOMContentLoaded", () => setTimeout(() => {
    fixMainNavText();
    renderAll();
  }, 50));
})();
/* Reading study plan · lịch bài đọc hiểu tháng 7 */
(() => {
  const PLAN = {
    "2026-07-01": "Partie I – Activité 2 (Itinéraire)",
    "2026-07-02": "Partie I – Activité 3 (Activités sportives)",
    "2026-07-03": "Partie I – Activité 4 (Choisir un menu)",
    "2026-07-04": "Partie I – Activité 5 (Programme TV)",
    "2026-07-05": "Partie I – Activité 6 (Souvenirs de Bruxelles)",
    "2026-07-06": "Partie I – Activité 7 (Romans : titre – résumé – extrait)",
    "2026-07-07": "Partie I – Activité 8 (Choisir un chien)",
    "2026-07-08": "Partie I – Activité 9 (Choisir un vin) + Ôn lại toàn bộ Partie I",
    "2026-07-09": "Partie II – Activité 1 (Randonnée)",
    "2026-07-10": "Partie II – Activité 2 (Futuroscope)",
    "2026-07-11": "Partie II – Activité 3 (SMS Orange)",
    "2026-07-12": "Partie II – Activité 4 (Recettes de pâtisserie)",
    "2026-07-13": "Partie II – Activité 5 (Visiter des châteaux)",
    "2026-07-14": "Partie II – Activité 6 (Recettes avec des œufs)",
    "2026-07-15": "Partie II – Activité 7",
    "2026-07-16": "Partie II – Activité 8",
    "2026-07-17": "Partie II – Activité 9",
    "2026-07-18": "Partie II – Activité 10 + Ôn Partie II",
    "2026-07-19": "Partie III – Activité 1",
    "2026-07-20": "Partie III – Activité 2",
    "2026-07-21": "Partie III – Activité 3",
    "2026-07-22": "Partie III – Activité 4",
    "2026-07-23": "Partie III – Activité 5",
    "2026-07-24": "Partie III – Activité 6",
    "2026-07-25": "Partie III – Activité 7 + Ôn Partie III",
    "2026-07-26": "Partie IV – Activité 1 + 2",
    "2026-07-27": "Partie IV – Activité 3 + 4",
    "2026-07-28": "Partie IV – Activité 5 + 6 + Ôn Partie IV",
    "2026-07-29": "Partie V – Activité 1 → 4",
    "2026-07-30": "Partie V – Activité 5 → 8",
    "2026-07-31": "Partie V – Activité 9 → 12 + làm lại 1 đề hoàn chỉnh trong điều kiện bấm giờ"
  };
  const $p = (s, r = document) => r.querySelector(s);
  const planKeys = Object.keys(PLAN);
  let selectedReadingPlanDate = planKeys.includes(activeDate) ? activeDate : planKeys[0];
  const READING_PLAN_DONE_KEY = "delfReadingPlanDone_v1";
  let readingPlanDone = (() => {
    try { return JSON.parse(localStorage.getItem(READING_PLAN_DONE_KEY)) || {}; }
    catch { return {}; }
  })();

  function saveReadingPlanDone() {
    localStorage.setItem(READING_PLAN_DONE_KEY, JSON.stringify(readingPlanDone));
  }

  function escapePlan(value) {
    return String(value ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  }

  function displayDate(key) {
    const d = new Date(key + "T00:00:00");
    return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`;
  }

  function partName(text) {
    return (text.match(/Partie\s+[IVX]+/i) || ["Ôn tập"])[0];
  }

  function ensureReadingStudyPlan() {
    const hub = $p("#readingExamHub");
    if (!hub || $p("#readingStudyPlan")) return;
    hub.insertAdjacentHTML("afterend", `
      <section class="reading-study-plan" id="readingStudyPlan">
        <div class="reading-plan-today" id="readingPlanToday"></div>
        <details class="reading-plan-list">
          <summary>📅 Lịch bài đọc hiểu tháng 7</summary>
          <div id="readingPlanList"></div>
        </details>
      </section>
    `);
  }

  function renderReadingStudyPlan() {
    ensureReadingStudyPlan();
    const todayKey = PLAN[activeDate] ? activeDate : selectedReadingPlanDate;
    const todayText = PLAN[todayKey];
    const today = $p("#readingPlanToday");
    if (today) {
      today.innerHTML = `
        <div>
          <span>📌 Bài cần học</span>
          <h3>${displayDate(todayKey)} · ${escapePlan(partName(todayText))}</h3>
          <p>${escapePlan(todayText)}</p>
        </div>
        <button id="openReadingBankFromPlan" type="button">Mở kho bài đọc</button>
      `;
    }
    const list = $p("#readingPlanList");
    if (list) {
      list.innerHTML = planKeys.map(key => {
        const text = PLAN[key];
        const active = key === todayKey ? "active" : "";
        const done = readingPlanDone[key] ? "done" : "";
        return `<button class="${active} ${done}" data-reading-plan-date="${key}" type="button"><input data-reading-plan-check="${key}" type="checkbox" ${readingPlanDone[key] ? "checked" : ""} aria-label="Đánh dấu đã làm ${displayDate(key)}"><b>${displayDate(key)}</b><span>${escapePlan(text)}</span><small>${escapePlan(partName(text))}</small></button>`;
      }).join("");
    }
  }

  const oldOpenReadingCenterForPlan = typeof openReadingCenter === "function" ? openReadingCenter : null;
  if (oldOpenReadingCenterForPlan) {
    openReadingCenter = function () {
      oldOpenReadingCenterForPlan();
      selectedReadingPlanDate = PLAN[activeDate] ? activeDate : selectedReadingPlanDate;
      renderReadingStudyPlan();
    };
  }

  const oldRenderReadingDashboardForPlan = typeof renderReadingDashboard === "function" ? renderReadingDashboard : null;
  if (oldRenderReadingDashboardForPlan) {
    renderReadingDashboard = function () {
      oldRenderReadingDashboardForPlan();
      renderReadingStudyPlan();
    };
  }

  document.addEventListener("click", e => {
    if (e.target.closest("[data-reading-plan-check]")) return;
    const planBtn = e.target.closest("[data-reading-plan-date]");
    if (planBtn) {
      selectedReadingPlanDate = planBtn.dataset.readingPlanDate;
      renderReadingStudyPlan();
    }
    if (e.target.closest("#openReadingBankFromPlan")) {
      const open = document.querySelector("#openReadingBank") || document.querySelector("[data-open-reading-bank]");
      open?.click();
    }
  });
  document.addEventListener("change", e => {
    const check = e.target.closest("[data-reading-plan-check]");
    if (!check) return;
    readingPlanDone[check.dataset.readingPlanCheck] = check.checked;
    saveReadingPlanDone();
    renderReadingStudyPlan();
  });
})();
/* Speaking production plan · lộ trình Production Orale tháng 7 */
(() => {
  const SPEAKING_PLAN = {
    "2026-07-01": { section: "Entretien dirigé", content: "Activité 2 (Savoir engager l'entretien)" },
    "2026-07-02": { section: "Entretien dirigé", content: "Activité 3 (Projet de blog)" },
    "2026-07-03": { section: "Entretien dirigé", content: "Activité 4 (Les travaux manuels)" },
    "2026-07-04": { section: "Entretien dirigé", content: "Activité 5 (Les loisirs et les passions)" },
    "2026-07-05": { section: "Entretien dirigé", content: "Activité 6 (Pourquoi apprendre le français ?)" },
    "2026-07-06": { section: "Entretien dirigé", content: "Activité 7 (Emprunter des livres)" },
    "2026-07-07": { section: "Entretien dirigé", content: "Activité 8 (Projet musical)" },
    "2026-07-08": { section: "Entretien dirigé", content: "Activité 9 (Internet dans la vie quotidienne)" },
    "2026-07-09": { section: "Entretien dirigé", content: "Activité 10 (Un mot français marquant)" },
    "2026-07-10": { section: "Entretien dirigé", content: "Activité 11 (Cuisine préférée)" },
    "2026-07-11": { section: "Entretien dirigé", content: "Activité 12 (La gentillesse)" },
    "2026-07-12": { section: "Entretien dirigé", content: "Activité 13 (Voyages à l'étranger)" },
    "2026-07-13": { section: "Entretien dirigé", content: "Activité 14 (Écrire ses mémoires)" },
    "2026-07-14": { section: "Entretien dirigé", content: "Activité 15 (La langue maternelle)" },
    "2026-07-15": { section: "Entretien dirigé", content: "Activité 16 (Présentation d'un métier/rêve) + révision Entretien dirigé" },
    "2026-07-16": { section: "Exercice en interaction", content: "Activités 2–4" },
    "2026-07-17": { section: "Exercice en interaction", content: "Activités 5–6" },
    "2026-07-18": { section: "Exercice en interaction", content: "Activités 7–8" },
    "2026-07-19": { section: "Exercice en interaction", content: "Activités 9–10" },
    "2026-07-20": { section: "Exercice en interaction", content: "Activités 11–12" },
    "2026-07-21": { section: "Exercice en interaction", content: "Activités 13–14" },
    "2026-07-22": { section: "Exercice en interaction", content: "Activités 15–17" },
    "2026-07-23": { section: "Exercice en interaction", content: "Simulation complète (Interaction)" },
    "2026-07-24": { section: "Expression d'un point de vue", content: "Activités 2–4" },
    "2026-07-25": { section: "Expression d'un point de vue", content: "Activités 5–6" },
    "2026-07-26": { section: "Expression d'un point de vue", content: "Activités 7–8" },
    "2026-07-27": { section: "Expression d'un point de vue", content: "Activités 9–10" },
    "2026-07-28": { section: "Expression d'un point de vue", content: "Activités 11–12" },
    "2026-07-29": { section: "Expression d'un point de vue", content: "Activités 13–14" },
    "2026-07-30": { section: "Expression d'un point de vue", content: "Activités 15–17" },
    "2026-07-31": { section: "Simulation finale", content: "Simulation complète Production Orale (3 phần)" }
  };
  const PROCESS = [
    ["1", "Chuẩn bị", "5 phút", "Đọc chủ đề · Gạch 5–8 từ khóa · Lập dàn ý nhanh"],
    ["2", "Nói lần 1", "3 phút", "Không nhìn bài · Ghi âm"],
    ["3", "Nghe lại", "10 phút", "Đánh dấu lỗi phát âm, lỗi ngữ pháp, từ còn thiếu, chỗ ngập ngừng"],
    ["4", "Sửa bài", "10 phút", "Viết lại 10–15 câu tốt hơn · Bổ sung 5 từ/cụm từ B1"],
    ["5", "Nói lần 2", "3 phút", "Ghi âm lại · So sánh với lần đầu"],
    ["6", "Ôn SRS", "10 phút", "Từ mới · Connecteurs · Expressions utiles"]
  ];
  const GOALS = [
    "Hoàn thành 16 chủ đề Entretien dirigé.",
    "Hoàn thành 16 tình huống Interaction.",
    "Hoàn thành 16 bài Expression d'un point de vue.",
    "Có 31 bản ghi âm để tự đánh giá tiến bộ.",
    "Nói trôi chảy 2–3 phút về các chủ đề quen thuộc mà không cần đọc kịch bản.",
    "Xây dựng khoảng 20–25 mẫu mở bài, 30–40 connecteurs và 20 mẫu kết luận để tái sử dụng trong phòng thi."
  ];
  const $sp = (s, r = document) => r.querySelector(s);
  const keys = Object.keys(SPEAKING_PLAN);
  let selectedSpeakingPlanDate = keys.includes(activeDate) ? activeDate : keys[0];
  const SPEAKING_PLAN_DONE_KEY = "delfSpeakingPlanDone_v1";
  let speakingPlanDone = (() => {
    try { return JSON.parse(localStorage.getItem(SPEAKING_PLAN_DONE_KEY)) || {}; }
    catch { return {}; }
  })();

  function saveSpeakingPlanDone() {
    localStorage.setItem(SPEAKING_PLAN_DONE_KEY, JSON.stringify(speakingPlanDone));
  }

  function fmtPlanDate(key) {
    const d = new Date(key + "T00:00:00");
    return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`;
  }

  function escPlan(value) {
    return String(value ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  }

  function ensureSpeakingPlan() {
    const speaking = $sp("#speaking");
    if (!speaking || $sp("#speakingProductionPlan")) return;
    const bank = $sp("#speakingTopicBank");
    const html = `
      <section class="speaking-production-plan" id="speakingProductionPlan">
        <header>
          <div>
            <span>PRODUCTION ORALE · 01/07 – 31/07</span>
            <h3>Lộ trình Production Orale</h3>
            <p>Luyện đủ 3 phần: Entretien dirigé, Interaction, Expression d'un point de vue.</p>
          </div>
          <button id="openSpeakingPlanList" type="button">📅 Xem lịch tháng</button>
        </header>
        <div class="speaking-plan-today" id="speakingPlanToday"></div>
        <div class="speaking-plan-panels">
          <details class="speaking-plan-list" id="speakingPlanListWrap">
            <summary>📋 Danh sách bài nói tháng 7</summary>
            <div id="speakingPlanList"></div>
          </details>
          <details class="speaking-process" open>
            <summary>🧭 Quy trình luyện mỗi buổi · 45 phút</summary>
            <div>${PROCESS.map(x => `<article><b>${x[0]}</b><div><strong>${escPlan(x[1])}</strong><small>${escPlan(x[2])}</small><p>${escPlan(x[3])}</p></div></article>`).join("")}</div>
          </details>
          <details class="speaking-month-goals">
            <summary>🎯 Mục tiêu cuối tháng 7</summary>
            <ul>${GOALS.map(g => `<li>${escPlan(g)}</li>`).join("")}</ul>
          </details>
        </div>
      </section>
    `;
    if (bank) bank.insertAdjacentHTML("beforebegin", html);
    else speaking.insertAdjacentHTML("beforeend", html);
  }

  function renderSpeakingPlan() {
    ensureSpeakingPlan();
    const key = SPEAKING_PLAN[activeDate] ? activeDate : selectedSpeakingPlanDate;
    const item = SPEAKING_PLAN[key];
    const today = $sp("#speakingPlanToday");
    if (today && item) {
      today.innerHTML = `
        <div>
          <span>📌 Bài nói cần luyện</span>
          <h4>${fmtPlanDate(key)} · ${escPlan(item.section)}</h4>
          <p>${escPlan(item.content)}</p>
        </div>
        <button id="startSpeakingPlanPractice" type="button">🎙️ Bắt đầu luyện</button>
      `;
    }
    const list = $sp("#speakingPlanList");
    if (list) {
      list.innerHTML = keys.map(k => {
        const v = SPEAKING_PLAN[k];
        const done = speakingPlanDone[k] ? "done" : "";
        return `<button class="${k === key ? "active" : ""} ${done}" data-speaking-plan-date="${k}" type="button"><input data-speaking-plan-check="${k}" type="checkbox" ${speakingPlanDone[k] ? "checked" : ""} aria-label="Đánh dấu đã luyện ${fmtPlanDate(k)}"><b>${fmtPlanDate(k)}</b><span>${escPlan(v.content)}</span><small>${escPlan(v.section)}</small></button>`;
      }).join("");
    }
  }

  const oldInstallSpeakingBankForPlan = typeof installSpeakingBank === "function" ? installSpeakingBank : null;
  if (oldInstallSpeakingBankForPlan) {
    installSpeakingBank = function () {
      oldInstallSpeakingBankForPlan();
      renderSpeakingPlan();
    };
  }

  const oldOpenTabForSpeakingPlan = typeof openTab === "function" ? openTab : null;
  if (oldOpenTabForSpeakingPlan) {
    openTab = function (id) {
      oldOpenTabForSpeakingPlan(id);
      if (id === "speaking") {
        selectedSpeakingPlanDate = SPEAKING_PLAN[activeDate] ? activeDate : selectedSpeakingPlanDate;
        renderSpeakingPlan();
      }
    };
  }

  document.addEventListener("click", e => {
    if (e.target.closest("[data-speaking-plan-check]")) return;
    const btn = e.target.closest("[data-speaking-plan-date]");
    if (btn) {
      selectedSpeakingPlanDate = btn.dataset.speakingPlanDate;
      renderSpeakingPlan();
    }
    if (e.target.closest("#openSpeakingPlanList")) {
      const details = $sp("#speakingPlanListWrap");
      if (details) details.open = true;
      details?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
    if (e.target.closest("#startSpeakingPlanPractice")) {
      const record = $sp("#bankRecordBtn") || $sp("#recordBtn");
      record?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  });
  document.addEventListener("change", e => {
    const check = e.target.closest("[data-speaking-plan-check]");
    if (!check) return;
    speakingPlanDone[check.dataset.speakingPlanCheck] = check.checked;
    saveSpeakingPlanDone();
    renderSpeakingPlan();
  });

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", () => setTimeout(renderSpeakingPlan, 80));
  else setTimeout(renderSpeakingPlan, 80);
})();
/* Writing production plan · lộ trình Production Écrite tháng 7 */
(() => {
  const WRITING_PLAN = {
    "2026-07-01": { section: "Tuần 1 – Courrier", content: "Activités 1–2 (Cấu trúc thư + công thức lịch sự)" },
    "2026-07-02": { section: "Tuần 1 – Courrier", content: "Activité 3" },
    "2026-07-03": { section: "Tuần 1 – Courrier", content: "Activité 4" },
    "2026-07-04": { section: "Tuần 1 – Courrier", content: "Activité 5" },
    "2026-07-05": { section: "Tuần 1 – Courrier", content: "Activité 6" },
    "2026-07-06": { section: "Tuần 1 – Courrier", content: "Activité 8" },
    "2026-07-07": { section: "Tuần 1 – Courrier", content: "Activités 9–12 + Révision Courrier" },
    "2026-07-08": { section: "Tuần 2 – Compte rendu", content: "Activités 1–2" },
    "2026-07-09": { section: "Tuần 2 – Compte rendu", content: "Activité 3" },
    "2026-07-10": { section: "Tuần 2 – Compte rendu", content: "Activité 4" },
    "2026-07-11": { section: "Tuần 2 – Compte rendu", content: "Activité 5" },
    "2026-07-12": { section: "Tuần 2 – Compte rendu", content: "Activité 6" },
    "2026-07-13": { section: "Tuần 2 – Compte rendu", content: "Activité 7" },
    "2026-07-14": { section: "Tuần 2 – Compte rendu", content: "Activités 8–11 + Révision" },
    "2026-07-15": { section: "Tuần 3 – Article", content: "Activités 2–3" },
    "2026-07-16": { section: "Tuần 3 – Article", content: "Activité 4" },
    "2026-07-17": { section: "Tuần 3 – Article", content: "Activité 5" },
    "2026-07-18": { section: "Tuần 3 – Article", content: "Activité 6" },
    "2026-07-19": { section: "Tuần 3 – Article", content: "Activité 7" },
    "2026-07-20": { section: "Tuần 3 – Article", content: "Activité 8" },
    "2026-07-21": { section: "Tuần 3 – Article", content: "Activités 9–12 + Révision" },
    "2026-07-22": { section: "Tuần 4 – Essai", content: "Activités 1–2 (Méthode de l'essai + argumentation)" },
    "2026-07-23": { section: "Tuần 4 – Essai", content: "Activité 3" },
    "2026-07-24": { section: "Tuần 4 – Essai", content: "Activité 4" },
    "2026-07-25": { section: "Tuần 4 – Essai", content: "Activité 5" },
    "2026-07-26": { section: "Tuần 4 – Essai", content: "Activité 6" },
    "2026-07-27": { section: "Tuần 4 – Essai", content: "Activité 7" },
    "2026-07-28": { section: "Tuần 4 – Essai", content: "Activité 8" },
    "2026-07-29": { section: "Tuần 4 – Essai", content: "Activité 9" },
    "2026-07-30": { section: "Tuần 4 – Essai", content: "Activités 10–13" },
    "2026-07-31": { section: "Simulation finale", content: "Simulation complète Production Écrite (45 phút)" }
  };
  const PROCESS = [
    ["1", "Phân tích đề", "10 phút", "Gạch chân từ khóa · Xác định loại văn bản · Người nhận · Mục đích · Thì cần dùng"],
    ["2", "Lập dàn ý", "10 phút", "Introduction · Développement · Conclusion"],
    ["3", "Viết bản nháp", "35 phút", "160–180 từ · Không tra từ điển"],
    ["4", "Tự sửa", "20 phút", "✔ Consigne · ✔ Connecteurs · ✔ Temps · ✔ Accord · ✔ Orthographe · ✔ Nombre de mots"],
    ["5", "Chép bản cuối", "15 phút", "Viết sạch như bài thi thật"]
  ];
  const GOALS = [
    "Hoàn thành 12 Courriers.",
    "Hoàn thành 11 Comptes rendus.",
    "Hoàn thành 11 Articles.",
    "Hoàn thành 13 Essais.",
    "Viết khoảng 47 bài theo các dạng trong sách.",
    "Làm 1 bài mô phỏng DELF B1 hoàn chỉnh (45 phút).",
    "Xây dựng ngân hàng gồm khoảng 40–50 connecteurs, 20 mẫu mở bài, 20 mẫu kết bài và các công thức lịch sự dùng cho thư."
  ];
  const NOTE = "Hoạt động 7 chỉ là tweet 140 ký tự, không thuộc dạng viết chính của DELF B1 nên có thể làm thêm khi rảnh.";
  const $wp = (s, r = document) => r.querySelector(s);
  const keys = Object.keys(WRITING_PLAN);
  let selectedWritingPlanDate = keys.includes(activeDate) ? activeDate : keys[0];
  const WRITING_PLAN_DONE_KEY = "delfWritingPlanDone_v1";
  let writingPlanDone = (() => {
    try { return JSON.parse(localStorage.getItem(WRITING_PLAN_DONE_KEY)) || {}; }
    catch { return {}; }
  })();

  function saveWritingPlanDone() {
    localStorage.setItem(WRITING_PLAN_DONE_KEY, JSON.stringify(writingPlanDone));
  }

  function fmtPlanDate(key) {
    const d = new Date(key + "T00:00:00");
    return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`;
  }
  function escPlan(value) {
    return String(value ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  }

  function ensureWritingPlan() {
    const writing = $wp("#writing");
    if (!writing || $wp("#writingProductionPlan")) return;
    writing.insertAdjacentHTML("afterbegin", `
      <section class="writing-production-plan" id="writingProductionPlan">
        <header>
          <div>
            <span>PRODUCTION ÉCRITE · 01/07 – 31/07</span>
            <h3>Lộ trình Production Écrite</h3>
            <p>Luyện đủ 4 dạng: Courrier, Compte rendu, Article và Essai.</p>
          </div>
          <button id="openWritingPlanList" type="button">📅 Xem lịch tháng</button>
        </header>
        <div class="writing-plan-today" id="writingPlanToday"></div>
        <div class="writing-plan-panels">
          <details class="writing-plan-list" id="writingPlanListWrap">
            <summary>📋 Danh sách bài viết tháng 7</summary>
            <div id="writingPlanList"></div>
            <p class="writing-plan-note">💡 ${escPlan(NOTE)}</p>
          </details>
          <details class="writing-process" open>
            <summary>🧭 Quy trình luyện mỗi buổi · 90 phút</summary>
            <div>${PROCESS.map(x => `<article><b>${x[0]}</b><div><strong>${escPlan(x[1])}</strong><small>${escPlan(x[2])}</small><p>${escPlan(x[3])}</p></div></article>`).join("")}</div>
          </details>
          <details class="writing-month-goals">
            <summary>🎯 Mục tiêu cuối tháng 7</summary>
            <ul>${GOALS.map(g => `<li>${escPlan(g)}</li>`).join("")}</ul>
          </details>
        </div>
      </section>
    `);
  }

  function renderWritingPlan() {
    ensureWritingPlan();
    const key = WRITING_PLAN[activeDate] ? activeDate : selectedWritingPlanDate;
    const item = WRITING_PLAN[key];
    const today = $wp("#writingPlanToday");
    if (today && item) {
      today.innerHTML = `
        <div>
          <span>📌 Bài viết cần luyện</span>
          <h4>${fmtPlanDate(key)} · ${escPlan(item.section)}</h4>
          <p>${escPlan(item.content)}</p>
        </div>
        <button id="startWritingPlanPractice" type="button">✍️ Bắt đầu viết</button>
      `;
    }
    const list = $wp("#writingPlanList");
    if (list) {
      list.innerHTML = keys.map(k => {
        const v = WRITING_PLAN[k];
        const done = writingPlanDone[k] ? "done" : "";
        return `<button class="${k === key ? "active" : ""} ${done}" data-writing-plan-date="${k}" type="button"><input data-writing-plan-check="${k}" type="checkbox" ${writingPlanDone[k] ? "checked" : ""} aria-label="Đánh dấu đã viết ${fmtPlanDate(k)}"><b>${fmtPlanDate(k)}</b><span>${escPlan(v.content)}</span><small>${escPlan(v.section)}</small></button>`;
      }).join("");
    }
  }

  const oldOpenTabForWritingPlan = typeof openTab === "function" ? openTab : null;
  if (oldOpenTabForWritingPlan) {
    openTab = function (id) {
      oldOpenTabForWritingPlan(id);
      if (id === "writing") {
        selectedWritingPlanDate = WRITING_PLAN[activeDate] ? activeDate : selectedWritingPlanDate;
        renderWritingPlan();
      }
    };
  }

  document.addEventListener("click", e => {
    if (e.target.closest("[data-writing-plan-check]")) return;
    const btn = e.target.closest("[data-writing-plan-date]");
    if (btn) {
      selectedWritingPlanDate = btn.dataset.writingPlanDate;
      renderWritingPlan();
    }
    if (e.target.closest("#openWritingPlanList")) {
      const details = $wp("#writingPlanListWrap");
      if (details) details.open = true;
      details?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
    if (e.target.closest("#startWritingPlanPractice")) {
      $wp("#writingEditor")?.scrollIntoView({ behavior: "smooth", block: "center" });
      $wp("#writingEditor")?.focus();
    }
  });
  document.addEventListener("change", e => {
    const check = e.target.closest("[data-writing-plan-check]");
    if (!check) return;
    writingPlanDone[check.dataset.writingPlanCheck] = check.checked;
    saveWritingPlanDone();
    renderWritingPlan();
  });

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", () => setTimeout(renderWritingPlan, 90));
  else setTimeout(renderWritingPlan, 90);
})();

/* Final Reading compact override · keep Reading actions in the stats row */
(() => {
  const $c = (s, root = document) => root.querySelector(s);
  function compactReadingBlocks() {
    $c(".reading-add-card")?.classList.add("reading-add-card-compact-hidden");
    $c(".reading-exam-hub")?.classList.add("reading-exam-hub-compact-hidden");
    const cards = $c("#readingCards");
    if (cards) cards.innerHTML = "";
  }
  function renderCompactReadingStats() {
    const stats = $c("#readingStats");
    if (!stats || typeof readingDb === "undefined") return;
    const texts = readingDb?.texts || [];
    const total = texts.length;
    const read = texts.filter(t => t.checks?.read).length;
    const words = readingDb?.stats?.words || 0;
    stats.innerHTML = [
      ["📚", "Tổng số bài trong kho", total],
      ["✅", "Số bài đã đọc", read],
      ["🧠", "Từ đã học từ Reading", words]
    ].map(x => `<article><span>${x[0]}</span><small>${x[1]}</small><b>${x[2]}</b></article>`).join("") +
    `<button class="reading-stat-action" id="openReadingBank" type="button" title="Kho bài đọc"><span>🗂️</span><b>Kho</b><small>${total} bài</small></button>
     <button class="reading-stat-action add" id="openReadingDialogQuick" type="button" title="Thêm bài đọc"><span>＋</span><b>Thêm</b><small>Bài đọc</small></button>`;
    const count = $c("#readingBankCount");
    if (count) count.textContent = `${total} bài`;
  }
  const oldOpenReadingCenterCompact = typeof openReadingCenter === "function" ? openReadingCenter : null;
  if (oldOpenReadingCenterCompact) {
    openReadingCenter = function () {
      oldOpenReadingCenterCompact();
      compactReadingBlocks();
      renderCompactReadingStats();
    };
  }
  const oldRenderReadingDashboardCompact = typeof renderReadingDashboard === "function" ? renderReadingDashboard : null;
  if (oldRenderReadingDashboardCompact) {
    renderReadingDashboard = function () {
      oldRenderReadingDashboardCompact();
      compactReadingBlocks();
      renderCompactReadingStats();
    };
  }
  const oldRenderReadingCardsCompact = typeof renderReadingCards === "function" ? renderReadingCards : null;
  if (oldRenderReadingCardsCompact) {
    renderReadingCards = function () {
      oldRenderReadingCardsCompact();
      compactReadingBlocks();
      renderCompactReadingStats();
    };
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", () => setTimeout(() => { compactReadingBlocks(); renderCompactReadingStats(); }, 150));
  else setTimeout(() => { compactReadingBlocks(); renderCompactReadingStats(); }, 150);
})();
