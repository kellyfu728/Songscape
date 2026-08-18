const SCHEMA_VERSION = 1;
const STORAGE_KEY = 'songscape.collection.v1';
const PREFS_KEY = 'songscape.preferences.v1';
const I18N = {
  en:{nav:'Shop / Collection',backup:'Backup',settings:'Settings',add:'+ Add record',heroEyebrow:'Records · tapes · discs · memories',heroTitle:'Songscape<br>Media Store',heroCopy:'Welcome to your private music sanctuary. Every song worth keeping lives here with its liner notes.',pull:'Pull from the crate',pullHint:'Find an old favorite again',inventory:'Complete inventory',shelves:'The shelves',search:'Search title, artist, memory, or tag…',allTags:'All labels',favoritesOnly:'Favorites only',clear:'Clear filters',storeOffice:'Store office',language:'Language',help:'Help',replay:'Replay introduction',newArrivals:'New arrivals',recent:'Recently shelved',picks:'Personal picks',marked:'Marked by hand',archive:'Back catalog',older:'From the archive',items:'ITEMS',emptyStore:'The shelves are empty.',emptyStoreBody:'Choose a medium and put your first song on the shelf.',stockFirst:'Stock the first record',noResults:'Nothing is filed under those clues.',reset:'Clear filters',close:'Close',edit:'Edit liner notes',remove:'Remove from store',personalPick:'Personal pick',removePick:'Remove personal pick',saved:'Put on the shelf',formTitle:'Add a record',formIntro:'Start with why this song stayed. The catalog details can come later.',song:'Song title',artist:'Artist',linerQuestion:'Why do I keep coming back to this song?',cancel:'Cancel',step:'STORE GUIDE',skip:'Skip',next:'Next',finish:'Enter the store',steps:[['Welcome to Songscape','This is your private music store: songs become physical objects, and memories become liner notes.','welcome'],['Browse the shelves','Move through new arrivals, personal picks, and the back catalog like crates in a small record shop.','shelf'],['Pull out the media','Select a sleeve, cassette, CD, or DVD to remove it from its case and inspect it.','pull'],['Read the liner notes','Every record can hold the reason you kept returning to it—written exactly in your own words.','notes'],['Stock a new record','Choose what the song should become, then place it on your shelf.','add'],['Find something again','Pull from the crate to rediscover one of your own records—never an algorithmic recommendation.','crate']]},
  zh:{nav:'唱片店 / 收藏',backup:'备份',settings:'设置',add:'＋ 添加介质',heroEyebrow:'唱片 · 磁带 · 光盘 · 记忆',heroTitle:'Songscape<br>私人音像店',heroCopy:'欢迎来到你的私人音乐圣所。每首舍不得忘记的歌，都和它的内页笔记一起留在这里。',pull:'从唱片箱抽一件',pullHint:'重新遇见一件旧藏',inventory:'完整库存',shelves:'全部货架',search:'搜索歌名、艺人、记忆或标签…',allTags:'所有标签',favoritesOnly:'只看私人推荐',clear:'清除筛选',storeOffice:'店铺办公室',language:'界面语言',help:'帮助',replay:'重新查看引导',newArrivals:'新到店',recent:'最近入库',picks:'私人推荐',marked:'亲手标记',archive:'旧藏目录',older:'来自收藏深处',items:'件介质',emptyStore:'货架还是空的。',emptyStoreBody:'选择一种介质，把第一首歌放上货架。',stockFirst:'放入第一件收藏',noResults:'这些线索下没有找到介质。',reset:'清除筛选',close:'关闭',edit:'编辑内页笔记',remove:'移出收藏',personalPick:'标为私人推荐',removePick:'取消私人推荐',saved:'放上货架',formTitle:'添加一件介质',formIntro:'先写下这首歌为什么留下来，其他目录信息可以以后再补。',song:'歌名',artist:'艺人',linerQuestion:'我为什么总会回到这首歌？',cancel:'取消',step:'店内引导',skip:'跳过',next:'下一步',finish:'进入唱片店',steps:[['欢迎来到 Songscape','这是你的私人音像店：歌曲变成实体介质，记忆成为内页笔记。','welcome'],['浏览货架','像逛一间小唱片店那样，翻看新到店、私人推荐与旧藏目录。','shelf'],['抽出介质','选择唱片、磁带、CD 或 DVD，把它从盒套中抽出并仔细查看。','pull'],['阅读内页笔记','每件收藏都可以保存你反复回到这首歌的理由，而且始终保留你的原话。','notes'],['添加一件收藏','选择这首歌应该成为哪种介质，然后把它放上你的货架。','add'],['再次遇见它','从唱片箱抽一件，会随机找回你自己的旧藏——这不是推荐算法。','crate']]}
};
let preferences = (()=>{try{return {...{language:(navigator.language||'en').toLowerCase().startsWith('zh')?'zh':'en',onboardingCompleted:{en:false,zh:false}},...JSON.parse(localStorage.getItem(PREFS_KEY)||'{}')}}catch{return {language:'en',onboardingCompleted:{en:false,zh:false}}}})();
let language = preferences.language === 'zh' ? 'zh' : 'en';
const t = key => I18N[language][key] ?? key;

