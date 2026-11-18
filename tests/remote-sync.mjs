import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {JSDOM} from 'jsdom';

// Dos navegadores con sus propias sesiones, unidos SOLO por un servidor de
// mensajería simulado. No comparten memoria de la aplicación ni sessionStorage.
const html=readFileSync('index.html','utf8');
const js=readFileSync('app.js','utf8').replace(
  /^import\s+\{\s*createClient\s*\}.*\n/,
  'const createClient = window.__mockCreateClient;\n'
);
const tick=(ms=65)=>new Promise(resolve=>setTimeout(resolve,ms));
const clone=value=>JSON.parse(JSON.stringify(value));
const rooms=new Map();
const stored={session:null};
let dropBroadcast=false;
let serial=0;

function makeClient(){
  let active=null;
  const subscriptions=[];
  const db={
    auth:{
      signInWithPassword:async()=>({data:{user:{id:'professional'}}}),
      signInAnonymously:async()=>({data:{user:{id:'patient'}}}),
      signOut:async()=>({error:null})
    },
    rpc:async(name,args)=>{
      if(name==='cope_create_session'){
        stored.session={id:'remote-session',access_code:'TESTNETWORK',board:{kind:'circles-belonging',figures:[]}};
        return {data:clone(stored.session)};
      }
      if(name==='cope_update_board'){
        assert.equal(args.p_id,'remote-session');
        stored.session.board=clone(args.p_board);
        // Sin disparar postgres_changes: debe funcionar aunque la tabla
        // no esté incluida en la publicación de Realtime.
        return {data:clone(stored.session.board)};
      }
      if(name==='cope_join_session'){
        assert.equal(args.p_code,'TESTNETWORK');
        return {data:clone(stored.session)};
      }
      if(name==='cope_close_session')return {data:true};
      throw new Error('Unexpected RPC '+name);
    },
    channel(topic,options){
      const callbacks=new Map();
      const room=rooms.get(topic)||new Set();
      rooms.set(topic,room);
      const c={
        topic,role:null,id:++serial,online:true,subStatus:null,
        on(type,filter,fn){
          const key=type+':'+filter.event;
          const list=callbacks.get(key)||[];list.push(fn);callbacks.set(key,list);
          return this;
        },
        emit(type,event,payload){
          for(const fn of callbacks.get(type+':'+event)||[])fn(payload);
        },
        subscribe(fn){
          this.subStatus=fn;
          room.add(this);
          queueMicrotask(()=>fn('SUBSCRIBED'));
          return this;
        },
        presenceState(){
          const data={};
          for(const member of room){
            if(!member.online || !member.role)continue;
            data[member.id]=[{role:member.role,clientId:member.clientId}];
          }
          return data;
        },
        async track(meta){
          this.role=meta.role;this.clientId=meta.clientId;
          for(const member of room)if(member.online)member.emit('presence','sync');
          return 'ok';
        },
        async send(message){
          if(!this.online)return 'error';
          if(dropBroadcast)return 'ok';
          for(const member of room){
            if(member===this||!member.online)continue;
            queueMicrotask(()=>member.emit(message.type,message.event,{payload:clone(message.payload)}));
          }
          return 'ok';
        }
      };
      subscriptions.push(c);
      active=c;
      return c;
    },
    removeChannel(channel){
      rooms.get(channel.topic)?.delete(channel);
      return Promise.resolve();
    },
    _channel:()=>active,
    _channels:subscriptions
  };
  return db;
}
function boot(){
  const dom=new JSDOM(html,{
    url:'https://armandmu.github.io/circulos-pertenencia/',
    runScripts:'outside-only',
    pretendToBeVisual:true
  });
  const db=makeClient();
  dom.window.__mockCreateClient=()=>db;
  dom.window.TextEncoder=globalThis.TextEncoder;
  Object.defineProperty(dom.window.crypto,'randomUUID',{configurable:true,value:()=>('figure-'+(++serial))});
  dom.window.eval(js);
  return {w:dom.window,db,close:()=>dom.window.close()};
}
async function submit(instance,id){
  instance.w.document.getElementById(id).dispatchEvent(
    new instance.w.Event('submit',{cancelable:true,bubbles:true})
  );
  await tick();
}
async function add(instance,label){
  instance.w.document.getElementById('newFigureName').value=label;
  instance.w.document.getElementById('addFigure').click();
  await tick();
}
const professional=boot();
professional.w.document.getElementById('therapistEmail').value='professional@example.com';
professional.w.document.getElementById('therapistPassword').value='not-a-real-password';
await submit(professional,'therapistForm');
assert.match(professional.w.document.getElementById('peerStatus').textContent,/Esperando al paciente/);

const patient=boot();
patient.w.document.getElementById('patientCode').value='TESTNETWORK';
await submit(patient,'patientForm');
await tick();

assert.match(professional.w.document.getElementById('peerStatus').textContent,/Paciente conectado/,
  'Psicólogo detecta una conexión real del paciente');
assert.match(patient.w.document.getElementById('peerStatus').textContent,/Psicólogo conectado/,
  'Paciente detecta la presencia real del profesional');
await add(professional,'Madre');
assert.match(patient.w.document.getElementById('figuresLayer').textContent,/Madre/,
  'La figura del psicólogo llega a otra sesión/otro navegador');
await add(patient,'Amigo');
assert.match(professional.w.document.getElementById('figuresLayer').textContent,/Amigo/,
  'La figura del paciente llega al psicólogo');

dropBroadcast=true;
await add(professional,'Abuela');
assert.doesNotMatch(patient.w.document.getElementById('figuresLayer').textContent,/Abuela/,
  'Sin mensajes, el tablero remoto no se actualiza mágicamente');
dropBroadcast=false;
patient.w.eval('requestLatestBoard()');
await tick();
assert.match(patient.w.document.getElementById('figuresLayer').textContent,/Abuela/,
  'La pantalla recupera el último estado tras la pérdida del mensaje');

const pChannel=patient.db._channel();
pChannel.online=false;
pChannel.subStatus('TIMED_OUT',new Error('Simulated network outage'));
await tick();
assert.match(patient.w.document.getElementById('connectionStatus').textContent,/Sin conexión al servidor/,
  'Una desconexión no puede mostrarse como conectado');
await add(professional,'Persona cuarta');
pChannel.online=true;
pChannel.subStatus('SUBSCRIBED');
await tick();
assert.match(patient.w.document.getElementById('figuresLayer').textContent,/Persona cuarta/,
  'Tras reconectar se recuperan los cambios que faltaban');
assert.match(patient.w.document.getElementById('peerStatus').textContent,/Psicólogo conectado/,
  'Se restablece la presencia entre ambos');

professional.close();
patient.close();
console.log('OK: dos clientes aislados intercambian cambios y recuperan la conexión tras cortes.');
