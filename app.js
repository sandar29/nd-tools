// ----------------------------------------------------
// 1. LOGIKA LIGHT / DARK MODE
// ----------------------------------------------------
function initTheme() {
  const savedTheme = localStorage.getItem('theme');
  const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

  if (savedTheme === 'dark' || (!savedTheme && systemPrefersDark)) {
    document.documentElement.classList.add('dark');
    updateThemeIcon(true);
  } else {
    document.documentElement.classList.remove('dark');
    updateThemeIcon(false);
  }
}

function toggleTheme() {
  const isDark = document.documentElement.classList.toggle('dark');
  localStorage.setItem('theme', isDark ? 'dark' : 'light');
  updateThemeIcon(isDark);
}

function updateThemeIcon(isDark) {
  const iconEl = document.getElementById('themeIcon');
  if (!iconEl) return;

  if (isDark) {
    iconEl.setAttribute('data-lucide', 'sun');
    iconEl.className = 'w-4 h-4 text-amber-400';
  } else {
    iconEl.setAttribute('data-lucide', 'moon');
    iconEl.className = 'w-4 h-4 text-indigo-600';
  }

  if (window.lucide) {
    lucide.createIcons();
  }
}

// ----------------------------------------------------
// 2. LOGIKA CUSTOM MODAL NOTIFIKASI
// ----------------------------------------------------
let currentModalText = '';

function showCustomModal(title, text, subtitle = 'Informasi', iconName = 'check-circle-2', showCopy = true) {
  currentModalText = text;

  const titleEl = document.getElementById('modalTitle');
  const subtitleEl = document.getElementById('modalSubtitle');
  const bodyEl = document.getElementById('modalBody');

  if (titleEl) titleEl.innerText = title;
  if (subtitleEl) subtitleEl.innerText = subtitle;
  if (bodyEl) bodyEl.innerText = text;

  const copyBtn = document.getElementById('btnCopyModal');
  if (copyBtn) {
    copyBtn.style.display = showCopy ? 'flex' : 'none';
  }

  const iconEl = document.getElementById('modalIcon');
  if (iconEl) {
    iconEl.setAttribute('data-lucide', iconName);
    if (window.lucide) lucide.createIcons();
  }

  const modal = document.getElementById('customModal');
  const card = document.getElementById('modalCard');

  if (modal && card) {
    modal.classList.remove('hidden');
    setTimeout(() => {
      modal.classList.remove('opacity-0');
      card.classList.remove('scale-95');
      card.classList.add('scale-100');
    }, 10);
  }
}

function closeCustomModal() {
  const modal = document.getElementById('customModal');
  const card = document.getElementById('modalCard');

  if (modal && card) {
    modal.classList.add('opacity-0');
    card.classList.remove('scale-100');
    card.classList.add('scale-95');

    setTimeout(() => {
      modal.classList.add('hidden');
    }, 200);
  }
}

function copyModalContent() {
  if (currentModalText) {
    navigator.clipboard.writeText(currentModalText);
    const copyBtn = document.getElementById('btnCopyModal');
    if (copyBtn) {
      copyBtn.innerHTML = `<i data-lucide="check" class="w-3.5 h-3.5"></i><span>Tersalin!</span>`;
      if (window.lucide) lucide.createIcons();

      setTimeout(() => {
        copyBtn.innerHTML = `<i data-lucide="copy" class="w-3.5 h-3.5"></i><span>Salin Teks</span>`;
        if (window.lucide) lucide.createIcons();
      }, 1500);
    }
  }
}

// ----------------------------------------------------
// 3. INISIALISASI & EVENT LISTENERS UTAMA
// ----------------------------------------------------
document.addEventListener("DOMContentLoaded", () => {
  initTheme();
  loadNotes();

  if (window.lucide) {
    lucide.createIcons();
  }

  // Auto-connect Dropzones ke Input File
  const dropzones = [
    { area: 'drop-merge', input: 'mergeInput' },
    { area: 'drop-split', input: 'splitInput' },
    { area: 'drop-compress', input: 'compressInput' },
    { area: 'drop-edit', input: 'editInput' },
    { area: 'drop-pdf2word', input: 'pdf2wordInput' },
    { area: 'drop-word2pdf', input: 'word2pdfInput' }
  ];

  dropzones.forEach(item => {
    const areaEl = document.getElementById(item.area);
    const inputEl = document.getElementById(item.input);
    if (areaEl && inputEl) {
      areaEl.onclick = () => inputEl.click();
    }
  });

  if (document.getElementById('unitFromSelect')) {
    setUnitCategory('length');
  }
});