const escapeHtml = (value = '') => String(value).replace(/[&<>'"]/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[char]));
const uid = () => crypto.randomUUID?.() || `${Date.now()}-${Math.random().toString(16).slice(2)}`;
const seedFrom = value => { let hash = 2166136261; for (const char of value) { hash ^= char.charCodeAt(0); hash = Math.imul(hash, 16777619); } return hash >>> 0; };
const makeSeed = () => `${uid()}-${Math.random().toString(36).slice(2)}`;
const cleanText = (value, max = 4000) => typeof value === 'string' ? value.trim().slice(0, max) : '';

function normalizeSong(raw = {}) {
  const now = new Date().toISOString();
  const id = cleanText(raw.id, 200) || uid();
  const associations = raw.associations && typeof raw.associations === 'object' ? raw.associations : {};
  const fingerprint = raw.fingerprint && typeof raw.fingerprint === 'object' ? raw.fingerprint : {};
  return {
    id, schemaVersion: SCHEMA_VERSION, medium: ['vinyl','cassette','cd','dvd'].includes(raw.medium) ? raw.medium : 'vinyl', title: cleanText(raw.title, 160), artist: cleanText(raw.artist, 160),
    album: cleanText(raw.album, 160), artwork: cleanText(raw.artwork, 1000), reflection: cleanText(raw.reflection), note: cleanText(raw.note),
    tags: Array.isArray(raw.tags) ? [...new Set(raw.tags.map(v => cleanText(v, 60)).filter(Boolean))].slice(0, 30) : [],
    associations: { place: cleanText(associations.place, 160), period: cleanText(associations.period, 160), person: cleanText(associations.person, 160), project: cleanText(associations.project, 160) },
    fingerprint: { mood: cleanText(fingerprint.mood, 30), energy: cleanText(fingerprint.energy, 30), warmth: cleanText(fingerprint.warmth, 30), seed: cleanText(fingerprint.seed, 200) || `${seedFrom(id)}` },
    favorite: Boolean(raw.favorite), createdAt: raw.createdAt && !isNaN(Date.parse(raw.createdAt)) ? raw.createdAt : now,
    updatedAt: raw.updatedAt && !isNaN(Date.parse(raw.updatedAt)) ? raw.updatedAt : now
  };
}

const Store = {
  available: true,
  load() { try { const raw = localStorage.getItem(STORAGE_KEY); if (!raw) return []; const parsed = JSON.parse(raw); if (!Array.isArray(parsed)) throw new Error('Invalid collection'); return parsed.map(normalizeSong).filter(song => song.title && song.artist && song.reflection); } catch (error) { this.available = false; showToast('无法读取本地收藏；原数据未被改动。'); console.error(error); return []; } },
  save(songs) { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(songs)); this.available = true; return true; } catch (error) { this.available = false; showToast('保存失败：浏览器存储可能不可用或空间不足。'); console.error(error); return false; } }
};

