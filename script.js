// Datos de práctica y definición de las misiones
const data=[{id:1,nombre:'Ana',aldea:'Norte',oro:120},{id:2,nombre:'Luis',aldea:'Sur',oro:80},{id:3,nombre:'Mara',aldea:'Norte',oro:200},{id:4,nombre:'Tomás',aldea:'Sur',oro:50}];
const cols=Object.keys(data[0]);
const missions=[
 {level:'Inicial',title:'La cámara de los registros',story:'La guardiana necesita recuperar el registro de aldeanos.',goal:'Muestra todas las columnas de la tabla aldeanos.',hint:'Usa SELECT * FROM aldeanos o enumera las cuatro columnas en orden.',columns:cols,rows:data.map(r=>cols.map(c=>r[c]))},
 {level:'Intermedio',title:'El filtro del tesoro',story:'Encuentra a quienes pueden financiar la expedición.',goal:'Muestra nombre y oro de los aldeanos con más de 100 de oro.',hint:'Combina SELECT nombre, oro con una condición WHERE oro > 100.',columns:['nombre','oro'],rows:[['Ana',120],['Mara',200]]},
 {level:'Aplicación',title:'La suma de las aldeas',story:'Prepara el informe final de recursos del reino.',goal:'Muestra aldea y el total de oro por aldea, con alias total_oro. Ordena de mayor a menor por total_oro.',hint:'Usa SUM(oro) AS total_oro, GROUP BY aldea y ORDER BY total_oro DESC.',columns:['aldea','total_oro'],rows:[['Norte',320],['Sur',130]]}
];
const $=id=>document.getElementById(id);
let current=0, done=new Set();
// Renderizado de tablas y progreso
function table(headers,rows){
 const t=document.createElement('table'), tr=t.createTHead().insertRow();
 headers.forEach(h=>{const th=document.createElement('th');th.scope='col';th.textContent=h;tr.append(th)});
 const body=t.createTBody();rows.forEach(values=>{const row=body.insertRow();values.forEach(v=>row.insertCell().textContent=v)});return t;
}
function paint(){
 $('quests').replaceChildren();
 missions.forEach((m,i)=>{
 const locked=i>0&&!done.has(i-1);
 const group=document.createElement('div');group.className='group';
 const label=document.createElement('div');label.className='level';label.textContent=m.level;
 const b=document.createElement('button');b.className='quest';b.disabled=locked;
 if(i===current&& !$('mission-view').hidden)b.setAttribute('aria-current','true');
 const icon=document.createElement('span');icon.className='map-icon';icon.setAttribute('aria-hidden','true');icon.textContent=['🏰','🌲','🔮'][i];b.append(icon,document.createTextNode(m.title));const s=document.createElement('small');s.textContent=done.has(i)?'Completada':locked?'Bloqueada':'Disponible';b.append(s);
 b.onclick=()=>openMission(i,true);group.append(label,b);$('quests').append(group);
 });
 const upcoming=missions.find((m,i)=>!done.has(i));
 $('camp-level').textContent=(upcoming||missions.at(-1)).level;
 $('camp-xp').textContent=done.size*50+' XP';
 $('camp-count').textContent=done.size+' / '+missions.length;
 $('camp-next').textContent=upcoming?upcoming.title:'Aventura completada';
 $('xp').textContent=done.size*50+' XP';$('count').textContent=done.size+' / 3 misiones';$('progress').value=done.size;
}
// Pantalla de misión y comprobación simulada de SQL
function status(message,state=''){const p=$('feedback');p.textContent=message;p.dataset.state=state}
function openMission(i,focus=false){
 if(i>0&&!done.has(i-1))return;
 $('camp-view').hidden=true;$('mission-view').hidden=false;current=i;const m=missions[i];$('stage').textContent=m.level+' · Misión 0'+(i+1);$('title').textContent='Misión: '+m.title;$('story').textContent=m.story;$('goal').textContent=m.goal;
 $('sql').value='';$('hint-text').textContent=m.hint;$('hint-text').hidden=true;$('hint').textContent='Ver pista';$('hint').setAttribute('aria-expanded','false');
 $('result-panel').hidden=true;$('result').replaceChildren();$('next').hidden=true;status('Aquí verás el resultado al pulsar Ejecutar.');paint();if(focus)$('title').focus();
}
function accepted(input,i){
 const q=input.trim().toLowerCase().replace(/;\s*$/,'').replace(/\s+/g,' ').replace(/\s*,\s*/g,',').replace(/\s*>\s*/g,'>').replace(/sum\s*\(\s*oro\s*\)/g,'sum(oro)');
 return [
 /^select (\*|id,nombre,aldea,oro) from aldeanos$/,
 /^select nombre,oro from aldeanos where oro>100$/,
 /^select aldea,sum\(oro\) (?:as )?total_oro from aldeanos group by aldea order by (?:total_oro|sum\(oro\)|2) desc$/
 ][i].test(q);
}
function run(){
 $('result-panel').hidden=false;
 const input=$('sql').value;$('next').hidden=true;$('result').replaceChildren();
 if(!input.trim()){status('Escribe una consulta primero.','error');$('sql').focus();return}
 if(!accepted(input,current)){status('La consulta no coincide con los patrones de esta demo. Revisa la consigna o consulta la pista.','error');return}
 const first=!done.has(current), m=missions[current];done.add(current);paint();
 status((first?'¡Misión completada! +50 XP.':'Consulta aceptada. Ya ganaste los puntos de esta misión.')+(done.size===3?' Completaste la demo.':''),'ok');
 $('result').append(table(m.columns,m.rows));$('next').hidden=current===missions.length-1;
}
$('run').onclick=run;$('clear').onclick=()=>{$('sql').value='';$('result-panel').hidden=true;$('result').replaceChildren();$('next').hidden=true;status('Aquí verás el resultado al pulsar Ejecutar.');$('sql').focus()};
$('hint').onclick=()=>{const p=$('hint-text');p.hidden=!p.hidden;$('hint').textContent=p.hidden?'Ver pista':'Ocultar pista';$('hint').setAttribute('aria-expanded',String(!p.hidden))};
$('next').onclick=()=>openMission(current+1,true);
// Navegación entre pantallas
function show(view,heading){
 const isEntry = ['menu','character'].includes(view);
 $('app-header').hidden = isEntry;
 $('header-stats').hidden = isEntry;
 for(const name of ['menu','character','camp','mission'])$(name+'-view').hidden=name!==view;
 paint();$(heading).focus();
}
$('entry-form').onsubmit=event=>{
 event.preventDefault();show('character','character-title');
};
$('back-entry').onclick=()=>show('menu','menu-title');
// Personajes disponibles y sus imágenes
const characters=[
 {name:'Aventurero',image:'personajes/aventurero.png'},
 {name:'Aventurera',image:'personajes/aventurera.png'}
];
let selectedCharacter=0;
function chooseCharacter(step){
 selectedCharacter=(selectedCharacter+step+characters.length)%characters.length;
 const character=characters[selectedCharacter];
 for(const id of ['character-preview','camp-icon','map-avatar-icon','avatar-icon'])$(id).src=character.image;
 for(const id of ['character-name','camp-avatar','map-avatar-name'])$(id).textContent=character.name;
}
$('prev-character').onclick=()=>chooseCharacter(-1);
$('next-character').onclick=()=>chooseCharacter(1);
$('start').onclick=()=>{
 const name=$('player-name').value.trim()||'Estudiante';
 $('map-player-name').textContent=name;$('camp-player').textContent=name;
 $('camp-welcome').textContent='¡Te damos la bienvenida, '+name+'!';
 setMap(false);show('camp','camp-title');
};
$('back-menu').onclick=()=>show('menu','menu-title');
// Mapa desplegable del campamento
function setMap(open){
 $('map-view').hidden=!open;
 $('toggle-map').setAttribute('aria-expanded',String(open));
 $('toggle-map').textContent=open?'◈ Ocultar mapa':'◈ Abrir mapa';
}
$('toggle-map').onclick=()=>{
 const open=$('map-view').hidden;setMap(open);
 if(open)$('map-title').focus();
};
$('back-map').onclick=()=>{setMap(true);show('camp','map-title');};
$('sql').addEventListener('keydown',e=>{if((e.ctrlKey||e.metaKey)&&e.key==='Enter'){e.preventDefault();run()}});
$('dataset').append(table(cols,data.map(r=>cols.map(c=>r[c]))));paint();


