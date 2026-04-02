export type Locale = "pt" | "br" | "es";

export const SUPPORTED_LOCALES: Locale[] = ["pt", "br", "es"];

// ---------------------------------------------------------------------------
// Translations dictionary
// ---------------------------------------------------------------------------

const translations = {
  common: {
    teams: {
      pt: "Equipas",
      br: "Times",
      es: "Equipos",
    },
    suggestions: {
      pt: "Sugestões",
      br: "Sugestões",
      es: "Sugerencias",
    },
    register: {
      pt: "Registar",
      br: "Registrar",
      es: "Registrar",
    },
    access: {
      pt: "Aceder",
      br: "Acessar",
      es: "Acceder",
    },
    submit: {
      pt: "Submeter",
      br: "Enviar",
      es: "Enviar",
    },
    email: {
      pt: "Email",
      br: "E-mail",
      es: "Correo electrónico",
    },
    privacyPolicy: {
      pt: "Política de Privacidade",
      br: "Política de Privacidade",
      es: "Política de Privacidad",
    },
    admin: {
      pt: "Administração",
      br: "Administração",
      es: "Administración",
    },
    developedBy: {
      pt: "Desenvolvido por",
      br: "Desenvolvido por",
      es: "Desarrollado por",
    },
  },

  header: {
    registerTeam: {
      pt: "Registar Equipa",
      br: "Registrar Time",
      es: "Registrar Equipo",
    },
    access: {
      pt: "Aceder",
      br: "Acessar",
      es: "Acceder",
    },
  },

  home: {
    title: {
      pt: "Veteranos Futebol",
      br: "Veteranos Futebol",
      es: "Veteranos Fútbol",
    },
    subtitle: {
      pt: "Contactos de equipas de veteranos de futebol",
      br: "Contactos de times de veteranos de futebol",
      es: "Contactos de equipos de veteranos de fútbol",
    },
    teamsRegistered: {
      pt: "equipas registadas",
      br: "times registrados",
      es: "equipos registrados",
    },
    howItWorks: {
      pt: "Como funciona?",
      br: "Como funciona?",
      es: "¿Cómo funciona?",
    },
    forNewUsers: {
      pt: "para quem ainda não se registou",
      br: "para quem ainda não se registrou",
      es: "para quienes aún no se han registrado",
    },
    step1Title: {
      pt: "1. Registe a sua equipa",
      br: "1. Registre o seu time",
      es: "1. Registra tu equipo",
    },
    step1Desc: {
      pt: "Preencha o formulário com os dados da equipa — nome, localização, equipamentos, campo e contactos do coordenador.",
      br: "Preencha o formulário com os dados do time — nome, localização, uniformes, campo e contactos do coordenador.",
      es: "Rellena el formulario con los datos del equipo — nombre, ubicación, equipaciones, campo y contacto del coordinador.",
    },
    step2Title: {
      pt: "2. Encontre adversários",
      br: "2. Encontre adversários",
      es: "2. Encuentra rivales",
    },
    step2Desc: {
      pt: "Pesquise equipas por nome, concelho ou distrito. Consulte o mapa para encontrar clubes perto de si e combine jogos.",
      br: "Pesquise times por nome, município ou estado. Consulte o mapa para encontrar clubes perto de você e combine jogos.",
      es: "Busca equipos por nombre, municipio o provincia. Consulta el mapa para encontrar clubes cerca de ti y organiza partidos.",
    },
    step3Title: {
      pt: "3. Organize os seus jogos",
      br: "3. Organize os seus jogos",
      es: "3. Organiza tus partidos",
    },
    step3Desc: {
      pt: "Cada equipa tem o seu calendário de jogos. Adicione partidas, registe resultados e partilhe o calendário com a equipa.",
      br: "Cada time tem o seu calendário de jogos. Adicione partidas, registre resultados e compartilhe o calendário com o time.",
      es: "Cada equipo tiene su propio calendario de partidos. Añade encuentros, registra resultados y comparte el calendario con el equipo.",
    },
    aboutPlatform: {
      pt: "Veteranos Futebol é uma plataforma gratuita de contactos para equipas de veteranos em Portugal. O objetivo é simples: facilitar a comunicação entre clubes e ajudar a marcar jogos amigáveis ou torneios.",
      br: "Veteranos Futebol é uma plataforma gratuita de contactos para times de veteranos. O objetivo é simples: facilitar a comunicação entre clubes e ajudar a marcar jogos amistosos ou torneios.",
      es: "Veteranos Fútbol es una plataforma gratuita de contactos para equipos de veteranos. El objetivo es sencillo: facilitar la comunicación entre clubes y ayudar a organizar partidos amistosos o torneos.",
    },
    afterRegister: {
      pt: "Após o registo, receberá um link de acesso por email para gerir a ficha da sua equipa — atualizar dados, adicionar jogos ao calendário, registar resultados e exportar o calendário para o Google Calendar ou telemóvel.",
      br: "Após o registro, receberá um link de acesso por e-mail para gerir a ficha do seu time — atualizar dados, adicionar jogos ao calendário, registrar resultados e exportar o calendário para o Google Calendar ou celular.",
      es: "Tras el registro, recibirás un enlace de acceso por correo electrónico para gestionar la ficha de tu equipo — actualizar datos, añadir partidos al calendario, registrar resultados y exportar el calendario a Google Calendar o al móvil.",
    },
    questionsHint: {
      pt: "Tem uma ideia ou dúvida? Use a página de Sugestões para contactar a equipa de moderação.",
      br: "Tem uma ideia ou dúvida? Use a página de Sugestões para contactar a equipa de moderação.",
      es: "¿Tienes una idea o una duda? Usa la página de Sugerencias para contactar al equipo de moderación.",
    },
    viewAllTeams: {
      pt: "Ver Todas as Equipas",
      br: "Ver Todos os Times",
      es: "Ver Todos los Equipos",
    },
    registerMyTeam: {
      pt: "Registar a Minha Equipa",
      br: "Registrar o Meu Time",
      es: "Registrar Mi Equipo",
    },
    teamsOnMap: {
      pt: (onMap: number, total: number) =>
        `${onMap} de ${total} equipas visíveis no mapa`,
      br: (onMap: number, total: number) =>
        `${onMap} de ${total} times visíveis no mapa`,
      es: (onMap: number, total: number) =>
        `${onMap} de ${total} equipos visibles en el mapa`,
    },
  },

  login: {
    title: {
      pt: "Aceder à Minha Equipa",
      br: "Acessar o Meu Time",
      es: "Acceder a Mi Equipo",
    },
    expiredError: {
      pt: "O link expirou. Peça um novo abaixo.",
      br: "O link expirou. Solicite um novo abaixo.",
      es: "El enlace ha expirado. Solicita uno nuevo a continuación.",
    },
    invalidError: {
      pt: "Link inválido. Peça um novo abaixo.",
      br: "Link inválido. Solicite um novo abaixo.",
      es: "Enlace inválido. Solicita uno nuevo a continuación.",
    },
    existingTeamTitle: {
      pt: "Já tenho equipa registada",
      br: "Já tenho time registrado",
      es: "Ya tengo equipo registrado",
    },
    existingTeamDesc: {
      pt: "Use o email com que registou a sua equipa (ou o email que constava na lista original). Se não receber o email em poucos minutos, a sua equipa pode não estar registada — use a opção abaixo.",
      br: "Use o e-mail com que registrou o seu time (ou o e-mail que constava na lista original). Se não receber o e-mail em poucos minutos, o seu time pode não estar registrado — use a opção abaixo.",
      es: "Usa el correo con el que registraste tu equipo (o el correo que constaba en la lista original). Si no recibes el correo en pocos minutos, es posible que tu equipo no esté registrado — usa la opción de abajo.",
    },
    sendAccessLink: {
      pt: "Enviar Link de Acesso",
      br: "Enviar Link de Acesso",
      es: "Enviar Enlace de Acceso",
    },
    sending: {
      pt: "A enviar...",
      br: "Enviando...",
      es: "Enviando...",
    },
    emailSent: {
      pt: "Email Enviado!",
      br: "E-mail Enviado!",
      es: "¡Correo Enviado!",
    },
    emailSentDesc: {
      pt: "Se o email estiver registado, receberá um link de acesso. Verifique a sua caixa de entrada (e spam).",
      br: "Se o e-mail estiver registrado, receberá um link de acesso. Verifique a sua caixa de entrada (e spam).",
      es: "Si el correo está registrado, recibirás un enlace de acceso. Comprueba tu bandeja de entrada (y el spam).",
    },
    changeEmailLink: {
      pt: "Alterar email de acesso",
      br: "Alterar e-mail de acesso",
      es: "Cambiar correo de acceso",
    },
    changeEmailCurrentLabel: {
      pt: "Email actual",
      br: "E-mail atual",
      es: "Correo actual",
    },
    changeEmailNewLabel: {
      pt: "Novo email",
      br: "Novo e-mail",
      es: "Nuevo correo",
    },
    changeEmailSubmit: {
      pt: "Alterar Email",
      br: "Alterar E-mail",
      es: "Cambiar Correo",
    },
    changeEmailSent: {
      pt: "Email de confirmação enviado para o novo endereço.",
      br: "E-mail de confirmação enviado para o novo endereço.",
      es: "Correo de confirmación enviado a la nueva dirección.",
    },
    newTeamTitle: {
      pt: "Registar nova equipa",
      br: "Registrar novo time",
      es: "Registrar nuevo equipo",
    },
    newTeamDesc: {
      pt: "Se a sua equipa ainda não está na plataforma, registe-a aqui. Não use esta opção se a sua equipa já foi importada da lista original.",
      br: "Se o seu time ainda não está na plataforma, registre-o aqui. Não use esta opção se o seu time já foi importado da lista original.",
      es: "Si tu equipo aún no está en la plataforma, regístralo aquí. No uses esta opción si tu equipo ya fue importado de la lista original.",
    },
    registerNewTeam: {
      pt: "Registar Nova Equipa",
      br: "Registrar Novo Time",
      es: "Registrar Nuevo Equipo",
    },
  },

  register: {
    title: {
      pt: "Registar Equipa",
      br: "Registrar Time",
      es: "Registrar Equipo",
    },
    subtitle: {
      pt: "Preencha os dados da sua equipa de veteranos. Após o registo, receberá um email com um link para aceder e editar os seus dados a qualquer momento.",
      br: "Preencha os dados do seu time de veteranos. Após o registro, receberá um e-mail com um link para acessar e editar os seus dados a qualquer momento.",
      es: "Rellena los datos de tu equipo de veteranos. Tras el registro, recibirás un correo con un enlace para acceder y editar tus datos en cualquier momento.",
    },
    submitButton: {
      pt: "Registar Equipa",
      br: "Registrar Time",
      es: "Registrar Equipo",
    },
    alreadyRegistered: {
      pt: "Já tenho equipa registada",
      br: "Já tenho time registrado",
      es: "Ya tengo equipo registrado",
    },
    goToLogin: {
      pt: "Aceder à minha equipa",
      br: "Acessar o meu time",
      es: "Acceder a mi equipo",
    },
  },

  registerSuccess: {
    title: {
      pt: "Equipa Registada!",
      br: "Time Registrado!",
      es: "¡Equipo Registrado!",
    },
    desc: {
      pt: "Enviámos um email com um link de acesso. Clique no link para confirmar o seu email e aceder ao painel da sua equipa.",
      br: "Enviamos um e-mail com um link de acesso. Clique no link para confirmar o seu e-mail e acessar o painel do seu time.",
      es: "Te hemos enviado un correo con un enlace de acceso. Haz clic en el enlace para confirmar tu correo y acceder al panel de tu equipo.",
    },
    viewAll: {
      pt: "Ver Todas as Equipas",
      br: "Ver Todos os Times",
      es: "Ver Todos los Equipos",
    },
  },

  auth: {
    authenticating: {
      pt: "A autenticar... por favor aguarde.",
      br: "Autenticando... por favor aguarde.",
      es: "Autenticando... por favor espera.",
    },
  },

  form: {
    teamData: {
      pt: "Dados da Equipa",
      br: "Dados do Time",
      es: "Datos del Equipo",
    },
    teamName: {
      pt: "Nome da Equipa",
      br: "Nome do Time",
      es: "Nombre del Equipo",
    },
    teamLogo: {
      pt: "Logotipo da Equipa",
      br: "Logotipo do Time",
      es: "Logotipo del Equipo",
    },
    teamPhoto: {
      pt: "Foto de Equipa",
      br: "Foto do Time",
      es: "Foto del Equipo",
    },
    foundedYear: {
      pt: "Ano de Fundação",
      br: "Ano de Fundação",
      es: "Año de Fundación",
    },
    playerCount: {
      pt: "N.º de Jogadores",
      br: "N.º de Jogadores",
      es: "N.º de Jugadores",
    },
    ageGroup: {
      pt: "Escalão Etário",
      br: "Faixa Etária",
      es: "Categoría de Edad",
    },
    mixed: {
      pt: "Misto",
      br: "Misto",
      es: "Mixto",
    },
    teamType: {
      pt: "Tipo de Equipa",
      br: "Tipo de Time",
      es: "Tipo de Equipo",
    },
    dinner: {
      pt: "Disponível para Jantar (3ª Parte)",
      br: "Disponível para Jantar (3ª Parte)",
      es: "Disponible para Cena (3ª Parte)",
    },
    primaryKit: {
      pt: "Equipamento Principal",
      br: "Uniforme Principal",
      es: "Equipación Principal",
    },
    secondaryKit: {
      pt: "Equipamento Alternativo",
      br: "Uniforme Alternativo",
      es: "Equipación Alternativa",
    },
    shirt: {
      pt: "Camisola",
      br: "Camisa",
      es: "Camiseta",
    },
    shorts: {
      pt: "Calções",
      br: "Calções",
      es: "Pantalón",
    },
    socks: {
      pt: "Meias",
      br: "Meias",
      es: "Medias",
    },
    coordinator: {
      pt: "Responsável",
      br: "Responsável",
      es: "Responsable",
    },
    coordinatorEmail: {
      pt: "Email do Responsável",
      br: "E-mail do Responsável",
      es: "Correo del Responsable",
    },
    coordinatorName: {
      pt: "Nome do Responsável",
      br: "Nome do Responsável",
      es: "Nombre del Responsable",
    },
    coordinatorPhone: {
      pt: "Contacto do Responsável",
      br: "Contacto do Responsável",
      es: "Contacto del Responsable",
    },
    altCoordinatorName: {
      pt: "Nome Responsável Alternativo",
      br: "Nome Responsável Alternativo",
      es: "Nombre Responsable Alternativo",
    },
    altPhone: {
      pt: "Contacto Alternativo",
      br: "Contacto Alternativo",
      es: "Contacto Alternativo",
    },
    field: {
      pt: "Campo",
      br: "Campo",
      es: "Campo",
    },
    fieldName: {
      pt: "Nome do Campo",
      br: "Nome do Campo",
      es: "Nombre del Campo",
    },
    fieldType: {
      pt: "Tipo de Campo",
      br: "Tipo de Campo",
      es: "Tipo de Campo",
    },
    synthetic: {
      pt: "Sintético",
      br: "Sintético",
      es: "Sintético",
    },
    naturalGrass: {
      pt: "Relva Natural",
      br: "Grama Natural",
      es: "Hierba Natural",
    },
    dirt: {
      pt: "Pelado",
      br: "Terra Batida",
      es: "Tierra",
    },
    futsalCourt: {
      pt: "Futsal (pavilhão)",
      br: "Futsal (ginásio)",
      es: "Futsal (pabellón)",
    },
    other: {
      pt: "Outro",
      br: "Outro",
      es: "Otro",
    },
    fieldAddress: {
      pt: "Morada do Campo",
      br: "Endereço do Campo",
      es: "Dirección del Campo",
    },
    parish: {
      pt: "Localidade / Freguesia",
      br: "Localidade / Bairro",
      es: "Localidad / Parroquia",
    },
    municipality: {
      pt: "Concelho",
      br: "Município",
      es: "Municipio",
    },
    district: {
      pt: "Distrito",
      br: "Estado / Região",
      es: "Provincia / Región",
    },
    selectDistrict: {
      pt: "Selecionar distrito",
      br: "Selecionar estado / região",
      es: "Seleccionar provincia / región",
    },
    international: {
      pt: "Internacional",
      br: "Internacional",
      es: "Internacional",
    },
    mapsLink: {
      pt: "Link Google Maps",
      br: "Link Google Maps",
      es: "Enlace Google Maps",
    },
    mapsHint: {
      pt: "Cole o link completo do Google Maps (aceita também links curtos e coordenadas)",
      br: "Cole o link completo do Google Maps (aceita também links curtos e coordenadas)",
      es: "Pega el enlace completo de Google Maps (también acepta enlaces cortos y coordenadas)",
    },
    additionalInfo: {
      pt: "Informação Adicional",
      br: "Informação Adicional",
      es: "Información Adicional",
    },
    trainingSchedule: {
      pt: "Horário de Treino / Jogo",
      br: "Horário de Treino / Jogo",
      es: "Horario de Entrenamiento / Partido",
    },
    notes: {
      pt: "Observações",
      br: "Observações",
      es: "Observaciones",
    },
    requiredFields: {
      pt: "* Campos obrigatórios",
      br: "* Campos obrigatórios",
      es: "* Campos obligatorios",
    },
    rgpdRequired: {
      pt: "É necessário aceitar a Política de Privacidade.",
      br: "É necessário aceitar a Política de Privacidade.",
      es: "Es necesario aceptar la Política de Privacidad.",
    },
  },

  email: {
    subject: {
      pt: "Aceda à sua equipa — Veteranos Futebol",
      br: "Acesse o seu time — Veteranos Futebol",
      es: "Accede a tu equipo — Veteranos Fútbol",
    },
    body: {
      pt: "Clique no link abaixo para aceder à sua equipa:",
      br: "Clique no link abaixo para acessar o seu time:",
      es: "Haz clic en el enlace a continuación para acceder a tu equipo:",
    },
    buttonText: {
      pt: "Aceder à Minha Equipa",
      br: "Acessar o Meu Time",
      es: "Acceder a Mi Equipo",
    },
    expiry: {
      pt: "Este link expira em 24 horas.",
      br: "Este link expira em 24 horas.",
      es: "Este enlace expira en 24 horas.",
    },
    ignore: {
      pt: "Se não solicitou este acesso, ignore este email.",
      br: "Se não solicitou este acesso, ignore este e-mail.",
      es: "Si no solicitaste este acceso, ignora este correo.",
    },
  },
} as const;

