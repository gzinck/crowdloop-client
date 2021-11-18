const theme = {
  palette: {
    primary: {
      default: '#c76f18',
      dark: '#994d00',
      light: '#d98f45',
      contrastText: '#FFF',
    },
    background: {
      default: '#111',
      light: '#555',
      contrastText: '#FFF',
      // fadedLevel should be in [0, 1) where 0 is the lightest and 1
      // is the darkest. Uses an exponential for fading quickly to dark
      flashing: (fadedLevel: number, curBeat = 1): string => {
        const maxVal = curBeat === 0 ? 100 : 50;
        const colour = maxVal - (maxVal - 20) * Math.sqrt(fadedLevel);
        return `rgb(${colour}, ${colour}, ${colour})`;
      },
    },
    recording: {
      pending: '#bd7b09',
      recording: '#b02000',
    },
    fun: [
      // Orange
      {
        default: '#ff6600',
        dark: '#ad4805',
      },
      // Bright blue
      {
        default: '#08f7fe',
        dark: '#069499',
      },
      // Turquoise
      {
        default: '#09FBD3',
        dark: '#05a88d',
      },
      // Pink
      {
        default: '#fe53ba',
        dark: '#a33376',
      },
      // Yellow
      {
        default: '#f5d400',
        dark: '#998503',
      },
      // Green
      {
        default: '#39ff03',
        dark: '#208c03',
      },
      // Purple
      {
        default: '#5900ff',
        dark: '#34038f',
      },
    ],
  },
  padding: (multiplier = 1): string => `${multiplier * 0.5}rem`,
  shadow: `
    -webkit-filter: drop-shadow(1px 3px 2px rgba(0, 0, 0, 0.7));
    filter: drop-shadow(1px 3px 2px rgba(0, 0, 0, 0.7));`,
};

export default theme;
