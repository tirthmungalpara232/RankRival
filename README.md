# 🏏 CricSphere Pro — Full-Stack Cricket Sports Database Management System

A production-grade, state-of-the-art Cricket Sports Management & Tournament Administration Web Application built with **React**, **Node.js**, **Express**, and a dual **MySQL/MariaDB & SQLite** relational database architecture.

---

## 🌟 Key Features

### 1. 🏆 Tournament Management ("Conduct Your Tournament")
- **Organizers Can Host Tournaments**: Create international or domestic tournaments with custom formats (**T20**, **ODI**, **T10**, **Test**).
- **Custom Prize Pools & Entry Fees**: Configure total prize money, host countries, cities, and tournament rules.
- **Participating Squads**: Select and invite national or club teams.
- **Fixture Scheduling**: Schedule matches, select venues, assign match stages (Group, Semi-final, Final), and assign umpires.
- **Dynamic Points Table**: Auto-calculated points table with Matches Played, Won, Lost, Tied, Points, and **Net Run Rate (NRR)**.

### 2. 🛡️ Tournament Participation
- **Open Registration**: Users and teams can browse active/upcoming tournaments and register with a single click.
- **Squad Roster Linking**: Associate registered teams with player squads and captains.
- **Registration Status**: Track pending, approved, and participating tournament entries in `tournament_registration`.

### 3. ⚡ Interactive Live Match Center & Ball-by-Ball Scorer
- **Live Match Scoreboard**: Real-time scoreboard with run rates, overs, current batters on strike, and active bowlers.
- **Interactive Scorer Console**: Score live balls with single clicks:
  - `0` (Dot Ball)
  - `1`, `2`, `3` (Singles & Running between wickets)
  - `4` (Boundary Four 🔥)
  - `6` (Maximum Six 🚀)
  - `W` (Wicket 💥 — Bowled, Caught, LBW, Run Out, Stumped)
  - `Wd` (Wide ball) / `Nb` (No ball)
- **Live Commentary Engine**: Generates real-time cricket commentary for every ball bowled.
- **Instant Stat Synchronization**: Automatically updates batter scores, balls faced, boundaries, strike rate, bowler figures, and match totals in `player_match_stats`.
- **Match Conclusion & Awards**: Mark matches completed, declare winners by runs or wickets, and award **Player of the Match (POM)** trophies with cash bonuses.

### 4. 📊 Player Performance Records & Career Tracking
- **Tournament Participation History**: Detailed breakdown of every tournament a player participated in, displaying:
  - Matches played in tournament
  - Total runs scored & highest score
  - Batting strike rate
  - Wickets taken & bowling economy
  - Catches taken
  - Player of the Match awards
  - **Tournament Earnings ($)** earned from that specific tournament!
- **Career Honors**: Fifties (50s), Hundreds (100s), bowling average, boundaries, and career aggregates.
- **Match-by-Match Logs**: Full match history log showing opponent, runs, dismissal mode, and figures.

### 5. 💰 Prize Money & Player Earnings Hub
- **Tournament Prize Distribution**: Track how much money each player and team earns from tournaments.
- **Itemized Financial Ledger**: Payout categories including:
  - **Tournament Prize Share** (Champions, Runners-up, Semi-Finalists)
  - **Player of the Match Bonuses** ($15,000 per match award)
  - **Match Appearance Fees** ($5,000 per fixture)
  - **Performance Bonuses**
- **Financial Leaderboard**: Rankings of highest-earning cricketers across tournaments.
- **Disburse Payouts**: Organizers and admins can disburse cash prizes and bonuses directly to players.

