const norm=v=>String(v??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/gi,'d').toLowerCase().replace(/[^a-z0-9]+/g,'');
const clean=v=>String(v??'').trim();
const reasons=['loi','ghichuloi','noidungloi','motaloi','error','noidungcanhbao','lydotuchoi'];
const deptKey=v=>{
 const t=clean(v).toUpperCase(),m=t.match(/^(\d{1,2})\.(\d{1,2})$/);
 return m?m[1].padStart(2,'0')+'.'+m[2].padEnd(2,'0'):t;
};
function readBook(buf,file){
 const book=XLSX.read(buf,{type:'array',cellHTML:false,cellStyles:false});
 const found=[],sheets=[],skipped=[],names={};
 for(const tab of book.SheetNames){
  const raw=XLSX.utils.sheet_to_json(book.Sheets[tab],{header:1,raw:false,blankrows:true,range:0});
  const hi=raw.findIndex(r=>r.some(c=>[...reasons,'tongsoloi','makhoa','tenkhoa'].includes(norm(c)))&&r.filter(c=>clean(c)).length>=2);
  if(hi<0){skipped.push(tab);continue;}
  const hdr=raw[hi],heads=hdr.map(norm);
  const col=(...keys)=>keys.flatMap(k=>heads.flatMap((x,i)=>x===k?[i]:[]));
  const er=col(...reasons),dc=col('makhoa'),dn=col('tenkhoa'),de=col('khoa','makhoa','tenkhoa');
  const patient=col('mabn','mabenhnhan'),name=col('hoten','tenbenhnhan','hovaten'),ref=col('mado','malk','malienket');
  const xml=col('xml','hosoloi'),count=col('tongsoloi'),date=col('ngayvao'),reasonCode=col('maloi'),category=col('loailoi');
  const deptCols=reasonCode.length?hdr.flatMap((v,j)=>/^(?:K\d+(?:\.\d+)?|\d{1,2}\.\d{1,2})$/i.test(clean(v))?[j]:[]):[];
  const kind=deptCols.length?'matrix':count.length&&patient.length?'case':er.length?'detail':'';
  if(kind)sheets.push(tab);else skipped.push(tab);
  raw.slice(hi+1).forEach((r,i)=>{
   const vals=ids=>ids.map(j=>clean(r[j])).filter(Boolean),get=ids=>vals(ids)[0]||'';
   if(dc.length&&dn.length&&get(dc)&&get(dn))names[deptKey(get(dc))]=get(dn);
   if(!kind)return;
   const note=[...new Set(vals(er).filter(x=>!['0','false','khongloi'].includes(norm(x))))].join('\n');
   const id=get(patient),state=get(category)||r.map(clean).find(x=>/^(HS|HỒ SƠ) (CẢNH BÁO|KHÔNG LÊN)/i.test(x))||'';
   const base={file,tab,line:hi+i+2,kind,dept:deptKey(get(de)),name:get(name),id,start:get(date),xml:get(xml),note,state,refid:'',code:get(reasonCode)};
   if(kind==='matrix'){
    if(!note)return;
    for(const j of deptCols){const qty=Number(clean(r[j]));if(Number.isSafeInteger(qty)&&qty>0)found.push({...base,dept:deptKey(hdr[j]),qty});}
   }else if(kind==='case'){
    const qty=Number(get(count));if(id&&Number.isSafeInteger(qty)&&qty>0)found.push({...base,qty,note:'Tổng số lỗi ghi tại dòng hồ sơ: '+qty,extra:get(col('ngaykiemtra'))});
   }else if(note){
    const legacy=r.find((v,j)=>!heads[j]&&/^[A-Z]{2}\d{18,}$/i.test(clean(v)));
    base.refid=vals(ref).find(x=>x!==state)||clean(legacy);
    base.item=get(col('idcp'));base.extra=[get(col('tenchiphi')),get(col('chinhsua'))].filter(Boolean).join(' · ');
    found.push(base);
   }
  });
 }
 if(!sheets.length)throw Error('Không tìm thấy bảng chi tiết lỗi hoặc thống kê lỗi theo khoa.');
 return {found,sheets,skipped,names};
}
function group(rows){
 const buckets=new Map();const result=[];
 for(const r of rows){
  const key=r.kind==='detail'&&r.refid?JSON.stringify([r.refid,r.id,r.start,r.xml,r.note,r.item,r.extra]):'';
  let b=buckets.get(key);if(!b){b=[];buckets.set(key,b);}
  let match=key&&b.find(a=>a.sources.every(s=>s.file!==r.file)&&(!r.dept||!a.dept||a.dept===r.dept));
  if(match){match.sources.push(r);match.dept||=r.dept;match.state||=r.state;}
  else{const a={...r,sources:[r]};b.push(a);result.push(a);}
 }
 return result;
}
