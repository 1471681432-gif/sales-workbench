const fs = require('fs');
const html = fs.readFileSync('desktop.html', 'utf8');

// Extract inline scripts in order
const scripts = [];
const regex = /<script(?![^>]*src=)[^>]*>([\s\S]*?)<\/script>/g;
let m;
while ((m = regex.exec(html)) !== null) {
  scripts.push(m[1]);
}

// Mock browser environment
const mockStorage = {};
global.localStorage = {
  getItem: (k) => mockStorage[k] || null,
  setItem: (k, v) => { mockStorage[k] = v; },
  removeItem: (k) => { delete mockStorage[k]; }
};

const elements = {};
global.document = {
  getElementById: (id) => {
    if (!elements[id]) {
      elements[id] = {
        id, innerHTML: '', textContent: '', value: '', style: {},
        classList: { add(){}, remove(){}, toggle(){}, contains: () => false },
        addEventListener(){}, querySelectorAll: () => [], querySelector: () => null,
        appendChild(){}, remove(){}, scrollTop: 0, getContext: () => null
      };
    }
    return elements[id];
  },
  querySelectorAll: () => [], querySelector: () => null,
  createElement: (tag) => ({
    id:'', innerHTML:'', style:{}, className:'', textContent:'',
    appendChild(){}, click(){}, classList:{add(){},remove(){}}
  }),
  addEventListener(){}, body:{ appendChild(){} }
};

global.window = {
  innerWidth:1400, scrollTo(){}, matchMedia:()=>({matches:false}),
  addEventListener(){}, location:{href:''}
};
global.navigator = { userAgent:'Mozilla/5.0' };
global.Chart = class { constructor(){ this.data={}; } };
global.Tesseract = { createWorker:()=>({}) };
global.Image = class { constructor(){ this.src=''; } };
global.URL = { createObjectURL:()=>'blob:mock' };
global.FileReader = class { readAsDataURL(){} };
global.Blob = class {};
global.requestAnimationFrame = (fn)=>fn();
global.fetch = ()=>Promise.resolve({ok:true,json:()=>Promise.resolve({})});

// Step 1: Load shared.js
console.log('=== Loading shared.js ===');
try {
  eval(fs.readFileSync('shared.js', 'utf8'));
  console.log('OK. KEY_P=' + KEY_P);
} catch(e) {
  console.log('shared.js ERROR: ' + e.message);
  console.log(e.stack.split('\n').slice(0,3).join('\n'));
  process.exit(1);
}

// Step 2: Run each inline script
console.log('=== Running ' + scripts.length + ' inline scripts ===');
for (let i = 0; i < scripts.length; i++) {
  try {
    eval(scripts[i]);
    console.log('Script #' + (i+1) + ': OK');
  } catch(e) {
    console.log('Script #' + (i+1) + ' ERROR: ' + e.message);
    console.log('Stack: ' + e.stack.split('\n').slice(0,3).join(' | '));
    // Try to find which line
    const lines = scripts[i].split('\n');
    for (let j = 1; j <= lines.length; j++) {
      try {
        eval(lines.slice(0, j).join('\n'));
      } catch(e2) {
        console.log('  Crash at line ' + j + ': ' + lines[j-1].trim().substring(0, 100));
        break;
      }
    }
  }
}

console.log('=== Final check ===');
console.log('dashboardHtml: ' + typeof dashboardHtml);
console.log('render: ' + typeof render);
console.log('go: ' + typeof go);
console.log('seedIfEmpty: ' + typeof seedIfEmpty);
console.log('projects in storage: ' + (mockStorage['sw_projects'] ? JSON.parse(mockStorage['sw_projects']).length : 0));
