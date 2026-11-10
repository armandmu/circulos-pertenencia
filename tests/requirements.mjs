import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const js = readFileSync('app.js', 'utf8');
const html = readFileSync('index.html', 'utf8');
const css = readFileSync('styles.css', 'utf8');

const bounds = Array.from(js.matchAll(/\bouter:(\d+), inner:(\d+)/g), match => [Number(match[1]), Number(match[2])]);
assert.equal(bounds.length, 6, 'Se requieren seis círculos');
assert.deepEqual(bounds.map(([outer, inner]) => outer - inner), [74,74,74,74,74,74], 'Franja ancha de 74 unidades');
assert.equal(bounds[5][1], 45, 'Centro blanco sin texto');
assert.match(html, /id="circleBoard" viewBox="0 0 1040 1040"/, 'Tamaño del tablero');
assert.doesNotMatch(js, /text-anchor="middle">YO<\/text>/, 'No debe aparecer YO en el centro');
assert.doesNotMatch(html, /Centro blanco · «Yo»/, 'Sin YO en pie de tablero');

const colors = js.match(/const COLORS = \[([^\]]+)\];/)?.[1]?.match(/#[\dA-Fa-f]{6}/g);
assert.equal(colors?.length, 30, 'Hay 30 modelos de muñecos');
assert.equal(new Set(colors).size, 30, 'Colores diferentes para los 30 muñecos');
assert.match(js, /function canEditFigures\(\)/, 'Permiso de edición compartido');
assert.match(js, /state\.role === 'patient' \|\| state\.role === 'therapist'/, 'Ambos roles pueden editar');
assert.match(js, /hidden=!canEditFigures\(\)\|\|!item/, 'Editor compartido');
assert.match(js, /if\(!canEditFigures\(\)\)return;/, 'Guardado compartido');
assert.match(html, /class="side-card figure-tools-card"/, 'Catálogo compartido');
assert.match(html, /id="editCard" class="side-card" hidden/, 'Editor compartido');
assert.ok(html.indexOf('id="editCard"') < html.indexOf('id="figureCatalog"'), 'Editar figura debe estar encima del catálogo');
assert.match(js, /addEventListener\('dblclick'/, 'Editar el nombre con doble clic');
assert.match(html, /id="questionsPanel" class="questions-panel professional-only"/, 'Preguntas exclusivas de la interfaz profesional');
assert.match(js, /textPath href="#arc-/, 'Los nombres siguen sus franjas circulares');
console.log('OK: seis círculos anchos, centro blanco, 30 muñecos y edición compartida.');
