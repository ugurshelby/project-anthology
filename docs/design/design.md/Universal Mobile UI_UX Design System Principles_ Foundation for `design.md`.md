### Universal Mobile UI/UX Design System Principles: Foundation for design.md

#### 1\. The Ownership and Architecture Model

In mobile engineering, the "Ownership Model"—pioneered by Shadcn UI—is the only viable strategy for scaling complex interfaces without incurring massive technical debt. Standard npm-locked libraries force developers into "specificity wars," where designers are forced to use \!important to override rigid, hardcoded defaults. We reject this. We adopt a "copy-and-own" philosophy that prioritizes raw code integration over binary package dependency.The core architecture is a triad that separates concerns with surgical precision:

* **Radix UI (Behavioral Ownership):**  Handles the "heavy lifting" of accessibility (focus trapping, keyboard navigation, and ARIA state management). This ensures we never break core interactions while reskinning components.  
* **Tailwind CSS (Visual Styling):**  Provides a utility-first engine for visual implementation, utilizing tailwind-merge to prevent style conflicts.  
* **Design Tokens (The Source of Truth):**  Variables that synchronize design intent across Figma, codebases, and platforms.**The "So What?" Layer:**  Owning the raw component code allows us to inject Material Design 3 (MD3) principles directly into the source. By decoupling behavior (Radix) from styling (Tailwind), we achieve a system that is robustly accessible by default but entirely customizable in appearance.

#### 2\. Two-Tier Design Token Engine (Primitive to Semantic)

Strategic abstraction is not a luxury; it is a technical requirement. We mandate a two-tier token architecture to ensure that brand pivots or accessibility audits require zero line-item code changes.

##### Tier 1: Definition (Primitive Tokens)

Primitive tokens represent raw values. They have no context and are strictly for definition.

* **Color:**  blue-800, red-500  
* **Scale:**  size-8 (2rem), size-40 (10rem)  
* **Type:**  font-weight-400, line-height-40

##### Tier 2: Semantic/Composite (The Implementation Layer)

Semantic tokens map primitives to specific UI roles. To serve both human developers and AI agents, all semantic tokens must follow a strict, regex-validatable schema:  **type-role-intention-variant-state**

* *Example:*  color-content-default-on-brand**The "So What?" Layer:**  Adoption of this naming convention (specifically the "On-" modifier logic) is proven to result in  **100% contrast compliance rates**  in system testing. By naming a token on-brand, the system encodes the contrast requirement into the variable itself, reducing the developer's cognitive load and eliminating the need for manual contrast testing during the build phase.

#### 3\. Accessible Color Systems and Symbolic Communication

Color serves a dual mandate: technical WCAG compliance and symbolic communication. Current accessibility tools often fail by over-focusing on differentiation while disregarding symbolism. We explicitly forbid "Colorblind Modes" that simply recolor the UI into dull or jarring palettes. Instead, we retain meaningful reds and greens while supplementing them with secondary visual cues.

##### Technical Precision: HSL Raw Values

All color tokens in globals.css must be stored as  **raw HSL values**  without the hsl() wrapper.

* *Required Syntax:*  \--primary: 221.2 83.2% 53.3%;  
* *Rationale:*  This specific format is what enables Tailwind’s /opacity syntax (e.g., bg-primary/50). Storing full HSL strings breaks this functionality and limits the system's flexibility.

##### Color Intention and Symbolic Strategy

Color Intention,Symbolic Meaning,Implementation Strategy,Safe Token Pairing  
Success,"Pass, Safe, Saved",Retain Green; supplement with icons (Checkmark),color-content-on-success  
Warning,"Caution, Attention",Retain Yellow/Amber; use secondary text cues,color-content-on-warning  
Danger,"Critical, Delete",Retain Red; mandate positional consistency,color-content-on-danger  
Info,"Neutral, Detail",Blue; use for informational callouts,color-content-on-info  
**The "So What?" Layer:**  Users with color vision deficiency (Protanopia/Deuteranopia) still understand and rely on color symbolism. Stripping these colors removes a vital layer of information. We mandate "Red-Green Parity"—ensuring that every success/error state communicated via color is also communicated via iconography or text cues.

#### 4\. Layout, States, and Interaction Foundations

Material Design 3 foundations provide the skeletal integrity of the application. For mobile users,  **Consistency is Accessibility.**

* **Layout & Positional Integrity:**  Mandate strict positional consistency for binary actions (e.g., "Decline" on left, "Accept" on right). We strictly forbid "layout flipping" across different screens. For color-deficient users, positioning is the primary fallback for intent identification.  
* **Interaction States:**  Every interactive element must have distinct, tokens-based visual indicators for hover, focus, pressed, and disabled.**The "So What?" Layer:**  Breaking established layout patterns increases user error by disrupting muscle memory. In high-stakes mobile environments, a user should be able to operate the "Danger" action based on its position even if they cannot perceive its color.

#### 5\. Component Logic: Variants, Wrappers, and Composition

To scale, we utilize the  **Customization Pipeline: Install \-\> Tokenize \-\> Wrap \-\> Compose.**

##### CVA (Class Variance Authority)

Use CVA to define "internal" styles for a component.

* *Golden Rule:*  If a style variant (e.g., ghost, outline) is used in three or more locations, it must be codified as a CVA variant in the base components/ui file.

##### The Wrapper Pattern

Do not modify base primitives for specific business logic. Create wrappers in components/custom/.

* **LoadingButton**  **:**  Extends Button with internal pending state and spinner logic.  
* **ConfirmButton**  **:**  Extends Button by wrapping it in a Radix-based AlertDialog for destructive actions.  
* **CopyButton**  **:**  Extends Button with clipboard API integration and a "success" state toggle.**The "So What?" Layer:**  By keeping base primitives "pure" and housing logic in wrappers, we ensure that the system remains updateable. This architecture allows us to pull upstream Radix/Shadcn updates without merge conflicts, as our custom logic exists in a separate layer of the filesystem.

#### 6\. System Maintenance and Decision Guides

Documentation is the difference between a "collection of files" and a "Design System."

##### Component Decision Guide

If I need...,Use...,Strategy  
A new visual style for a button,CVA Variant,"Modifies the ""Base"" primitive."  
"Specific behavior (e.g., Clipboard)",Wrapper Pattern,Extends the primitive without editing it.  
A reusable layout of multiple parts,Composition,"Combine primitives into a ""Pattern."""  
A non-standard/new component,Semantic Pairing,Use on-background tokens to bypass manual testing.

##### Engineering Checklist

1. **Use**  **cn()**  **for Merging:**  Never concatenate strings; use the cn() utility to intelligently resolve Tailwind specificity.  
2. **Preserve ARIA:**  Never remove aria-\* attributes provided by Radix; they are the source of truth for assistive technology.  
3. **Version Control Discipline:**  Commit base components (untouched) in a separate commit from customizations. This creates a "clean diff" for future audits and framework upgrades.  
4. **JSDoc Documentation:**  Every custom wrapper must include JSDoc comments explaining its props and intended use-case to ensure LLM/AI agents can utilize them accurately.By adhering to these principles, we build a mobile UI that is technically compliant, symbolically resonant, and architecturally resilient.