// Switcher Tab Navigasi
function showTab(tabId) {
  document.querySelectorAll(".tab-content").forEach((el) => {
    el.classList.add("hidden");
  });
  const target = document.getElementById(tabId);
  if (target) {
    target.classList.remove("hidden");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  if (window.lucide) {
    lucide.createIcons();
  }
}

// Helper Download File
function downloadFile(data, filename, type) {
  const blob = new Blob([data], { type: type });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
}

// ----------------------------------------------------
// 4. LOGIKA MERGE PDF
// ----------------------------------------------------
let mergeFiles = [];

function handleMergeFiles(files) {
  for (let file of files) {
    if (file.type === 'application/pdf') {
      mergeFiles.push(file);
    }
  }
  renderMergeList();
}

function renderMergeList() {
  const container = document.getElementById('mergeFileList');
  if (!container) return;
  container.innerHTML = '';

  mergeFiles.forEach((file, index) => {
    const item = document.createElement('div');
    item.className = 'flex items-center justify-between p-3 bg-slate-100 dark:bg-slate-900/80 rounded-xl border border-slate-200 dark:border-slate-700/50 text-xs text-slate-800 dark:text-slate-300';
    item.innerHTML = `
      <div class="flex items-center gap-2 truncate">
        <i data-lucide="file" class="w-4 h-4 text-blue-500 shrink-0"></i>
        <span class="truncate">${file.name}</span>
      </div>
      <button onclick="removeMergeFile(${index})" class="text-rose-500 hover:text-rose-400 p-1">
        <i data-lucide="trash-2" class="w-4 h-4"></i>
      </button>
    `;
    container.appendChild(item);
  });

  if (window.lucide) lucide.createIcons();
}

function removeMergeFile(index) {
  mergeFiles.splice(index, 1);
  renderMergeList();
}

async function processMergePDF() {
  if (mergeFiles.length < 2) return showCustomModal('Peringatan', 'Silakan pilih minimal 2 file PDF untuk digabungkan!', 'Aksi Membutuhkan Berkas', 'alert-circle', false);
  
  try {
    const { PDFDocument } = PDFLib;
    const mergedPdf = await PDFDocument.create();

    for (let file of mergeFiles) {
      const buffer = await file.arrayBuffer();
      const pdf = await PDFDocument.load(buffer);
      const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
      copiedPages.forEach(page => mergedPdf.addPage(page));
    }

    const pdfBytes = await mergedPdf.save();
    downloadFile(pdfBytes, 'Merged_Document.pdf', 'application/pdf');
  } catch (err) {
    showCustomModal('Gagal Menggabungkan PDF', err.message, 'Kesalahan Sistem', 'alert-circle', false);
  }
}

// ----------------------------------------------------
// 5. LOGIKA SPLIT PDF (PREVIEW & THUMBNAIL)
// ----------------------------------------------------
let selectedSplitFile = null;
let selectedSplitPages = new Set();

async function handleSplitFile(file) {
  if (!file) return;
  selectedSplitFile = file;
  selectedSplitPages.clear();

  document.getElementById('splitFileName').innerText = file.name;
  document.getElementById('splitInfo').classList.remove('hidden');
  document.getElementById('btnSplit').disabled = false;

  const container = document.getElementById('splitThumbnailGrid');
  container.innerHTML = '<div class="col-span-full py-8 text-center text-slate-400 text-xs">Memuat thumbnail halaman...</div>';

  try {
    if (typeof pdfjsLib !== 'undefined') {
      pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';
    }

    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

    document.getElementById('splitPageCount').innerText = `${pdf.numPages} Halaman Terdeteksi`;
    container.innerHTML = '';

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const viewport = page.getViewport({ scale: 0.5 });

      const card = document.createElement('div');
      card.className = `relative cursor-pointer border-2 border-slate-300 dark:border-slate-700/80 hover:border-emerald-500 rounded-lg p-2 bg-white dark:bg-slate-900 flex flex-col items-center transition-all select-none`;
      card.dataset.page = i;

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.height = viewport.height;
      canvas.width = viewport.width;
      canvas.className = 'rounded border border-slate-200 dark:border-slate-700 block max-w-full h-auto mb-2';

      const renderTask = page.render({ canvasContext: ctx, viewport: viewport });
      await renderTask.promise;

      card.appendChild(canvas);

      const label = document.createElement('span');
      label.className = 'text-[11px] font-semibold text-slate-500 dark:text-slate-400 mt-1';
      label.innerText = `Hal ${i}`;
      card.appendChild(label);

      card.onclick = () => togglePageSelection(i, card);
      container.appendChild(card);
    }
  } catch (err) {
    console.error(err);
    container.innerHTML = `<div class="col-span-full py-4 text-center text-rose-500 text-xs">Gagal memuat thumbnail: ${err.message}</div>`;
  }
}