let songs = [];
let lastDiscoveredId = null;
const filters = { query: '', tag: '', favorite: false };
const $ = selector => document.querySelector(selector);
const grid = $('#songGrid');
function savePreferences(){try{localStorage.setItem(PREFS_KEY,JSON.stringify(preferences))}catch{}}
function setFirstText(selector,text){const el=$(selector);if(!el)return;const node=[...el.childNodes].find(n=>n.nodeType===3&&n.textContent.trim());if(node)node.textContent=`${text} `;}
function applyLanguage(){document.documentElement.lang=language==='zh'?'zh-CN':'en';document.title=language==='zh'?'Songscape · 私人音像店':'Songscape · Personal Media Store';$('.nav-link').textContent=t('nav');$('#backupButton').textContent=t('backup');$('#settingsButton').textContent=t('settings');$('#addButton').textContent=t('add');$('#heroEyebrow').textContent=t('heroEyebrow');$('#pageTitle').innerHTML=t('heroTitle');$('#heroCopy').textContent=t('heroCopy');$('#discoverButton span').textContent=t('pull');$('#discoverButton small').textContent=t('pullHint');$('#inventoryLabel').textContent=t('inventory');$('#collectionTitle').textContent=t('shelves');$('#searchInput').placeholder=t('search');$('.favorite-filter span').textContent=t('favoritesOnly');$('#resetFilters').textContent=t('clear');$('#settingsEyebrow').textContent=t('storeOffice');$('#settingsTitle').textContent=t('settings');$('#languageTitle').textContent=t('language');$('#helpTitle').textContent=t('help');$('#replayOnboarding').textContent=t('replay');$('#formTitle').textContent=t('formTitle');$('.form-intro').textContent=t('formIntro');setFirstText('label[for="unused"]','');document.querySelectorAll('.language-options button').forEach(b=>b.classList.toggle('selected',b.dataset.language===language));render();}
let tutorialStep=0;
function showOnboarding(force=false){if(!force&&preferences.onboardingCompleted?.[language])return;tutorialStep=0;renderTutorial();$('#onboardingDialog').showModal();}
function renderTutorial(){const steps=t('steps'),[title,body,visual]=steps[tutorialStep];$('#tutorialCounter').textContent=`${t('step')} · ${tutorialStep+1}/${steps.length}`;$('#tutorialTitle').textContent=title;$('#tutorialBody').textContent=body;$('#onboardingVisual').className=`tutorial-visual tutorial-${visual}`;$('#tutorialSkip').textContent=t('skip');$('#tutorialNext').textContent=tutorialStep===steps.length-1?t('finish'):t('next');}
function completeOnboarding(){preferences.onboardingCompleted={...(preferences.onboardingCompleted||{}),[language]:true};savePreferences();closeDialog($('#onboardingDialog'));}
function setLanguage(next){if(!I18N[next]||next===language)return;language=next;preferences.language=next;savePreferences();applyLanguage();closeDialog($('#settingsDialog'));setTimeout(()=>showOnboarding(),80);}

function palette(song) {
  const warm = song.fingerprint.warmth;
  if (warm === 'warm') return ['#7c403e','#d49a72','#e5c9a7','#5e6650'];
  if (warm === 'cool') return ['#3e5861','#7a9293','#b5c5be','#6b5268'];
  return ['#555b4c','#8b655b','#c5ad87','#6f7372'];
}

function fingerprintSvg(song, className = 'fingerprint') {
  const seed = seedFrom(song.fingerprint.seed); const colors = palette(song);
  const energy = {quiet:3,flowing:5,intense:8}[song.fingerprint.energy] || 4;
  const moodOffset = {calm:0,dreamy:17,melancholic:31,bright:47,nostalgic:61}[song.fingerprint.mood] || 11;
  let rings = '';
  for (let i=0;i<energy;i++) { const radius=22+i*13+(seed>>i%12)%7; const dash=12+(seed>>i%16)%31; rings += `<circle cx="160" cy="100" r="${radius}" fill="none" stroke="${colors[i%colors.length]}" stroke-width="${2+(i%3)}" stroke-dasharray="${dash} ${8+(i*7)%24}" transform="rotate(${moodOffset+i*19} 160 100)" opacity="${.35+i*.07}"/>`; }
  const x=50+(seed%90), y=50+((seed>>8)%100);
  return `<svg class="${className}" viewBox="0 0 320 200" role="img" aria-label="${escapeHtml(song.title)} 的视觉指纹" xmlns="http://www.w3.org/2000/svg"><defs><radialGradient id="g${seed}"><stop stop-color="${colors[2]}" stop-opacity=".7"/><stop offset="1" stop-color="${colors[0]}" stop-opacity=".05"/></radialGradient></defs><rect width="320" height="200" fill="url(#g${seed})"/><path d="M0 ${y} Q ${x} ${20+(seed%50)} 160 ${90+(seed%30)} T320 ${60+(seed%80)}" fill="none" stroke="${colors[1]}" stroke-width="2" opacity=".55"/>${rings}<circle cx="160" cy="100" r="7" fill="${colors[0]}"/></svg>`;
}

