import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {JSDOM} from 'jsdom';

const html = readFileSync('index.html', 'utf8');
const js = readFileSync('app.js','utf8').replace(/^import\s+\{\s*createClient\s*\}.*\n/, 'const createClient = window.__mockCreateClient;\n');
assert.match(js,/const createClient = window\.__mockCreateClient;/);
const stored={board:null};
const sleep=()=>new Promise(resolve=>setTimeout(resolve,25));
function createMockClient(){
  const channel = {
    on(){return this;},
    subscribe(fn){queueMicrotask(()=>fn('SUBSCRIBED'));return this;},
    send(){return Promise.resolve('ok');}
  };
  return {
    auth:{
      signInWithPassword:async()=>({data:{user:{id:'professional'}}}),
      signInAnonymously:async()=>({data:{user:{id:'guest'}}}),
      signOut:async()=>({error:null})
    },
    rpc:async(name,args)=>{
      if(name==='cope_create_session')return {data:{id:'session-test',access_code:'ABC123',board:stored.board}};
      if(name==='cope_update_board'){stored.board=args.p_board;return {data:stored.board}};
      if(name==='cope_join_session')return {data:{id:'session-test',access_code:'ABC123',board:stored.board}};
      if(name==='cope_close_session')return {data:true};
      throw new Error('RPC inesperada: '+name);
    },
    channel:()=>channel,
    removeChannel:()=>Promise.resolve()
  };
}
function boot(){
  const dom = new JSDOM(html,{
    url:'https://armandmu.github.io/circulos-pertenencia/',
    runScripts:'outside-only',
    pretendToBeVisual:true
  });
  dom.window.__mockCreateClient = createMockClient;
  Object.defineProperty(dom.window.crypto,'randomUUID',{configurable:true,value:()=>('test-'+Math.random())});
  dom.window.eval(js);
  return dom.window;
}
async function form(window,id){
  const el=window.document.getElementById(id);
  el.dispatchEvent(new window.Event('submit',{bubbles:true,cancelable:true}));
  await sleep();
}
async function click(window,id){
  const el=window.document.getElementById(id);
  assert.ok(el,'Botón existente '+id);
  el.click();
  await sleep();
}
const professional=boot();
professional.document.getElementById('therapistEmail').value='profesional@ejemplo.com';
professional.document.getElementById('therapistPassword').value='test';
await form(professional,'therapistForm');
assert.equal(professional.document.getElementById('workspace').hidden,false,'El profesional entra');
assert.equal(professional.document.querySelectorAll('#figureCatalog [data-template]').length,30,'El profesional ve 30 muñecos');
assert.equal(professional.document.getElementById('addFigure').disabled,false,'Botón añadir activo en profesional');
professional.document.getElementById('newFigureName').value='Madre';
await click(professional,'addFigure');
assert.equal(stored.board?.figures?.length,1,'El profesional guarda la figura');
assert.match(professional.document.getElementById('figuresLayer').textContent,/Madre/,'El muñeco aparece en el mapa');
assert.equal(professional.document.getElementById('editCard').hidden,false,'Aparece el editor');
professional.document.getElementById('editFigureName').value='Mamá';
await click(professional,'saveFigureName');
assert.equal(stored.board.figures[0].name,'Mamá','Se puede cambiar el nombre');
assert.equal(professional.document.getElementById('infoButton').hidden,false,'El profesional ve preguntas');
await click(professional,'infoButton');
assert.equal(professional.document.getElementById('questionsPanel').hidden,false,'El panel de preguntas se abre');
const patient=boot();
patient.document.getElementById('patientCode').value='ABC123';
await form(patient,'patientForm');
assert.equal(patient.document.getElementById('workspace').hidden,false,'El paciente entra');
assert.equal(patient.document.getElementById('questionsPanel').hidden,true,'Las preguntas siguen ocultas al paciente');
assert.equal(patient.document.querySelectorAll('#figureCatalog [data-template]').length,30,'El paciente ve 30 muñecos');
patient.document.getElementById('newFigureName').value='Amigo';
await click(patient,'addFigure');
assert.equal(stored.board.figures.length,2,'El paciente también puede añadir');
assert.match(patient.document.getElementById('figuresLayer').textContent,/Amigo/,'El paciente ve su figura en el tablero');
assert.equal(patient.document.getElementById('editCard').hidden,false,'El paciente puede editar el nombre');
const pdf=professional.eval('pdfFromCanvas({width:1,height:1,toDataURL(){return "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2Q==";}})');
assert.equal(pdf.type,'application/pdf','La descarga PDF tiene MIME correcto');
assert.ok(pdf.size>400,'El archivo PDF se construye');
professional.close();patient.close();
console.log('OK: 30 figuras, alta y edición de muñecos en ambas vistas, preguntas privadas y exportación PDF.');