// ---------------------------------------------------------------------------
// Type helpers
// ---------------------------------------------------------------------------

type TranslationsShape = typeof translations;

type Section = keyof TranslationsShape;

type StringKey<S extends Section> = {
  [K in keyof TranslationsShape[S]]: TranslationsShape[S][K] extends Record<
    Locale,
    string
  >
    ? K
    : never;
}[keyof TranslationsShape[S]];

type FnKey<S extends Section> = {
  [K in keyof TranslationsShape[S]]: TranslationsShape[S][K] extends Record<
    Locale,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (...args: any[]) => string
  >
    ? K
    : never;
}[keyof TranslationsShape[S]];

type FnType<
  S extends Section,
  K extends FnKey<S>,
> = TranslationsShape[S][K] extends Record<Locale, infer F>
  ? F extends (...args: infer A) => string
    ? (...args: A) => string
    : never
  : never;

// ---------------------------------------------------------------------------
// Public helpers
// ---------------------------------------------------------------------------

/**
 * Returns a static translated string.
 *
 * @example
 *   t("common", "teams", locale)  // "Equipas" | "Times" | "Equipos"
 */
export function t<S extends Section, K extends StringKey<S>>(
  section: S,
  key: K,
  locale: Locale
): string {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (translations[section] as any)[key][locale] as string;
}

