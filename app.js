import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.57.0/+esm';

const CONFIG = {
  url: 'https://xddrmhperdrqxjicscsv.supabase.co',
  key: 'sb_publishable_erU4mKonRBgk_N4H7N_SjQ_WMsFmkxw'
};
const db = createClient(CONFIG.url, CONFIG.key, {
  auth: { storage: window.sessionStorage, storageKey: 'circulos-pertenencia-auth',
    persistSession: true, autoRefreshToken: true, detectSessionInUrl: false }
});
const $ = id => document.getElementById(id);
const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
const getRow = value => Array.isArray(value) ? value[0] : value;
const tidy = value => String(value || '').replace(/[\r\n\t<>]/g, ' ').trim().slice(0, 30);
const xml = value => String(value).replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&apos;' })[c]);
const rootUrl = new URL('./', window.location.href).href;
const CX = 520, CY = 520, CENTER_RADIUS = 45;
const RINGS = [
  { id:'seguridad', name:'Seguridad', emotion:'Miedo', outer:489, inner:415, color:'#DCCFF5', ink:'#64498b',
    description:'Personas con las que te sientes seguro, respetado y sin necesidad de estar a la defensiva. Su presencia no supone una amenaza.',
    questions:[
      '¿Tienes personas con las que te sientes completamente segura, sin necesidad de estar alerta?',
      '¿Puedes estar en silencio con alguien sin sentir incomodidad?',
      '¿Hay personas que respetan tu espacio, tus tiempos y tus límites?',
      '¿Sientes que no necesitas justificarte ni defenderte constantemente?',
      '¿Te rodeas de personas que no te generan ansiedad ni tensión anticipatoria?'
    ]},
  { id:'desarrollo', name:'Desarrollo', emotion:'Tristeza', outer:415, inner:341, color:'#CDE6F8', ink:'#3875a3',
    description:'Personas que te aportan aprendizaje, sensibilidad y comprensión. Te escuchan y te ayudan a avanzar.',
    questions:[
      '¿Tienes relaciones donde puedes compartir tu tristeza y sentirte comprendida?',
      '¿Hay personas que te ayudan a crecer emocional o intelectualmente sin exigirte nada a cambio?',
      '¿Te sientes escuchada con atención y sensibilidad cuando lo necesitas?',
      '¿Puedes expresar tus emociones sin miedo a que minimicen tu experiencia?',
      '¿Notas que algunas relaciones te suman y te enriquecen sin drenarte?'
    ]},
  { id:'justicia', name:'Justicia', emotion:'Rabia', outer:341, inner:267, color:'#F3CCD0', ink:'#a44d5e',
    description:'Relaciones en las que experimentas igualdad, honestidad y respeto por tus límites, sin manipulación ni abusos.',
    questions:[
      '¿Tienes relaciones donde sientes que todo es equitativo, sin juegos de poder?',
      '¿Te rodeas de personas que son honestas, claras y no manipulan?',
      '¿Te sientes con derecho a poner límites y a decir “no” sin sentirte culpable?',
      '¿Puedes expresar tu rabia o tu malestar sin miedo a ser rechazada?',
      '¿Tienes relaciones que te dan energía y no te restan vitalidad?'
    ]},
  { id:'reconocimiento', name:'Reconocimiento', emotion:'Orgullo', outer:267, inner:193, color:'#D1E9D7', ink:'#397a55',
    description:'Personas que te reconocen y valoran como eres, y te permiten expresarte con autenticidad, sin juicio ni competitividad.',
    questions:[
      '¿Hay personas que valoran quién eres tal y como eres, sin querer cambiarte?',
      '¿Te sientes elegida por lo que tú eres, y no por lo que puedes aportar o hacer?',
      '¿Puedes expresarte creativamente y ser auténtica sin sentirte juzgada?',
      '¿Tienes relaciones donde puedes brillar sin miedo a generar envidia?',
      '¿Sientes orgullo sano de compartir con ciertas personas tu camino?'
    ]},
  { id:'pertenencia', name:'Pertenencia', emotion:'Amor', outer:193, inner:119, color:'#FFDEC3', ink:'#ae6631',
    description:'Vínculos de cercanía y cuidado mutuo, donde puedes compartir tu intimidad, recibir apoyo y ser quien eres.',
    questions:[
      '¿Puedes ser tú misma completamente con ciertas personas, incluso en tus momentos más vulnerables?',
      '¿Hay relaciones en las que la entrega es mutua y equilibrada?',
      '¿Sientes que algunas personas están presentes para ti cuando lo necesitas, sin condiciones?',
      '¿Tienes vínculos donde hay cuidado sincero, sin celos ni exigencias?',
      '¿Vives relaciones de apoyo real, con calidez y sin juicios?'
    ]},
  { id:'plenitud', name:'Plenitud', emotion:'Alegría', outer:119, inner:45, color:'#FFF0B6', ink:'#99752d',
    description:'Personas con las que puedes fluir con libertad y espontaneidad, compartir alegría y abrirte a nuevas experiencias.',
    questions:[
      '¿Tienes personas con las que fluyes de forma natural, sin esfuerzo?',
      '¿Experimentas alegría espontánea en algunas de tus relaciones?',
      '¿Hay vínculos que te abren a nuevas experiencias, ideas u oportunidades?',
      '¿Puedes reír, jugar o ilusionarte sin sentir que tienes que reprimirte?',
      '¿Sientes ligereza y libertad en alguna relación actual?'
    ]}
];
const COLORS = ['#8BADC1','#E9ACAC','#7EB396','#E8BD66','#A8A0CD','#C1856C','#ACC4A0','#D99D58','#75919A','#CDA6BB','#A5B2DF','#B6A185','#82C5B2','#D9C17D','#AD98B5','#CAAF9E','#92B4A1','#D28F8C','#9CAFC4','#E2A0C0','#91B5B1','#D4A36D','#B9A4C3','#9FB7A0','#CCACA3','#B5C8DB','#E5BEA9','#8FB8D8','#9DA3C6','#B1C995'];
const TEMPLATES = COLORS.map((color, i) => ({id:'a'+String(i+1).padStart(2,'0'), color, size:['pequeno','mediano','grande'][i % 3]}));
const SCALE = {pequeno:.5, mediano:.61, grande:.73};
const freshBoard = () => ({kind:'circles-belonging',version:1, figures:[]});
const clientId = crypto.randomUUID();
const state = {
  role:'', session:null, board:freshBoard(), channel:null, selectedRing:0,
  selectedTemplate:TEMPLATES[0].id, selectedUid:null, infoRing:null, dragging:null,
  connected:false, lastRevision:0, saving:false, pending:false, editMode:false, closing:false
};
function canEditFigures(){ return !!state.session && (state.role === 'patient' || state.role === 'therapist'); }
const board = $('circleBoard');
const params = new URLSearchParams(window.location.search);
if(params.get('code')) $('patientCode').value = params.get('code').toUpperCase();