function artworkSurface(song) {
  const colors = palette(song);
  const initials = `${song.title?.[0] || 'S'}${song.artist?.[0] || 'S'}`.toUpperCase();
  const generated = `<div class="generated-art" data-initials="${escapeHtml(initials)}" style="--art-a:${colors[0]};--art-b:${colors[2]}"></div>`;
  return `<div class="art-surface" style="aspect-ratio:1">${song.artwork ? `<img src="${escapeHtml(song.artwork)}" alt="${escapeHtml(song.title)} 封面" loading="lazy" onerror="this.nextElementSibling.classList.remove('hidden');this.remove()"><div class="generated-art hidden" data-initials="${escapeHtml(initials)}" style="--art-a:${colors[0]};--art-b:${colors[2]}"></div>` : generated}</div>`;
}

function mediaObject(song, index = 0, compact = false) {
  const medium = song.medium || 'vinyl';
  const labels = {vinyl:'12″ VINYL',cassette:'CASSETTE',cd:'COMPACT DISC',dvd:'DVD VIDEO'};
  return `<article class="media-object ${medium} ${compact?'compact':''}" tabindex="0" data-id="${escapeHtml(song.id)}" style="--tilt:${[-1.2,.7,-.4,1][index%4]}deg" aria-label="抽出 ${escapeHtml(song.title)}"><div class="media-wrap"><div class="physical-disc">${medium==='cassette'?'<i></i><i></i>':fingerprintSvg(song)}</div><div class="media-case">${artworkSurface(song)}<span class="format-label">${labels[medium]}</span>${song.favorite?'<span class="favorite-sticker">★ PERSONAL PICK</span>':''}</div></div><div class="spine-copy"><strong>${escapeHtml(song.title)}</strong><span>${escapeHtml(song.artist)}</span></div></article>`;
}

function renderStore() {
  const store = $('#storeFloor');
  if (!songs.length) { store.innerHTML = `<div class="store-empty"><p class="store-sign">SONGSCAPE<br><small>BUY · SELL · REMEMBER</small></p><div class="empty-crate"><i></i><i></i><i></i></div><h2>${t('emptyStore')}</h2><p>${t('emptyStoreBody')}</p><button class="primary-button" data-add type="button">${t('stockFirst')}</button></div>`; return; }
  const arrivals=songs.slice(0,4), favorites=songs.filter(s=>s.favorite).slice(0,4), archive=[...songs].sort((a,b)=>Date.parse(a.createdAt)-Date.parse(b.createdAt)).slice(0,4);
  const shelf=(title,subtitle,items)=>items.length?`<section class="store-department"><div class="department-label"><p>${subtitle}</p><h2>${title}</h2><span>${String(items.length).padStart(2,'0')} ${t('items')}</span></div><div class="media-shelf">${items.map((s,i)=>mediaObject(s,i)).join('')}</div><div class="wood-shelf"></div></section>`:'';
  store.innerHTML=`<div class="store-masthead"><span>SONGSCAPE USED MEDIA</span><span>PERSONAL COLLECTION · OPEN LATE</span></div>${shelf(t('newArrivals'),t('recent'),arrivals)}${shelf(t('picks'),t('marked'),favorites)}${shelf(t('archive'),t('older'),archive)}`;
}

function visibleSongs() {
  const q = filters.query.toLocaleLowerCase();
  return songs.filter(song => (!q || [song.title,song.artist,song.reflection,...song.tags].join(' ').toLocaleLowerCase().includes(q)) && (!filters.tag || song.tags.includes(filters.tag)) && (!filters.favorite || song.favorite));
}

