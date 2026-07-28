const fs = require('fs');

const html = fs.readFileSync('desktop.html', 'utf8');
const lines = html.split('\n');

// Build clean version
const cleanLines = [];

// 1. Head + CSS + Body HTML (lines 1-562)
// But remove the _startupDebug div
for (let i = 0; i < 562; i++) {
  const line = lines[i];
  if (line.includes('_startupDebug') || line.includes('Waiting for JS')) continue;
  // Fix pageContent div to be empty
  if (line.includes('<div id="pageContent">')) {
    cleanLines.push(line);
    // Skip the next line if it's the debug div
    if (i+1 < 562 && lines[i+1].includes('_startupDebug')) {
      i++; // skip it
    }
    continue;
  }
  cleanLines.push(line);
}

// 2. Skip test script (lines 563-576)
// 3. CDN scripts (lines 577-578)
for (let i = 577; i <= 578; i++) {
  cleanLines.push(lines[i]);
}

// 4. Inlined shared.js (lines 579-907) but remove seedIfEmpty() call
for (let i = 579; i <= 907; i++) {
  let line = lines[i];
  // Remove seedIfEmpty() call from shared.js
  if (line.trim() === 'seedIfEmpty();') {
    line = '// seedIfEmpty() moved to startup below';
  }
  cleanLines.push(line);
}

// 5. Main script (lines 908 up to, but NOT including, </script> on line 3275)
// We need to:
// - Include JS code lines (908-3274)
// - Add clean startup BEFORE </script>
// - Then close </script>, </body>, </html>
let inDebugStartup = false;
for (let i = 908; i < 3275; i++) {
  const line = lines[i];
  
  // Skip debug startup block (line 3179 "启动（带调试）" through line 3201 "}")
  if (line.includes('// 启动（带调试）')) {
    inDebugStartup = true;
    continue;
  }
  if (inDebugStartup) {
    if (line.trim() === '}' && !line.includes('{')) {
      inDebugStartup = false;
      continue;
    }
    continue;
  }
  
  cleanLines.push(line);
}

// 6. Add clean startup + window.onerror
cleanLines.push('');
cleanLines.push('/* ============ 启动 ============ */');
cleanLines.push('// 全局错误捕获 - 任何 JS 错误都会显示在页面上');
cleanLines.push('window.onerror = function(msg, src, lineNo, colNo, err) {');
cleanLines.push('  var pc = document.getElementById("pageContent");');
cleanLines.push('  if (pc) {');
cleanLines.push('    pc.innerHTML = "<div style=\\"padding:40px;background:#fee2e2;border-radius:12px;margin:20px\\"><h2 style=\\"color:#dc2626\\">❌ 脚本错误</h2><p><b>错误信息：</b>" + msg + "</p><p><b>位置：</b>行 " + lineNo + "</p><p style=\\"margin-top:10px;font-size:12px;color:#666\\">请截图此错误信息发给开发者</p></div>";');
cleanLines.push('  }');
cleanLines.push('  return true; // 阻止浏览器默认报错');
cleanLines.push('};');
cleanLines.push('');
cleanLines.push('(function() {');
cleanLines.push('  try {');
cleanLines.push('    // 1. 初始化种子数据（仅首次）');
cleanLines.push('    seedIfEmpty();');
cleanLines.push('    ');
cleanLines.push('    // 2. 渲染页面');
cleanLines.push('    render();');
cleanLines.push('    ');
cleanLines.push('    // 3. 如果页面有图表，初始化图表');
cleanLines.push('    if (typeof initTargetChart === "function" && currentPage === "dashboard") {');
cleanLines.push('      setTimeout(initTargetChart, 100);');
cleanLines.push('    }');
cleanLines.push('  } catch(e) {');
cleanLines.push('    var pc2 = document.getElementById("pageContent");');
cleanLines.push('    if (pc2) {');
cleanLines.push('      pc2.innerHTML = "<div style=\\"padding:40px;background:#fee2e2;border-radius:12px;margin:20px\\"><h2 style=\\"color:#dc2626\\">❌ 启动失败</h2><p>" + e.message + "</p><pre style=\\"font-size:12px;overflow:auto\\">" + (e.stack || "无堆栈") + "</pre></div>";');
cleanLines.push('    }');
cleanLines.push('  }');
cleanLines.push('})();');
cleanLines.push('');
cleanLines.push('</script>');
cleanLines.push('</body>');
cleanLines.push('</html>');

fs.writeFileSync('index.html', cleanLines.join('\n'), 'utf8');

// Verify syntax
try {
  // Extract all inline scripts and check syntax
  const content = fs.readFileSync('index.html', 'utf8');
  const re = /<script(?![^>]*src=)[^>]*>([\s\S]*?)<\/script>/g;
  let m, i = 0, ok = true;
  while ((m = re.exec(content)) !== null) {
    i++;
    try {
      new Function(m[1]);
      console.log('Script block ' + i + ': SYNTAX OK (' + m[1].split('\n').length + ' lines)');
    } catch(e) {
      console.log('Script block ' + i + ': SYNTAX ERROR - ' + e.message);
      ok = false;
    }
  }
  console.log('');
  console.log('Total script blocks:', i);
  console.log(ok ? 'ALL CLEAN ✓' : 'HAS ERRORS ✗');
  console.log('Output: index.html (' + content.split('\n').length + ' lines)');
} catch(e) {
  console.error('Verification failed:', e.message);
}
