# Rex Validate: API tools for AI agents

Validate a US phone, screen a phone against the configured blacklist, or calculate approximate IP-to-US-ZIP distance. Public requests use x402 v2 and native USDC on Base mainnet. No Rex Validate signup or campaign API key is required.

**[Start with the setup guide](https://rexvalidate.com/agents/quickstart.html)** · [OpenAPI](https://rexvalidate.com/openapi.json) · [Agentic Market](https://agentic.market/services/rexvalidate-com) · [x402scan](https://www.x402scan.com/server/e840fadc-83ea-4e94-ab60-7fedfb354124)

## The tools

| Tool | POST endpoint | Required lead fields | Result |
| --- | --- | --- | --- |
| US Phone Validation | `/api/agent/v1/phone` | `phone` | Pass/fail based on provider connection classification |
| Litigation List Screening | `/api/agent/v1/litigation` | `phone` | Configured phone-blacklist match/no match |
| IP to ZIP Distance | `/api/agent/v1/ip-to-zip` | `ip`, `zip` | Approximate straight-line miles between ZIP locations |

Each JSON request also requires a **fresh private cryptographically random 32-byte idempotency key encoded as 64 lowercase hex characters**. Preserve it with the original input and signed proof. The public API does not accept your campaign key.

## Try discovery without a wallet or payment

Node.js 20+ is required. There are no npm dependencies. From this directory:

```bash
node quote-check.mjs
```

The script reads root OpenAPI and makes a GET plus an unsigned empty POST to each public endpoint. It checks the live x402 quote, Base network and agreement between header/body. It never opens a wallet, signs a payment or runs validation. A `402` response is the expected payment quote. A missing root discovery path or mismatched quote causes a nonzero exit code.

Run the offline fixtures:

```bash
npm test
```

## Make one intentional purchase with an agent

1. Open the [x402scan listing](https://www.x402scan.com/server/e840fadc-83ea-4e94-ab60-7fedfb354124), select **Try with AgentCash → Poncho**, or use your own AgentCash-equipped agent.
2. Complete wallet setup and funding through that application's official UI. The agent wallet needs its own supported funds; an existing MetaMask balance does not automatically fund it.
3. Inspect the live quote and set a per-call budget. The current quote, rather than this README, determines the price.
4. Ask for one lookup. For example:

```text
Use AgentCash to run one lookup with POST
https://rexvalidate.com/api/agent/v1/ip-to-zip
Use IP 8.8.8.8 and ZIP "10001".
Generate a fresh cryptographically random 64-character lowercase hex
idempotency_key. Preserve the original request privately.
Maximum payment: 0.01 USDC on Base; no other paid calls.
Stop if the quote exceeds the cap. Return the full result and transaction.
If the paid response is lost or unconfirmed, stop without authorizing
another payment or generating a different request key.
```

The public IP is an example, not a guaranteed location. ZIP is a five-digit string, preserving leading zeros. A phone input is ten digits, optionally prefixed with `+1`.

### Successful user-run example

A Poncho/AgentCash test on November 18, 2026 returned 2,556.58 miles from provider-estimated IP ZIP 94043 to supplied ZIP 10001 and reported one settled 0.01-USDC payment on Base. No further paid calls were reported. This demonstrates the distance product's paid agent flow, not paid AgentCash acceptance of every other tool or a performance guarantee. Private keys, request keys, signed proofs and payer details are omitted.

## Billing and retry rules

- Each endpoint is a separate purchase. Completed phone/screening results are billable whether pass or fail; completed distance results are billable at any mileage. Provider failures do not settle.
- Quote and result prices come from the live service. The Node example above never pays. The agent prompt authorizes only one purchase within its stated cap.
- An archived result requires the original body, private request key and **original signed payment proof**. A new AgentCash fetch can generate a new proof and is not a guaranteed replay.
- After an uncertain payment, preserve the original details and contact support with the request ID. Do not sign a replacement. The [browser test pages](https://rexvalidate.com/agents/quickstart.html) provide a tested save/restore-original-proof workflow.

## Result scope

Phone validation does not establish identity, ownership or consent. A blacklist no-match is not permission to call or message. Distance is approximate straight-line ZIP-location context, not driving distance, exact device location or proof of residence. IP location can be affected by VPNs, mobile networks and provider estimates.

A plain HTTP node does not automatically handle x402 payments. n8n, LangChain and other custom integrations need a compatible funded payment client or adapter; this repository does not claim those integrations are already built or tested.

## References and support

- [Phone contract](https://rexvalidate.com/agents/phone.openapi.json) / [instructions](https://rexvalidate.com/agents/phone.md)
- [Screening contract](https://rexvalidate.com/agents/litigation.openapi.json) / [instructions](https://rexvalidate.com/agents/litigation.md)
- [Distance contract](https://rexvalidate.com/agents/ip-to-zip.openapi.json) / [instructions](https://rexvalidate.com/agents/ip-to-zip.md)
- [AgentCash installation](https://agentcash.dev/install)
- Support: [support@rexmartech.com](mailto:support@rexmartech.com)

Existing campaign reporting retains validation data. Keep real lead inputs and private retry files out of public issues and examples. This public quickstart contains example/documentation files; the production service remains hosted by Rex Validate.
