export type Locale = "pt" | "br" | "es" | "en";

export const SUPPORTED_LOCALES: Locale[] = ["pt", "br", "es", "en"];

// ---------------------------------------------------------------------------
// Translations dictionary
// ---------------------------------------------------------------------------

const translations = {
  common: {
    teams: {
      pt: "Equipas",
      br: "Times",
      es: "Equipos",
      en: "Teams",
    },
    suggestions: {
      pt: "Sugestões",
      br: "Sugestões",
      es: "Sugerencias",
      en: "Suggestions",
    },
    register: {
      pt: "Registar",
      br: "Registrar",
      es: "Registrar",
      en: "Register",
    },
    access: {
      pt: "Aceder",
      br: "Acessar",
      es: "Acceder",
      en: "Access",
    },
    submit: {
      pt: "Submeter",
      br: "Enviar",
      es: "Enviar",
      en: "Submit",
    },
    email: {
      pt: "Email",
      br: "E-mail",
      es: "Correo electrónico",
      en: "Email",
    },
    privacyPolicy: {
      pt: "Política de Privacidade",
      br: "Política de Privacidade",
      es: "Política de Privacidad",
      en: "Privacy Policy",
    },
    admin: {
      pt: "Administração",
      br: "Administração",
      es: "Administración",
      en: "Administration",
    },
    developedBy: {
      pt: "Desenvolvido por",
      br: "Desenvolvido por",
      es: "Desarrollado por",
      en: "Developed by",
    },
    back: {
      pt: "Voltar",
      br: "Voltar",
      es: "Volver",
      en: "Back",
    },
    save: {
      pt: "Guardar Alterações",
      br: "Salvar Alterações",
      es: "Guardar Cambios",
      en: "Save Changes",
    },
    delete: {
      pt: "Apagar",
      br: "Apagar",
      es: "Eliminar",
      en: "Delete",
    },
    edit: {
      pt: "Editar",
      br: "Editar",
      es: "Editar",
      en: "Edit",
    },
    signIn: {
      pt: "Iniciar Sessão",
      br: "Entrar",
      es: "Iniciar Sesión",
      en: "Sign In",
    },
  },

  header: {
    registerTeam: {
      pt: "Registar Equipa",
      br: "Registrar Time",
      es: "Registrar Equipo",
      en: "Register Team",
    },
    access: {
      pt: "Aceder",
      br: "Acessar",
      es: "Acceder",
      en: "Access",
    },
  },

  home: {
    title: {
      pt: "Veteranos Futebol",
      br: "Veteranos Futebol",
      es: "Veteranos Fútbol",
      en: "Veteranos Football",
    },
    subtitle: {
      pt: "Contactos de equipas de veteranos de futebol",
      br: "Contactos de times de veteranos de futebol",
      es: "Contactos de equipos de veteranos de fútbol",
      en: "Contact directory for veteran football teams",
    },
    teamsRegistered: {
      pt: "equipas registadas",
      br: "times registrados",
      es: "equipos registrados",
      en: "registered teams",
    },
    howItWorks: {
      pt: "Como funciona?",
      br: "Como funciona?",
      es: "¿Cómo funciona?",
      en: "How does it work?",
    },
    forNewUsers: {
      pt: "para quem ainda não se registou",
      br: "para quem ainda não se registrou",
      es: "para quienes aún no se han registrado",
      en: "for those who haven't registered yet",
    },
    step1Title: {
      pt: "1. Registe a sua equipa",
      br: "1. Registre o seu time",
      es: "1. Registra tu equipo",
      en: "1. Register your team",
    },
    step1Desc: {
      pt: "Preencha o formulário com os dados da equipa: nome, localização, equipamentos, campo e contactos do coordenador.",
      br: "Preencha o formulário com os dados do time: nome, localização, uniformes, campo e contactos do coordenador.",
      es: "Rellena el formulario con los datos del equipo: nombre, ubicación, equipaciones, campo y contacto del coordinador.",
      en: "Fill in the form with your team's details: name, location, kits, ground and coordinator contacts.",
    },
    step2Title: {
      pt: "2. Encontre adversários",
      br: "2. Encontre adversários",
      es: "2. Encuentra rivales",
      en: "2. Find opponents",
    },
    step2Desc: {
      pt: "Pesquise equipas por nome, concelho ou distrito. Consulte o mapa para encontrar clubes perto de si e combine jogos.",
      br: "Pesquise times por nome, município ou estado. Consulte o mapa para encontrar clubes perto de você e combine jogos.",
      es: "Busca equipos por nombre, municipio o provincia. Consulta el mapa para encontrar clubes cerca de ti y organiza partidos.",
      en: "Search teams by name, municipality or district. Check the map to find clubs near you and arrange matches.",
    },
    step3Title: {
      pt: "3. Organize os seus jogos",
      br: "3. Organize os seus jogos",
      es: "3. Organiza tus partidos",
      en: "3. Organise your matches",
    },
    step3Desc: {
      pt: "Cada equipa tem o seu calendário de jogos. Adicione partidas, registe resultados e partilhe o calendário com a equipa.",
      br: "Cada time tem o seu calendário de jogos. Adicione partidas, registre resultados e compartilhe o calendário com o time.",
      es: "Cada equipo tiene su propio calendario de partidos. Añade encuentros, registra resultados y comparte el calendario con el equipo.",
      en: "Each team has its own match calendar. Add fixtures, record results and share the calendar with your team.",
    },
    aboutPlatform: {
      pt: "Veteranos Futebol é uma plataforma gratuita de contactos para equipas de veteranos em Portugal. O objetivo é simples: facilitar a comunicação entre clubes e ajudar a marcar jogos amigáveis ou torneios.",
      br: "Veteranos Futebol é uma plataforma gratuita de contactos para times de veteranos. O objetivo é simples: facilitar a comunicação entre clubes e ajudar a marcar jogos amistosos ou torneios.",
      es: "Veteranos Fútbol es una plataforma gratuita de contactos para equipos de veteranos. El objetivo es sencillo: facilitar la comunicación entre clubes y ayudar a organizar partidos amistosos o torneos.",
      en: "Veteranos Football is a free contact platform for veteran football teams in Portugal. The goal is simple: make it easier for clubs to communicate and help organise friendly matches or tournaments.",
    },
    afterRegister: {
      pt: "Após o registo, receberá um link de acesso por email para gerir a ficha da sua equipa: atualizar dados, adicionar jogos ao calendário, registar resultados e exportar o calendário para o Google Calendar ou telemóvel.",
      br: "Após o registro, receberá um link de acesso por e-mail para gerir a ficha do seu time: atualizar dados, adicionar jogos ao calendário, registrar resultados e exportar o calendário para o Google Calendar ou celular.",
      es: "Tras el registro, recibirás un enlace de acceso por correo electrónico para gestionar la ficha de tu equipo: actualizar datos, añadir partidos al calendario, registrar resultados y exportar el calendario a Google Calendar o al móvil.",
      en: "After registering, you'll receive an access link by email to manage your team's profile: update details, add matches to the calendar, record results and export the calendar to Google Calendar or your phone.",
    },
    questionsHint: {
      pt: "Tem uma ideia ou dúvida? Use a página de Sugestões para contactar a equipa de moderação.",
      br: "Tem uma ideia ou dúvida? Use a página de Sugestões para contactar a equipa de moderação.",
      es: "¿Tienes una idea o una duda? Usa la página de Sugerencias para contactar al equipo de moderación.",
      en: "Have an idea or question? Use the Suggestions page to contact the moderation team.",
    },
    viewAllTeams: {
      pt: "Ver Todas as Equipas",
      br: "Ver Todos os Times",
      es: "Ver Todos los Equipos",
      en: "View All Teams",
    },
    registerMyTeam: {
      pt: "Registar a Minha Equipa",
      br: "Registrar o Meu Time",
      es: "Registrar Mi Equipo",
      en: "Register My Team",
    },
    teamsOnMap: {
      pt: (onMap: number, total: number) =>
        `${onMap} de ${total} equipas visíveis no mapa`,
      br: (onMap: number, total: number) =>
        `${onMap} de ${total} times visíveis no mapa`,
      es: (onMap: number, total: number) =>
        `${onMap} de ${total} equipos visibles en el mapa`,
      en: (onMap: number, total: number) =>
        `${onMap} of ${total} teams visible on the map`,
    },
  },

  login: {
    title: {
      pt: "Aceder à Minha Equipa",
      br: "Acessar o Meu Time",
      es: "Acceder a Mi Equipo",
      en: "Access My Team",
    },
    expiredError: {
      pt: "O link expirou. Peça um novo abaixo.",
      br: "O link expirou. Solicite um novo abaixo.",
      es: "El enlace ha expirado. Solicita uno nuevo a continuación.",
      en: "The link has expired. Request a new one below.",
    },
    invalidError: {
      pt: "Link inválido. Peça um novo abaixo.",
      br: "Link inválido. Solicite um novo abaixo.",
      es: "Enlace inválido. Solicita uno nuevo a continuación.",
      en: "Invalid link. Request a new one below.",
    },
    existingTeamTitle: {
      pt: "Já tenho equipa registada",
      br: "Já tenho time registrado",
      es: "Ya tengo equipo registrado",
      en: "I already have a registered team",
    },
    existingTeamDesc: {
      pt: "Use o email com que registou a sua equipa (ou o email que constava na lista original). Se não receber o email em poucos minutos, a sua equipa pode não estar registada, use a opção abaixo.",
      br: "Use o e-mail com que registrou o seu time (ou o e-mail que constava na lista original). Se não receber o e-mail em poucos minutos, o seu time pode não estar registrado, use a opção abaixo.",
      es: "Usa el correo con el que registraste tu equipo (o el correo que constaba en la lista original). Si no recibes el correo en pocos minutos, es posible que tu equipo no esté registrado, usa la opción de abajo.",
      en: "Use the email you registered your team with (or the email from the original list). If you don't receive an email within a few minutes, your team may not be registered, use the option below.",
    },
    sendAccessLink: {
      pt: "Enviar Link de Acesso",
      br: "Enviar Link de Acesso",
      es: "Enviar Enlace de Acceso",
      en: "Send Access Link",
    },
    sending: {
      pt: "A enviar...",
      br: "Enviando...",
      es: "Enviando...",
      en: "Sending...",
    },
    emailSent: {
      pt: "Email Enviado!",
      br: "E-mail Enviado!",
      es: "¡Correo Enviado!",
      en: "Email Sent!",
    },
    emailSentDesc: {
      pt: "Se o email estiver registado, receberá um link de acesso. Verifique a sua caixa de entrada (e spam).",
      br: "Se o e-mail estiver registrado, receberá um link de acesso. Verifique a sua caixa de entrada (e spam).",
      es: "Si el correo está registrado, recibirás un enlace de acceso. Comprueba tu bandeja de entrada (y el spam).",
      en: "If the email is registered, you'll receive an access link. Check your inbox (and spam folder).",
    },
    changeEmailLink: {
      pt: "Alterar email de acesso",
      br: "Alterar e-mail de acesso",
      es: "Cambiar correo de acceso",
      en: "Change access email",
    },
    changeEmailCurrentLabel: {
      pt: "Email actual",
      br: "E-mail atual",
      es: "Correo actual",
      en: "Current email",
    },
    changeEmailNewLabel: {
      pt: "Novo email",
      br: "Novo e-mail",
      es: "Nuevo correo",
      en: "New email",
    },
    changeEmailSubmit: {
      pt: "Alterar Email",
      br: "Alterar E-mail",
      es: "Cambiar Correo",
      en: "Change Email",
    },
    changeEmailSent: {
      pt: "Email de confirmação enviado para o novo endereço.",
      br: "E-mail de confirmação enviado para o novo endereço.",
      es: "Correo de confirmación enviado a la nueva dirección.",
      en: "Confirmation email sent to the new address.",
    },
    newTeamTitle: {
      pt: "Registar nova equipa",
      br: "Registrar novo time",
      es: "Registrar nuevo equipo",
      en: "Register a new team",
    },
    newTeamDesc: {
      pt: "Se a sua equipa ainda não está na plataforma, registe-a aqui. Não use esta opção se a sua equipa já foi importada da lista original.",
      br: "Se o seu time ainda não está na plataforma, registre-o aqui. Não use esta opção se o seu time já foi importado da lista original.",
      es: "Si tu equipo aún no está en la plataforma, regístralo aquí. No uses esta opción si tu equipo ya fue importado de la lista original.",
      en: "If your team isn't on the platform yet, register it here. Don't use this option if your team was already imported from the original list.",
    },
    registerNewTeam: {
      pt: "Registar Nova Equipa",
      br: "Registrar Novo Time",
      es: "Registrar Nuevo Equipo",
      en: "Register New Team",
    },
  },

  register: {
    title: {
      pt: "Registar Equipa",
      br: "Registrar Time",
      es: "Registrar Equipo",
      en: "Register Team",
    },
    subtitle: {
      pt: "Preencha os dados da sua equipa de veteranos. Após o registo, receberá um email com um link para aceder e editar os seus dados a qualquer momento.",
      br: "Preencha os dados do seu time de veteranos. Após o registro, receberá um e-mail com um link para acessar e editar os seus dados a qualquer momento.",
      es: "Rellena los datos de tu equipo de veteranos. Tras el registro, recibirás un correo con un enlace para acceder y editar tus datos en cualquier momento.",
      en: "Fill in your veteran team's details. After registering, you'll receive an email with a link to access and edit your data at any time.",
    },
    submitButton: {
      pt: "Registar Equipa",
      br: "Registrar Time",
      es: "Registrar Equipo",
      en: "Register Team",
    },
    alreadyRegistered: {
      pt: "Já tenho equipa registada",
      br: "Já tenho time registrado",
      es: "Ya tengo equipo registrado",
      en: "I already have a registered team",
    },
    goToLogin: {
      pt: "Aceder à minha equipa",
      br: "Acessar o meu time",
      es: "Acceder a mi equipo",
      en: "Access my team",
    },
  },

  registerSuccess: {
    title: {
      pt: "Equipa Registada!",
      br: "Time Registrado!",
      es: "¡Equipo Registrado!",
      en: "Team Registered!",
    },
    desc: {
      pt: "Enviámos um email com um link de acesso. Clique no link para confirmar o seu email e aceder ao painel da sua equipa.",
      br: "Enviamos um e-mail com um link de acesso. Clique no link para confirmar o seu e-mail e acessar o painel do seu time.",
      es: "Te hemos enviado un correo con un enlace de acceso. Haz clic en el enlace para confirmar tu correo y acceder al panel de tu equipo.",
      en: "We've sent you an email with an access link. Click the link to confirm your email and access your team's dashboard.",
    },
    viewAll: {
      pt: "Ver Todas as Equipas",
      br: "Ver Todos os Times",
      es: "Ver Todos los Equipos",
      en: "View All Teams",
    },
  },

  auth: {
    authenticating: {
      pt: "A autenticar... por favor aguarde.",
      br: "Autenticando... por favor aguarde.",
      es: "Autenticando... por favor espera.",
      en: "Authenticating... please wait.",
    },
  },

  form: {
    teamData: {
      pt: "Dados da Equipa",
      br: "Dados do Time",
      es: "Datos del Equipo",
      en: "Team Details",
    },
    teamName: {
      pt: "Nome da Equipa",
      br: "Nome do Time",
      es: "Nombre del Equipo",
      en: "Team Name",
    },
    teamLogo: {
      pt: "Logotipo da Equipa",
      br: "Logotipo do Time",
      es: "Logotipo del Equipo",
      en: "Team Logo",
    },
    teamPhoto: {
      pt: "Foto de Equipa",
      br: "Foto do Time",
      es: "Foto del Equipo",
      en: "Team Photo",
    },
    foundedYear: {
      pt: "Ano de Fundação",
      br: "Ano de Fundação",
      es: "Año de Fundación",
      en: "Year Founded",
    },
    playerCount: {
      pt: "N.º de Jogadores",
      br: "N.º de Jogadores",
      es: "N.º de Jugadores",
      en: "No. of Players",
    },
    ageGroup: {
      pt: "Escalão Etário",
      br: "Faixa Etária",
      es: "Categoría de Edad",
      en: "Age Group",
    },
    mixed: {
      pt: "Misto",
      br: "Misto",
      es: "Mixto",
      en: "Mixed",
    },
    teamType: {
      pt: "Tipo de Equipa",
      br: "Tipo de Time",
      es: "Tipo de Equipo",
      en: "Team Type",
    },
    dinner: {
      pt: "Disponível para Jantar (3ª Parte)",
      br: "Disponível para Jantar (3ª Parte)",
      es: "Disponible para Cena (3ª Parte)",
      en: "Available for Post-Match Dinner",
    },
    primaryKit: {
      pt: "Equipamento Principal",
      br: "Uniforme Principal",
      es: "Equipación Principal",
      en: "Home Kit",
    },
    secondaryKit: {
      pt: "Equipamento Alternativo",
      br: "Uniforme Alternativo",
      es: "Equipación Alternativa",
      en: "Away Kit",
    },
    shirt: {
      pt: "Camisola",
      br: "Camisa",
      es: "Camiseta",
      en: "Shirt",
    },
    shorts: {
      pt: "Calções",
      br: "Calções",
      es: "Pantalón",
      en: "Shorts",
    },
    socks: {
      pt: "Meias",
      br: "Meias",
      es: "Medias",
      en: "Socks",
    },
    coordinator: {
      pt: "Responsável",
      br: "Responsável",
      es: "Responsable",
      en: "Coordinator",
    },
    coordinatorEmail: {
      pt: "Email do Responsável",
      br: "E-mail do Responsável",
      es: "Correo del Responsable",
      en: "Coordinator Email",
    },
    coordinatorName: {
      pt: "Nome do Responsável",
      br: "Nome do Responsável",
      es: "Nombre del Responsable",
      en: "Coordinator Name",
    },
    coordinatorPhone: {
      pt: "Contacto do Responsável",
      br: "Contacto do Responsável",
      es: "Contacto del Responsable",
      en: "Coordinator Phone",
    },
    altCoordinatorName: {
      pt: "Nome Responsável Alternativo",
      br: "Nome Responsável Alternativo",
      es: "Nombre Responsable Alternativo",
      en: "Alternate Coordinator Name",
    },
    altPhone: {
      pt: "Contacto Alternativo",
      br: "Contacto Alternativo",
      es: "Contacto Alternativo",
      en: "Alternate Phone",
    },
    field: {
      pt: "Campo",
      br: "Campo",
      es: "Campo",
      en: "Ground",
    },
    fieldName: {
      pt: "Nome do Campo",
      br: "Nome do Campo",
      es: "Nombre del Campo",
      en: "Ground Name",
    },
    fieldType: {
      pt: "Tipo de Campo",
      br: "Tipo de Campo",
      es: "Tipo de Campo",
      en: "Surface Type",
    },
    synthetic: {
      pt: "Sintético",
      br: "Sintético",
      es: "Sintético",
      en: "Artificial Turf",
    },
    naturalGrass: {
      pt: "Relva Natural",
      br: "Grama Natural",
      es: "Hierba Natural",
      en: "Natural Grass",
    },
    dirt: {
      pt: "Pelado",
      br: "Terra Batida",
      es: "Tierra",
      en: "Dirt Pitch",
    },
    futsalCourt: {
      pt: "Futsal (pavilhão)",
      br: "Futsal (ginásio)",
      es: "Futsal (pabellón)",
      en: "Futsal (indoor)",
    },
    other: {
      pt: "Outro",
      br: "Outro",
      es: "Otro",
      en: "Other",
    },
    fieldAddress: {
      pt: "Morada do Campo",
      br: "Endereço do Campo",
      es: "Dirección del Campo",
      en: "Ground Address",
    },
    parish: {
      pt: "Localidade / Freguesia",
      br: "Localidade / Bairro",
      es: "Localidad / Parroquia",
      en: "Locality / Parish",
    },
    municipality: {
      pt: "Concelho",
      br: "Município",
      es: "Municipio",
      en: "Municipality",
    },
    district: {
      pt: "Distrito",
      br: "Estado / Região",
      es: "Provincia / Región",
      en: "District",
    },
    selectDistrict: {
      pt: "Selecionar distrito",
      br: "Selecionar estado / região",
      es: "Seleccionar provincia / región",
      en: "Select district",
    },
    international: {
      pt: "Internacional",
      br: "Internacional",
      es: "Internacional",
      en: "International",
    },
    mapsLink: {
      pt: "Link Google Maps",
      br: "Link Google Maps",
      es: "Enlace Google Maps",
      en: "Google Maps Link",
    },
    mapsHint: {
      pt: "Cole o link completo do Google Maps (aceita também links curtos e coordenadas)",
      br: "Cole o link completo do Google Maps (aceita também links curtos e coordenadas)",
      es: "Pega el enlace completo de Google Maps (también acepta enlaces cortos y coordenadas)",
      en: "Paste the full Google Maps link (short links and coordinates also accepted)",
    },
    additionalInfo: {
      pt: "Informação Adicional",
      br: "Informação Adicional",
      es: "Información Adicional",
      en: "Additional Information",
    },
    trainingSchedule: {
      pt: "Horário de Treino / Jogo",
      br: "Horário de Treino / Jogo",
      es: "Horario de Entrenamiento / Partido",
      en: "Training / Match Schedule",
    },
    notes: {
      pt: "Observações",
      br: "Observações",
      es: "Observaciones",
      en: "Notes",
    },
    requiredFields: {
      pt: "* Campos obrigatórios",
      br: "* Campos obrigatórios",
      es: "* Campos obligatorios",
      en: "* Required fields",
    },
    rgpdRequired: {
      pt: "É necessário aceitar a Política de Privacidade.",
      br: "É necessário aceitar a Política de Privacidade.",
      es: "Es necesario aceptar la Política de Privacidad.",
      en: "You must accept the Privacy Policy.",
    },
    submitting: {
      pt: "A submeter...",
      br: "Enviando...",
      es: "Enviando...",
      en: "Submitting...",
    },
    select: {
      pt: "Selecionar",
      br: "Selecionar",
      es: "Seleccionar",
      en: "Select",
    },
    mapsHintShort: {
      pt: "Cole o link do Google Maps: aceita links completos, links curtos e coordenadas",
      br: "Cole o link do Google Maps: aceita links completos, links curtos e coordenadas",
      es: "Pega el enlace de Google Maps: acepta enlaces completos, cortos y coordenadas",
      en: "Paste the Google Maps link: full links, short links and coordinates accepted",
    },
  },

  email: {
    subject: {
      pt: "Aceda à sua equipa · Veteranos Futebol",
      br: "Acesse o seu time · Veteranos Futebol",
      es: "Accede a tu equipo · Veteranos Fútbol",
      en: "Access your team · Veteranos Football",
    },
    body: {
      pt: "Clique no link abaixo para aceder à sua equipa:",
      br: "Clique no link abaixo para acessar o seu time:",
      es: "Haz clic en el enlace a continuación para acceder a tu equipo:",
      en: "Click the link below to access your team:",
    },
    buttonText: {
      pt: "Aceder à Minha Equipa",
      br: "Acessar o Meu Time",
      es: "Acceder a Mi Equipo",
      en: "Access My Team",
    },
    expiry: {
      pt: "Este link expira em 30 minutos.",
      br: "Este link expira em 30 minutos.",
      es: "Este enlace expira en 30 minutos.",
      en: "This link expires in 30 minutes.",
    },
    ignore: {
      pt: "Se não solicitou este acesso, ignore este email.",
      br: "Se não solicitou este acesso, ignore este e-mail.",
      es: "Si no solicitaste este acceso, ignora este correo.",
      en: "If you didn't request this access, please ignore this email.",
    },
  },

  // ---------------------------------------------------------------------------
  // Dashboard pages
  // ---------------------------------------------------------------------------

  dashboard: {
    title: {
      pt: "Painel do Coordenador",
      br: "Painel do Coordenador",
      es: "Panel del Coordinador",
      en: "Coordinator Dashboard",
    },
    welcome: {
      pt: "Bem-vindo! Aqui pode gerir tudo sobre a sua equipa.",
      br: "Bem-vindo! Aqui pode gerir tudo sobre o seu time.",
      es: "¡Bienvenido! Aquí puedes gestionar todo sobre tu equipo.",
      en: "Welcome! Here you can manage everything about your team.",
    },
    whatCanYouDo: {
      pt: "O que pode fazer aqui?",
      br: "O que pode fazer aqui?",
      es: "¿Qué puedes hacer aquí?",
      en: "What can you do here?",
    },
    helpEditTeam: {
      pt: "Editar Equipa",
      br: "Editar Time",
      es: "Editar Equipo",
      en: "Edit Team",
    },
    helpEditTeamDesc: {
      pt: "Atualize o nome, localização, equipamentos, campo, contactos, logotipo e foto de equipa.",
      br: "Atualize o nome, localização, uniformes, campo, contactos, logotipo e foto do time.",
      es: "Actualiza el nombre, ubicación, equipaciones, campo, contactos, logotipo y foto del equipo.",
      en: "Update the name, location, kits, ground, contacts, logo and team photo.",
    },
    helpMatchCalendar: {
      pt: "Calendário de Jogos",
      br: "Calendário de Jogos",
      es: "Calendario de Partidos",
      en: "Match Calendar",
    },
    helpMatchCalendarDesc: {
      pt: "Adicione, edite ou apague jogos. Registe resultados e partilhe o calendário com a equipa exportando o ficheiro .ics para o Google Calendar ou telemóvel.",
      br: "Adicione, edite ou apague jogos. Registre resultados e compartilhe o calendário com o time exportando o ficheiro .ics para o Google Calendar ou celular.",
      es: "Añade, edita o elimina partidos. Registra resultados y comparte el calendario con el equipo exportando el fichero .ics a Google Calendar o al móvil.",
      en: "Add, edit or delete matches. Record results and share the calendar with your team by exporting the .ics file to Google Calendar or your phone.",
    },
    helpTransfer: {
      pt: "Transferir Coordenação",
      br: "Transferir Coordenação",
      es: "Transferir Coordinación",
      en: "Transfer Coordination",
    },
    helpTransferDesc: {
      pt: "Passe a gestão da equipa para outro coordenador, indicando o novo email.",
      br: "Passe a gestão do time para outro coordenador, indicando o novo e-mail.",
      es: "Pasa la gestión del equipo a otro coordinador, indicando el nuevo correo.",
      en: "Hand over team management to another coordinator by providing their email.",
    },
    helpSuggestions: {
      pt: "Sugestões",
      br: "Sugestões",
      es: "Sugerencias",
      en: "Suggestions",
    },
    helpSuggestionsDesc: {
      pt: "Tem uma ideia ou dúvida?",
      br: "Tem uma ideia ou dúvida?",
      es: "¿Tienes una idea o una duda?",
      en: "Have an idea or question?",
    },
    helpSuggestionsLink: {
      pt: "Envie uma sugestão",
      br: "Envie uma sugestão",
      es: "Envía una sugerencia",
      en: "Send a suggestion",
    },
    helpSuggestionsLinkSuffix: {
      pt: "à equipa de moderação.",
      br: "à equipa de moderação.",
      es: "al equipo de moderación.",
      en: "to the moderation team.",
    },
    helpDeleteTeam: {
      pt: "Eliminar Equipa",
      br: "Eliminar Time",
      es: "Eliminar Equipo",
      en: "Delete Team",
    },
    helpDeleteTeamDesc: {
      pt: "Remove a equipa da plataforma (pode ser revertido pela moderação).",
      br: "Remove o time da plataforma (pode ser revertido pela moderação).",
      es: "Elimina el equipo de la plataforma (puede ser revertido por la moderación).",
      en: "Removes the team from the platform (can be reversed by moderators).",
    },
    inactiveTeamWarning: {
      pt: "desativada",
      br: "desativado",
      es: "desactivado",
      en: "deactivated",
    },
    inactiveTeamWarningPlural: {
      pt: "desativadas",
      br: "desativados",
      es: "desactivados",
      en: "deactivated",
    },
    inactiveTeamDesc: {
      pt: "foi desativada, provavelmente por ter mais que um contacto registado. Contacte o administrador para resolver a situação.",
      br: "foi desativado, provavelmente por ter mais que um contacto registado. Contacte o administrador para resolver a situação.",
      es: "fue desactivado, probablemente por tener más de un contacto registrado. Contacta al administrador para resolver la situación.",
      en: "was deactivated, probably because more than one contact was registered. Contact the administrator to resolve this.",
    },
    noTeams: {
      pt: "Nenhuma equipa associada a este email.",
      br: "Nenhum time associado a este e-mail.",
      es: "Ningún equipo asociado a este correo.",
      en: "No teams associated with this email.",
    },
    registerTeam: {
      pt: "Registar Equipa",
      br: "Registrar Time",
      es: "Registrar Equipo",
      en: "Register Team",
    },
    myTeam: {
      pt: "A minha equipa",
      br: "O meu time",
      es: "Mi equipo",
      en: "My team",
    },
    myTeams: {
      pt: "As minhas equipas",
      br: "Os meus times",
      es: "Mis equipos",
      en: "My teams",
    },
    editTeam: {
      pt: "Editar Equipa",
      br: "Editar Time",
      es: "Editar Equipo",
      en: "Edit Team",
    },
    matchCalendar: {
      pt: "Calendário de Jogos",
      br: "Calendário de Jogos",
      es: "Calendario de Partidos",
      en: "Match Calendar",
    },
    viewPublicPage: {
      pt: "Ver Página Pública",
      br: "Ver Página Pública",
      es: "Ver Página Pública",
      en: "View Public Page",
    },
    matchesScheduled: {
      pt: (n: number) => `${n} jogo${n !== 1 ? "s" : ""} agendado${n !== 1 ? "s" : ""}`,
      br: (n: number) => `${n} jogo${n !== 1 ? "s" : ""} agendado${n !== 1 ? "s" : ""}`,
      es: (n: number) => `${n} partido${n !== 1 ? "s" : ""} programado${n !== 1 ? "s" : ""}`,
      en: (n: number) => `${n} match${n !== 1 ? "es" : ""} scheduled`,
    },
  },

  // ---------------------------------------------------------------------------
  // Matches section (dashboard jogos)
  // ---------------------------------------------------------------------------

  matches: {
    title: {
      pt: "Jogos",
      br: "Jogos",
      es: "Partidos",
      en: "Matches",
    },
    addMatch: {
      pt: "Adicionar Jogo",
      br: "Adicionar Jogo",
      es: "Añadir Partido",
      en: "Add Match",
    },
    editMatch: {
      pt: "Editar Jogo",
      br: "Editar Jogo",
      es: "Editar Partido",
      en: "Edit Match",
    },
    upcoming: {
      pt: "Próximos jogos",
      br: "Próximos jogos",
      es: "Próximos partidos",
      en: "Upcoming matches",
    },
    past: {
      pt: "Jogos anteriores",
      br: "Jogos anteriores",
      es: "Partidos anteriores",
      en: "Past matches",
    },
    noMatches: {
      pt: "Ainda não adicionou nenhum jogo.",
      br: "Ainda não adicionou nenhum jogo.",
      es: "Aún no has añadido ningún partido.",
      en: "You haven't added any matches yet.",
    },
    opponent: {
      pt: "Adversário",
      br: "Adversário",
      es: "Rival",
      en: "Opponent",
    },
    opponentPlaceholder: {
      pt: "Nome da equipa adversária",
      br: "Nome do time adversário",
      es: "Nombre del equipo rival",
      en: "Opponent team name",
    },
    homeMatch: {
      pt: "Jogo em casa",
      br: "Jogo em casa",
      es: "Partido en casa",
      en: "Home match",
    },
    date: {
      pt: "Data",
      br: "Data",
      es: "Fecha",
      en: "Date",
    },
    time: {
      pt: "Hora",
      br: "Hora",
      es: "Hora",
      en: "Time",
    },
    location: {
      pt: "Localização",
      br: "Localização",
      es: "Ubicación",
      en: "Location",
    },
    locationPlaceholder: {
      pt: "Ex: Seixal, Setúbal",
      br: "Ex: Seixal, Setúbal",
      es: "Ej: Seixal, Setúbal",
      en: "e.g. Seixal, Setúbal",
    },
    goalsFor: {
      pt: "Golos a favor",
      br: "Gols a favor",
      es: "Goles a favor",
      en: "Goals for",
    },
    goalsAgainst: {
      pt: "Golos contra",
      br: "Gols contra",
      es: "Goles en contra",
      en: "Goals against",
    },
    matchNotes: {
      pt: "Notas",
      br: "Notas",
      es: "Notas",
      en: "Notes",
    },
    matchNotesPlaceholder: {
      pt: "Torneio, amigável, observações...",
      br: "Torneio, amistoso, observações...",
      es: "Torneo, amistoso, observaciones...",
      en: "Tournament, friendly, notes...",
    },
    home: {
      pt: "Casa",
      br: "Casa",
      es: "Casa",
      en: "Home",
    },
    away: {
      pt: "Fora",
      br: "Fora",
      es: "Fuera",
      en: "Away",
    },
    homeShort: {
      pt: "C",
      br: "C",
      es: "C",
      en: "H",
    },
    awayShort: {
      pt: "F",
      br: "F",
      es: "F",
      en: "A",
    },
    exportIcs: {
      pt: "Exportar .ics",
      br: "Exportar .ics",
      es: "Exportar .ics",
      en: "Export .ics",
    },
    noMatchesCalendar: {
      pt: "Ainda não há jogos agendados.",
      br: "Ainda não há jogos agendados.",
      es: "Aún no hay partidos programados.",
      en: "No matches scheduled yet.",
    },
    showPastMatches: {
      pt: (n: number) => `Ver jogos anteriores (${n})`,
      br: (n: number) => `Ver jogos anteriores (${n})`,
      es: (n: number) => `Ver partidos anteriores (${n})`,
      en: (n: number) => `Show past matches (${n})`,
    },
    hidePastMatches: {
      pt: (n: number) => `Esconder jogos anteriores (${n})`,
      br: (n: number) => `Esconder jogos anteriores (${n})`,
      es: (n: number) => `Ocultar partidos anteriores (${n})`,
      en: (n: number) => `Hide past matches (${n})`,
    },
  },

  // ---------------------------------------------------------------------------
  // Transfer page
  // ---------------------------------------------------------------------------

  transfer: {
    title: {
      pt: "Transferir Equipa",
      br: "Transferir Time",
      es: "Transferir Equipo",
      en: "Transfer Team",
    },
    desc: {
      pt: "Transferir a gestão para outro responsável. Após a transferência, perderá o acesso de edição.",
      br: "Transferir a gestão para outro responsável. Após a transferência, perderá o acesso de edição.",
      es: "Transferir la gestión a otro responsable. Tras la transferencia, perderás el acceso de edición.",
      en: "Transfer management to another coordinator. After the transfer, you will lose editing access.",
    },
    newCoordinatorName: {
      pt: "Nome do Novo Responsável *",
      br: "Nome do Novo Responsável *",
      es: "Nombre del Nuevo Responsable *",
      en: "New Coordinator Name *",
    },
    newCoordinatorEmail: {
      pt: "Email do Novo Responsável *",
      br: "E-mail do Novo Responsável *",
      es: "Correo del Nuevo Responsable *",
      en: "New Coordinator Email *",
    },
    confirm: {
      pt: "Confirmar Transferência",
      br: "Confirmar Transferência",
      es: "Confirmar Transferencia",
      en: "Confirm Transfer",
    },
  },

  // ---------------------------------------------------------------------------
  // Delete/Deactivate page
  // ---------------------------------------------------------------------------

  deactivate: {
    title: {
      pt: "Eliminar Equipa",
      br: "Eliminar Time",
      es: "Eliminar Equipo",
      en: "Delete Team",
    },
    confirm: {
      pt: "Tem a certeza que deseja eliminar",
      br: "Tem a certeza que deseja eliminar",
      es: "¿Estás seguro de que quieres eliminar",
      en: "Are you sure you want to delete",
    },
    warning: {
      pt: "Todos os dados serão permanentemente apagados. Esta ação não pode ser revertida.",
      br: "Todos os dados serão permanentemente apagados. Esta ação não pode ser revertida.",
      es: "Todos los datos serán eliminados permanentemente. Esta acción no se puede revertir.",
      en: "All data will be permanently deleted. This action cannot be undone.",
    },
    rgpdNote: {
      pt: "(Direito ao apagamento, Artigo 17.º do RGPD)",
      br: "(Direito ao apagamento, Artigo 17.º do RGPD)",
      es: "(Derecho de supresión, Artículo 17 del RGPD)",
      en: "(Right to erasure, Article 17 of the GDPR)",
    },
    deleteButton: {
      pt: "Eliminar Permanentemente",
      br: "Eliminar Permanentemente",
      es: "Eliminar Permanentemente",
      en: "Delete Permanently",
    },
  },

  // ---------------------------------------------------------------------------
  // Consent page
  // ---------------------------------------------------------------------------

  consent: {
    title: {
      pt: "Consentimento de Dados",
      br: "Consentimento de Dados",
      es: "Consentimiento de Datos",
      en: "Data Consent",
    },
    migrationNotice: {
      pt: "Os dados da(s) sua(s) equipa(s) foram migrados do formulário anterior. Para continuar a utilizá-los na nova plataforma, precisamos do seu consentimento.",
      br: "Os dados do(s) seu(s) time(s) foram migrados do formulário anterior. Para continuar a utilizá-los na nova plataforma, precisamos do seu consentimento.",
      es: "Los datos de tu(s) equipo(s) fueron migrados del formulario anterior. Para seguir utilizándolos en la nueva plataforma, necesitamos tu consentimiento.",
      en: "Your team's data was migrated from the previous form. To continue using it on the new platform, we need your consent.",
    },
    consentText: {
      pt: "Ao aceitar, consinto que os meus dados pessoais (nome, email, telefone) sejam armazenados e partilhados com outras equipas de veteranos registadas na plataforma, com a finalidade exclusiva de facilitar o contacto para marcação de jogos. Posso a qualquer momento editar ou eliminar os meus dados. Consulte a nossa",
      br: "Ao aceitar, consinto que os meus dados pessoais (nome, e-mail, telefone) sejam armazenados e partilhados com outros times de veteranos registados na plataforma, com a finalidade exclusiva de facilitar o contacto para marcação de jogos. Posso a qualquer momento editar ou eliminar os meus dados. Consulte a nossa",
      es: "Al aceptar, consiento que mis datos personales (nombre, correo, teléfono) sean almacenados y compartidos con otros equipos de veteranos registrados en la plataforma, con la finalidad exclusiva de facilitar el contacto para organizar partidos. Puedo en cualquier momento editar o eliminar mis datos. Consulta nuestra",
      en: "By accepting, I consent to my personal data (name, email, phone) being stored and shared with other veteran teams registered on the platform, solely for the purpose of facilitating contact to arrange matches. I can edit or delete my data at any time. See our",
    },
    affectedTeams: {
      pt: "Equipa(s) afetada(s):",
      br: "Time(s) afetado(s):",
      es: "Equipo(s) afectado(s):",
      en: "Affected team(s):",
    },
    acceptButton: {
      pt: "Aceitar e Continuar",
      br: "Aceitar e Continuar",
      es: "Aceptar y Continuar",
      en: "Accept and Continue",
    },
  },

  // ---------------------------------------------------------------------------
  // RGPD consent checkbox (registration form)
  // ---------------------------------------------------------------------------

  rgpd: {
    consentText: {
      pt: "Ao submeter este formulário, consinto que os meus dados pessoais (nome, email, telefone) sejam armazenados e partilhados com outras equipas de veteranos registadas na plataforma, com a finalidade exclusiva de facilitar o contacto para marcação de jogos. Posso a qualquer momento editar ou eliminar os meus dados. Consulte a nossa",
      br: "Ao submeter este formulário, consinto que os meus dados pessoais (nome, e-mail, telefone) sejam armazenados e partilhados com outros times de veteranos registados na plataforma, com a finalidade exclusiva de facilitar o contacto para marcação de jogos. Posso a qualquer momento editar ou eliminar os meus dados. Consulte a nossa",
      es: "Al enviar este formulario, consiento que mis datos personales (nombre, correo, teléfono) sean almacenados y compartidos con otros equipos de veteranos registrados en la plataforma, con la finalidad exclusiva de facilitar el contacto para organizar partidos. Puedo en cualquier momento editar o eliminar mis datos. Consulta nuestra",
      en: "By submitting this form, I consent to my personal data (name, email, phone) being stored and shared with other veteran teams registered on the platform, solely for the purpose of facilitating contact to arrange matches. I can edit or delete my data at any time. See our",
    },
  },

  // ---------------------------------------------------------------------------
  // Teams directory page
  // ---------------------------------------------------------------------------

  teamsDirectory: {
    title: {
      pt: "Equipas de Veteranos",
      br: "Times de Veteranos",
      es: "Equipos de Veteranos",
      en: "Veteran Teams",
    },
    teamsFound: {
      pt: (n: number) => `${n} equipa${n !== 1 ? "s" : ""} encontrada${n !== 1 ? "s" : ""}`,
      br: (n: number) => `${n} time${n !== 1 ? "s" : ""} encontrado${n !== 1 ? "s" : ""}`,
      es: (n: number) => `${n} equipo${n !== 1 ? "s" : ""} encontrado${n !== 1 ? "s" : ""}`,
      en: (n: number) => `${n} team${n !== 1 ? "s" : ""} found`,
    },
    searchPlaceholder: {
      pt: "Pesquisar equipa ou concelho...",
      br: "Pesquisar time ou município...",
      es: "Buscar equipo o municipio...",
      en: "Search team or municipality...",
    },
    allDistricts: {
      pt: "Todos os distritos",
      br: "Todos os estados",
      es: "Todas las provincias",
      en: "All districts",
    },
    districtLabel: {
      pt: "Distrito",
      br: "Estado",
      es: "Provincia",
      en: "District",
    },
    dinnerBadge: {
      pt: "Jantar 3ª Parte",
      br: "Jantar 3ª Parte",
      es: "Cena 3ª Parte",
      en: "Post-Match Dinner",
    },
  },

  // ---------------------------------------------------------------------------
  // Team detail page
  // ---------------------------------------------------------------------------

  teamDetail: {
    kits: {
      pt: "Equipamentos",
      br: "Uniformes",
      es: "Equipaciones",
      en: "Kits",
    },
    primaryKit: {
      pt: "Principal",
      br: "Principal",
      es: "Principal",
      en: "Home",
    },
    secondaryKit: {
      pt: "Alternativo",
      br: "Alternativo",
      es: "Alternativo",
      en: "Away",
    },
    ground: {
      pt: "Campo",
      br: "Campo",
      es: "Campo",
      en: "Ground",
    },
    schedule: {
      pt: "Horário:",
      br: "Horário:",
      es: "Horario:",
      en: "Schedule:",
    },
    viewOnMaps: {
      pt: "Ver no Google Maps",
      br: "Ver no Google Maps",
      es: "Ver en Google Maps",
      en: "View on Google Maps",
    },
    contacts: {
      pt: "Contactos",
      br: "Contactos",
      es: "Contactos",
      en: "Contacts",
    },
    socialMedia: {
      pt: "Redes Sociais",
      br: "Redes Sociais",
      es: "Redes Sociales",
      en: "Social Media",
    },
    registerToSeeContacts: {
      pt: "Regista a tua equipa para ver os contactos",
      br: "Registre o seu time para ver os contactos",
      es: "Registra tu equipo para ver los contactos",
      en: "Register your team to see contact details",
    },
    alreadyHaveTeam: {
      pt: "Já tenho equipa",
      br: "Já tenho time",
      es: "Ya tengo equipo",
      en: "I already have a team",
    },
    altCoordinator: {
      pt: "Responsável Alternativo",
      br: "Responsável Alternativo",
      es: "Responsable Alternativo",
      en: "Alternate Coordinator",
    },
    founded: {
      pt: "Fundado",
      br: "Fundado",
      es: "Fundado",
      en: "Founded",
    },
    players: {
      pt: "jogadores",
      br: "jogadores",
      es: "jugadores",
      en: "players",
    },
    registeredOn: {
      pt: "Registado em",
      br: "Registrado em",
      es: "Registrado en",
      en: "Registered on",
    },
    updatedOn: {
      pt: "Atualizado em",
      br: "Atualizado em",
      es: "Actualizado en",
      en: "Updated on",
    },
    fieldTypes: {
      pt: { sintetico: "Sintético", relva: "Relva Natural", pelado: "Pelado", futsal: "Futsal (pavilhão)", outro: "Outro" },
      br: { sintetico: "Sintético", relva: "Grama Natural", pelado: "Terra Batida", futsal: "Futsal (ginásio)", outro: "Outro" },
      es: { sintetico: "Sintético", relva: "Hierba Natural", pelado: "Tierra", futsal: "Futsal (pabellón)", outro: "Otro" },
      en: { sintetico: "Artificial Turf", relva: "Natural Grass", pelado: "Dirt Pitch", futsal: "Futsal (indoor)", outro: "Other" },
    },
  },

  // ---------------------------------------------------------------------------
  // Suggestions page
  // ---------------------------------------------------------------------------

  suggestions: {
    title: {
      pt: "Ideias e Sugestões",
      br: "Ideias e Sugestões",
      es: "Ideas y Sugerencias",
      en: "Ideas and Suggestions",
    },
    subtitle: {
      pt: "Tem uma ideia para melhorar a plataforma ou precisa de ajuda? Envie a sua sugestão e a equipa de moderação responderá assim que possível.",
      br: "Tem uma ideia para melhorar a plataforma ou precisa de ajuda? Envie a sua sugestão e a equipa de moderação responderá assim que possível.",
      es: "¿Tienes una idea para mejorar la plataforma o necesitas ayuda? Envía tu sugerencia y el equipo de moderación responderá lo antes posible.",
      en: "Have an idea to improve the platform or need help? Send your suggestion and the moderation team will reply as soon as possible.",
    },
    mustBeAuthenticated: {
      pt: "Precisa de estar autenticado para enviar sugestões.",
      br: "Precisa de estar autenticado para enviar sugestões.",
      es: "Debes estar autenticado para enviar sugerencias.",
      en: "You need to be signed in to send suggestions.",
    },
    newSuggestion: {
      pt: "Nova Sugestão",
      br: "Nova Sugestão",
      es: "Nueva Sugerencia",
      en: "New Suggestion",
    },
    yourName: {
      pt: "O seu nome *",
      br: "O seu nome *",
      es: "Tu nombre *",
      en: "Your name *",
    },
    namePlaceholder: {
      pt: "Nome do coordenador",
      br: "Nome do coordenador",
      es: "Nombre del coordinador",
      en: "Coordinator name",
    },
    subject: {
      pt: "Assunto *",
      br: "Assunto *",
      es: "Asunto *",
      en: "Subject *",
    },
    subjectPlaceholder: {
      pt: "Ex: Ideia para nova funcionalidade, Dúvida sobre...",
      br: "Ex: Ideia para nova funcionalidade, Dúvida sobre...",
      es: "Ej: Idea para nueva funcionalidad, Duda sobre...",
      en: "e.g. Idea for a new feature, Question about...",
    },
    message: {
      pt: "Mensagem *",
      br: "Mensagem *",
      es: "Mensaje *",
      en: "Message *",
    },
    messagePlaceholder: {
      pt: "Descreva a sua ideia, sugestão ou dúvida...",
      br: "Descreva a sua ideia, sugestão ou dúvida...",
      es: "Describe tu idea, sugerencia o duda...",
      en: "Describe your idea, suggestion or question...",
    },
    sendButton: {
      pt: "Enviar Sugestão",
      br: "Enviar Sugestão",
      es: "Enviar Sugerencia",
      en: "Send Suggestion",
    },
    mySuggestions: {
      pt: "As minhas sugestões",
      br: "As minhas sugestões",
      es: "Mis sugerencias",
      en: "My suggestions",
    },
    adminReply: {
      pt: "Resposta da moderação:",
      br: "Resposta da moderação:",
      es: "Respuesta de la moderación:",
      en: "Moderator reply:",
    },
    statusPending: {
      pt: "Pendente",
      br: "Pendente",
      es: "Pendiente",
      en: "Pending",
    },
    statusRead: {
      pt: "Lida",
      br: "Lida",
      es: "Leída",
      en: "Read",
    },
    statusResolved: {
      pt: "Resolvida",
      br: "Resolvida",
      es: "Resuelta",
      en: "Resolved",
    },
  },

  // ---------------------------------------------------------------------------
  // Privacy policy page
  // ---------------------------------------------------------------------------

  privacy: {
    title: {
      pt: "Política de Privacidade",
      br: "Política de Privacidade",
      es: "Política de Privacidad",
      en: "Privacy Policy",
    },
    s1Title: {
      pt: "1. Responsável pelo Tratamento",
      br: "1. Responsável pelo Tratamento",
      es: "1. Responsable del Tratamiento",
      en: "1. Data Controller",
    },
    s1Text: {
      pt: "A plataforma Veteranos Futebol é gerida pelos coordenadores do grupo de veteranos. Para questões sobre proteção de dados, contacte os coordenadores através do grupo de WhatsApp dos Veteranos.",
      br: "A plataforma Veteranos Futebol é gerida pelos coordenadores do grupo de veteranos. Para questões sobre proteção de dados, contacte os coordenadores através do grupo de WhatsApp dos Veteranos.",
      es: "La plataforma Veteranos Fútbol está gestionada por los coordinadores del grupo de veteranos. Para cuestiones sobre protección de datos, contacta a los coordinadores a través del grupo de WhatsApp de los Veteranos.",
      en: "The Veteranos Football platform is managed by the veteran group coordinators. For data protection enquiries, contact the coordinators via the Veteranos WhatsApp group.",
    },
    s2Title: {
      pt: "2. Finalidade do Tratamento",
      br: "2. Finalidade do Tratamento",
      es: "2. Finalidad del Tratamiento",
      en: "2. Purpose of Processing",
    },
    s2Text: {
      pt: "Os dados pessoais recolhidos destinam-se exclusivamente a facilitar o contacto entre equipas de veteranos de futebol para marcação de jogos e eventos desportivos.",
      br: "Os dados pessoais recolhidos destinam-se exclusivamente a facilitar o contacto entre times de veteranos de futebol para marcação de jogos e eventos desportivos.",
      es: "Los datos personales recogidos están destinados exclusivamente a facilitar el contacto entre equipos de veteranos de fútbol para la organización de partidos y eventos deportivos.",
      en: "The personal data collected is used solely to facilitate contact between veteran football teams for arranging matches and sporting events.",
    },
    s3Title: {
      pt: "3. Dados Recolhidos",
      br: "3. Dados Recolhidos",
      es: "3. Datos Recogidos",
      en: "3. Data Collected",
    },
    s3Items: {
      pt: ["Nome do responsável/coordenador da equipa", "Endereço de email", "Número de telefone", "Nome e localização da equipa e campo", "Logotipo da equipa (opcional)"],
      br: ["Nome do responsável/coordenador do time", "Endereço de e-mail", "Número de telefone", "Nome e localização do time e campo", "Logotipo do time (opcional)"],
      es: ["Nombre del responsable/coordinador del equipo", "Dirección de correo electrónico", "Número de teléfono", "Nombre y ubicación del equipo y campo", "Logotipo del equipo (opcional)"],
      en: ["Team coordinator/manager name", "Email address", "Phone number", "Team and ground name and location", "Team logo (optional)"],
    },
    s4Title: {
      pt: "4. Base Legal",
      br: "4. Base Legal",
      es: "4. Base Legal",
      en: "4. Legal Basis",
    },
    s4Text: {
      pt: "O tratamento é baseado no consentimento explícito do titular dos dados (Artigo 6.º, n.º 1, alínea a) do RGPD), dado no momento do registo na plataforma.",
      br: "O tratamento é baseado no consentimento explícito do titular dos dados (Artigo 6.º, n.º 1, alínea a) do RGPD), dado no momento do registo na plataforma.",
      es: "El tratamiento se basa en el consentimiento explícito del titular de los datos (Artículo 6, apartado 1, letra a) del RGPD), dado en el momento del registro en la plataforma.",
      en: "Processing is based on the explicit consent of the data subject (Article 6(1)(a) of the GDPR), given at the time of registration on the platform.",
    },
    s5Title: {
      pt: "5. Acesso aos Dados",
      br: "5. Acesso aos Dados",
      es: "5. Acceso a los Datos",
      en: "5. Data Access",
    },
    s5Text: {
      pt: "Os dados de contacto (nome, telefone, email do coordenador) são acessíveis apenas a outras equipas registadas na plataforma. Informações gerais (nome da equipa, localização, cores do equipamento) são publicamente visíveis.",
      br: "Os dados de contacto (nome, telefone, e-mail do coordenador) são acessíveis apenas a outros times registados na plataforma. Informações gerais (nome do time, localização, cores do uniforme) são publicamente visíveis.",
      es: "Los datos de contacto (nombre, teléfono, correo del coordinador) son accesibles solo para otros equipos registrados en la plataforma. La información general (nombre del equipo, ubicación, colores de la equipación) es públicamente visible.",
      en: "Contact details (coordinator name, phone, email) are accessible only to other registered teams on the platform. General information (team name, location, kit colours) is publicly visible.",
    },
    s6Title: {
      pt: "6. Direitos do Titular",
      br: "6. Direitos do Titular",
      es: "6. Derechos del Titular",
      en: "6. Data Subject Rights",
    },
    s6Intro: {
      pt: "Nos termos do RGPD, tem direito a:",
      br: "Nos termos do RGPD, tem direito a:",
      es: "En virtud del RGPD, tienes derecho a:",
      en: "Under the GDPR, you have the right to:",
    },
    s6Access: {
      pt: "Acesso: Consultar todos os seus dados no painel da equipa",
      br: "Acesso: Consultar todos os seus dados no painel do time",
      es: "Acceso: Consultar todos tus datos en el panel del equipo",
      en: "Access: View all your data in the team dashboard",
    },
    s6Rectification: {
      pt: "Retificação: Editar os seus dados a qualquer momento",
      br: "Retificação: Editar os seus dados a qualquer momento",
      es: "Rectificación: Editar tus datos en cualquier momento",
      en: "Rectification: Edit your data at any time",
    },
    s6Erasure: {
      pt: "Apagamento: Eliminar a sua equipa e todos os dados associados",
      br: "Apagamento: Eliminar o seu time e todos os dados associados",
      es: "Supresión: Eliminar tu equipo y todos los datos asociados",
      en: "Erasure: Delete your team and all associated data",
    },
    s6Portability: {
      pt: "Portabilidade: Solicitar os seus dados em formato digital",
      br: "Portabilidade: Solicitar os seus dados em formato digital",
      es: "Portabilidad: Solicitar tus datos en formato digital",
      en: "Portability: Request your data in a digital format",
    },
    s6Withdraw: {
      pt: "Retirar consentimento: a qualquer momento, sem prejudicar a licitude do tratamento anterior",
      br: "Retirar consentimento: a qualquer momento, sem prejudicar a licitude do tratamento anterior",
      es: "Retirar el consentimiento: en cualquier momento, sin perjudicar la licitud del tratamiento anterior",
      en: "Withdraw consent: at any time, without affecting the lawfulness of prior processing",
    },
    s7Title: {
      pt: "7. Conservação dos Dados",
      br: "7. Conservação dos Dados",
      es: "7. Conservación de los Datos",
      en: "7. Data Retention",
    },
    s7Text: {
      pt: "Os dados são mantidos enquanto a equipa estiver ativa na plataforma. Após eliminação pelo coordenador ou moderador, os dados são permanentemente apagados.",
      br: "Os dados são mantidos enquanto o time estiver ativo na plataforma. Após eliminação pelo coordenador ou moderador, os dados são permanentemente apagados.",
      es: "Los datos se mantienen mientras el equipo esté activo en la plataforma. Tras la eliminación por parte del coordinador o moderador, los datos se eliminan permanentemente.",
      en: "Data is retained while the team is active on the platform. After deletion by the coordinator or moderator, data is permanently erased.",
    },
    s8Title: {
      pt: "8. Segurança",
      br: "8. Segurança",
      es: "8. Seguridad",
      en: "8. Security",
    },
    s8Text: {
      pt: "Os dados são armazenados em servidores seguros com encriptação em trânsito (HTTPS) e em repouso. O acesso é protegido por autenticação.",
      br: "Os dados são armazenados em servidores seguros com encriptação em trânsito (HTTPS) e em repouso. O acesso é protegido por autenticação.",
      es: "Los datos se almacenan en servidores seguros con cifrado en tránsito (HTTPS) y en reposo. El acceso está protegido por autenticación.",
      en: "Data is stored on secure servers with encryption in transit (HTTPS) and at rest. Access is protected by authentication.",
    },
    s9Title: {
      pt: "9. Cookies",
      br: "9. Cookies",
      es: "9. Cookies",
      en: "9. Cookies",
    },
    s9Text: {
      pt: "A plataforma utiliza apenas cookies técnicos essenciais para autenticação (sessão do coordenador). Não são utilizados cookies de rastreamento ou publicidade.",
      br: "A plataforma utiliza apenas cookies técnicos essenciais para autenticação (sessão do coordenador). Não são utilizados cookies de rastreamento ou publicidade.",
      es: "La plataforma utiliza únicamente cookies técnicas esenciales para la autenticación (sesión del coordinador). No se utilizan cookies de rastreo o publicidad.",
      en: "The platform only uses essential technical cookies for authentication (coordinator session). No tracking or advertising cookies are used.",
    },
    s10Title: {
      pt: "10. Contacto",
      br: "10. Contacto",
      es: "10. Contacto",
      en: "10. Contact",
    },
    s10Text: {
      pt: "Para exercer os seus direitos ou para qualquer questão sobre esta política, contacte os coordenadores da plataforma através do grupo de WhatsApp dos Veteranos.",
      br: "Para exercer os seus direitos ou para qualquer questão sobre esta política, contacte os coordenadores da plataforma através do grupo de WhatsApp dos Veteranos.",
      es: "Para ejercer tus derechos o para cualquier cuestión sobre esta política, contacta a los coordinadores de la plataforma a través del grupo de WhatsApp de los Veteranos.",
      en: "To exercise your rights or for any questions about this policy, contact the platform coordinators via the Veteranos WhatsApp group.",
    },
  },

  // ---------------------------------------------------------------------------
  // Image upload
  // ---------------------------------------------------------------------------

  imageUpload: {
    uploading: {
      pt: "A enviar...",
      br: "Enviando...",
      es: "Enviando...",
      en: "Uploading...",
    },
    change: {
      pt: "Alterar",
      br: "Alterar",
      es: "Cambiar",
      en: "Change",
    },
    choose: {
      pt: "Escolher imagem",
      br: "Escolher imagem",
      es: "Elegir imagen",
      en: "Choose image",
    },
    hint: {
      pt: "JPG, PNG, WebP, GIF ou SVG (máx. 5MB).",
      br: "JPG, PNG, WebP, GIF ou SVG (máx. 5MB).",
      es: "JPG, PNG, WebP, GIF o SVG (máx. 5MB).",
      en: "JPG, PNG, WebP, GIF or SVG (max. 5MB).",
    },
    error: {
      pt: "Erro ao enviar imagem",
      br: "Erro ao enviar imagem",
      es: "Error al subir la imagen",
      en: "Error uploading image",
    },
  },

  // ---------------------------------------------------------------------------
  // Month names (for calendar)
  // ---------------------------------------------------------------------------

  months: {
    list: {
      pt: ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"],
      br: ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"],
      es: ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"],
      en: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
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
// Array helper type
// ---------------------------------------------------------------------------

type ArrayKey<S extends Section> = {
  [K in keyof TranslationsShape[S]]: TranslationsShape[S][K] extends Record<
    Locale,
    readonly string[]
  >
    ? K
    : never;
}[keyof TranslationsShape[S]];

type ObjectKey<S extends Section> = {
  [K in keyof TranslationsShape[S]]: TranslationsShape[S][K] extends Record<
    Locale,
    Record<string, string>
  >
    ? K
    : never;
}[keyof TranslationsShape[S]];

// ---------------------------------------------------------------------------
// Public helpers
// ---------------------------------------------------------------------------

/**
 * Returns a static translated string.
 *
 * @example
 *   t("common", "teams", locale)  // "Equipas" | "Times" | "Equipos" | "Teams"
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

/**
 * Returns a translated array (e.g. month names, list items).
 */
export function tArray<S extends Section, K extends ArrayKey<S>>(
  section: S,
  key: K,
  locale: Locale
): readonly string[] {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (translations[section] as any)[key][locale] as readonly string[];
}

/**
 * Returns a translated object/record (e.g. field type labels).
 */
export function tObj<S extends Section, K extends ObjectKey<S>>(
  section: S,
  key: K,
  locale: Locale
): Record<string, string> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (translations[section] as any)[key][locale] as Record<string, string>;
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
  // English-speaking countries
  US: "en",
  GB: "en",
  AU: "en",
  CA: "en",
  IE: "en",
  NZ: "en",
  ZA: "en",
  IN: "en",
  PH: "en",
  SG: "en",
  HK: "en",
  MY: "en",
};

/**
 * Maps an ISO 3166-1 alpha-2 country code to the closest supported locale.
 * Defaults to "pt" when the country is unknown.
 */
export function countryToLocale(country: string): Locale {
  return COUNTRY_LOCALE_MAP[country.toUpperCase()] ?? "pt";
}
