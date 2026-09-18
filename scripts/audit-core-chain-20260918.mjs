// 核心链路探索测试，仅写入独立测试账号的数据，不修改业务代码。
import { readFile, writeFile, mkdir } from 'node:fs/promises';
const base='http://localhost:3001/api';
const run=`chain_${Date.now()}`;
const evidence={run,startedAt:new Date().toISOString(),checks:[],bugs:[],posts:[],jobs:[]};
const out='docs/core-chain-evidence-2026-09-18.json';
async function save(){await writeFile(out,JSON.stringify(evidence,null,2));}
async function note(label,pass,detail){evidence.checks.push({label,pass,detail});console.log(`${pass?'PASS':'BUG'} ${label}`);if(!pass)evidence.bugs.push({label,detail});await save();}
async function req(path,token,body,method=body===undefined?'GET':'POST'){
 const r=await fetch(base+path,{method,headers:{...(token?{Authorization:`Bearer ${token}`} : {}),...(body instanceof FormData?{}:{'Content-Type':'application/json'})},body:body===undefined?undefined:body instanceof FormData?body:JSON.stringify(body),signal:AbortSignal.timeout(20000)});
 const j=await r.json();return {status:r.status,...j};
}
async function ok(path,token,body,method){const r=await req(path,token,body,method);if(r.status>=400||r.success===false)throw new Error(`${path} ${r.status} ${JSON.stringify(r)}`);return r.data;}
async function poll(path,token,jobId){
 evidence.jobs.push({path,jobId});await save();
 for(let i=0;i<150;i++){const j=await ok(path+'/'+jobId,token);if(['DONE','ERROR'].includes(j.status))return j;await new Promise(r=>setTimeout(r,2000));}
 throw new Error('AI job timeout '+jobId);
}
const author=await ok('/auth/register',null,{username:run,email:run+'@example.com',password:'ChainCheck_2026!'});
const other=await ok('/auth/register',null,{username:run+'_reader',email:run+'_reader@example.com',password:'ChainCheck_2026!'});
const token=author.tokens.accessToken,reader=other.tokens.accessToken;
evidence.accounts=[{id:author.user.id,username:author.user.username},{id:other.user.id,username:other.user.username}];await save();
const form=new FormData();form.set('file',new Blob([await readFile('server/assets/real-covers/westlake.jpg')],{type:'image/jpeg'}),'chain-westlake.jpg');
const upload=await ok('/upload/image',token,form);evidence.upload=upload;await save();
const originalId=run+'_image';
const image={id:originalId,photoPath:upload.url,thumbnailPath:upload.thumbnailUrl,capturedAt:Date.parse('2026-09-17T09:15:00+08:00'),textNote:'验收事实A：9月17日上午在杭州西湖散步，只在岸边停留，没有乘船。',locationName:'杭州，西湖',gpsLat:30.25,gpsLng:120.14,tripId:run+'_trip',tripTitle:'杭州两日验收',weather:'晴'};
const text={id:run+'_text',capturedAt:Date.parse('2026-09-18T14:30:00+08:00'),textNote:'验收事实B：9月18日下午在杭州阅读，喝了一杯白开水，没有登山，也没有去其他城市。',locationName:'杭州',tripId:run+'_trip',tripTitle:'杭州两日验收'};
await ok('/sync/snapshots',token,{moments:[text,image]});
let snaps=await ok('/posts/snaps',token);evidence.posts.push(...snaps.map(p=>({id:p.id,kind:'SNAPSHOT'})));evidence.sources=snaps;await save();
const img=snaps.find(p=>p.vrMetadata.originalId===originalId);const txt=snaps.find(p=>p.vrMetadata.originalId===text.id);
await note('图片与纯文字同步、默认私密',snaps.length===2&&snaps.every(p=>p.visibility==='PRIVATE'),snaps.map(p=>({id:p.id,visibility:p.visibility,content:p.content,createdAt:p.createdAt})));
const repeat=await ok('/sync/snapshots',token,{moments:[text,image]});await note('重复整批同步不会重复建帖',repeat.imported===0&&repeat.skipped===2,repeat);
const dup={id:run+'_duplicate',textNote:'同批重复ID测试'};
const duplicate=await ok('/sync/snapshots',token,{moments:[dup,dup]});
await note('同一批中的重复素材ID应去重',duplicate.imported===1,duplicate);
await ok('/sync/snapshots',token,{moments:[{...image,textNote:image.textNote+' 补充：在湖边停留十分钟。'}]});
const refreshed=await ok('/posts/'+img.id,token);
await note('修改备注后再次同步是否更新',refreshed.content.includes('十分钟'),{actual:refreshed.content,expectedSuffix:'补充：在湖边停留十分钟。',policy:'若产品约定同步后不可更新，则应明示'});
const audioPayload={moments:[{id:run+'_audio',mediaType:'AUDIO',capturedAt:Date.now()}],reflections:[{momentId:run+'_audio',audioPath:'/uploads/demo-audio/travel-note.wav',recognizedText:'纯音频验收'}]};
await ok('/sync/snapshots',token,audioPayload);
const audio=(await ok('/posts/snaps',token)).find(p=>p.vrMetadata.originalId===run+'_audio');
await note('纯音频素材类型应与音频一致',audio.vrMetadata.mediaType==='AUDIO',{metadata:audio.vrMetadata,mediaTypes:audio.mediaItems.map(m=>m.type)});
const privateDenied=await req('/posts/'+img.id,reader);await note('另一账号不能读取私密素材详情',privateDenied.status===404||privateDenied.status===403,{status:privateDenied.status});
const foreign=await req('/posts/diary/save',reader,{snapId:img.id,title:'越权来源验收',content:'只用于权限检查',status:'private'});
if(foreign.data?.id)evidence.posts.push({id:foreign.data.id,kind:'FOREIGN_SOURCE_DIARY',owner:'reader'});
await note('另一账号不能借保存日记复制私密素材',foreign.status>=400,{status:foreign.status,postId:foreign.data?.id,media:foreign.data?.mediaItems,location:foreign.data?.location});
const aiStart=await ok('/posts/diary/generate-batch',token,{snapIds:[txt.id,img.id],style:'纪实',tone:'客观',length:'简短'});
const aiDiary=await poll('/posts/ai/jobs',token,aiStart.jobId);evidence.aiDiaryJob=aiDiary;
await note('真实配置下日记生成任务完成',aiDiary.status==='DONE',aiDiary);if(aiDiary.postId)evidence.posts.push({id:aiDiary.postId,kind:'AI_DIARY'});
const anonJob=await req('/posts/ai/jobs/'+aiStart.jobId);await note('未登录不能读取私密日记任务结果',anonJob.status===401||anonJob.status===403||anonJob.status===404,{status:anonJob.status,exposesResult:!!anonJob.data?.result});
if(aiDiary.postId){
 const diary=await ok('/posts/'+aiDiary.postId,token);evidence.aiDiary=diary;
 await note('AI日记保留两个来源ID',diary.vrMetadata.sourceSnapIds.length===2,diary.vrMetadata);
 await ok('/posts/diary/save',token,{diaryId:diary.id,title:run+' 编辑后日记',content:diary.content+'\n人工补充：测试保存持久化。',status:'private'});
 const saved=await ok('/posts/'+diary.id,token);await note('编辑日记后正文与来源关联保留',saved.content.includes('测试保存持久化')&&saved.vrMetadata.sourceSnapIds.length===2,{id:saved.id,metadata:saved.vrMetadata});
 const start=await ok('/posts/travelogue/generate',token,{snapIds:[txt.id,img.id],diaryIds:[diary.id],prompt:'仅整理所选素材和日记，按9月17日、9月18日顺序，不编造乘船、登山或其他城市经历。',style:'纪实',tone:'客观',length:'简短'});
 const job=await poll('/posts/travelogue/job',token,start.jobId);evidence.travelogueJob=job;await note('真实配置下游记生成任务完成',job.status==='DONE',job);
 if(job.postId){evidence.posts.push({id:job.postId,kind:'AI_TRAVELOGUE'});const travel=await ok('/posts/'+job.postId,token);evidence.travelogue=travel;
 const urls=travel.mediaItems.map(m=>m.url);await note('素材与衍生日记一起生成时媒体不重复',new Set(urls).size===urls.length,{urls});
 const anon=await req('/posts/travelogue/job/'+start.jobId);await note('未登录不能读取私密游记任务',anon.status>=400,{status:anon.status,exposesResult:!!anon.data?.result});
 }
}
evidence.allAuthorPosts=(await ok('/posts/snaps',token)).map(p=>({id:p.id,originalId:p.vrMetadata.originalId}));
evidence.finishedAt=new Date().toISOString();await save();console.log(JSON.stringify({run,accounts:evidence.accounts,checks:evidence.checks.length,bugs:evidence.bugs.length,report:out}));
