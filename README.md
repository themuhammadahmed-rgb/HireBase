<div align="center">

# Hirebase

**A responsive SaaS landing page, built from a design brief to production deployment.**

[Live Demo](#) · [Report a Bug](#) · Built by [Muhammad Ahmed](https://github.com/themuhammadahmed-rgb)

</div>

---

## Overview

Hirebase is the marketing site for a fictional B2B recruitment platform — designed and built to demonstrate frontend engineering fundamentals: component architecture, a real design system, and responsive behavior that actually holds up across devices, not just on a desktop monitor.

Built during a Full Stack Web Development internship at NeuroFive Solutions.

## Why this project is structured the way it is

Most starter landing pages are one giant file. Hirebase isn't — every section (Navbar, Hero, Features, Footer) is its own component, self-contained and independently readable. That decision wasn't arbitrary: it's how production frontend codebases are actually organized, and it's what makes a codebase maintainable as it grows past a single page.

The mobile navigation is a good example of this thinking in practice — rather than letting nav links overflow on small screens, it collapses into a hamburger menu driven by React state, tested and verified across mobile, tablet, and desktop breakpoints using Chrome DevTools.

## Stack

**React** + **Vite** + **Tailwind CSS**

React's component model was the natural fit for breaking the UI into reusable pieces. Tailwind keeps the design system (color, spacing, type scale) enforced directly in the markup, rather than drifting across separate stylesheet files. Vite handles the dev server and build — fast, minimal config.

## Structure

- `src/components/Navbar.jsx` — responsive nav with mobile hamburger menu
- `src/components/Hero.jsx` — headline, value proposition, primary CTAs
- `src/components/Features.jsx` — 5-feature responsive grid
- `src/components/Footer.jsx` — links and branding
- `src/App.jsx` — composes all components into the full page
- `src/index.css` — Tailwind import and global font setup

## Run it locally

Clone the repo, then run `npm install` followed by `npm run dev`.

---

<div align="center">

**[Muhammad Ahmed](https://github.com/themuhammadahmed-rgb)** — CS student, UMT Lahore · Full Stack Web Dev Intern @ NeuroFive Solutions

</div>