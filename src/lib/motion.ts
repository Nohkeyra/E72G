export const MOTION_PROFILE = {
  // For buttons, toggles, and small interactive elements (Fast & Snappy)
  TACTILE: {
    type: "spring",
    stiffness: 400,
    damping: 25,
  },
  // For Modals, Sidebars, and Large Layout transitions (Smooth & Weighted)
  PREMIUM: {
    type: "spring",
    stiffness: 200,
    damping: 25,
  },
  // For background elements, glows, and breathing effects (Slow & Organic)
  FLOW: {
    duration: 3,
    ease: "easeInOut",
  }
};
