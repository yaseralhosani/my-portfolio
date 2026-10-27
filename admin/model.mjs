export const DRAFT_KEY = 'portfolio.cms.draft.v1';
export const FILTERS = [['bi','Business intelligence'],['python','Python'],['sql','SQL'],['web','Web development'],['microsoft','Microsoft 365'],['power','Power Platform'],['wordpress','WordPress'],['design','Web design']];
export const ICONS = ['code','office','bars','app','flow','web','store','design','database','grid','sheet','chart'];
export function parseSource(source) {
  const match = source.match(/window\.PORTFOLIO\s*=\s*([\s\S]*?)\s*;?\s*$/);
  if (!match) throw new Error('The portfolio file is not in the supported JSON format.');
  return JSON.parse(match[1].replace(/;\s*$/, ''));
}
export function serialize(data) {
  return '/* Portfolio content. Edit through /admin/ or update this JSON object. */\nwindow.PORTFOLIO = ' + JSON.stringify(data,null,2) + ';\n';
}
export const clone = value => JSON.parse(JSON.stringify(value));
export function validate(data) {
  const errors = [];
  if (!data || typeof data !== 'object' || Array.isArray(data)) return ['Choose a valid portfolio backup.'];
  if (new TextEncoder().encode(JSON.stringify(data)).length > 900000) errors.push('Portfolio content is too large. Keep the text under 900 KB and upload images separately.');
  for (const key of ['name','role','initials','introduction','about','email','availability']) if (typeof data[key] !== 'string' || !data[key].trim()) errors.push(`Profile: ${key} is required.`);
  if (typeof data.email === 'string' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) errors.push('Profile: enter a valid email address.');
  const url = (value, label, image = false) => {
    if (!value) return;
    if (typeof value !== 'string') { errors.push(`${label}: enter a valid URL.`); return; }
    if (image && /^\.\/assets\/[\w./-]+$/.test(value) && !value.includes('..')) return;
    try { const parsed = new URL(value); if (parsed.protocol !== 'https:') throw 0; } catch { errors.push(`${label}: use a complete HTTPS URL${image ? ' or an assets path' : ''}.`); }
  };
  ['github','linkedin','contactFormEndpoint'].forEach(key => url(data[key], `Profile ${key}`));
  if (!Array.isArray(data.skills) || data.skills.length > 50) errors.push('Use an array of up to 50 skills.');
  else data.skills.forEach((skill,i) => { if (!skill || !['name','category','description','icon'].every(k => typeof skill[k] === 'string') || !skill.name.trim()) errors.push(`Skill ${i+1}: a name and text fields are required.`); });
  if (!Array.isArray(data.projects) || data.projects.length > 100) errors.push('Use an array of up to 100 projects.');
  else {
    const ids = new Set();
    data.projects.forEach((p,i) => {
      const label = `Project ${i+1}`;
      if (!p || typeof p !== 'object') { errors.push(`${label}: invalid project.`); return; }
      if (typeof p.id !== 'string' || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(p.id) || ids.has(p.id)) errors.push(`${label}: use a unique lowercase ID with hyphens.`);
      ids.add(p.id);
      for (const key of ['title','description','category','summary']) if (typeof p[key] !== 'string' || !p[key].trim()) errors.push(`${label}: ${key} is required.`);
      for (const key of ['number','label','year','type','question','finding','nextStep','dataNote','visual']) if (typeof p[key] !== 'string') errors.push(`${label}: ${key} must be text.`);
      if (typeof p.isSample !== 'boolean') errors.push(`${label}: specify whether this is a sample.`);
      for (const key of ['filters','tags']) if (!Array.isArray(p[key]) || p[key].some(x => typeof x !== 'string')) errors.push(`${label}: ${key} must be a list of text.`);
      if (!Array.isArray(p.process) || p.process.some(x=>!x || typeof x.title !== 'string' || typeof x.text !== 'string')) errors.push(`${label}: check the approach steps.`);
      url(p.image, `${label} image`, true); url(p.repository, `${label} repository`); url(p.liveUrl, `${label} live link`);
      if (p.isSample && !p.dataNote?.trim()) errors.push(`${label}: add a note explaining the sample data.`);
    });
  }
  return errors;
}
export function newProject(projects) {
  let n = projects.length + 1;
  while (projects.some(p=>p.id===`project-${n}`)) n++;
  return {id:`project-${n}`,number:String(projects.length+1).padStart(2,'0'),isSample:false,image:'',category:'Web development',filters:['web'],title:'Untitled project',description:'Add a short description of your project.',tags:[],visual:'web',label:'Project preview',year:String(new Date().getFullYear()),type:'Web project',repository:'',liveUrl:'',question:'',summary:'Add a short overview of the project.',process:[],finding:'',nextStep:'',dataNote:''};
}
export function validateMedia(media = {}) {
  if (!media || typeof media !== 'object' || Array.isArray(media)) throw new Error('The backup has invalid media.');
  const entries = Object.entries(media);
  if (entries.length > 100 || entries.reduce((sum,[,value])=>sum+(typeof value==='string'?value.length:7000000),0)>6000000) throw new Error('The backup contains too much image data.');
  for(const [path,value] of entries) if(!/^assets\/uploads\/[a-z0-9-]+\.webp$/.test(path)||typeof value!=='string'||value.length>2000000||!/^[A-Za-z0-9+/]+=*$/.test(value)) throw new Error('The backup has an invalid uploaded image.');
  return media;
}
