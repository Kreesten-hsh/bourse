export const panelMotion = {
  initial: { x: 20, opacity: 0 },
  animate: { x: 0, opacity: 1 },
  transition: { duration: 0.2 }
} as const;

export function rowMotion(index: number) {
  return {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    transition: { delay: index * 0.03 }
  } as const;
}

export const buttonTap = {
  whileTap: { scale: 0.97 }
} as const;

export const scoreBadgeMotion = {
  animate: { scale: [1, 1.12, 1] },
  transition: { duration: 0.3 }
} as const;
