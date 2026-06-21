# Proxy Agent

With your CLI tools(Claude Code, Codex, OpenClaw/Hermess, Cursor), we build an agent proxy layer that help to save ~50% tokens with Headroom/RTK/Caveman/Ponytail in the hood + auto-fallback to open-source AI models(Kimi/Deepseek/Qwen/Minimax/GLM...). This tools leverage your AI subscriptions like Claude X20, Codex X20, Grok CLI, SuperGrok Heavy, OpenRouter, Azure... or your local models like Gemma, DeepSeek, Kimi, Ollama, HuggingFace, etc.

## Key Features

1. Cost Optimization

We combine Triple-Stack to optimize your token cost
- Headroom (API Interceptor) - 64K ⭐
- RTK (Shell CLI Proxy) - 42K ⭐
- Caveman (Output Formatter) - 75K ⭐
- Ponytail (AI agent think like the laziest/smartest senior engineer) - 45K ⭐

Combile with Auto-route: Subscription → Opensource Model

2. CLI Agnostic

- Works with any CLI tool
- Focus on OpenAI/Anthropic-compatible APIs

3. Multi-Account Support

Multiple accounts per provider - Load balancing + redundancy

4. Auto Token Refresh

OAuth tokens refresh automatically - No manual re-login needed

5. Security + Audit Support

- Real-Time Quota Tracking - Live token count + reset countdown
- Audit logs for all operations - Troubleshoot issues easily
- Guardrails + Policies supports
- Secret management - Keep your credentials safe(support Hashicorp Vault first)

6. Usage Analytics

- Manage tokens, cost, trends over time - Get insights into your AI usage
- Set budgets on Users and Teams

7. Cloud Sync

Simple stack(SQLite) - Sync config across devices - Same setup everywhere

8. Deploy Anywhere

- Bundle to a binary -> Run anywhere - Localhost, VPS, Docker, Cloudflare Workers
- Support Dockerfile, can deploy to any container runtime

9. Support customize hooks

We build an internal hook lifecycle allowing you customize the bahavior of proxies, something like a middleware to intercept requests/responses

10. Support knowledge base

Using Vector Stores to store and retrieve knowledge base data from your own/team knowledge base
No need duplicate knowledge base data across multiple agents/members/tools


## API Designs

api/v1/auth/sign-up
api/v1/auth/sign-in
api/v1/auth/sign-out
api/v1/auth/oidc
api/v1/auth/reset-password
api/v1/auth/forgot-password

api/v1/health
api/v1/health/liveness
api/v1/health/readiness

api/v1/tokens/headroom/start
api/v1/tokens/headroom/stop
api/v1/tokens/headroom/status

api/v1/groups
api/v1/groups/settings
api/v1/groups/:id
api/v1/groups/:id/keys
api/v1/groups/:id/keys/settings
api/v1/groups/:id/keys/:id
api/v1/groups/:id/keys/:id/users
api/v1/groups/:id/keys/:id/users/settings
api/v1/groups/:id/keys/:id/users/:id

api/v1/providers
api/v1/providers/:id
api/v1/models
api/v1/models/:id

api/v1/proxy-pools
api/v1/proxy-pools/:id

api/v1/settings

api/v1/tunnels
api/v1/tunnels/:id(support tailscale/netbird)

api/v1/audits
api/v1/audits/usage
api/v1/audits/usage/stream
api/v1/audits/usage/stats
api/v1/audits/usage/requests
api/v1/audits/usage/histories
api/v1/audits/usage/histories/:id

api/v1/chat/completions
api/v1/chat/messages
api/v1/chat/embeddings
api/v1/responses
api/v1/responses/compact
api/v1/responses/search
api/v1/search

api/v1/evals
api/v1/memories
api/v1/rag
api/v1/query
api/v1/rerank
api/v1/realtime


## CLI support

`proxy-agent` is a CLI tool that provides a convenient way to interact with the proxy agent API.

### Commands

-
