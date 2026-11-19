import assert from 'node:assert/strict';
import {checkQuotes} from '../quote-check.mjs';
const receiver='0x2222222222222222222222222222222222222222';
const products={phone:'phonevalidation',litigation:'litigationvalidation','ip-to-zip':'iptozipdistance'};
function rig(missing=false,badHeader=false){
  const requests=[];
  const fetcher=async(url,options={})=>{
    requests.push({url,options});
    assert.equal(options.headers?.['PAYMENT-SIGNATURE'],undefined);assert.equal(options.headers?.Authorization,undefined);
    if(url.endsWith('/openapi.json'))return Response.json({paths:Object.fromEntries(Object.keys(products).filter(path=>!missing||path!=='ip-to-zip').map(path=>['/api/agent/v1/'+path,{post:{}}]))});
    const path=url.split('/').pop();assert.ok(products[path]);
    const requirement={scheme:'exact',network:'eip155:8453',asset:'0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',amount:'10000',payTo:receiver};
    if(options.method!=='POST')return Response.json({success:true,service:products[path],price:'0.010000',accepts:[requirement]});
    assert.equal(options.body,'{}');
    const challenge={x402Version:2,resource:{url},accepts:[requirement]};
    return Response.json({success:false,payment_required:challenge},{status:402,headers:{'PAYMENT-REQUIRED':Buffer.from(JSON.stringify(badHeader?{}:challenge),'utf8').toString('base64')}});
  };
  return {requests,fetcher};
}
const good=rig(),result=await checkQuotes(good.fetcher);
assert.equal(result.length,3);assert.ok(result.every(row=>row.listed_in_root_openapi));assert.equal(good.requests.length,7);
const old=rig(true);assert.equal((await checkQuotes(old.fetcher)).find(row=>row.service==='iptozipdistance').listed_in_root_openapi,false);
await assert.rejects(checkQuotes(rig(false,true).fetcher),/Header\/body quote must match/);
console.log('PASS: public quote checker verifies all three services and detects stale discovery/header mismatch, without signatures or payments.');
