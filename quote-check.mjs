// Node.js 20+. Public metadata and unsigned quotes only: no wallet or payment.
import assert from 'node:assert/strict';
import {pathToFileURL} from 'node:url';

export async function checkQuotes(fetcher=fetch) {
  const origin='https://rexvalidate.com';
  const resources=[['phone','phonevalidation'],['litigation','litigationvalidation'],['ip-to-zip','iptozipdistance']];
  const specResponse=await fetcher(origin+'/openapi.json',{signal:AbortSignal.timeout(20000)});
  assert.equal(specResponse.status,200,'Root OpenAPI must be publicly accessible');
  const spec=await specResponse.json();
  const results=[];
  for (const [path,service] of resources) {
    const url=origin+'/api/agent/v1/'+path;
    const metadataResponse=await fetcher(url,{signal:AbortSignal.timeout(20000)});
    assert.equal(metadataResponse.status,200,'Unavailable metadata: '+path);
    const metadata=await metadataResponse.json();
    assert.equal(metadata.success,true);assert.equal(metadata.service,service);
    const response=await fetcher(url,{method:'POST',headers:{'Content-Type':'application/json'},body:'{}',signal:AbortSignal.timeout(20000)});
    assert.equal(response.status,402,'Unsigned discovery must return a quote: '+path);
    const body=await response.json();
    const quote=JSON.parse(Buffer.from(response.headers.get('PAYMENT-REQUIRED') || '','base64').toString('utf8'));
    assert.deepEqual(quote,body.payment_required,'Header/body quote must match');
    assert.equal(quote.x402Version,2);assert.equal(quote.resource.url,url);
    assert.equal(quote.accepts.length,1);
    const requirement=quote.accepts[0];
    assert.equal(requirement.network,'eip155:8453');assert.equal(requirement.scheme,'exact');
    assert.equal(requirement.asset,'0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913');
    assert.match(requirement.amount,/^[1-9][0-9]*$/);
    assert.equal(requirement.amount,metadata.accepts[0].amount);
    assert.equal(requirement.amount,metadata.price.replace('.','').replace(/^0+/,''));
    assert.equal('request_id' in body,false,'A discovery probe must not reserve a purchase');
    results.push({service,price_usdc:metadata.price,network:requirement.network,listed_in_root_openapi:!!spec.paths?.['/api/agent/v1/'+path]?.post});
  }
  return results;
}

if (process.argv[1] && import.meta.url===pathToFileURL(process.argv[1]).href) {
  try {
    const results=await checkQuotes();console.log(JSON.stringify({payment_submitted:false,results},null,2));
    if(results.some(row=>!row.listed_in_root_openapi))process.exitCode=1;
  } catch(error) { console.error('Read-only readiness check failed: '+error.message);process.exitCode=1; }
}