function togglePageSelection(pageNum, cardElement) {
  if (selectedSplitPages.has(pageNum)) {
    selectedSplitPages.delete(pageNum);
    cardElement.classList.remove('border-emerald-500', 'bg-emerald-500/10');
    cardElement.classList.add('border-slate-300', 'dark:border-slate-700/80', 'bg-white', 'dark:bg-slate-900');
  } else {
    selectedSplitPages.add(pageNum);
    cardElement.classList.add('border-emerald-500', 'bg-emerald-500/10');
    cardElement.classList.remove('border-slate-300', 'dark:border-slate-700/80', 'bg-white', 'dark:bg-slate-900');
  }
  updateSplitSelectionUI();
}

function selectAllSplitPages(selectAll) {
  const cards = document.querySelectorAll('#splitThumbnailGrid > div');
  cards.forEach(card => {
    const pageNum = parseInt(card.dataset.page);
    if (selectAll) {
      selectedSplitPages.add(pageNum);
      card.classList.add('border-emerald-500', 'bg-emerald-500/10');
      card.classList.remove('border-slate-300', 'dark:border-slate-700/80', 'bg-white', 'dark:bg-slate-900');
    } else {
      selectedSplitPages.delete(pageNum);
      card.classList.remove('border-emerald-500', 'bg-emerald-500/10');
      card.classList.add('border-slate-300', 'dark:border-slate-700/80', 'bg-white', 'dark:bg-slate-900');
    }
  });
  updateSplitSelectionUI();
}

function updateSplitSelectionUI() {
  const count = selectedSplitPages.size;
  document.getElementById('selectedPagesCount').innerText = count;
  const sorted = Array.from(selectedSplitPages).sort((a, b) => a - b);
  document.getElementById('splitRange').value = sorted.join(', ');
}

function syncRangeToSelection() {
  const val = document.getElementById('splitRange').value.trim();
  selectedSplitPages.clear();

  if (val && selectedSplitFile) {
    const parts = val.split(',');
    parts.forEach(p => {
      p = p.trim();
      if (p.includes('-')) {
        const [start, end] = p.split('-').map(Number);
        if (start && end) {
          for (let i = start; i <= end; i++) selectedSplitPages.add(i);
        }
      } else if (Number(p)) {
        selectedSplitPages.add(Number(p));
      }
    });
  }

  const cards = document.querySelectorAll('#splitThumbnailGrid > div');
  cards.forEach(card => {
    const pageNum = parseInt(card.dataset.page);
    if (selectedSplitPages.has(pageNum)) {
      card.classList.add('border-emerald-500', 'bg-emerald-500/10');
      card.classList.remove('border-slate-300', 'dark:border-slate-700/80', 'bg-white', 'dark:bg-slate-900');
    } else {
      card.classList.remove('border-emerald-500', 'bg-emerald-500/10');
      card.classList.add('border-slate-300', 'dark:border-slate-700/80', 'bg-white', 'dark:bg-slate-900');
    }
  });
  document.getElementById('selectedPagesCount').innerText = selectedSplitPages.size;
}

async function processSplitPDF() {
  if (!selectedSplitFile || selectedSplitPages.size === 0) {
    return showCustomModal('Peringatan', 'Pilih minimal 1 halaman PDF untuk diekstrak!', 'Halaman Belum Dipilih', 'alert-circle', false);
  }

  try {
    const buffer = await selectedSplitFile.arrayBuffer();
    const pdf = await PDFLib.PDFDocument.load(buffer);
    const newPdf = await PDFLib.PDFDocument.create();

    const pageIndices = Array.from(selectedSplitPages).sort((a, b) => a - b).map(p => p - 1);
    const copiedPages = await newPdf.copyPages(pdf, pageIndices);
    copiedPages.forEach(page => newPdf.addPage(page));

    const pdfBytes = await newPdf.save();
    downloadFile(pdfBytes, `Split_${selectedSplitFile.name}`, 'application/pdf');
  } catch (err) {
    showCustomModal('Gagal Pemisahan PDF', err.message, 'Kesalahan Proses', 'alert-circle', false);
  }
}

