# Claude Code — Homepage Build Prompt

Place the `CLAUDE-homepage-spec.md` file in your project root (or reference it directly). Then use these prompts in sequence.

---

## KICKOFF PROMPT — Paste this first:

```
Read the file CLAUDE-homepage-spec.md — this is the complete homepage specification for joinbodygood.com.

Before writing any code:

1. Scan the existing codebase:
   - What's the current homepage file/route? (check app/page.tsx or pages/index.tsx)
   - What component library is installed? (shadcn/ui, Radix, MUI?)
   - What CSS approach is used? (Tailwind, CSS modules, styled-components?)
   - Are Poppins and Manrope fonts already configured?
   - What image handling is set up? (next/image, S3, etc.)
   - Is there an existing layout component with nav/footer?

2. Based on what you find, give me a build plan:
   - List every file you'll create or modify
   - Note any new dependencies needed
   - Flag any conflicts with existing code
   - Propose the component structure (which sections become reusable components)

3. Wait for my approval before writing code.

Key context:
- This is a Shopify replacement. The new site is built in Next.js deployed on AWS.
- The storefront e-commerce pages (products, checkout, quiz) already exist. You are rebuilding the HOMEPAGE.
- The design must match the brand: Poppins headings, Manrope body, #ED1B1B red, #FDE7E7 soft pink, pill buttons with 50px radius, 12px card radius. Hims/Hers aesthetic — clean, modern, medical-grade but warm.
- Do NOT use emoji anywhere. Use Lucide icons or similar professional icon library.
- Do NOT use any salesy/promotional language. This is an elevated brand.
- Women of color should be visually centered in imagery choices (when real photos are added). For now, use placeholder blocks.
```

---

## BUILD PROMPTS — Use in sequence after approval:

### Phase 1: Structure + Hero
```
Build the homepage foundation. Start with:
1. The announcement bar (Section 1)
2. Navigation with programs dropdown (Section 2)  
3. The hero banner (Section 3) — this is the most critical section. Must have the headline "You deserve a doctor who actually listens", the subhead, and THREE distinct CTAs: "Explore Our Programs" (primary), "Take the Quiz" (secondary), and "Check Your Insurance Coverage — Free" (tertiary). Plus the trust badge row beneath.
4. The service categories section (Section 4) — "What Brings You Here Today?" with cards for Weight Management, Hair & Skin, Feminine Health, Mental Wellness, and Take the Quiz.

Use image placeholders (colored blocks matching brand palette) for all imagery. Get the layout, typography, spacing, and responsive behavior right first.
```

### Phase 2: Trust + Process
```
Now build the next three sections:
5. The empathy block (Section 5) — "We get it. You've tried everything." This is the emotional core. Warm, conversational copy.
6. How it works (Section 6) — Three steps with icons.
7. Social proof / testimonials (Section 7) — Build as a dynamic component that reads from a data array (not hardcoded). Use the 4 sample testimonials from the spec. Include star ratings, patient info, and program badges.

Keep the aggregate "4.9 out of 5 from 2,800+ verified patients" stat prominent above the testimonials.
```

### Phase 3: Founder + Values
```
Now build:
8. Founder letter (Section 8) — "A Letter from Dr. Linda" with the full letter from the spec. Split layout: photo placeholder left, letter right. This is the brand's emotional anchor — the copy must render exactly as specified.
9. Value propositions (Section 9) — 6 cards: Convenience, Privacy, Real Doctors, Transparency, Ongoing Support, Someone Who Understands. Use Lucide icons.
10. Insurance CTA block (Section 10) — Full-width soft pink background. "Wondering if your insurance covers GLP-1 medication?" with the free checker CTA.
```

### Phase 4: FAQ + Footer + Final CTA
```
Now build the remaining sections:
11. FAQ accordion (Section 11) — All 8 questions from the spec. Smooth expand/collapse animation. FAQ schema structured data for SEO.
12. Final CTA (Section 12) — "Ready to feel like yourself again?" with three CTAs mirroring the hero.
13. Footer (Section 13) — 4-column layout: Brand, Programs, Company, Support. Dark background. Social icons. LegitScript/HIPAA/SSL badges. 

Also add:
- Organization and MedicalOrganization schema in the page head
- Proper meta title and description per the spec
- Smooth scroll behavior for any anchor links
- Lazy loading for all below-fold sections
```

### Phase 5: Polish + Mobile
```
Final pass on the homepage:
1. Review all responsive breakpoints — hero CTAs stack on mobile, category cards become scrollable row or 2-col grid, testimonials become swipeable carousel
2. Check all typography matches the brand system (Poppins headings, Manrope body, correct weights)
3. Verify all buttons are pill-shaped (50px radius) with arrows on primary CTAs
4. Check spacing between sections (80-120px)
5. Test page load performance — hero must render under 1.5s
6. Verify all Lucide icons render correctly
7. Run through the page on iPad viewport (Dr. Linda uses iPad frequently)
8. Check color contrast passes WCAG AA
9. Make sure no emojis snuck in anywhere

Show me a summary of what you fixed.
```

---

## IMPORTANT REMINDERS FOR AYUSH

- **The hero section's three CTAs are non-negotiable.** Every visitor falls into one of three buckets: knows what they want, needs guidance, or wants insurance info. All three must be immediately visible.

- **The expanded service categories (hair, feminine health, mental wellness) are NEW.** Weight management is still the main offer, but the homepage must clearly signal that Body Good is a multi-category wellness platform now.

- **Inclusivity is shown, not told.** When real photography is added later, lead with women of color in hero and key sections. The copy uses warm, culturally resonant language. Dr. Linda's story in the founder letter is the trust signal — don't edit or shorten it.

- **No promotional language anywhere.** No "LIMITED TIME", no "SAVE $X", no countdown timers, no urgency language. This brand is elevated and confident. The copy should feel like a warm conversation, not a car dealership.

- **Test the page at these viewports:** 375px (iPhone), 768px (iPad), 1024px (laptop), 1440px (desktop), 1920px (large monitor).
