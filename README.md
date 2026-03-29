# ***Polymarket Trading bot*** - Copytrading Bot

## Overview

Every prediction market has a leaderboard. Most people ignore it. <br/>
I didn't.  
I kept seeing the same cluster of wallets at the top. BTC calls, election outcomes, sports results. Not once or twice but over and over. They weren't getting lucky. They were early, sized right, and out before most people even noticed the move.<br/>
So I spent a few weeks just watching. No code, no trades. Just tracking wallets.<br/>
What I saw wasn't luck. It was speed. It was precision. Something I didn't have, or at least not fast enough.<br/>
So I started building.<br/>
First version was a pure arbitrage bot. My own signals, my own logic. It worked for a while too. Decent returns, nothing crazy but consistent.<br/>
Then it stopped working.<br/>
Not a sudden blowup. It just slowly started losing. The edge dried up. The market moved faster than my logic did. I ended that run down money and stuck on one question:<br/>
Why am I trying to outsmart wallets that are already winning?<br/>
That's where this bot came from.<br/>
Instead of building my own edge from scratch, I built something that finds the wallets already beating the market and follows them. Crypto, politics, sports, world events, whatever's on Polymarket. It mirrors their moves at your scale, with your risk settings, while you're doing something else.
You don't have to be the best trader on Polymarket. You just have to know who is.

# Polymarket Copy Trading Bot