// ----------------------------------------------------
// 6. LOGIKA COMPRESS PDF
// ----------------------------------------------------
let selectedCompressFile = null;

function handleCompressFile(file) {
  if (!file) return;
  selectedCompressFile = file;

  document.getElementById('compressFileName').innerText = file.name;
  document.getElementById('compressFileSize').innerText = `${(file.size / (1024 * 1024)).toFixed(2)} MB`;
  document.getElementById('compressInfo').classList.remove('hidden');
  document.getElementById('btnCompress').disabled = false;
}

async function processCompressPDF() {
  if (!selectedCompressFile) return;
  const quality = parseFloat(document.getElementById('compressQuality').value);

  showCustomModal('Proses Kompresi Berjalan', 'Mohon tunggu sebentar, sistem sedang mengoptimalkan gambar di dalam dokumen...', 'Harap Tunggu', 'minimize-2', false);

  try {
    const arrayBuffer = await selectedCompressFile.arrayBuffer();
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';

    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdfDoc = await loadingTask.promise;
    const newPdf = await PDFLib.PDFDocument.create();

    for (let i = 1; i <= pdfDoc.numPages; i++) {
      const page = await pdfDoc.getPage(i);
      const viewport = page.getViewport({ scale: 1.2 });

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.height = viewport.height;
      canvas.width = viewport.width;

      await page.render({ canvasContext: ctx, viewport: viewport }).promise;

      const imgDataUrl = canvas.toDataURL('image/jpeg', quality);
      const imgBytes = await fetch(imgDataUrl).then(res => res.arrayBuffer());
      const image = await newPdf.embedJpg(imgBytes);

      const newPage = newPdf.addPage([viewport.width, viewport.height]);
      newPage.drawImage(image, { x: 0, y: 0, width: viewport.width, height: viewport.height });
    }

    const pdfBytes = await newPdf.save();
    closeCustomModal();
    downloadFile(pdfBytes, `Compressed_${selectedCompressFile.name}`, 'application/pdf');
  } catch (err) {
    showCustomModal('Gagal Mengompres PDF', err.message, 'Kesalahan Proses', 'alert-circle', false);
  }
}

// ----------------------------------------------------
// 7. LOGIKA GAMBAR KE PDF
// ----------------------------------------------------
let selectedImages = [];

function handleImgToPdfFiles(files) {
  for (let file of files) {
    if (file.type.startsWith('image/')) {
      selectedImages.push(file);
    }
  }
  renderImgPreview();
}

function renderImgPreview() {
  const container = document.getElementById('img2pdfPreview');
  const btn = document.getElementById('btnImgToPdf');
  if (!container) return;

  container.innerHTML = '';

  selectedImages.forEach((file, index) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const div = document.createElement('div');
      div.className = 'relative group rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-900 aspect-square';
      div.innerHTML = `
        <img src="${e.target.result}" class="w-full h-full object-cover" />
        <button onclick="removeImg(${index})" class="absolute top-1 right-1 bg-rose-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
          <i data-lucide="x" class="w-3 h-3"></i>
        </button>
      `;
      container.appendChild(div);
      if (window.lucide) lucide.createIcons();
    };
    reader.readAsDataURL(file);
  });

  if (btn) btn.disabled = selectedImages.length === 0;
}

function removeImg(index) {
  selectedImages.splice(index, 1);
  renderImgPreview();
}

async function processImgToPdf() {
  if (selectedImages.length === 0) return;

  try {
    const pdfDoc = await PDFLib.PDFDocument.create();

    for (let file of selectedImages) {
      const buffer = await file.arrayBuffer();
      let image;
      if (file.type === 'image/png') {
        image = await pdfDoc.embedPng(buffer);
      } else {
        image = await pdfDoc.embedJpg(buffer);
      }
      const page = pdfDoc.addPage([image.width, image.height]);
      page.drawImage(image, { x: 0, y: 0, width: image.width, height: image.height });
    }

    const pdfBytes = await pdfDoc.save();
    downloadFile(pdfBytes, 'Images_Converted.pdf', 'application/pdf');
  } catch (err) {
    showCustomModal('Gagal Konversi Gambar', err.message, 'Kesalahan Proses', 'alert-circle', false);
  }
}

