
# Update Contact Details and About Section

## Summary
Update the contact phone number across the website and enhance the About page to highlight that Desi Virasat is a women-led startup founded by Divya Singh.

---

## Changes

### 1. Footer Contact Update
**File:** `src/components/layout/Footer.tsx`

- Change phone number from `+91 98765 43210` to `+91 63888 86278`
- Update the `tel:` link accordingly

### 2. About Page Updates
**File:** `src/pages/About.tsx`

Add a new "Founder" section and update the mission text to reflect:
- **Founder name:** Divya Singh
- **Key highlight:** Women-led startup
- Update the mission narrative to emphasize women empowerment

**New content to add:**
- A founder spotlight section with Divya Singh's name
- Updated mission text mentioning "Founded by Divya Singh, Desi Virasat is a women-led startup dedicated to..."

---

## Technical Details

### Footer.tsx Changes (lines 93-97)
```text
Before:
<a href="tel:+919876543210">+91 98765 43210</a>

After:
<a href="tel:+916388886278">+91 63888 86278</a>
```

### About.tsx Changes (Mission section, lines 36-45)
Add founder mention and women-led startup emphasis to the existing mission text.

---

## Files Modified
1. `src/components/layout/Footer.tsx` - Phone number update
2. `src/pages/About.tsx` - Founder info and women-led startup messaging
