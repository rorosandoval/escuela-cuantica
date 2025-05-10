let cellCount = 1;

function login() {
  document.querySelector('.login-screen').style.display = 'none';
  document.getElementById('app').style.display = 'grid';
}

function agregarCelda() {
  const content = document.getElementById('content');
  const nuevaCelda = document.createElement('div');
  nuevaCelda.classList.add('cell', 'code');
  nuevaCelda.innerHTML = `
    <strong>In [${cellCount++}]:</strong>
    <textarea rows="4">// nueva celda</textarea>
  `;
  content.appendChild(nuevaCelda);
}

function eliminarCelda() {
  const content = document.getElementById('content');
  const celdas = content.querySelectorAll('.cell');
  if (celdas.length > 0) {
    content.removeChild(celdas[celdas.length - 1]);
    cellCount--;
  }
}

async function ejecutarCeldas() {
  const celdas = document.querySelectorAll('.cell.code');

  for (const celda of celdas) {
    const textarea = celda.querySelector('textarea');
    const codigo = textarea.value;

    const res = await fetch('http://localhost:8000/ejecutar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: codigo })
    });

    const data = await res.json();

    let output = celda.querySelector('.output');
    if (!output) {
      output = document.createElement('div');
      output.className = 'output';
      output.style.marginTop = '10px';
      output.style.color = 'lime';
      celda.appendChild(output);
    }
    output.textContent = data.output;
  }
}

function cargarNotebook() {
  const input = document.getElementById('upload');
  const file = input.files[0];

  if (file) {
    const reader = new FileReader();
    reader.onload = function(e) {
      try {
        const notebook = JSON.parse(e.target.result);
        renderNotebook(notebook);
      } catch (err) {
        alert("Archivo no válido: " + err.message);
      }
    };
    reader.readAsText(file);
  }
}

function renderNotebook(notebook) {
  const content = document.getElementById('content');
  content.innerHTML = "";
  cellCount = 1;

  notebook.cells.forEach(celda => {
    const div = document.createElement('div');
    div.classList.add('cell');

    if (celda.cell_type === 'code') {
      div.classList.add('code');
      const codigo = celda.source.join('');
      div.innerHTML = `
        <strong>In [${cellCount++}]:</strong>
        <textarea rows="4">${codigo}</textarea>
      `;
    } else if (celda.cell_type === 'markdown') {
      div.classList.add('text');
      const texto = celda.source.join('');
      div.innerHTML = `<div>${marked.parse(texto)}</div>`;
    }

    content.appendChild(div);
  });
}

/* Guardar notebook */
function guardarNotebook() {
  const cells = [];
  const cellElements = document.querySelectorAll('.cell');

  cellElements.forEach(cell => {
    if (cell.classList.contains('code')) {
      const codigo = cell.querySelector('textarea').value;
      cells.push({
        cell_type: "code",
        execution_count: null,
        metadata: {},
        outputs: [],
        source: codigo.split('\n').map(linea => linea + '\n')
      });
    } else if (cell.classList.contains('text')) {
      const texto = cell.innerText;
      cells.push({
        cell_type: "markdown",
        metadata: {},
        source: texto.split('\n').map(linea => linea + '\n')
      });
    }
  });

  const notebook = {
    cells: cells,
    metadata: {
      kernelspec: {
        display_name: "Python 3",
        language: "python",
        name: "python3"
      },
      language_info: {
        name: "python",
        version: "3.9"
      }
    },
    nbformat: 4,
    nbformat_minor: 2
  };

  const blob = new Blob([JSON.stringify(notebook, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = "notebook_guardado.ipynb";
  a.click();
  URL.revokeObjectURL(url);
}


/* ejecutar notebooks */
function cargarDesdeArchivo(ruta) {
  fetch(ruta)
    .then(res => res.json())
    .then(content => {
      const notebookDiv = document.getElementById("content");
      notebookDiv.innerHTML = "";
      content.cells.forEach(cell => {
        const div = document.createElement("div");
        div.className = "cell";
        if (cell.cell_type === "markdown") {
          div.innerHTML = '<strong>Markdown:</strong><p>' + cell.source.join('').replace(/\\n/g, '<br>') + '</p>';
        } else if (cell.cell_type === "code") {
          div.innerHTML = '<strong>Python:</strong><pre>' + cell.source.join('') + '</pre>';
        }
        notebookDiv.appendChild(div);
      });
    })
    .catch(err => alert("Error al cargar el notebook: " + err));
}

