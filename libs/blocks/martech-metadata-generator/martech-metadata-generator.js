import parseMd from '../../../tools/loc/helix/parseMarkdown.bundle.js';
import { createTag, getConfig } from '../../utils/utils.js';
import { replaceText } from '../../features/placeholders.js';

const config = getConfig();
const params = new URLSearchParams(window.location.search);
const referrer = params.get('referrer');
const owner = params.get('owner');
const repo = params.get('repo');
const ref = params.get('ref');
const formEl = createTag('form', { action: '#', class: 'loading' });
const statusEl = createTag('p', {}, 'Generating table, please wait...');
const copyBtn = createTag('button', { class: 'con-button' }, 'Copy');
const buildBtn = createTag('button', { class: 'con-button' }, 'Rebuild');
let clipboardData = '';

function getTable(strings) {
  const table = document.createElement('table');
  table.setAttribute('border', 1);
  const headerRow = document.createElement('tr');
  headerRow.append(createTag('th', { colspan: 2, style: 'width: 100%' }, 'martech metadata'));
  table.append(headerRow);
  strings.forEach((str) => {
    const tr = document.createElement('tr');
    tr.append(createTag('td', { colspan: 1 }, createTag('h3', {}, str)));
    tr.append(createTag('td', { colspan: 1 }, createTag('h3', { 'data-ccp-parastyle': 'DNT' }, str)));
    table.append(tr);
  });
  return table.outerHTML;
}

function handleCopy() {
  navigator.clipboard.write(clipboardData);
}

function handleError(e, msg = 'An unknown error occurred') {
  statusEl.innerText = msg;
  formEl.classList.remove('loading');
  buildBtn.innerText = 'Build';
  /* eslint-disable-next-line no-console */
  console.error(e);
}

function handleSuccess() {
  formEl.classList.remove('loading');
  buildBtn.innerText = 'Rebuild';
  statusEl.innerText = 'Table built, click Copy and paste into document';
}

async function handleBuild() {
  formEl.classList.add('loading');
  statusEl.innerText = 'Generating table, please wait....';
  let json;
  let md;
  try {
    const res = await fetch(`https://admin.hlx.page/status/${owner}/${repo}/${ref}?editUrl=${referrer}`);
    json = await res.json();
  } catch (e) { return handleError(e); }
  try {
    await fetch(
      `https://admin.hlx.page/preview/${owner}/${repo}/${ref}/${json.webPath}`,
      { method: 'POST' },
    );
  } catch (e) { return handleError('Failed to preview document'); }
  try {
    const mdFetch = await fetch(`${json.resourcePath}`);
    md = await mdFetch.text();
  } catch (e) { return handleError(e); }
  const doc = { content: { data: md }, log: '' };
  parseMd(doc);
  const items = [];
  const searchItems = async (arr) => {
    for (const child of arr) {
      if (child.type.match(/link|heading/) && !child.children[0].value?.startsWith('http')) {
        const str = await replaceText(child.children[0].value, config);
        if (str) items.push(str);
        /* eslint-disable-next-line no-continue */
        continue;
      }
      if (child.children) await searchItems(child.children);
    }
  };
  await searchItems(doc.content.mdast.children);
  /* global ClipboardItem */
  clipboardData = [new ClipboardItem({ 'text/html': new Blob([getTable(items)], { type: 'text/html' }) })];
  handleSuccess();
  return true;
}

export default async function init(el) {
  el.classList.add('con-block', 'dark');
  formEl.append(statusEl);
  formEl.append(copyBtn);
  formEl.append(buildBtn);
  buildBtn.addEventListener('click', (e) => {
    e.preventDefault();
    handleBuild();
  });
  copyBtn.addEventListener('click', (e) => {
    e.preventDefault();
    handleCopy();
  });
  el.append(formEl);
  handleBuild();
}