function currentCode(){
  const s = state.session || {};
  return s.access_code || s.code || s.patient_code || '';
}
function alertError(message, workspace = false){
  const target = $(workspace ? 'workspaceError' : 'landingError');
  target.textContent = message || 'Se ha producido un error.';
  target.hidden = false;
}
function clearError(){
  $('workspaceError').hidden = true;
  $('landingError').hidden = true;
}
function markBusy(yes){
  ['createSession','joinSession'].forEach(id => $(id).disabled = yes);
}
function figurineArt(t, direction = 'frente'){
  const color = t.color;
  let face = '<circle cx="32" cy="28" r="2" fill="#36443D"/><circle cx="48" cy="28" r="2" fill="#36443D"/><path d="M34 37 Q40 40.5 46 37" stroke="#36443D" stroke-width="2.3" stroke-linecap="round" fill="none"/>';
  if(direction === 'izquierda') face = '<circle cx="30" cy="29" r="2.2" fill="#36443D"/><path d="M19 31 L14 35 L20 37" fill="'+color+'" stroke="#47584C" stroke-width="1.4"/><path d="M24 41 Q28 43 32 40" stroke="#36443D" stroke-width="2" stroke-linecap="round" fill="none"/>';
  if(direction === 'derecha') face = '<circle cx="50" cy="29" r="2.2" fill="#36443D"/><path d="M61 31 L66 35 L60 37" fill="'+color+'" stroke="#47584C" stroke-width="1.4"/><path d="M48 40 Q52 43 56 41" stroke="#36443D" stroke-width="2" stroke-linecap="round" fill="none"/>';
  return '<ellipse cx="40" cy="107" rx="28" ry="5" fill="#1c2a23" fill-opacity=".11"/>' +
    '<path d="M21 55 C25 49 33 47 40 47 C47 47 55 49 59 55 C66 66 69 86 68 103 Q40 111 12 103 C11 86 14 66 21 55Z" fill="'+color+'"/>' +
    '<path d="M20 64 C23 56 28 53 33 51" stroke="#fff" stroke-opacity=".28" stroke-width="3.5" stroke-linecap="round" fill="none"/>' +
    '<ellipse cx="40" cy="27" rx="23" ry="24" fill="'+color+'"/>' +
    '<ellipse cx="35" cy="19" rx="14" ry="7" fill="#fff" opacity=".16"/>' + face;
}
function templateOf(id){ return TEMPLATES.find(t => t.id === id) || TEMPLATES[0]; }
function circleFor(x,y){
  const d = Math.hypot(x-CX,y-CY);
  return RINGS.findIndex(r => d > r.inner && d <= r.outer);
}
function circleIndexForFigure(f){
  const c = circleFor(f.x, f.y);
  return c >= 0 ? c : 0;
}
function svgPoint(e){
  const point = board.createSVGPoint();
  point.x = e.clientX;
  point.y = e.clientY;
  const matrix = board.getScreenCTM();
  if (!matrix) return {x:CX,y:CY};
  const local = point.matrixTransform(matrix.inverse());
  return {x:local.x,y:local.y};
}
function constrain(x,y){
  let dx = x-CX, dy=y-CY;
  let distance = Math.hypot(dx,dy);
  if(distance < .01){ dx=0; dy=-1; distance=1; }
  const final = clamp(distance, CENTER_RADIUS+8, RINGS[0].outer-6);
  return { x: +(CX + dx / distance * final).toFixed(1),
    y: +(CY + dy / distance * final).toFixed(1) };
}
function figureAtRing(index){
  const ring = RINGS[index];
  const same = state.board.figures.filter(f=>circleIndexForFigure(f)===index).length;
  const positions = [48,132,22,158,80,100,5,175,65,115];
  const angle = (positions[same % positions.length] + Math.floor(same/positions.length)*11)*Math.PI/180;
  const r = (ring.outer+ring.inner)/2;
  return {x:CX+Math.cos(angle)*r,y:CY+Math.sin(angle)*r};
}
function buildBoard(){
  let paths = '', rings = '', labels = '';
  RINGS.forEach((ring,i) => {
    const r=(ring.outer+ring.inner)/2;
    paths += '<path id="arc-'+ring.id+'" d="M '+(CX-r)+' '+CY+' A '+r+' '+r+' 0 0 1 '+(CX+r)+' '+CY+'"/>';
    rings += '<circle class="ring" data-ring="'+i+'" cx="'+CX+'" cy="'+CY+'" r="'+ring.outer+'" fill="'+ring.color+'"/>';
    labels += '<text class="ring-label" data-ring="'+i+'" fill="'+ring.ink+'"><textPath href="#arc-'+ring.id+'" startOffset="50%" text-anchor="middle">'+xml(ring.name.toUpperCase())+'</textPath></text>';
  });
  board.innerHTML = '<defs>'+paths+'</defs>'+rings+
    '<circle cx="'+CX+'" cy="'+CY+'" r="'+CENTER_RADIUS+'" fill="#fff" stroke="#fff" stroke-width="2" aria-label="Centro blanco"/>' +
    labels +
    '<g id="figuresLayer"></g>';
  renderRing();
}
function renderRing(){
  board.querySelectorAll('.ring').forEach(el => el.classList.toggle('ring-active',Number(el.dataset.ring)===state.selectedRing));
  const r=RINGS[state.selectedRing];
  $('circleTitle').textContent=r.name;
  $('circleHint').textContent= state.role==='therapist' ? r.emotion+' · Haz clic en «Ver preguntas» para explorar este círculo.' : 'Puedes colocar personas en este círculo o moverlas después.';
  $('circleSwatch').style.backgroundColor=r.color;
  $('infoButton').disabled=false;
  if(state.role==='therapist' && state.infoRing === state.selectedRing){
    $('questionsPanel').hidden = false;
    $('questionList').innerHTML = r.questions.map(q=>'<li>'+xml(q)+'</li>').join('');
    $('circleHint').textContent=r.description;
    $('infoButton').textContent='Ocultar preguntas';
  } else {
    $('questionsPanel').hidden=true;
    $('infoButton').textContent='ⓘ Ver preguntas';
  }
  $('boardHelper').textContent = state.role==='therapist' ? 'Selecciona un círculo y pulsa «Ver preguntas»' : 'Arrastra las figuras de un círculo a otro';
}
function selectRing(index){
  if(index<0 || index>=RINGS.length)return;
  state.selectedRing=index;
  state.infoRing=null;
  renderRing();
}
function renderCatalog(){
  const used = new Set(state.board.figures.map(f => f.templateId));
  if(used.has(state.selectedTemplate)) {
    const first = TEMPLATES.find(t=>!used.has(t.id));
    state.selectedTemplate=first?.id || '';
  }
  $('figureCatalog').innerHTML = TEMPLATES.map(t=>'<button type="button" class="catalog-button" data-template="'+t.id+'" draggable="'+(!used.has(t.id))+'" '+(used.has(t.id)?'disabled ':'')+'aria-pressed="'+(state.selectedTemplate===t.id)+'" title="Figura '+t.id+' · '+({pequeno:'pequeña',mediano:'mediana',grande:'grande'})[t.size]+'"><svg aria-hidden="true" viewBox="0 0 80 114">'+figurineArt(t)+'</svg></button>').join('');
  const available=used.size < TEMPLATES.length;
  $('addFigure').disabled= !available || !state.selectedTemplate;
  $('addFigure').textContent=available ? 'Añadir al círculo seleccionado' : 'Has colocado todas las figuras';
}
function renderFigures(){
  const layer=$('figuresLayer');
  if(!layer)return;
  layer.innerHTML=state.board.figures.map(f=>{
    const t=templateOf(f.templateId), scale=SCALE[t.size], x=Number(f.x), y=Number(f.y);
    if(!Number.isFinite(x)||!Number.isFinite(y))return '';
    return '<g class="person'+(f.uid===state.selectedUid?' is-selected':'')+'" role="button" tabindex="0" data-uid="'+xml(f.uid)+'" aria-label="'+xml(f.name||'Persona')+'" transform="translate('+(x-40*scale)+' '+(y-57*scale)+') scale('+scale+')">' +
      '<rect class="person-outline" x="2" y="-4" width="76" height="115" rx="25"/>'+figurineArt(t, f.direction || 'frente')+
      '</g><text data-uid="'+xml(f.uid)+'" x="'+x+'" y="'+(y+60*scale+15)+'" class="person-label" text-anchor="middle">'+xml(f.name||'Persona')+'</text>';
  }).join('');
  $('boardCount').textContent=state.board.figures.length+' figura'+(state.board.figures.length===1?' colocada':'s colocadas');
  renderCatalog();
  renderEditor();
}
function renderEditor(){
  const item=state.board.figures.find(f=>f.uid===state.selectedUid);
  $('editCard').hidden=!canEditFigures()||!item;
  if(!item){state.editMode=false;return;}
  if(!state.editMode) $('editFigureName').value=item.name||'';
}
function refreshWorkspace(){
  $('landing').hidden=!!state.session;
  $('workspace').hidden=!state.session;
  if(!state.session)return;
  document.querySelectorAll('.professional-only').forEach(el=>el.hidden=state.role!=='therapist');
  document.querySelectorAll('.patient-only').forEach(el=>el.hidden=state.role!=='patient');
  $('roleLabel').textContent=state.role==='therapist'?'PANEL PRIVADO DEL PSICÓLOGO':'PANTALLA DEL PACIENTE';
  $('workspaceSub').textContent=state.role==='therapist'?'Consulta las preguntas y coloca, mueve o renombra figuras junto al paciente.':'Selecciona figuras para representar a las personas de tu vida.';
  $('exitButton').textContent=state.role==='therapist'?'Finalizar sesión':'Salir';
  $('connectionStatus').textContent=state.connected?'Conectado':'Conectando…';
  $('connectionStatus').classList.toggle('connected',state.connected);
  renderRing();renderFigures();
}
function receiveBoard(incoming){
  if(!incoming||incoming.kind!=='circles-belonging'||state.dragging)return;
  const version=Number(incoming._sync?.version||0);
  if(version && version<=state.lastRevision)return;
  if(!version && state.lastRevision)return;
  state.lastRevision=version;
  state.board=incoming;
  renderFigures();
}
async function persist(){
  if(state.saving||!state.session)return;
  state.saving=true;
  try{
    while(state.pending && state.session){
      state.pending=false;
      const snapshot=state.board;
      const r=await db.rpc('cope_update_board',{p_id:state.session.id,p_board:snapshot});
      if(r.error)throw r.error;
      if(r.data?.kind==='circles-belonging' && Number(r.data._sync?.version||0)>state.lastRevision) {
        receiveBoard(r.data);
      }
      state.channel?.send({type:'broadcast',event:'board_snapshot',payload:{from:clientId,board:snapshot}})
        .catch(()=>{});
    }
  }catch(e){
    state.pending=false;
    alertError('No se ha podido guardar la composición: '+(e.message||'Error de red'),true);
  }finally{state.saving=false;}
}
function changeBoard(next){
  if(!canEditFigures())return;
  const version=Math.max(Date.now(),state.lastRevision+1);
  state.lastRevision=version;
  state.board={...next,_sync:{version,from:clientId}};
  state.pending=true;
  renderFigures();
  persist();
}
function addFigure(templateId,location,forcedRing=null){
  if(!canEditFigures())return;
  if(state.board.figures.length>=TEMPLATES.length){alertError('Ya has colocado las 30 figuras disponibles.',true);return;}
  if(state.board.figures.some(f=>f.templateId===templateId))return;
  const pos=location || figureAtRing(forcedRing===null?state.selectedRing:forcedRing);
  const point=constrain(pos.x,pos.y);
  const f={uid:crypto.randomUUID(),templateId, name:tidy($('newFigureName').value)||'Persona '+(state.board.figures.length+1),x:point.x,y:point.y,direction:'frente'};
  state.selectedUid=f.uid;
  state.editMode=false;
  changeBoard({...state.board,figures:[...state.board.figures,f]});
  $('newFigureName').value='';
}
function loadSession(row,role){
  state.role=role;
  state.session=row;
  state.board=row.board?.kind==='circles-belonging'?row.board:freshBoard();
  state.lastRevision=Number(state.board._sync?.version||0);
  state.selectedUid=null;
  state.selectedRing=0;
  state.infoRing=null;
  clearError();
  refreshWorkspace();
  setupRealtime();
}
async function createSession(event){
  event.preventDefault(); clearError();markBusy(true);
  try{
    const login=await db.auth.signInWithPassword({email:$('therapistEmail').value.trim(),password:$('therapistPassword').value});
    if(login.error)throw login.error;
    const created=await db.rpc('cope_create_session');
    if(created.error)throw created.error;
    const row=getRow(created.data);
    if(!row?.id)throw new Error('No se ha recibido el identificador de sesión.');
    const init=freshBoard();
    const saved=await db.rpc('cope_update_board',{p_id:row.id,p_board:init});
    if(saved.error)throw saved.error;
    const updated=saved.data?.kind==='circles-belonging'?saved.data:init;
    loadSession({...row,board:updated},'therapist');
  }catch(e){alertError('No se ha podido crear la sesión: '+(e.message||'Error desconocido'));}
  finally{markBusy(false);}
}
async function joinSession(event){
  event.preventDefault();clearError();markBusy(true);
  try{
    const code=$('patientCode').value.trim().toUpperCase();
    if(!code)throw new Error('Introduce el código de la sesión.');
    await db.auth.signOut();
    const signIn=await db.auth.signInAnonymously();
    if(signIn.error)throw signIn.error;
    const joined=await db.rpc('cope_join_session',{p_code:code});
    if(joined.error)throw joined.error;
    const row=getRow(joined.data);
    if(!row?.id || row.board?.kind!=='circles-belonging')throw new Error('Este código no corresponde a una sesión de Círculos de Pertenencia.');
    loadSession(row,'patient');
  }catch(e){alertError('No se ha podido acceder: '+(e.message||'Código incorrecto'));}
  finally{markBusy(false);}
}
function setupRealtime(){
  if(state.channel){db.removeChannel(state.channel);state.channel=null;}
  const session=state.session;
  if(!session?.id)return;
  const channel=db.channel('circles-belonging-'+session.id)
    .on('postgres_changes',{event:'*',schema:'public',table:'cope_sessions',filter:'id=eq.'+session.id}, payload=>{
      if(payload.eventType==='DELETE'){alertError('La sesión ha finalizado.',true);return;}
      if(payload.new?.board?.kind==='circles-belonging')receiveBoard(payload.new.board);
    })
    .on('broadcast',{event:'board_snapshot'},({payload})=>{
      if(payload?.from!==clientId)receiveBoard(payload?.board);
    })
    .on('broadcast',{event:'board_request'},({payload})=>{
      if(payload?.from!==clientId && state.board.kind==='circles-belonging'){
        channel.send({type:'broadcast',event:'board_snapshot',payload:{from:clientId,board:state.board}}).catch(()=>{});
      }
    })
    .on('broadcast',{event:'session_closed'},({payload})=>{
      if(payload?.from===clientId)return;
      alertError('El psicólogo ha finalizado esta sesión.',true);
      $('connectionStatus').textContent='Sesión finalizada';
    })
    .subscribe(async status=>{
      state.connected=status==='SUBSCRIBED';
      $('connectionStatus').textContent=state.connected?'Conectado':'Sin conexión en directo';
      $('connectionStatus').classList.toggle('connected',state.connected);
      if(state.connected){
        channel.send({type:'broadcast',event:'board_request',payload:{from:clientId}}).catch(()=>{});
      }
    });
  state.channel=channel;
}
async function exitSession(){
  if(!state.session||state.closing)return;
  const therapist=state.role==='therapist';
  const ask=therapist?'¿Finalizar esta sesión para ambos participantes?':'¿Salir del ejercicio?';
  if(!window.confirm(ask))return;
  state.closing=true;
  try{
    if(therapist){
      const closed=await db.rpc('cope_close_session',{p_id:state.session.id});
      if(closed.error)throw closed.error;
      await state.channel?.send({type:'broadcast',event:'session_closed',payload:{from:clientId}}).catch(()=>{});
    }
    if(state.channel){await db.removeChannel(state.channel);state.channel=null;}
    await db.auth.signOut();
    state.role='';state.session=null;state.board=freshBoard();state.selectedUid=null;state.connected=false;
    $('therapistPassword').value='';
    refreshWorkspace();
  }catch(e){alertError('No se ha podido finalizar: '+(e.message||'Error'),true);}
  finally{state.closing=false;}
}
async function copyPatientLink(){
  const code=currentCode();
  if(!code){alertError('No se ha recibido el código de la sesión.',true);return;}
  const link=rootUrl+'?code='+encodeURIComponent(code);
  try{
    await navigator.clipboard.writeText(link);
    $('shareButton').textContent='Enlace copiado ✓';
    setTimeout(()=>$('shareButton').textContent='Copiar enlace del paciente',2500);
  }catch(e){
    window.prompt('Copia el enlace para enviarlo al paciente:',link);
  }
}
function exportedSvg() {
  const clone = board.cloneNode(true);
  clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  clone.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink');
  clone.setAttribute('width', '1040');
  clone.setAttribute('height', '1040');
  const style = document.createElementNS('http://www.w3.org/2000/svg', 'style');
  style.textContent = [
    '.ring{stroke:#fff;stroke-width:2}',
    '.ring-active{stroke:#4b4661;stroke-width:3;stroke-dasharray:7 5}',
    '.ring-label{font-family:Arial,Helvetica,sans-serif;letter-spacing:1px;font-size:21px;font-weight:700}',
    '.person-label{font-family:Arial,Helvetica,sans-serif;font-weight:700;font-size:20px;paint-order:stroke;stroke:white;stroke-width:4;stroke-linejoin:round;fill:#343448}',
    '.person-outline{fill:#fff;stroke:#fff}'
  ].join('');
  clone.insertBefore(style, clone.firstChild);
  return new XMLSerializer().serializeToString(clone);
}
function saveFile(blob, filename) {
  const href = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = href;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(href), 5000);
}
function downloadSvg(){
  saveFile(new Blob([exportedSvg()], {type:'image/svg+xml;charset=utf-8'}), 'circulos-pertenencia.svg');
}
async function canvasFromSvg(){
  const blob = new Blob([exportedSvg()], {type:'image/svg+xml;charset=utf-8'});
  const objectUrl = URL.createObjectURL(blob);
  try {
    const image = new Image();
    await new Promise((resolve, reject) => {
      image.onload = resolve;
      image.onerror = () => reject(new Error('No se ha podido convertir la imagen SVG.'));
      image.src = objectUrl;
    });
    const canvas = document.createElement('canvas');
    canvas.width = 1800; canvas.height = 1800;
    const context = canvas.getContext('2d');
    if(!context) throw new Error('El navegador no permite crear el archivo gráfico.');
    context.fillStyle = '#fff';
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    return canvas;
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}
async function downloadPng(){
  const canvas = await canvasFromSvg();
  const blob = await new Promise((resolve, reject) => canvas.toBlob(
    b => b ? resolve(b) : reject(new Error('No se pudo generar el PNG.')), 'image/png'));
  saveFile(blob, 'circulos-pertenencia.png');
}
// PDF de una página cuadrada con imagen JPEG en alta resolución. Se construye
// en el navegador para que la composición no se envíe a ningún otro servicio.
function pdfFromCanvas(canvas) {
  const data = atob(canvas.toDataURL('image/jpeg', 0.96).split(',')[1]);
  const jpeg = new Uint8Array(data.length);
  for(let i=0; i<data.length; i++) jpeg[i] = data.charCodeAt(i);
  const encoder = new TextEncoder();
  const parts = [];
  const offsets = [0];
  let length = 0;
  function push(value){
    const bytes = typeof value === 'string' ? encoder.encode(value) : value;
    parts.push(bytes);
    length += bytes.length;
  }
  function obj(id, value){
    offsets[id] = length;
    push(id + ' 0 obj\n');
    push(value);
    push('\nendobj\n');
  }
  push('%PDF-1.4\n');
  obj(1, '<< /Type /Catalog /Pages 2 0 R >>');
  obj(2, '<< /Type /Pages /Kids [3 0 R] /Count 1 >>');
  obj(3, '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 720 720] /Resources << /XObject << /Im0 4 0 R >> >> /Contents 5 0 R >>');
  offsets[4] = length;
  push('4 0 obj\n<< /Type /XObject /Subtype /Image /Width ' + canvas.width +
    ' /Height ' + canvas.height + ' /ColorSpace /DeviceRGB /BitsPerComponent 8' +
    ' /Filter /DCTDecode /Length ' + jpeg.byteLength + ' >>\nstream\n');
  push(jpeg);
  push('\nendstream\nendobj\n');
  const instructions = 'q\n720 0 0 720 0 0 cm\n/Im0 Do\nQ\n';
  obj(5, '<< /Length ' + encoder.encode(instructions).length + ' >>\nstream\n' +
    instructions + 'endstream');
  const xrefStart = length;
  push('xref\n0 6\n0000000000 65535 f \n');
  for(let id=1;id<=5;id++) push(String(offsets[id]).padStart(10,'0') + ' 00000 n \n');
  push('trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n' + xrefStart + '\n%%EOF');
  return new Blob(parts, {type:'application/pdf'});
}
async function downloadPdf(){
  const canvas = await canvasFromSvg();
  saveFile(pdfFromCanvas(canvas), 'circulos-pertenencia.pdf');
}
async function runExport(button, handler){
  const text = button.textContent;
  button.disabled = true;
  button.textContent = 'Preparando archivo…';
  try {
    clearError();
    await handler();
  }catch(error){
    alertError('No se pudo guardar el archivo: '+(error.message || 'Error desconocido'), true);
  }finally {
    button.disabled = false;
    button.textContent = text;
  }
}
function onBoardPointerDown(event){
  if(!canEditFigures())return;
  const target=event.target.closest('[data-uid]');
  if(!target)return;
  const uid=target.getAttribute('data-uid');
  const item=state.board.figures.find(f=>f.uid===uid);
  if(!item)return;
  state.selectedUid=uid;
  state.editMode=false;
  selectRing(circleIndexForFigure(item));
  const from=svgPoint(event);
  state.dragging={uid,pointer:event.pointerId,startX:from.x,startY:from.y,x:item.x,y:item.y,moved:false};
  board.setPointerCapture(event.pointerId);
  renderFigures();
  event.preventDefault();
}
function onBoardPointerMove(event){
  const drag=state.dragging;
  if(!drag||!canEditFigures()||drag.pointer!==event.pointerId)return;
  const point=svgPoint(event);
  const d=Math.hypot(point.x-drag.startX,point.y-drag.startY);
  if(d<2 && !drag.moved)return;
  drag.moved=true;
  const nextPos=constrain(drag.x+point.x-drag.startX,drag.y+point.y-drag.startY);
  state.board={...state.board,figures:state.board.figures.map(f=>f.uid===drag.uid?{...f,...nextPos}:f)};
  renderFigures();
}
function onBoardPointerUp(event){
  const drag=state.dragging;
  if(!drag||drag.pointer!==event.pointerId)return;
  if(board.hasPointerCapture(event.pointerId))board.releasePointerCapture(event.pointerId);
  state.dragging=null;
  if(drag.moved){
    const item=state.board.figures.find(f=>f.uid===drag.uid);
    if(item)selectRing(circleIndexForFigure(item));
    changeBoard({...state.board});
  } else renderFigures();
}
function initializeEvents(){
  $('therapistForm').addEventListener('submit',createSession);
  $('patientForm').addEventListener('submit',joinSession);
  $('exitButton').addEventListener('click',exitSession);
  $('shareButton').addEventListener('click',copyPatientLink);
  $('exportButton').addEventListener('click',()=>runExport($('exportButton'),downloadSvg));
  $('exportPngButton').addEventListener('click',()=>runExport($('exportPngButton'),downloadPng));
  $('exportPdfButton').addEventListener('click',()=>runExport($('exportPdfButton'),downloadPdf));
  $('infoButton').addEventListener('click',()=>{
    if(state.role!=='therapist')return;
    state.infoRing=state.infoRing===state.selectedRing?null:state.selectedRing;
    renderRing();
  });
  board.addEventListener('click',e=>{
    if(state.dragging)return;
    if(e.target.closest('[data-uid]'))return;
    const ring=e.target.closest('[data-ring]');
    if(ring)selectRing(Number(ring.getAttribute('data-ring')));
  });
  board.addEventListener('dblclick',event=>{
    if(!canEditFigures())return;
    const target=event.target.closest('[data-uid]');
    const item=state.board.figures.find(f=>f.uid===target?.dataset.uid);
    if(!item)return;
    state.selectedUid=item.uid;
    state.editMode=false;
    renderFigures();
    $('editFigureName').focus();
    $('editFigureName').select();
  });
  board.addEventListener('pointerdown',onBoardPointerDown);
  board.addEventListener('pointermove',onBoardPointerMove);
  board.addEventListener('pointerup',onBoardPointerUp);
  board.addEventListener('pointercancel',onBoardPointerUp);
  board.addEventListener('keydown',e=>{
    const el=e.target.closest('[data-uid]');
    if(el && ['Enter',' '].includes(e.key)){
      e.preventDefault();
      const item=state.board.figures.find(f=>f.uid===el.dataset.uid);
      if(!item)return;
      state.selectedUid=item.uid;
      selectRing(circleIndexForFigure(item));
      renderFigures();
    }
  });
  board.addEventListener('dragover',e=>{
    if(canEditFigures())e.preventDefault();
  });
  board.addEventListener('drop',e=>{
    if(!canEditFigures())return;
    e.preventDefault();
    const id=e.dataTransfer?.getData('text/plain');
    if(!TEMPLATES.some(t=>t.id===id))return;
    const point=svgPoint(e);
    const index=circleFor(point.x,point.y);
    if(index<0)return;
    selectRing(index);
    addFigure(id,point,index);
  });
  $('figureCatalog').addEventListener('click',e=>{
    const button=e.target.closest('[data-template]');
    if(!button||button.disabled)return;
    state.selectedTemplate=button.dataset.template;
    renderCatalog();
  });
  $('figureCatalog').addEventListener('dragstart',e=>{
    const button=e.target.closest('[data-template]');
    if(!button||button.disabled||!canEditFigures()){e.preventDefault();return;}
    state.selectedTemplate=button.dataset.template;
    e.dataTransfer.setData('text/plain',button.dataset.template);
    e.dataTransfer.effectAllowed='copy';
  });
  $('addFigure').addEventListener('click',()=>addFigure(state.selectedTemplate));
  $('saveFigureName').addEventListener('click',()=>{
    const uid=state.selectedUid;
    if(!uid)return;
    const name=tidy($('editFigureName').value)||'Persona';
    state.editMode=false;
    changeBoard({...state.board,figures:state.board.figures.map(f=>f.uid===uid?{...f,name}:f)});
  });
  $('editFigureName').addEventListener('input',()=>{state.editMode=true;});
  $('editFigureName').addEventListener('keydown',e=>{
    if(e.key==='Enter'){e.preventDefault();$('saveFigureName').click();}
  });
  $('removeFigure').addEventListener('click',()=>{
    if(!state.selectedUid||!window.confirm('¿Retirar esta figura del mapa?'))return;
    const uid=state.selectedUid;
    state.selectedUid=null;
    state.editMode=false;
    changeBoard({...state.board,figures:state.board.figures.filter(f=>f.uid!==uid)});
  });
}
buildBoard();
initializeEvents();
renderCatalog();