// ----------------------------------------------------
// 8. LOGIKA QR CODE GENERATOR
// ----------------------------------------------------
function generateQRCode() {
  const text = document.getElementById('qrInputText').value.trim();
  const container = document.getElementById('qrContainer');
  const resultDiv = document.getElementById('qrResult');

  if (!resultDiv) return;
  resultDiv.innerHTML = '';

  if (!text) return showCustomModal('Peringatan', 'Masukkan teks atau URL terlebih dahulu!', 'Input Kosong', 'alert-circle', false);

  new QRCode(resultDiv, {
    text: text,
    width: 180,
    height: 180,
    colorDark: "#0f172a",
    colorLight: "#ffffff",
    correctLevel: QRCode.CorrectLevel.H
  });

  if (container) container.classList.remove('hidden');
}

function downloadQRCode() {
  const img = document.querySelector('#qrResult img');
  const canvas = document.querySelector('#qrResult canvas');
  let url = '';

  if (img && img.src) url = img.src;
  else if (canvas) url = canvas.toDataURL("image/png");

  if (url) {
    const link = document.createElement('a');
    link.href = url;
    link.download = 'QRCode_Generated.png';
    link.click();
  } else {
    showCustomModal('Gagal Download', 'Kode QR belum siap untuk diunduh.', 'Kesalahan', 'alert-circle', false);
  }
}

// ----------------------------------------------------
// 9. LOGIKA QR CODE SCANNER (HYBRID & RIWAYAT)
// ----------------------------------------------------
let html5QrCodeInstance = null;
let scanHistory = [];

async function startQRScannerManual() {
  const placeholder = document.getElementById('cameraPlaceholder');

  if (!html5QrCodeInstance) {
    html5QrCodeInstance = new Html5Qrcode("reader");
  }

  if (placeholder) placeholder.classList.add('hidden');

  try {
    await html5QrCodeInstance.start(
      { facingMode: "environment" },
      { fps: 10, qrbox: { width: 220, height: 220 } },
      (decodedText) => {
        handleQrSuccess(decodedText);
      },
      (errorMessage) => {
        // Abaikan error per frame
      }
    );
  } catch (err) {
    showCustomModal('Gagal Mengakses Kamera', 'Pastikan izin kamera diizinkan atau gunakan fitur Unggah Gambar.', err.message || err, 'camera-off', false);
    if (placeholder) placeholder.classList.remove('hidden');
  }
}

async function scanQrFromFile(file) {
  if (!file) return;

  if (!html5QrCodeInstance) {
    html5QrCodeInstance = new Html5Qrcode("reader");
  }

  try {
    const decodedText = await html5QrCodeInstance.scanFile(file, true);
    handleQrSuccess(decodedText);
  } catch (err) {
    showCustomModal('QR Tidak Terdeteksi', 'Kode QR tidak terdeteksi pada gambar ini. Coba gunakan gambar yang lebih jelas.', 'Gagal Membaca File', 'alert-circle', false);
  }
}

function handleQrSuccess(text) {
  if (!scanHistory.includes(text)) {
    scanHistory.unshift(text);
    renderScanHistory();
  }
  showCustomModal('Hasil QR Code', text, 'Kode QR berhasil dipindai', 'qr-code', true);
}

function renderScanHistory() {
  const container = document.getElementById('scanHistoryList');
  if (!container) return;

  if (scanHistory.length === 0) {
    container.innerHTML = 'Belum ada riwayat.';
    container.className = 'p-4 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 text-center text-xs text-slate-400 dark:text-slate-500 min-h-[100px] max-h-[180px] overflow-y-auto space-y-2';
    return;
  }

  container.className = 'p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-left text-xs text-slate-800 dark:text-slate-200 min-h-[100px] max-h-[180px] overflow-y-auto space-y-2';
  container.innerHTML = '';

  scanHistory.forEach((item) => {
    const itemEl = document.createElement('div');
    itemEl.className = 'p-2 bg-slate-100 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 break-all font-mono text-[11px] flex justify-between items-start gap-2';
    itemEl.innerHTML = `
      <span>${item}</span>
      <button onclick="copyToClipboard('${item}')" class="text-[10px] text-emerald-600 dark:text-emerald-400 font-sans shrink-0 hover:underline">Salin</button>
    `;
    container.appendChild(itemEl);
  });
}

function copyToClipboard(text) {
  navigator.clipboard.writeText(text);
  showCustomModal('Teks Disalin', text, 'Teks berhasil disalin ke clipboard', 'check', false);
}

// ----------------------------------------------------
// 10. LOGIKA STICKY NOTES MULTI-CARD
// ----------------------------------------------------
let notesData = [];

