// Temas estacionales y festivos

export interface SeasonalTheme {
  name: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  gradientStart: string;
  gradientEnd: string;
  borderRadius: string;
  animationStyle:
    | 'smooth'
    | 'festive'
    | 'warm'
    | 'playful'
    | 'celebratory'
    | 'bright';

  // Opcionales
  snowflakes?: boolean;
  glowEffect?: boolean;
  leafAnimation?: boolean;
  eggAnimation?: boolean;
  confetti?: boolean;
  sunAnimation?: boolean;
}

export const SEASONAL_THEMES: Record<string, SeasonalTheme> = {
  default: {
    name: 'Predeterminado',
    primaryColor: '#D97706', // Naranja
    secondaryColor: '#1F2937', // Oscuro
    accentColor: '#10B981', // Verde
    gradientStart: '#FEF3C7',
    gradientEnd: '#FDE68A',
    borderRadius: '8px',
    animationStyle: 'smooth',
  },

  christmas: {
    name: 'Navidad',
    primaryColor: '#DC2626', // Rojo navideño
    secondaryColor: '#15803D', // Verde navideño
    accentColor: '#FFD700', // Dorado
    gradientStart: '#FEE2E2',
    gradientEnd: '#DBEAFE',
    borderRadius: '12px',
    animationStyle: 'festive',
    snowflakes: true,
    glowEffect: true,
  },

  thanksgiving: {
    name: 'Acción de Gracias',
    primaryColor: '#B45309', // Marrón
    secondaryColor: '#92400E', // Naranja oscuro
    accentColor: '#F97316', // Naranja
    gradientStart: '#FEF3C7',
    gradientEnd: '#F59E0B',
    borderRadius: '10px',
    animationStyle: 'warm',
    leafAnimation: true,
  },

  easter: {
    name: 'Pascua',
    primaryColor: '#EC4899', // Rosa
    secondaryColor: '#06B6D4', // Cyan
    accentColor: '#84CC16', // Lima
    gradientStart: '#FCE7F3',
    gradientEnd: '#FEE2E2',
    borderRadius: '20px',
    animationStyle: 'playful',
    eggAnimation: true,
  },

  newyear: {
    name: 'Año Nuevo',
    primaryColor: '#1E40AF', // Azul profundo
    secondaryColor: '#0F766E', // Teal
    accentColor: '#FFD700', // Dorado
    gradientStart: '#DBEAFE',
    gradientEnd: '#E0E7FF',
    borderRadius: '8px',
    animationStyle: 'celebratory',
    confetti: true,
    glowEffect: true,
  },

  summer: {
    name: 'Verano',
    primaryColor: '#EAB308', // Amarillo
    secondaryColor: '#0891B2', // Azul cielo
    accentColor: '#EC4899', // Rosa
    gradientStart: '#FEFCE8',
    gradientEnd: '#E0F2FE',
    borderRadius: '16px',
    animationStyle: 'bright',
    sunAnimation: true,
  },
};

export type SeasonalThemeName = keyof typeof SEASONAL_THEMES;

export function getThemeByDate(): SeasonalThemeName {
  const now = new Date();
  const month = now.getMonth() + 1;
  const day = now.getDate();

  // Navidad (Diciembre)
  if (month === 12) {
    return 'christmas';
  }

  // Acción de Gracias (Noviembre)
  if (month === 11) {
    return 'thanksgiving';
  }

  // Pascua (aproximado)
  if ((month === 3 && day >= 22) || (month === 4 && day <= 25)) {
    return 'easter';
  }

  // Año Nuevo
  if (month === 1 && day <= 15) {
    return 'newyear';
  }

  // Verano
  if (month >= 6 && month <= 8) {
    return 'summer';
  }

  return 'default';
}

export function getThemeConfig(
  themeName: SeasonalThemeName,
): SeasonalTheme {
  return SEASONAL_THEMES[themeName] ?? SEASONAL_THEMES.default;
}

export function generateThemeCSS(theme: SeasonalTheme): string {
  return `
    :root {
      --primary-color: ${theme.primaryColor};
      --secondary-color: ${theme.secondaryColor};
      --accent-color: ${theme.accentColor};
      --gradient-start: ${theme.gradientStart};
      --gradient-end: ${theme.gradientEnd};
      --border-radius: ${theme.borderRadius};
    }

    .theme-gradient {
      background: linear-gradient(
        135deg,
        ${theme.gradientStart} 0%,
        ${theme.gradientEnd} 100%
      );
    }

    .theme-button {
      background-color: var(--primary-color);
      border-radius: var(--border-radius);
      transition: all 0.3s ease;
    }

    .theme-button:hover {
      transform: translateY(-2px);
      box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
    }

    ${
      theme.glowEffect
        ? `
      .theme-glow {
        box-shadow: 0 0 20px ${theme.primaryColor}40;
        border-radius: var(--border-radius);
      }
    `
        : ''
    }

    ${
      theme.snowflakes
        ? `
      @keyframes snowfall {
        0% {
          transform: translateY(-10vh) translateX(0);
          opacity: 1;
        }

        100% {
          transform: translateY(100vh) translateX(100px);
          opacity: 0;
        }
      }

      .snowflake {
        animation: snowfall 10s linear infinite;
      }
    `
        : ''
    }

    ${
      theme.leafAnimation
        ? `
      @keyframes leaffall {
        0% {
          transform: translateY(-10vh) rotate(0deg);
          opacity: 1;
        }

        100% {
          transform: translateY(100vh) rotate(360deg);
          opacity: 0;
        }
      }

      .leaf {
        animation: leaffall 15s linear infinite;
      }
    `
        : ''
    }

    ${
      theme.confetti
        ? `
      @keyframes confetti-fall {
        0% {
          transform: translateY(-100vh) rotate(0deg);
          opacity: 1;
        }

        100% {
          transform: translateY(100vh) rotate(720deg);
          opacity: 0;
        }
      }

      .confetti {
        animation: confetti-fall 6s linear infinite;
      }
    `
        : ''
    }

    ${
      theme.sunAnimation
        ? `
      @keyframes sun-pulse {
        0% {
          transform: scale(1);
        }

        50% {
          transform: scale(1.05);
        }

        100% {
          transform: scale(1);
        }
      }

      .sun {
        animation: sun-pulse 3s ease-in-out infinite;
      }
    `
        : ''
    }

    ${
      theme.eggAnimation
        ? `
      @keyframes egg-bounce {
        0%, 100% {
          transform: translateY(0);
        }

        50% {
          transform: translateY(-10px);
        }
      }

      .egg {
        animation: egg-bounce 2s ease-in-out infinite;
      }
    `
        : ''
    }
  `;
}