function render() {
  const visible = visibleSongs();
  renderStore();
  $('#songCount').textContent = `${visible.length} 件藏品${visible.length !== songs.length ? ` / 共 ${songs.length} 件` : ''}`;
  grid.innerHTML = visible.map((song,index) => mediaObject(song,index,true)).join('');
  const empty = $('#emptyState');
  if (!songs.length) { empty.innerHTML = `<div class="empty-orbit"></div><p class="eyebrow">The first exhibit</p><h3>你的展厅正在等第一首歌</h3><p>从一首你总会回去听的歌开始。无需写得完整，只要写下它为何重要。</p><button class="primary-button" data-add type="button">收藏第一首歌</button>`; empty.classList.remove('hidden'); }
  else if (!visible.length) { empty.innerHTML = `<div class="empty-orbit"></div><h3>${t('noResults')}</h3><button class="primary-button" data-reset type="button">${t('reset')}</button>`; empty.classList.remove('hidden'); }
  else empty.classList.add('hidden');
  $('#resetFilters').classList.toggle('hidden', !filters.query && !filters.tag && !filters.favorite);
  renderTagOptions();
}

function renderTagOptions() { const select=$('#tagFilter'); const current=filters.tag; const tags=[...new Set(songs.flatMap(s=>s.tags))].sort((a,b)=>a.localeCompare(b)); select.innerHTML=`<option value="">${t('allTags')}</option>`+tags.map(tag=>`<option value="${escapeHtml(tag)}">${escapeHtml(tag)}</option>`).join(''); select.value=current; }
function showToast(message) { const toast=$('#toast'); toast.textContent=message; toast.classList.add('show'); clearTimeout(showToast.timer); showToast.timer=setTimeout(()=>toast.classList.remove('show'),2600); }
function closeDialog(dialog) { if (dialog.open) dialog.close(); }
function resetFilters() { filters.query='';filters.tag='';filters.favorite=false;$('#searchInput').value='';$('#tagFilter').value='';$('#favoriteFilter').checked=false;render(); }

function openForm(song = null) {
  $('#songForm').reset(); $('#songId').value=song?.id||''; $('#formTitle').textContent=song?t('edit'):t('formTitle'); $('#formEyebrow').textContent=song?t('edit'):t('add'); $('#formError').textContent='';
  document.querySelectorAll('.choice-group button').forEach(b=>b.classList.remove('selected'));
  document.querySelectorAll('.medium-options button').forEach(b=>b.classList.toggle('selected', b.dataset.medium === (song?.medium || 'vinyl')));
  if(song){ ['title','artist','album','artwork','reflection','note'].forEach(k=>document.getElementById(k).value=song[k]||''); ['place','period','person','project'].forEach(k=>document.getElementById(k).value=song.associations[k]||''); $('#tags').value=song.tags.join(', '); $('#favorite').checked=song.favorite; ['mood','energy','warmth'].forEach(k=>document.querySelector(`[data-choice="${k}"] [data-value="${song.fingerprint[k]}"]`)?.classList.add('selected')); }
  $('#songDialog').showModal(); setTimeout(()=>$('#title').focus(),0);
}