/**
 * Returns a dynamic translation function (for strings with interpolation).
 *
 * @example
 *   tFn("home", "teamsOnMap", locale)(3, 10)  // "3 de 10 equipas visíveis no mapa"
 */
export function tFn<S extends Section, K extends FnKey<S>>(
  section: S,
  key: K,
  locale: Locale
): FnType<S, K> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (translations[section] as any)[key][locale] as FnType<S, K>;
}

// ---------------------------------------------------------------------------
// Country → Locale mapping
// ---------------------------------------------------------------------------

const COUNTRY_LOCALE_MAP: Record<string, Locale> = {
  // Portugal
  PT: "pt",
  // Brazil
  BR: "br",
  // Spanish-speaking countries (Castilian)
  ES: "es",
  MX: "es",
  AR: "es",
  CO: "es",
  CL: "es",
  PE: "es",
  VE: "es",
  EC: "es",
  BO: "es",
  PY: "es",
  UY: "es",
  CR: "es",
  PA: "es",
  DO: "es",
  GT: "es",
  HN: "es",
  SV: "es",
  NI: "es",
  CU: "es",
  PR: "es",
  GQ: "es",
};

/**
 * Maps an ISO 3166-1 alpha-2 country code to the closest supported locale.
 * Defaults to "pt" when the country is unknown.
 */
export function countryToLocale(country: string): Locale {
  return COUNTRY_LOCALE_MAP[country.toUpperCase()] ?? "pt";
}
