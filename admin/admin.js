import {DRAFT_KEY,FILTERS,ICONS,clone,validate,newProject,serialize,validateMedia} from './model.mjs';
import {githubClient,REPO} from './github.mjs';
const $ = selector => document.querySelector(selector);
const escape = value => String(value ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let data = clone(window.PORTFOLIO), baseSha = null, media = {}, dirty = false, selected = data.projects[0]?.id, view = 'projects';
let client = null, busy = false, saveTimer = null, storageFailed = false, undo = null;
const shipped = serialize(data), imageUrls = new Map();
try { const saved = JSON.parse(localStorage.getItem(DRAFT_KEY)); if (saved?.version === 1 && !validate(saved.data).length) {data=saved.data;baseSha=saved.baseSha || null;media=validateMedia(saved.media || {});dirty=!!saved.dirty;selected=data.projects[0]?.id;} } catch { /* A corrupt draft cannot replace the published data. */ }
function notice(message,error=false) { $('#notice').textContent=message;$('#notice').classList.toggle('error',error); }
function saveNow() {
  clearTimeout(saveTimer);
  const used = new Set(data.projects.map(p=>p.image));
  media=Object.fromEntries(Object.entries(media).filter(([path])=>used.has(`./${path}`)));
  try { localStorage.setItem(DRAFT_KEY,JSON.stringify({version:1,data,baseSha,media,dirty,savedAt:new Date().toISOString()}));storageFailed=false;$('#save-state').textContent=dirty?'Draft saved in this browser · Not published':'Up to date with published content'; }
  catch { storageFailed=true;$('#save-state').textContent='Browser storage is full. Download a backup to keep these changes.';notice('Your edits are in memory, but could not be saved locally. Download a backup before closing this page.',true); }
}
function changed() { dirty=true;$('#save-state').textContent='Saving local draft…';clearTimeout(saveTimer);saveTimer=setTimeout(saveNow,250); }
function field(label,key,value,kind='input',attrs='') {
  const id=`field-${key}`; const escaped=escape(value);
  return `<label for="${id}">${escape(label)}${kind==='textarea'?`<textarea id="${id}" ${attrs}>${escaped}</textarea>`:`<input id="${id}" value="${escaped}" ${attrs}>`}</label>`;
}
const profileField=(label,key,kind='input')=>field(label,key,data[key]||'',kind,`data-profile="${key}"`);
const project=()=>data.projects.find(p=>p.id===selected);
const pField=(label,key,kind='input')=>field(label,key,project()[key]||'',kind,`data-project="${key}"`);
function selectOptions(options,value) {return options.map(([key,label])=>`<option value="${escape(key)}" ${key===value?'selected':''}>${escape(label)}</option>`).join('');}
function imageUrl(path) {
  const raw=media[path.replace(/^\.\//,'')];
  if(raw) { if(!imageUrls.has(path)) { const bytes=Uint8Array.from(atob(raw),c=>c.charCodeAt(0));imageUrls.set(path,URL.createObjectURL(new Blob([bytes],{type:'image/webp'}))); }return imageUrls.get(path); }
  if(/^https:\/\//.test(path)) return path;
  if(/^\.\/assets\/[\w./-]+$/.test(path)&&!path.includes('..')) return `../${path.slice(2)}`;
  return '';
}
function render() {
  $('#project-count').textContent=data.projects.length;$('#skill-count').textContent=data.skills.length;
  document.querySelectorAll('[data-view]').forEach(b=>b.setAttribute('aria-current',b.dataset.view===view?'page':'false'));
  $('#page-title').textContent={projects:'Your projects.',profile:'Make it yours.',skills:'Your toolkit.'}[view];
  if(view==='profile') renderProfile();else if(view==='skills') renderSkills();else renderProjects();
}
function renderProfile() {
  $('#workspace').innerHTML=`<section class="panel"><div class="editor-heading"><div><h2>Profile & contact</h2><p>Short, natural writing works best. These details appear on your public portfolio.</p></div></div><div class="form-grid">${profileField('Display name','name')}${profileField('Professional role','role')}${profileField('Logo initials','initials')}${profileField('Availability','availability')}<div class="full">${profileField('Introduction','introduction','textarea')}</div><div class="full">${profileField('About you','about','textarea')}</div>${profileField('Contact email','email')}${profileField('GitHub profile URL','github')}${profileField('LinkedIn URL (optional)','linkedin')}${profileField('Custom form endpoint (optional)','contactFormEndpoint')}</div><p class="help">A new contact email needs activation with FormSubmit. Leave the form endpoint empty to use the default provider.</p></section>`;
}
function renderProjects() {
  if(!project()) selected=data.projects[0]?.id;
  $('#workspace').innerHTML=`<div class="project-layout"><section><div class="list-heading"><h2>Projects <span class="muted">${data.projects.length}</span></h2><button data-action="add-project">+ Add project</button></div><div class="project-list">${data.projects.map(p=>`<button class="project-item" data-select="${escape(p.id)}" aria-current="${p.id===selected}"><strong>${escape(p.title)}</strong><small>${escape(p.category)}${p.isSample?' · Sample':''}</small></button>`).join('')}</div></section><section class="panel" id="project-editor"></section></div>`;
  const p=project();if(!p){$('#project-editor').innerHTML='<div class="empty">Your next project starts here.<br>Choose “Add project” to begin.</div>';return;}
  const index=data.projects.indexOf(p), thumb=imageUrl(p.image);
  $('#project-editor').innerHTML=`<div class="editor-heading"><div><h2>Project details</h2><p>Edit locally, preview, then publish when ready.</p></div><div class="editor-actions"><button data-action="move-up" ${index===0?'disabled':''} aria-label="Move project up">↑</button><button data-action="move-down" ${index===data.projects.length-1?'disabled':''} aria-label="Move project down">↓</button><button data-action="duplicate">Duplicate</button><button data-action="remove-project" class="danger">Remove</button></div></div><div class="form-grid"><div class="full">${pField('Project title','title')}</div>${pField('Unique ID / URL slug','id')}${pField('Category','category')}<div class="full">${pField('Card description','description','textarea')}</div>${field('Tools & tags (comma separated)','tags',p.tags.join(', '),'input','data-project="tags"')}${pField('Year or project date','year')}${pField('Project format','type')}${pField('Repository URL (optional)','repository')}${pField('Live project URL (optional)','liveUrl')}<label>Built-in preview<select data-project="visual">${selectOptions([['web','Website / app'],['retail','Retail dashboard'],['retention','Retention heatmap'],['mobility','Mobility chart']],p.visual)}</select></label><div class="full">${pField('Thumbnail URL or assets path (optional)','image')}<p class="help">Use an HTTPS image URL, or upload a JPG, PNG, or WebP. Uploaded images are resized for the web.</p>${thumb?`<img class="thumb" src="${escape(thumb)}" alt="Project thumbnail">`:''}<label class="upload-label">Upload thumbnail<input id="project-image-file" type="file" accept="image/jpeg,image/png,image/webp"></label></div><div class="full"><label>Project filters</label><div class="check-row">${FILTERS.map(([key,label])=>`<label><input type="checkbox" data-filter-key="${key}" ${p.filters.includes(key)?'checked':''}>${label}</label>`).join('')}</div></div><div class="full check-row"><label><input type="checkbox" data-project="isSample" ${p.isSample?'checked':''}>This is an illustrative sample, not a real project</label></div></div><div class="form-section"><h3>Case study</h3><div class="form-grid"><div class="full">${pField('Overview','summary','textarea')}</div><div class="full">${pField('The question / challenge (optional)','question','textarea')}</div><div class="full">${pField('Result / what you learned (optional)','finding','textarea')}</div><div class="full">${pField('Next step (optional)','nextStep','textarea')}</div><div class="full">${pField('Data source / limitations / sample note','dataNote','textarea')}</div></div></div><div class="form-section"><div class="list-heading"><h3>Approach</h3><button data-action="add-step">+ Add step</button></div>${p.process.map((step,i)=>`<div class="step"><div class="step-toolbar"><span>STEP ${String(i+1).padStart(2,'0')}</span><button class="small-button" data-remove-step="${i}" aria-label="Remove step ${i+1}">Remove</button></div><div class="form-grid">${field('Step title',`step-${i}-title`,step.title,'input',`data-step="${i}" data-step-key="title"`)}${field('What you did',`step-${i}-text`,step.text,'textarea',`data-step="${i}" data-step-key="text"`)}</div></div>`).join('')}</div>`;
}
function renderSkills() {
  $('#workspace').innerHTML=`<div class="list-heading"><p class="muted">Keep the tools and capabilities you want to be known for.</p><button data-action="add-skill">+ Add skill</button></div><div class="skills-editor">${data.skills.map((skill,i)=>`<section class="panel skill-edit"><div class="editor-heading"><h2>Skill ${String(i+1).padStart(2,'0')}</h2><div class="editor-actions"><button data-skill-up="${i}" ${i===0?'disabled':''} aria-label="Move skill ${i+1} up">↑</button><button data-skill-down="${i}" ${i===data.skills.length-1?'disabled':''} aria-label="Move skill ${i+1} down">↓</button><button data-remove-skill="${i}" class="danger">Remove skill</button></div></div><div class="form-grid">${['name','category','description'].map(key=>field({name:'Skill name',category:'Category',description:'Short description'}[key],`skill-${i}-${key}`,skill[key],'input',`data-skill="${i}" data-skill-key="${key}"`)).join('')}<label>Icon<select data-skill="${i}" data-skill-key="icon">${selectOptions(ICONS.map(icon=>[icon,icon]),skill.icon)}</select></label></div></section>`).join('')}</div>`;
}
function renumber(){data.projects.forEach((p,i)=>p.number=String(i+1).padStart(2,'0'));}
function rememberRemoval(kind,index){undo={kind,index,item:clone(kind==='project'?data.projects[index]:data.skills[index]),media:clone(media)};$('#undo-button').hidden=false;}
async function confirmChange(message){$('#confirm-copy').textContent=message;$('#confirm-dialog').showModal();return new Promise(resolve=>{const done=value=>{$('#confirm-dialog').close();$('#confirm-accept').onclick=null;$('#confirm-cancel').onclick=null;resolve(value);};$('#confirm-accept').onclick=()=>done(true);$('#confirm-cancel').onclick=()=>done(false);$('#confirm-dialog').oncancel=e=>{e.preventDefault();done(false);};});}
$('#workspace').addEventListener('input',event=>{
  const el=event.target;if(busy)return;
  if(el.dataset.profile)data[el.dataset.profile]=el.value;
  else if(el.dataset.project){const p=project(),key=el.dataset.project;if(!p)return;p[key]=key==='isSample'?el.checked:key==='tags'?el.value.split(',').map(x=>x.trim()).filter(Boolean):el.value;if(key==='id'){selected=p.id;const active=document.querySelector('.project-item[aria-current=true]');if(active)active.dataset.select=p.id;}if(key==='title'){const active=document.querySelector('.project-item[aria-current=true] strong');if(active)active.textContent=el.value;}}
  else if(el.dataset.filterKey){const p=project();p.filters=el.checked?[...new Set([...p.filters,el.dataset.filterKey])]:p.filters.filter(x=>x!==el.dataset.filterKey);}
  else if(el.dataset.skill!==undefined)data.skills[Number(el.dataset.skill)][el.dataset.skillKey]=el.value;
  else if(el.dataset.step!==undefined)project().process[Number(el.dataset.step)][el.dataset.stepKey]=el.value;
  else return;changed();
});
$('#workspace').addEventListener('click',async event=>{
  const button=event.target.closest('button');if(!button||busy)return;
  if(button.dataset.select){selected=button.dataset.select;renderProjects();return;}
  const action=button.dataset.action,p=project(),index=data.projects.indexOf(p);
  if(action==='add-project'){const next=newProject(data.projects);data.projects.push(next);selected=next.id;}
  else if(action==='duplicate'&&p){const next=clone(p);let id=p.id+'-copy';while(data.projects.some(x=>x.id===id))id+='-copy';next.id=id;next.title+=' (copy)';data.projects.splice(index+1,0,next);selected=id;}
  else if(action==='remove-project'&&p){rememberRemoval('project',index);data.projects.splice(index,1);selected=data.projects[Math.min(index,data.projects.length-1)]?.id;notice('Project removed from the local draft. Use Undo removal to restore it.');}
  else if(action==='move-up'&&index>0)[data.projects[index-1],data.projects[index]]=[p,data.projects[index-1]];
  else if(action==='move-down'&&index<data.projects.length-1)[data.projects[index+1],data.projects[index]]=[p,data.projects[index+1]];
  else if(action==='add-step')p.process.push({title:'',text:''});
  else if(action==='add-skill')data.skills.push({name:'New skill',category:'',description:'',icon:'code'});
  else if(button.dataset.removeStep!==undefined)p.process.splice(Number(button.dataset.removeStep),1);
  else if(button.dataset.removeSkill!==undefined){rememberRemoval('skill',Number(button.dataset.removeSkill));data.skills.splice(Number(button.dataset.removeSkill),1);}
  else if(button.dataset.skillUp!==undefined){const i=Number(button.dataset.skillUp);[data.skills[i-1],data.skills[i]]=[data.skills[i],data.skills[i-1]];}
  else if(button.dataset.skillDown!==undefined){const i=Number(button.dataset.skillDown);[data.skills[i+1],data.skills[i]]=[data.skills[i],data.skills[i+1]];}
  else return;
  renumber();changed();render();
});
$('#workspace').addEventListener('change',async event=>{
  if(event.target.id!=='project-image-file')return;
  const file=event.target.files[0],p=project();if(!file||!p)return;
  try{
    if(!['image/jpeg','image/png','image/webp'].includes(file.type)||file.size>8*1024*1024)throw new Error('Choose a JPG, PNG, or WebP under 8 MB.');
    const bitmap=await createImageBitmap(file),scale=Math.min(1,1600/Math.max(bitmap.width,bitmap.height));
    const canvas=document.createElement('canvas');canvas.width=Math.max(1,Math.round(bitmap.width*scale));canvas.height=Math.max(1,Math.round(bitmap.height*scale));canvas.getContext('2d').drawImage(bitmap,0,0,canvas.width,canvas.height);bitmap.close();
    const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/webp',.82));if(!blob||blob.type!=='image/webp'||blob.size>1200000)throw new Error('This image could not be optimized. Choose a smaller image.');
    const bytes=new Uint8Array(await blob.arrayBuffer());let binary='';for(const byte of bytes)binary+=String.fromCharCode(byte);
    const path=`assets/uploads/${crypto.randomUUID()}.webp`;media[path]=btoa(binary);p.image=`./${path}`;changed();saveNow();renderProjects();notice('Thumbnail added to your draft. It will be uploaded with your next publish.');
  }catch(error){notice(error.message,true);}
});
document.querySelectorAll('[data-view]').forEach(button=>button.addEventListener('click',()=>{view=button.dataset.view;render();}));
document.querySelectorAll('[data-close]').forEach(button=>button.addEventListener('click',()=>{if(!busy)button.closest('dialog').close();}));
$('#undo-button').onclick=()=>{if(!undo)return;if(undo.kind==='project'){const restored=undo.item;while(data.projects.some(p=>p.id===restored.id))restored.id+='-restored';data.projects.splice(Math.min(undo.index,data.projects.length),0,restored);selected=restored.id;renumber();}else data.skills.splice(Math.min(undo.index,data.skills.length),0,undo.item);media={...undo.media,...media};undo=null;$('#undo-button').hidden=true;changed();render();notice('Removal undone.');};
$('#export-button').onclick=()=>{saveNow();const blob=new Blob([JSON.stringify({version:1,data,baseSha,media,dirty},null,2)],{type:'application/json'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=`portfolio-backup-${new Date().toISOString().slice(0,10)}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);};
$('#import-file').onchange=async event=>{const file=event.target.files[0];if(!file)return;try{if(file.size>8*1024*1024)throw new Error('Choose a portfolio backup under 8 MB.');const backup=JSON.parse(await file.text());const errors=validate(backup.data);if(errors.length)throw new Error(errors[0]);validateMedia(backup.media || {});if(!(await confirmChange('Importing replaces the draft in this browser. Download a backup first if you want to keep the current version.')))return;data=clone(backup.data);media=validateMedia(backup.media || {});baseSha=/^[a-f0-9]{40}$/.test(backup.baseSha)?backup.baseSha:null;dirty=true;undo=null;$('#undo-button').hidden=true;selected=data.projects[0]?.id;saveNow();render();notice('Backup imported as a local draft. Review it before publishing.');}catch(error){notice(error.message,true);}finally{event.target.value='';}};
async function applyRemote(remote){data=remote.data;baseSha=remote.sha;media={};dirty=false;undo=null;$('#undo-button').hidden=true;selected=data.projects[0]?.id;saveNow();render();}
$('#reload-button').onclick=async()=>{if(dirty&&!(await confirmChange('Reloading replaces your local edits with the latest published content. Download a backup first if needed.')))return;try{await applyRemote(await(client||githubClient('')).load());notice('Loaded the latest published content.');}catch(error){notice(error.message,true);}};
$('#connect-button').onclick=()=>{$('#connect-error').textContent='';$('#connect-dialog').showModal();$('#github-token').focus();};
$('#connect-dialog').addEventListener('close',()=>{$('#github-token').value='';});
$('#disconnect-button').onclick=()=>{client=null;$('#connect-button').hidden=false;$('#disconnect-button').hidden=true;$('#connection-status').textContent='Local draft · Not connected';notice('Disconnected. Your local draft is still saved.');};
$('#connect-form').onsubmit=async event=>{event.preventDefault();const input=$('#github-token');const token=input.value.trim();input.value='';if(!token)return;$('#connect-submit').disabled=true;$('#connect-error').textContent='';try{const candidate=githubClient(token);const remote=await candidate.connect();client=candidate;$('#connect-button').hidden=true;$('#disconnect-button').hidden=false;$('#connection-status').textContent=`Connected · ${REPO}`;if(!dirty)await applyRemote(remote);else if(!baseSha&&serialize(remote.data)===shipped){baseSha=remote.sha;saveNow();}$('#connect-dialog').close();notice(baseSha!==remote.sha?'Connected. Published content differs from this draft. Download a backup, then reload published content before publishing.':'GitHub connected. Your draft is ready to preview and publish.',baseSha!==remote.sha);}catch(error){$('#connect-error').textContent=error.message;}finally{$('#connect-submit').disabled=false;}};
$('#preview-button').onclick=()=>{saveNow();if(storageFailed)return;const errors=validate(data);if(errors.length){notice(errors[0],true);return;}$('#preview-frame').src=`../?preview=1&draft=${Date.now()}`;$('#preview-dialog').showModal();};
$('#preview-dialog').addEventListener('close',()=>{$('#preview-frame').removeAttribute('src');});
$('#review-button').onclick=()=>{saveNow();const errors=validate(data);$('#review-content').innerHTML=errors.length?`<ul class="error-list">${errors.map(x=>`<li>${escape(x)}</li>`).join('')}</ul>`:`<p><strong>${escape(data.name)}</strong> · ${data.skills.length} skills · ${data.projects.length} projects</p><ul class="review-list">${data.projects.map(p=>`<li>${escape(p.title)}<small>${escape(p.category)}${p.isSample?' · Illustrative sample':''}</small></li>`).join('')}</ul>${!client?'<p>Connect GitHub before publishing. Close this review, then choose Connect GitHub.</p>':''}${!dirty?'<p>There are no unpublished changes.</p>':''}`;$('#publish-button').disabled=errors.length>0||!client||!baseSha||!dirty;$('#review-dialog').showModal();};
$('#review-dialog').addEventListener('cancel',event=>{if(busy)event.preventDefault();});
$('#publish-button').onclick=async()=>{if(busy||!client)return;busy=true;$('#publish-button').disabled=true;$('#publish-button').textContent='Publishing…';document.querySelector('.shell').classList.add('publish-busy');document.querySelector('.shell').inert=true;$('#connect-button').disabled=true;$('#disconnect-button').disabled=true;try{const result=await client.publish(clone(data),baseSha,clone(media));baseSha=result.sha;dirty=false;media={};saveNow();$('#review-dialog').close();notice('Update committed. GitHub Pages is building your website. ');const link=document.createElement('a');link.href=`https://github.com/${REPO}/actions`;link.textContent='View deployment ↗';link.target='_blank';link.rel='noopener noreferrer';$('#notice').append(link);$('#save-state').textContent='Committed to GitHub · Deployment in progress';}catch(error){$('#review-dialog').close();notice(error.message,true);}finally{busy=false;$('#publish-button').disabled=false;$('#publish-button').textContent='Publish update';document.querySelector('.shell').classList.remove('publish-busy');document.querySelector('.shell').inert=false;$('#connect-button').disabled=false;$('#disconnect-button').disabled=false;}};
addEventListener('beforeunload',event=>{saveNow();if((storageFailed&&dirty)||busy){event.preventDefault();event.returnValue='';}});
render();saveNow();
(async()=>{try{const remote=await githubClient('').load();if(!dirty)await applyRemote(remote);else if(!baseSha&&serialize(remote.data)===shipped){baseSha=remote.sha;saveNow();}else if(baseSha!==remote.sha)notice('A local draft is restored. Published content has changed; download a backup before reloading it.',true);}catch{notice('Local editing is available. Connect GitHub to load the latest content and enable publishing.');}})();
