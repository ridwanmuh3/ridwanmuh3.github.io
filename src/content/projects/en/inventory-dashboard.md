+++
title = 'Inventory Dashboard'
date = '2025-12-01'
draft = false
description = 'Multi-tenant budget and goods management system for a catering kitchen, with 35 REST API endpoints, role-based access control, row-level locking on the finance and raw-material inventory modules, and analytics dashboards.'
photo = 'sppg-app.webp'
link = 'https://github.com/ridwanmuh3?tab=repositories&q=simba'
+++

Full-stack system built for SPPG Sinar Asri (Dec 2025 - Mar 2026) to manage the budget and goods of a catering kitchen operating under the MBG program.

## Backend

- **Go, Fiber, GORM, PostgreSQL** with 35 REST API endpoints and role-based access control.
- Finance and raw-material inventory modules protected by **row-level locking** to prevent race conditions during concurrent transactions.

## One deployment, many kitchens

The system runs as a **multi-tenant** architecture in which each kitchen is a tenant. A single deployment serves the whole program, and budget and inventory data stays isolated between kitchens — what a user can reach is decided by the kitchen they belong to and their permissions, not by which screen they opened.

## Frontend

- **React, TypeScript, TanStack Query** with 8 functional pages and a Recharts analytics dashboard for financial and inventory data.