function openExhibit(song, discovered=false) {
  if(!song)return; const assocLabels={place:'地点',period:'人生阶段',person:'与谁有关',project:'项目'}; const associations=Object.entries(song.associations).filter(([,v])=>v);
  const days=Math.max(0,Math.floor((Date.now()-Date.parse(song.createdAt))/86400000));
  $('#exhibitContent').innerHTML=`<button class="close-button" data-close type="button" aria-label="关闭">×</button><div class="exhibit-layout opened-${song.medium}"><div class="exhibit-visual">${mediaObject(song,0)}<div class="case-imprint">${fingerprintSvg(song)}<span>SONGSCAPE<br>PERSONAL IMPRINT</span></div></div><div class="exhibit-body"><p class="eyebrow">${discovered?'Found something':'Now inspecting'} · ${(song.medium||'vinyl').toUpperCase()} · ${new Date(song.createdAt).toLocaleDateString('zh-CN')}</p><h2>${escapeHtml(song.title)}</h2><p class="artist">${escapeHtml(song.artist)}${song.album?` · ${escapeHtml(song.album)}`:''}</p>${discovered?`<p class="status-message">YOU LEFT THIS HERE ${days} DAYS AGO.</p>`:''}<section class="liner-notes"><span>LINER NOTES / PERSONAL COPY</span><p>“${escapeHtml(song.reflection)}”</p>${song.note?`<small>${escapeHtml(song.note)}</small>`:''}</section>${associations.length?`<div class="store-stamp">${associations.map(([,v])=>escapeHtml(v)).join('<br>')}<br>SONGSCAPE</div>`:''}<div class="tags">${song.tags.map(t=>`<span class="tag">${escapeHtml(t)}</span>`).join('')}</div><div class="exhibit-actions"><button class="primary-button" data-favorite="${escapeHtml(song.id)}" type="button">${song.favorite?'★ REMOVE PERSONAL PICK':'☆ PERSONAL PICK'}</button><button class="text-button" data-edit="${escapeHtml(song.id)}" type="button">Edit liner notes</button><button class="text-button danger" data-delete="${escapeHtml(song.id)}" type="button">Remove from store</button></div></div></div>`;
  if (!$('#exhibitDialog').open) $('#exhibitDialog').showModal();
}

function toggleFavorite(id) { const song=songs.find(s=>s.id===id); if(!song)return; song.favorite=!song.favorite;song.updatedAt=new Date().toISOString();if(Store.save(songs)){render();if($('#exhibitDialog').open)openExhibit(song);showToast(song.favorite?'已加入珍藏':'已取消珍藏');} }
function discover() { const pool=visibleSongs(); if(!pool.length){showToast(songs.length?'当前筛选下没有可翻开的歌曲。':'先收藏一首歌，档案才有故事可翻。'); if(songs.length)$('#collection').scrollIntoView();return;} let candidates=pool.length>1?pool.filter(s=>s.id!==lastDiscoveredId):pool; const song=candidates[Math.floor(Math.random()*candidates.length)];lastDiscoveredId=song.id;openExhibit(song,true); }