### 6. 🎖️ The Honors Board (Multi-Parameter Leaderboards)
Comprehensive leaderboards filterable by **All Tournaments (Career)** or by specific tournament:
- 🟠 **Orange Cap**: Highest run-scorers with average, strike rate, 4s, 6s, 50s, and 100s.
- 🟣 **Purple Cap**: Leading wicket-takers with overs, economy, and bowling average.
- ⚡ **Power Hitters**: Highest strike rates (with minimum balls faced filter).
- 🚀 **Boundary Kings**: Most sixes and fours hit.
- 🧤 **Safest Hands**: Leading fielders by catches taken.
- ⭐ **MVP Rating**: Most Valuable Player index formula:
  $$\text{MVP} = (\text{Runs} \times 1) + (\text{Wickets} \times 25) + (\text{Catches} \times 10) + (\text{Sixes} \times 2.5)$$
- 💰 **Top Earners**: Richest cricketers ranked by cumulative tournament earnings.

### 7. ⚔️ Head-to-Head Player Comparison Tool
- Select any two cricketers side-by-side.
- Comparative radar bars for Matches, Runs, Strike Rate, Average, Wickets, Economy, Catches, and Total Earnings.

---

## 🗄️ Database Schema & Modifications

The original `cricket_db.sql` database was enhanced to support all modern tournament, user authentication, and financial requirements while preserving 100% of the original data.

### Newly Added Tables:
1. **`users`**:
   - `user_id` (PK, AUTO_INCREMENT)
   - `username`, `email`, `password_hash` (bcrypt), `full_name`
   - `role` ('Player', 'Organizer', 'Admin')
   - `player_id` (FK to `player.player_id` — links user accounts directly to player career stats)
   - `avatar`, `created_at`

2. **`tournament_registration`**:
   - `registration_id` (PK, AUTO_INCREMENT)
   - `tournament_id` (FK to `tournament`)
   - `team_id` (FK to `teams`)
   - `user_id` (FK to `users`)
   - `status` ('Approved', 'Pending', 'Rejected')
   - `registration_date`, `notes`

3. **`player_earnings`**:
   - `earning_id` (PK, AUTO_INCREMENT)
   - `player_id` (FK to `player`)
   - `tournament_id` (FK to `tournament`)
   - `match_id` (FK to `matches`)
   - `earning_type` ('Tournament Prize Share', 'Player of the Match', 'Match Fee', 'Performance Bonus')
   - `amount` (DECIMAL 12,2)
   - `currency` ('USD')
   - `date_awarded`, `description`

4. **`match_balls`**:
   - `ball_id` (PK, AUTO_INCREMENT)
   - `match_id` (FK to `matches`)
   - `innings`, `over_num`, `ball_num`
   - `striker_id` (FK to `player`)
   - `bowler_id` (FK to `player`)
   - `runs`, `extras`, `extra_type`
   - `is_wicket`, `wicket_type`, `commentary`

### Enhanced Existing Tables:
- **`tournament`**: Added `created_by_user_id`, `entry_fee`, `description`, `winner_team_id`, `runner_up_team_id`.
- **`cricket_db_updated.sql`**: Complete export ready for import into MySQL / MariaDB / phpMyAdmin.

---

## 🚀 Quick Start Guide

### Option A: 1-Click Run (Zero Configuration with Built-in SQLite)
The application includes a pre-seeded, synchronized SQLite engine so you can run it immediately without starting XAMPP:

```bash
# 1. Install dependencies (if not already installed)
npm install
cd server && npm install
cd ../client && npm install
cd ..

# 2. Run the Full-Stack Application
npm start
```
Open **`http://localhost:5000`** in your browser!

---

### Option B: Running directly with XAMPP MySQL (Recommended)
Connect directly to your XAMPP MySQL database without any local SQLite file or init script:

1. Open **XAMPP Control Panel** and start **Apache** and **MySQL**.
2. Open **phpMyAdmin** (`http://localhost/phpmyadmin`).
3. Create a new database named **`new_cricket_db`** (or `cricket_db`).
4. Click on the **Import** tab and import **`cricket_db_updated.sql`**.
5. Check your `server/.env` file:
   ```env
   PORT=5000
   JWT_SECRET=cricsphere_super_secret_jwt_token_key_2026
   DB_CLIENT=mysql
   DB_HOST=127.0.0.1
   DB_PORT=3306
   DB_USER=root
   DB_PASSWORD=
   DB_NAME=new_cricket_db
   ```