const noteColors = [
  { bg: 'bg-amber-100/90 dark:bg-amber-100/90 text-slate-900', border: 'border-amber-200', hex: '#fef3c7' },
  { bg: 'bg-blue-100/90 dark:bg-blue-100/90 text-slate-900', border: 'border-blue-200', hex: '#dbeafe' },
  { bg: 'bg-purple-100/90 dark:bg-purple-100/90 text-slate-900', border: 'border-purple-200', hex: '#f3e8ff' },
  { bg: 'bg-pink-100/90 dark:bg-pink-100/90 text-slate-900', border: 'border-pink-200', hex: '#fce7f3' },
  { bg: 'bg-emerald-100/90 dark:bg-emerald-100/90 text-slate-900', border: 'border-emerald-200', hex: '#d1fae5' }
];

function loadNotes() {
  const saved = localStorage.getItem('app_sticky_notes');
  if (saved) {
    try {
      notesData = JSON.parse(saved);
    } catch (e) {
      notesData = [];
    }
  } else {
    notesData = [{ id: Date.now(), content: 'Tulis catatan...', colorIndex: 0, date: getFormattedDate() }];
    saveNotesToStorage();
  }
  renderNotes();
}

function saveNotesToStorage() {
  localStorage.setItem('app_sticky_notes', JSON.stringify(notesData));
  renderNotesCount();
}

function renderNotesCount() {
  const countEl = document.getElementById('notesCount');
  if (countEl) {
    countEl.innerText = `${notesData.length} catatan`;
  }
}

function getFormattedDate() {
  const now = new Date();
  const day = now.getDate();
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agt", "Sep", "Okt", "Nov", "Des"];
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  return `${day} ${monthNames[now.getMonth()]}, ${hours}.${minutes}`;
}

function addNewNote() {
  const newNote = { id: Date.now(), content: '', colorIndex: 0, date: getFormattedDate() };
  notesData.unshift(newNote);
  saveNotesToStorage();
  renderNotes();
}

function updateNoteContent(id, text) {
  const note = notesData.find(n => n.id === id);
  if (note) {
    note.content = text;
    saveNotesToStorage();
  }
}

function changeNoteColor(id, colorIdx) {
  const note = notesData.find(n => n.id === id);
  if (note) {
    note.colorIndex = colorIdx;
    saveNotesToStorage();
    renderNotes();
  }
}

function deleteNote(id) {
  notesData = notesData.filter(n => n.id !== id);
  saveNotesToStorage();
  renderNotes();
}

function renderNotes() {
  const container = document.getElementById('notesGrid');
  if (!container) return;

  const searchKeyword = (document.getElementById('searchNoteInput')?.value || '').toLowerCase();
  container.innerHTML = '';

  const filteredNotes = notesData.filter(n => n.content.toLowerCase().includes(searchKeyword));

  filteredNotes.forEach(note => {
    const color = noteColors[note.colorIndex] || noteColors[0];
    const card = document.createElement('div');
    card.className = `${color.bg} p-4 rounded-2xl shadow-sm border ${color.border} flex flex-col justify-between min-h-[180px] transition-all relative group text-slate-900`;

    let colorDotsHTML = '';
    noteColors.forEach((c, idx) => {
      const isSelected = note.colorIndex === idx;
      colorDotsHTML += `
        <button onclick="changeNoteColor(${note.id}, ${idx})" class="w-3.5 h-3.5 rounded-full border border-slate-400/50 flex items-center justify-center transition-transform hover:scale-110" style="background-color: ${c.hex}">
          ${isSelected ? '<span class="w-1.5 h-1.5 bg-slate-800 rounded-full"></span>' : ''}
        </button>
      `;
    });

    card.innerHTML = `
      <div>
        <div class="flex items-center justify-between gap-1 mb-3">
          <div class="flex items-center gap-1.5">
            ${colorDotsHTML}
          </div>
          <button onclick="deleteNote(${note.id})" class="text-slate-400 hover:text-slate-700 text-xs px-1">✕</button>
        </div>
        <textarea oninput="updateNoteContent(${note.id}, this.value)" placeholder="Tulis catatan..." class="w-full bg-transparent border-none resize-none focus:outline-none text-xs text-slate-800 placeholder-slate-500 font-normal leading-relaxed min-h-[90px]">${note.content}</textarea>
      </div>
      <div class="text-[10px] text-slate-500 mt-2 font-medium">${note.date}</div>
    `;
    container.appendChild(card);
  });

  renderNotesCount();
}