$('#songForm').addEventListener('submit',event=>{event.preventDefault();const data=new FormData(event.currentTarget);const title=cleanText(data.get('title'),160),artist=cleanText(data.get('artist'),160),reflection=cleanText(data.get('reflection'));if(!title||!artist||!reflection){$('#formError').textContent='请填写歌名、艺人，以及你为什么总会回到这首歌。';return;}const old=songs.find(s=>s.id===$('#songId').value);const choice=k=>document.querySelector(`[data-choice="${k}"] .selected`)?.dataset.value||'';const medium=document.querySelector('.medium-options .selected')?.dataset.medium||'vinyl';const song=normalizeSong({...(old||{}),medium,title,artist,reflection,album:data.get('album'),artwork:data.get('artwork'),note:data.get('note'),tags:cleanText(data.get('tags'),500).split(/[,，]/).map(v=>v.trim()).filter(Boolean),associations:{place:$('#place').value,period:$('#period').value,person:$('#person').value,project:$('#project').value},fingerprint:{mood:choice('mood'),energy:choice('energy'),warmth:choice('warmth'),seed:old?.fingerprint.seed||makeSeed()},favorite:$('#favorite').checked,updatedAt:new Date().toISOString()});if(old)songs=songs.map(s=>s.id===old.id?song:s);else songs.unshift(song);if(Store.save(songs)){closeDialog($('#songDialog'));render();showToast(old?'展品已更新':'这首歌已进入你的收藏');}});
document.addEventListener('click',event=>{const button=event.target.closest('button,[data-add],[data-reset]');if(button?.matches('[data-close]'))closeDialog(button.closest('dialog'));if(button?.matches('[data-add]'))openForm();if(button?.matches('[data-reset]'))resetFilters();const open=button?.dataset.open;if(open)openExhibit(songs.find(s=>s.id===open));const fav=button?.dataset.favorite;if(fav){event.stopPropagation();toggleFavorite(fav);}const edit=button?.dataset.edit;if(edit){closeDialog($('#exhibitDialog'));openForm(songs.find(s=>s.id===edit));}const del=button?.dataset.delete;if(del&&confirm('确定要删除这件展品吗？删除后无法撤销，建议先导出备份。')){songs=songs.filter(s=>s.id!==del);if(Store.save(songs)){closeDialog($('#exhibitDialog'));render();showToast('展品已删除');}}const card=event.target.closest('.media-object');if(card&&!button)openExhibit(songs.find(s=>s.id===card.dataset.id));});
document.addEventListener('keydown',event=>{if((event.key==='Enter'||event.key===' ')&&event.target.matches('.media-object')){event.preventDefault();openExhibit(songs.find(s=>s.id===event.target.dataset.id));}});
document.querySelectorAll('.choice-group').forEach(group=>group.addEventListener('click',event=>{const button=event.target.closest('button');if(!button)return;const was=button.classList.contains('selected');group.querySelectorAll('button').forEach(b=>b.classList.remove('selected'));if(!was)button.classList.add('selected');}));
document.querySelector('.medium-options').addEventListener('click',event=>{const button=event.target.closest('button');if(!button)return;document.querySelectorAll('.medium-options button').forEach(b=>b.classList.remove('selected'));button.classList.add('selected');});
document.querySelectorAll('dialog').forEach(dialog=>dialog.addEventListener('click',event=>{if(event.target===dialog)dialog.close();}));
$('#addButton').addEventListener('click',()=>openForm());$('#discoverButton').addEventListener('click',discover);$('#backupButton').addEventListener('click',()=>$('#backupDialog').showModal());$('#resetFilters').addEventListener('click',resetFilters);
$('#settingsButton').addEventListener('click',()=>{$('#settingsDialog').showModal();document.querySelectorAll('.language-options button').forEach(b=>b.classList.toggle('selected',b.dataset.language===language));});
document.querySelector('.language-options').addEventListener('click',event=>{const button=event.target.closest('[data-language]');if(button)setLanguage(button.dataset.language);});
$('#replayOnboarding').addEventListener('click',()=>{closeDialog($('#settingsDialog'));showOnboarding(true);});
$('#tutorialSkip').addEventListener('click',completeOnboarding);
$('#tutorialNext').addEventListener('click',()=>{if(tutorialStep<t('steps').length-1){tutorialStep++;renderTutorial();}else completeOnboarding();});
$('#searchInput').addEventListener('input',e=>{filters.query=e.target.value.trim();render();});$('#tagFilter').addEventListener('change',e=>{filters.tag=e.target.value;render();});$('#favoriteFilter').addEventListener('change',e=>{filters.favorite=e.target.checked;render();});
$('#exportButton').addEventListener('click',()=>{const payload={app:'Songscape',schemaVersion:SCHEMA_VERSION,exportedAt:new Date().toISOString(),songs};const blob=new Blob([JSON.stringify(payload,null,2)],{type:'application/json'});const link=document.createElement('a');link.href=URL.createObjectURL(blob);link.download=`songscape-backup-${new Date().toISOString().slice(0,10)}.json`;link.click();setTimeout(()=>URL.revokeObjectURL(link.href),1000);$('#backupMessage').textContent=`已导出 ${songs.length} 件藏品。`;});
$('#importInput').addEventListener('change',async event=>{const file=event.target.files[0];if(!file)return;const message=$('#backupMessage');try{const parsed=JSON.parse(await file.text());if(!parsed||parsed.app!=='Songscape'||!Array.isArray(parsed.songs))throw new Error('结构不正确');const imported=parsed.songs.map(normalizeSong);if(imported.some(s=>!s.title||!s.artist||!s.reflection))throw new Error('部分歌曲缺少必填字段');if(!confirm(`备份包含 ${imported.length} 件藏品。继续会替换当前的 ${songs.length} 件藏品，确定吗？`)){message.textContent='已取消导入，现有收藏未改变。';return;}if(Store.save(imported)){songs=imported;resetFilters();message.textContent=`已恢复 ${songs.length} 件藏品。`;showToast('备份恢复完成');}}catch(error){message.textContent=`无法导入：${error.message}。现有收藏未改变。`;}finally{event.target.value='';}});
songs=Store.load();applyLanguage();setTimeout(()=>showOnboarding(),120);

export { normalizeSong, seedFrom };