6. Start the backend:
   ```bash
   cd server
   npm install
   npm start
   ```
7. Start the frontend:
   ```bash
   cd client
   npm install
   npm run dev
   ```
   Open **`http://localhost:5173`** (or `http://localhost:5000` for production build).

---

## 🔑 Demo Login Accounts & Role-Based Access Control (RBAC)

The system enforces strict role-based permissions:

| Username / Login | Password | Role | Allowed Permissions | Disallowed (Hidden & Protected) |
| :--- | :--- | :--- | :--- | :--- |
| **`tanmay_desai`** | `password123` | **Player** | • **"🏆 Join Tournament"** (participate)<br>• Search all player career records<br>• View honors & leaderboards<br>• Spectator mode on live matches | ❌ Cannot conduct tournaments<br>❌ Cannot schedule fixtures<br>❌ Cannot update/score live matches<br>❌ Cannot disburse prize money |
| **`liam_baxter`** | `password123` | **Player** | Same as above (Australia team) | Same as above |
| **`organizer`** | `password123` | **Organizer** | • **"➕ Host Tournament"**<br>• Schedule matches & venues<br>• Live ball-by-ball scoring keypad<br>• Conclude matches & POM awards<br>• Disburse prize money | — |
| **`admin`** | `password123` | **Admin** | Full system administration | — |

*(You can also click **"Create Account"** to register a new user as either a Player or an Organizer)*

---

## 📡 API Endpoints Reference

### Authentication
- `POST /api/auth/register` — Create new user + auto-create player profile
- `POST /api/auth/login` — Sign in and get JWT token
- `GET /api/auth/me` — Get current user profile, career stats, and earnings

### Tournaments
- `GET /api/tournaments` — List all tournaments with status/format filters
- `GET /api/tournaments/:id` — Tournament details, points table, schedule, top performers
- `POST /api/tournaments` — Host / conduct a new tournament
- `POST /api/tournaments/:id/participate` — Register a team squad into tournament
- `POST /api/tournaments/:id/schedule-match` — Schedule a match in tournament

### Live Match Center & Scorer
- `GET /api/matches` — List all matches with status filter (Live, Scheduled, Completed)
- `GET /api/matches/:id` — Detailed match scorecard, fall of wickets, commentators, umpires
- `POST /api/matches/:id/score-ball` — Real-time ball-by-ball scoring & commentary generator
- `POST /api/matches/:id/complete` — Conclude match and award Player of the Match bonus

### Players & Leaderboards
- `GET /api/players` — Searchable player directory with role and team filters
- `GET /api/players/:id` — Detailed career profile, **tournament participation history**, and earnings ledger
- `GET /api/players/compare/:id1/:id2` — Side-by-side head-to-head comparison
- `GET /api/leaderboards` — Orange Cap, Purple Cap, Strike Rate, Sixes, Catches, Earnings, MVP

### Prize Purse & Earnings
- `GET /api/earnings/summary` — Total prize pool, total disbursed, top earners
- `POST /api/earnings/award` — Disburse tournament prize share or match fee bonus

---

## 📦 Deliverables Included in this Directory

1. **`cricket_db.sql`**: Original MySQL database dump.
2. **`cricket_db_updated.sql`**: Enhanced database dump with all new tables, relationships, and seed data.
3. **`server/`**: Complete Node.js + Express backend with database connectors, authentication, and REST API.
4. **`client/`**: Full React + Vite frontend with modern dark stadium aesthetic and interactive components.
5. **`cricket_project.zip`**: Complete zipped bundle of the entire application and database files.