// ----------------------------------------------------
// 11. KONVERSI SATUAN
// ----------------------------------------------------
const unitData = {
  length: { label: "Panjang", units: { m: { name: "Meter (m)", factor: 1 }, km: { name: "Kilometer (km)", factor: 1000 }, cm: { name: "Centimeter (cm)", factor: 0.01 }, mm: { name: "Millimeter (mm)", factor: 0.001 }, ft: { name: "Feet (ft)", factor: 0.3048 }, inch: { name: "Inch (in)", factor: 0.0254 }, mile: { name: "Mile (mi)", factor: 1609.34 } } },
  volume: { label: "Volume", units: { l: { name: "Liter (L)", factor: 1 }, ml: { name: "Milliliter (mL)", factor: 0.001 }, m3: { name: "Meter Kubik (m³)", factor: 1000 }, gal: { name: "Gallon US (gal)", factor: 3.78541 }, barrel: { name: "Oil Barrel (bbl)", factor: 158.987 } } },
  weight: { label: "Berat", units: { kg: { name: "Kilogram (kg)", factor: 1 }, g: { name: "Gram (g)", factor: 0.001 }, ton: { name: "Metric Ton (t)", factor: 1000 }, lbs: { name: "Pound (lbs)", factor: 0.453592 }, oz: { name: "Ounce (oz)", factor: 0.0283495 } } },
  pressure: { label: "Tekanan", units: { bar: { name: "Bar (bar)", factor: 1 }, psi: { name: "PSI (psi)", factor: 0.0689476 }, pascal: { name: "Pascal (Pa)", factor: 0.00001 }, kpa: { name: "KiloPascal (kPa)", factor: 0.01 }, atm: { name: "Atmosphere (atm)", factor: 1.01325 } } },
  temp: { label: "Suhu", units: { c: { name: "Celsius (C)" }, f: { name: "Fahrenheit (F)" }, k: { name: "Kelvin (K)" }, r: { name: "Rankine (R)" } } },
  density: { label: "Densitas", units: { kg_m3: { name: "kg/m³", factor: 1 }, g_cm3: { name: "g/cm³", factor: 1000 }, lbs_ft3: { name: "lbs/ft³", factor: 16.0185 } } },
  flow: { label: "Debit", units: { m3_h: { name: "m³/hour", factor: 1 }, m3_s: { name: "m³/second", factor: 3600 }, l_min: { name: "L/min", factor: 0.06 }, gpm: { name: "Gallon/min (GPM)", factor: 0.227125 } } }
};

let currentCategory = 'length';

function setUnitCategory(category) {
  currentCategory = category;

  Object.keys(unitData).forEach(cat => {
    const btn = document.getElementById(`btnCat-${cat}`);
    if (btn) {
      if (cat === category) {
        btn.className = 'px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold shrink-0 transition-all';
      } else {
        btn.className = 'px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold shrink-0 transition-all';
      }
    }
  });

  const fromSelect = document.getElementById('unitFromSelect');
  const toSelect = document.getElementById('unitToSelect');
  if (!fromSelect || !toSelect) return;

  fromSelect.innerHTML = '';
  toSelect.innerHTML = '';

  const units = unitData[category].units;
  const keys = Object.keys(units);

  keys.forEach((key) => {
    fromSelect.add(new Option(units[key].name, key));
    toSelect.add(new Option(units[key].name, key));
  });

  if (keys.length > 1) {
    toSelect.selectedIndex = 1;
  }
  calculateDynamicUnit();
}

function calculateDynamicUnit() {
  const valInput = parseFloat(document.getElementById('unitFromVal').value);
  const fromUnit = document.getElementById('unitFromSelect').value;
  const toUnit = document.getElementById('unitToSelect').value;

  if (isNaN(valInput)) {
    document.getElementById('unitToVal').value = '';
    document.getElementById('bigUnitResult').innerText = '0';
    return;
  }

  let result = 0;
  if (currentCategory === 'temp') {
    result = convertTemperature(valInput, fromUnit, toUnit);
  } else {
    const fromFactor = unitData[currentCategory].units[fromUnit].factor;
    const toFactor = unitData[currentCategory].units[toUnit].factor;
    result = (valInput * fromFactor) / toFactor;
  }

  const formattedResult = Number.isInteger(result) ? result.toString() : result.toFixed(4);
  document.getElementById('unitToVal').value = formattedResult;
  document.getElementById('bigUnitResult').innerText = formattedResult;

  const fromName = unitData[currentCategory].units[fromUnit].name;
  const toName = unitData[currentCategory].units[toUnit].name;
  document.getElementById('unitFormulaText').innerText = `1 ${fromName} ≈ ${convertBaseUnit(1, fromUnit, toUnit)} ${toName}`;
}

