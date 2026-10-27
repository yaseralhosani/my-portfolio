import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {parseSource,serialize,validate,clone,newProject,validateMedia} from './model.mjs';
import {githubClient} from './github.mjs';
const data=parseSource(fs.readFileSync(new URL('../portfolio.js',import.meta.url),'utf8'));
test('portfolio round trips as JSON without executing source',()=>{
 assert.deepEqual(parseSource(serialize(data)),data);
 assert.throws(()=>parseSource('window.PORTFOLIO = (()=>{throw new Error("unsafe")})()'));
 assert.deepEqual(validate(data),[]);
});
test('new projects use unique IDs and a neutral web preview',()=>{
 const p=newProject(data.projects); assert.equal(p.isSample,false);assert.equal(p.visual,'web');
 const next=newProject([...data.projects,p]);assert.notEqual(next.id,p.id);
 assert.deepEqual(validate({...data,projects:[...data.projects,p]}),[]);
});
test('validation catches duplicate IDs, script URLs, missing sample notes and invalid types',()=>{
 const draft=clone(data);draft.projects[1].id=draft.projects[0].id;draft.projects[0].repository='javascript:alert(1)';draft.projects[0].dataNote='';draft.skills[0].name=1;
 const errors=validate(draft).join(' ');assert.match(errors,/unique/);assert.match(errors,/HTTPS/);assert.match(errors,/sample data/);assert.match(errors,/Skill/);
 assert.throws(()=>validateMedia({'../admin.js':'AA=='}));assert.throws(()=>validateMedia({'assets/uploads/test.webp':5}));
});
function mockApi({conflict=false,race=false,authError=false}={}) {
 const calls=[];
 const fetcher=async(url,options)=>{
  calls.push({url,options,body:options.body?JSON.parse(options.body):null});
  const path=new URL(url).pathname;
  let body;
  if(authError)return {ok:false,status:401};
  if(path.endsWith('/git/ref/heads/main'))body={object:{sha:'head'}};
  else if(path.endsWith('/contents/portfolio.js'))body={sha:new URL(url).searchParams.get('ref')==='new-commit'?'new-file':conflict?'changed-file':'old-file',content:Buffer.from(serialize(data)).toString('base64')};
  else if(path.endsWith('/git/commits/head'))body={tree:{sha:'old-tree'}};
  else if(path.endsWith('/git/blobs'))body={sha:'image-blob'};
  else if(path.endsWith('/git/trees'))body={sha:'new-tree',tree:[{path:'portfolio.js',sha:'new-file'}]};
  else if(path.endsWith('/git/commits'))body={sha:'new-commit',html_url:'https://github.com/yaseralhosani/my-portfolio/commit/new-commit'};
  else if(path.endsWith('/git/refs/heads/main')){if(race)return {ok:false,status:422};body={object:{sha:'new-commit'}};}
  else body={permissions:{push:true}};
  return {ok:true,json:async()=>body};
 };
 return {calls,client:githubClient('test-credential',fetcher)};
}
test('publish atomically includes data and images while preserving the repository tree',async()=>{
 const {calls,client}=mockApi();const draft=clone(data);draft.projects[0].image='./assets/uploads/test.webp';
 const result=await client.publish(draft,'old-file',{'assets/uploads/test.webp':'AA==','assets/uploads/unused.webp':'AA=='});
 assert.equal(result.sha,'new-file');
 const tree=calls.find(c=>c.url.endsWith('/git/trees')).body;
 assert.equal(tree.base_tree,'old-tree');assert.deepEqual(tree.tree.map(e=>e.path),['portfolio.js','assets/uploads/test.webp']);
 assert.deepEqual(parseSource(tree.tree[0].content),draft);
 const update=calls.find(c=>c.options.method==='PATCH');assert.deepEqual(update.body,{sha:'new-commit',force:false});
 assert(calls.every(c=>c.url.startsWith('https://api.github.com/repos/yaseralhosani/my-portfolio')));
 assert(calls.every(c=>c.options.headers.Authorization==='Bearer test-credential'));
});
test('stale drafts stop before any repository writes',async()=>{
 const {calls,client}=mockApi({conflict:true});await assert.rejects(client.publish(data,'old-file'),/changed since/);
 assert(calls.every(c=>c.options.method==='GET'));
});
test('concurrent branch updates fail safely without a force push',async()=>{
 const {calls,client}=mockApi({race:true});await assert.rejects(client.publish(data,'old-file'),/branch may have changed/);
 assert.equal(calls.filter(c=>c.options.method==='PATCH').length,1);assert.equal(calls.at(-1).body.force,false);
});
test('invalid data and absent authorization cannot publish',async()=>{
 const {calls,client}=mockApi();await assert.rejects(client.publish({...data,name:''},'old-file'),/required/);assert.equal(calls.length,0);
 await assert.rejects(githubClient('',async()=>{throw new Error('must not fetch')}).publish(data,'old-file'),/Connect GitHub/);
 const denied=mockApi({authError:true});await assert.rejects(denied.client.connect(),/authorization expired/);
});
