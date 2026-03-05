# Implementation Plan: Add WooCommerce & Visualization Tools

## Project Status
- **Current State**: Next.js chatbot with basic tools (getWeather, getValue, createDocument, updateDocument)
- **Goal**: Add WooCommerce tools, visualization tools, and advanced analytics like woomcp.ts

## Architecture Overview

```mermaid
graph TB
    subgraph "User Interface"
        UI[Chat UI / Frontend]
    end
    
    subgraph "Next.js API Route"
        API[app/(chat)/api/chat/route.ts]
    end
    
    subgraph "Tool Layer"
        WC[WooCommerce Tools]
        VIS[Visualization Tools]
        ADV[Advanced Tools]
    end
    
    subgraph "External APIs"
        Woo[WooCommerce REST API]
        WSE[WSE AI Endpoint]
    end
    
    UI --> API
    API --> WC
    API --> VIS
    API --> ADV
    WC --> Woo
    ADV --> WSE
```

---

## Detailed Tool Implementation

### 1. WooCommerce API Client
**File**: `lib/ai/tools/woo-commerce/client.ts`

```typescript
class WooCommerceAPI {
  // Methods:
  // - getProducts(params) → products list
  // - getOrders(params) → orders list
  // - getCustomers(params) → customers list
  // - getReports() → sales & analytics
  // - getStoreOverview(period) → dashboard data
  // - getData(endpoint, params) → generic API call
}
```

---

### 2. WooCommerce Tools

| Tool | Description | Input |
|------|-------------|-------|
| `getProducts` | Fetch products with filters | `per_page, page, orderby, order, status, category, search, stock_status, featured, min_price, max_price` |
| `getOrders` | Fetch orders with details | `per_page, page, orderby, order, status, customer, after, before` |
| `getCustomers` | List customers | `per_page, page, orderby, order, search` |
| `getReports` | Sales & analytics | `type: sales/top_sellers/coupons` |
| `getStoreOverview` | Dashboard summary | `period: week/month/last_month/year` |
| `getData` | Generic API call | `endpoint, params` |

---

### 3. Visualization Tools

| Tool | Description | Output |
|------|-------------|--------|
| `createCard` | KPI card display | `{ title, value, prefix, suffix, description }` |
| `createChart` | Charts (line/bar/pie/doughnut) | Chart.js config |
| `createTable` | Data tables | `{ columns, rows, title, summary }` |
| `createMap` | Location maps | `{ entityType, points: [{ lat, lng, label, ids }] }` |

---

### 4. Advanced Tools

| Tool | Description | Input |
|------|-------------|-------|
| `codeInterpreter` | Sandboxed JS execution | JavaScript code |
| `queryWSE` | Natural language queries | Business question |

---

## Configuration Required

### Environment Variables
```
WOO_API_URL=https://your-store.com
WOO_CONSUMER_KEY=ck_xxx
WOO_CONSUMER_SECRET=cs_xxx
WSE_API_KEY=xxx
```

---

## Implementation Steps

1. **Create WooCommerce API client** (`lib/ai/tools/woo-commerce/client.ts`)
2. **Create helper functions** (`lib/ai/tools/woo-commerce/helpers.ts`)
   - `createInjectedAndLoggedTool()` - wrapper for tool creation
   - `fetchAll()` - auto-pagination
3. **Add all tools** in `lib/ai/tools/woo-commerce/index.ts`
4. **Update types** in `lib/types.ts`
5. **Register tools** in `app/(chat)/api/chat/route.ts`
6. **Add UI components** for visualizations (card, chart, table, map)

---

## Files to Create/Modify

| File | Action |
|------|--------|
| `lib/ai/tools/woo-commerce/client.ts` | Create |
| `lib/ai/tools/woo-commerce/helpers.ts` | Create |
| `lib/ai/tools/woo-commerce/index.ts` | Create |
| `lib/types.ts` | Modify - add new tool types |
| `app/(chat)/api/chat/route.ts` | Modify - register new tools |
| `components/ui/card.tsx` | May need enhancements |
| `components/ui/chart.tsx` | Create if needed |
| `components/ui/table.tsx` | Create if needed |
| `components/ui/map.tsx` | Create if needed |

---

## Key Decisions Needed

1. **How to configure WooCommerce?** 
   - Option A: Environment variables (simple, multi-tenant)
   - Option B: User settings page (per-user config)
   - Option C: Pass config in each tool call

2. **Sandboxed code execution?**
   - Need a safe runner (vm2, isolated-vm, or custom)
   - Or skip for security reasons

3. **WSE endpoint required?**
   - Need to set up the WordPress plugin

---

## Is This Doable?

**YES!** ✅

This project uses Vercel AI SDK (`import { tool } from "ai"`), exactly like your wootools project. The tool pattern is identical:
- `tool({ description, inputSchema, execute })`

The tools from woomcp.ts can be ported with minimal changes:
1. Remove class dependencies
2. Use environment variables for config
3. Add to the tools object in the API route

---