function convertTemperature(val, from, to) {
  let celsius = 0;
  if (from === 'c') celsius = val;
  else if (from === 'f') celsius = (val - 32) * 5/9;
  else if (from === 'k') celsius = val - 273.15;
  else if (from === 'r') celsius = (val - 491.67) * 5/9;

  if (to === 'c') return celsius;
  if (to === 'f') return (celsius * 9/5) + 32;
  if (to === 'k') return celsius + 273.15;
  if (to === 'r') return (celsius + 273.15) * 9/5;
}

function convertBaseUnit(val, from, to) {
  if (currentCategory === 'temp') return convertTemperature(val, from, to).toFixed(4);
  const fromFactor = unitData[currentCategory].units[from].factor;
  const toFactor = unitData[currentCategory].units[to].factor;
  return ((val * fromFactor) / toFactor).toFixed(4);
}

function swapUnits() {
  const fromSelect = document.getElementById('unitFromSelect');
  const toSelect = document.getElementById('unitToSelect');
  if (fromSelect && toSelect) {
    const temp = fromSelect.value;
    fromSelect.value = toSelect.value;
    toSelect.value = temp;
    calculateDynamicUnit();
  }
}

// ----------------------------------------------------
// 12. LOGIKA PWA & CUSTOM INSTALL MODAL (ND TOOLS)
// ----------------------------------------------------
let deferredPrompt = null;

// Registrasi Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js?v=4', { scope: './' })
      .then((reg) => console.log('[SN Tools] SW Registered:', reg.scope))
      .catch((err) => console.error('[SN Tools] SW Failed:', err));
  });
}

// Tangkap pemicu bawaan browser
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  console.log('[SN Tools] Event PWA install siap.');
});

// Dipanggil saat tombol "Install Aplikasi" di Navbar diklik
function installPWA() {
  showPwaModal();
}

// Tampilkan Modal Kustom Install PWA
function showPwaModal() {
  const modal = document.getElementById('pwaInstallModal');
  const card = document.getElementById('pwaInstallCard');

  if (modal && card) {
    modal.classList.remove('hidden');
    setTimeout(() => {
      modal.classList.remove('opacity-0');
      card.classList.remove('scale-95');
      card.classList.add('scale-100');
    }, 10);
  }
}

// Tutup Modal Kustom Install PWA
function closePwaModal() {
  const modal = document.getElementById('pwaInstallModal');
  const card = document.getElementById('pwaInstallCard');

  if (modal && card) {
    modal.classList.add('opacity-0');
    card.classList.remove('scale-100');
    card.classList.add('scale-95');

    setTimeout(() => {
      modal.classList.add('hidden');
    }, 200);
  }
}

// Jalankan proses instalasi resmi saat tombol "Install" di dalam Modal diklik
function triggerPwaInstall() {
  closePwaModal();

  if (deferredPrompt) {
    deferredPrompt.prompt();
    deferredPrompt.userChoice.then((choiceResult) => {
      if (choiceResult.outcome === 'accepted') {
        console.log('[SN Tools] Pengguna menyetujui instalasi.');
      }
      deferredPrompt = null;
    });
  } else {
    // Fallback jika dibuka di browser HP/PC yang butuh langkah manual
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    if (isMobile) {
      showCustomModal(
        'Install di HP',
        'Untuk memasang aplikasi:\n1. Ketuk menu titik tiga (Chrome) / tombol Share (Safari).\n2. Pilih "Tambahkan ke Layar Utama" / "Install Aplikasi".',
        'Petunjuk Instalasi',
        'download-cloud',
        false
      );
    } else {
      showCustomModal(
        'Install di Laptop/PC',
        'Perhatikan bagian kanan atas Address Bar (URL browser Anda), lalu klik ikon Download/Komputer kecil di sana untuk menginstal SN Tools.',
        'Petunjuk Instalasi',
        'download-cloud',
        false
      );
    }
  }
}

window.addEventListener('appinstalled', () => {
  deferredPrompt = null;
  showCustomModal('Instalasi Selesai', 'SN Tools berhasil terpasang di perangkat Anda dan siap digunakan secara offline!', 'PWA Installed', 'check-circle-2', false);
});
