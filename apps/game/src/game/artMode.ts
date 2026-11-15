// `?art=hd` switches to the HD vector style test (ART_SPEC § HD). Kept free of Phaser so React can read it.
export const HD = typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('art') === 'hd';