[TypeScript](https://www.typescriptlang.org/) [Node](https://nodejs.org/) [License: ISC](https://opensource.org/licenses/ISC) [Build](package.json) [Polymarket](https://polymarket.com/)

## Still Not Sure This Is For You?

Think about your last five manual trades.
How many of them beat the wallets already sitting at the top of those markets?
Probably not most.
That's not really a skill gap. It's a speed and information gap. The top wallets aren't necessarily smarter. They're faster, more disciplined, and they compound small edges into real returns.
This bot puts you behind them.
Across every category. At your size. Without you needing to be online.

## How It Works

You can't get inside their heads. But you can watch their wallets.

The bot connects to Polymarket's live orderbook via WebSocket and tracks the whale wallets you pick through the CLOB API.


### Every Market Category, Not Just Crypto

Crypto is one slice of Polymarket. The sharpest wallets are across all of it.
This bot covers **crypto** (BTC, SOL, ETH, XRP and more), **politics**, **sports**, **world events**, **economics**, **weather** and anything else Polymarket lists.
`COPYTRADE_MARKETS` takes a comma-separated list of slugs. You define how wide you want to go.

### Live Data, Not Polling

`websocketOrderbook` holds an open connection to Polymarket's CLOB market channel and keeps best bid and ask current by token ID.
When a target wallet moves, the signal comes in fast. No lag from polling.

### Sized To Your Balance

A whale firing 10% of a $50k stack is very different from your $500 account doing the same thing.
The bot scales position sizes to your balance, not theirs.
`COPYTRADE_SHARES` controls how many shares per trade. `COPYTRADE_MAX_BUY_COUNTS_PER_SIDE` caps how many times you buy per side per market.

### It Skips Bad Entries

Some signals show up too late or without enough confidence to act on.
`pricePredictor` scores each signal and only passes through `BUY_UP` or `BUY_DOWN` when confidence clears the threshold. Otherwise it emits `HOLD` and the bot waits.
`COPYTRADE_PRICE_BUFFER` adds extra protection against price drift at execution. `BOT_MIN_USDC_BALANCE` keeps the bot from running on fumes.

## Proof of Work

Analytics for the wallet this bot ran on: [polymarket.com/@distinct-baguette](https://polymarket.com/@distinct-baguette)

[https://github.com/user-attachments/assets/b534ed0b-4d7f-46aa-851a-31abf609ee8b](https://github.com/user-attachments/assets/b534ed0b-4d7f-46aa-851a-31abf609ee8b)

### Backtest Results

Backtested across 177 markets over two days. $100 order size per entry.

```
markets_count:     177
markets_replayed:  177
total_entries:     108
total_risk_sells:  66
skipped_low_conf:  68
total_pnl:         1938.00
stats:             win_rate=23.73%  avg_win=+46.14  max_dd=0.00
```

```
daily_stats:
  date         markets  up  down    pnl      win_rate   total_cost
  2026-03-18     93     81   12   +1070.00   24.73%     3900.00
  2026-03-19     84     58   26    +868.00   22.62%     2580.00

overall:
  total_cost:          6480.00
  avg_cost_per_market: 36.61
  pnl_per_market:      +10.95
  up_trades:           139
  down_trades:         38

*** TOTAL PNL: +1938.00 ***
```

68 trades were skipped because the predictor's confidence was below threshold. That's the filter working. The bot only placed 108 of a possible 176 entries, and still came out positive on 23.73% of them with zero max drawdown.

### What People Are Saying

> *"Watched it run for a week before putting real money in. Been live for three weeks, sitting at +19%. Setup was straightforward."*
> @0xflip, Discord

> *"I appreciated that it doesn't just blindly copy. The confidence filter actually skips a lot of noise. That alone saved me from some bad entries."*
> @mktmaker, Telegram

> *"Cloned it, filled in the .env, ran it. Took maybe 10 minutes total including reading through the config."*
> @synthwave, Telegram

Running it? Share your results and PR the table.

## Getting Started

Open source, free to use. A few things to know before jumping in.

```
1. Follow the setup steps below
2. Pick the whale wallets you want to copy and the markets you want to cover
3. Start with a real budget. Somewhere above $3-4k gives you room to actually size positions meaningfully.
   Small accounts will feel every loss hard.
```

## Run It

```bash
git clone https://github.com/CrewSX/polymarket-trading-bot.git
cd polymarket-trading-bot
npm install
cp .env.temp .env
# fill in your private key and set your markets
npm start
```

You need Node.js 18+ (or Bun), a Polygon wallet with USDC, and an RPC URL.

## Configuration

Copy the example env and set at least `PRIVATE_KEY` and `COPYTRADE_MARKETS`:

```bash
cp .env.example .env
```


## Make It Yours

The bot ships with sensible defaults. But sensible is just the starting point. Here's every dial you can turn.

<details>
<summary><strong>Full Configuration Reference</strong></summary>

| Group | Key | What it changes in your story |
|---|---|---|
| Market Selection | `COPYTRADE_MARKETS` | Comma-separated slugs across any category. Each slug becomes an active watched market in `src/order-builder/copytrade.ts`. Crypto, politics, sports, anything Polymarket lists. |
| Execution | `PRIVATE_KEY` | Signs every order through `ethers.Wallet` and drives CLOB API key derivation in `src/providers/clobclient.ts`. |
| Execution | `CLOB_API_URL` | Base URL used by `ClobClient` for orderbook reads and order posting. |
| Execution | `RPC_URL` / `RPC_TOKEN` | Polygon RPC endpoint used by `src/security/allowance.ts` for USDC and CTF approvals, and by `src/utils/redeem.ts` for resolution checks. |
| Execution | `CHAIN_ID` | Chain ID passed to `ClobClient` at boot. 137 for Polygon mainnet. |
| Position Sizing | `COPYTRADE_SHARES` | How many shares the bot places per side per trade. This is your primary size control. |
| Position Sizing | `COPYTRADE_MAX_BUY_COUNTS_PER_SIDE` | Caps how many times the bot buys per side within a single market. Set to 0 to remove the cap entirely. |
| Precision | `COPYTRADE_TICK_SIZE` | Price tick precision for order placement. Needs to match the market's configured tick or orders will be rejected. |
| Risk Management | `COPYTRADE_PRICE_BUFFER` | Extra price buffer applied at execution to protect against drift between signal time and order fill. |
| Risk Management | `BOT_MIN_USDC_BALANCE` | The bot checks this before starting. If your USDC balance is below it, execution does not begin. |
| Timing | `COPYTRADE_WAIT_FOR_NEXT_MARKET_START` | When true, the bot holds until the next market open before entering the first cycle. Useful for clean entries. |
| Logging | `LOG_DIR` / `LOG_FILE_PREFIX` | Directory and filename prefix for structured log output. Every trade attempt is recorded here. |

</details>


## About Your Keys

Use a dedicated wallet. Don't mix this with funds you care about in other contexts.

Keep `PRIVATE_KEY` in `.env` and keep `.env` out of version control. Rotate the key if you think it leaked.

The key signs orders through `ClobClient` in `src/providers/clobclient.ts`. Nothing in this repo sends your key anywhere else. But you should read the deps yourself before funding anything.

Signing logic is in `src/providers/clobclient.ts`. If something looks wrong, open an issue.

## Code Overview

```text
        +------------------------------+
        |        src/index.ts          |
        | boot + credentials + CLOB    |
        +---------------+--------------+
                        |
          +-------------+-------------+
          |                           |
+---------v-----------+    +----------v----------+
| websocketOrderbook  |    | CopytradeArbBot     |
| live bid/ask        |    | market resolution   |
| by token ID         |    | signal + execution  |
+---------+-----------+    +----------+----------+
          |                           |
          v                           v
    best bid/ask              pricePredictor.ts
    (in memory)               direction + confidence
                                      |
                                      v
                              clobclient.ts
                              order placement
                                      |
                                      v
                           Polymarket CLOB API
```



## Redemption

Once markets resolve, claim your winnings:

```bash
# Auto-redeem from holdings file
npm run redeem:holdings

# Redeem by condition ID
npm run redeem

# Check a condition before redeeming
bun src/redeem.ts --check <conditionId>
```

## Development

```bash
# Type check
npx tsc --noEmit

# Hot reload
bun --watch src/index.ts
```

## Risk

This is prediction market trading. You can lose money. This software has no guarantees.
Use funds you can afford to lose, review the code before funding a live wallet, and don't run it without understanding the config.

## Contact

Questions or feedback: [Telegram](https://t.me/@crewsxdev)

## One Last Thing

At some point tonight a wallet on Polymarket is going to open a position on something you would have missed or been too slow to catch.
With this bot running, you won't miss it.
You'll be asleep. It won't matter.

⭐ Star the repo if this is useful.

## License

ISC