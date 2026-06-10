/* =============================================================================
   Design Annotations — starter template data
   -----------------------------------------------------------------------------
   This file describes the pages and tasks for this prototype. It is the ONLY
   place you define tasks — the drawer (per page) and Task Center (all pages)
   are both derived from it.

   Add a page entry for every screen in your prototype, then add annotation
   entries for every task. See AUTHORING.md in design-annotations/ for guidance
   on selector strategy and verb classification.
   ============================================================================= */

window.DESIGN_ANNOTATIONS_DATA = {

  pages: [
    { id: 'home', label: 'Home', route: 'index.html' },
    // Add more pages as you build them out:
    // { id: 'reports',    label: 'Reports',    route: 'reports.html'    },
    // { id: 'members',    label: 'Members',    route: 'members.html'    },
    // { id: 'financials', label: 'Financials', route: 'financials.html' },
  ],

  annotations: [

    /* ── Home — sample annotations pointing at the placeholder ─── */
    {
      id: 'home-replace-placeholder',
      page: 'home',
      kind: 'required',
      title: 'Replace placeholder with real page content',
      description: 'The dashed card is a scaffolding placeholder. Replace it with the actual page layout inside #shell-content.',
      target: '.placeholder',
      priority: 'high',
    },
    {
      id: 'home-page-header',
      page: 'home',
      kind: 'required',
      title: 'Add page header (title + primary action)',
      description: 'Every page needs a title row with an optional primary CTA on the right.',
      target: '.placeholder__title',
      sub: [
        'Title uses 20 px / 500 weight Roboto',
        'CTA button uses .btn--primary',
      ],
    },
    {
      id: 'home-sidebar-active',
      page: 'home',
      kind: 'suggestion',
      title: 'Set the correct active sidebar item',
      description: 'Call HubstaffShell.setActiveItem("key") in layout.js so the right nav item is highlighted.',
      target: '.hs-nav-item.is-active',
    },

  ],
};
